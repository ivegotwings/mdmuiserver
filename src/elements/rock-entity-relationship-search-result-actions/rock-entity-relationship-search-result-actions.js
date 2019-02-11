/**
@group rock Elements
@element rock-entity-relationship-search-result-actions
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../pebble-toolbar/pebble-toolbar.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityRelationshipSearchResultActions
extends mixinBehaviors([
    RUFBehaviors.UIBehavior,
    RUFBehaviors.ComponentContextBehavior,
    RUFBehaviors.ComponentConfigBehavior
], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <pebble-toolbar id="searchResultToolbar" readonly="[[readonly]]" config-data="[[_toolbarConfig]]"></pebble-toolbar>
        <bedrock-pubsub event-name="toolbar-button-event" handler="_onToolbarEvent" target-id="searchResultToolbar"></bedrock-pubsub>
`;
  }

  static get is() {
      return 'rock-entity-relationship-search-result-actions'
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
          hasWritePermissions: {
              type: Boolean,
              value: false
          },
          direction: {
              type: String,
              value: ""
          }
      }
  }
  static get observers() {
      return [
          'resetConfigOnPermissions(hasWritePermissions)'
      ]
  }
  /**
   *
   */
  connectedCallback() {
      super.connectedCallback();
  }
  /**
   *
   */
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
          if (this.relationship) {
              let itemContext = ContextHelper.getFirstItemContext(context);
              if (!_.isEmpty(itemContext)) {
                  itemContext.relationship = this.relationship;
              } else {
                  context[ContextHelper.CONTEXT_TYPE_ITEM] = [{
                      "relationship": this.relationship
                  }];
              }
          }

          this.requestConfig('rock-entity-relationship-search-result-actions', context);
      }
  }
  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          let toolbarConfig = undefined;

          if (this.direction == "up") {
              let config = this._getConfigForUpDirection(componentConfig.config);
              if (!config) {
                  return
              }
              toolbarConfig = config.toolbarConfig;
          } else {
              toolbarConfig = componentConfig.config.toolbarConfig;
          }

          let buttonItems = DataHelper.convertObjectToArray(toolbarConfig.buttonItems);
          for (let i = 0; i < buttonItems.length; i++) {
              buttonItems[i].buttons = DataHelper.convertObjectToArray(buttonItems[i].buttons);
          }
          //Temp fix - Removing bulk-edit from relationship grid
          if(!_.isEmpty(this.contextData) && !_.isEmpty(ContextHelper.getDataContexts(this.contextData))){
              if(!_.isEmpty(buttonItems) && !_.isEmpty(buttonItems[0].buttons)){
                  let buttons = buttonItems[0].buttons;
                  for (let buttonIndex = 0; buttonIndex < buttons.length; buttonIndex++) {
                      const buttonItem = buttons[buttonIndex];
                      if(buttonItem && buttonItem.name && buttonItem.name == 'bulkedit'){
                          buttons.splice(buttonIndex, 1);
                          break;
                      }
                  }
              }
          }
          //Temp fix ends here

          this._toolbarConfig = {
              "buttonItems": buttonItems
          };
          if (!this.hasWritePermissions) {
              this.resetConfigOnPermissions();
          }
      }
  }
  _getConfigForUpDirection(config) {
      if (!_.isEmpty(config.upDirectionConfig)) {
          return config.upDirectionConfig;
      }
  }
  setPageRange(range) {
      if (!this.shadowRoot) return;

      const toolbarRange = this.shadowRoot.querySelector('pebble-toolbar').shadowRoot.querySelector(
          'pebble-button#pageRange')
      if (toolbarRange) {
          toolbarRange.buttonText = range;
      }
  }
  resetConfigOnPermissions() {
      if (_.isEmpty(this._toolbarConfig)) {
          return;
      }

      if (!this.hasWritePermissions) {
          let toolbarConfig = DataHelper.cloneObject(this._toolbarConfig);
          //Hide button
          let buttonItems = toolbarConfig.buttonItems;
          for (let i = 0; i < buttonItems.length; i++) {
              let buttons = buttonItems[i].buttons;
              for (let j = 0; j < buttons.length; j++) {
                  if (buttons[j].intent === "write") {
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
}
customElements.define(RockEntityRelationshipSearchResultActions.is, RockEntityRelationshipSearchResultActions);
