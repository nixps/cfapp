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
const {ApplicationAlreadyInstalledError} = require('../apps/Errors.js');
const getSystemInfo = require('./client/getSystemInfo.js');
const getAppInfo = require('./server/getAppInfo.js');

async function installApp (appName, options, outputStream = new ConsoleOutputStream()) {
    // Get a Cloudflow API for the remote host and set the session
    const api = cloudflowAPI.getSyncAPI(options.host);
    if (typeof options.session === 'string' && options.session.length > 0) {
        api.m_session = options.session;
    } else {
        const session = api.auth.create_session(options.login, options.password).session;
        api.m_session = session;
    }

    const registry = api.registry.cfapp.list(['name', 'equal to', appName]).results;
    if (registry.length > 0) {
        throw new ApplicationAlreadyInstalledError(appName);
    }

    const systemInfo = getSystemInfo(api, options.marsurl, outputStream);
    const appInfo = await getAppInfo(systemInfo, appName, options.forceversion, outputStream);
    const appVersion = appInfo.appVersion;
    const downloadUrl = appInfo.downloadUrl;
    const marsURL = systemInfo.serverUrl;
    const site = systemInfo.site;
    const customerCode = systemInfo.customerCode;
    const youAreOwner = appInfo.owner;
    
    outputStream.writeLine(`installing ${appName}@${appVersion} as ${customerCode} from ${marsURL}`);
    outputStream.writeLine('start installing application');
    outputStream.writeLine(`timeout: ${options.timeout}s`);
    let result = null;
    if (youAreOwner) {
        const changeset = appInfo.changeset;
        result = api.hub.start_from_whitepaper_with_variables(kMarsClientWhitepaper, 'installAppForDevelopment', {
            appName: appName,
            appVersion: appVersion,
            downloadURL: downloadUrl,
            marsURL: marsURL,
            site: site,
            changeset: changeset
        });
    } else {
        result = api.hub.start_from_whitepaper_with_variables(kMarsClientWhitepaper, 'installApp', {
            appName: appName,
            appVersion: appVersion,
            downloadURL: downloadUrl,
            marsURL: marsURL,
            site: site
        });
    }

    outputStream.writeLine('installation started, waiting till it finishes');

    const workableId = result.workable_id;
    return getWorkableProgress(api, workableId, options.timeout, outputStream);
}

module.exports = installApp;