/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */
'use strict';
const request = require('request');

const {
    MARSCommunicationError,
    MARSServiceError,
    NoSuchRemoteAppError
} = require('../Errors.js');

/**
 * Returns the app info from the list call
 */
function getAppListInfo(host, customerCode, serial, site, language) {
    var postedQuery = JSON.stringify({
        customer_code: customerCode,
        serial: serial,
        site: site,
        language: language
    });

    return new Promise(function (resolve, reject) {
        request.post({
            url: `${host}/portal.cgi?http_service=list&whitepaper=Mars`,
            body: postedQuery
        }, function (value, response) {
            if (! response) {
                reject(new MARSCommunicationError(`${host}/list, response: ${response}`));
                return;
            }

            if (response.statusCode !== 200) {
                reject(new MARSCommunicationError(`${host}/list, response: ${response.statusCode}`));
                return;
            }

            const parsedResponse = JSON.parse(response.body);
            if (parsedResponse.error) {
                reject(new MARSServiceError(parsedResponse));
                return;
            }

            const appListInfo = parsedResponse.results;
            resolve(appListInfo);
        });
    });
}

module.exports = getAppListInfo;
