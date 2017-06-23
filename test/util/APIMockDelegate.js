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
        this._uploadedWhitepapers = [];
        this._deletedWhitepapers = [];
        this._downloadedWhitepapers = [];
        this._deletedFiles = [];
        this._host = 'http://localhost:9090';
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
        this._uploadedWhitepapers.push(whitepaper);
    }

    get uploadedWhitepapers() {
        return this._uploadedWhitepapers;
    }

    whitepaperDeleted(whitepaper) {
        this._deletedWhitepapers.push(whitepaper);
    }

    get deletedWhitepapers() {
        return this._deletedWhitepapers;
    }

    get existingWhitepapers() {
        return [];
    }

    existingAssets(/*query*/) {
        return [];
    }

    existingFolders() {
        return [];
    }

    get deletedFiles() {
        return this._deletedFiles;
    }

    fileDeleted(file) {
        this._deletedFiles.push(file);
    }

    get downloadedWhitepapers() {
        return this._downloadedWhitepapers;
    }

    whitepaperDownloaded(whitepaper) {
        this._downloadedWhitepapers.push(whitepaper);
    }
}

module.exports = APIMockDelegate;
