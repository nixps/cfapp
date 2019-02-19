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
 * Returns true if the workflow can updated without breaking all the workables
 * @param {*} oldFlow the workflow that is in the remote cloudflow
 * @param {*} newFlwo the workflow that needs to replace the old one 
 */ 
function checkWorkflowUpdateable (oldFlow, newFlow) {
    const oldNodeIds = oldFlow.nodes.map(n => n.id);
    const newNodeIds = newFlow.nodes.map(n => n.id);

    const intersection = _.intersection(oldNodeIds, newNodeIds);

    return intersection.length > 0;
}

module.exports = checkWorkflowUpdateable;