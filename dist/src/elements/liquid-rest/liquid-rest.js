/**
    <b><i>Content development is under progress... </b></i>
    @demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '../bedrock-helpers/data-helper.js';
import '../liquid-base-behavior/liquid-base-behavior.js';

class LiquidRest
    extends mixinBehaviors([
        RUFBehaviors.LiquidBaseBehavior
    ], PolymerElement) {
  
        static get template() {
    return html`
    `;
  }

  static get is() { return 'liquid-rest' }

  constructor() {
    super();
  }

  static get properties() {
    return {
        /**
         * Indicates the URL target of the request.
         */
        url: {
            type: String
        },

        /**
         * Indicates an object that contains the query parameters which are appended to the
         * specified `url` when generating the request. If you wish to set the body
         * content when you make a POST request, you must use the `request-data` property
         * instead.
         */
        params: {
            type: Object,
            value: function () {
                return {};
            }
        },

        /**
         * Indicates the HTTP method to use such as 'GET', 'POST', 'PUT', or 'DELETE'.
         * Default is 'GET'.
         */
        method: {
            type: String,
            value: "GET"
        },

        /**
         * Indicates the HTTP request headers to send.
         *
         * Example
         *
         *     <iron-ajax
         *         auto
         *         url="http://somesite.com"
         *         headers='{"X-Requested-With": "XMLHttpRequest"}'
         *         handle-as="json"></iron-ajax>
         *
         * Note: The value of the `Content-Type` header overrides the value
         * of the `contentType` property of this element.
         */
        headers: {
            type: Object,
            value: function () {
                return {};
            }
        },

        /**
         * Indicates the type of the content to use when you send the data. If `contentType`
         * is set and `Content-Type` header is specified in the `headers`,
         * the value of the `headers` takes precedence.
         *
         * It alters the handling of the `body` parameter.
         */
        contentType: {
            type: String,
            value: "application/json"
        }
      }
    }
        /**
     * Can be used to generate the requests.
     *
     */
    generateRequest () {
        let ironAjax = document.createElement("iron-ajax");
        ironAjax.url = this.url;
        ironAjax.method = "POST";
        ironAjax.contentType = this.contentType;
        ironAjax.headers = this.headers;
        ironAjax.params = this.params;
        ironAjax.body = this.requestData;
        ironAjax.handleAs = "json";
        DataHelper.oneTimeEvent(ironAjax, "response", this._onResponse.bind(this));
        DataHelper.oneTimeEvent(ironAjax, "error", this._onError.bind(this));
        ironAjax.generateRequest();
    }

    _onResponse (e) {
        let eventDetail = {
            "request": {
                "requestData": this.requestData
            },
            "response": e.detail.response
        };
        this.dispatchEvent(new CustomEvent("liquid-response", { detail:eventDetail, bubbles:this.bubbles, composed:true}));
        this.dispatchEvent(new CustomEvent("response", { detail:eventDetail, bubbles:this.bubbles, composed:true}));
        this.cancelBubble = true;
    }

    _onError (e) {
        this.dispatchEvent(new CustomEvent("liquid-error", {detail:e, bubbles:this.bubbles, composed:true}));
        this.dispatchEvent(new CustomEvent("error", { detail:e, bubbles:this.bubbles, composed:true}));
        this.cancelBubble = true;
    }
}

customElements.define(LiquidRest.is, LiquidRest);
