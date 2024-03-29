/**
`pebble-textbox` Represents a single-line text field with proper styling.
  It allows to input text, select text, and lookup data via auto-completion.
  Text fields usually appear in forms. Text, numbers, or mixed-format types of input can be entered.


@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/paper-input/paper-input.js';
import '@polymer/polymer/lib/utils/async.js';
import '../bedrock-validator/bedrock-validator.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../pebble-info-icon/pebble-info-icon.js';
class PebbleTextbox extends PolymerElement {
  static get template() {
    return html`
        <style include="bedrock-style-common">
            #textbox {
                --paper-input-container-input: {
                    font-size: var(--default-font-size, 14px) !important;
                    line-height: 24px;
                    @apply --pebble-textbox-paper-input-style;
                    @apply --pebble-textbox-paper-input-style-table;
                }
                --paper-input-container: {
                    padding-right: 0;
                    padding-top: 0;
                    padding-bottom: 0;
                    padding-left: 0;
                }
                --paper-input-container-underline: {
                    border-bottom: 1px solid var(--textbox-border, #d2d8de);
                }
                --paper-input-container-underline-focus: {
                    border-bottom: 1px solid var(--primary-border-button-color, #026bc3);
                }
                --paper-input-container-label: {
                    font-size: var(--default-font-size, 14px) !important;
                }
                --paper-menu-button-dropdown: {
                    margin-top: 40px;
                }
                --paper-menu-button-content: {
                    box-shadow: 0 0 var(--popup-box-shadow-size, 8px) 0 var(--popup-box-shadow, #8A98A3) !important;
                }
                --paper-input-container-label: {
                    font-size: 14px !important;
                    color: var(--label-text-color, #96b0c6);
                    text-transform: capitalize;
                }                
            }
            @supports (-ms-ime-align:auto) {
                paper-input {
                    --paper-input-container-label-floating:{
                        transform: initial;
                        top:-20px;
                        font-size:12px !important;
                    }
                    --paper-input-container-label: {
                        transform: initial;
                        transition:initial;
                    }
                }
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
                <span class="attribute-view-label">[[label]]</span>
                <template is="dom-if" if="[[descriptionObject]]">
                    <pebble-info-icon description-object="[[descriptionObject]]"></pebble-info-icon>
                </template>
            </div>
        </template>

        <paper-input id="textbox" disabled="[[disabled]]" value="{{value}}" invalid="{{invalid}}" prevent-invalid-input="[[preventInvalidInput]]" autocomplete="[[autocomplete]]" autofocus="[[autofocus]]" inputmode="[[inputmode]]" maxlength="[[maxlength]]" name\$="[[name]]" placeholder="[[placeholder]]" readonly="[[readonly]]" list="[[list]]" size="[[size]]" autocapitalize="[[autocapitalize]]" autocorrect="[[autocorrect]]" tabindex="[[tabindex]]" autosave="[[autosave]]" results="[[results]]" accept="[[accept]]" multiple="[[multiple]]" always-float-label="[[alwaysFloatLabel]]" char-counter="[[charCounter]]" error-message="[[errorMessage]]" focused="[[focused]]" allowed-pattern="[[allowedPattern]]" on-change="_onChange" title="[[title]]" label="[[getLabelValue()]]" no-label-float="[[noLabelFloat]]" type="[[type]]" on-keyup="_onInputKeyUp" on-focusout="_onInputFocusOut">
            <slot slot="suffix" name="suffix"></slot>
            <slot slot="prefix" name="prefix"></slot>
        </paper-input>
        <bedrock-validator show-error="[[showError]]" validation-errors="{{validationErrors}}" input="[[value]]" pattern="[[pattern]]" min-length="[[minlength]]" max-length="[[maxlength]]" precision="[[precision]]" required="[[required]]" input-data-type="[[inputDataType]]" invalid="{{invalid}}" error-message="{{errorMessage}}" min="[[min]]" max="[[max]]" type="[[validationType]]" type-array="[[validationTypeArray]]"></bedrock-validator>

        <!--type\$="[[type]]"
          min\$="[[min]]"
          max\$="[[max]]"
          step\$="[[step]]"-->
`;
  }

  static get is() {
      return "pebble-textbox";
  }
  static get properties() {
      return {

          /**
           *  Indicates the default value for the text-box.                  
           * 
           */
          value: {
              type: String,
              value: "",
              notify: true
          },
          /**
           * Specifies whether or not the value is invalid.
           * Returns true if the value is invalid. 
           * If auto-Validate is true, the invalid attribute is managed automatically.                
           * 
           */
          invalid: {
              type: Boolean,
              value: false,
              notify: true
          },
          /**
           * Indicates the label for the text-box.
           * Allows to add descriptive text for the text-box to inform the user about the type of data 
           * expected in the text-box. 
           */
          label: {
              type: String
          },
          /**
           * Specifies whether or not the input is disabled. Set it to <b>true</b> to disable the input. 
           * 
           * 
           */
          disabled: {
              type: Boolean,
              value: false
          },
          /**
           * Specifies whether or not entering an invalid input is prevented.
           * Set the value as <b>true</b> to prevent the user from entering invalid input.
           */
          preventInvalidInput: {
              type: Boolean
          },
          /**
           * Indicates whether the pattern is allowed by `preventInvalidInput` or not.
           * Set the value as <b>true</b> to indicate the pattern allowed by `preventInvalidInput`.
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
           * Indicates whether to always float the label or not.
           * Set the value as <b>true</b> to always float the label.
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
           * Indicates whether to auto-focus the text-box.
           * Set the value as <b>true</b> to auto-focus the text-box.
           */
          autofocus: {
              type: Boolean
          },
          /**
           * Indicates whether or not currently the element has focus.
           * Set it to <b>true</b> to indicate the element that currently has focus.
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
           * It is the name part of the "name and value" pair associated with an element for the purposes of form submission. 
           */
          name: {
              type: String
          },
          /**
           * Indicates a placeholder string in addition to the label. 
           * If this is set, the label always floats.
           */
          placeholder: {
              type: String,
              // need to set a default so _computeAlwaysFloatLabel is run
              value: ''
          },
          /**
           * Indicates whether to make the text-box non-editable. 
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
           * Indicates whether or not entered text can be capitalized or not. 
           */
          autocapitalize: {
              type: String,
              value: 'none'
          },
          /**
           * Indicates whether or not the entered text can be auto-corrected.
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
          /* 
           * Indicates an array that has validation errors, if there are any.
           *
           */
          validationErrors: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },
          /*
           * Indicates whether the errors can be shown or not.
           */
          showError: {
              type: Boolean,
              value: false
          },

          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          tabindex: {
              type: Number
          },
          // Indicates an input data type.
          inputDataType: {
              type: String
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
          targetId: {
              type: String,
              value: ""
          }
      }
  }
  _onInputFocusOut() {
      if (this.shadowRoot) {
          let eventData = {
              inputValue: this.value
          };
          this.dispatchEvent(new CustomEvent("input-focus-out", {
              detail: eventData,
              node: this,
              composed: true,
          }));
      }
  }

  _onInputKeyUp(event) {
      if (this.shadowRoot) {
          this.dispatchEvent(new CustomEvent("input-key-up", {
              detail: {
                  sourceEvent: event,
              },
              node: this,
              cancelable: event.cancelable,
              bubbles: event.bubbles,
              composed: true,
          }));
      }
  }
  _onChange(event) {
      //event bubbling
      if (this.shadowRoot) {
          this.dispatchEvent(new CustomEvent(event.type, {
              detail: {
                  sourceEvent: event
              },
              node: this,
              cancelable: event.cancelable,
              bubbles: event.bubbles,
              composed: true,
          }));
      }
  }
  /*
   * Can be used to bring the focus on the given text-box.
   */
  focus() {
      this.$.textbox.inputElement.inputElement.focus();
  }

  getLabelValue() {
      return this.noLabelFloat ? "" : this.label;
  }
  getInputElement() {
      return this.$.textbox.inputElement.inputElement;
  }
}
customElements.define(PebbleTextbox.is, PebbleTextbox);
