import '@polymer/polymer/polymer-legacy.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-helpers/data-helper.js';
/***
 * `RUFBehaviors.BusinessFunctionBehavior` provides common properties and methods 
 * that must be implemented for all the business functions in the framework.
 *
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
*               RUFBehaviors.BusinessFunctionBehavior
*             ],
*
*             properties: {
*
*             }
*           });
 *        &lt;/script>
 *     </dom-module>
 * @demo demo/index.html
 * @polymerBehavior RUFBehaviors.BusinessFunctionBehavior
 */

window.RUFBehaviors = window.RUFBehaviors || {};
/** @polymerBehavior RUFBehaviors.BusinessFunctionBehavior */
RUFBehaviors.BusinessFunctionBehaviorImpl = {
    properties: {
        /**
           * Content is not appearing - Content development is under progress. 
           */
        name: {
            type: String
        },
        /**
          * Content is not appearing - Content development is under progress. 
          */
        configName: {
            type: String
        },
        /**
          * Content is not appearing - Content development is under progress. 
          */
        config: {
            type: Object,
            value: function () { return {}; }
        },
        /**
          * Content is not appearing - Content development is under progress. 
          */
        context: {
            type: Object,
            value: function () { return {}; }
        },
        /**
          * Content is not appearing - Content development is under progress. 
          */
        properties: {
            type: Object,
            value: function () { return {}; }
        },
        wizardConfig: {
            type: Object,
            value: function () { return {}; }
        },
        sharedData: {
            type: Object,
            value: function () {
                return {};
            }
        },
        noSteps: {
            type: Boolean,
            value: false
        },
        noDataMessage: {
            type: String,
            value: ""
        }
    },
    observers: [
        '_configChanged(config)'
    ],
    get wizard() {
        this._wizard = this._wizard || this.shadowRoot.querySelector('rock-wizard');
        return this._wizard;
    },
    /**
      * Content is not appearing - Content development is under progress. 
      */
    getIsDirty: function () {
        if (this.wizard) {
            return this.wizard.getIsDirty();
        }
    },

    _configChanged: function () {
        if (this.config && this.config.stepProviderComponent) {
            this._importStepProvider(this.config.stepProviderComponent);
        } else {
            this.set("wizardConfig", {});
            this.set("wizardConfig", this.config);
        }
    },
    _importStepProvider: function (component) {
        this._stepProviders = this._stepProviders || this.shadowRoot.querySelector("#stepProviders");
        ComponentHelper.loadContent(this._stepProviders, component, this, this._stepProviderCreated.bind(this));
    },
    _stepProviderCreated: function (stepProviderElement) {
        if (stepProviderElement && stepProviderElement.getSteps) {
            stepProviderElement.getSteps(this.sharedData, this._stepProviderCallback.bind(this));
        }
    },
    _stepProviderCallback: function (steps, dynamicDataForSteps) {
        if(!_.isEmpty(dynamicDataForSteps)) {
            for (let prop in dynamicDataForSteps) {
                this.sharedData[prop] = dynamicDataForSteps[prop];
            }
        }
        if (!_.isEmpty(steps)) {
            let wizardConfig = DataHelper.cloneObject(this.config);
            wizardConfig.steps = steps;
            this.set("noSteps", false);
            this.set("wizardConfig", wizardConfig);
        } else {
            this.set("noSteps", true);
        }
    },
};
/** @polymerBehavior */
RUFBehaviors.BusinessFunctionBehavior = [RUFBehaviors.BusinessFunctionBehaviorImpl];
