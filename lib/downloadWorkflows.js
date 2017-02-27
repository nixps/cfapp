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
 * @param {Object} parameters the command-line parameters
 * @param {String[]} workflows the names of the workflows to download
 */
function downloadWorkflows(api, parameters, workflows) {
    var remoteWorkflows = api.whitepaper.list().results;

    for(var i = 0; i < workflows.length; i++) {
        var workflowName = workflows[i];
        var workflowFilename = parameters.app + "/workflows/" + workflowName + '.cfwork';
        var hasWhitepaper = fs.existsSync(workflowFilename);

        if (parameters.overwrite !== true && hasWhitepaper) {
            console.log('skipping workflow: "%s" workflow exists', workflowName);
            continue;
        }

        console.log('downloading workflow: %s', workflowName);
        var remoteWorkflow = _.find(remoteWorkflows, function(w) {
            return w.name === workflowName;
        });

        if (remoteWorkflow === undefined) {
            console.log('remote workflow "%s" does not exist', workflowName);
            continue;
        }

        var workflowContents = api.whitepaper.download(remoteWorkflow._id).contents;
        fs.writeFileSync(workflowFilename, workflowContents);
    }
}


module.exports = downloadWorkflows;
