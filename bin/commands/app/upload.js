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
                describe: 'overrides the login of the project.cfapp file'
            })
            .option('password', {
                describe: 'overrides the passowrd of the project.cfapp file'
            });
    },
    handler: function(argv) {
        const options = {
            overwrite: argv.overwrite,
            host: argv.host,
            login: argv.login,
            password: argv.password
        };

        const directory = argv.directory || '.';

        // parse and stringify to get rid of 'undefined' values
        apps.upload(directory, JSON.parse(JSON.stringify(options))).catch(function(error) {
            console.log(error);
        });
    }
};
