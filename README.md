# Riversand Technologies - UI Platform

# Setup - Windows

## Prerequisites

Below steps are needed only for the first time when you setup your dev machine

1. Install node.js server from https://nodejs.org/en/download/

2. Install git repository and configure it

    `https://git-scm.com/downloads`

3. Install [bower](https://www.npmjs.com/package/bower)

    `npm install -g bower`

4. Install [gulp](http://gulpjs.com/)

    `npm install -g gulp`

5. Install [polymer-cli](https://github.com/Polymer/polymer-cli):

    `npm install -g polymer-cli`

6. Clone this git repository, if you haven't done already. 
This command would create local folder for the repository. Make sure you are in right folder. 

    `git clone https://github.com/riversandtechnologies/ui-platform.git`

## Setup nginx and auth-service
1. Restore AuthSetup-Package from ui-platform repository into your **root** drive (C or D drive). Make sure this directly in the root drive. On restore, c or d drive should have 3 new folders as below:
    - Nginx
    - platformsvc-authenticationsvc
    - var
2. Open \var\lib\rs\dataplatform\config\dataplatformpodconfig.json file and edit nginx section as below: 
Provide node name as local system name. Example: <<MACHINE-NAME>>.riversand.com. This has to be FQDN (Fully qualified domain name) where domain is riversand.com.  DO NOT USE localhost.

  ```
  "nginx": 
      {
	 "sslEnabled": true,
         "sslPort": 443,
         "httpPort": 80,
         "nodes": 
         [
            "MACHINE-NAME.riversand.com"
         ]
      }
   }, 
   
   ```

## Setup DNS
Update **root**\Windows\System32\etc\drivers\hosts file:

```
    127.0.0.1       <<MACHINE-NAME>>.riversand.com
```
    
## Run Nginx, auth-service and ui-platform app:

1. Make sure you don’t have port 80 running. Normally skype,SQL server or your local ISS consumes port 80. To stop IIS, run iisreset -stop. For skype, change skype’ s advanced options

2. In cmd, go to root/nginx and run start nginx. Make sure nginx is running by running command tasklist /fi "imagename eq nginx.exe"

3. Install pm2 with the follwoing command,

    `npm install pm2 –g` 
    
   In cmd, go to root/platformsvc-authenticationsvc/src and run pm2 start app.js --name="auth-service"

4. All the developers running their local nginx need to do below change to get this running.

     - Go to your authservice/src/server folder and open passport.js file. 
     - Search for tenantId and replace value there with “jcpenney”.
     - Restart your auth service
     
5. Run your normal ui-platform using “npm run app” in ui-platform folder.

6. With this, when you open your browser with https://MACHINE-NAME.riversand.com it would redirect you to ask for auth0 authentication and further redirect you to ui app.

## Handy Commands for nginx:

     - start nginx   (it will start nginx)
     - tasklist /fi "imagename eq nginx.exe"  (it will provide status of nginx service)
     - nginx -s quit (it will shut down nginx server gracefully)

## Handy commands to run Auth app as a background service:

     - npm install pm2 –g (it is one time install of pm2)
     - pm2 start app.js --name="authservice" (name can be anything of your choice, it will help you to know the status of your auth app)
     - pm2 stop authservice (to stop auth service app)
     - pm2 status authservice (to know the service status)

## Install local dependencies
Below steps are needed every time you pull new changes, specially in the initial phase of the project. 
This MUST should be done within a command window opened at the `ui-platform` folder path

1. Install local npm dependencies
    
    `npm install`

2. Install local bower dependencies

    `bower install`

npm and bower will not install the components for which the required/latest versions are already available locally, so there is no harm in running them

## Start the development server with live browser reloading

This command serves the app at `http://localhost:8080` and provides basic URL
routing for the app. Internally this command runs `polymer lint & polymer serve & gulp watch`

    npm run app

Use below url format to run main app:
     
    http://localhost:5005/
    
Use below url formats to view element's demo and API page:
     
    http://localhost:5005/src/elements/{component-name}/demo
    Example: http://localhost:5005/src/elements/pebble-textbox/demo

## Build
  
This command performs HTML, CSS,and JS minification on the application
dependencies, and generates a service-worker.js file with code to pre-cache the
dependencies based on the entrypoint and fragments specified in `polymer.json`.
The minified files are output to the `build/unbundled` folder, and are suitable
for serving from a HTTP/2+Push compatible server.

In addition the command also creates a fallback `build/bundled` folder,
generated using fragment bundling, suitable for serving from non
H2/push-compatible servers or to clients that do not support H2/Push. 

Internally this command runs `gulp & polymer build` 

    npm run build

## Preview the build

This command serves the minified version of the app in an unbundled state, as it would
be served by a push-compatible server. 
Internally this command runs `polymer lint & gulp & polymer serve build/bundled`

    npm run build/bundled
    # Open your browser and navigate to localhost:8080

This command serves the unbundled version of the app generated using fragment bundling.
Internally this command runs `polymer lint & gulp & polymer serve build/unbundled`

    npm run build/unbundled
    # Open your browser and navigate to localhost:8080

## Run tests

This command will run
[Web Component Tester](https://github.com/Polymer/web-component-tester) against the
browsers currently installed on your machine. Internally this command runs `gulp & polymer serve build/bundled`

    npm run test



##


# Setup - OSX

## Prerequisites

Below steps are needed only for the first time when you setup your OSX dev machine

**MAKE SURE YOU HAVE THE LATEST STABLE RELEASE OF OSX AND DEVELOPER ACCOUNT**

1. Install Xcode from https://developer.apple.com/download/ or use terminal:

    `xcode-select --install`

2. Install node.js server from https://nodejs.org/en/download/

3. Install git repository from https://git-scm.com/downloads

4. Install [bower](https://www.npmjs.com/package/bower)

    `sudo npm install -g bower`

5. Install [gulp](http://gulpjs.com/)

    `sudo npm install -g gulp`

6. Install [polymer-cli](https://github.com/Polymer/polymer-cli):

    `sudo npm install -g polymer-cli`

7. Install [homebrew](https://brew.sh/)

    `/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`

8. Install [dnsmasq](http://www.thekelleys.org.uk/dnsmasq/doc.html)

    `brew install dnsmasq`

    • Copy the default configuration file.

    `cp $(brew list dnsmasq | grep /dnsmasq.conf.example$) /usr/local/etc/dnsmasq.conf`

    • Copy the daemon configuration file into place.

    `sudo cp $(brew list dnsmasq | grep /homebrew.mxcl.dnsmasq.plist$) /Library/LaunchDaemons/`

    • Start Dnsmasq automatically.

    `sudo launchctl load /Library/LaunchDaemons/homebrew.mxcl.dnsmasq.plist`

9. Clone this git repository locally. Make sure you CD to the correct folder. 

    `git clone https://github.com/riversandtechnologies/ui-platform.git`


## Setup Dnsmasq

1. Navigate to directory '/usr/local/etc/dnsmasq.conf'

2. Insert 'address=/MACHINE-NAME.riversand.com/127.0.0.1' into the file and save

3. Restart process with the following:

    `sudo launchctl stop homebrew.mxcl.dnsmasq`

   Then

   `sudo launchctl start homebrew.mxcl.dnsmasq`

4. Test DNS using the following:

    `dig MACHINE-NAME.riversand.com @127.0.0.1`

5. Confirm A record has been created. You should get a response of:

    `MACHINE-NAME.riversand.com. 0	IN	A	127.0.0.1`

## Setup DNS Server

1. Navigate to top menu and select the apple icon in the top left.

2. Select 'System Prefrences...'

3. In the third row select the 'Network' icon.

4. Click the 'Advanced...' button on the bottom left of the pane.

5. Select 'DNS' from the bar menu.

6. Under the DNS Servers pane select the + icon and add each of the following IPs:

   • 127.0.0.1 

   • 8.8.8.8

   • 8.8.4.4

7. Under the Search Domains pane select the + icon and add:

   •  MACHINE-NAME.riversand.com

8. Select 'OK' on the bottom right of the Network pane to save these settings.

## Setup nginx and auth-service

1. Navigate to **root** directory: 

   • Select finder icon 
   • Select 'Go' from top menu
   • Select 'Go To Folder'
   • In the dropdown enter '/'
   • Select 'Go' button to enter **root** directory

2. Unzip AuthSetup-Package from ui-platform repository and copy the 'platformsvc-authenticationsvc' folder into **root** directory

3. Copy var folder into root **WARNING!!!** DO NOT OVERWRIVE EXISTING VAR FOLDER!!!

   • Select finder icon 
   • Select 'Go' from top menu
   • Select 'Go To Folder'
   • In the dropdown enter '/var/lib'
   • Select 'Go' button to enter **lib** directory in **root**
   • Open the unzipped AuthSetup-Package folder and then navigate to '/var/lib'
   • Copy 'rs' folder from AuthSetup-Package into OSX **root** '/var/lib' directory

4. Open \var\lib\rs\dataplatform\config\dataplatformpodconfig.json file and edit nginx section as below: 
   Provide node name as local system name. Example: MACHINE-NAME.riversand.com

    • To find your Mac's MACHINE-NAME, choose the apple icon from the top menu > “System Prefrences” > "sharing"
    • At the top of the pane you will see "Computers on your local network can access your computer at: MACHINE-NAME.riversand.com"

  ```
  "nginx": 
      {
	 "sslEnabled": true,
         "sslPort": 443,
         "httpPort": 80,
         "nodes": 
         [
            "MACHINE-NAME.riversand.com"
         ]
      }
   }, 
   
   ```
    
5. Install nginx 

    • Open terminal and run

    `brew tap homebrew/nginx`

    • Add full permissions with

    `brew install nginx-full --with-auth-req`

    • Confirm install with

    `nginx -V`

6. Copy 'nginx.conf' file from unzipped AuthSetup-Package 'ngnix/conf' into '/usr/local/etc/nginx' and overwrite file in directory

7. Copy 'keys/' directory from unzipped AuthSetup-Package 'ngnix/conf' into '/usr/local/etc/nginx' and overwrite forlder if it already exist


## Run Nginx, auth-service and ui-platform app:

1. Make sure you don’t have port 80 running. Normally skype,SQL server or your local ISS consumes port 80. To stop IIS, run iisreset -stop. For skype, change skype’ s advanced options

2. In Terminal, run `sudo nginx`. Make sure nginx is running by running `sudo nginx` again and confirm the following errors:
    
    'nginx: [emerg] bind() to 0.0.0.0:443 failed (48: Address already in use)'
    'nginx: [emerg] bind() to 0.0.0.0:80 failed (48: Address already in use)'

    **Please note nginx should be listening on 0.0.0.0:443 & 0.0.0.0:80**

3. In Terminal, install pm2 with the follwoing command:

    `npm install pm2 –g` 

4. In Terminal, go to '/platformsvc-authenticationsvc/src' and run 
   
   `pm2 start app.js --name="auth-service"`

5. All the developers running their local nginx need to do below change:

     - Go to '/platformsvc-authenticationsvc/src/server' folder and open 'passport.js' file. 
     - Search for "tenantId" and replace value there with “jcpenney”.
     - Restart your auth service in terminal `pm2 restart all`
     
6. Run your normal ui-platform using `npm run app` in ui-platform folder.

7. With this, when you open your browser with https://MACHINE-NAME.riversand.com it would redirect you to ask for auth0 authentication and further redirect you to ui app.



## Install local dependencies
Below steps are needed every time you pull new changes, specially in the initial phase of the project. 
This MUST should be done within a command window opened at the `ui-platform` folder path

1. Install local npm dependencies
    
    `npm install`

2. Install local bower dependencies

    `bower install`

npm and bower will not install the components for which the required/latest versions are already available locally, so there is no harm in running them



## Start the development server with live browser reloading

`npm run app`

Use below url format to run main app:
     
    http://localhost:5005/
    
Use below url formats to view element's demo and API page:
     
    http://localhost:5005/src/elements/{component-name}/demo
    Example: http://localhost:5005/src/elements/pebble-textbox/demo

This command serves the app at `http://localhost:8080` and provides basic URL
routing for the app. 

Internally this command runs 

`polymer lint & polymer serve & gulp watch`


## Build

Terminal command

`npm run build`

This command performs HTML, CSS,and JS minification on the application
dependencies, and generates a service-worker.js file with code to pre-cache the
dependencies based on the entrypoint and fragments specified in `polymer.json`.
The minified files are output to the `build/unbundled` folder, and are suitable
for serving from a HTTP/2+Push compatible server.

In addition the command also creates a fallback `build/bundled` folder,
generated using fragment bundling, suitable for serving from non
H2/push-compatible servers or to clients that do not support H2/Push. 

Internally this command runs 

`gulp & polymer build` 




## Preview the build

Terminal command

`npm run build/bundled`

• Open your browser and navigate to localhost:8080

This command serves the minified version of the app in an unbundled state, as it would
be served by a push-compatible server. 

Internally this command runs `polymer lint & gulp & polymer serve build/bundled`

Terminal command

`npm run build/unbundled`

• Open your browser and navigate to localhost:8080

This command serves the unbundled version of the app generated using fragment bundling.

Internally this command runs 

`polymer lint & gulp & polymer serve build/unbundled`




## Run tests

Terminal command

`npm run test`

This command will run:

[Web Component Tester](https://github.com/Polymer/web-component-tester) against the browsers currently installed on your machine. 

Internally this command runs 

`gulp & polymer serve build/bundled`

