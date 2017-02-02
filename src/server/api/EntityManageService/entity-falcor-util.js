'use strict';

var jsonGraph = require('falcor-json-graph'),
    $ref = jsonGraph.ref,
    $error = jsonGraph.error,
    $atom = jsonGraph.atom,
    expireTime = -60 * 60 * 1000; // 60 mins

var arrayContains = require('../Utils/array-contains');

function createPath(pathSet, value, expires) {
   
    return {
        'path': pathSet,
        'value': value
    };
}

function isEmpty(obj) {
   for (var x in obj) { return false; }
   return true;
}

function mergePathSets(pathSet1, pathSet2){
    return pathSet1.concat(pathSet2);
}

function mergeAndCreatePath(basePath, pathSet, value, expires) {
    var mergedPathSet = mergePathSets(basePath, pathSet);
    return createPath(mergedPathSet, value, expires);
}

function createRequestJson(ctxKeys, attrNames, relTypes, relAttrNames, relIds) {
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

        //TODO:: Right now RDP is not working with below 2 parameters passed..need to fix this soon..
        //valCtxGroupObj.timeslice = "current";
        //valCtxGroupObj.governed = "true";

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

    //TODO:: This is hard coded as of now as for get API entity request json creation..
    var filters = {
        attributesCriterion: [],
        relationshipsCriterion: [],
        typesCriterion: []
    };

    var query = {
        ctx: ctxGroups,
        valCtx: valCtxGroups,
        id: "",
        filters: filters
    };

    var params = {
        query: query,
        fields: fields,
        options: options
    };

    var request = { 
        params: params 
    };

    return request;
}

function transformEntityToExternal(entity) {
    var transformedEntity = {};

    transformedEntity.id = entity.id;
    transformedEntity.entityInfo = entity.entityInfo;
    transformedEntity.systemInfo = entity.systemInfo;
    transformedEntity.properties = entity.properties;
    
    //TODO: AS OF NOW, API is not processing properties so blank it out :)
    transformedEntity.properties = {};

    var ctxInfo = [];

    if (entity.data && entity.data.ctxInfo) {
        var ctxKeys = Object.keys(entity.data.ctxInfo);

        for (var ctxKey in entity.data.ctxInfo) {
            var enCtxInfo =  entity.data.ctxInfo[ctxKey];

            var attrNames = Object.keys(enCtxInfo.attributes);
            var request = createRequestJson([ctxKey], attrNames);

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
                    delete rel['relToObject'].data; // no need to send related entity data to server..
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
                    ctxInfoItem.relationships = relationships;    
                }

                ctxInfo.push(ctxInfoItem);
            }
        }

        transformedEntity.data = {ctxInfo: ctxInfo};
    }

    return transformedEntity;
}

function buildAttributesResponse(reqCtxGroup, reqValCtxGroup, reqAttrNames, enCtxGroup, enAttributes, basePath){
    //console.log('reqAttrNames ', reqAttrNames);
    var response = [];

    if(isEmpty(reqAttrNames) || isEmpty(enAttributes)){
        return response;
    }

    //console.log('buildAttributesResponse...basePath: ', basePath, 'reqValCtxGroup: ',JSON.stringify(reqValCtxGroup), ' enAttributes: ', JSON.stringify(enAttributes));

    // if request is for all attrs then return every thing came back from api..
    if(reqAttrNames.length == 1 && reqAttrNames[0] == "ALL"){
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
                        var valIndexToReplace = valCtxSpecifiedValues.findIndex(findValue, val); 
                        
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
                    response.push(mergeAndCreatePath(basePath, [reqAttrName, "values"], $atom(valCtxSpecifiedValues)));
                }
            }
            else if(attr.groups) {
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

            response.push(mergeAndCreatePath(basePath, [reqAttrName, "values"], $atom([val])));
        }
    }
    //console.log('attr response: ', JSON.stringify(response));
    return response;
}

function findValue(element, index, array) {
    return element.source === this.source && element.locale === this.locale;
}

function buildEntityFieldsResponse(entity, entityFields, pathRootKey) {
    var response = [];

    //console.log('buildEntityFieldsResponse ', entityFields);

    entityFields.forEach(function (entityField) {
        //console.log('entityFields.forEach ', entityField);
        if (entityField == "id") {
            var entityFieldValue = entity[entityField] !== undefined ? entity[entityField] : {};
            response.push(createPath([pathRootKey, entity.id, entityField], entityFieldValue));
        } else if (entityField !== "data") {
            var entityFieldValue = entity[entityField] !== undefined ? entity[entityField] : {};
            response.push(createPath([pathRootKey, entity.id, entityField], $atom(entityFieldValue)));
        }
    });

    return response;
}

function buildEntityAttributesResponse(entity, request, pathRootKey) {
    var response = [];
    var entityId = entity.id;

    var reqCtx = request.params.query.ctx;
    var reqValCtx = request.params.query.valCtx;
    var reqAttrNames = request.params.fields.attributes;

    for(let reqCtxGroup of reqCtx) {
        for (var x in entity.data.ctxInfo) {
            var enCtxInfo = entity.data.ctxInfo[x];

            if (!enCtxInfo.ctxGroup) {
                enCtxInfo.ctxGroup = reqCtxGroup; //TODO: For now, save call is not sending ctxGroup object so has beed assign with request object's ctxGroup..
            }

            if (enCtxInfo.ctxGroup.list === reqCtxGroup.list && compareClassification(enCtxInfo.ctxGroup.classification, reqCtxGroup.classification)) {
                
                for(let reqValCtxGroup of reqValCtx){
                    var contextKey = createContextKey(enCtxInfo.ctxGroup, reqValCtxGroup);
                    var ctxBasePath = [pathRootKey, entity.id, 'data', 'ctxInfo', contextKey, 'attributes'];
                    var attrs = enCtxInfo.attributes;
                    
                    response.push.apply(response, buildAttributesResponse(reqCtxGroup, reqValCtxGroup, reqAttrNames, enCtxInfo, attrs, ctxBasePath));
                }
            }
        }
    }

    //console.log('attr response', JSON.stringify(response));
    return response;
}

function buildEntityRelationshipDetailsResponse(reqCtxGroup, reqValCtxGroup, reqAttrNames, enCtxInfo, enRel, basePath){
    var response = [];

    var relBasePath = mergePathSets(basePath, ["rels", enRel.id]);
    
    for(let relFieldKey of Object.keys(enRel)){
        
        if(relFieldKey == "attributes"){
            var relAttributesBasePath = mergePathSets(relBasePath, ["attributes"]);
           response.push.apply(response, buildAttributesResponse(reqCtxGroup, reqValCtxGroup, reqAttrNames, enCtxInfo, enRel[relFieldKey], relAttributesBasePath));
        }
        else if(relFieldKey == "relToObject"){
            response.push(mergeAndCreatePath(relBasePath, relFieldKey, $ref(["entitiesById", enRel[relFieldKey].id])));
        }
        else {
            response.push(mergeAndCreatePath(relBasePath, relFieldKey, $atom(enRel[relFieldKey])));    
        }
    }

    return response;
}

function buildEntityRelationshipsResponse(entity, request, pathRootKey, caller) {
    var response = [];
    var entityId = entity.id;

    var reqRelTypes = request.params.fields.relationships;
    var reqCtx = request.params.query.ctx;
    var reqValCtx = request.params.query.valCtx;
    var reqRelAttrNames = request.params.fields.relationshipAttributes;
    var reqRelIds = request.params.fields.relIds === undefined ? [] : request.params.fields.relIds;

    if(reqRelTypes === undefined){
        return response;
    }

    var basePath = [];

    for(let reqCtxGroup of reqCtx) {
        for (let x in entity.data.ctxInfo) {
            var enCtxInfo = entity.data.ctxInfo[x];

            if (!enCtxInfo.ctxGroup) {
                enCtxInfo.ctxGroup = reqCtxGroup; //TODO: For now, save call is not sending ctxGroup object so has beed assign with request object's ctxGroup..
            }

            if (enCtxInfo.ctxGroup.list === reqCtxGroup.list && compareClassification(enCtxInfo.ctxGroup.classification, reqCtxGroup.classification)) {
                if(isEmpty(enCtxInfo.relationships)){
                    continue;
                }

                for(let reqValCtxGroup of reqValCtx){
                    var contextKey = createContextKey(enCtxInfo.ctxGroup, reqValCtxGroup);
                    var ctxBasePath = [pathRootKey, entity.id, 'data', 'ctxInfo', contextKey, 'relationships'];
                    var relTypes = [];

                    // if request is for all rel types then return every thing came back from api..
                    if(reqRelTypes.length === 1 && reqRelTypes[0] == "ALL"){
                        relTypes = Object.keys(enCtxInfo.relationships);
                    }
                    else
                    {
                        relTypes = reqRelTypes;
                    }

                    for(let relType of relTypes){
                        var rels = [];
                        
                        if(caller === "createEntities" || caller === "updateEntities") {
                            rels = enCtxInfo.relationships[relType].rels;
                        }
                        else {
                            rels = enCtxInfo.relationships[relType];
                        }

                        var relBasePath = mergePathSets(ctxBasePath, [relType]);

                        if(!isEmpty(rels)) {
                            var relIds = [];

                            for(var i in rels){
                                var rel = rels[i];

                                rel.id = createRelUniqueId(rel);

                                if(reqRelIds.length > 0 && !arrayContains(reqRelIds, rel.id)) {
                                    continue;
                                }

                                relIds.push(rel.id);

                                if(caller !== "getRelIdOnly") {
                                    response.push.apply(response, buildEntityRelationshipDetailsResponse(reqCtxGroup, reqValCtxGroup, reqRelAttrNames, enCtxInfo, rel, relBasePath));
                                }
                            }

                            if(caller === "getRelIdOnly") {
                                response.push(mergeAndCreatePath(relBasePath, ["relIds"], $atom(relIds), 0));
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

function createContextKey(entityContext, valueContext) {
    var classification = entityContext.classification ? entityContext.classification : '';
    var contextKey = "".concat(entityContext.list, '#@#', classification, '#@#', valueContext.source, '#@#', valueContext.locale);
    return contextKey;
}

function compareClassification(c1, c2) {
    //console.log('c1: ', c1, 'c2: ', c2);

    if(!c1) {
        c1 = '';
    }
    if(!c2) {
        c2 = '';
    }
    if(c1 == c2) {
        return true;
    }
    return false;
}

function createRelUniqueId(rel) {
    if(rel) {
        var relEntityId = rel.relToObject.id !== undefined && rel.relToObject.id !== "" ? rel.relToObject.id : "-1";
        var source = rel.source !== undefined && rel.source !== "" ? rel.source : "ANY";
        return relEntityId.concat("#@#", source);
    }

    return "";
}

module.exports = {
    createPath: createPath,
    createRequestJson: createRequestJson,
    transformEntityToExternal: transformEntityToExternal,
    buildEntityFieldsResponse: buildEntityFieldsResponse,
    buildEntityAttributesResponse: buildEntityAttributesResponse,
    buildEntityRelationshipsResponse : buildEntityRelationshipsResponse
};