'use strict';

var jsonGraph = require('falcor-json-graph'),
    futil = require('./config-falcor-util'),
    ConfigService = require('./ConfigService'),
    uuidV1 = require('uuid/v1'),
    $ref = jsonGraph.ref,
    $error = jsonGraph.error,
    $atom = jsonGraph.atom,
    expireTime = -60 * 60 * 1000,
    pathRootKey = "entitiesById"; // 60 mins

var mode = process.env.NODE_ENV;

var options = {'mode': 'dev-offline'};

var configService = new ConfigService(options);

//falcor utilty functions' references
var createPath = futil.createPath,
    unboxConfigData = futil.unboxConfigData,
    unboxJsonObject = futil.unboxJsonObject;
 
//route1: "configs[{keys:ctxKeys}]"
async function getConfigs(pathSet) {
    //console.log('configs call pathset requested:', pathSet);

    var ctxKeys = pathSet.ctxKeys;
    
    var response = [];
    pathRootKey = pathSet[0];

    var request = {};

    //console.log('req to api ', JSON.stringify(request));
    var res = await configService.getConfigs(request);
    
    //console.log(JSON.stringify(res, null, 4));

    if (res !== undefined && res.configOperationResponse !== undefined && res.configOperationResponse.status == "success") {
        //console.log('response from api', JSON.stringify(res));

        if (res.configOperationResponse.configs !== undefined) {
            for (let config of res.configOperationResponse.configs) {
                response.push(createPath([pathRootKey, config.id], $atom(config)));                
            }
        }
    }
    
    //console.log(JSON.stringify(response, null, 4));
    return response;
}

module.exports = {
    getConfigs: getConfigs
};