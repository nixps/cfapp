'use strict';
const ConsoleOutputStream = require('./util/ConsoleOutputStream');

const mars = {
    list: function (options, outputStream = new ConsoleOutputStream()) {
        const list = require('./mars/list.js');
        return list(options, outputStream);
    },
    download: function (appName, options, outputStream = new ConsoleOutputStream()) {
        const downloadApp = require('./mars/downloadApp.js');
        return downloadApp(appName, options, outputStream);
    },
    install: function (appName, options, outputStream = new ConsoleOutputStream()) {
        const installApp = require('./mars/installApp.js');
        return installApp(appName, options,outputStream);
    },
    remove: function (appName, hardRemove, options, outputStream = new ConsoleOutputStream()) {
        const removeApp = require('./mars/removeApp.js');
        return removeApp(appName, hardRemove, options, outputStream);
    },
    update: function (appName, options, outputStream = new ConsoleOutputStream()) {
        const updateApp = require('./mars/updateApp.js');
        return updateApp(appName, options, outputStream);
    }
}

module.exports = mars
