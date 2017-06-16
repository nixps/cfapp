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

/**
 * Uploads workflows to the remote Cloudflow
 * @param {String} api the api object to use for the upload
 * @param {CloudflowApplication} app the Cloudflow application
 * @param {boolean} overwrite if true, the remote workflows are overwritten
 */
function uploadWorkflows(api, app, overwrite = false) {
    const remoteWhitepapers = api.whitepaper.list().results;
    const remoteWhitepaperNames = _.map(remoteWhitepapers, function(entry) {
        return entry.name;
    });

    for(const name of app.workflows) {
        const remoteHasWhitepaper = remoteWhitepaperNames.indexOf(name) >= 0;

        if (overwrite !== true && remoteHasWhitepaper) {
            console.log(`skipping workflow: ${name} workflow exists`);
            continue;
        }

        if (overwrite === true && remoteHasWhitepaper) {
            var remoteWhitepaper = _.find(remoteWhitepapers, function(w) {
                return w.name === name;
            });
            api.whitepaper.delete(remoteWhitepaper._id);
        }

        console.log(`adding workflow: ${name}`);
        const workflowFile = fs.readFileSync(`${app.folder}/workflows/${name}.cfqflow`, 'utf8');
        const workflowJSON = JSON.parse(workflowFile);
        api.whitepaper.upload(workflowJSON);
    }
}


module.exports = uploadWorkflows;
