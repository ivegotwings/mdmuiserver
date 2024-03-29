import '@polymer/polymer/polymer-element.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/data-helper.js';
let ContextModelManager = (function() {
    let _contextModels;
    let _promiseResolve;
    let _enhancerAttributesPerDomain = {};
    let _enhancerAttributesPerDomainAndContext = {};
    let _contexTypesPerDomain = {};
    let _contextHeirarchyInfoPerDomain = {};

    async function _init() {
        _getContextModelBasedOnDomains();
    }

    function _preInit() {
        return new Promise((resolve, reject) => {
            _promiseResolve = resolve;
            _init();
        });
    }

    function _getContextModelBasedOnDomains() {
        let liquidEntityCustomElement = customElements.get("liquid-rest");

        if (typeof liquidEntityCustomElement !== 'function') return;

        let liquidEntityModelGet = new liquidEntityCustomElement();

        liquidEntityModelGet.url = "/data/pass-through/entitymodelservice/getcontext";
        liquidEntityModelGet.method = "POST";

        liquidEntityModelGet.addEventListener("liquid-response", _onContextModelGetResponse);
        liquidEntityModelGet.addEventListener("liquid-error", _onContextModelGetFailed);

        let contextData = {};
        let itemContext = {
            "type": "entityContextModel",
            "ids": ""
        };
        // itemContext.domain = "thing";
        contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
        contextData[ContextHelper.CONTEXT_TYPE_VALUE] = [];
        contextData[ContextHelper.CONTEXT_TYPE_DATA] = [];
        let req = DataRequestHelper.createEntityGetRequest(contextData);
        delete req.params.options.maxRecords;
        req.params.fields.attributes = ["externalName"];
        liquidEntityModelGet.requestData = req;
        liquidEntityModelGet.generateRequest();
    }

    function _onContextModelGetResponse(ev) {
        if (ev && ev.detail && ev.detail.response && ev.detail.response.response && ev.detail.response.response.entityModels) {
            let entityModels = ev.detail.response.response.entityModels;
            if (!_.isEmpty(entityModels)) {
                _contextModels = {};
                entityModels.forEach(element => {
                    if (element && !_.isEmpty(element)) {
                        _contextModels[element.name] = element;
                        _prepareEnhancerAttributeNamesPerDomainAndContext(element.name, element);
                    }
                });
            }

            if (_promiseResolve) {
                _promiseResolve();
            }
        } else {
            const logDetail = {
                "request": ev.detail.request.requestData,
                "requestId": ev.detail.request.requestData.requestId,
                "reason": ev.detail.response.reason
            };
            RUFUtilities.Logger.error('Context Model Fetch Error', logDetail, "context-model-manager");
            let info = document.getElementById('info');
            info.hidden = false;
            info.lastElementChild.innerHTML = "Context Model Fetch Error " + ev.detail.response.reason;
            document.getElementById('loader').hidden = true;
        }
    }

    function _onContextModelGetFailed(ev) {
        RUFUtilities.Logger.error('Context Model Fetch Error', ev.detail, "context-model-manager");
    }

    function _prepareEnhancerAttributeNamesPerDomainAndContext(domain, domainContextModel) {
        _enhancerAttributesPerDomain[domain] = [];
        _enhancerAttributesPerDomainAndContext[domain] = {};
        _contexTypesPerDomain[domain] = [];
        _contextHeirarchyInfoPerDomain[domain];

        if(domainContextModel && domainContextModel.properties) {
            if(domainContextModel.properties.enhancerAttributes) {
                let enhancerAttributes = domainContextModel.properties.enhancerAttributes;
                let enhancerAttributeNames = _getEnhancerAttributeNames(enhancerAttributes);

                if(enhancerAttributeNames) {
                    _enhancerAttributesPerDomain[domain] = _enhancerAttributesPerDomain[domain].concat(enhancerAttributeNames);
                    _enhancerAttributesPerDomainAndContext[domain]["self"] = enhancerAttributeNames;
                }
            }

            if(!_.isEmpty(domainContextModel.properties.coalesceInfo)) {
                let _contextHierarchyInfo = domainContextModel.properties.coalesceInfo;
                _contextHierarchyInfo.sort(function(a,b) {
                    if(a.level && b.level) {
                        return a.level - b.level;
                    }
                });
                _contextHeirarchyInfoPerDomain[domain] = _contextHierarchyInfo;

                domainContextModel.properties.coalesceInfo.forEach(function(coalesceObj) {
                    if(coalesceObj.contextKey)  {
                        if(_contexTypesPerDomain[domain].indexOf(coalesceObj.contextKey) < 0) {
                            _contexTypesPerDomain[domain].push(coalesceObj.contextKey);
                        }

                        if(coalesceObj.enhancerAttributes) {
                            let enhancerAttributes = coalesceObj.enhancerAttributes;
                            let enhancerAttributeNames = _getEnhancerAttributeNames(enhancerAttributes);

                            if(enhancerAttributeNames) {
                                _enhancerAttributesPerDomain[domain] = _enhancerAttributesPerDomain[domain].concat(enhancerAttributeNames);
                                _enhancerAttributesPerDomainAndContext[domain][coalesceObj.contextKey] = enhancerAttributeNames;
                            }
                        }
                    }
                });
            }
        }
    }

    function _getEnhancerAttributeNames(enhancerAttributes) {
        if(!_.isEmpty(enhancerAttributes)) {
            let enhancerAttributeNames = [];
            enhancerAttributes.forEach(function(attrObj) {
                if(enhancerAttributeNames.indexOf(attrObj.enhancerAttributeName) < 0) {
                    enhancerAttributeNames.push(attrObj.enhancerAttributeName);
                }
            });

            return enhancerAttributeNames;
        }
    }

    function getContextModelBasedOnCurrentDataContext(entityContextModel, firstDataContext) {
        let contextModel;

        if (entityContextModel) {
            let contextHierarchy = [];

            let contextHierarchyInfo = DataHelper.isValidObjectPath(entityContextModel, "properties.coalesceInfo") && entityContextModel.properties.coalesceInfo;

            if (!_.isEmpty(contextHierarchyInfo)) {
                contextHierarchyInfo.sort(function(a,b) {
                    if(a.level && b.level) {
                        return a.level - b.level;
                    }
                });
                contextHierarchyInfo.forEach(function(ctx) {
                    if(ctx.contextKey && contextHierarchy.indexOf(ctx.contextKey) < 0) {
                        contextHierarchy.push(ctx.contextKey);
                    }
                }, this);

                let contextModels = entityContextModel.data && entityContextModel.data.contexts ? entityContextModel.data.contexts : undefined;

                if (!_.isEmpty(contextModels)) {
                    for (let i = 0; i < contextModels.length; i++) {
                        let ctxModelItem = contextModels[i];
                        if (ctxModelItem && ctxModelItem.context) {
                            let dataContext = ctxModelItem.context;
                            if (DataHelper.compareObjects(dataContext, firstDataContext)) {
                                contextModel = ctxModelItem;
                                break;
                            }
                        }
                    }
                }
            }
        }

        return contextModel;
    }

    let contextModelManagerInstance;

    class ContextModelManager {
        constructor() {
            if (!contextModelManagerInstance) {
                _preInit();
                contextModelManagerInstance = this;
            }

            return contextModelManagerInstance;
        }

        async getByDomain(domain) {
            if (!_contextModels) {
                if (await _preInit()) {
                    return _contextModels[domain];
                }
            }

            return _contextModels ? _contextModels[domain] : undefined;
        }

        async getContextModelsBasedOnDomain(domain) {
            let contextModels = [];
            let domainContextModel = await this.getByDomain(domain);

            if (domainContextModel && domainContextModel.data) {
                contextModels = domainContextModel.data.contexts;
            }

            return contextModels;
        }

        async getEnhancerAttributeNamesBasedOnDomainAndContext(domain, dataContext) {
            if(!_.isEmpty(domain)) {
                if(_.isEmpty(_enhancerAttributesPerDomainAndContext) && !_contextModels) {
                    if(await _preInit()) {
                        return this._getEnhancerAttributeNamesBasedOnDomainAndContext(domain, dataContext);
                    }
                }

                return this._getEnhancerAttributeNamesBasedOnDomainAndContext(domain, dataContext);
            }
        }

        _getEnhancerAttributeNamesBasedOnDomainAndContext(domain, dataContext) {
            let enhancerAttributeNames = [];
            let contextKey = "self";

            if(!_.isEmpty(dataContext)) {
                contextKey = Object.keys(dataContext)[0];
            }

            let path = domain + "." + contextKey;
            if(DataHelper.isValidObjectPath(_enhancerAttributesPerDomainAndContext, path)) {
                enhancerAttributeNames = _enhancerAttributesPerDomainAndContext[domain][contextKey];
            }

            return enhancerAttributeNames;
        }

        async getContextTypesBasedOnDomain(domain) {
            if(!_.isEmpty(domain)) {
                if(_.isEmpty(_contexTypesPerDomain) && !_contextModels) {
                    if(await _preInit()) {
                        return _contexTypesPerDomain[domain];
                    }
                }

                return _contexTypesPerDomain[domain];
            }
        }

        getContextTypesBasedOnDomainSync(domain) {
            if(!_.isEmpty(domain) && !_.isEmpty(_contexTypesPerDomain)) {
                return _contexTypesPerDomain[domain];
            }
        }

        async getContextHeirarchyInfoBasedOnDomain(domain) {
            if(!_.isEmpty(domain)) {
                if(_.isEmpty(_contextHeirarchyInfoPerDomain) && !_contextModels) {
                    if(await _preInit()) {
                        return _contextHeirarchyInfoPerDomain[domain];
                    }
                }

                return _contextHeirarchyInfoPerDomain[domain];
            }
        }

        async getAllEnhancerAttributeNamesBasedOnDomain(domain) {
            if(!_.isEmpty(domain)) {
                if(_.isEmpty(_enhancerAttributesPerDomain) && !_contextModels) {
                    if(await _preInit()) {
                        return _enhancerAttributesPerDomain[domain];
                    }
                }

                return _enhancerAttributesPerDomain[domain];
            }
        }

        async preload() {
            return await _preInit();
        }
    }

    return contextModelManagerInstance = new ContextModelManager();
}());

export default ContextModelManager