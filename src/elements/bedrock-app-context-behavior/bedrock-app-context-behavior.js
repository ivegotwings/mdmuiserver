import '@polymer/polymer/polymer-legacy.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-externalref-falcor/bedrock-externalref-falcor.js';
/*
 * <i><b>Content development is under progress... </b></i>
 * @demo demo/index.html
 * @polymerBehavior RUFBehaviors.AppContextBehavior
 */
window.RUFBehaviors = window.RUFBehaviors || {};

RUFBehaviors.AppContextBehavior = {
    
    /**
      * Content is not appearing - Content development is under progress. 
      */
    ready: function () {
        this._setDefaultContexts();
    },
    properties: {
        /**
          * Content is not appearing - Content development is under progress. 
          */
        contextData: {
            type: Object,
            value: function () {
                return {};
            }
        },
        valContextKeys: {
            type: Object,
            value: function () {
                return ['source', 'locale'];
            }
        },
        /**
      * Content is not appearing - Content development is under progress. 
      */
        CONTEXT_TYPE_DOMAIN: {
            type: String,
            value: 'DomainContexts'
        },
        /**
       * Content is not appearing - Content development is under progress. 
       */
        CONTEXT_TYPE_DATA: {
            type: String,
            value: 'Contexts'
        },
        /**
          * Content is not appearing - Content development is under progress. 
          */
        CONTEXT_TYPE_VALUE: {
            type: String,
            value: 'ValContexts'
        },
        /**
          * Content is not appearing - Content development is under progress. 
          */
        CONTEXT_TYPE_ITEM: {
            type: String,
            value: 'ItemContexts'
        },
        /**
          * Content is not appearing - Content development is under progress. 
          */
        CONTEXT_TYPE_APP: {
            type: String,
            value: 'AppContexts'
        },
        /**
          * Content is not appearing - Content development is under progress. 
          */
        CONTEXT_TYPE_USER: {
            type: String,
            value: 'UserContexts'
        }
    },
    _setDefaultContexts: function () {
    },
    /**
      * Content is not appearing - Content development is under progress. 
      */
    getContexts: function (contextType) {
        return this.contextData[contextType] !== undefined ? this.contextData[contextType] : [];
    },
    /**
      * Content is not appearing - Content development is under progress. 
      */
    getDomainContexts: function () {
        return this.getContexts(this.CONTEXT_TYPE_DOMAIN);
    },
    /**
      * Content is not appearing - Content development is under progress. 
      */
    getDataContexts: function () {
        return this.getContexts(this.CONTEXT_TYPE_DATA);
    },
    /**
      * Content is not appearing - Content development is under progress. 
      */
    getItemContexts: function () {
        return this.getContexts(this.CONTEXT_TYPE_ITEM);
    },
    /**
      * Content is not appearing - Content development is under progress. 
      */
    getValueContexts: function () {
        return this.getContexts(this.CONTEXT_TYPE_VALUE);
    },
    /**
      * Content is not appearing - Content development is under progress. 
      */
    getUserContexts: function () {
        return this.getContexts(this.CONTEXT_TYPE_USER);
    },
    /**
      * Content is not appearing - Content development is under progress. 
      */
    getAppContexts: function () {
        return this.getContexts(this.CONTEXT_TYPE_APP);
    },
    /**
      * Content is not appearing - Content development is under progress. 
      */
    getConfigContexts: function () {
        //enhance this..
        let configContexts = _.createCartesianObjects(this._contextData);
        return configContexts;
    }
};
