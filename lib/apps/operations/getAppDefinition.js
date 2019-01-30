'use strict';
const Errors = require('../Errors');

function getAppDefinition(api, appName) {
    const appResults = api.registry.cfapp.list(['name', 'equal to', appName]);
    if (Array.isArray(appResults.results) === false || appResults.results.length  === 0) {
        throw new Errors.ApplicationNotInstalledError(appName);
    }

    return appResults.results[0];
}

module.exports = getAppDefinition;