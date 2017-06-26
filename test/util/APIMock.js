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
                },

                download: function(whitepaper) {
                    mockDelegate.whitepaperDownloaded(whitepaper);
                    return {
                        contents: 'contents'
                    };
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
                list: function(query) {
                    return {
                        results: mockDelegate.existingFolders(query)
                    };
                }
            },

            application: {
                list: function() {
                    return mockDelegate.applicationList();
                }
            }
        };
    }
}

module.exports = APIMock;
