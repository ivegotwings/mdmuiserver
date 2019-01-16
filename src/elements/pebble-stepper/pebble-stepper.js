/**
`pebble-stepper` Represents a stepper element that supports the display of the multiple steps of flow and
different actions at the child steps level. It shows the number of child steps present in each step. When it is expanded, child steps are also expanded to
do different actions and to have their own content.

It exhibits as a simple plain layout or combination of its child elements such as
 `<pebble-step>`, `<pebble-step-badge-content>`, and `<pebble-step-details>`.

It supports both horizontal and vertical layouts.

### Styling

Custom property             | Description                          | Default
----------------------------|--------------------------------------|----------
`--pebble-vertical-step-transition-duration`  | Sets the transition duration for the step when selected| `500ms`
`--paper-badge-background`      | Sets the background of the child steps count badge  | `auto`
`--paper-badge-text-color`     | Sets the text-color of the child steps count badge | `auto`
`--paper-badge`| Mixin applied to the badge that shows count of child steps| 'auto'
`--connectorLine-width`| Sets the connector line width| `1px`
`--divider-color`| Sets the color of the connector line | `--paper-grey-300`
`--pebble-step-outer-badge-background` | Sets the background color of the outer badge | `#fff`
`--pebble-step-outer-badge-color` | Sets the color of the outer badge | `--paper-grey-300`
`--pebble-connected-badge-width` | Sets the width of the connected badge at top level| `auto`
`--pebble-connected-badge-height` | Sets the height of the connected badge at top level| `auto`
`--pebble-step-connected-badge-background` | Sets the background color of the connected badge at top level| `auto`
`--pebble-step-connected-badge-color` | Sets the color of the connected badge text at top level| `auto`
`--pebble-step-connected-badge-fontSize` | Sets the font size of the text in connected badge at top level| `auto`
`--pebble-connected-childBadge-width` | Sets the width of the connected badge at child level| `auto`
`--pebble-connected-childBadge-height` | Sets the height of the connected badge at child level| `auto`
`--pebble-connected-childBadge-background` | Sets the background color of the connected badge at child level| `auto`
`--pebble-connected-childBadge-color` | Sets the color of the connected badge text at child level| `auto`
`--pebble-connected-childBadge-fontSize` | Sets the font size of the text in connected badge at child level| `auto`
`--connectorLine-width` | Sets the width of connector line for elements at parent level | `1px`
`--child-connectorLine-width` | Sets the width of connector line for elements at parent level | `1px`
`--pebble-step-completed-label-color` | Sets the color of the step label for the step which is completed | `--paper-green-500`
`--pebble-step-completed-badge-color` | Sets the color of the connected badge of the completed step | `--paper-green-500`
`--pebble-step-completed-outer-badge-color` | Sets the color of the outer connected badge of the completed step | `paper-green-500`
`--pebble-step-completed-outer-badge-background-color` | Sets the color for the back gorund of the outer badge of completed step | `#fff`
`--pebble-step-inprogress-label-color` | Sets the color of the step label for the step which is in-progress | `--paper-blue-500`
`--pebble-step-inprogress-badge-color` | Sets the color of the connected badge of the in-progress step | `--paper-blue-500`
`--pebble-step-inprogress-outer-badge-color` | Sets the color of the outer connected badge of the in-progress step | `paper-blue-500`
`--pebble-step-inprogress-outer-badge-background-color` | Sets the color for the back gorund of the outer badge of in-progress step | `#fff`
`--pebble-horizontal-step-connector-line-width` | Sets the width of the connector line when stepper layout is horizontal | `auto`
`--pebble-horizontal-step-connector-line-width` | Sets the height of the connector line when stepper layout is horizontal | `auto`
`--pebble-horizontal-step-child-connector-line-width` | Sets the width of child connector line when stepper layout is horizontal | `auto`
`--pebble-horizontal-step-child-connector-line-height` | Sets the height of child connector line when stepper layout is horizontal | `auto`

### Accessibility

See the docs for `Polymer.IronSelectableBehavior` for accessibility features implemented by this element.

@group pebble Elements
@element pebble-stepper
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import { IronSelectableBehavior } from '@polymer/iron-selector/iron-selectable.js';
import '@polymer/iron-collapse/iron-collapse.js';
import './pebble-step.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleStepper extends mixinBehaviors([IronSelectableBehavior], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
    <style>
      :host([horizontal]) {
        @apply --layout-horizontal;
        @apply --stepper-horizontal;
      }
    </style>
    <slot></slot>
`;
  }

  static get is() {
    return "pebble-stepper";
  }

  static get properties() {
    return {
      /**
      * Indicates the layout of the stepper.
      * If it is set to <b>true</b>, then the stepper is positioned horizontally.
      */
      horizontal: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },

      /**
      * Indicates a readonly property whose value is set to `step` which is selected 
      * from multiple steps in a stepper.
      */
      selectedAttribute: {
        type: String,
        value: 'opened',
        readOnly: true
      },

      /**
      * Indicates the number of steps present in the given flow.
      * The default value is computed as number of steps in a flow.
      */
      steps: {
        type: Number,
        readOnly: true
      },

      /**
       * Indicates an object for configuring the stepper.
       */
      stepperConfig: {
        type: Object,
        value: function () { return {}; },
        observer: '_configChanged'
      },

      orderBy: {
        type: String,
        value: "ascending"
      },

      horizontalLineWidth: {
        type: String,
        value: "200px"
      }
    };
  }


  static get observers() {
    return [
      '_itemsChanged(items)'
    ];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  _configChanged(stepperConfig) {
    if (stepperConfig && stepperConfig.items && stepperConfig.items.length > 0) {
      for (let i = 0; i < stepperConfig.items.length; i++) {
        let item = stepperConfig.items[i];
        if (item.selected == true) {
          this.selected = i;
          break;
        }
      }
    }
  }

  _itemsChanged(items) {
    if (items && items.length && items.length > 0) {
      this._setSteps(items.length);
      for (let i = 0; i < items.length; i++) {
        items[i]._index = i + 1;
        items[i]._steps = items.length;
        items[i]._horizontal = this.horizontal;
        items[i].horizontalLineWidth = this.horizontalLineWidth;
      }
    }
  }
}

customElements.define(PebbleStepper.is, PebbleStepper);
