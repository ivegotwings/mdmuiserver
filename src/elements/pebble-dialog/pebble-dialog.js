/**
`<pebble-dialog>` Represents a dialog with material design styling and optional animations when it is
opened or closed. It provides styles for a header, content area, and an action area for buttons.

The following code implements a dialog with a header, scrolling content area, and
buttons. The focus is on the `dialog-confirm` button when the dialog is opened.

### Example
    <pebble-dialog>
      <h2>Header</h2>
        Lorem ipsum...
      <div class="buttons">
        <paper-button dialog-dismiss>Cancel</paper-button>
        <paper-button dialog-confirm autofocus>Accept</paper-button>
      </div>
    </pebble-dialog>

### Styling

Custom property    | Description              | Default
-------------------|-------------|-------------
`--dialog-layout`  | Mixin applied to #dialog | `{}`


@group pebble Elements
@element pebble-dialog
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/paper-dialog/paper-dialog.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-heading.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-button/pebble-button.js';
import { flush } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleDialog extends mixinBehaviors([RUFBehaviors.UIBehavior], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-heading bedrock-style-icons bedrock-style-padding-margin">
            :host {
                --data-table-container-position-dialog: {
                    position: absolute;
                }

                --pebble-data-table: {
                    @apply --rock-entity-compare-dialog;
                }

                --step-container-manage: {
                    margin: 0px 0px;
                }

                --navigation-buttons-wizard: {
                    margin: 0px 20px;
                }
            }

            #dialog {
                position: fixed;
                top: 5px !important;
                right: 0;
                left: 0 !important;
                max-width: 80% !important;
                max-height: 100% !important;
                border-radius: 3px;
                box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.22);
                background-color: var(--popup-background-color, #ffffff);
                margin: 0 auto 30px auto !important;
                padding: 0 !important;
                overflow: hidden;
                width: 100%;
                z-index: 1003 !important;
                @apply --dialog-component;
            }

            .dialogTitle {
                position: relative;
                color: var(--popup-header-text-color, #ffffff);
                background-color: var(--popup-header-color, #036bc3);
                font-family: var(--default-font-family);
                height: 40px;
                font-size: var(--default-font-size, 14px) !important;
                margin: 0 !important;
                padding: 0 20px !important;
                line-height: 3.1 !important;
                text-align: left;
            }

            #closeIcon {
                position: absolute;
                right: 15px;
                top: -2px;
                cursor: pointer;
            }

            .dialogContent {
                padding: 10px 20px 20px !important;
                margin: 0 !important;
            }

            .buttons {
                padding: 0 !important;
                margin-top: 10px !important;
                margin-bottom: 10px !important;
                text-align: center;
                display: block !important;
            }

            :host(.opened) {
                opacity: 0.4;
            }

            :host([alert-box]) #dialog {
                text-align: center;
                top: 20% !important;
                max-width: 400px !important;
            }

            :host([small]) #dialog {
                max-width: 40% !important;
            }

            :host([medium]) #dialog {
                max-width: 60% !important;
            }

            :host([large]) #dialog {
                max-width: 90% !important;
            }

            :host ::slotted(ul) {
                padding-left: 50px !important;
            }

            .margin-zero {
                margin: 0px;
            }
        </style>
        <template is="dom-if" if="[[_isReadyToShowDialog]]">
            <paper-dialog id="dialog" on-iron-overlay-opened="_onDialogOpened" on-iron-overlay-closed="_onDialogClose" role="alertdialog" position-target="[[positionTarget]]" horizontal-align="[[horizontalAlign]]" vertical-align="[[verticalAlign]]" dynamic-align="[[dynamicAlign]]" no-overlap="[[noOverlap]]" vertical-offset="[[verticalOffset]]" horizontal-offset="[[horizontalOffset]]" no-cancel-on-outside-click="[[noCancelOnOutsideClick]]" no-cancel-on-esc-key="[[noCancelOnEscKey]]">
                <h2 class="dialogTitle" id="paperDialogTitle" on-track="handleTrack">[[dialogTitle]]
                    <!-- Close Dialog -->
                    <template is="dom-if" if="[[showCloseIcon]]">
                        <div id="closeIcon">
                            <pebble-icon id="close" name="close" icon="pebble-icon:window-action-close" title="Close" on-tap="_onCloseClickHandler" class="icon pebble-icon-color-white pebble-icon-size-12" role="button" tabindex="0" aria-disabled="false"></pebble-icon>
                        </div>
                    </template>
                </h2>

                <div class="dialogContent">
                    <slot></slot>
                    <template is="dom-if" if="[[_showCancelok()]]">
                        <div class="buttons">
                            <!-- Cancel Button -->
                            <template is="dom-if" if="[[showCancel]]">
                                <pebble-button button-text="[[buttonCancelText]]" class="btn btn-secondary m-r-5" on-tap="_cancel" raised="" elevation="0"></pebble-button>
                            </template>
                            <!-- Ok Button -->
                            <template is="dom-if" if="[[showOk]]">
                                <pebble-button button-text="[[buttonOkText]]" class="btn btn-success" on-tap="_confirm" raised="" elevation="0"></pebble-button>
                            </template>
                        </div>
                    </template>
                </div>
            </paper-dialog>
        </template>
`;
  }

  static get is() {
      return "pebble-dialog";
  }
  static get properties() {
      return {
          /** 
           * Indicates the dialog is open.
           */
          _isReadyToShowDialog: {
              type: Boolean,
              value: false
          },
          /** 
           * Indicates the title of the dialog.
           */
          dialogTitle: {
              type: String,
              value: 'Title'
          },

          /**
           * Indicates whether or not the dialog is modal.
           * If it is set to <b>true</b>, then this implies no-cancel-on-outside-click, no-cancel-on-esc-key, and with-backdrop.
           */
          modal: {
              type: Boolean
          },

          /**
           * Indicates the orientation against which the element are aligned horizontally relative to the positionTarget.
           * The possible values are left, right, and auto.
           */
          horizontalAlign: {
              type: String
          },

          /**
           * Indicates the orientation against which the element are aligned vertically relative to the positionTarget.
           * The possible values are top, bottom, and auto.
           */
          verticalAlign: {
              type: String
          },

          /**
           * Indicates the alignment of dialog dynamically.
           * If it is set to <b>true</b>, then it uses horizontalAlign and verticalAlign values as preferred alignment.
           * If there is not enough space, then it picks the values which minimizes the cropping.
           */
          dynamicAlign: {
              type: Boolean,
          },
          isPartOfBusinessFunction: {
              type: Boolean,
              value: false
          },


          /**
           * Indicates whether or not to position the element around the positionTarget without overlapping it.
           */
          noOverlap: {
              type: Boolean
          },

          /**
           * Indicates the element that is used to position the dialog control. If it is not set, then it defaults to the parent node.
           */
          positionTarget: {
              type: Element,
              observer: '_positionTargetChanged'
          },

          /**
           * Indicates the vertical positioning. It is same as setting margin-top and margin-bottom css properties. 
           */
          verticalOffset: {
              type: Number
          },

          /**
           * Indicates horizontal positioning. It is same as setting margin-left and margin-right css properties.
           */
          horizontalOffset: {
              type: Number
          },
          /**
           * Indicates property to disable cancelling the overlay by clicking outside it.
           */
          noCancelOnOutsideClick: {
              type: Boolean,
              value: false
          },
          /**
           * Indicates property to disable cancelling the overlay with the ESC key.
           */
          noCancelOnEscKey: {
              type: Boolean,
              value: false
          },

          /* Specifies whether or not the dailog close button can be shown.
           * If it is set to <b>true</b>, then the dialog close button is shown.
           */
          showCloseIcon: {
              type: Boolean,
              value: false
          },
          /* Specifies whether or not the `Ok` button is displayed on dailog.
           * If it is set to <b>true</b>, `Ok` button is displayed.
           */
          showOk: {
              type: Boolean,
              value: false
          },
          /**
           * Indcates the `Ok` button text if `showOk` is set to true.
           */
          buttonOkText: {
              type: String,
              value: 'Yes'
          },
          /* Specifies whether or not the `Cancel` button is displayed on dailog.
           * If it is set to <b>true</b>, `Cancel` button is displayed.
           */
          showCancel: {
              type: Boolean,
              value: false
          },
          /**
           * Indcates the `Cancel` button text if `showCancel` is set to true.
           */
          buttonCancelText: {
              type: String,
              value: 'Cancel'
          },
          enableDrag: {
              type: Boolean,
              value: false
          },
          cursorToEdgePosition: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          cssText: {
              type: String
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          close: {
              notify: true,
              value: function () {
                  return this._close.bind(this);
              }
          }
      }
  }

  open() {
      this._isReadyToShowDialog = true;
      flush();

      if (this.modal) {
          this._createOverlay('bodyOverlay', 'fixed', '1002');
      }

      if(this.dialog && !this.dialog.opened) {
          this.dialog.open();
      }

      //this.$.dialog.open();
  }

  isVisible() {
      return this._isReadyToShowDialog;
  }

  _createOverlay(className, position, zIndex) {
      if (this.shadowRoot.querySelector(".bodyOverlay")) return;

      let tag = document.createElement('div');
      tag.className = className;
      tag.setAttribute('style', 'display:block;transition: opacity 0.2s;z-index:' + zIndex +
          ';opacity:.6;position:' + position +
          ';top:0px;left:0px;width:100%;height:100%;background-color:#000;');
      tag.setAttribute('onClick',
          'if(event.stopPropagation){event.stopPropagation();}event.cancelBubble=true;')

      this.shadowRoot.appendChild(tag);
  }

  _onDialogOpened() {
      this.cssText = this.dialog.style.cssText;
  }

  handleTrack(e) {
      if (this.enableDrag) {
          switch (e.detail.state) {
              case 'start':
                  {
                      let dialogBoundClient = this.dialog.getBoundingClientRect();
                      this.cursorToEdgePosition.left = e.detail.x - dialogBoundClient.left;
                      this.cursorToEdgePosition.top = e.detail.y - dialogBoundClient.top;
                      this._onDrag(e);
                      break;
                  }
              case 'track':
                  {
                      this._onDrag(e);
                      break;
                  }
              case 'end':
                  {
                      this._onDrag(e);
                      break;
                  }
          }
      }
  }

  _onDrag(e) {
      let leftPosition, topPosition;
      let titleHeight = this.shadowRoot.querySelector('#paperDialogTitle').clientHeight;
      let topBoundaryLine = titleHeight - this.cursorToEdgePosition.top + e.detail.y
      if (topBoundaryLine >= titleHeight && e.detail.y <= window.innerHeight) {
          if (this.cursorToEdgePosition.left && this.cursorToEdgePosition.top) {
              leftPosition = e.detail.x - this.cursorToEdgePosition.left;
              topPosition = e.detail.y - this.cursorToEdgePosition.top;
          }
          let positions = 'right:auto;top:' + topPosition + 'px !important;left:' + leftPosition + 'px !important;'
          let cssList = this.cssText + positions;
          this.dialog.setAttribute('style', cssList);
      }
  }

  _removeOverlay() {
      ComponentHelper.removeNode(this.shadowRoot.querySelector(".bodyOverlay"));
      if (this.enableDrag) {
          let positions = 'top:0px;left:0px;right:0px;';
          let cssList = this.cssText + positions;
          this.dialog.setAttribute('style', cssList);
      }
  }

  get dialog() {
      return this.shadowRoot.querySelector('#dialog');
  }

  _close() {
      this._isReadyToShowDialog = false;
      if (this.modal) {
          this._removeOverlay();
      }

      if (this.dialog && this.dialog.opened) {
          this.dialog.close();
      }
  }

  _confirm(event) {
      this._close();
      let eventDetail = event;
      this.fireBedrockEvent("on-buttonok-clicked", eventDetail);
  }

  _cancel(event) {
      this._close();
      let eventDetail = event;
      this.fireBedrockEvent("on-buttoncancel-clicked", eventDetail);
  }

  _positionTargetChanged() {
      this.dialog.classList.add('margin-zero');
  }

  getControlIsDirty() {
      return this._isReadyToShowDialog;
  }

  _showCancelok() {
      return this.showCancel || this.showOk;
  }

  _onDialogClose(event) {
      this.dispatchEvent(new CustomEvent('asset-popover-closed', {
          detail: event,
          bubbles: true,
          composed: true
      }));
  }

  _onCloseClickHandler(ev) {
      if (this.isPartOfBusinessFunction) {
          let eventData = {
              name: "on-buttonclose-clicked"
          };
          this.dispatchEvent(new CustomEvent('bedrock-event', {
              detail: eventData,
              bubbles: true,
              composed: true
          }));
      } else {
          this._close();
      }
  }
}
customElements.define(PebbleDialog.is, PebbleDialog);
