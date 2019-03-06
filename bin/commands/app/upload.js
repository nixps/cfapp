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
    command: 'upload [directory]',
    desc: 'Uploads an app to a Cloudflow installation',
    builder: function(yargs) {
        yargs.example('$0 app upload', 'uploads the app in the current directory')
            .example('$0 app upload /app_path/', 'uploads the app described in /app_path/project.cfapp to Cloudflow')
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
                describe: 'overrides the password of the project.cfapp file'
            })
            .option('session', {
                describe: 'the session key that is used for the cloudflow api calls, when passed it overrides login and password'
            })
            .option('json', {
                describe: 'outputs the result as JSON',
                default: false
            });
    },
    handler: function(argv) {
        const options = {
            overwrite: argv.overwrite,
            host: argv.host,
            login: argv.login,
            password: argv.password,
            session: argv.session
        };

        const directory = argv.directory || '.';

        let outputStream = new ConsoleOutputStream();
        if (argv.json === true) {
            outputStream = new JSONOutputStream();
        }

        // parse and stringify to get rid of 'undefined' values
        try {
            apps.upload(directory, JSON.parse(JSON.stringify(options)), outputStream).then(function() {
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
        catch(error) {
            catchError(error, outputStream, argv.json);
            process.exit(1);
        }
    }
};
