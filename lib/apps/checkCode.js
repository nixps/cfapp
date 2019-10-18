'use strict';
const _ = require('lodash');

/**
 * Checks the license code given the license data, returns true if the code is present
 * @param {*} pLicenseData the license data returned by api.license.get()
 * @param {*} pLicenseCode the license code to check
 */
function checkCode (pLicenseData, pLicenseCode) {
    var data = pLicenseData;
    
    if ((_.isObject(data) === false) || (data.machines === undefined)) {
        return false;
    }
    
    var now = Date.now() / 1000;
    for (var countMachine = 0; countMachine < data.machines.length; ++countMachine) {
        var machine = data.machines[countMachine];
    
        for (var countLicense = 0; countLicense < machine.licenses.length; ++countLicense) {
            var license = machine.licenses[countLicense];
            if (license.code === pLicenseCode) {
                var ok = true;
                if ((license.start !== undefined) && (license.start > now)) {
                    ok = false;
                }
                if ((license.start !== undefined) && (license.end < now)) {
                    ok = false;
                }
                if (ok) {
                    return true;
                }
            }
        }
    }
    
    // If there is no distributed array, we don't have this license
    if (_.isArray(data.distributed) === false) {
        return false;
    }
    
    for (var countLicense = 0; countLicense < data.distributed.length; ++countLicense) {
        var license = data.distributed[countLicense];
        if (license.code === pLicenseCode) {
            var ok = true;
            if ((license.start !== undefined) && (license.start > now)) {
                ok = false;
            }
            if ((license.start !== undefined) && (license.end < now)) {
                ok = false;
            }
            if (ok) {
                return true;
            }
        }
    }
    
    return false;
}

module.exports = checkCode;