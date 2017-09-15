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
        apps.download(directory, JSON.parse(JSON.stringify(options))).catch(function(error) {
            console.log(error);
        });
    }
};
