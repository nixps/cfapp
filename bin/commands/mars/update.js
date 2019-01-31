/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */


'use strict';
const { mars } = require('../../../lib/cfapp');
const ConsoleOutputStream = require('../../../lib/util/ConsoleOutputStream');
const JSONOutputStream = require('../../../lib/util/JSONOutputStream');

module.exports = {
    command: 'update <appname>',
    desc: 'Updates an application that was installed from MARS',
    builder: function(yargs) {
        yargs
            .example('$0 mars update myapp --host "http://localhost:9090" --login admin --password pw', 'updates the MARS application the id "myapp"')
            .option('host', {
                describe: 'the host where the MARS application must be installed'
            })
            .option('login', {
                alias: 'user',
                describe: 'the Cloudflow user that will execute this command'
            })
            .option('password', {
                describe: 'the password of the Cloudflow user that will execute this command'
            })
            .option('session', {
                describe: 'the session key that is used for the Cloudflow api calls, when passed it overrides login and password'
            })
            .option('marsurl', {
                describe: 'overrides the MARS server url in the Cloudflow settings'
            })
            .option('forceversion', {
                describe: 'will install the specified version'
            })
            .option('json', {
                describe: 'outputs the result as JSON',
                default: false
            });
        
    },
    handler: function(argv) {
        const appName = argv.appname

        const options = {
            overwrite: argv.overwrite,
            host: argv.host,
            login: argv.login,
            password: argv.password,
            session: argv.session,
            marsurl: argv.marsurl,
            forceversion: argv.forceversion
        };

        let outputStream = new ConsoleOutputStream();
        if (argv.json === true) {
            outputStream = new JSONOutputStream();
        }

        mars.update(appName, JSON.parse(JSON.stringify(options)), outputStream).then(function() {
            if (argv.json === true) {
                console.log(JSON.stringify({
                    lines: outputStream.outputLines
                }));
            }
        }).catch(function(error) {
            if (argv.json === true) {
                console.log(JSON.stringify({
                    lines: outputStream.outputLines,
                    error: {
                        message: error.toString(),
                        code: error.errorCode
                    }
                }));
            }
            else {
                console.log(error.stack);
            }
        });
    }
};
