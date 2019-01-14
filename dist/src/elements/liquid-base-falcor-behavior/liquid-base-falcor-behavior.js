import { Base } from '@polymer/polymer/polymer-legacy.js';
import '@polymer/polymer/lib/utils/async.js';
import '@polymer/polymer/lib/utils/debounce.js';
import '../bedrock-datachannel/bedrock-datachannel.js';
import '../bedrock-helpers/element-helper.js';
import '../bedrock-helpers/data-helper.js';
import '../liquid-dataobject-utils/liquid-dataobject-utils.js';
import '../liquid-base-behavior/liquid-base-behavior.js';
import ProgressTracker from '../app-main/ProgressTracker.js';
/*
 * <i><b>Content development is under progress... </b></i>
 * @demo demo/index.html
 * @polymerBehavior RUFBehaviors.LiquidBaseFalcorBehavior
 */
window.RUFBehaviors = window.RUFBehaviors || {};

/** @polymerBehavior RUFBehaviors.LiquidBaseFalcorBehavior */
RUFBehaviors.LiquidBaseFalcorBehaviorImpl = {
    is: "liquid-base-falcor-behavior",
    attached: function () { },
    ready: function () {

        if (this.id === null || this.id === undefined || this.id === "") {
            this.id = ElementHelper.getRandomId();
        }
    },
    /**
     * Fired when a request is sent.
     *
     * @event request
     * @event liquid-request
     */
    /**
     * Fired when a response is received.
     *
     * @event response
     * @event liquid-response
     */
    /**
     * Fired when an error is received.
     *
     * @event error
     * @event liquid-error
     */
    properties: {
        /**
        * Content is not appearing - Content development is under progress.
        */
        operation: {
            type: String,
            value: "",
            notify: true
        },
        /**
          * Content is not appearing - Content development is under progress.
          */
        requestId: {
            type: String,
            value: "",
            notify: true
        },
        /**
          * Content is not appearing - Content development is under progress.
          */
        dataIndex: {
            type: String,
            value: "Unknown"
        },
        /**
          * Content is not appearing - Content development is under progress.
          */
        excludeInProgress: {
            type: Boolean,
            value: false
        },
        /**
          * Content is not appearing - Content development is under progress.
          */
        includeTypeExternalName: {
            type: Boolean,
            value: false
        },
        /**
          * Content is not appearing - Content development is under progress.
          */
        noCache: {
            type: Boolean,
            value: false
        },
        activeRequests: {
            type: Array,
            value: function () {
                return [];
            }
        }
    },
    observers: [
    ],
    /**
     * Content is not appearing - Can be used to perform a request to the specified URL.
     *
     */
    generateRequest: async function () {
        let request = this._createRequest();
        if (request.requestData === null || request.operation === "") {
            if (this.verbose) {
                console.log("request operation is blank so NO request operation would be generated..terminating gracefully...");
            }

            return;
        }

        if (!this._executeRequest) {
            throw "_executeRequest method is not defined";
        }

        this._addRequestCount();
        this.push("activeRequests", request);
        this._setLastRequest(request);

        if (this._isDataIndexUpdateRequired(request.requestData)) {
            await this._updateDataIndexBasedOnType(request.requestData);
        }

        request.originalRequest = DataHelper.cloneObject(request);
        request.applyLocaleCoalesce = this.applyLocaleCoalesce;
        request.useDataCoalesce = this.useDataCoalesce;
        if (this.applyLocaleCoalesce) {
            await this._updateValueContextsWithFallbackLocales(request.requestData);
        }

        this._setLoading(true);
        let model = RUFBehaviors.DataChannel.getModel(this.dataIndex);

        let modelResponse = this._executeRequest(model, request);

        if (!this._handleModelResponse(request, modelResponse)) {
            //if moded response is not queued ...no need to create active request..
            return;
        }

        return request;
    },

    _updateValueContextsWithFallbackLocales: async function (reqData) {
        if (reqData.params && reqData.params.query && reqData.params.query.valueContexts) {
            let valContexts = DataHelper.cloneObject(reqData.params.query.valueContexts);
            for (let valContextIndex = 0; valContextIndex < valContexts.length; valContextIndex++) {
                let locale = valContexts[valContextIndex].locale;
                let fallbackLocales = await DataHelper.getFallbackLocalesForLocaleAsync(locale);
                if (fallbackLocales) {
                    for (let fallbackLocaleIndex = 0; fallbackLocaleIndex < fallbackLocales.length; fallbackLocaleIndex++) {
                        let fallbackLocale = fallbackLocales[fallbackLocaleIndex].name;
                        let existingValCtx = reqData.params.query.valueContexts.find(obj => obj.locale === fallbackLocale);
                        if (!existingValCtx) {
                            let valCtx = DataHelper.cloneObject(valContexts[valContextIndex]);
                            valCtx.locale = fallbackLocale;
                            reqData.params.query.valueContexts.push(valCtx);
                        }
                    }
                }
            }
        }
    },
    
    _updateDataIndexBasedOnType: async function (requestData) {
        if (requestData) {
            let entityType, domain;
            if (DataHelper.isValidObjectPath(requestData, "params.query.filters.typesCriterion")) {
                entityType = requestData.params.query.filters.typesCriterion[0];
            }

            if (entityType) {
                let entityTypeManager = EntityTypeManager.getInstance();

                if (entityTypeManager) {
                    domain = await entityTypeManager.getDomainByType(entityType);
                }

                if (domain) {
                    let dataIndexDomainMappings = SharedUtils.DataObjectFalcorUtil.getDataIndexDomainMappings();
                    if (dataIndexDomainMappings) {
                        let dataIndex = dataIndexDomainMappings[domain];

                        if (!_.isEmpty(dataIndex)) {
                            this.dataIndex = dataIndex;
                        }
                    }
                }
            }
        }
    },

    _executeRequest: function (model, request) { // eslint-disable-line no-unused-vars
        //abstract method....do nothing...all elements implementing this behavior must implement this method
    },

    _formatResponse: function (request, rawResponsePkg) {
        return rawResponsePkg;
        //abstract method....do nothing...all elements implementing this behavior must implement this method
    },
    
    _validateAutoTriggerChanges: function (requestData, operation, requestId) { // eslint-disable-line no-unused-vars
        return true;
        //abstract method....do nothing...all elements implementing this behavior must implement this method
    },
    
    _createRequest: function () {
        if (this.includeTypeExternalName) {
            this.requestData.includeTypeExternalName = true;
        }
        let req = {
            "operation": this.operation,
            "requestId": this.requestId === undefined ? "" : this.requestId,
            "requestData": this.requestData
        };

        return DataHelper.cloneObject(req);
    },
    
    _getLogDetail: function (request) {
        return {
            "operation": request.operation,
            "request": request.requestData,
            "requestId": this.requestId === undefined ? "" : this.requestId
        };
    },
    
    _logOnError: function (request, res) {
        if (_.isEmpty(res) || _.isEmpty(res.json) || _.isEmpty(res.json.root)) {
            let message = "RUF_UI_LIQUID_EMPTY_RESPONSE";
            let logDetail = this._getLogDetail(request);
            RUFUtilities.Logger.error(message, logDetail, "liquid-manager");
        }
    },
    
    _handleModelResponse: function (request, modelResponse) {
        let self = this;
        if (modelResponse && modelResponse.then) {
            modelResponse.then(function (resPkg) {
                self._logOnError(request, resPkg);
                self.removeFalcorKeys(resPkg);
                return self._handleResponse(request, resPkg);
            },
            function (errPkg) {
                let message = "RUF_UI_LIQUID_ERROR";
                let logDetail = self._getLogDetail(request);
                RUFUtilities.Logger.error(message, logDetail, "liquid-manager");
                return self._handleError(request, errPkg);
            });
            return true;
        } else {
            if (modelResponse && modelResponse.status && modelResponse.status === "success") {
                self._logOnError(request, modelResponse);
                return self._handleResponse(request, modelResponse);
            } else if (modelResponse && modelResponse.status && modelResponse.status === "error") {
                let message = "RUF_UI_LIQUID_ERROR";
                let logDetail = self._getLogDetail(request);
                RUFUtilities.Logger.error(message, logDetail, "liquid");
                self._handleError(request, modelResponse);
            }
            return false;
        }
    },
    
    _handleResponse: async function (request, responsePkg) {
        if (this.verbose) {
            console.log("_handleResponse called with :", request, responsePkg);
        }

        let formattedResponse = await this._formatResponse(request, responsePkg);

        if (request.applyLocaleCoalesce) {
            formattedResponse = await DataTransformHelper.transformDataToLocaleCoalescedData(formattedResponse, request.originalRequest.requestData);
        }

        if (request.useDataCoalesce) {
            formattedResponse = DataTransformHelper.transformDataToContextCoalescedData(formattedResponse, request.originalRequest.requestData);
        }

        let response = this._createSuccessResponse(request, formattedResponse);
        let utils = SharedUtils.DataObjectFalcorUtil;

        if (utils.compareObjects(request.requestData, this.lastRequest.requestData)) {
            this._setLastResponse(response);
            this._setLastError(null);
            this._setLoading(false);
        }

        let eventDetail = {
            detail: {
                "request": request,
                "response": response
            },
            bubbles: this.bubbles,
            composed: true
        };

        if (this.verbose) {
            //console.log('firing liquid-response event with event detail ', JSON.stringify(eventDetail, null, 4));
            console.log("firing liquid-response event with event detail ", eventDetail);
        }
        this.dispatchEvent(new CustomEvent("response", {
            detail: { "request": request, "response": response },
            bubbles: this.bubbles,
            composed: true
        }));
        this.dispatchEvent(new CustomEvent("liquid-response", {
            detail: { "request": request, "response": response },
            bubbles: this.bubbles,
            composed: true
        }));

        this._discardRequest(request);
        this._addResponseCount();
    },
    
    _handleError: function (request, errorPkg) {
        let errResponse = this._createErrorResponse(request, errorPkg);
        if (this.verbose) {
            Base._error("_handleError called with :", errResponse);
        }
        let utils = SharedUtils.DataObjectFalcorUtil;
        if (utils.compareObjects(request, this.lastRequest)) {
            this._setLastError(errResponse);
            this._setLastResponse(null);
            this._setLoading(false);
        }
        let eventDetail = {
            "request": request,
            "response": errResponse
        };
        if (this.verbose) {
            console.log("firing liquid-error event with event detail ", eventDetail);
        }
        // Tests fail if this goes after the normal this.dispatchEvent('error', ...)
        this.dispatchEvent(new CustomEvent("liquid-error", {
            detail: { "request": request, "response": errResponse },
            bubbles: this.bubbles,
            composed: true
        }));
        this.dispatchEvent(new CustomEvent("error", {
            detail: { "request": request, "response": errResponse },
            bubbles: this.bubbles,
            composed: true
        }));
        this._discardRequest(request);

        this._addResponseCount();
    },
    
    /**
      * Content is not appearing - Content development is under progress.
      */
    removeFalcorKeys: function (obj) {
        for (let prop in obj) {
            if (prop === "$__path") {
                delete obj[prop];
            } else if (typeof obj[prop] === "object") {
                this.removeFalcorKeys(obj[prop]);
            }
        }
    },
    
    _addResponseCount: function () {
        if (!this.excludeInProgress) {
            ProgressTracker.markWorkUnitDone();
        }
    },
    
    _addRequestCount: function () {
        if (!this.excludeInProgress) {
            ProgressTracker.addNewWorkUnit();
        }
    },
    
    _createSuccessResponse: function (request, data) {
        return {
            "status": "success",
            "content": DataHelper.cloneObject(data)
        };
    },
    
    _createErrorResponse: function (request, reason) {

        let errorMessage = "Failed to submit request. Retry after sometime.";
        let errorMessageCode;
        if (reason && reason[0]) {
            let value = reason[0].value;
            if (value) {
                if (value.message) {
                    errorMessage = value.message;
                }
                if (value.messageCode) {
                    errorMessageCode = value.messageCode;
                }
            }
        }

        let result = {
            "status": "error",
            "reason": errorMessage
        };
        if (errorMessageCode) {
            result["errorCode"] = errorMessageCode;
        }
        return result;
    },
    
    _discardRequest: function (request) {
        let requestIndex = this.activeRequests.indexOf(request);
        if (requestIndex > -1) {
            this.splice("activeRequests", requestIndex, 1);
        }
    },
    
    _isDataIndexUpdateRequired: function (reqData) {
        let isDataIndexUpdateRequired = false;
        if (reqData.params && this.dataIndex != "config") {
            let options = DataHelper.isValidObjectPath(reqData, "params.options") ? reqData.params.options : undefined;

            if (typeof options == "undefined" || (options && (typeof options.updateDataIndex == "undefined" || options.updateDataIndex))) {
                isDataIndexUpdateRequired = true;
            }
        }

        return isDataIndexUpdateRequired;
    }
};
/** @polymerBehavior */
RUFBehaviors.LiquidBaseFalcorBehavior = [RUFBehaviors.LiquidBaseBehavior, RUFBehaviors.LiquidBaseFalcorBehaviorImpl];
