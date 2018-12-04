/**
@group rock Elements
@element rock-entity-actions
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../pebble-toolbar/pebble-toolbar.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityActions
    extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior, RUFBehaviors.ComponentConfigBehavior], PolymerElement) {
  static get template() {
    return Polymer.html`
        <pebble-toolbar id="toolbar" readonly="[[readonly]]" config-data="[[_toolbarConfig]]"></pebble-toolbar>
        <bedrock-pubsub event-name="toolbar-button-event" handler="_onToolbarEvent" target-id="toolbar"></bedrock-pubsub>
`;
  }

  static get is() { return 'rock-entity-actions' }

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

          _buttonItems: {
              type: Array,
              value: function () {
                  return [];
              }
          }
      };
  }

  constructor(){
      super();
  }

  ready() {
      super.ready();
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

          this.requestConfig('rock-entity-actions', context);
      }
  }

  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          let writePermission = true;
          let itemContext = this.getFirstItemContext();
          if (DataHelper.isValidObjectPath(itemContext, "permissionContext.writePermission")) {
              writePermission = itemContext.permissionContext.editPermission;
          }

          let toolbarConfig = componentConfig.config.toolbarConfig;
          let buttonItems = DataHelper.convertObjectToArray(toolbarConfig.buttonItems);
          for (let i = 0; i < buttonItems.length; i++) {
              buttonItems[i].buttons = DataHelper.convertObjectToArray(buttonItems[i].buttons);
              let buttons = buttonItems[i].buttons;
              if (!writePermission) {
                  for (let j = 0; j < buttons.length; j++) {
                      if (buttons[j].intent === "write") {
                          buttons[j].visible = false;
                      }
                  }
              }
          }

          this._toolbarConfig = {};
          this._buttonItems = buttonItems;

          this._setToolbarConfig();
          
      }
  }

  _setToolbarConfig() {
      this._toolbarConfig = { "buttonItems": this._buttonItems };

      this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(50), () => {
          this.fireBedrockEvent("rock-toolbar-reset");
      });
  }

  setAttributeToToolbarButton(btnName, attribute, addAttr) {
      let toolbar = this.shadowRoot.querySelector("#toolbar");
      if (toolbar) {
          toolbar.setAttributeToToolbarButton(btnName, attribute, addAttr);
      }
  }

  _onToolbarEvent(e, detail) {
      this.fireBedrockEvent("rock-toolbar-button-event", detail);
  }
}

customElements.define(RockEntityActions.is, RockEntityActions);
