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
var fs = require('fs');
const async = require('async');
const { join } = require('path');

const findCFApps = require('../lib/apps/findCFApps');
const ConsoleOutputStream = require('../lib/util/ConsoleOutputStream');
const Errors = require('../lib/apps/Errors');

module.exports = {
    upload: function(directory, options, outputStream = new ConsoleOutputStream()) {
        const uploadApp = require('./apps/operations/uploadApp');

        const cfApps = findCFApps(directory);
        if (cfApps.length === 0) {
            throw new Errors.MissingProjectCFAppError(directory);
        }
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
        const downloadApp = require('./apps/operations/downloadApp');

        const cfApps = findCFApps(directory);
        if (cfApps.length === 0) {
            throw new Errors.MissingProjectCFAppError(directory);
        }
        return new Promise(function(resolve, reject) {
            async.forEachSeries(cfApps, function(app, callback) {
                try {
                    downloadApp(app, options, outputStream).then(callback).catch(callback);
                } catch(error) {
                    callback(error)
                }
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
        const updateApp = require('./apps/operations/updateApp');
        
        const cfApps = findCFApps(directory);
        if (cfApps.length === 0) {
            throw new Errors.MissingProjectCFAppError(directory);
        }
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
        const removeApp = require('./apps/operations/removeApp');

        return removeApp(appName, options, outputStream);
    },
    list: function(url, options) {
        const cloudflowAPI = require('cloudflow-api');
        const defaultParameters = require('./apps/operations/defaultParameters');
        
        // Merge all the settings
        let parameters = {};
        _.assign(parameters, defaultParameters, options);

        const api = cloudflowAPI.getSyncAPI(url);
        const session = api.auth.create_session(parameters.login, parameters.password).session;
        api.m_session = session;

        return api.registry.cfapp.list().results;
    },
    canRegisterApps: function(api) {
        const canRegisterApps = require('../lib/apps/canRegisterApps');

        return canRegisterApps(api);
    },
    init: function(directory, options) {
        const projectCFApp = {
            name: options.name,
            version: options.version,
            files: [],
            workflows: []
        };

        const projectPath = join(directory, 'project.cfapp');
        if (fs.existsSync(projectPath) === true) {
            throw new Error('project.cfapp already exists');
        }
        fs.writeFileSync(projectPath, JSON.stringify(projectCFApp));
    }
};
