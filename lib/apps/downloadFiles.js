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

/**
 * Downloads several files from the remote Cloudflow
 * @param {String} api the api object to use for the upload
 * @param {String[]} files the Cloudflow file paths to download from the remote
 * @param {boolean} overwrite if true, overwrites the local files
 */
function downloadFiles(api, files, overwrite = false) {
    return new Promise(function(resolve, reject) {
        async.forEachSeries(files, function(file, callback) {
            try {
                var fileExists = fs.existsSync(file.fs);

                if (overwrite !== true && fileExists === true) {
                    console.log(`skipping file: ${file.cloudflow} file exists`);
                    callback();
                    return;
                }

                console.log(`downloading file: ${file.cloudflow}`);

                var directory = file.fs.split('/').slice(0,-1).join('/');
                mkdirp.sync(directory);

                request.get(`${api.m_address}?dl=${encodeURI(file.cloudflow)}&session=${api.m_session}`, function(value, response/*, body*/) {
                    if (value) {
                        console.log(`could not download file: ${file.cloudflow}`);
                        callback(value);
                    }
                    else if (response.statusCode !== 200) {
                        console.log(`could not download file: ${file.cloudflow}`);
                        callback(new Error(`error ${response.statusCode} when downloading file ${file.cloudflow}`));
                    }
                })
                .on('error', function(err) {
                    console.log(err);
                    callback(err);
                })
                .pipe(fs.createWriteStream(decodeURI(file.fs), {
                    autoClose: true,
                    flags: 'w'
                }))
                .on('error', function(err) {
                    console.log(err);
                    callback(err);
                })
                .on('close', function() {
                    callback();
                });
            }
            catch(error) {
                console.log(error);
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
