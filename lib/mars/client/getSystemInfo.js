/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */
'use strict';
const getSerial = require('./getSerial.js');
const ConsoleOutputStream = require('../../util/ConsoleOutputStream.js');

function getSystemInfo (api, marsUrlOption, outputStream = new ConsoleOutputStream()) {
    outputStream.writeLine('get system info');
    const license = api.license.get();
    const site = license.current_site;
    const customerCode = license.customer_code;
    const serial = getSerial(api);

    const marsPreferences = api.preferences.get_for_realm('system', '', 'com.nixps.mars', '');
    const { serverURL } = marsPreferences.preferences;
    const marsURL = marsUrlOption || serverURL;

    return {
        site,
        customerCode,
        serial,
        serverUrl: marsURL
    }
}

module.exports = getSystemInfo;