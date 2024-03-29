/**

`pebble-clock-selector` Represents an element that provides an animated clock.

### Example

        <pebble-clock-selector class="clock" 
                            id="hourClock" 
                            count="12" 
                            step="1" 
                            animated="[[animated]]" 
                            selected="{{hour12}}">
        </pebble-clock-selector>

@group Pebble Elements
@element pebble-clock-selector
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
import { microTask, timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-externalref-classlist-temp/bedrock-externalref-classlist-temp.js';
import * as Settings  from '@polymer/polymer/lib/utils/settings.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
let SVG_NS = 'http://www.w3.org/2000/svg';

// radius values as a percentage of the clock-face radius
let MAX_VISIBLE = 12;

let normalizeAngle = function (a) {
    // convert angle to a positive value between 0 and 360
    a = a ? a % 360 : 0;
    return a < 0 ? a + 360 : a;
};

function getShortestAngle(from, to) {
    let angle, offset = 0;
    from = from || 0;
    angle = normalizeAngle(from);
    if (angle < 180 && (to > (angle + 180))) {
        offset = -360;
    }
    if (angle >= 180 && (to <= (angle - 180))) {
        offset = 360;
    }
    return from + offset + (to - angle);
}

class PebbleClockSelector extends mixinBehaviors([IronResizableBehavior], OptionalMutableData(
    PolymerElement)) {
  static get template() {
    return html`
        <style>
            :host * {
                -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
            }

            :host {
                display: block;
                @apply --pebble-font-body1;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -khtml-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                pointer-events: none;
                @apply --layout-horizontal;
                @apply --layout-center-center;
            }

            #clock {
                display: block;
                overflow: visible;
            }

            #clock * {
                pointer-events: fill;
            }

            #face {
                fill: var(--palette-pale-grey-four, #eff4f8);
                cursor: default;
            }

            .line {
                stroke-width: 2;
            }

            .dot {
                fill: var(--primary-button-color, #139de6) !important;
            }

            .line {
                stroke: var(--primary-button-color, #139de6) !important;
            }

            .clock-hand {
                z-index: 1;
                fill:var(--primary-button-color, #139de6)!important;
            }

            .disc-large {
                z-index: 2;
                fill: var(--primary-button-color, #139de6) !important;
            }

            .disc-small {
                fill: var(--text-primary-color);
            }

            .clock-hand.no-dot .disc-small {
                fill: none;
                stroke: none;
            }

            .number text {
                z-index: 3;
                fill: var(--primary-text-color);
                @apply --pebble-font-subhead;
                pointer-events: none;
                dominant-baseline: middle;
                text-align: center;
                text-anchor: middle;
            }

            .number text.clipped {
                z-index: 4;
                clip-path: url('#handClip');
            }

            .select-area {
                cursor: pointer;
                fill-opacity: 0;
            }

            #clock.animating #clockHand,
            #clock.animating #clipCircle {
                transition: transform 150ms ease-in;
                -webkit-transition: transform 150ms ease-in;
            }
        </style>
        <svg version="1.1" id="clock">
            <defs>
                <clipPath id="handClip">
                    <circle id="clipCircle" r\$="{{_selectorSize}}" cx\$="{{_handX}}" cy\$="{{_handY}}"></circle>
                </clipPath>
            </defs>
            <circle id="face" class="bg" r\$="{{_radius}}" cx\$="{{_radius}}" cy\$="{{_radius}}"></circle>
            <g id="clockHand" class="clock-hand">
                <circle class="dot" r="2" cx\$="{{_radius}}" cy\$="{{_radius}}"></circle>
                <line class="line" x1\$="{{_radius}}" y1\$="{{_radius}}" x2\$="{{_handX}}" y2\$="{{_handY}}"></line>
                <circle class="disc-large" r\$="{{_selectorSize}}" cx\$="{{_handX}}" cy\$="{{_handY}}"></circle>
                <circle class="disc-small" r\$="{{_selectorDotSize}}" cx\$="{{_handX}}" cy\$="{{_handY}}"></circle>
            </g>
            <g id="numbers"></g>
            <path class="select-area" on-tap="_onTouchWrapper" on-track="_onTouchWrapper" d\$="{{_getSelectArea(_radius, _selectorInner, _selectorOuter)}}"></path>
        </svg>
`;
  }

  static get is() {
      return "pebble-clock-selector";
  }
  static get properties() {
      return {
          /**
           * Indicates the user specified value based on which clock hand rotates.
           */
          selected: {
              type: Number,
              notify: true,
              value: 0,
              observer: '_selectedChanged'
          },

          /**
           * Indicates the count as 12, 60, and 60 for hours, minutes and seconds respecitvely.
           */
          count: {
              type: Number,
              value: 0
          },

          /**
           * Indicates the step count to rotate the clock hand.
           */
          step: {
              type: Number,
              value: 1,
              observer: '_stepChanged'
          },

          /**
           * Specifies whether or not minutes and seconds in the clock is set to zero.
           */
          useZero: {
              type: Boolean,
              value: false
          },

          /**
           * Specifies whether or not zero is prefixed.
           */
          zeroPad: {
              type: Boolean,
              value: false,
              observer: '_zeroPadChanged'
          },

          /**
           * Specifies whether or not to animate the clock hand between the selections.
           */
          animated: {
              type: Boolean,
              value: false
          }
      }
  }
  static get observers() {
      return [
          '_populate(count, step, useZero)'
      ]
  }
  constructor() {
      super();
      this._boundNotifyScroll = this._updateSize.bind(this);
  }
  ready() {
      super.ready();
      this._transitionEvent = this.style.WebkitTransition ? 'transitionEnd' : 'webkitTransitionEnd';
      this._populate();
      this._selectedChanged(this.selected);
  }
  connectedCallback() {
      super.connectedCallback();
      this.addEventListener('iron-resize', this._updateSize);
      window.addEventListener('scroll', this._boundNotifyScroll);
  }
  disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('iron-resize', this._updateSize);
      window.removeEventListener('scroll', this._boundNotifyScroll);
  }
  setClockHand(deg, animate, callback) {
      deg = normalizeAngle(deg);
      animate = typeof (animate) === 'undefined' ? this.animated : animate;
      animate = this._radius ? animate : false;

      this.$.clock.classList.remove('animating');

      let current, transform = this._getTransform(this.$.clockHand);
      if (transform) {
          current = parseInt(transform.match(/rotate\((-?\d+)deg\)/)[1]);
      } else {
          current = 0;
      }

      let rotate = getShortestAngle(current, deg);
      if (normalizeAngle(rotate) === current) {
          return this._setHandRotation(current);
      }

      if (!animate) {
          return this._setHandRotation(rotate);
      }

      this._once(this._transitionEvent, function () {
          if (callback) {
              callback();
          }
          this.$.clock.classList.remove('animating');
          this.dispatchEvent(new CustomEvent('pebble-clock-transition-end', {
              bubbles: true,
              composed: true
          }));
      }.bind(this), this.$.clockHand);

      this.$.clock.classList.add('animating');
      microTask.run(() => {
          this._setHandRotation(rotate);
      });

  }
  _getTransform(el) {
      return el.style.transform | el.style.webkitTransform | el.style.msTransform;
  }
  _setTransform(el, value) {
      el.style.msTransform = el.style.webkitTransform = el.style.transform = value;
      this._setTransformForIE(el, value);
  }
  _setTransformOrigin(el, value) {
      el.style.msTransformOrigin = el.style.webkitTransformOrigin = el.style.transformOrigin = value;
      this._setTransformForIE(el);
  }
  _setTransformForIE(el, value) {
      let angle;

      if (value == undefined || value == '') {
          let transformValue = window.getComputedStyle(el, null).getPropertyValue("transform");

          if (transformValue == 'none' || transformValue == '' || transformValue == undefined) {
              return;
          }

          angle = this._getAngleFromMatrix(transformValue);
      } else {
          angle = value.replace('rotate(', '').replace('deg)', '');
      }

      let transformOriginValue = window.getComputedStyle(el, null).getPropertyValue(
          "transform-origin");
      if (transformOriginValue == '' || transformOriginValue == undefined) {
          return;
      }

      let attrTransformValue = "rotate(" + angle + ", " + transformOriginValue.split(' ')[0].replace(
          'px', '') + ", " + transformOriginValue.split(' ')[1].replace('px', '') + ")";
      el.setAttribute("transform", attrTransformValue);
  }
  _getAngleFromMatrix(matrix) {
      let values = matrix.split('(')[1];
      values = values.split(')')[0];
      values = values.split(',');
      let a = values[0];
      let b = values[1];
      let c = values[2];
      let d = values[3];

      let scale = Math.sqrt(a * a + b * b);
      let radians = Math.atan2(b, a);
      let angle = Math.round(radians * (180 / Math.PI));

      return angle;
  }
  _setHandRotation(deg) {
      let hasLabel = ((deg / 360) * this.count) % this.step === 0;
      let transform = 'rotate(' + deg + 'deg)';
      this.$.clockHand.classList[['remove', 'add'][+hasLabel]]('no-dot');
      this._setTransform(this.$.clockHand, transform);
      this._setTransform(this.$.clipCircle, transform);
  }
  _selectedChanged(selected) {
      if (!this.count || isNaN(selected)) {
          return;
      }
      let value = selected % this.count;
      let idx = value;

      if (idx === 0 && !this.useZero) {
          value = this.count;
      }
      if (value !== this.selected) {
          this.selected = value;
          return;
      }
      this._vibrate();
      this.setClockHand((360 / this.count) * this.selected);
  }
  _stepChanged(value, oldValue) {
      this._step = oldValue;
      if (!this.count || isNaN(value)) {
          return;
      }
      let minStep = Math.ceil(this.count / MAX_VISIBLE);
      if (value < minStep) {
          value = minStep;
      }
      this._step = value;
  }
  _populate() {
      if (!(this.count === undefined || this.step === undefined || this.useZero === undefined)) {
          delete this._resizedCache;
          let display, value, number;
          let $numbers = this.$.numbers;

          this.set('_numbers', []);
          this._stepChanged(this.step);

          // remove dom nodes since they'll be re-created
          ComponentHelper.clearNode($numbers);

          let numbers = [];

          for (let i = 0; i < this.count; i++) {
              value = i;
              display = null;
              if (i === 0 && !this.useZero) {
                  value = this.count;
              }

              number = {
                  index: i,
                  value: value,
                  display: value % this._step === 0,
                  x: 0,
                  y: 0,
                  label: this._formatNumber(value)
              };

              number.dom = this._createNumberElement(number);
              numbers.push(number);
              $numbers.appendChild(number.dom.g);
          }
          this.set('_numbers', numbers);
          this._positionClockPoints();
      }
  }
  _updateNumber(number) {
      let dom = number.dom;
      if (!dom) {
          return;
      }
      if (number.x && number.y && dom.text) {
          dom.text.setAttributeNS(null, 'x', number.x);
          dom.text.setAttributeNS(null, 'y', number.y);
          dom.text.textContent = this._formatNumber(number.value);
          dom.textClipped.setAttributeNS(null, 'x', number.x);
          dom.textClipped.setAttributeNS(null, 'y', number.y);
          dom.textClipped.textContent = this._formatNumber(number.value);
      }
  }
  _createNumberElement(number) {
      // We can't use templates inside SVG elements, so we have to create
      // the numbers in dom and set up attribute bindings manually
      function create(type, classList) {
          let el = document.createElementNS(SVG_NS, type);
          if (classList) {
              classList.forEach(function (c) {
                  el.classList.add(c);
              });
          }
          if (!Settings.useShadow) {
              el.classList.add('style-scope');
              el.classList.add('pebble-clock-selector');
          }
          return el;
      }

      let g = create('g', ['number']);
      let text = null;
      let textClipped = null;
      if (number.display) {
          text = create('text');
          text.textContent = number.label;
          g.appendChild(text);
          textClipped = create('text', ['clipped']);
          textClipped.textContent = number.label;
          g.appendChild(textClipped);
      }

      return {
          g: g,
          text: text,
          textClipped: textClipped
      };
  }

  /**
   * Can be used to refit the clock size.
   */
  UpdateClockSelector() {
      this._updateSize();
  }

  _updateSize() {
      let radius = Math.min(this.offsetWidth, this.offsetHeight) / 2;

      // if (!radius || this._resizedCache === radius) {
      //   return;
      // }          

      this._radius = radius;
      this._selectorSize = 12;
      this._selectorDotSize = 3;
      this._padding = 2;
      this._positionClockPoints();

      this._resizedCache = this._radius;
      this.$.clock.style.width = (radius * 2) + 'px';
      this.$.clock.style.height = (radius * 2) + 'px';
      let v = radius + 'px ' + radius + 'px';
      this._setTransformOrigin(this.$.clockHand, v);
      this._setTransformOrigin(this.$.clipCircle, v);

      setTimeout(() => {
          // FIXME: this is hacky, but for some reason we need to wait a bit
          // to get an accurate measurement
          this._bounds = this.$.face.getBoundingClientRect();
      }, 150);
  }
  _positionClockPoints() {
      if (!this._radius) {
          return;
      }

      this._selectorOuter = this._radius - this._padding * 2;
      this._selectorInner = this._selectorOuter - this._selectorSize * 2;
      let selectorCenter = this._selectorOuter - this._selectorSize;

      let numbers = this._numbers;
      let angle = (360 / this.count) * (Math.PI / 180);

      let a, number;
      for (let i = 0; i < this.count; i++) {
          a = angle * i;
          number = numbers[i];
          number.x = this._radius + (Math.sin(a) * selectorCenter);
          number.y = this._radius - (Math.cos(a) * selectorCenter);
          this._updateNumber(number);
      }
      this._handX = this._numbers[0].x;
      this._handY = this._numbers[0].y;
  }
  _notifyNumberChanged(path) {
      let propPath, props = ['x', 'y'];
      for (let i = 0; i < props.length; i++) {
          propPath = path + '.' + props[i];
          if (this.get(propPath)) {
              this.notifyPath(propPath, this.get(propPath));
          }
      }
  }
  _getSelectArea(radius, outer, inner) {
      return '\n' +
          'M ' + (radius - outer) + ' ' + radius + '\n' +
          'A ' + outer + ' ' + outer + ' 0 0 0 ' + (radius + outer) + ' ' + radius + '\n' +
          'A ' + outer + ' ' + outer + ' 0 0 0 ' + (radius - outer) + ' ' + radius + '\n' +
          'M ' + (radius - inner) + ' ' + radius + '\n' +
          'A ' + inner + ' ' + inner + ' 0 0 1 ' + (radius + inner) + ' ' + radius + '\n' +
          'A ' + inner + ' ' + inner + ' 0 0 1 ' + (radius - inner) + ' ' + radius;
  }

  //Update clock selector before actual touch
  _onTouchWrapper(event) {
      let vm = this;

      vm._updateSize();

      this.async(() => {
          // to get an accurate results
          vm._onTouch(event);
      }, 150);
  }
  _onTouch(event) {
      let x = event.detail.x - this._bounds.left - this._radius;
      let y = event.detail.y - this._bounds.top - this._radius;

      /* only rotate while in the touch area */
      let distance = Math.abs(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
      if (distance < this._selectorInner || distance > this._selectorOuter) {
          return;
      }

      /* don't animate while tracking */
      this.animated = event.type !== 'track';

      // use coords to find angle from 12 o'clock position
      let theta = Math.atan(y / x);
      theta = (Math.PI / 2) + (x < 0 ? theta + Math.PI : theta);
      let intervalRad = (360 / this.count) * (Math.PI / 180);

      // determine the selected number
      this.selected = Math.round(theta / intervalRad);

      /* only fire selected when we've tapped or stopped tracking */
      if (event.type === 'tap' || event.detail.state === 'end') {
          this.dispatchEvent(new CustomEvent('pebble-clock-selected', {
              detail: {
                  value: this.selected,
                  animated: this.animated
              },
              bubbles: true,
              composed: true
          }));
      }
  }
  _formatNumber(value) {
      if (this.zeroPad) {
          return ('0' + value).substr(-2);
      }
      return value.toString();
  }
  _getNumberClass(pfx, n, selected) {
      let cssClass = pfx;
      if (selected.value === n.value) {
          cssClass += ' selected';
      }
      return cssClass;
  }
  _vibrate() {
      this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(0), () => {
          if (navigator.vibrate) {
              navigator.vibrate(10);
          }
      });
  }
  _zeroPadChanged() {
      this._numbers.forEach(function (number) {
          this._updateNumber(number);
      }.bind(this));
  }
  _once(eventName, callback, node) {
      node = node || this;

      function onceCallback() {
          node.removeEventListener(eventName, onceCallback);
          callback.apply(null, arguments);
      }
      node.addEventListener(eventName, onceCallback);
  }
}
customElements.define(PebbleClockSelector.is, PebbleClockSelector);
