/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

class ApplicationNotInstalledError extends Error {
    constructor(appName) {
        super(`application ${appName} is not installed`);
        this.errorCode = 'CFAPPERR001';
    }
}

class ApplicationAlreadyInstalledError extends Error {
    constructor(appName) {
        super(`The application ${appName} is already installed, use 'update' instead`);
        this.errorCode = 'CFAPPERR002';
    }
}

class UnsupportedApplicationUpdatesError extends Error {
    constructor(buildNumber) {
        super(`no support for application updates in build b${buildNumber}`);
        this.errorCode = 'CFAPPERR003';
    }
}

class CannotConvertFolderError extends Error {
    constructor() {
        super('cannot convert folder as no app folder is passed');
        this.errorCode = 'CFAPPERR004';
    }
}

class DownloadError extends Error {
    constructor(statusCode, cloudflowURL) {
        super(`error ${statusCode} when downloading file ${cloudflowURL}`);
        this.errorCode = 'CFAPPERR005';
    }
}

class UploadError extends Error {
    constructor(statusCode, cloudflowURL) {
        super(`error ${statusCode} when uploading file ${cloudflowURL}`);
        this.errorCode = 'CFAPPERR006';
    }
}

class InvalidRemoteVersionError extends Error {
    constructor(appName) {
        super(`invalid version for REMOTE ${appName}, force to update`);
        this.errorCode = 'CFAPPERR007';
    }
}

class InvalidLocalVersionError extends Error {
    constructor(appName) {
        super(`invalid version on LOCAL ${appName}, specify a valid version to update`);
        this.errorCode = 'CFAPPERR008';
    }
}

class OlderOrSameVersionError extends Error {
    constructor(appName, localVersion, remoteVersion) {
        super(`Application ${appName} LOCAL version ${localVersion} <= REMOTE version ${remoteVersion}, force to update`);
        this.errorCode = 'CFAPPERR009';
    }
}

class ProjectCFAppSyntaxError extends SyntaxError {
    constructor(jsonFilePath, originalSyntaxError) {
        super(`Syntax error in project.cfapp ('${jsonFilePath}'): ${originalSyntaxError.message}`);
        this.errorCode = 'CFAPPERR010';
    }
}

class InvalidProjectCFAppError extends Error {
    constructor(message, path) {
        super(`Invalid project.cfapp ("${path}"): ${message}`);
        this.errorCode = 'CFAPPERR011';
    }
}

class CannotFindCFAppFileError extends Error {
    constructor(cloudflowPath, fsPath) {
        super(`Cannot find file "${cloudflowPath}" (file path: "${fsPath}")`);
        this.errorCode = 'CFAPPERR012';
    }
}

class CannotFindCFAppWorkflowError extends Error {
    constructor(workflow, fsPath) {
        super(`Cannot find workflow "${workflow}" (file path: "${fsPath}")`);
        this.errorCode = 'CFAPPERR013';
    }
}

class RemoteFileDoesNotExistError extends Error {
    constructor(cfPath) {
        super(`Specified file does not exist "${cfPath}" on the remote Cloudflow`);
        this.errorCode = 'CFAPPERR014';
    }
}

class MissingProjectCFAppError extends Error {
    constructor(fsPath) {
        super(`Missing 'project.cfapp' file in ${fsPath}`);
        this.errorCode = 'CFAPPERR015';
    }
}

module.exports = {
    ApplicationNotInstalledError,
    ApplicationAlreadyInstalledError,
    UnsupportedApplicationUpdatesError,
    CannotConvertFolderError,
    DownloadError,
    UploadError,
    InvalidRemoteVersionError,
    InvalidLocalVersionError,
    OlderOrSameVersionError,
    ProjectCFAppSyntaxError,
    InvalidProjectCFAppError,
    CannotFindCFAppFileError,
    CannotFindCFAppWorkflowError,
    RemoteFileDoesNotExistError,
    MissingProjectCFAppError
};
