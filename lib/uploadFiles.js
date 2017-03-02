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
var convertPath = require('./convertPath.js')


/**
 * Uploads a single file to the remote Cloudflow
 * @param {String} host the url of the remote Cloudflow
 * @param {String} session the session key for the remote
 * @param {String} filePath the file path of the file to upload
 * @param {String} cloudflowPath the Cloudflow path on the remote system
 * @param {callback} callback the callback to call when the upload is done
 */
function uploadFile(host, session, filePath, cloudflowPath, callback) {
    console.log('adding file: %s', filePath);
    request.post({
        'url': host + '/portal.cgi?asset=upload_file&session=' + session + '&url=' + cloudflowPath + '&create_folders=true',
        formData: {
           file:  fs.createReadStream(filePath)
        }
    }, function(value, response, body) {
        callback();
    });
}


/**
 * Uploads several files to the remote Cloudflow
 * @param {String} api the api object to use for the upload
 * @param {Object} parameters the command-line parameters
 * @param {String[]} files the Cloudflow file paths to upload to the remote
 */
function uploadFiles(api, parameters, files) {
    async.forEachSeries(files, function(file, callback) {
        var assets = api.asset.list(['cloudflow.part', 'equal to', file], [ 'cloudflow', '_id' ]).results;
        if (parameters.overwrite !== true && assets.length > 0) {
            console.log('skipping file: %s file exists', file);
            callback();
            return;
        }

        if (parameters.overwrite === true && assets.length > 0) {
            api.asset.delete(assets[0]._id);
        }

        uploadFile(parameters.host, api.m_session, convertPath.toFSPath(parameters.app, file), file, callback);
    });
}

module.exports = uploadFiles;
