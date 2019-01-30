'use strict';
const ConsoleOutputStream = require('../../util/ConsoleOutputStream');

/**
 * Creates the workfows that were passed
 * @param workflows the jsons of the workflows to be added
 */
function addWorkflows (api, workflows, outputStream = new ConsoleOutputStream()) {
    for (const workflow of workflows) {
        outputStream.writeLine(`adding whitepaper: ${workflow.name}`);
        api.whitepaper.create(workflow);
    }
}

module.exports = addWorkflows;