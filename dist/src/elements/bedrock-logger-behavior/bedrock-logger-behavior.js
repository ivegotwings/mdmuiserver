import '@polymer/polymer/polymer-legacy.js';
import '../bedrock-i18n/bedrock-i18n.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
/***
 * `RUFBehaviors.LoggerBehavior` provides logging behavior.
 *
 * `RUFBehaviors.LoggerBehavior` has different methods to log information, warning and error.
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
 *               RUFBehaviors.LoggerBehavior
 *             ],
 *
 *             properties: {
 *
 *             }
 *           });
 *        &lt;/script>
 *     </dom-module>
 *
 */
/** @polymerBehavior RUFBehaviors.LoggerBehaviorImpl */
window.RUFBehaviors = window.RUFBehaviors || {};
RUFBehaviors.LoggerBehaviorImpl = {

    properties: {
        isComponentErrored: {
            type: Boolean,
            value: false
        }
    },
    /**
     * Content is not appearing - Content development is under progress. 
     */
    attached: function () {},

    _getExceptionMessage: function (ex) {
        if (ex.message) {
            return ex.message;
        } else if (ex.description) {
            return ex.description;
        } else {
            return DataHelper.toStr(ex);
        }
    },

    _getUrlFileName: function (url) {
        let lastSlashIndex = Math.max(url.lastIndexOf("/"), url.lastIndexOf("\\"));
        return url.substr(lastSlashIndex + 1);
    },

    _formatException: function (ex) {
        if (ex) {
            let exStr = "Exception: " + this._getExceptionMessage(ex);
            if (ex.lineNumber) {
                exStr += " on line number " + ex.lineNumber;
            }
            if (ex.fileName) {
                exStr += " in file " + this._getUrlFileName(ex.fileName);
            }
            if (ex.stack) {
                exStr += "\r\n" + "Stack trace:" + "\r\n" + ex.stack;
            }
            return exStr;
        }
        return null;
    },

    logWarning: function () {
        let translatedMessage = this.localize().apply(this, arguments);
        RUFUtilities.Logger.warn(translatedMessage);
    },

    hasComponentErrored: function () {
        return this.isComponentErrored;
    },

    logError: function () {
        //TODO: translated message and formatted exceptions are not proper right now.
        //Hence logging direct message coming in arguments in console.
        let message = this.tagName + ":-" + arguments[0];
        let exceptionDetail = arguments[1] || {};
        let isCriticalError = arguments[2];
        /**
         * We need to make whole component errored only when the error is critical.
         * Not everytime logError is called.
         * */
        if (isCriticalError) {
            this.set('isComponentErrored', true);
        }
        let errorGUID = DataHelper.generateUUID();
        exceptionDetail["id"] = errorGUID;
        RUFUtilities.Logger.error("RUF_UI_ERROR", exceptionDetail, "ui-platform");
        //arguments[4] or domContainer is an optional parameter which is sent in special cases only like main-app by default error-container is used.

        //debounce needed because as soon as we change the isComponentErrored...it takes time to reload UI
        //and we want to access "#error-container" only once UI is loaded.
        Debouncer.debounce(this._debouncer,
            timeOut.after(100), () => {
                this._injectDiv(message, arguments[4], arguments[3], exceptionDetail, isCriticalError)
            });
    },

    _injectDiv: function (message, domContainer, UIMessage, exceptionDetail, isCriticalError) {
        let errorContainer = domContainer;
        if (!errorContainer) {
            if (this.shadowRoot) {
                errorContainer = this.shadowRoot.querySelector("#error-container");
            }
        }

        console.error(message, exceptionDetail);
        
        if (isCriticalError && errorContainer) {
            let div = "<div class='default-message'>";
            if (UIMessage) {
                div = div + UIMessage;
            } else {
                div = div + "Component could not be loaded. Error Ref Id: " + exceptionDetail.id;
            }
            div = div + "</div>";
            errorContainer.innerHTML = div;
        }
    },

    logInfo: function () {
        // var translatedMessage = this.localize().apply(this, arguments);
        let transformedMessage = {};
        let logArguments = arguments;
        let keys = Object.keys(logArguments);
        if (!_.isEmpty(keys)) {
            keys.forEach(elm => {
                transformedMessage[elm] = logArguments[elm];
            });
            RUFUtilities.Logger.info(transformedMessage);
        }
    }
};

/** @polymerBehavior RUFBehaviors.LoggerBehavior */
RUFBehaviors.LoggerBehavior = [RUFBehaviors.Internationalization, RUFBehaviors.LoggerBehaviorImpl];
