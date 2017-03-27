'use strict';

var jsonGraph = require('falcor-json-graph'),
    futil = require('./config-falcor-util'),
    ConfigService = require('./ConfigService'),
    uuidV1 = require('uuid/v1'),
    $ref = jsonGraph.ref,
    $error = jsonGraph.error,
    $atom = jsonGraph.atom,
    expireTime = -60 * 60 * 1000,
    pathRootKey = "configs"; // 60 mins

var options = {};
var runOffline = process.env.RUN_OFFLINE;

if(runOffline) {
    options.runOffline = runOffline;
}

var configService = new ConfigService(options);

//falcor utilty functions' references
var createPath = futil.createPath,
    mergePathSets = futil.mergePathSets,
    createPath = futil.createPath,
    mergeAndCreatePath = futil.mergeAndCreatePath,
    unboxConfigData = futil.unboxConfigData,
    unboxJsonObject = futil.unboxJsonObject;
 
//route1: "configs[{keys:ctxKeys}]"
async function getConfigs(pathSet) {
    //console.log('configs call pathset requested:', pathSet);

    var ctxKeys = pathSet.ctxKeys;
    
    var response = [];
    var basePathSet = pathSet.slice(0, pathSet.indexOf("apps") + 1);
    var pathAfterComponent = pathSet.slice(pathSet.indexOf("components") + 2);

    var request = {
        "apps": pathSet.apps,
        "components": pathSet.components
    };

    //console.log('req to api ', JSON.stringify(request));
    var res = await configService.getConfigs(request);
    
    //console.log(JSON.stringify(res, null, 4));

    if (res !== undefined && res.response !== undefined && res.response.status == "success") {
        //console.log('response from api', JSON.stringify(res));

        if (res.response.configs !== undefined) {
            res.response.configs.forEach(function(config) {
                //console.log("config: ", JSON.stringify(config, null, 2));
                var appPath = mergePathSets(basePathSet, config.name);
                if(config.contexts && config.contexts.length > 0) {
                    var configComponents = config.contexts[0].components;
                    //console.log('configComponents: ', JSON.stringify(configComponents, null, 2));
                    request.components.forEach(function(componentName) { 
                        //console.log('componentName ', componentName, ' ', componentName in configComponents);
                        if(componentName in configComponents) {
                            var componentPath = mergePathSets(appPath, ["components", componentName]);
                            var componentConfigPath = mergePathSets(componentPath, pathAfterComponent);
                            var componentConfigValue = configComponents[componentName].config;
                            //console.log('componentConfigPath ', componentConfigPath, 'componentConfigValue ', componentConfigValue);
                            response.push(createPath(componentConfigPath, $atom(componentConfigValue)));     
                        }
                    });
                }        
            });
        }
    }
    
    //console.log(JSON.stringify(response, null, 4));
    return response;
}

async function getConfigComponentNames(pathSet) {
    //console.log('getConfigComponentNames call pathset requested:', pathSet);
    
    var response = [];
    var basePath = ["configs", "apps"];

    var request = {
        "apps": pathSet.apps
    };

    var res = await configService.getConfigComponentNames(request);

    if (res !== undefined && res.response !== undefined && res.response.status == "success") {
        //console.log('response from api', JSON.stringify(res));

        if (res.response.configs !== undefined) {
            for (let config of res.response.configs) {
                if(config.components) {
                    var componentNames = config.components;
                    //console.log("config: ", JSON.stringify(config, null, 2));
                    var outputPathSet = mergePathSets(basePath, [config.name, "componentNames"]);
                    //console.log('preparing single response with outputPathSet: ', JSON.stringify(outputPathSet, null, 2));
                    response.push(createPath(outputPathSet, $atom(componentNames)));       
                }
                         
            }
        }
    }

    //console.log(JSON.stringify(response, null, 4));
    return response;
}

module.exports = {
    getConfigs: getConfigs,
    getConfigComponentNames: getConfigComponentNames
};