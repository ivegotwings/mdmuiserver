import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/element-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../rock-entity-lov/rock-entity-lov.js';
import '../liquid-config-get/liquid-config-get.js';
import '../liquid-config-save/liquid-config-save.js';
import ContextModelManager from '../bedrock-managers/context-model-manager.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockContextSelector
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior,
        RUFBehaviors.ComponentConfigBehavior
    ], OptionalMutableData(PolymerElement)) {
    static get template() {
        return html`
        <style include="bedrock-style-common">
            :host {
                display: block;
                width: 100%;

                --item-length-overflow: {
                    word-break: break-word;
                }
            }

            #listPopover {
                @apply --dimesion-selector-container-popover;
            }

            #sourcePopover {
                @apply --dimesion-selector-source-popover;
            }

            #localePopover {
                @apply --dimesion-selector-locale-popover;
            }

            pebble-popover {
                --pebble-popover-width: 260px;
            }

            .btn.dropdownText {
                display: flex;
                align-items: center;

                --pebble-button: {
                    font-weight: var(--font-medium, 500);
                    color: var(--palette-cerulean-two, #026bc3);
                    padding-top: 0px;
                    padding-right: 0px;
                    padding-bottom: 0px;
                    padding-left: 0px;
                    width: 100%;
                }

                --pebble-button-right-icon: {
                    margin-right: 5px;
                }

                --pebble-icon-color: {
                    fill: var(--palette-cerulean-two, #026bc3);
                }
            }

            .dimension-wrap {
                display: flex;
                justify-content: flex-end;
                flex: 1;
            }

            .widget-item-wrap {
                min-width: 100px;
                max-width: 50%;
            }

            pebble-button {
                width: 100%;

                --paper-button-text: {
                    max-width: 100%;
                }
            }
        </style>
        <div class="dimension-wrap">
            <template is="dom-repeat" items="[[_contextToBeRendered]]" as="ctx">
                <div id="[[ctx.id]]" hidden\$="[[ctx.hidden]]" class="widget-item-wrap">
                    <div>
                        <pebble-button id="[[ctx.id]]-toggle-button" popover="[[ctx.id]]-popover" lov="[[ctx.id]]-lov" icon="[[ctx.icon]]" button-text="[[ctx.title]]" class="dropdownText dropdownIcon btn dropdown " noink="" raised="" no-overlap="" vertical-offset="-211" horizontal-offset="11" dropdown-icon="" on-tap="_onToggleButtonTap" disabled\$="[[ctx.readonly]]">
                        </pebble-button>
                    </div>
                    <pebble-popover title="[[ctx.title]]" id="[[ctx.id]]-popover" for="[[ctx.id]]-toggle-button" no-overlap="" horizontal-align="[[horizontalAlign]]">
                        <rock-entity-lov id="[[ctx.id]]-lov" r-data="[[ctx]]" readonly="[[readonly]]" config-data-item-id="[[ctx.id]]" lazy-loading-disabled="[[_disableLazyLoad(ctx)]]" id-field="[[ctx.dataMappings.id]]" title-pattern="[[ctx.dataMappings.title]]" sub-title-pattern="[[ctx.dataMappings.subtitle]]" no-sub-title="[[_noSubtitle(ctx)]]" request-data="[[ctx.dataRequest]]" selected-items="[[_getSelectedItems(ctx.selectedItem, _contextToBeRendered)]]" selected-item="[[_getSelectedItem(ctx.selectedItem, _contextToBeRendered)]]" external-data-formatter="[[_entityExternalDataFormatter]]" type-field="[[ctx.dataMappings.type]]" sort-field="[[ctx.dataMappings.sort]]" enable-select-all="[[enableSelectAll]]" multi-select="[[!allSingleSelect]]" show-action-buttons="" allow-favourites="[[_allowFavourites(ctx)]]"></rock-entity-lov>
                    </pebble-popover>
                    <bedrock-pubsub event-name="entity-lov-confirm-button-tap" handler="_onEntityLovConfirmButtonTapped" target-id="[[ctx.id]]-lov"></bedrock-pubsub>
                    <bedrock-pubsub event-name="entity-lov-close-button-tap" handler="_onEntityLovCloseButtonTapped" target-id="[[ctx.id]]-lov"></bedrock-pubsub>
                    <bedrock-pubsub event-name="entity-lov-favourite-icon-tapped" handler="_onEntityLovFavouriteIconTapped" target-id="[[ctx.id]]-lov"></bedrock-pubsub>
                </div>
            </template>
        </div>
        <bedrock-pubsub event-name="refresh-context-selector" handler="refresh"></bedrock-pubsub>
        <liquid-entity-model-get id="entityModelGet" operation="getbyids" request-data="{{_entityModelRequest}}" on-response="_onEntityModelGetResponse" on-error="_onEntityModelGetError"></liquid-entity-model-get>
        <liquid-rest id="entityContextGet" url="/data/pass-through/entityservice/getcontext" method="POST" request-data="{{_entityContextRequest}}" on-liquid-response="_onEntityContextGetResponse" on-liquid-error="_onEntityContextGetError" exclude-in-progress=""></liquid-rest>
        <liquid-rest id="preselectedContextGet" url="/data/pass-through/entityservice/get" method="POST" request-data="{{_preselectedContextRequest}}" on-liquid-response="_onPreselectedContextGetResponse" on-liquid-error="_onPreselectedContextGetGetError" exclude-in-progress=""></liquid-rest>
        <liquid-config-get id="liqInitFavouriteContextsSearch" operation="initiatesearch" request-data="{{favouriteContextsGetRequest}}" last-response="{{favouriteContextsInitSearchResponse}}" on-response="_onFavouriteContextsInitSearchResponse"></liquid-config-get>
        <liquid-config-get id="liqFavouriteContextsGetSearchResultDetail" operation="getsearchresultdetail" on-response="_onFavouriteContextsGetSearchResultDetailResponse"></liquid-config-get>
        <liquid-config-save id="favouriteContextsSave" request-data="[[favouriteContextsSaveRequest]]" on-response="_onFavouriteContextsSaveResponse" on-error="_onFavouriteContextsSaveError"></liquid-config-save>
`;
    }

    static get is() {
        return 'rock-context-selector';
    }
    static get properties() {
        return {
            appName: {
                type: String,
                value: ""
            },

            domain: {
                type: String,
                value: ""
            },

            contextData: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            /**
            * Indicates the list of items which you must place in the dimension selector component.
            */
            configData: {
                type: Array,
                value: function () {
                    return [];
                }
            },
            /**
            * If set as true , it indicates the component is in read only mode
            */
            readonly: {
                type: Boolean,
                value: false
            },

            /**
            * Indicates the selected values of all dimensions in the dimension selector.
            */
            selectedDimensions: {
                type: Object,
                notify: true,
                value: function () {
                    return {};
                }
            },
            /**
            * <b><i>Content development is under progress... </b></i>
            */
            allMultiSelect: {
                type: Boolean,
                value: false
            },
            allSingleSelect: {
                type: Boolean,
                value: false
            },
            entityId: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            entityType: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            _default: {
                type: Array,
                value: [{
                    "id": "default",
                    "title": "default",
                    "type": "default"
                }]
            },
            _preselectedContextRequest: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            _contextHierarchy: {
                type: Array,
                value: function () {
                    return [];
                }
            },
            _entityContextRequest: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            _entityContexts: {
                type: Array,
                value: function () {
                    return [];
                }
            },
            _currentContexts: {
                type: Array,
                value: function () {
                    return [];
                }
            },
            _previousRootCtxValue: {
                type: Array,
                value: function () {
                    return [];
                }
            },
            _currentContextSelector: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            selectedDimensionsDetail: {
                type: Object,
                notify: true,
                value: function () {
                    return {};
                },
                observer: "selectedDimensionsDetailChanged"
            },
            navigationData: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            favouriteContexts: {
                type: Array,
                value: function () {
                    return [];
                }
            },
            favouriteContextsGetRequest: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            favouriteContextsSaveRequest: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            favouriteContextsExist: {
                type: Boolean,
                value: false
            },
            favouriteContextsConfig: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            favouriteContextsInitSearchResponse: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            enableSelectAll: {
                type: Boolean,
                value: false
            },
            preSelectedContexts: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            _rootContextChanged: {
                type: Boolean,
                value: false
            },
            _isFirstContextLoad: {
                type: Boolean,
                value: true
            },
            _entityContextsModified: {
                type: Boolean,
                value: false
            }
        }
    }

    static get observers() {
        return [
            '_prepareContext(appName, domain, entityType)',
            '_configChanged(configData, entityType, domain)'
        ]
    }

    selectedDimensionsDetailChanged(dimensionData) {
        let _contextToBeRendered = this._contextToBeRendered;
        if (!_.isEmpty(dimensionData)) {
            _contextToBeRendered.forEach(element => {
                if (!_.isEmpty(element) && element.dataMappings && !_.isEmpty(element.dataMappings.type)) {
                    let types = element.dataMappings.type;
                    types.forEach(type => {
                        if (!_.isEmpty(dimensionData[type])) {
                            let selectedItem = {
                                "id": dimensionData[type][0].id,
                                "title": dimensionData[type][0].title,
                                "type": dimensionData[type][0].type
                            }
                            element.selectedItem = selectedItem;
                        }
                    })
                }
            });
            this._contextToBeRendered = [];
            this.set("_contextToBeRendered", _contextToBeRendered);
            this._updateSelectedDimensions();
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }
    connectedCallback() {
        super.connectedCallback();
    }

    _prepareContext() {

        let context = DataHelper.cloneObject(this.contextData);

        if (!_.isEmpty(this.entityType)) {
            context[ContextHelper.CONTEXT_TYPE_ITEM] = [{
                "type": this.entityType
            }];
        }

        if (!_.isEmpty(this.appName) && !_.isEmpty(this.domain)) {
            context[ContextHelper.CONTEXT_TYPE_APP] = [{
                "app": this.appName
            }];

            context[ContextHelper.CONTEXT_TYPE_DOMAIN] = [{
                "domain": this.domain
            }];

            if (!_.isEmpty(context)) {
                /**
                * If the app is entity-manage, then along with domain, entitytype as well mandatory
                * for context-selector to load. So in that case, waiting for entitytype as well
                * to come so that each LOV won't render twice once when domain comes and 2nd when
                * entity type comes.
                * TODO: Having app specific code in context-selector isn't looking good. Need to
                * find solution for this problem.
                * */
                if (this.appName !== "app-entity-manage") {
                    this.requestConfig('rock-context-selector', context);
                } else if (!_.isEmpty(this.entityType)) {
                    this.requestConfig('rock-context-selector', context);
                }
            }
        }
    }


    refresh(e) {
        if (e && e.detail) {
            let data = e.detail;
            if (data && data && data.newlyAddedContexts) {
                this.selectNewlyAddedContext(data.newlyAddedContexts);
            }
        }
        this._entityContextsModified = true;
        this._createContextGetRequest(this.entityId, this.entityType);
    }

    selectNewlyAddedContext(selectedItemData) {
        let contextEl = this.shadowRoot.querySelector("#context-lov");
        if (contextEl) {
            contextEl.selectedItems = selectedItemData;
            let currentContext = this._contextToBeRendered;
            let contextObj = currentContext.filter(contextItem => {
                if (contextItem.id == "context") {
                    return contextItem
                }
            })
            contextObj[0].selectedItem = selectedItemData;
        }
    }

    async onConfigLoaded(componentConfig) {
        if (componentConfig && componentConfig.config) {
            let configData = DataHelper.convertObjectToArray(componentConfig.config);

            if (!_.isEmpty(this.dynamicDimensionsConfig)) {
                configData = this._prepareConfigForDynamicDimensions(configData);
            }
            let localeManager = ComponentHelper.getLocaleManager();
            let defaultValContext = DataHelper.getDefaultValContext();
            if (defaultValContext && defaultValContext.locale) {
                await localeManager.getByNameAsync(defaultValContext.locale);
            }
            this.configData = {};
            this.set('configData', configData);
        } else {
            this.logError(this.appName + "-Context Selector - config is not available for rock-context-selector", componentConfig, true);
        }
    }

    _prepareConfigForDynamicDimensions(configData) {
        if (this.dynamicDimensionsConfig) {
            let selectedDimensions = this.dynamicDimensionsConfig.selectedDimensions;
            let readonlyDimensions = this.dynamicDimensionsConfig.readonlyDimensions;
            let contextDimensions = this.dynamicDimensionsConfig.contextDimensions;

            for (let i = 0; i < configData.length; i++) {
                //Attribute mappings selected dimensions
                if (selectedDimensions) {
                    let selectedDimension = selectedDimensions[configData[i].id];
                    if (!_.isEmpty(selectedDimension)) {
                        configData[i].selectedItem = {
                            "id": selectedDimension[0],
                            "title": selectedDimension[0],
                            "type": configData[i].id
                        }
                    }
                }

                //Readonly dimensions
                if (readonlyDimensions.indexOf(configData[i].id) != -1) {
                    configData[i].readonly = true;
                }
            }

            //Additional dimensions
            if (contextDimensions) {
                for (let i = 0; i < contextDimensions.length; i++) {
                    configData.push(this._prepareContextTemplate(contextDimensions[i]));
                }
            }
        }

        return configData
    }

    _prepareContextTemplate(context) {
        return {
            "id": context,
            "title": context,
            "icon": "pebble-icon:hierarchy",
            "visible": true,
            "hidden": false,
            "contextType": "data",
            "default": ""
        }
    }

    _configChanged(configData, entityType, domain) {
        this.entityType = entityType;
        if (configData && configData.length) {
            // prepare for config get to get favourite contexts for this user.
            this._getFavouriteContexts();
            if (domain) {
                this._domainChanged(domain);
            }
        }
    }

    _entityTypeChanged(entityType) {
        if (!_.isEmpty(entityType)) {
            this._createContextGetRequest(this.entityId, entityType);
        }
    }

    _domainChanged(domain) {
        if (!_.isEmpty(domain)) {
            this._processContextModel(domain);
        }
    }

    async _processContextModel(domain) {
        this._contextHierarchyInfo = await ContextModelManager.getContextHeirarchyInfoBasedOnDomain(domain);

        if (!_.isEmpty(this._contextHierarchyInfo)) {
            this._contextHierarchyInfo.forEach(function (ctx) {
                if (ctx.contextKey && this._contextHierarchy.indexOf(ctx.contextKey) < 0) {
                    this._contextHierarchy.push(ctx.contextKey);
                }
            }, this);
        }

        let ctxIds = [];
        if (this.configData && this.configData.length) {
            let _self = this;
            let itemsToBeRemoved = [];
            for (let idx = 0; idx < this.configData.length; idx++) {
                let item = this.configData[idx];
                let types;
                if (item.id === "context") {
                    types = await ContextModelManager.getContextTypesBasedOnDomain(domain);
                } else {
                    types = [item.id];
                }

                item.dataMappings = item.dataMappings || {};
                item.dataMappings["type"] = types;
                if (!_.isEmpty(types)) {
                    types.forEach(function (type) {
                        if (!_.isEmpty(this.preSelectedContexts) && !_.isEmpty(this.preSelectedContexts[type])) {
                            item.selectedItem = this.preSelectedContexts[type][0];
                        }
                        ctxIds.push(type + "_entityManageModel");

                        if (_self._contextHierarchy.indexOf(type) < 0) {
                            _self._contextHierarchy.push(type);
                        }
                    }, this);
                } else {
                    itemsToBeRemoved.push(item);
                    this.logError(this.appName + "-Context Selector - types not defined for " + item.id + " in context model");
                }
            }
            /**
             * any dimension is defined in config but the types of the dimension
             * is not defined, deleting from the config data inorder not to render that
             * dimension and render remaining dimensions in context-selector
             * */
            if (!_.isEmpty(itemsToBeRemoved)) {
                let remainingConfigs = this.configData.filter(config => {
                    let isFound = itemsToBeRemoved.find(item => { return item.id == config.id });
                    if (!isFound) {
                        return config;
                    }
                });
                this.set("configData", remainingConfigs);
            }
        }

        if (ctxIds && ctxIds.length) {
            this._entityModelRequest = {
                "params": {
                    "query": {
                        "ids": ctxIds,
                        "filters": {
                            "typesCriterion": [
                                "entityManageModel"
                            ]
                        }
                    },
                    "fields": {
                        "attributes": [
                            "_ALL"
                        ],
                        "relationships": [
                            "_ALL"
                        ],
                        "relationshipAttributes": [
                            "_ALL"
                        ]
                    }
                }
            };

            let entityModelGetComponent = this.$$("#entityModelGet");

            if (entityModelGetComponent) {
                entityModelGetComponent.generateRequest();
            } else {
                this.logError(this.appName + "-Context Selector - Entity model get liquid not found");
            }
        }
    }

    _onEntityModelGetResponse(e) {
        if (DataHelper.isValidObjectPath(e, "detail.response.content.entityModels") && !_.isEmpty(e.detail.response.content.entityModels)) {
            this._prepareDynamicConfigBasedOnModelForContextsToBeRendered(e.detail.response.content.entityModels);
        } else {
            this.logError(this.appName + "-Context Selector - Entity Model get response exception", e.detail, true);
        }
    }

    _onEntityModelGetError(e) {
        this.logError(this.appName + "-Context Selector - Entity Model get exception", e.detail, true);
    }

    _prepareDynamicConfigBasedOnModelForContextsToBeRendered(entityModels) {
        if (entityModels && entityModels.length) {
            let ctxs = {};
            this.configData.forEach(function (item) {
                let ctxKey = item.id;
                let ctxExtName = item.title;
                let types = item.dataMappings.type;
                let reqData = {
                    "params": {
                        "query": {
                            "filters": {
                                "typesCriterion": item.dataMappings.type
                            },
                            "valueContexts": []
                        },
                        "fields": {
                            "attributes": ['_ALL']
                        }
                    }
                };

                let modelId = types[0] + "_entityManageModel";
                let entityModel = entityModels.find(model => model.id == modelId);

                reqData.params.query.valueContexts.push(DataHelper.getDefaultValContext());

                let ctxToBeLoaded = this._contextDataToBeLoaded(types);
                let externalAttrName = undefined;
                if (item.dataMappings.title) {
                    let titleFields = DataHelper.getAttributesBetweenCurlies(item.dataMappings.title);
                    if (!_.isEmpty(titleFields)) {
                        externalAttrName = titleFields[0];
                    }
                } else {
                    let externalNameAndExternalNameAttr = AttributeHelper.getExternalNameAndExternalNameAttr(entityModel);

                    if (externalNameAndExternalNameAttr) {
                        externalAttrName = externalNameAndExternalNameAttr.externalNameAttr;
                    } else {
                        this.logError(this.appName + "-Context Selector - None of the attributes in the model " + modelId + " marked with 'isExternalName' flag", entityModel);
                    }
                }

                if (ctxToBeLoaded && ctxToBeLoaded.length && (ctxToBeLoaded.length == 1 && ctxToBeLoaded[0] != "_ALL")) {
                    let attributesCriterion = [];
                    if (externalAttrName) {
                        let attrCriterion = {};
                        attrCriterion[externalAttrName] = {
                            "exacts": ctxToBeLoaded
                        }
                        attributesCriterion.push(attrCriterion);
                        reqData.params.query.filters.attributesCriterion = attributesCriterion;
                    }
                }

                let titlePattern = externalAttrName ? "{entity.attributes." + externalAttrName + "}" : "{entity.name}";
                let subtitlePattern = "typeExternalName";
                let mappedValueContexts = this._getMappedValueContextsBasedOnCtxType(types[0]);

                ctxs[ctxKey] = {
                    "id": ctxKey,
                    "title": ctxExtName,
                    "ctxName": ctxKey,
                    "externalAttrName": externalAttrName,
                    "dataRequest": reqData,
                    "mappedValueContexts": mappedValueContexts,
                    "icon": item.icon,
                    "hidden": item.hidden,
                    "contextType": item.contextType,
                    "dataMappings": {
                        "id": "name",
                        "title": titlePattern,
                        "subtitle": subtitlePattern,
                        "type": types,
                        "sort": titlePattern
                    },
                    "selectedItem": item.selectedItem
                };

            }, this);

            this._renderContextSelector(ctxs);
        }
    }

    _addDependentRelatinoshipBasedOnType(reqData, type) {
        let mappedValueContexts = this._getMappedValueContextsBasedOnCtxType(type);

        if (mappedValueContexts) {
            let dependentRelationships = mappedValueContexts.map(v => v.valueContextRelationship);

            if (dependentRelationships) {
                reqData.params.fields.relationships = dependentRelationships;
                reqData.params.fields.relationshipAttributes = [this._getDefaultSelectedAttrName()];
            }
        }
    }

    _renderContextSelector(ctxs) {
        let parsedContexts = [];
        if (!_.isEmpty(ctxs)) {
            Object.keys(ctxs).forEach(function (ctxKey) {
                if (ctxs[ctxKey]) {
                    parsedContexts.push(ctxs[ctxKey]);
                }
            }, this);
        }

        this._parsedContexts = parsedContexts;
        /**
        * If entitytype is present need to wait until entity current contexts are recieved 
        * to request only for those contexts.
        * If there are any preselectedContexts on load as well we need to wait until we recieve 
        * those context details to reduce multiple times redering of context-selector
        * */

        if (!_.isEmpty(this.entityType)) {
            this._entityTypeChanged(this.entityType);
            return;
        }
        if (!this._checkPreselectedContextOnLoad(parsedContexts)) {
            this._contextToBeRendered = undefined;
            this._contextToBeRendered = parsedContexts;
            this._updateSelectedDimensions();
        }
    }

    _contextDataToBeLoaded(types) {
        let ctxValue = [];
        if (!_.isEmpty(types) && !_.isEmpty(this._contexts)) {
            types.forEach(function (contextKey) {
                for (let i = 0; i <= this._contexts.length; i++) {
                    if (this._contexts[i] && this._contexts[i][contextKey]) {
                        let ctx = this._contexts[i][contextKey];
                        if (Array.isArray(ctx)) {
                            ctx.forEach(function (item) {
                                if (ctxValue.indexOf(item) < 0) {
                                    ctxValue.push(item);
                                }
                            }, this);
                        } else {
                            if (ctx.toLowerCase() == "_all") {
                                ctxValue = ["_ALL"];
                                break;
                            } else {
                                if (ctxValue.indexOf(ctx) < 0) {
                                    ctxValue.push(ctx);
                                }
                            }
                        }
                    }
                }
            }, this);
        }
        return ctxValue;
    }

    _checkPreselectedContextOnLoad(parsedContexts) {
        if (parsedContexts && parsedContexts.length) {
            let firstContext = parsedContexts[0];
            if (firstContext && firstContext.mappedValueContexts
                && firstContext.selectedItem && firstContext.selectedItem.title) {
                //generate request.
                let firstContextRequest = DataHelper.cloneObject(firstContext.dataRequest);
                if (DataHelper.isValidObjectPath(firstContextRequest, "params.query")) {
                    firstContextRequest.params.query.name = firstContext.selectedItem.title;
                    delete firstContextRequest.params.query.filters.attributesCriterion;
                    firstContextRequest.params.query.filters.excludeNonContextual = true;
                    this.set("_preselectedContextRequest", firstContextRequest);
                    let preselectedContextGet = this.shadowRoot.querySelector("#preselectedContextGet")
                    if (preselectedContextGet) {
                        preselectedContextGet.generateRequest();
                        return true;
                    }
                } else {
                    firstContext.selectedItem = {};
                }
            }
        }

        return false;
    }

    _getMappedValueContextsBasedOnCtxType(currentContextType) {
        if (currentContextType) {
            let globalCtxInfo = this._contextHierarchyInfo && this._contextHierarchyInfo.find(v => v.contextKey == currentContextType);
            if (globalCtxInfo && globalCtxInfo.mappedValueContexts) {
                return globalCtxInfo.mappedValueContexts
            }
        }
    }

    _getSelectedItems(selectedItem) {
        // Todo.. This is not a correct code lov must support selectedid

        if (!_.isEmpty(selectedItem)) {
            if (Array.isArray(selectedItem)) {
                return selectedItem;
            }
            let formattedSelectedItems = [];
            let formattedSelectedItem = {};

            formattedSelectedItem["id"] = selectedItem.id ? selectedItem.id : this._default.id;
            formattedSelectedItem["title"] = selectedItem.title ? selectedItem.title : this._default.title;
            formattedSelectedItem["type"] = selectedItem.type ? selectedItem.type : this._default.type;
            if (selectedItem.relTo) {
                formattedSelectedItem["relTo"] = selectedItem.relTo;
            }

            if (selectedItem.type == "locale") {
                let _localeObj = ComponentHelper.getLocaleManager().getByName(selectedItem.id);
                if (!_.isEmpty(_localeObj) && _localeObj.externalName) {
                    formattedSelectedItem["title"] = _localeObj.externalName;
                }
            }

            formattedSelectedItems.push(formattedSelectedItem);

            return formattedSelectedItems
        }
    }

    _getSelectedItem(selectedItem) {
        if (this.allSingleSelect) {
            let selectedItems = this._getSelectedItems(selectedItem);
            if (!_.isEmpty(selectedItems)) {
                return selectedItems[0];
            }
        }

        return {};
    }

    _disableLazyLoad(context) {
        if (context.contextType === "data") {
            return true;
        }

        return false;
    }

    _getDefaultSelectedAttrName() {
        return "isDefault";
    }

    _onToggleButtonTap(event) {
        if (typeof (event.currentTarget) !== "undefined") {
            if (event.currentTarget.disabled == true) {
                return;
            }
            this._currentContextSelector = event.currentTarget;

            this._toggleLovPopover(this._currentContextSelector.popover);
        }
    }

    _toggleLovPopover(popoverId) {
        let currentPopover = this.shadowRoot.querySelector("#" + popoverId);
        if (!_.isEmpty(currentPopover)) {
            if (!currentPopover.opened) {
                currentPopover.show();
            } else {
                currentPopover.hide();
            }
        }
    }

    _onEntityLovConfirmButtonTapped(event) {
        this._isFirstContextLoad = false;
        this._currentLovEvent = event;
        let isContextChangedManually = false;
        if(DataHelper.isValidObjectPath(event, "detail.data.id") && event.detail.data.id === "context-lov") {
            isContextChangedManually = true;
        }
        this._updateSelectedDimensions(isContextChangedManually);
        this._toggleLovPopover(this._currentContextSelector.popover);
    }

    _onEntityLovCloseButtonTapped() {
        this._toggleLovPopover(this._currentContextSelector.popover);
    }

    _noSubtitle(context) {
        if (context.contextType === "value") {
            return true;
        }

        return false;
    }

    _updateSelectedDimensions(isContextChangedManually) {
        Debouncer.debounce(this._debouncer, timeOut.after(500), () => {
            this._setSelectedDimensions(isContextChangedManually);
            this._updateCurrentContextState();
        });
    }

    _setSelectedDimensions(isContextChangedManually) {
        //On page refresh set from navigationData
        let defaultDimensions = [];
        if (!_.isEmpty(this.navigationData) && this._isFirstContextLoad) {
            if(!_.isEmpty(this.entityId) && !_.isEmpty(this._contextHierarchyInfo)) {
                let _self = this;
                this._contextHierarchyInfo.forEach(function(ctxInfo) {
                    let ctxKey = ctxInfo.contextKey;
                    if(!_.isEmpty(this.navigationData[ctxKey])) {
                        this.navigationData[ctxKey] = this.navigationData[ctxKey].reduce(function(prev, next) {
                            if(_self._isItemExistsInCurrentContexts(next, _self._entityContexts)) {
                                prev.push(next);
                            }
                            return prev;
                        }, []);
                    }
                }, this);
            }
            defaultDimensions = this.navigationData;
        }

        let selectedDimensions = {};
        let configData = this._contextToBeRendered;
        if (typeof (configData) !== "undefined") {
            for (let i = 0; i < configData.length; i++) {
                let configDataItem = configData[i];
                let rockLov = undefined;
                let rockContainer = this.shadowRoot.querySelector("#" + configDataItem.id);

                if (rockContainer) {
                    rockLov = rockContainer.querySelector("rock-entity-lov");

                    if (rockLov) {
                        const { dataMappings } = configDataItem;
                        let entityTypes = dataMappings && dataMappings.type;

                        if (entityTypes) {
                            for (let j = 0; j < entityTypes.length; j++) {
                                let ctxKey = entityTypes[j];
                                /**
                                 * when there is only one locale selected and if user unselects that too
                                 * value context will be without any locale. Hence setting default selecteditem
                                 * coming from config. Setting only when contextType is "value" because 
                                 * dataContext is optional but valueContext is mandatory
                                 * */
                                this._setDefaultSelectedItem(configDataItem, rockLov);
                                if (!rockLov.multiSelect) {
                                    let selectedItem = !_.isEmpty(rockLov.selectedItem) ? rockLov.selectedItem : undefined;
                                    let selectedItems = !_.isEmpty(rockLov.selectedItems) ? rockLov.selectedItems : undefined;
                                    if (selectedItems) {
                                        if (!_.isEmpty(configDataItem.selectedItem)) {
                                            let defaultSelectedItem = selectedItems.find(v => v.id == configDataItem.selectedItem.id);

                                            if (!_.isEmpty(defaultSelectedItem)) {
                                                defaultSelectedItem.entityId = configDataItem.selectedItem.entityId;
                                                rockLov.selectedItems = selectedItems;
                                            }
                                        }
                                        rockLov.selectedItem = selectedItem ? selectedItem : selectedItems[0];
                                    }

                                    let itemId;
                                    let item;
                                    if (rockLov.selectedItem && rockLov.selectedItem.type === ctxKey) {
                                        item = rockLov.selectedItem;
                                        itemId = this._getItemId(rockLov.selectedItem);
                                    }
                                    selectedDimensions[ctxKey] = itemId ? [itemId] : [];
                                    this.selectedDimensionsDetail[ctxKey] = item ? [item] : [];
                                } else {
                                    //Set from navigationData
                                    if (!_.isEmpty(defaultDimensions) && defaultDimensions[ctxKey] && !_.isEmpty(defaultDimensions[ctxKey])) {
                                        rockLov.selectedItems = this._getDefaultSelectedItems(ctxKey, configDataItem.contextType, defaultDimensions, rockLov.selectedItems);
                                    }
                                    let selectedItems = rockLov.selectedItems;
                                    let type = entityTypes[j];
                                    let items = selectedItems ? selectedItems.filter(item => item.type === type) : undefined;
                                    let selectedIds = this._getItemsIdsByType(items, type);
                                    selectedDimensions[ctxKey] = selectedIds;
                                    this.selectedDimensionsDetail[ctxKey] = items;
                                }
                            }
                        }

                        this._setLovTitle(rockLov);
                    }
                }
                // this._updateToggleButtonText(configDataItem, rockLov);
            }

            let eventDetail = {
                'dimensions': selectedDimensions
            };
            if (DataHelper.isValidObjectPath(this._currentLovEvent, "detail.data.id")) {
                eventDetail.currentLovId = this._currentLovEvent.detail.data.id;
            }
            eventDetail.selectedDimensionsDetail = this.selectedDimensionsDetail;

            if (this.selectedDimensions && selectedDimensions) {
                if (DataHelper.compareObjects(this.selectedDimensions, selectedDimensions)) {
                    return true;
                }
            }
            this.set("selectedDimensions", selectedDimensions);
            if(isContextChangedManually) {
                let contextLov = this.shadowRoot.querySelector("#context-lov");
                let noOfSelectedContexts = contextLov.selectedItems ? contextLov.selectedItems.length : 0;
                if(contextLov && noOfSelectedContexts < 2 && contextLov.rData && !_.isEmpty(contextLov.rData.mappedValueContexts)) {
                    let valCtxType = contextLov.rData.mappedValueContexts[0].valueContext;
                    this.selectedDimensions[valCtxType] = [];
                    return;
                }
            }
            Debouncer.debounce(this._debouncer, timeOut.after(500), () => {
                this.fireBedrockEvent("context-selector-data-changed", eventDetail);
            });
        }
    }

    _setDefaultSelectedItem(configDataItem, rockLov) {
        if (configDataItem.contextType === "value") {
            let defaultSelectedItem = this._getSelectedItem(configDataItem.selectedItem);
            if ((rockLov.multiSelect && _.isEmpty(rockLov.selectedItems)) ||
                (!rockLov.multiSelect && _.isEmpty(rockLov.selectedItem))) {
                rockLov.selectedItems = [defaultSelectedItem];
                rockLov.selectedItem = defaultSelectedItem;
            }
        }
    }

    _getItemsIdsByType(items, type) {
        let itemsIds = [];
        if (items) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].type === type) {
                    let itemId = this._getItemId(items[i]);
                    if (!_.isEmpty(itemId)) {
                        itemsIds.push(itemId);
                    }
                }
            }
        }
        return itemsIds;
    }

    _getItemId(item) {
        if (item) {
            let itemId = this.get("id", item);

            if (itemId === undefined || itemId === null) {
                itemId = ""; // Could be -1 or ""?
            }

            return itemId;
        }
    }

    _setLovTitle(currentRockLov) {
        if (!currentRockLov) {
            return;
        }

        let currentDimensionButtonId = currentRockLov.id.replace("-lov", "-toggle-button");

        if (currentDimensionButtonId) {
            let currentDimensionButton = this.shadowRoot.querySelector("#" + currentDimensionButtonId);
            let toolTip = "";
            if (currentDimensionButton) {
                if (currentRockLov.multiSelect) {
                    if (!_.isEmpty(currentRockLov.selectedItems)) {
                        if (currentRockLov.selectedItems.length > 1) {
                            currentRockLov.selectedItems.forEach(function (item) {
                                if (_.isEmpty(toolTip)) {
                                    toolTip = item.title;
                                } else {
                                    toolTip = toolTip + ", " + item.title;
                                }
                            }, this);
                            toolTip = toolTip.trim(',');
                        } else {
                            toolTip = currentRockLov.selectedItems[0].title;
                        }
                    } else {
                        toolTip = currentRockLov.parentElement.title;
                    }
                } else {
                    if (!_.isEmpty(currentRockLov.selectedItem)) {
                        toolTip = currentRockLov.selectedItem.title;
                    } else {
                        toolTip = currentRockLov.parentElement.title;
                    }
                }
            }

            currentDimensionButton.buttonText = toolTip;
            currentDimensionButton.setAttribute("title", toolTip);
        }
    }

    _updateCurrentContextState() {
        if (!_.isEmpty(this.selectedDimensions)) {

            // Get context(s) based on selected dimension
            let isRootContextChanged = this._isRootContextChanged();
            this.set("_rootContextChanged", isRootContextChanged);
            let dependentLovRelationships = {};
            let selectedCtxIds = {};
            this.configData.forEach(function (item) {
                let ctxKey = item.id;
                let lovElement = this.$$('#' + ctxKey + '-lov');
                if (lovElement && lovElement.rData) {
                    let ctxData = lovElement.rData;
                    let ctxTypes = ctxData.dataMappings.type;
                    if (ctxData && ctxData.contextType == "data") {
                        if (this._entityContextsModified) {
                            let parsedContext = !_.isEmpty(this._contextToBeRendered) ? this._contextToBeRendered.find(obj => obj.id === ctxKey) : undefined;
                            if (parsedContext && !_.isEmpty(parsedContext.dataRequest)) {
                                lovElement.requestData = parsedContext.dataRequest;
                                lovElement.reset();
                            }
                            this._entityContextsModified = false;
                        }
                        for (let i = 0; i < ctxTypes.length; i++) {
                            let ctxType = ctxTypes[i];
                            let itemIdx = this._contextHierarchy.indexOf(ctxType);

                            let selectedItems = lovElement.multiSelect ? lovElement.selectedItems : lovElement.selectedItem ? [lovElement.selectedItem] : [];

                            if (!_.isEmpty(selectedItems)) {
                                let ids = [];
                                selectedItems.forEach((selectedItem) => {
                                    if (ctxType == selectedItem.type) {
                                        let entityId = selectedItem.entityId ? selectedItem.entityId : item.selectedItem.entityId;

                                        if (!_.isEmpty(entityId)) {
                                            ids.push(entityId);
                                        }
                                    }
                                });

                                if (!_.isEmpty(ids)) {
                                    selectedCtxIds[ctxType] = ids;
                                }
                            }
                        }
                    }
                }
            }, this);

            let localeLovButton = this.shadowRoot.querySelector("#locale-toggle-button");

            if (localeLovButton) {
                localeLovButton.disabled = true;
            }

            if (!_.isEmpty(selectedCtxIds)) {
                let ctxtypesCriterion = Object.keys(selectedCtxIds);
                let ctxIds = [];

                ctxtypesCriterion.forEach((ctxType) => {
                    ctxIds = ctxIds.concat(selectedCtxIds[ctxType]);
                });

                if (!_.isEmpty(ctxtypesCriterion) && !_.isEmpty(ctxIds)) {

                    let requestData = {
                        "params": {
                            "query": {
                                "ids": ctxIds,
                                "valueContexts": [
                                    {
                                        "source": "internal",
                                        "locale": "en-US"
                                    }
                                ],
                                "filters": {
                                    "typesCriterion": ctxtypesCriterion
                                }
                            },
                            "fields": {}
                        }
                    }

                    this._addDependentRelatinoshipBasedOnType(requestData, ctxtypesCriterion[0])

                    let liquidCustomElement = customElements.get("liquid-entity-data-get");
                    let liquidElement = new liquidCustomElement();
                    liquidElement.requestData = requestData;
                    liquidElement.operation = "getbyids";

                    let ctxGetResponse = (e) => {
                        if (DataHelper.isValidObjectPath(e, "detail.response.content.entities")) {
                            let entities = e.detail.response.content.entities;
                            let valCtxIds = {};
                            let defaultValCtxIds = {};

                            entities.forEach((entity) => {
                                if (!_.isEmpty(entity)) {
                                    if (DataHelper.isValidObjectPath(entity, "data.relationships")) {
                                        let relationships = entity.data.relationships;

                                        if (!_.isEmpty(relationships)) {
                                            Object.keys(relationships).forEach((relType) => {
                                                let rels = relationships[relType];

                                                if (!_.isEmpty(rels)) {
                                                    rels.forEach((rel) => {
                                                        let relId = rel.relTo.id;
                                                        let relEntityType = rel.relTo.type;

                                                        if (!valCtxIds[relEntityType]) {
                                                            valCtxIds[relEntityType] = [];
                                                        }

                                                        if (_.isEmpty(defaultValCtxIds[relEntityType])) {
                                                            if (rel.attributes) {
                                                                let relAttr = rel.attributes[this._getDefaultSelectedAttrName()];
                                                                if (DataHelper.isValidObjectPath(relAttr, "values.0.value") && relAttr.values[0].value.toString() == "true") {
                                                                    defaultValCtxIds[relEntityType] = rel.relTo.id;
                                                                }
                                                            } else {
                                                                defaultValCtxIds[relEntityType] = [];
                                                            }
                                                        }
                                                        if(valCtxIds[relEntityType].indexOf(relId) === -1) {
                                                            valCtxIds[relEntityType].push(relId);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    }
                                }
                            });

                            this._setDependentValCtxLovRelationships(defaultValCtxIds, valCtxIds);
                            this._updateCurrentValContextState(valCtxIds);
                        }
                    };

                    let ctxGetError = (e) => {
                        this.logError('Value context dependecy get failed based on current selected contexts', e.detail);
                    }

                    liquidElement.addEventListener("response", ctxGetResponse.bind(this));
                    liquidElement.addEventListener("error", ctxGetError.bind(this));

                    liquidElement.generateRequest();
                }

            } else {
                this._updateCurrentValContextState({});
            }
        }
    }

    _updateCurrentValContextState(dependentLovRelationships) {
        let lovResetDone = false;
        this.configData.forEach(function (item) {
            let ctxKey = item.id;
            let lovElement = this.$$('#' + ctxKey + '-lov');
            if (lovElement && lovElement.rData) {
                let ctxData = lovElement.rData;

                if (ctxData && ctxData.contextType == "value") {
                    let ctxTypes = ctxData.dataMappings.type;
                    for (let i = 0; i < ctxTypes.length; i++) {
                        let ctxType = ctxTypes[i];

                        let itemIdx = this._contextHierarchy.indexOf(ctxType);

                        let selectedItems = lovElement.selectedItems;
                        if (_.isEmpty(selectedItems) && !_.isEmpty(lovElement.selectedItem)) {
                            selectedItems = [lovElement.selectedItem];
                        }


                        let reqData = lovElement.requestData;
                        if (DataHelper.isValidObjectPath(reqData, "params.query")) {
                            if (!DataHelper.areEqualArrays(reqData.params.query.ids, dependentLovRelationships[ctxType])) {
                                reqData.params.query.ids = dependentLovRelationships[ctxType];

                                lovElement.selectedItems = this.selectedDimensionsDetail[ctxType];
                                lovElement.selectedItem = !_.isEmpty(lovElement.selectedItems) ? lovElement.selectedItems[0] : {};
                                lovElement.requestData = reqData;
                                lovResetDone = true;
                                lovElement.reset();
                            }
                        }
                    }
                }
            }
        }, this);

        let localeLovButton = this.shadowRoot.querySelector("#locale-toggle-button");

        if (localeLovButton) {
            localeLovButton.disabled = false;
        }

        if(!lovResetDone) {
            this._setSelectedDimensions();
        }
    }

    _isRootContextChanged() {
        let isRootCtxhanged = false;
        let rootContext = this.configData.find(item => item.contextType === "data");
        if (rootContext && rootContext.dataMappings && rootContext.dataMappings.type && !_.isEmpty(rootContext.dataMappings.type)) {
            let rootContextTypes = rootContext.dataMappings.type;
            for (let i = 0; i < rootContextTypes.length; i++) {
                let rootCtxType = rootContextTypes[i];
                let _selectedDim = this.selectedDimensions[rootCtxType];
                this._previousRootCtxValue = this._previousRootCtxValue || {};
                if (_selectedDim) {
                    if (typeof this._previousRootCtxValue[rootCtxType] != 'undefined') {
                        if (_selectedDim.length == this._previousRootCtxValue[rootCtxType].length) {
                            _selectedDim.forEach(function (val) {
                                if (this._previousRootCtxValue[rootCtxType].indexOf(val) < 0) {
                                    isRootCtxhanged = true;
                                }
                            }, this);
                        } else {
                            isRootCtxhanged = true;
                        }
                    }
                    this._previousRootCtxValue[rootCtxType] = DataHelper.cloneObject(_selectedDim);
                }
            }
        }
        return isRootCtxhanged;
    }

    _setDependentValCtxLovRelationships(defaultValCtxIds, valCtxIds) {
        if (!_.isEmpty(defaultValCtxIds)) {
            this.selectedDimensionsDetail["PreSelectedItems"] = {};
            for (let dctxs in defaultValCtxIds) {

                if (!this.selectedDimensionsDetail["PreSelectedItems"]) {
                    this.selectedDimensionsDetail["PreSelectedItems"] = {};
                }

                if (_.isEmpty(this.selectedDimensionsDetail["PreSelectedItems"][dctxs])) {
                    this.selectedDimensionsDetail["PreSelectedItems"][dctxs] = [];
                }

                if (_.isEmpty(defaultValCtxIds[dctxs])) {
                    defaultValCtxIds[dctxs] = valCtxIds[dctxs][0];
                }

                if (this.selectedDimensionsDetail["PreSelectedItems"][dctxs].indexOf(defaultValCtxIds[dctxs]) === -1) {
                    this.selectedDimensionsDetail["PreSelectedItems"][dctxs].push(defaultValCtxIds[dctxs]);
                }

            }
        }
    }

    _entityExternalDataFormatter(formattedData, data, _rData) {
        if (formattedData && formattedData.length) {
            let elementInfo = _rData ? _rData : this.rData;

            if (elementInfo) {
                let ctxType = elementInfo.id;

                // Add relationship detail into formatted item if entity has dependent relationship
                // If entity has dependent relationship then check for "isDefault" relationship attribute to get preselected dependent value for current entity.
                let _domHost = _rData ? this : this.domHost;

                if (elementInfo.contextType.toLowerCase() == "value") {
                    if (DataHelper.isValidObjectPath(this.requestData, "params.query.ids.0")) {
                        let selectedItemIds = this.selectedItems.map(v => v.id);
                        let selectedItems = [];
                        if (selectedItemIds) {
                            formattedData.forEach(function (item) {
                                if (selectedItemIds.indexOf(item.id) > -1) {
                                    selectedItems.push(item);
                                }
                            }, this);

                            let preSelectedItems;

                            if (_domHost._rootContextChanged) {
                                let contextHierarchyInfo = _domHost._contextHierarchyInfo;
                                let noOfSelectedCtxs = 0;
                                if (!_.isEmpty(contextHierarchyInfo)) {
                                    contextHierarchyInfo.forEach((item) => {
                                        if (!_.isEmpty(_domHost.selectedDimensionsDetail[item.contextKey])) {
                                            noOfSelectedCtxs = noOfSelectedCtxs + _domHost.selectedDimensionsDetail[item.contextKey].length;
                                            return;
                                        }
                                    });
                                }

                                if (noOfSelectedCtxs > 1) {
                                    if (_.isEmpty(selectedItems)) {
                                        preSelectedItems = _domHost.selectedDimensionsDetail["PreSelectedItems"] && _domHost.selectedDimensionsDetail["PreSelectedItems"][ctxType];
                                    }
                                } else {
                                    preSelectedItems = _domHost.selectedDimensionsDetail["PreSelectedItems"] && _domHost.selectedDimensionsDetail["PreSelectedItems"][ctxType];
                                }
                            }
                            if (!_.isEmpty(preSelectedItems)) {
                                //var preselctedItem = data.find(v => v.id == preSelectedItemId);
                                let preselctedItem = data.find(v => preSelectedItems.find(u => u === v.id));

                                if (preselctedItem) {
                                    let name;
                                    let path = "data.attributes." + elementInfo.externalAttrName + ".values.0.value";
                                    if (DataHelper.isValidObjectPath(preselctedItem, path)) {
                                        name = preselctedItem.data.attributes[elementInfo.externalAttrName].values[0].value;
                                    } else {
                                        name = preselctedItem.name;
                                    }
                                    let item = formattedData.find(v => v.title == name);

                                    if (item) {
                                        this.selectedItem = item;
                                        this.selectedItems = [item];
                                        _domHost._setSelectedDimensions();
                                    }
                                }
                            } else if (!_.isEmpty(selectedItems)) {
                                if (!DataHelper.areEqualArrays(this.selectedItems, selectedItems)) {
                                    this.selectedItems = selectedItems;
                                    _domHost._setSelectedDimensions();
                                }
                            } else {
                                this.selectedItems = !_.isEmpty(_domHost.selectedDimensionsDetail[ctxType]) ? _domHost.selectedDimensionsDetail[ctxType] : [];
                                _domHost._setSelectedDimensions();
                            }
                        }
                    } else {
                        let contextHierarchyInfo = _domHost._contextHierarchyInfo;
                        if (!_.isEmpty(contextHierarchyInfo) && _domHost._rootContextChanged) {
                            let isGlobalContext = true;
                            contextHierarchyInfo.forEach((item) => {
                                if (!_.isEmpty(_domHost.selectedDimensionsDetail[item.contextKey])) {
                                    isGlobalContext = false;
                                    return;
                                }
                            });

                            if (ctxType == "locale" && isGlobalContext) {
                                let defaultLocale = ComponentHelper.getLocaleManager().getByName(DataHelper.getDefaultLocale());
                                if (!_.isEmpty(defaultLocale)) {
                                    let item = {
                                        "entityId": defaultLocale.id,
                                        "id": defaultLocale.name,
                                        "title": defaultLocale.externalName,
                                        "type": ctxType
                                    };

                                    this.selectedItem = item;
                                    this.selectedItems = [item];
                                    _domHost._setSelectedDimensions();
                                }
                            }
                        }
                    }
                }
                if (!_.isEmpty(_domHost.favouriteContexts) && elementInfo.contextType.toLowerCase() == "data") {
                    formattedData.forEach(function (item) {
                        if (_domHost.favouriteContexts.find(ctx => ctx[item.type] === item.title)) {
                            item.isFavourite = true;
                        }
                    }, this);
                }
            }
        }

        return formattedData;
    }

    _onPreselectedContextGetResponse(ev) {
        if (DataHelper.isValidObjectPath(ev, 'detail.response.response.entities.0')) {
            let entity = ev.detail.response.response.entities[0];
            if (entity && !_.isEmpty(this._parsedContexts)) {
                for (let idx = 0; idx < this._parsedContexts.length; idx++) {
                    if (this._parsedContexts[idx].dataMappings &&
                        !_.isEmpty(this._parsedContexts[idx].dataMappings.type) &&
                        this._parsedContexts[idx].dataMappings.type.indexOf(entity.type) > -1) {
                        let _selectedItemData = this._entityExternalDataFormatter([this._parsedContexts[idx].selectedItem], [entity], this._parsedContexts[idx]);
                        if (!_.isEmpty(_selectedItemData)) {
                            this._parsedContexts[idx].selectedItem = _selectedItemData[0];
                            this._parsedContexts[idx].selectedItem.entityId = entity.id;
                        }
                        break;
                    }
                }
            }
        } else {
            this.logError(this.appName + "-Dimension Selector - Entity Pre selected Context get exception", ev.detail);
        }

        this._contextToBeRendered = undefined;
        this._contextToBeRendered = this._parsedContexts;
        this._updateSelectedDimensions();
    }

    _onPreselectedContextGetGetError(ev) {
        this.logError(this.appName + "-Context Selector - Entity Pre selected Context get exception", ev.detail);
        this._contextToBeRendered = undefined;
        this._contextToBeRendered = this._parsedContexts;
        this._updateSelectedDimensions();
    }

    _createContextGetRequest(entityId, entityType) {
        if (!_.isEmpty(entityId)) {
            this._entityContextRequest = DataRequestHelper.createEntityContextGetRequest(entityId, entityType);
            let liquidElement = this.$$('#entityContextGet');
            if (liquidElement) {
                liquidElement.generateRequest();
            } else {
                this.logError(this.appName + "-Dimension Selector - Liquid for entity context get is not found");
            }
        }
    }

    _onEntityContextGetResponse(e) {
        let response = e.detail.response.response;

        if (!response) {
            this.logError(this.appName + "-Dimension Selector - Entity Context get response exception", e.detail, true);
            return;
        }

        if (response.entities && response.entities.length) {
            let entity = response.entities[0];

            if (entity && entity.data && entity.data.contexts) {
                let _entityContexts = [];

                entity.data.contexts.forEach(function (ctx) {
                    _entityContexts.push(ctx.context)
                }, this);

                this._entityContexts = _entityContexts;
            }
        }
        this.refreshDimensionData();
    }

    refreshDimensionData() {
        if (!_.isEmpty(this._parsedContexts)) {
            for (let i = 0; i < this._parsedContexts.length; i++) {
                let configDataItem = this._parsedContexts[i];
                if (configDataItem.id === "context") {
                    /**
                    * If entity doesn't have any contexts, no need to request for contexts. 
                    * Hence making requestData undefined for context-lov
                    * */
                    if(!_.isEmpty(configDataItem.selectedItem)) {
                        if(Array.isArray(configDataItem.selectedItem)) {
                            let _self = this;
                            configDataItem.selectedItem = configDataItem.selectedItem.reduce(function(prev, next) {
                                if(_self._isItemExistsInCurrentContexts(next, _self._entityContexts)) {
                                    prev.push(next);
                                }
                                return prev;
                            }, []);
                        } else {
                            if(!this._isItemExistsInCurrentContexts(configDataItem.selectedItem, this._entityContexts)) {
                                configDataItem.selectedItem = {};
                            }
                        }
                    }
                    if (_.isEmpty(this._entityContexts)) {
                        configDataItem.dataRequest = undefined;
                    } else if (DataHelper.isValidObjectPath(configDataItem, "dataMappings.title") &&
                        configDataItem.dataMappings.title) {
                        if (_.isEmpty(configDataItem.dataRequest)) {
                            let itemContexts = [{ "type": configDataItem.dataMappings.type }];
                            let contextData = { "ItemContexts": itemContexts };
                            let reqData = DataRequestHelper.createEntityGetRequest(contextData, true);
                            configDataItem.dataRequest = reqData;
                        }

                        /**
                        * If entity has contexts, request should be sent to get only entity current contexts
                        * Hence preparing attributesCriterion with current context items and updating request object
                        * and then rendering context selector
                        * */
                        let externalAttrName = DataHelper.getAttributesBetweenCurlies(configDataItem.dataMappings.title);
                        if (externalAttrName) {
                            let contextsToBeLoaded = [];
                            this._entityContexts.forEach(function (context) {
                                contextsToBeLoaded = contextsToBeLoaded.concat(Object.values(context));
                            }, this);
                            if (!_.isEmpty(contextsToBeLoaded)) {
                                let attributesCriterion = [];
                                let attrCriterion = {};
                                attrCriterion[externalAttrName] = {
                                    "exacts": contextsToBeLoaded
                                }
                                attributesCriterion.push(attrCriterion);
                                configDataItem.dataRequest.params.query.filters.attributesCriterion = attributesCriterion;
                            }
                        }
                    }
                }
            }

            /** 
            * Need to check if there are any contexts to be preselected on load
            * If there are none then render context-selector
            * */
            if (!this._checkPreselectedContextOnLoad(this._parsedContexts)) {
                this._contextToBeRendered = undefined;
                this._contextToBeRendered = this._parsedContexts;
                this._updateSelectedDimensions();
            }
        }
    }

    getContextSelectorConfig() {
        return this.configData;
    }

    /**
     * Function to set the default context-selector values
     * - If the defaultDimensions are empty/not set, use the availableSelectedItems
     * - If the defaultDimensions are set, and matches with the availableSelectedItems, make that availableSelectedItem as selectedItem
    */
    _getDefaultSelectedItems(ctxKey, ctxType, defaultDimensions, availableSelectedItems) {
        let selectedItems = [];
        if (ctxKey) {
            if (defaultDimensions[ctxKey]) {
                if (ctxType == "data" && availableSelectedItems && availableSelectedItems.length) {
                    selectedItems = defaultDimensions[ctxKey];
                    availableSelectedItems.forEach((item) => {
                        let existingItem = defaultDimensions[ctxKey].find(v => v.id == item.id);
                        if(!existingItem) {
                            selectedItems.push(item);
                        }
                    });
                } else {
                    selectedItems = defaultDimensions[ctxKey];
                }
            } else if (availableSelectedItems && availableSelectedItems.length) {
                selectedItems = availableSelectedItems;
            }
        }

        return selectedItems;
    }

    _allowFavourites(context) {
        if (context.contextType === "data") {
            return true;
        }

        return false;
    }

    _getFavouriteContexts() {
        let favouriteContextsGetRequest;
        let clonedContextData = DataHelper.cloneObject(this.contextData);
        let configIdAndContext = this._getConfigIdAndContext();
        let context = configIdAndContext.context;
        let configId = configIdAndContext.configId;

        clonedContextData[ContextHelper.CONTEXT_TYPE_DATA] = [context];
        clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = ["favoriteContextMappings"];

        favouriteContextsGetRequest = DataRequestHelper.createConfigInitialRequest(clonedContextData);
        favouriteContextsGetRequest.params.query.id = configId;

        this.set("favouriteContextsGetRequest", favouriteContextsGetRequest);

        let liqInitFavouriteContextsSearch = this.shadowRoot.querySelector("#liqInitFavouriteContextsSearch");
        if (liqInitFavouriteContextsSearch) {
            liqInitFavouriteContextsSearch.generateRequest();
        }
    }

    _onFavouriteContextsInitSearchResponse() {
        if (DataHelper.isValidObjectPath(this.favouriteContextsInitSearchResponse, "content.totalRecords")) {
            let totalRecords = this.favouriteContextsInitSearchResponse.content.totalRecords;
            let getDetailOptions = { 'from': 0, 'to': totalRecords };
            this._makeGetSearchResultDetailCall(getDetailOptions);
        }
    }

    _makeGetSearchResultDetailCall(options) {
        let liqGetSearchResultDetail = this.shadowRoot.querySelector('#liqFavouriteContextsGetSearchResultDetail');

        let searchResultId = this.favouriteContextsInitSearchResponse.content.requestId;

        let reqData = this.favouriteContextsGetRequest;
        reqData.params.options = options;
        liqGetSearchResultDetail.requestId = searchResultId;
        liqGetSearchResultDetail.requestData = reqData;

        liqGetSearchResultDetail.generateRequest();
    }

    _onFavouriteContextsGetSearchResultDetailResponse(e) {
        let response = e.detail.response;
        this.favouriteContextsExist = false;
        this.favouriteContexts = [];
        if (response && response.status && response.status.toLowerCase() === "success") {
            let configId = this._getConfigIdAndContext()["configId"];
            let responseContent = response.content;
            if (responseContent && !_.isEmpty(responseContent.configObjects)) {
                let config = responseContent.configObjects.find(obj => obj.id === configId);
                if (!_.isEmpty(config)) {
                    if (DataHelper.isValidObjectPath(config, "data.contexts.0.jsonData.config.favoriteContexts")) {
                        this.set("favouriteContextsConfig", config);
                        this.set("favouriteContexts", config.data.contexts[0].jsonData.config.favoriteContexts);
                        this._resetCurrentContextLov();
                    }
                }
            }
        }
    }

    _onEntityLovFavouriteIconTapped(e) {
        const {
                    type,
            title
                } = e.detail.data;

        this.currentFavouriteSelectorLovId = e.detail.id;
        let favContext = {};
        favContext[type] = title;
        let operation = "update";
        let toastMessage;
        if (_.isEmpty(this.favouriteContextsConfig)) {
            operation = "create";
            this.favouriteContextsConfig = this._createFavouriteContextsConfig();
        }
        this.favouriteContexts = this.favouriteContexts || [];
        let index = -1;
        if (!_.isEmpty(this.favouriteContexts)) {
            this.favouriteContexts.forEach(function (ctx, idx) {
                if (ctx[type] === title) {
                    index = idx;
                }
            }, this);
        }

        if (index > -1) {
            this.favouriteContexts.splice(index, 1);
            toastMessage = "Removed " + Object.values(favContext) + " from favourites successfully."
        } else {
            this.favouriteContexts.push(favContext);
            toastMessage = "Added " + Object.values(favContext) + " to favourites successfully."
        }

        this.favouriteContextsConfig.data.contexts[0].jsonData.config.favoriteContexts = this.favouriteContexts;
        let reqData = { "configObjects": [this.favouriteContextsConfig] };

        this.set("favouriteContextsSaveRequest", reqData);
        this.set("_toastMessage", toastMessage);

        let favouriteContextsSaveLiquid = this.shadowRoot.querySelector("#favouriteContextsSave");
        if (favouriteContextsSaveLiquid) {
            favouriteContextsSaveLiquid.operation = operation;
            favouriteContextsSaveLiquid.generateRequest();
        }
    }

    _createFavouriteContextsConfig() {
        let configIdAndContext = this._getConfigIdAndContext();
        let context = configIdAndContext.context;
        let configId = configIdAndContext.configId;

        let config = {
            "id": configId,
            "name": configId,
            "type": "favoriteContextMappings",
            "version": {},
            "properties": {},
            "data": {
                "contexts": [
                    {
                        "context": context,
                        "jsonData": {
                            "config": {
                                favoriteContexts: []
                            }
                        }
                    }
                ]
            }
        }

        return config;
    }

    _onFavouriteContextsSaveResponse(e) {
        let response = e.detail.response;
        if (response && response.status && response.status.toLowerCase() === "success") {
            this.showSuccessToast(this._toastMessage);
            setTimeout(() => {
                this._getFavouriteContexts();
            }, 100);
        }
    }

    _getConfigIdAndContext() {
        let configIdAndContext = {};
        let userContext = ContextHelper.getFirstUserContext(this.contextData);
        configIdAndContext["configId"] = "favoriteContextMappings_" + userContext.user + "_" + userContext.defaultRole;
        configIdAndContext["context"] = {
            "user": userContext.user,
            "role": userContext.defaultRole
        };

        return configIdAndContext;
    }

    _resetCurrentContextLov() {
        if (this.currentFavouriteSelectorLovId) {
            let currentLov = this.shadowRoot.querySelector("#" + this.currentFavouriteSelectorLovId);
            if (currentLov && currentLov.updateFavouriteItems) {
                this.favouriteContexts = this.favouriteContexts || [];
                currentLov.updateFavouriteItems(this.favouriteContexts, "title");
            }
        }
        this.currentFavouriteSelectorLovId = undefined;
    }

    _isItemExistsInCurrentContexts(item, entityContexts) {
        entityContexts = entityContexts || [];
        let existingContext = entityContexts.find(obj => Object.keys(obj)[0] === item.type && Object.values(obj)[0] === item.title);
        if(existingContext) {
            return true;
        }
        return false;
    }
}

customElements.define(RockContextSelector.is, RockContextSelector);
