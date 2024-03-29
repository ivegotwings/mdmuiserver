import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import { addListener } from '@polymer/polymer/lib/utils/gestures.js';

/**
 * `<resizable-panels>` allows to resize the width (default) or the height (vertical mode) of the component childrens.
 *
 * Add the attribute `vertical` to use vertical resizing.
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class ResizablePanels extends GestureEventListeners(PolymerElement) {
  static get template() {
    return html`
    <style>
      :host {
        display: -webkit-box;
        display: flex;
        overflow: hidden;
      }

      :host([hidden]) { display: none; }

      :host([vertical]) {
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        flex-direction: column;
        flex-basis: auto;
      }

      ::slotted(:not(.knob)) {
        overflow: hidden;
      }

      ::slotted(.knob) {
        width: var(--resizable-panels-knob-size, 4px);
        margin-left: calc(var(--resizable-panels-knob-size, 4px) / 2 * -1);
        margin-right: calc(var(--resizable-panels-knob-size, 4px) / 2 * -1);
        position: relative;
        z-index: 1;
        background-color: var(--resizable-panels-knob-color, #fff);
        cursor: col-resize;
        flex-shrink: 0;
        @apply --resizable-panels-knob;
      }

      :host([vertical]) ::slotted(.knob) {
        width: 100%;
        height: var(--resizable-panels-knob-size, 4px);
        margin-left: 0;
        margin-right: 0;
        margin-top: calc(var(--resizable-panels-knob-size, 4px) / 2 * -1);
        margin-bottom: calc(var(--resizable-panels-knob-size, 4px) / 2 * -1);
        cursor: row-resize;
        @apply --resizable-panels-knob;
      }

      :host(.dragging) ::slotted(*:not(.knob)) {
        pointer-events: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        user-select: none;
      }
    </style>

    <slot></slot>
`;
  }

  static get is() { return 'resizable-panels' }

  static get properties() {
    return {
      /**
       * Vertical resizing. Default is horizontal.
       */
      vertical: {
        type: Boolean,
        value: false,
        notify: true,
        reflectToAttribute: true
      },

      _draggingDirection: {
        type: String,
        computed: '_setDraggingDirection(vertical, _childrens)'
      }
    }
  }

  static get observers() {
    return [
      '_verticalObserver(_draggingDirection, _childrens)'
    ]
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    addListener(this, 'track', e => this._trackHandler(e));
    setTimeout(() => {
      this._childrens = [].filter.call(this.childNodes, (node) => node.nodeType === Node.ELEMENT_NODE);
      [].forEach.call(this._childrens, this._addKnobs.bind(this));
    }, 1);
  }

  _setDraggingDirection(vertical, _childrens) {
    if (_childrens) {
      return vertical ? 'vertical' : 'horizontal';
    }
  }

  /**
   * Add a height to the container in vertical mode and remove previous inline styles added to childrens
   */
  _verticalObserver(_draggingDirection, _childrens) {
    if (_draggingDirection === 'vertical') {
      this._draggingDirectionChanged = true;
    }

    if (this._draggingDirectionChanged) {
      [].forEach.call(this._childrens, (children) => {
        this._resetPanelStyles(children, _draggingDirection === 'vertical' ? 'width' : 'height');
      });

      if (_draggingDirection === 'vertical') {
        this.style.height = 'auto'; // force to get its full height
        this._height = this.getBoundingClientRect().height;
      }

      this.style.height = _draggingDirection === 'vertical' ? `${this._height}px` : '';
    }
  }

  _resetPanelStyles(panel, styleProperty) {
    panel.style[styleProperty] = '';
    panel.style['flex-shrink'] = '';
  }

  _addKnobs(panel, index) {
    if (index > 0) {
      let knob = document.createElement('div');
      knob.classList.add('knob', 'knob-panel-' + index);
      this.insertBefore(knob, panel);
    }
  }

  _isKnob(e) {
    return e.target.className.indexOf('knob-panel-') >= 0;
  }

  _trackHandler(e) {
    let state = {
      'start': this._onTrackStart.bind(this),
      'track': this._onTrack.bind(this),
      'end': this._onTrackEnd.bind(this)
    }[e.detail.state](e);
  }

  _onTrackStart(e) {
    window.getSelection().removeAllRanges();
  }

  _onTrack(e) {
    if (!this._isKnob(e)) {
      return;
    }

    if (!this._eventFired) {
      this.dispatchEvent(new CustomEvent('resizing', { detail: { state: 'start' }}));
      this.classList.add('dragging');
      this._eventFired = true;
    }

    let next = e.target.nextElementSibling;
    let previous = e.target.previousElementSibling;

    this._nextSiblingDimensions = this._nextSiblingDimensions || this._computeDimensionsWithoutPadding(next);
    this._previousSiblingDimensions = this._previousSiblingDimensions || this._computeDimensionsWithoutPadding(previous);
    this._totalWidth = this._totalWidth || e.currentTarget.getBoundingClientRect().width;
    this._totalHeight = this._totalHeight || e.currentTarget.getBoundingClientRect().height;

    let hParams = { previous: previous, next: next, styleProperty: 'width', total: this._totalWidth, offset: Math.abs(e.detail.dx) };
    let vParams = { previous: previous, next: next, styleProperty: 'height', total: this._totalHeight, offset: Math.abs(e.detail.dy) };

    let resizeParams = {
      offset: this._draggingDirection === 'horizontal' ? e.detail.dx : e.detail.dy,
      params: this._draggingDirection === 'horizontal' ? hParams : vParams
    };

    this._resize(resizeParams);
  }

  _computeDimensionsWithoutPadding(node) {
    let bcr = node.getBoundingClientRect();
    let cs = window.getComputedStyle(node);

    return {
      width: bcr.width - (parseInt(cs.paddingLeft) + parseInt(cs.paddingRight)),
      height: bcr.height - (parseInt(cs.paddingTop) + parseInt(cs.paddingBottom))
    };
  }

  _onTrackEnd() {
    this.classList.remove('dragging');
    this._nextSiblingDimensions = null;
    this._previousSiblingDimensions = null;
    this._totalWidth = null;
    this._totalHeight = null;
    this._eventFired = false;
    this.dispatchEvent(new CustomEvent('resizing', { detail: { state: 'end' }}));
  }

  _getPct(currentWidth, total) {
    return Math.round(parseInt(currentWidth * 100) / parseInt(total));
  }

  _resize({offset, params}) {
    offset < 0 ? this._shrinkPrevious(params) : this._shrinkNext(params);
  }

  _isResizedToMinimum(node, styleProperty) {
    return parseInt(window.getComputedStyle(node)[styleProperty]) === 0;
  }

  /**
   * @ignore
   * Big 💩 -> PR's are welcome :)
   */
  _shrinkPrevious(params) {
    this._changeSize(params.previous, this._previousSiblingDimensions, params, '-');
    if (!this._isResizedToMinimum(params.previous, params.styleProperty)) {
      this._changeSize(params.next, this._nextSiblingDimensions, params, '+');
    }
  }

  _shrinkNext(params) {
    this._changeSize(params.next, this._nextSiblingDimensions, params, '-');
    if (!this._isResizedToMinimum(params.next, params.styleProperty)) {
      this._changeSize(params.previous, this._previousSiblingDimensions, params, '+');
    }
  }

  _changeSize(elem, dimensions, params, operator) {
    let pct = this._getPct(dimensions[params.styleProperty], params.total);
    elem.style[params.styleProperty] = `calc(${pct}% ${operator} ${params.offset}px)`;
    elem.style['flex-shrink'] = 0;
  }

  /**
   * Fired when the panels are resized and when the resize ends
   * @event resizing
   * @param {Object} detail 'state' Can be 'start' or 'end'
   */
}

customElements.define(ResizablePanels.is, ResizablePanels);
