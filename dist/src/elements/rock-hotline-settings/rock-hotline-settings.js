import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-tooltip.js';
import '../bedrock-style-manager/styles/bedrock-style-variables.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import '../pebble-toggle-button/pebble-toggle-button.js';
import '../pebble-dialog/pebble-dialog.js';
import '../pebble-button/pebble-button.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockHotlineSettings
    extends mixinBehaviors([RUFBehaviors.ComponentConfigBehavior], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-variables bedrock-style-common bedrock-style-tooltip bedrock-style-padding-margin">
            pebble-toggle-button {
                --pebble-toggle-button-checked-bar-color: var(--success-color, #4caf50);
                --pebble-toggle-button-checked-button-color: var(--success-color, #4caf50);
                --pebble-toggle-button-checked-ink-color: var(--success-color, #4caf50);
                --pebble-toggle-button-bar-opacity:1;
                --pebble-toggle-button-unchecked-bar-opacity:1;
                --pebble-toggle-button-unchecked-bar-color: #a9a9a9;
                --pebble-toggle-button-unchecked-button-color: #a9a9a9;
                --pebble-toggle-button-unchecked-ink-color: #a9a9a9;
            }
            

            pebble-toggle-button {
                --pebble-toggle-button-unchecked-button: {
                    background-color: #FFF !important;
                }
            }
        </style>
        <template is="dom-if" if="[[_isHotlineAllowed(hotlineSettings)]]">
            <pebble-toggle-button class="tooltip-bottom m-l-5" data-tooltip="Hotline" checked="{{hotlineModeEnabled}}"></pebble-toggle-button>
        </template>
        <pebble-dialog id="hotlineDialog" small="" horizontal-align="auto" show-close-icon="" vertical-align="auto" no-cancel-on-outside-click="" no-cancel-on-esc-key="" dialog-title="Hotline">
            <p>Hotline mode timer is about to expire! Click 'Continue' to keep working in Hotline mode or 'Cancel' if you are
                finished.
            </p>
            <div class="buttonsContainer-static">
                <pebble-button id="continue" class="btn btn-success" button-text="Continue" on-tap="_onHotlineContinue"></pebble-button>
                <pebble-button id="cancel" class="btn btn-secondary m-r-5" button-text="Cancel" on-tap="_onHotlineCancel"></pebble-button>
            </div>
        </pebble-dialog>
`;
  }

  static get is() { return 'rock-hotline-settings' }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: '_onContextDataChange'
          },
          hotlineSettings: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          hotlineModeEnabled: {
              type: Boolean,
              value: false,
              observer: '_onHotlineChange'
          }
      }
  }
  static get observers() {
      return []
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

          this.requestConfig('hotline-settings', context);
      }
  }
  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          this.set('hotlineSettings', componentConfig.config);
      }
  }
  _isHotlineAllowed() {
      if (_.isEmpty(this.hotlineSettings)) {
          return false;
      }

      if (this.hotlineSettings.enabled) {
          return true;
      }

      return false;
  }
  _onHotlineChange() {
      RUFUtilities.mainApp.hotlineModeEnabled = this.hotlineModeEnabled;
      
      if (this.hotlineModeEnabled) {
          this._triggerHotlineTimer();
      } else {
          this.cancelDebouncer("hotlineTimer");
      }
  }
  _triggerHotlineTimer() {
      let timer = 1800000; // Default 30 min
      if (this.hotlineSettings && this.hotlineSettings.timeout) {
          timer = this.hotlineSettings.timeout;
      }

      this.debounce('hotlineTimer', function () {
          if (this.hotlineModeEnabled) {
              this._setDialog(true);
          }
      }, timer);
  }
  _onHotlineContinue() {
      this._setDialog(false);
      this._triggerHotlineTimer();
  }
  _onHotlineCancel() {
      this._setDialog(false);
      this.hotlineModeEnabled = false;
  }
  _setDialog(openDialog) {
      let hotlineDialog = this.$.hotlineDialog;
      if (hotlineDialog) {
          if (openDialog) {
              hotlineDialog.open();
          } else {
              hotlineDialog.close();
          }
      }
  }
}

customElements.define(RockHotlineSettings.is, RockHotlineSettings);
