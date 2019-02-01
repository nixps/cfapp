'use strict';

const mars = {
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
