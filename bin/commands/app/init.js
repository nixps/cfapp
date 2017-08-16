/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

const fs = require('fs');

const { apps } = require('../../../lib/cfapp');
const readlineSync = require('readline-sync');
const { resolve, basename, join } = require('path');

module.exports = {
    command: 'init [directory]',
    desc: 'Creates a default project.cfapp in the specified directory',
    builder: function(yargs) {
        yargs.example('$0 app init /app_path/', 'creates the /app_path/project.cfapp file');
        yargs.example('$0 app init', 'creates the project.cfapp file in the current directory');
    },
    handler: function(argv) {
        const directory = argv.directory || '.';
        const expanded = resolve(directory);

        const projectPath = join(expanded, 'project.cfapp');
        if (fs.existsSync(projectPath) === true) {
            throw new Error('project.cfapp already exists');
        }

        const defaultName = basename(expanded);
        const defaultVersion = '0.0.1';

        const name = readlineSync.question(`Application Name [${defaultName}]: `, {defaultInput: defaultName});
        const version = readlineSync.question(`Version [${defaultVersion}]: `, {defaultInput: defaultVersion});

        apps.init(directory, {
            name,
            version
        });
    }
};
