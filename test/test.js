/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

const mock = require('mock-require');
const nock = require('nock');

const APIMock = require('./util/APIMock');
const apiMock = new APIMock();
mock('cloudflow-api', apiMock);

describe('cfapp tests', function() {

    afterEach(function() {
        nock.cleanAll();
    });

    describe('cfapp application module', function() {

        describe('upload', require('./spec/appUpload'));
        describe('download', require('./spec/appDownload'));
        describe('list', require('./spec/appList'));
    });
});
