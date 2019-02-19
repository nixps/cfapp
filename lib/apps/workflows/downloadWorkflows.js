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

const ConsoleOutputStream = require('../../util/ConsoleOutputStream.js');
const { RemoteWorkflowDoesNotExistError } = require('../Errors.js');

/**
 * Downloads workflows from the remote Cloudflow
 * @param {String} api the api object to use for the download
 * @param {CloudflowApplication} app the Cloudflow application
 * @param {boolean} overwrite if true, the local workflows are overwritten
 */
function downloadWorkflows(api, app, overwrite = false, outputStream = new ConsoleOutputStream()) {
    const remoteWorkflows = api.whitepaper.list().results;

    for(const name of app.workflows) {
        var workflowFilename = `${app.folder}/workflows/${name}.cfqflow`;
        var hasWhitepaper = fs.existsSync(workflowFilename);

        if (overwrite !== true && hasWhitepaper) {
            outputStream.writeLine(`skipping workflow: "${name}" workflow exists`);
            continue;
        }

        outputStream.writeLine(`downloading workflow: ${name}`);
        var remoteWorkflow = _.find(remoteWorkflows, function (w) {
            // Download the non-template matching workflows
            return w.name === name && w.template === undefined;
        });

        if (remoteWorkflow === undefined) {
            outputStream.writeLine(`remote workflow "${name}" does not exist`);
            throw new RemoteWorkflowDoesNotExistError(name);
        }

        const workflowContents = JSON.stringify(api.whitepaper.get(remoteWorkflow._id));
        fs.writeFileSync(workflowFilename, workflowContents);
    }
}


module.exports = downloadWorkflows;
