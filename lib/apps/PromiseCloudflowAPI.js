'use strict';

function assetListFile(api, cloudflowPath) {
    return new Promise(function(resolve, reject) {
        api.asset.list(['cloudflow.part', 'equal to', cloudflowPath], [ 'cloudflow', '_id' ], function(result) {
            resolve(result.results);
        }, function(error) {
            reject(error);
        });
    });
}

function deleteFile(api, cloudflowPath) {
    return new Promise(function(resolve, reject) {
        api.file.delete_file(cloudflowPath, function(result) {
            resolve(result);
        }, function (error) {
            reject(error);
        });
    });
}

function deleteFolder(api, cloudflowPath) {
    return new Promise(function(resolve, reject) {
        api.file.delete_folder(cloudflowPath, false, function(result) {
            resolve(result);
        }, function (error) {
            reject(error);
        });
    });
}

function fileOrFolderDoesExist(api, cloudflowPath) {
    return new Promise(function(resolve, reject) {
        api.file.does_exist(cloudflowPath, function(result) {
            resolve(result);
        }, function (error) {
            reject(error);
        });
    });
}

module.exports = {
    assetListFile,
    deleteFile,
    deleteFolder,
    fileOrFolderDoesExist
};
