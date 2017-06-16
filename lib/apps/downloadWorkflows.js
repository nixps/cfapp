/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

var fs = require('fs');
var _ = require('lodash');


/**
 * Downloads workflows from the remote Cloudflow
 * @param {String} api the api object to use for the download
 * @param {CloudflowApplication} app the Cloudflow application
 * @param {boolean} overwrite if true, the local workflows are overwritten
 */
function downloadWorkflows(api, app, overwrite = false) {
    const remoteWorkflows = api.whitepaper.list().results;

    for(const name of app.workflows) {
        var workflowFilename = `${app.folder}/workflows/${name}.cfqflow`;
        var hasWhitepaper = fs.existsSync(workflowFilename);

        if (overwrite !== true && hasWhitepaper) {
            console.log(`skipping workflow: "${name}" workflow exists`);
            continue;
        }

        console.log(`downloading workflow: ${name}`);
        var remoteWorkflow = _.find(remoteWorkflows, function(w) {
            return w.name === name;
        });

        if (remoteWorkflow === undefined) {
            console.log(`remote workflow "${name}" does not exist`);
            continue;
        }

        const workflowContents = api.whitepaper.download(remoteWorkflow._id).contents;
        fs.writeFileSync(workflowFilename, workflowContents);
    }
}


module.exports = downloadWorkflows;
