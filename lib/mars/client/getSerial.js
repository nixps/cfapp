/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */
'use strict';
const {CouldNotRetrieveSerialError} = require('../Errors.js');

function getSerial (api) {
    try {
        const result = api.database.document.list('nucleus.config', ["blob", "equal to", "license"]);
        return result.documents[0].serial;
    } catch (error) {
        throw new CouldNotRetrieveSerialError(error);
    }
}

module.exports = getSerial;