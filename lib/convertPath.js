/**
 * Converts the cloudflow path to the filePath
 * @param {String} appRoot the filepath of the Cloudflow application
 * @param {String} cloudflowPath the Cloudflow path to convert to a file path
 */
function toFSPath(appRoot, cloudflowPath) {
    var path = cloudflowPath.substr('cloudflow://'.length);
    path = decodeURI(path);
    return appRoot + '/files/' + path;
}


/**
 * Converts the filepath to the cloudflow path
 * @param {String} appRoot the filepath of the Cloudflow application
 * @param {String} cloudflowPath the Cloudflow path to convert to a file path
 */
function toCloudflowPath(appRoot, fsPath) {
    var part = fsPath.substr((appRoot + '/files/').length);
    return "cloudflow://" + part;
}


module.exports = {
    toFSPath: toFSPath,
    toCloudflowPath: toCloudflowPath
};
