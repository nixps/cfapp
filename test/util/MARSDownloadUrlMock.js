'use strict';
const nock = require('nock');

/**
 * Mocks a download url
 * @param {*} downloadUrl the url that should be mocked
 * @param {*} filePath the file that will be downloaded
 */
function marsDownloadUrlMock (downloadUrl, filePath) {
    const downloadUrlRegex = new RegExp(downloadUrl)

    nock('http://the-mars-server.com')
        .get(downloadUrlRegex, function(body) {
            return true;
        })
        .times(1)
        .replyWithFile(200, filePath, {
            'Content-Type': 'application/zip, application/octet-stream',
            'Content-Disposition': 'attachment; filename="DemoApp.zip"'
        });        
}

module.exports = marsDownloadUrlMock;