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
const getSystemInfo = require('./client/getSystemInfo.js');
const getAppInfo = require('./server/getAppInfo.js');
const {
    ApplicationNotInstalledError
} = require('../apps/Errors.js');
const isClientReady = require('./client/isClientReady.js');

async function updateApp (appName, options, outputStream = new ConsoleOutputStream()) {
    // Get a Cloudflow API for the remote host and set the session
    const api = cloudflowAPI.getSyncAPI(options.host);
    if (typeof options.session === 'string' && options.session.length > 0) {
        api.m_session = options.session;
    } else {
        const session = api.auth.create_session(options.login, options.password).session;
        api.m_session = session;
    }

    const registry = api.registry.cfapp.list(['name', 'equal to', appName]).results;
    if (registry.length === 0) {
        throw new ApplicationNotInstalledError(appName);
    }
   
    outputStream.writeLine(`checking if client is ready for MARS operations, timeout: ${options.timeout}s`);
    await isClientReady(api, options.timeout);

    const systemInfo = getSystemInfo(api, options.marsurl, outputStream);
    const appInfo = await getAppInfo(systemInfo, appName, options.forceversion, outputStream);
    const appVersion = appInfo.appVersion;
    const downloadUrl = appInfo.downloadUrl;
    const marsURL = systemInfo.serverUrl;
    const site = systemInfo.site;
    const customerCode = systemInfo.customerCode;

    outputStream.writeLine(`updating to ${appName}@${appVersion} as ${customerCode} from ${marsURL}`);
    outputStream.writeLine('start updating application');
    const result = api.hub.start_from_whitepaper_with_variables(kMarsClientWhitepaper, 'updateApp', {
        appName: appName,
        appVersion: appVersion,
        downloadURL: downloadUrl,
        marsURL: marsURL,
        site: site
    });

    outputStream.writeLine('update started, waiting till it finishes');
    outputStream.writeLine(`timeout: ${options.timeout}s`);

    const workableId = result.workable_id;
    return getWorkableProgress(api, workableId, options.timeout, outputStream);
}

module.exports = updateApp;