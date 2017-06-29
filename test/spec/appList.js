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
const cfapp = require('../../lib/cfapp');
const apiMock = require('cloudflow-api');


function listTests() {
    class NoApplicationSupportDelegate extends APIMockDelegate {}

    class ApplicationSupportDelegate extends APIMockDelegate {
        applicationList() {
            return [{
                name: 'hello',
                version: '0.0.1',
                description: 'test'
            },{
                name: 'world',
                version: '0.0.2',
                description: 'test2'
            }];
        }
    }

    it('get an error when there is no support for the application collection', function() {
        apiMock.mockDelegate = new NoApplicationSupportDelegate();

        assert.throws(function() {
            cfapp.apps.list();
        }, 'Unknown command', 'In case the "application" module is missing, an error must be thrown');
    });

    it('get a list of all installed applications', function() {
        apiMock.mockDelegate = new ApplicationSupportDelegate();

        const list = cfapp.apps.list();
        assert.isArray(list, 'The returned list of applications must be an array');
        assert(list.length === 2, 'There must be 2 applications');
    });

}

module.exports = listTests;
