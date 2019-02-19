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

/**
 * Returns the list of workflows with matching node ids
 * @param {} workflow The workflow JSON to match
 * @param {} workflowSet The set of workflows we want to match against
 * @param {} skipSelf set to true if the workflow itself should not be included in the result
 * @param {} skipTemplates set to true if template workflows should be skipped
 */
function getMatchingWorkflows(workflow, workflowSet, skipSelf, skipTemplates = true) {
    const wfNodes = _.map(workflow.nodes, (n) => n.id);
    const matching = [];
    for (const wf of workflowSet) {
        const otherWfNodes = _.map(wf.nodes, (n) => n.id);
        if (_.intersection(wfNodes, otherWfNodes).length > 0) {
            if (skipTemplates && wf.template !== undefined) {
                continue;
            }

            if (skipSelf === true && wf.name === workflow.name) {
                continue;
            }

            matching.push(wf);
        }
    }

    return matching;
}

module.exports = getMatchingWorkflows;