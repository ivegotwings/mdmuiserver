import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-demo-helpers/demo-pages-shared-styles.js';
import '@polymer/iron-demo-helpers/demo-snippet.js';
import '@polymer/paper-button/paper-button.js';
import './common-styles.js';
import '../bedrock-pubsub.js';
import '../../bedrock-ui-behavior/bedrock-ui-behavior.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
Polymer$0({
  _template: Polymer.html`
        <style include="demo-pages-shared-styles common-styles">
            
            paper-button {
                width: 50%;
                margin-bottom: 10px;
            }
            
            #button1 {
                background: gray;
            }
            
            #button1:hover {
                background: green;
            }
            
            #button2 {
                background: gray;
            }
            
            #button2:hover {
                background: red;
            }
            
            #eventInfo {
                margin-top: 30px;
            }
            
            .green {
                color: green;
            }
            
            .red {
                color: red;
            }
        </style>

<div class="vertical-section vertical-section-container centered">
    <h3> A bedrock-pubsub</h3>
    <h1>&lt;bedrock-pubsub&gt;</h1>
    <div class="snippet">
        <div class="demo">
            <paper-button id="button1" on-tap="_onButton1Click" raised="">Button1</paper-button>
            <paper-button id="button2" on-tap="_onButton2Click" raised="">Button2</paper-button>
        </div>
        <div class="code">
            <code>Event is raised by button clicks as below</code>
            <code>&lt;paper-button id="button1" on-tap="_onButton1Click" raised&gt;Button1&lt;/paper-button&gt;</code>
            <code>&lt;paper-button id="button2" on-tap="_onButton2Click" raised&gt;Button2&lt;/paper-button&gt;</code>
            <br>
            <code>Events can be handled outside as below</code>
            <code>&lt;bedrock-pubsub target-id="button1" event-name="event1" handler="demoEvent"&gt;&lt;/bedrock-pubsub&gt;</code>
            <code>&lt;bedrock-pubsub target-id="button2" event-name="event2" handler="demoEvent"&gt;&lt;/bedrock-pubsub&gt;</code>
        </div>
    </div>
    <div id="eventDetail" class\$="{{className}}">
        <div>
            <code>demo-app</code> got a <span> {{eventInfo}}</span> <code>event</code>
        </div>
    </div>

</div>
`,

  is: "pubsub-demo",

  properties: {
      eventInfo: {
          type: String,
          value: "No"
      },
      className: {
          type: String,
          value: ""
      }

  },

  behaviors: [
      RUFBehaviors.UIBehavior
  ],

  _onButton1Click: function (e) {
      this.fireBedrockEvent("event1", { msg: "button1 click data!", cssClass: "green" });
  },

  _onButton2Click: function (e) {
      this.fireBedrockEvent("event2", { msg: "button2 click data!", cssClass: "red" });
  }
});
