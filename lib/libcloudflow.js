

module.exports = {
    start:  function() {
        var systeminfo=require("./systeminfo.js");
        var cloudflow = systeminfo.get_cloudflow_info();

        console.log("!! Running " + cloudflow.version);
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
        var systeminfo=require("./systeminfo.js");
        var cloudflow = systeminfo.get_cloudflow_info();

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
        var systeminfo=require("./systeminfo.js");
        var os = systeminfo.get_os_info();
    
        console.log('Installing '+argv.software_folder);
    
        const fs = require('fs');
        try
        {
            if (fs.lstatSync(argv.software_folder).isDirectory()===true) {}
        } catch(e)    
        {
            console.error(argv.software_folder+" is not a CLOUDFLOW software folder");
            return;
        }
    
        var setup=
        {
            "app_folder": argv.software_folder,
            "run_as_service": false,
            "options": {},
            "cmd": ""
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
    
        console.debug("cmd:"+setup.cmd);
    
        if (argv.hasOwnProperty("run_as_service") && argv["run_as_service"]==true)
        {
            setup.run_as_service=true;
        }
        console.debug("run_as_service: "+setup.run_as_service);
    
        var cloudflow = systeminfo.put_cloudflow_info(os,setup,);
    
        console.debug("cloudflow: "+JSON.stringify(cloudflow));
        if (cloudflow.setup.run_as_service)
        {
            console.log("as a service ...");
            var command=cloudflow.nucleusd+" --install"+cloudflow.setup.cmd;
            console.log(command);
    
            const { execSync } = require('child_process'); 
            let input = execSync(command);
        }
        //console.debug(JSON.stringify(cloudflow));
    },
    uninstall: function() {
        var systeminfo=require("./systeminfo.js");
        var cloudflow = systeminfo.get_cloudflow_info();

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
    },
    status: function ()
    {
        var systeminfo=require("./systeminfo.js");
        var cloudflow = systeminfo.get_cloudflow_info();
    
        console.log(JSON.stringify(cloudflow.status, null, 2));  
    }    
};
