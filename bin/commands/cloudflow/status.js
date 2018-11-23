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
    command: 'status',
    desc: 'Status report',
    builder: {},
    handler: function() {
        console.log(JSON.stringify(get_status(), null, 2));
    }
}

function get_status()
{
    var systeminfo=require("../../../lib/systeminfo.js");

    var os = systeminfo.get_os_info();
    var cloudflow = systeminfo.get_cloudflow_info(os);
    var adobe = systeminfo.get_adobe_info(os);
    return {
        os: os,
        cloudflow: cloudflow,
        adobe: adobe
    }
}
