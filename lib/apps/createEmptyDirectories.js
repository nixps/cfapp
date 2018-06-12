/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

var async = require('async');

const ParallellDirectoryCreations = 1;
const ConsoleOutputStream = require('../util/ConsoleOutputStream.js');
const Errors = require('./Errors.js');
const PromiseCloudflowAPI = require('./PromiseCloudflowAPI.js');



/**
 * Creates empty directories
 * @param {String} api the api object to use for the upload
 * @param {CloudflowPath[]} files the Cloudflow file paths to upload to the remote
 * @param {boolean} overwrite if true, remote files are overwritten
 */
function createEmptyDirectories(api, emptyDirectories, outputStream = new ConsoleOutputStream()) {
    return new Promise(function(resolve, reject) {
        async.parallelLimit(emptyDirectories.map(function(emptyDirectory) {
            return function(callback) {
                try {
                    PromiseCloudflowAPI.createFolder(api, emptyDirectory).then(function () {
                        outputStream.writeLine(`created empty folder: ${emptyDirectory}`);
                        callback();
                    }).catch(function () {
                        outputStream.writeLine(`cannot create empty folder: ${emptyDirectory}`);
                        callback(new Errors.FolderCreationFailedError(emptyDirectory));
                    });
                }
                catch(error) {
                    outputStream.writeLine(error);
                    callback(error);
                }
            };
        }), ParallellDirectoryCreations, function(error, results) {
            if (error) {
                reject(error);
            }
            else {
                resolve(results);
            }
        });
    });
}

module.exports = createEmptyDirectories;
