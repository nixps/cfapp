'use strict';

var _cloudflow = require("./libcloudflow.js").setFrame();

module.exports = {
    get_systeminfo: _cloudflow.get_systeminfo,
    start: _cloudflow.start,
    stop: _cloudflow.stop,
    install: function (argv) {
        console.log("Installing Frame")

        // Hybrid_Frame_1.0.0
        var adobe = _cloudflow.get_systeminfo().adobe;
        var os = _cloudflow.get_systeminfo().os;
        var fs = require('fs');
        if (adobe.illustrator.installed == false) {
            console.log('Illustrator not installed, skipping plug-in installation');
        } else {
            try {
                console.log('Installing the plug-in...');
                var fs = require('fs');
                var pluginfolder = "";
                var items = fs.readdirSync(argv.software_folder);
                for (var i = 0; i < items.length; i++) {
                    if (items[i].startsWith('frameplugin-')) {
                        pluginfolder = items[i];
                        console.log("Plugin folder found: " + pluginfolder);
                    }
                }
                if (pluginfolder == "") {
                    throw "Plugin folder not found";
                }
                
                let cep_source=argv.software_folder + pluginfolder + os.slash + 'CEPExtensions' + os.slash + "Hybrid_Frame_1.0.0";

                if(fs.existsSync(cep_source))
                {
                    _cloudflow.copyResource(
                        cep_source,
                        adobe.illustrator.cep_folder + "Hybrid_Frame_1.0.0", true);
                }

                cep_source=argv.software_folder + pluginfolder + os.slash + 'CEPExtensions' + os.slash + "Hybrid_Frame_1.1.0";

                if(fs.existsSync(cep_source))
                {
                    _cloudflow.copyResource(
                        cep_source,
                        adobe.illustrator.cep_folder + "Hybrid_Frame_1.1.0", true);
                }

                let ai4pro_cep=argv.software_folder + pluginfolder + os.slash + 'CEPExtensions' + os.slash + "Hybrid_AI4Pro_1.0.0";
                
                if(fs.existsSync(ai4pro_cep))
                {
                    _cloudflow.copyResource(
                        ai4pro_cep,
                        adobe.illustrator.cep_folder + "Hybrid_AI4Pro_1.0.0", true);
                }


                adobe.illustrator.versions.forEach(version => {
                    switch (os.platform) {
                        case 'darwin':
                            _cloudflow.copyResource(
                                argv.software_folder + pluginfolder + os.slash + 'FrameClient.aip',
                                version.plugins_folder + 'FrameClient.aip', true);

                            _cloudflow.copyResource(
                                argv.software_folder + pluginfolder + os.slash + 'AI4Pro.aip',
                                version.plugins_folder + 'AI4Pro.aip', true);
                            break;

                        case 'win32':
                            _cloudflow.copyResource(
                                argv.software_folder + pluginfolder + os.slash + 'FrameClient' + os.slash,
                                version.plugins_folder + 'FrameClient' + os.slash, true);

                            _cloudflow.copyResource(
                                argv.software_folder + pluginfolder + os.slash + 'AI4Pro' + os.slash,
                                version.plugins_folder + 'AI4Pro' + os.slash, true);
                            break;
                        default:
                            console.error('Unsupported platform: ' + os.platform);
                            break;
                    }
                });
            } catch (error) {
                console.error(error);
                console.error('There were errors trying to install the plug-in');
            }
        }
        console.log("Installing Frame Server...");
        argv.run_as_service = true;

        _cloudflow.install(argv);

    },
    uninstall: function (argv) {
        console.log("Uninstalling Frame")

        // Hybrid_Frame_1.0.0
        var adobe = _cloudflow.get_systeminfo().adobe;
        var os = _cloudflow.get_systeminfo().os;
        var fs = require('fs');

        if (adobe.illustrator.installed == false) {
            console.log('Illustrator not installed, skipping plug-in uninstallation');
        } else {
            console.log('Uninstalling the plug-in...');
            try {
                let cep_path=adobe.illustrator.cep_folder + "Hybrid_Frame_1.0.0";

                if(fs.existsSync(cep_path))
                {
                    _cloudflow.removeResource(cep_path)
                }
                
                cep_path=adobe.illustrator.cep_folder + "Hybrid_Frame_1.1.0";

                if(fs.existsSync(cep_path))
                {
                    _cloudflow.removeResource(cep_path)
                }

                let ai4pro_cep_path=adobe.illustrator.cep_folder + "Hybrid_AI4Pro_1.0.0";

                if(fs.existsSync(ai4pro_cep_path))
                {
                    _cloudflow.removeResource(ai4pro_cep_path)
                }

            } catch (error) {
                console.error(error);
                console.error('Failed to uninstall the CEP extension.');
            }
            for (var i in adobe.illustrator.versions) {
                try {
                    let version = adobe.illustrator.versions[i];

                    switch (os.platform) {
                        case 'darwin':
                                _cloudflow.removeResource(version.plugins_folder + 'FrameClient.aip');
                                _cloudflow.removeResource(version.plugins_folder + 'AI4Pro.aip');
                            break;

                        case 'win32':
                            _cloudflow.removeResource(version.plugins_folder + 'FrameClient' + os.slash);
                            _cloudflow.removeResource(version.plugins_folder + 'AI4Pro' + os.slash);
                            break;
                        default:
                            console.error('Unsupported platform: ' + os.platform);
                            break;
                    }
                    
                } catch (error) {
                    console.error(error);
                    console.error('There were errors trying to uninstall the plug-in');
                }
            }
        }

        _cloudflow.uninstall(argv);
    },
    status: _cloudflow.status,
    create_installer: _cloudflow.create_installer,
    create_msi: _cloudflow.create_msi
};