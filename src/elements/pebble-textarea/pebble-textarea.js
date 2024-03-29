/**
`pebble-textarea` Represents an element that allows plain-text editing with multiple lines.
 
@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/paper-input/paper-textarea.js';
import '../bedrock-validator/bedrock-validator.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../pebble-info-icon/pebble-info-icon.js';
class PebbleTextarea extends PolymerElement {
  static get template() {
    return html`
    <style include="bedrock-style-common">
      paper-textarea {
        --paper-input-container: {
          padding-top: 0px;
          padding-right: 0px;
          padding-bottom: 0px;
          padding-left: 0px;
          @apply --textarea-container;
        }
        --iron-autogrow-textarea: {
          min-height: 70px;
          box-sizing: border-box;
          @apply --autogrowtextarea;
        }
        --paper-input-container-underline: {
          border-bottom: 1px solid var(--textbox-border, #d2d8de);
        }
        --paper-input-container-underline-focus: {
          border-bottom: 1px solid var(--primary-border-button-color, #026bc3);
        }
        --paper-input-container-label: {
          font-size: var(--default-font-size, 14px)!important;
          @apply --rock-workflow-input-container-label;
        }
        --paper-input-container-input: {
          font-size: var(--default-font-size, 14px)!important;
          line-height: 20px;
          @apply --paper-input-container-input-table;
        }
        --paper-menu-button-dropdown: {
          margin-top: 40px;
        }
        --paper-menu-button-content: {
          box-shadow: 0 0 var(--popup-box-shadow-size, 8px) 0 var(--popup-box-shadow, #8A98A3) !important;
        }
      }
      @supports (-ms-ime-align:auto) {
        paper-textarea {
          --paper-input-container-label-floating:{
            transform: initial;
            top:-25px;
          }
        }
      }
      #textarea {
        @apply --pebble-textarea;
      }

      #input {
        @apply --pebble-textarea-input;
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

    <template is="dom-if" if="[[noLabelFloat]]">
      <div class="attribute-view-wrapper" title$="[[label]]">
        <span class="attribute-view-label" >[[label]]</span>
        <template is="dom-if" if="[[descriptionObject]]">
          <pebble-info-icon description-object="[[descriptionObject]]"></pebble-info-icon>
        </template>
      </div>
    </template>

    <paper-textarea id="textarea" disabled="[[disabled]]" value="{{value}}" invalid="{{invalid}}" prevent-invalid-input="[[preventInvalidInput]]" autocomplete="[[autocomplete]]" autofocus="[[autofocus]]" inputmode="[[inputmode]]" maxlength="[[maxlength]]" name="[[name]]" placeholder="[[placeholder]]" readonly="[[readonly]]" list="[[list]]" size="[[size]]" autocapitalize="[[autocapitalize]]" autocorrect="[[autocorrect]]" tabindex\$="[[tabindex]]" autosave="[[autosave]]" results="[[results]]" accept="[[accept]]" multiple="[[multiple]]" always-float-label="[[alwaysFloatLabel]]" auto-validate="[[autoValidate]]" char-counter="[[charCounter]]" error-message="[[errorMessage]]" focused="[[focused]]" rows="[[rows]]" max-rows="[[maxRows]]" on-change="_onChange" title="[[title]]" label="[[getLabelValue()]]" no-label-float="[[noLabelFloat]]"></paper-textarea>
    <bedrock-validator show-error="[[showError]]" validation-errors="{{validationErrors}}" input="[[value]]" pattern="[[pattern]]" min-length="[[minlength]]" max-length="[[maxlength]]" precision="[[precision]]" required="[[required]]" invalid="{{invalid}}" error-message="{{errorMessage}}" min="[[min]]" max="[[max]]" type="[[validationType]]" type-array="[[validationTypeArray]]"></bedrock-validator>
`;
  }

  static get is() {
    return "pebble-textarea";
  }

  static get properties() {
    return {
      /**
        *  Indicates the default value for the textbox.                   
      */
      value: {
        type: String,
        value: "",
        notify: true
      },

      /**
        * Indicates that if autoValidate is true, the invalid attribute is managed automatically.                
        */
      invalid: {
        type: Boolean,
        value: false,
        notify: true
      },

      /**
        * Indicates the label for the textbox.
        * It allows to add descriptive text for the textbox to inform the user about the type of data 
        * expected in the textbox. 
        */
      label: {
        type: String
      },

      /**
        * Indicates whether to disable the input or not. Set it to <b>true</b> to disable the input. 
        */
      disabled: {
        type: Boolean,
        value: false
      },

      /**
        * Specifies whether or not you can prevent invalid entry of the input.
        * Set the value as <b>true</b> to prevent the user from entering invalid input.
        */
      preventInvalidInput: {
        type: Boolean
      },

      /**
        * Specifies whether or not `preventInvalidInput` allows the pattern.
        * Set the value as <b>true</b> to indicate that the pattern allowed by preventInvalidInput.
        */
      allowedPattern: {
        type: String
      },

      /**
        * Indicates the datalist of the input, if any. This must match the identification of an existing `<datalist>`.
        */
      list: {
        type: String
      },

      /**
        * Indicates a pattern to validate the `<input>` with.
        */
      pattern: {
        type: String
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
        * Indicates the error message to display when the input is invalid.
        * 
        */
      errorMessage: {
        type: String
      },

      /**
        * Indicates whether to show the character counter or not.
        * Set the value as <b>true</b> to show the character counter.
        * 
        */
      charCounter: {
        type: Boolean,
        value: false
      },

      /**
        * Indicates whether to disable the floating label or not.
        * Set the value as <b>true</b> to disable the floating label.
        */
      noLabelFloat: {
        type: Boolean,
        value: false
      },

      /**
        * Indicates whether to float the label always or not.
        * Set the value as <b>true</b> to float the label always.
        */
      alwaysFloatLabel: {
        type: Boolean,
        value: false
      },

      /**
        * Indicates whether to auto-validate the input value or not.
        * Set the value as <b>true</b> to auto-validate the input value.
        */
      autoValidate: {
        type: Boolean,
        value: false
      },

      /**
        * Indicates the name of the validator to use.
        */
      validator: {
        type: String
      },

      /**
        * Indicates whether to auto-complete the input value or not.
        * Set the value as <b>true</b> to auto-complete the input value.
        */
      autocomplete: {
        type: String,
        value: 'off'
      },

      /**
        * Indicates whether to auto-focus the textbox.
        * Set the value as <b>true</b> to auto-focus the textbox.
        */
      autofocus: {
        type: Boolean
      },

      /**
        * Indicates whether the element has focus currently or not.
        * Set it to <b>true</b> to indicate that the element currently has focus.
        */
      focused: {
        readOnly: true,
        type: Boolean,
        value: false,
        notify: true
      },

      /**
        * Indicates to the browser on devices with dynamic keyboards which keyboard to display. 
        * It applies to the text, search, password input types, and text-area.
        */
      inputmode: {
        type: String
      },

      /**
        * Indicates the minimum length of the input value.
        */
      minlength: {
        type: Number
      },

      /**
        * Indicates the maximum length of the input value.
        */
      maxlength: {
        type: Number
      },

      // min: {
      //   type: String
      // },
      // max: {
      //   type: String
      // },
      // step: {
      //   type: String
      // },

      /**
        * Indicates the name of the form control. It is submitted along with the form control's value when the form is submitted.
        * It is the name part of the "name and value pair" associated with an element for the purposes of form submission. 
        */
      name: {
        type: String
      },

      /**
        * Indicates a placeholder string in addition to the label. 
        * If this is set, then the label always floats.
        */
      placeholder: {
        type: String,
        // need to set a default so _computeAlwaysFloatLabel is run
        value: ''
      },

      /**
        * Specifies whether or not the text-box is non-editable. 
        * Set it to <b>true</b> to make the textbox read-only.
        */
      readonly: {
        type: Boolean,
        value: false
      },

      /**
        * Indicates the width of the `pebble-input` form control. 
        */
      size: {
        type: Number
      },

      /**
        * Indicates whether the entered text can be capitalized or not. 
        */
      autocapitalize: {
        type: String,
        value: 'none'
      },

      /**
        * Indicates whether the entered text can be auto-corrected or not.
        * Set the value as <b>on</b> to auto-correct the entered text.
        */
      autocorrect: {
        type: String,
        value: 'off'
      },

      /**
        * Indicates the types of files that the server accepts. The files can be submitted through a file upload.
        */
      accept: {
        type: String
      },

      /**
        * Indicates the relevance to the file, email, and range input type.
        */
      multiple: {
        type: Boolean
      },

      /**
        * Indicates the maximum rows allowed in the text-area.
        */
      maxRows: {
        type: Number,
        value: 0
      },

      /**
        * Indicates the number of rows allowed in the text-area.
        */
      rows: {
        type: Number,
        value: 1
      },

      /**
        * Indicates whether the errors can be shown or not.
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
      }
    };
  }

  _onChange(event) {
    //todo: this is not working right now
    if (this.shadowRoot) {
      this.dispatchEvent(new CustomEvent(event.type, {
        detail: {
          sourceEvent: event
        },
        node: this,
        cancelable: event.cancelable,
        bubbles: event.bubbles,
        composed: true
      }));
    }
  }

  /**
  * Can be used to bring the focus on the given text-area.
  */
  focus() {
    this.$.textarea.focus();
  }

  getLabelValue() {
    return this.noLabelFloat ? "" : this.label;
  }
}
customElements.define(PebbleTextarea.is, PebbleTextarea);
