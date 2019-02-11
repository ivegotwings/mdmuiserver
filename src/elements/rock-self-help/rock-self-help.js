/**
@group rock Elements
@element rock-self-help
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/polymer/lib/mixins/mutable-data.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockSelfHelp
    extends mixinBehaviors([RUFBehaviors.ComponentConfigBehavior], PolymerElement) {
  static get template() {
    return html`

`;
  }

  static get is() { return 'rock-self-help' }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          helpSettings: {
              type: Object,
              value: function () {
                  return{};
              },
              notify: true
          }
      };
  }

  connectedCallback() {
      super.connectedCallback();
      this.requestConfig("help-settings", this.contextData);
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

  onConfigLoaded({config}) {
      if(!_.isEmpty(config)) {
          this.set("helpSettings", config);
          if(config.enabled) {
              //append url to head
              if (config.mode && config[config.mode + 'url']) {
                  let element = document.createRange().createContextualFragment(config[config.mode + 'url']);
                  document.head.appendChild(element);
              } else {
                  console.log('self help url unavailable');
              }
              //provide role to window var
              //check for multiple role support
              window.app_role = RUFUtilities.mainApp.defaultRole;
          } else {
              //console.log('self help is disabled');
          }
      } else {
          console.log('self help config not found');
      }
  }
}
customElements.define(RockSelfHelp.is, RockSelfHelp);
