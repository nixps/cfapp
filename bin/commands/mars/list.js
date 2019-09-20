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
const columnify = require('columnify');
const ConsoleOutputStream = require('../../../lib/util/ConsoleOutputStream');
const JSONOutputStream = require('../../../lib/util/JSONOutputStream');

module.exports = {
    command: 'list',
    desc: 'Returns a list of all the available MARS apps for the passed credentials',
    builder: function(yargs) {
        yargs
            .example('$0 mars list --host http://localhost:9090 --login admin --password admin', 'shows the list of all the apps on MARS using the credentials and MARS settings of the Cloudflow running on localhost')
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
        const options = {
            host: argv.host,
            login: argv.login,
            password: argv.password,
            session: argv.session,
            marsurl: argv.marsurl,
            version: argv.version,
            timeout: argv.timeout,
            json: argv.json
        };

        let outputStream = new ConsoleOutputStream();
        if (argv.json === true) {
            outputStream = new JSONOutputStream();
        }

        // parse and stringify to get rid of 'undefined' values
        mars.list(JSON.parse(JSON.stringify(options)), outputStream).then(function (appList) {
            if (options.json) {
                console.log(JSON.stringify(appList));
            } else {
                const appListTable = appList.map((app) => {
                    return {
                        name: app.name,
                        version: app.last_version,
                        owner: app.owners[0],
                        description: app.description
                    };
                }).sort((a, b) => {
                    const descA = a.description;
                    const descB = b.description;
                    if (descA < descB) {
                        return -1;
                    } else if (descA > descB) {
                        return 1;
                    }

                    return 0;
                });
    
                console.log(columnify(appListTable, {
                    columnSplitter: ' | ',
                    minWidth: 30,
                    columns: [
                        'description', 'name', 'version', 'owner'
                    ],
                    config: {
                        name: { minWidth: 30},
                        description: { minWidth: 50 },
                        version: { minWidth: 15 },
                        owner: { maxWidth: 20 }
                    }
                }));
            }
            process.exit(0);
        }).catch(function (error) {
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
