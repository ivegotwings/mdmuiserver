/**

`pebble-toast` Represents an element that provides precise notifications at the bottom of the screen. They 
are primarily used for system messaging. You can automatically swipe this off from the screen once it is displayed by setting the duration in the `auto-close' property.  
Multiple pebble-toasts can be visible on the screen.

### Example

        <paper-button id="btnError" raised>Show Error</paper-button>
				<pebble-toast id="toastError" toast-type="error" align-toast="top">
					This is an error message!
				</pebble-toast>
				<script>
					window.addEventListener('WebComponentsReady', function(e) {
							document.querySelector("#btnError").addEventListener('click', function(e) {
								document.querySelector("#toastError").show();
							});
					});
				</script>

### Styling
The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--pebble-toast` | Mixin applied to toast | {}

### Accessibility

See the docs for `Polymer.IronOverlayBehavior` for accessibility features implemented by this element.

@group Pebble Elements
@element pebble-toast
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { IronA11yAnnouncer } from '@polymer/iron-a11y-announcer/iron-a11y-announcer.js';
import { IronOverlayBehaviorImpl, IronOverlayBehavior } from '@polymer/iron-overlay-behavior/iron-overlay-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import { Base } from '@polymer/polymer/polymer-legacy.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
// Keeps track of the toast currently opened.
let currentToast = null;
let currentTopOpenedToasts = [];
let currentBottomOpenedToasts = [];
let currentCenterOpenedToasts = [];

let _top = "top";
let _bottom = "bottom";
let _center = "center";
let _right = "right";
class PebbleToast extends mixinBehaviors([IronOverlayBehavior], PolymerElement){
  static get template() {
    return html`
            <style include="bedrock-style-common bedrock-style-icons">
                :host {
                    display: block;
                    position: fixed;
                    background-color: var(--toast-background, #ffffff);
                    color: var(--toast-font-color, #4b4e51);
                    width: 440px;
                    box-sizing: border-box;
                    box-shadow: 1px 2px 6px 1px rgba(0, 0, 0, 0.2);
                    border-radius: 3px;
                    margin: 25px;
                    line-height: 20px;
                    font-size: var(--font-size-sm, 12px);
                    cursor: default;
                    -webkit-transition: -webkit-transform 0.3s, opacity 0.3s;
                    transition: transform 0.3s, opacity 0.3s;
                    opacity: 0;
                    -webkit-transform: translateX(100px);
                    -ms-transform: translateX(100px);
                    transform: translateX(100px);
                    @apply --pebble-font-common-base;
                    @apply --pebble-toast;
                    overflow: hidden;
                    max-height: inherit!important;
                    z-index:99999999;
                }

                :host(.capsule) {
                    border-radius: 24px;
                }

                :host(.fit-bottom) {
                    width: 100%;
                    min-width: 0;
                    border-radius: 0;
                    margin: 0;
                }

                :host(.paper-toast-open) {
                    opacity: 1;
                    -webkit-transform: translateX(0px);
                    transform: translateX(0px);
                }

                :host([toast-type="success"]) .toast-type-icon {
                    background: var(--toast-success, #09c021);
                }

                :host([toast-type="error"]) .toast-type-icon {
                    background: var(--toast-error, #ee204c);
                }

                :host([toast-type="warning"]) .toast-type-icon {
                    background: var(--toast-warning, #f78e1e);
                }

                :host([toast-type="information"]) .toast-type-icon {
                    background: var(--toast-information, #139ee7);
                }

                :host([toast-type="task"]) .toast-type-icon {
                    background: var(--toast-task, #BB86EF);
                }

                .container {
                    @apply --layout-horizontal;
                    @apply --layout-justified;
                    align-items: center;
                    -webkit-align-items: center;
                    /* Safari 7.0+ */
                    width: 440px;
                    padding-left: 40px;
                    padding-right: 30px;
                    min-height: 40px!important;
                    position: relative;
                }

                .layout-vertical {
                    @apply --layout-horizontal;
                }

                .toast-heading {
                    font-weight: var(--font-bold, bold);
                }

                .toast-content {
                    padding: 20px 0 20px 20px;
                    line-height: 16px;
                }

                .toast-close {
                    cursor: pointer;
                    position: absolute;
                    top: 4px;
                    right: 10px;
                }

                .toast-type-icon {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 40px;
                    bottom: 0;
                }

                .toast-type-icon pebble-icon {
                    display: block;
                    position: relative;
                    top: 50%;
                    margin: 0 auto;
                    -webkit-transform: translateY(-50%);
                    -ms-transform: translateY(-50%);
                    transform: translateY(-50%);
                    --pebble-icon-color: {
                        fill: var(--palette-white, #ffffff);
                    }
                }

                pebble-toast a {
                    line-height: 28px;
                    padding: 0 10px;
                    color: var(--link-text-color, #045aa2)!important;
                    display: inline-block;
                    font-weight: 400;
                    line-height: 11px;
                    font-size: var(--default-font-size, 14px);
                    text-align: center;
                    white-space: nowrap;
                    box-sizing: border-box;
                    text-transform: uppercase;
                    text-decoration: none;
                }

                pebble-toast #toast-button {
                    text-align: right;
                    margin-right: -20px;
                    margin-top: 15px;
                    height: 12px;
                }

                pebble-toast #toast-button a:last-child {
                    font-weight: bold;
                }
            </style>

        <div class="container">
            <template is="dom-if" if="[[heading]]">
                <div class="layout-vertical">
                    <span class="toast-type-icon">
                        <pebble-icon icon="[[toastIcon]]" class="pebble-icon-size-20 pebble-icon-color-white"></pebble-icon>
                    </span>
                    <div class="toast-content">
                        <!--<div class="toast-heading">{{heading}}</div>-->
                        <div id="label">{{text}}</div>
                        <slot></slot>
                    </div>
                </div>
            </template>
            <template is="dom-if" if="[[!heading]]">
                <span class="toast-type-icon">
                    <pebble-icon icon="[[toastIcon]]"></pebble-icon>
                </span>
                <div class="toast-content">
                    <div id="label">{{text}}</div>
                    <slot></slot>
                </div>
            </template>
            <div class="toast-close">
                <pebble-icon class="pebble-icon-size-10" icon="pebble-icon:window-action-close" on-tap="hide"></pebble-icon>
            </div>
        </div>
`;
  }

  static get is() {
      return "pebble-toast";
  }
  static get properties() {
      return {
          /**
           * Specifies the element to fit `this` into.
           * This is overridden from `Polymer.IronFitBehavior`.
           */
          fitInto: {
              type: Object,
              value: window,
              observer: '_onFitIntoChanged'
          },

          /**
           * Indicates an alignment of the toast. The `default value` for this is <b>center</b>.
           * Other allowed values are: <b>top</b> and <b>bottom</b>. 
           */
          alignToast: {
              type: String,
              value: "center",
              observer: "_alignToastChanged"
          },


          /**
           * Indicates the duration in milliseconds to show the toast.
           * It is linked with auto-close property. It affects only `auto-close` when it is set to <b>true</b>.
           */
          toastDuration: {
              type: Number,
              value: 5000
          },

          /**
           * Indicates the text to display in the toast.
           */
          text: {
              type: String,
              value: null
          },

          /**
           * Specifies whether or not toast is closed when you click outside of it.
           * Set it to <b>false</b> to enable closing of the toast by clicking outside it.
           * It is overridden from `IronOverlayBehavior`.
           */
          noCancelOnOutsideClick: {
              type: Boolean,
              value: true
          },

          /**
           * Specifies whether or not auto-focus is disabled for the toast or child nodes.
           * Set it to <b>true</b> to to disable auto-focusing the toast or child nodes with 
           * the `autofocus attribute` when the overlay is opened. 
           * It is overridden from `IronOverlayBehavior`.
           */
          noAutoFocus: {
              type: Boolean,
              value: true
          },

          /**
           * Indicates an icon that gets displayed as per the toast type.
           * You can override the icon.
           */
          toastIcon: {
              type: String,
              value: ""
          },

          /**
           * Indicates the background color of the toast as per its type.
           * You can override the toast background color.
           */
          toastColor: {
              type: String,
              value: ""
          },

          /**
           * Indicates the text and border color of the toast as per its type.
           * You can override the toast text and color of the border.
           */
          toastTextColor: {
              type: String,
              value: ""
          },

          /**
           * Indicates the type of the toast. Color is defined as per this toast icon.
           * Defined toast types are success, warning, information, error, and task.
           */
          toastType: {
              type: String,
              value: null,
              reflectToAttribute: true,
              observer: '_toastChanged'
          },

          /**
           * Specifies whether or not the toast is closed without the user action.
           */
          autoClose: {
              type: Boolean,
              value: false,
              observer: '_autoCloseChanged'
          },

          /**
           * Indicates the heading of a toast.
           */
          heading: {
              type: String,
              value: null
          },
          /**
          * Performance fix for iron-fit-behavior (used by iron-overlay-behavior)
          * */
          _isRTL: {
              type: Boolean,
              value: false
          },

          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          uniqueId: {
              type: String,
              value: 'default-toast'
          }
      }
  }
  connectedCallback() {
      super.connectedCallback();
      this.addEventListener('transitionend', this.__onTransitionEnd);
      this.addEventListener('iron-overlay-opened', this._toastOpened);
      this.addEventListener('iron-overlay-closed', this._toastClosed);
  }
  disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('transitionend', this.__onTransitionEnd);
      this.removeEventListener('iron-overlay-opened', this._toastOpened);
      this.removeEventListener('iron-overlay-closed', this._toastClosed);
  }
  //Fired when autoClose is changed.
  _autoCloseChanged() {
      if (this.autoClose) {
          this.duration = this.toastDuration <= 0 ? 1000 : this.toastDuration;
      }
      else {
          this.duration = 0;
      }
  }

  //Fired when alignToast is changed.
  _alignToastChanged() {
      if (this.alignToast == _bottom) {
          this.verticalAlign = _bottom;
          this.horizontalAlign = _right;
      }
      else {
          this.verticalAlign = _top;
          this.horizontalAlign = _right;
      }
  }

  //Fired when toast type is changed. 
  _toastChanged() {
      if (!this.toastType) {
          return;
      }

      if (this.toastType == 'error') {
          if (this.toastIcon == '' || this.toastIcon == undefined) {
              this.toastIcon = "pebble-icon:notification-info";
          }
      }
      else if (this.toastType == 'warning') {
          if (this.toastIcon == '' || this.toastIcon == undefined) {
              this.toastIcon = "pebble-icon:notification-info";
          }
      }
      else if (this.toastType == 'success') {
          if (this.toastIcon == '' || this.toastIcon == undefined) {
              this.toastIcon = "pebble-icon:notification-info";
          }
      }
      else if (this.toastType == 'information') {
          if (this.toastIcon == '' || this.toastIcon == undefined) {
              this.toastIcon = "pebble-icon:notification-info";
          }
      }
      else if (this.toastType == 'task') {
          if (this.toastIcon == '' || this.toastIcon == undefined) {
              this.toastIcon = "pebble-icon:action-take-task";
          }
      }

  }

  /**
   * Can be used to refit if the overlay is opened and is not animating.
   * @protected
   */
  _onIronResize() {
      let currentOpenedToasts = [];
      currentOpenedToasts = currentCenterOpenedToasts.concat(currentTopOpenedToasts).concat(currentBottomOpenedToasts);

      if (currentOpenedToasts.length > 0) {
          for (let idx = 0; idx < currentOpenedToasts.length; idx++) {
              currentOpenedToasts[idx].style.transition = '';
              currentOpenedToasts[idx].refit();
          }
          this._arrangeToasts(_center);
          this._arrangeToasts(_top);
          this._arrangeToasts(_bottom);
      }
  }

  // Can be used to stack the toast as per alignment when overlay is opened.
  _toastOpened() {
      if (this.alignToast == _top) {
          currentTopOpenedToasts.push(this);
      }
      else if (this.alignToast == _bottom) {
          currentBottomOpenedToasts.push(this);
      }
      else {
          this.alignToast = _center;
          currentCenterOpenedToasts.push(this);
      }

      //Arrangment will be done as per alignment
      this._arrangeToasts(this.alignToast, true);
  }

  // Can be used to remove the overlay from the stack as per alignment when overlay is closed. 
  _toastClosed() {
      if (this.alignToast == _bottom) {
          this._removeToastFromProcess(currentBottomOpenedToasts, this);
          this._refitAndArrangeToasts(currentBottomOpenedToasts, this.alignToast); //Refit toasts before alignment            
      }
      else if (this.alignToast == _top) {
          this._removeToastFromProcess(currentTopOpenedToasts, this);
          this._refitAndArrangeToasts(currentTopOpenedToasts, this.alignToast); //Refit toasts before alignment
      }
      else {
          this._removeToastFromProcess(currentCenterOpenedToasts, this);
          this._refitAndArrangeToasts(currentCenterOpenedToasts, this.alignToast); //Refit toasts before alignment
      }
  }

  //Can be used to refit the toasts before arrangments.This prevents the gap that gets displayed when a toast is closed.
  _refitAndArrangeToasts(currentOpenedToasts, alignment) {
      if (currentOpenedToasts.length > 0) {
          for (let idx = 0; idx < currentOpenedToasts.length; idx++) {
              currentOpenedToasts[idx].refit();
          }

          //Arrangment will be done as per alignment
          this._arrangeToasts(alignment);
      }
  }

  //Can be used to remove the toast from process.
  _removeToastFromProcess(currentOpenedToasts, closedToast) {
      for (let idx = 0; idx < currentOpenedToasts.length; idx++) {
          if (currentOpenedToasts[idx].attributes["id"] != undefined && closedToast.attributes["id"] != undefined) {
              if (currentOpenedToasts[idx].attributes["id"].value == closedToast.attributes["id"].value) {
                  currentOpenedToasts.splice(idx, 1);
                  break;
              }
          }
      }
  }

  // Can be used to arrange the toasts.
  //alignment - toast group will be picked based on alignment
  //isOpen - will true when toast opens
  _arrangeToasts(alignment, isOpen) {

      if (alignment == _center) {
          this._arrangeToastsPerAlignment(currentCenterOpenedToasts, alignment, isOpen);
      }
      else if (alignment == _top) {
          this._arrangeToastsPerAlignment(currentTopOpenedToasts, alignment, isOpen);
      }
      else if (alignment == _bottom) {
          this._arrangeToastsPerAlignment(currentBottomOpenedToasts, alignment, isOpen);
      }
      else {
          this._arrangeToastsPerAlignment(currentCenterOpenedToasts, _center, isOpen);
          this._arrangeToastsPerAlignment(currentTopOpenedToasts, _top, isOpen);
          this._arrangeToastsPerAlignment(currentBottomOpenedToasts, _bottom, isOpen);
      }
  }

  // Can be used to calculate the actual position for center, top, and bottom positions.
  _arrangeToastsPerAlignment(currentOpenedToasts, alignment, isOpen) {

      if (currentOpenedToasts.length > 0) //Alignment is needed when toasts available
      {
          let margin = 10;
          let previousToast = undefined;
          for (let idx = (currentOpenedToasts.length - 1); idx >= 0; idx--) {
              let presentToast = window.getComputedStyle(currentOpenedToasts[idx], null);
              
              if (currentOpenedToasts.length != (idx + 1)) {
                  previousToast = window.getComputedStyle(currentOpenedToasts[idx + 1], null);
              }

              if (alignment == _bottom) {
                  let topPosition = 0;
                  for (let j = idx; j < (currentOpenedToasts.length - 1); j++) {
                      topPosition += currentOpenedToasts[j].getBoundingClientRect().height + margin;
                  }

                  let latestToastTop = currentOpenedToasts[currentOpenedToasts.length - 1].getBoundingClientRect().top;
                  currentOpenedToasts[idx].style.top = latestToastTop - margin - topPosition + 'px';
              }
              else if (alignment == _top) {
                  let topPosition = 0;
                  for (let j = idx + 1; j <= (currentOpenedToasts.length - 1); j++) {
                      topPosition += currentOpenedToasts[j].getBoundingClientRect().height + margin;
                  }

                  currentOpenedToasts[idx].style.top = topPosition + 'px';
              }
              else {
                  if (!previousToast) {
                      this._applyStyleForCenter(currentOpenedToasts[idx]);
                  }
                  else {
                      if (!isOpen) {
                          this._applyStyleForCenter(currentOpenedToasts[idx]);
                      }

                      let topPosition = 0;
                      for (let j = idx + 1; j <= (currentOpenedToasts.length - 1); j++) {
                          topPosition += currentOpenedToasts[j].getBoundingClientRect().height + margin;
                      }

                      currentOpenedToasts[idx].style.top = topPosition + 'px';
                  }
              }

              // Apply style when toast opens
              if (isOpen) {
                  this._addTransitionStyle(currentOpenedToasts[idx]);
              }
              else {
                  this._removeTransitionStyle(currentOpenedToasts[idx]);
              }
          }
      }
  }

  // Can be used to add style for smooth transition.
  _addTransitionStyle(toast) {
      toast.style.transition = 'all 0.5s ease-in-out';
  }

  /**
   * Can be used for smooth transitioning that are not needed for toast close or refit.
   */
  _removeTransitionStyle(toast) {
      toast.style.transition = '';
  }

  /** 
   * Can be used to display toast at center of the window.
   */
  _applyStyleForCenter(toast) {
      toast.style.left = toast.style.left.replace('px', '') / 2 + 'px';
  }

  /**
   * Read-only. Can be uased to auto-close if duration is a positive finite number.
   * @property _canAutoClose
   */
  get _canAutoClose() {
      return this.duration > 0 && this.duration !== Infinity;
  }

  /**
       * <b><i>Content development is under progress... </b></i> 
      */
  constructor() {
      super();
      this._autoClose = null;
      IronA11yAnnouncer.requestAvailability();
  }

  /**
   * Can be used to show the toast. Without the arguments, this is same as `open()` function from `IronOverlayBehavior`.
   * @param {(Object|string)=} properties Properties to be set before opening the toast.         
   */
  show(properties) {
      if (typeof properties == 'string') {
          properties = { text: properties };
      }
      for (let property in properties) {
          if (property.indexOf('_') === 0) {
              Base._warn('The property "' + property + '" is private and was not set.');
          } else if (property in this) {
              this[property] = properties[property];
          } else {
              Base._warn('The property "' + property + '" is not valid.');
          }
      }
      this.open();
  }

  /**
   * Can be used to hide the toast. This is same as `close()` function from `IronOverlayBehavior`.
   */
  hide() {
      this.close();
  }

  /**
   * Can be used to indicate a finished animation. This is called on transitions of the toast. 
   * @private
   */
  __onTransitionEnd(e) {
      // there are different transitions that are happening when opening and
      // closing the toast. The last one so far is for `opacity`.
      // This marks the end of the transition, so we check for this to determine if this
      // is the correct event.
      if (e && e.target === this && e.propertyName === 'opacity') {
          if (this.opened) {
              this._finishRenderOpened();
          } else {
              this._finishRenderClosed();
          }
      }
  }

  /**
   * Used when the value of `opened` changes. This is overridden from `IronOverlayBehavior`.
   *
   */
  _openedChanged() {
      if (this._autoClose !== null) {
          this.cancelAsync(this._autoClose);
          this._autoClose = null;
      }
      if (this.opened) {

          // if (currentToast && currentToast !== this) {
          //   currentToast.close();
          // }

          currentToast = this;
          this.dispatchEvent(new CustomEvent('iron-announce', {
              detail: {
                  text: this.text
              }, bubbles: true, composed: true                        
          }));
          if (this._canAutoClose) {
              /* this changes need to do in setTimeout globally*/
              this._autoClose = setTimeout(() => this.close(), this.duration);
          }
      } else if (currentToast === this) {
          currentToast = null;
      }
      IronOverlayBehaviorImpl._openedChanged.apply(this, arguments);
  }

  /**
   * This is overridden from `IronOverlayBehavior`.
   */
  _renderOpened() {
      this.classList.add('paper-toast-open');
  }


  /**
   * This is overridden from `IronOverlayBehavior`.
   */
  _renderClosed() {
      this.classList.remove('paper-toast-open');
  }

  /**
   * @private
   */
  _onFitIntoChanged(fitInto) {
      this.positionTarget = fitInto;
  }
}
customElements.define(PebbleToast.is, PebbleToast);
