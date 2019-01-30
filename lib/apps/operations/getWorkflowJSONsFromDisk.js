'use strict';
const fs = require('fs');

const Errors = require('../Errors');

function getWorkflowJSONsFromDisk(app, workflowNames) {
    const workflowJSONs = [];

    for (const wfName of workflowNames) {
        const workflowFSPath = `${app.folder}/workflows/${wfName}.cfqflow`;
        if (fs.existsSync(workflowFSPath) === false) {
            throw new Errors.CannotFindCFAppWorkflowError(wfName, workflowFSPath);
        }
    
        const workflowFile = fs.readFileSync(workflowFSPath, 'utf8');
        const workflowJSON = JSON.parse(workflowFile);
        workflowJSONs.push(workflowJSON);
    }

    return workflowJSONs;
}

module.exports = getWorkflowJSONsFromDisk;