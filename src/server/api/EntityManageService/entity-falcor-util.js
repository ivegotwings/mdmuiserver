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
        'value': value,
        '$expires': expires !== undefined ? expires : expireTime
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
            source: ctxKeySegments[2],
            locale: ctxKeySegments[3]
        };

        //TODO:: Right now RDP is not working with below 2 parameters passed..need to fix this soon..
        //valCtxGroupObj.timeslice = "current";
        //valCtxGroupObj.governed = "true";

        if (!ctxGroups.find(c => c.list === ctxGroupObj.list &&
                c.categorization === ctxGroupObj.categorization)) {
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
    
    if(attrNames !== undefined && attrNames.length > 0){
        fields.attributes = attrNames;
    }
    
    if(relTypes !== undefined && relTypes.length > 0){
        fields.relationships = relTypes;
    }

    if(relIds !== undefined && relIds.length > 0){
        fields.relIds = relIds;
    }

    if(relAttrNames !== undefined && relAttrNames.length > 0){
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

    var request = {
        query: query,
        fields: fields,
        options: options
    };

    return request;
}

function unboxEntityData(entity) {
    var unboxedEntity = {};

    unboxedEntity.id = unboxJsonObject(entity.id);;
    unboxedEntity.dataObjectInfo = entity.dataObjectInfo === undefined ? {} : unboxJsonObject(entity.dataObjectInfo);
    unboxedEntity.systemInfo = entity.systemInfo === undefined ? {} : unboxJsonObject(entity.systemInfo);
    unboxedEntity.properties = entity.properties === undefined ? {} : unboxJsonObject(entity.properties);

    if (entity.data && entity.data.ctxInfo) {
        for (var ctxKey in entity.data.ctxInfo) {
            var attrs = entity.data.ctxInfo[ctxKey].attributes;
            for (var attrId in attrs) {
                var attr = attrs[attrId];
                attr.values = unboxJsonObject(attr.values);
            }
        }
    }

    unboxedEntity.data = entity.data;

    return unboxedEntity;
}

function transformEntityToExternal(entity) {
    var transformedEntity = {};

    transformedEntity.id = entity.id;
    transformedEntity.dataObjectInfo = entity.dataObjectInfo;
    transformedEntity.systemInfo = entity.systemInfo;
    transformedEntity.properties = entity.properties;
    
    //TODO: AS OF NOW, API is not processing properties so blank it out :)
    transformedEntity.properties = {};

    var ctxInfo = [];

    if (entity.data && entity.data.ctxInfo) {
        var ctxKeys = Object.keys(entity.data.ctxInfo);

        for (var ctxKey in entity.data.ctxInfo) {
            var attrNames = Object.keys(entity.data.ctxInfo[ctxKey].attributes);
            var request = createRequestJson([ctxKey], attrNames);

            //Transform ctxInfo to external format understood by API
            var ctxInfoItem = {};
            var ctxGroupItem = request.query.ctx[0]; //TODO:: this is wrong as api wont be able to process requests with multiple contexts...
            var attributes = entity.data.ctxInfo[ctxKey].attributes;
            if(ctxGroupItem !== undefined) {
                ctxInfoItem = {ctxGroup: ctxGroupItem, attributes: attributes};
                ctxInfo.push(ctxInfoItem);
            }
        }

        transformedEntity.data = {ctxInfo: ctxInfo};
    }

    return transformedEntity;
}

function unboxJsonObject(obj) {
    if (obj && obj.$type) {
        return obj.value;
    } else {
        return obj;
    }
}

function buildAttributesResponse(reqCtxGroup, reqValCtxGroup, reqAttrNames, enCtxGroup, enAttributes, basePath){
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
      
        var valFound = false;
        if (attr !== undefined) {
            var valCtxSpecifiedValues = [];

            for (let val of attr.values) {
                //TODO: Fill in missing source and locale values...
                if(val.source === undefined){
                    val.source = reqValCtxGroup.source;
                }

                if(val.locale === undefined){
                    val.locale = reqValCtxGroup.locale;
                }

                //TODO: Temporarily to make productName attribute value as entity.id
                // if(reqAttrName == "cpimProductName"){
                //     val.value = entity.id;
                // }

                if (val.source == reqValCtxGroup.source && val.locale == reqValCtxGroup.locale) {
                    valCtxSpecifiedValues.push(val);
                    valFound = true;
                }
            }

            if (valCtxSpecifiedValues.length > 0) {
                response.push(mergeAndCreatePath(basePath, [reqAttrName, "values"], $atom(valCtxSpecifiedValues)));
            }
        } else {
            valFound = false;
        }

        if (!valFound) {
            var val = {
                source: reqValCtxGroup.source,
                locale: reqValCtxGroup.locale,
                value: ''
            };

            response.push(mergeAndCreatePath(basePath, [reqAttrName, "values"], $atom([val])));
        }
    }

    return response;
}

function buildEntityFieldsResponse(entity, entityFields, pathRootKey) {
    var response = [];

    entityFields.forEach(function (entityField) {
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

    var reqCtx = request.query.ctx;
    var reqValCtx = request.query.valCtx;
    var reqAttrNames = request.fields.attributes;

    for(let reqCtxGroup of reqCtx) {
        for (var x in entity.data.ctxInfo) {
            var enCtxInfo = entity.data.ctxInfo[x];

            if (!enCtxInfo.ctxGroup) {
                enCtxInfo.ctxGroup = reqCtxGroup; //TODO: For now, save call is not sending ctxGroup object so has beed assign with request object's ctxGroup..
            }

            if (enCtxInfo.ctxGroup.list === reqCtxGroup.list && enCtxInfo.ctxGroup.classification === reqCtxGroup.classification) {
                
                for(let reqValCtxGroup of reqValCtx){
                    var contextKey = "".concat(enCtxInfo.ctxGroup.list, '#@#', enCtxInfo.ctxGroup.classification, '#@#', reqValCtxGroup.source, '#@#', reqValCtxGroup.locale);
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

    var reqRelTypes = request.fields.relationships;
    var reqCtx = request.query.ctx;
    var reqValCtx = request.query.valCtx;
    var reqRelAttrNames = request.fields.relationshipAttributes;
    var reqRelIds = request.fields.relIds === undefined ? [] : request.fields.relIds;

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

            if (enCtxInfo.ctxGroup.list === reqCtxGroup.list && enCtxInfo.ctxGroup.classification === reqCtxGroup.classification) {
                if(isEmpty(enCtxInfo.relationships)){
                    continue;
                }

                for(let reqValCtxGroup of reqValCtx){
                    
                    var contextKey = "".concat(enCtxInfo.ctxGroup.list, '#@#', enCtxInfo.ctxGroup.classification, '#@#', reqValCtxGroup.source, '#@#', reqValCtxGroup.locale);
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
                        var rels = enCtxInfo.relationships[relType];
                        var relBasePath = mergePathSets(ctxBasePath, [relType]);
                        if(rels.length > 0){
                            var relIds = [];

                            for(var i in rels){
                                var rel = rels[i];
                                rel.id = createRelUniqueId(rel);

                                if(reqRelIds.length > 0 && !arrayContains(reqRelIds, rel.id))
                                {
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

function createRelUniqueId(rel){
    if(rel){
        var relEntityId = rel.relToObject.id !== undefined && rel.relToObject.id !== "" ? rel.relToObject.id : "-1";
        var source = rel.source !== undefined && rel.source !== "" ? rel.source : "ANY";
        return relEntityId.concat("#@#", source);
    }

    return "";
}

module.exports = {
    createPath: createPath,
    createRequestJson: createRequestJson,
    unboxEntityData: unboxEntityData,
    unboxJsonObject: unboxJsonObject,
    transformEntityToExternal: transformEntityToExternal,
    buildEntityFieldsResponse: buildEntityFieldsResponse,
    buildEntityAttributesResponse: buildEntityAttributesResponse,
    buildEntityRelationshipsResponse : buildEntityRelationshipsResponse
};