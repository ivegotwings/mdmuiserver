'use strict';

var jsonGraph = require('falcor-json-graph'),
    $ref = jsonGraph.ref,
    $error = jsonGraph.error,
    $atom = jsonGraph.atom,
    expireTime = -60 * 60 * 1000; // 60 mins

function createPath(pathSet, value) {
    return {
        path: pathSet,
        'value': value,
        $expires: expireTime
    };
}

function createRequestJson(ctxKeys, attrNames) {
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
        ctxTypes: ["properties"],
        attributes: attrNames,
        relationships: ["ALL"]
    };
    var options = {
        totalRecords: 1,
        includeRequest: false
    };

    //TODO:: This is hard coded as of now as RDP is not working wtihout entity types....need to fix this ASAP
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

    unboxedEntity.id = entity.id;
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
    
    //Temporarily..
    transformedEntity.dataObjectInfo = entity.dataObjectInfo == {} ? {dataObjectDomain: "thing", dataObjectType: "nart"} : unboxJsonObject(entity.dataObjectInfo);
    transformedEntity.systemInfo = entity.systemInfo == {} ? {"tenantId": "t1"} : unboxJsonObject(entity.systemInfo);

    //TODO: AS OF NOW, API is not processing properties so blank it out :)
    transformedEntity.dataObjectInfo = {dataObjectDomain: "thing", dataObjectType: "nart"};
    transformedEntity.systemInfo = {"tenantId": "t1"};
    transformedEntity.properties = {};

    var ctxInfo = [];

    if (entity.data && entity.data.ctxInfo) {
        var ctxKeys = Object.keys(entity.data.ctxInfo);

        for (var ctxKey in entity.data.ctxInfo) {
            var attrNames = Object.keys(entity.data.ctxInfo[ctxKey].attributes);
            var request = createRequestJson([ctxKey], attrNames);

            //Transform ctxInfo to external format understood by API
            var ctxInfoItem = {};
            var ctxGroupItem = request.query.ctx[0];
            var attributes = entity.data.ctxInfo[ctxKey].attributes;
            if(ctxGroupItem !== undefined) {
                ctxInfoItem = {ctxGroup: ctxGroupItem, attributes: attributes};
                ctxInfo.push(ctxInfoItem);
            }
        }
    }

    transformedEntity.data = {ctxInfo: ctxInfo};

    return transformedEntity;
}

function unboxJsonObject(obj) {
    if (obj && obj.$type) {
        return obj.value;
    } else {
        return obj;
    }
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

    request.query.ctx.forEach(function (reqCtxGroup) {
        for (var x in entity.data.ctxInfo) {
            var enCtxInfo = entity.data.ctxInfo[x];

            if (!enCtxInfo.ctxGroup) {
                enCtxInfo.ctxGroup = reqCtxGroup; //TODO: For now, save call is not sending ctxGroup object so has beed assign with request object's ctxGroup..
            }

            if (enCtxInfo.ctxGroup.list === reqCtxGroup.list && enCtxInfo.ctxGroup.classification === reqCtxGroup.classification) {
                request.fields.attributes.forEach(function (attrName) {
                    var attr = enCtxInfo.attributes[attrName];

                    request.query.valCtx.forEach(function (reqValCtxGroup) {
                        var valFound = false;
                        if (attr !== undefined) {
                            var valCtxSpecifiedValues = [];
                            for (var valKey in attr.values) {
                                var val = attr.values[valKey];

                                //TODO: Fill in missing source and locale values...
                                if(val.source === undefined){
                                    val.source = reqValCtxGroup.source;
                                }

                                if(val.locale === undefined){
                                    val.locale = reqValCtxGroup.locale;
                                }

                                //TODO: Temporarily to make productName attribute value as entity.id
                                if(attrName == "cpimProductName"){
                                    val.value = entity.id;
                                }

                                if (val.source == reqValCtxGroup.source && val.locale == reqValCtxGroup.locale) {
                                    valCtxSpecifiedValues.push(val);
                                    valFound = true;
                                }
                            };

                            if (valCtxSpecifiedValues.length > 0) {
                                var contextKey = "".concat(enCtxInfo.ctxGroup.list, '#@#', enCtxInfo.ctxGroup.classification, '#@#', reqValCtxGroup.source, '#@#', reqValCtxGroup.locale);
                                response.push(createPath([pathRootKey, entityId, 'data', 'ctxInfo', contextKey, 'attributes', attrName, "values"], $atom(valCtxSpecifiedValues)));
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
                            var contextKey2 = "".concat(enCtxInfo.ctxGroup.list, '#@#', enCtxInfo.ctxGroup.classification, '#@#', val.source, '#@#', val.locale);
                            response.push(createPath([pathRootKey, entityId, 'data', 'ctxInfo', contextKey2, 'attributes', attrName, "values"], $atom([val])));
                        }
                    });
                });

                return false;
            }
        };
    });

    //console.log('attr response', JSON.stringify(response));
    return response;
}

module.exports = {
    createPath: createPath,
    createRequestJson: createRequestJson,
    unboxEntityData: unboxEntityData,
    unboxJsonObject: unboxJsonObject,
    transformEntityToExternal: transformEntityToExternal,
    buildEntityFieldsResponse: buildEntityFieldsResponse,
    buildEntityAttributesResponse: buildEntityAttributesResponse
};