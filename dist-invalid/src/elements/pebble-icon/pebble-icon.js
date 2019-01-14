/**
`<pebble-icon>` Represents an element that displays an icon.

### Example

    <pebble-icon icon="social:mood" class="iconstyle">
    </pebble-icon>

    <pebble-icon src="location.png">
    </pebble-icon>

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--pebble-icon` | Mixin applied to the icon | {}
`--pebble-icon-width` | Width of the icon | `24px`
`--pebble-icon-height` | Height of the icon | `24px`
`--pebble-icon-fill-color` | Fill color of the svg icon | `currentcolor`
`--pebble-icon-stroke-color` | Stroke color of the svg icon | none
`--pebble-icon-margin` | Margin to adjust icon position | none


@group Pebble Elements
@element pebble-icon
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-meta/iron-meta.js';
import { Base } from '@polymer/polymer/polymer-legacy.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
class PebbleIcon extends PolymerElement {
  static get template() {
    return html`
    <style>
      :host {
        position: relative;
        display: inline-block;
        vertical-align: middle;
        fill: var(--primary-icon-color, #75808b);
        width: 20px;
        height: 20px;
        @apply --pebble-icon-dimension;
        @apply --pebble-icon-color;
        @apply --pebble-icon-stroke;
        @apply --pebble-icon-container;
      }

      :host([disabled]) iron-icon {
        opacity: 0.5;
        cursor: not-allowed;
      }
      svg{
        vertical-align: middle;
        display: inline-block !important;
      }

      svg{
        position: relative;
        vertical-align: middle;
        fill: var(--primary-icon-color, #75808b);
        float: left;
        width: 20px;
        height: 20px;
        @apply --pebble-icon-dimension;
        @apply --pebble-icon-color;
        @apply --pebble-icon-stroke;
      }
    </style>
`;
  }

  static get is() {
    return "pebble-icon";
  }
  static get properties() {
    return {

      /**
       * Indicates the name of the icon to use. The name must be of the form:
       * `iconset_name:icon_name`.
       */
      icon: {
        type: String,
        value: null
      },
      /**
       * Indicates the name of the theme to use if `iconset` specifies one.
       * 
       */
      theme: {
        type: String,
        value: null
      },
      /**
       * Indicates a source file. If you use an `iron-icon` without an `iconset`, 
       * then set the `src` to the URL of an individual icon image file. 
       * Note that this takes precedence over a given icon attribute.
       */
      src: {
        type: String,
        value: null
      },

      /**
     * @type {!Polymer.IronMeta}
     */
      _meta: {
        value: Base.create('iron-meta', { type: 'iconset' })
      }
    };
  }

  static get observers() {
    return [
      '_updateIcon(_meta, isAttached)',
      '_updateIcon(theme, isAttached)',
      '_srcChanged(src, isAttached)',
      '_iconChanged(icon, isAttached)'
    ]
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
  _iconChanged(icon) {
    let parts = (icon || '').split(':');
    this._iconName = parts.pop();
    this._iconsetName = parts.pop() || 'icons';
    this._updateIcon();
  }

  _srcChanged(src) {
    this._updateIcon();
  }

  _usesIconset() {
    return this.icon || !this.src;
  }

  /** @suppress {visibility} */
  _updateIcon() {
    if (this._usesIconset()) {
      if (this._img && this._img.parentNode) {
        dom(this.root).removeChild(this._img);
      }
      if (this._iconName === "") {
        if (this._iconset) {
          this._iconset.removeIcon(this);
        }
      } else if (this._iconsetName && this._meta) {
        this._iconset = /** @type {?Polymer.Iconset} */ (
          this._meta.byKey(this._iconsetName));
        if (this._iconset) {
          this._iconset.applyIcon(this, this._iconName, this.theme);
          window.removeEventListener('iron-iconset-added', this._updateIcon);
        } else {
          window.addEventListener('iron-iconset-added', this._updateIcon);
        }
      }
    } else {
      if (this._iconset) {
        this._iconset.removeIcon(this);
      }
      if (!this._img) {
        this._img = document.createElement('img');
        this._img.style.width = '100%';
        this._img.style.height = '100%';
        this._img.draggable = false;
      }
      this._img.src = this.src;
      dom(this.root).appendChild(this._img);
    }
  }
}
customElements.define(PebbleIcon.is, PebbleIcon);
