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

function marsInstallTests() {
    describe('default parameters', function () {
        it('should list all mars applications', function () {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new ClientReadyDelegate();

            marsListMock(require('./mockData/listApplications.json'));
            marsDetailsMock(require('./mockData/applicationDetails.json'));

            return cfapp.mars.list({
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin'
            }, outputStream).then(function (result) {
                const list = require('./mockData/listApplications.json');
                assert.deepEqual(list.results, result, 'the list call should return the same as the mock data');
            }).catch(function (error) {
                console.log(error)
                assert.fail(undefined, undefined, 'the list call should not fail');
            });
        });
    });
}

module.exports = marsInstallTests;
