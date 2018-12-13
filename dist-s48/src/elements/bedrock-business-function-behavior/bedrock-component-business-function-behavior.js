import '@polymer/polymer/polymer-legacy.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-helpers/data-helper.js';
/***
 * `RUFBehaviors.ComponentBusinessFunctionBehavior` provides common properties and methods 
 * that must be implemented for all the business function components in the framework.
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
*               RUFBehaviors.ComponentBusinessFunctionBehavior
*             ],
*
*             properties: {
*
*             }
*           });
 *        &lt;/script>
 *     </dom-module>
 * @demo demo/index.html
 * @polymerBehavior RUFBehaviors.ComponentBusinessFunctionBehavior
 */

window.RUFBehaviors = window.RUFBehaviors || {};
/** @polymerBehavior RUFBehaviors.ComponentBusinessFunctionBehavior */
RUFBehaviors.ComponentBusinessFunctionBehaviorImpl = {
    properties: {
        /**
         * Represents is component dirty or not
         */
        isComponentDirty: {
            type: Boolean,
            value: false
        },
        /**
         * Represents the final resul with status
         */
        componentResult: {
            type: Object,
            value: function () {
                return {
                    "status": "loaded",
                    "id": "",
                    "type": ""
                };
            }
        },
        /**
         * Represents data which can be passed to finsih step
         */
        finishStepData: {
            type: Object,
            value: function () { return {}; }
        },
        /**
         * Represents is it individual component or BF component
         */
        isPartOfBusinessFunction: {
            type: Boolean,
            value: false
        },
        /**
         * Represents BF config name
         */
        businessFunctionName: {
            type: String,
            value: ""
        }
    },

    //As per need, override the method
    getIsDirty: function () {
        return this.isComponentDirty;
    },

    dataFunctionComplete: function (data) {
        this.isComponentDirty = false;
        this.componentResult = {
            "status": "completed"
        }
        if (!_.isEmpty(data)) {
            for (let key in data) {
                this.componentResult[key] = data[key];
            }
        }
        ComponentHelper.fireBedrockEvent("business-function-step-complete", this.componentResult, { ignoreId: true });
    },

    getDataFunctionProperties: function () {
        let properties = {};
        if(this.domHost && this.domHost.getDataFunctionProperties) {
            properties = this.domHost.getDataFunctionProperties();
        }
        return properties;
    }
};
/** @polymerBehavior */
RUFBehaviors.ComponentBusinessFunctionBehavior = [RUFBehaviors.ComponentBusinessFunctionBehaviorImpl];
