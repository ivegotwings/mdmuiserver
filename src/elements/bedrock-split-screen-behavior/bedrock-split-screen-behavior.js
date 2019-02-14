import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/context-helper.js';
import ContextModelManager from '../bedrock-managers/context-model-manager.js';

/***
* `RUFBehaviors.SplitScreenBehavior` provides common behavior for rock-relationship-split-screen and rock-attribute-split-screen
*
*  ### Example
*
*     <dom-module id="x-app">
*        <template>
*        </template>
*        <script>
*           Polymer({
*             is: "x-app",
*
*             behaviors: [
*               RUFBehaviors.SplitScreenBehavior
*             ],
*
*             properties: {
*              
*             }
*           });
*        &lt;/script>
*     </dom-module>
*/

window.RUFBehaviors = window.RUFBehaviors || {};
/** @polymerBehavior RUFBehaviors.SplitScreenBehavior */
RUFBehaviors.SplitScreenBehaviorIml = {
    properties: {
        contextData: {
            type: Object,
            value: function () {
                return {};
            }
        },
        /**
            * <b><i>Content development is under progress... </b></i>
            */
        configContext: {
            type: Object,
            value: function () {
                return {};
            }
        },
        /**
            * Indicates whether the attribute is rendered in the edit mode or view mode.
            * The two possible values are <b>view</b> and <b>edit</b>.
            */
        mode: {
            type: String,
        },
        /**
            * <b><i>Content development is under progress... </b></i>
            */
        noOfScreens: {
            type: Number,
            value: 0
        },

        /**
        * Indicates the number of columns in which the attributes are rendered. Possible values are
        * one, two, and three.
        */
        noOfColumns: {
            type: Number,
            value: 3,
            computed: '_computeColumns(noOfScreens)'
        },

        doSyncValidation: {
            type: Boolean,
            value: false
        },

        _contexts: {
            type: Array,
            value: function () {
                return [];
            }
        },

        dataIndex: {
            type: String,
            value: "entityData"
        },
        loadGovernData: {
            type: Boolean,
            value: true
        }
    },

    observers: [
        '_computeScreens(contextData, configContext)'
    ],

    /**
    * Can be used to get the elements if they are dirty.
    */
    _getIsDirty: function (el) {
        if (el && el.getIsDirty) {
            return el.getIsDirty();
        }
    },

    _getControlIsDirty: function (el) {
        if (el && el.getControlIsDirty) {
            return el.getControlIsDirty();
        }
    },

    _getStyle: function () {
        let dataContext = ContextHelper.getDataContexts(this.contextData);
        return (this.noOfScreens == 1 && dataContext.length <= 1) ? 'false' : 'true';
    },

    _isHidden: function (item) {
        let index = this.locales.indexOf(item);

        return index === (this.noOfScreens - 1);
    },

    _computeColumns: function () {
        return this.noOfScreens > 1 ? 1 : this.noOfColumns;
    },

    _onActionsTap: function () {
        alert("actions tapped");
    },

    _getContextData(context) {
        let ctxData = {};

        let itemContext = DataHelper.cloneObject(this.getFirstItemContext());

        if (!itemContext) return ctxData;

        let dataContexts = ContextHelper.getDataContexts(context);
        let valContexts = ContextHelper.getValueContexts(context);
        let domainContexts = DataHelper.cloneObject(this.getDomainContexts());
        let userContexts = DataHelper.cloneObject(this.getUserContexts());

        itemContext.attributeNames = this.configContext.attributeNames;
        ctxData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
        ctxData[ContextHelper.CONTEXT_TYPE_VALUE] = valContexts;
        ctxData[ContextHelper.CONTEXT_TYPE_DATA] = dataContexts;
        ctxData[ContextHelper.CONTEXT_TYPE_DOMAIN] = [];

        ctxData[ContextHelper.CONTEXT_TYPE_USER] = userContexts;
        ctxData[ContextHelper.CONTEXT_TYPE_DOMAIN] = domainContexts;

        return ctxData;
    },

    async _computeScreens(contextData, configContext) {
        if (_.isEmpty(contextData) || !configContext) return;

        let valContexts = this.getValueContexts();
        let dataContexts = this.getDataContexts();
        let localeManager = ComponentHelper.getLocaleManager();
        let mappedDataContextLocale = {};
        if(customElements.get('context-data-manager') !== "undefined"){
            let contextDataManager = customElements.get('context-data-manager').getInstance();
            if(!_.isEmpty(dataContexts)){
                let domainContexts = ContextHelper.getDomainContexts(this.contextData);
                let domain = domainContexts[0]["domain"];
                let _contextTypes = await ContextModelManager.getContextTypesBasedOnDomain(domain);
                let _contextHierarchyInfo = await ContextModelManager.getContextHeirarchyInfoBasedOnDomain(domain);
                let mappedValueContextsRelationship = this._getMappedValueContextsRelationship(_contextHierarchyInfo);
                mappedDataContextLocale =  await contextDataManager.getMappedLocales(_contextTypes,mappedValueContextsRelationship);
            }
        }

        let _contexts = [];

        valContexts.forEach(valCtx => {
            if(!_.isEmpty(dataContexts)) {
                let localeObj =  localeManager.getByName(valCtx.locale);
                dataContexts.forEach(dataCtx => {
                    let dataCtxValue = Object.values(dataCtx)[0];
                    /**
                    * There is a chance that mappedDataContextLocale undefined or dataCtxValue not present in mappedDataContextLocale
                    * in that case, even though the combination looks valid, screen rendering empty. 
                    * Hence if dataCtxValue not found in mappedDataContextLocale push the context combination even it looks invalid
                    * as not showing valid combination is bigger risk then showing invalid combination
                    **/
                    if(!mappedDataContextLocale || !mappedDataContextLocale[dataCtxValue] || mappedDataContextLocale[dataCtxValue].indexOf(localeObj.id) > -1) {
                        let ctxData = {};
                        ctxData[ContextHelper.CONTEXT_TYPE_DATA] = [dataCtx];
                        ctxData[ContextHelper.CONTEXT_TYPE_VALUE] = [valCtx];
                        
                        _contexts.push(ctxData);
                    }
                }, this);
            } else {
                let ctxData = {};
                ctxData[ContextHelper.CONTEXT_TYPE_DATA] = [];
                ctxData[ContextHelper.CONTEXT_TYPE_VALUE] = [valCtx];

                _contexts.push(ctxData);
            }
        }, this);
        /**
         * right now if we have no of screens more than 4, the width allocated to
         * each screen is 50%. Untill 4 screens it is total available width/noOfScreens.
         * As we are allocating 50% width for each when noOfScreens > 4, because of attributes
         * lazy loading feature in attribute-manage, only screens which are active in view(i.e., first 2 screens)
         * rendering. Remaining all loading blank. Hence restricting max noOfScreens to 4 for now.
         * We have a bug logged for this: 287749
         * */
        this._contexts = _contexts.length ? _contexts.slice(0,4) : undefined;
        if (!this._contexts) return;
        this.noOfScreens = this._contexts.length;
    },

    _getMappedValueContextsRelationship:function(_contextHierarchyInfo){
        let _mappedRealtionships = {}
        if (!_.isEmpty(_contextHierarchyInfo)) {
            _contextHierarchyInfo.forEach(function (ctx) {
                if (ctx.contextKey && ctx.mappedValueContexts) {
                    let dependentRelationships = ctx.mappedValueContexts.map(v => v.valueContextRelationship); 
                    _mappedRealtionships[ctx.contextKey] = dependentRelationships
                }
            }, this);
        }
        return _mappedRealtionships;
    },

    

    _isContextExist: function (contexts, context) {
        if (!contexts || !context) return false;

        return !!contexts.filter(ctx => ctx.value == context).length;
    },

    _getListClassName() {
        return `${this.listClassName} ${this.listClassName}-${this.noOfScreens}`;
    },

    refresh: function () {
        this._computeScreens(this.contextData, this.configContext);
    },

    _getTitle: function (context) {
        let titleItem = [];
        let contextData = context;
        let dataContexts = ContextHelper.getFirstDataContext(contextData);
        let valueContexts = ContextHelper.getFirstValueContext(contextData);

        if (dataContexts) {
            for (let dcKey in dataContexts) {
                if(context.name === dcKey) {
                    titleItem.unshift(dataContexts[dcKey]);
                } else {
                    titleItem.push(dataContexts[dcKey]);
                }
            }
        }

        if (valueContexts) {
            for (let vcKey in valueContexts) {

                //TDOD:: Need to find out a way to check whether it's hidden in dimension selctor or not. 
                if (vcKey.toLowerCase() != "source") {
                    let item = "";
                    if (vcKey.toLowerCase() == "locale") {
                        let locale = valueContexts[vcKey];
                        let externalName = locale;
                        let localeManager = ComponentHelper.getLocaleManager();

                        if (localeManager && !_.isEmpty(localeManager.localesJson)) {
                            let localeObject = localeManager.localesJson.find(v => v.name == valueContexts[vcKey]);

                            if (localeObject) {
                                externalName = localeObject.externalName;
                            }
                        }

                        item = externalName;
                    } else {
                        item = valueContexts[vcKey];
                    }

                    if(context.name === vcKey) {
                        titleItem.unshift(item);
                    } else {
                        titleItem.push(item);
                    }
                }
            }
        }

        return titleItem.join(" :: ");
    }
};

/** @polymerBehavior */
RUFBehaviors.SplitScreenBehavior = [RUFBehaviors.ComponentContextBehavior, RUFBehaviors.UIBehavior, RUFBehaviors.SplitScreenBehaviorIml];
