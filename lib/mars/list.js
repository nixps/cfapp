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
const ConsoleOutputStream = require('../util/ConsoleOutputStream.js');
const getSystemInfo = require('./client/getSystemInfo.js');
const getAppList = require('./server/getAppList.js');

async function list (options, outputStream = new ConsoleOutputStream()) {
    // Get a Cloudflow API for the remote host and set the session
    const api = cloudflowAPI.getSyncAPI(options.host);
    if (typeof options.session === 'string' && options.session.length > 0) {
        api.m_session = options.session;
    } else {
        const session = api.auth.create_session(options.login, options.password).session;
        api.m_session = session;
    }

    const systemInfo = getSystemInfo(api, options.marsurl, outputStream);
    const marsURL = systemInfo.serverUrl;
    const customerCode = systemInfo.customerCode;
    const serial = systemInfo.serial;
    const site = systemInfo.site;
    const appListInfo = await getAppList(marsURL, customerCode, serial, site, 'en');

    return appListInfo;
}

module.exports = list;