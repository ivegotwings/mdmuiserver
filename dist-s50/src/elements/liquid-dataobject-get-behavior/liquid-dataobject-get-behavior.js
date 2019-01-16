import '@polymer/polymer/polymer-legacy.js';
import '../bedrock-helpers/data-helper.js';
import '../liquid-base-falcor-behavior/liquid-base-falcor-behavior.js';
import '../liquid-dataobject-utils/liquid-dataobject-utils.js';
import EntityTypeManager from '../bedrock-managers/entity-type-manager.js';
/*
 * @polymerBehavior RUFBehaviors.LiquidDataObjectGetBehavior
 * @demo demo/index.html
 */
window.RUFBehaviors = window.RUFBehaviors || {};
RUFBehaviors.LiquidDataObjectGetBehaviorImpl = {

    attached: function () {},

    ready: function () {},

    properties: {
        /**
         * Content is not appearing - Content development is under progress.
         */
        dataIndex: {
            type: String,
            value: "Unknown"
        },
        returnObjectsCollectionName: {
            type: String,
            value: "Unknown"
        },
        _pathKeys: {
            type: Object,
            value: function () {
                return this._getPathKeys();
            }
        },
        _relIdsCountOfRelGetRequest: {
            type: Object,
            value: function () {
                return {};
            }
        }
    },

    _executeRequest: function (model, request) {
        let op = request.operation,
            reqData = request.requestData;

        if (!this._validateRequest(request)) {
            let errResponse = {
                "status": "error",
                "message": "request validation failed"
            };
            return errResponse;
        }

        //If the request is for deleted types correct data object name
        this._correctRequestForDeletedObjectTypes(reqData);

        if (op === "initiatesearch") {
            return this._callInitiateSearch(model, reqData);
        } else if (op === "initiatesearchandgetcount") {
            return this._callInitiateSearchAndGetCount(model, reqData);
        } else if (op === "getsearchresultdetail") {
            return this._callSearchResultDetail(model, request);
        } else if (op === "searchandget") {
            return this._callSearchAndGet(model, request);
        } else if (op === "getbyids") {
            return this._callGetByIds(model, request);
        } else {
            throw "exception: operation " + op + " is not supported in " + this.is + " element.";
        }
    },

    _correctRequestForDeletedObjectTypes: function (requestData) {
        if (requestData && requestData.params && requestData.params.query) {
            let dataObjectName = requestData.params.query.name;
            if (dataObjectName && dataObjectName.indexOf("delete") === 0) {
                requestData.params.query.name = dataObjectName.replace("delete", "");
            }
            let dataObjectId = requestData.params.query.id;
            if (dataObjectId && dataObjectId.indexOf("delete") === 0) {
                requestData.params.query.id = dataObjectId.replace("delete", "");
            }
        }
    },

    _formatResponse: async function (request, rawResponsePkg) {
        let op = request.operation;
        let pathKeys = this._pathKeys;
        let dataIndex = this.dataIndex;
        let dataIndexInfo = pathKeys.dataIndexInfo[dataIndex];
        let includeTypeExternalName = request.requestData ? request.requestData.includeTypeExternalName : false;

        if (this.returnObjectsCollectionName == "Unknown") {
            this.returnObjectsCollectionName = dataIndexInfo.collectionName;
        }

        if (op === "initiatesearch" || op === "initiatesearchandgetcount") {
            let resSearchResults = rawResponsePkg.json[pathKeys.root][dataIndex][pathKeys.searchResults];

            if (!_.isEmpty(resSearchResults)) {
                let resSearchResultId = Object.keys(resSearchResults)[0];
                return this._formatInitiateSearchResponse(resSearchResults[resSearchResultId]);
            }
        } else if (op === "getsearchresultdetail" || op === "searchandget") {
            let formattedDataObjects = [];
            if (rawResponsePkg != undefined && rawResponsePkg.json && rawResponsePkg.json[pathKeys.root]) {
                let dataObjects = this._getDataObjects(rawResponsePkg, dataIndex, request);
                formattedDataObjects = await this._formatData(dataIndex, dataObjects, includeTypeExternalName);
            }

            let searchResultDetailResponse = {};
            searchResultDetailResponse[this.returnObjectsCollectionName] = formattedDataObjects;
            return searchResultDetailResponse;
        } else if (op === "getbyids") {
            let formattedDataObjects = [];
            if (rawResponsePkg !== undefined && rawResponsePkg.json && rawResponsePkg.json[pathKeys.root]) {
                let dataObjects = this._getDataObjects(rawResponsePkg, dataIndex, request);
                formattedDataObjects = await this._formatData(dataIndex, dataObjects, includeTypeExternalName);

                if (formattedDataObjects && this._relIdsCountOfRelGetRequest && !_.isEmpty(this._relIdsCountOfRelGetRequest)) {
                    for (let dataObject of formattedDataObjects) {
                        let relTotalCounts = this._relIdsCountOfRelGetRequest[dataObject.id];
                        if (!_.isEmpty(relTotalCounts)) {
                            dataObject["relationshipsTotalCount"] = relTotalCounts;
                        }
                    }
                }
            }

            let getByIdsResponse = {};
            getByIdsResponse[this.returnObjectsCollectionName] = formattedDataObjects;
            return getByIdsResponse;
        }
    },

    _validateAutoTriggerChanges: function (requestData, operation) {
        if ((operation === "initiatesearch" || operation === "searchandget" || operation === "initiatesearchandgetcount") && (requestData.path == "requestData.params.fields" || requestData.path == "requestData.params.options")) {
            return false;
        }

        return true;
    },

    _validateRequest: function (request) {
        let requestData = request.requestData;
        let operation = request.operation;
        let hostName = this.domHost ? this.domHost.localName : this.localName;
        let mainMessage = "cannot make request for operation " + operation + "{0} ... host: " + hostName + "... request: " + JSON.stringify(requestData);

        if (!requestData) {
            console.warn(mainMessage.format(": requestData not found"));
            return false;
        }
        if (!requestData.params) {
            console.warn(mainMessage.format(": requestData.params not found"));
            return false;
        }

        if (requestData.params.isCombinedQuerySearch) {
            // Todo.. Do VALIDATION
            return true;
        }

        if (!requestData.params.query) {
            console.warn(mainMessage.format(": requestData.params.query not found"));
            return false;
        }

        let isIdExists = requestData.params.query.id !== undefined || requestData.params.query.ids !== undefined;
        let isNameExists = requestData.params.query.name !== undefined || requestData.params.query.names !== undefined;
        let isCtxExists = requestData.params.query.contexts !== undefined && requestData.params.query.contexts.length > 0;
        let isTypeCriterionExists = requestData.params.query.filters !== undefined && requestData.params.query.filters.typesCriterion !== undefined && requestData.params.query.filters.typesCriterion.length > 0;

        if (!(isIdExists || isNameExists || isCtxExists || isTypeCriterionExists)) {
            console.warn(mainMessage.format(": at least one must be present (ids, contexts, typesCriterion)"));
            return false;
        }

        if (!isTypeCriterionExists) {
            console.warn(mainMessage.format(": typesCriterion is mandatory in filters"));
            return false;
        }

        let typesCriterion = requestData.params.query.filters.typesCriterion;
        if (typesCriterion) {
            typesCriterion.forEach(function (item) {
                if (typeof item != "string") {
                    console.warn(mainMessage.format(": typesCriterion has non-string value in filters"));
                    return false;
                }
            }, this);
        }

        //operation based validation
        if (operation === "getbyids") {
            if (!(isIdExists || isNameExists)) {
                console.warn(mainMessage.format(": at least one of [id / ids / name] field is mandatory for this operation"));
                return false;
            }
        } else if (operation == "getsearchresultdetail") {
            if (!request.requestId) {
                console.warn(mainMessage.format(": requestId is mandatory for this operation"));
                return false;
            }
        }

        if (requestData && requestData.params && requestData.params.query && requestData.params.query.valueContexts && requestData.params.query.valueContexts.length > 0) {
            let valContexts = requestData.params.query.valueContexts;
            for (let valContext of valContexts) {
                if (!valContext.source) {
                    console.warn(mainMessage.format(": source is mandatory in value context"));
                }

                if (!valContext.locale) {
                    console.warn(mainMessage.format(": locale is mandatory in value context"));
                }
            }
        } else {
            if (this.dataIndex == "entityModel" || this.dataIndex == "entityData") {
                //todo: Fix all calls and then enable this warning..
                //console.warn(mainMessage.format(": valueContexts is missing"));
            }
        }

        // Fill if someone does not pass fields
        if (requestData.params && !requestData.params.fields) {
            requestData.params.fields = {};
        }

        return true;
    },

    _checkLoadAllFlags: function (reqData) {
        let result = {};

        let needObjectKeyResolution = false;

        if (reqData && reqData.params && reqData.params.fields && reqData.params.fields) {
            let fields = reqData.params.fields;

            if (fields.attributes && fields.attributes.indexOf("_ALL") > -1) {
                result.loadAttributeNames = needObjectKeyResolution = true;
            }

            if (fields.relationships && fields.relationships.indexOf("_ALL") > -1) {
                result.loadRelationshipsTypes = needObjectKeyResolution = true;
            }

            if (fields.relationshipAttributes && fields.relationshipAttributes.indexOf("_ALL") > -1) {
                result.loadRelationshipAttributes = needObjectKeyResolution = true;
            }

            if (fields.contexts && fields.contexts.indexOf("_ALL") > -1) {
                result.loadContexts = needObjectKeyResolution = true;
            }
        }

        result.needObjectKeyResolution = needObjectKeyResolution;

        return result;
    },

    _callGetByIds: function (model, request, basePath) {
        let reqData = request.requestData;

        let utils = SharedUtils.DataObjectFalcorUtil;

        basePath = this._getDataObjectBasePath(reqData, basePath);

        let ctxKeys = this._getCtxKeys(reqData);

        let loadAllFlags = this._checkLoadAllFlags(reqData);

        if (loadAllFlags.needObjectKeyResolution) {
            let responsePromise = this._callObjectKeysGet(model, request, basePath, loadAllFlags, ctxKeys);
            let self = this;
            if (responsePromise) {
                responsePromise.then(function (responsePkg) {
                    self.removeFalcorKeys(responsePkg);
                    let clonedReqData = utils.cloneObject(reqData);
                    request.requestData = self._appendObjectKeysToRequest(responsePkg, loadAllFlags, ctxKeys, clonedReqData, request, basePath);
                    return self._callGetPaths(model, request, basePath);
                });
            } else {
                return this._callGetPaths(model, request, basePath);
            }
        } else {
            return this._callGetPaths(model, request, basePath);
        }

        return {};
    },

    _callGetPaths: function (model, request, basePath) {

        let reqData = request.requestData;

        let utils = SharedUtils.DataObjectFalcorUtil;

        basePath = this._getDataObjectBasePath(reqData, basePath);

        let paths = [];

        let relTypes = reqData.params.fields.relationships === undefined ? [] : reqData.params.fields.relationships;

        let isRelationshipsRequested = relTypes.length > 0 || false;
        let dataObjectFields = ["id", "name", "version", "type", "properties", "domain"];

        let ctxKeys = this._getCtxKeys(reqData);
        let valCtxKeys = utils.createCtxKeys(reqData.params.query.valueContexts);

        let jsonDataPath = this._getJsonDataPath(reqData, basePath, ctxKeys);

        if (isRelationshipsRequested || jsonDataPath) {
            let dataObjectFieldsPath = utils.mergePathSets(basePath, [dataObjectFields]);
            paths.push(dataObjectFieldsPath);
        } else {
            if (!reqData.params.fields.attributes) {
                reqData.params.fields.attributes = [];
            }

            reqData.params.fields.attributes.push(utils.CONST_DATAOBJECT_METADATA_FIELDS);
        }

        let attributesPath = this._getAttributesPath(reqData, basePath, ctxKeys, valCtxKeys);

        if (attributesPath) {
            paths.push(attributesPath);
        }

        if (jsonDataPath) {
            paths.push(jsonDataPath);
        }

        if (isRelationshipsRequested) {
            return this._callGetRelationships(model, paths, request, basePath, ctxKeys, valCtxKeys, relTypes);
        } else {
            let getResponsePromise = this._makeFalcorGetCall(model, paths, this.noCache);
            return this._handleModelResponse(request, getResponsePromise);
        }
    },

    _callObjectKeysGet: function (model, request, basePath, loadAllFlags, ctxKeys) {
        let utils = SharedUtils.DataObjectFalcorUtil;
        let paths = [];

        if (!loadAllFlags.needObjectKeyResolution) {
            return;
        }

        if (loadAllFlags.loadAttributeNames) {
            let attributeMapPath = utils.mergePathSets(basePath, ["data", "contexts", ctxKeys, "mappings", "attributeMap"]);
            paths.push(attributeMapPath);
        }

        if (loadAllFlags.loadRelationshipsTypes) {
            let relationshipMapPath = utils.mergePathSets(basePath, ["data", "contexts", ctxKeys, "mappings", "relationshipMap"]);
            paths.push(relationshipMapPath);
        }

        if (loadAllFlags.loadContexts) {
            let contextMapPath = utils.mergePathSets(basePath, ["data", "mappings", "contextMap"]);
            paths.push(contextMapPath);
        }

        if (paths.length > 0) {
            return this._makeFalcorGetCall(model, paths);
        }

        return undefined;
    },

    _callInitiateSearch: function (model, reqData) {
        let pathKeys = this._pathKeys;
        let utils = SharedUtils.DataObjectFalcorUtil;
        let functionPath = [pathKeys.root, this.dataIndex, pathKeys.searchResults, "create"];
        let checkCachedQuery = false;

        let self = this;

        if (checkCachedQuery) {
            let cachedQueryResponse = this._callCachedSearchQuery(model, reqData);
            cachedQueryResponse.then(function (rawResponsePkg) {
                if (utils.isValidObjectPath(rawResponsePkg, "json." + pathKeys.root + "." + this.dataIndex + "." + pathKeys.searchResults + ".0")) {
                    return self._handleModelResponse(cachedQueryResponse);
                } else {
                    let getResponsePromise = model.call(functionPath, [reqData], [], []);
                    return self._handleModelResponse(getResponsePromise);
                }
            });
        } else {
            return model.call(functionPath, [reqData], [], []);
        }
    },

    _callCachedSearchQuery: function (model, reqData) {
        let pathKeys = this._pathKeys;
        let queryAsJsonString = JSON.stringify(reqData);
        let paths = [pathKeys.root, this.dataIndex, "cachedSearchResults", queryAsJsonString];
        return this._makeFalcorGetCall(model, [paths]);
    },

    _callInitiateSearchAndGetCount: function (model, reqData) {
        if (reqData) {
            reqData.operation = "initiatesearchandgetcount";
        }

        let pathKeys = this._pathKeys;
        return model.call([pathKeys.root, this.dataIndex, pathKeys.searchResults, "create"], [reqData], [], []);
    },

    _callSearchResultDetail: function (model, request) {
        let self = this,
            reqId = request.requestId === undefined ? "" : request.requestId,
            reqData = request.requestData,
            resultSize = 0;

        if (reqId === "") {
            return {}; // this means do nothing..
        }

        if (this.verbose) {
            this.log("Request Id for get search result detail: ", reqId);
        }

        let pathKeys = this._pathKeys;
        let dataIndex = this.dataIndex;
        let resultSizeResponse = this._callSearchResultSizeGet(model, reqId);

        resultSizeResponse.then(function (resultSizePkg) {
            if (!resultSizePkg) {
                return {};
            }

            resultSize = resultSizePkg.json[pathKeys.root][dataIndex][pathKeys.searchResults][reqId].resultRecordSize;

            let from = reqData.params.options && reqData.params.options.from !== undefined ? reqData.params.options.from : 0;
            let to = reqData.params.options && reqData.params.options.to !== undefined ? reqData.params.options.to : resultSize - 1;

            if (from == -1) {
                from = 0;
            } else if (from >= resultSize) {
                from = -1;
            }

            if (to == -1) {
                to = resultSize - 1; //todo: return all records..??? how to stop this??
            }

            let to1 = (to + 1) < resultSize ? to : resultSize - 1;

            if (from != -1) {
                let searchResultPath = [pathKeys.root, dataIndex, pathKeys.searchResults, reqId, pathKeys.searchResultItems, [{
                    "from": from,
                    "to": to1
                }]];
                let getByIdsResponse = self._callGetByIds(model, request, searchResultPath);
                return self._handleModelResponse(request, getByIdsResponse);
            } else {
                let emptyResponse = {
                    "status": "success",
                    "json": {}
                };

                emptyResponse.json[pathKeys.root] = {};
                emptyResponse.json[pathKeys.root][dataIndex] = {};
                emptyResponse.json[pathKeys.root][dataIndex][pathKeys.searchResults] = {};
                emptyResponse.json[pathKeys.root][dataIndex][pathKeys.searchResults][reqId] = {};
                emptyResponse.json[pathKeys.root][dataIndex][pathKeys.searchResults][reqId][pathKeys.searchResultItems] = {};
                return self._handleModelResponse(request, emptyResponse);
            }
        });
    },

    _callSearchAndGet: function (model, request) {
        let pathKeys = this._pathKeys;
        let dataIndex = this.dataIndex;
        let self = this;

        let initiateSearchModelResponse = this._callInitiateSearch(model, request.requestData);

        initiateSearchModelResponse.then(function (rawResponsePkg) {
            if (rawResponsePkg) {
                self.removeFalcorKeys(rawResponsePkg);

                let resSearchResultId = Object.keys(rawResponsePkg.json[pathKeys.root][dataIndex][pathKeys.searchResults])[0];
                let initiateSearchResponse = self._formatInitiateSearchResponse(rawResponsePkg.json[pathKeys.root][dataIndex][pathKeys.searchResults][resSearchResultId]);

                if (initiateSearchResponse && initiateSearchResponse.resultRecordSize && initiateSearchResponse.resultRecordSize > 0) {
                    request.requestId = initiateSearchResponse.requestId;
                    return self._callSearchResultDetail(model, request);
                }
            }
        });
    },

    _callSearchResultSizeGet: function (model, reqId) {
        let pathKeys = this._pathKeys;

        let functionPath = [pathKeys.root, this.dataIndex, pathKeys.searchResults, reqId, "resultRecordSize"];

        return model.get(functionPath);
    },

    _callSearchResultDataObjectIdsGet: function (model, reqId, from, to) {
        let pathKeys = this._pathKeys;

        let functionPath = [pathKeys.root, this.dataIndex, pathKeys.searchResults, reqId, pathKeys.searchResultItems, [{
            "from": from,
            "to": to
        }]];

        return model.get(functionPath);
    },

    _callGetRelationships: function (model, paths, request, basePath, ctxKeys, valCtxKeys, relTypes) {
        let reqData = request.requestData;
        let utils = SharedUtils.DataObjectFalcorUtil;

        let relAttrNames = reqData.params.fields.relationshipAttributes === undefined ? [] : reqData.params.fields.relationshipAttributes;

        DataHelper.arrayRemove(relAttrNames, "_ALL"); //TODO: Fix this once we have logic to resolve ALL...

        let relatedDataObjectAttrs = reqData.params.fields.relatedEntityAttributes === undefined ? [] : reqData.params.fields.relatedEntityAttributes;
        DataHelper.arrayRemove(relatedDataObjectAttrs, "_ALL"); //TODO: Fix this once we have logic to resolve ALL...

        let relIdCreatePath = utils.mergePathSets(basePath, ["data", "contexts", ctxKeys, "relationships", relTypes, "relIds"]);

        let attrDetailPath = this._getAttributeDetailPath(valCtxKeys);

        let relAttrsPath = [];
        if (relAttrNames.length > 0) {
            relAttrsPath = utils.mergePathSets(["attributes", relAttrNames], attrDetailPath);
        }

        let relToObjectPath_Fields = utils.mergePathSets(["relToObject"]);

        let relToObjectPath_Attrs = [];
        if (relatedDataObjectAttrs.length > 0) {
            relToObjectPath_Attrs = utils.mergePathSets(["relToObject", "data", "contexts", ctxKeys, "attributes", relatedDataObjectAttrs], attrDetailPath);
        }

        let self = this;

        model.get(relIdCreatePath).then(function (responsePkg) {
            //this.log('rel get call res ', JSON.stringify(responsePkg, null, 4));

            if (responsePkg !== undefined) {
                self.removeFalcorKeys(responsePkg);
                let relDetailGetPaths = self._getRelationshipDetailPaths(responsePkg, self, reqData, basePath, ctxKeys, valCtxKeys, relTypes, relAttrsPath, relToObjectPath_Fields, relToObjectPath_Attrs, request);

                if (relDetailGetPaths.length > 0) {
                    paths.push.apply(paths, relDetailGetPaths);
                }
            }

            if (paths.length > 0) {
                let getWithRelResponsePromise = self._makeFalcorGetCall(model, paths, self.noCache);
                return self._handleModelResponse(request, getWithRelResponsePromise);
            } else {
                return {}; // no falcor call needed..
            }
        });

        return {};
    },

    _formatInitiateSearchResponse: function (rawResponsePkg) {
        let pathKeys = this._pathKeys;
        let searchResultItemsKey = pathKeys.searchResultItems;

        let output = {};
        for (let fieldKey in rawResponsePkg) {
            let field = rawResponsePkg[fieldKey];

            if (fieldKey == searchResultItemsKey) {
                let items = field;
                let formattedItems = [];

                for (let itemKey in items) {
                    let item = items[itemKey];
                    if (item) {
                        let id = item["4"];
                        let type = item["2"];

                        if (id && type) {
                            formattedItems.push({
                                "id": id,
                                "type": type
                            });
                        }
                    }
                }

                output[fieldKey] = formattedItems;
            } else {
                output[fieldKey] = field;
            }
        }

        return output;
    },

    _formatData: async function (dataIndex, dataObjects, includeTypeExternalName) {
        let utils = SharedUtils.DataObjectFalcorUtil;
        let formattedDataObjects = [];

        let entityTypeManager = undefined;

        if (includeTypeExternalName) {
            entityTypeManager = EntityTypeManager ? EntityTypeManager.getInstance() : undefined;
        }

        for (let dataObjectId in dataObjects) {
            let dataObject = dataObjects[dataObjectId];
            let formattedDataObject = utils.transformToExternal(dataObject);
            if (includeTypeExternalName && formattedDataObject.type && entityTypeManager) {
                formattedDataObject["typeExternalName"] = await entityTypeManager.getTypeExternalNameByIdAsync(formattedDataObject.type);
            }

            formattedDataObjects.push(formattedDataObject);
        }

        return formattedDataObjects;
    },

    _appendObjectKeysToRequest: function (responsePkg, loadAllFlags, ctxKeys, reqData, request, basePath) { // eslint-disable-line no-unused-vars
        let allAttrNames = [];
        let allRelTypes = [];
        let allContexts = [];

        let utils = SharedUtils.DataObjectFalcorUtil;

        if (this.verbose) {
            console.log("_ALL get response ", JSON.stringify(responsePkg));
        }

        if (responsePkg) {

            let dataObjects = this._getDataObjects(responsePkg, this.dataIndex, request);

            for (let dataObjectIdIdx in dataObjects) {
                let resDataObject = dataObjects[dataObjectIdIdx];

                for (let ctxKeyIdx in ctxKeys) {
                    let ctxKey = ctxKeys[ctxKeyIdx];

                    if (loadAllFlags.loadAttributeNames) {
                        let attrNames = utils.getNestedObject(resDataObject, ["data", "contexts", ctxKey, "mappings", "attributeMap"]);
                        if (!_.isEmpty(attrNames)) {
                            allAttrNames.push.apply(allAttrNames, attrNames);
                        }
                    }

                    if (loadAllFlags.loadRelationshipsTypes) {
                        let relTypes = utils.getNestedObject(resDataObject, ["data", "contexts", ctxKey, "mappings", "relationshipMap"]);
                        if (!_.isEmpty(relTypes)) {
                            allRelTypes.push.apply(allRelTypes, relTypes);
                        }
                    }
                }

                if (loadAllFlags.loadContexts) {
                    let contexts = utils.getNestedObject(resDataObject, ["data", "contextMap"]);
                    if (!_.isEmpty(contexts)) {
                        allContexts.push.apply(allContexts, contexts);
                    }
                }
            }

            if (loadAllFlags.loadAttributeNames) {
                reqData.params.fields.attributes = _.uniq(allAttrNames);
                reqData.params.fields.attributes.push(utils.CONST_DATAOBJECT_METADATA_FIELDS);
            }

            if (loadAllFlags.loadRelationshipsTypes) {
                reqData.params.fields.relationships = _.uniq(allRelTypes);
            }

            if (loadAllFlags.loadContexts) {
                reqData.params.query.contexts.push.apply(reqData.params.query.contexts, _.uniq(allContexts));
            }

            if (this.verbose) {
                console.log("new req data after obejct key append ", reqData);
            }
        }

        return reqData;
    },

    _getDataObjectBasePath: function (reqData, basePath) {
        let dataObjectIds = [];

        if (reqData === undefined || reqData.params === undefined) {
            return;
        }

        if (basePath === undefined) {
            if (reqData.params && reqData.params.query && (reqData.params.query.id || reqData.params.query.ids)) {
                if (reqData.params.query.id) {
                    dataObjectIds.push(reqData.params.query.id);
                } else if (reqData.params.query.ids) {
                    dataObjectIds.push.apply(dataObjectIds, reqData.params.query.ids);
                }
            } else if (reqData.params && reqData.params.query && (reqData.params.query.name || reqData.params.query.names)) {
                if (reqData.params.query.filters && reqData.params.query.filters.typesCriterion) {
                    let types = reqData.params.query.filters.typesCriterion;
                    if (reqData.params.query.name) {
                        for (let typeIndex = 0; typeIndex < types.length; typeIndex++) {
                            let type = types[typeIndex];
                            let smartId = reqData.params.query.name + "_" + type;
                            dataObjectIds.push(smartId);
                        }
                    } else if (reqData.params.query.names) {
                        for (let typeIndex = 0; typeIndex < types.length; typeIndex++) {
                            for (let nameIndex = 0; nameIndex < reqData.params.query.names.length; nameIndex++) {
                                let type = types[typeIndex];
                                let smartId = reqData.params.query.names[nameIndex] + "_" + type;
                                dataObjectIds.push(smartId);
                            }
                        }
                    }
                }
            }
        }

        if (this.verbose) {
            this.log("Request for get data objects call...request: ", reqData, " ...dataObjectIds: ", dataObjectIds, " ...base path: ", basePath);
        }

        let dataObjectTypes = this._getDataObjectTypes(reqData);
        let dataObjectPath = [this._pathKeys.root, this.dataIndex, dataObjectTypes, this._pathKeys.byIds, dataObjectIds];

        basePath = basePath === undefined ? dataObjectPath : basePath;

        return basePath;
    },

    _getCtxKeys: function (reqData) {
        let clonedContexts = [];

        let utils = SharedUtils.DataObjectFalcorUtil;

        let coalesceOptions = undefined;
        if (reqData.params && reqData.params.options && reqData.params.options.coalesceOptions &&
            reqData.params.options.coalesceOptions.enhancerAttributes && reqData.params.options.coalesceOptions.enhancerAttributes.length > 0) {
            coalesceOptions = reqData.params.options.coalesceOptions;
        }

        if (reqData.params && reqData.params.query && reqData.params.query.contexts && reqData.params.query.contexts.length > 0) {
            for (let ctxIndex = 0; ctxIndex < reqData.params.query.contexts.length; ctxIndex++) {
                let context = reqData.params.query.contexts[ctxIndex];
                if (_.isEmpty(context)) {
                    continue;
                }

                let clonedContext = utils.cloneObject(context);

                if (coalesceOptions) {
                    clonedContext["coalesceOptions"] = utils.cloneObject(coalesceOptions);
                }

                clonedContexts.push(clonedContext);
            }
        }

        let selfContext = utils.getSelfCtx();

        if (coalesceOptions) {
            let selfCoalescedOptions = utils.cloneObject(coalesceOptions);
            if (selfCoalescedOptions.enhancerAttributes) {
                for (let enhancerAttribute of selfCoalescedOptions.enhancerAttributes) {
                    if (enhancerAttribute && enhancerAttribute.contexts) {
                        delete enhancerAttribute.contexts;
                    }
                }
            }

            selfContext["coalesceOptions"] = selfCoalescedOptions;
        }

        clonedContexts.push(selfContext);

        return utils.createCtxKeys(clonedContexts);
    },

    _getAttributesPath: function (reqData, basePath, ctxKeys, valCtxKeys) {

        let utils = SharedUtils.DataObjectFalcorUtil;

        let attributesPath = undefined;
        //var attrs = [utils.CONST_DATAOBJECT_METADATA_FIELDS];
        let attrs = [];

        if (reqData.params.fields.attributes !== undefined && reqData.params.fields.attributes.length > 0) {
            attrs.push.apply(attrs, reqData.params.fields.attributes);
        }

        let attrDetailPath = this._getAttributeDetailPath(valCtxKeys);

        // TODO:: how to solve this hack..
        if (this.dataIndex == "entityModel") {
            attrs.push(utils.CONST_CTX_PROPERTIES); /// get contexts level properties as attribute named 'properties'.. this is cheating..
        }

        if (attrs.length > 0) {
            attributesPath = utils.mergePathSets(basePath, ["data", "contexts", ctxKeys, "attributes", attrs], attrDetailPath);
        }

        return attributesPath;
    },

    _getJsonDataPath: function (reqData, basePath, ctxKeys) {
        if (reqData.params.fields.jsonData) {
            return SharedUtils.DataObjectFalcorUtil.mergePathSets(basePath, ["data", "contexts", ctxKeys], ["jsonData"]);
        } else {
            return undefined;
        }
    },

    _getAttributeDetailPath: function (valCtxKeys) {
        return ["valContexts", valCtxKeys, ["values", "group", "properties"]];
    },

    _getRelationshipDetailPaths: function (relIdsResponsePkg, self, reqData, basePath, ctxKeys, valCtxKeys, relTypes, relAttrsPath, relToObjectPath_Fields, relToObjectPath_Attrs, request) {
        let relDetailGetPaths = [];

        let utils = SharedUtils.DataObjectFalcorUtil;

        let relFieldsPath = [
            ["id", "direction", "operation", "source", "properties", "relTo", "relToObject", "os", "osid", "ostype", "osctxpath"]
        ];

        if (relIdsResponsePkg !== undefined) {
            let resDataObjects = self._getDataObjects(relIdsResponsePkg, self.dataIndex, request);

            for (let dataObjectIdIdx in resDataObjects) {
                let resDataObject = resDataObjects[dataObjectIdIdx];

                for (let relTypeIdx in relTypes) {
                    let relType = relTypes[relTypeIdx];
                    let totalRelIds = [];
                    for (let ctxKeyIdx in ctxKeys) {
                        let ctxKey = ctxKeys[ctxKeyIdx];
                        let relIds = utils.getNestedObject(resDataObject, ["data", "contexts", ctxKey, "relationships", relType, "relIds"]);

                        if (!relIds) {
                            continue;
                        }
                        /**
                         * As all the relationships from self will come coalesced into the 
                         * selected context, no need to concat all self relationships with
                         * context relationships. We can consider only relationships came 
                         * under selected context be it coalesced data or normal data.
                         * TODO: If there are multiple contexts? Never came across this scenario.
                         * Need to figure out a way in case we come across this.
                         * Context-v3: Need to verify bug 320078 post this change.
                         * For the 320078, in governance model we dont have taxonomy/classification
                         * dimensions anymore. So it shouldn't be affected.
                         **/
                        if (!(ctxKeys.length > 1 && ctxKey.indexOf("selfContext") > -1)) {
                            totalRelIds = totalRelIds.concat(relIds);
                        }
                        let from = reqData.params.options && reqData.params.options.from !== undefined ? reqData.params.options.from : 0;
                        let to = reqData.params.options && reqData.params.options.to !== undefined ? reqData.params.options.to : relIds.length - 1;

                        if (from == -1) {
                            from = 0;
                        } else if (from >= relIds.length) {
                            from = -1;
                        }

                        if (to >= relIds.length) {
                            to = relIds.length - 1;
                        }

                        if (from != -1) {
                            let filteredRelIds = relIds.slice(from, to + 1);
                            let relBasePath = utils.mergePathSets(basePath, ["data", "contexts", ctxKey, "relationships", relType, "rels", filteredRelIds]);

                            //must have paths for eachrel..rel fields and relTo with only fields..
                            relDetailGetPaths.push(utils.mergePathSets(relBasePath, relFieldsPath));
                            //relDetailGetPaths.push(utils.mergePathSets(relBasePath, relToObjectPath_Fields));

                            //rel attrs..only if requested...
                            if (relAttrsPath.length > 0) {
                                relDetailGetPaths.push(utils.mergePathSets(relBasePath, relAttrsPath));
                            }

                            //related entity attrs..only if requested...
                            if (relToObjectPath_Attrs.length > 0) {
                                relDetailGetPaths.push(utils.mergePathSets(relBasePath, relToObjectPath_Attrs));
                            }
                        } else {
                            //Commented below line because of,
                            //rock-grid internally uses iron-data-table and iron-data-table has functionality of vitualization where it's loading 2 page very first time.
                            //2 pages are necessary to satisfy all possible scenarion of virtualization (To get scroll bar in grid).
                            //So here if page size and record size is same for second page "from" will become "-1" and due to this throw it will not return any thing to iron-data-tale.
                            //if there is no record iron-data-table requires atlest blank response to stop second page loading.
                            //throw "requested range is not available for relationships";
                        }
                    }

                    //Keep relIds total count in order to return with the final response...
                    let relCountObject = this._relIdsCountOfRelGetRequest[dataObjectIdIdx];
                    if (!relCountObject) {
                        relCountObject = this._relIdsCountOfRelGetRequest[dataObjectIdIdx] = {};
                    }
                    relCountObject[relType] = [...new Set(totalRelIds)].length;
                }
            }
        }

        return relDetailGetPaths;
    },

    _getDataObjectTypes: function (reqData) {
        let dataObjectTypes = [];
        if (reqData && reqData.params && reqData.params.query &&
            reqData.params.query.filters && reqData.params.query.filters.typesCriterion &&
            reqData.params.query.filters.typesCriterion.length > 0) {
            dataObjectTypes = reqData.params.query.filters.typesCriterion;
        }

        if (dataObjectTypes.length == 0) {
            dataObjectTypes = [SharedUtils.DataObjectFalcorUtil.CONST_ALL];
        }

        return dataObjectTypes;
    },

    _getDataObjects: function (rawResponsePkg, dataIndex, request) {
        let pathKeys = this._pathKeys;
        let dataObjects = {};
        let dataByIndex = rawResponsePkg.json[pathKeys.root][dataIndex];

        if (dataByIndex) {
            if (request && (request.operation === "getsearchresultdetail" || request.operation === "searchandget")) {
                dataObjects = dataByIndex[pathKeys.searchResults][request.requestId][pathKeys.searchResultItems];
            } else {
                for (let dataObjectType in dataByIndex) {
                    let dataObjectTypeJson = dataByIndex[dataObjectType][pathKeys.byIds];
                    for (let dataObjectId in dataObjectTypeJson) {
                        dataObjects[dataObjectId] = dataObjectTypeJson[dataObjectId];
                    }
                }
            }
        }

        return dataObjects;
    },

    _makeFalcorGetCall: function (model, paths, noCache) {
        if (noCache && paths) {
            for (let pathIndex = 0; pathIndex < paths.length; pathIndex++) {
                let path = paths[pathIndex];
                model.invalidate(path);
            }
        }

        return model.get.apply(model, paths);
    },

    _getPathKeys: function () {
        return SharedUtils.DataObjectFalcorUtil.getPathKeys();
    },

    log: function () {
        let a = arguments;

        if (typeof console != "undefined" && console.log) {
            if (console.log.apply) {
                // It has Function#apply, use it
                console.log.apply(console, a);
            } else {
                // Ugh, no Function#apply
                let output2 = "";
                for (let argIndex = 0; argIndex < a.length; argIndex++) {
                    output2 += a[argIndex] + " ";
                }
            }
        }
    }
};

RUFBehaviors.LiquidDataObjectGetBehavior = [RUFBehaviors.LiquidBaseFalcorBehavior, RUFBehaviors.LiquidDataObjectGetBehaviorImpl];
