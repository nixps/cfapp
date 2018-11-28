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
    command: 'uninstall',
    desc: 'Uninstalls the installed Cloudflow',
    builder: {},
    handler: function() {
        var systeminfo=require("../../../lib/systeminfo.js");
        var cloudflow = systeminfo.get_cloudflow_info();

        console.log("Uninstalling " + cloudflow.version);

        try
        {
            if (cloudflow.setup.run_as_service)
            {
                var command=cloudflow.nucleusd+" --uninstall";
                console.log(command);

                const { execSync } = require('child_process'); 
                let input = execSync(command);
                console.log(input.toString());
            } else
            {
                console.log("Not running as a service, this doesn't do anything...")
            }
        } catch(e)
        {
            
        }
    }
};
