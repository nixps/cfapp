'use strict';
const ConsoleOutputStream = require('../../util/ConsoleOutputStream');

/**
 * Removes the passed workflwos
 * @param workflowNames the names of the workflows that should be removed
 */
function removeWorkflows (api, workflowNames, outputStream = new ConsoleOutputStream()) {
    for (const workflowName of workflowNames) {
        const result = api.whitepaper.list(['name', 'equal to', workflowName], [ '_id' ]);
        if (Array.isArray(result.results) === false || result.results.length === 0) {
            outputStream.writeLine(`whitepaper "${workflowName}" does not exist anymore`);
            continue;
        }
    
        outputStream.writeLine(`removing whitepaper: ${workflowName}`);
        api.whitepaper.delete(result.results[0]._id);
    }
}

module.exports = removeWorkflows;