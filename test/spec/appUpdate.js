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
                save_id: 'Workflow1',
                nodes: []
            }, {
                _id: 'Workflow2',
                name: 'Workflow2',
                save_id: 'Workflow2',
                nodes: []
            }, {
                _id: 'ProcessOrder',
                name: 'ProcessOrder',
                save_id: 'ProcessOrder',
                nodes: [{
                    "title":	"Unhandled Problem",
                    "id":	"d68fb55b-2432-84f2-56ae-627bab2b0125"
                }, {
                    "title":	"Start From Form",
                    "id":	"82b646d5-b60c-bcd8-dd7b-5607b45a82ac"
                }, {
                    "title":	"End",
                    "id":	"584223c5-ebad-fca3-2fc9-b266c5f60044"
                }]
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

class NonUpdateableExistingSingleAppDelegate extends ExistingSingleAppDelegate {
    constructor () {
        super();
        this.mockData.whitepapers = [{
            _id: 'Workflow1',
            name: 'Workflow1',
            save_id: 'Workflow1',
            nodes: []
        }, {
            _id: 'Workflow2',
            name: 'Workflow2',
            save_id: 'Workflow2',
            nodes: []
        }, {
            _id: 'ProcessOrder',
            name: 'ProcessOrder',
            save_id: 'ProcessOrder',
            nodes: [{
                "title":	"Unhandled Problem",
                "id":	"different1"
            }, {
                "title":	"Start From Form",
                "id":	"different2"
            }, {
                "title":	"End",
                "id":	"different3"
            }]
        }];
    }
}

class RunningWorkablesOnExistingSingleAppDelegate extends ExistingSingleAppDelegate {
    listWorkables (query, fields) {
        return [{
            id: 'hi',
            whitepaper_name: 'Workflow1'
        }, {
            id: 'hello',
            whitepaper_name: 'Workflow1'
        }]
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
        })
        //.log((data) => console.log(data));
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

class RenamedWhitepapersDelegate extends ExistingSingleAppDelegate {
    constructor () {
        super();
        this.mockData.cfapps = [{
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
                'CreateOrder',
                'ProcessOrder'
            ]
        }];

        this.mockData.whitepapers = [{
            _id: 'Workflow1',
            name: 'Workflow1',
            save_id: 'Workflow1',
            nodes: []
        }, {
            _id: 'Workflow2',
            name: 'Workflow2',
            save_id: 'Workflow2',
            nodes: []
        }, {
            _id: 'ProcessOrder',
            name: 'ProcessOrder 2',
            save_id: 'ProcessOrder',
            nodes: [{
                "title":	"Unhandled Problem",
                "id":	"d68fb55b-2432-84f2-56ae-627bab2b0125"
            }, {
                "title":	"Start From Form",
                "id":	"82b646d5-b60c-bcd8-dd7b-5607b45a82ac"
            }, {
                "title":	"End",
                "id":	"584223c5-ebad-fca3-2fc9-b266c5f60044"
            }]
        }]
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
                save_id: 'ProcessOrder',
                nodes: [{
                    "title":	"Unhandled Problem",
                    "id":	"d68fb55b-2432-84f2-56ae-627bab2b0125"
                }, {
                    "title":	"Start From Form",
                    "id":	"82b646d5-b60c-bcd8-dd7b-5607b45a82ac"
                }, {
                    "title":	"End",
                    "id":	"584223c5-ebad-fca3-2fc9-b266c5f60044"
                }]
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
                assert.equal(apiMockDelegate.deletedApplications.length, 1,  'one application should be deleted');
                assert.equal(apiMockDelegate.deletedApplications[0], 'DemoAppID', 'the application "DemoAppID" should be deleted');
                assert.equal(apiMockDelegate.createdApplications.length, 1,  'one application should be created');
                assert.equal(apiMockDelegate.createdApplications[0].name, 'DemoApp', 'the application "DemoAppID" should be created');
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
                assert.equal(apiMockDelegate.createdWhitepapers.length, 1, 'One whitepaper should be added');
                assert.equal(apiMockDelegate.createdWhitepapers[0].name, 'CreateOrder', 'not all whitepapers were created');
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
                assert.equal(apiMockDelegate.deletedApplications.length, 1,  'one application should be deleted');
                assert.equal(apiMockDelegate.deletedApplications[0], 'DemoAppID', 'the application "DemoAppID" should be deleted');
                assert.equal(apiMockDelegate.createdApplications.length, 1,  'one application should be created');
                assert.equal(apiMockDelegate.createdApplications[0].name, 'DemoApp', 'the application "DemoAppID" should be created');
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
                assert.equal(apiMockDelegate.createdWhitepapers.length, 1, 'one whitepaper should be created');
                assert.equal(apiMockDelegate.createdWhitepapers[0].name, 'CreateOrder', 'not all whitepapers were created');
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
                assert.equal(apiMockDelegate.deletedApplications.length, 1,  'one application should be deleted');
                assert.equal(apiMockDelegate.deletedApplications[0], 'DemoAppID', 'the application "DemoAppID" should be deleted');
                assert.equal(apiMockDelegate.createdApplications.length, 1,  'one application should be created');
                assert.equal(apiMockDelegate.createdApplications[0].name, 'DemoApp', 'the application "DemoAppID" should be created');
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
                assert.equal(apiMockDelegate.createdWhitepapers.length, 1, 'one whitepaper should be created');
                assert.equal(apiMockDelegate.createdWhitepapers[0].name, 'CreateOrder', 'not all whitepapers were created');
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
            getFileUploadMock(uploadedFiles, 0, 'session_admin_admin');

            assert.throws(function() {
                cfapp.apps.update(__dirname + '/resources/MissingProjectApp/', {}, outputStream).then(function() {
                    assert.isNotOk(true, 'this function should have failed earlier (then)');
                }).catch(function() {
                    assert.isNotOk(true, 'this function should have failed earlier (catch)');
                });
            }, /^Missing 'project\.cfapp' file/, 'an error should be returned');

            assert.equal(uploadedFiles.length, 0, 'no files should be uploaded');
        });

        it('will throw a CFAPPERR019 when the updates will break the workables', function() {
            const outputStream = new JSONOutputStream();
            const apiMockDelegate = new NonUpdateableExistingSingleAppDelegate();
            apiMock.mockDelegate = apiMockDelegate;

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 0, 'session_admin_admin');

            return cfapp.apps.update(__dirname + '/resources/DemoApp/', {}, outputStream).then(function () {
                assert.isNotOk(true, 'cfapp update should have thrown an error when the workflows are not updateable');
            }).catch(function (error) {
                assert.match(error, /Updating workflow\(s\) \"ProcessOrder\" will break running workables/, 'should show an appropriate error message');
                assert.equal(apiMockDelegate.deletedWhitepapers.length, 0, 'no whitepaper should be deleted');
                assert.equal(apiMockDelegate.deletedFiles.length, 0, 'no files should be deleted');
                assert.equal(apiMockDelegate.uploadedWhitepapers.length, 0, 'no whitepaper should be uploaded');
                assert.equal(uploadedFiles.length, 0, 'no files should be uploaded');
            });
        });

        it('will allow an update that will break workables when the force-update-workflows option is passed', function() {
            const outputStream = new JSONOutputStream();
            const apiMockDelegate = new NonUpdateableExistingSingleAppDelegate();
            apiMock.mockDelegate = apiMockDelegate;

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 4, 'session_admin_admin');

            return cfapp.apps.update(__dirname + '/resources/DemoApp/', {
                forceUpdateWorkflows: true
            }, outputStream).then(function () {
                assert.equal(apiMockDelegate.deletedApplications.length, 1,  'one application should be deleted');
                assert.equal(apiMockDelegate.deletedApplications[0], 'DemoAppID', 'the application "DemoAppID" should be deleted');
                assert.equal(apiMockDelegate.createdApplications.length, 1,  'one application should be created');
                assert.equal(apiMockDelegate.createdApplications[0].name, 'DemoApp', 'the application "DemoAppID" should be created');
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
                assert.equal(apiMockDelegate.createdWhitepapers.length, 1, 'one whitepaper should be created');
                assert.equal(apiMockDelegate.createdWhitepapers[0].name, 'CreateOrder', 'not all whitepapers were created');
                assert.equal(uploadedFiles.length, 4, 'not all files were deleted');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'not all files were deleted');

                assert(nock.isDone(), 'expected requests not performed');
            }).catch(function (error) {
                assert.isNotOk(true, error);
            });
        });

        it('will not remove workflows in case there are still running workables for those', function() {
            const outputStream = new JSONOutputStream();
            const apiMockDelegate = new RunningWorkablesOnExistingSingleAppDelegate();
            apiMock.mockDelegate = apiMockDelegate;

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 4, 'session_admin_admin');

            return cfapp.apps.update(__dirname + '/resources/DemoApp/', {}, outputStream).then(function () {
                assert.equal(apiMockDelegate.deletedWhitepapers.length, 1, 'only Workflow2 should be deleted');
                assert.equal(apiMockDelegate.deletedWhitepapers[0], 'Workflow2', 'only Workflow2 should be deleted');
                assert.equal(apiMockDelegate.deletedApplications.length, 1,  'one application should be deleted');
                assert.equal(apiMockDelegate.deletedApplications[0], 'DemoAppID', 'the application "DemoAppID" should be deleted');
                assert.equal(apiMockDelegate.createdApplications.length, 1,  'one application should be created');
                assert.equal(apiMockDelegate.createdApplications[0].name, 'DemoApp', 'the application "DemoAppID" should be created');
                assert.equal(apiMockDelegate.deletedFiles.length, 1, 'not all files were deleted');
                assert.includeMembers(apiMockDelegate.deletedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'not all files were deleted');
                assert.includeMembers(apiMockDelegate.deletedFolders, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/'
                ], 'not all folders were deleted');
                assert.equal(apiMockDelegate.updatedWhitepapers.length, 1, 'not all whitepapers were uploaded');
                assert.equal(apiMockDelegate.updatedWhitepapers[0].name, 'ProcessOrder', 'not all whitepapers were uploaded');
                assert.equal(apiMockDelegate.createdWhitepapers.length, 1, 'one whitepaper should be created');
                assert.equal(apiMockDelegate.createdWhitepapers[0].name, 'CreateOrder', 'not all whitepapers were created');
                assert.equal(uploadedFiles.length, 4, 'not all files were deleted');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'not all files were deleted');

                assert(nock.isDone(), 'expected requests not performed');
            }).catch(function (error) {
                console.log(error);
                assert.isNotOk(true, 'cfapp update should work, skipping whitepaper deletion');
            });
        });

        it('will remove workflows in case there are still running workables for those and force-remove-workflows is passed', function() {
            const outputStream = new JSONOutputStream();
            const apiMockDelegate = new RunningWorkablesOnExistingSingleAppDelegate();
            apiMock.mockDelegate = apiMockDelegate;

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 4, 'session_admin_admin');

            return cfapp.apps.update(__dirname + '/resources/DemoApp/', {
                forceRemoveWorkflows: true
            }, outputStream).then(function () {
                assert.equal(apiMockDelegate.deletedWhitepapers.length, 2, 'Workflow1 and Workflow2 should be deleted');
                assert.includeMembers(apiMockDelegate.deletedWhitepapers, [
                ], 'Workflow1 and Workflow2 should be deleted');
                assert.equal(apiMockDelegate.deletedApplications.length, 1,  'one application should be deleted');
                assert.equal(apiMockDelegate.deletedApplications[0], 'DemoAppID', 'the application "DemoAppID" should be deleted');
                assert.equal(apiMockDelegate.createdApplications.length, 1,  'one application should be created');
                assert.equal(apiMockDelegate.createdApplications[0].name, 'DemoApp', 'the application "DemoAppID" should be created');
                assert.equal(apiMockDelegate.deletedFiles.length, 1, 'not all files were deleted');
                assert.includeMembers(apiMockDelegate.deletedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'not all files were deleted');
                assert.includeMembers(apiMockDelegate.deletedFolders, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/'
                ], 'not all folders were deleted');
                assert.equal(apiMockDelegate.updatedWhitepapers.length, 1, 'not all whitepapers were uploaded');
                assert.equal(apiMockDelegate.updatedWhitepapers[0].name, 'ProcessOrder', 'not all whitepapers were uploaded');
                assert.equal(apiMockDelegate.createdWhitepapers.length, 1, 'one whitepaper should be created');
                assert.equal(apiMockDelegate.createdWhitepapers[0].name, 'CreateOrder', 'not all whitepapers were created');
                assert.equal(uploadedFiles.length, 4, 'not all files were deleted');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'not all files were deleted');

                assert(nock.isDone(), 'expected requests not performed');
            }).catch(function (error) {
                console.log(error);
                assert.isNotOk(true, 'cfapp update should work, skipping whitepaper deletion');
            });
        });

        describe('conflicting whitepapers', function () {
            it('should update the name of the workflow when it is present with a different name and same node-ids on the remote system', function () {
                const outputStream = new JSONOutputStream();
                const apiMockDelegate = new RenamedWhitepapersDelegate();
                apiMock.mockDelegate = apiMockDelegate;
    
                const uploadedFiles = [];
                getFileUploadMock(uploadedFiles, 4, 'session_admin_admin');
    
                return cfapp.apps.update(`${__dirname}/resources/DemoApp`, {
                    host: 'http://localhost:9090',
                    login: 'admin',
                    password: 'admin'
                }, outputStream).then(function () {
                    console.log(apiMockDelegate.deletedWhitepapers);
                    assert.equal(apiMockDelegate.deletedWhitepapers.length, 2, 'Workflow1 and Workflow2 should be deleted');
                    assert.includeMembers(apiMockDelegate.deletedWhitepapers, [
                        'Workflow1', 'Workflow2'
                    ], 'Workflow1 and Workflow2 should be deleted');
                    assert.equal(apiMockDelegate.deletedApplications.length, 1,  'one application should be deleted');
                    assert.equal(apiMockDelegate.deletedApplications[0], 'DemoAppID', 'the application "DemoAppID" should be deleted');
                    assert.equal(apiMockDelegate.createdApplications.length, 1,  'one application should be created');
                    assert.equal(apiMockDelegate.createdApplications[0].name, 'DemoApp', 'the application "DemoAppID" should be created');
                    assert.equal(apiMockDelegate.deletedFiles.length, 1, 'not all files were deleted');
                    assert.includeMembers(apiMockDelegate.deletedFiles, [
                        'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                    ], 'not all files were deleted');
                    assert.includeMembers(apiMockDelegate.deletedFolders, [
                        'cloudflow://PP_FILE_STORE/DemoApp/images/'
                    ], 'not all folders were deleted');
                    assert.equal(apiMockDelegate.updatedWhitepapers.length, 1, 'not all whitepapers were uploaded');
                    assert.equal(apiMockDelegate.updatedWhitepapers[0].name, 'ProcessOrder', 'not all whitepapers were uploaded');
                    assert.equal(apiMockDelegate.createdWhitepapers.length, 1, 'one whitepaper should be created');
                    assert.equal(apiMockDelegate.createdWhitepapers[0].name, 'CreateOrder', 'not all whitepapers were created');
                    assert.equal(uploadedFiles.length, 4, 'not all files were deleted');
                    assert.includeMembers(uploadedFiles, [
                        'cloudflow://PP_FILE_STORE/DemoApp/images/mac.png',
                        'cloudflow://PP_FILE_STORE/DemoApp/images/win.png',
                        'cloudflow://PP_FILE_STORE/DemoApp/images/linux.jpg',
                        'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                    ], 'not all files were deleted');
    
                    assert(nock.isDone(), 'expected requests not performed');
                }).catch(function (error) {
                    assert.isNotOk(true, error);
                });
            });
        });
    });

    describe('licensing', function() {
        const offsetToday = require('../util/offsetToday');

        describe('mars licenses', function () {
            it('should be able to update an app for which Cloudflow has a license', function() {
                const outputStream = new JSONOutputStream();
                class ApplicationSupportDelegate extends ExistingSingleAppDelegate {
                    constructor () {
                        super();
                        this.mockData.cfapps[0].name = 'co-code-installedapp';
                    }

                    getLicense () {
                        const productABLicense = require('./mockData/productABLicense.js');
                        const license = productABLicense(offsetToday(-5), offsetToday(5));
                        return license;
                    }
                }

                const uploadedFiles = [];
                getFileUploadMock(uploadedFiles, 4);
    
                const apiMockDelegate = new ApplicationSupportDelegate();
                apiMock.mockDelegate = apiMockDelegate;
    
                return cfapp.apps.update(`${__dirname}/resources/DemoAppWithMarsDataAndLicense`, {
                    host: 'http://localhost:9090',
                    login: 'admin',
                    password: 'admin'
                }, outputStream).then(function() {
                    assert(nock.isDone(), 'expected requests not performed');
                });
            });
    
            it('should not be able to update an app for which Cloudflow does not have license', function() {
                const outputStream = new JSONOutputStream();
                class ApplicationSupportDelegate extends ExistingSingleAppDelegate {
                    constructor () {
                        super();
                        this.mockData.cfapps[0].name = 'co-code-installedapp';
                    }

                    getLicense () {
                        const productBCLicense = require('./mockData/productBCLicense.js');
                        const license = productBCLicense(offsetToday(-5), offsetToday(5));
                        return license;
                    }
                }

                const uploadedFiles = [];
                getFileUploadMock(uploadedFiles, 0);
    
                const apiMockDelegate = new ApplicationSupportDelegate();
                apiMock.mockDelegate = apiMockDelegate;
    
                return cfapp.apps.update(__dirname + '/resources/DemoAppWithMarsDataAndLicense/', {
                    host: 'http://localhost:9090',
                    login: 'admin',
                    password: 'admin'
                }, outputStream).then(function () {
                    assert.isNotOk(true, 'this function should have failed');
                }).catch(function (error) {
                    assert.match(error, /^Error: The version .* of ".*" cannot be installed because .* is missing/, 'an error should be returned');
                    assert.equal(error.errorCode, 'CFAPPERR021', 'the right error code should be returned');
                });
            });
        });

        describe('demo apps', function () {
            it('should be able to update a demo app for which Cloudflow has a demo license', function() {
                const outputStream = new JSONOutputStream();
                class ApplicationSupportDelegate extends ExistingSingleAppDelegate {
                    constructor () {
                        super();
                        this.mockData.cfapps[0].name = 'co-code-installedapp';
                    }

                    getLicense () {
                        const demoLicense = require('./mockData/demoLicense.js');
                        const license = demoLicense(offsetToday(-5), offsetToday(5));
                        return license;
                    }
                }

                const uploadedFiles = [];
                getFileUploadMock(uploadedFiles, 4);
    
                const apiMockDelegate = new ApplicationSupportDelegate();
                apiMock.mockDelegate = apiMockDelegate;
    
                return cfapp.apps.update(`${__dirname}/resources/DemoAppWithMarsDataAndDemoLicense`, {
                    host: 'http://localhost:9090',
                    login: 'admin',
                    password: 'admin'
                }, outputStream).then(function() {
                    assert(nock.isDone(), 'expected requests not performed');
                });
            });
    
            it('should not be able to update a demo app for which Cloudflow does not have a demo license', function() {
                const outputStream = new JSONOutputStream();
                class ApplicationSupportDelegate extends ExistingSingleAppDelegate {
                    constructor () {
                        super();
                        this.mockData.cfapps[0].name = 'co-code-installedapp';
                    }

                    getLicense () {
                        const productABLicense = require('./mockData/productABLicense.js');
                        const license = productABLicense(offsetToday(-5), offsetToday(5));
                        return license;
                    }
                }

                const uploadedFiles = [];
                getFileUploadMock(uploadedFiles, 0);
    
                const apiMockDelegate = new ApplicationSupportDelegate();
                apiMock.mockDelegate = apiMockDelegate;

                return cfapp.apps.update(__dirname + '/resources/DemoAppWithMarsDataAndDemoLicense/', {
                    host: 'http://localhost:9090',
                    login: 'admin',
                    password: 'admin'
                }, outputStream).then(function () {
                    assert.isNotOk(true, 'this function should have failed');
                }).catch(function (error) {
                    assert.match(error, /^Error: The version .* of ".*" cannot be installed because .* is missing/, 'an error should be returned');
                    assert.equal(error.errorCode, 'CFAPPERR021', 'the right error code should be returned');
                });
            });
        });
    });

    describe('minimum Cloudflow version', function () {
        it('should not update in case the version of Cloudflow is too old', function() {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new ExistingSingleAppDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 0);

            return cfapp.apps.update(__dirname + '/resources/DemoAppWithMinCloudflowVersion/', {}, outputStream).then(function() {
                assert.isNotOk(true, 'the update resolved while it should not');
            }).catch(function (error) {
                assert.equal(error.errorCode, 'CFAPPERR024', 'expected to get the right error code')
                assert.match(error, /The application "DemoApp" cannot be installed on Cloudflow "19.2 update 2", it requires at least "20.2 update 1"/, 'the error message is not correct');
            });
        });

        it('should update in case the version of Cloudflow is too old and forced is passed', function() {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new ExistingSingleAppDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 4);

            return cfapp.apps.update(__dirname + '/resources/DemoAppWithMinCloudflowVersion/', { forceCloudflowVersion: true }, outputStream).then(function() {
                const updatedWhitepapers = apiMock.mockDelegate.updatedWhitepapers;
                assert.equal(uploadedFiles.length, 4, 'all files should be uploaded');
                assert.equal(updatedWhitepapers.length, 1, 'all whitepapers should be uploaded');
                assert.equal(updatedWhitepapers[0].name, 'ProcessOrder', 'whitepaper "ProcessOrder" missing');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html',
                    'cloudflow://PP_FILE_STORE/DemoApp/docs/readme.md',
                    'cloudflow://PP_FILE_STORE/DemoApp/icon.png'
                ], 'the files were not all uploaded');

                assert(nock.isDone(), 'expected requests not performed');
            });
        });

        it('should upload in case the version of Cloudflow is ok', function() {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new class extends ExistingSingleAppDelegate {
                getVersion() {
                    return {
                        build: 'cloudflow_version',
                        major: 20,
                        minor: 2,
                        rev: 1                     
                    }
                }
            };

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 4);

            return cfapp.apps.update(__dirname + '/resources/DemoAppWithMinCloudflowVersion/', {}, outputStream).then(function() {
                const updatedWhitepapers = apiMock.mockDelegate.updatedWhitepapers;
                assert.equal(uploadedFiles.length, 4, 'all files should be uploaded');
                assert.equal(updatedWhitepapers.length, 1, 'all whitepapers should be uploaded');
                assert.equal(updatedWhitepapers[0].name, 'ProcessOrder', 'whitepaper "ProcessOrder" missing');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html',
                    'cloudflow://PP_FILE_STORE/DemoApp/docs/readme.md',
                    'cloudflow://PP_FILE_STORE/DemoApp/icon.png'
                ], 'the files were not all uploaded');

                assert(nock.isDone(), 'expected requests not performed');
            });
        });

        it('should not upload in case the version specified in the project.cfapp is invalid', function() {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new ExistingSingleAppDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 0);

            return cfapp.apps.update(__dirname + '/resources/DemoAppWithWrongMinCloudflowVersion/', {}, outputStream).then(function() {
                assert.isNotOk(true, 'the upload resolved while it should not');
            }).catch(function (error) {
                assert.equal(error.errorCode, 'CFAPPERR023', 'expected to get the right error code')
                assert.match(error, /The application "DemoApp" requires a minimum Cloudflow version "blibli", which is not a valid Cloufdlow version number/, 'the error message is not correct');
            });
        });

        it('should upload in case the version specified in the project.cfapp is invalid and force is passed', function() {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new ExistingSingleAppDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 4);

            return cfapp.apps.update(__dirname + '/resources/DemoAppWithWrongMinCloudflowVersion/', { forceCloudflowVersion: true }, outputStream).then(function() {
                const updatedWhitepapers = apiMock.mockDelegate.updatedWhitepapers;
                assert.equal(uploadedFiles.length, 4, 'all files should be uploaded');
                assert.equal(updatedWhitepapers.length, 1, 'all whitepapers should be uploaded');
                assert.equal(updatedWhitepapers[0].name, 'ProcessOrder', 'whitepaper "ProcessOrder" missing');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html',
                    'cloudflow://PP_FILE_STORE/DemoApp/docs/readme.md',
                    'cloudflow://PP_FILE_STORE/DemoApp/icon.png'
                ], 'the files were not all uploaded');

                assert(nock.isDone(), 'expected requests not performed');
            });
        });
    });
}

module.exports = updateTests;
