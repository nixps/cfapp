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

class ClientReadyDelegate extends ApplicationSupportDelegate {
    existingWhitepapers(query) {
        if (query[2] === 'Mars Client Flow') {
            return [{
                _id: 'the mars client flow id',
                nodes: [{
                    collar: 'collar1',
                },{
                    collar: 'collar1',
                },{
                    collar: 'collar2',
                }]
            }]
        }

        return [];
    }

    getBlueCollarDefinitions(query) {
        return [{
            identifier: 'collar1',
        },{
            identifier: 'collar1',
        },{
            identifier: 'collar2',
        }];
    }
}

class MARSWorkableFailedDelegate extends ClientReadyDelegate {
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

class MARSApplicationInstalled extends ClientReadyDelegate {
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

class MARSWorkableNeverFinishes extends MARSApplicationInstalled {
    getWorkableProgress (workableId) {
        return {
            done: false
        }
    }
}

function marsRemoveTests() {
    describe('default parameters', function () {
        it('should remove an installed mars application', function () {
            const outputStream = new JSONOutputStream();
            const delegate = new MARSApplicationInstalled();
            apiMock.mockDelegate = delegate

            // marsListMock(require('./mockData/listApplications.json'));
            // marsDetailsMock(require('./mockData/applicationDetails.json'));

            return cfapp.mars.remove('co-code-installedapp', false, {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin'
            }, outputStream).then(function () {
                const deletedApplications = delegate.deletedApplicationsByQuery;
                assert.lengthOf(deletedApplications, 1, 'one application should be removed');
                assert.sameOrderedMembers(
                    deletedApplications[0], 
                    ['name', 'equal to', 'co-code-installedapp'], 
                    'the correct query should be passed to remove an application');
            }).catch(function (error) {
                assert.fail(undefined, undefined, 'the removal should not fail');
            });
        });

        it('should not error when the application is not installed', function () {
            const outputStream = new JSONOutputStream();
            const delegate = new ClientReadyDelegate();
            apiMock.mockDelegate = delegate;

            return cfapp.mars.remove('co-code-installedapp', false, {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin'
            }, outputStream).then(function () {
                const deletedApplications = delegate.deletedApplicationsByQuery;
                assert.lengthOf(deletedApplications, 1, 'one application should be removed');
                assert.sameOrderedMembers(
                    deletedApplications[0], 
                    ['name', 'equal to', 'co-code-installedapp'], 
                    'the correct query should be passed to remove an application');
            }).catch(function (error) {
                assert.fail(undefined, undefined, 'the removal should not fail');
            });
        });
    });

    describe('custom timeout', function () {
        it('throws a CFAPPERR500 when the MARS operation took longer than the timeout limit', function () {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new MARSWorkableNeverFinishes();
    
            marsListMock(require('./mockData/listApplications.json'));
            marsDetailsMock(require('./mockData/applicationDetails.json'));
    
            return cfapp.mars.remove('co-code-installedapp', true, {
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

        it('throws a CFAPPERR508 when Cloudflow is still not ready after passed timeout', function () {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new ApplicationSupportDelegate();
    
            return cfapp.mars.remove('co-code-installedapp', true, {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin',
                timeout: 1
            }, outputStream).then(function () {
                assert.fail(undefined, undefined, 'the command should throw an error');
            }).catch(function (error) {
                assert.equal('Timeout while waiting on Cloudflow to be ready for MARS requests (CFAPPERR508)', error.message);
                assert.equal('CFAPPERR508', error.errorCode);
            });
        });
    });    
}

module.exports = marsRemoveTests;
