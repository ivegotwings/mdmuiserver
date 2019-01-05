import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '../rock-wizard.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
Polymer$0({
  _template: Polymer.html`
        <iron-ajax auto="" url="business-function-entity-create.json" handle-as="json" last-response="{{config}}"></iron-ajax>
        <rock-wizard config="{{config}}"></rock-wizard>
`,

  is: "rock-wizard-demo"
});
