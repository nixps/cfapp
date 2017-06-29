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
const CloudflowApplication = require('./CloudflowApplication');

/**
 * Looks up the CFApp in the root folder, if missing it looks in the subfolders
 * for CFApps.
 * @param {string} folder the folder to scan
 * @return {array} the array of CFApps that were found
 */
function findCFApps(folder) {
    const cfApps = [];

    // First check if there is a project.cfapp
    if (fs.existsSync(`${folder}/project.cfapp`) === true) {
        cfApps.push(CloudflowApplication.fromFolder(`${folder}`));
    }
    else {
        const files = fs.readdirSync(folder);
        for(const file of files) {
            if (fs.existsSync(`${folder}/${file}/project.cfapp`) === false) {
                continue;
            }

            cfApps.push(CloudflowApplication.fromFolder(`${folder}/${file}`));
        }
    }

    return cfApps;
}

module.exports = findCFApps;
