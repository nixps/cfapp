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
        api.file.delete_file_with_options(cloudflowPath, {
            ignore_missing_file: true
        }, function(result) {
            resolve(result);
        }, function (error) {
            reject(error);
        });
    });
}

function deleteFolder(api, cloudflowPath) {
    return new Promise(function(resolve, reject) {
        api.file.delete_folder_with_options(cloudflowPath, {
            contents_only: false,
            ignore_missing_folder: true
        }, function(result) {
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

function createFolder (api, cloudflowPath) {
    return new Promise(function (resolve, reject) {
        const matches = cloudflowPath.match(/cloudflow:\/\/([^/]*)\/(.*)/);
        if (matches.length !== 3) {
            reject();
        }

        const directory = matches[2];
        const filestore = matches[1];
        api.file.create_folder(`cloudflow://${filestore}/`, decodeURI(directory), function (result) {
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
    fileOrFolderDoesExist,
    createFolder
};