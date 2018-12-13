
'use strict';

var _cloudflow=require("./libcloudflow.js").setFrame();

module.exports = {
    get_systeminfo: _cloudflow.get_systeminfo,
    start:      _cloudflow.start,
    stop:       _cloudflow.stop,
    install:    function(argv) {
        console.log("Installing Frame")

        // Hybrid_Frame_1.0.0
        var adobe=_cloudflow.get_systeminfo().adobe;
        var os=_cloudflow.get_systeminfo().os;

        if (adobe.illustrator.installed==false) {
            console.log('Illustrator not installed, skipping plug-in installation');
        } else {
            try {
                console.log('Installing the plug-in...');
                _cloudflow.copyResource(argv.software_folder+'FrameClient.aip',adobe.illustrator.plugins_folder+'FrameClient.aip',true);
                _cloudflow.copyResource(argv.software_folder+'CEPExtensions'+os.slash+"Hybrid_Frame_1.0.0",adobe.illustrator.cep_folder+"Hybrid_Frame_1.0.0",true);
            } catch(error) {
                console.error(error);
                console.error('There were errors trying to install the plug-in');
            }
        }
        console.log("Installing Frame Server...")
        _cloudflow.install(argv);
    },
    uninstall:  function() {
        console.log("Uninstalling Frame")

        // Hybrid_Frame_1.0.0
        var adobe=_cloudflow.get_systeminfo().adobe;
        var os=_cloudflow.get_systeminfo().os;

        if (adobe.illustrator.installed==false) {
            console.log('Illustrator not installed, skipping plug-in uninstallation');
        } else {
            try {
                console.log('Uninstalling the plug-in...');
                _cloudflow.removeResource(adobe.illustrator.plugins_folder+'FrameClient.aip');
                _cloudflow.removeResource(adobe.illustrator.cep_folder+"Hybrid_Frame_1.0.0");
            } catch(error) {
                console.error(error);
                console.error('There were errors trying to uninstall the plug-in');
            }
        }
        console.log("Uninstalling Frame Server...")

        _cloudflow.uninstall();
    },
    status:     _cloudflow.status
};
