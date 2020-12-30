/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

'use strict';

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
            console.log('Mac detected');
            obj.app_folder='/Applications/';        
            obj.supported_platform=true;
            obj.exe='';
            obj.slash='/';
        } break;
        case 'win32': {
            console.log('Windows');
            obj.app_folder='C:\\Program Files\\';
            obj.supported_platform=true;
            obj.exe=".exe";
            obj.slash='\\';
        } break;
        default: {
            console.log('Unsupported platform');
            return obj;
        } break;       
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
        installed: false,
        running: false,
        versions: []
    }

    var cep_folder='';
    var app_folder='';
    var plugins_folder='';
    var process_name='';
    
    //set folder locations
    switch (os.platform) {
        case 'darwin': {
            cep_folder='/Library/Application Support/Adobe/CEP/extensions/';        
            app_folder='/Applications/Adobe Illustrator';        
            plugins_folder='Plug-ins.localized';  
            process_name = "MacOS/Adobe Illustrator";      
        } break;
        case 'win32': {
            cep_folder='C:\\Program Files (x86)\\Common Files\\Adobe\\CEP\\extensions\\';
            app_folder='C:\\Program Files\\Adobe\\Adobe Illustrator';        
            plugins_folder='Plug-ins';
            process_name = "Illustrator.exe";  
        } break;
        default: {
            console.error('Unsupported platform');
            return obj;
        } break;       
    }

    //check if illustrator is running

    const cmd = os.platform == 'win32' ? 'tasklist' : (os.platform == 'darwin' ? 'ps -ax | grep \"'+process_name+'\" | grep -v grep' : '');

    const execSync = require('child_process').execSync;

    let stdout="";
    
    try {
        stdout = execSync(cmd);
    }catch(error){}

    // console.log("stdout: " +stdout.toString());
    
    obj.running=stdout.toString().toLowerCase().indexOf(process_name.toLowerCase()) > -1;

    if(obj.running) {
        throw new Error("Installation Failed. Please close the Adobe Illustrator application and reinstall the Plug-In Suite.");
    }

    var fs = require('fs');

    if (fs.existsSync(cep_folder)===false) { 
        console.error("cannot find cep_folder:"+cep_folder);
        return obj;
    }

    var found=false;

    var ext=["2017","2018","2019","2020","2021"];
    
    for (var idx in ext)
    {
        var version_obj = {
            version: ext[idx]
        }

        // From 2020 onwards Adobe dropped the CC in the app folder name
        let version_app_folder=app_folder;
        if (parseInt(version_obj.version) < 2020){
            version_app_folder += " CC";
        }
        
        version_app_folder+= " " + version_obj.version;

        // If the app folder exists, assume installed
        if (fs.existsSync(version_app_folder+os.slash)===true){
            version_obj.app_folder=version_app_folder+os.slash;
            version_obj.plugins_folder=version_obj.app_folder+plugins_folder+os.slash;

            if (fs.existsSync(version_obj.plugins_folder)===false){
                console.error("cannot find plugins_folder: "+version_obj.plugins_folder);
            }
            else{
                obj.versions.push(version_obj);
                console.log("found: "+version_obj.app_folder);
                found=true;
            }
        }
        else {
            console.log(version_app_folder+os.slash + " does not exist, so probably not installed.");
        }
    }
    console.log("Illustrator versions installed: " + obj.versions.length);
    
    if (found==false)
    {
        console.error("cannot find app_folder:"+app_folder);
        return obj;
    }

    // all ok
    obj.installed=true;
    obj.cep_folder=cep_folder;
    // obj.app_folder=app_folder;
    // obj.plugins_folder=plugins_folder;

    return obj;
}



// isRunning('Adobe Illustrator', 'darwin').then((v) => console.log(v))

// Adobe resources
// - https://github.com/Adobe-CEP/CEP-Resources
// - https://github.com/adobe-photoshop/generator-panels/blob/master/installPanels.py

module.exports = {
    get_systeminfo: function()
    {
        var os=get_os_info();
        var adobe=get_adobe_info(os);
        return {
            os: os,
            adobe: adobe
        };
    }
}

