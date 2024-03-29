class APIExternalCommunication {
    constructor() {
        if (!RUFUtilities.APIExternalCommunication) {
            RUFUtilities.APIExternalCommunication = this;
        }
    }
    static getInstance() {
        if (!RUFUtilities.APIExternalCommunication) {
            RUFUtilities.APIExternalCommunication = new APIExternalCommunication();
        }
        return RUFUtilities.APIExternalCommunication;
    }
    iframeRegister(externalUrl){
        if(externalUrl && !window.postMessageAttached){
            let tempAnchorTag = document.createElement('a');
            tempAnchorTag.href = externalUrl;
            if(tempAnchorTag.origin){
                let crossDomain = tempAnchorTag.origin;
                window.addEventListener('message', (ev) => {
                    if(ev.origin != crossDomain){
                        return;
                    }
                    window.postMessageAttached = true;
                    if(!_.isEmpty(ev.data)){
                        let eventData = ev.data;
                        if(!_.isEmpty(eventData.message) && eventData.message.type){
                            if(eventData.message.type == "TOAST"){
                                this._showErrorToast(eventData.message.data);
                                return;
                            }
                            if(eventData.message.type == "DIALOG"){
                                this._showDialog(eventData.message.data, true, eventData);
                            }
                        }else{
                            if(!_.isEmpty(eventData.data)){
                                ComponentHelper.appRoute(eventData.page, eventData.data);
                            }else if(!_.isEmpty(eventData.filterData)){
                                this.redirectToSearch(eventData);
                            }
                        }
                    }
                    
                }, false);
            }
            tempAnchorTag = null;
        }
    }

    redirectToSearch(externalData){
        if(!externalData.page || !externalData.filterData){
            return;
        }
        let page = externalData.page;
        let filterData = externalData.filterData;

        if(!_.isEmpty(filterData)){
            let mappedContexts = [];
            //Source and Locales
            if(!_.isEmpty(filterData.locales) && !_.isEmpty(filterData.sources)){
                filterData.locales.forEach(locale => {
                    filterData.sources.forEach(source => {
                        if(source.internal && locale.internal){
                            let valueContext = {
                                source:source.internal,
                                locale:locale.internal
                            }   
                            mappedContexts.push(valueContext);
                        }
                    })
                });
                delete filterData.locales;
                delete filterData.sources;
            }
            //Contexts
            if(!_.isEmpty(filterData.contexts)){
                filterData.contexts.forEach( context => {
                    if(context.internal && !_.isEmpty(context.values)){
                        context.values.forEach( valueData => {
                            let contextData = {}
                            contextData[context.internal] = valueData;
                            mappedContexts.push(contextData);
                        });
                    }
                })
                delete filterData.contexts;
            }

            if(!_.isEmpty(mappedContexts)){
                filterData.mappedContextsString = JSON.stringify(mappedContexts);
            }
            //Workflow
            if(!_.isEmpty(filterData.workflowNames)){
                if(filterData.workflowNames.length == 1){
                    if(_.isEmpty(filterData.workflowActivityNames)){
                        this._showInfoToast('Please select workflow activity');
                        return;
                    }
                    let currentWorkflow = filterData.workflowNames[0];
                    filterData.wfName = currentWorkflow.external;
                    filterData.wfShortName = currentWorkflow.internal;
                    delete filterData.workflowNames;
                }
            }
            if(!_.isEmpty(filterData.workflowActivityNames)){
                if(_.isEmpty(filterData.wfName)){
                    this._showInfoToast('Please select workflow.');
                    return;
                }
                let activity = filterData.workflowActivityNames[0];
                filterData.wfActivityExternalName = activity.external;
                filterData.wfActivityName = activity.internal;
                delete filterData.workflowActivityNames;
            }

            //Attributes
            if(!_.isEmpty(filterData.attributes)){
                let attributes = {};
                filterData.attributes.forEach( attr => {
                    attributes[attr.internal] = attr.values;
                })
                delete filterData.attributes;
                filterData.attributes = attributes;
            }
            let mainApp = RUFUtilities.mainApp;
            mainApp.setState(filterData);
            let encodedData = {state: mainApp.getQueryParamFromState()};
            ComponentHelper.appRoute(page, encodedData);
        }
    }
    
    _showDialog(msg, showOk, filterData){
        let eventData = {
            showOk: showOk,
            message:msg,
            data:filterData
        };
        ComponentHelper.fireBedrockEvent("iframe-open-dialog", eventData, {
            ignoreId: true
        });
    }
    _showErrorToast(msg){
        this._showToast('ERROR', msg)
    }
    _showInfoToast(msg){
        this._showToast('INFO', msg)
    }
    _showToast(type, message){
        let toastElement = RUFUtilities.pebbleAppToast;
        toastElement.fitInto = RUFUtilities.appCommon.shadowRoot.querySelector("#toastArea");
        if(type == "ERROR"){
            toastElement.toastType = "error";
        }else if(type == "INFO"){
            toastElement.toastType = "information";
        }
        toastElement.autoClose = true;
        RUFUtilities.appCommon.toastText = message;
        toastElement.show();
    }
}

export default APIExternalCommunication;