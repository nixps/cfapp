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

class CFDoesExistFailedError extends Error {
    constructor(fsPath) {
        super(`api.file.does_exist failed for path ${fsPath}`);
        this.errorCode = 'CFAPPERR016';
    }
}

class FolderCreationFailedError extends Error {
    constructor(fsPath) {
        super(` ${fsPath} `);
        this.errorCode = 'CFAPPERR017';
    }
}

class RemoteWorkflowDoesNotExistError extends Error {
    constructor(workflow) {
        super(`Specified workflow "${workflow}" does not exist on the remote Cloudflow`);
        this.errorCode = 'CFAPPERR018';
    }
}

class UpdateBreaksWorkablesError extends Error {
    constructor(workflows) {
        super(`Updating workflow(s) "${workflows.join(', ')}" will break running workables, use --force-update-workflows to force update`);
        this.errorCode = 'CFAPPERR019';
    }
}

class ConflictingWorkflows extends Error {
    constructor (wfNames) {
        super(`Cannot add these workflows: ${wfNames.join(', ')}, these are in conflict with existing workflows`);
        this.errorCode = 'CFAPPERR020';
    }
}

/**
 * Thrown when an app cannot be installed because a license is missing
 */
class MissingLicenseError extends Error {
    constructor(appName, appVersion, licenseCode) {
        super(`The version "${appVersion}" of "${appName}" cannot be installed because "${licenseCode}" license is missing`);
        this.errorCode = 'CFAPPERR021';
    }
}

/**
 * Thrown when an app cannot be installed because a license is missing
 */
class InvalidCloudflowVersionError extends Error {
    constructor (cloudflowVersion) {
        super(`"${cloudflowVersion}" is not a valid Cloudflow version number`);
        this.errorCode = 'CFAPPERR022';
    }
}

/**
 * Thrown when an app cannot be installed because a license is missing
 */
class InvalidMinimumCloudflowVersionError extends Error {
    constructor (appName, minCloudflowVersion) {
        super(`The application "${appName}" requires a minimum Cloudflow version "${minCloudflowVersion}", which is not a valid Cloufdlow version number`);
        this.errorCode = 'CFAPPERR023';
    }
}

/**
 * Thrown when an app cannot be installed because a license is missing
 */
class CloudflowTooOldError extends Error {
    constructor (appName, current, minimum) {
        super(`The application "${appName}" cannot be installed on Cloudflow "${current.asString()}", it requires at least "${minimum.asString()}"`);
        this.errorCode = 'CFAPPERR024';
    }
}

/**
 * Thrown when a file could not be deleted
 */
class CouldNotUploadFile extends Error {
    constructor (file, error) {
        super(`The file "${file}" could not be uploaded: (${error.toString()})`);
        this.errorCode = 'CFAPPERR025';
    }
}

/**
 * Thrown when a file could not be deleted
 */
class CouldNotRemoveFiles extends Error {
    constructor (appName, error) {
        super(`Could not remove the files of "${appName}": (${error.toString()})`);
        this.errorCode = 'CFAPPERR026';
    }
}

/**
 * Throwns when a file store is found missing
 */
class MissingFilestoresError extends Error {
    constructor(missingFileStores) {
        super(`Filestores "${missingFileStores.join(', ')}" aren't found`);
        this.errorCode = 'CFAPPERR027';
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
    MissingProjectCFAppError,
    CFDoesExistFailedError,
    FolderCreationFailedError,
    RemoteWorkflowDoesNotExistError,
    UpdateBreaksWorkablesError,
    ConflictingWorkflows,
    MissingLicenseError,
    InvalidCloudflowVersionError,
    InvalidMinimumCloudflowVersionError,
    CloudflowTooOldError,
    CouldNotUploadFile,
    CouldNotRemoveFiles,
    MissingFilestoresError
};
