/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

const async = require('async');
const fs = require('fs');
const request = require('request');
const mkdirp = require('mkdirp');

const ConsoleOutputStream = require('../util/ConsoleOutputStream.js');
const Errors = require('./Errors.js');

/**
 * Downloads several files from the remote Cloudflow
 * @param {String} api the api object to use for the upload
 * @param {String[]} files the Cloudflow file paths to download from the remote
 * @param {boolean} overwrite if true, overwrites the local files
 */
function downloadFiles(api, files, overwrite = false, outputStream = new ConsoleOutputStream()) {
    return new Promise(function(resolve, reject) {
        async.forEachSeries(files, function(file, callback) {
            try {
                var fileExists = fs.existsSync(file.fs);

                if (overwrite !== true && fileExists === true) {
                    outputStream.writeLine(`skipping file: ${file.cloudflow} file exists`);
                    callback();
                    return;
                }

                outputStream.writeLine(`downloading file: ${file.cloudflow}`);

                var directory = file.fs.split('/').slice(0,-1).join('/');
                mkdirp.sync(directory);

                request.get(`${api.m_address}?dl=${encodeURI(file.cloudflow)}&session=${api.m_session}`, function(value, response/*, body*/) {
                    if (value) {
                        outputStream.writeLine(`could not download file: ${file.cloudflow}`);
                        callback(value);
                    }
                    else if (response.statusCode !== 200) {
                        outputStream.writeLine(`could not download file: ${file.cloudflow}`);
                        callback(new Errors.DownloadError(response.statusCode, file.cloudflow));
                    }
                })
                .on('error', function(err) {
                    outputStream.writeLine(err);
                    callback(err);
                })
                .pipe(fs.createWriteStream(decodeURI(file.fs), {
                    autoClose: true,
                    flags: 'w'
                }))
                .on('error', function(err) {
                    outputStream.writeLine(err);
                    callback(err);
                })
                .on('close', function() {
                    callback();
                });
            }
            catch(error) {
                outputStream.writeLine(error);
                callback(error);
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
}

module.exports = downloadFiles;
