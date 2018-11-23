/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */


'use strict';

module.exports = {
    get_os_info: get_os_info,
    get_cloudflow_info: get_cloudflow_info,
    get_adobe_info: get_adobe_info
}

// os specific stuff
function get_os_info()
{
    var os = require('os');
    return {
        platform:os.platform(),
        release:os.release()
    }
}

// cloudflow specific stuff
function get_cloudflow_info(os)
{
    var obj = {
        installed: false
    }
    
    if (os===undefined)
        os=get_os_info();

    var setup='';
    
    switch (os.platform) {
        case 'darwin': {
            setup='/Users/Shared/NiXPS/';        
            console.debug('Mac');
        } break;
        case 'win32': {
            setup='C:\\ProgramData\\NiXPS\\';
            console.debug('Windows');
        } break;
        default: {
            console.error('Unsupported platform');
            return obj;
        } break;       
    }
    
    var fs = require('fs');
    if (fs.existsSync(setup+'setup.json')) {
        obj.data_folder=setup;
        obj.setup = JSON.parse(fs.readFileSync(setup+'setup.json', 'utf8'));
        obj.installed = true;
    }

    return obj;
}

function get_adobe_info(os)
{
    // CEPExtensions/Hybrid_Frame_1.0.0 ->  /Library/Application\ Support/Adobe/CEP/extensions/Hybrid_Frame_1.0.0
    // Frame Sever -> install in /Applications?
    // FrameClient.aip -> /Applications/Adobe\ Illustrator\ CC\ 2019/Plug-ins.localized

    if (os===undefined)
        os=get_os_info();

    return {
        illustrator: get_illustrator_info(os)
    }
}

function get_illustrator_info(os)
{
    // CEPExtensions/Hybrid_Frame_1.0.0 ->  /Library/Application\ Support/Adobe/CEP/extensions/Hybrid_Frame_1.0.0
    // Frame Sever -> install in /Applications?
    // FrameClient.aip -> /Applications/Adobe\ Illustrator\ CC\ 2019/Plug-ins.localized

    if (os===undefined)
        os=get_os_info();

    var obj = {
        installed: false
    }

    var cep_folder='';
    var app_folder='';
    var plugins_folder='';
    
    switch (os.platform) {
        case 'darwin': {
            cep_folder='/Library/Application Support/Adobe/CEP/extensions/';        
            app_folder='/Applications/Adobe Illustrator CC 2019/';        
            plugins_folder='/Applications/Adobe Illustrator CC 2019/Plug-ins.localized/';        
        } break;
        case 'win32': {
            cep_folder='C:\\ProgramData\\Adobe\\CEP\\extensions\\';        
            app_folder='C:\\Program Files\\Adobe Adobe Illustrator CC 2019\\';        
            plugins_folder='C:\\Program Files\\Adobe Adobe Illustrator CC 2019\\Plug-ins.localized\\';        
        } break;
        default: {
            console.error('Unsupported platform');
            return obj;
        } break;       
    }

    var fs = require('fs');

    if (fs.existsSync(cep_folder)===false){
        console.error("cannot find cep_folder:"+cep_folder);
        return obj;
    }

    if (fs.existsSync(app_folder)===false){
        console.error("cannot find app_folder:"+app_folder);
        return obj;
    }

    if (fs.existsSync(plugins_folder)===false){
        console.error("cannot find plugins_folder:"+plugins_folder);
        return obj;
    }

    // all ok
    obj.installed=true;
    obj.cep_folder=cep_folder;
    obj.app_folder=app_folder;
    obj.plugins_folder=plugins_folder;

    return obj;
}

// Adobe resources
// - https://github.com/Adobe-CEP/CEP-Resources
// - https://github.com/adobe-photoshop/generator-panels/blob/master/installPanels.py
