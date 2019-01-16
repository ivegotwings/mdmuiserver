import '@polymer/polymer/polymer-legacy.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-externalref-falcor/bedrock-externalref-falcor.js';
import '../bedrock-helpers/context-helper.js';
/*
* <i><b>Content development is under progress... </b></i>
* @demo demo/index.html
* @polymerBehavior RUFBehaviors.ComponentContextBehavior
*/
window.RUFBehaviors = window.RUFBehaviors || {};
/** @polymerBehavior RUFBehaviors.ComponentContextBehavior */
RUFBehaviors.ComponentContextBehavior = {
    attached: function () { },
    ready: function () { },
    properties: {
        contextData: {
            type: Object,
            value: function () {
                return {};
            }
        }
    },
    /**
      * Content is not appearing - Content development is under progress. 
      */
    getContexts: function (contextType) {
        return this.contextData[contextType] || [];
    },
    /**
      * Content is not appearing - Content development is under progress. 
      */
    getFirstContext: function (contextType) {
        let contexts = this.contextData[contextType];
        if (contexts && contexts.length > 0) {
            return contexts[0];
        }
    },
    /**
     * Content is not appearing - Content development is under progress. 
     */
    getDomainContexts: function () {
        return this.getContexts(ContextHelper.CONTEXT_TYPE_DOMAIN);
    },
    /**
       * Content is not appearing - Content development is under progress. 
       */
    getDataContexts: function () {
        return this.getContexts(ContextHelper.CONTEXT_TYPE_DATA);
    },
    /**
      * Content is not appearing - Content development is under progress. 
      */
    getItemContexts: function () {
        return this.getContexts(ContextHelper.CONTEXT_TYPE_ITEM);
    },
    /**
      * Content is not appearing - Content development is under progress. 
      */
    getValueContexts: function () {
        return this.getContexts(ContextHelper.CONTEXT_TYPE_VALUE);
    },
    /**
      * Content is not appearing - Content development is under progress. 
      */
    getUserContexts: function () {
        return this.getContexts(ContextHelper.CONTEXT_TYPE_USER);
    },
    /**
      * Content is not appearing - Content development is under progress. 
      */
    getAppContexts: function () {
        return this.getContexts(ContextHelper.CONTEXT_TYPE_APP);
    },
    /**
     * Content is not appearing - Content development is under progress. 
    */
    getFirstDomainContext: function () {
        return this.getFirstContext(ContextHelper.CONTEXT_TYPE_DOMAIN);
    },
    /**
      * Content is not appearing - Content development is under progress. 
      */
    getFirstDataContext: function () {
        return this.getFirstContext(ContextHelper.CONTEXT_TYPE_DATA);
    },
    /**
      * Content is not appearing - Content development is under progress. 
      */
    getFirstValueContext: function () {
        return this.getFirstContext(ContextHelper.CONTEXT_TYPE_VALUE);
    },
    /**
      * Content is not appearing - Content development is under progress. 
      */
    getFirstItemContext: function () {
        return this.getFirstContext(ContextHelper.CONTEXT_TYPE_ITEM);
    },
    /**
      * Content is not appearing - Content development is under progress. 
      */
    getFirstAppContext: function () {
        return this.getFirstContext(ContextHelper.CONTEXT_TYPE_APP);
    }
};
