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
    command: 'download [directory]',
    desc: 'Downloads an app from a Cloudflow installation to directory',
    builder: function(yargs) {
        yargs.example('$0 app download /app_path/', 'downloads the app described in /app_path/project.cfapp');
    },
    handler: function() {
        console.log('[exec] list the cloudflow builds');
    }
};
