
'use strict';

var cloudflow=require("./libcloudflow.js").setFrame();

module.exports = {
    start:      cloudflow.start,
    stop:       cloudflow.stop,
    install:    cloudflow.install,
    uninstall:  cloudflow.uninstall,
    status:     cloudflow.status
};
