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

/*
console._log=console.log;
console.log= function ()
{
    //var caller_line = (new Error).stack.split("\n")[3].split("(")[1].split(")")[0];
    var caller_line="";   

    Array.prototype.unshift.call(arguments, new Date().toISOString()+" I "+caller_line);
    console._log.apply(null, arguments);
};

console._error=console.error;
console.error= function ()
{
    //var caller_line = (new Error).stack.split("\n")[2].split("(")[1].split(")")[0];
    var caller_line="";   

    Array.prototype.unshift.call(arguments, new Date().toISOString()+" E "+caller_line);
    console._error.apply(null, arguments);
};
*/
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
    .command('app', 'Installs and downloads Cloudflow Apps', function() {}, function() {})
    .command('cloudflow', 'Manages Cloudflow installations', function() {}, function() {})
    .command('frame', 'Manages Frame installations', function() {}, function() {})
    .command('mars', 'Installs and downloads MARS apps', function() {}, function() {})
    .command('version', 'shows the version of the cfapp tool', function() {
    }, function(/*yargs*/) {
        console.log(packageJSON.version);
    })
    .epilog(`Version ${packageJSON.version}`)
    .boolean('v')
    .alias('v', 'verbose')
    .describe('v', 'Verbose logging')
    .alias('h','help')
    .demandCommand();

// Parse the command line
const argv = commandLineParser
    .commandDir('commands') 
    .argv;


// Check if the command was parsed correctly
if (argv._[0]) {
    console.log('Unknown command');
    commandLineParser.showHelp();
    process.exit(1);
}
