/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */
'use strict';
const cloudflowAPI = require('cloudflow-api');
const kMarsClientWhitepaper = require('./constants.js').kMarsClientWhitepaper;
const ConsoleOutputStream = require('../util/ConsoleOutputStream.js');
const getWorkableProgress = require('./client/getWorkableProgress.js');
const {CouldNotRemoveAppError} = require('./Errors.js');

async function removeApp (appName, hardRemove, options, outputStream = new ConsoleOutputStream()) {
    // Get a Cloudflow API for the remote host and set the session
    const api = cloudflowAPI.getSyncAPI(options.host);
    if (typeof options.session === 'string' && options.session.length > 0) {
        api.m_session = options.session;
    } else {
        const session = api.auth.create_session(options.login, options.password).session;
        api.m_session = session;
    }

    if (hardRemove) {
        outputStream.writeLine(`removing application: ${appName}, removing files and workflows`);
        const result = api.hub.start_from_whitepaper_with_variables(kMarsClientWhitepaper, 'removeApp', {
            appName: appName
        });
    
        const workableId = result.workable_id;
        return getWorkableProgress(api, workableId, outputStream);
    }
    
    outputStream.writeLine(`removing application: ${appName}, keeping files and workflows`);
    return new Promise(function (resolve, reject) {
        try {
            api.registry.cfapp.delete_by_query(['name', 'equal to', appName], undefined);
            resolve();
        } catch (error) {
            reject(new CouldNotRemoveAppError(error));
        }
    });
}

module.exports = removeApp;