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
                describe: 'overrides the login of the project.cfapp file'
            })
            .option('password', {
                describe: 'overrides the passowrd of the project.cfapp file'
            });
    },
    handler: function(argv) {
        const options = {
            host: argv.host,
            login: argv.login,
            password: argv.password
        };

        // Check if we can list applications
        const api = cloudflowAPI.getSyncAPI(options.host);
        var session = api.auth.create_session(options.login, options.password).session;
        api.m_session = session;

        if (apps.canRegisterApps(api) === false) {
            console.log(`no support for application removal this Cloudflow build b${api.portal.version().build}`);
            return;
        }

        // parse and stringify to get rid of 'undefined' values
        apps.remove(argv.app_name, JSON.parse(JSON.stringify(options)));
    }
};
