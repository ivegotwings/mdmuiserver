import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-helpers/data-merge-helper.js';
import ContextModelManager from '../bedrock-managers/context-model-manager.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class EntityCompositeModelManager
    extends mixinBehaviors([
        RUFBehaviors.LoggerBehavior
    ], PolymerElement) {

    static get is() {
        return "entity-composite-model-manager";
    }

    constructor() {
        super();
        let entityCompositeModelManager = this;
        return entityCompositeModelManager;
    }

    _triggerRequest(requestData, coalesceOptions) {
        return new Promise((resolve, reject) => {
            if(_.isEmpty(coalesceOptions)) {
                this._generateModelGetRequest(resolve, requestData);
            } else {
                this._generateModelRestRequest(resolve, requestData);
            }
        }, this)
    }

    _generateModelGetRequest(resolve, requestData) {
        let liquidEntityCustomElement = customElements.get("liquid-entity-model-get");
        let liquidEntityModelGet = new liquidEntityCustomElement();

        let _onResponse = (ev) => {
            if (DataHelper.isValidObjectPath(ev, "detail.response.content.entityModels.0")) {
                this.compositeModel = ev.detail.response.content.entityModels[0];
            }

            if (resolve) {
                resolve();
            }
        };

        liquidEntityModelGet.addEventListener("response", _onResponse.bind(this));
        liquidEntityModelGet.addEventListener("error", this._onError.bind(this));
        liquidEntityModelGet.operation = "getbyids";
        liquidEntityModelGet.requestData = requestData;
        liquidEntityModelGet.generateRequest();
    }

    _generateModelRestRequest(resolve, requestData) {
        let liquidEntityCustomElement = customElements.get("liquid-rest");
        let liquidEntityModelGet = new liquidEntityCustomElement();

        let _onResponse = (ev) => {
            if (DataHelper.isValidObjectPath(ev, "detail.response.response.entityModels.0")) {
                this.compositeModel = ev.detail.response.response.entityModels[0];
            }

            if (resolve) {
                resolve();
            }
        };

        liquidEntityModelGet.addEventListener("liquid-response", _onResponse.bind(this));
        liquidEntityModelGet.addEventListener("liquid-error", this._onError.bind(this));
        liquidEntityModelGet.url = "/data/pass-through-model/compositemodelget";
        if(DataHelper.isValidObjectPath(requestData, "params.query.name")) {
            requestData.params.query.id = requestData.params.query.name + "_entityCompositeModel";
            delete requestData.params.query.name;
        }
        liquidEntityModelGet.requestData = requestData;
        liquidEntityModelGet.generateRequest();
    }

    _onError(e) {
        this.logError('Entity composite model get failed', e.detail);
        this.dispatchEvent(new CustomEvent("error", { detail:e.detail, bubbles: this.bubbles, composed:true }));
        this.dispatchEvent(new CustomEvent("liquid-error", { detail:e.detail, bubbles: this.bubbles, composed:true }));
    }

    async get(requestData, contextData) {
        if(!_.isEmpty(requestData)) {
            this.compositeModel;
            this.entity;
            let currentActiveApp = ComponentHelper.getCurrentActiveApp();
            let query = requestData.params.query;
            let options = requestData.params.options;
            let coalesceOptions;
            if(requestData.applyEnhancerCoalesce) {
                coalesceOptions = await this._getCoalesceOptions(contextData);
            }
            if (!query.contexts) {
                query.contexts = [];
            }
            if (!query.filters) {
                query.filters = {};
            }

            if(!_.isEmpty(coalesceOptions)) {
                options = options || {};
                options["coalesceOptions"] = coalesceOptions;
                requestData.params.options = options;
            }

            query.filters.typesCriterion = ["entityCompositeModel"];
            let callLiquid = await this._triggerRequest(requestData, coalesceOptions);
            return this.compositeModel;
        }
    }

    async _getCoalesceOptions(contextData) {
        let coalesceOptions = {};
        let itemContext = ContextHelper.getFirstItemContext(contextData);
        let domainContext = ContextHelper.getFirstDomainContext(contextData);
        let dataContexts = ContextHelper.getDataContexts(contextData);
        if(itemContext && itemContext.id &&
            domainContext && domainContext.domain) {
                let enhancerAttributeNames = await ContextModelManager.getAllEnhancerAttributeNamesBasedOnDomain(domainContext.domain);
                if(!_.isEmpty(enhancerAttributeNames)) {
                    itemContext.attributeNames = enhancerAttributeNames;
                    let callLiquid = await this._getEntityAsync(contextData);

                    if(!_.isEmpty(this.entity)) {
                        coalesceOptions = this._prepareCoalesceOptions(dataContexts);
                    }
                }
        }

        return coalesceOptions;
    }

    async _getEntityAsync(contextData, enhancerAttributes) {
        return new Promise((resolve, reject) => {
            this._getEntity(resolve, contextData, enhancerAttributes);
        }, this);
    }

    _getEntity(resolve, contextData, enhancerAttributes) {
        let liquidEntityCustomElement = customElements.get("liquid-entity-data-get");
        let liquidEntityDataGet = new liquidEntityCustomElement();

        let _onResponse = (ev) => {
            if (DataHelper.isValidObjectPath(ev, "detail.response.content.entities.0")) {
                this.entity = ev.detail.response.content.entities[0];
            }

            if (resolve) {
                resolve();
            }
        };

        let request = DataRequestHelper.createEntityGetRequest(contextData,true);
        liquidEntityDataGet.addEventListener("response", _onResponse.bind(this));
        liquidEntityDataGet.addEventListener("error", this._onError.bind(this));
        liquidEntityDataGet.operation = "getbyids";
        liquidEntityDataGet.requestData = request;
        liquidEntityDataGet.generateRequest();
    }

    _prepareCoalesceOptions(dataContexts) {
        let coalesceOptions = {};
        let enhancerAttributes = [];
        let isContextPresent = false;

        if(!_.isEmpty(dataContexts)) {
            for(let idx=0; idx<dataContexts.length; idx++) {
                let dataContext = dataContexts[idx];
                let attributes = SharedUtils.DataObjectFalcorUtil.getAttributesByCtx(this.entity, dataContext);
                let attributesForCoalesce = this._prepareEnhancerAttributesForCoalesce(attributes, dataContext);
                if(!_.isEmpty(attributesForCoalesce)) {
                    enhancerAttributes = enhancerAttributes.concat(attributesForCoalesce);
                }
            }
        } else if (this.entity && this.entity.data && this.entity.data.attributes){
            let attributes = this.entity.data.attributes;
            enhancerAttributes = this._prepareEnhancerAttributesForCoalesce(attributes);
        }

        coalesceOptions["enhancerAttributes"] = enhancerAttributes;

        return coalesceOptions;
    }

    _prepareEnhancerAttributesForCoalesce(attributes, dataContext) {
        let enhancerAttributes = [];
        let isContextPresent = false;

        if(!_.isEmpty(dataContext)) {
            isContextPresent = true;
        }

        if(!_.isEmpty(attributes)) {
            Object.keys(attributes).forEach(function(attributeName) {
                let values = attributes[attributeName].values;
                for(let valIdx =0; valIdx<values.length; valIdx++) {
                    let obj = {};
                    obj[attributeName] = values[valIdx].value;
                    if(isContextPresent) {
                        obj["contexts"] = [dataContext];
                    }
                    enhancerAttributes.push(obj);
                }
            }, this);
        }

        return enhancerAttributes;
    }
}

customElements.define(EntityCompositeModelManager.is, EntityCompositeModelManager);

export default EntityCompositeModelManager
