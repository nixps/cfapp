const kCLOUDFLOW="cloudflow";
const kFRAME="cloudflow_plug-in_suite";

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
            //rebranding should not break compatiblity with frame.json
            if(_config == kFRAME){
                obj.setup_file='/Users/Shared/NiXPS/frame.json';
            }else{
                obj.setup_file='/Users/Shared/NiXPS/'+_config+'.json';
            }
        } break;
        case 'win32': {
            obj.data_folder='C:\\ProgramData\\NiXPS';
            //rebranding should not break compatiblity with frame.json
            if(_config == kFRAME){
                obj.setup_file='C:\\ProgramData\\NiXPS\\frame.json';
            }else{
                obj.setup_file='C:\\ProgramData\\NiXPS\\'+_config+'.json';
            }
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
            obj.setup = JSON.parse(fs.readFileSync(obj.setup_file, 'utf8'));

            obj.nucleusd = '"' + obj.setup.app_folder + _os.slash + "nucleusd" + _os.exe + '"';
        
            // let's gather the nucleusd status (requires db, so skip for frame)
            if (_config!=kFRAME && _config!="frame"){
                console.log("Checking nucleusd status. Config is "+_config);
                let input = execSync(obj.nucleusd+" --status --json");
                obj.status=JSON.parse(input.toString());
            }
        
            let version = execSync(obj.nucleusd+" --version");
            obj.version=version.toString().trim();

            if (_config==kFRAME){
                obj.version=obj.version.replace("Cloudflow","Cloudflow Plug-In Suite");
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

    process.umask(0);

    if (fs.existsSync(current.data_folder)===false)
    {
        // create the NiXPS folder if it doesn't exist
        fs.mkdirSync(current.data_folder);
    }

    fs.writeFileSync(current.setup_file,JSON.stringify(info));

    if (_os.platform == "win32")
    {
        const { execSync } = require('child_process');

        execSync('ICACLS "'+  current.setup_file + '" /grant "Users":F');
        
        let frameworkstationsetup=current.data_folder + _os.slash + "FrameWorkstationSetup.json";

        if (!fs.existsSync(frameworkstationsetup))
        {
            fs.writeFileSync(frameworkstationsetup, "{}");
        }

        execSync('ICACLS "'+  frameworkstationsetup + '" /grant "Users":F');
        
    }

    //console.log(info);

    return get_setup_info();
};

var remove_setup_info=function() {
    var current=get_setup_info();

    var fs = require('fs');

    if (fs.existsSync(current.setup_file)===true)
    {
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

                if(cloudflow.setup.is_frame)
                {
                    command = command + " --frame";
                }
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

                if(cloudflow.setup.is_frame)
                {
                    command += " --frame";
                }

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

        console.log('Installing ' + software_folder);
    
        // if (cloudflow.installed==true)
        // {
        //     console.error('Please uninstall existing first!');
        //     return;    
        // }

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

            var command=cloudflow.nucleusd + " --install" + cloudflow.setup.cmd;

            console.log(command);
    
            const { execSync } = require('child_process'); 

            execSync(command, {}, function(error, stdout, stderr) {
                console.log(error);
                console.log(stdout);
                console.log(stderr);
            });
        }
        console.log("Succesfully installed!");
    },
    uninstall: function(argv) {
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
                var command= cloudflow.nucleusd + " --uninstall";

                if(cloudflow.setup.is_frame){
                    command += " --frame";
                }

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
        
        remove_setup_info();

        if (argv.hasOwnProperty("noremove") && argv["noremove"]==true)
        {
            console.log("--noremove, skipping file cleanup");
        } else
        {
            var folder_to_remove=cloudflow.setup.app_folder;
            removeResource(folder_to_remove);
        }
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
        if (_os.platform!='darwin')
        {
            console.error("This only works on a macOS machine.");
            return;
        }
        
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

        fs.writeFileSync(scripts_folder + _os.slash + "postinstall",
            "#!/bin/bash -x\n" +
            "cd /Applications/cloudflow_plug-in_suite/cfapp-*/mac/cfapp-master/\n"+
            "sudo -u \"$(stat -f %Su \"$HOME\")\" ../node-*/bin/node bin/cfapp.js frame stop\n" +
            "../node-*/bin/node bin/cfapp.js frame uninstall --noremove\n" +
            "../node-*/bin/node bin/cfapp.js frame install \"/Applications/cloudflow_plug-in_suite/\" --nocopy\n" +
            "sudo -u \"$(stat -f %Su \"$HOME\")\" ../node-*/bin/node bin/cfapp.js frame start"
        );

        fs.chmodSync(scripts_folder+_os.slash+"postinstall", 0o755);

        var compiled_folder=installer_folder+"compiled";
        fs.mkdirSync(compiled_folder);

        copyResource(argv.software_folder,files_folder+_config);

        fs.writeFileSync(files_folder + _config + _os.slash + "uninstall.command",
            '#!/bin/bash -x\n'+
            '"/Applications/cloudflow_plug-in_suite/cfapp-*/mac/node-*/bin/node" "/Applications/cloudflow_plug-in_suite/cfapp-*/mac/cfapp-master/bin/cfapp.js" frame stop\n' +
            'sudo "/Applications/cloudflow_plug-in_suite/cfapp-*/mac/node-*/bin/node" "/Applications/cloudflow_plug-in_suite/cfapp-*/mac/cfapp-master/bin/cfapp.js" frame uninstall\n' +
            'exit\n'
        );
        
        fs.chmodSync(files_folder + _config + _os.slash + "uninstall.command", 0o755);

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
        
        process.chdir(argv.output_location+'/installer/');

        const { execSync } = require('child_process'); 
        let stdout = execSync(build_cmd);
        console.log(stdout.toString());
    },

    create_msi: function (argv){ 
        
        if (_os.platform!='darwin')
        {
            console.error("This only works on a macOS machine.");
            return;
        }

        var fs = require('fs-extra');
        if (fs.existsSync('/usr/local/bin/msibuild')==false)
        {
            console.error("The necessary commandline tools to create .msi files are missing.");
            console.log("Generating an .msi uses the msitools from https://wiki.gnome.org/msitools");
            console.log("These can be installed via 'brew install msitools");
            console.log("It is driven via an NPM mbodule called msi-packager from https://github.com/mmckegg/msi-packager")
            return;
        }
        
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

        fs.writeFileSync(files_folder + _os.slash + "launch.bat",
            '@echo off\r\n'+
            '\r\n'+
            '>nul 2>&1 "%SYSTEMROOT%\\system32\\cacls.exe" "%SYSTEMROOT%\\system32\\config\\system"\r\n'+
            'if \'%errorlevel%\' NEQ \'0\' (\r\n'+
            'goto UACPrompt\r\n'+
            ') else ( goto gotAdmin )\r\n'+
            '\r\n'+
            ':UACPrompt\r\n'+
            'echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\\getadmin.vbs"\r\n'+
            'echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\\getadmin.vbs"\r\n'+
            '"%temp%\\getadmin.vbs"\r\n'+
            'exit /B\r\n'+
            '\r\n'+
            ':gotAdmin\r\n'+
            'if exist "%temp%\\getadmin.vbs" ( del "%temp%\\getadmin.vbs" )\r\n'+
            'pushd "%CD%"\r\n'+
            'CD /D "%~dp0"\r\n'+
            ':: BatchGotAdmin\r\n'+
            '\r\n'+
            '\r\n'+
            'cd "%ProgramFiles%\\cloudflow_plug-in_suite\\cfapp-*\\win\\node*\\"\r\n' +
            'set "nodefolder=%cd%"\r\n' +
            'cd "%ProgramFiles%\\cloudflow_plug-in_suite\\cfapp-*\\win\\cfapp-*\\"\r\n' +
            'set "cfappmaster=%cd%"\r\n' +
            '"%nodefolder%\\node.exe" "%cfappmaster%\\bin\\cfapp.js" frame install "%ProgramFiles%\\cloudflow_plug-in_suite\\\\" --nocopy\r\n' +
            '"%nodefolder%\\node.exe" "%cfappmaster%\\bin\\cfapp.js" frame start\r\n'
            +'PAUSE'
        );

        fs.writeFileSync(files_folder + _os.slash + "uninstall.bat",
        '@echo off\r\n'+
        '\r\n'+
        '>nul 2>&1 "%SYSTEMROOT%\\system32\\cacls.exe" "%SYSTEMROOT%\\system32\\config\\system"\r\n'+
        'if \'%errorlevel%\' NEQ \'0\' (\r\n'+
        'goto UACPrompt\r\n'+
        ') else ( goto gotAdmin )\r\n'+
        '\r\n'+
        ':UACPrompt\r\n'+
        'echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\\getadmin.vbs"\r\n'+
        'echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\\getadmin.vbs"\r\n'+
        '"%temp%\\getadmin.vbs"\r\n'+
        'exit /B\r\n'+
        '\r\n'+
        ':gotAdmin\r\n'+
        'if exist "%temp%\\getadmin.vbs" ( del "%temp%\\getadmin.vbs" )\r\n'+
        'pushd "%CD%"\r\n'+
        'CD /D "%~dp0"\r\n'+
        ':: BatchGotAdmin\r\n'+
        'cd "%ProgramFiles%\\cloudflow_plug-in_suite\\"\r\n' +
        'FOR /F "tokens=*" %%g IN (\'dir /b cfapp-*\') do (SET cfapp=%%g)\r\n' +
        'echo "Copying to tmp location..."\r\n'+
        'xcopy "%ProgramFiles%\\cloudflow_plug-in_suite\\%cfapp%" "%TEMP%\\%cfapp%\\" /E /Y /R /C /Q\r\n' +
        'xcopy "%ProgramFiles%\\cloudflow_plug-in_suite\\cleanup.bat" "%TEMP%\\%cfapp%\\" /E /Y /R /C /Q\r\n' +
        'start /b "" %TEMP%\\%cfapp%\\cleanup.bat %cfapp%\r\n'
        );

        fs.writeFileSync(files_folder + _os.slash + "cleanup.bat",
        '@echo off\r\n'+
        'break off\r\n'+
        'set "cfappdir=%1"\r\n' +
        'cd "%TEMP%\\%cfappdir%\\win\\node*\\"\r\n' +
        'set "nodefolder=%cd%"\r\n' +
        'cd "%TEMP%\\%cfappdir%\\win\\cfapp-*\\"\r\n' +
        'set "cfappmaster=%cd%"\r\n' +
        '"%nodefolder%\\node.exe" "%cfappmaster%\\bin\\cfapp.js" frame stop\r\n' +
        '"%nodefolder%\\node.exe" "%cfappmaster%\\bin\\cfapp.js" frame uninstall\r\n'+
        'del C:\\Users\\Public\\Desktop\\cloudflow_plug-in_suite.lnk\r\n'+
        'PAUSE\r\n'+
        'exit'
        );


        var compiled_folder=installer_folder+"compiled";
        fs.mkdirSync(compiled_folder);

        copyResource(argv.software_folder, files_folder);

        // msi-packager -n frame -v 1.0 -m Hybrid -u ED5BE4ED-4B23-41E0-A202-215FEC330DD7 -i icon.ico -e frame/dir1/nuc2.exe -a x64 frame/ installer.msi

        var createMsi = require('./libmsi.js')

        var options = {
          // required
          source: files_folder,
          output: compiled_folder+_os.slash+package_name,
          name: 'cloudflow_plug-in_suite',
          upgradeCode: 'ED5BE4ED-4B23-41E0-A202-215FEC330DD7',
          version: '18.8.1',
          manufacturer: 'Hybrid Software',
            iconPath: __dirname+'/frame_icon.ico',
            executable: 'launch.bat',
            runAfter: true,
        
          // optional
          description: "Cloudflow Plug-in Suite created by HYBRID Software",
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

