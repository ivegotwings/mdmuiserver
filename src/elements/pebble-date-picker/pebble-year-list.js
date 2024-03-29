/**
`<pebble-year-list>` Represents an element that provides the list of years. It is the child element of the `pebble-date-picker`.

### Example

    <pebble-year-list id="yearList" 
                      date="{{date}}" 
                      min="[[_minYear]]" 
                      max="[[_maxYear]]">
    </paper-year-list>    

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--pebble-yearlist-year` | Mixin applied to date picker yearlist | {}
`--pebble-year-selected` | Mixin applied to date picker selected year | {}

@group Pebble Elements
@element pebble-year-list
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-list/iron-list.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import '@polymer/paper-ripple/paper-ripple.js';
import { timeOut, microTask } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleYearList extends mixinBehaviors([IronResizableBehavior], PolymerElement) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
        box-sizing: border-box;
        height: 100%;
        @apply --paper-font-common-base;
        /* for iron-list to fit */
        position: relative;
      }

      .year {
        cursor: pointer;
        height: var(--paper-year-list-item-height, 44px);
        line-height: var(--paper-year-list-item-height, 44px);
        text-align: center;
        vertical-align: middle;
        @apply --pebble-yearlist-year;
      }

      .selected {
        color: var(--default-primary-color);
        font-size: 24px;
        @apply --pebble-year-selected;
      }

      iron-list {
        width:100%;
        height:100%;
        overflow-x: auto;
      }
    </style>
    <iron-list id="yearList" items="[[_years]]">
      <template>
        <div class\$="year{{_addSelectedClass(selected)}}" on-tap="_tappedYearHandler">
          [[item.year]]
        </div>
      </template>
    </iron-list>
`;
  }

  static get is() {
    return "pebble-year-list";
  }

  static get properties() {
    return {
      /**
      * Indicates the selected date.
      */
      date: {
        type: Date,
        notify: true,
        observer: '_dateChange'
      },

      /**
       * Indicates the maximum allowed year.
       */
      max: {
        type: Number,
        value: 2100,
        observer: '_maxChange'
      },

      /**
       * Indicates the minimum allowed year.
       */
      min: {
        type: Number,
        value: 1900,
        observer: '_minChange'
      },

      /**
       * Specifies whether or not the selected year is in sync with year of the given date.
       * The selected year is in sync with the year of the given date, if it is within range. 
       * It is null if year is not within the range.
       */
      selected: {
        type: Number,
        notify: true,
        observer: '_selectedChange'
      },

      /**
       * Indicates an array that denotes the allowed years.
       */
      _years: {
        type: Array,
        computed: '_computeYears(min, max)',
        readOnly: true,
        value: function () {
          return Date.now().getFullYear;
        }
      }
    };
  }

  constructor() {
    super();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  ready() {
    super.ready();

    // hack for iron-list not to scroll to the first visible index on resize 
    this.$.yearList._resizeHandler = function () {
      this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(0), () => {
        this._render();
        if (this._itemsRendered && this._physicalItems && this._isVisible) {
          this._resetAverage();
          this.updateViewportBoundaries();
        }
      });
    }.bind(this.$.yearList);
  }

  /**
   * Can be used to scroll the list of years to center the selected year.
   */
  centerSelected() {
    if (this.selected !== null) {
      let selectedYearIdx = this.selected - this.min;
      this.$.yearList.scrollToIndex(selectedYearIdx);
      setTimeout(() => {
        let yearList = this.$.yearList
        let selectedPos = selectedYearIdx * yearList._physicalAverage + 1;
        if (selectedPos !== yearList.scrollTop) {
          yearList._update();
          yearList.scrollTop = selectedPos;
        }
        if (yearList.scrollHeight - yearList.offsetHeight !== yearList.scrollTop) {
          yearList.scrollTop += (yearList._physicalAverage - yearList.offsetHeight) / 2;
        }
      }, 600); //Delayed to get scroll properly
    }
  }

  /**
   * Can be used to return the selected class if needed.
   */
  _addSelectedClass(selected) {
    if (selected) {
      return ' selected';
    }
  }

  /**
   * Can be used to compute the array of years passed to the iron-list.
   */
  _computeYears(min, max) {
    if (typeof min !== 'number' || typeof max !== 'number') {
      return;
    }
    let years = [];
    for (; min <= max; min++) {
      years.push({ year: min });
    }
    return years;
  }

  /**
   * Can be used to set the 'selected' attribute to the new date's year if it is within range. 
   * Otherwise, it is set to null.
   */
  _dateChange(date) {
    let newYear = date.getFullYear();
    this.selected = this._withinRange(newYear) ? newYear : null;
  }

  _maxChange(max) {
    if (typeof max !== 'number') {
      this.max = 2100;
    }
  }

  _minChange(min) {
    if (typeof min !== 'number') {
      this.min = 1900;
    }
  }

  /**
   * Can be used to clear iron-list selection, if 'selected' is null.
   * Otherwise, it can be selected in the iron-list and 'date' attribute can be synchronized.
   */
  _selectedChange(selected) {
    if (selected === null) {
      this.$.yearList.clearSelection();
      return;
    }
    if (selected !== this.date.getFullYear()) {
      // set the year using a new Date instance for notifying to work
      this.date = new Date(this.date.setFullYear(selected));
    }
    this._selectYearInList(selected);
  }

  /**
   * Can be used to select the given year in the years list.
   */
  _selectYearInList(year) {
    let yearIdx = year - this.min;
    microTask.run(() => {
      this.$.yearList.selectItem(yearIdx);
    });
  }

  /**
   * Can be used to update the attributes - 'selected' and 'select' in the iron-list
   * from a tapped item's event in the years list.
   */
  _tappedYearHandler(e) {
    let yearItem = e.model.__data.item;
    let year = yearItem.year;
    if (this.selected !== year) {
      this.$.yearList.selectItem(yearItem);
      this.selected = year;
    }
  }

  /**
   * Can be used to return true if the year is between `min` and `max`.
   */
  _withinRange(year) {
    return !(this.min && year < this.min || this.max && year > this.max);
  }
}
customElements.define(PebbleYearList.is, PebbleYearList);
