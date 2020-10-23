'use strict';
const _ = require('lodash');

/**
 * Checks the license code given the license data, returns true if the code is present
 * @param {*} pLicenseData the license data returned by api.license.get()
 */
function checkDemoLicense (pLicenseData) {
    const data = pLicenseData;
    const now = new Date().toISOString().split('.')[0] + 'Z';
    
    if ((_.isObject(data) === false) || (data.products === undefined)) {
        return false;
    }

    if (data.products.sites === undefined) {
        return false;
    }

    const sites = Object.values(data.products.sites);
    for (let site of sites) {
        const workservers = Object.values(site);
        const workserverProducts = Object.values(workservers);
        const allProducts = [].concat.apply([], workserverProducts);
        const containsDemoLicense = allProducts.find((p) => {
            const {name, interval} = p;
            if (name.toLowerCase() !== 'demo license') {
                return false;
            }

            if (Array.isArray(interval)) {
                if (interval[0] && interval[0] > now) {
                    return false;
                }

                if (interval[1] && interval[1] < now) { 
                    return false;
                }
            }

            return true;
        });

        if (containsDemoLicense !== undefined) {
            return true;
        }
    }

    return false;
}

module.exports = checkDemoLicense;