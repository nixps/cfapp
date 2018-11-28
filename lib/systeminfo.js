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
    put_cloudflow_info: put_cloudflow_info,
    get_adobe_info: get_adobe_info
}

// os specific stuff
function get_os_info()
{
    var os = require('os');
    var obj = {
        platform:os.platform(),
        release:os.release(),
        supported_platform: false,
    };

    switch (obj.platform) {
        case 'darwin': {
            console.debug('Mac detected');
            obj.app_folder='/Applications/';        
            obj.supported_platform=true;
            obj.exe='';
            obj.slash='/';
        } break;
        case 'win32': {
            console.debug('Windows');
            obj.app_folder='C:\\Program Files\\';
            obj.supported_platform=true;
            obj.exe=".exe";
            obj.slash='\\';
        } break;
        default: {
            console.debug('Unsupported platform');
            return obj;
        } break;       
    }

    return obj;
}

// cloudflow specific stuff
function get_cloudflow_info(os)
{
    var obj = {
        installed: false
    }
    
    if (os===undefined)
        os=get_os_info();

    switch (os.platform) {
            case 'darwin': {
            console.debug('Mac');
            obj.data_folder='/Users/Shared/NiXPS';        
            obj.setup='/Users/Shared/NiXPS/setup.json';        
        } break;
        case 'win32': {
            console.debug('Windows');
            obj.data_folder='C:\\ProgramData\\NiXPS';
            obj.setup='C:\\ProgramData\\NiXPS\\setup.json';
        } break;
        default: {
            console.debug('Unsupported platform');
            return obj;
        } break;       
    }
    
    var fs = require('fs');

    if (fs.existsSync(obj.setup))
    {
        const { execSync } = require('child_process');
        try {

//            obj.data_folder=setup;
            obj.app_folder = JSON.parse(fs.readFileSync(obj.setup, 'utf8')).app_folder;
            obj.nucleusd=obj.app_folder+os.slash+"nucleusd"+os.exe;
        
            // let's gather the nucleusd status
            let input = execSync(obj.nucleusd+" --status --json");
            obj.status=JSON.parse(input.toString());
        
            let version = execSync(obj.nucleusd+" --version");
            obj.version=version.toString().trim();

            // all is well if reach this point
            obj.installed = true;
        } catch(e)
        {
            console.log(e);
        }
    }

    return obj;
}

function put_cloudflow_info(os,info)
{
    if (os===undefined)
        os=get_os_info();
    
    var current=get_cloudflow_info(os);
    console.debug(JSON.stringify(current));

    var fs = require('fs');

    if (fs.existsSync(current.data_folder)===false)
    {
        // create the NiXPS folder if it doesn't exist
        fs.mkdirSync(current.data_folder);
    }

    fs.writeFileSync(current.setup,JSON.stringify(info));
    console.debug(info);

    return get_cloudflow_info(os);
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
