/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

const path = require('path');
const Errors = require('./Errors.js');

/**
 * Representation of a Cloudflow path that is part of a Cloudflow app
 */
class CloudflowPath {

    /**
     * Constructs a Cloudflow path
     * @param {path} string the path itself, can be a filesystem path or a Cloudflow path
     * @param {appFolder} string the root path of the Cloudflow application
     */
    constructor(path, appFolder = null) {
        this._appFolder = appFolder;
        this._path = path;
        this._cloudflowIn = true;

        // Do a conversion if we get a system path
        if (path.indexOf('cloudflow://') < 0) {
            this._cloudflowIn = false;

            if (typeof appFolder !== 'string' || appFolder.length === 0) {
                throw new Errors.CannotConvertFolderError();
            }

            const part = path.substr(`${appFolder}/files/`.length);
            this._path = `cloudflow://${part}`;
        }
    }

    /**
     * Returns the filesystem path
     */
    get fs() {
        if (typeof this._appFolder !== 'string' || this._appFolder.length === 0) {
            throw new Errors.CannotConvertFolderError();
        }

        if (this._cloudflowIn === true) {
            const encodedPath = this._path.substr('cloudflow://'.length);
            const path = decodeURIComponent(encodedPath);
            return `${this._appFolder}/files/${path}`;
        } else {
            const unencodedPath = this._path.substr('cloudflow://'.length);
            return `${this._appFolder}/files/${unencodedPath}`;
        }
    }

    /**
     * Returns the Cloudflow path
     */
    get cloudflow () {
        if (this._cloudflowIn === false) {
            const unencodedPath = this._path.substr('cloudflow://'.length);
            const parts = unencodedPath.split('/').map((p) => encodeURIComponent(p)).join('/');
            return `cloudflow://${parts}`;
        }
        return this._path;
    }

    /**
     * Returns the file store from the path
     */
    get file_store () {
        return this.cloudflow.split("//")[1].split("/")[0];
    }
}


module.exports = CloudflowPath;
