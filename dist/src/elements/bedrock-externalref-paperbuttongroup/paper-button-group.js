/**
`paper-button-group` allows user to select only one button from a set.
Checking one button that belongs to a group unchecks any
previously checked button within the same group. Use
`selected` to get or set the selected button.

Example:

    <paper-button-group selected="small">
      <paper-button name="small">Small</paper-button>
      <paper-button name="medium">Medium</paper-button>
      <paper-button name="large">Large</paper-button>
    </paper-button-group>

See <a href="paper-button">paper-button</a> for more
information about `paper-button`.

@element paper-button-group
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import { IronSelectableBehavior } from '@polymer/iron-selector/iron-selectable.js';
import { IronA11yKeysBehavior } from '@polymer/iron-a11y-keys-behavior/iron-a11y-keys-behavior.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
Polymer$0({
  _template: Polymer.html`
        <slot></slot>
`,

  is: 'paper-button-group',

  behaviors: [
      IronSelectableBehavior,
      IronA11yKeysBehavior
  ],

  ready: function () {
      this.selectable = 'paper-button';
      this.selectedAttribute = 'active';
  }
});
