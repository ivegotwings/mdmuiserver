/**
`<pebble-horizontal-divider>` Represents a divider that creates a horizontal partition.
It provides the styles for color as a mixin variable and can be styled directly to target the element.

The following code implements simple horizontal line with black color.

### Example    
    <pebble-horizontal-divider></pebble-horizontal-divider>
        <style>
         pebble-horizontal-divider {
              --pebble-horizontal-divider-color: #000;
         }
        </style>

### Styling
Custom property | Description | Default
----------------|-------------|----------
`--pebble-horizontal-divider-color` | Mixin applied to pebble-horizontal-divider | `#FFF`

@group pebble Elements
@element pebble-horizontal-divider
@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

class PebbleHorizontalDivider extends PolymerElement {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
        height: 2px;
        min-height: 2px;
        max-height: 2px;
        background-color: var(--pebble-horizontal-divider-color, #FFF);
        opacity: 0.5;
        @apply --pebble-horizontal-divider;
      }
    </style>
`;
  }

  static get is() {
    return "pebble-horizontal-divider";
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}
customElements.define(PebbleHorizontalDivider.is, PebbleHorizontalDivider);
