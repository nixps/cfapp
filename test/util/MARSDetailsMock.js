'use strict';
const nock = require('nock');

function marsDetailsMock (detailsJSON) {
    const appListRegex = /portal\.cgi\?http_service=details&whitepaper=Mars/;

    nock('http://the-mars-server.com')
        .post(appListRegex, function(body) {
            return true;
        })
        .times(1)
        .reply(200, function(uri) {
            return detailsJSON;
        });        
}

module.exports = marsDetailsMock;