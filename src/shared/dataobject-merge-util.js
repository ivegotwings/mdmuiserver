'use strict';

let falcorUtil = require('./dataobject-falcor-util');

let DataObjectMergeUtil = function () { };

DataObjectMergeUtil.mergeDataObjects = function (target, source) {

    let targetData = target.data;

    if (!targetData) {
        return target;
    }

    let targetContexts = target.data.contexts;

    let sourceData = source.data;

    if (!sourceData) {
        return target;
    }

    let targetProperties = { 'properties': target.properties };
    let sourceProperties = { 'properties': source.properties };

    let sourceContexts = sourceData.contexts;

    let targetSelfCtxItem = { 'attributes': targetData.attributes, 'relationships': targetData.relationships, 'properties': targetProperties };
    let sourceSelfCtxItem = { 'attributes': sourceData.attributes, 'relationships': sourceData.relationships, 'properties': sourceProperties };

    targetSelfCtxItem = DataObjectMergeUtil.mergeCtxItems(targetSelfCtxItem, sourceSelfCtxItem, false);

    if(targetContexts) {
        for (let i = 0; i < targetContexts.length; i++) {
            let targetCtxItem = targetContexts[i];
            let targetContext = targetCtxItem.context;

            let sourceCtxItem = falcorUtil.getCtxItem(sourceContexts, targetContext);

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

    for (let targetObjKey in target) {
        let targetObj = target[targetObjKey];
        let sourceObj = source[targetObjKey];

        if (sourceObj) {
            targetObj = falcorUtil.mergeArraysNoOverride(targetObj, sourceObj, "id", true);
        }
    }

    if (addMissing) {
        for (let sourceObjKey in source) {
            let sourceObj = source[sourceObjKey];
            let targetObj = target[sourceObjKey];

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
