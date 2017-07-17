/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

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

        // Do a conversion if we get a system path
        if (path.indexOf('cloudflow://') < 0) {
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

        const path = decodeURI(this._path.substr('cloudflow://'.length));
        return `${this._appFolder}/files/${path}`;
    }

    /**
     * Returns the Cloudflow path
     */
    get cloudflow() {
        return this._path;
    }
}


module.exports = CloudflowPath;
