import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
class DataTablCheckbox extends PolymerElement {
  static get template() {
    return html`
    <style>
      :host {
        height: 40px;
        flex-basis: 40px;
        flex-grow: 0;
        flex-shrink: 0;
        padding: 0 8px 0 12px;
        display: flex;
        display: -webkit-flex;
        align-items: center;
        justify-content: center;
        /*border-right: 1px solid #e3e3e3;*/
      }

      :host([header]) {
        height: 38px;
      }

      :host([hidden]) {
        display: none;
      }

      :host(:focus) {
        outline: none;
      }

      #container {
        position: relative;
        box-sizing: border-box;
        height: 18px;
        width: 18px;
        border: solid 1px var(--checkbox-default-border, #c1cad4);
        border-radius: var(--default-border-radius, 3px);
        height: var(--checkbox-default-size, 14px);
        width: var(--checkbox-default-size, 14px);
        pointer-events: none;
        -webkit-transition: background-color 140ms, border-color 140ms;
        transition: background-color 140ms, border-color 140ms;
      }

      :host([checked]) #container {
        border-color: var(--checkbox-selected-border, #026bc3);
        background-color: var(--checkbox-selected-bg, #026bc3);
      }

      :host([disabled]) #container {
        opacity: 0.5;
      }

      :host([disabled][checked]) #container {
        opacity: 0.5;
      }

      :host([checked]) .checkmark {
        border-bottom: 2px solid var(--palette-white, #fff);
        border-right: 2px solid var(--palette-white, #fff);
        width: 20%;
        height: 50%;
        -webkit-transform-origin: 60% 110%;
        transform-origin: 60% 110%;
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

      :host([indeterminate]) .checkmark {
        border-bottom: 2px solid var(--checkbox-selected-bg, #026bc3);
        width: 60%;
        height: 45%;
        margin-left: 3px;
        -webkit-animation: indeterminate-expand 140ms ease-out forwards;
        animation: indeterminate-expand 140ms ease-out forwards;
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

      @supports (-ms-ime-align:auto) {
        :host([checked]) .checkmark {
          animation: initial !important;
          transform: scale(1, 1) rotate(45deg);
        }
        :host([indeterminate]) .checkmark {
          animation: initial !important;
          transform: scale(1, 1);
        }
        #container {
          transition: initial !important;
        }
      }
    </style>

    <div id="container">
      <div class="checkmark"></div>
    </div>
`;
  }

  static get is() {
    return "data-table-checkbox";
  }
  static get properties() {
    return {
      checked: {
        type: Boolean,
        observer: '_checkedChanged',
        reflectToAttribute: true,
        value: false
      },

      indeterminate: {
        type: Boolean,
        reflectToAttribute: true,
        observer: '_indeterminateChanged',
        value: false
      }
    }
  }
  _checkedChanged(checked) {
    if (checked) {
      this.indeterminate = false;
    }
  }

  _indeterminateChanged(indeterminate) {
    if (indeterminate) {
      this.checked = false;
    }
  }
}
customElements.define(DataTablCheckbox.is, DataTablCheckbox);
