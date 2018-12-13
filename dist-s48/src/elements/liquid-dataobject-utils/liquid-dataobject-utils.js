import '@polymer/polymer/polymer-legacy.js';
import '../bedrock-internalref-dataobject-falcor-util/bedrock-internalref-dataobject-falcor-util.js';
/***
 * Provides common utilities for data objects
 */
let LiquidDataObjectUtils = {};
//required for gulp script parsing
//files with window.RUFBehaviors in them are not delayed for loading
window.RUFBehaviors = window.RUFBehaviors || {};

LiquidDataObjectUtils.invalidateDataObjectCache = function (dataObject, dataIndex) {
    let pathKeys = SharedUtils.DataObjectFalcorUtil.getPathKeys();

    if (dataObject && pathKeys) {
        dataIndex = dataIndex || "entityData";
        let governDataIndex = "entityGovernData";
        
        let dataObjectId = dataObject.id;
        let dataObjectType = dataObject.type;
        let dataFalcorModel = RUFBehaviors.DataChannel.getModel(dataIndex);
        
        if(dataFalcorModel) {
            dataFalcorModel.invalidate([pathKeys.root, dataIndex, dataObjectType, pathKeys.byIds, dataObjectId]);
        }

        if (dataIndex == "entityData") {
            let governDataFalcorModel = RUFBehaviors.DataChannel.getModel("entityGovernData");
            governDataFalcorModel && (governDataFalcorModel.invalidate([pathKeys.root, governDataIndex, dataObjectType, pathKeys.byIds, dataObjectId]));
        }
    }
};

LiquidDataObjectUtils.invalidateAllCache = function () {
    RUFBehaviors.DataChannel.clearAllCache();
};

export default LiquidDataObjectUtils;