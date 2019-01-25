'use strict';
const _ = require('lodash');
const cloudflowAPI = require('cloudflow-api');

const addWorkflows = require('../workflows/addWorkflows');
const updateWorkflows = require('../workflows/updateWorkflows');
const createEmptyDirectories = require('../createEmptyDirectories');
const canRegisterApps = require('../canRegisterApps');
const defaultParameters = require('./defaultParameters');
const getWorkflowJSONsFromDisk = require('./getWorkflowJSONsFromDisk');
const uploadFiles = require('../files/uploadFiles');

const Errors = require('../Errors');

/**
 * Uploads an app to Cloudflow
 * @param {*} app the name of the app
 * @param {*} options the command line options that were passed
 * @param {*} outputStream the console output stream
 */
function uploadApp(app, options, outputStream = new ConsoleOutputStream()) {
    // Merge all the settings
    let parameters = {};
    _.assign(parameters, defaultParameters, {
        host: app.host,
        login: app.login,
        password: app.password
    }, options);

    outputStream.writeLine(`application: ${app.name}`);
    outputStream.writeLine(`Cloudflow: ${parameters.host}`);
    outputStream.writeLine(`user: ${parameters.login}`);

    // Get a Cloudflow API for the remote host and set the session
    var api = cloudflowAPI.getSyncAPI(parameters.host);
    var apiAsync = cloudflowAPI.getAsyncAPI(parameters.host);
    if (typeof parameters.session === 'string' && parameters.session.length > 0) {
        apiAsync.m_session = parameters.session;
        api.m_session = parameters.session;
    } else {
        var session = api.auth.create_session(parameters.login, parameters.password).session;
        api.m_session = session;
        apiAsync.m_session = session;
    }

    // Install the Cloudflow application
    outputStream.writeLine(`installing app "${app.name}"`);

    if (canRegisterApps(api) === true && app.isInstalled(api) === true) {
        throw new Errors.ApplicationAlreadyInstalledError(app.name);
    }

    // Get the workflows on the server
    const remoteWhitepapers = api.whitepaper.list().results;
    const whitepaperNames = app.workflows;
    const create = []
    const update = []
    for (const w of whitepaperNames) {
        const appWhitepaper = getWorkflowJSONsFromDisk(app, [w])[0];
        const remoteWhitepaper = _.find(remoteWhitepapers, function (rw) {
            return rw.name === w
        });
        if (remoteWhitepaper !== undefined) {
            update.push({
                remoteFlow: remoteWhitepaper,
                newFlow: appWhitepaper
            });
        } else {
            create.push(appWhitepaper);
        }
    }
    
    // Add the new workflows
    addWorkflows(api, create, outputStream);
    
    // Update the workflows if overwrite is passed
    if (parameters.overwrite === true) {
        updateWorkflows(api, update, outputStream);
    } else {
        for (const wfPair of update) {
            const {remoteFlow} = wfPair;
            const {name} = remoteFlow;
            outputStream.writeLine(`skipping workflow: ${name} workflow exists`);
        }
    }

    const { emptyDirectories, filesToUpload } = app.getLocalFiles();

    // Adding the files
    return Promise.all([
        createEmptyDirectories(apiAsync, emptyDirectories, outputStream),
        uploadFiles(apiAsync, filesToUpload, parameters.overwrite, outputStream)
    ]).then(function() {
        canRegisterApps(api) && api.registry.cfapp.create(app.projectJSON);
    });
}

module.exports = uploadApp;