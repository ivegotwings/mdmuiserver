import '@polymer/polymer/polymer-legacy.js';
import '../pebble-graph-pie.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
Polymer$0({
  _template: Polymer.html`
        <pebble-graph-pie data="{{data}}" on-selection-changed="_onSelectionChanged"></pebble-graph-pie>
`,

  is: 'pebble-graph-pie-demo1',

  attached: function () {
  },

  properties: {
      data: {
          type: Array,
          value: [
          {
              "id": 1,
              "key": "Queued",
              "value": 60,
              "clickable": true
          },
          {
              "id": 2,
              "key": "Pending",
              "value": 30,
              "clickable": true
          },
          {
              "id": 3,
              "key": "Error",
              "value": 20,
              "clickable": true
          },
          {
              "id": 4,
              "key": "Complete",
              "value": 10,
              "clickable": true
          }
          ]
      }
  },

  _onSelectionChanged: function (e) {
      console.log('selection changed ', JSON.stringify(e));
  }
});
