'use strict';

const OfflineServiceBase = require('../service-base/OfflineServiceBase'),
        isEmpty = require('../utils/isEmpty'),
        fs = require('fs'),
        config = require('./df-rest-service-config.json'),
        requireDir = require('require-dir'),
        executionContext = require('../context-manager/execution-context');

var OfflineRestService = function (options) {
    OfflineServiceBase.call(this, options);
};

OfflineRestService.prototype = {
    post: async function(url, request) {
        //console.log('url', url, 'request ', JSON.stringify(request));

        var serviceConfig = config.services[url];
        var offlineSettings = serviceConfig["offlineSettings"];

        if(!offlineSettings) {
            offlineSettings = {"operation": "process"};
        }
        
        if (offlineSettings.operation == "get") {
            return this._getOperation(request, offlineSettings);
        }
        else {
            return this._processOperation(request, offlineSettings);
        }
    },
    _getOperation: async function(request, offlineSettings) {
         var outputJson = {};

        var requestPathToSelectDataFile = offlineSettings["requestPathToSelectDataFile"];
        var requestPathToFilterData = offlineSettings["requestPathToFilterData"];
        var fieldToCompareInData = offlineSettings["fieldToCompareInData"];

        var filterVal = this._getPathValue(request, requestPathToFilterData);
        //console.log('filterVal', filterVal);

        if(requestPathToSelectDataFile) {
            
            var filePrefixes = this._getPathValue(request, requestPathToSelectDataFile);
            var files = [];

            var tenantId = 't1';

            var securityContext = executionContext.getSecurityContext();

            if(securityContext) {
                tenantId = securityContext.tenantId;
            }

            //console.log('tenant id', tenantId);

            var basePath = process.cwd() + '/offline-data/' + tenantId + '/';

            //console.log('file prefixes: ', JSON.stringify(filePrefixes));

            if(isEmpty(filePrefixes)) {
                files = requireDir(basePath);
            }
            else {
                for(let filePrefix of filePrefixes) {
                    var fileName = basePath + filePrefix + '.json';
                    var fileKey = filePrefix + ".json";
                    files[fileKey] = require(fileName);
                }
            }

            //console.log('file names: ', JSON.stringify(Object.keys(files)));

            for(let fileId in files) {
                var fileContent = files[fileId];

                if(!isEmpty(fileContent)) {

                    var metaInfo = fileContent["metaInfo"];

                    if(metaInfo === undefined) {
                        continue;
                    }

                    var responseObjName = metaInfo.responseObjectName;
                    var outputCollectionName = metaInfo.collectionName;
                    
                    var collectionData = fileContent[outputCollectionName];
                    
                    if(outputJson[responseObjName] === undefined) { 
                        outputJson[responseObjName] = {};
                    }

                    if(outputJson[responseObjName]["status"] === undefined) { 
                        outputJson[responseObjName]["status"] = "success";
                    }

                    if(outputJson[responseObjName][outputCollectionName] === undefined) { 
                        outputJson[responseObjName][outputCollectionName] = [];
                    }

                    if(!isEmpty(filterVal)) {
                        var filteredObj = this._findObject(collectionData, fieldToCompareInData, filterVal);
                        if(filteredObj != null) {
                            outputJson[responseObjName][outputCollectionName].push(filteredObj);
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
    _processOperation: async function(request, offlineSettings) {
        return await {};
    },
    _getPathValue: function(jsonObj, pathKey) {
        return pathKey.split('.').reduce(function (o, k) {
            return (o || {})[k];
        }, jsonObj);
    },
    _findObject: function (jsonObj, field, value) {
        for (var idx in jsonObj) {
            var obj = jsonObj[idx];
            if (obj && obj[field] === value) {
                return obj;
            }
        }

        return null;
    }
};

module.exports = OfflineRestService;