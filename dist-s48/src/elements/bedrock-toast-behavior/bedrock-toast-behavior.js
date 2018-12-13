import '@polymer/polymer/polymer-legacy.js';
/***
 * `RUFBehaviors.ToastBehavior` provides toast behavior.
 *
 * `RUFBehaviors.ToastBehavior` has different methods to log information, warning and error.
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
 *               RUFBehaviors.ToastBehavior
 *             ],
 *
 *             properties: {
 *
 *             }
 *           });
 *        &lt;/script>
 *     </dom-module>
 * @polymerBehavior RUFBehaviors.ToastBehavior
 */

window.RUFBehaviors = window.RUFBehaviors || {};
/** @polymerBehavior RUFBehaviors.ToastBehavior */
RUFBehaviors.ToastBehaviorImpl = {

    properties: {
    },
    /**
     * Content is not appearing - Content development is under progress. 
     */
    attached: function () {
    },


    showSuccessToast: function (...args) {
        this._showToast('success', ...args);
    },

    showErrorToast: function (...args) {
        this._showToast('error', ...args);
    },

    showInformationToast: function (...args) {
        this._showToast('information', ...args);
    },

    showWarningToast: function (...args) {
        this._showToast('warning', ...args);
    },

    _showToast(toastType, message, toastDuration = 5000) {
        let toastElement = this.getToast();

        if (!toastType || !RUFUtilities.appCommon || !toastElement) return;

        RUFUtilities.appCommon.toastText = message;
        toastElement.toastType = toastType;
        toastElement.heading = toastType.charAt(0).toUpperCase() + toastType.slice(1);
        if (typeof (toastDuration) !== "undefined") {
            toastElement.toastDuration = toastDuration;
        }
        toastElement.autoClose = true;
        toastElement.show();
    },
    /**
     * Content is not appearing - Content development is under progress. 
     */
    getToast: function () {
        return RUFUtilities.pebbleAppToast;
    }
};

/** @polymerBehavior */
RUFBehaviors.ToastBehavior = [RUFBehaviors.ToastBehaviorImpl];
