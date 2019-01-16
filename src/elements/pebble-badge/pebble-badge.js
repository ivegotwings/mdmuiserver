/**
`<pebble-badge>` Represents a circular text badge. This shows up on the top right corner of an 
element and indicates a status or a notification. It labels an anchor element specified in the 
`for` attribute. If that does not exist, it centers to the parent node that contains it.

Badges can contain an icon by the addition of the `icon` attribute and setting
it to the identification of the desired icon. However, you must set the
`label` attribute to keep the element accessible. Also note that you have to import
the `pebble-icons` that include the icons you want to use. See the [pebble-icon](../elements/pebble-icon)
for more information on how to import and use icon sets.

### Example

    <div style="display:inline-block">
      <span>Inbox</span>
      <pebble-badge label="3"></pebble-badge>
    </div>

    <div>
      <pebble-button id="btn">Status</pebble-button>
      <pebble-badge icon="favorite" for="btn" label="favorite icon"></pebble-badge>
    </div>

    <div>
      <pebble-icon id="account-box" icon="account-box" alt="account-box"></pebble-icon>
      <pebble-badge icon="social:mood" for="account-box" label="mood icon"></pebble-badge>
    </div>

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--pebble-badge-background` | The background color of the badge | `--accent-color`
`--pebble-badge-opacity` | The opacity of the badge | `1.0`
`--pebble-badge-text-color` | The color of the badge text | `white`
`--pebble-badge-width` | The width of the badge circle | `20px`
`--pebble-badge-height` | The height of the badge circle | `20px`
`--pebble-badge-margin-left` | Optional spacing added to the left of the badge. | `0px`
`--pebble-badge-margin-bottom` | Optional spacing added to the bottom of the badge. | `0px`
`--pebble-badge` | Mixin applied to the badge | `{}`

### Accessibility

See the docs for `Polymer.IronResizableBehavior` for accessibility features implemented by this element.

@group Pebble Elements
@element pebble-badge
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../pebble-icon/pebble-icon.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
class PebbleBadge
  extends PolymerElement {
  static get template() {
    return html`
    <style include="bedrock-style-icons">
      :host {
        display: block;
        position: absolute;
        outline: none;
      }

      :host([hidden]),
      [hidden] {
        display: none !important;
      }

      .badge {
        @apply --layout;
        @apply --layout-center-center;
        @apply --paper-font-common-base;
        font-weight: normal;
        font-size: var(--font-size-sm, 12px);
        border-radius: 50%;
        margin-top: var(--pebble-badge-margin-top, 0px);
        margin-left: var(--pebble-badge-margin-left, 0px);
        margin-bottom: var(--pebble-badge-margin-bottom, 0px);
        width: var(--pebble-badge-width, 18px);
        height: var(--pebble-badge-height, 18px);
        background-color: var(--default-notification-color, #ed204c);
        border: 1px solid var(--default-notification-color, #ed204c);
        opacity: var(--pebble-badge-opacity, 1.0);
        color: var(--default-notification-text-color, #ffffff);
        @apply --pebble-badge;
        @apply --header-badge;
      }
    </style>

    <div class="badge">
      <pebble-icon class="pebble-icon-size-16" hidden\$="{{!_computeIsIconBadge(icon)}}" icon="{{icon}}"></pebble-icon>
      <span id="badge-text" hidden\$="{{_computeIsIconBadge(icon)}}">{{label}}</span>
    </div>
`;
  }

  static get is() { return 'pebble-badge' }

  static get properties() {
    return {
      /**
       * Indicates an identification of the element that the badge is anchored to. This element
       * must be a sibling of the badge.
       */
      for: {
        type: String,
        observer: '_forChanged'
      },

      /**
       * Indicates that the label is shown on the badge. The label is centered and it
       * must have lesser characters.
       */
      label: {
        type: String,
        observer: '_labelChanged'
      },

      /**
       * Indicates an identification of the pebble-icon. When you give this icon, the badge content uses an
       * `<pebble-icon>` element that displays the given icon identification rather than the
       * label text. However, you can continue to use the label text for
       * accessibility purposes.
       */
      icon: {
        type: String,
        value: ''
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateTarget();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  ready() {
    super.ready();
    this._ensureAttribute('role', 'status');
    this._ensureAttribute('tabindex', 0);
  }

  attributeChanged(name) {
    if (name === 'hidden') {
      this.updatePosition();
    }
  }

  _forChanged() {
    // The first time the property is set is before the badge is attached,
    // which means we're not ready to position it yet.
    if (!this.isAttached) {
      return;
    }
    this._updateTarget();
  }

  _labelChanged() {
    this.setAttribute('aria-label', this.label);
  }

  _updateTarget() {
    this._target = this.target;
    // setTimeout(() => { this.notifyResize, 1 });
  }

  _computeIsIconBadge(icon) {
    return icon.length > 0;
  }

  /**
   * Can be used to return the target element that this badge is anchored to. It is
   * either the element given by the `for` attribute or the immediate parent
   * of the badge.
   */
  get target() {
    let parentNode = dom(this).parentNode;
    // If the parentNode is a document fragment, then we need to use the host.
    let ownerRoot = dom(this).getOwnerRoot();
    let target;

    if (this.for) {
      target = dom(ownerRoot).querySelector('#' + this.for);
    } else {
      target = parentNode.nodeType == Node.DOCUMENT_FRAGMENT_NODE ?
        ownerRoot.host : parentNode;
    }

    return target;
  }

  /**
   * Can be used to re-position the badge relative to its anchor element. This is invoked
   * automatically when the badge is attached or an `iron-resize` event is
   * fired. For example: if the window is resized or your target is a
   * custom element that implements IronResizableBehavior.
   *
   * Invoke this function in all other conditions when the anchor's positions changes. 
   * For example: If its visibility changes or when you do 
   * a page re-layout manually.
   */
  updatePosition() {
    if (!this._target)
      return;

    if (!this.offsetParent)
      return;

    let parentRect = this.offsetParent.getBoundingClientRect();
    let targetRect = this._target.getBoundingClientRect();
    let thisRect = this.getBoundingClientRect();

    this.style.left = targetRect.left - parentRect.left +
      (targetRect.width - thisRect.width / 2) + 'px';
    this.style.top = targetRect.top - parentRect.top -
      (thisRect.height / 2) + 'px';
  }
}
customElements.define(PebbleBadge.is, PebbleBadge)
