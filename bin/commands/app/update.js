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
const cloudflowAPI = require('cloudflow-api');
const ConsoleOutputStream = require('../../../lib/util/ConsoleOutputStream');
const JSONOutputStream = require('../../../lib/util/JSONOutputStream');

module.exports = {
    command: 'update [directory]',
    desc: 'Updates an app to a Cloudflow installation',
    builder: function(yargs) {
        yargs.example('$0 app update', 'updates the app in the current directory')
            .example('$0 app update /app_path/', 'uploads the app described in /app_path/project.cfapp to Cloudflow')
            .option('force', {
                describe: 'forces updating in case of downgrade or no version is specified',
                default: false
            })
            .option('host', {
                describe: 'overrides the host address of the project.cfapp file'
            })
            .option('login', {
                describe: 'overrides the login of the project.cfapp file'
            })
            .option('password', {
                describe: 'overrides the password of the project.cfapp file'
            })
            .option('json', {
                describe: 'outputs the result as JSON',
                default: false
            });
    },
    handler: function(argv) {
        const options = {
            force: argv.force,
            host: argv.host,
            login: argv.login,
            password: argv.password
        };

        const directory = argv.directory || '.';

        let outputStream = new ConsoleOutputStream();
        if (argv.json === true) {
            outputStream = new JSONOutputStream();
        }

        // parse and stringify to get rid of 'undefined' values
        apps.update(directory, JSON.parse(JSON.stringify(options)), outputStream).then(function() {
            if (argv.json === true) {
                console.log(outputStream.lines);
            }
        }).catch(function(error) {
            if (argv.json === true) {
                console.log({
                    lines: outputStream.outputLines,
                    error: {
                        message: error.toString(),
                        code: error.errorCode
                    }
                });
            }
            else {
                console.log(error.stack);
            }
        });
    }
};
