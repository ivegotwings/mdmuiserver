let DFConnection = require('../common/service-base/DFConnection');
let moment = require('moment');
let sleep = require('system-sleep');
let uuidV1 = require('uuid/v1');
const TenantSystemConfigService = require('../services/configuration-service/TenantSystemConfigService');
let ApiHealthCheckService = function (options) {
    let _dataConnection = new DFConnection();
    this._restRequest = _dataConnection.getRequest();
    this._serverUrl = _dataConnection.getServerUrl();
    this._copServerUrl = _dataConnection.getCOPServerUrl();
    this._internalRdfUrl = _dataConnection.getInternalRdfUrl();
    this.tenantSystemConfigService = new TenantSystemConfigService(options);
}

ApiHealthCheckService.prototype = {
    call: async function (url) {
        //console.log('actual url', url);

        let urlSegments = url.split('/');

        let tenantId = urlSegments[1];
        let apiUrl = url.replace('/' + tenantId + '/data/healthcheck/', '');
        //console.log(tenantId);

        let timeStamp = moment().toISOString();
        let baseUrl = this._serverUrl + '/' + tenantId + '/api/';
        let copUrl = this._copServerUrl + '/' + tenantId + '/api/';
        let isCOPService = false;
        if(apiUrl.indexOf("copservice/") > -1){
            isCOPService = true;
        }
        let dfUrl = (isCOPService ? copUrl : baseUrl) + apiUrl + '?timeStamp=' + timeStamp;
        let apiConfigKey = apiUrl.replace(/\//g, '-');

        let healthcheckConfigs = await this.getHealthcheckConfig(baseUrl, apiConfigKey);
        //console.log('healthcheck configs ', JSON.stringify(healthcheckConfigs));

        if (!(healthcheckConfigs && healthcheckConfigs.response && healthcheckConfigs.response.configObjects)) {
            return this.createFatalError(apiUrl);
        }

        let response = undefined;

        let apiConfig = this.getApiConfig(healthcheckConfigs, apiConfigKey);
        if (apiConfig) {

            if(apiConfig.rdfInternal){
                let serviceName = apiUrl.replace("internal/","");
                dfUrl = this._internalRdfUrl+ '/' + tenantId + '/api/' + serviceName + '?timeStamp=' + timeStamp;
            }
            let operation = apiConfig.operation;

            switch (operation) {
                case "get": {
                    return this.executeGetRequest(dfUrl, apiUrl, apiConfig, isCOPService);
                }
                case "update": {
                    return this.executeUpdateRequest(dfUrl, apiUrl, apiConfig);
                }
                case "create": {
                    return this.executeCreateRequest(dfUrl, apiUrl, apiConfig);
                }
                default: {
                    return this.createFatalError(apiUrl);
                }
            }
        }

        return {};
    },
    executeGetRequest: async function (dfUrl, apiUrl, apiConfig, isCOPService) {
        let response = {};

        let request = apiConfig.request;
        let collectionName = apiConfig.responseInfo.collectionName;

        if (!request) {
            response = this.createFatalError(apiUrl);
        }
        else {
            if(isCOPService){
                dfUrl = dfUrl.replace("copservice/", "rsConnectService/");
            }
            request.url = dfUrl;

            let getStartTick = process.hrtime();

            let apiResponse = await this.callRdfApi(request);

            let getEndTick = process.hrtime(getStartTick);
            let getTimeTaken = getEndTick[1] / 1000000;

            if ((apiResponse && apiResponse.response) || isCOPService) {
                if ((isCOPService && apiResponse[collectionName]) || (apiResponse.response && apiResponse.response[collectionName] && apiResponse.response[collectionName].length > 0)) {
                    response = {
                        "status": "success",
                        "msg": "All is well...! " + apiUrl + " call returned with data.",
                        "detail": {
                            "request": request.body,
                            "response": apiResponse,
                            "stats": {
                                "timeTaken": getTimeTaken,
                                "verificationTimeTaken": -1,
                                "noOfVerificationProbs": -1,
                                "verificationProbTotalWait": -1
                            }
                        }
                    };
                }
                else {
                    response = {
                        "status": "warning",
                        "msg": apiUrl + " call returned without any data. Check the system.",
                        "detail": {
                            "request": request.body,
                            "response": apiResponse,
                            "stats": {
                                "timeTaken": getTimeTaken,
                                "verificationTimeTaken": -1,
                                "noOfVerificationProbs": -1,
                                "verificationProbTotalWait": -1
                            }
                        }
                    };
                }
            }
            else {
                response = {
                    "status": "error",
                    "msg": apiUrl + " call failed to return expected data.",
                    "detail": {
                        "request": request.body,
                        "response": apiResponse,
                        "stats": {
                            "timeTaken": getTimeTaken,
                            "verificationTimeTaken": -1,
                            "noOfVerificationProbs": -1,
                            "verificationProbTotalWait": -1
                        }
                    }
                };
            }
        }

        return response;
    },
    executeUpdateRequest: async function (dfUrl, apiUrl, apiConfig) {
        let response = undefined;

        let getRequest = apiConfig.getRequest;
        let getApiUrl = apiConfig.getApiUrl;
        let updateRequest = apiConfig.updateRequest;
        let attributesToUpdate = apiConfig.attributesToUpdate;
        let attrName = attributesToUpdate[0];
        let verificationDelayIntervals = apiConfig.verificationDelayIntervals;
        let collectionName = apiConfig.objectInfo.collectionName;
        let objectName = apiConfig.objectInfo.objectName;

        if (!getRequest) {
            response = this.createFatalError(apiUrl);
        }
        else {
            let newVal = moment().format("YYYY-MM-DDTHH:mm:ss.SSS-0500"); // just set new value as current timestamp..
            //console.log('new val', newVal);
            getRequest.url = dfUrl.replace(apiUrl, getApiUrl);

            let getApiResponse = await this.callRdfApi(getRequest);

            if (!(getApiResponse && getApiResponse.response && getApiResponse.response[collectionName] && getApiResponse.response[collectionName].length > 0)) {
                response = {
                    "status": "error",
                    "msg": getRequest.url + " call returned without any data. Check the healthcheck config.",
                    "detail": {
                        "request": getRequest.body,
                        "response": getApiResponse
                    }
                };

                return response;
            }

            let defaultValContext = await this.tenantSystemConfigService.getDefaultValContext();

            let dataObject = updateRequest.body[objectName];
            this.setAttrVal(dataObject.data.attributes, attrName, newVal, defaultValContext);

            updateRequest.url = dfUrl;

            let updateStartTick = process.hrtime();

            let updateApiResponse = await this.callRdfApi(updateRequest);

            let updateEndTick = process.hrtime(updateStartTick);
            let updateTime = updateEndTick[1] / 1000000;

            if (updateApiResponse && updateApiResponse.response) {
                let status = updateApiResponse.response.status;

                let verificationStartTick = process.hrtime();

                if (status == "success") {
                    let i = 0;
                    let totalDelay = 0;
                    do {
                        let val = await this.getDataObjectAttrVal(getRequest, collectionName, attrName);
                        //console.log('val ', val);
                        if (val == newVal) {
                            let verificationEndTick = process.hrtime(verificationStartTick);
                            let verificationTime = verificationEndTick[1] / 1000000;

                            response = {
                                "status": "success",
                                "msg": apiUrl + " call returned with success status",
                                "detail": {
                                    "request": updateRequest.body,
                                    "response": updateApiResponse,
                                    "stats": {
                                        "timeTaken": updateTime,
                                        "verificationTimeTaken": verificationTime,
                                        "noOfVerificationProbs": i + 1,
                                        "verificationProbTotalWait": totalDelay
                                    }
                                }
                            };
                            break;
                        }
                        let interval = verificationDelayIntervals[i];
                        totalDelay += interval;
                        sleep(interval);
                        i++;
                    } while (i < verificationDelayIntervals.length);

                    if (!response) {
                        let verificationEndTick = process.hrtime(verificationStartTick);
                        let verificationTime = verificationEndTick[1] / 1000000;

                        response = {
                            "status": "warning",
                            "msg": apiUrl + " call succeeded but unable to verify updated value",
                            "detail": {
                                "request": updateRequest.body,
                                "response": updateApiResponse,
                                "stats": {
                                    "timeTaken": updateTime,
                                    "verificationTimeTaken": verificationTime,
                                    "noOfVerificationProbs": i + 1,
                                    "verificationProbTotalWait": totalDelay
                                }
                            }
                        };
                    }
                } else {
                    let verificationEndTick = process.hrtime(verificationStartTick);
                    let verificationTime = verificationEndTick[1] / 1000000;

                    response = {
                        "status": "error",
                        "msg": apiUrl + " call failed.",
                        "detail": {
                            "request": updateRequest.body,
                            "response": updateApiResponse,
                            "stats": {
                                "timeTaken": updateTime,
                                "verificationTimeTaken": verificationTime,
                                "noOfVerificationProbs": -1,
                                "verificationProbTotalWait": -1
                            }
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
    executeCreateRequest: async function (dfUrl, apiUrl, apiConfig) {
        let response = undefined;
        let newEntityGuid = uuidV1();
        let apiConfigAsString = JSON.stringify(apiConfig);
        apiConfigAsString = apiConfigAsString.replace(/<GUID>/g, newEntityGuid);
        apiConfig = JSON.parse(apiConfigAsString);
        let getRequest = apiConfig.getRequest;
        let getApiUrl = apiConfig.getApiUrl;
        let deleteApiUrl = apiConfig.deleteApiUrl;
        let createRequest = apiConfig.createRequest;
        let deleteRequest = apiConfig.deleteRequest;
        let attributesToUpdate = apiConfig.attributesToUpdate;
        let attrName = attributesToUpdate[0];
        let verificationDelayIntervals = apiConfig.verificationDelayIntervals;
        let collectionName = apiConfig.objectInfo.collectionName;
        let objectName = apiConfig.objectInfo.objectName;

        if (!getRequest) {
            response = this.createFatalError(apiUrl);
        }
        else {
            let newVal = moment().format("YYYY-MM-DDTHH:mm:ss.SSS-0500"); // just set new value as current timestamp..
            //console.log('new val', newVal);
            let serverUrl = apiUrl;
            if(apiConfig.rdfInternal){
                serverUrl = apiUrl.replace('internal/','');
            }
            getRequest.url = dfUrl.replace(serverUrl, getApiUrl);
            deleteRequest.url = dfUrl.replace(serverUrl, deleteApiUrl);

            let defaultValContext = await this.tenantSystemConfigService.getDefaultValContext();

            let dataObject = createRequest.body[objectName];
            this.setAttrVal(dataObject.data.attributes, attrName, newVal, defaultValContext);

            createRequest.url = dfUrl;

            let createStartTick = process.hrtime();

            let createApiResponse = await this.callRdfApi(createRequest);

            let createEndTick = process.hrtime(createStartTick);
            let createTime = createEndTick[1] / 1000000;

            if (createApiResponse && createApiResponse.response) {
                let status = createApiResponse.response.status;

                let verificationStartTick = process.hrtime();

                if (status == "success") {
                    let i = 0;
                    let totalDelay = 0;
                    do {
                        let val = await this.getDataObjectAttrVal(getRequest, collectionName, attrName);
                        //console.log('val ', val);
                        if (val == newVal) {
                            let verificationEndTick = process.hrtime(verificationStartTick);
                            let verificationTime = verificationEndTick[1] / 1000000;

                            response = {
                                "status": "success",
                                "msg": apiUrl + " call returned with success status.",
                                "detail": {
                                    "request": createRequest.body,
                                    "response": createApiResponse,
                                    "stats": {
                                        "timeTaken": createTime,
                                        "verificationTimeTaken": verificationTime,
                                        "noOfVerificationProbs": i + 1,
                                        "verificationProbTotalWait": totalDelay
                                    }
                                }
                            };

                            let deleteApiResponse = await this.callRdfApi(deleteRequest);
                            response.detail.cleanupResponse = deleteApiResponse;

                            break;
                        }
                        let interval = verificationDelayIntervals[i];
                        totalDelay += interval;
                        sleep(interval);
                        i++;
                    } while (i < verificationDelayIntervals.length);

                    if (!response) {
                        let verificationEndTick = process.hrtime(verificationStartTick);
                        let verificationTime = verificationEndTick[1] / 1000000;

                        response = {
                            "status": "warning",
                            "msg": apiUrl + " call succeeded but unable to verify created object",
                            "detail": {
                                "request": createRequest.body,
                                "response": createApiResponse,
                                "stats": {
                                    "timeTaken": createTime,
                                    "verificationTimeTaken": verificationTime,
                                    "noOfVerificationProbs": i + 1,
                                    "verificationProbTotalWait": totalDelay
                                }
                            }
                        };

                        let deleteApiResponse = await this.callRdfApi(deleteRequest);
                        response.detail.cleanupResponse = deleteApiResponse;
                    }
                } else {
                    let verificationEndTick = process.hrtime(verificationStartTick);
                    let verificationTime = verificationEndTick[1] / 1000000;

                    response = {
                        "status": "error",
                        "msg": apiUrl + " call failed.",
                        "detail": {
                            "request": createRequest.body,
                            "response": createApiResponse,
                            "stats": {
                                "timeTaken": createTime,
                                "verificationTimeTaken": verificationTime,
                                "noOfVerificationProbs": -1,
                                "verificationProbTotalWait": -1
                            }
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
    getDataObjectAttrVal: async function (getRequest, collectionName, attrName) {
        let attrVal = undefined;

        let getApiResponse = await this.callRdfApi(getRequest);

        if (getApiResponse && getApiResponse.response && getApiResponse.response[collectionName] && getApiResponse.response[collectionName].length > 0) {
            let dataObject = getApiResponse.response[collectionName][0];

            if (dataObject && dataObject.data && dataObject.data.attributes && dataObject.data.attributes[attrName]) {
                let attr = dataObject.data.attributes[attrName];
                if (attr && attr.values && attr.values.length > 0) {
                    attrVal = attr.values[0].value;
                }
            }
        }

        return await attrVal;
    },
    callRdfApi: async function (options) {
        let res = {};

        //console.log('RDF api call ', JSON.stringify(options, null, 2));
        let reqPromise = this._restRequest(options)
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
        let request = require('./healthcheckconfig-get').request;

        request.body.params.query.id = apiConfigKey + "_apihealthcheckconfig";
        request.url = baseUrl + "configurationservice/get";

        let result = await this.callRdfApi(request);

        //console.log('health check configs ', JSON.stringify(result));
        return result;
    },
    getApiConfig: function (healthcheckConfigs, configKey) {
        let config = undefined;
        if (healthcheckConfigs && healthcheckConfigs.response && healthcheckConfigs.response.configObjects) {
            let configObjects = healthcheckConfigs.response.configObjects;
            if (configObjects.length > 0) {
                for (let configObject of configObjects) {
                    if (configObject.name == configKey) {
                        if (configObject.data && configObject.data.contexts && configObject.data.contexts.length > 0
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
        let errResponse = {
            "status": "error",
            "msg": "Failed to execute healthcheck path for the " + serviceName + " service and verify result. Check configuration and contact administrator",
            "detail": {
                "request": {},
                "response": {},
                "stats": {
                    "timeTaken": -1,
                    "verificationTimeTaken": -1,
                    "noOfVerificationProbs": -1,
                    "verificationProbTotalWait": -1
                }
            }
        }

        return errResponse;
    },
    setAttrVal: function (attributes, attrName, val, defaultValContext) {

        let attr = this.getOrCreate(attributes, attrName, {});
        let values = [{
            "source": defaultValContext.source,
            "locale": defaultValContext.locale,
            "value": val
        }];

        attr.values = values;
    },
    getOrCreate: function (obj, key, defaultVal) {
        let keyObj = obj[key];

        if (keyObj === undefined) {
            keyObj = defaultVal;
            obj[key] = keyObj;
        }

        return keyObj;
    }
};

module.exports = ApiHealthCheckService;
