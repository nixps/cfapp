/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

function flushWriteLine (str) {
    return new Promise(function (resolve) {
        const done = process.stdout.write(str + '\n');

        if (! done) {
            process.stdout.on('drain', function() {
                resolve();
            });
        } else {
            resolve();
        }
    });
}

module.exports = flushWriteLine;
