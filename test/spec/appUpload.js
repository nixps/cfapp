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


class ExistingWhitepapersDelegate extends APIMockDelegate {
    get existingWhitepapers() {
        return [ {
            name: 'ProcessOrder'
        }];
    }
}

class ExistingFilesDelegate extends APIMockDelegate {
    existingAssets(query) {
        if (query[2] === 'cloudflow://PP_FILE_STORE/DemoApp/images//win.png') {
            return [{
                _id: 'I exist',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DemoApp/images/win.png'
                }
            }];
        }
        else if (query[2] === 'cloudflow://PP_FILE_STORE/DemoApp/images//mac.png') {
            return [{
                _id: 'I exist too',
                cloudflow: {
                    file: 'cloudflow://PP_FILE_STORE/DemoApp/images/mac.png'
                }
            }];
        }

        return [];
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

function uploadTests() {
    describe('default parameters', function() {
        it('nothing exists: should upload a single application completely', function() {
            apiMock.mockDelegate = new APIMockDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 4);

            return cfapp.apps.upload(__dirname + '/resources/DemoApp/').then(function() {
                const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
                assert.equal(uploadedFiles.length, 4, 'all files should be uploaded');
                assert.equal(uploadedWhitepapers.length, 1, 'all whitepapers should be uploaded');
                assert.equal(uploadedWhitepapers[0].name, 'ProcessOrder', 'whitepaper "ProcessOrder" missing');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images//linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp/images//mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images//win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'the files were not all uploaded');

                assert(nock.isDone(), 'expected requests not performed');
            });
        });

        it('existing workflow: should skip the workflow', function() {
            apiMock.mockDelegate = new ExistingWhitepapersDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 4);

            return cfapp.apps.upload(__dirname + '/resources/DemoApp/').then(function() {
                const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
                assert.equal(uploadedFiles.length, 4, 'all files should be uploaded');
                assert.equal(uploadedWhitepapers.length, 0, 'no whitepapers should be uploaded');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images//linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp/images//mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images//win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'the files were not all uploaded');

                assert(nock.isDone(), 'expected requests not performed');
            });
        });

        it('existing files: should skip 2 files', function() {
            apiMock.mockDelegate = new ExistingFilesDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 2);

            return cfapp.apps.upload(__dirname + '/resources/DemoApp/').then(function() {
                const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
                assert.equal(uploadedFiles.length, 2, 'all files should be uploaded');
                assert.equal(uploadedWhitepapers.length, 1, 'all whitepapers should be uploaded');
                assert.equal(uploadedWhitepapers[0].name, 'ProcessOrder', 'whitepaper "ProcessOrder" missing');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images//linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'the files were not all uploaded');

                assert(nock.isDone(), 'expected requests not performed');
            });
        });

    });

    describe('overwrite parameter', function() {
        it('existing workflow: should overwrite the workflow', function() {
            apiMock.mockDelegate = new ExistingWhitepapersDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 4);

            return cfapp.apps.upload(__dirname + '/resources/DemoApp/', {
                overwrite: true
            }).then(function() {
                const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
                const deletedWhitepapers = apiMock.mockDelegate.deletedWhitepapers;
                assert.equal(uploadedFiles.length, 4, 'all files should be uploaded');
                assert.equal(deletedWhitepapers.length, 1, 'one whitepaper should be deleted');
                assert.equal(uploadedWhitepapers.length, 1, 'all whitepapers should be uploaded');
                assert.equal(uploadedWhitepapers[0].name, 'ProcessOrder', 'whitepaper "ProcessOrder" missing');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images//linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp/images//mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images//win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'the files were not all uploaded');

                assert(nock.isDone(), 'expected requests not performed');
            });
        });

        it('existing files: should overwrite 2 files', function() {
            apiMock.mockDelegate = new ExistingFilesDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 4);

            return cfapp.apps.upload(__dirname + '/resources/DemoApp/', {
                overwrite: true
            }).then(function() {
                const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
                const deletedFiles = apiMock.mockDelegate.deletedFiles;
                assert.equal(deletedFiles.length, 2, '2 files should be deleted');
                assert.equal(uploadedFiles.length, 4, 'all files should be uploaded');
                assert.equal(uploadedWhitepapers.length, 1, 'all whitepapers should be uploaded');
                assert.equal(uploadedWhitepapers[0].name, 'ProcessOrder', 'whitepaper "ProcessOrder" missing');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp/images//linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp/images//mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/images//win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                ], 'the files were not all uploaded');

                assert(nock.isDone(), 'expected requests not performed');
            });
        });
    });

    describe('multiple apps', function() {
        it('nothing exists: should upload a all the applications completely', function() {
            apiMock.mockDelegate = new APIMockDelegate();

            const uploadedFiles = [];
            getFileUploadMock(uploadedFiles, 12);

            return cfapp.apps.upload(__dirname + '/resources/MultipleApps/').then(function() {
                const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
                assert.equal(uploadedFiles.length, 12, 'all files should be uploaded');
                assert.equal(uploadedWhitepapers.length, 3, 'all whitepapers should be uploaded');
                assert.includeMembers(uploadedWhitepapers.map(e => e.name), [
                    'ProcessOrder1',
                    'ProcessOrder2',
                    'ProcessOrder3'
                ], 'the workflows were not all uploaded');
                assert.includeMembers(uploadedFiles, [
                    'cloudflow://PP_FILE_STORE/DemoApp1/images//linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp1/images//mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp1/images//win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp1/index.html',
                    'cloudflow://PP_FILE_STORE/DemoApp2/images//linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp2/images//mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp2/images//win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp2/index.html',
                    'cloudflow://PP_FILE_STORE/DemoApp3/images//linux.jpg',
                    'cloudflow://PP_FILE_STORE/DemoApp3/images//mac.png',
                    'cloudflow://PP_FILE_STORE/DemoApp3/images//win.png',
                    'cloudflow://PP_FILE_STORE/DemoApp3/index.html'
                ], 'the files were not all uploaded');

                assert(nock.isDone(), 'expected requests not performed');
            });
        });
    });
}

module.exports = uploadTests;
