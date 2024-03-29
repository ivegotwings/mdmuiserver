import '@polymer/polymer/polymer-legacy.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-app-context-behavior/bedrock-app-context-behavior.js';
/***
* `RUFBehaviors.AppBehavior` provides common properties and methods that must be implemented across all
* the Apps. It is a mandatory behavior for all apps to implement.
*
* The App flows use multiple properties defined in the `RUFBehaviors.AppBehavior`.
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
*               RUFBehaviors.AppBehavior
*             ],
*
*             properties: {
*              
*             }
*           });
*        &lt;/script>
*     </dom-module>
* @demo demo/index.html
* @polymerBehavior RUFBehaviors.AppBehavior
*/

window.RUFBehaviors = window.RUFBehaviors || {};
/** @polymerBehavior RUFBehaviors.AppBehavior */
RUFBehaviors.AppBehaviorImpl = {

    properties: {

        /**
        * Content is not appearing - Specifies whether or not the component is Riversand UI Framework's App. 
        */
        isRufApp: {
            type: Boolean,
            value: true
        },

      /**
        * Content is not appearing - Content development is under progress.
        */
        contentHeightVariable: {
            type: String,
            value: ""
        }
    },

    /**
      * Content is not appearing - Content development is under progress.
      */
    openBusinessFunctionDialog(detail, sharedData) {
        if(!this.contextData) return;

        const _sharedData = Object.assign({
            "context-data": DataHelper.cloneObject(this.contextData),
        }, sharedData);

        const data = Object.assign({
            contextData: _sharedData["context-data"],
        }, detail);

        data.sharedData = _sharedData;

        let eventData = {
            data,
            name: "business-dialog-opened",
        };

        this.dispatchEvent(new CustomEvent('bedrock-event',{detail:eventData, bubbles:true, composed:true}));
    }
};
/** @polymerBehavior */
RUFBehaviors.AppBehavior = [RUFBehaviors.UIBehavior, RUFBehaviors.AppBehaviorImpl];
