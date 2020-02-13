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
    command: 'download <appname> [directory]',
    desc: 'Downloads an application from MARS',
    builder: function(yargs) {
        yargs
            .example('$0 mars download myapp --host http://localhost:9090 --login admin --password admin', 'downloads myapp from MARS to the current directory using the credentials and MARS settings of the Cloudflow running on localhost')
            .option('host', {
                describe: 'the host to use for the MARS credentials'
            })
            .option('login', {
                alias: 'user',
                describe: 'the login of the Cloudflow user to authenticate with the Cloudflow server'
            })
            .option('password', {
                describe: 'the password of the Cloudflow user'
            })
            .option('session', {
                describe: 'the session key that is used for the Cloudflow api calls, when passed it overrides login and password'
            })
            .option('marsurl', {
                describe: 'overrides the MARS server url in the Cloudflow settings'
            })
            .option('version', {
                describe: 'the version of the app to download, last available if not specified'
            })
            .option('json', {
                describe: 'outputs the result as JSON',
                default: false
            });
        
    },
    handler: function(argv) {
        const appName = argv.appname

        const options = {
            host: argv.host,
            login: argv.login,
            password: argv.password,
            session: argv.session,
            marsurl: argv.marsurl,
            forceversion: argv.version,
            forcelastversion: argv.forcelastversion,
            directory: argv.directory || '.'
        };

        let outputStream = new ConsoleOutputStream();
        if (argv.json === true) {
            outputStream = new JSONOutputStream();
        }

        return mars.download(appName, JSON.parse(JSON.stringify(options)), outputStream).then(function() {
            if (argv.json === true) {
                console.log(JSON.stringify({
                    lines: outputStream.outputLines
                }));
            }
            process.exit(0);
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
            process.exit(1);
        });
    }
};
