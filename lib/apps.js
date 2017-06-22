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

const defaultParameters = {
    host: 'http://localhost:9090',
    login: 'admin',
    password: 'admin',
    overwrite: false,
    install: '',
    download: ''
};

function getAppDefinition(api, appName) {
    const appResults = api.application.list(['name', 'equal to', appName]);
    if (Array.isArray(appResults.results) === false || appResults.results.length  === 0) {
        throw new Error(`application ${appName} is not installed`);
    }

    return appResults.results[0];
}

function uploadApp(app, options) {
    // Merge all the settings
    let parameters = {};
    _.assign(parameters, defaultParameters, {
        host: app.host,
        login: app.login,
        password: app.password
    }, options);

    console.log(`application: ${app.name}`);
    console.log(`Cloudflow: ${parameters.host}`);
    console.log(`user: ${parameters.login}`);

    // Get a Cloudflow API for the remote host and set the session
    var api = cloudflowAPI.getSyncAPI(parameters.host);
    var session = api.auth.create_session(parameters.login, parameters.password).session;
    api.m_session = session;

    // Install the Cloudflow application
    console.log(`installing app "${app.name}"`);

    if (canRegisterApps(api) === true && app.isInstalled(api) === true) {
        throw new Error(`The application ${app.name} is already installed, use 'update' instead`);
    }

    // Adding workflows for this app
    uploadWorkflows(api, app, parameters.overwrite);

    // Adding the files
    return uploadFiles(api, app.getFilesToUpload(), parameters.overwrite).then(function() {
        canRegisterApps(api) && api.application.create(app.expandedJSON);
    });
}


function downloadApp(app, options) {
    // Merge all the settings
    let parameters = {};
    _.assign(parameters, defaultParameters, {
        host: app.host,
        login: app.login,
        password: app.password
    }, options);

    console.log(`application: ${app.name}`);
    console.log(`Cloudflow: ${parameters.host}`);
    console.log(`user: ${parameters.login}`);

    // Get a Cloudflow API for the remote host and set the session
    const api = cloudflowAPI.getSyncAPI(parameters.host);
    const session = api.auth.create_session(parameters.login, parameters.password).session;
    api.m_session = session;

    // Download the Cloudflow application
    console.log(`downloading app "${app.name}"`);

    const workflowDirectory = `${app.folder}/workflows`;
    const fileDirectory = `${app.folder}/workflows`;

    if (fs.existsSync(workflowDirectory) === false) {
        fs.mkdirSync(workflowDirectory);
    }

    if (fs.existsSync(fileDirectory) === false) {
        fs.mkdirSync(fileDirectory);
    }

    // Getting the workflows
    downloadWorkflows(api, app, parameters.overwrite);

    // Getting the files
    return downloadFiles(api, app.getFilesToDownload(api), parameters.overwrite);
}


function removeApp(appName, options) {
    // Merge all the settings
    let parameters = {};
    _.assign(parameters, defaultParameters, options);

    console.log(`application: ${appName}`);
    console.log(`Cloudflow: ${parameters.host}`);
    console.log(`user: ${parameters.login}`);

    // Get a Cloudflow API for the remote host and set the session
    const api = cloudflowAPI.getSyncAPI(parameters.host);
    const session = api.auth.create_session(parameters.login, parameters.password).session;
    api.m_session = session;

    // Download the Cloudflow application
    console.log(`removing app "${appName}"`);

    const appDefinition = getAppDefinition(api, appName);

    const workflows = appDefinition.workflows;
    for(const workflowName of workflows) {
        const result = api.whitepaper.list(['name', 'equal to', workflowName], [ '_id' ]);
        if (Array.isArray(result.results) === false || result.results.length === 0) {
            console.log(`whitepaper "${workflowName}"" does not exist anymore`);
            continue;
        }

        console.log(`removing whitepaper: ${workflowName}`);
        api.whitepaper.delete(result.results[0]._id);
    }

    const installedFiles = appDefinition.installedFiles;
    console.log(appDefinition);
    for(const cloudflowURL of installedFiles) {
        const result = api.whitepaper.list(['cloudflow.file', 'equal to', cloudflowURL], [ '_id' ]);
        if (Array.isArray(result.results) === false || result.results.length === 0) {
            console.log(`asset "${cloudflowURL}" does not exist anymore`);
            continue;
        }

        const assetID = result.results[0]._id;
        console.log(`removing asset: ${cloudflowURL}`);
        api.asset.delete(assetID);
    }

    console.log(`Unregistering application in Cloudflow: ${appName}`);
    api.application.delete(appDefinition._id);
}


function updateApp(app, options) {
    // Merge all the settings
    let parameters = {};
    _.assign(parameters, defaultParameters, {
        host: app.host,
        login: app.login,
        password: app.password
    }, options);

    console.log(`application: ${app.name}`);
    console.log(`Cloudflow: ${parameters.host}`);
    console.log(`user: ${parameters.login}`);

    // Get a Cloudflow API for the remote host and set the session
    const api = cloudflowAPI.getSyncAPI(parameters.host);
    const session = api.auth.create_session(parameters.login, parameters.password).session;
    api.m_session = session;

    const appDefinition = getAppDefinition(api, app.name);

    if (semver.valid(appDefinition.version) === false && parameters.force === false) {
        throw new Error(`invalid version on REMOTE ${app}, force to update`);
    }

    if (semver.valid(app.version) === false) {
        throw new Error(`invalid version on LOCAL ${app}, specify a valid varsion to update`);
    }

    if (semver.lte(app.version, appDefinition.version) && parameters.force === false) {
        throw new Error(`LOCAL version ${app.version} <= REMOTE version ${appDefinition.version}, force to update`);
    }

    console.log(`removing old remote version ${appDefinition.version}`);
    removeApp(app.name, options);
    console.log(`installing new version ${app.version}`);
    return uploadApp(app, options);
}


module.exports = {
    upload: function(directory, options) {
        const cfApps = findCFApps(directory);
        return new Promise(function(resolve, reject) {
            async.forEachSeries(cfApps, function(app, callback) {
                uploadApp(app, options).then(callback).catch(callback);
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
    download: function(directory, options) {
        const cfApps = findCFApps(directory);
        return new Promise(function(resolve, reject) {
            async.forEachSeries(cfApps, function(app, callback) {
                downloadApp(app, options).then(callback).catch(callback);
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
    update: function(directory, options) {
        const cfApps = findCFApps(directory);
        return new Promise(function(resolve, reject) {
            async.forEachSeries(cfApps, function(app, callback) {
                updateApp(app, options).then(callback).catch(callback);
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
    remove: function(appName, options) {
        removeApp(appName, options);
    },
    list: function(url, options) {
        // Merge all the settings
        let parameters = {};
        _.assign(parameters, defaultParameters, options);

        const api = cloudflowAPI.getSyncAPI(url);
        const session = api.auth.create_session(parameters.login, parameters.password).session;
        api.m_session = session;

        return api.application.list().results;
    },
    canRegisterApps: function(api) {
        return canRegisterApps(api);
    },
    init: function(directory) {
        console.log(directory);
    }
};
