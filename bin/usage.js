/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

module.exports = function() {
    console.log('cfapp: Installs or downloads Cloudflow applications');
    console.log('Usage example:');
    console.log('   cfapp --upload /path/to/cloudflow/app/');
    console.log('   cfapp --download /path/to/cloudflow/app/');
    console.log('Options:')
    console.log('   --upload <path> or --install <path>: installs the Cloudflow application from path');
    console.log('   --download <path> : downloads the Cloudflow application to path');
    console.log('   --overwrite : overwrites existing files on remote or local');
    console.log('   --login <login>: the login name of the user if not specified in the project.cfapp file');
    console.log('   --password <password> : the password in case it is not specified in the project.cfapp file');
    console.log('   --host <url> : the url of the Cloudflow host in case it s not specified in the project.cfapp file');
};
