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
            });
    },
    handler: function(argv) {
        const options = {
            force: argv.force,
            host: argv.host,
            login: argv.login,
            password: argv.password
        };

        // Check if we can list applications
        const api = cloudflowAPI.getSyncAPI(options.host);
        var session = api.auth.create_session(options.login, options.password).session;
        api.m_session = session;

        if (apps.canRegisterApps(api) === false) {
            console.log(`no support for application updates this Cloudflow build b${api.portal.version().build}`);
            return;
        }

        const directory = argv.directory || '.';

        // parse and stringify to get rid of 'undefined' values
        apps.update(directory, JSON.parse(JSON.stringify(options))).catch(function(error) {
            console.log(error);
        });
    }
};
