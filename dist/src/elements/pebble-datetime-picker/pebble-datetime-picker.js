/**
`<pebble-datetime-picker>` Represents an element that provides the date and time with the default "picker text-box" and icon.

### Example

    <pebble-datetime-picker></pebble-datetime-picker>

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--pebble-date-picker` | Mixin applied to date picker | {}
`--pebble-date-picker-heading` | Mixin applied to date picker heading | {}
`--pebble-date-picker-heading-date` | Mixin applied to date picker heading date | {}
`--pebble-date-picker-heading-year` | Mixin applied to date picker heading year | {}
`--pebble-date-picker-body-monthyear` | Mixin applied to date picker body month year | {}
`--pebble-date-picker-calendar-weekdays` | Mixin applied to date picker calendar weekdays | {}
`--pebble-date-picker-calendar-day-selected` | Mixin applied to date picker calendar day selected | {}
`--pebble-date-picker-calendar-today` | Mixin applied to date picker calendar today | {}
`--pebble-date-picker-yearlist` | Mixin applied to date picker yearlist | {}
`--pebble-date-picker-yearlist-selected` | Mixin applied to date picker yearlist selected | {} 
`--pebble-date-picker-calendar` | Mixin applied to the date picker calendar | {}
`--pebble-date-picker-day-item-selected-day` | Mixin applied to calendar selected day text | {}
`--pebble-date-picker-day-item` | Mixin applied to calendar days | {}
`--pebble-picker-buttons` | Mixin applied to the date picker button | {}
`--pebble-timepicker-narrow` | Mixins applied for time picker | {}
`--pebble-timepicker-heading-narrow` | Mixins applied for heading | {}
`--pebble-timepicker-heading-time` | Mixins applied to heading time | {}
`--pebble-time-picker-heading-period` | Mixins applied to heading period | {}
`--pebble-time-picker-heading-color` | Mixins applied for heading color | {}
`--pebble-time-picker-selected` | Mixins applied for selected elements at heading | {}
`--pebble-time-picker-clock` | Mixins applied for time picker clock | {}
`--pebble-datetime-okbutton` | Mixins applied for picker 'OK' button | {}
`--pebble-datetime-cancelbutton` | Mixins applied for picker 'CANCEL' button | {}
`--pebble-dt-default-inputarea` | Mixins applied for picker addon input area | {}
`--pebble-dt-default-iconarea` | Mixins applied for picker addon default icon area | {}
`--pebble-dt-iconarea` | Mixins applied for picker addon icon area when no input shown | {}

### Accessibility

See the docs for `Polymer.IronOverlayBehavior` for accessibility features implemented by this element.

@group Pebble Elements
@element pebble-datetime-picker
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-helpers/format-helper.js';
import '../bedrock-validator/bedrock-validator.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-textbox/pebble-textbox.js';
import './pebble-datetime-picker-overlay.js';
import { flush } from '@polymer/polymer/lib/legacy/polymer.dom.js';
class PebbleDatetimePicker extends PolymerElement {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-icons">
            .datetimepicker-container {
                @apply --layout-horizontal;
            }

            #inputDiv {
                width: 100%;
                @apply --pebble-dt-default-inputarea;
            }

            #iconDiv {
                align-self: flex-end;
                -webkit-align-self: flex-end;
                margin-left: -20px;
                cursor: pointer;
                color: var(--primary-icon-color, #75808b);
                @apply --pebble-dt-default-iconarea;
            }

            #iconDiv pebble-icon {
                margin-bottom: 8px;
            }

            :host[no-default-input] #iconDiv {
                align-self: flex-end;
                -webkit-align-self: flex-end;
                padding-bottom: 10px;
                margin-left: 0px;
                cursor: pointer;
                @apply --pebble-dt-iconarea;
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
        </style>
        <div class="datetimepicker-container">
            <template is="dom-if" if="[[!noDefaultInput]]">
                <div id="inputDiv">
                    <pebble-textbox id="datetimePickerText" label="{{label}}" readonly="{{isReadonlyInput}}" no-label-float="[[noLabelFloat]]" description-object="[[descriptionObject]]" value="{{text}}" placeholder="[[getPlaceholder()]]"></pebble-textbox>
                </div>
                <bedrock-validator show-error="" validation-errors="{{validationErrors}}" input="[[value]]" required="[[required]]" invalid="{{invalid}}" error-message="{{errorMessage}}" type="[[validationType]]"></bedrock-validator>
            </template>
            <div id="iconDiv">
                <pebble-icon id="datetimePickerIcon" class="pebble-icon-size-16" icon="pebble-icon:calender" on-tap="_showPicker"></pebble-icon>
            </div>
        </div>
        <div class="error"> {{errorMessage}}</div>
        <template is="dom-if" if="[[_isReadyToShowPicker]]">
            <pebble-datetime-picker-overlay id="datetimepicker" for="[[_target]]" picker-type="{{pickerType}}" datetime-format="{{datetimeFormat}}" date-format="{{dateFormat}}" time-format="{{timeFormat}}" date-value="{{dateValue}}" time-value="{{timeValue}}" default-time="[[defaultTime]]" utc-value="{{utcDateTime}}" value="{{value}}" horizontal-align="{{horizontalAlign}}" vertical-align="{{verticalAlign}}" min-date="[[minDate]]" max-date="[[maxDate]]" min-time="[[minTime]]" max-time="[[maxTime]]"></pebble-datetime-picker-overlay>
        </template>
`;
  }

  static get is() {
      return "pebble-datetime-picker";
  }

  static get properties() {
      return {
          /**
           * Indicates text datetime, date, and time 
           */
          text: {
              type: String,
              notify: true,
              observer: '_onDateTextChange'
          },

          /**
           * Indicates datetime, date, and time as per pickerType. 
           */
          value: {
              type: String,
              notify: true,
              observer: '_onDateValueChange'
          },

          /**
           * Specifies the value of the date.
           */
          dateValue: {
              type: String,
              value: null,
              readonly: true,
              notify: true
          },

          /**
           * Specifies the value of the time.
           */
          timeValue: {
              type: String,
              value: null,
              readonly: true,
              notify: true
          },

          defaultTime: {
              type: String,
              value: null
          },

          /**
           * Specifies the value in the `UTC` format.
           */
          utcValue: {
              type: String,
              value: null,
              readonly: true,
              notify: true
          },

          /**
           * Specifies the format of the date displayed in the heading.
           * See documentation for Moment.js for more info.
           */
          headingFormat: {
              type: String,
              value: 'ddd, MMM D'
          },

          /**
           * Specifies the datetime format for picker.
           */
          datetimeFormat: {
              type: String,
              value: "MM/DD/YYYY hh:mm:ss A"
          },

          /**
           * Specifies the date format for picker.
           */
          dateFormat: {
              type: String,
              value: "MM/DD/YYYY"
          },

          /**
           * Specifies the time format for picker.
           */
          timeFormat: {
              type: String,
              value: "hh:mm:ss A"
          },

          _isoDateTimeFormat: {
              type: String,
              readonly: true,
              value: function () {
                  return FormatHelper.getISODateTimeFormat();
              }
          },

          _isoDateFormat: {
              type: String,
              readonly: true,
              value: "YYYY-MM-DD"
          },

          /*
          *  Indicates the "vertical" alignment of the picker.            
          *  If <b>value</b> is selected as "top", then picker is aligned below the target.  
          *  If <b>value</b> is selected as "below", then picker is aligned above the target.
          */

          verticalAlign: {
              type: String,
              value: "auto"
          },

          /*
          *  Indicates the "horizontal" alignment of the picker.            
          *  If <b>value</b> is selected as "left", then picker is aligned to the left of the target.  
          *  If <b>value</b> is selected as "right", then picker is aligned to the right of the target.
          */
          horizontalAlign: {
              type: String,
              value: "auto"
          },

          /*
           * Indicates the type of the picker. It can have the value as datetime or date or time or daterange.
           */
          pickerType: {
              type: String,
              value: "datetime"
          },

          /**
           * Indicates the `showrange` group.
           */
          showRanges: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates the `showbuttons`.
           */
          showButtons: {
              type: Boolean,
              value: false
          },

          /**
           * Specifies whether or not to hide the default input.
           */
          noDefaultInput: {
              type: Boolean,
              reflectToAttribute: true,
              value: false,
              observer: '_onDefaultInputFlagChange'
          },

          /**
           * Specifies whether or not input textbox is readonly or editable.
           */
          isReadonlyInput: {
              type: Boolean,
              value: false
          },

          _target: {
              type: String,
              value: "datetimePickerText"
          },

          /**
          * Specifies whether the field is required or not.
          */
          required: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates the minimum allowed value.
           * */
          minDate: {
              type: Date,
              value: null
          },

          /**
           * Indicates the maximum allowed value.
           */
          maxDate: {
              type: Date,
              value: null
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

          timePattern: {
              type: String,
              value: ""
          },

          cursorStartPosition: {
              type: Number,
              value: 0
          },

          autoCompleteTime: {
              type: Boolean,
              value: true
          },

          autoCompleteTimeValue: {
              type: String,
              value: " 12:00:00 AM"
          },

          updateInProgress: {
              type: Boolean,
              value: false
          },

          specialCharacter: {
              type: String,
              value: "/ :"
          },
          _isReadyToShowPicker: {
              type: Boolean,
              value: false
          }
      };
  }

  constructor() {
      super();
  }

  connectedCallback() {
      super.connectedCallback();
      this.addEventListener("input-key-up", this._onInputKeyUp);
      this.addEventListener("input-focus-out", this._onInputFocusOut);
  }

  disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener("input-key-up", this._onInputKeyUp);
      this.removeEventListener("input-focus-out", this._onInputFocusOut);
  }

  _showPicker() {
      this._isReadyToShowPicker = true;
      flush();

      this._datetimepicker = this.shadowRoot.querySelector('#datetimepicker');

      if(this._datetimepicker) {
          this._datetimepicker.showButtons = this.showButtons;
          this._datetimepicker.show();
      }
  }

  _onDefaultInputFlagChange() {
      if (this.noDefaultInput) {
          this._target = "datetimePickerIcon";
      }
  }

  getPlaceholder() {
      if (this.pickerType == "datetime") {
          return this.datetimeFormat + "M/PM";
      } else {
          return this.dateFormat;
      }
  }

  _onInputFocusOut(event) {
      let inputValue = event.detail.inputValue;
      if (inputValue && this.pickerType == "datetime") {
          if (inputValue.length == this.dateFormat.length + 1) {
              this.text += this.autoCompleteTimeValue;
          }
      }
  }

  _onInputKeyUp(event) {
      let keycode = event.detail.sourceEvent.keyCode;
      let inputElement = this._datetimePickerTextBox.getInputElement();
      if (keycode && inputElement) {
          if (this.autoCompleteTime && inputElement.selectionStart == this.dateFormat.length + 1 && inputElement.selectionEnd == this.datetimeFormat.length + 1) {
              this.autoCompleteTime = false;
          }
      }
  }

  getStringDiff(newvalue, oldvalue) {
      let diffObject = {};
      if (oldvalue) {
          oldvalue.split("").every(function (value, index) {
              if (value != newvalue.charAt(index)) {
                  diffObject["text"] = value;
                  diffObject["index"] = index;
                  return false;
              } else {
                  return true;
              }
          });
      }

      return diffObject;
  }

  // When textbox value change, set the value to date value for validation
  _onDateTextChange(newvalue, oldvalue) {
      let _format = this.pickerType == "datetime" ? this.datetimeFormat : this.dateFormat;
      let isoFormat = this.pickerType == "datetime" ? this._isoDateTimeFormat : this._isoDateFormat;
      let strDiff = this.getStringDiff(newvalue, oldvalue);
          this._datetimePickerTextBox = this.shadowRoot.querySelector("#datetimePickerText");
          if (this._datetimePickerTextBox) {
              let inputElement = this._datetimePickerTextBox.getInputElement();
              if(inputElement){
                  if (!_.isEmpty(strDiff)) {
                      if (!this.updateInProgress) {
                          this.updateInProgress = true;
                          if ("AMP".indexOf(strDiff.text) > -1) {
                              this.timePattern = "";
                          } else if (":/".indexOf(strDiff.text) > -1) {
                              this.cursorStartPosition = inputElement.selectionStart - 2;
                              this.text = this.text.slice(0, strDiff.index - 1) + this.text.slice(strDiff.index, this.text.length)
                          } else if (" ".indexOf(strDiff.text) > -1) {
                              this.cursorStartPosition = inputElement.selectionStart - 1;
                              this.text = this.text.slice(0, strDiff.index - 1) + this.text.slice(strDiff.index, this.text.length)
                          }
                          this.cursorStartPosition = inputElement.selectionStart
                      }
                  } else {
                      this.cursorStartPosition = inputElement.selectionStart
                  }
              }
          }
      let isoDateFromText = moment(this.text, _format, true).format(isoFormat);

      if (this.value == isoDateFromText) {
          return;
      }

      if (isoDateFromText == "Invalid date") {
          this.value = this.text;
          return;
      }

      this.value = isoDateFromText;
  }

  // When date value change, set the textbox value in UI format
  _onDateValueChange() {
      if (this.value && this.pickerType) {
          let format = this.pickerType == "datetime" ? this.datetimeFormat : this.dateFormat;
          this.text = FormatHelper.convertFromISODateTime(this.value, this.pickerType, format);
      } else {
          this.text = this.value;
      }

      if (this.text.length == 0) {
          if (!this.autoCompleteTime) {
              this.autoCompleteTime = true;
          }
      }
      
      if (this.text && this._datetimePickerTextBox && this._datetimePickerTextBox.getInputElement()) {
          let currentValue = this.text;
          let currentPatternIndex = 0;
          let currentPattern = this.dateFormat;
          let totalDashesAdded = 0;
          let formattedValue = '';
          let patternSeperator = "/";
          let timeFormatLength = 0;
          let timePattrenCharacters = "AP";
          let dateFormatLength = (this.dateFormat ? this.dateFormat.length : 0) - (this.dateFormat.match(/\//g) || []).length;
          if (this.timeFormat) {
              timeFormatLength = (this.timeFormat ? this.timeFormat.length : 0) - (this.timeFormat.match(/:/g) || []).length;
          }
          let maxLength = this.pickerType == "datetime" ? dateFormatLength + timeFormatLength : dateFormatLength;
          let specialCharacter = this.specialCharacter;
          let inputElement = this._datetimePickerTextBox.getInputElement();
          let start = inputElement.selectionStart
          let previousCharADash = specialCharacter.indexOf(currentValue.charAt(start - 1)) > -1;
          if (currentValue.length == 22) {
              this.timePattern = currentValue.slice(-2);
          }
          currentValue = currentValue.replace(/\//g, "").replace(/ /g, "").replace(/:/g, "");
          let isCharacterAllowed = true;
          for (let currentValueIndex = 0; currentValueIndex < currentValue.length; currentValueIndex++) {
              isCharacterAllowed = true;
              if (currentValueIndex < dateFormatLength + timeFormatLength - 2 && isNaN(currentValue[currentValueIndex]) || currentValueIndex >= maxLength) {
                  isCharacterAllowed = false;
              } else if (currentValueIndex >= dateFormatLength + timeFormatLength - 2) {
                  if (timePattrenCharacters.indexOf(currentValue[currentValueIndex].toUpperCase()) > -1 && currentValueIndex == dateFormatLength + timeFormatLength - 2 || timePattrenCharacters.indexOf(currentValue[currentValueIndex - 1].toUpperCase()) > -1 && currentValue[currentValueIndex].toUpperCase() == "M") {
                      if (currentValueIndex == dateFormatLength + timeFormatLength - 2) {
                          formattedValue += " ";
                      }
                      currentValue = currentValue.replace(currentValue[currentValueIndex], currentValue[currentValueIndex].toUpperCase());
                  } else {
                      continue;
                  }
              }
              
              if (currentValueIndex == dateFormatLength) {
                  totalDashesAdded = 0;
                  currentPattern = this.timeFormat;
                  currentPatternIndex = 0;
                  patternSeperator = ":"
              }
              currentPatternIndex = currentPattern.indexOf(patternSeperator, currentPatternIndex);
              let patternSeperatorIndex = currentPatternIndex - totalDashesAdded;
              
              if (isCharacterAllowed) {
                  formattedValue += currentValue[currentValueIndex];
              } else {
                  currentValue = currentValue.slice(0, currentValueIndex - 1) + currentValue.slice(currentValueIndex, this.text.length);
                  if(currentValueIndex != 0) {
                      currentValueIndex--;
                  }
              }
              
              if (currentPatternIndex > -1 && currentValueIndex != dateFormatLength - 1 && (currentValueIndex == patternSeperatorIndex - 1 || currentValueIndex == (dateFormatLength + patternSeperatorIndex - 1))) {
                  formattedValue += patternSeperator;
                  currentPatternIndex++;
                  totalDashesAdded++;
              } else if (currentValueIndex == dateFormatLength - 1 && this.pickerType == "datetime") {
                  formattedValue += " ";
              }
          }

          if (formattedValue.length == 19) {
              if (this.timePattern) {
                  formattedValue += " " + this.timePattern;
              }
          }
          
          let nextCharADash = specialCharacter.indexOf(formattedValue.charAt(this.cursorStartPosition)) > -1;
          if (formattedValue.length == this.dateFormat.length + 1 && this.autoCompleteTime && this.pickerType == "datetime") {
              formattedValue += this.autoCompleteTimeValue;
          }
          
          this.text = formattedValue;
          this.updateInProgress = false;
          if (this.autoCompleteTime) {
              inputElement.selectionStart = this.dateFormat.length + 1
              inputElement.selectionEnd = formattedValue.length;
          } else {
              inputElement.selectionStart = this.cursorStartPosition;
              inputElement.selectionEnd = this.cursorStartPosition;
              if (!previousCharADash && specialCharacter.indexOf(this.text.charAt(this.cursorStartPosition - 1)) > -1 || nextCharADash) {
                  inputElement.selectionStart = this.cursorStartPosition + 1;
                  inputElement.selectionEnd = this.cursorStartPosition + 1;
              }
          }
      }
  }
}
customElements.define(PebbleDatetimePicker.is, PebbleDatetimePicker);
