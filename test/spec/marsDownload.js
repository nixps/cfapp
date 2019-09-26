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
const marsDownloadUrlMock = require('../util/MARSDownloadUrlMock.js');

const fs = require('fs');
const remove = require('remove');
const path = require('path');

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

function marsDownloadTests () {
    after(function() {
        // if (fs.existsSync(__dirname + '/downloadTest')) {
        //     remove.removeSync(__dirname + '/downloadTest');
        // }
    });

    describe('default parameters', function () {
        it('should download a mars application', async function () {
            const archiveDirectory = __dirname + '/downloadTest/DownloadApp';
            const cfappFile = `${archiveDirectory}/project.cfapp`;

            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new ClientReadyDelegate();

            marsListMock(require('./mockData/listApplications.json'));
            marsDetailsMock(require('./mockData/applicationDetails.json'));
            marsDownloadUrlMock('hgweb.cgi/490509ad-919e-47e0-8f3a-f335bb71f54d/co-code-installedapp/archive/v0.0.2.zip', __dirname + '/resources/DemoApp.zip');

            await cfapp.mars.download('co-code-installedapp', {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin',
                directory: archiveDirectory
            }, outputStream).then(function () {
            }).catch(function (error) {
                console.log(error)
                assert.fail(undefined, undefined, 'the installation should not fail');
            });

            // Check the project.cfapp
            const contents = JSON.parse(fs.readFileSync(cfappFile, 'utf8'));
            assert.isObject(contents.mars, 'The mars object is missing');
            assert.equal(contents.mars.name, 'co-code-installedapp', 'The name in the mars dictionary is not correct');
            assert.equal(contents.mars.changeset, '0.0.2', 'The changeset in the mars dictionary is not correct');
        });

        it('should download a public app correctly', async function () {
            const archiveDirectory = __dirname + '/downloadTest/DownloadApp';
            const cfappFile = `${archiveDirectory}/project.cfapp`;

            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new ClientReadyDelegate();

            marsListMock(require('./mockData/listApplications.json'));
            marsDetailsMock(require('./mockData/publicApplicationDetails.json'));
            marsDownloadUrlMock('anonymousDownload', __dirname + '/resources/DemoAppPublic.zip');

            await cfapp.mars.download('demoapppublic', {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin',
                directory: archiveDirectory
            }, outputStream).then(function () {
            }).catch(function (error) {
                console.log(error)
                assert.fail(undefined, undefined, 'the installation should not fail');
            });

            // Check the project.cfapp
            const contents = JSON.parse(fs.readFileSync(cfappFile, 'utf8'));
            assert.isObject(contents.mars, 'The mars object is missing');
            assert.equal(contents.mars.name, 'demoapppublic', 'The name in the mars dictionary is not correct');
            assert.equal(contents.mars.changeset, '0.0.2', 'The changeset in the mars dictionary is not correct');
            
            // check the files directory
            assert.isTrue(fs.existsSync(path.join(archiveDirectory, 'files')), 'there should be a files directory');

            // check the workflows directory
            assert.isTrue(fs.existsSync(path.join(archiveDirectory, 'workflows')), 'there should be a workflows directory');
        });
    });
}

module.exports = marsDownloadTests;
