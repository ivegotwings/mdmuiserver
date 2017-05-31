'use strict';

var falcorUtil = require('./dataobject-falcor-util');

var DataObjectMergeUtil = function () { };

DataObjectMergeUtil.mergeDataObjects = function (target, source) {

    var targetData = target.data;

    if (!targetData) {
        return target;
    }

    var targetContexts = target.data.contexts;

    var sourceData = source.data;

    if (!sourceData) {
        return target;
    }

    var sourceContexts = sourceData.contexts;

    var targetSelfCtxItem = { 'attributes': targetData.attributes, 'relationships': targetData.relationships, 'properties': targetData.properties };
    var sourceSelfCtxItem = { 'attributes': sourceData.attributes, 'relationships': sourceData.relationships, 'properties': sourceData.properties };

    targetSelfCtxItem = DataObjectMergeUtil.mergeCtxItems(targetSelfCtxItem, sourceSelfCtxItem, false);

    if(targetContexts) {
        for (var i = 0; i < targetContexts.length; i++) {
            var targetCtxItem = targetContexts[i];
            var targetContext = targetCtxItem.context;

            var sourceCtxItem = falcorUtil.getCtxItem(sourceContexts, targetContext);

            if (sourceCtxItem) {
                targetCtxItem = DataObjectMergeUtil.mergeCtxItems(targetCtxItem, sourceCtxItem, false);
            }
        }
    }

    return target;
};

DataObjectMergeUtil.mergeRelationships = function (target, source, addMissing = false) {
    if (!target) {
        if (addMissing) {
            target = {};
        }
        else {
            return target;
        }
    }

    if (!source) {
        return target;
    }

    for (var targetObjKey in target) {
        var targetObj = target[targetObjKey];
        var sourceObj = source[targetObjKey];

        if (sourceObj) {
            targetObj = falcorUtil.mergeArraysNoOverride(targetObj, sourceObj, "id", true);
        }
    }

    if (addMissing) {
        for (var sourceObjKey in source) {
            var sourceObj = source[sourceObjKey];
            var targetObj = target[sourceObjKey];

            if (!targetObj) {
                target[sourceObjKey] = sourceObj;
            }
        }
    }

    return target;
};

DataObjectMergeUtil.mergeCtxItems = function (target, source, addMissing = false) {

    target.attributes = DataObjectMergeUtil.mergeAttributes(target.attributes, source.attributes, addMissing);
    target.relationships = DataObjectMergeUtil.mergeRelationships(target.relationships, source.relationships, addMissing);
    target.properties = falcorUtil.mergeObjectsNoOverride(target.properties, source.properties, true);

    return target;
}

DataObjectMergeUtil.mergeAttributes = function (target, source, addMissing = false) {
    target = falcorUtil.mergeObjectsNoOverride(target, source, addMissing);
    return target;
}

module.exports = DataObjectMergeUtil;
