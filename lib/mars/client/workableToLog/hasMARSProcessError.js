/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */
'use strict';
const _ = require('lodash');

function hasMARSProcessError (workable) {
    if (_.isPlainObject(workable.variables.processInfo)) {
        var processInfo = workable.variables.processInfo;

        if (typeof processInfo.errorCode === 'string' &&
            processInfo.errorCode.length > 0) {
            return true;
        }

        if (typeof processInfo.errorMessage === 'string' &&
            processInfo.errorMessage.length > 0) {
            return true;
        }
    }

    return false;
}

module.exports = hasMARSProcessError;
