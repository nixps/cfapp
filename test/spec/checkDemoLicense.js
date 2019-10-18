'use strict'
const { assert } = require('chai');

const checkDemoLicense = require('../../lib/apps/checkDemoLicense');
const getMockLicenseAB = require('./mockData/productABLicense');
const getMockDemoLicense = require('./mockData/demoLicense');
const offsetToday = require('../util/offsetToday');

function checkDemoLicenseTests() {
    it('should return false when there demo license is missing', function () {
        assert.isFalse(checkDemoLicense(getMockLicenseAB(offsetToday(-5), offsetToday(5))), 'should have returned false if the demo license is missing');
    });

    it('should return true when there is a demo license product in the license', function () {
        assert.isTrue(checkDemoLicense(getMockDemoLicense(offsetToday(-5), offsetToday(5))), 'should have returned true if there is a demo license');
    });

    it('should return false when there is a demo license product, but expired', function () {
        assert.isFalse(checkDemoLicense(getMockDemoLicense(offsetToday(-15), offsetToday(-5))), 'should have returned false if there is a demo license but expired');
    });
}

module.exports = checkDemoLicenseTests