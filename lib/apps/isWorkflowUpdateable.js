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