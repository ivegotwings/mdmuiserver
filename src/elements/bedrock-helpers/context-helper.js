window.ContextHelper = window.ContextHelper || {};

ContextHelper.CONTEXT_TYPE_DOMAIN = 'DomainContexts';
ContextHelper.CONTEXT_TYPE_DATA = 'Contexts';
ContextHelper.CONTEXT_TYPE_VALUE = 'ValContexts';
ContextHelper.CONTEXT_TYPE_ITEM = 'ItemContexts';
ContextHelper.CONTEXT_TYPE_APP = 'AppContexts';
ContextHelper.CONTEXT_TYPE_USER = 'UserContexts';
ContextHelper.CONTEXT_TYPE_RELATIONSHIP = 'RelationshipContexts';
ContextHelper.CONTEXT_TYPE_NAVIGATION = 'NavigationContexts';

ContextHelper.valContextKeys = ['source', 'locale'];
ContextHelper.appContextKeys = ['app'];
ContextHelper.domainContextKeys = ['domain'];

ContextHelper.getContexts = function (contextData, contextType) {
    return contextData[contextType] !== undefined ? contextData[contextType] : [];
};

ContextHelper.getFirstContext = function (contextData, contextType) {
    let contexts = contextData[contextType];
    if (contexts && contexts.length > 0) {
        return contexts[0];
    }

    return undefined;
};

ContextHelper.getDomainContexts = function (contextData) {
    return ContextHelper.getContexts(contextData, ContextHelper.CONTEXT_TYPE_DOMAIN);
};

ContextHelper.getDataContexts = function (contextData) {
    return ContextHelper.getContexts(contextData, ContextHelper.CONTEXT_TYPE_DATA);
};

ContextHelper.getItemContexts = function (contextData) {
    return ContextHelper.getContexts(contextData, ContextHelper.CONTEXT_TYPE_ITEM);
};

ContextHelper.getValueContexts = function (contextData) {
    let valueContexts = ContextHelper.getContexts(contextData, ContextHelper.CONTEXT_TYPE_VALUE);
    return valueContexts;
};

ContextHelper.getUserContexts = function (contextData) {
    return ContextHelper.getContexts(contextData, ContextHelper.CONTEXT_TYPE_USER);
};

ContextHelper.getAppContexts = function (contextData) {
    return ContextHelper.getContexts(contextData, ContextHelper.CONTEXT_TYPE_APP);
};

ContextHelper.getRelationshipContexts = function (contextData) {
    return ContextHelper.getContexts(contextData, ContextHelper.CONTEXT_TYPE_RELATIONSHIP);
};

ContextHelper.getFirstDomainContext = function (contextData) {
    return ContextHelper.getFirstContext(contextData, ContextHelper.CONTEXT_TYPE_DOMAIN);
};

ContextHelper.getFirstDataContext = function (contextData) {
    return ContextHelper.getFirstContext(contextData, ContextHelper.CONTEXT_TYPE_DATA);
};

ContextHelper.getFirstValueContext = function (contextData) {
    return ContextHelper.getFirstContext(contextData, ContextHelper.CONTEXT_TYPE_VALUE);
};

ContextHelper.getFirstItemContext = function (contextData) {
    return ContextHelper.getFirstContext(contextData, ContextHelper.CONTEXT_TYPE_ITEM);
};

ContextHelper.getFirstUserContext = function (contextData) {
    return ContextHelper.getFirstContext(contextData, ContextHelper.CONTEXT_TYPE_USER);
};

ContextHelper.getFirstAppContext = function (contextData) {
    return ContextHelper.getFirstContext(contextData, ContextHelper.CONTEXT_TYPE_APP);
};

ContextHelper.getFirstRelationshipContext = function (contextData) {
    return ContextHelper.getFirstContext(contextData, ContextHelper.CONTEXT_TYPE_RELATIONSHIP);
};

ContextHelper.updateContext = function (contextData, contextType, contexts) {
    contextData[contextType] = contexts;
};

ContextHelper.createContextDataFromFlatValue = function (selContextsFlat, contextType) {
    if (!_.isEmpty(selContextsFlat)) {
        for (let key in selContextsFlat) {
            let val = selContextsFlat[key];
            if (!(val && val.length)) {
                delete selContextsFlat[key]
            }
        }

        if(_.isEmpty(selContextsFlat)) {
            return [];
        } else if(contextType === "data") {
            let ctxData = [];
            Object.keys(selContextsFlat).forEach(function(ctxKey) {
                let flatContexts = {};
                flatContexts[ctxKey] = selContextsFlat[ctxKey];
                ctxData = ctxData.concat(_.createCartesianObjects(flatContexts));
            }, this);

            return ctxData;
        } else {
            return _.createCartesianObjects(selContextsFlat);
        }
    }
};

ContextHelper.updateContextData = function (contextData, newDimensions) {
    if (_.isEmpty(newDimensions)) {
        return;
    }

    let selDataContextsFlat = {};
    let selValContextsFlat = {};
    let selAppContextsFlat = {};
    let selDomainContextsFlat = {};

    // scope out data contexts vs val contexts
    Object.keys(newDimensions).map(function (dimName) {
        let dimValues = newDimensions[dimName];
        if (ContextHelper.valContextKeys.indexOf(dimName) > -1) { // is this val context?
            selValContextsFlat[dimName] = dimValues;
        } else if (ContextHelper.appContextKeys.indexOf(dimName) > -1) { // is this val context?
            selAppContextsFlat[dimName] = dimValues;
        } else if (ContextHelper.domainContextKeys.indexOf(dimName) > -1) { // is this val context?
            selDomainContextsFlat[dimName] = dimValues;
        }
        else {
            selDataContextsFlat[dimName] = dimValues;
        }
    });

    if (!_.isEmpty(selDataContextsFlat)) {
        contextData[ContextHelper.CONTEXT_TYPE_DATA] = ContextHelper.createContextDataFromFlatValue(selDataContextsFlat, "data");
    }

    if (!_.isEmpty(selValContextsFlat)) {
        contextData[ContextHelper.CONTEXT_TYPE_VALUE] = ContextHelper.createContextDataFromFlatValue(selValContextsFlat);
    }

    if (!_.isEmpty(selAppContextsFlat)) {
        contextData[ContextHelper.CONTEXT_TYPE_APP] = ContextHelper.createContextDataFromFlatValue(selAppContextsFlat);
    }

    if (!_.isEmpty(selDomainContextsFlat)) {
        contextData[ContextHelper.CONTEXT_TYPE_DOMAIN] = ContextHelper.createContextDataFromFlatValue(selDomainContextsFlat);
    }
}

ContextHelper.addDefaultValContext = function (contextData) {
    let checkDefaultLocale = false;
    if (contextData && !_.isEmpty(contextData)) {
        let valContexts = contextData[ContextHelper.CONTEXT_TYPE_VALUE] || [];
        if (valContexts && valContexts.length) {
            let defaultLocale = DataHelper.getDefaultLocale();
            valContexts.forEach(function (valCtx) {
                if (valCtx.locale == defaultLocale) {
                    checkDefaultLocale = true;
                }
            });
        }
        if (!checkDefaultLocale) {
            contextData[ContextHelper.CONTEXT_TYPE_VALUE] = [];
            contextData[ContextHelper.CONTEXT_TYPE_VALUE].push(DataHelper.getDefaultValContext());
        }
    }
}

ContextHelper.createWorkflowContexts = function(wfDefinitionMappingModel, contextData) {
    let workflowContexts = [];
    let dataContexts = ContextHelper.getDataContexts(contextData);
    let clonedDataContexts = !_.isEmpty(dataContexts) ? DataHelper.cloneObject(dataContexts) : [];
    let mergedWorkflows = {};

    if (!_.isEmpty(clonedDataContexts)) {
        for (let i = 0; i < clonedDataContexts.length; i++) {
            let firstDataContext = clonedDataContexts[i];
            let ctxRelationships = SharedUtils.DataObjectFalcorUtil.getRelationshipsByCtx(wfDefinitionMappingModel, firstDataContext);
            mergedWorkflows = DataMergeHelper.mergeRelationships(mergedWorkflows, ctxRelationships, true);
            let mappedWorkflowNames = DataHelper.getRelToNames(mergedWorkflows.hasWorkflowsDefined);

            if(!_.isEmpty(mappedWorkflowNames)) {
                mappedWorkflowNames.forEach(function(workflowName) {
                    let workflowContext = DataHelper.cloneObject(firstDataContext);
                    workflowContext["workflow"] = workflowName;
                    workflowContexts.push(workflowContext); 
                });
            }
        }
    } else {
        if(DataHelper.isValidObjectPath(wfDefinitionMappingModel, "data.relationships")) {
            mergedWorkflows = DataMergeHelper.mergeRelationships(mergedWorkflows, wfDefinitionMappingModel.data.relationships, true);
            let mappedWorkflowNames = DataHelper.getRelToNames(mergedWorkflows.hasWorkflowsDefined);

            if(!_.isEmpty(mappedWorkflowNames)) {
                mappedWorkflowNames.forEach(function(workflowName) {
                    let workflowContext = {
                        "self": "self",
                        "workflow": workflowName
                    };
                    workflowContexts.push(workflowContext); 
                });
            }
        }
    }

    return workflowContexts;
};

ContextHelper.createContextForWorkflowActions = function(workflowContext) {
    let data = {};
    if(!_.isEmpty(workflowContext)) {
        let context = DataHelper.cloneObject(workflowContext);
        if(context["self"]) {
            delete context["self"];
        }
        if(context["workflow"]) {
            delete context["workflow"];
        }
        
        if(!_.isEmpty(context)) {
            let ctxObj = { "context": context };
            data["contexts"] = [ ctxObj ];
        }
    }

    return data;
}
