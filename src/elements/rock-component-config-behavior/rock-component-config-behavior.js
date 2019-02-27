import '@polymer/polymer/polymer-legacy.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-business-function-behavior/bedrock-component-business-function-behavior.js';
import '../liquid-config-get/liquid-config-get.js';
/*
* <i><b>Content development is under progress... </b></i>
* @demo demo/index.html
* @polymerBehavior RUFBehaviors.ComponentConfigBehavior
*/
window.RUFBehaviors = window.RUFBehaviors || {};

/** @polymerBehavior RUFBehaviors.ComponentConfigBehavior */
RUFBehaviors.ComponentConfigBehaviorImpl = {
    properties: {
        componentConfig: {
            type: Object,
            value: function () {
                return {};
            }
        },
        DEFAULT_CONTEXT_KEY: {
            type: String,
            value: '_DEFAULT'
        }
    },
    requestConfig: function (component, contextData) {
        let configRequest = this._buildConfigRequest(component, contextData);
        this._initiateComponentConfigGetRequest(configRequest);
    },
    onConfigLoaded: function (componentConfig) {
        // This is abstract method and consumer of this behavior need to implement it
    },
    onConfigError: function (detail) {
        // This is abstract method and consumer of this behavior need to implement it
    },
    _buildConfigRequest: function (component, contextData) {

        if (!component) {
            component = this.localName;
        }

        if (_.isEmpty(component)) {
            throw "Component name is not available to fetch component config";
        }

        if (!contextData && this.contextData) {
            contextData = this.contextData;
        }

        let configContext = this._createConfigContext(component, contextData);
        let configId = this._createConfigId(configContext);

        return DataRequestHelper.createConfigGetRequestNew(configId, configContext);
    },
    _createConfigContext: function (component, contextData) {
        let appContext = {};
        let domainContext = {};
        let dataContext = {};
        let valueContext = {};
        let itemContext = {};
        let userContext = {};

        let DEFAULT_CONTEXT_KEY = this.DEFAULT_CONTEXT_KEY;

        if (contextData) {
            appContext = ContextHelper.getFirstAppContext(contextData);
            domainContext = ContextHelper.getFirstDomainContext(contextData);
            dataContext = ContextHelper.getFirstDataContext(contextData);
            valueContext = ContextHelper.getFirstValueContext(contextData);
            itemContext = ContextHelper.getFirstItemContext(contextData);
            userContext = ContextHelper.getFirstUserContext(contextData);
        }

        let domain = domainContext && domainContext.domain ? domainContext.domain : DEFAULT_CONTEXT_KEY;
        let app = appContext && appContext.app ? appContext.app : DEFAULT_CONTEXT_KEY;
        let entityType = itemContext && itemContext.type ? itemContext.type : DEFAULT_CONTEXT_KEY;

        let configContext = {
            "component": component,
            "sysDomain": domain,
            "sysApp": app,
            "sysEntityType": entityType,
            "tenant": userContext && userContext.tenant ? userContext.tenant : DEFAULT_CONTEXT_KEY,
            "domain": domain,
            "app": app,
            "entityType": entityType
        };

        // copy over dataContext keys to config context
        configContext = Object.assign(configContext, dataContext);

        configContext.relationship = itemContext && itemContext.relationship ? itemContext.relationship : DEFAULT_CONTEXT_KEY;
        configContext.sysRelationship = configContext.relationship;

        // copy over value context keys to config context
        configContext = Object.assign(configContext, valueContext);

        configContext.role = userContext && userContext.defaultRole ? userContext.defaultRole : DEFAULT_CONTEXT_KEY,
        configContext.sysRole = configContext.role;
        
        configContext.user = userContext && userContext.user ? userContext.user : DEFAULT_CONTEXT_KEY

        return configContext;
    },
    _createConfigId: function (configContext) {
        let configId = 'x-';
        for (let contextKey in configContext) {
            let contextVal = configContext[contextKey];
            if (!_.isEmpty(contextVal) && contextVal != this.DEFAULT_CONTEXT_KEY) {
                if (configId == 'x-') {
                    configId = configId + contextVal;
                }
                else {
                    configId = configId + "_" + contextVal;
                }
            }
        }

        configId = configId + "_uiConfig";

        return configId;
    },
    _initiateComponentConfigGetRequest: function (configRequest) {
        let liquidCustomElement = customElements.get("liquid-config-get");

        let liquidElement = new liquidCustomElement();

        liquidElement.requestData = configRequest;
        liquidElement.operation = "getbyids";
        liquidElement.addEventListener("response", this._onComponentConfigGetResponse.bind(this));
        liquidElement.addEventListener("error", this._onComponentConfigGetError.bind(this));

        liquidElement.generateRequest();
    },
    _onComponentConfigGetResponse: function (e) {
        if (e.detail) {
            let res = e.detail.response.content;

            if (DataHelper.isValidObjectPath(res, 'configObjects.0.data.contexts.0.jsonData')) {
                let compConfig = res.configObjects[0].data.contexts[0].jsonData;
                if (_.isEmpty(compConfig)) {
                    this._logError("RUF_UI_EMPTY_CONFIG", e);
                    /**
                     * Display Error to User if App Repository Console Is Missing
                     * */
                    if (e.detail.request.requestData.params.query.id.indexOf('x-app-repository') !== -1) {
                        let info = document.getElementById('info');
                        info.hidden = false;
                        info.lastElementChild.innerHTML = "RUF_UI_EMPTY_CONFIG " + e.detail.response.reason;
                        document.getElementById('loader').hidden = true;
                    }
                }
                this.componentConfig = compConfig;
            }

            //get data function properties
            let dataFunctionProperties = {};
            if(this.isPartOfBusinessFunction) {
                dataFunctionProperties = this.getDataFunctionProperties();
            }

            //Based on loaded props key set the component props
            if (this.componentConfig && this.componentConfig.config && !_.isEmpty(this.componentConfig.config.properties)) {
                let properties = this.componentConfig.config.properties;
                for(let propertyKey in properties) {
                    let key = DataHelper.convertCamelCaseStringFromHyphenated(propertyKey);
                    if(!dataFunctionProperties.hasOwnProperty(key)) {
                        this.set(propertyKey, properties[propertyKey]);
                    }
                }
            }

            this.onConfigLoaded(this.componentConfig);
        }
    },
    _logError: function (msg, e) {
        if (DataHelper.isValidObjectPath(e.detail, 'request.requestData.requestId')) {
            let logDetail = {
                "request": e.detail.request.requestData,
                "requestId": e.detail.request.requestData.requestId,
                "reason": e.detail.response.reason
            };
            RUFUtilities.Logger.error(msg, logDetail, "ui-config-manager");
        }
    },

    _onComponentConfigGetError: function (e) {
        if (e.detail) {
            this.logError("RUF_UI_CONFIG_GET_EXCEPTION", e.detail);
            this.onConfigError(e.detail);
        }
    }
};

/** @polymerBehavior */
RUFBehaviors.ComponentConfigBehavior = [RUFBehaviors.LoggerBehavior, RUFBehaviors.UIBehavior, RUFBehaviors.ComponentBusinessFunctionBehavior, RUFBehaviors.ComponentConfigBehaviorImpl];
