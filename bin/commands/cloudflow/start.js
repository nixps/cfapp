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
    command: 'start',
    desc: 'Starts the installed Cloudflow',
    builder: {},
    handler: function() {
        var systeminfo=require("../../../lib/systeminfo.js");
        var cloudflow = systeminfo.get_cloudflow_info();

        console.log("Running " + cloudflow.version);
        console.log("from "+cloudflow.app_folder);

        const { execSync } = require('child_process'); 
        let input = execSync(cloudflow.nucleusd+" --launchmongo");
    }
};
