/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */


'use strict';

var frame=require("../../../lib/libframe.js");

module.exports = {
    command: 'create_installer <software_folder> <output_location>',
    desc: 'Creates a .pkg installer',
    builder: function (yargs) {
        yargs.example('$0 frame create_installer', 'creates an installer')
            .example('$0 frame create_installer --nosign', 'creates an installer without signing')
            .option('nosign', {
                describe: 'skips the code signsing of the installer',
                default: false
            })
    },
    handler: function (argv) {
        if (argv.nosign) {
            frame.create_installer_nosign(argv);
        } else {
            frame.create_installer(argv);
        }
    }
};