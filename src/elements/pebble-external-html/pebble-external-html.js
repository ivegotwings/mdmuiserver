import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
class PebbleExternalHtml extends PolymerElement {
  static get template() {
    return html`

`;
  }

  static get is() {
      return 'pebble-external-html';
  }

  static get properties() {
      return {
          href: {
              type: String,
              value: '',
              observer: '_onhrefChange'
          },
          model: {
              type: Object,
              value: function () {
                  return {}
              },
          },
          fs: {
              type: Object,
              value: function () {
                  return {}
              },
          },
          html: {
              type: String,
              value: '',
              observer: '_onhtmlChange'
          }
      }
  }

  constructor() {
      super();
      this.attachModel(this.model);
  }

  /** Autostamp on connected */
  connectedCallback() {
      super.connectedCallback();

      this.isAttached = true;
      // Workaround for lack of inertness as for `<tempalte is="juicy-html">`.
      // Bellow is cheaper and simmpler than attaching shadow with display none
      // it does not give exactly the same behavior, but hopefully nobody would like to make it block.
  }

  disconnectedCallback() {
      this.isAttached = false;
      this.clear();
  }

  attachModel(model, arrayOfElements) {
      arrayOfElements || (arrayOfElements = this.stampedNodes);
      if (model === null || !arrayOfElements) {
          return;
      }
      for (let childNo = 0; childNo < arrayOfElements.length; childNo++) {
          arrayOfElements[childNo].model = model;
      }
  }

  /**
   * Skips/disregards pending request if any.
   */
  skipStampingPendingFile() {
      if (this.pending) {
          this.pending.onload = null;
      }
  }

  _onhtmlChange() {
      if (this.html) {
          this.reattachTemplate_(this.html);
      }
  }

  _onhrefChange() {
      if (this.href) {
          this._loadExternalFile(this.href);
      }

  }

  /**
   * Load the partial from the HTTP server/cache, via XHR.
   * @param  {String} url relative/absolute string to load the resource
   */
  _loadExternalFile(url) {
      let oReq = new XMLHttpRequest();
      let that = this;
      this.pending = oReq;
      oReq.onload = function (event) {
          that.pending = null;
          that.reattachTemplate_(event.target.responseText, oReq.status);
      };
      oReq.open("GET", url, true);
      oReq.send();
  }

  reattachTemplate_(html, statusCode) {
      this.clear();
      if (html === '') {
          if (statusCode === 204) {
              console.info('no content was returned for juicy-html', this);
          } else {
              console.warn('href given for juicy-html is an empty file', this);
          }
      }
      // fragmentFromString(strHTML) from http://stackoverflow.com/a/25214113/868184
      let range = document.createRange();

      let fragment = range.createContextualFragment(html);
      // convert dynamic NodeList to regullar array
      this.stampedNodes = Array.prototype.slice.call(fragment.childNodes);
      // attach models
      this.parentNode.insertBefore(fragment, this.nextSibling);
      RUFUtilities.templateRoot = this.parentNode;
      let eventData = {
          name: "stamped",
      };
      this.dispatchEvent(new CustomEvent('bedrock-event', {
          detail: eventData,
          bubbles: true,
          composed: true
      }));
      this.attachModel(this.model, this.stampedNodes);
  }

  /**
   * Remove stamped nodes.
   */
  clear() {
      let parent = this.parentNode;
      let childNo = this.stampedNodes && this.stampedNodes.length || 0;
      let child;
      while (childNo--) {
          // this.stampedNodes[childNo].remove();
          child = this.stampedNodes[childNo];
          if (child.parentNode) {
              child.parentNode.removeChild(child);
          }
      }
      // forget the removed nodes
      this.stampedNodes = null;
  }
}

customElements.define(PebbleExternalHtml.is, PebbleExternalHtml);
