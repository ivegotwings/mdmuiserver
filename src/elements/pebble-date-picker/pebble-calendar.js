/**
`<pebble-calendar>` Represents an element that provides calendar. It is the child element of the pebble-date-picker.

### Example

    <pebble-calendar id="calendar" 
                    locale="{{_locale}}" 
                    date="{{date}}" 
                    min-date="{{minDate}}"                             
                    max-date="{{maxDate}}"
                    is-range="{{isRange}}"
                    range-type="{{_rangeType}}"
                    start-date="{{startDate}}"
                    end-date="{{endDate}}">
    </pebble-calendar>

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--pebble-calendar` | Mixin applied to date picker calendar | {}
`--pebble-range-calendar` | Mixin applied to date range picker calendar | {}
`--range-calender-month-nav` | Mixin applied to range calender month navigation | {}
`--calendar-month-weekdays` | Mixin applied to calendar weekdays | {}
`--calendar-day-item-selected` | Mixin applied to calendar selected day | {}
`--calendar-day-item-selected-day` | Mixin applied to calendar selected day text | {}
`--calendar-day-item-range` | Mixin applied to calender selected range | {}
`--calendar-day-item-today` | Mixin applied to calendar today | {}
`--calendar-day-item` | Mixin applied to calendar days | {}
`--calendar-month-name` | Mixin applied to calendar month | {}

@group Pebble Elements
@element pebble-calendar
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import '@polymer/paper-ripple/paper-ripple.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import '../bedrock-externalref-moment/bedrock-externalref-moment.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-flex-layout.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

// Ignore movement within this distance (px)
let WIGGLE_THRESHOLD = 4;
let WIGGLE_THRESHOLD_SQUARE = WIGGLE_THRESHOLD * WIGGLE_THRESHOLD;

// what constitues a flick (px/ms)
let FLICK_SPEED = 0.5;

// Factor for "springy" resistence effect when swiping too far.
let RESIST_LENGTH = 40;
let RESIST_FACTOR = 2;

// Number of months to preload on both sides of the current month
let PRELOAD_MONTHS = 1;

function dateDiff(a, b) {
  a = new Date(a.getTime());
  b = new Date(b.getTime());
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return (a.getTime() - b.getTime()) / 86400000;
}

//startdate, enddate, currentdate
function isDateInBetween(a, b, c) {
  a = new Date(a.getTime());
  b = new Date(b.getTime());
  c = new Date(c.getTime());
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  c.setHours(0, 0, 0, 0);

  if (Date.parse(c) > Date.parse(a) && Date.parse(c) < Date.parse(b)) {
    return true;
  }

  return false;
}
class PebbleCalendar
  extends mixinBehaviors([
    RUFBehaviors.UIBehavior,
    IronResizableBehavior
  ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
    <style include="bedrock-style-icons bedrock-style-flex-layout">
      :host {
        display: block;
        box-sizing: border-box;
        padding: 0px 0 10px 0;
        position: relative;
        width: 100%;
        height: 100%;
        min-width: 160px;
        min-height: 160px;
        color: var(--primary-text-color);
        -webkit-font-smoothing: antialiased;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        --ease-in-sine: cubic-bezier(0.47, 0, 0.745, 0.715);
        --ease-out-sine: cubic-bezier(0.39, 0.575, 0.565, 1);
        @apply --paper-font-body1;
        overflow: hidden;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      #calendar {
        position: relative;
        width: var(--calendar-width, 100%);
        height: 100%;
        @apply --layout-horizontal;
        @apply --pebble-calendar;
      }

      :host([is-range]) #calendar {
        position: relative;
        width: var(--calendar-range-width, 250px);
        height: 100%;
        @apply --layout-horizontal;
        @apply --pebble-range-calendar;
      }

      #months {
        height: 100%;
        @apply --layout-horizontal;
      }

      #months.animating .month-nav {
        opacity: 1;
      }

      #months.animating {
        transition-property: transform, opacity;
        -webkit-transition-property: transform, opacity;
        transition-duration: 300ms;
        -webkit-transition-duration: 300ms;
        /* Safari */
      }

      #months.animating.swipe {
        transition-timing-function: var(--ease-in-sine);
        --webkit-transition-timing-function: var(--ease-in-sine);
      }

      #months.animating.reset {
        transition-timing-function: var(--ease-out-sine);
        --webkit-transition-timing-function: var(--ease-out-sine);
      }

      .month {
        height: 100%;
        @apply --layout-vertical;
        @apply --layout-justified;
        @apply --layout-flex;
      }

      .month-row,
      .month-nav {
        height: calc(100%/8);
        box-sizing: border-box;
        padding: 0 10px;
      }

      .month-col {
        position: relative;
        font-size: var(--font-size-sm, 12px);
      }

      .month-nav {
        position: absolute;
        top: 0;
        left: 0;
        width: var(--month-nav-width, 100%);
        opacity: 1;
        @apply --layout-horizontal;
        @apply --layout-center;
      }

      :host([is-range]) .month-nav {
        position: absolute;
        top: 0;
        left: 0;
        width: var(--month-range-nav-width, 520px);
        opacity: 1;
        @apply --layout-horizontal;
        @apply --layout-center;
        @apply --range-calender-month-nav;
      }

      .month-nav .col {
        position: relative;
        @apply --layout-vertical;
        align-items: var(--month-nav-align, center);
        -webkit-align-items: var(--month-nav-align, center);
      }

      :host([is-range]) .month-nav .col {
        position: relative;
        @apply --layout-vertical;
        align-items: var(--month-range-nav-align, stretch);
        -webkit-align-items: var(--month-range-nav-align, stretch);
      }

      .month-nav .btn .icon {
        cursor: pointer;
      }

      .month-nav .btn.right {
        text-align: right;
      }

      .month-name {
        line-height: 24px;
        vertical-align: middle;
        text-align: center;
        font-weight: var(--font-bold, bold);
        @apply --paper-font-body2;
        @apply --layout-horizontal;
        @apply --layout-center;
        @apply --layout-center-justified;
        @apply --layout-flex;
        @apply --calendar-month-name;
      }

      .month-weekdays {
        color: var(--secondary-text-color);
        @apply --layout-horizontal;
        @apply --layout-justified;
        @apply --layout-flex;
        @apply --calendar-month-weekdays;
      }

      .month-days {
        @apply --layout-horizontal;
      }

      .month-col .day {
        cursor: default;
        pointer-events: none;
        width: 30px;
        height: 30px;
        text-align: center;
        line-height: 30px;
        /* @apply --layout-fit;
        @apply --layout-vertical;
        @apply --layout-center-center;*/
      }

      .month-col {
        position: relative;
        width: 30px;
        height: 30px;
        @apply --layout-center-center;
        margin-right: 4px;
      }

      .day-item {
        border-radius: 100%;
        width: 30px;
        height: 30px;
        @apply --calendar-day-item;
      }

      .day-item::selection {
        background: none;
      }

      .day-item.selected {
        background: var(--primary-button-color, #139de6);
        @apply --calendar-day-item-selected;
      }

      .day-item.range {
        background: #d8dcf0;
        @apply --calendar-day-item-range;
      }

      .day-item.selected .day {
        color: var(--white, #fff);
        @apply --calendar-day-item-selected-day;
      }

      .day-item:not([disabled]) {
        cursor: pointer;
      }

      .day-item[disabled] .day {
        color: var(--text-disabled-color, #9d9d9d);
      }

      .day-item.today .day {
        color: var(--default-primary-color);
      }

      .day-item.selected.today .day {
        color: var(--white, #fff);
        @apply --calendar-day-item-today;
      }

      .flex {
        @apply --layout-flex;
      }

      .flex-5 {
        @apply --layout-flex-5;
      }
    </style>
    <div id="calendar">
      <div id="months" on-track="_onTrack" class\$="{{_contentClass}}">
        <template is="dom-repeat" items="{{_months}}" as="month">
          <div class\$="{{_getMonthClass('month', month)}}">
            <div class="month-row month-name">
              <span>{{dateFormat(month.date, 'MMMM YYYY', locale)}}</span>
            </div>
            <div class="month-row month-weekdays week">
              <template is="dom-repeat" items="{{_weekdays}}">
                <div class="month-col layout vertical flex">
                  <div class="day">{{item.0}}</div>
                </div>
              </template>
            </div>
            <template is="dom-repeat" items="{{month.weeks}}" as="row">
              <div class="month-row month-days">
                <template is="dom-repeat" items="{{row}}">
                  <div class="month-col">
                    <div class\$="{{_getDayClass('day-item selection', item.date, today, date, startDate, endDate)}}" disabled\$="{{_isDisabled(item.day, item.date, minDate, maxDate)}}" on-tap="_tapDay" date\$="{{item.name}}" startdate="{{startDate}}" enddate="{{endDate}}">
                      <div class="day">{{item.day}}</div>
                    </div>
                  </div>
                </template>
              </div>
            </template>
          </div>
        </template>
      </div>
      <div id="monthNav" class="month-nav">
        <div class="flex col self-stretch">
          <div class="btn" on-tap="_swipePrevMonth">
            <pebble-icon class="icon pebble-icon-size-16" icon="pebble-icon:action-scope-release-selection"></pebble-icon>
          </div>
        </div>
        <div class="flex-5"></div>
        <div class="flex col self-stretch">
          <div class="btn right" on-tap="_swipeNextMonth">
            <pebble-icon class="icon pebble-icon-size-16" icon="pebble-icon:action-scope-take-selection"></pebble-icon>
          </div>
        </div>
      </div>
    </div>
`;
  }

  static get is() { return 'pebble-calendar' }

  static get properties() {
    return {

      /**
       * Specifies the date picker as range picker.
       */
      isRange: {
        type: Boolean,
        reflectToAttribute: true,
        notify: true,
        value: false
      },

      /**
       * Specifies the range type for range selection.
       * Allowed range types are today, yesterday, last7days, last30days, thismonth, and lastmonth.
       */
      rangeType: {
        type: String,
        value: null,
        notify: true
      },

      /*
       * Indicates the selected date.
       */
      date: {
        type: Date,
        notify: true,
        value: function () {
          return new Date();
        },
        observer: '_dateChanged'
      },

      /**
       * Indicates the start date for the range picker.
       */
      startDate: {
        type: Date,
        notify: true,
        value: function () {
          return new Date();
        },
        observer: '_onStartDateChange'
      },

      /**
       * Indicates the end date for the range picker.
       */
      endDate: {
        type: Date,
        notify: true,
        value: function () {
          return new Date();
        }
      },

      /**
       * Indicates the locale.
       */
      locale: {
        type: String,
        value: 'en',
        notify: true,
        observer: '_localeChanged'
      },

      /**
       * Indicates the minimum allowed date.
       */
      minDate: {
        type: Date,
        value: null
      },

      /**
       * Indicates the maximum allowed date.
       */
      maxDate: {
        type: Date,
        value: null
      },

      /**
       * Indicates the currently selected month. It is in the number format. Allowed values are 1 to 12.
       */
      currentMonth: {
        type: Number
      },

      /**
       * Indicates the currently selected year.
       */
      currentYear: {
        type: Number
      },

      disableCalendar: {
        type: Boolean,
        value: false,
        observer: "_updateCalendar"
      },
      _contentClass: String,
      _months: Array,
      _firstDayOfWeek: Number,
    }
  }
  static get observers() {
    return [
      '_populate(currentYear, currentMonth, minDate, maxDate, locale)'
    ]
  }


  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('iron-resize', this._resizeHandler);
    this.removeEventListener('swiped', this._onSwipe);
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('iron-resize', this._resizeHandler);
    this.addEventListener('swiped', this._onSwipe);

  }

  ready() {
    this._updateToday();
    this.currentMonth = this.date.getMonth() + 1;
    this.currentYear = this.date.getFullYear();
    this._transitionEvent = this._whichTransitionEnd();
    super.ready();        
  }
  _updateCalendar() {
    let _currentMonth = this.currentMonth
    this.currentMonth = null;
    this.set("currentMonth", _currentMonth)
  }

  _onStartDateChange() {
    if (this.isRange) {
      if (!this.date) {
        this.date = new Date();
      }
      if (this.startDate) {
        this.date.setDate(this.startDate.getDate());
        this.date.setMonth(this.startDate.getMonth());
        this.date.setYear(this.startDate.getFullYear());
      }
    }
  }

  /**
   * Can be used to return the date with specified format.
   */
  dateFormat(date, format, locale) {
    if (!date) {
      return '';
    }
    let value = moment(date);
    value.locale(locale || this.locale);
    return value.format(format);
  }

  // Triggers on locale change
  _localeChanged(locale) {
    let localeMoment = moment();
    localeMoment.locale(locale);
    let weekdays = [];
    for (let i = 0; i < 7; i++) {
      weekdays.push(localeMoment.weekday(i).format('dd'));
    }
    this._weekdays = weekdays;
    this._firstDayOfWeek = localeMoment.weekday(0).format('d');
  }

  // Populates on year/month/minDate/maxDate changes
  _populate(currentYear, currentMonth, minDate, maxDate) {
    //TODO need to check functionally what all combinations should aloow to execute this function instead waiting for all params with some other values.
    if (!(currentYear === undefined || currentMonth === undefined || minDate === undefined || maxDate === undefined)) {
      let date, month, weeks, day, d, dayInfo, monthData, months = [];

      // Make sure currentYear/currentMonth are in min/max range
      if (minDate && new Date(currentYear, currentMonth, 0) < minDate) {
        this.currentYear = minDate.getFullYear();
        this.currentMonth = minDate.getMonth() + 1;
        return;
      } else if (maxDate && new Date(currentYear, currentMonth - 1, 1) > maxDate) {
        this.currentYear = maxDate.getFullYear();
        this.currentMonth = maxDate.getMonth() + 1;
        return;
      }

      for (let i = -PRELOAD_MONTHS; i <= PRELOAD_MONTHS; i++) {
        weeks = [[]];
        day = 1;
        date = new Date(currentYear, currentMonth - 1 + i, 1);
        month = date.getMonth();
        monthData = {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          date: new Date(date)
        };
        // add "padding" days
        let firstDay = date.getDay() - this._firstDayOfWeek;
        if (firstDay < 0) {
          firstDay = 7 + firstDay;
        }
        for (d = 0; d < firstDay; d++) {
          weeks[0].push({ day: null, date: null });
        }

        // add actual days
        while (date.getMonth() === month) {
          if (weeks[0].length && d % 7 === 0) {
            // start new week
            weeks.push([]);
          }
          dayInfo = {
            date: new Date(date.getFullYear(), month, day),
            name: this.dateFormat(date, 'YYYY-MM-DD'),
            year: currentYear,
            month: month,
            day: day,
          };
          weeks[weeks.length - 1].push(dayInfo);
          date.setDate(++day);
          d++;
        }

        // add remaining "padding" days
        while (d < 42) {
          if (d % 7 === 0) {
            weeks.push([]);
          }
          weeks[weeks.length - 1].push({ day: null, date: null });
          d += 1;
        }

        monthData.weeks = weeks;
        months.push(monthData);

      }
      if (!months.length) {
        return;
      }
      this.set('_months', months);
      microTask.run(() => {
        this._updateSelection();
        this._positionSlider();
      });
    }
  }

  // Get day class
  _getDayClass(cssClass, date) {
    if (date) {
      // Style for today's day
      if (dateDiff(date, this.today) === 0) {
        cssClass += ' today';
      }
      // Style for selected day in date picker
      if (!this.isRange && dateDiff(date, this.date) === 0) {
        cssClass += ' selected';
      }
      // Style for selected days and range in range picker
      if (this.isRange) {
        if ((this.startDate != null && dateDiff(date, this.startDate) === 0) ||
          (this.endDate != null && dateDiff(date, this.endDate) === 0)) {
          cssClass += ' selected';
        }
        else if (this.startDate != null && this.endDate != null) {
          if (isDateInBetween(this.startDate, this.endDate, date)) {
            cssClass += ' range';
          }
        }
      }

      this.async(function () {
        this._updateSelection();
      }, 150); //Delayed to avoid oval shape
    }
    return cssClass;
  }

  // Returns is day active or not
  _isDisabled(day, date) {
    if (this.disableCalendar) {
      return true;
    }
    return !day || !this._withinValidRange(date);
  }

  // Get month class
  _getMonthClass(name, month) {
    return name + ' month-' + month.year + '-' + month.month;
  }

  // When on-track event raises
  _onTrack(event) {
    let dx = event.detail.dx;
    let dy = event.detail.dy;
    let adx = Math.abs(dx);
    let ady = Math.abs(dy);
    let width = this._containerWidth;

    switch (event.detail.state) {
      case 'start': {
        this._trackStartTime = (new Date()).getTime();
        this._startPos = this._currentPos;
        this._moveQueue = [];
        break;
      }
      case 'track': {
        if (this._moveQueue.length >= 4) {
          this._moveQueue.shift();
        }
        this._moveQueue.push(event);
        // ignore movement within WIGGLE_THRESHOLD
        let distance = (dx * dx) + (dy * dy);
        if (!this._gesture && distance > WIGGLE_THRESHOLD_SQUARE) {
          this._gesture = adx > ady ? 'pan-x' : 'pan-y';
        }
        // only drag during pan-x gesture
        if (this._gesture !== 'pan-x') {
          return;
        }

        this._dragging = true;
        let fullWidth = width * this._months.length;
        let x = this._startPos + dx;

        // If we're dragging outside the bounds, add some resistence
        if (x > 0 || x < (-fullWidth + width)) {
          if (isNaN(parseInt(this._resistStart, 10))) {
            this._resistStart = adx;
          }
          let rdx = adx - this._resistStart;
          let p, d, max = RESIST_LENGTH;
          p = rdx > width ? 1 : rdx / width;
          d = max * (1 - Math.pow(1 - p, RESIST_FACTOR));
          x = (dx < 0 ? -this._scrollWidth + width - d : d);
        } else {
          this._resistStart = null;
        }
        this._translateX(x);
        break;
      }
      case 'end': {
        this._resistStart = null;
        let lastIdx = this._getMonthIdx(this._startPos);
        let idx = this._getMonthIdx(this._currentPos);
        let speed = this._getFastestMovement(event).v;
        let move = idx !== lastIdx || speed > FLICK_SPEED;
        if (!this._resistStart && this._gesture === 'pan-x' && move) {
          if (speed > FLICK_SPEED) {
            // calculate an ideal transition duration based on current speed of swipe
            let remainingDistance = width - adx;
            let newDuration = remainingDistance / speed;
            if (newDuration > 300) {
              newDuration = 300;
            }
            this._transitionDuration = newDuration;
          }

          if (dx > 0) {
            this._swipePrevMonth();
          } else {
            this._swipeNextMonth();
          }
        } else {
          this._translateX(this._startPos, 'reset');
        }
        this._gesture = null;
      }
    }
  }

  // Swipe to previous month
  _swipePrevMonth() {
    if (!this.minDate || this.currentYear > this.minDate.getFullYear() || this.currentMonth > this.minDate.getMonth() + 1) {
      this._translateX(0, 'swipe', function () {
        this.set('_contentClass', '');
        this.transform('translateX(' + this._startPos + 'px)', this.$.months);
        this.dispatchEvent(new CustomEvent('swiped', { detail: { direction: 'right' }, bubbles: true, composed: true }));
      }.bind(this));
    }
  }

  // Swipe to next month
  _swipeNextMonth() {
    if (!this.maxDate || this.currentYear < this.maxDate.getFullYear() || this.currentMonth < this.maxDate.getMonth() + 1) {
      this._translateX(-this._containerWidth * 2, 'swipe', function () {
        this.set('_contentClass', '');
        this.transform('translateX(' + this._startPos + 'px)', this.$.months);
        this.dispatchEvent(new CustomEvent('swiped', { detail: { direction: 'left' }, bubbles: true, composed: true }));
      }.bind(this));
    }
  }
  // Get month index
  _getMonthIdx(pos) {
    // returns the index for the visible month according to the given position
    let width = this._containerWidth;
    let i = Math.floor((-pos + (width / 2)) / width);
    return i < 0 ? 0 : i;
  }

  // Apply translate style
  _translateX(x, transition, cb) {
    if (isNaN(parseInt(x, 10))) {
      throw new Error('Not a number: ' + x);
    }
    this._currentPos = x;
    if (transition) {
      if (this._transitionDuration) {
        this.$.months.style.transitionDuration = this._transitionDuration + 'ms';
      }
      this._once(this._transitionEvent, function () {
        this.set('_contentClass', '');
        this.$.months.style.transitionDuration = '';
        this._transitionDuration = null;
        this.$.monthNav.style.removeProperty('opacity');
        if (cb) {
          cb();
        }
      }.bind(this), this.$.months);
      this.set('_contentClass', 'animating ' + transition);
      this.$.monthNav.style.removeProperty('opacity');
      // Fixes odd bug in chrome where we lose touch-events after changing opacity
      this._once('touchstart', function () { });
    }
    window.requestAnimationFrame(function () {
      if (!transition) {
        let halfWidth = this._containerWidth / 2;
        let dx = Math.abs(this._startPos - x);
        let p = (1 - (dx / halfWidth)) * 100;
        p = (100 - Math.pow(p, 2)) / 100 / 100;
        let opacity = Math.abs(parseFloat(p).toFixed(2));
        this.$.monthNav.style.opacity = opacity;
      }
      this.transform('translateX(' + x + 'px)', this.$.months);
    }.bind(this));
  }

  _getFastestMovement(event) {
    // detect flick based on fastest segment of movement
    let l = this._moveQueue.length;
    let dt, tx, ty, tv2, x = 0, y = 0, v2 = 0;
    for (let i = 0, m; i < l && (m = this._moveQueue[i]); i++) {
      dt = event.timeStamp - m.timeStamp;
      tx = (event.detail.x - m.detail.x) / dt;
      ty = (event.detail.y - m.detail.y) / dt;
      tv2 = tx * tx + ty * ty;
      if (tv2 > v2) {
        x = tx;
        y = ty;
        v2 = tv2;
      }
    }
    return { x: x, y: y, v: Math.sqrt(v2) };
  }

  _onSwipe(event) {
    if (event.detail.direction === 'right') {
      this._prevMonth();
    } else {
      this._nextMonth();
    }
  }

  _once(eventName, callback, node) {
    node = node || this;
    function onceCallback() {
      node.removeEventListener(eventName, onceCallback);
      callback.apply(null, arguments);
    }
    node.addEventListener(eventName, onceCallback);
  }

  _incrMonth(i) {
    let date = new Date(this.currentYear, this.currentMonth - 1 + i);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (this._monthWithinValidRange(year, month)) {
      this.currentYear = year;
      this.currentMonth = month;
    }
  }

  _prevMonth() {
    this._incrMonth(-1);
  }

  _nextMonth() {
    this._incrMonth(1);
  }

  _dateChanged(date, oldValue) {
    if (!this._isValidDate(date)) {
      this.logWarning("InvalidDate", "date", date);
      this.date = date = oldValue;
    }
    if (!this._withinValidRange(date)) {
      this.logWarning("DateOutsideRange", "date", date);
      if (date.getFullYear() == this.maxDate.getFullYear()) {
        this.date = this.maxDate;
      } else if (date.getFullYear() == this.minDate.getFullYear()) {
        this.date = this.minDate;
      }
      // else {
      //   this.date = date = oldValue;
      // }
    }
    this.currentYear = date.getFullYear();
    this.currentMonth = date.getMonth() + 1;
    // Only trigger a notification if there actually is a difference.
    if (oldValue && date.getTime && oldValue.getTime && date.getTime() === oldValue.getTime()) {
      return;
    }

    this._updateSelection();
  }

  // When day selected
  _tapDay(event) {
    if (this.disableCalendar || !this._withinValidRange(event.model.item.date)) {
      return false;
    }

    let item = event.model.item;
    let newDate = new Date(item.date);

    // var newDate = new Date(this.date.getTime());        
    // newDate.setYear(item.date.getFullYear());
    // newDate.setMonth(item.month);
    // newDate.setDate(item.day);

    if (this.isRange) {
      this.rangeType = null; // reset the range selection when day on-tap

      if (!this.startDate) {
        this.startDate = newDate;
      }
      else if (!this.endDate) {
        if (Date.parse(newDate) < Date.parse(this.startDate)) {
          this.startDate = newDate;
        }
        else {
          this.endDate = newDate;
        }
      }
      else {
        this.startDate = newDate;
        this.endDate = null;
      }
    }
    else {
      this.date = newDate;
      this._fireEvent(event);
    }
  }

  _fireEvent(event) {
    this.fireBedrockEvent("calendar-day-tap", event.detail, { bubbles: true, composed: true, ignoreId: true });
  }


  _isValidDate(date) {
    return date && date.getTime && !isNaN(date.getTime());
  }

  _withinValidRange(date) {
    if (this._isValidDate(date)) {
      return (!this.minDate || date >= this.minDate) && (!this.maxDate || date <= this.maxDate);
    }
    return false;
  }

  _monthWithinValidRange(year, month) {
    let monthStart = new Date(year, month - 1, 1);
    let monthEnd = new Date(year, month, 0);
    return this._withinValidRange(monthStart) || this._withinValidRange(monthEnd);
  }

  _positionSlider() {
    if (!this._months || !this._containerWidth) {
      return;
    }
    this._scrollWidth = (this.$.calendar.offsetWidth * this._months.length);
    this.$.months.style.minWidth = this._scrollWidth + 'px';
    let i = ((this.currentYear * 12) + this.currentMonth) -
      ((this._months[0].year * 12) + this._months[0].month);
    this._translateX(-i * this._containerWidth);
  }

  _updateSelection() {
    // Force the day selection circle to maintain a 1:1 ratio       
    let selectedList = this.querySelectorAll('.day-item.selected');
    let rangeList = this.querySelectorAll('.day-item.range');

    for (let idx = 0; idx < selectedList.length; idx++) {
      this._updateSelectionItem(selectedList[idx]);
    }

    for (let idx = 0; idx < rangeList.length; idx++) {
      this._updateSelectionItem(rangeList[idx]);
    }
  }

  _updateSelectionItem(selected) {
    if (!selected) {
      return;
    }
    selected.style.height = '';
    selected.style.width = '';
    let w = selected.parentElement.offsetWidth;
    let h = selected.parentElement.offsetHeight;
    selected.style.flex = '';
    window.requestAnimationFrame(function () {
      if (w > 0 && w < h) {
        selected.style.height = w + 'px';
      }
      else if (h > 0) {
        selected.style.width = h + 'px';
      }
    });
  }

  _resizeHandler() {
    this._containerWidth = this.$.calendar.offsetWidth;
    this._positionSlider();
    this._updateSelection();
  }

  _getDayName(date) {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  }

  _updateToday() {
    this.today = new Date();
    this.today.setHours(0, 0, 0, 0);
  }

  _whichTransitionEnd() {
    let transitions = {
      'WebkitTransition': 'webkitTransitionEnd',
      'MozTransition': 'transitionend',
      'OTransition': 'oTransitionEnd otransitionend',
      'transition': 'transitionend'
    };

    for (let t in transitions) {
      if (this.style[t] !== undefined) {
        return transitions[t];
      }
    }
  }
}
customElements.define(PebbleCalendar.is, PebbleCalendar)
