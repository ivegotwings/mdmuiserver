import '@polymer/polymer/polymer-legacy.js';
/**
* <i><b>Content development is under progress... </b></i>
* @demo demo/index.html
* @polymerBehavior RUFBehaviors.LiquidBaseBehavior
*/
window.RUFBehaviors = window.RUFBehaviors || {};
/** @polymerBehavior RUFBehaviors.LiquidBaseBehavior */
RUFBehaviors.LiquidBaseBehavior = {
    /**
     * Content is not appearing - Specifies whether or not the current element is hidden from the `dom`.
     */
    hostAttributes: {
        hidden: true
    },
    /**
        * Content is not appearing - Content development is under progress.
        */
    attached: function () { },
    /**
        * Content is not appearing - Content development is under progress.
        */
    ready: function () { },
    properties: {
        /**
         * Content is not appearing -
         * Specifies whether or not an Ajax request is automatically performed when either `url` or `params` changes.
         * If it is set to <b>true</b>, an Ajax request is automatically performed.
         *
         */
        auto: {
            type: Boolean,
            value: false
        },
        /**
         * Content is not appearing - Indicates the most recent request made by this `iron-ajax` element.
         */
        lastRequest: {
            type: Object,
            value: function (){
                return {};
            },
            notify: true,
            readOnly: true
        },
        /**
         * Content is not appearing - Content development is under progress.
         * True while lastRequest is in flight.
         */
        loading: {
            type: Boolean,
            notify: true,
            readOnly: true
        },
        /**
         * Content is not appearing -
         * Indicates the `lastRequest`'s response.
         *
         * Note that `lastResponse` and `lastError` are set when `lastRequest` finishes.
         * If `loading` is set to <b>true</b>, then `lastResponse` and `lastError` corresponds
         * to the result of the previous request.
         *
         * The value of `handleAs` at the request generation time determines the type of the response..
         *
         * @type {Object}
         */
        lastResponse: {
            type: Object,
            value: function (){
                return {};
            },
            notify: true,
            readOnly: true
        },
        /**
         * Content is not appearing - Indicates the `lastRequest`'s error, if any.
         *
         * @type {Object}
         */
        lastError: {
            type: Object,
            value: function (){
                return {};
            },
            notify: true,
            readOnly: true
        },
        /**
         * Content is not appearing - Indicates an array of all in-flight requests
         * originating from this `iron-ajax` element.
         */
        activeRequests: {
            type: Array,
            value: function () {
                return [];
            },
            notify: true,
            readOnly: true
        },
        /**
         * Content is not appearing - Indicates the length of time in milliseconds
         * to debounce multiple automatically generated requests.
         */
        debounceDuration: {
            type: Number,
            value: 0,
            notify: true
        },
        /**
         * Content is not appearing - Specifies whether or not the liquid-element-*'s events bubbles.
         * By default, liquid-element-*'s events bubble. Setting this attribute causes its events such as
         * request, response, `iron-ajax-request`, `iron-ajax-response`, and `iron-ajax-error`
         * to bubble to the window object. Note that the vanilla error event never bubbles when
         * using shadow `dom` even if `this.bubbles` is set to true. This is because of the following reasons:
         *     1) A scoped flag is not passed with it (first link).
         *     2) The `shadow dom` specifications does not allow certain events including events
         * such as `named error` to leak outside of shadow trees (second link).
         * https://www.w3.org/TR/shadow-dom/#scoped-flag
         * https://www.w3.org/TR/2015/WD-shadow-dom-20151215/#events-that-are-not-leaked-into-ancestor-trees
         */
        bubbles: {
            type: Boolean,
            value: false
        },
        /**
         * Content is not appearing - Specifies whether or not error messages are automatically logged to the console.
         * If it is set to <b>true</b>, error messages are automatically logged to the console.
         */
        verbose: {
            type: Boolean,
            value: false
        },
        /**
         * Content is not appearing - Indicates the timeout flag which you can set on the request.
         */
        timeout: {
            type: Number,
            value: 0
        },
        /**
        * Content is not appearing - Content development is under progress.
        */
        requestData: {
            type: Object,
            value: function () {
                return {};
            },
            notify: true
        },
        /**
         * Prefix to be stripped from a JSON response before parsing it.
         *
         * In order to prevent an attack using CSRF with Array responses
         * (http://haacked.com/archive/2008/11/20/anatomy-of-a-subtle-json-vulnerability.aspx/)
         * many backends will mitigate this by prefixing all JSON response bodies
         * with a string that would be nonsensical to a JavaScript parser.
         *
         */
        _jsonPrefix: {
            type: String,
            value: ""
        }
    },
    /**
        * Content is not appearing - Content development is under progress.
        */
    generateRequest: function () {
        //abstract method....do nothing...all elements implementing this behavior must implement this method
    }
};
