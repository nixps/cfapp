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
    const oldApp = new CloudflowApplication(getAppDefinition(api, app.name));

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

    // Remove workflows that are in the old app and not in the new app
    outputStream.writeLine(`updating old remote version ${oldApp.version}`);
    const wfToRemove = _.difference(oldWorkflows, wfToUpdate);
    removeWorkflows(api, wfToRemove, outputStream);

    // Add new workflows
    const wfToCreate = _.difference(newWorkflows, wfToUpdate);
    const wfToCreateJSONs = getWorkflowJSONsFromDisk(app, wfToCreate);
    addWorkflows(api, wfToCreateJSONs, outputStream);

    // Update existing workflows
    const wfToUpdateJSONs = getWorkflowJSONsFromDisk(app, wfToUpdate);
    updateWorkflows(api, _.map(wfToUpdate, function(wfName) {
        return {
            remoteFlow: _.find(remoteWhitepapers, function (rwf) {
                return wfName === rwf.name;
            }),
            newFlow: _.find(wfToUpdateJSONs, function (wfJSON) {
                return wfName === wfJSON.name;
            })
        }
    }), outputStream);

    return removeFiles(apiAsync, oldApp, outputStream).then(function () {
        outputStream.writeLine(`Unregistering application in Cloudflow: ${app.name}`);
        api.registry.cfapp.delete(oldApp._id);
    }).then(function () {
        const { emptyDirectories, filesToUpload } = app.getLocalFiles();

        // Adding the files
        return Promise.all([
            createEmptyDirectories(apiAsync, emptyDirectories, outputStream),
            uploadFiles(apiAsync, filesToUpload, true, outputStream)
        ])
    }).then(function() {
        canRegisterApps(api) && api.registry.cfapp.create(app.projectJSON);
    });
}

module.exports = updateApp;