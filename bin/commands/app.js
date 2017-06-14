/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */


'use strict';

module.exports = {
    command: 'app <command>',
    desc: 'Installs and downloads Cloudflow Apps',
    builder: function(yargs) {
        return yargs.commandDir('app');
    },
    handler: function() {}
};
