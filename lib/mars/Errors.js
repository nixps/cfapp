/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */
'use strict';

/**
 * Thrown when a workable on the remote server did not complete within reasonable time
 * This can happen for example when the remote server does not run quantumcombined
 */
class OperationTimeout extends Error {
    constructor() {
        super('Timeout while waiting on operation completion');
        this.errorCode = 'CFAPPERR500';
    }
}

/**
 * Thrown when a request to the MARS server failed (eg POST, GET ...)
 */
class MARSCommunicationError extends Error {
    constructor(message) {
        super(`Communcation error: ${message}`);
        this.errorCode = 'CFAPPERR501';
    }
}

/**
 * Thrown when a request to the MARS server failed (eg POST, GET ...)
 */
class MARSServiceError extends Error {
    constructor(serviceError) {
        super(`Communcation error: ${serviceError.error} (${serviceError.errorCode})`);
        this.errorCode = 'CFAPPERR502';
    }
}

/**
 * Thrown when the license serial could not be retrieved (eg user has no admin rights)
 */
class CouldNotRetrieveSerialError extends Error {
    constructor(error) {
        super(`Could not retrieve serial for host: ${error}`);
        this.errorCode = 'CFAPPERR503';
    }
}

/**
 * Thrown when the app was not found on the MARS server
 */
class NoSuchRemoteAppError extends Error {
    constructor(name) {
        super(`App not found: ${name}`);
        this.errorCode = 'CFAPPERR504';
    }
}

/**
 * Thrown when the MARS client returns an error
 */
class MARSClientError extends Error {
    constructor(code, message) {
        super(`Mars Client error: ${message} (${code})`);
        this.errorCode = 'CFAPPERR505';
    }
}

/**
 * Thrown when an app could not be removed
 */
class CouldNotRemoveAppError extends Error {
    constructor(error) {
        super(`Could not remove the app: ${error}`);
        this.errorCode = 'CFAPPERR506';
    }
}

/**
 * Thrown when an app could not be removed
 */
class NoSuchVersionAvailable extends Error {
    constructor(appName, appVersion) {
        super(`No version ${appVersion} for app ${appName}`);
        this.errorCode = 'CFAPPERR507';
    }
}

module.exports = {
    OperationTimeout,
    MARSCommunicationError,
    MARSServiceError,
    CouldNotRetrieveSerialError,
    NoSuchRemoteAppError,
    MARSClientError,
    CouldNotRemoveAppError,
    NoSuchVersionAvailable
};
