'use strict';

const arrayContains = require('../common/utils/array-contains'),
        isEmpty = require('../common/utils/isEmpty'),
        isObject = require('../common/utils/isObject');

const pathUtils = require('./dataobject-falcor-path-utils');

const sharedDataObjectFalcorUtil = require('../../../shared/dataobject-falcor-util');

const jsonGraph = require('falcor-json-graph'), 
        $ref = jsonGraph.ref,
        $error = jsonGraph.error,
        $atom = jsonGraph.atom;

const createPath = pathUtils.createPath,
        mergeAndCreatePath = pathUtils.mergeAndCreatePath,
        mergePathSets = pathUtils.mergePathSets;


const pathKeys = sharedDataObjectFalcorUtil.getPathKeys();

function _createContextKey(dataObjectContext, valueContext) {
    var classification = dataObjectContext.classification ? dataObjectContext.classification : 'NA';
    var contextKey = "".concat(dataObjectContext.list, '#@#', classification, '#@#', valueContext.source, '#@#', valueContext.locale);
    return contextKey;
}

function _compareClassification(c1, c2) {
    //console.log('c1: ', c1, 'c2: ', c2);

    if(!c1) {
        c1 = 'NA';
    }
    if(!c2) {
        c2 = 'NA';
    }
    if(c1 == c2) {
        return true;
    }
    return false;
}

function _createRelUniqueId(rel) {
    if(rel) {
        var relDataObjectId = rel.relToObject && rel.relToObject.id && rel.relToObject.id !== "" ? rel.relToObject.id : "-1";
        var source = rel.source !== undefined && rel.source !== "" ? rel.source : "ANY";
        return relDataObjectId.concat("#@#", source);
    }

    return "";
}

function _findValueBySourceAndLocale(element, index, array) {
    return element.source === this.source && element.locale === this.locale;
}

function _buildAttributesDetailResponse(reqCtxGroup, reqValCtxGroup, reqAttrNames, enCtxGroup, enAttributes, basePath) {
    //console.log('reqAttrNames ', reqAttrNames);
    var response = [];

    if(isEmpty(reqAttrNames) || isEmpty(enAttributes)){
        return response;
    }

    //console.log('buildAttributesResponse...basePath: ', basePath, 'reqValCtxGroup: ',JSON.stringify(reqValCtxGroup), ' enAttributes: ', JSON.stringify(enAttributes));

    // if request is for all attrs then return every thing came back from api..
    if(reqAttrNames.length == 1 && reqAttrNames[0] == "_ALL"){
        reqAttrNames = Object.keys(enAttributes);
    }

    for(let reqAttrName of reqAttrNames) {
        var attr = enAttributes[reqAttrName];
      
        var valOrGroupFound = false;
        if (attr !== undefined) {
            var valCtxSpecifiedValues = [];
            
            if(attr.values) {
                for (let val of attr.values) {
                    //TODO: Fill in missing source and locale values...
                    if(val.source === undefined){
                        val.source = reqValCtxGroup.source;
                    }

                    if(val.locale === undefined){
                        val.locale = reqValCtxGroup.locale;
                    }

                    val.source = val.source.toLowerCase();
                    val.locale = val.locale.toLowerCase();

                    if (val.source === reqValCtxGroup.source && val.locale === reqValCtxGroup.locale) {

                        //TODO: Temporarily  we need to take only LAST value of the same source + locale as timeslice is not yet implemented in RDP>>>
                        var valIndexToReplace = valCtxSpecifiedValues.findIndex(_findValueBySourceAndLocale, val); 
                        
                        if(valIndexToReplace > -1) {
                            valCtxSpecifiedValues[valIndexToReplace] = val;
                        }
                        else {
                            valCtxSpecifiedValues.push(val);
                        }

                        valOrGroupFound = true;
                    }
                }

                if (valCtxSpecifiedValues.length > 0) {
                    //console.log('basePath reqAttrName', basePath.concat([reqAttrName]));
                    response.push(mergeAndCreatePath(basePath, [reqAttrName, "values"], $atom(valCtxSpecifiedValues)));
                }
            }
            else if(attr.groups) {
                //console.log('basePath reqAttrName', basePath.concat([reqAttrName]));
                 response.push(mergeAndCreatePath(basePath, [reqAttrName, "groups"], $atom(attr.groups)));
                 valOrGroupFound = true;
            }
        } else {
            valOrGroupFound = false;
        }

        if (!valOrGroupFound) {
            var val = {
                source: reqValCtxGroup.source,
                locale: reqValCtxGroup.locale,
                value: ''
            };
            //console.log('basePath reqAttrName', basePath.concat([reqAttrName]));
            response.push(mergeAndCreatePath(basePath, [reqAttrName, "values"], $atom([val])));
        }
    }
    //console.log('attr response: ', JSON.stringify(response));
    return response;
}

function _buildRelationshipDetailsResponse(objType, reqCtxGroup, reqValCtxGroup, reqAttrNames, enCtxInfo, enRel, basePath) {
    var response = [];

    var relBasePath = mergePathSets(basePath, ["rels", enRel.id]);
    var dataObjectsByIdPath = [pathKeys.root, objType, pathKeys.masterListById];

    for(let relFieldKey of Object.keys(enRel)){
        
        if(relFieldKey == "attributes"){
            var relAttributesBasePath = mergePathSets(relBasePath, ["attributes"]);
           response.push.apply(response, _buildAttributesDetailResponse(reqCtxGroup, reqValCtxGroup, reqAttrNames, enCtxInfo, enRel[relFieldKey], relAttributesBasePath));
        }
        else if(relFieldKey == "relToObject"){
            response.push(mergeAndCreatePath(relBasePath, relFieldKey, $ref(mergePathSets(dataObjectsByIdPath, [enRel[relFieldKey].id]))));
        }
        else {
            response.push(mergeAndCreatePath(relBasePath, relFieldKey, $atom(enRel[relFieldKey])));    
        }
    }

    return response;
}

function createRequestJson(objType, ctxKeys, attrNames, relTypes, relAttrNames, relIds) {
    var ctxGroups = [];
    var valCtxGroups = [];

    for (let ctxKey of ctxKeys) {
        var ctxKeySegments = ctxKey.split('#@#');
        var ctxGroupObj = {
            list: ctxKeySegments[0],
            classification: ctxKeySegments[1]
        };
        var valCtxGroupObj = {
            source: ctxKeySegments[2].toLowerCase(),
            locale: ctxKeySegments[3].toLowerCase()
        };

        if (!ctxGroups.find(c => c.list === ctxGroupObj.list &&
                c.classification === ctxGroupObj.classification)) {
            ctxGroups.push(ctxGroupObj);
        }

        if (!valCtxGroups.find(v => v.source === valCtxGroupObj.source &&
                v.locale === valCtxGroupObj.locale)) {
            valCtxGroups.push(valCtxGroupObj);
        }
    };

    var fields = {
        ctxTypes: ["properties"]
    };
    
    if(attrNames !== undefined && attrNames.length > 0) {
        fields.attributes = attrNames;
    }
    
    if(relTypes !== undefined && relTypes.length > 0) {
        fields.relationships = relTypes;
    }

    if(relIds !== undefined && relIds.length > 0) {
        fields.relIds = relIds;
    }

    if(relAttrNames !== undefined && relAttrNames.length > 0) {
        fields.relationshipAttributes = relAttrNames;
    }

    var options = {
        totalRecords: 1,
        includeRequest: false
    };

    // //TODO:: This is hard coded as of now as for get API dataObject request json creation..
    // var filters = {
    //     attributesCriterion: [],
    //     relationshipsCriterion: [],
    //     typesCriterion: []
    // };

    var query = {
        ctx: ctxGroups,
        valCtx: valCtxGroups,
        id: ""
    };

    var params = {
        query: query,
        fields: fields,
        options: options
    };

    var request = {
        objType: objType,
        params: params
    };

    return request;
}

function transformToExternal(objType, dataObject) {
    var transformedDataObject = {};

    var objTypeInfoKey = pathKeys.objectTypesInfo[objType].typeInfo;

    transformedDataObject.id = dataObject.id;
    transformedDataObject[objTypeInfoKey] = dataObject[objTypeInfoKey];
    transformedDataObject.systemInfo = dataObject.systemInfo;
    transformedDataObject.properties = dataObject.properties;
    
    //TODO: AS OF NOW, API is not processing properties so blank it out :)
    transformedDataObject.properties = {};

    var ctxInfo = [];

    if (dataObject.data && dataObject.data.ctxInfo) {
        var ctxKeys = Object.keys(dataObject.data.ctxInfo);

        for (var ctxKey in dataObject.data.ctxInfo) {
            var enCtxInfo =  dataObject.data.ctxInfo[ctxKey];

            var attrNames = Object.keys(enCtxInfo.attributes);
            var request = createRequestJson(objType, [ctxKey], attrNames);

            //Transform ctxInfo to external format understood by API
            var ctxInfoItem = {};
            var reqCtxGroupItem = request.params.query.ctx[0]; //TODO:: this is wrong as api wont be able to process requests with multiple contexts...
            var attributes = enCtxInfo.attributes;
            var transformedRelationships = {};

            var relationships = enCtxInfo.relationships !== undefined ? enCtxInfo.relationships : [];

            for(var relTypeIdx in relationships) {
                var relTypeObj = relationships[relTypeIdx];
                var relsArray = [];
                
                for(var relObjKey in relTypeObj.rels) {
                    var rel = relTypeObj.rels[relObjKey];
                    delete rel['relToObject'].data; // no need to send related dataObject data to server..
                    relsArray.push(rel);
                }

                transformedRelationships[relTypeIdx] = relsArray;   
            }

            if(reqCtxGroupItem !== undefined) {
                ctxInfoItem = {ctxGroup: reqCtxGroupItem};
                
                if(!isEmpty(attributes)) { 
                    ctxInfoItem.attributes = attributes;    
                }

                if(!isEmpty(relationships)) { 
                    ctxInfoItem.relationships = transformedRelationships;    
                }

                ctxInfo.push(ctxInfoItem);
            }
        }

        transformedDataObject.data = {ctxInfo: ctxInfo};
    }

    return transformedDataObject;
}

function buildFieldsResponse(dataObject, dataObjectFields, basePath) {
    var response = [];
    //console.log('buildDataObjectFieldsResponse ', dataObjectFields);

    dataObjectFields.forEach(function (dataObjectField) {
        if (dataObjectField !== "data") {
            var dataObjectFieldValue = dataObject[dataObjectField] !== undefined ? dataObject[dataObjectField] : {};
            response.push(mergeAndCreatePath(basePath, [dataObjectField], $atom(dataObjectFieldValue)));
        }
    });

    return response;
}

function buildAttributesResponse(dataObject, request, basePath) {
    var response = [];
    var dataObjectId = dataObject.id;

    var reqCtx = request.params.query.ctx;
    var reqValCtx = request.params.query.valCtx;
    var reqAttrNames = request.params.fields.attributes;
    //console.log('reqCtx: ', JSON.stringify(reqCtx, null, 2));

    for(let reqCtxGroup of reqCtx) {
        for (var x in dataObject.data.ctxInfo) {
            var enCtxInfo = dataObject.data.ctxInfo[x];

            if (!enCtxInfo.ctxGroup) {
                enCtxInfo.ctxGroup = reqCtxGroup; //TODO: For now, save call is not sending ctxGroup object so has beed assign with request object's ctxGroup..
            }

            //console.log('_compareClassification(enCtxInfo.ctxGroup.classification, reqCtxGroup.classification) ', _compareClassification(enCtxInfo.ctxGroup.classification, reqCtxGroup.classification));
            if (enCtxInfo.ctxGroup.list === reqCtxGroup.list && _compareClassification(enCtxInfo.ctxGroup.classification, reqCtxGroup.classification)) {
                
                for(let reqValCtxGroup of reqValCtx){
                    var contextKey = _createContextKey(enCtxInfo.ctxGroup, reqValCtxGroup);
                    var ctxBasePath = mergePathSets(basePath, ['data', 'ctxInfo', contextKey, 'attributes']);
                    var attrs = enCtxInfo.attributes;
                    
                    //console.log('calling attr detail');
                    response.push.apply(response, _buildAttributesDetailResponse(reqCtxGroup, reqValCtxGroup, reqAttrNames, enCtxInfo, attrs, ctxBasePath));
                }
            }
        }
    }

    //console.log('attr response', JSON.stringify(response));
    return response;
}

function buildRelationshipsResponse(dataObject, request, basePath, caller) {
    var response = [];
    var dataObjectId = dataObject.id;

    var reqRelTypes = request.params.fields.relationships;
    var reqCtx = request.params.query.ctx;
    var reqValCtx = request.params.query.valCtx;
    var reqRelAttrNames = request.params.fields.relationshipAttributes;
    var reqRelIds = request.params.fields.relIds === undefined ? [] : request.params.fields.relIds;
    var objType = request.objType;

    if(reqRelTypes === undefined){
        return response;
    }

    for(let reqCtxGroup of reqCtx) {
        for (let x in dataObject.data.ctxInfo) {
            var enCtxInfo = dataObject.data.ctxInfo[x];

            if (!enCtxInfo.ctxGroup) {
                enCtxInfo.ctxGroup = reqCtxGroup; //TODO: For now, save call is not sending ctxGroup object so has beed assign with request object's ctxGroup..
            }

            if (enCtxInfo.ctxGroup.list === reqCtxGroup.list && _compareClassification(enCtxInfo.ctxGroup.classification, reqCtxGroup.classification)) {
                if(isEmpty(enCtxInfo.relationships)){
                    continue;
                }

                for(let reqValCtxGroup of reqValCtx){
                    var contextKey = _createContextKey(enCtxInfo.ctxGroup, reqValCtxGroup);
                    var ctxBasePath = mergePathSets(basePath, ['data', 'ctxInfo', contextKey, 'relationships']);
                    var relTypes = [];

                    // if request is for all rel types then return every thing came back from api..
                    if(reqRelTypes.length === 1 && reqRelTypes[0] == "_ALL"){
                        relTypes = Object.keys(enCtxInfo.relationships);
                    }
                    else
                    {
                        relTypes = reqRelTypes;
                    }

                    for(let relType of relTypes){
                        var rels = [];
                        
                        if(caller === "create" || caller === "update") {
                            rels = enCtxInfo.relationships[relType].rels;
                        }
                        else {
                            rels = enCtxInfo.relationships[relType];
                        }

                        var relBasePath = mergePathSets(ctxBasePath, [relType]);

                        if(!isEmpty(rels)) {
                            var relIds = [];

                            for(var i in rels) {
                                var rel = rels[i];                                
                                rel.id = _createRelUniqueId(rel);

                                if(reqRelIds.length > 0 && !arrayContains(reqRelIds, rel.id)) {
                                    continue;
                                }

                                relIds.push(rel.id);

                                if(caller !== "getRelIdOnly") {
                                    response.push.apply(response, _buildRelationshipDetailsResponse(objType, reqCtxGroup, reqValCtxGroup, reqRelAttrNames, enCtxInfo, rel, relBasePath));
                                }
                            }

                            if(caller === "getRelIdOnly") {
                                response.push(mergeAndCreatePath(relBasePath, ["relIds"], $atom(relIds)));
                            }
                        }
                    }
                }
            }
        }
    }

    //console.log('rels response', JSON.stringify(response));
    return response;
}

function getDomainByRequest(request) {
    //TODO: Fix this logic
    if (request && request.params && request.params.query && request.params.query.id) {
        if (request.params.query.id.toLowerCase().indexOf('workflow_runtime') > -1 ) {
            return 'workflow_runtime';
        }
        else if (request.params.query.id.toLowerCase().indexOf('workflow') > -1 ) {
            return 'workflow';
        }
    }
    
    return 'entity';
}

function getDomainByPathset(pathSet) {
    //TODO: Fix this logic
    if (pathSet && pathSet.length > 1 && pathSet[1].length > 0 && pathSet[1][0]) {
        if (pathSet[1][0].toLowerCase().indexOf('workflow_runtime') > -1 ) {
            return 'workflow_runtime';
        }
        else if (pathSet[1][0].toLowerCase().indexOf('workflow') > -1 ) {
            return 'workflow';
        }
    }
    
    return 'entity';
}

module.exports = {
    createPath: createPath,
    createRequestJson: createRequestJson,
    transformToExternal: transformToExternal,
    buildFieldsResponse: buildFieldsResponse,
    buildAttributesResponse: buildAttributesResponse,
    buildRelationshipsResponse : buildRelationshipsResponse,
    getDomainByRequest: getDomainByRequest,
    getDomainByPathset: getDomainByPathset,
    mergeAndCreatePath: mergeAndCreatePath,
    mergePathSets: mergePathSets,
    pathKeys: pathKeys
};