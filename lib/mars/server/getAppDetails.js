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
    MARSServiceError
} = require('../Errors.js');

/**
 * Helper for getting the application details
 */
function getAppDetails(host, name, version, customerCode, serial, site, language) {
    var postedQuery = JSON.stringify({
        name: name,
        version: version,
        customer_code: customerCode,
        serial: serial,
        site: site,
        language: language
    });

    return new Promise(function (resolve, reject) {
        request.post({
            url: `${host}/portal.cgi?http_service=details&whitepaper=Mars`,
            body: postedQuery
        }, function (value, response) {
            if (! response) {
                reject(new MARSCommunicationError(`${host}/details(${name}, ${version}), response: ${response.statusCode}`));
                return;
            }

            if (response.statusCode !== 200) {
                reject(new MARSCommunicationError(`${host}/details(${name}, ${version}), response: ${response.statusCode}`));
                return;
            }

            const parsedResponse = JSON.parse(response.body)
            if (parsedResponse.error) {
                reject(new MARSServiceError(parsedResponse));
                return;
            }

            resolve(parsedResponse.data);
        });
    });
 }

module.exports = getAppDetails;
