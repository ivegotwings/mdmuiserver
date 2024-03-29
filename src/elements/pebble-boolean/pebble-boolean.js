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

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-validator/bedrock-validator.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../pebble-info-icon/pebble-info-icon.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleBoolean
  extends mixinBehaviors([
    RUFBehaviors.UIBehavior
  ], PolymerElement) {
  static get template() {
    return html`
    <style include="bedrock-style-common">
      .boolean-btn {
        border: 1px solid var(--default-border-color, #c1cad4);
        color: var(--default-icon-color, #8994a0);
        height: 18.25px;
        min-width: 40px;
        font-size: var(--font-size-xs, 10px);
        padding-right: 5px;
        padding-left: 5px;   
        cursor: pointer;     
      }

      .button-wrap {
        display: flex;
        padding-top:6px;
      }

      .boolean-btn.selected[name=true] {
        color: var(--button-text-color, #ffffff);
        background-color: var(--success-button-color, #09c021);
        border: 1px solid var(--success-button-color, #09c021);
      }

      .boolean-btn.selected[name=false] {
        color: var(--button-text-color, #ffffff);
        background-color: #757f8a;
      }

      .boolean-btn[name=false] {
        margin: var(--false-button-margin, 0 0 0 -1px);
        border-top-right-radius: var(--boolean-btn-radius, 4px);
        border-bottom-right-radius: var(--boolean-btn-radius, 4px);
      }

      .boolean-btn[name=true] {
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
      .attribute-view-wrapper {
          font-size: var(--font-size-sm, 12px);
          font-family: 'Roboto', Helvetica, Arial, sans-serif;
          font-weight: normal;
          font-style: normal;
          font-stretch: normal;
          line-height: 16px;
          text-transform: capitalize;
          color: var(--label-text-color, #96b0c6);
          width:calc(100% - 100px);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          @apply --context-coalesce-label;
      }
      .attribute-view-label{
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display:inline-block;
        max-width:calc(100% - 20px)
    }
    </style>
    <div id="booleanContainer">
      <div id="lblBoolean" class="attribute-view-wrapper" title$="[[label]]">
        <span class="attribute-view-label">[[label]]</span>
        <template is="dom-if" if="[[descriptionObject]]">
          <pebble-info-icon description-object="[[descriptionObject]]"></pebble-info-icon>
        </template>
      </div>
      <div class="button-wrap">
        <span class="boolean-btn" id="booleanTrue" name="true" on-tap="_updateValue">[[isNullOrEmpty(trueText, 'TRUE')]]</span>
        <span class="boolean-btn" id="booleanFalse" name="false" on-tap="_updateValue">[[isNullOrEmpty(falseText, 'FALSE')]]</span>
      </div>
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
    this.$.booleanTrue.className = "boolean-btn";
    this.$.booleanFalse.className = "boolean-btn";
    if (this.value == "true") {
      this.$.booleanTrue.className += " selected";
    } else if (this.value == "false") {
      this.$.booleanFalse.className += " selected";
    }
  }
  _updateValue(e) {
    if (e) {
      this.value = e.currentTarget.getAttribute("name");
    }
  }
}
customElements.define(PebbleBoolean.is, PebbleBoolean)
