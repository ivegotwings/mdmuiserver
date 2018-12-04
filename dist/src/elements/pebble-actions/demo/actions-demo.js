import '@polymer/polymer/polymer-legacy.js';
import '../pebble-actions.js';
import '../../bedrock-pubsub/bedrock-pubsub.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '../../bedrock-ui-behavior/bedrock-ui-behavior.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
Polymer$0({
  _template: Polymer.html`
        <iron-ajax auto="" url="actionsData.json" handle-as="json" last-response="{{actionsData}}"></iron-ajax>
        <bedrock-pubsub event-name="pebble-actions-action-click" handler="onActionItemClick" target-id=""></bedrock-pubsub>
        <pebble-actions id="actionsButton" button-icon="pebble-icons:Done" button-text="Actions" actions-data="[[actionsData]]"></pebble-actions>
`,

  is: "actions-demo",

  behaviors: [
      RUFBehaviors.UIBehavior
  ],

  onActionItemClick: function(e, detail, sender) {
      alert("event triggered: " + JSON.stringify(detail)); 
  }
})
