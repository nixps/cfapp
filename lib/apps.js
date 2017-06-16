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

var uploadWorkflows = require('../lib/uploadWorkflows.js');
var uploadFiles = require('../lib/uploadFiles.js');
var downloadFiles = require('../lib/downloadFiles.js');
var downloadWorkflows = require('../lib/downloadWorkflows.js');
var findCFApps = require('../lib/findCFApps.js');

const defaultParameters = {
    host: 'http://localhost:9090',
    login: 'admin',
    password: 'admin',
    overwrite: false,
    install: '',
    download: ''
};

function uploadApp(app, options) {
    // Merge all the settings
    var parameters = _.extend(_.extend({
        host: app.host,
        login: app.login,
        password: app.password
    }, options), defaultParameters);

    console.log(`application: ${app.name}`);
    console.log(`Cloudflow: ${parameters.host}`);
    console.log(`user: ${parameters.login}`);

    // Get a Cloudflow API for the remote host and set the session
    var api = cloudflowAPI.getSyncAPI(parameters.host);
    var session = api.auth.create_session(parameters.login, parameters.password).session;
    api.m_session = session;

    // Install the Cloudflow application
    console.log(`installing app "${app.name}"`);

    // Adding workflows for this app
    uploadWorkflows(api, app, parameters.overwrite);

    // Adding the files
    uploadFiles(api, app.getFilesToUpload(), parameters.overwrite);
}


function downloadApp(app, options) {
    // Merge all the settings
    const parameters = _.extend(_.extend({
        host: app.host,
        login: app.login,
        password: app.password
    }, options), defaultParameters);

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
    downloadFiles(api, app.getFilesToDownload(api), parameters.overwrite);
}


module.exports = {
    upload: function(directory, options) {
        // Set the project app file path and the application root
        const cfApps = findCFApps(directory);
        for(const app of cfApps) {
            uploadApp(app, options);
        }
    },
    download: function(directory, options) {
        // Set the project app file path and the application root
        const cfApps = findCFApps(directory);
        for(const app of cfApps) {
            downloadApp(app, options);
        }
    },
    init: function(directory) {

    }
};
