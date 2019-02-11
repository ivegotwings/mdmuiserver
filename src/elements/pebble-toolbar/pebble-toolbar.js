/**
`<pebble-toolbar>` Represents a toolbar which has individual buttons or button groups embedded in it.
 All the buttons or button groups are loaded dynamically based on the JSON configurations (config json) which is bound to the `pebble-toolbar` element.
 
 From the "config json", the button properties such as "icon"" and "text" are used for the display. And the `eventName` property 
sends the event information to the event handler. 

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--pebble-toolbar-button-icon`          | Mixin applied to toolbar's simple button with icon                | `{}`
`--pebble-toolbar-button-text`          | Mixin applied to toolbar's simple button with text                | `{}`
`--pebble-toolbar-button-icontext`      | Mixin applied to toolbar's simple button with icon and text       | `{}`
`--pebble-toolbar-buttongroup-text`     | Mixin applied to toolbar's button group button with icon          | `{}`
`--pebble-toolbar-buttongroup-icontext` | Mixin applied to toolbar's button group button with icon and text | `{}`
`--pebble-toolbar-menubutton`           | Mixin applied to toolbar's menu button                            | `{}`
`--pebble-toolbar-buttongroup`          | Mixin applied to toolbar's button group                           | `{}`

@group Pebble Elements
@element pebble-toolbar
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../pebble-button/pebble-button.js';
import '../pebble-vertical-divider/pebble-vertical-divider.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleToolbar extends mixinBehaviors([RUFBehaviors.UIBehavior], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-padding-margin">

            pebble-button.menu {
                --pebble-menu-button: {
                    padding-left: 0px;
                }
                --pebble-button-paper-menu: {
                    border: 1px solid var(--cloudy-blue-color, #C1CAD4);
                }
                --pebble-button-paper-menu-item: {
                    font-size: var(--default-font-size, 14px);
                }
                --pebble-button: {
                    min-width: 16px;
                    padding-right: 0;
                    padding-bottom: 0;
                    padding-left: 0;
                    margin-left: 0;
                }
            }

            .buttonGroup {
                display: flex;
                align-items: center;
            }
            .cursor-default{
                --paper-button-text:{
                    cursor: default;
                }
            }

            pebble-button#pageRange {
                --pebble-button: {
                    border: none;
                    font-size: var(--font-size-sm, 12px);
                    padding-top: 0;
                    padding-right: 0;
                    padding-bottom: 0;
                    padding-left: 0;
                }
            }
            .buttonGroup pebble-button{
                height:20px;                
                --pebble-icon-dimension: {
                    width:16px;
                    height:16px;
                    @apply --pebble-button-icon-dimension;                    
                }
            }

            pebble-vertical-divider {
                background: #505050;
                --pebble-vertical-divider-height: 16px;
                width: 2px;
                margin-right: 0px;
            }
        </style>
            <template is="dom-repeat" items="[[configData.buttonItems]]" as="button">
                <template is="dom-if" if="[[_computeIcon(button)]]">
                    <pebble-button icon="[[button.icon]]" on-tap="_onTap" disabled="[[readonly]]" noink="" class="icon" data="[[button]]" title\$="[[button.tooltip]]" id="[[button.name]]" slot="top">
                    </pebble-button>
                </template>

                <template is="dom-if" if="[[_computeText(button)]]">
                    <pebble-button button-text="[[button.text]]" on-tap="_onTap" disabled="[[readonly]]" noink="" class="text" data="[[button]]" title\$="[[button.tooltip]]" id="[[button.name]]" slot="top">
                    </pebble-button>
                </template>

                <template is="dom-if" if="[[_computeIconText(button)]]">
                    <pebble-button icon="[[button.icon]]" button-text="[[button.text]]" on-tap="_onTap" disabled="[[readonly]]" noink="" class="iconText" data="[[button]]" title\$="[[button.tooltip]]" id="[[button.name]]" slot="top">
                    </pebble-button>
                </template>

                <template is="dom-if" if="[[_computeMoreButtons(button)]]">
                    <pebble-button icon="pebble-icon:actions-more-horizontal" noink="" menu-button="" item-data="[[_getMoreButtons(button)]]" disabled="[[readonly]]" class="menu" vertical-offset="-159" horizontal-offset="-2" horizontal-align="[[horizontalAlign]]" vertical-align="[[verticalAlign]]" slot="top">
                    </pebble-button>
                </template>

                <template is="dom-if" if="[[!_computeMoreButtons(button)]]">

                    <div class="buttonGroup">
                        <template is="dom-repeat" items="[[button.buttons]]" as="button">
                            <template is="dom-if" if="[[_computeIcon(button)]]" on-dom-change="_onToolbarChange">
                                <pebble-button icon="[[button.icon]]" on-tap="_onTap" disabled="[[_isDisabled(button)]]" noink="" class="icon  m-l-10" data="[[button]]" title\$="[[button.tooltip]]" id="[[button.name]]">
                                </pebble-button>
                            </template>

                            <template is="dom-if" if="[[_computeText(button)]]" on-dom-change="_onToolbarChange">
                                <pebble-button button-text="[[button.text]]" on-tap="_onTap" disabled="[[readonly]]" noink="" class="buttonGroupText cursor-default  m-l-10" data="[[button]]" title\$="[[button.tooltip]]" id="[[button.name]]">
                                </pebble-button>

                            </template>

                            <template is="dom-if" if="[[_computeIconText(button)]]" on-dom-change="_onToolbarChange">
                                <pebble-button icon="[[button.icon]]" button-text="[[button.text]]" on-tap="_onTap" disabled="[[readonly]]" noink="" class="buttonGroupIconText" data="[[button]]" title\$="[[button.tooltip]]" id="[[button.name]]">
                                </pebble-button>

                            </template>

                            <template is="dom-if" if="[[_computeMoreButtons(button)]]" on-dom-change="_onToolbarChange">
                                <pebble-button icon="[[button.icon]]" button-text="[[button.text]]" disabled="[[readonly]]" noink="" menu-button="" class="menu  m-l-10" item-data="[[_getMoreButtons(button)]]" vertical-offset="-70" horizontal-offset="-2" horizontal-align="[[horizontalAlign]]" vertical-align="[[verticalAlign]]" title\$="[[button.tooltip]]">
                                </pebble-button>
                            </template>
                            <template is="dom-if" if="[[_isDivider(button)]]">
                                    <div>
                                        <pebble-vertical-divider class="m-l-10"></pebble-vertical-divider>
                                    </div>
                                </template>
                        </template>
                    </div>

                </template>

            </template>
        <bedrock-pubsub on-bedrock-event-toolbar-more-event="_onToolbarMoreButtonClick" name="bedrock-event-toolbar-more-event"></bedrock-pubsub>
`;
  }

  static get is() {
      return "pebble-toolbar";
  }

  static get properties() {
      return {
          /**
           * Indicates the list of buttons and button groups which must be placed on the toolbar.
           */
          configData: {
              type: Object,
              value: function () { return {}; }
          },

          /**
           * If set as true , it indicates the component is in read only mode
           */
          readonly: {
              type: Boolean,
              value: false
          },

          /**
          * Indicates the orientation to align the menu dropdown horizontally relative to the dropdown trigger.
          */
          horizontalAlign: {
              type: String,
              notify: true
          },

          /**
           * Indicates the orientation to align the menu dropdown vertically relative to the dropdown trigger.
           */
          verticalAlign: {
              type: String,
              notify: true
          }
      };
  }

  _onToolbarChange(e) {
      this.fireBedrockEvent("on-toolbar-change", e);
  }

  _isDisabled(buttonConfig){
    if(buttonConfig && buttonConfig.hasOwnProperty('disabled')){
        return buttonConfig.disabled;
    }
    return this.readonly;
  }
  _onTap(e) {
      if (e.currentTarget.disabled == true) {
          return;
      }
      this.fireBedrockEvent("toolbar-button-event", e.currentTarget.data);
  }

  _onToolbarMoreButtonClick(e, detail) {
      if (e.currentTarget.disabled == true) {
          return;
      }
      this.fireBedrockEvent("toolbar-button-event", detail);
  }

  _computeIconText(button) {
      let flag = false;
      if (button.visible && button.name != "moreActions") {
          if (button.icon != null && button.icon.length > 0 && button.text != null && button.text.length > 0) {
              flag = true;
          }
      }
      return flag;
  }

  _computeIcon(button) {
      let flag = false;
      if (button.visible && button.name != "moreActions") {
          if (button.icon != null && button.icon.length > 0 && (button.text == null || !button.text.length > 0) && !(button.buttons && button.buttons.length)) {
              flag = true;
          }
      }
      return flag;
  }

  _computeText(button) {
      let flag = false;
      if (button.visible && button.name != "moreActions" && !(button.buttons && button.buttons.length)) {
          if ((button.icon == null || !button.icon.length > 0) && button.text != null && button.text.length > 0) {
              flag = true;
          }
      }
      return flag;
  }

  _computeMoreButtons(button) {
      let flag = false;
      if (button != null && button.name != undefined && (button.name == "moreActions" || button.buttons && button.buttons.length > 0)) {
          flag = true;
          if (!button.tooltip) {
              button.tooltip = "More";
          }
      }
      return flag;
  }

  _getMoreButtons(button) {
      let moreButtons = [];
      let moreActions = button.buttons;
      for (let i = 0; i < moreActions.length; i++) {
          // check the visible property of button
          moreActions[i]["eventName"] = "toolbar-more-event";
          if (moreActions[i].visible) {
              moreButtons.push(moreActions[i]);
          }
      }
      return moreButtons;
  }

  toggleHideShowButton(buttonName, hide) {
      if (this.configData && this.configData.buttonItems && this.configData.buttonItems[0]) {
          let buttons = this.configData.buttonItems[0].buttons;
          for (let i = 0; i < buttons.length; i++) {
              if (buttons[i].name == buttonName) {
                  if (hide) {
                      buttons[i].visible = false;
                  } else {
                      buttons[i].visible = true;
                  }
                  let buttonConfig = DataHelper.cloneObject(this.configData);
                  this.configData.buttonItems = {}
                  this.set("configData", buttonConfig);
              }
          }
      }
  }

  //Can disable/enable or hide/show
  setAttributeToToolbarButton(btnName, attribute, addAttr) {
      let toolbarButton = this.shadowRoot.querySelector("pebble-button#" + btnName);
      if (!toolbarButton) {
          return;
      }

      if (addAttr) {
          toolbarButton.setAttribute(attribute, "");
      } else {
          toolbarButton.removeAttribute(attribute);
      }
  }
  _isDivider (button) {
      return button.name == "divider";
  }
}
customElements.define(PebbleToolbar.is, PebbleToolbar);
