import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class EntityTypeManager extends mixinBehaviors([RUFBehaviors.LoggerBehavior], PolymerElement) {

    static get is() {
        return "entity-type-manager";
    }
    
    constructor() {
        super();
        if(!RUFUtilities.entityTypeByIds) {
            RUFUtilities.entityTypeByIds = {};
        }
        // if (!RUFUtilities.entityTypeManager) {
        //     RUFUtilities.entityTypeManager = this;
        // }
        // return RUFUtilities.entityTypeManager;
    }
    
    static getInstance() {
        return new EntityTypeManager();
        // if (!RUFUtilities.entityTypeManager) {
        //     RUFUtilities.entityTypeManager = new EntityTypeManager();;
        // }
        // return RUFUtilities.entityTypeManager;
    }
    
    _generateRequest(resolve) {
        let liquidEntityCustomElement = customElements.get("liquid-entity-model-get");
        let liquidEntityModelGet = new liquidEntityCustomElement();

        let _onResponse = (ev) => {
            if (ev && ev.detail && ev.detail.response && ev.detail.response.content) {
                let entityTypes = ev.detail.response.content.entityModels;
                RUFUtilities.entityTypeByIds = {};
                entityTypes.forEach(element => {
                    if (element && !_.isEmpty(element)) {
                        RUFUtilities.entityTypeByIds[element.id] = element;
                    }
                });
            }

            if (resolve) {
                resolve();
            }
        };

        liquidEntityModelGet.addEventListener("response", _onResponse.bind(this));
        liquidEntityModelGet.addEventListener("error", this._onError.bind(this));
        liquidEntityModelGet.requestId = "";

        //Context Model manager is self executing function and because of that on load this liquid call is getting triggered before preload happens.
        //DUe to that progress bar count is getting messed up and it's never getting completed on applicaiont load.
        //Since this get process will be done in back end side it should not increase request or response count of progress bar.
        liquidEntityModelGet.excludeInProgress = true;
        liquidEntityModelGet.operation = "searchandget";
        let contextData = {};
        let itemContext = {
            "type": "entityType",
        };
        // itemContext.domain = "thing";
        contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
        contextData[ContextHelper.CONTEXT_TYPE_VALUE] = [];
        contextData[ContextHelper.CONTEXT_TYPE_DATA] = [];
        let req = DataRequestHelper.createEntityGetRequest(contextData);
        delete req.params.options.maxRecords;

        req.params.options ? req.params.options.updateDataIndex = false : req.params.options = {
            "updateDataIndex": false
        };
        req.params.fields.attributes = ["externalName"];
        liquidEntityModelGet.requestData = req;
        liquidEntityModelGet.generateRequest();
    }
    
    _onError(e) {
        this.logError('Entity get failed', e.detail);
    }
    
    _triggerRequest() {
        return new Promise((resolve, reject) => {
            this._generateRequest(resolve);
        })
    }
    
    getTypeExternalNameById(entityTypeId) {
        let _entityTypeId = entityTypeId + "_entityType";
        if (RUFUtilities.entityTypeByIds && !_.isEmpty(RUFUtilities.entityTypeByIds)) {
            let obj = RUFUtilities.entityTypeByIds[_entityTypeId];
            if (obj && !_.isEmpty(obj) && obj.properties && obj.properties.externalName) {
                return obj.properties.externalName;
            }
        }
        return entityTypeId;
    }

    getTypeByName(entityTypeName) {
        let entityTypeId = entityTypeName + "_entityType";
        if (RUFUtilities.entityTypeByIds && !_.isEmpty(RUFUtilities.entityTypeByIds)) {
            let obj = RUFUtilities.entityTypeByIds[entityTypeId];
            if (obj && !_.isEmpty(obj)) {
                return obj;
            }
        }
        return {};
    }

    async getDomainByType(entityTypeName) {
        let entityType = await this.getTypeByNameAsync(entityTypeName);
        let domain;
        if (entityType) {
            domain = entityType.domain;
        }

        return domain;
    }

    getTypesByDomain(domain) {
        let thingEntityTypes = [];
        if (!_.isEmpty(domain) && !_.isEmpty(RUFUtilities.entityTypeByIds)) {
            for (let entityTypeId in RUFUtilities.entityTypeByIds) {
                if (RUFUtilities.entityTypeByIds[entityTypeId].domain == domain) {
                    thingEntityTypes.push(RUFUtilities.entityTypeByIds[entityTypeId].name);
                }
            }
        }
        return thingEntityTypes;
    }

    getDomainByEntityTypeName(entityTypeName) {
        let domain = "";
        let entityTypeId = entityTypeName + "_entityType";
        if (RUFUtilities.entityTypeByIds && !_.isEmpty(RUFUtilities.entityTypeByIds)) {
            let obj = RUFUtilities.entityTypeByIds[entityTypeId];
            if (obj && !_.isEmpty(obj) && obj.domain) {
                domain = obj.domain;
            }
        }
        return domain;
    }
    
    async getDomainByEntityTypeNameAsync(entityTypeName) {
        let domain = "";
        let entityTypeId = entityTypeName + "_entityType";
        if (RUFUtilities.entityTypeByIds && !_.isEmpty(RUFUtilities.entityTypeByIds)) {
            return this.getDomainByEntityTypeName(entityTypeName);
        } else {
            let callLiquid = await this._triggerRequest();
            return this.getDomainByEntityTypeName(entityTypeName);
        }
    }
    
    async getTypeExternalNameByIdAsync(entityTypeId) {
        if (RUFUtilities.entityTypeByIds) {
            return this.getTypeExternalNameById(entityTypeId);
        } else {
            let callLiquid = await this._triggerRequest();
            return this.getTypeExternalNameById(entityTypeId);
        }
    }

    async getTypeByNameAsync(entityTypeName) {
        if (RUFUtilities.entityTypeByIds) {
            return this.getTypeByName(entityTypeName);
        } else {
            let callLiquid = await this._triggerRequest();
            return this.getTypeByName(entityTypeName);
        }
    }

    async getTypesByDomainAsync(domain) {
        if (RUFUtilities.entityTypeByIds) {
            return this.getTypesByDomain(domain);
        } else {
            let callLiquid = await this._triggerRequest();
            return this.getTypesByDomain(domain);
        }
    }

    async preload() {
        return await this._triggerRequest();
    }
}

customElements.define(EntityTypeManager.is, EntityTypeManager);

export default EntityTypeManager