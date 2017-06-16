#! /usr/bin/env node

/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

// Else use it as a command-line app
const yargs = require('yargs');
const packageJSON = require('../package.json');
const commands = ['app', 'config', 'cloudflow', 'version'];

var argv = yargs
    .command('install [directory]', false, function() {
    }, function(yargs) {
        console.log(`use "app upload ${yargs.directory ? yargs.directory : ''}" instead`);
    })
    .command('upload [directory]', false, function() {
    }, function(yargs) {
        console.log(`use "app upload ${yargs.directory ? yargs.directory : ''}" instead`);
    })
    .command('download [directory]', false, function() {
    }, function(yargs) {
        console.log(`use app download "${yargs.directory ? yargs.directory : ''}" instead`);
    })
    .command('version', 'shows the version of the cfapp tool', function() {
    }, function(yargs) {
        console.log(packageJSON.version);
    })
    .epilog(`Version ${packageJSON.version}`)
    .commandDir('commands')
    .demandCommand()
    .help()
    .argv;

if (!argv._[0] || commands.indexOf(argv._[0]) === -1) {
    console.log('Valid commands are: ' + commands.join(' '));
    process.exit(1);
}
