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

class ExistingSingleAppDelegate extends APIMockDelegate {
    get supportsApplications() {
        return true;
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
        if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/index.html') {
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
        } else if (query[2] === 'cloudflow://PP_FILE_STORE/DownloadApp/images/') {
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

        return [];
    }

    applicationList(query) {
        if (query[2] !== 'DownloadApp') {
            return [];
        }

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
            ],

            installedFiles: [
                'cloudflow://PP_FILE_STORE/DownloadApp/images/mac.png',
                'cloudflow://PP_FILE_STORE/DownloadApp/images/win.png',
                'cloudflow://PP_FILE_STORE/DownloadApp/index.html'
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
            const apiMockDelegate = new ExistingSingleAppDelegate();
            apiMock.mockDelegate = apiMockDelegate;

            cfapp.apps.remove('DownloadApp', {
                host: 'http://localhost:9090',
                login: 'admin',
                password: 'admin'
            });

            assert.includeMembers(apiMockDelegate.deletedFiles, [
                'cloudflow://PP_FILE_STORE/DownloadApp/images/mac.png',
                'cloudflow://PP_FILE_STORE/DownloadApp/images/win.png',
                'cloudflow://PP_FILE_STORE/DownloadApp/index.html'
            ], 'not all the installed files were removed');
            assert.includeMembers(apiMockDelegate.deletedWhitepapers, [
                'Workflow1',
                'Workflow2'
            ], 'not all the installed workflows were removed');
            assert.includeMembers(apiMockDelegate.deletedApplications, [
                'DownloadAppID'
            ], 'the app was not removed from the application registry');
        });

        it('should give an error when the app does not exist', function() {
            const apiMockDelegate = new NoInstalledAppsDelegate();
            apiMock.mockDelegate = apiMockDelegate;

            assert.throws(function() {
                cfapp.apps.remove('DownloadApp', {
                    host: 'http://localhost:9090',
                    login: 'admin',
                    password: 'admin'
                });
            }, 'application DownloadApp is not installed', 'should show an appropriate error message');
        });

    });
}

module.exports = removeTests;
