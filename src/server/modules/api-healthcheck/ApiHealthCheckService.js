var DFConnection = require('../common/service-base/DFConnection');
var moment = require('moment');
var sleep = require('system-sleep');

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
        if(apiConfig) {
            var operation = apiConfig.operation;

            switch(operation) {
                case "get": {
                    return this.executeGetRequest(dfUrl, apiUrl, apiConfig);
                    break;
                }
                case "update": {
                    return this.executeUpdateRequest(dfUrl, apiUrl, apiConfig);
                    break;
                }
                case "create": {
                    console.log("creation operation not implemented yet");
                    break;
                }
                default: {
                    return this.createFatalError(apiUrl);
                }
            }
        }

        return {};
    },
    executeGetRequest: async function (dfUrl, apiUrl, apiConfig) {
        var response = {};

        var request = apiConfig.request;
        var collectionName = apiConfig.responseInfo.collectionName;

        if(!request) {
            response = this.createFatalError(apiUrl);
        }
        else {
            request.url = dfUrl;
            var apiResponse = await this.callRdfApi(request);
            if(apiResponse && apiResponse.response) {
                if(apiResponse.response[collectionName] && apiResponse.response[collectionName].length > 0) {
                    response = {
                        "status": "success",
                        "msg": "All is well...! " + apiUrl + " call returned with data.",
                        "detail": {
                            "request": request.body,
                            "response": apiResponse
                        }
                    };
                }
                else {
                    response = {
                        "status": "warning",
                        "msg": apiUrl +  " call returned without any data. Please check the system.",
                        "detail": {
                            "request": request.body,
                            "response": apiResponse
                        }
                    };
                }
            }
            else {
                response = apiResponse;
            }
        }

        return response;
    },
    executeUpdateRequest: async function (dfUrl, apiUrl, apiConfig) {
        var response = undefined;

        var getRequest = apiConfig.getRequest;
        var getApiUrl = apiConfig.getApiUrl;
        var updateRequest = apiConfig.updateRequest;
        var dataObjectName = apiConfig.dataObjectName;
        var attributesToUpdate = apiConfig.attributesToUpdate;
        var attrName = attributesToUpdate[0];
        var verificationDelayIntervals = apiConfig.verificationDelayIntervals;
        var collectionName = apiConfig.objectInfo.collectionName;
        var objectName = apiConfig.objectInfo.objectName;

        if(!getRequest) {
            response = this.createFatalError(apiUrl);
        }
        else {
            var newVal = moment().format("YYYY-MM-DDTHH:mm:ss.SSS-0500"); // just set new value as current timestamp..
            console.log('new val', newVal);
            getRequest.url = dfUrl.replace(apiUrl, getApiUrl);
            
            var getApiResponse = await this.callRdfApi(getRequest);

            if(!(getApiResponse && getApiResponse.response && getApiResponse.response[collectionName] && getApiResponse.response[collectionName].length > 0)) {
                response = {
                    "status": "error",
                    "msg": getRequest.url +  " call returned without any data. Please check the healthcheck config.",
                    "detail": {
                        "request": getRequest.body,
                        "response": getApiResponse
                    }
                }; 

                return response;
            }

            var dataObject = updateRequest.body[objectName];
            this.setAttrVal(dataObject.data.attributes, attrName, newVal);

            updateRequest.url = dfUrl;
            var updateApiResponse = await this.callRdfApi(updateRequest);

            if(updateApiResponse && updateApiResponse.response) {
                var status = updateApiResponse.response.status;
                if(status == "success") {
                    var i = 0;
                    var delay = 0;
                    do {
                        var val = await this.getDataObjectAttrVal(getRequest, collectionName, attrName);
                        console.log('val ', val);
                        if(val == newVal) {
                            response = {
                                "status": "success",
                                "msg": apiUrl +  " call returned with success status.",
                                "detail": {
                                    "request": updateRequest.body,
                                    "response": updateApiResponse,
                                    "verificationCount": i,
                                    "delay": delay
                                }
                            };
                            break;
                        }
                        var interval = verificationDelayIntervals[i];
                        delay += interval;
                        sleep(interval);
                        i++;
                    } while(i < verificationDelayIntervals.length);

                    if(!response) {
                        response = {
                            "status": "error",
                            "msg": apiUrl +  " call failed to update and get back the updated value",
                            "detail": {
                                "request": updateRequest.body,
                                "response": updateApiResponse,
                                "verificationCount": i
                            }
                        }; 
                    }
                } else {
                    response = {
                        "status": "error",
                        "msg": apiUrl +  " call failed.",
                        "detail": {
                            "request": updateRequest.body,
                            "response": updateApiResponse
                        }
                    }; 
                }
            }
            else {
                return this.createFatalError(apiUrl);
            }
        }

        return response;
    },
    getDataObjectAttrVal: async function(getRequest, collectionName, attrName) {
        var attrVal = undefined;

        var getApiResponse = await this.callRdfApi(getRequest);

        if(getApiResponse && getApiResponse.response && getApiResponse.response[collectionName] && getApiResponse.response[collectionName].length > 0) {
            var dataObject = getApiResponse.response[collectionName][0];

            if(dataObject && dataObject.data && dataObject.data.attributes && dataObject.data.attributes[attrName]) {
                var attr = dataObject.data.attributes[attrName];
                if(attr && attr.values && attr.values.length > 0) {
                    attrVal = attr.values[0].value;
                }
            }
        }

        return await attrVal;
    },
    callRdfApi: async function(options, attrName) {
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
    setAttrVal: function (attributes, attrName, val) {
        var attr = this.getOrCreate(attributes, attrName, {});
        var values = [{
            "source": "internal",
            "locale": "en-US",
            "value": val
        }];

        attr.values = values;
    },
    getOrCreate: function(obj, key, defaultVal) {
        var keyObj = obj[key];

        if (keyObj === undefined) {
            keyObj = defaultVal;
            obj[key] = keyObj;
        }

        return keyObj;
    }
};

module.exports = ApiHealthCheckService;
