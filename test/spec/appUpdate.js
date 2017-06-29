/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

const nock = require('nock');
const { assert } = require('chai');

const APIMockDelegate = require('../util/APIMockDelegate');
const apiMock = require('cloudflow-api');
const cfapp = require('../../lib/cfapp');

class ExistingSingleAppDelegate extends APIMockDelegate {
    constructor() {
        super();

        this.mockData = {
            assets: [{
                _id: 'I exist',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DemoApp/images/linux.png'
                }
            },{
                _id: 'I exist',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DemoApp/images/win.png'
                }
            },{
                _id: 'I exist as well',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                }
            },{
                _id: 'I exist too',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DemoApp/images/mac.png'
                }
            }],

            whitepapers: [{
                _id: 'Workflow1',
                name: 'Workflow1'
            }, {
                _id: 'Workflow2',
                name: 'Workflow2'
            }],

            cfapps: [{
                _id: 'DemoAppID',
                name: 'DemoApp',
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
                    'Workflow2'
                ]
            }]

        };
    }

    get supportsApplications() {
        return true;
    }

    fileDeleted(file) {
        super.fileDeleted(file);
        this.mockData.assets = this.mockData.assets.filter((e) => e.cloudflow.file !== file);
    }

    existingAssets(query) {
        if (Array.isArray(query) && query.length >= 3) {
            return this.mockData.assets.filter((e) => e.cloudflow.file.match(new RegExp(query[2])));
        }

        return this.mockData.assets;
    }

    whitepaperDeleted(whitepaper) {
        super.whitepaperDeleted(whitepaper);
        this.mockData.whitepapers = this.mockData.whitepapers.filter((e) => e._id !== whitepaper);
    }

    existingWhitepapers(query) {
        if (Array.isArray(query) && query.length >= 3) {
            return this.mockData.whitepapers.filter((e) => e._id === query[2]);
        }

        return this.mockData.whitepapers;
    }

    existingFolders(query) {
        if (query[2] === 'cloudflow://PP_FILE_STORE/DemoApp/images/') {
            return [ 'images' ];
        }

        return [];
    }

    applicationDeleted(id) {
        super.applicationDeleted(id);
        this.mockData.cfapps = this.mockData.cfapps.filter((e) => e._id !== id);
    }

    applicationList(query) {
        if (Array.isArray(query) && query.length >= 3) {
            return this.mockData.cfapps.filter((e) => e.name === query[2]);
        }

        return this.mockData.cfapps;
    }
}

function getFileUploadMock(uploadedFiles, expected) {
    const uploadFileURLRegex = /portal.cgi\?asset=upload_file&session=session_admin_admin&url=(.*)&create_folders=true/;

    nock('http://localhost:9090')
        .post(uploadFileURLRegex, function(/*body*/) {
            return true;
        })
        .times(expected)
        .reply(200, function(uri) {
            const matches = uri.match(uploadFileURLRegex);
            if (Array.isArray(matches) && matches.length > 1) {
                uploadedFiles.push(matches[1]);
            }
        });
}

class NoInstalledAppsDelegate extends APIMockDelegate {
    get supportsApplications() {
        return true;
    }
}


class DemoApp002InstalledDelegate extends APIMockDelegate {
    get supportsApplications() {
        return true;
    }

    applicationList() {
        return [{
            _id: 'DemoAppID',
            name: 'DemoApp',
            host: 'http://localhost:9090',
            version: '0.0.2',
            login: 'admin',
            password: 'admin',
            description: 'A test for downloading an application',

            files: [
                'cloudflow://PP_FILE_STORE/DemoApp/images/',
                'cloudflow://PP_FILE_STORE/DemoApp/index.html',
            ],

            workflows: [
                'Workflow1',
                'Workflow2'
            ],

            installedFiles: [
                'cloudflow://PP_FILE_STORE/DemoApp/images/mac.png',
                'cloudflow://PP_FILE_STORE/DemoApp/images/win.png',
                'cloudflow://PP_FILE_STORE/DemoApp/index.html'
            ]
        }];
    }

}


function updateTests() {
    describe('default parameters', function() {
        it('should return an error message if the app is not installed', function() {
            const apiMockDelegate = new NoInstalledAppsDelegate();
            apiMock.mockDelegate = apiMockDelegate;

            return cfapp.apps.update(`${__dirname}/resources/DemoApp`, {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin'
            }).catch(function(error) {
                assert.match(error, /application DemoApp is not installed/, 'should show an appropriate error message');
            });
        });

        it('should return an error if the remote version is newer or the same', function() {
            const apiMockDelegate = new DemoApp002InstalledDelegate();
            apiMock.mockDelegate = apiMockDelegate;

            return cfapp.apps.update(`${__dirname}/resources/DemoApp`, {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin'
            }).catch(function(error) {
                assert.match(error, /LOCAL version 0.0.2 <= REMOTE version 0.0.2, force to update/, 'an appropriate error message should be shown');
            });
        });

        it('should update an app if the remote version is older', function() {
            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 4);

            const apiMockDelegate = new ExistingSingleAppDelegate();
            apiMock.mockDelegate = apiMockDelegate;

            return cfapp.apps.update(`${__dirname}/resources/DemoApp`, {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin'
            }).then(function() {
                assert.equal(apiMockDelegate.deletedWhitepapers.length, 2, 'not all whitepapers were deleted');
                assert.includeMembers(apiMockDelegate.deletedWhitepapers, [
                    'Workflow1',
                    'Workflow2'
                ], 'not all whitepapers were deleted');
                assert.equal(apiMockDelegate.deletedFiles.length, 4, 'not all files were deleted');
                assert.includeMembers(apiMockDelegate.deletedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/linux.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'not all files were deleted');
                assert.equal(apiMockDelegate.uploadedWhitepapers.length, 1, 'not all whitepapers were uploaded');
                assert.equal(apiMockDelegate.uploadedWhitepapers[0].name, 'ProcessOrder', 'not all whitepapers were uploaded');
                assert.equal(uploadedFiles.length, 4, 'not all files were deleted');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'not all files were deleted');

                assert(nock.isDone(), 'expected requests not performed');
            });
        });

        it('should update an app if the remote version is newer and force is passed', function() {
            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 4);

            const apiMockDelegate = new ExistingSingleAppDelegate();
            apiMock.mockDelegate = apiMockDelegate;
            apiMockDelegate.mockData.cfapps[0].version = '0.0.2';

            return cfapp.apps.update(`${__dirname}/resources/DemoApp`, {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin',
                force: true
            }).then(function() {
                assert.equal(apiMockDelegate.deletedWhitepapers.length, 2, 'not all whitepapers were deleted');
                assert.includeMembers(apiMockDelegate.deletedWhitepapers, [
                    'Workflow1',
                    'Workflow2'
                ], 'not all whitepapers were deleted');
                assert.equal(apiMockDelegate.deletedFiles.length, 4, 'not all files were deleted');
                assert.includeMembers(apiMockDelegate.deletedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/linux.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'not all files were deleted');
                assert.equal(apiMockDelegate.uploadedWhitepapers.length, 1, 'not all whitepapers were uploaded');
                assert.equal(apiMockDelegate.uploadedWhitepapers[0].name, 'ProcessOrder', 'not all whitepapers were uploaded');
                assert.equal(uploadedFiles.length, 4, 'not all files were deleted');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'not all files were deleted');

                assert(nock.isDone(), 'expected requests not performed');
            });
        });

    });
}

module.exports = updateTests;
