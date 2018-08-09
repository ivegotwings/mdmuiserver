'use strict';

const OfflineServiceBase = require('../service-base/OfflineServiceBase'),
    isEmpty = require('../utils/isEmpty'),
    fs = require('fs'),
    requireDir = require('require-dir'),
    executionContext = require('../context-manager/execution-context');

let SERVICE_CONFIG = require('./df-rest-service-config.js').SERVICE_CONFIG;

let OfflineRestService = function (options) {
    OfflineServiceBase.call(this, options);
};

OfflineRestService.prototype = {
    post: async function (url, request) {
        //console.log('url', url, 'request ', JSON.stringify(request));

        let serviceConfig = SERVICE_CONFIG.services[url];
        let offlineSettings = serviceConfig["offlineSettings"];

        if (!offlineSettings) {
            offlineSettings = { "operation": "process" };
        }

        if (offlineSettings.operation == "get") {
            return this._getOperation(request, offlineSettings);
        }
        else {
            return this._processOperation(request, offlineSettings);
        }
    },
    _getOperation: async function (request, offlineSettings) {
        let outputJson = {};

        let requestPathToSelectDataFile = offlineSettings["requestPathToSelectDataFile"];
        let requestPathToFilterData = offlineSettings["requestPathToFilterData"];
        let fieldToCompareInData = offlineSettings["fieldToCompareInData"];

        let filterVal = this._getPathValue(request, requestPathToFilterData);
        //console.log('filterVal', filterVal);

        if (requestPathToSelectDataFile) {
            let filePrefixes = offlineSettings.ignoreFilePrefixes ? "" : this._getPathValue(request, requestPathToSelectDataFile);
            let files = [];

            let tenantId = 't1';

            let securityContext = executionContext.getSecurityContext();

            if (securityContext) {
                tenantId = securityContext.tenantId;
            }

            //console.log('tenant id', tenantId);

            let basePath = process.cwd() + '/offline-data/' + tenantId + '/';

            //console.log('file prefixes: ', JSON.stringify(filePrefixes));
            files = requireDir(basePath);
            let filteredFiles = {};

            if (isEmpty(filePrefixes)) {
                //work around to support offline configuration
                if (offlineSettings.ignoreFilePrefixes && filterVal) {
                    let newFilterVal = filterVal.split('_')[0];
                    for (let fileId in files) {
                        if (fileId.indexOf(newFilterVal) >= 0) {
                            filteredFiles[fileId] = files[fileId];
                        }
                    }
                } else {
                    filteredFiles = files;
                }
            }
            else {
                for (let fileId in files) {
                    for (let filePrefix of filePrefixes) {
                        if (fileId.indexOf(filePrefix) >= 0) {
                            filteredFiles[fileId] = files[fileId];
                        }
                    }
                }
            }

            //console.log('filtered file names: ', JSON.stringify(Object.keys(filteredFiles)));

            for (let fileId in filteredFiles) {

                let fileContent = files[fileId];

                if (!isEmpty(fileContent)) {

                    let metaInfo = fileContent["metaInfo"];

                    if (metaInfo === undefined) {
                        continue;
                    }

                    let responseObjName = metaInfo.responseObjectName;
                    let outputCollectionName = metaInfo.collectionName;

                    let collectionData = fileContent[outputCollectionName];

                    if (outputJson[responseObjName] === undefined) {
                        outputJson[responseObjName] = {};
                    }

                    if (outputJson[responseObjName]["status"] === undefined) {
                        outputJson[responseObjName]["status"] = "success";
                    }

                    if (outputJson[responseObjName][outputCollectionName] === undefined) {
                        outputJson[responseObjName][outputCollectionName] = [];
                    }

                    if (!isEmpty(filterVal)) {
                        let filteredObj = this._findObject(collectionData, fieldToCompareInData, filterVal);
                        if (filteredObj != null) {
                            outputJson[responseObjName][outputCollectionName].push(filteredObj);
                        }
                        else {
                            //console.log('item not found in offline-data for requested filterval:', filterVal);
                        }
                    }
                    else {
                        outputJson[responseObjName][outputCollectionName] = collectionData;
                    }
                }
            }
        }

        //console.log('res', JSON.stringify(outputJson));
        return await outputJson;
    },
    _processOperation: async function (request, offlineSettings) {
        return await {};
    },
    _getPathValue: function (jsonObj, pathKey) {
        return pathKey.split('.').reduce(function (o, k) {
            return (o || {})[k];
        }, jsonObj);
    },
    _findObject: function (jsonObj, field, value) {
        for (let idx in jsonObj) {
            let obj = jsonObj[idx];
            if (obj && obj[field] === value) {
                return obj;
            }
        }

        return null;
    }
};

module.exports = OfflineRestService;