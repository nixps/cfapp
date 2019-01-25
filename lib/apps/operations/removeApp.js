'use strict';
const _ = require('lodash');
const cloudflowAPI = require('cloudflow-api');

const defaultParameters = require('./defaultParameters');
const getAppDefinition = require('./getAppDefinition');
const removeFiles = require('../files/removeFiles');
const removeWorkflows = require('../workflows/removeWorkflows');

const CloudflowApplication = require('../CloudflowApplication');

/**
 * Removes an installed application
 * @param {*} appName The name of the application to remove
 * @param {*} options 
 * @param {*} outputStream The stream where the console output goes
 */
function removeApp(appName, options, outputStream = new ConsoleOutputStream()) {
    // Merge all the settings
    let parameters = {};
    _.assign(parameters, defaultParameters, options);

    outputStream.writeLine(`application: ${appName}`);
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

    // Download the Cloudflow application
    outputStream.writeLine(`removing app "${appName}"`);

    const appDefinition = getAppDefinition(api, appName);
    const app = new CloudflowApplication(appDefinition);

    removeWorkflows(api, app.workflows);

    return removeFiles(apiAsync, app, outputStream).then(function () {
        outputStream.writeLine(`Unregistering application in Cloudflow: ${appName}`);
        api.registry.cfapp.delete(appDefinition._id);
    });
}

module.exports = removeApp