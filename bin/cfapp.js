#! /usr/bin/env node

/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

var parameters = require('minimist')(process.argv.slice(2));
var _ = require('lodash');
var cloudflowAPI = require('cloudflow-api');
var fs = require('fs');
var request = require('request');

var showUsage = require('./usage.js');
var uploadFiles = require('../lib/uploadFiles.js');
var uploadWorkflows = require('../lib/uploadWorkflows.js');
var downloadFiles = require('../lib/downloadFiles.js');
var downloadWorkflows = require('../lib/downloadWorkflows.js');
var expandPaths = require('../lib/expandPaths.js');

// If no parameters are passed, show the command-line usage
if (_.isEmpty(parameters._) && _.keys(parameters).length === 1) {
    showUsage();
    return;
}

// If no install or download parameter is passed show the command-line usage
if (_.isEmpty(parameters.install) && _.isEmpty(parameters.download)) {
    showUsage();
    return;
}

// Set the project app file path and the application root
var cfAppFile = '';
var cfAppRoot = '';
if (_.isEmpty(parameters.install) === false) {
    cfAppFile = parameters.install + '/project.cfapp';
    cfAppRoot = parameters.install;
}
else if (_.isEmpty(parameters.download) === false) {
    cfAppFile = parameters.download + '/project.cfapp';
    cfAppRoot = parameters.download;
}

// Read the project file
var projectFile = fs.readFileSync(cfAppFile, 'utf8');
var projectJSON = JSON.parse(projectFile);

// Merge all the settings
var parameters = _.extend({
    host: 'http://localhost:9090',  // The url of the target Cloudflow
    login: 'admin',                 // The login of the target Cloudflow
    password: '',                   // The password of the target Cloudflow
    app: cfAppRoot,                 // The root of the app
    overwrite: false,               // Overwrite existing flows or files
    install: '',                    // The path of the application to install
    download: ''                    // The path where the application should be downloaded
}, {
    host: projectJSON.host,
    login: projectJSON.login,
    password: projectJSON.password
}, parameters);


console.log('Cloudflow: %s', parameters.host);
console.log('user: %s', parameters.login);

// Get a Cloudflow API for the remote host and set the session
var api = cloudflowAPI.getSyncAPI(parameters.host);
var session = api.auth.create_session(parameters.login, parameters.password).session;
api.m_session = session;

// Install or download the application
if (_.isEmpty(parameters.install) === false) {
    // Install the Cloudflow application
    console.log('installing app "%s"', projectJSON.name);

    // Adding workflows for this app
    var workflows = projectJSON.workflows;
    uploadWorkflows(api, parameters, workflows);

    // Adding the files
    var files = projectJSON.files;
    var expandedFiles = expandPaths.fs(files, parameters.app);
    console.log(expandedFiles);
    uploadFiles(api, parameters, expandedFiles);

    // var apps = api.application.list(['name', 'equal to', projectJSON.name]).results;
    // if (apps.length > 0) {
    //     api.application.delete(apps[0]._id);
    // }
    // api.application.create(projectJSON);
} else if (_.isEmpty(parameters.download) === false) {
    // Download the Cloudflow application
    console.log('downloading app resources for "%s"', projectJSON.name);

    if (fs.existsSync(parameters.app + "/workflows") === false) {
        fs.mkdirSync(parameters.app + "/workflows");
    }

    if (fs.existsSync(parameters.app + "/files") === false) {
        fs.mkdirSync(parameters.app + "/files");
    }

    // Adding workflows for this app
    var workflows = projectJSON.workflows;
    downloadWorkflows(api, parameters, workflows);

    // Adding the files
    var files = projectJSON.files;
    var expandedFiles = expandPaths.remote(files, api);
    downloadFiles(api, parameters, expandedFiles);
}
