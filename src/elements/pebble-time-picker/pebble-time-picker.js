/**

`pebble-time-picker` Represents an element that provides a responsive time-picker 
 based on the material design specification.

### Example

A default time-picker:

    <pebble-time-picker></pebble-time-picker>

Setting the initial time to 10:10AM. Note that hours is given in the 24-hour format.

    <pebble-time-picker time="10:10am"></pebble-time-picker>

If you include this element as part of `paper-dialog`, use the class
`"pebble-time-picker-dialog"` on the dialog in order to give it a proper styling.

    <paper-dialog id="dialog" modal class="pebble-time-picker-dialog"
      on-iron-overlay-closed="dismissDialog">
      <pebble-time-picker id="timePicker" time="[[time]]"></pebble-time-picker>
      <div class="buttons">
        <paper-button dialog-dismiss>Cancel</paper-button>
        <paper-button dialog-confirm>OK</paper-button>
      </div>
    </paper-dialog>

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--default-primary-color` | Apply color to clock hand and heading | ``
`--pebble-time-picker-heading-color` | Mixins applied for heading color | {}
`--pebble-time-picker` | Mixins applied for default time picker | {}
`--pebble-time-picker-heading` | Mixins applied for default time picker heading | {}
`--pebble-time-picker-narrow` | Mixins applied to time picker [narrow] | {}
`--pebble-time-picker-heading-narrow` | Mixins applied to time picker heading [narrow] | {}
`--text-primary-color` | Selected elements text color in time picker | ``
`--pebble-time-picker-selected` | Mixins applied for selected elements at heading | {}
`--pebble-font-subhead` | Mixins applied for period | {}
`--pebble-time-picker-heading-period` | Mixins applied to heading period [narrow] | {}
`--pebble-time-picker-heading-time` | Mixins applied to heading time | {}
`--pebble-time-picker-clock` | Mixins applied for clock | {}

### Accessibility

See the docs for `Polymer.IronResizableBehavior` for accessibility features implemented by this element.

@group Pebble Elements
@element pebble-time-picker
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/iron-media-query/iron-media-query.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/neon-animation/neon-animated-pages.js';
import '@polymer/neon-animation/neon-animatable.js';
import '@polymer/neon-animation/animations/fade-in-animation.js';
import '@polymer/neon-animation/animations/fade-out-animation.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import './pebble-clock-selector.js';
import './pebble-time-picker-dialog-style.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleTimePicker extends
    mixinBehaviors([IronResizableBehavior], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="pebble-time-picker-dialog-style">
            :host * {
                -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
            }

            :host {
                display: block;
                background-color: var(--primary-background-color);
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -khtml-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                @apply --pebble-font-body1;
                font-size: var(--default-font-size, 14px);
            }

            /** Landscape ******************/

            #timePicker {
                width: 512px;
                height: 304px;
                @apply --layout-horizontal;
                @apply --pebble-time-picker;
            }

            #heading {
                width: 168px;
                padding: 16px;
                @apply --layout-vertical;
                @apply --pebble-time-picker-heading;
            }

            :host([enable-seconds]) #heading {
                width: 200px;
            }

            #clockArea {
                padding: 20px;
            }

            /** Narrow *********************/

            :host([narrow]) #timePicker {
                width: 328px;
                height: 428px;
                @apply --layout-vertical;
                @apply --pebble-time-picker-narrow;
            }

            :host([narrow]) #heading {
                width: auto;
                height: 96px;
                padding: 0 48px;
                @apply --layout-horizontal;
                @apply --layout-end-justified;
                @apply --pebble-time-picker-heading-narrow;
            }

            :host([enable-seconds][narrow]) #heading {
                padding: 10px 15px;
            }

            :host([narrow]) #heading .time {
                margin-top: 0;
                @apply --pebble-font-display3;
            }

            :host([narrow]) #timePicker #heading .time {
                font-size: 60px;
                letter-spacing: .1ex !important;
                @apply --pebble-time-picker-heading-time;
            }

            :host([narrow]) #heading .period {
                margin-left: 12px;
                @apply --pebble-time-picker-heading-period;
            }

            :host([narrow]) #clockArea {
                /* padding: 30px 20px 10px 20px; */
                padding: 10px;
                @apply --pebble-time-picker-clock;
            }

            /** Heading ********************/

            #heading {
                box-sizing: border-box;
                color: var(--white, #fff);
                background: var(--primary-button-color, #139de6)!important;
                @apply --layout-vertical;
                @apply --layout-center-center;
                @apply --pebble-time-picker-heading-color;
            }

            #heading .time {
                @apply --pebble-font-display2;
                @apply --layout-horizontal;
                @apply --layout-end-justified;
                width: 5.34ex;
                letter-spacing: .13ex !important;
            }

            :host([enable-seconds]) #heading .time {
                width: 8.5ex;
                font-size: 40px;
            }

            #heading .iron-selected {
                color: var(--text-primary-color);
                @apply --pebble-time-picker-selected;
            }

            #heading .period {
                font-weight: 600;
                font-size: var(--font-size-sm, 12px);
                @apply --pebble-font-subhead;
            }

            #heading .time div,
            #heading .period div {
                cursor: pointer;
            }

            /** Clock *********************/

            #clockArea {
                background: var(--default-background-color);
                overflow: hidden;
                @apply --layout-flex;
                @apply --pebble-time-picker-clock;
                @apply --layout-vertical;
            }

            #clockArea>div {
                @apply --layout-flex;
                position: relative;
            }

            .clock {
                @apply --layout-fit;
            }

            .clock-animatable {
                @apply --layout-fit;
            }
        </style>
        <iron-media-query query="{{_getMediaQuery(forceNarrow, responsiveWidth)}}" query-matches="{{_queryMatches}}"></iron-media-query>
        <div id="timePicker">
            <div id="heading">
                <iron-selector class="time" selectable="[name]" attr-for-selected="name" selected="{{view}}">
                    <div name="hours" class="hour">{{hour12}}</div>
                    <div class="sep">:</div>
                    <div name="minutes" class="minute">{{_zeroPad(minute, 2)}}</div>
                    <template is="dom-if" if="[[ enableSeconds ]]">
                        <div class="sep">:</div>
                        <div name="seconds" class="second">{{_zeroPad(second, 2)}}</div>
                    </template>
                </iron-selector>
                <iron-selector class="period" attr-for-selected="name" selected="{{period}}">
                    <div name="AM">AM</div>
                    <div name="PM">PM</div>
                </iron-selector>
            </div>
            <div id="clockArea">
                <div>
                    <neon-animated-pages id="pages" class="clock-animatable" attr-for-selected="name" selected="{{view}}" entry-animation="fade-in-animation" exit-animation="fade-out-animation">
                        <neon-animatable class="clock-animatable" name="hours">
                            <pebble-clock-selector class="clock" id="hourClock" count="12" step="1" animated="[[animated]]" selected="{{hour12}}"></pebble-clock-selector>
                        </neon-animatable>
                        <neon-animatable class="clock-animatable" name="minutes">
                            <pebble-clock-selector class="clock" id="minuteClock" count="60" step="5" animated="[[animated]]" use-zero="" zero-pad="" selected="{{minute}}"></pebble-clock-selector>
                        </neon-animatable>
                        <template is="dom-if" if="[[ enableSeconds ]]">
                            <neon-animatable class="clock-animatable" name="seconds">
                                <pebble-clock-selector class="clock" id="secondClock" count="60" step="5" animated="[[animated]]" use-zero="" zero-pad="" selected="{{second}}"></pebble-clock-selector>
                            </neon-animatable>
                        </template>
                    </neon-animated-pages>
                </div>
    </div></div>
`;
  }

  static get is() {
      return "pebble-time-picker";
  }

  static get properties() {
      return {
          /**
           *  Specifies whether or not seconds are enabled.
           */
          enableSeconds: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates the selected time.
           */
          time: {
              type: String,
              value: '00:00',
              notify: true,
              observer: '_timeChanged'
          },

          /**
           * Specifies the time value as number of minutes from midnight. 
           * If the attribute `enableSeconds` is set, it specifies the time value as the number of seconds from midnight. 
           */
          rawValue: {
              type: Number,
              value: 0,
              notify: true,
              observer: '_rawValueChanged'
          },

          /**
           * Indicates the current time. Note that hours is given in the 24-hour format.
           * The allowed value are in the range from 0 to 24.
           */
          hour: {
              type: Number,
              observer: '_hourChanged',
              notify: true,
              value: 0
          },

          /**
           * Indicates the current time. Note that hours is given in the 12-hour format.
           * The allowed values are in the range from 0 to 12.
           */
          hour12: {
              type: Number,
              notify: true,
              observer: '_hour12Changed'
          },

          /**
           * Indicates the current time as number of minutes. The allowed values are in the range from 0 to 59.
           */
          minute: {
              type: Number,
              notify: true,
              observer: '_minuteChanged',
              value: 0
          },

          /**
           * Indicates the current time as number of seconds.The allowed values are in the range from 0 to 59.
           */
          second: {
              type: Number,
              notify: true,
              observer: '_secondChanged',
              value: 0
          },

          /**
           * Indicates the current period. The allowed values are 'AM' and 'PM'.
           *                  
           */
          period: {
              type: String,
              notify: true,
              observer: '_periodChanged',
              value: 'AM'
          },

          /**
           * Specifies the current selector view. The allowed values are 'hours' or 'minutes'.
           *                  
           */
          view: {
              type: String,
              notify: true,
              value: 'hours',
              observer: '_viewChanged'
          },

          /**
           * Specifies the maximum screen width at which the picker uses a vertical layout.
           */
          responsiveWidth: {
              type: String,
              value: '560px'
          },

          /**
           * Specifies the force narrow layout.
           */
          forceNarrow: {
              type: Boolean,
              value: false
          },

          /**
           * Specifies whether or not to animate the clock hand between the selections.
           */
          animated: {
              type: Boolean,
              value: false
          },

          /**
           * Specifies whether or not narrow specific styles is applied.
           */
          narrow: {
              type: Boolean,
              reflectToAttribute: true,
              value: false,
              notify: true,
          },

          _isTouch: {
              type: Boolean,
              value: false,
              reflectToAttribute: true
          },

          _queryMatches: {
              type: Boolean,
              value: false,
              observer: '_computeNarrow'
          }
      };
  }

  static get observers() {
      return [
          '_updateTime(hour, minute, second)'
      ];
  }

  constructor() {
      super();
  }

  connectedCallback() {
      super.connectedCallback();

      this.addEventListener("iron-resize", this._resizeHandler);
      this.addEventListener("pebble-clock-selected", this._onClockSelected);
  }

  disconnectedCallback() {
      super.disconnectedCallback();

      this.removeEventListener("iron-resize", this._resizeHandler);
      this.removeEventListener("pebble-clock-selected", this._onClockSelected);
  }

  ready() {
      super.ready();

      this._isTouch = 'ontouchstart' in window;
      this.view = 'hours';
  }

  _timeChanged(time) {
      if (!time) {
          this.rawValue = 0;
          return;
      }

      let parsed = this.parseTime(time);
      let cleanedTime = this.formatTime(parsed.hour, parsed.minute, parsed.second);
      if (cleanedTime !== time) {
          this.time = cleanedTime;
          return;
      }
      let rawValue = (parsed.hour * 60) + parsed.minute;
      if (this.enableSeconds) {
          rawValue = (rawValue * 60) + parsed.second;
      }
      this.rawValue = rawValue;
  }

  _updateTime(hour, minute, second) {
      if (!(hour === undefined || minute === undefined || second === undefined)) {
          let rawValue = (hour * 60) + minute;
          if (this.enableSeconds) {
              rawValue = (rawValue * 60) + second;
          }
          this.rawValue = rawValue;
      }
  }

  /**
   * Can be used to provide the formatted time as a string.
   */
  formatTime(hour, minute, second) {
      let period = (hour % 24) < 12 ? 'AM' : 'PM';
      hour = hour % 12 || 12;
      minute = ('0' + minute).substr(-2);
      second = ('0' + second).substr(-2);
      if (this.enableSeconds) {
          minute += ':' + second;
      }
      return hour + ':' + minute + ' ' + period;
  }

  /**
   * Can be used to provides hours, minutes, and seconds as an object properties.
   */
  parseTime(timeString) {
      let pattern = /^\s*(\d{1,2}):?(\d{2})(:?(\d{2}))?(\s*([AaPp])\.?[Mm]\.?|[A-Z])?\s*$/;
      let match = timeString.match(pattern);
      if (!match) {
          console.warn('Invalid time:', timeString);
          return;
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
      return { hour: hour, minute: minute, second: second };
  }

  /**
   * Can be used to toggle the period btween AM or PM.
   */
  togglePeriod() {
      this.period = (this.period === 'AM') ? 'PM' : 'AM';
  }

  _rawValueChanged(value, oldValue) {
      if (isNaN(parseInt(value))) {
          this.rawValue = oldValue;
          return;
      }
      if (this.enableSeconds) {
          this.hour = Math.floor(value / 3600);
          this.minute = Math.floor(value / 60) % 60;
          this.second = value % 60;
      } else {
          this.hour = Math.floor(value / 60);
          this.minute = value % 60;
          this.second = 0;
      }
      this.time = this.formatTime(this.hour, this.minute, this.second);
  }

  _hour12Changed(hour12) {
      let add = (this.period === 'PM' ? 12 : 0);
      this.hour = ((hour12 % 12) + add) % 24;
  }

  _hourChanged(hour, oldValue) {
      hour = parseInt(hour);
      if (isNaN(hour) && !hour) {
          return;
      }
      
      if (isNaN(hour)) {
          console.warn('Invalid number:', hour);
          this.hour = oldValue;
          return;
      }
      hour = parseFloat(hour) % 24;
      this.hour = hour;
      this.hour12 = this._twelveHour(hour);
      this.period = ['PM', 'AM'][+(hour < 12)];
  }

  _minuteChanged(minute) {
      minute = parseFloat(minute) % 60;
      this.minute = minute;
  }

  _secondChanged(second) {
      second = parseFloat(second) % 60;
      this.second = second;
  }

  _periodChanged(period) {
      if (isNaN(parseInt(this.hour)) || isNaN(parseInt(this.minute))) {
          return;
      }
      if (period === 'AM' && this.hour >= 12) {
          this.hour -= 12;
      } else if (period === 'PM' && this.hour < 12) {
          this.hour += 12;
      }
  }

  _zeroPad(value, length) {
      if (value === undefined || isNaN(value) || isNaN(length)) {
          return;
      }
      return ('0' + value).substr(-length);
  }

  _twelveHour(hour) {
      return hour % 12 || 12;
  }

  _isEqual(a, b) {
      return a === b;
  }

  _getMediaQuery(forceNarrow, responsiveWidth) {
      return '(max-width: ' + (forceNarrow ? '' : responsiveWidth) + ')';
  }

  _computeNarrow() {
      this.set('narrow', this._queryMatches || this.forceNarrow);
  }

  _viewChanged(toView, fromView) {
      this.$.pages._notifyPageResize();

      // prevent the clock-hand transition when selecting, otherwise the 
      // extra movement would be confusing
      if (this._selecting || !fromView || !toView || !this.animated) {
          return;
      }

      let clocks = { 'hours': this.$.hourClock, 'minutes': this.$.minuteClock, 'seconds': this.$.secondClock };
      let from = clocks[fromView];
      let to = clocks[toView];
      let fromAngle = (360 / from.count) * from.selected;
      let toAngle = (360 / to.count) * to.selected;

      // transition both clock hands at the same time
      to.setClockHand(fromAngle, false);
      from.setClockHand(toAngle);

      microTask.run(() => {
          to.setClockHand(toAngle, true, function () {
              setTimeout(() => {
                  from.setClockHand(fromAngle, false);
              }, 200);
          }.bind(this));
      });
  }

  _onClockSelected(event) {
      if (this.view === 'hours') {

          let showMinutes = function () {
              this.async(function () {
                  this._selecting = true;
                  this.view = 'minutes';
                  this._selecting = false;
              }.bind(this), 100);
              this.$.hourClock.removeEventListener('pebble-clock-transition-end', showMinutes);
          }.bind(this);

          if (event.detail.animated) {
              this.$.hourClock.addEventListener('pebble-clock-transition-end', showMinutes);
          } else {
              showMinutes();
          }

          if (this.hour12 !== event.detail.value) {
              this.hour12 = event.detail.value;
          } else {
              // show minutes if same hour is selected
              showMinutes();
          }
      } else if (this.view === 'minutes' && this.enableSeconds) {
          let showSeconds = function () {
              this.async(function () {
                  this._selecting = true;
                  this.view = 'seconds';
                  this._selecting = false;
              }.bind(this), 100);
              this.$.minuteClock.removeEventListener('pebble-clock-transition-end', showSeconds);
          }.bind(this);

          if (event.detail.animated) {
              this.$.minuteClock.addEventListener('pebble-clock-transition-end', showSeconds);
          } else {
              showSeconds();
          }

          if (this.minute !== event.detail.value) {
              this.minute = event.detail.value;
          } else {
              // show seconds if same minute is selected
              showSeconds();
          }
      }
  }

  _resizeHandler() {
      if (!this.offsetWidth || this._resizing) {
          return;
      }
      this.updateStyles();
      microTask.run(() => {
          this._resizing = true;
          this.$.pages._notifyPageResize();
          this._resizing = false;
      });
  }
}

customElements.define(PebbleTimePicker.is, PebbleTimePicker);
