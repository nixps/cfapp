/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

const OutputStream = require('./OutputStream.js');

/**
 * A console output stream for string output
 */
class JSONOutputStream extends OutputStream {

    constructor() {
        super();
        this._outputLines = [];
    }

    get outputLines() {
        return this._outputLines;
    }

    writeLine(str) {
        this._outputLines.push(str);
    }
}

module.exports = JSONOutputStream;
