import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '../pebble-stepper.js';
import '../pebble-step.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
Polymer$0({
  _template: html`
       <style>
         :host {
            display: block;
        }
       </style>
       <iron-ajax auto="" url="../demo/data.json" handle-as="json" last-response="{{stepItems}}"></iron-ajax>
       <pebble-stepper id="stepper" stepper-config="[[stepItems]]">
        <template is="dom-repeat" items="{{stepItems.items}}">
            <pebble-step data="{{item}}"></pebble-step>
        </template>
      </pebble-stepper>
`,

  is: "sample-steps",

  get stepper() {
      return this.$.stepper;
  }
});
