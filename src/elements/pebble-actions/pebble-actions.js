/**
`pebble-actions` Represents a material design element which contains a button and a list of action items.
You can perform these actions on the page or element based on the given configurations.

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--pebble-actions-button`|Mix in applied to the button| {}
`--pebble-actions-button-icon`|Mix in applied to the icon of the button| {}
`--pebble-actions-button-drop-down-icon`|Mix in applied to the drop-down icon of the button| {}

@group Pebble Elements
@element pebble-actions
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/paper-item/paper-item.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../pebble-button/pebble-button.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-icon/pebble-icon.js';
import { flush } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleActions
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-icons bedrock-style-padding-margin">
            :host,
            :host(.btn) {
                display: inline-block;
                vertical-align: middle;
                font-weight: 400;
                line-height: 1.25;
                height: 30px;
                text-align: center;
                font-size: var(--default-font-size, 14px);
                border-radius: 3px;
                -webkit-transition: all .2s ease-in-out;
                transition: all .2s ease-in-out;
                box-sizing: border-box;
                text-transform: capitalize;
                --pebble-button: {
                    padding-top: 5px;
                    padding-left: 10px;
                    padding-bottom: 5px;
                    padding-right: 10px;
                    height: 28px;
                    min-width: 75px;
                    font-weight: 500;
                    border: none;
                    margin-top: 0px;
                    margin-right: 0px;
                    margin-bottom: 0px;
                    margin-left: 0px;
                    @apply --pebble-actions-button;
                }
                --pebble-actions-button-icon: {
                    height: 16px;
                    width: 16px;
                }
                --pebble-button-dropdown-icon: {
                    height: 24px;
                    width: 24px;
                    color: var(--palette-white, #fff);
                    margin-top: 0;
                    margin-bottom: 0;
                    margin-right: 5px;
                    margin-left: 5px;
                    @apply --pebble-actions-button-drop-down-icon;
                }
            }

            #actionsPopover {
                margin-top: 2px;
                @apply --pebble-manual-actions;
                --popover: {
                    padding-top: 15px !important;
                    padding-bottom: 15px !important;
                    max-height: 368px;
                    overflow-y: auto;
                    overflow-x: auto;
                }
            }

            pebble-button {
                border: none;
            }

            :host(.dropdown-outline-primary) {
                --pebble-button: {
                    border-color: transparent;
                    color: var(--primary-button-color, #139ee7);
                    background-color: var(--palette-white);
                }
                --pebble-button-right-icon: {
                    fill: var(--primary-button-color, #036bc3);
                }
            }

            .dropdown {
                color: var(--primary-icon-color, #75808b);
                background-color: none;
                border-color: none
            }

            .btn.dropdown {
                --pebble-icon-color: {
                    fill: var(--primary-icon-color, #75808b);
                }
                ;
            }

            .dropdownIcon,
            .dropdown-icon {
                --pebble-button-right-icon: {
                    margin-right: 5px;
                }
                ;
            }

            :host(.dropdown-secondary) {
                color: var(--secondary-button-text-color, #75808b);
                background-color: var(--secondary-button-color, #ffffff);
                border-color: var(--secondary-button-border-color, #c1cad4);
            }

            :host(.btn.dropdown-secondary) {
                --pebble-icon-color: {
                    fill: var(--secondary-button-text-color, #75808b);
                }
                ;
            }

            :host(.dropdown-outline-primary) {
                border-color: var(--primary-border-button-color, #026bc3);
                color: var(--primary-border-button-text-color, #036bc3);
                background-color: var(--palette-white);
            }

            :host(.dropdown-primary) {
                border-color: var(--primary-button-color, #036bc3);
                background: var(--primary-button-color, #036bc3);
                color: var(--button-text-color, #ffffff);
                --pebble-icon-color: {
                    fill: var(--button-text-color, #ffffff);
                }
                ;
            }

            :host(.dropdown-success) {
                color: var(--button-text-color, #ffffff);
                background-color: var(--success-button-color, #09c021);
                border-color: var(--success-button-color, #09c021);
                --pebble-icon-color: {
                    fill: var(--button-text-color, #ffffff);
                }
                ;
            }

            .btn.dropdownText {
                font-weight: 500;
            }

            .btn.dropdown {
                --pebble-button: {
                    padding-left: 5px;
                }
            }

            :host([disabled]) {
                opacity: 0.4;
                cursor: auto !important;
                pointer-events: none !important;
            }
            paper-item[disabled] {
                opacity: 0.5;
            }

            pebble-popover {
                --pebble-popover-width: 260px;
            }

            .badge {                
                font-weight: normal;
                font-size: var(--font-size-sm, 12px);
                border-radius: 50%;
                margin-right: 10px;
                width: 25px;
                height: 25px;
                background-color: var(--success-color, #36b44a);
                opacity: 1.0;
                @apply --layout;
                @apply --layout-center-center;
                @apply --paper-font-common-base;
            }

            #actionsPopoverItem {
                padding: 0px;
                height: 1px;
            }

            #actionItem {
                line-height: 16px;
            }
            
            #actionsPopoverItem:hover {
                color: var(--focused-line, #026bc3);
                background-color: var(--bgColor-hover, #e8f4f9);
            }

            #actionsPopoverItem:focus {
                background-color: #eaf3fc;
            }

            .popup-title {
                text-align: left;
                font-size: var(--font-size-sm, 12px);
                color: var(--text-primary-color, #1a2028);
                font-weight: var(--font-bold, bold);
                line-height: 24px;
                @apply --popup-item;
            }

            .list {
                @apply --layout-vertical;
            }

            #actionsPopoverItem {
                cursor: pointer;
                font-size: var(--font-size-sm, 12px);
                color: var(--palette-steel-grey, #75808b);
                text-align: left;
                transition: all 0.3s;
                -webkit-transition: all 0.3s;
                min-height: 40px;
                @apply --popup-item;
                @apply --popover-action-item;
            }

            #actionItem {
                @apply --popover-action-item;
            }

            #actionItem:hover {
                color: var(--focused-line, #026bc3);
                background-color: var(--bgColor-hover, #e8f4f9);
                @apply --popover-action-item-hover;
            }

            #actionItem:focus {
                color: var(--primary-button-color, #036bc3);
                background-color: var(--bgColor-hover, #e8f4f9);
                @apply --popover-action-item-focus;
            }

            pebble-icon {
                --pebble-icon-color: {
                    fill: var(--secondary-button-text-color, #75808b);
                }
            }
        </style>
        <pebble-button id="actions" disabled="[[readonly]]" icon="[[buttonIcon]]" button-text="[[buttonText]]" noink="" dropdown-icon="" on-tap="_onActionsTap"></pebble-button>

        <template is="dom-if" if="[[_actionsPopoverDialog]]">
            <pebble-popover id="actionsPopover" for="actions" no-overlap="" horizontal-align="[[horizontalAlign]]" vertical-align="[[verticalAlign]]">
                <template is="dom-repeat" items="[[actionsData]]" as="group">
                    <div class="popup-title" hidden="[[!group.title]]">[[group.title]]</div>
                    <template is="dom-repeat" items="[[group.actions]]" as="action">
                        <paper-item id="actionsPopoverItem" data="[[action]]" on-tap="_onActionItemTap" hidden\$="[[!action.visible]]">
                            <template is="dom-if" if="[[action.icon]]">
                                <pebble-icon icon="[[action.icon]]" class="pebble-icon-size-30 m-r-10"></pebble-icon>
                            </template>
                            <div id="actionItem">
                                <template is="dom-if" if="[[action.text]]">
                                    [[action.text]]
                                </template>
                            </div>
                        </paper-item>
                    </template>
                </template>
            </pebble-popover>
        </template>
`;
  }

  static get is() { return 'pebble-actions' }

  static get properties() {
      return {
          /**
          * Indicates an action items data.
          */
          actionsData: {
              type: Array,
              value: function () { return []; },
              observer: '_onActionsDataChange'
          },
          /**
           * If set as true , it indicates the component is in read only mode
           */
          readonly: {
              type: Boolean,
              value: false
          },
          /**
          * Indicates an optional icon which you can place on the left side to the button text.
          */
          buttonIcon: {
              type: String,
              value: function () { return null; }
          },
          /**
          * Indicates the text of the button.
          */
          buttonText: {
              type: String,
              value: function () { return null; }
          },

          horizontalAlign: {
              type: String,
              value: "right"
          },

          verticalAlign: {
              type: String,
              value: "auto"
          },

          _actionsPopoverDialog: {
              type: Boolean,
              value: false
          }
      }
  }
  disconnectedCallback() {
      super.disconnectedCallback();               
  }
  connectedCallback() {
      super.connectedCallback();
      this._actionsPopover = this.shadowRoot.querySelector('#actionsPopover');
  }
  _onActionsDataChange() {
      if (this.actionsData) {
          if (this.actionsData.length == 0) {
              this.setAttribute("show","false")
          } else {
              this.setAttribute("show","trueInlineBlock");
          }
      }
  }
  _onActionsTap(e) {
      if (e.currentTarget.disabled == true) {
          return;
      }
      this._actionsPopoverDialog = true;
      flush();

      this._actionsPopover = this.shadowRoot.querySelector('#actionsPopover');
      this._actionsPopover.show();

  }


  _onActionItemTap(e) {
      let eventName = "pebble-actions-action-click";
      let eventDetail = {
          name: eventName,
          data: e.currentTarget.data
      }

      let settings = { ignoreId: true };
                     
      if (this.appId) {
          settings.appId = this.appId;
      }

      this.fireBedrockEvent(eventName, eventDetail, settings);
      this._actionsPopover.hide();
  }
  getActionItems() {
      this._actionsPopoverDialog = true;
      flush();

      this._actionsPopover = this.shadowRoot.querySelector('#actionsPopover');
      return this._actionsPopover.querySelectorAll("paper-item");
  }
}
customElements.define(PebbleActions.is, PebbleActions)
