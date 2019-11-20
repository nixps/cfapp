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
        describe('remove', require('./spec/appRemove'));
        describe('update', require('./spec/appUpdate'));
        describe('init', require('./spec/appInit'));
        describe('project.cfapp validation', require('./spec/projectValidation'));
        describe('check license code', require('./spec/checkCode'));
        describe('check demo license', require('./spec/checkDemoLicense'));
        describe('CloudflowVersion', require('./spec/CloudflowVersion'));
    });

    describe('cfapp mars module', function() {
        describe('install', require('./spec/marsInstall'));
        describe('update', require('./spec/marsUpdate'));
        describe('remove', require('./spec/marsRemove'));
        describe('list', require('./spec/marsList'));
        describe('download', require('./spec/marsDownload'));
    });
});
