'use strict';

var jsonGraph = require('falcor-json-graph'),
    $ref = jsonGraph.ref,
    $error = jsonGraph.error,
    $atom = jsonGraph.atom,
    expireTime = -60 * 60 * 1000; // 60 mins

function createPath(pathSet, value) {
    return { path: pathSet, 'value': value, $expires: expireTime };
}

function unboxEntityData(entity) {
    var unboxedEntity = {};

    unboxedEntity.id = entity.id;
    unboxedEntity.dataObjectInfo = unboxJsonObject(entity.dataObjectInfo);
    unboxedEntity.systemInfo = unboxJsonObject(entity.systemInfo);
    unboxedEntity.properties = unboxJsonObject(entity.properties);

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

function unboxJsonObject(obj) {
    if (obj && obj.$type) {
        return obj.value;
    }
    else {
        return obj;
    }
}

function buildEntityFieldsResponse(entity, entityFields, pathRootKey) {
    var response = [];

    entityFields.forEach(function (entityField) {
        if (entityField == "id") {
            var entityFieldValue = entity[entityField] !== undefined ? entity[entityField] : {};
            response.push(createPath([pathRootKey, entity.id, entityField], entityFieldValue));
        }
        else if (entityField !== "data") {
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
                                if (val.source == reqValCtxGroup.source && val.locale == reqValCtxGroup.locale) {
                                    valCtxSpecifiedValues.push(val);
                                    valFound = true;
                                }
                            };

                            if (valCtxSpecifiedValues.length > 0) {
                                var contextKey = "".concat(enCtxInfo.ctxGroup.list, '#@#', enCtxInfo.ctxGroup.classification, '#@#', reqValCtxGroup.source, '#@#', reqValCtxGroup.locale);
                                response.push(createPath([pathRootKey, entityId, 'data', 'ctxInfo', contextKey, 'attributes', attrName, "values"], $atom(valCtxSpecifiedValues)));
                            }
                        }
                        else {
                            valFound = false;
                        }

                        if (!valFound) {
                            var val = { source: reqValCtxGroup.source, locale: reqValCtxGroup.locale, value: '' };
                            var contextKey2 = "".concat(enCtxInfo.ctxGroup.list, '#@#', enCtxInfo.ctxGroup.classification, '#@#', val.source, '#@#', val.locale);
                            response.push(createPath([pathRootKey, entityId, 'data', 'ctxInfo', contextKey2, 'attributes', attrName, "values"], $atom([val])));
                        }
                    });
                });

                return false;
            }
        };
    });

    return response;
}

module.exports = {
    createPath: createPath,
    unboxEntityData: unboxEntityData,
    unboxJsonObject: unboxJsonObject,
    buildEntityFieldsResponse: buildEntityFieldsResponse,
    buildEntityAttributesResponse: buildEntityAttributesResponse
};

