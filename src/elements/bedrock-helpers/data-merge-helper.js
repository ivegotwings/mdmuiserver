import '../liquid-dataobject-utils/liquid-dataobject-utils.js';
import './data-helper.js';
import './context-helper.js';
window.DataMergeHelper = window.DataMergeHelper || {};

DataMergeHelper.mergeDataObjects = function (target, source, addMissing = false) {

    const utils = SharedUtils.DataObjectFalcorUtil;

    let targetData = target.data;

    if (!targetData) {
        return target;
    }

    let targetContexts = target.data.contexts;

    let sourceData = source.data;

    if (!sourceData) {
        return target;
    }

    let sourceContexts = sourceData.contexts;

    let targetSelfCtxItem = { 'attributes': targetData.attributes, 'relationships': targetData.relationships, 'properties': targetData.properties };
    let sourceSelfCtxItem = { 'attributes': sourceData.attributes, 'relationships': sourceData.relationships, 'properties': sourceData.properties };

    let mergedSelfCtxItem = this.mergeCtxItems(targetSelfCtxItem, sourceSelfCtxItem, addMissing);
    targetData.attributes = mergedSelfCtxItem.attributes;
    targetData.relationships = mergedSelfCtxItem.relationships;
    targetData.properties = mergedSelfCtxItem.properties;

    if (!_.isEmpty(targetContexts)) {
        for (let i = 0; i < targetContexts.length; i++) {
            let targetCtxItem = targetContexts[i];
            let targetContext = targetCtxItem.context;

            let sourceCtxItem = utils.getCtxItem(sourceContexts, targetContext);

            if (sourceCtxItem) {
                targetCtxItem = this.mergeCtxItems(targetCtxItem, sourceCtxItem, addMissing);
            }
        }
    }

    return target;
};

DataMergeHelper.mergeRelationships = function (target, source, addMissing = false) {
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
            targetObj = SharedUtils.DataObjectFalcorUtil.mergeArraysNoOverride(targetObj, sourceObj, "id", true);
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

DataMergeHelper.mergeCtxItems = function (target, source, addMissing = false) {

    let utils = SharedUtils.DataObjectFalcorUtil;
    let deepAssign = utils.deepAssign;

    target.attributes = this.mergeAttributes(target.attributes, source.attributes, addMissing);
    target.relationships = this.mergeRelationships(target.relationships, source.relationships, addMissing);
    target.properties = utils.mergeObjectsNoOverride(target.properties, source.properties, true);

    return target;
}

DataMergeHelper.mergeAttributes = function (target, source, addMissing = false) {
    let utils = SharedUtils.DataObjectFalcorUtil;
    target = utils.mergeObjectsNoOverride(target, source, addMissing);
    return target;
}

DataMergeHelper.mergeWorkflowMappings = function (model, contextData) {
    let firstDataContext = ContextHelper.getFirstDataContext(contextData);

    let mergedWorkflows = {};
    if (model && model.data && model.data.relationships) {
        mergedWorkflows = DataMergeHelper.mergeRelationships(mergedWorkflows, model.data.relationships, true);
    }
    if (firstDataContext) {
        let ctxRelationships = SharedUtils.DataObjectFalcorUtil.getRelationshipsByCtx(model, firstDataContext);
        if (!_.isEmpty(ctxRelationships)) {
            mergedWorkflows = DataMergeHelper.mergeRelationships(mergedWorkflows, ctxRelationships, true);
        }
    }
    return mergedWorkflows;
};
