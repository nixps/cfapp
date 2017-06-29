/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

const fs = require('fs');
const _ = require('lodash');
const CloudflowPath = require('./CloudflowPath');

/**
 * List all files in a directory in Node.js recursively in a synchronous fashion
 * @param {String} dir the root directory
 * @param {String[]} [filelist] the list of items in that directory so far (used for recursion)
 */
function walkSync(dir, filelist) {
    dir = dir.replace(/\/$/, '');

    var files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(dir + '/' + file).isDirectory()) {
            walkSync(dir + '/' + file, filelist);
        }
        else {
            filelist.push(dir + '/' + file);
        }
    });
    return filelist;
}

/**
 * Describes a Cloudflow Application
 * Keeps track of the parameters and directory
 */
class CloudflowApplication {
    constructor(folder) {
        this._projectFile = `${folder}/project.cfapp`;
        this._folder = folder;
        this._projectJSON = null;
    }

    get folder() {
        return this._folder;
    }

    /**
     *  returns the json for this application as saved on disk
     */
    get projectJSON() {
        if (this._projectJSON === null) {
            this._projectJSON = JSON.parse(fs.readFileSync(this._projectFile, 'utf8'));
        }

        return this._projectJSON;
    }

    /**
     * returns the expanded json as it will be stored on the Cloudflow server
     */
    get expandedJSON() {
        return {
            name: this.name,
            description: this.description,
            version: this.version,
            workflows: this.workflows,
            files: this.files.map(f => f.cloudflow),
            installedFiles: this.getFilesToUpload().map(f => f.cloudflow)
        };
    }

    get name() {
        return this.projectJSON.name;
    }

    get description() {
        return this.projectJSON.description;
    }

    get host() {
        return this.projectJSON.host;
    }

    get version() {
        return this.projectJSON.version || 'no version';
    }

    get login() {
        return this.projectJSON.login;
    }

    get password() {
        return this.projectJSON.password;
    }

    get workflows() {
        if (Array.isArray(this.projectJSON.workflows) === false) {
            return [];
        }
        return this.projectJSON.workflows;
    }

    get files() {
        if (Array.isArray(this.projectJSON.files) === false) {
            return [];
        }
        return this.projectJSON.files.map((path) => {
            return new CloudflowPath(path, this.folder);
        });
    }

    getFilesToUpload() {
        let expandedPaths = [];

        for(const cfPath of this.files) {
            const fsPath = cfPath.fs;

            // Needs expansion
            if (fs.statSync(fsPath).isDirectory()) {
                const items = walkSync(fsPath);
                expandedPaths = _.concat(expandedPaths, items);
            }
            else {
                expandedPaths.push(fsPath);
            }
        }

        expandedPaths = _.uniq(expandedPaths);

        return expandedPaths.map((fsPath) => {
            return new CloudflowPath(fsPath, this.folder);
        });
    }

    /**
     * Returns all the files to download from the remote accessed by the passed
     * api object.
     * @param {portal_api_base} api the remote api for the expansion
     */
    getFilesToDownload(api) {
        const expandedPaths = [];

        for(const cfPath of this.files) {
            var folders = api.folder.list(['cloudflow.folder', 'begins with', cfPath.cloudflow]).results;
            var isFolder = folders.length > 0;

            if (isFolder) {
                var assets = api.asset.list(['cloudflow.enclosing_folder','begins with', cfPath.cloudflow]).results;
                for(const asset of assets) {
                    var cloudflowPath = asset.cloudflow.file;
                    if (expandedPaths.indexOf(cloudflowPath) < 0) {
                        expandedPaths.push(cloudflowPath);
                    }
                }
            }
            else {
                expandedPaths.push(cfPath.cloudflow);
            }
        }

        return expandedPaths.map((fsPath) => {
            return new CloudflowPath(fsPath, this.folder);
        });
    }


    /**
     * returns true if the app is already installed on the server
     */
    isInstalled(api) {
        const appResults = api.registry.cfapp.list(['name', 'equal to', this.name]);
        return appResults.results && Array.isArray(appResults.results) && appResults.results.length > 0;
    }


    /**
     * Returns the installed version on the server, 'no version' in case it is installed but not versioned
     */
    getInstalledVersion(api) {
        const appResults = api.registry.cfapp.list(['name', 'equal to', this.name]);
        const appJSON = appResults.results[0];
        return (appJSON.version || 'no version');
    }
}

module.exports = CloudflowApplication;
