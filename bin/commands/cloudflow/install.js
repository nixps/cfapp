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
    command: 'install <software_folder>',
    desc: 'Installs a Cloudflow build',
    builder: {},
    handler: function(argv) {
        cloudflow_install(argv);
    }
};

async function cloudflow_install(argv)
{
    var systeminfo=require("../../../lib/systeminfo.js");
    var os = systeminfo.get_os_info();

    console.log('Installing '+argv.software_folder);

    const fs = require('fs');
    try
    {
        if (fs.lstatSync(argv.software_folder).isDirectory()===true) {}
    } catch(e)    
    {
        console.error(argv.software_folder+" is not a CLOUDFLOW software folder");
        return;
    }

    var setup=
    {
        "app_folder": argv.software_folder,
        "options": {}
    };

    // nucleusd --noservice [--json] [-i SERVER_ID] [-d DATABASE_IP[:PORT]] [-p PORT] [-s] [--launchmongo] [-g] [--ssl cert+key.pem]
    var options=['--noservice','--json','-i','-d','-p','-s','--launchmongo','-g','--ssl'];

    for (var idx in options)
    {
        var option=options[idx].replace(/-/g,'');
        
        if (argv.hasOwnProperty(option))
            setup.options[options[idx]]=argv[option];
    }

    var cloudflow = systeminfo.put_cloudflow_info(os,setup);

    console.debug(JSON.stringify(cloudflow));

}