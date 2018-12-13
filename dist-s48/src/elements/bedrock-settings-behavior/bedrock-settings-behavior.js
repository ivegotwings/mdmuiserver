import '@polymer/polymer/polymer-legacy.js';
/***
* `RUFBehaviors.SettingsBehavior` provides common properties and methods that must be  implemented for all
* elements and components.
*
* `RUFBehaviors.SettingsBehavior` has method to initializ global settings and to get global setting.
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
*               RUFBehaviors.SettingsBehavior
*             ],
*
*             properties: {
*              
*             }
*           });
*        &lt;/script>
*     </dom-module>
* @demo demo/index.html
* @polymerBehavior RUFBehaviors.SettingsBehavior
*/

window.RUFBehaviors = window.RUFBehaviors || {};
/** @polymerBehavior RUFBehaviors.SettingsBehavior */
RUFBehaviors.SettingsBehavior = {

    properties: {
        /**
        * Indicates full global settings object.
        */
        _globalSettings: {
            type: Object
        }
    },

    /**
    * Initializes global settings provided in main-app config. 
    */
    initGlobalSettings: function (config) {
        RUFBehaviors.SettingsBehavior._globalSettings = config;
    },

    /**
    * Get global settings value based on key name.
    */
    appSetting: function (key) {
        let value;

        if(RUFBehaviors.SettingsBehavior._globalSettings && RUFBehaviors.SettingsBehavior._globalSettings[key]) {
            value = RUFBehaviors.SettingsBehavior._globalSettings[key];
        }

        return value;
    }
};
