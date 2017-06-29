/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

function canRegisterApps(api) {
    // TODO: temporary implementation, use Cloudflow build number instead
    try {
        api.registry.cfapp.list(['name', 'equal to', 'something']);
    }
    catch(error) {
        if (error.message && error.message.match(/Unknown command/i) !== null) {
            return false;
        }
    }

    return true;
}


module.exports = canRegisterApps;
