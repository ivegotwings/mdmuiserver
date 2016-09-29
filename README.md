# Riversand Technologies - UI Platform

### Setup

##### Prerequisites

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

### Start the development server

This command serves the app at `http://localhost:8080` and provides basic URL
routing for the app. Internally this command runs `gulp & polymer serve --open`

    npm run dev

Use below url format to view component's demo and API page:

    http://localhost:8080/components/{component-name}/
    Example: http://localhost:8080/components/ruf-ui-textbox/

### Build

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

### Preview the build

This command serves the minified version of the app in an unbundled state, as it would
be served by a push-compatible server. 
Internally this command runs `gulp & polymer serve build/bundled`

    npm run build/bundled
    # Open your browser and navigate to localhost:8080

This command serves the minified version of the app generated using fragment bundling.
Internally this command runs `gulp & polymer serve build/bundled`

    npm run build/unbundled
    # Open your browser and navigate to localhost:8080

    polymer serve build/bundled
    # Open your browser and navigate to localhost:8080

### Run tests

This command will run
[Web Component Tester](https://github.com/Polymer/web-component-tester) against the
browsers currently installed on your machine. Internally this command runs `gulp & polymer serve build/bundled`

    npm run test

## Browser sync / Live reload changes

Use below command in different terminal to live reload changes. 
This command would serve only when `npm run dev` command is already running in different terminal.
Internally this command runs `gulp watch`

    npm run watch

