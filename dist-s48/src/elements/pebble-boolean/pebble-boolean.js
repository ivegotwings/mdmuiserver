/**
`pebble-boolean` Represents an element which displays and controls the boolean value. 
 They can contain values as true or false.  

### Styling

Custom property    | Description              | Default
-------------------|-------------|----------------------
`--pebble-boolean` | Mixin applied to pebble-boolean | `{}`
`--active-button-font-color` | Active button font color | #ffffff
`--pebble-boolean-true-bg-color` | Active true button background color | #4caf50
`--pebble-boolean-false-bg-color` | Active false button background color | #f44336
`--false-button-margin` | Margin for false button | `0 0 0 -5px`
`--boolean-btn-radius` | Boolean button radius | 4px
`--pebble-boolean-label` | Mixin applied to pebble-boolean label | {}

@group pebble Elements
@element pebble-boolean
@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-externalref-paperbuttongroup/bedrock-externalref-paperbuttongroup.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-validator/bedrock-validator.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-floating.js';
import '../pebble-info-icon/pebble-info-icon.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleBoolean
  extends mixinBehaviors([
    RUFBehaviors.UIBehavior
  ], PolymerElement) {
  static get template() {
    return html`
    <style include="bedrock-style-common bedrock-style-floating">
      paper-button {
        border: 1px solid var(--default-border-color, #c1cad4);
        color: var(--default-icon-color, #8994a0);
        border-radius: 0px;
        height: 18.25px;
        min-width: 40px;
        float: left;
        font-size: var(--font-size-xs, 10px);
        padding-top: 0;
        padding-right: 5px;
        padding-bottom: 0;
        padding-left: 5px;
        --paper-button: {
          text-transform: none;
          text-align: center;
          line-height: 16px;
          max-width: 100px;
          display: inline-block;
        }
        @apply --pebble-boolean;
      }

      paper-button-group {
        display: inline-block;
      }

      paper-button[name=true][class~="iron-selected"] {
        color: var(--button-text-color, #ffffff);
        background-color: var(--success-button-color, #09c021);
        border: 1px solid var(--success-button-color, #09c021);
      }

      paper-button[name=false][class~="iron-selected"] {
        color: var(--button-text-color, #ffffff);
        background-color: #757f8a;
      }

      paper-button[name=false] {
        margin: var(--false-button-margin, 0 0 0 -1px);
        border-top-right-radius: var(--boolean-btn-radius, 4px);
        border-bottom-right-radius: var(--boolean-btn-radius, 4px);
      }

      paper-button[name=true] {
        margin: 0;
        border-top-left-radius: var(--boolean-btn-radius, 4px);
        border-bottom-left-radius: var(--boolean-btn-radius, 4px);
        background-color: var(--palette-white, #ffffff);
      }

      .error {
        color: var(--error-color, #ed204c);
        font-size: var(--font-size-sm, 12px);
        font-weight: var(--font-regular, 400);
        letter-spacing: 0.011em;
        line-height: 20px;
        width: 92%;
        word-wrap: break-word;
      }
      .attribute-view-label {
          font-size: var(--font-size-sm, 12px);
          font-family: 'Roboto', Helvetica, Arial, sans-serif;
          font-weight: normal;
          font-style: normal;
          font-stretch: normal;
          line-height: 16px;
          text-transform: capitalize;
          color: var(--label-text-color, #96b0c6);
          @apply --context-coalesce-label;
      }
    </style>
    <div id="booleanContainer" class="clearfix">
      <div id="lblBoolean" class="attribute-view-label">
        [[label]]
        <template is="dom-if" if="[[descriptionObject]]">
          <pebble-info-icon description-object="[[descriptionObject]]"></pebble-info-icon>
        </template>
      </div>
      <paper-button-group aria-labelledby="lblBoolean" attr-for-selected="item" selected="{{_computedValue}}" tabindex="-1">
        <paper-button class="text-ellipsis" name="true" item="[[isNullOrEmpty(trueText, 'TRUE')]]" noink="" disabled="[[disabled]]">[[isNullOrEmpty(trueText, 'TRUE')]]</paper-button>
        <paper-button class="text-ellipsis" name="false" item="[[isNullOrEmpty(falseText, 'FALSE')]]" noink="" disabled="[[disabled]]">[[isNullOrEmpty(falseText, 'FALSE')]]</paper-button>
      </paper-button-group>
      <bedrock-validator show-error="[[showError]]" validation-errors="{{validationErrors}}" input="[[value]]" required="[[required]]" invalid="{{invalid}}" error-message="{{errorMessage}}" type="[[validationType]]"></bedrock-validator>
      <div class="error">
        <span> {{errorMessage}}</span>
      </div>
    </div>
`;
  }

  static get is() { return 'pebble-boolean' }
  static get properties() {
    return {

      /**
       * Indicates the title of the boolean control that is displayed on the UI.
       */
      label: {
        type: String,
        value: ""
      },

      /**
       * Indicates the current value selected for the boolean.
       * By default, it notifies the current value chosen.
       */
      value: {
        type: String,
        value: "",
        notify: true,
        observer: '_valueChanged'
      },

      /**
      * Indicates the computed value which is bound to the `button` group.
      * By default, it notifies the current value chosen.
      */
      _computedValue: {
        type: String,
        value: "",
        observer: '_computedValueChanged'
      },

      /**
       * Indicates the true button text.
       */
      trueText: {
        type: String,
        value: "TRUE"
      },

      /**
       * Indicates the false button text.
       */
      falseText: {
        type: String,
        value: "FALSE"
      },
      /**
       * Indicates whether to mark the input as required or not.
       * Set the value as <b>true</b> to mark the input as required.
       */
      required: {
        type: Boolean,
        value: false
      },
      /**
       * Indicates whether to show the validation errors or not.
       * Set the value as <b>true</b> to show the validation errors.
       */
      showError: {
        type: Boolean,
        value: false
      },
      /**
       * Description object should contain non-empty
       * description field (type type: Array or String)
       */
      descriptionObject: {
        type: Object,
        notify: true,
        value: function () {
          return {};
        }
      },
      disabled: {
        type: Boolean,
        value: false
      }
    }
  }
  isNullOrEmpty (val, fallbackVal) {
      return _.isNullOrEmpty(val, fallbackVal);
  }
  _valueChanged() {
    if (this.value != this._computedValue) {
      this._computedValue = this._computeValue(this.value);
    }
  }
  _computedValueChanged() {
    if (this._computeValue(this.value) != this._computedValue) {
      this.value = this._computedValue;
    }
  }
  _computeValue(value) {
    //only three valid values, otherwise ''
    if (value == this.trueText || value == this.falseText) {
      return value;
    } else if (value == 'true' || value == 'false') {
      return value == 'true' ? this.trueText : this.falseText;
    } else {
      return '';
    }
  }
}
customElements.define(PebbleBoolean.is, PebbleBoolean)
