'use strict';
const _ = require('lodash');
const cloudflowAPI = require('cloudflow-api');
const fs = require('fs');

const defaultParameters = require('./defaultParameters');
const downloadFiles = require('../files/downloadFiles');
const downloadWorkflows = require('../workflows/downloadWorkflows');

function downloadApp(app, options, outputStream = new ConsoleOutputStream()) {
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
    const api = cloudflowAPI.getSyncAPI(parameters.host);
    if (typeof parameters.session === 'string' && parameters.session.length > 0) {
        api.m_session = parameters.session;
    } else {
        const session = api.auth.create_session(parameters.login, parameters.password).session;
        api.m_session = session;
    }

    // Download the Cloudflow application
    outputStream.writeLine(`downloading app "${app.name}"`);

    const workflowDirectory = `${app.folder}/workflows`;
    const fileDirectory = `${app.folder}/workflows`;

    if (fs.existsSync(workflowDirectory) === false) {
        fs.mkdirSync(workflowDirectory);
    }

    if (fs.existsSync(fileDirectory) === false) {
        fs.mkdirSync(fileDirectory);
    }

    const validResult = app.validate(api);
    if (validResult.isValid === false) {
        fs.writeFileSync(`${app.folder}/project.cfapp`, JSON.stringify(validResult.projectJSON), 'utf8');
    }

    // Getting the workflows
    downloadWorkflows(api, app, parameters.overwrite, outputStream);

    // Getting the files
    return downloadFiles(api, app.getRemoteFiles(api), parameters.overwrite, outputStream);
}

module.exports = downloadApp;