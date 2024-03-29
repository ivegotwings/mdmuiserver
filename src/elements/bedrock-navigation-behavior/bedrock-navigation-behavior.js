import NavigationManager from '../bedrock-managers/navigation-manager.js';

window.RUFBehaviors = window.RUFBehaviors || {};

/** @polymerBehavior RUFBehaviors.NavigationBehavior */
RUFBehaviors.NavigationBehaviorImpl = {

    properties: {
        
    },
    /**
     * Content is not appearing - Content development is under progress. 
     */
    attached: function () {
        this.refreshNavigationContexts();
    },
    
    //Get navigation context for cross-app communication
    // Example : entity-manage page requires search-discovery page context-selector navigationContexts
    getNavigationData: function(component, childComponent, _domain, _page){
        let navManager = NavigationManager.getInstance();
        if(navManager){
            return navManager.getNavData(component, childComponent, _page)
        }
    },
    
    //Set Navigation context for a component
    setNavigationData: function(component, property, value, page, entityId){
        let navManager = NavigationManager.getInstance();
        if(navManager){
            return navManager.setNavData(component, null, property, value, page, entityId)
        }
    },
    //Set Navigation context for a child component
    setChildNavigationData: function(component, childComponent, property, value, page, entityId){
        let navManager = NavigationManager.getInstance();
        if(navManager){
            return navManager.setNavData(component, childComponent, property, value, page, entityId)
        }
    },
    //refresh NavigationContexts in contextData
    refreshNavigationContexts: function(){
        let navData = this.getNavigationData(this.domain);
        if(navData && !_.isEmpty(navData)){
            this.contextData[ContextHelper.CONTEXT_TYPE_NAVIGATION] = [navData];
        }else{
            this.contextData[ContextHelper.CONTEXT_TYPE_NAVIGATION] = [];
        }
    }
    
};

/** @polymerBehavior */
RUFBehaviors.NavigationBehavior = [RUFBehaviors.NavigationBehaviorImpl];
