/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

const { assert } = require('chai');
const fs = require('fs');
const remove = require('remove');
const cfapp = require('../../lib/cfapp');

function appInitTests() {

    after(function() {
        if (fs.existsSync(__dirname + '/appTest')) {
            remove.removeSync(__dirname + '/appTest');
        }
    });

    it('initializes the cfapp file when valid parameters are passed', function() {
        const directory = `${__dirname}/appTest`;

        if (fs.existsSync(directory) === true) {
            remove.removeSync(directory);
        }
        fs.mkdirSync(directory);

        cfapp.apps.init(directory, {
            name: 'hello',
            version: '0.0.1'
        });

        const cfAppPath = `${directory}/project.cfapp`;

        assert.isTrue(fs.existsSync(cfAppPath), 'The project.cfapp file is not created');

        const jsonContents = JSON.parse(fs.readFileSync(cfAppPath, 'utf8'));

        assert.equal(jsonContents.name, 'hello', 'Application name is not correct');
        assert.equal(jsonContents.version, '0.0.1', 'Application version is not correct');
    });

}

module.exports = appInitTests;
