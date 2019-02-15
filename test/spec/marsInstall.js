/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

const { assert } = require('chai');

const APIMockDelegate = require('../util/APIMockDelegate');
const apiMock = require('cloudflow-api');
const cfapp = require('../../lib/cfapp');
const JSONOutputStream = require('../../lib/util/JSONOutputStream');

const marsListMock = require('../util/MARSListMock.js');
const marsDetailsMock = require('../util/MARSDetailsMock.js');

class ApplicationSupportDelegate extends APIMockDelegate {
    get supportsApplications() {
        return true;
    }

    applicationList() {
        return [];
    }
}

class MARSWorkableFailedDelegate extends ApplicationSupportDelegate {
    getWorkable (workableId) {
        return {
            state: 'error',
            log: [],
            variables: {
                processInfo: {
                    error: true,
                    errorCode: 'CFAPPERR003',
                    errorMessage: 'hello'
                }
            }
        };
    }
}

class MARSApplicationInstalled extends ApplicationSupportDelegate {
    applicationList(query) {
        if (query[2] !== 'co-code-installedapp') {
            return [];
        }
        return [{
            _id: 'co-code-installedappid',
            name: 'co-code-installedapp',
            host: 'http://localhost:9090',
            version: '0.0.1',
            login: 'admin',
            password: 'admin',
            description: 'A test for downloading an application',
    
            files: [
                'cloudflow://PP_FILE_STORE/DemoApp/images/',
                'cloudflow://PP_FILE_STORE/DemoApp/index.html',
            ],
    
            workflows: [
                'Workflow1',
                'Workflow2', 
                'ProcessOrder'
            ]
        }]
    }
}

class MARSWorkableNeverFinishes extends ApplicationSupportDelegate {
    getWorkableProgress (workableId) {
        return {
            done: false
        };
    }
}

function marsInstallTests() {
    describe('default parameters', function () {
        it('should install a mars application', function () {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new ApplicationSupportDelegate();

            marsListMock(require('./mockData/listApplications.json'));
            marsDetailsMock(require('./mockData/applicationDetails.json'));

            return cfapp.mars.install('co-code-installedapp', {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin'
            }, outputStream).then(function () {
            }).catch(function () {
                assert.fail(undefined, undefined, 'the installation should not fail');
            });
        });

        it('should fail when the mars server failed', function () {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new MARSWorkableFailedDelegate();

            marsListMock(require('./mockData/listApplications.json'));
            marsDetailsMock(require('./mockData/applicationDetails.json'));

            return cfapp.mars.install('co-code-installedapp', {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin'
            }, outputStream).then(function () {
                assert.fail(undefined, undefined, 'the installation should not succeed');
            }).catch(function (error) {
                assert.notEqual('the installation should not succeed', error.message);
                assert.equal('CFAPPERR505', error.errorCode);
            });
        });

        it('should not allow to install an already installed application', function () {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new MARSApplicationInstalled();

            marsListMock(require('./mockData/listApplications.json'));
            marsDetailsMock(require('./mockData/applicationDetails.json'));

            return cfapp.mars.install('co-code-installedapp', {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin'
            }, outputStream).then(function () {
                assert.fail(undefined, undefined, 'the installation should not succeed');
            }).catch(function (error) {
                assert.notEqual('the installation should not succeed', error.message);
                assert.equal('CFAPPERR002', error.errorCode);
            });
        });
    });

    describe('custom timeout', function () {
        it('throws a CFAPPERR500 when the MARS operation took longer than the timeout limit', function () {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new MARSWorkableNeverFinishes();
            
            marsListMock(require('./mockData/listApplications.json'));
            marsDetailsMock(require('./mockData/applicationDetails.json'));
    
            return cfapp.mars.install('co-code-installedapp', {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin',
                timeout: 1
            }, outputStream).then(function () {
                assert.fail(undefined, undefined, 'the command should throw an error');
            }).catch(function (error) {
                assert.equal('Timeout while waiting on operation completion (CFAPPERR500)', error.message);
                assert.equal('CFAPPERR500', error.errorCode);
            });
        });
    });
}

module.exports = marsInstallTests;
