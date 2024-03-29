/**
` <pebble-card> ` Represents a container with a drop shadow. 
It contains a photo, text, and a link about a single subject. 
It displays the content containing elements of varying size such as notification list or charts.

@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/paper-material/paper-material.js';
import '@polymer/paper-item/paper-item.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-gridsystem.js';
import '../bedrock-helpers/element-helper.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-popover/pebble-popover.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
class PebbleCard extends PolymerElement {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-gridsystem bedrock-style-grid-layout bedrock-style-icons bedrock-style-padding-margin">
            :host {
                display: block;
                height: 100%;
            }

            [hidden] {
                display: none !important;
            }

            :host::slotted(.card-content) {
                padding-top: 0px;
                padding-right: 0px;
                padding-bottom: 0px;
                padding-left: 0px;
                @apply --paper-card-content;
            }

            :host::slotted(.card-actions) {
                border-top: 1px solid #e8e8e8;
                padding-top: 0px;
                padding-right: 0px;
                padding-bottom: 0px;
                padding-left: 0px;
                position: relative;
                @apply --paper-card-actions;
            }

            :host paper-item {
                cursor: pointer;
            }

            pebble-popover paper-item {
                cursor: pointer;
                font-size: var(--font-size-sm, 12px);
                min-height: 24px;
                color: var(--palette-steel-grey, #75808b);
                text-align: left;
                transition: all 0.3s;
                -webkit-transition: all 0.3s;
                padding-left: var(--default-popup-item-l-p, 20px);
                padding-right: var(--default-popup-item-r-p, 20px);
                height: 12px;
                /*IE11 fix for paper-item center alignment on hover of an item*/
            }

            pebble-popover paper-item:hover {
                background-color: var(--bgColor-hover, #e8f4f9);
                color: var(--focused-line, #026bc3);
            }

            pebble-popover paper-item:focus {
                color: var(--primary-button-color, #036bc3);
                background-color: var(--bgColor-hover, #e8f4f9);
            }

            .widget-box {
                padding: 15px;
                border: solid 1px var(--default-border-color, #c1cad4);
                margin: 10px 0 0 10px;
                box-shadow: 1px 2px 5px -1px var(--default-border-color, #c1cad4);
                min-width: 310px;
                font-size: var(--default-font-size, 14px);
                @apply --pebble-card-widget-box;
                @apply --box-style;
            }

            .widget-title {
                font-weight: var(--font-bold, bold);
                font-size: var(--default-font-size, 14px);
                color: var(--main-content-text-color, #192027);
                @apply --layout-flex;
                --pebble-icon: {
                    fill: var(--card-title-icon-color, #1a2028);
                }
            }

            .widget-title-wrapper {
                display: flex;
                align-items: center;
                line-height: 16px;

            }

            .icon-refresh-spin {
                animation-name: spin;
                animation-duration: 0.7s;
                animation-iteration-count: infinite;
                animation-timing-function: linear;
            }

            @keyframes spin {
                from {
                    transform: rotate(0deg);
                }

                to {
                    transform: rotate(360deg);
                }
            }

            .pebble-card-container{
                height:100%;
                overflow-y: auto;
                overflow-x: hidden;
            }

            .widget-sub-title {
                font-size: var(--default-font-size, 14px);
                color: var(--label-text-color, #96b0c6);
            }
            .cursor-pointer{
                cursor: pointer;
            }
        </style>
        <div class="widget-box">
            <div class="base-grid-structure">
                <div class="base-grid-structure-child-1">
                    <div class="p-b-5 widget-title-wrapper" hidden\$="[[noHeader]]">
                        <div hidden\$="[[!heading]]" class="widget-title">
                            <template is="dom-if" if="[[_showHeaderIcon]]">
                                <pebble-icon class="pebble-icon-size-20 m-r-5" icon="[[headerIcon]]"></pebble-icon>
                            </template>[[heading]]
                        </div>
                        <div class="card-icons">
                            <template is="dom-if" if="[[_cardIconButtons]]">
                                <template is="dom-repeat" items="[[_cardIconButtons]]">
                                    <pebble-icon name="[[item.name]]" class=" cursor-pointer pebble-icon-size-16 pebble-icon-color-grey" icon="[[item.icon]]" on-tap="_onIconButtonClick" title="Refresh" noink="">
                                    </pebble-icon>
                                </template>
                            </template>

                            <template is="dom-if" if="[[!nonMaximizable]]">
                                <pebble-icon id="maximize" class="minimize pebble-icon-size-16 pebble-icon-color-grey m-l-10" name="maximize" icon="pebble-icon:window-action-expand" title="Expand">
                                </pebble-icon>
                                <pebble-icon id="settings" class="minimize pebble-icon-size-16 pebble-icon-color-grey m-l-10" name="settings" icon="pebble-icon:settings" title="Settings">
                                </pebble-icon>
                            </template>

                            <template is="dom-if" if="[[!nonClosable]]">
                                <pebble-icon name="remove" icon="pebble-icon:governance-failed" class="cursor-pointer pebble-icon-size-16 pebble-icon-color-grey" title="Remove" on-tap="_onRemoveClick">
                            </pebble-icon></template>

                            <template is="dom-if" if="[[_isMoreButtonsAvailable(_moreIconButtons)]]">
                                <pebble-icon id="actionButton" on-tap="_onActionsButtonTap" icon="pebble-icon:actions-more-vertical" class="cursor-pointer dropdown-trigger m-l-5 pebble-icon-size-12" noink="" title="More">
                                </pebble-icon>
                                <pebble-popover id="actionsPopover" for="actionButton" no-overlap="" horizontal-align="auto" allow-multiple="">
                                    <template is="dom-repeat" items="[[_moreIconButtons]]">
                                        <paper-item name="[[item.name]]" on-tap="_onIconButtonClick">
                                            [[item.label]]
                                        </paper-item>
                                    </template>
                                </pebble-popover>
                            </template>
                        </div>
                    </div>
                </div>
                <div class="base-grid-structure-child-2">
                    <div class="pebble-card-container">
                        <slot name="pebble-card-content"></slot>
                    </div>
                </div>
            </div>
        </div>
`;
  }

  static get is() {
      return "pebble-card";
  }

  static get properties() {
      return {
          /**
           * Indicates the title of the card.
           * 
           */
          heading: {
              type: String,
              value: "Card Heading"
          },

          /**
           * Indicates to hide/display header
           */
          noHeader: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates the url of the title image of the card.
           * 
           */
          headerIcon: {
              type: String,
              value: ""
          },

          /**
           * Specifies whether the card container can be closed or not.
           * If it is set to <b>true</b>, then the card container cannot be closed.
           * 
           */
          nonClosable: {
              type: Boolean,
              value: false
          },

          /**
           * Specifies whether the card container can be maximized or not.
           * If it is set to <b>true</b>, then the card container cannot be maximized.
           * 
           */
          nonMaximizable: {
              type: Boolean,
              value: false
          },

          /**
           * Specifies whether the card container's position can be dragged or not.
           * If it is set to <b>true</b>, then the card is not draggable.
           * 
           */
          nonDraggable: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates the list of actions available in <b>more</b> icon on top right corner of the card.
           * 
           */
          iconButtons: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _cardIconButtons: {
              type: Array,
              value: function () {
                  return [];
              },
              computed: '_computeCardIconButtons(iconButtons)'
          },

          _moreIconButtons: {
              type: Array,
              value: function () {
                  return [];
              },
              computed: '_computeMoreIconButtons(iconButtons)'
          },

          _showHeaderIcon: {
              type: Boolean,
              computed: "_isHeaderIconEmpty(headerIcon)"
          }
      }
  }

  _computeMoreIconButtons(iconButtons) {
      let moreIconButtons = [];

      if (!DataHelper.isEmptyObject(iconButtons)) {
          iconButtons.forEach(function (iconButton) {
              if (iconButton.showInMoreActions) {
                  moreIconButtons.push(iconButton);
              }
          });
      }

      return moreIconButtons;
  }

  _isMoreButtonsAvailable() {
      if (_.isEmpty(this._moreIconButtons)) {
          return false;
      }
      return true;
  }

  _computeCardIconButtons(iconButtons) {
      let cardIconButtons = [];

      if (!DataHelper.isEmptyObject(iconButtons)) {
          iconButtons.forEach(function (iconButton) {
              if (!iconButton.showInMoreActions) {
                  cardIconButtons.push(iconButton);
              }
          });
      }

      return cardIconButtons;
  }

  // Action Button
  _onActionsButtonTap(e) {
      this._actionsPopover = this._actionsPopover || this.shadowRoot.querySelector('#actionsPopover');
      this._actionsPopover.show();
  }

  _isHeaderIconEmpty(headerIcon) {
      if (headerIcon && headerIcon !== "") {
          return true;
      } else {
          return false;
      }
  }

  /**
   * Used to process the event that gets tiggered when one of the header buttons gets clicked. 
   * 
   */
  _onIconButtonClick(e) {
      let targetName = e.target.name;
      //when clicking on the atcual icon, the target is iron icon, 
      //when clicking outside edge of icon the target is paper icon button
      let path = ElementHelper.getElementPath(e);
      if (e.target.tagName == "IRON-ICON") {
          targetName = path[1].name;
      }
      for (let i = 0; i < this.iconButtons.length; i++) {
          if (this.iconButtons[i].name == targetName) {
              if (targetName === "refresh" || targetName === "refreshIcon") {
                  let elem = e.target;
                  timeOut.after(300).run(() => {
                      elem.classList.add('icon-refresh-spin');
                      elem.removeAttribute('title');
                  })
                  timeOut.after(600).run(() => {
                      elem.classList.remove('icon-refresh-spin');
                      elem.setAttribute('title', 'Refresh');
                  })
              }
              this.dispatchEvent(new CustomEvent("icon-button-click", { detail: this.iconButtons[i], bubbles: true, composed: true }));
          }
      }
  }

  /**
   * Used to process the event that gets tiggered when "Maximize" button is clicked. 
   * 
   */
  _onMaximizeClick(e) {
      // alert('_onMaximizeClick');
  }

  /**
   * Used to process the event that gets tiggered when "Remove" button is clicked. 
   * 
   */
  _onRemoveClick(e) {
      // alert('_onRemoveClick');
  }
}

customElements.define(PebbleCard.is, PebbleCard)
