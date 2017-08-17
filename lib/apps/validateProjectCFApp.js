/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

const semver = require('semver');
const {
    InvalidProjectCFAppError
} = require('./Errors');

/**
 * Validates the project.cfapp
 */
function validateProjectJSON(projectJSON, path) {
    const {
        name,
        version,
        description,
        files,
        workflows,
        host,
        password,
        login
    } = projectJSON;

    if (typeof name !== 'string' || name.length === 0) {
        throw new InvalidProjectCFAppError('"name" invalid or missing', path);
    }

    if (version !== undefined) {
        if (typeof version !== 'string' || version.length === 0) {
            throw new InvalidProjectCFAppError('"version" field is missing', path);
        }

        if (semver.valid(version) === null) {
            throw new InvalidProjectCFAppError(`invalid version: ${version}`, path);
        }
    }

    if (typeof description !== undefined) {
        if (typeof description !== 'string') {
            throw new InvalidProjectCFAppError('"description" field is not a string', path);
        }
    }

    if (typeof host !== undefined) {
        if (typeof host !== 'string') {
            throw new InvalidProjectCFAppError('"host" field is not a string', path);
        }
    }

    if (typeof password !== undefined) {
        if (typeof password !== 'string') {
            throw new InvalidProjectCFAppError('"password" field is not a string', path);
        }
    }

    if (typeof login !== undefined) {
        if (typeof login !== 'string') {
            throw new InvalidProjectCFAppError('"login" field is not a string', path);
        }
    }

    if (Array.isArray(files)) {
        for(const file of files) {
            if (typeof file !== 'string' || file.length === 0) {
                throw new InvalidProjectCFAppError(`"files" contains an invalid file ${file}`, path);
            }
        }
    }
    else {
        throw new InvalidProjectCFAppError('missing "files" array', path);
    }

    if (Array.isArray(workflows)) {
        for(const workflow of workflows) {
            if (typeof workflow !== 'string' || workflow.length === 0) {
                throw new InvalidProjectCFAppError(`"workflows" contains an invalid workflow name ${workflow}`, path);
            }
        }
    }
    else {
        throw new InvalidProjectCFAppError('missing "workflows" array', path);
    }
}

module.exports = validateProjectJSON;
