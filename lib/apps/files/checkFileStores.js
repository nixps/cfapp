/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

const _ = require('lodash');
const ConsoleOutputStream = require('../../util/ConsoleOutputStream.js');

/**
 * Check if all the file stores for the files are present
 * @param {String} api the api object to use for the upload
 * @param {String[]} files the Cloudflow file paths to check the file stores of
 */
function checkFileStores(api, files, outputStream = new ConsoleOutputStream()) {
    return new Promise(function(resolve, reject) {
        const app_filestores = [];
        const missing_filestores = [];
        const available_filestore = _.reduce(
            api.license.get().machines,
            (acc, machine) => _.concat(
                acc,
                _.map((() => {
                    try {
                        return api.portal.get_file_store_mappings(machine.name.toUpperCase()).mappings;
                    } catch(e) {
                        return [];
                    }
                })(), (mapping) => mapping.file_store)
            ),
            []
        );
        for(let i = 0, len = files.length; i < len; i++) {
            if(!_.some(app_filestores, (filestore) => filestore === files[i].file_store)) {
                app_filestores.push(files[i].file_store);
                if(!_.some(available_filestore, (filestore) => filestore === files[i].file_store)) {
                    missing_filestores.push(files[i].file_store);
                }
            }
        }

        resolve(missing_filestores);
    });
}

module.exports = checkFileStores;
