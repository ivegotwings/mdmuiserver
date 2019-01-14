/**
`<pebble-datetime-picker-overlay>` Represents an element that provides the date and time as overlay.It is the child element of `pebble-datetime` element.
### Example
    <template is="dom-bind">
				<paper-button id="datetimePicker" raised onclick="picker.show()">Date Time Picker</paper-button>
				<pebble-datetime-picker-overlay id="picker" 
                                                for="datetimePicker"
                                                value="{{dateTime}}"></pebble-datetime-picker-overlay>
				<span>{{dateTime}}</span>
	</template>
### Styling
The following custom properties and mixins are available for styling:
Custom property | Description | Default
----------------|-------------|----------
`--pebble-date-picker-width` | Date picker width | 275px
`--pebble-date-picker-height` | Date picker height | 300px
`--pebble-date-picker-heading-width` | Date picker heading width | ``
`--pebble-date-picker-heading-height` | Date picker heading height | 76px
`--pebble-date-picker-calendar-bgcolor` | Date picker body background color | ``
`--pebble-date-picker` | Mixin applied to date picker | {}
`--pebble-date-picker-heading` | Mixin applied to date picker heading | {}
`--pebble-range-date-picker-heading` | Mixins applied for heading in range picker | {}
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
`--pebble-time-picker-selected-font-color` | Selected elements text color in time picker | #ffffff
`--pebble-time-picker-clockhand-color` | Apply color to clock hand and heading | #3f51b5
`--pebble-timepicker-narrow` | Mixins applied for time picker | {}
`--pebble-timepicker-heading-narrow` | Mixins applied for heading | {}
`--pebble-timepicker-heading-time` | Mixins applied to heading time | {}
`--pebble-time-picker-heading-period` | Mixins applied to heading period | {}
`--pebble-time-picker-heading-color` | Mixins applied for heading color | {}
`--pebble-time-picker-selected` | Mixins applied for selected elements at heading | {}
`--pebble-time-picker-clock` | Mixins applied for time picker clock | {}
`--pebble-datetime-okbutton` | Mixins applied for picker 'OK' button | {}
`--pebble-datetime-cancelbutton` | Mixins applied for picker 'CANCEL' button | {}
### Accessibility
See the docs for `Polymer.IronOverlayBehavior` for accessibility features implemented by this element.
@group Pebble Elements
@element pebble-datetime-picker-overlay
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { IronOverlayBehavior } from '@polymer/iron-overlay-behavior/iron-overlay-behavior.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input.js';
import { IronDropdownScrollManager } from '@polymer/iron-dropdown/iron-dropdown-scroll-manager.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-validator/bedrock-validator.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/format-helper.js';
import '../pebble-date-picker/pebble-date-picker.js';
import '../pebble-date-picker/pebble-date-picker-dialog-style.js';
import '../pebble-time-picker/pebble-time-picker.js';
import '../pebble-button/pebble-button.js';
import '../pebble-toggle-button/pebble-toggle-button.js';
import '../pebble-time-picker/pebble-time-picker-dialog-style.js';
import { IronA11yKeysBehavior } from '@polymer/iron-a11y-keys-behavior/iron-a11y-keys-behavior.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
//To capture current opened Datetime picker
let currentDateTimePicker = null;
class PebbleDatetimePickerOverlay
    extends mixinBehaviors([
        IronOverlayBehavior,
        RUFBehaviors.UIBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common pebble-date-picker-dialog-style bedrock-style-padding-margin">
            :host {
                display: inline-table;
                position: absolute;
                background-color: var(--palette-white, #ffffff);
                box-sizing: border-box;
                box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.26);
                border-radius: 2px;
                border: 1px solid var(--palette-cloudy-blue, #c1cad4);
                font-size: var(--default-font-size, 14px);
                overflow: auto;
                padding: 10px;
                margin: 5px;
            }

            pebble-date-picker {
                --pebble-nw-date-picker: {
                    width: var(--pebble-date-picker-width, 275px);
                    height: var(--pebble-date-picker-height, 300px);
                    @apply --pebble-date-picker;
                }
                --pebble-nw-date-picker-heading: {
                    width: var(--pebble-date-picker-heading-width);
                    height: var(--pebble-date-picker-heading-height, 56px);
                    @apply --pebble-date-picker-heading;
                }
                --pebble-date-picker-head-year: {
                    @apply --pebble-date-picker-heading-year;
                }
                --pebble-date-picker-head-date: {
                    font-size: var(--default-font-size, 14px);
                    @apply pebble-date-picker-heading-date;
                }
                --pebble-ls-date-picker-heading: {
                    height: 314px;
                    color: var(--white) !important;
                    @apply --pebble-range-date-picker-heading;
                }
            }

            #timePicker {
                --pebble-time-picker-narrow: {
                    width: 275px;
                    height: 270px;
                    @apply --pebble-timepicker-narrow;
                }
                --pebble-time-picker-heading-narrow: {
                    height: 45px;
                    @apply --pebble-timepicker-heading-narrow;
                }

                --pebble-time-picker-heading-time: {
                    font-size: 25px;
                    @apply --pebble-timepicker-heading-time;
                }

                --default-primary-color: var(--pebble-time-picker-clockhand-color, #3f51b5);
                --text-primary-color: var(--pebble-time-picker-selected-font-color, #ffffff);
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

            .buttons {
                text-align: center;
                @apply --pebble-picker-buttons;
            }

            :host([picker-type="datetime"]) .text-area {
                @apply --layout-horizontal;
            }

            :host([picker-type="datetime"]) .text-area paper-input {
                width: var(--input-textbox-width, 125px);
            }

            .text-area {
                padding: 5px;
            }

            .date-area {
                margin-right: 10px;
            }

            pebble-toggle-button {
                --pebble-toggle-button-checked-bar-color: var(--success-color, #4caf50);
                --pebble-toggle-button-checked-button-color: var(--success-color, #4caf50);
                --pebble-toggle-button-checked-ink-color: var(--success-color, #4caf50);
                display: block
            }
        </style>

        <template is="dom-if" if="[[_isDateRange(pickerType)]]">
            <section class="pebble-date-range-picker-dialog">
                <template is="dom-if" if="{{attributeValuesExistsSearchEnabled}}">
                    <pebble-toggle-button class="m-l-10 m-b-20" checked="{{hasValueChecked}}">[[_toggleButtonText]]</pebble-toggle-button>
                </template>
                <pebble-date-picker is-range="" heading-format="[[headingFormat]]" min-date="[[minDate]]" max-date="[[maxDate]]" start-date="{{_startDate}}" end-date="{{_endDate}}" disable-calendar="[[!hasValueChecked]]">
                </pebble-date-picker>
                <div class="error">
                    <span> {{errorMessage}}</span>
                </div>
                <div class="buttons">
                    <pebble-button on-tap="hide" class="btn btn-secondary m-r-5" button-text="Cancel"></pebble-button>
                    <pebble-button on-tap="_onDateRangeSelect" class="btn btn-success" button-text="Apply"></pebble-button>
                </div>
            </section>
        </template>

        <template is="dom-if" if="[[!_isDateRange(pickerType)]]">
            <template is="dom-if" if="[[_showInput]]">
                <div class="text-area">
                    <template is="dom-if" if="[[_showInputByPicker('date', pickerType)]]">
                        <div class="date-area">
                            <paper-input label="DATE ([[dateFormat]])" always-float-label="" value="{{_inputDate}}" on-blur="_onInputDateChange"></paper-input>
                        </div>
                    </template>
                    <template is="dom-if" if="[[_showInputByPicker('time', pickerType)]]">
                        <div class="time-area">
                            <paper-input label="TIME ([[timeFormat]])" always-float-label="" value="{{_inputTime}}" on-blur="_onInputTimeChange"></paper-input>
                        </div>
                    </template>
                </div>
            </template>
            <template is="dom-if" if="[[!_showTime]]">
                <section class="pebble-date-picker-dialog">
                    <bedrock-pubsub event-name="calendar-day-tap" handler="_onCalendarDayTap" target-id=""></bedrock-pubsub>
                    <pebble-date-picker date="{{_date}}" force-narrow="" min-date="[[minDate]]" max-date="[[maxDate]]" heading-format="[[headingFormat]]">
                    </pebble-date-picker>
                    <div class="error">
                        <span> {{errorMessage}}</span>
                    </div>
                    <template is="dom-if" if="[[showButtons]]">
                        <div class="buttons" align="right">
                            <pebble-button on-tap="hide" class="btn btn-secondary m-r-5" button-text="Cancel"></pebble-button>
                            <pebble-button on-tap="_onDateSelect" class="btn btn-success" button-text="Ok"></pebble-button>
                        </div>
                    </template>
                </section>
            </template>

            <template is="dom-if" if="[[_showTime]]">
                <section class="pebble-time-picker-dialog">
                    <pebble-time-picker id="timePicker" force-narrow="" time="{{_time}}" enable-seconds="">
                    </pebble-time-picker>
                    <div class="error">
                        <span> {{errorMessage}}</span>
                    </div>
                    <div class="buttons" align="right">
                        <pebble-button on-tap="_onTimeCancel" class="btn btn-secondary m-r-5" button-text="Cancel"></pebble-button>
                        <pebble-button on-tap="_onTimeSelect" class="btn btn-success" button-text="OK"></pebble-button>
                    </div>
                </section>

            </template>
        </template>

        <template is="dom-if" if="[[_isTime]]">
            <bedrock-validator show-error="" input="[[_time]]" min="[[minTime]]" max="[[maxTime]]" required="[[required]]" invalid="{{invalid}}" error-message="{{errorMessage}}" type="timeRange" date-format="[[timeFormat]]"></bedrock-validator>
        </template>
        <template is="dom-if" if="[[_isDate]]">
            <bedrock-validator show-error="" input="[[_date]]" min="[[minDate]]" max="[[maxDate]]" required="[[required]]" invalid="{{invalid}}" error-message="{{errorMessage}}" type="dateRange" date-format="[[dateFormat]]"></bedrock-validator>
        </template>
        <template is="dom-if" if="[[_isDateTime]]">
            <bedrock-validator show-error="" input="[[_datetime]]" min="[[minDate]]" max="[[maxDate]]" required="[[required]]" invalid="{{invalid}}" error-message="{{errorMessage}}" type="dateRange" date-format="[[datetimeFormat]]"></bedrock-validator>
        </template>
`;
  }

  static get is() { return 'pebble-datetime-picker-overlay' }

  static get properties() {
      return {
          /*
           * Indicates the selected date in the YYYY-MM-DD format.
           */
          _date: {
              type: Date,
              notify: true,
              observer: "_onDateChange"
          },
          /*
           * Indicates the selected time.
           */
          _time: {
              type: String,
              notify: true,
              observer: "_onTimeChange"
          },
          /*
           * Indicates the start date.
           */
          _startDate: {
              type: Date,
              notify: true
          },
          /*
           * Indicates the end date.
           */
          _endDate: {
              type: Date,
              notify: true
          },
          /*
           *  Specifies whether or not the popover overlaps with the target.
           */
          _noOverlap: {
              type: Boolean,
              value: true
          },
          /*
           * Specifies whether or not to show the date and time.
           */
          _showTime: {
              type: Boolean,
              value: false,
              notify: true
          },
          /**
           * Indicates datetime, date, and time as per pickerType. 
           */
          text: {
              type: String,
              notify: true
          },
          /**
           * Indicates datetime, date, and time ISO format. 
           */
          value: {
              type: String,
              notify: true,
              observer: '_onValueChange'
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
           * Specifies the value of the start date.
           */
          startDateValue: {
              type: String,
              value: null,
              readonly: true,
              notify: true
          },
          /**
           * Specifies the value of the end date.
           */
          endDateValue: {
              type: String,
              value: null,
              readonly: true,
              notify: true
          },
          /**
           * Specifies the value of the start date.
           */
          startDateText: {
              type: String,
              value: null,
              readonly: true,
              notify: true
          },
          /**
           * Specifies the value of the end date.
           */
          endDateText: {
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
           * Specifies the minimum allowed date.
           */
          minDate: {
              type: Date,
              value: null
          },
          /**
           * Specifies the maximum allowed date.
           */
          maxDate: {
              type: Date,
              value: null
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
          /**
           * Specifies the datetime format for picker.
           */
          datetimeFormat: {
              type: String,
              value: "MM/DD/YYYY hh:mm:ss A"
          },
          _defaultDateTimeFormat: {
              type: String,
              readonly: true,
              value: "MM/DD/YYYY hh:mm:ss A"
          },
          _defaultDateFormat: {
              type: String,
              readonly: true,
              value: "MM/DD/YYYY"
          },
          _defaultTimeFormat: {
              type: String,
              readonly: true,
              value: "hh:mm:ss A"
          },
          _utcDateTimeFormat: {
              type: String,
              readonly: true,
              value: "MM/DD/YYYY hh:mm:ss A"
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
           *  Indicates the target for picker to display.
           */
          for: {
              type: String,
              value: null
          },
          /*
           *  Indicates the "vertical" alignment of the picker.            
           *  If <b>value</b> is selected as "top", then picker is aligned below the target.  
           *  If <b>value</b> is selected as "bottom", then picker is aligned above the target.
           *  If <b>value</b> is selected as "auto", then picker is aligned as per the space available.
           */
          verticalAlign: {
              type: String,
              value: "auto"
          },
          /*
           *  Indicates the "horizontal" alignment of the picker.            
           *  If <b>value</b> is selected as "left", then picker is aligned to the left of the target.  
           *  If <b>value</b> is selected as "right", then picker is aligned to the right of the target.
           *  If <b>value</b> is selected as "auto", then picker is aligned as per the space available.
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
              value: "datetime",
              reflectToAttribute: true,
              observer: "_onPickerTypeChange"
          },
          /**
           * Specifies whether or not to show the ranges.
           */
          showRanges: {
              type: Boolean,
              value: false,
              observer: "_onShowRangesChange"
          },
          /**
           * Indicates whether or not the data is successfully validated.
           */
          invalid: {
              type: Boolean,
              value: false,
              notify: true
          },
          /**
           * Specifies whether or not the field is required.
           */
          required: {
              type: Boolean
          },
          _isTime: {
              type: Boolean
          },
          _isDateTime: {
              type: Boolean
          },
          _isDate: {
              type: Boolean
          },
          /**
           * Specifies whether or not to show the buttons.
           */
          showButtons: {
              type: Boolean,
              value: false
          },
          _inputDate: {
              type: String,
              value: null
          },
          _inputTime: {
              type: String,
              value: null
          },
          /**
           * Specifies whether or not to show the input.
           */
          _showInput: {
              type: Boolean,
              value: false
          },
          /**
           * Performance fix for iron-fit-behavior (used by iron-overlay-behavior)
           * */
          _isRTL: {
              type: Boolean,
              value: false
          },
          hasValueChecked: {
              type: Boolean,
              value: false,
              notify: true,
              observer: "_onToggleButtonChange"
          },
          attributeValuesExistsSearchEnabled: {
              type: Boolean,
              value: false
          },
          _toggleButtonText: {
              type: String,
              value: "Has Value"
          },
          defaultTime: {
              type: String,
              value: null
          }
      }
  }
  connectedCallback() {
      super.connectedCallback();
      this.addEventListener('iron-overlay-opened', this._datetimePickerOpened);
      this.addEventListener('iron-overlay-closed', this._datetimePickerClosed);
      window.addEventListener('scroll', this._fixPickerOnScrollAndResize);
      window.addEventListener('resize', this._fixPickerOnScrollAndResize);
      window.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('iron-overlay-opened', this._datetimePickerOpened);
      this.removeEventListener('iron-overlay-closed', this._datetimePickerClosed);
      window.removeEventListener('scroll', this._fixPickerOnScrollAndResize);
      window.removeEventListener('resize', this._fixPickerOnScrollAndResize);
      window.removeEventListener('keydown', this._onKeyDown);
  }

  _onKeyDown(e) {
      if (currentDateTimePicker && IronA11yKeysBehavior.keyboardEventMatchesKeys(e, "tab")) {
          currentDateTimePicker.close();
      }
  }

  _onValueChange() {
      if (this.value && this.pickerType) {
          let date = "";
          if (this.pickerType.toLowerCase() == "datetime") {
              date = moment(this.value, this._isoDateTimeFormat, true).format(this._defaultDateTimeFormat);
          } else {
              date = moment(this.value, this._isoDateFormat, true).format(this._defaultDateFormat);
          }

          if (!date || date == "Invalid date") {
              this.text = this.value;
          } else {
              this.text = date;
          }
      } else {
          this.text = this.value;
      }
  }

  _onPickerTypeChange() {
      if (this.pickerType == '' || this.pickerType == undefined || this.pickerType == null) {
          return;
      }
      this.pickerType = this.pickerType.toLowerCase();
  }

  _onShowRangesChange() {
      if (this.pickerType == "daterange") {
          this.async(function () {
              let picker = this.$$('pebble-date-picker');
              picker.showRanges = this.showRanges;
          }, 600); //Delayed to find the picker
      }
  }

  _isDateRange() {
      if (this.pickerType == "daterange") {
          return true;
      }
      return false;
  }
  /**
   * Set date for the calendar
   */
  setDate(date) {
      this.$$('pebble-date-picker').setDate(date);
  }
  /**
   * Set range type to date picker
   */
  setRangeType(rangeType) {
      this.$$('pebble-date-picker').setRangeType(rangeType);
  }
  /**
   *  Can be used to display the date and time picker.
   */
  show(doNotSetTarget) {
      this.noOverlap = this._noOverlap //Alwaya noOverlap as true
      this.open(); //IronOverlayBehavior to display popover
      if (!doNotSetTarget) {
          let scope = dom(this).getOwnerRoot();
          let target = dom(scope).querySelector('#' + this.for);
          this.positionTarget = target;
      }
      this._refitPopover();
  }
  /**
   *  Can be used to hide or close the date and time picker.
   */
  hide() {
      this.close();
  }
  /**
   * Can be used to format the datetime.
   */
  _getDateTimeByFormat(datetimevalue) {
      if (!datetimevalue) {
          return moment(this.text).format(this.datetimeFormat);
      } else {
          return moment(datetimevalue).format(this.datetimeFormat);
      }
  }
  /**
   * Can be used to format the date.
   */
  _getDateByFormat(datevalue) {
      if (!datevalue) {
          return moment(this._date).format(this.dateFormat);
      } else {
          return moment(datevalue).format(this.dateFormat);
      }
  }
  /**
   * Can be used to format the time.
   */
  _getTimeByFormat(timevalue) {
      if (!timevalue) {
          return moment(this._time, this._defaultTimeFormat).format(this.timeFormat);
      } else {
          return moment(timevalue, this._defaultTimeFormat).format(this.timeFormat);
      }
  }
  /**
   * Can be used to fix the overlay picker postion on scroll or on the resize.
   */
  _fixPickerOnScrollAndResize() {
      if (currentDateTimePicker == null) {
          return;
      }
      currentDateTimePicker._refitPopover();
  }
  /**
   * Fired when the datetimepicker is opened.
   */
  _datetimePickerOpened() {
      if (currentDateTimePicker && currentDateTimePicker != this) {
          IronDropdownScrollManager.removeScrollLock(currentDateTimePicker);
          currentDateTimePicker.close();
      }
      currentDateTimePicker = this;
      IronDropdownScrollManager.pushScrollLock(this);
      if (this.pickerType == "daterange") {
          if (!this.startDateText) {
              if (this.attributeValuesExistsSearchEnabled) {
                  this._startDate = null;
              } else {
                  this._startDate = new Date(moment(new Date()).format(this._defaultDateFormat));
              }
          } else {
              this._startDate = new Date(moment(this.startDateText, this.dateFormat).format(this._defaultDateFormat));
          }
          if (!this.endDateText) {
              this._endDate = null;
          } else {
              this._endDate = new Date(moment(this.endDateText, this.dateFormat).format(this._defaultDateFormat));
          }
          this._refitCalendar();
      } else if (this.pickerType == "datetime") {
          this._isDateTime = true;
          if (!this.text) {
              this._date = new Date();
          } else {
              this._date = new Date(moment(this.text, this.datetimeFormat).format(this._defaultDateTimeFormat));
          }
          this._time = moment(this._date).format(this._defaultTimeFormat);
          this._refitCalendar();
      } else if (this.pickerType == "date") {
          this._isDate = true;
          if (!this.text) {
              this._date = new Date();
          } else {
              this._date = new Date(moment(this.text, this.dateFormat).format(this._defaultDateFormat));
          }
          this._refitCalendar();
      } else {
          this._time = this.text ? moment(this.text, this.timeFormat).format(this._defaultTimeFormat) :
              moment(this._date).format(this._defaultTimeFormat);
      }
      //Show Date/Time as per pickerType
      if (this.pickerType == "time") {
          this._showTime = true;
          this._isTime = true;
      } else {
          this._showTime = false;
      }

  }
  /*
   * Fired when the datetimepicker is closed.
   */
  _datetimePickerClosed() {
      if (currentDateTimePicker.opened) {
          return;
      }

      IronDropdownScrollManager.removeScrollLock(currentDateTimePicker);
      currentDateTimePicker = null;
  }
  /*
   *  Can be used to reset the position of the date and time picker.
   */
  _refitPopover() {
      this.refit();
  }
  /*
   *  Can be used to select a date on clicking the `OK` button.
   */
  _onDateSelect() {
      if (this.pickerType == "date") {
          if (!this.invalid) {
              this.text = this._getDateByFormat(this._date);
              this._setDateTimeComponents();
              this.close();
          }
      } else {
          this._showTime = true;
          //Set hours clock as default on date select
          this._timePicker = this._timePicker || this.shadowRoot.querySelector("#timePicker");
          if (this._timePicker) {
              this._timePicker.view = "hours";
          }
          if (!this.value && this.defaultTime) {
              this._time = this.defaultTime;
          }
          this._refitTimePickerClock(this);
          this._refitCalendar();
      }
  }
  _onDateRangeSelect() {
      if (!this.invalid) {
          //Set end date as start date when end date is null/undefined
          if (!this._endDate && this._startDate) {
              this._endDate = this._startDate;
          }

          this.startDateText = this._getDateByFormat(this._startDate);
          this.endDateText = this._getDateByFormat(this._endDate);

          this.startDateValue = moment(this._startDate).startOf("day").format(this._isoDateTimeFormat); //Start of the day
          this.endDateValue = moment(this._endDate).endOf("day").format(this._isoDateTimeFormat); //End of the day

          this.fire('date-range-selected');
          this.close();
      }
  }
  /**
   * Can be used to refit the clock selectors.
   */
  _refitTimePickerClock(picker) {
      // this.async(function () {
      //     if(this.$$("pebble-time-picker") && this.$$("pebble-time-picker").$$('pebble-clock-selector')) {
      //         this.$$("pebble-time-picker").$$('pebble-clock-selector').notifyResize();
      //     }
      // }.bind(this), 150);
  }
  _refitCalendar() {
      // this.async(function(){
      //         if(this.$$("pebble-date-picker") && this.$$("pebble-date-picker").$$('pebble-calendar')) {
      //             this.$$("pebble-date-picker").$$('pebble-calendar').notifyResize();
      //         }
      // }, 150);
  }
  /**
   *  Fired when time selection is cancelled.
   */
  _onTimeCancel() {
      if (this.pickerType == "time") {
          this.close();
      } else {
          this._showTime = false;
          this._refitCalendar();
      }
  }
  /*
   *  Can be used to select the time on clicking `OK` button.
   */
  _onTimeSelect() {
      if (this.pickerType == "datetime") {
          let parseTime = this._parseTime(this._time);
          this._date.setHours(parseTime.hour);
          this._date.setMinutes(parseTime.minute);
          this._date.setSeconds(parseTime.second);
          this._date = new Date(this._date);
          this._datetime = this._date;
          if (this.invalid) {
              return;
          }
          this.text = this._date;
      } else if (this.pickerType == "time") {
          if (this.invalid) {
              return;
          }
          this.text = this._getTimeByFormat();
      }
      this._setDateTimeComponents();
      this.close();
  }
  /**
   * Can be used to set readonly datetime components.
   */
  _setDateTimeComponents() {
      let datetime = null;
      if (this.pickerType == "datetime") {
          datetime = this.text;
          this.text = this._getDateTimeByFormat();
      } else if (this.pickerType == "date") {
          datetime = new Date(moment(this._date).format(this._defaultDateFormat));
      } else {
          let date = new Date();
          let parseTime = this._parseTime(this._time); //For 24 hours window                
          date.setHours(parseTime.hour);
          date.setMinutes(parseTime.minute);
          date.setSeconds(parseTime.second);
          datetime = new Date(date);
      }
      this.dateValue = this._getDateByFormat(datetime);
      this.timeValue = this._getTimeByFormat(datetime);
      this.utcValue = moment(datetime).utc().format(this._utcDateTimeFormat);
      let isoFormat = this.pickerType == "datetime" ? this._isoDateTimeFormat : this._isoDateFormat;
      this.value = moment(datetime).format(isoFormat);
  }
  _onCalendarDayTap(e, detail, sender) {
      if (!this.showButtons && currentDateTimePicker == this) {
          this.async(function () {
              this._onDateSelect();
          }, 150); //Delayed to avoid oval shape
      }
  }
  /**
   * Provides hours, minutes and seconds as an object properties
   */
  _parseTime(timeString) {
      let pattern =
          /^\s*(\d{1,2})[:.-]?(\d{2})([:.-]?(\d{2}))?(\s*([AaPp])\.?[Mm]\.?|[A-Z])?\s*$/;
      let match = timeString.match(pattern);
      if (!match) {
          //warn('Invalid time:', timeString);
          return 'Invalid Time';
      }
      let hour = parseInt(match[1]);
      let minute = parseInt(match[2]);
      let second = match[4] ? parseInt(match[4]) : 0;
      let period = match[6] ? (match[6][0].toUpperCase() + 'M') : 'AM';
      if (period === 'PM' && hour < 12) {
          hour = (hour + 12) % 24;
      } else if (period === 'AM' && hour === 12) {
          hour = 0;
      }
      return {
          hour: hour.toString().length == 2 ? hour : '0' + hour,
          minute: minute.toString().length == 2 ? minute : '0' + minute,
          second: second.toString().length == 2 ? second : '0' + second
      };
  }
  _onDateChange() {
      this._inputDate = moment(this._date).format(this.dateFormat);
  }
  _onInputDateChange() {
      if (!this._inputDate || !this._date) {
          this._inputDate = moment(this._date).format(this.dateFormat);
      }

      let input = new Date(moment(this._inputDate, this.dateFormat).format(this._defaultDateFormat));
      if (input != 'Invalid date' && this._inputDate != moment(this._date).format(this.dateFormat)) {
          this._date = new Date(moment(this._inputDate, this.dateFormat));
      }
      this.async(function () {
          this._onDateSelect();
      }, 300); //Delayed to avoid oval shape            
  }
  _onTimeChange() {
      this._inputTime = this._getTimeByFormat(this._time);
  }
  _onInputTimeChange() {

      //Change the given time to default format for further process
      let _timeObj = this._parseTime(this._inputTime);
      if (this._inputTime && _timeObj != 'Invalid Time') {
          //Populating time from object
          this._time = _timeObj.hour + ":" + _timeObj.minute + ":" + _timeObj.second + " " + this
              ._inputTime.split(' ')[1];
      }

      this._inputTime = this._getTimeByFormat(this._time);
      this._onTimeSelect();
  }
  _showInputByPicker(inputType) {
      if ((inputType == 'date' && (this.pickerType == 'datetime' || this.pickerType == 'date')) ||
          (inputType == 'time' && (this.pickerType == 'datetime' || this.pickerType == 'time'))) {
          return true;
      }

      return false;
  }
  _onToggleButtonChange(toggleState) {
      this._toggleButtonText = toggleState ? "Has Value" : "Has No Value";
  }
}
customElements.define(PebbleDatetimePickerOverlay.is, PebbleDatetimePickerOverlay)
