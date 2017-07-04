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

// module.exports = {
//     command: 'init [directory]',
//     desc: 'Creates a default project.cfapp in the specified directory',
//     builder: function(yargs) {
//         yargs.example('$0 app init /app_path/', 'creates the /app_path/project.cfapp file')
//             .option('overwrite', {
//                 describe: 'force overwriting files',
//                 default: false
//             });
//     },
//     handler: function(argv) {
//         const options = {
//             overwrite: argv.overwrite
//         };
//
//         const directory = argv.directory || '.';
//
//         apps.init(directory, options);
//     }
// };
