'use strict';
const async = require('async');
const ConsoleOutputStream = require('../../util/ConsoleOutputStream');
const PromiseCloudflowAPI = require('../../apps/PromiseCloudflowAPI');
const Errors = require('../../apps/Errors');

/**
 * Removes the files that were specified in the app
 * @param app 
 */
function removeFiles (apiAsync, app, outputStream = new ConsoleOutputStream()) {
    // The delete file limit
    const DeleteFileLimit = 20;

    return new Promise(function(resolve, reject) {
        let files = app.files;
        if (app.hasIcon()) {
            files.push(app.icon);
        }
        if (app.hasDocumentation()) {
            files.push(app.documentation);
        }
        // Sort deepest paths first
        files = files.sort(function(a, b) {
            return b.cloudflow.length - a.cloudflow.length;
        });
        // Filter out paths that are enclosed by other paths
        let filteredFiles = [];
        for (let i = 0; i < files.length; i++) {
            const current = files[i];
            let enclosed = false;
            for(let j = i + 1; j < files.length; j++) {
                const compareWith = files[j];
                if (current.cloudflow.indexOf(compareWith.cloudflow) >= 0) {
                    enclosed = true;
                    break;
                }
            }

            if (enclosed === false) {
                filteredFiles.push(current);
            }
        }
        files = filteredFiles;
        async.parallelLimit(files.map(function(file) {
            return function(callback) {
                PromiseCloudflowAPI.fileOrFolderDoesExist(apiAsync, file.cloudflow).then(function(result) {
                    var isFolder = result.is_folder;
                    var exists = result.exists;

                    if (exists === false) {
                        return true;
                    }

                    if (isFolder) {
                        return PromiseCloudflowAPI.deleteFolder(apiAsync, file.cloudflow);
                    }
                    else {
                        return PromiseCloudflowAPI.deleteFile(apiAsync, file.cloudflow);
                    }
                }).then(function() {
                    callback();
                }).catch(function(error) {
                    callback(JSON.stringify(error));
                });
            };
        }), DeleteFileLimit, function(error, result) {
            if (error) {
                outputStream.writeLine(`Could not remove app: ${app.name} - ${error}`);
                reject(new Errors.CouldNotRemoveFiles(app.name, error));
            }
            else {
                resolve(result);
            }
        });
    });
}

module.exports = removeFiles;