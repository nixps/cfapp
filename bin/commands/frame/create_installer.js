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
    builder: {},
    handler: frame.create_installer
};