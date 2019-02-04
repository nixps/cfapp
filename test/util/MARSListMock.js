'use strict';
const nock = require('nock');

function marsListMock (appListJSON) {
    const appListRegex = /portal\.cgi\?http_service=list&whitepaper=Mars/;
    let name = '';

    nock('http://the-mars-server.com')
        .post(appListRegex, function(body) {
            if (body.name) {
                name = body.name;
            }
            return true;
        })
        .times(1)
        .reply(200, function(uri) {
            const list = appListJSON.results;
            if (name) {
                return {
                    results: list.filter(app => app.name === name)
                };
            }
            return appListJSON;
        });        
}

module.exports = marsListMock;