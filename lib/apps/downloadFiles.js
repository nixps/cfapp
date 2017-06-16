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
var mkdirp = require('mkdirp');

/**
 * Downloads several files from the remote Cloudflow
 * @param {String} api the api object to use for the upload
 * @param {String[]} files the Cloudflow file paths to download from the remote
 * @param {boolean} overwrite if true, overwrites the local files
 */
function downloadFiles(api, files, overwrite = false) {
    async.forEachSeries(files, function(file, callback) {
        var assets = api.asset.list(['cloudflow.part', 'equal to', file.cloudflow], [ 'cloudflow', '_id' ]).results;
        var fileExists = fs.existsSync(file.fs);

        if (overwrite !== true && fileExists === true) {
            console.log(`skipping file: ${file.cloudflow} file exists`);
            callback();
            return;
        }

        console.log(`downloading file: ${file.cloudflow}`);

        var directory = file.fs.split('/').slice(0,-1).join('/');
        mkdirp.sync(directory);

        request
            .get(`${api.m_address}?dl=${encodeURI(file.cloudflow)}&session=${api.m_session}`, function(value, response, body) {
                callback();
            })
            .on('error', function(err) {
                console.log(err)
            })
            .pipe(fs.createWriteStream(decodeURI(file.fs), {
                autoClose: true,
                flags: 'w'
            }));
    });
}

module.exports = downloadFiles;
