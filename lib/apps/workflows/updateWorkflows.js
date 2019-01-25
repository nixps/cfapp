'use strict';
const ConsoleOutputStream = require('../../util/ConsoleOutputStream');

/**
 * Creates the workfows that were passed
 * @param workflows an array of pairs {remoteFlow, newFlow} of workflows to update
 */
function updateWorkflows (api, workflowPairs, outputStream = new ConsoleOutputStream()) {
    for (const pair of workflowPairs) {
        const {remoteFlow, newFlow} = pair;

        const saveId = remoteFlow.save_id;
        newFlow.save_id = saveId;
        const objectId = remoteFlow._id;
        newFlow._id = objectId;
        outputStream.writeLine(`updating whitepaper: ${remoteFlow.name}`)
        api.whitepaper.update(newFlow);
    }
}

module.exports = updateWorkflows;