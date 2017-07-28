/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

var _ = require('lodash');
var cloudflowAPI = require('cloudflow-api');
var fs = require('fs');
const async = require('async');
const semver = require('semver');

const uploadWorkflows = require('../lib/apps/uploadWorkflows');
const uploadFiles = require('../lib/apps/uploadFiles');
const downloadFiles = require('../lib/apps/downloadFiles');
const downloadWorkflows = require('../lib/apps/downloadWorkflows');
const findCFApps = require('../lib/apps/findCFApps');
const canRegisterApps = require('../lib/apps/canRegisterApps');
const CloudflowApplication = require('../lib/apps/CloudflowApplication');
const ConsoleOutputStream = require('../lib/util/ConsoleOutputStream');
const Errors = require('../lib/apps/Errors');

const defaultParameters = {
    host: 'http://localhost:9090',
    login: 'admin',
    password: 'admin',
    overwrite: false,
    install: '',
    download: '',
    force: false
};

function getAppDefinition(api, appName) {
    const appResults = api.registry.cfapp.list(['name', 'equal to', appName]);
    if (Array.isArray(appResults.results) === false || appResults.results.length  === 0) {
        throw new Errors.ApplicationNotInstalledError(appName);
    }

    return appResults.results[0];
}

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
    var session = api.auth.create_session(parameters.login, parameters.password).session;
    api.m_session = session;

    // Install the Cloudflow application
    outputStream.writeLine(`installing app "${app.name}"`);

    if (canRegisterApps(api) === true && app.isInstalled(api) === true) {
        throw new Errors.ApplicationAlreadyInstalledError(app.name);
    }

    // Adding workflows for this app
    uploadWorkflows(api, app, parameters.overwrite, outputStream);

    // Adding the files
    return uploadFiles(api, app.getLocalFiles(), parameters.overwrite, outputStream).then(function() {
        canRegisterApps(api) && api.registry.cfapp.create(app.projectJSON);
    });
}


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
    const session = api.auth.create_session(parameters.login, parameters.password).session;
    api.m_session = session;

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

    // Getting the workflows
    downloadWorkflows(api, app, parameters.overwrite, outputStream);

    // Getting the files
    return downloadFiles(api, app.getRemoteFiles(api), parameters.overwrite, outputStream);
}


function removeApp(appName, options, outputStream = new ConsoleOutputStream()) {
    // Merge all the settings
    let parameters = {};
    _.assign(parameters, defaultParameters, options);

    outputStream.writeLine(`application: ${appName}`);
    outputStream.writeLine(`Cloudflow: ${parameters.host}`);
    outputStream.writeLine(`user: ${parameters.login}`);

    // Get a Cloudflow API for the remote host and set the session
    const api = cloudflowAPI.getSyncAPI(parameters.host);
    const session = api.auth.create_session(parameters.login, parameters.password).session;
    api.m_session = session;

    // Download the Cloudflow application
    outputStream.writeLine(`removing app "${appName}"`);

    const appDefinition = getAppDefinition(api, appName);
    const app = new CloudflowApplication(appDefinition);

    const workflows = app.workflows;
    for(const workflowName of workflows) {
        const result = api.whitepaper.list(['name', 'equal to', workflowName], [ '_id' ]);
        if (Array.isArray(result.results) === false || result.results.length === 0) {
            outputStream.writeLine(`whitepaper "${workflowName}"" does not exist anymore`);
            continue;
        }

        outputStream.writeLine(`removing whitepaper: ${workflowName}`);
        api.whitepaper.delete(result.results[0]._id);
    }

    const installedFiles = app.getRemoteFiles(api);
    outputStream.writeLine(appDefinition);
    for(const cloudflowPath of installedFiles) {
        const cloudflowURL = cloudflowPath.cloudflow;
        const result = api.asset.list(['cloudflow.file', 'equal to', cloudflowURL], [ '_id' ]);
        if (Array.isArray(result.results) === false || result.results.length === 0) {
            outputStream.writeLine(`asset "${cloudflowURL}" does not exist anymore`);
            continue;
        }

        outputStream.writeLine(`removing asset: ${cloudflowURL}`);
        api.file.delete_file(cloudflowURL);
    }

    outputStream.writeLine(`Unregistering application in Cloudflow: ${appName}`);
    api.registry.cfapp.delete(appDefinition._id);
}


function updateApp(app, options, outputStream = new ConsoleOutputStream()) {
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
    const session = api.auth.create_session(parameters.login, parameters.password).session;
    api.m_session = session;

    // Check if the remote cloudflow supports updating the app
    if (canRegisterApps(api) === false) {
        outputStream.writeLine(`skipping update of ${app.name}`);
        outputStream.writeLine(`no support for application updates this Cloudflow build b${api.portal.version().build}`);
        return Promise.reject(new Errors.UnsupportedApplicationUpdatesError(api.portal.version().build));
    }

    const appDefinition = getAppDefinition(api, app.name);

    if (semver.valid(appDefinition.version) === null && parameters.force === false) {
        throw new Errors.InvalidRemoteVersionError(app.name);
    }

    if (semver.valid(app.version) === null) {
        throw new Errors.InvalidLocalVersionError(app.name);
    }

    if (parameters.force === false && semver.lte(app.version, appDefinition.version)) {
        throw new Errors.OlderOrSameVersionError(app.name, app.version, appDefinition.version);
    }

    outputStream.writeLine(`removing old remote version ${appDefinition.version}`);
    removeApp(app.name, parameters, outputStream);
    outputStream.writeLine(`installing new version ${app.version}`);
    return uploadApp(app, parameters, outputStream);
}


module.exports = {
    upload: function(directory, options, outputStream = new ConsoleOutputStream()) {
        const cfApps = findCFApps(directory);
        return new Promise(function(resolve, reject) {
            async.forEachSeries(cfApps, function(app, callback) {
                uploadApp(app, options, outputStream).then(callback).catch(callback);
            }, function(error) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    },
    download: function(directory, options, outputStream = new ConsoleOutputStream()) {
        const cfApps = findCFApps(directory);
        return new Promise(function(resolve, reject) {
            async.forEachSeries(cfApps, function(app, callback) {
                downloadApp(app, options, outputStream).then(callback).catch(callback);
            }, function(error) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    },
    update: function(directory, options, outputStream = new ConsoleOutputStream()) {
        const cfApps = findCFApps(directory);
        return new Promise(function(resolve, reject) {
            async.forEachSeries(cfApps, function(app, callback) {
                updateApp(app, options, outputStream).then(callback).catch(callback);
            }, function(error) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    },
    remove: function(appName, options, outputStream = new ConsoleOutputStream()) {
        removeApp(appName, options, outputStream);
    },
    list: function(url, options) {
        // Merge all the settings
        let parameters = {};
        _.assign(parameters, defaultParameters, options);

        const api = cloudflowAPI.getSyncAPI(url);
        const session = api.auth.create_session(parameters.login, parameters.password).session;
        api.m_session = session;

        return api.registry.cfapp.list().results;
    },
    canRegisterApps: function(api) {
        return canRegisterApps(api);
    },
    init: function(directory) {
        console.log(directory);
    }
};
