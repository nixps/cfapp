'use strict'
const { assert } = require('chai');

const checkCode = require('../../lib/apps/checkCode');
const getMockLicenseAB = require('./mockData/productABLicense');
const offsetToday = require('../util/offsetToday');

function checkCodeTests() {
    it('should return false when the code is missing', function () {
        const startDate = offsetToday(-5);
        const endDate = offsetToday(5);
        assert.isFalse(checkCode(getMockLicenseAB(startDate, endDate), 'mars-codec'), 'got true when the license code is missing');
    });

    it('should return true when the code is in the license and not expired', function () {
        const startDate = offsetToday(-5);
        const endDate = offsetToday(5);
        assert.isTrue(checkCode(getMockLicenseAB(startDate, endDate), 'mars-codea'), 'got false when the license code is valid');
    });

    it('should return true when the code is in the license and has no time limit', function () {
        const startDate = offsetToday(-5);
        const endDate = offsetToday(5);
        assert.isTrue(checkCode(getMockLicenseAB(startDate, endDate), 'mars-codeb'), 'got false when the license code is valid');
    });

    it('should return false when the code is present but expired', function () {
        const startDate = offsetToday(-15);
        const endDate = offsetToday(-5);
        assert.isFalse(checkCode(getMockLicenseAB(startDate, endDate), 'mars-codea'), 'got false when the license code is valid');
    });
}

module.exports = checkCodeTests