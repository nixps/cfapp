/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

const { apps } = require('../../../lib/cfapp');
const ConsoleOutputStream = require('../../../lib/util/ConsoleOutputStream');
const JSONOutputStream = require('../../../lib/util/JSONOutputStream');
const flushWriteLine = require('../../../lib/util/flushWriteLine');

function catchError(error, outputStream, jsonFormat) {
    if (jsonFormat === true) {
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
}

module.exports = {
    command: 'download [directory]',
    desc: 'Downloads an app from a Cloudflow installation to directory',
    builder: function(yargs) {
        yargs
            .example('$0 app download', 'downloads the app in the current directory')
            .example('$0 app download /app_path/', 'downloads the app described in /app_path/project.cfapp')
            .option('overwrite', {
                describe: 'force overwriting files',
                default: false
            })
            .option('host', {
                describe: 'overrides the host address of the project.cfapp file'
            })
            .option('login', {
                alias: 'user',
                describe: 'overrides the login of the project.cfapp file'
            })
            .option('password', {
                describe: 'overrides the passowrd of the project.cfapp file'
            })
            .option('session', {
                describe: 'the session key that is used for the cloudflow api calls, when passed it overrides login and password'
            })
            .option('force-ssl-certificate', {
                describe: 'forces the acceptance of the SSL certificate',
                default: false
            });
    },
    handler: function(argv) {
        // Show the help if --help is supplied
        const yargs = require('yargs');
        if (argv.help) {
            yargs.showHelp();
            process.exit(0);
            return;
        }

        const options = {
            overwrite: argv.overwrite,
            host: argv.host,
            login: argv.login,
            password: argv.password,
            session: argv.session
        };

        const directory = argv.directory || '.';

        // Force SSL certificate when the option is passed
        if (argv.forceSslCertificate) {
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        }
        
        let outputStream = new ConsoleOutputStream();
        if (argv.json === true) {
            outputStream = new JSONOutputStream();
        }

        // parse and stringify to get rid of 'undefined' values
        apps.download(directory, JSON.parse(JSON.stringify(options)), outputStream).then(function () {
            if (argv.json === true) {
                flushWriteLine(JSON.stringify({
                    lines: outputStream.outputLines
                })).then(function () {
                    process.exit(0);
                });
            } else {
                process.exit(0);
            }
        }).catch(function(error) {
            catchError(error, outputStream, argv.json);
            process.exit(1);
        });
    }
};
