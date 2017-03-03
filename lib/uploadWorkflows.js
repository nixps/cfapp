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
 * Uploads workflows to the remote Cloudflow
 * @param {String} api the api object to use for the upload
 * @param {Object} parameters the command-line parameters
 * @param {String[]} workflows the names of the workflows to upload
 */
function uploadWorkflows(api, parameters, workflows) {
    var whitepapers = api.whitepaper.list().results;
    var whitepaperNames = _.map(whitepapers, function(entry) {
        return entry.name;
    });

    for(var i = 0; i < workflows.length; i++) {
        var workflowName = workflows[i];
        var hasWhitepaper = whitepaperNames.indexOf(workflowName) >= 0;

        if (parameters.overwrite !== true && hasWhitepaper) {
            console.log('skipping workflow: "%s" workflow exists', workflowName);
            continue;
        }

        if (parameters.overwrite === true && hasWhitepaper) {
            var whitepaper = _.find(whitepapers, function(w) {
                return w.name === workflowName;
            });
            api.whitepaper.delete(whitepaper._id);
        }

        console.log('adding workflow: %s', workflowName);
        var workflowFile = fs.readFileSync(parameters.app + '/workflows/' + workflowName + '.cfqflow', 'utf8');
        var workflowJSON = JSON.parse(workflowFile);
        api.whitepaper.upload(workflowJSON);
    }
}


module.exports = uploadWorkflows;
