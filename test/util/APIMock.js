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
const _ = require('lodash');

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

            database: {
                document: {
                    list: function (collection, query) {
                        if (collection === 'nucleus.config') {
                            return {
                                documents: [{
                                    serial: '123456'
                                }]
                            };
                        }
                    }
                }
            },

            preferences: {
                get_for_realm: function () {
                    return {
                        preferences: {
                            serverURL: 'http://the-mars-server.com'
                        }
                    };
                }
            },

            hub: {
                start_from_whitepaper_with_variables: function (whitepaper, input, variables, cb) {
                    const workable = mockDelegate.createNewWorkable(whitepaper, input, variables);
                    if (cb) {
                        cb(workable);
                    }
                    return workable;
                }
            },

            bluecollardefinition: {
                list: function (query, fields, cb, cberr) {
                    const result = mockDelegate.getBlueCollarDefinitions(query)
                    if (cb) {
                        cb({
                            results: result
                        });
                    }
                    return {
                        results: result
                    };
                }
            },

            workable: {
                get_progress: function (wpid, cb) {
                    const result = mockDelegate.getWorkableProgress(wpid)
                    if (cb) {
                        cb(result);
                    }
                    return result;
                },

                get: function (wpid, cb) {
                    const result = mockDelegate.getWorkable(wpid)
                    if (cb) {
                        cb(result);
                    }
                    return result;
                },

                list: function (query, fields, cb) {
                    const result = mockDelegate.listWorkables(query, fields)
                    const response = { 
                        results: result 
                    };
                    if (cb) {
                        cb(response);
                    }
                    return response;
                }
            },

            file: {
                delete_file_with_options: function(file, options, cb, errorcb) {
                    const error = mockDelegate.fileDeletedError(file);
                    if (error) {
                        errorcb(error);
                        return;
                    }

                    if (cb) {
                        cb();
                    }
                    mockDelegate.fileDeleted(file);
                },

                does_exist: function(url, cb, errorcb) {
                    const result = mockDelegate.doesExist(url);
                    if (cb && result.error === undefined) {
                        cb(result);
                    } else  if (errorcb && result.error !== undefined) {
                        errorcb(result);
                    }
                    return result;
                },

                delete_folder_with_options: function(url, options, cb, errorcb) {
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
                get: function(id, cb, errorCb) {
                    const whitepapers = mockDelegate.existingWhitepapers();
                    const whitepaper = _.find(whitepapers, function (w) {
                        return w._id === id;
                    });
                    if (whitepaper !== undefined) {
                        mockDelegate.whitepaperGet(whitepaper);
                        if (cb) {
                            cb(whitepaper);
                        }
                        return whitepaper;
                    }

                    const error = {
                        error: `Object Not Found: type whitepapers, id = ${id}`,
                        error_code: `unknown`
                    }

                    if (errorCb) {
                        errorCb(error);
                    } else {
                        throw new Error(error)
                    }
                },

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
                },

                create: function (whitepaper, cb) {
                    mockDelegate.whitepaperCreated(whitepaper);
                    if (cb) {
                        cb(whitepaper);
                    }
                    return whitepaper;
                },

                update: function (whitepaper, cb) {
                    mockDelegate.whitepaperUpdated(whitepaper);
                    if (cb) {
                        cb(whitepaper);
                    }
                    return whitepaper;
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
                    },
                    delete_by_query: function(query, cb) {
                        mockDelegate.applicationDeletedByQuery(query);
                        if (cb) {
                            cb();
                        }
                    }
                }
            },

            portal: {
                get_file_store_mappings: function(workServer, cb) {
                    const result = mockDelegate.getFileStoreMappings(workServer);
                    if(cb) {
                        cb(result);
                    }
                    return result;
                },

                version: function(cb) {
                    const result = mockDelegate.getVersion();
                    if (cb) {
                        cb(result);
                    }
                    return result;
                }
            },

            license: {
                get: function (cb) {
                    const license = mockDelegate.getLicense();

                    if (cb) {
                        cb(license);
                    }
                    return license;
                }
            }
        };
    }
}

module.exports = APIMock;
