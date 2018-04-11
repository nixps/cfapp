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
const columnify = require('columnify');
const cloudflowAPI = require('cloudflow-api');

module.exports = {
    command: 'list',
    desc: 'Lists all the installed Cloudflow Application on the remote server',
    builder: function(yargs) {
        yargs.example('$0 app list --login admin --password admin', 'lists all of installed Cloudflow Applications on http://localhost:9090')
            .example('$0 app list --host http://my.server.com:9090 --login admin --password admin', 'lists all installed Cloudflow Applications on http://my.server.com:9090')
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
                describe: 'returns a json representation of the list of cfapps',
                default: false
            });
    },
    handler: function(argv) {
        const options = {
            host: argv.host,
            login: argv.login,
            password: argv.password,
            session: argv.session,
            json: argv.json
        };

        const serverURL = argv.host || 'http://localhost:9090';

        // Check if we can list applications
        const api = cloudflowAPI.getSyncAPI(serverURL);
        if (typeof options.session === 'string' && options.session.length > 0) {
            api.m_session = options.session;
        } else {
            var session = api.auth.create_session(options.login, options.password).session;
            api.m_session = session;
        }

        if (apps.canRegisterApps(api) === false) {
            console.log(`no support for application listing this Cloudflow build b${api.portal.version().build}`);
            return;
        }

        // parse and stringify to get rid of 'undefined' values
        try {
            const appList = apps.list(serverURL, JSON.parse(JSON.stringify(options)));

            if (options.json === true) {
                console.log(JSON.stringify(appList));
                return;
            }

            const appListTable = appList.map((app) => {
                return {
                    name: app.name,
                    version: app.version || 'no version',
                    description: app.description
                };
            });
            console.log(columnify(appListTable, {
                columnSplitter: ' | ',
                minWidth: 30,
                config: {
                    version: { minWidth: 15 },
                    description: { maxWidth: 50 }
                }
            }));
        }
        catch(error) {
            console.log(error);
        }
    }
};
