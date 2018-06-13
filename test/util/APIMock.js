/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

const APIMockDelegate = require('./APIMockDelegate');

/**
 * This class is used to mock the cloudflow-api for testing purposes
 */
class APIMock {

    constructor() {
        this.mockDelegate = new APIMockDelegate();
    }

    getAsyncAPI() {
        return this.getSyncAPI();
    }

    getSyncAPI() {
        let mockDelegate = this.mockDelegate;

        return {
            m_address: 'http://localhost:9090/portal.cgi',

            auth: {
                create_session: function(login, password, cb) {
                    mockDelegate.sessionCreated(login, password);
                    const result = {
                        session: `session_${login}_${password}`
                    };

                    if (cb) {
                        cb(result);
                    }
                    return result;
                }
            },

            file: {
                delete_file_with_options: function(file, options, cb) {
                    if (cb) {
                        cb();
                    }
                    mockDelegate.fileDeleted(file);
                },

                does_exist: function(url, cb) {
                    if (cb) {
                        cb(mockDelegate.doesExist(url));
                    }
                    return mockDelegate.doesExist(url);
                },

                delete_folder_with_options: function(url, options, cb) {
                    if (cb) {
                        cb();
                    }
                    mockDelegate.folderDeleted(url);
                },

                create_folder: function (inside, folder, cb) {
                    const parts = folder.split('/');
                    const encodedParts = parts.map(p => encodeURIComponent(p));
                    const createdFolder = inside + encodedParts.join('/');

                    if (cb) {
                        cb({
                            created_folder: createdFolder
                        });
                    }

                    mockDelegate.folderCreated(createdFolder);
                }
            },

            whitepaper: {
                list: function(query, not_used, cb) {
                    const result = {
                        results: mockDelegate.existingWhitepapers(query)
                    };
                    if (cb) {
                        cb(result);
                    }
                    return result;
                },

                upload: function(whitepaper, cb) {
                    mockDelegate.whitepaperUploaded(whitepaper);
                    if (cb) {
                        cb();
                    }
                },

                delete: function(whitepaper, cb) {
                    mockDelegate.whitepaperDeleted(whitepaper);
                    if (cb) {
                        cb();
                    }
                },

                download: function(whitepaper, cb) {
                    mockDelegate.whitepaperDownloaded(whitepaper);
                    const result = {
                        contents: 'contents'
                    };
                    if (cb) {
                        cb(result);
                    }
                    return result;
                }
            },

            asset: {
                list: function(query, not_used, cb) {
                    if (Array.isArray(query) === false) {
                        throw new Error('asset.list: query that is passed is not an array');
                    }
                    query.forEach((element) => {
                        if (typeof element !== 'string') {
                            throw new Error('asset.list: element of query that is passed is not a string');
                        }
                    });

                    const result = {
                        results: mockDelegate.existingAssets(query)
                    };
                    if (cb) {
                        cb(result);
                    }
                    return result;
                }
            },

            folder: {
                list: function(query, cb) {
                    const result = {
                        results: mockDelegate.existingFolders(query)
                    };
                    if (cb) {
                        cb(result);
                    }
                    return result;
                }
            },

            registry: {
                cfapp: {
                    list: function(query, cb) {
                        const result = {
                            results: mockDelegate.applicationList(query)
                        };
                        if (cb) {
                            cb(result);
                        }
                        return result;
                    },
                    create: function(app, cb) {
                        mockDelegate.applicationCreated(app);
                        if (cb) {
                            cb();
                        }
                    },
                    delete: function(appid, cb) {
                        mockDelegate.applicationDeleted(appid);
                        if (cb) {
                            cb();
                        }
                    }
                }
            },

            portal: {
                version: function(cb) {
                    const result = {
                        build: 'cloudflow_version'
                    };
                    if (cb) {
                        cb(result);
                    }
                    return result;
                }
            }
        };
    }
}

module.exports = APIMock;
