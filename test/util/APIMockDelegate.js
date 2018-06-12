/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

/**
 * Override this class to change the behavior of the APIMock
 */
class APIMockDelegate {
    constructor() {
        this._createSessionRequest = null;
        this.uploadedWhitepapers = [];
        this.deletedWhitepapers = [];
        this.downloadedWhitepapers = [];
        this.deletedFiles = [];
        this.deletedFolders = [];
        this._host = 'http://localhost:9090';
        this.createdSessions = [];

        this.createdApplications = [];
        this.deletedApplications = [];
        this.createdFolders = [];
    }

    get supportsApplications() {
        return false;
    }

    get host() {
        return this._host;
    }

    set host(value) {
        this._host = value;
    }

    get address() {
        return `${this._host}/portal.cgi`;
    }

    whitepaperUploaded(whitepaper) {
        this.uploadedWhitepapers.push(whitepaper);
    }

    whitepaperDeleted(whitepaper) {
        this.deletedWhitepapers.push(whitepaper);
    }

    existingWhitepapers(/*query*/) {
        return [];
    }

    doesExist(url) {
        return {
            exists: false,
            is_folder: false,
            url: url,
            valid: true
        };
    }

    existingAssets(/*query*/) {
        return [];
    }

    existingFolders() {
        return [];
    }

    fileDeleted(file) {
        this.deletedFiles.push(file);
    }

    folderDeleted(url) {
        this.deletedFolders.push(url);
    }

    whitepaperDownloaded(whitepaper) {
        this.downloadedWhitepapers.push(whitepaper);
    }

    applicationList() {
        if (! this.supportsApplications) {
            throw new Error('Unknown command');
        }

        return [];
    }

    applicationCreated(app) {
        if (! this.supportsApplications) {
            throw new Error('Unknown command');
        }

        this.createdApplications.push(app);
    }

    applicationDeleted(appID) {
        if (! this.supportsApplications) {
            throw new Error('Unknown command');
        }

        this.deletedApplications.push(appID);
    }

    sessionCreated(login, password) {
        this.createdSessions.push({
            login: login,
            password: password
        });
    }

    folderCreated (folder) {
        this.createdFolders.push(folder);
    }
}

module.exports = APIMockDelegate;
