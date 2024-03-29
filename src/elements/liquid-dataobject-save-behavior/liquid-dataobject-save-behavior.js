import '@polymer/polymer/polymer-legacy.js';
import '../liquid-base-falcor-behavior/liquid-base-falcor-behavior.js';
import '../liquid-dataobject-utils/liquid-dataobject-utils.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-helpers/data-helper.js';
/*
 * <b><i>Content development is under progress... </b></i>
 * @polymerBehavior RUFBehaviors.LiquidDataObjectSaveBehavior
 * @demo demo/index.html
 */
window.RUFBehaviors = window.RUFBehaviors || {};

RUFBehaviors.LiquidDataObjectSaveBehaviorImpl = {
    /**
      * Content is not appearing - Content development is under progress.
      */

    attached: function () {
    },
    /**
      * Content is not appearing - Content development is under progress.
      */

    ready: function () {
    },
    properties: {
        /**
          * Content is not appearing - Content development is under progress.
          */

        dataIndex: {
            type: String,
            value: "Unknown"
        },

        objectsCollectionName: {
            type: String,
            value: "Unknown"
        },

        _pathKeys: {
            type: Object,
            value: function () {
                return this._getDataObjectPathKeys();
            }
        }
    },
    _executeRequest: function (model, request) {
        let op = request.operation;

        if (op === "create") {
            return this._callCreate(model, request);
        } else if (op === "update") {
            return this._callUpdate(model, request);
        } else if (op === "delete") {
            return this._callDelete(model, request);
        } else {
            throw "exception: operation " + op + " is not supported in " + this.is + " element.";
        }
    },
    _formatResponse: function (request, rawResponsePkg) {
        let op = request.operation;

        if (!rawResponsePkg) {
            return rawResponsePkg;
        }

        if (op === "update") {
            let statusResponse = rawResponsePkg;

            if (!rawResponsePkg.status) {
                statusResponse = { "msg": "entity submitted for save successfully", "reqTrackingId": 100 };
            }

            if (this.verbose) {
                console.log("save entity call raw response ", rawResponsePkg);
                let model = RUFBehaviors.DataChannel.getModel(this.dataIndex);
                console.log("model cache after save call", model.getCache());
            }

            return statusResponse;
        } else if (op === "create") {
            let statusResponse = rawResponsePkg;

            if (!rawResponsePkg.status) {
                statusResponse = { "msg": "entities submitted for save successfully", "reqTrackingId": 100 };
            }

            if (this.verbose) {
                console.log("save entity call raw response ", rawResponsePkg);
                let model = RUFBehaviors.DataChannel.getModel(this.dataIndex);
                console.log("model cache after save call", model.getCache());
            }

            return statusResponse;
        } else {
            return rawResponsePkg;
        }
    },
    _callCreate: function (model, request) {
        let jsonEnvelopeCreateResponse = this._createJsonEnvelope(request, model, "create");
        let jsonEnvelope = jsonEnvelopeCreateResponse.jsonEnvelope;

        if (jsonEnvelope === {}) {
            return;
        }

        let pathKeys = this._pathKeys;

        let dataObjectTypes = jsonEnvelopeCreateResponse.dataObjectTypes;

        if (this.verbose) {
            console.log("dataobject json envelope", jsonEnvelope);
            console.log("model cache before save call", model.getCache());
        }

        let functionPath = [pathKeys.root, this.dataIndex, dataObjectTypes, "create"];

        return model.call(functionPath, [jsonEnvelope], [], []);
    },
    _callUpdate: function (model, request) {
        let jsonEnvelopeCreateResponse = this._createJsonEnvelope(request, model, "update");
        let jsonEnvelope = jsonEnvelopeCreateResponse.jsonEnvelope;

        if (jsonEnvelope === {}) {
            return;
        }

        let pathKeys = this._pathKeys;

        let dataObjectIds = jsonEnvelopeCreateResponse.dataObjectIds;
        let dataObjectTypes = jsonEnvelopeCreateResponse.dataObjectTypes;

        if (this.verbose) {
            console.log("dataobject json envelope", jsonEnvelope);
            console.log("model cache before save call", model.getCache());
        }

        let functionPath = [pathKeys.root, this.dataIndex, dataObjectTypes, pathKeys.byIds, dataObjectIds, "update"];

        return model.call(functionPath, [jsonEnvelope], [], []);
    },
    _callDelete: function (model, request) {
        let jsonEnvelopeCreateResponse = this._createJsonEnvelope(request, model, "delete");
        let jsonEnvelope = jsonEnvelopeCreateResponse.jsonEnvelope;

        if (jsonEnvelope === {}) {
            return;
        }

        let pathKeys = this._pathKeys;

        let dataObjectIds = jsonEnvelopeCreateResponse.dataObjectIds;
        let dataObjectTypes = jsonEnvelopeCreateResponse.dataObjectTypes;

        if (this.verbose) {
            console.log("dataobject json envelope", jsonEnvelope);
            console.log("model cache before save call", model.getCache());
        }

        let functionPath = [pathKeys.root, this.dataIndex, dataObjectTypes, pathKeys.byIds, dataObjectIds, "delete"];

        return model.call(functionPath, [jsonEnvelope], [], []);
    },
    _createJsonEnvelope: function (request, model, operation) {
        let reqData = request.requestData;
        let pathKeys = this._pathKeys;
        let dataIndex = this.dataIndex;
        let dataIndexInfo = pathKeys.dataIndexInfo[dataIndex];

        if (this.objectsCollectionName == "Unknown") {
            this.objectsCollectionName = dataIndexInfo.collectionName;
        }

        if (reqData === undefined || !Object.keys(reqData[this.objectsCollectionName]).length) {
            return {};
        }

        let dataObjects = reqData[this.objectsCollectionName];

        if (this.verbose) {
            console.log("Request for save data objects call...data objects: ", dataObjects);
        }

        let jsonEnvelope = { "json": {} };
        jsonEnvelope.json[pathKeys.root] = {};
        jsonEnvelope.json[pathKeys.root][dataIndex] = {};
        let dataObjectsBaseJson = jsonEnvelope.json[pathKeys.root][dataIndex] = {};

        if (reqData.clientState) {
            jsonEnvelope.json.clientState = reqData.clientState;
        } else {
            jsonEnvelope.json.clientState = {};
            jsonEnvelope.json.clientState.notificationInfo = {};
            jsonEnvelope.json.clientState.notificationInfo.showNotificationToUser = true;
        }

        if(DataHelper.isValidObjectPath(jsonEnvelope, "json.clientState.notificationInfo")) {
            jsonEnvelope.json.clientState.notificationInfo.processAction = operation;
        }

        if (reqData.hotline) {
            jsonEnvelope.json.clientState.hotline = reqData.hotline;
        }

        jsonEnvelope.json.clientState.notificationInfo.context = {};
        let currentActiveApp = ComponentHelper.getCurrentActiveApp();
        if (currentActiveApp) {
            jsonEnvelope.json.clientState.notificationInfo.context.appInstanceId = currentActiveApp.id;
        }

        if (dataObjects.length == 0) {
            let reason = { "status": "error", "msg": "No data objects found for save" };
            return reason;
        }

        let dataObjectIds = [];
        let dataObjectTypes = [];

        for (let dataObjectIndex = 0; dataObjectIndex < dataObjects.length; dataObjectIndex++) {
            let dataObject = dataObjects[dataObjectIndex];
            let dataObjectId = dataObject.id;
            let dataObjectType = dataObject.type;

            if (operation == "update") {
                //Check whether relationships process is requested...
                //If yes, populate original relIds in order to return back all the relIds from nodeJs to solve falcor issue
                let basePath = [pathKeys.root, dataIndex, dataObjectType, pathKeys.byIds, dataObjectId, "data", "contexts"];
                this._prepareOriginalRelIdsForRelationshipsSave(dataObject, model, basePath);
            }

            let dataObjectTypeJson = SharedUtils.DataObjectFalcorUtil.getOrCreate(dataObjectsBaseJson, dataObjectType, {});
            let dataObjectsByIdJson = SharedUtils.DataObjectFalcorUtil.getOrCreate(dataObjectTypeJson, pathKeys.byIds, {});
            dataObjectsByIdJson[dataObjectId] = dataObject;

            dataObjectIds.push(dataObjectId);

            if (dataObjectTypes.indexOf(dataObjectType) === -1) {
                dataObjectTypes.push(dataObjectType);
            }
        }

        return { "jsonEnvelope": jsonEnvelope, "dataObjectIds": dataObjectIds, "dataObjectTypes": dataObjectTypes };
    },
    _prepareOriginalRelIdsForRelationshipsSave: function (dataObject, model, basePath) {
        if(dataObject.data) {
            let utils = SharedUtils.DataObjectFalcorUtil;
            let contexts = dataObject.data.contexts;
            if (contexts && contexts.length > 0) {
                for(let i=0; i<contexts.length; i++) {
                    let context = contexts[i].context;
                    let ctxKey = utils.createCtxKey(context);
                    let rels = contexts[i].relationships;
                    this._prepareOriginalRelIds(rels, basePath, model, ctxKey);
                }
            } else if (dataObject.data.relationships) {
                let rels = dataObject.data.relationships;
                let selfCtxKey = utils.createSelfCtxKey();
                this._prepareOriginalRelIds(rels, basePath, model, selfCtxKey);
            }
        }
    },

    _prepareOriginalRelIds: function (rels, basePath, model, ctxKey) {
        if(!_.isEmpty(rels)) {
            let utils = SharedUtils.DataObjectFalcorUtil;
            let contextPath = utils.mergePathSets(basePath, ctxKey);
            let relTypeKeys = [];
            relTypeKeys = Object.keys(rels);
            let originalRelIds = rels["originalRelIds"] = {};

            for (let relTypeKey of relTypeKeys) {
                let relIdsPath = utils.mergePathSets(contextPath, ["relationships", relTypeKey, "relIds"]);
                let relIdsJson = model.getCache(relIdsPath);    //get original rel ids from local cache

                if (relIdsJson) {
                    let originalRelIdsForType;
                    let pathObject = relIdsJson;
                    //Walk through relIdsJson and get originalRelIds
                    for (let pathItem of relIdsPath) {
                        pathObject = pathObject[pathItem];

                        if (!pathObject) {
                            break;
                        }

                        if (pathItem == "relIds") {
                            originalRelIdsForType = pathObject.value;
                        }
                    }

                    if (originalRelIdsForType) {
                        originalRelIds[relTypeKey] = originalRelIdsForType;
                    }
                }
            }
        }
    },
    _getDataObjectPathKeys: function () {
        return SharedUtils.DataObjectFalcorUtil.getPathKeys();
    }
};

RUFBehaviors.LiquidDataObjectSaveBehavior = [RUFBehaviors.LiquidBaseFalcorBehavior, RUFBehaviors.LiquidDataObjectSaveBehaviorImpl];
