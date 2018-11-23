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

console.debug = function (){};
console.verbose = function (c)
{
    try{
          throw new Error
    }catch(d){
        var my_line=d.stack.split('\n')[2];//.trim().substring(3).replace(__dirname,'').replace(/\s\(./,' at ').replace(/\)/,'');
        my_line=' (D) '+my_line.substring(14).replace('/Users/nickderoeck/Repos/cfapp/','');    
        console.log((new Date()).toISOString()+my_line + ': ' + c);
    }
}

// Else use it as a command-line app
const yargs = require('yargs');
const packageJSON = require('../package.json');
// const commands = ['app', 'config', 'cloudflow', 'version'];

const commandLineParser = yargs
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
    }, function(/*yargs*/) {
        console.log(packageJSON.version);
    })
    .epilog(`Version ${packageJSON.version}`)
    .boolean('v')
    .alias('v', 'verbose')
    .describe('v', 'Verbose logging')
    .alias('h','help')
    .demandCommand()
    .help();

    if (commandLineParser.argv.verbose)
    {
    // enable verbose logging
    console.debug=console.verbose;
    }
    
    // Parse the command line
    const argv = commandLineParser
    .commandDir('commands') 
    .argv;

// Check if the command was parsed correctly
// if (argv._[0]) {
//     if (argv._[0] === 'app' && argv._[1]) {
//         const subcommand = argv._[1];
//         if (['download', 'upload', 'list', 'init', 'remove', 'update'].indexOf(subcommand) < 0) {
//             // If we arrive here, the command was not processed, unknown command
//             console.log('Unknown command');
//             commandLineParser.showHelp();
//             process.exit(1);
//         }
//     }
//     else if (argv._[0] === 'install' || argv._[0] === 'upload'  || argv._[0] === 'download') {
//         // This is already caught elsewere
//     }
//     else {
//         console.log('Unknown command');
//         commandLineParser.showHelp();
//         process.exit(1);
//     }
// }
