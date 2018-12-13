
const kCLOUDFLOW="cloudflow";
const kFRAME="frame";

var _config=kCLOUDFLOW;
var _systeminfo=require("./systeminfo.js");
var _os=_systeminfo.get_os_info();

// cloudflow specific stuff
function get_setup_info()
{
    var obj = {
        installed: false
    }

    switch (_os.platform) {
            case 'darwin': {
            obj.data_folder='/Users/Shared/NiXPS';        
            obj.setup_file='/Users/Shared/NiXPS/'+_config+'.json';        
        } break;
        case 'win32': {
            obj.data_folder='C:\\ProgramData\\NiXPS';
            obj.setup_file='C:\\ProgramData\\NiXPS\\'+_config+'.json';
        } break;
        default: {
            console.log('Unsupported platform');
            return obj;
        } break;       
    }
    
    var fs = require('fs');

    if (fs.existsSync(obj.setup_file))
    {
        const { execSync } = require('child_process');
        try {
//            obj.data_folder=setup;
            obj.setup = JSON.parse(fs.readFileSync(obj.setup_file, 'utf8'));
            obj.nucleusd=obj.setup.app_folder+_os.slash+"nucleusd"+_os.exe;
        
            // let's gather the nucleusd status
            let input = execSync(obj.nucleusd+" --status --json");
            obj.status=JSON.parse(input.toString());
        
            let version = execSync(obj.nucleusd+" --version");
            obj.version=version.toString().trim();
            if (_config==kFRAME){
                obj.version=obj.version.replace("Cloudflow","Frame");
            }

            // all is well if reach this point
            obj.installed = true;
        } catch(e)
        {
            console.log(e);
        }
    }

    return obj;
}

function put_setup_info(info)
{
    var current=get_setup_info();
    //console.log(JSON.stringify(current));

    var fs = require('fs');

    if (fs.existsSync(current.data_folder)===false)
    {
        // create the NiXPS folder if it doesn't exist
        fs.mkdirSync(current.data_folder);
    }

    fs.writeFileSync(current.setup_file,JSON.stringify(info));
    //console.log(info);

    return get_setup_info();
}

function remove_setup_info()
{
    var current=get_setup_info();

    var fs = require('fs');

    if (fs.existsSync(current.setup_file)===true)
    {
        // create the NiXPS folder if it doesn't exist
        fs.unlinkSync(current.setup_file);
    }

    return;
}

module.exports = {
    setFrame: function()
    {
        _config=kFRAME;
        return this;
    },
    systeminfo: function()
    {
        return _systeminfo;
    },
    start:  function() {
        var cloudflow = get_setup_info();
        if (cloudflow.installed==false){
            console.log('Not installed');
            return;
        }

        console.log("Running " + cloudflow.version);
        console.log("from "+cloudflow.setup.app_folder);

        const { execSync } = require('child_process'); 
        try
        {
            if (cloudflow.setup.run_as_service)
            {
                var command=cloudflow.nucleusd+" --start";
                console.log(command);
                let input = execSync(command);
                console.log(input.toString());
            } else
            {
                var command=cloudflow.nucleusd+cloudflow.setup.cmd;
                console.log(command);
                let input = execSync(cloudflow.nucleusd+cloudflow.setup.cmd);
                console.log(input.toString());
            }
        } catch(e)
        {
            //console.log(e);
        }
    },
    stop: function() {
        var cloudflow = get_setup_info();
        if (cloudflow.installed==false){
            console.log('Not installed');
            return;
        }

        console.log("Stopping " + cloudflow.version);

        try
        {
            if (cloudflow.setup.run_as_service)
            {
                var command=cloudflow.nucleusd+" --stop";
                console.log(command);

                const { execSync } = require('child_process'); 
                let input = execSync(command);
                console.log(input.toString());
            } else
            {
                console.log("Not running as a service, this doesn't do anything...")
            }
        } catch(e)
        {
            
        }
    },
    install: function (argv)
    {
        var cloudflow = get_setup_info();
        const fse = require('fs-extra');

        var software_folder=argv.software_folder;

        if (_config===kFRAME)
        {
            software_folder=software_folder+"Frame Server/";
        }

        console.log('Installing '+software_folder);
    
        if (cloudflow.installed==true)
        {
            console.error('Please uninstall existing first!');
            return;    
        }

        // check if the folder is ok

        const fs = require('fs');
        try
        {
            if (fs.lstatSync(software_folder).isDirectory()===true) {}
        } catch(e)    
        {
            console.error(software_folder+" is not a valid software folder");
            return;
        }

        // define app_folder
        var app_folder=_os.app_folder+_config;

        // check if the destination exits
        try
        {
            if (fs.lstatSync(app_folder).isDirectory()===true) {
                console.log("Removing "+app_folder+" ...");
                try
                {
                    fse.removeSync(app_folder);
                } catch(e)
                {
                    console.error("cannot remove "+app_folder);
                    return;
                }
            }
        } catch(e)    
        {
        }

        // move the folder to the apps_folder
        var app_folder=_os.app_folder+_config;
        try {
            //fs.ensureDirSync(app_folder);
            console.log("Copying "+software_folder+' to '+app_folder+" ...");
            fse.copySync(software_folder, app_folder);
        } catch (err) {
            console.error(err)
            return;
        }
  
        // register the freshly 
        var setup=
        {
            "app_folder": app_folder,
            "run_as_service": false,
            "options": {},
            "cmd": "",
            "is_frame": (_config==kFRAME)
        };
    
        if (setup.is_frame) {
            setup.cmd+=" --frame";
        };

        // nucleusd --noservice [--json] [-i SERVER_ID] [-d DATABASE_IP[:PORT]] [-p PORT] [-s] [--launchmongo] [-g] [--ssl cert+key.pem]
        var options=['--noservice','--json','-i','-d','-p','-s','--launchmongo','-g','--ssl'];
    
        for (var idx in options)
        {
            var option=options[idx].replace(/-/g,'');
            
            if (argv.hasOwnProperty(option))
            {
                setup.options[options[idx]]=argv[option];
    
                switch(option)
                {
                    case "noservice":
                    case "launchmongo":
                    case "json":
                    case "g":           setup.cmd+=" "+options[idx];
                                        break;
                    default:            setup.cmd+=" "+options[idx]+" "+argv[option];
                                        break;        
                }
            }
        }
    
        console.log("cmd:"+setup.cmd);
    
        if (argv.hasOwnProperty("run_as_service") && argv["run_as_service"]==true)
        {
            setup.run_as_service=true;
        }
        console.log("run_as_service: "+setup.run_as_service);
    
        var cloudflow = put_setup_info(setup);
    
        //console.log("cloudflow: "+JSON.stringify(cloudflow));
        if (cloudflow.setup.run_as_service)
        {
            console.log("as a service ...");
            var command=cloudflow.nucleusd+" --install"+cloudflow.setup.cmd;
            console.log(command);
    
            const { execSync } = require('child_process'); 
            let input = execSync(command);
        }
        console.log("Succesfully installed!");
    },
    uninstall: function() {
        var cloudflow = get_setup_info();

        if (cloudflow.installed==false)
        {
            console.log("Not installed");
            return;
        }

        console.log("Uninstalling " + cloudflow.version);

        try
        {
            if (cloudflow.setup.run_as_service)
            {
                var command=cloudflow.nucleusd+" --uninstall";
                console.log(command);

                const { execSync } = require('child_process'); 
                let input = execSync(command);
                console.log(input.toString());
            } else
            {
                console.log("Not running as a service, this doesn't do anything...")
            }
        } catch(e)
        {
            
        }

        remove_setup_info();
    },
    status: function ()
    {
        var cloudflow = get_setup_info();
        if (cloudflow.installed==false)
        {
            console.log("Not installed");
            return;
        }

        console.log(JSON.stringify(cloudflow.status, null, 2));  
    }    
};
