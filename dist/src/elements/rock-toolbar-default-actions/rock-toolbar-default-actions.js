/**
@group rock Elements
@element rock-toolbar-default-actions
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../pebble-toolbar/pebble-toolbar.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockToolbarDefaultActions
extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior, RUFBehaviors.ComponentConfigBehavior],
    PolymerElement) {
  static get template() {
    return html`
        <pebble-toolbar id="toolbar" readonly="[[readonly]]" config-data="[[_toolbarConfig]]"></pebble-toolbar>
        <bedrock-pubsub event-name="toolbar-button-event" handler="_onToolbarEvent" target-id="toolbar"></bedrock-pubsub>
        <bedrock-pubsub event-name="on-toolbar-change" handler="_onToolbarChange" target-id="toolbar"></bedrock-pubsub>
`;
  }

  static get is() {
      return 'rock-toolbar-default-actions'
  }
  ready() {
      super.ready();
  }
  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: '_onContextDataChange'
          },
          readonly: {
              type: Boolean,
              value: false
          },
          _toolbarConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          domain: {
              type: String
          }
      }
  }
  /**
   *
   */
  _onContextDataChange() {
      if (!_.isEmpty(this.contextData)) {
          let context = DataHelper.cloneObject(this.contextData);
          //App specific
          let appName = ComponentHelper.getCurrentActiveAppName();
          if (appName) {
              context[ContextHelper.CONTEXT_TYPE_APP] = [{
                  "app": appName
              }];
          }

          if (this.domain) {
              context[ContextHelper.CONTEXT_TYPE_DOMAIN] = [{
                  "domain": this.domain
              }];
          }

          this.requestConfig('rock-toolbar-default-actions', context);
      }
  }
  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          let toolbarConfig = componentConfig.config.toolbarConfig;
          let buttonItems = DataHelper.convertObjectToArray(toolbarConfig.buttonItems);
          for (let i = 0; i < buttonItems.length; i++) {
              buttonItems[i].buttons = DataHelper.convertObjectToArray(buttonItems[i].buttons);
          }
          this._toolbarConfig = {
              "buttonItems": buttonItems
          };
      }
  }
  setPageRange(range) {
      if (!this.shadowRoot) return;

      const pageRange = this.shadowRoot.querySelector('pebble-toolbar').shadowRoot.querySelector(
          'pebble-button#pageRange');
      if (pageRange) {
          pageRange.buttonText = range;
      }
  }
  setAttributeToToolbarButton(btnName, attribute, addAttr) {
      if (!this.shadowRoot) {
          return;
      }

      this.shadowRoot.querySelector("#toolbar").setAttributeToToolbarButton(btnName, attribute,
          addAttr);
  }
  _onToolbarEvent(e, detail) {
      this.fireBedrockEvent("rock-toolbar-button-event", detail);
  }
  //Event is needed only for pageRange
  _onToolbarChange(e, detail) {
      if (DataHelper.isValidObjectPath(detail, "model.button.name") && detail.model.button.name ==
          "pageRange") {
          this.fireBedrockEvent("on-page-range-requested", detail);
      }
  }
}
customElements.define(RockToolbarDefaultActions.is, RockToolbarDefaultActions);
