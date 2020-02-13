/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */
'use strict';
const cloudflowAPI = require('cloudflow-api');
const ConsoleOutputStream = require('../util/ConsoleOutputStream.js');
const getSystemInfo = require('./client/getSystemInfo.js');
const getAppInfo = require('./server/getAppInfo.js');
const Unzipper = require('adm-zip');

const fs = require('fs-extra');
const request = require('request');
const path = require('path');

async function downloadApp (appName, options, outputStream = new ConsoleOutputStream()) {
    // Get a Cloudflow API for the remote host and set the session
    const api = cloudflowAPI.getSyncAPI(options.host);
    if (typeof options.session === 'string' && options.session.length > 0) {
        api.m_session = options.session;
    } else {
        const session = api.auth.create_session(options.login, options.password).session;
        api.m_session = session;
    }

    const systemInfo = getSystemInfo(api, options.marsurl, outputStream);
    const appInfo = await getAppInfo(systemInfo, appName, options.forceversion, options.forcelastversion, outputStream);

    const appVersion = appInfo.appVersion;
    const downloadUrl = appInfo.downloadUrl;
    const marsURL = systemInfo.serverUrl;
    const customerCode = systemInfo.customerCode;
    
    outputStream.writeLine(`downloading ${appName}@${appVersion} as ${customerCode} from ${marsURL}`);
    outputStream.writeLine(`url of the archive: ${marsURL}/${downloadUrl}`);

    const archivePath = path.join('.', 'archive.zip');
    return new Promise(function (resolve, reject) {
        request.get({
            url: `${marsURL}/${downloadUrl}`,
            // Make sure that request does not try to convert the read data, as it will convert the whole
            // file in a string buffer in memory (high memory usage).  Encoding null will ensure the file
            // is streamed to disk in chunks
            encoding: null
        }, function(value, response/*, body*/) {
            if (value) {
                outputStream.writeLine(`could not download the application ${appName}@${appVersion}`);
                reject(value);
            }
            else if (response.statusCode !== 200) {
                outputStream.writeLine(`could not download the application ${appName}@${appVersion}`);
                reject(new Errors.DownloadError(response.statusCode, `${appName}@${appVersion}`));
            }
        }).on('error', function(err) {
            outputStream.writeLine(err);
            reject(err);
        }).pipe(fs.createWriteStream(archivePath, {
            autoClose: true,
            flags: 'w'
        })).on('error', function(err) {
            outputStream.writeLine(err);
            reject(err);
        }).on('close', function () {
            resolve();
        }).on('end', function () {
            resolve();
        });
    }).then(function () {
        const unzipper = new Unzipper(archivePath);
        unzipper.extractAllTo(options.directory, true);
        fs.unlinkSync(archivePath);

        // The zip archive is different for public apps (missing extra directory level in zip file)
        // Check if the project.cfapp is on this path, if it is the case, early resolve
        if (fs.existsSync(path.join(options.directory, 'project.cfapp'))) {
            return Promise.resolve();
        }

        const dirs = fs.readdirSync(options.directory).filter((dir) => {
            return fs.lstatSync(path.join(options.directory, dir)).isDirectory();
        });;
        if (dirs.length === 0) {
            reject();
        }
        const directory = dirs[0];
        const appDirs = fs.readdirSync(path.join(options.directory, directory));
        // There are only 3 files/dirs on the root of cfapp
        return Promise.all(appDirs.map((subDir) => {
            return fs.move(path.join(options.directory, directory, subDir), path.join(options.directory, subDir), {
                overwrite: true
            })
        })).then(function () {
            return fs.remove(path.join(options.directory, directory));
        });
    }).then(function () {
        const marsJSON = {
            name: appInfo.appName,
            changeset: appInfo.changeset,
            license: appInfo.license
        }
        const projectFile = path.join(options.directory, 'project.cfapp');
        const projectJSON = JSON.parse(fs.readFileSync(projectFile, 'utf8'));
        projectJSON.mars = marsJSON;
        fs.writeFileSync(projectFile, JSON.stringify(projectJSON), 'utf8');
    });
}

module.exports = downloadApp;