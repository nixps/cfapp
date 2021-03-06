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
        this.createdWhitepapers = [];
        this.updatedWhitepapers = [];
        this.uploadedWhitepapers = [];
        this.deletedWhitepapers = [];
        this.downloadedWhitepapers = [];
        this.downloadedGetWhitepapers = [];
        this.deletedFiles = [];
        this.deletedFolders = [];
        this._host = 'http://localhost:9090';
        this.createdSessions = [];
        this.createdWorkables = [];

        this.createdApplications = [];
        this.deletedApplications = [];
        this.deletedApplicationsByQuery = [];
        this.createdFolders = [];
    }

    getVersion () {
        return {
            build: 'cloudflow_version',
            major: 19,
            minor: 2,
            rev: 2
        };
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

    whitepaperGet(whitepaper) {
        this.downloadedGetWhitepapers.push(whitepaper);
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

    fileDeletedError(file) {
        return false;
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

    applicationDeletedByQuery(query) {
        if (! this.supportsApplications) {
            throw new Error('Unknown command');
        }

        this.deletedApplicationsByQuery.push(query);
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

    whitepaperCreated (whitepaper) {
        this.createdWhitepapers.push(JSON.parse(JSON.stringify(whitepaper)));
    }

    whitepaperUpdated (whitepaper) {
        this.updatedWhitepapers.push(JSON.parse(JSON.stringify(whitepaper)));
    }

    workableCreated(whitepaper, input, variables) {
        this.createdWorkables.push(JSON.parse(JSON.stringify({
            whitepaper,
            input,
            variables
        })));
    }

    createNewWorkable (whitepaper, input, variables) {
        this.workableCreated(whitepaper, input, variables);
        return {
            workable_id: 'success'
        }
    }

    getWorkableProgress (workableId) {
        return {
            done: true
        };
    }

    getWorkable (workableId) {
        return {
            state: 'success',
            log: [],
            variables: {}
        };
    }

    listWorkables (query, fields) {
        return [];
    }

    getBlueCollarDefinitions (query) {
        return [];
    }

    getLicense () {
        return {
            current_site: 'Demo1',
            customer_code: 'be-test',
            machines: [{
                name: "pp_work_server"
            }]
        };
    }

    getFileStoreMappings (workserver) {
        return {
            mappings: [{
                file_store: "PP_FILE_STORE"
            }]
        };
    }
}

module.exports = APIMockDelegate;
