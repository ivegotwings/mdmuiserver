/**
`<pebble-button>` Represents a button with material design styling. It exhibits the bahaviour of a 
simple button as well as a button with a drop-down menu. 
 
 In a simple button mode, a ripple effect emanates from the point of contact when the user touches the button. 
 It may be flat or raised. A raised button is styled with a shadow.
  
 The drop-down menu mode allows the user to compose a designated "trigger element" with another element. 
 This indicates the content to be created in a drop-down menu that displays the content when the 
 "trigger" is clicked. The child element with the class drop-down trigger is used as the trigger element. 
 The child element with the class drop-down content is used as the content element.
 The pebble-button is sensitive to its content's iron-select events. If the content element triggers an iron-select event, the pebble-button gets closed automatically.

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--pebble-button-background-color`       | Menu background color                      | `--primary-background-color`
`--pebble-button-foreground-color`       | Menu foreground color                      | `--primary-text-color`
`--pebble-button`                        | Mixin applied to the pebble button         | `{}`
`--pebble-button-hover`                  | Mixin applied to hover                     | `{}`
`--pebble-button-notraised`              | Mixin applied to pebble button (not raised)| `{}`
`--pebble-button-iron-icon`              | Mixin applied to the main icon             | `{}`
`--pebble-button-dropdown-icon`          | Mixin applied to the dropdown icon         | `{}`
`--pebble-menu-button`                   | Mixin applied to the paper menu button     | `{}`
`--pebble-button-paper-menu`             | Mixin applied to the paper menu            | `{}`
`--pebble-button-paper-menu-item`        | Mixin applied to the paper menu item       | `{}`
`--pebble-button-menu-item-icon`         | Mixin applied to the paper menu item icon  | `{}`
`--actions-icon-button`                  | Mixin applied to actions paper icon button | `{}`

### Accessibility

`<pebble-button>` by default behaves as a simple button. When the button-menu attribute is specified in the markup, the button will be a drop-down menu.  
 
 Use the icon property to display an icon.
 
 Use the button-text property to display text.
 
 Use available mixins for mouse over, color, ripple, elevation and any other css properties.

@group Pebble Elements
@element pebble-button
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-paper-listbox.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/element-helper.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-popover/pebble-popover.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleButton
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-icons bedrock-style-padding-margin bedrock-style-paper-listbox">
            :host,
            :host(.btn) {
                display: inline-block;
                font-weight: 400;
                line-height: 1.25;
                height: 30px;
                text-align: center;
                border: 1px solid transparent;
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
                }
                --paper-button-raised-keyboard-focus: {
                    font-weight: normal;
                }
                --paper-button-flat-keyboard-focus: {
                    font-weight: normal;
                }
                --pebble-icon-dimension: {
                    width: 16px;
                    height: 16px;
                }
            }

            .text-link {
                color: var(--link-text-color, #036Bc3);
                text-decoration: none;
            }

            .text-link:hover {
                color: var(--link-text-hover-color, #045aa2);
            }

            :host([disabled]) {
                opacity: 0.4;
                cursor: auto !important;
                pointer-events: none !important;
            }

            :host(.icon-button) paper-button {
                min-width: auto;
                padding: 0 !important;
                height: auto !important;
            }

            :host(.btn-sm) {
                height: 20px;
                min-width: auto;
                font-size: var(--font-size-sm, 12px) !important;
                --pebble-button: {
                    padding-top: 0px;
                    padding-right: 10px;
                    padding-bottom: 0px;
                    padding-left: 10px;
                    height: 18px;
                }
            }

            paper-button:hover {
                box-shadow: none;
                transition: none;
                -webkit-transition: none;
            }

            paper-button {
                text-transform: none;
                border-radius: 3px;
                @apply --pebble-button;
                box-shadow: none !important;
                transition: none !important;
                -webkit-transition: none !important;
                /* Safari 3.1 to 6.0 */
            }

            paper-button:focus::before {
                @apply --paper-button-focus-before;
            }

            paper-button:before {
                @apply --paper-button-before;
            }

            #leftIcon {
                margin-right: 10px;
                margin-left: 0;
            }

            #rightIcon {
                margin-left: 10px;
                @apply --pebble-button-right-icon;
            }

            :host(.icon) paper-button {
                min-width: auto;
                height: auto;
                padding-top: 0 !important;
                padding-bottom: 0 !important;
                padding-right: 0 !important;
                padding-left: 0 !important;
                @apply --pebble-toolbar-button-icon;
            }

            :host(.auto-width) paper-button {
                min-width: auto;
            }

            :host(.iconButton) paper-button {
                min-width: auto;
                --pebble-button-left-icon: {
                    margin-right: 0 !important;
                }
                ;
                --pebble-button: {
                    padding-top: 0;
                    padding-right: 0;
                    padding-bottom: 0;
                    padding-left: 0;
                    height: auto;
                }
                ;
            }

            :host([dropdown-icon]) {
                --paper-button-text: {
                    max-width: 160px;
                }
            }

            paper-menu-button {
                @apply --pebble-menu-button;
                padding: 0;
            }

              paper-menu {
                padding: 10px 0;
                @apply --pebble-button-paper-menu;
            }

              paper-menu paper-item,
            pebble-popover paper-item {
                cursor: pointer;
                font-size: var(--default-font-size, 14px);
                color: var(--palette-steel-grey, #75808b);
                text-align: left;
                transition: all 0.3s;
                min-height: 24px;
                -webkit-transition: all 0.3s;
                padding-left: var(--default-popup-item-l-p, 20px);
                padding-right: var(--default-popup-item-r-p, 20px);
                @apply --pebble-button-paper-menu-item;
            }

              paper-menu paper-item:hover,
            pebble-popover paper-item:hover {
                background-color: var(--bgColor-hover, #e8f4f9);
                color: var(--focused-line, #026bc3);
            }

              paper-menu paper-item:focus,
            pebble-popover paper-item:focus {
                color: var(--primary-button-color, #036bc3);
                background-color: var(--bgColor-hover, #e8f4f9);
            }

              paper-menu paper-item pebble-icon,
            pebble-popover paper-item pebble-icon {
                color: var(--primary-icon-color, #75808b);
            }

              paper-menu paper-item pebble-icon:hover,
            pebble-popover paper-item pebble-icon:hover {
                color: var(--focused-line, #026bc3) !important;
            }

              paper-button {
                text-transform: none;
                @apply --pebble-button;
            }

            #actionsPopover {
                --popover: {
                    padding-top: 10px;
                    padding-bottom: 10px;
                }
            }

            #actionParentButton {
                border-top-right-radius: 0px;
                border-bottom-right-radius: 0px;
                margin: 0;
                font-weight: 400;
                padding: 0px 0px 0px 10px;
            }

            #actionButton {
                border-top-right-radius: 3px;
                border-bottom-right-radius: 3px;
                padding: 0;
                display: inline-block;
                vertical-align: top;
                margin: 7px 4px 0px 0px;
            }

            /* IE edge specific fix for #actionButton */

            _:-ms-lang(x),
            _:-webkit-full-screen,
            #actionButton {
                line-height: 24px;
            }

            #customIcon {
                @apply --pebble-custom-icon-height;
            }

            #buttonTextBox {
                @apply --paper-button-text;
                line-height: 14px;
            }

            :host(.iconTextButton) {
                text-align: left;
                --pebble-button: {
                    padding-top: 5px;
                    padding-left: 10px;
                    padding-bottom: 5px;
                    padding-right: 10px;
                    height: 28px;
                    min-width: auto !important;
                    font-weight: 500;
                    border: none;
                    margin-top: 0px;
                    margin-right: 0px;
                    margin-bottom: 0px;
                    margin-left: 0px;
                }
            }

            :host(.btn-primary) {
                color: var(--button-text-color, #ffffff);
                background-color: var(--primary-button-color, #139de6);
                border-color: var(--primary-button-color, #139de6);
                --pebble-icon-color: {
                    fill: var(--palette-white, #ffffff);
                }
            }

            :host(.btn-primary:hover) {
                background-color: var(--primary-button-hover-color, #118ed0);
                border-color: var(--primary-button-hover-color, #118ed0);
            }

            :host(.btn-secondary) {
                color: var(--secondary-button-text-color, #75808b);
                background-color: var(--secondary-button-color, #ffffff);
                border-color: var(--secondary-button-border-color, #c1cad4);
            }

            :host(.btn-secondary:hover) {
                background-color: var(--secondary-button-hover-color, #f3f2f2);
            }

            :host(.btn-success) {
                color: var(--button-text-color, #ffffff);
                background-color: var(--success-button-color, #09c021);
                border-color: var(--success-button-color, #09c021);
                --pebble-icon-color: {
                    fill: var(--palette-white, #ffffff);
                }
            }

            :host(.btn-success:hover) {
                background-color: var(--success-button-hover-color, #43af43);
                border-color: var(--success-button-hover-color, #43af43);
            }

            :host(.btn-warning) {
                color: var(--button-text-color, #ffffff);
                background-color: var(--warning-button-color, #f0ad4e);
                border-color: var(--warning-button-color, #f0ad4e);
                --pebble-icon-color: {
                    fill: var(--palette-white, #ffffff);
                }
            }

            :host(.btn-warning:hover) {
                background-color: var(--warning-button-hover-color, #ec971f);
                border-color: var(--warning-button-hover-color, #ec971f);
            }

            :host(.btn-error) {
                color: var(--button-text-color, #ffffff);
                background-color: var(--error-button-color, #ed204c);
                border-color: var(--error-button-color, #ed204c);
                --pebble-icon-color: {
                    fill: var(--palette-white, #ffffff);
                }
            }

            :host(.btn-error:hover) {
                background-color: var(--error-button-hover-color, #da133d);
                border-color: var(--error-button-hover-color, #da133d);
            }

            :host(.btn-outline-primary) {
                border-color: var(--primary-button-color, #139ee7);
                color: var(--primary-button-color, #139ee7);
                background-color: var(--palette-white);
                --pebble-icon-color: {
                    fill: var(--primary-button-color, #139ee7);
                }
                ;
            }

            :host(.btn-outline-primary:hover) {
                background: var(--primary-button-outline-hover, #eaf7fd);
            }

            :host(.btn-outline-secondary) {
                color: var(--secondary-button-text-color, #75808b);
                background-color: var(--secondary-button-color, #ffffff);
                border-color: var(--secondary-button-border-color, #c1cad4);
            }

            :host(.btn-outline-secondary:hover) {
                background-color: var(--secondary-button-hover-color, #f3f2f2);
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
                --pebble-icon-color: {
                    fill: var(--primary-border-button-text-color, #036bc3);
                }
            }

            :host(.dropdown-outline-secondary) {
                color: var(--secondary-button-text-color, #75808b);
                background-color: var(--secondary-button-color, #ffffff);
                border-color: var(--secondary-button-border-color, #c1cad4);
            }

            :host(.dropdown-outline-secondary:hover) {
                background-color: var(--secondary-button-hover-color, #f3f2f2);
            }

            :host(.dropdown-primary) {
                border-color: var(--primary-button-color, #139ee7);
                background: var(--primary-button-color, #139ee7);
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
                --pebble-button-left-icon: {
                    width: 16px !important;
                    height: 16px !important;
                }
                ;
            }

            .btn.dropdown {
                --pebble-button: {
                    padding-left: 5px;
                }
            }

            /* IE11 specific stying for paper-item center aligned*/

            .list {
                color: var(--focused-line, #026bc3);
                @apply --layout-vertical;
            }
            paper-menu-button paper-menu paper-item {
                font-size: var(--font-size-sm, 12px) !important;
                min-height: 30px;
            }

            paper-menu-button {
                --paper-menu-button-content: {
                    margin-top: 30px;
                }
            }
        </style>
        <template is="dom-if" if="[[!menuButton]]">
            <template is="dom-if" if="[[!actionMenu]]">
                <paper-button id="simpleButton" tabindex\$="[[tabindex]]" elevation="[[elevation]]" noink="[[noink]]" toggles="[[toggles]]" disabled="[[disabled]]">
                    <template is="dom-if" if="[[iconUrl]]">
                        <img id="customIcon" src="[[iconUrl]]">
                    </template>
                    <template is="dom-if" if="[[_computeIconButton(icon,buttonText)]]">
                        <pebble-icon id="leftIcon" icon="[[icon]]"></pebble-icon>
                    </template>
                    <template is="dom-if" if="[[!buttonText]]">
                        <template is="dom-if" if="[[icon]]">
                            <pebble-icon icon="[[icon]]"></pebble-icon>
                        </template>
                    </template>
                    <template is="dom-if" if="[[buttonText]]">
                        <div id="buttonTextBox" class="text-ellipsis">[[buttonText]]</div>
                    </template>
                    <template is="dom-if" if="[[dropdownIcon]]">
                        <pebble-icon id="rightIcon" class="pebble-icon-size-10" icon="pebble-icon:navigation-action-down"></pebble-icon>
                    </template>
                </paper-button>
            </template>
            <template is="dom-if" if="[[actionMenu]]">
                <paper-button id="actionParentButton" tabindex\$="[[tabindex]]" elevation="[[elevation]]" noink="[[noink]]" toggles="[[toggles]]" disabled="[[disabled]]" on-tap="_onActionParentTap">
                    <template is="dom-if" if="[[iconUrl]]">
                        <img id="customIcon" src="[[iconUrl]]">
                    </template>
                    <template is="dom-if" if="[[icon]]">
                        <pebble-icon icon="pebble-icon:saved-search" class="pebble-icon-size-16 pebble-icon-color-blue m-r-10"></pebble-icon>
                    </template>
                    <template is="dom-if" if="[[buttonText]]">
                        <div id="buttonTextBox" class\$="[[_computeEllipsis()]]">[[buttonText]]</div>
                    </template>
                </paper-button>
                <pebble-icon id="actionButton" tabindex="-1" on-tap="_onActionsButtonTap" icon="pebble-icon:actions-more-vertical" class="pebble-icon-size-14 pebble-icon-color-blue dropdown-trigger" noink="">
                </pebble-icon>
                <pebble-popover id="actionsPopover" for="actionButton" no-overlap="" horizontal-align="right" allow-multiple="">
                    <template is="dom-repeat" items="{{actionsData}}" as="action">
                        <paper-item data="[[action]]" on-tap="_onActionTap">
                            <template is="dom-if" if="{{action.icon}}">
                                <pebble-icon class="pebble-icon-size-16" icon="{{action.icon}}"></pebble-icon>
                            </template>
                            <span>{{action.text}}</span>
                        </paper-item>
                    </template>
                </pebble-popover>
            </template>
        </template>
        <template is="dom-if" if="[[menuButton]]">
            <paper-menu-button id="menuButton" tabindex\$="[[tabindex]]" allow-outside-scroll="[[allowOutsideScroll]]" dynamic-align="[[dynamicAlign]]" horizontal-align="[[horizontalAlign]]" vertical-align="[[verticalAlign]]" horizontal-offset="[[horizontalOffset]]" vertical-offset="[[verticalOffset]]" disabled="[[disabled]]" no-animations="" no-overlap="[[noOverlap]]">
                <paper-button id="button" tabindex="-1" class="dropdown-trigger" no-animations="" elevation="[[elevation]]" noink="[[noink]]" toggles="[[toggles]]" disabled="[[disabled]]" slot="dropdown-trigger">
                    <template is="dom-if" if="[[_computeIconButton(icon,buttonText)]]">
                        <pebble-icon id="leftIcon" class="pebble-icon-size-16" icon="[[icon]]"></pebble-icon>
                    </template>
                    <template is="dom-if" if="[[!buttonText]]">
                        <template is="dom-if" if="[[icon]]">
                            <pebble-icon icon="[[icon]]" class="pebble-icon-size-16"></pebble-icon>
                        </template>
                    </template>
                    <template is="dom-if" if="[[buttonText]]">
                        <div id="buttonTextBox" class="text-ellipsis">[[buttonText]]</div>
                    </template>
                    <template is="dom-if" if="[[dropdownIcon]]">
                        <pebble-icon id="rightIcon" class="pebble-icon-size-14" icon="pebble-icon:navigation-action-down"></pebble-icon>
                    </template>
                </paper-button>

                <paper-listbox slot="dropdown-content" id="paperMenu" class="dropdown-content">
                    <template is="dom-repeat" items="{{itemData}}" as="button">
                        <div class="list">
                            <paper-item data="[[button]]" on-tap="_onTap">
                                <template is="dom-if" if="{{button.icon}}">
                                    <pebble-icon icon="{{button.icon}}"></pebble-icon>
                                </template>
                                <span>{{button.text}}</span>
                            </paper-item>
                        </div>
                    </template>
                </paper-listbox>
            </paper-menu-button>
        </template>
`;
  }

  static get is() { return 'pebble-button' }

  static get properties() {
      return {
          /**
           * Indicates that the button is styled with a shadow if the value is <b>true</b>.
           */
          raised: {
              type: Boolean,
              value: false,
              notify: true
          },
          /**
           * Indicates the z-depth of this element from 0 to 5. Setting to 0 removes the shadow, and 
           * each increasing number greater than 0 is <b>deeper</b> than the last.
           */
          elevation: {
              type: Number,
              value: 0,
              notify: true
          },
          /**
           * Indicates that the button toggles the active state with each tap or press of the spacebar if the value is <b>true</b>.
           */
          toggles: {
              type: Boolean,
              value: false,
              notify: true
          },
          /**
           * Indicates that the element does not produce a ripple effect when interacted via the pointer if the value is <b>true</b>.
           */
          noink: {
              type: Boolean,
              value: true,
              notify: true
          },
          /**
           * Indicates that an element opens a menu on a button click, if the value is <b>true</b>.
           */
          menuButton: {
              type: Boolean,
              value: false,
              notify: true
          },
          /**
            * Indicates that an ellipsis is displayed or not.
            */
          enableEllipsis: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates icon if the value is set.
           */
          icon: {
              type: String,
              value: function () { return null; }

          },
          /**
           * Indicates the button text if the value is set.
           */
          buttonText: {
              type: String,
              value: function () { return null; },
              reflectToAttribute: true,
              notify: true
          },
          /**
           * Indicates that the button has actions menu, if the value is <b>true</b>.
           */
          actionMenu: {
              type: Boolean,
              value: false,
              reflectToAttribute: true,
              notify: true
          },
          /**
           * Indicates that the drop-down constraints scrolls on the page to itself when its opened by default. 
           * Set it to <b>true</b> to prevent this constraint on the scroll.
           */
          allowOutsideScroll: {
              type: Boolean,
              value: false,
              notify: true
          },
          /**
           * Indicates that instead of strict requirements, `horizontalAlign` and `verticalAlign` properties 
           * are considered when the drop-down is positioned. If the value is <b>true</b>, it reduces
           * the area of the drop-down falling outside of `fitInto`.
           */
          dynamicAlign: {
              type: Boolean,
              value: false,
              notify: true
          },
          /**
           * Indicates the orientation to align the menu dropdown horizontally relative to the drop-down trigger.
           */
          horizontalAlign: {
              type: String,
              value: "right",
              notify: true
          },
          /**
           * Indicates the orientation to align the menu dropdown vertically relative to the dropdown trigger.
           */
          verticalAlign: {
              type: String,
              value: "bottom",
              notify: true
          },
          /**
           * Indicates the pixel value. This is added to the calculated position value for the
           * given `horizontalAlign` property. You can use a negative value to offset to the
           * left, or a positive value to offset to the right.
           */
          horizontalOffset: {
              type: Number,
              value: 0,
              notify: true
          },
          /**
           * Indicates the pixel value. This is added to the calculated position value for the
           * given `verticalAlign` property. You can use a negative value to offset towards the
           * top, or a positive value to offset towards the bottom.
           */
          verticalOffset: {
              type: Number,
              value: 0,
              notify: true
          },
          /**
           * Indicates that animations are disabled when opening and closing the
           * drop-down if the value is <b>true</b>.
           */
          noAnimations: {
              type: Boolean,
              value: false,
              notify: true
          },
          /**
           * Indicates that the drop-down is positioned so that it doesn't overlap
           * the button if the value is <b>true</b>.
           */
          noOverlap: {
              type: Boolean,
              value: false,
              notify: true
          },
          /**
           * Indicates that the menu button will have the dropdown arrow icon
           * if the value is set to <b>true</b>.
           */
          dropdownIcon: {
              type: Boolean,
              value: false
          },
          /**
           * Indicates the array of objects which are ready to bound to menu.
           */
          itemData: {
              type: Array,
              value: function () { return []; }
          },
          /**
           * Indicates the array of action buttons which are ready to bound to menu.
           */
          actionsData: {
              type: Array,
              value: function () { return []; }
          },
          /**
           * Specifies whether or not you can interact with this element. If is set to "true", you cannot interact with this element.
           */
          disabled: {
              type: Boolean,
              value: false,
              notify: true,
              reflectToAttribute: true
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          tabindex: {
              type: Number
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          iconUrl: {
              type: String,
              value: ''
          },
          data: {
              type: Object,

          }
      }
  }

  _onTap(e) {
      let eventDetail = {
          name: e.currentTarget.data.eventName,
          data: e.currentTarget.data
      }
      this.dispatchEvent(new CustomEvent('bedrock-event', { detail: eventDetail, bubbles: true, composed: true }));
  }
  _computeIconButton(icon, buttonText) {
      if (icon && buttonText) {
          return true
      } else {
          return false;
      }
  }
  _computeEllipsis() {
      return this.enableEllipsis ? "text-ellipsis" : "";
  }

  // Action Button
  _onActionsButtonTap(e) {
      this._actionsPopover = this._actionsPopover || this.shadowRoot.querySelector('#actionsPopover');
      this._actionsPopover.show();
  }
  _onActionTap(e) {
      // Get the parent pebble button to get the parent button data object.
      let parentElement;
      let selectedTabElement;
      let path = ElementHelper.getElementPath(e);

      if (path && path.length > 0) {
          for (let i = 0; i < path.length; i++) {
              if (path[i].nodeName == "PEBBLE-BUTTON") {
                  parentElement = path[i];
              }
              if (path[i].nodeName == "ROCK-TABS") {
                  selectedTabElement = path[i];
                  break;
              }
          }
      }
      if (parentElement != undefined && selectedTabElement != undefined) {
          let parentButtonData = parentElement.data;
          let selectedTabIndex = selectedTabElement.selectedTabIndex;
          if (selectedTabElement.config != undefined && selectedTabElement.config.tabItems != undefined
              && selectedTabElement.config.tabItems != null && selectedTabIndex != undefined) {

              let selectedTabObject = selectedTabElement.config.tabItems[selectedTabIndex];
              let eventDetail = {
                  name: e.currentTarget.data.eventName,
                  data: { actionData: e.currentTarget.data, parentButton: parentButtonData, currentTab: selectedTabObject }
              }
              this.fireBedrockEvent(e.currentTarget.data.eventName, eventDetail.data, { ignoreId: true });
          }
      }
  }
  _onActionParentTap(e) {
      let parentElement;;
      let path = ElementHelper.getElementPath(e);
      if (path && path.length > 0) {
          for (let i = 0; i < path.length; i++) {
              if (path[i].nodeName == "PEBBLE-BUTTON") {
                  parentElement = path[i];
                  break;
              }
          }
      }
      if (parentElement != undefined) {
          let parentButtonData = parentElement.data;
          this.fireBedrockEvent("actions-parent-button-tap", parentButtonData, { ignoreId: true });
      }
  }
}
customElements.define(PebbleButton.is, PebbleButton)
