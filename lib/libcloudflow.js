const kCLOUDFLOW="cloudflow";
const kFRAME="frame";

var _config=kCLOUDFLOW;
var _systeminfo=require("./systeminfo.js").get_systeminfo();
var _os=_systeminfo.os;

var get_systeminfo=function()
{
    return _systeminfo;
};

var get_setup_info=function() {
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
};

var put_setup_info=function(info) {
    var current=get_setup_info();

    var fs = require('fs');

    if (fs.existsSync(current.data_folder)===false)
    {
        // create the NiXPS folder if it doesn't exist
        fs.mkdirSync(current.data_folder);
    }

    fs.writeFileSync(current.setup_file,JSON.stringify(info));
    //console.log(info);

    return get_setup_info();
};

var remove_setup_info=function() {
    var current=get_setup_info();

    var fs = require('fs');

    if (fs.existsSync(current.setup_file)===true)
    {
        // create the NiXPS folder if it doesn't exist
        fs.unlinkSync(current.setup_file);
    }

    return;
};

var copyResource = function(source,destination,remove_target_if_existing)
{
   // check if the source folder is ok
   const fs = require('fs');
   const fse = require('fs-extra');
   if (fs.existsSync(source)===false)
   {
       throw source+" does not exist!";
   }

   if (remove_target_if_existing)
   {
        // check if the destination exits
        if (fs.existsSync(destination)===true)
        {
            if (fs.lstatSync(destination).isDirectory()===true) {
                console.log("Removing "+destination+" ...");
                try
                {
                    fse.removeSync(destination);
                } catch(e)
                {
                    console.error(e);
                    throw "cannot remove "+destination;
                }
            }
        }
    }

   // copy the source to the destination
   try {
       console.log("Copying "+source+' to '+destination+" ...");
       fse.copySync(source, destination);
   } catch (e) {
       console.error(e);
       throw "Copy failed";
   }
};

var removeResource = function(destination)
{
   // check if the source folder is ok
   const fs = require('fs');
   const fse = require('fs-extra');

   console.log("Removing "+destination+" ...");
   if (fs.existsSync(destination)===true)
    {
        //console.log("Removing "+destination+" ...");
        try
        {
            fse.removeSync(destination);
        } catch(e)
        {
            console.error(e);
            throw "cannot remove "+destination;
        }
    }
};

module.exports = {
    setFrame: function()
    {
        _config=kFRAME;
        return this;
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

        var software_folder=argv.software_folder;

 //       if (_config===kFRAME)
 //       {
 //           software_folder=software_folder+"Frame Server/";
 //       }

        console.log('Installing '+software_folder);
    
        if (cloudflow.installed==true)
        {
            console.error('Please uninstall existing first!');
            return;    
        }

        // define app_folder
        var app_folder=_os.app_folder+_config;

        if (argv.hasOwnProperty("nocopy") && argv["nocopy"]==true)
        {
            console.log("--nocopy, skipping file copy");
        } else
        {
            copyResource(software_folder, app_folder, true);
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
                //console.log("Not running as a service, this doesn't do anything...")
            }
        } catch(e)
        {
            
        }
        var folder_to_remove=cloudflow.setup.app_folder;
        remove_setup_info();
        removeResource(folder_to_remove);

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
    },
    create_installer: function (argv){
        // argv.software_folder
        // argv.output_location
    
        var array=argv.software_folder.split(_os.slash);
        var package_name=array.pop();
        if (package_name=='')
            package_name=array.pop();   
        if (package_name==''){
            console.error("cannot establish package name");
            return;
        }

        package_name=package_name+'.pkg'
        console.log("Creating installer "+package_name);

        var fs = require('fs-extra');

        if (fs.existsSync(argv.software_folder)==false)
        {
            console.error("input: "+argv.software_folder+" doesn't exist");
        }
        if (fs.existsSync(argv.output_location)==false)
        {
            console.error("output:"+argv.output_location+" doesn't exist");
        }
    
        var installer_folder=argv.output_location+"installer"+_os.slash;
        if (fs.existsSync(installer_folder)==true)
        {
            fs.removeSync(installer_folder);
        }
        fs.mkdirSync(installer_folder);

        var files_folder=installer_folder+"files"+_os.slash;
        fs.mkdirSync(files_folder);

        var scripts_folder=installer_folder+"scripts";
        fs.mkdirSync(scripts_folder);
        fs.writeFileSync(scripts_folder+_os.slash+"postinstall",
            "#!/bin/bash\n"+
            "cd /Applications/frame/cfapp-*/mac/cfapp-master\n"+
            "../node-*/bin/node bin/cfapp.js frame install /Applications/frame/ --nocopy\n"
        );
        fs.chmodSync(scripts_folder+_os.slash+"postinstall", 0o755)

        var compiled_folder=installer_folder+"compiled";
        fs.mkdirSync(compiled_folder);

        copyResource(argv.software_folder,files_folder+_config);

        var build_cmd=
            '/usr/bin/pkgbuild '+
                '--root files/ '+
                '--install-location "'+_os.app_folder+'" '+
                '--scripts scripts/ '+
                '--identifier "com.nixps.'+_config+'" '+
                '--version "1.0.1" '+
                'compiled/'+package_name;
        console.log(build_cmd);        

        var process = require('process');
        var current=process.cwd();
        process.chdir(argv.output_location+'/installer/');

        const { execSync } = require('child_process'); 
        let stdout = execSync(build_cmd);
        console.log(stdout.toString());
    },

    create_msi: function (argv){    
        console.log('MSI');
        var array=argv.software_folder.split(_os.slash);
        var package_name=array.pop();
        if (package_name=='')
            package_name=array.pop();   
        if (package_name==''){
            console.error("cannot establish package name");
            return;
        }

        package_name=package_name+'.msi'
        console.log("Creating installer "+package_name);

        var fs = require('fs-extra');

        if (fs.existsSync(argv.software_folder)==false)
        {
            console.error("input: "+argv.software_folder+" doesn't exist");
        }
        if (fs.existsSync(argv.output_location)==false)
        {
            console.error("output:"+argv.output_location+" doesn't exist");
        }
    
        var installer_folder=argv.output_location+"installer"+_os.slash;
        if (fs.existsSync(installer_folder)==true)
        {
            fs.removeSync(installer_folder);
        }
        fs.mkdirSync(installer_folder);

        var files_folder=installer_folder+"files"+_os.slash;
        fs.mkdirSync(files_folder);

//        var scripts_folder=installer_folder+"scripts";
//        fs.mkdirSync(scripts_folder);
//        fs.writeFileSync(scripts_folder+_os.slash+"postinstall",
//            "#!/bin/bash\n"+
//            "cd /Applications/frame/cfapp-*/mac/cfapp-master\n"+
//            "../node-*/bin/node bin/cfapp.js frame install /Applications/frame/ --nocopy\n"
//        );
//        fs.chmodSync(scripts_folder+_os.slash+"postinstall", 0o755)

        var compiled_folder=installer_folder+"compiled";
        fs.mkdirSync(compiled_folder);

        copyResource(argv.software_folder,files_folder+_config);

        // msi-packager -n frame -v 1.0 -m Hybrid -u ED5BE4ED-4B23-41E0-A202-215FEC330DD7 -i icon.ico -e frame/dir1/nuc2.exe -a x64 frame/ installer.msi

        var createMsi = require('./libmsi.js')

        var options = {
        
          // required
          source: files_folder,
          output: compiled_folder+_os.slash+package_name,
          name: 'frame',
          upgradeCode: 'ED5BE4ED-4B23-41E0-A202-215FEC330DD7',
          version: '1.0.0',
          manufacturer: 'Hybrid Software',
          iconPath: __dirname+'/frame_icon.ico',
          executable: 'run.exe',
        
          // optional
          description: "Super stuff!",
          arch: 'x64',
          //localInstall: true
        
        }
        
        console.log(options);

        createMsi(options, function (err) {
          if (err) throw err
          console.log('Outputed to ' + options.output)
        })
    },
    get_systeminfo: get_systeminfo,
    get_setup_info: get_setup_info,
    put_setup_info: put_setup_info,
    remove_setup_info: remove_setup_info,
    copyResource: copyResource,
    removeResource: removeResource
};

