/**
    `check-box-with-indeterminate-state` Represents a component that renders a "checkbox" with an indeterminate state.
    It is used in conjunction with the `rock-grid` component.
    @demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-style-manager/styles/bedrock-style-common.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class CheckBoxWithIndeterminateState
    extends mixinBehaviors([
        RUFBehaviors.ComponentConfigBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <style>
            :host {
                height: var(--paper-checkbox-size, var(--default-checkbox-size));
                width: var(--paper-checkbox-size, var(--default-checkbox-size));
                /*flex-basis: 48px;*/
                /*flex-grow: 0;*/
                /*flex-shrink: 0;*/
                /*padding: 0 8px 0 12px;*/
                display: flex;
                display: -webkit-flex;
                /* Safari */
                align-items: center;
                -webkit-align-items: center;
                /* Safari 7.0+ */
                justify-content: center;
                -webkit-justify-content: center;
                /*border-right: 1px solid #e3e3e3;*/
            }

            :host([header]) {
                height: auto;
            }

            :host([hidden]) {
                display: none;
            }

            :host(:focus) {
                outline: none;
            }

            :host {
                border-right: none;
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

            #container {
                position: relative;
                box-sizing: border-box;
                border-radius: var(--default-border-radius);
                height: var(--paper-checkbox-size, var(--default-checkbox-size));
                width: var(--paper-checkbox-size, var(--default-checkbox-size));
                border: 1px solid var(--paper-checkbox-unchecked-color, var(--palette-cloudy-blue));
                pointer-events: none;
                -webkit-transition: background-color 140ms, border-color 140ms;
                transition: background-color 140ms, border-color 140ms;
            }

            :host([indeterminate]) .checkmark {
                border-bottom: 2px solid var(--primary-text-color);
                width: 60%;
                margin-top: 5px;
                margin-left: 3px;
                -webkit-animation: indeterminate-expand 140ms ease-out forwards;
                animation: indeterminate-expand 140ms ease-out forwards;
                border-color: var(--paper-checkbox-indeterminate-color, var(--palette-cerulean));
            }

            @-webkit-keyframes indeterminate-expand {
                0% {
                    -webkit-transform: scale(0, 0);
                }
                100% {
                    -webkit-transform: scale(1, 1);
                }
            }

            @keyframes indeterminate-expand {
                0% {
                    transform: scale(0, 1);
                }
                100% {
                    transform: scale(1, 1);
                }
            }
        </style>

        <div id="container">
            <div class="checkmark"></div>
        </div>
`;
  }

  static get is() { return 'check-box-with-indeterminate-state' }
  static get properties() {
      return {
          checked: {
              type: Boolean,
              observer: '_checkedChanged',
              reflectToAttribute: true,
              value: false
          },

          /**
           * Specifies whether or not the checkbox is in indeterminate state. If it is set to <b>true</b> 
           * then the checkbox is in indeterminate state.
           */
          indeterminate: {
              type: Boolean,
              reflectToAttribute: true,
              observer: '_indeterminateChanged',
              value: false
          }
      }
  }


  /**
   * Specifies whether or not the checkbox is in the checked state. If it is set to <b>true</b> 
   * then the checkbox is in checked state.
   */


  /**
   * Internal function, triggered if checked state is changed
   */
  _checkedChanged (checked) {
      if (checked) {
          this.indeterminate = false;
      }
  }

  /**
  * Internal function, triggered if indeterminate state is changed
  */
  _indeterminateChanged (indeterminate) {
      if (indeterminate) {
          this.checked = false;
      }
  }
}
customElements.define(CheckBoxWithIndeterminateState.is, CheckBoxWithIndeterminateState);
