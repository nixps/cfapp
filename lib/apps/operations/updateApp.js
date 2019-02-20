'use strict';
const _ = require('lodash');
const cloudflowAPI = require('cloudflow-api');
const fs = require('fs');
const semver = require('semver');

const defaultParameters = require('./defaultParameters');
const canRegisterApps = require('../canRegisterApps');
const getAppDefinition = require('./getAppDefinition');
const getWorkflowJSONsFromDisk = require('./getWorkflowJSONsFromDisk');
const addWorkflows = require('../workflows/addWorkflows');
const updateWorkflows = require('../workflows/updateWorkflows');
const removeWorkflows = require('../workflows/removeWorkflows');
const removeFiles = require('../files/removeFiles.js');
const uploadFiles = require('../files/uploadFiles.js')
const createEmptyDirectories = require('../createEmptyDirectories');
const isWorkflowUpdateable = require('../isWorkflowUpdateable.js');
const getMatchingWorkflows = require('../getMatchingWorkflows.js');

const CloudflowApplication = require('../CloudflowApplication');
const Errors = require('../Errors');

function updateApp(app, options, outputStream = new ConsoleOutputStream()) {
    // Merge all the settings
    let parameters = {};
    _.assign(parameters, defaultParameters, {
        host: app.host,
        login: app.login,
        password: app.password,
    }, options);

    outputStream.writeLine(`application: ${app.name}`);
    outputStream.writeLine(`Cloudflow: ${parameters.host}`);
    outputStream.writeLine(`user: ${parameters.login}`);

    // Get a Cloudflow API for the remote host and set the session
    const api = cloudflowAPI.getSyncAPI(parameters.host);
    const apiAsync = cloudflowAPI.getAsyncAPI(parameters.host);
    if (typeof parameters.session === 'string' && parameters.session.length > 0) {
        api.m_session = parameters.session;
        apiAsync.m_session = parameters.session;
    } else {
        const session = api.auth.create_session(parameters.login, parameters.password).session;
        api.m_session = session;
        apiAsync.m_session = session;
    }

    // Check if the remote cloudflow supports updating the app
    if (canRegisterApps(api) === false) {
        outputStream.writeLine(`skipping update of ${app.name}`);
        outputStream.writeLine(`no support for application updates this Cloudflow build b${api.portal.version().build}`);
        return Promise.reject(new Errors.UnsupportedApplicationUpdatesError(api.portal.version().build));
    }

    // Get the app definition of the app that is already installed
    const oldAppDefinition = getAppDefinition(api, app.name);
    const oldApp = new CloudflowApplication(oldAppDefinition);

    if (semver.valid(oldApp.version) === null && parameters.force === false) {
        throw new Errors.InvalidRemoteVersionError(app.name);
    }

    if (semver.valid(app.version) === null) {
        throw new Errors.InvalidLocalVersionError(app.name);
    }

    if (parameters.force === false && semver.lte(app.version, oldApp.version)) {
        throw new Errors.OlderOrSameVersionError(app.name, app.version, oldApp.version);
    }

    // Get the whitepapers that are installed on that Cloudflow server
    const remoteWhitepapers = api.whitepaper.list().results;
    
    // Get the list old and new workflow names
    const newWorkflows = app.workflows;
    const oldWorkflows = oldApp.workflows;
    const wfToUpdate = _.intersection(newWorkflows, oldWorkflows);
    const wfToCreate = _.difference(newWorkflows, wfToUpdate);

    // Update existing workflows
    const wfToUpdateJSONs = getWorkflowJSONsFromDisk(app, wfToUpdate);
    const updateList = [];
    for (const wfJSON of wfToUpdateJSONs) {
        const wfName = wfJSON.name;
        const remoteFlow = _.find(remoteWhitepapers, function (rwf) {
            return wfName === rwf.name;
        });
        const newFlow = _.find(wfToUpdateJSONs, function (wfJSON) {
            return wfName === wfJSON.name;
        });

        // Skip the update if the workflow is missing on the remote system, it's a create
        if (remoteFlow === undefined) {
            wfToCreate.push(wfJSON.name);
            continue;
        }

        updateList.push({
            remoteFlow,
            newFlow
        });
    }

    const cannotUpdateList = _.filter(_.map(updateList, ({remoteFlow, newFlow}) => {
        return {
            updateable: isWorkflowUpdateable(remoteFlow, newFlow),
            name: remoteFlow.name
        };
    }), entry => entry.updateable === false);

    // Do not allow to update a workflow that will break workables
    // unless the forceUpdateWorkflows option is passed
    if (cannotUpdateList.length > 0 && options.forceUpdateWorkflows !== true) {
        const names = _.map(cannotUpdateList, e => e.name);
        throw new Errors.UpdateBreaksWorkablesError(names);
    }

    // Check if there are conflicting workflows
    const errors = [];
    for (const wfJSON of wfToUpdateJSONs) {
        const matchingWhitepapers = getMatchingWorkflows(wfJSON, remoteWhitepapers, true);
        if (matchingWhitepapers.length > 0) {
            errors.push({
                workflow: wfJSON,
                matching: matchingWhitepapers
            });
            continue;
        }
    }

    if (errors.length > 0) {
        for (const error of errors) {
            const wfName = error.workflow.name;
            const matchingNames = _.map(error.matching, (w) => w.name)
            outputStream.writeLine(`App workflow ${wfName} cannot be added because it conflicts with ${matchingNames.join(', ')}`);
        }
        const conflictingWfNames = _.map(errors, e => e.workflow.name);
        throw new Errors.ConflictingWorkflows(conflictingWfNames)
    }

    updateWorkflows(api, updateList, outputStream);

    // Remove and add workflows only after the update succeeded
    // Remove workflows that are in the old app and not in the new app
    outputStream.writeLine(`updating old remote version ${oldApp.version}`);
    let wfToRemove = _.difference(oldWorkflows, wfToUpdate);
    if (wfToRemove.length > 0) {
        const query = ['done', 'not equal to', true, 'and', 'whitepaper_name', 'in', wfToRemove];
        const runningWorkables = api.workable.list(query)
        if (runningWorkables.results.length > 0 && options.forceRemoveWorkflows !== true) {
            const names = _.uniq(_.map(runningWorkables.results, e => e.whitepaper_name));
            for (const name of names) {
                outputStream.writeLine(`workflow ${name} will not be removed as it contains running workables, use --force-remove-worfklows to remove`)
            }
            wfToRemove = _.filter(wfToRemove, wf => {
                return names.indexOf(wf) < 0;
            })
        }
        removeWorkflows(api, wfToRemove, outputStream);
    }

    // Add new workflows
    const wfToCreateJSONs = getWorkflowJSONsFromDisk(app, wfToCreate);
    addWorkflows(api, wfToCreateJSONs, outputStream);
    
    return removeFiles(apiAsync, oldApp, outputStream).then(function () {
        outputStream.writeLine(`Unregistering old application in Cloudflow: ${app.name}`);
        api.registry.cfapp.delete(oldAppDefinition._id);
    }).then(function () {
        const { emptyDirectories, filesToUpload } = app.getLocalFiles();

        // Adding the files
        return Promise.all([
            createEmptyDirectories(apiAsync, emptyDirectories, outputStream),
            uploadFiles(apiAsync, filesToUpload, true, outputStream)
        ]);
    }).then(function() {
        outputStream.writeLine(`Register updated application in Cloudflow: ${app.name}`);
        canRegisterApps(api) && api.registry.cfapp.create(app.projectJSON);
    });
}

module.exports = updateApp;