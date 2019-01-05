import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../rock-layout/rock-layout.js';
import '../pebble-iframe/pebble-iframe.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-gridsystem.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

class RockAnalyticsWidget
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior
    ], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-gridsystem bedrock-style-grid-layout">/* empty */</style>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <template is="dom-if" if="{{urlUnavailable}}">
                    <div class="msg default-message">
                        Analytics system is unavailable.
                        <template is="dom-if" if="{{iframeloadfailed}}">
                            <span> Try reloading after some time.</span>
                        </template>
                    </div>
                </template>
            </div>
            <div class="base-grid-structure-child-2">
                <template is="dom-if" if="{{!urlUnavailable}}">
                    <pebble-iframe timeout="[[timeout]]" source="[[embedUrl]]"></pebble-iframe>
                </template>
            </div>
        </div>
        <bedrock-pubsub event-name="iframe-load-success" handler="_loadSuccess"></bedrock-pubsub>
        <bedrock-pubsub event-name="iframe-load-failed" handler="_loadFailed"></bedrock-pubsub>
`;
  }

  static get is() { return 'rock-analytics-widget' }
  static get properties() {
      return {
          url: {
              type: String,
              value: ''
          },
          urlPath: {
              type: String,
              value: ''
          },
          timeout: {
              type: Number,
              value: 30000
          }
      }
  }

  connectedCallback () {
      super.connectedCallback();
      this.urlUnavailable = _.isEmpty(this.url);
      this.embedUrl = this.url + this.urlPath;
  }

  _loadSuccess () {
      this.urlUnavailable = false;
      this.iframeloadfailed = false;                 
  }

  _loadFailed () {
      this.urlUnavailable = true;
      this.iframeloadfailed = true;
  }

  refresh () {
      let iframe = this.shadowRoot.querySelector('pebble-iframe').shadowRoot.querySelector(
          'iframe');
      let iframecontainer = this.shadowRoot.querySelector('pebble-iframe');
      let parentNode = iframe.parentNode;
      parentNode.removeChild(iframe);
      let newframe = document.createElement('iframe');
      newframe.setAttribute('src', this.embedUrl);
      newframe.setAttribute('frameborder', "0");
      iframecontainer.refresh();
      let frame = dom(iframecontainer.shadowRoot).querySelector(
          '.intrinsic-container').appendChild(
          newframe);
      frame.onload = iframecontainer.onLoad();
  }
}
customElements.define(RockAnalyticsWidget.is, RockAnalyticsWidget);
