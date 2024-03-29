import '@polymer/polymer/polymer-legacy.js';
import '../bedrock-helpers/element-helper.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-i18n/bedrock-i18n.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../bedrock-toast-behavior/bedrock-toast-behavior.js';
import '../bedrock-settings-behavior/bedrock-settings-behavior.js';
import '../bedrock-externalref-underscore/bedrock-externalref-underscore.js';
/***
 * `RUFBehaviors.UIBehavior` provides common properties and methods that must be  implemented for all
 * elements and components. It is a mandatory behavior for all elements and components to implement.
 *
 * `RUFBehaviors.UIBehavior` has multiple properties that are used in the context flow, authentication, and configuration.
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
 *               RUFBehaviors.UIBehavior
 *             ],
 *
 *             properties: {
 *              
 *             }
 *           });
 *        &lt;/script>
 *     </dom-module>
 * @demo demo/index.html
 * @polymerBehavior RUFBehaviors.UIBehavior
 */

window.RUFBehaviors = window.RUFBehaviors || {};
/** @polymerBehavior RUFBehaviors.UIBehavior */
RUFBehaviors.UIBehaviorImpl = {

    properties: {
        /**
         * Content is not appearing - Indicates html identification of the element. If it is not given, then unique identification 
         * gets created.
         */
        id: {
            type: String,
            // value: ""
        },
        /**
         * Content is not appearing - Indicates the tenant identification. It reads the tenant identification from the main App.
         */
        tenantId: {
            type: String,
            notify: true,
            value: function () {
                let mainApp = RUFUtilities.mainApp;
                if (mainApp) {
                    return mainApp.tenantId;
                }
                return "";
            }
        },
        /**
         * Content is not appearing - Indicates the role identification of the currently logged-in user. It reads the role identification 
         * from the main App.
         */
        roles: {
            type: String,
            notify: true,
            value: function () {
                let mainApp = RUFUtilities.mainApp;
                if (mainApp) {
                    return mainApp.roles;
                }
                return "";
            }
        },

        defaultRole: {
            type: String,
            notify: true,
            value: function () {
                let mainApp = RUFUtilities.mainApp;
                if (mainApp) {
                    return mainApp.defaultRole;
                }
                return "";
            }
        },

        /**
         * Content is not appearing - Indicates the user identification of the currently logged-in user. It reads the user identification 
         * from the main App.
         */
        userId: {
            type: String,
            notify: true,
            value: function () {
                let mainApp = RUFUtilities.mainApp;
                if (mainApp) {
                    return mainApp.userId;
                }
                return "";
            }
        },
        /**
         * Indicates the ownership data of the currently logged-in user. It reads the ownership data identification 
         * from the main App.
         */
        ownershipData: {
            type: String,
            notify: true,
            value: function () {
                let mainApp = RUFUtilities.mainApp;
                if (mainApp) {
                    return mainApp.ownershipData;
                }
                return "";
            }
        },

        /**
         * Content is not appearing - Indicates an App identification. There is no need to pass this value when you use it.
         */
        appId: {
            type: String,
            value: function () {
                return this.getAppId();
            }
        },
        state: {
            type: Object,
            value: function () {
                return {};
            }
        },
        /**
         * Content is not appearing - Specifies whether or not the component is Riversand UI Framework's element or component.
         */
        isRufComponent: {
            type: Boolean,
            value: true,
            reflectToAttribute: true
        }
    },
    /**
     * Content is not appearing - Content development is under progress. 
     */
    attached: function () {
        if (this && (!this.id || this.id == "")) {
            this.id = ElementHelper.getRandomId();
        }
        if (this && (!this.appId || this.appId == "")) {
            this.appId = this.getAppId();
        }
    },
    /**
     * Content is not appearing - Can be used to fire the bedrock event.
     *
     * @method fireBedrockEvent
     * @param {(String)} name The name of the event
     * @param {(Object)} data The detail object for the event
     */
    fireBedrockEvent: function (name, data, settings) {
        return ComponentHelper.fireBedrockEvent(name, data, settings, this);
    },
    /**
     * Content is not appearing - Content development is under progress. 
     */
    getAppId: function () {
        let appId = "";
        let componentContainer = ComponentHelper.getParentElement(this);

        if (componentContainer && componentContainer.localName == "main-app") {
            if (componentContainer.id) {
                appId = componentContainer.id;
            }
        } else {
            let viewComponent = ComponentHelper.getCurrentActiveApp();
            if (viewComponent) {
                appId = viewComponent.id;
            }
        }

        return appId;
    },
    isNullOrEmpty: function (val, fallbackVal) {
        return _.isNullOrEmpty(val, fallbackVal);
    },

    getProp: function (attr) {
        return this.getAttribute(attr);
    },


    /**
     * Use this to get the state query param from the state object. 
     */

    getQueryParamFromState: function () {
        return encodeURIComponent(JSON.stringify(this.getState()));
    },

    /**
     * Pass JSON object
     * state : {
     *      domain: "thing",
     *      type: "business-rule"
     * }
     * */

    setState: function (state) {
        this.state = state;
    },

    /**
     * Returns Entire State Object
     * */

    getState: function () {
        return this.state;
    }
};

/** @polymerBehavior */
RUFBehaviors.UIBehavior = [RUFBehaviors.SettingsBehavior, RUFBehaviors.LoggerBehavior, RUFBehaviors.ToastBehavior, RUFBehaviors.UIBehaviorImpl];
