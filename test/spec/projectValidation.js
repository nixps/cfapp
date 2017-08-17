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
const validate = require('../../lib/apps/validateProjectCFApp')

const project = {
    'name': 'hello',
    'version': '0.0.2',
    'host': 'http://localhost:9090/',
    'login': 'admin',
    'password': 'admin',
    'description': 'A demo application',

    'files': [
        'cloudflow://PP_FILE_STORE/DemoApp/images/',
        'cloudflow://PP_FILE_STORE/DemoApp/index.html'
    ],

    'workflows': [
        'ProcessOrder'
    ]
};

function projectValidationTests() {

    it('does not throw when there is no error in the file', function() {
        const projectCopy = JSON.parse(JSON.stringify(project));
        assert.doesNotThrow(function() {
            validate(projectCopy);
        });
    });

    it('checks the project name', function() {
        const projectCopy = JSON.parse(JSON.stringify(project));
        projectCopy.name = '';

        assert.throws(function() {
            validate(projectCopy, '');
        }, 'Invalid project.cfapp (""): "name" invalid or missing');

        projectCopy.name = 5;

        assert.throws(function() {
            validate(projectCopy, '');
        }, 'Invalid project.cfapp (""): "name" invalid or missing');

        delete projectCopy.name;

        assert.throws(function() {
            validate(projectCopy, '');
        }, 'Invalid project.cfapp (""): "name" invalid or missing');
    });

    it('checks the project version', function() {
        const projectCopy = JSON.parse(JSON.stringify(project));
        delete projectCopy.version;

        assert.doesNotThrow(function() {
            validate(projectCopy, '');
        });

        projectCopy.version = '1.0.0';

        assert.doesNotThrow(function() {
            validate(projectCopy, '');
        });

        projectCopy.version = '1.0';

        assert.throws(function() {
            validate(projectCopy, '');
        }, 'Invalid project.cfapp (""): invalid version: "1.0"');

        projectCopy.version = '';

        assert.throws(function() {
            validate(projectCopy, '');
        }, 'Invalid project.cfapp (""): "version" field is invalid');
    });

    it('checks the description', function() {
        const projectCopy = JSON.parse(JSON.stringify(project));
        delete projectCopy.description;

        assert.doesNotThrow(function() {
            validate(projectCopy, '');
        });

        projectCopy.description = '';

        assert.doesNotThrow(function() {
            validate(projectCopy, '');
        });

        projectCopy.description = 5;

        assert.throws(function() {
            validate(projectCopy, '');
        }, 'Invalid project.cfapp (""): "description" field is not a string');
    });

    it('checks the host', function() {
        const projectCopy = JSON.parse(JSON.stringify(project));
        delete projectCopy.host;

        assert.doesNotThrow(function() {
            validate(projectCopy, '');
        });

        projectCopy.host = '';

        assert.doesNotThrow(function() {
            validate(projectCopy, '');
        });

        projectCopy.host = 5;

        assert.throws(function() {
            validate(projectCopy, '');
        }, 'Invalid project.cfapp (""): "host" field is not a string');
    });

    it('checks the login', function() {
        const projectCopy = JSON.parse(JSON.stringify(project));
        delete projectCopy.login;

        assert.doesNotThrow(function() {
            validate(projectCopy, '');
        });

        projectCopy.login = '';

        assert.doesNotThrow(function() {
            validate(projectCopy, '');
        });

        projectCopy.login = 5;

        assert.throws(function() {
            validate(projectCopy, '');
        }, 'Invalid project.cfapp (""): "login" field is not a string');
    });

    it('checks the password', function() {
        const projectCopy = JSON.parse(JSON.stringify(project));
        delete projectCopy.login;

        assert.doesNotThrow(function() {
            validate(projectCopy, '');
        });

        projectCopy.login = '';

        assert.doesNotThrow(function() {
            validate(projectCopy, '');
        });

        projectCopy.login = 5;

        assert.throws(function() {
            validate(projectCopy, '');
        }, 'Invalid project.cfapp (""): "login" field is not a string');
    });

    it('checks the files array', function() {
        const projectCopy = JSON.parse(JSON.stringify(project));
        delete projectCopy.files;

        assert.throws(function() {
            validate(projectCopy, '');
        }, 'Invalid project.cfapp (""): missing "files" array');

        projectCopy.files = [];

        assert.doesNotThrow(function() {
            validate(projectCopy, '');
        });

        projectCopy.files = [ 5, 6 ];

        assert.throws(function() {
            validate(projectCopy, '');
        }, 'Invalid project.cfapp (""): "files" contains an invalid file "5"');

        projectCopy.files = [ '5', '' ];

        assert.throws(function() {
            validate(projectCopy, '');
        }, 'Invalid project.cfapp (""): "files" contains an invalid file \"\"');
    });

    it('checks the workflows array', function() {
        const projectCopy = JSON.parse(JSON.stringify(project));
        delete projectCopy.workflows;

        assert.throws(function() {
            validate(projectCopy, '');
        }, 'Invalid project.cfapp (""): missing "workflows" array');

        projectCopy.workflows = [];

        assert.doesNotThrow(function() {
            validate(projectCopy, '');
        });

        projectCopy.workflows = [ 5, 6 ];

        assert.throws(function() {
            validate(projectCopy, '');
        }, 'Invalid project.cfapp (""): "workflows" contains an invalid workflow name "5"');


        projectCopy.workflows = [ '5', '' ];

        assert.throws(function() {
            validate(projectCopy, '');
        }, 'Invalid project.cfapp (""): "workflows" contains an invalid workflow name \"\"');
    });

}



module.exports = projectValidationTests;
