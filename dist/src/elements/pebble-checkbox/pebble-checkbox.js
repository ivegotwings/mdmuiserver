/**

`pebble-checkbox` Represents a button that is either checked or unchecked. 
It also has an indeterminate state which is shown by passing the indeterminate attribute as "true".

### Example

    <pebble-checkbox>label</pebble-checkbox>

    <pebble-checkbox checked> label</pebble-checkbox>

    <pebble-checkbox indeterminate> label</pebble-checkbox>

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--pebble-checkbox-unchecked-background-color` | Checkbox background color when the input is not checked | `transparent`
`--pebble-checkbox-unchecked-color` | Checkbox border color when the input is not checked | `--primary-text-color`
`--pebble-checkbox-unchecked-ink-color` | Selected/focus ripple color when the input is not checked | `--primary-text-color`
`--pebble-checkbox-checked-color` | Checkbox color when the input is checked | `--primary-color`
`--pebble-checkbox-checked-ink-color` | Selected/focus ripple color when the input is checked | `--primary-color`
`--pebble-checkbox-checkmark-color` | Checkmark color | `white`
`--pebble-checkbox-label-color` | Label color | `--primary-text-color`
`--pebble-checkbox-label-checked-color` | Label color when the input is checked | `--pebble-checkbox-label-color`
`--pebble-checkbox-label-spacing` | Spacing between the label and the checkbox | `8px`
`--pebble-checkbox-label` | Mixin applied to the label | `{}`
`--pebble-checkbox-label-checked` | Mixin applied to the label when the input is checked | `{}`
`--pebble-checkbox-error-color` | Checkbox color when invalid | `--error-color`
`--pebble-checkbox-size` | Size of the checkbox | `18px`
`--pebble-checkbox-ink-size` | Size of the ripple | `48px`
`--pebble-checkbox-margin` | Margin around the checkbox container | `initial`
`--pebble-checkbox-vertical-align` | Vertical alignment of the checkbox container | `middle`


@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
class PebbleCheckbox extends PolymerElement {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common">
             :host {
                display: inline-block;
                white-space: nowrap;
                overflow: hidden;
                cursor: pointer;
                --calculated-pebble-checkbox-size: var(--pebble-checkbox-size, 14px);
                --calculated-pebble-checkbox-ink-size: var(--pebble-checkbox-ink-size, -1px);
                border-right: none;
                font-size: var(--default-font-size, 14px) !important;
                line-height: 0;
                -webkit-tap-highlight-color: transparent;
                @apply --paper-font-common-base;
            }

             :host(:focus) {
                outline: none;
            }

            .hidden {
                display: none;
            }

            #checkboxContainer {
                display: inline-block;
                position: relative;
                width: 14px;
                height: 14px;
                min-width: 14px;
                margin-top: var(--pebble-checkbox-margin, initial);
                margin-right: var(--pebble-checkbox-margin, initial);
                margin-bottom: var(--pebble-checkbox-margin, initial);
                margin-left: var(--pebble-checkbox-margin, initial);
                vertical-align: var(--pebble-checkbox-vertical-align, middle);
                background-color: var(--pebble-checkbox-unchecked-background-color, transparent);
                border-color: var(--checkbox-default-border);
                @apply --pebble-checkbox-container;
            }

            #ink {
                position: absolute;
                top: calc(0px - (var(--calculated-pebble-checkbox-ink-size) - var(--calculated-pebble-checkbox-size)) / 2);
                left: calc(0px - (var(--calculated-pebble-checkbox-ink-size) - var(--calculated-pebble-checkbox-size)) / 2);
                width: var(--calculated-pebble-checkbox-ink-size);
                height: var(--calculated-pebble-checkbox-ink-size);
                color: var(--pebble-checkbox-unchecked-ink-color, var(--primary-text-color));
                opacity: 0.6;
                pointer-events: none;
            }

             :host-context([dir="rtl"]) #ink {
                right: calc(0px - (var(--calculated-pebble-checkbox-ink-size) - var(--calculated-pebble-checkbox-size)) / 2);
                left: auto;
            }

            #ink[checked] {
                color: var(--pebble-checkbox-checked-ink-color, var(--primary-color));
            }

            #checkbox {
                position: relative;
                box-sizing: border-box;
                height: var(--checkbox-default-size, 14px);
                width: var(--checkbox-default-size, 14px);
                border: solid 1px;
                border-color: var(--checkbox-default-border, #c1cad4);
                border-radius: var(--default-border-radius, 3px);
                pointer-events: none;
                -webkit-transition: background-color 140ms, border-color 140ms;
                transition: background-color 140ms, border-color 140ms;
            }

            /* checkbox checked animations */

            #checkbox.checked #checkmark {
                -webkit-animation: checkmark-expand 140ms ease-out forwards;
                animation: checkmark-expand 140ms ease-out forwards;
            }

            @-webkit-keyframes checkmark-expand {
                0% {
                    -webkit-transform: scale(0, 0) rotate(45deg);
                }
                100% {
                    -webkit-transform: scale(1, 1) rotate(45deg);
                }
            }

            @keyframes checkmark-expand {
                0% {
                    transform: scale(0, 0) rotate(45deg);
                }
                100% {
                    transform: scale(1, 1) rotate(45deg);
                }
            }

            #checkbox.checked {
                background-color: var(--checkbox-selected-bg, #026bc3);
                border-color: var(--checkbox-selected-bg, #026bc3);
            }

            #checkmark {
                position: absolute;
                width: 30%;
                height: 60%;
                border-style: solid;
                border-top: none;
                border-left: none;
                border-right-width: calc(2/15 * var(--checkbox-default-size, 14px));
                border-bottom-width: calc(2/15 * var(--checkbox-default-size, 14px));
                border-color: var(--checkbox-mark, var(--white, #fff));
                -webkit-transform-origin: 70% 105%;
                transform-origin: 70% 105%;
                box-sizing: content-box;
                /* protect against page-level box-sizing */
            }

            /* Firefox specific fix for checkmark */

            @media all and (min--moz-device-pixel-ratio:0) and (min-resolution: 3e1dpcm) {
                #checkmark {
                    border-bottom: 2px solid var(--white, #fff);
                    border-right: 2px solid var(--white, #fff);
                    width: 20%;
                    height: 50%;
                    -webkit-transform-origin: 60% 110%;
                    transform-origin: 60% 110%;
                }
            }

             :host-context([dir="rtl"]) #checkmark {
                -webkit-transform-origin: 70% 105%;
                transform-origin: 70% 105%;
            }

            /* label */

            #checkboxLabel {
                position: relative;
                display: inline-block;
                vertical-align: middle;
                white-space: normal;
                line-height: normal;
                color: var(--primary-text-color, #212121);
                margin-left: 5px;
                @apply --pebble-checkbox-label;
            }

             :host([checked]) #checkboxLabel {
                color: var(--pebble-checkbox-label-checked-color, var(--pebble-checkbox-label-color, var(--primary-text-color)));
                @apply --pebble-checkbox-label-checked;
            }

             :host-context([dir="rtl"]) #checkboxLabel {
                padding-right: var(--pebble-checkbox-label-spacing, 8px);
                padding-left: 0;
            }

            /* disabled state */

             :host([disabled]) #checkbox {
                opacity: 0.5;
            }

             :host([disabled][checked]) #checkbox {
                opacity: 0.5;
            }

             :host([disabled]) #checkboxLabel {
                opacity: 0.65;
            }

            /* invalid state */

            #checkbox.invalid:not(.checked) {
                border-color: var(--pebble-checkbox-error-color, var(--error-color, #ed204c));
            }

            /* checkbox indeterminate animations */

            #checkbox.checked #indeterminatemark {
                -webkit-animation: indeterminatemark-expand 140ms ease-out forwards;
                animation: indeterminatemark-expand 140ms ease-out forwards;
            }

            @-webkit-keyframes indeterminatemark-expand {
                0% {
                    -webkit-transform: scale(0, 0) rotate(180deg);
                }
                100% {
                    -webkit-transform: scale(1, 1) rotate(180deg);
                }
            }

            @keyframes indeterminatemark-expand {
                0% {
                    transform: scale(0, 0) rotate(180deg);
                }
                100% {
                    transform: scale(1, 1) rotate(180deg);
                }
            }

            #indeterminatemark {
                position: absolute;
                width: 60%;
                height: 0;
                top: 0px;
                border-style: solid;
                border-top: none;
                border-left: none;
                border-right-width: calc(2/15 * var(--calculated-pebble-checkbox-size, 15px));
                border-bottom-width: calc(2/15 * var(--calculated-pebble-checkbox-size, 15px));
                border-color: var(--pebble-checkbox-checkmark-color, #ffffff);
                -webkit-transform-origin: 57% 170%;
                transform-origin: 57% 170%;
                box-sizing: content-box;
                /* protect against page-level box-sizing */
            }
            
            /*Edge specific fix for indeterminatemark */

            @supports (-ms-ime-align:auto) {
                #indeterminatemark {
                    top: 5px;
                    left: 2px;
                }
                #checkbox.checked #indeterminatemark {
                    animation: initial !important;
                    transform: rotate(180deg) !important;
                }
                #checkbox.checked #checkmark {
                    animation: initial !important;
                    transform: rotate(45deg) !important;
                }
                #checkbox {
                    transition: initial !important;
                }
            }

             :host-context([dir="rtl"]) #indeterminatemark {
                -webkit-transform-origin: 50% 14%;
                transform-origin: 50% 14%;
            }
        </style>
        <div id="checkboxContainer" on-tap="_checkboxTapped">
            <div id="checkbox" class\$="[[_computeCheckboxClass(checked, invalid,indeterminate)]]">
                <div id="checkmark" hidden\$="[[!checked]]"></div>
                <div id="indeterminatemark" hidden\$="[[!indeterminate]]"></div>
            </div>
        </div>

        <div id="checkboxLabel" hidden\$="[[_isLabelHidden()]]">
            <slot></slot>
        </div>
`;
  }

  static get is() {
      return "pebble-checkbox";
  }
  static get properties() {
      return {
          /**
          * Specifies whether the check-box area is active or inactive.
          */
          ariaActiveAttribute: {
              type: String,
              value: 'aria-checked'
          },

          checked: {
              type: Boolean,
              value: false,
              reflectToAttribute: true,
              notify: true,
              observer: '_checkedChanged'
          },

          disabled: {
              type: Boolean,
              value: false
          },

          invalid: {
              type: Boolean,
              value: false,
              reflectToAttribute: true,
              notify: true
          },

          /**
          * Indicates the indeterminate state of the check box.
          */
          indeterminate: {
              type: Boolean,
              value: false,
              notify: true,
              relectToAttribute: true
          }
      };
  }

  constructor() {
      super();
  }

  connectedCallback() {
      super.connectedCallback();
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

  ready() {
      super.ready();  

      this._ensureAttribute('role', 'checkbox');
      this._ensureAttribute('aria-checked', 'false');
      this._ensureAttribute('tabindex', 0);
  }

  _checkboxTapped(e) {
      if (this.disabled) {
          return;
      }
      this.checked = !this.checked;
      this.dispatchEvent(new CustomEvent('change', { detail: e, bubbles: true, composed: true }));
  }

  _isLabelHidden() {
      afterNextRender(this, () => {
              if(this.shadowRoot){
              if (!this.shadowRoot.querySelector('slot')) {
                  return true;
              };
              return dom(this).getEffectiveChildNodes().length == 0 && FlattenedNodesObserver.getFlattenedNodes(this).length == 0;
          }
      });
  }

  _computeCheckboxClass(checked, invalid, indeterminate) {
      let className = '';
      if (checked || indeterminate) {
          className += 'checked ';
      }
      if (invalid) {
          className += 'invalid';
      }
      return className;
  }

  _checkedChanged(checked) {
      if (checked) {
          this.indeterminate = false;
      }
  }
}

customElements.define(PebbleCheckbox.is, PebbleCheckbox);
