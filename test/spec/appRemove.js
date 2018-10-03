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

class NestedAppDelegate extends APIMockDelegate {
    get supportsApplications() {
        return true;
    }

    doesExist(url) {
        if (url === 'cloudflow://PP_FILE_STORE/DownloadApp/') {
            return {
                exists: true,
                is_folder: true,
                url: url,
                valid: true
            };
        } else if (url === 'cloudflow://PP_FILE_STORE/DownloadApp/index.html') {
            return {
                exists: true,
                is_folder: false,
                url: url,
                valid: true
            };
        } else if (url === 'cloudflow://PP_FILE_STORE/DownloadApp/images/') {
            return {
                exists: true,
                is_folder: true,
                url: url,
                valid: true
            };
        }
        else if (url === 'cloudflow://PP_FILE_STORE/DownloadApp/docs/') {
            return {
                exists: true,
                is_folder: true,
                url: url,
                valid: true
            };
        }
        else if (url === 'cloudflow://PP_FILE_STORE/DownloadApp/icon.png') {
            return {
                exists: true,
                is_folder: false,
                url: url,
                valid: true
            };
        }

        return super.doesExist(url);
    }

    existingAssets(query) {
        if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/images/win.png') {
            return [{
                _id: 'I exist',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DownloadApp/images/win.png'
                }
            }];
        }
        else if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/index.html') {
            return [{
                _id: 'I exist as well',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DownloadApp/index.html'
                }
            }];
        }
        else if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/images/mac.png') {
            return [{
                _id: 'I exist too',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DownloadApp/images/mac.png'
                }
            }];
        }
        else if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/docs/doc.pdf') {
            return [{
                _id: 'I exist too',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DownloadApp/docs/doc.pdf'
                }
            }];
        }
        else if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/docs/readme.md') {
            return [{
                _id: 'I exist too',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DownloadApp/docs/readme.md'
                }
            }];
        }
        else if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/icon.png') {
            return [{
                _id: 'I exist too',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DownloadApp/icon.png'
                }
            }];
        }
        else if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/images/') {
            // Get the assets in the image folder
            return [{
                _id: 'I exist',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DownloadApp/images/win.png'
                }
            }, {
                _id: 'I exist too',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DownloadApp/images/mac.png'
                }
            }];
        }
        else if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/docs/') {
            // Get the assets in the docs folder
            return [{
                _id: 'I exist',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DownloadApp/docs/readme.md'
                }
            }, {
                _id: 'I exist too',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DownloadApp/docs/doc.pdf'
                }
            }];
        }

        return [];
    }

    existingWhitepapers(query) {
        if (Array.isArray(query) && query.length > 0) {
            if (query[2] === 'Workflow1') {
                return [{
                    _id: 'Workflow1',
                    name: 'Workflow1'
                }];
            }
            else if (query[2] === 'Workflow2') {
                return [{
                    _id: 'Workflow2',
                    name: 'Workflow2'
                }];
            }
        }

        return [{
            _id: 'Workflow1',
            name: 'Workflow1'
        }, {
            _id: 'Workflow2',
            name: 'Workflow2'
        }];
    }

    existingFolders(query) {
        if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/') {
            return [ 'DownloadApp' ];
        }
        else if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/images/') {
            return [ 'images' ];
        }
        else if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/docs/') {
            return [ 'docs' ];
        }

        return [];
    }

    applicationList(query) {
        if (query[2] !== 'DownloadAppWithIconAndDocs') {
            return [];
        }

        return [{
            _id: 'DownloadAppWithIconAndDocsID',
            name: 'DownloadAppWithIconAndDocs',
            host: 'http://localhost:9090',
            version: '0.0.1',
            login: 'admin',
            password: 'admin',
            description: 'A test for downloading an application',

            icon: 'cloudflow://PP_FILE_STORE/DownloadApp/icon.png',
            documentation: 'cloudflow://PP_FILE_STORE/DownloadApp/docs/',

            files: [
                'cloudflow://PP_FILE_STORE/DownloadApp/',
                'cloudflow://PP_FILE_STORE/DownloadApp/index.html',
            ],

            workflows: [
                'Workflow1',
                'Workflow2'
            ]
        }];
    }
}

class ExistingSingleAppDelegate extends APIMockDelegate {
    get supportsApplications() {
        return true;
    }

    doesExist(url) {
        if (url === 'cloudflow://PP_FILE_STORE/DownloadApp/index.html') {
            return {
                exists: true,
                is_folder: false,
                url: url,
                valid: true
            };
        } else if (url === 'cloudflow://PP_FILE_STORE/DownloadApp/images/') {
            return {
                exists: true,
                is_folder: true,
                url: url,
                valid: true
            };
        }
        else if (url === 'cloudflow://PP_FILE_STORE/DownloadApp/docs/') {
            return {
                exists: true,
                is_folder: true,
                url: url,
                valid: true
            };
        }
        else if (url === 'cloudflow://PP_FILE_STORE/DownloadApp/icon.png') {
            return {
                exists: true,
                is_folder: false,
                url: url,
                valid: true
            };
        }

        return super.doesExist(url);
    }

    existingAssets(query) {
        if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/images/win.png') {
            return [{
                _id: 'I exist',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DownloadApp/images/win.png'
                }
            }];
        }
        else if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/index.html') {
            return [{
                _id: 'I exist as well',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DownloadApp/index.html'
                }
            }];
        }
        else if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/images/mac.png') {
            return [{
                _id: 'I exist too',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DownloadApp/images/mac.png'
                }
            }];
        }
        else if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/docs/doc.pdf') {
            return [{
                _id: 'I exist too',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DownloadApp/docs/doc.pdf'
                }
            }];
        }
        else if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/docs/readme.md') {
            return [{
                _id: 'I exist too',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DownloadApp/docs/readme.md'
                }
            }];
        }
        else if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/icon.png') {
            return [{
                _id: 'I exist too',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DownloadApp/icon.png'
                }
            }];
        }
        else if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/images/') {
            // Get the assets in the image folder
            return [{
                _id: 'I exist',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DownloadApp/images/win.png'
                }
            }, {
                _id: 'I exist too',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DownloadApp/images/mac.png'
                }
            }];
        }
        else if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/docs/') {
            // Get the assets in the docs folder
            return [{
                _id: 'I exist',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DownloadApp/docs/readme.md'
                }
            }, {
                _id: 'I exist too',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DownloadApp/docs/doc.pdf'
                }
            }];
        }

        return [];
    }

    existingWhitepapers(query) {
        if (Array.isArray(query) && query.length > 0) {
            if (query[2] === 'Workflow1') {
                return [{
                    _id: 'Workflow1',
                    name: 'Workflow1'
                }];
            }
            else if (query[2] === 'Workflow2') {
                return [{
                    _id: 'Workflow2',
                    name: 'Workflow2'
                }];
            }
        }

        return [{
            _id: 'Workflow1',
            name: 'Workflow1'
        }, {
            _id: 'Workflow2',
            name: 'Workflow2'
        }];
    }

    existingFolders(query) {
        if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/images/') {
            return [ 'images' ];
        }
        else if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/docs/') {
            return [ 'docs' ];
        }

        return [];
    }

    applicationList(query) {
        if (query[2] !== 'DownloadApp' &&
            query[2] !== 'DownloadAppWithIconAndDocs') {
            return [];
        }

        if (query[2] === 'DownloadApp') {
            return [{
                _id: 'DownloadAppID',
                name: 'DownloadApp',
                host: 'http://localhost:9090',
                version: '0.0.1',
                login: 'admin',
                password: 'admin',
                description: 'A test for downloading an application',

                files: [
                    'cloudflow://PP_FILE_STORE/DownloadApp/images/',
                    'cloudflow://PP_FILE_STORE/DownloadApp/index.html',
                ],

                workflows: [
                    'Workflow1',
                    'Workflow2'
                ]
            }];
        }

        return [{
            _id: 'DownloadAppWithIconAndDocsID',
            name: 'DownloadAppWithIconAndDocs',
            host: 'http://localhost:9090',
            version: '0.0.1',
            login: 'admin',
            password: 'admin',
            description: 'A test for downloading an application',

            icon: 'cloudflow://PP_FILE_STORE/DownloadApp/icon.png',
            documentation: 'cloudflow://PP_FILE_STORE/DownloadApp/docs/',

            files: [
                'cloudflow://PP_FILE_STORE/DownloadApp/images/',
                'cloudflow://PP_FILE_STORE/DownloadApp/index.html',
            ],

            workflows: [
                'Workflow1',
                'Workflow2'
            ]
        }];
    }
}

class NoInstalledAppsDelegate extends APIMockDelegate {
    get supportsApplications() {
        return true;
    }
}


function removeTests() {
    describe('default parameters', function() {
        it('should remove an existing app', function() {
            const outputStream = new JSONOutputStream();
            const apiMockDelegate = new ExistingSingleAppDelegate();
            apiMock.mockDelegate = apiMockDelegate;

            return cfapp.apps.remove('DownloadApp', {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin'
            }, outputStream).then(function() {
                assert.includeMembers(apiMockDelegate.deletedFiles, [
                    'cloudflow://PP_FILE_STORE/DownloadApp/index.html'
                ], 'not all the installed files were removed');
                assert.includeMembers(apiMockDelegate.deletedFolders, [
                    'cloudflow://PP_FILE_STORE/DownloadApp/images/'
                ], 'not all the installed folders were removed');
                assert.includeMembers(apiMockDelegate.deletedWhitepapers, [
                    'Workflow1',
                    'Workflow2'
                ], 'not all the installed workflows were removed');
                assert.includeMembers(apiMockDelegate.deletedApplications, [
                    'DownloadAppID'
                ], 'the app was not removed from the application registry');
            });
        });

        it('should not remove paths that are nested', function() {
            const outputStream = new JSONOutputStream();
            const apiMockDelegate = new NestedAppDelegate();
            apiMock.mockDelegate = apiMockDelegate;

            return cfapp.apps.remove('DownloadAppWithIconAndDocs', {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin'
            }, outputStream).then(function() {
                assert.lengthOf(apiMockDelegate.deletedFiles, 0,
                    'no files should be deleted');
                assert.lengthOf(apiMockDelegate.deletedFolders, 1,
                    'only one folder should be deleted');
                assert.includeMembers(apiMockDelegate.deletedFolders, [
                    'cloudflow://PP_FILE_STORE/DownloadApp/'
                ], 'not all the installed folders were removed');
                assert.includeMembers(apiMockDelegate.deletedWhitepapers, [
                    'Workflow1',
                    'Workflow2'
                ], 'not all the installed workflows were removed');
                assert.includeMembers(apiMockDelegate.deletedApplications, [
                    'DownloadAppWithIconAndDocsID'
                ], 'the app was not removed from the application registry');
            });
        });

        it('should remove an existing app with icons and documentation', function() {
            const outputStream = new JSONOutputStream();
            const apiMockDelegate = new ExistingSingleAppDelegate();
            apiMock.mockDelegate = apiMockDelegate;

            return cfapp.apps.remove('DownloadAppWithIconAndDocs', {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin'
            }, outputStream).then(function() {
                assert.includeMembers(apiMockDelegate.deletedFiles, [
                    'cloudflow://PP_FILE_STORE/DownloadApp/index.html',
                    'cloudflow://PP_FILE_STORE/DownloadApp/icon.png',
                ], 'not all the installed files were removed');
                assert.includeMembers(apiMockDelegate.deletedFolders, [
                    'cloudflow://PP_FILE_STORE/DownloadApp/images/',
                    'cloudflow://PP_FILE_STORE/DownloadApp/docs/'
                ], 'not all the installed folders were removed');
                assert.includeMembers(apiMockDelegate.deletedWhitepapers, [
                    'Workflow1',
                    'Workflow2'
                ], 'not all the installed workflows were removed');
                assert.includeMembers(apiMockDelegate.deletedApplications, [
                    'DownloadAppWithIconAndDocsID'
                ], 'the app was not removed from the application registry');
            });
        });

        it('should give an error when the app does not exist', function() {
            const outputStream = new JSONOutputStream();
            const apiMockDelegate = new NoInstalledAppsDelegate();
            apiMock.mockDelegate = apiMockDelegate;

            assert.throws(function() {
                cfapp.apps.remove('DownloadApp', {
                    host: 'http://localhost:9090',
                    login: 'admin',
                    password: 'admin'
                }, outputStream);
            }, 'application DownloadApp is not installed', 'should show an appropriate error message');
        });

    });
}

module.exports = removeTests;
