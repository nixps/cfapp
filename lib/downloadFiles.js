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
var convertPath = require('./convertPath.js')


/**
 * Downloads a single file from the remote Cloudflow
 * @param {String} host the url of the remote Cloudflow
 * @param {String} session the session key for the remote
 * @param {String} filePath the file path of the downloaded file
 * @param {String} cloudflowPath the Cloudflow path on the remote system
 * @param {callback} callback the callback to call when the download is done
 */
function downloadFile(host, session, filePath, cloudflowPath, callback) {
    console.log('downloading file: %s', filePath);

    var directory = filePath.split('/').slice(0,-1).join('/');
    mkdirp.sync(directory);

    request
        .get(host + '/portal.cgi?dl=' + cloudflowPath + '&session=' + session, function(value, response, body) {
            callback();
        })
        .on('error', function(err) {
            console.log(err)
        })
        .pipe(fs.createWriteStream(filePath, {
            autoClose: true,
            flags: 'w'
        }));
}


/**
 * Downloads several files from the remote Cloudflow
 * @param {String} api the api object to use for the upload
 * @param {Object} parameters the command-line parameters
 * @param {String[]} files the Cloudflow file paths to download from the remote
 */
function downloadFiles(api, parameters, files) {
    async.forEachSeries(files, function(file, callback) {
        var assets = api.asset.list(['cloudflow.part', 'equal to', file], [ 'cloudflow', '_id' ]).results;
        var assetFilename = convertPath.toFSPath(parameters.app, file);
        var fileExists = fs.existsSync(assetFilename);

        if (parameters.overwrite !== true && fileExists === true) {
            console.log('skipping file: %s file exists', file);
            callback();
            return;
        }

        downloadFile(parameters.host, api.m_session, convertPath.toFSPath(parameters.app, file), file, callback);
    });
}

module.exports = downloadFiles;
