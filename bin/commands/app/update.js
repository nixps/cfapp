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
const flushWriteLine = require('../../../lib/util/flushWriteLine');

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
            .option('force-update-workflows', {
                describe: 'forces the update of existing workflows even if the workables will break',
                default: false
            })
            .option('force-remove-workflows', {
                describe: 'force remove the workflows that still have running workables and are not part anymore of the new version of the app',
                default: false
            })
            .option('force-cloudflow-version', {
                describe: 'skips the Cloudflow version check when installing the app',
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
            force: argv.force,
            forceUpdateWorkflows: argv.forceUpdateWorkflows,
            forceRemoveWorkflows: argv.forceRemoveWorkflows,
            forceCloudflowVersion: argv.forceCloudflowVersion,
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
        apps.update(directory, JSON.parse(JSON.stringify(options)), outputStream).then(function() {
            if (argv.json === true) {
                flushWriteLine(JSON.stringify({
                    lines: outputStream.outputLines
                })).then(function() {
                    process.exit(0);
                });
            } else {
                process.exit(0);
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
                console.log(error);
            }
            process.exit(1);
        });
    }
};
