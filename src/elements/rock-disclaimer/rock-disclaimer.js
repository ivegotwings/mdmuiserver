/**
`rock-disclaimer` Represents an element that renders the disclaimer for an App.
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-helpers/security-context-helper.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../pebble-button/pebble-button.js';
import '../pebble-dialog/pebble-dialog.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockDisclaimer extends mixinBehaviors([RUFBehaviors.ComponentConfigBehavior], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-padding-margin">
        </style>
        <template is="dom-if" if="[[_isDisclaimerNeeded(messages)]]">
            <pebble-dialog id="disclaimerDialog" modal="" alert-box="" vertical-offset="150" horizontal-align="auto" vertical-align="auto" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
                <div>
                    <span>
                        <pebble-icon icon="{{_currentMessage.icon}}" class\$="[[_currentMessage.iconColor]] m-r-5"></pebble-icon>
                    </span>
                    <span>{{_currentMessage.message}}</span>
                </div>
                <div class="buttons-right m-t-5" align="center">
                    <pebble-button id="deny" class="close btn btn-secondary m-r-5" button-text="{{_currentMessage.denyButtonLabel}}" on-tap="_denied"></pebble-button>
                    <pebble-button id="accept" class="apply btn btn-success" button-text="{{_currentMessage.acceptButtonLabel}}" on-tap="_accepted"></pebble-button>
                </div>
            </pebble-dialog>
        </template>
        <bedrock-pubsub on-bedrock-event-user-logout="_clearSession" name="bedrock-event-user-logout"></bedrock-pubsub>
`;
  }

  static get is() {
      return "rock-disclaimer";
  }
  static get properties() {
      return {
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          messages: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },
          _currentMessageId: {
              type: Number,
              value: 0
          },
          _currentMessage: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          contextData: {
              type: Object,
              observer: "_onContextDataChange"
          }
      }
  }
  _onContextDataChange() {
      if (!_.isEmpty(this.contextData)) {
          if (this.contextData.UserContexts && this.contextData.UserContexts.length) {

              let userContext = this.contextData.UserContexts[0];
              let disclaimerObj = _.isEmpty(sessionStorage.getItem('disclaimer')) ? {} : JSON.parse(sessionStorage.getItem('disclaimer'));

              if (typeof disclaimerObj === "string") {
                  disclaimerObj = JSON.parse(disclaimerObj);
              }
              if (disclaimerObj && (disclaimerObj.userName != userContext.userName)) {
                  disclaimerObj = {
                      userName: "",
                      agreed: false
                  }
              }
              disclaimerObj.userName = userContext.userName;
              sessionStorage.setItem("disclaimer", JSON.stringify(disclaimerObj));
          }

          this.requestConfig("rock-disclaimer", this.contextData);
      }
  }

  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          if (componentConfig.config.disclaimers && componentConfig.config.disclaimers.visible) {
              delete componentConfig.config.disclaimers.visible;
              let disclaimers = DataHelper.convertObjectToArray(componentConfig.config.disclaimers);
              this.messages = disclaimers;
              this._onDisclaimerConfigLoaded();
          }
      }
  }

  _onDisclaimerConfigLoaded() {
      if (this.messages && this.messages.length > 0) {
          let disclaimerObj = JSON.parse(sessionStorage.getItem('disclaimer'));
          if (disclaimerObj && !disclaimerObj.agreed) {
              this._openDialog(0);
          }
      }
  }

  _openDialog(_messageId) {
      this.set("_currentMessageId", _messageId);
      if (this.messages && this.messages.length > 0) {
          this._currentMessage = this.messages[_messageId];
      }
      setTimeout(() => {
          const disclaimerDialog = this.shadowRoot.querySelector("#disclaimerDialog");
          disclaimerDialog.set('dialogTitle', this._currentMessage.title);
          disclaimerDialog.open();
      }, 0);
  }

  _accepted() {
      let disclaimerObj = JSON.parse(sessionStorage.getItem('disclaimer'));
      if (disclaimerObj) {
          if (typeof disclaimerObj === "string") {
              disclaimerObj = JSON.parse(disclaimerObj);
          }
          disclaimerObj.agreed = true;
          sessionStorage.setItem('disclaimer', JSON.stringify(disclaimerObj));
      }
      this.shadowRoot.querySelector("#disclaimerDialog").close();
  }

  _denied() {
      if (this._currentMessageId < this.messages.length - 1) {
          let nextMessageId = this._currentMessageId + 1;
          this._openDialog(nextMessageId);
      } else {
          SecurityContextHelper.logout();
      }
  }

  _clearSession() {
      sessionStorage.clear();
  }

  _isDisclaimerNeeded() {
      if (this.messages && this.messages.length > 0) {
          return true;
      }
      return false;
  }
}
customElements.define(RockDisclaimer.is, RockDisclaimer);
