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
const nock = require('nock');

const APIMockDelegate = require('../util/APIMockDelegate');
const apiMock = require('cloudflow-api');
const cfapp = require('../../lib/cfapp');
const JSONOutputStream = require('../../lib/util/JSONOutputStream');

class ExistingWhitepapersDelegate extends APIMockDelegate {
    existingWhitepapers() {
        return [ {
            name: 'ProcessOrder'
        }];
    }
}

class ExistingFilesDelegate extends APIMockDelegate {
    existingAssets(query) {
        if (query[2] === 'cloudflow://PP_FILE_STORE/DemoApp/images/win.png') {
            return [{
                _id: 'I exist',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DemoApp/images/win.png'
                }
            }];
        }
        else if (query[2] === 'cloudflow://PP_FILE_STORE/DemoApp/images/mac.png') {
            return [{
                _id: 'I exist too',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DemoApp/images/mac.png'
                }
            }];
        }

        return [];
    }

    doesExist(url) {
        if (url === 'cloudflow://PP_FILE_STORE/DemoApp/images/') {
            return {
                exists: true,
                is_folder: true,
                url: url,
                is_valid: true
            };
        } else if (url === 'cloudflow://PP_FILE_STORE/DemoApp/images/mac.png') {
            return {
                exists: true,
                is_folder: false,
                url: url,
                is_valid: true
            };
        } else if (url === 'cloudflow://PP_FILE_STORE/DemoApp/images/win.png') {
            return {
                exists: true,
                is_folder: false,
                url: url,
                is_valid: true
            };
        }

        return super.doesExist(url);
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
                // The Cloudflow URIs are URI encoded in the upload URL
                uploadedFiles.push(decodeURIComponent(matches[1]));
            }
        });
}

function uploadTests() {
    describe('default parameters', function() {
        it('nothing exists: should upload a single application completely', function() {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new APIMockDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 4);

            return cfapp.apps.upload(__dirname + '/resources/DemoApp/', {}, outputStream).then(function() {
                const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
                assert.equal(uploadedFiles.length, 4, 'all files should be uploaded');
                assert.equal(uploadedWhitepapers.length, 1, 'all whitepapers should be uploaded');
                assert.equal(uploadedWhitepapers[0].name, 'ProcessOrder', 'whitepaper "ProcessOrder" missing');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'the files were not all uploaded');

                assert(nock.isDone(), 'expected requests not performed');
            });
        });

        it('existing workflow: should skip the workflow', function() {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new ExistingWhitepapersDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 4);

            return cfapp.apps.upload(__dirname + '/resources/DemoApp/', {}, outputStream).then(function() {
                const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
                assert.equal(uploadedFiles.length, 4, 'all files should be uploaded');
                assert.equal(uploadedWhitepapers.length, 0, 'no whitepapers should be uploaded');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'the files were not all uploaded');

                assert(nock.isDone(), 'expected requests not performed');
            });
        });

        it('existing files: should skip 2 files', function() {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new ExistingFilesDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 2);

            return cfapp.apps.upload(__dirname + '/resources/DemoApp/', {}, outputStream).then(function() {
                const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
                assert.equal(uploadedFiles.length, 2, 'all files should be uploaded');
                assert.equal(uploadedWhitepapers.length, 1, 'all whitepapers should be uploaded');
                assert.equal(uploadedWhitepapers[0].name, 'ProcessOrder', 'whitepaper "ProcessOrder" missing');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'the files were not all uploaded');

                assert(nock.isDone(), 'expected requests not performed');
            });
        });

        it('app icon and documentation', function() {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new ExistingFilesDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 4);

            return cfapp.apps.upload(__dirname + '/resources/DemoAppWithIconAndDocs/', {}, outputStream).then(function() {
                const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
                assert.equal(uploadedFiles.length, 4, 'all files should be uploaded');
                assert.equal(uploadedWhitepapers.length, 1, 'all whitepapers should be uploaded');
                assert.equal(uploadedWhitepapers[0].name, 'ProcessOrder', 'whitepaper "ProcessOrder" missing');
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

    describe('overwrite parameter', function() {
        it('existing workflow: should overwrite the workflow', function() {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new ExistingWhitepapersDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 4);

            return cfapp.apps.upload(__dirname + '/resources/DemoApp/', {
                overwrite: true
            }, outputStream).then(function() {
                const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
                const deletedWhitepapers = apiMock.mockDelegate.deletedWhitepapers;
                assert.equal(uploadedFiles.length, 4, 'all files should be uploaded');
                assert.equal(deletedWhitepapers.length, 1, 'one whitepaper should be deleted');
                assert.equal(uploadedWhitepapers.length, 1, 'all whitepapers should be uploaded');
                assert.equal(uploadedWhitepapers[0].name, 'ProcessOrder', 'whitepaper "ProcessOrder" missing');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'the files were not all uploaded');

                assert(nock.isDone(), 'expected requests not performed');
            });
        });

        it('existing files: should overwrite 2 files', function() {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new ExistingFilesDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 4);

            return cfapp.apps.upload(__dirname + '/resources/DemoApp/', {
                overwrite: true
            }, outputStream).then(function() {
                const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
                const deletedFiles = apiMock.mockDelegate.deletedFiles;
                assert.equal(deletedFiles.length, 2, '2 files should be deleted');
                assert.equal(uploadedFiles.length, 4, 'all files should be uploaded');
                assert.equal(uploadedWhitepapers.length, 1, 'all whitepapers should be uploaded');
                assert.equal(uploadedWhitepapers[0].name, 'ProcessOrder', 'whitepaper "ProcessOrder" missing');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'the files were not all uploaded');

                assert(nock.isDone(), 'expected requests not performed');
            });
        });
    });

    describe('multiple apps', function() {
        it('nothing exists: should upload a all the applications completely', function() {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new APIMockDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 12);

            return cfapp.apps.upload(__dirname + '/resources/MultipleApps/', {}, outputStream).then(function() {
                const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
                assert.equal(uploadedFiles.length, 12, 'all files should be uploaded');
                // assert.equal(uploadedWhitepapers.length, 3, 'all whitepapers should be uploaded');
                assert.includeMembers(uploadedWhitepapers.map(e => e.name), [
                    'ProcessOrder1',
                    'ProcessOrder2',
                    'ProcessOrder3'
                ], 'the workflows were not all uploaded');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp1/images/linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp1/images/mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp1/images/win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp1/index.html',
                    'cloudflow://PP_FILE_STORE/DemoApp2/images/linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp2/images/mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp2/images/win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp2/index.html',
                    'cloudflow://PP_FILE_STORE/DemoApp3/images/linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp3/images/mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp3/images/win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp3/index.html'
                ], 'the files were not all uploaded');

                assert(nock.isDone(), 'expected requests not performed');
            });
        });
    });

    describe('application versioning', function() {

        it('should register the application in the repository if Cloudflow supports it', function() {
            const outputStream = new JSONOutputStream();
            class ApplicationSupportDelegate extends APIMockDelegate {
                get supportsApplications() {
                    return true;
                }

                applicationList() {
                    return [];
                }
            }

            apiMock.mockDelegate = new ApplicationSupportDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 4);

            return cfapp.apps.upload(__dirname + '/resources/DemoApp/', {
                overwrite: true
            }, outputStream).then(function() {
                const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
                assert.equal(uploadedFiles.length, 4, 'all files should be uploaded');
                assert.equal(uploadedWhitepapers.length, 1, 'all whitepapers should be uploaded');
                assert.equal(uploadedWhitepapers[0].name, 'ProcessOrder', 'whitepaper "ProcessOrder" missing');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images/win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'the files were not all uploaded');
                assert.equal(apiMock.mockDelegate.createdApplications.length, 1, 'one application should be registered');
                assert.equal(apiMock.mockDelegate.createdApplications[0].name, 'DemoApp', 'app name should be present');
                assert.equal(apiMock.mockDelegate.createdApplications[0].version, '0.0.2', 'app version should be present');

                assert(nock.isDone(), 'expected requests not performed');
            });
        });

        it('should not update if there is already an application registered', function() {
            const outputStream = new JSONOutputStream();
            class ApplicationSupportDelegate extends APIMockDelegate {
                applicationList() {
                    return [{
                        name: 'DemoApp',
                        version: '0.0.2'
                    }];
                }
            }

            apiMock.mockDelegate = new ApplicationSupportDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 0);

            return cfapp.apps.upload(__dirname + '/resources/DemoApp/', {
                overwrite: true
            }, outputStream).then(function() {
                assert.isNotOk(true, 'this function should have failed');
            }).catch(function(error) {
                assert.match(error, /The application DemoApp is already installed/, 'an error should be returned');
                const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
                assert.equal(uploadedFiles.length, 0, 'no files should be uploaded');
                assert.equal(uploadedWhitepapers.length, 0, 'no whitepapers should be uploaded');
                assert.equal(apiMock.mockDelegate.createdApplications.length, 0, 'no application should be registered');
            });
        });
    });

    describe('project.cfapp syntax and validation errors', function() {
        it('should show an appropriate error code when there is a syntax error in the project.cfapp', function() {
            const outputStream = new JSONOutputStream();

            assert.throws(function() {
                return cfapp.apps.upload(__dirname + '/resources/DemoAppSyntaxError/', {}, outputStream).then(function() {
                    assert.isNotOk(true, 'this function should have failed');
                }).catch(function() {
                    assert.isNotOk(true, 'this handler should not be called');
                });
            }, /Syntax error in project.cfapp/);
        });

        it('should show an appropriate error code when the project.cfapp does not validate', function() {
            const outputStream = new JSONOutputStream();

            assert.throws(function() {
                return cfapp.apps.upload(__dirname + '/resources/DemoAppValidationError/', {}, outputStream).then(function() {
                    assert.isNotOk(true, 'this function should have failed');
                }).catch(function() {
                    assert.isNotOk(true, 'this handler should not be called');
                });
            }, /^Invalid project.cfapp/);
        });
    });

    describe('Missing file/workflow error', function() {
        it('should show an appropriate error code when a file is missing in a cfapp', function() {
            const outputStream = new JSONOutputStream();
            class MissingFileDelegate extends APIMockDelegate {
                applicationList() {
                    return [];
                }
            }

            apiMock.mockDelegate = new MissingFileDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 0);

            return cfapp.apps.upload(__dirname + '/resources/DemoAppMissingFileError/', {}, outputStream).then(function() {
                assert.isNotOk(true, 'this function should have failed');
            }).catch(function(error) {
                assert.match(error, /^Error: Cannot find file/, 'an error should be returned');
                assert.equal(error.errorCode, 'CFAPPERR012', 'the right error code should be returned');

                const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
                assert.equal(uploadedFiles.length, 0, 'no files should be uploaded');
                assert.equal(uploadedWhitepapers.length, 0, 'no whitepapers should be uploaded');
                assert.equal(apiMock.mockDelegate.createdApplications.length, 0, 'no application should be registered');
            });
        });

        it('should show an appropriate error code when a workflow is missing in a cfapp', function() {
            const outputStream = new JSONOutputStream();
            class MissingWorkflowDelegate extends APIMockDelegate {
                applicationList() {
                    return [];
                }
            }

            apiMock.mockDelegate = new MissingWorkflowDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 0);

            return cfapp.apps.upload(__dirname + '/resources/DemoAppMissingWorkflowError/', {}, outputStream).then(function() {
                assert.isNotOk(true, 'this function should have failed');
            }).catch(function(error) {
                assert.match(error, /^Error: Cannot find workflow/, 'an error should be returned');
                assert.equal(error.errorCode, 'CFAPPERR013', 'the right error code should be returned');

                const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
                assert.equal(uploadedFiles.length, 0, 'no files should be uploaded');
                assert.equal(uploadedWhitepapers.length, 0, 'no whitepapers should be uploaded');
                assert.equal(apiMock.mockDelegate.createdApplications.length, 0, 'no application should be registered');
            });
        });

        it('should show an appropriate error code when no project.cfapp file is found', function() {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new APIMockDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 0);

            assert.throws(function() {
                cfapp.apps.upload(__dirname + '/resources/MissingProjectApp/', {}, outputStream).then(function() {
                    assert.isNotOk(true, 'this function should have failed earlier (then)');
                }).catch(function() {
                    assert.isNotOk(true, 'this function should have failed earlier (catch)');
                });
            }, /^Missing 'project\.cfapp' file/, 'an error should be returned');

            const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
            assert.equal(uploadedFiles.length, 0, 'no files should be uploaded');
            assert.equal(uploadedWhitepapers.length, 0, 'no whitepapers should be uploaded');
            assert.equal(apiMock.mockDelegate.createdApplications.length, 0, 'no application should be registered');
        });
    });

    describe('escaped characters', function () {
        it('should upload the files with the correct encoding', function () {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new APIMockDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 1);

            return cfapp.apps.upload(__dirname + '/resources/EscapeApp/', {}, outputStream).then(function() {
                const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
                assert.equal(uploadedFiles.length, 1, 'all files should be uploaded');
                assert.equal(uploadedWhitepapers.length, 1, 'all whitepapers should be uploaded');
                assert.equal(uploadedWhitepapers[0].name, 'ProcessOrder', 'whitepaper "ProcessOrder" missing');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/EscapeApp/mg%20eclipse%20750ml%20ex%25E3%25A9%20r%25E2%25B0v%25E2%25B0%20261012.pdf',
                ], 'the files were not all uploaded');

                assert(nock.isDone(), 'expected requests not performed');
            });
        });
    });

    describe('empty folders', function () {
        it('empty folders should not return an error and be created', function () {
            const outputStream = new JSONOutputStream();
            apiMock.mockDelegate = new APIMockDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 1);

            return cfapp.apps.upload(__dirname + '/resources/DemoAppEmptyFolder/', {}, outputStream).then(function() {
                const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
                assert.equal(uploadedFiles.length, 1, 'all files should be uploaded');
                assert.equal(uploadedWhitepapers.length, 1, 'all whitepapers should be uploaded');
                assert.equal(uploadedWhitepapers[0].name, 'ProcessOrder', 'whitepaper "ProcessOrder" missing');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html',
                ], 'the files were not all uploaded');

                const createdFolders = apiMock.mockDelegate.createdFolders;
                assert.includeMembers(createdFolders, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images/',
                    'cloudflow://PP_FILE_STORE/DemoApp/docs/'
                ], 'the empty folders were not created');

                assert(nock.isDone(), 'expected requests not performed');
            });
        });
    });
}

module.exports = uploadTests;
