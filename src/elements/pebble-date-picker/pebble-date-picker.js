/**
`<pebble-datetime-picker>` Represents an element that provides the date and date-range selection.

### Example

    <template is="dom-bind">        
        <pebble-date-picker id="picker"
                            date="{{date}}"
                            is-range
                            show-ranges
                            heading-format="ddd, MMM DD YYYY"
                            start-date="{{startDate}}"
                            end-date="{{endDate}}"></pebble-date-picker>        
        <p>Start Date: {{startDate}}</p>
        <p>End Date: {{endDate}}</p>        
    </template>

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--pebble-ls-date-picker` | Mixin applied to date picker with landscape layout | {}
`--pebble-ls-date-range-picker` | Mixin applied to date range picker with landscape layout | {}
`--pebble-ls-date-showranges-picker` | Mixin applied to date range picker with range types in landscape layout | {} 
`--pebble-ls-date-picker-heading` | Mixin applied to date picker heading with landscape layout | {}
`--pebble-nw-date-picker` | Mixin applied to date picker with narrow layout | {}
`--pebble-nw-date-range-picker` | Mixin applied to date range picker with narrow layout | {}
`--pebble-nw-date-picker-heading` | Mixin applied to date picker heading with narrow layout | {}
`--pebble-common-date-picker-heading` | Mixin applied to date picker heading | {}
`--pebble-date-picker-head-date` | Mixin applied to date picker heading date | {}
`--pebble-date-picker-head-year` | Mixin applied to date picker heading year | {}
`--pebble-date-picker-calendar` | Mixin applied to date picker calendar | {}
`--pebble-date-picker-range-calendar` | Mixin applied to date range picker calendar | {}
`--pebble-date-picker-range-calendar-month-nav` | Mixin applied to range calender month navigation | {}
`--pebble-date-picker-calendar-weekdays` | Mixin applied to calendar weekdays | {}
`--pebble-date-picker-calendar-day-selected` | Mixin applied to calendar selected day | {}
`--pebble-date-picker-day-item-selected-day` | Mixin applied to calendar selected day text | {}
`--pebble-date-picker-day-item-range` | Mixin applied to calender selected range | {}
`--pebble-date-picker-calendar-today` | Mixin applied to calendar today | {}
`--pebble-date-picker-day-item` | Mixin applied to calendar days | {}
`--pebble-date-picker-yearlist` | Mixin applied to date picker yearlist | {}
`--pebble-date-picker-yearlist-selected` | Mixin applied to date picker selected year | {} 
`--pebble-date-picker-body-monthyear` | Mixin applied to calendar month | {}
`--pebble-range-button-group` | Mixin applied to the date picker range button group | {}
`--pebble-narrow-range-button-group` | Mixin applied to the narrow date picker range button group | {} 
`--pebble-range-button` | Mixin applied to the date picker range button | {}
`--pebble-range-button-selected` | Mixin applied to the date picker selected range button | {}
`--landscape-picker-width` | The width for date picker in landscape layout | 512px
`--narrow-picker-width` | The width for date picker in narrow layout | 328px
`--heading-date-font-size` | The font size for the date picker heading date | 15px
`--pebble-range-group-width` | The width for range group selection | 120px

@group Pebble Elements
@element pebble-date-picker
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-media-query/iron-media-query.js';
import '@polymer/neon-animation/neon-animated-pages.js';
import '@polymer/neon-animation/neon-animatable.js';
import '@polymer/neon-animation/animations/fade-in-animation.js';
import '@polymer/neon-animation/animations/fade-out-animation.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/paper-button/paper-button.js';
import '../bedrock-externalref-moment/bedrock-externalref-moment.js';
import '../pebble-vertical-divider/pebble-vertical-divider.js';
import './pebble-calendar.js';
import './pebble-date-picker-dialog-style.js';
import './pebble-year-list.js';
import '../pebble-button/pebble-button.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleDatePicker extends mixinBehaviors([IronResizableBehavior], PolymerElement) {
  static get template() {
    return html`
        <style include="pebble-date-picker-dialog-style">
            :host {
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -khtml-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                display: inline-block;
                color: var(--primary-text-color);
                @apply --paper-font-body1;
            }

            /** Landscape ******************/

            #datePicker {
                width: var(--landscape-picker-width, 512px);
                height: var(--landscape-picker-height, 248px);
                @apply --layout-horizontal;
                @apply --pebble-ls-date-picker;
            }

            :host([is-range]) #datePicker {
                width: var(--landscape-range-picker-width, 675px);
                height: var(--landscape-range-picker-height, 248px);
                @apply --layout-horizontal;
                @apply --pebble-ls-date-range-picker;
            }

            :host([is-range][show-ranges]) #datePicker {
                width: var(--landscape-showranges-picker-width, 780px);
                height: var(--landscape-showranges-picker-height, 285px);
                @apply --layout-horizontal;
                @apply --pebble-ls-date-showranges-picker;
            }

            #heading {
                width: 168px;
                background: var(--primary-button-color, #139de6)!important;
                @apply --pebble-ls-date-picker-heading;
            }

            /** Narrow *********************/

            :host([_narrow]) #datePicker {
                width: var(--narrow-picker-width, 328px);
                height: var(--narrow-picker-height, 428px);
                @apply --layout-vertical;
                @apply --pebble-nw-date-picker;
            }

            :host([_narrow][is-range]) #datePicker {
                width: var(--narrow-range-picker-width, 500px);
                height: var(--narrow-range-picker-height, 428px);
                @apply --layout-vertical;
                @apply --pebble-nw-date-range-picker;
            }

            :host([_narrow]) #heading {
                width: auto;
                height: 56px;
                padding: 10px 15px;
                @apply --pebble-nw-date-picker-heading;
            }

            /** Heading ********************/

            #heading {
                padding: 16px;
                box-sizing: border-box;
                background: var(--default-primary-color);
                @apply --layout-vertical;
                @apply --layout-around-justfied;
                @apply --pebble-common-date-picker-heading;
            }

            #heading .date,
            #heading .year {
                cursor: pointer;
            }

            #heading .date {
                font-size: var(--heading-date-font-size, 15px);
                line-height: 30px;
                @apply --pebble-date-picker-head-date;
            }

            #heading div.date {
                letter-spacing: 0.025em;
            }

            #heading .date span {
                white-space: nowrap;
                overflow: hidden;
            }

            #heading .year {
                @apply --paper-font-body2;
                font-size: var(--font-size-md, 16px);
                line-height: 18px;
                @apply --pebble-date-picker-head-year;
            }

            #heading:not(.pg-chooseYear) .year,
            #heading.pg-chooseYear .date {
                color: var(--white, #fff);
            }

            /** Calendar/Year picker ********/

            :host([_isTouch]) paper-year-list::-webkit-scrollbar {
                width: 0 !important;
            }

            #pages {
                @apply --layout-flex;
                width: auto;
                background: var(--default-background-color);
            }

            .range-group {
                width: var(--pebble-range-group-width, 92px);
                margin-top: 20px;
                text-align: center;
                @apply --pebble-range-button-group;
            }

            .range-group pebble-button {
                margin-bottom: 10px;
                font-size: var(--font-size-sm, 12px);
                min-width: 90px;
            }

            :host([_narrow][is-range][show-ranges]) .range-group {
                width: var(--pebble-range-group-width, 500px);
                margin-top: 0px;
                text-align: center;
                @apply --pebble-narrow-range-button-group;
            }

            #yearList {
                --pebble-yearlist-year: {
                    @apply --pebble-date-picker-yearlist;
                }

                --pebble-year-selected: {
                    @apply --pebble-date-picker-yearlist-selected;
                }
            }

            .range-group {
                width: var(--pebble-range-group-width, 92px);
                margin-top: 20px;
                text-align: center;
                @apply --pebble-range-button-group;
            }

            :host([_narrow][is-range][show-ranges]) .range-group {
                width: var(--pebble-range-group-width, 500px);
                margin-top: 0px;
                text-align: center;
                @apply --pebble-narrow-range-button-group;
            }

            pebble-vertical-divider {
                --pebble-vertical-divider-color: var(--divider-color);
                min-width: 2px;
                margin: 10px -2px;
                min-height: 18px;
            }
        </style>
        <iron-media-query query="{{_getMediaQuery(forceNarrow, _responsiveWidth)}}" query-matches="{{_queryMatches}}"></iron-media-query>
        <div id="datePicker">
            <div id="heading" class\$="{{_getHeadingClass('heading-content', _selectedPage)}}">
                <template is="dom-if" if="[[!isRange]]">
                    <div class="year" on-tap="_tapHeadingYear">{{_dateFormat(date, 'YYYY', _locale)}}</div>
                </template>
                <template is="dom-if" if="[[isRange]]">
                    <div class="year" on-tap="_tapHeadingYear">{{_dateFormat(startDate, 'YYYY', _locale)}}</div>
                </template>
                <div class="date" on-tap="_tapHeadingDate">
                    <template is="dom-if" if="[[!isRange]]">
                        <template is="dom-repeat" items="{{_splitHeadingDate(date, headingFormat, _locale)}}">
                            <span>{{item}}</span>
                        </template>
                    </template>
                    <template is="dom-if" if="[[isRange]]">
                        <div>[[_addSeperator(forceNarrow, startDate,"Start")]]&nbsp; </div>
                        <template is="dom-repeat" items="{{_splitHeadingDate(startDate, headingFormat, _locale)}}">
                            <span>{{item}}</span>
                        </template>
                        <div>[[_addSeperator(forceNarrow, endDate,"End")]]&nbsp; </div>
                        <template is="dom-repeat" items="{{_splitHeadingDate(endDate, headingFormat, _locale)}}">
                            <span>{{item}}</span>
                        </template>
                    </template>
                </div>
            </div>
            <neon-animated-pages id="pages" selected="{{_selectedPage}}" attr-for-selected="id" entry-animation="fade-in-animation" exit-animation="fade-out-animation" on-iron-select="_pageSelected">
                <neon-animatable id="chooseDate">
                    <pebble-calendar id="calendar" locale="{{_locale}}" date="{{date}}" min-date="{{minDate}}" max-date="{{maxDate}}" is-range="{{isRange}}" range-type="{{_rangeType}}" start-date="{{startDate}}" end-date="{{endDate}}" disable-calendar="[[disableCalendar]]">
                    </pebble-calendar>
                </neon-animatable>
                <neon-animatable id="chooseYear">
                    <pebble-year-list id="yearList" date="{{date}}" on-tap="_tapHeadingDate" min="[[_minYear]]" max="[[_maxYear]]">
                        
                </pebble-year-list></neon-animatable>
            </neon-animated-pages>
            <template is="dom-if" if="[[_showRanges(isRange, showRanges)]]">
                <div class="range-group">
                    <pebble-button on-tap="_tapApplyRangeType" data-args="today" class\$="[[_getRangeTypeClass('today', _rangeType)]] btn btn-primary" button-text="Today" disabled="[[disableCalendar]]"></pebble-button>
                    <pebble-button on-tap="_tapApplyRangeType" data-args="yesterday" class\$="[[_getRangeTypeClass('yesterday', _rangeType)]] btn btn-primary" button-text="Yesterday" disabled="[[disableCalendar]]"></pebble-button>
                    <pebble-button on-tap="_tapApplyRangeType" data-args="last7days" class\$="[[_getRangeTypeClass('last7days', _rangeType)]] btn btn-primary" button-text="Last 7 days" disabled="[[disableCalendar]]"></pebble-button>
                    <pebble-button on-tap="_tapApplyRangeType" data-args="last30days" class\$="[[_getRangeTypeClass('last30days', _rangeType)]] btn btn-primary" button-text="Last 30 days" disabled="[[disableCalendar]]"></pebble-button>
                    <pebble-button on-tap="_tapApplyRangeType" data-args="thismonth" class\$="[[_getRangeTypeClass('thismonth', _rangeType)]] btn btn-primary" button-text="This month" disabled="[[disableCalendar]]"></pebble-button>
                    <pebble-button on-tap="_tapApplyRangeType" data-args="lastmonth" class\$="[[_getRangeTypeClass('lastmonth', _rangeType)]] btn btn-primary" button-text="Last month" disabled="[[disableCalendar]]"></pebble-button>
                    <!--<pebble-button raised on-tap="_tapApplyRangeType" data-args="custom" class\$="[[_getRangeTypeClass('custom', rangeType)]]">Custom</pebble-button>-->
                </div>
            </template>
        </div>
`;
  }

  static get is() {
      return "pebble-date-picker";
  }

  static get properties() {
      return {
          /**
           * Indicates the selected date in the YYYY-MM-DD format.
           */
          date: {
              type: Date,
              notify: true
          },

          /**
           * Indicates the start date for the range picker.
           */
          startDate: {
              type: Date,
              notify: true
          },

          /**
           * Indicates an end date for the range picker.
           */
          endDate: {
              type: Date,
              notify: true,
              value: null
          },

          /**
           * Indicates the maximum screen width at which the picker uses a vertical layout.
           */
          _responsiveWidth: {
              type: String,
              value: '560px'
          },

          /**
           * Indicates the locale.
           */
          _locale: {
              type: String,
              value: 'en'
          },

          /**
           * Specifies the format of the date displayed in the heading.
           * See the documentation for Moment.js for more information.
           */
          headingFormat: {
              type: String,
              value: 'ddd, MMM D'
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
           * Indicates the force narrow layout.
           */
          forceNarrow: {
              type: Boolean,
              value: false
          },

          _narrow: {
              type: Boolean,
              reflectToAttribute: true,
              notify: true,
              computed: '_computeNarrow(forceNarrow, _queryMatches)'
          },

          _isTouch: {
              type: Boolean,
              value: false,
              readOnly: true,
              reflectToAttribute: true
          },

          _queryMatches: {
              type: Boolean,
              value: false
          },

          /**
           * Specifies the format for break character for date's heading.
           */
          headingBreak: {
              type: String,
              value: '[,]'
          },

          _selectedPage: String,

          _maxYear: {
              type: Number,
              computed: '_getFullYear(maxDate)'
          },

          _minYear: {
              type: Number,
              computed: '_getFullYear(minDate)'
          },

          /**
           * Specifies whether or not to show the ranges.
           */
          showRanges: {
              type: Boolean,
              reflectToAttribute: true,
              notify: true,
              value: false
          },

          /**
           * Specifies whether or not to allow the range selection in the date picker.
           */
          isRange: {
              type: Boolean,
              reflectToAttribute: true,
              notify: true,
              value: false,
              observer: '_onRangeChange'
          },

          /**
           * Specifies the range type for the range selection.
           * Allowed range types are today, yesterday, last7days, last30days, thismonth, lastmonth, and custom.
           */
          _rangeType: {
              type: String,
              value: null,
              observer: '_onRangeTypeChange'
          },

          disableCalendar: {
              type: Boolean,
              value: false,
          }

      }
  }

  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  ready() {
      super.ready();
      this.today = this.$.calendar.today;
      this._isTouch = 'ontouchstart' in window;
      this._selectPage('chooseDate');
  }

  connectedCallback() {
      super.connectedCallback();
      this.addEventListener("iron-resize", this._resizeHandler);
  }

  disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener("iron-resize", this._resizeHandler);
  }

  // When range property changes
  _onRangeChange() {
      if (this.$.calendar != undefined) {
          this.$.calendar.isRange = this.isRange;
      }
  }

  // Add seperator for range picker start and end dates
  _addSeperator() {
      if (this.forceNarrow) {
          if (arguments[1]) {
              return " - ";
          }
          return " - Select " + arguments[2] + " Date";
      } else {
          if (!arguments[1]) {
              return "Select " + arguments[2] + " Date";
          }
      }
  }

  // Set range picker start and end dates based on filter change
  _onRangeTypeChange() {
      if (this.isRange) {
          switch (this._rangeType) {
              case 'today': {
                  this.startDate = new Date();
                  this.endDate = null;
                  this.setDate(this.startDate);
                  break;
              }
              case 'yesterday': {
                  this.startDate = new Date(moment().subtract(1, 'day'));
                  this.endDate = null;
                  this.setDate(this.startDate);
                  break;
              }
              case 'last7days': {
                  this.startDate = new Date(moment().subtract(6, 'day'));
                  this.endDate = new Date();
                  this.setDate(this.startDate);
                  break;
              }
              case 'last30days': {
                  this.startDate = new Date(moment().subtract(29, 'day'));
                  this.endDate = new Date();
                  this.setDate(this.startDate);
                  break;
              }
              case 'thismonth': {
                  this.startDate = new Date(moment().startOf('month'));
                  this.endDate = new Date(moment().endOf('month'));
                  this.setDate(this.startDate);
                  break;
              }
              case 'lastmonth': {
                  this.startDate = new Date(moment().subtract(1, 'months').startOf('month'));
                  this.endDate = new Date(moment().subtract(1, 'months').endOf('month'));
                  this.setDate(this.startDate);
                  break;
              }
              case 'custom': {
                  this.startDate = new Date();
                  this.endDate = null;
                  this.setDate(this.startDate);
                  break;
              }
          }
      }
  }

  /**
   * Set date to the calendar
   */
  setDate(date) {
      if (date && date != "Invalid Date") {
          //this is just to focus the right calendar
          this.date.setDate(date.getDate());
          this.date.setMonth(date.getMonth());
          this.date.setYear(date.getFullYear());

          //Notify the change
          let _date = this.date;
          this.date = null;
          this.date = _date;
      }
  }

  /**
   * Can be used to set the range type to the date picker
   */
  setRangeType(rangeType) {
      this._rangeType = rangeType;
  }

  // Apply range type as per range option button on tap
  _tapApplyRangeType(e) {
      this._rangeType = e.target.getAttribute('data-args');
  }

  // Show range types for range picker
  _showRanges() {
      if (this.isRange && this.showRanges) {
          return true;
      }

      return false;
  }

  // Apply class on button as per range type button click
  _getRangeTypeClass(value) {
      if (this._rangeType == value) {
          return 'selected';
      }

      return '';
  }

  // Returns date as per format
  _dateFormat() {
      return this.$.calendar.dateFormat.apply(this.$.calendar, arguments);
  }

  // When tap heading date
  _tapHeadingDate() {
      if (this.disableCalendar) {
          return;
      }
      if (this.$.pages.selected !== 'chooseDate') {
          this._selectPage('chooseDate');
      } else {
          // tapping the date header while already viewing months brings you back
          // to the selected month
          this.$.calendar.currentMonth = this.date.getMonth() + 1;
          this.$.calendar.currentYear = this.date.getFullYear();
      }
  }

  // When tap heading year
  _tapHeadingYear() {
      if (this.disableCalendar) {
          return;
      }
      if (this.$.pages.selected !== 'chooseYear') {
          this._selectPage('chooseYear');
          this.$.yearList.centerSelected();
      }
  }

  // Sets the selected page
  _selectPage(page) {
      this.$.pages.selected = page;
  }

  // Returns style of narrow display
  _getMediaQuery(forceNarrow, _responsiveWidth) {
      return '(max-width: ' + (forceNarrow ? '' : _responsiveWidth) + ')';
  }

  // Get picker heading class
  _getHeadingClass(pfx, selectedPage) {
      return pfx + ' pg-' + selectedPage;
  }

  // Get full year
  _getFullYear(date) {
      return date ? date.getFullYear() : null;
  }

  // Splits heading date as per the break character
  _splitHeadingDate(date, format, locale) {
      let re = new RegExp(this.headingBreak, 'g');
      let text = this._dateFormat(date, format, locale);
      let seps = text.match(re);
      let value;
      if (!seps) {
          value = [text];
      } else {
          value = text.split(re).map(function (s, i) {
              return s + (seps[i] || '');
          });
      }
      return value;
  }

  // Display picker in narrow as per view query or force narrow 
  _computeNarrow(queryMatches, forceNarrow) {
      return queryMatches || forceNarrow;
  }

  // Triggers resize handler on page selection 
  _pageSelected() {
      this._resizeHandler();
  }

  // Triggers on iron resize 
  _resizeHandler() {
      if (this._resizing) {
          return;
      }
      this._resizing = true;
      //this.$.calendar.notifyResize();
      this._resizing = false;

      this.updateStyles();
  }
}
customElements.define(PebbleDatePicker.is, PebbleDatePicker);
