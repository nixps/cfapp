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
const JSONOutputStream = require('../../lib/util/JSONOutputStream');

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
                name: 'Workflow1',
                save_id: 'Workflow1'
            }, {
                _id: 'Workflow2',
                name: 'Workflow2',
                save_id: 'Workflow2'
            }, {
                _id: 'ProcessOrder',
                name: 'ProcessOrder',
                save_id: 'ProcessOrder'
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
                    'Workflow2', 
                    'ProcessOrder'
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

    folderDeleted(url) {
        super.folderDeleted(url);
        this.mockData.assets = this.mockData.assets.filter((e) => e.cloudflow.file.indexOf(url) === -1);
    }

    doesExist(url) {
        let isFolder = false;
        if (url === 'cloudflow://PP_FILE_STORE/DemoApp/images/') {
            isFolder = true;
        }
        const asset = this.mockData.assets.find((e) => {
            return e.cloudflow.file.indexOf(url) >= 0;
        });
        if (asset !== undefined) {
            return {
                exists: true,
                is_folder: isFolder,
                url: url,
                valid: true
            };
        }

        return {
            exists: false,
            is_folder: isFolder,
            url: url,
            valid: true
        };
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

function getFileUploadMock(uploadedFiles, expected, session = 'session_admin_admin') {
    const uploadFileURLRegex = new RegExp(`portal.cgi\\?asset=upload_file&session=${session}&url=(.*)&create_folders=true`);
    nock('http://localhost:9090')
        .post(uploadFileURLRegex, function(/*body*/) {
            return true;
        })
        .times(expected)
        .reply(200, function(uri) {
            const matches = uri.match(uploadFileURLRegex);
            if (Array.isArray(matches) && matches.length > 1) {
                // The Cloudflow URIs are URI encoded in the upload URL
                uploadedFiles.push(decodeURIComponent(matches[1]));
            }
        });
}

class NoInstalledAppsDelegate extends APIMockDelegate {
    get supportsApplications() {
        return true;
    }
}

class AppRegistryNotSupportedDelegate extends APIMockDelegate {
    get supportsApplications() {
        return false;
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


class DemoAppNoVersionInstalledDelegate extends ExistingSingleAppDelegate {
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
                name: 'Workflow1',
                save_id: 'Workflow1'
            }, {
                _id: 'Workflow2',
                name: 'Workflow2',
                save_id: 'Workflow2'
            }, {
                _id: 'ProcessOrder',
                name: 'ProcessOrder',
                save_id: 'ProcessOrder'
            }],

            cfapps: [{
                _id: 'DemoAppID',
                name: 'DemoApp',
                host: 'http://localhost:9090',
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

        };
    }
}


function updateTests() {
    describe('default parameters', function() {
        it('should return an error message if the app is not installed', function() {
            const outputStream = new JSONOutputStream();
            const apiMockDelegate = new NoInstalledAppsDelegate();
            apiMock.mockDelegate = apiMockDelegate;

            return cfapp.apps.update(`${__dirname}/resources/DemoApp`, {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin'
            }, outputStream).catch(function(error) {
                assert.match(error, /application DemoApp is not installed/, 'should show an appropriate error message');
            });
        });

        it('should return an error if the remote version is newer or the same', function() {
            const outputStream = new JSONOutputStream();
            const apiMockDelegate = new DemoApp002InstalledDelegate();
            apiMock.mockDelegate = apiMockDelegate;

            return cfapp.apps.update(`${__dirname}/resources/DemoApp`, {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin'
            }, outputStream).catch(function(error) {
                assert.match(error, /LOCAL version 0.0.2 <= REMOTE version 0.0.2, force to update/, 'an appropriate error message should be shown');
            });
        });

        it('should update an app if the remote version is older', function() {
            const outputStream = new JSONOutputStream();
            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 4);

            const apiMockDelegate = new ExistingSingleAppDelegate();
            apiMock.mockDelegate = apiMockDelegate;

            return cfapp.apps.update(`${__dirname}/resources/DemoApp`, {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin'
            }, outputStream).then(function() {
                assert.equal(apiMockDelegate.deletedWhitepapers.length, 2, 'whitepapers should not be deleted');
                assert.equal(apiMockDelegate.deletedFiles.length, 1, 'not all files were deleted');
                assert.includeMembers(apiMockDelegate.deletedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'not all files were deleted');
                assert.includeMembers(apiMockDelegate.deletedFolders, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/'
                ], 'not all folders were deleted');
                assert.equal(apiMockDelegate.updatedWhitepapers.length, 1, 'not all whitepapers were updated');
                assert.equal(apiMockDelegate.updatedWhitepapers[0].name, 'ProcessOrder', 'not all whitepapers were updated');
                assert.equal(apiMockDelegate.createdWhitepapers.length, 0, 'no new whitepapers should be created');
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
            const outputStream = new JSONOutputStream();
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
            }, outputStream).then(function() {
                assert.equal(apiMockDelegate.deletedWhitepapers.length, 2, 'not all whitepapers were deleted');
                assert.includeMembers(apiMockDelegate.deletedWhitepapers, [
                    'Workflow1',
                    'Workflow2'
                ], 'not all whitepapers were deleted');
                assert.equal(apiMockDelegate.deletedFiles.length, 1, 'not all files were deleted');
                assert.includeMembers(apiMockDelegate.deletedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'not all files were deleted');
                assert.includeMembers(apiMockDelegate.deletedFolders, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/',
                ], 'not all folders were deleted');
                assert.equal(apiMockDelegate.updatedWhitepapers.length, 1, 'not all whitepapers were uploaded');
                assert.equal(apiMockDelegate.updatedWhitepapers[0].name, 'ProcessOrder', 'not all whitepapers were uploaded');
                assert.equal(apiMockDelegate.createdWhitepapers.length, 0, 'no whitepapers should be created');
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

        it('should throw an error when the application registry does not exist', function() {
            const outputStream = new JSONOutputStream();
            const apiMockDelegate = new AppRegistryNotSupportedDelegate();
            apiMock.mockDelegate = apiMockDelegate;

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 0);

            return cfapp.apps.update(`${__dirname}/resources/DemoApp`, {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin',
                force: true
            }, outputStream).then(function() {
                assert.isNotOk('cfapp app update does not throw an error when Cloudflow has no support for the cfapp registry');
            }).catch(function(error) {
                assert.match(error, /no support for application updates/, 'should show an appropriate error message');
                assert.equal(apiMockDelegate.deletedWhitepapers.length, 0, 'no whitepaper should be deleted');
                assert.equal(apiMockDelegate.deletedFiles.length, 0, 'no files should be deleted');
                assert.equal(apiMockDelegate.uploadedWhitepapers.length, 0, 'no whitepaper should be uploaded');
                assert.equal(uploadedFiles.length, 0, 'no files should be uploaded');
            });
        });

        it('should throw an error when a non-versioned application has been installed and no force is passed', function() {
            const outputStream = new JSONOutputStream();
            const apiMockDelegate = new DemoAppNoVersionInstalledDelegate();
            apiMock.mockDelegate = apiMockDelegate;

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 0);

            return cfapp.apps.update(`${__dirname}/resources/DemoApp`, {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin'
            }, outputStream).then(function() {
                assert.isNotOk('cfapp app update does not throw an error when Cloudflow has no support for the cfapp registry');
            }).catch(function(error) {
                assert.match(error, /invalid version for REMOTE DemoApp, force to update/, 'should show an appropriate error message');
                assert.equal(apiMockDelegate.deletedWhitepapers.length, 0, 'no whitepaper should be deleted');
                assert.equal(apiMockDelegate.deletedFiles.length, 0, 'no files should be deleted');
                assert.equal(apiMockDelegate.uploadedWhitepapers.length, 0, 'no whitepaper should be uploaded');
                assert.equal(uploadedFiles.length, 0, 'no files should be uploaded');
            });
        });

        it('should update when a non-versioned application has been installed and force is passed', function() {
            const outputStream = new JSONOutputStream();
            const apiMockDelegate = new DemoAppNoVersionInstalledDelegate();
            apiMock.mockDelegate = apiMockDelegate;

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 4);

            return cfapp.apps.update(`${__dirname}/resources/DemoApp`, {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin',
                force: true
            }, outputStream).then(function() {
                assert.equal(apiMockDelegate.deletedWhitepapers.length, 2, 'not all whitepapers were deleted');
                assert.includeMembers(apiMockDelegate.deletedWhitepapers, [
                    'Workflow1',
                    'Workflow2'
                ], 'not all whitepapers were deleted');
                assert.equal(apiMockDelegate.deletedFiles.length, 1, 'not all files were deleted');
                assert.includeMembers(apiMockDelegate.deletedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'not all files were deleted');
                assert.includeMembers(apiMockDelegate.deletedFolders, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/'
                ], 'not all folders were deleted');
                assert.equal(apiMockDelegate.updatedWhitepapers.length, 1, 'not all whitepapers were uploaded');
                assert.equal(apiMockDelegate.updatedWhitepapers[0].name, 'ProcessOrder', 'not all whitepapers were uploaded');
                assert.equal(apiMockDelegate.createdWhitepapers.length, 0, 'no whitepapers should be created');
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

        it('should use the password from the cfapp file', function() {
            const outputStream = new JSONOutputStream();
            const apiMockDelegate = new ExistingSingleAppDelegate();
            apiMock.mockDelegate = apiMockDelegate;

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 4, 'session_admin_admin_dfe');

            return cfapp.apps.update(`${__dirname}/resources/DemoAppPass`, {
                force: true
            }, outputStream).then(function() {
                const createdSessions = apiMockDelegate.createdSessions;
                for(let session of createdSessions) {
                    assert.equal(session.login, 'admin', 'cfapp logged in with wrong login');
                    assert.equal(session.password, 'admin_dfe', 'cfapp logged in with wrong password');
                }
            });
        });

        it('should show an appropriate error code when no project.cfapp file is found', function() {
            const outputStream = new JSONOutputStream();
            const apiMockDelegate = new ExistingSingleAppDelegate();
            apiMock.mockDelegate = apiMockDelegate;

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 0, 'session_admin_admin_dfe');

            assert.throws(function() {
                cfapp.apps.update(__dirname + '/resources/MissingProjectApp/', {}, outputStream).then(function() {
                    assert.isNotOk(true, 'this function should have failed earlier (then)');
                }).catch(function() {
                    assert.isNotOk(true, 'this function should have failed earlier (catch)');
                });
            }, /^Missing 'project\.cfapp' file/, 'an error should be returned');

            assert.equal(uploadedFiles.length, 0, 'no files should be uploaded');
        });

    });
}

module.exports = updateTests;
