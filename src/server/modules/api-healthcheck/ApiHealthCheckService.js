var DFConnection = require('../common/service-base/DFConnection');
var moment = require('moment');

var ApiHealthCheckService = function (options) {
    var _dataConnection = new DFConnection();
    this._restRequest = _dataConnection.getRequest();
    this._serverUrl = _dataConnection.getServerUrl();
    this._copServerUrl = _dataConnection.getCOPServerUrl();
}

ApiHealthCheckService.prototype = {
    call: async function(url) {
        //console.log('actual url', url);

        var urlSegments = url.split('/');

        var tenantId = urlSegments[1];
        var apiUrl = url.replace('/' + tenantId + '/data/healthcheck/', '');
        //console.log(tenantId);

        var timeStamp = moment().toISOString();
        var baseUrl = this._serverUrl + '/' + tenantId + '/api/';
        var dfUrl = baseUrl + apiUrl + '?timeStamp=' + timeStamp;
        var apiConfigKey = apiUrl.replace('/','-');

        var healthcheckConfigs = await this.getHealthcheckConfig(baseUrl, apiConfigKey);
        //console.log('healthcheck configs ', JSON.stringify(healthcheckConfigs));

        if (!(healthcheckConfigs && healthcheckConfigs.response && healthcheckConfigs.response.configObjects)) {
            return this.createFatalError(apiUrl);
        }

        var response = undefined;

        var apiConfig = this.getApiConfig(healthcheckConfigs, apiConfigKey);
        var request = apiConfig.request;
        var collectionName = apiConfig.responseInfo.collectionName;

        if(!request) {
            response = this.createFatalError(apiUrl);
        }
        else {
            request.url = dfUrl;
            response = await this.callGetApi(request, apiUrl, collectionName);
        }

        return response;
    },
    createFatalError: function (serviceName) {
        var errResponse = {
                "status": "error",
                "msg": "Failed to load healthcheck config for " + serviceName + " service.",
                "detail": {
                    "request": {},
                    "response": {}
                }
            }

        return errResponse;
    },
    callGetApi: async function (options, serviceName, collectionName) {  
        var apiResponse = await this.callRdfApi(options);
        var res = {};

        //console.log('collection name ', collectionName);
        //console.log('api response ', JSON.stringify(apiResponse));
        
        if(apiResponse && apiResponse.response) {
            if(apiResponse.response[collectionName] && apiResponse.response[collectionName].length > 0) {
                res = {
                    "status": "success",
                    "msg": "All is well...! " + serviceName + " call returned with data.",
                    "detail": {
                        "request": options.body,
                        "response": apiResponse
                    }
                };
            }
            else {
                res = {
                    "status": "warning",
                    "msg": serviceName +  " call returned without any data. Please check the system.",
                    "detail": {
                        "request": options.body,
                        "response": apiResponse
                    }
                };
            }
        }
        else {
            res = apiResponse;
        }
        
        return res;
    },
    getHealthcheckConfig: async function (baseUrl, apiConfigKey) {
        var request = require('./healthcheckconfig-get').request;
        
        request.body.params.query.id = apiConfigKey + "_apihealthcheckconfig";
        request.url = baseUrl + "configurationservice/get";

        var result = await this.callRdfApi(request);
        
        //console.log('health check configs ', JSON.stringify(result));
        return result;
    },
    getApiConfig: function (healthcheckConfigs, configKey) {
        var config = undefined;
        if (healthcheckConfigs && healthcheckConfigs.response && healthcheckConfigs.response.configObjects) {
            var configObjects = healthcheckConfigs.response.configObjects;
            if(configObjects.length > 0) {
                for(var configObject of configObjects) {
                    if(configObject.name == configKey) {
                        if(configObject.data && configObject.data.contexts && configObject.data.contexts.length > 0 
                            && configObject.data.contexts[0].jsonData && configObject.data.contexts[0].jsonData.config)
                        config = configObject.data.contexts[0].jsonData.config;
                        break;
                    }
                }
            }
        }

        return config;
    },
    callRdfApi: async function(options) {
        var res = {};

        //console.log('RDF api call ', JSON.stringify(options, null, 2));
        var reqPromise = this._restRequest(options)
            .catch(function (error) {
                res = {
                    "status": "error",
                    "msg": "Failed with fatal error while confirming system health for the api " + options.url,
                    "detail": {
                        "request": options.body,
                        "response": error
                    }
                };

                return res;
            })
            .catch(function (err) {
                console.error(err); // This will print any error that was thrown in the previous error handler.
            });

        return await reqPromise;
    }
};

module.exports = ApiHealthCheckService;
