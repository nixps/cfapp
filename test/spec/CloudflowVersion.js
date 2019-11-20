'use strict'
const { assert } = require('chai');
const CloudflowVersion = require('../../lib/apps/CloudflowVersion')
const {InvalidCloudflowVersionError} = require('../../lib/apps/Errors');
const APIMockDelegate = require('../util/APIMockDelegate');
const apiMock = require('cloudflow-api');

function cloudflowVersionTests () {
    describe('construction', function () {
        it('should create a new instance with a cloudflow triplet', function () {
            const version = new CloudflowVersion(19, 2, 1);
            assert.equal(version.asString(), '19.2 update 1', 'version is not initialized correctly');
        });
    
        describe('from api', function () {
            const api = apiMock.getSyncAPI('http://localhost:9090');

            it('should create a Cloudflow version for the running Cloudflow version', async function () {
                const version = await CloudflowVersion.fromApi(api);
                assert.equal(version.asString(), '19.2 update 2', 'version is not initialized correctly');
            });
        });

        describe('from string triplet', function () {
            it('should create a version from a string triplet', function () {
                const version = CloudflowVersion.fromTriplet('19.2.1');
                assert.equal(version.asString(), '19.2 update 1', 'version is not initialized correctly');
            });
    
            it('should throw an error when the triplet is not valid', function () {
                assert.throws(function () {
                    CloudflowVersion.fromTriplet('19.2');
                }, InvalidCloudflowVersionError, undefined, 'an invalid version triplet should have thrown');
            });
        });
    });

    describe('asString', function () {
        it('should return a string representation of the version number', function () {
            const version1 = CloudflowVersion.fromTriplet('20.2.1')
            assert.equal(version1.asString(), '20.2 update 1', 'incorrect string representation of Cloudflow version');
            const version2 = CloudflowVersion.fromTriplet('20.2.0')
            assert.equal(version2.asString(), '20.2', 'incorrect string representation of Cloudflow version');
        });
    });

    describe('comparing', function () {
        const versionA = CloudflowVersion.fromTriplet('19.8.2');
        const versionB = CloudflowVersion.fromTriplet('20.2.2');

        describe('gt', function () {
            it('should return true if the current version is more recent', function () {
                assert.isTrue(versionB.gt(versionA), `"${versionB.asString()}" > "${versionA.asString()}" is false`);
            })
    
            it('should return false if the current version is older or the same', function () {
                assert.isFalse(versionB.gt(versionB), `"${versionB.asString()}" > "${versionB.asString()}" is true`);
                assert.isFalse(versionA.gt(versionB), `"${versionA.asString()}" > "${versionB.asString()}" is true`);
            })
        });
    
        describe('gte', function () {
            it('should return true if the current version is more recent or the same', function () {
                assert.isTrue(versionB.gte(versionA), `"${versionB.asString()}" >= "${versionA.asString()}" is false`);
                assert.isTrue(versionB.gte(versionB), `"${versionB.asString()}" >= "${versionB.asString()}" is true`);
            })
    
            it('should return false if the current version is older', function () {
                assert.isFalse(versionA.gte(versionB), `"${versionA.asString()}" >= "${versionB.asString()}" is true`);
            })
        });
    
        describe('lt', function () {
            it('should return true if the current version is older', function () {
                assert.isTrue(versionA.lt(versionB), `"${versionA.asString()}" < "${versionB.asString()}" is false`);
            })
    
            it('should return false if the current version is more recent or the same', function () {
                assert.isFalse(versionB.lt(versionB), `"${versionB.asString()}" > "${versionB.asString()}" is true`);
                assert.isFalse(versionB.lt(versionA), `"${versionB.asString()}" < "${versionA.asString()}" is true`);
            })
        });
    
        describe('lte', function () {
            it('should return true if the current version is older or the same', function () {
                assert.isTrue(versionA.lte(versionB), `"${versionA.asString()}" <= "${versionB.asString()}" is false`);
                assert.isTrue(versionB.lte(versionB), `"${versionB.asString()}" <= "${versionB.asString()}" is true`);
            })
    
            it('should return false if the current version is more recent', function () {
                assert.isFalse(versionB.lte(versionA), `"${versionB.asString()}" <= "${versionA.asString()}" is true`);
            })
        });
    });
}

module.exports = cloudflowVersionTests