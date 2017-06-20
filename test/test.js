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
const { assert } = require('chai');

class APIMockDelegate {
    constructor() {
        this._createSessionRequest = null;
        this._uploadedWhitepapers = [];
        this._deletedWhitepapers = [];
        this._deletedFiles = [];
        this._host = 'http://localhost:9090';
    }

    get host() {
        return this._host;
    }

    set host(value) {
        this._host = value;
    }

    get address() {
        return `${this._host}/portal.cgi`;
    }

    whitepaperUploaded(whitepaper) {
        this._uploadedWhitepapers.push(whitepaper);
    }

    get uploadedWhitepapers() {
        return this._uploadedWhitepapers;
    }

    whitepaperDeleted(whitepaper) {
        this._deletedWhitepapers.push(whitepaper);
    }

    get deletedWhitepapers() {
        return this._deletedWhitepapers;
    }

    get existingWhitepapers() {
        return [];
    }

    existingAssets(/*query*/) {
        return [];
    }

    existingFolders() {
        return [];
    }

    get deletedFiles() {
        return this._deletedFiles;
    }

    fileDeleted(file) {
        this._deletedFiles.push(file);
    }
}

class APIMock {

    constructor() {
        this.mockDelegate = new APIMockDelegate();
    }

    getSyncAPI() {
        let mockDelegate = this.mockDelegate;

        return {
            m_address: 'http://localhost:9090/portal.cgi',

            auth: {
                create_session: function(login, password) {
                    return {
                        session: `session_${login}_${password}`
                    };
                }
            },

            file: {
                delete_file: function(file) {
                    mockDelegate.fileDeleted(file);
                }
            },

            whitepaper: {
                list: function() {
                    return {
                        results: mockDelegate.existingWhitepapers
                    };
                },

                upload: function(whitepaper) {
                    mockDelegate.whitepaperUploaded(whitepaper);
                },

                delete: function(whitepaper) {
                    mockDelegate.whitepaperDeleted(whitepaper);
                }
            },

            asset: {
                list: function(query) {
                    return {
                        results: mockDelegate.existingAssets(query)
                    };
                }
            },

            folder: {
                list: function() {
                    return {
                        results: mockDelegate.existingFolders()
                    };
                }
            }
        };
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

const apiMock = new APIMock();
mock('cloudflow-api', apiMock);
const cfapp = require('../lib/cfapp');

describe('cfapp tests', function() {
    afterEach(function() {
        nock.cleanAll();
    });

    describe('cfapp application module', function() {
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

        describe('upload', function() {
            describe('default parameters', function() {
                it('nothing exists: should upload a single application completely', function() {
                    apiMock.mockDelegate = new APIMockDelegate();

                    const uploadedFiles = [];
                    getFileUploadMock(uploadedFiles, 4);

                    return cfapp.apps.upload('./resources/DemoApp/').then(function() {
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
                    });
                });

                it('existing workflow: should skip the workflow', function() {
                    apiMock.mockDelegate = new ExistingWhitepapersDelegate();

                    const uploadedFiles = [];
                    getFileUploadMock(uploadedFiles, 4);

                    return cfapp.apps.upload('./resources/DemoApp/').then(function() {
                        const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
                        assert.equal(uploadedFiles.length, 4, 'all files should be uploaded');
                        assert.equal(uploadedWhitepapers.length, 0, 'no whitepapers should be uploaded');
                        assert.includeMembers(uploadedFiles, [
                            'cloudflow://PP_FILE_STORE/DemoApp/images//linux.jpg',
                            'cloudflow://PP_FILE_STORE/DemoApp/images//mac.png',
                            'cloudflow://PP_FILE_STORE/DemoApp/images//win.png',
                            'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                        ], 'the files were not all uploaded');
                    });
                });

                it('existing files: should skip 2 files', function() {
                    apiMock.mockDelegate = new ExistingFilesDelegate();

                    const uploadedFiles = [];
                    getFileUploadMock(uploadedFiles, 2);

                    return cfapp.apps.upload('./resources/DemoApp/').then(function() {
                        const uploadedWhitepapers = apiMock.mockDelegate.uploadedWhitepapers;
                        assert.equal(uploadedFiles.length, 2, 'all files should be uploaded');
                        assert.equal(uploadedWhitepapers.length, 1, 'all whitepapers should be uploaded');
                        assert.equal(uploadedWhitepapers[0].name, 'ProcessOrder', 'whitepaper "ProcessOrder" missing');
                        assert.includeMembers(uploadedFiles, [
                            'cloudflow://PP_FILE_STORE/DemoApp/images//linux.jpg',
                            'cloudflow://PP_FILE_STORE/DemoApp/index.html'
                        ], 'the files were not all uploaded');
                    });
                });

            });

            describe('overwrite parameter', function() {
                it('existing workflow: should overwrite the workflow', function() {
                    apiMock.mockDelegate = new ExistingWhitepapersDelegate();

                    const uploadedFiles = [];
                    getFileUploadMock(uploadedFiles, 4);

                    return cfapp.apps.upload('./resources/DemoApp/', {
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
                    });
                });

                it('existing files: should overwrite 2 files', function() {
                    apiMock.mockDelegate = new ExistingFilesDelegate();

                    const uploadedFiles = [];
                    getFileUploadMock(uploadedFiles, 4);

                    return cfapp.apps.upload('./resources/DemoApp/', {
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
                    });
                });
            });

            describe('multiple apps', function() {
                it('nothing exists: should upload a all the applications completely', function() {
                    apiMock.mockDelegate = new APIMockDelegate();

                    const uploadedFiles = [];
                    getFileUploadMock(uploadedFiles, 12);

                    return cfapp.apps.upload('./resources/MultipleApps/').then(function() {
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
                    });
                });
            });
        });
    });
});
