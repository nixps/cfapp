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
    command: 'remove [app_name]',
    desc: 'Removes an app from the remote Cloudflow',
    builder: function(yargs) {
        yargs
            .example('$0 app remove TheApp', 'removes the application "TheApp" from http://localhost:9090')
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
            .option('force-remove-workflows', {
                describe: 'force remove the workflows that still have running workables and are not part anymore of the new version of the app',
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
            host: argv.host,
            login: argv.login,
            password: argv.password,
            session: argv.session,
            forceRemoveWorkflows: argv.forceRemoveWorkflows
        };

        const serverURL = argv.host || 'http://localhost:9090';

        // Force SSL certificate when the option is passed
        if (argv.forceSslCertificate) {
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        }

        // Check if we can list applications
        const api = cloudflowAPI.getSyncAPI(serverURL);
        if (typeof options.session === 'string' && options.session.length > 0) {
            api.m_session = options.session;
        } else {
            var session = api.auth.create_session(options.login, options.password).session;
            api.m_session = session;
        }

        let outputStream = new ConsoleOutputStream();
        if (argv.json === true) {
            outputStream = new JSONOutputStream();
        }

        if (apps.canRegisterApps(api) === false) {
            console.log(`no support for application removal this Cloudflow build b${api.portal.version().build}`);
            return;
        }

        // parse and stringify to get rid of 'undefined' values
        apps.remove(argv.app_name, JSON.parse(JSON.stringify(options)), outputStream).then(function() {
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
                console.log(error.stack);
            }
            process.exit(1);
        });
    }
};
