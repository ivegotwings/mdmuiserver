/**
`<pebble-vertical-divider>` Represents a divider to create a vertical partition.
It provides styles for color as a mixin variable. It can style the target element directly.

### Example

For example, the following code implements simple vertical line with black color.
    
    <pebble-vertical-divider></pebble-vertical-divider>
        <style>
          pebble-vertical-divider {
              --pebble-vertical-divider-color: black;
          }
      </style>

### Styling

Custom property | Description | Default
----------------|-------------|----------
`--pebble-vertical-divider-color` | Mixin applied to pebble-vertical-divider | `#FFF`

@group pebble Elements
@element pebble-vertical-divider
@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

class PebbleVerticalDivider extends PolymerElement {
  static get template() {
    return Polymer.html`
    <style>
      :host {
        display: inline-block;
        height: var(--pebble-vertical-divider-height, 16px);
        min-width: 1px;
        max-width: 2px;
        margin-left: 5px;
        margin-right: 5px;
        background-color: var(--pebble-vertical-divider-color, #FFF);
        opacity: 0.5;
        height: auto;
        min-height: var(--pebble-vertical-divider-height, 24px);
        width: 0px;
        margin-left: 1px;
        margin-right: 1px;
        border-right: var(--pebble-vertical-divider-color, #FFF);
        border-left: var(--pebble-vertical-divider-color, #FFF);
        opacity: 0.4;
        padding: 0;
        vertical-align: sub;
        @apply --pebble-vertical-divider;
      }
    </style>
`;
  }

  static get is() {
    return "pebble-vertical-divider";
  }
}
customElements.define(PebbleVerticalDivider.is, PebbleVerticalDivider);
