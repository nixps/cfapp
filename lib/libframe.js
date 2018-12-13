
'use strict';

var cloudflow=require("./libcloudflow.js").setFrame();

module.exports = {
    systeminfo: cloudflow.systeminfo,
    start:      cloudflow.start,
    stop:       cloudflow.stop,
    install:    function(argv) {
            console.log("Installing Frame")
            cloudflow.install(argv);
    },
    uninstall:  cloudflow.uninstall,
    status:     cloudflow.status
};
