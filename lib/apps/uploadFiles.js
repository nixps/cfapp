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
var fs = require('fs');
var request = require('request');

const ConsoleOutputStream = require('../util/ConsoleOutputStream.js');
const Errors = require('./Errors.js');

/**
 * Uploads several files to the remote Cloudflow
 * @param {String} api the api object to use for the upload
 * @param {CloudflowPath[]} files the Cloudflow file paths to upload to the remote
 * @param {boolean} overwrite if true, remote files are overwritten
 */
function uploadFiles(api, files, overwrite = false, outputStream = new ConsoleOutputStream()) {
    return new Promise(function(resolve, reject) {
        async.forEachSeries(files, function(file, callback) {
            try {
                const assets = api.asset.list(['cloudflow.part', 'equal to', file.cloudflow], [ 'cloudflow', '_id' ]).results;
                if (overwrite !== true && assets.length > 0) {
                    outputStream.writeLine(`skipping file: ${file.cloudflow} file exists`);
                    callback();
                    return;
                }

                if (overwrite === true && assets.length > 0) {
                    api.file.delete_file(assets[0].cloudflow.file);
                }

                outputStream.writeLine(`uploading file: ${file.cloudflow}`);

                request.post({
                    url: `${api.m_address}?asset=upload_file&session=${api.m_session}&url=${file.cloudflow}&create_folders=true`,
                    formData: {
                        file:  fs.createReadStream(file.fs)
                    }
                }, function(value, response /*, body*/) {
                    if (value) {
                        outputStream.writeLine(`could not upload file: ${file.cloudflow}`);
                        callback(value);
                    }
                    else if (response.statusCode !== 200) {
                        outputStream.writeLine(`could not upload file: ${file.cloudflow}`);
                        callback(new Errors.UploadError(response.statusCode, file.cloudflow));
                    }
                    else {
                        callback();
                    }
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

module.exports = uploadFiles;
