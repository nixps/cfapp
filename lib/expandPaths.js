var fs = require('fs');
var _ = require('lodash');
var convertPath = require('./convertPath.js');

/**
 * List all files in a directory in Node.js recursively in a synchronous fashion
 * @param {String} dir the root directory
 * @param {String[]} [filelist] the list of items in that directory so far (used for recursion)
 */
function walkSync(dir, filelist) {
    var files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(dir + '/' + file).isDirectory()) {
            filelist = walkSync(dir + '/' + file, filelist);
        }
        else {
            filelist.push(file);
        }
    });
    return filelist;
}


/**
 * Expands the list of paths using the given app root
 * @param {String[]} filePaths the filePaths that need to be expanded or not
 * @param {String} appRoot the filesystem path that is the root of the application
 * @return {String[]} the expanded filePaths
 */
function expandFS(filePaths, appRoot) {
    var expandedPaths = [];

    for (var i = 0; i < filePaths.length; i++) {
        var filePath = convertPath.toFSPath(appRoot, filePaths[i]);

        // Needs expansion
        if (fs.statSync(filePath).isDirectory()) {
            var items = walkSync(filePath);
            items = _.map(items, function(i) {
                return filePath + '/' + i;
            });
            expandedPaths = _.concat(expandedPaths, items);
        }
        else {
            expandedPaths.push(filePath);
        }
    }

    var expandedPaths = _.uniq(expandedPaths);
    var cfPaths = [];
    for(var i = 0; i < expandedPaths.length; i++) {
        console.log(expandedPaths[i]);
        cfPaths.push(convertPath.toCloudflowPath(appRoot, expandedPaths[i]));
    }

    return cfPaths;
}


/**
 * Expands the list of paths using the given remote api
 * @param {String[]} filePaths the filePaths that need to be expanded or not
 * @param {portal_api_base} api the remote api for the expansion
 * @return {String[]} the expanded filePaths
 */
function expandRemote(filePaths, api) {
    var expandedPaths = [];

    for (var i = 0; i < filePaths.length; i++) {
        var filePath = filePaths[i];

        var folders = api.folder.list(['cloudflow.folder', 'begins with', filePath]).results;
        var isFolder = folders.length > 0;

        if (isFolder) {
            var assets = api.asset.list(['cloudflow.enclosing_folder','begins with', filePath]).results;
            for(var j = 0; j < assets.length; j++) {
                var asset = assets[j];
                var cloudflowPath = asset.cloudflow.file;
                if (expandedPaths.indexOf(cloudflowPath) < 0) {
                    expandedPaths.push(cloudflowPath);
                }
            }
        }
        else {
            expandedPaths.push(filePath);
        }
    }

    return expandedPaths;
}


module.exports = {
    remote: expandRemote,
    fs: expandFS
};
