import '@polymer/polymer/polymer-legacy.js';
import './pubsub-demo.js';
import '../../bedrock-ui-behavior/bedrock-ui-behavior.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
Polymer$0({
  _template: Polymer.html`
        <pubsub-demo id="pubsubDemo"></pubsub-demo>
        <bedrock-pubsub target-id="pubsubDemo" event-name="event1" handler="_eventHandler"></bedrock-pubsub>
        <bedrock-pubsub target-id="pubsubDemo" event-name="event2" handler="_eventHandler"></bedrock-pubsub>
`,

  is: "demo-host",

  properties: {

  },

  behaviors: [
      RUFBehaviors.UIBehavior
  ],

  _eventHandler: function(e){
      this.$.pubsubDemo.eventInfo = e.detail.msg;
      this.$.pubsubDemo.className = e.detail.cssClass;
  }
});
