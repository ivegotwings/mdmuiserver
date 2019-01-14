/**
@group rock Elements
@element rock-entity-search-result-actions
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../pebble-toolbar/pebble-toolbar.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntitySearchResultActions
    extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior, RUFBehaviors.ComponentConfigBehavior], OptionalMutableData(PolymerElement)) {
  static get template() {
    return Polymer.html`
        <pebble-toolbar id="searchResultToolbar" readonly="[[readonly]]" config-data="[[_toolbarConfig]]"></pebble-toolbar>
        <bedrock-pubsub event-name="toolbar-button-event" handler="_onToolbarEvent" target-id="searchResultToolbar"></bedrock-pubsub>
        <bedrock-pubsub event-name="on-toolbar-change" handler="_onToolbarChange" target-id="searchResultToolbar"></bedrock-pubsub>
`;
  }

  static get is() {
      return "rock-entity-search-result-actions";
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

          isWorkflowCriterion: {
              type: Boolean,
              value: false
          },

          domain: {
              type: String
          }
      }
  }

  static get observers() {
      return [
          'resetConfigForWorkflow(isWorkflowCriterion)'
      ]
  }

  constructor() {
      super();
  }

  connectedCallback() {
      super.connectedCallback();
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

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

          this.requestConfig('rock-entity-search-result-actions', context);
      }
  }

  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          let toolbarConfig = componentConfig.config.toolbarConfig;
          let buttonItems = DataHelper.convertObjectToArray(toolbarConfig.buttonItems);
          for (let i = 0; i < buttonItems.length; i++) {
              buttonItems[i].buttons = DataHelper.convertObjectToArray(buttonItems[i].buttons);
          }
          this._toolbarConfig = { "buttonItems": buttonItems };
          if (this.isWorkflowCriterion) {
              this.resetConfigForWorkflow();
          }
      }
  }

  setPageRange(range) {
      if (!this.shadowRoot) return;

      const toolbarRange = this.shadowRoot.querySelector('pebble-toolbar').shadowRoot.querySelector('pebble-button#pageRange');
      if (toolbarRange) {
          toolbarRange.buttonText = range;
      }
  }

  resetConfigForWorkflow() {
      if (_.isEmpty(this._toolbarConfig)) {
          return;
      }
      let buttonsToHide = ["bulkdelete"];

      if (this.isWorkflowCriterion) {
          let toolbarConfig = DataHelper.cloneObject(this._toolbarConfig);
          //Hide button
          let buttonItems = toolbarConfig.buttonItems;
          for (let i = 0; i < buttonItems.length; i++) {
              let buttons = buttonItems[i].buttons;
              for (let j = 0; j < buttons.length; j++) {
                  if (buttonsToHide.indexOf(buttons[j].name) != -1) {
                      buttons[j].visible = false;
                  }
              }
          }
          this._toolbarConfig = toolbarConfig;
      }
  }

  setAttributeToToolbarButton(btnName, attribute, addAttr) {
      if (!this.shadowRoot) {
          return;
      }

      let toolbar = this.shadowRoot.querySelector("#searchResultToolbar");
      if (toolbar) {
          toolbar.setAttributeToToolbarButton(btnName, attribute, addAttr);
      }
  }

  _onToolbarEvent(e, detail) {
      this.fireBedrockEvent("rock-toolbar-button-event", detail);
  }

  //Event is needed only for pageRange
  _onToolbarChange(e, detail) {
      if (DataHelper.isValidObjectPath(detail, "model.button.name") && detail.model.button.name == "pageRange") {
          this.fireBedrockEvent("on-page-range-requested", detail);
      }
  }
}
customElements.define(RockEntitySearchResultActions.is, RockEntitySearchResultActions);
