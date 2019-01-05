import '@polymer/polymer/polymer-legacy.js';
import '../rock-dimension-grid.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';

Polymer$0({
  _template: html`
        <rock-dimension-grid data-id="e6" attribute-name="ProductName"></rock-dimension-grid>
`,

  is: 'rock-dimension-grid-demo',

  properties: {

  },

  attached: function () {
      var element = dom(this).node.shadowRoot.querySelector('rock-dimension-grid');

      element.attributeModelObject = {
          "displayType": "textbox",
          "longName": "ProductName",
          "name": "ProductName"
      };

      element.locales = [{
          "id": 1,
          "title": "English",
          "subtitle": "",
          "image": "lookup-item.jpg"
      }, {
          "id": 2,
          "title": "French",
          "subtitle": "",
          "image": "lookup-item.jpg"
      }, {
          "id": 3,
          "title": "German",
          "subtitle": "",
          "image": "lookup-item.jpg"
      }, {
          "id": 4,
          "title": "China",
          "subtitle": "",
          "image": "lookup-item.jpg"
      }, {
          "id": 5,
          "title": "Russia",
          "subtitle": "",
          "image": "lookup-item.jpg"
      }, {
          "id": 6,
          "title": "Dutch",
          "subtitle": "",
          "image": "lookup-item.jpg"
      }];

      element.sources = [{
          "id": 1,
          "title": "PIM",
          "subtitle": "",
          "image": "lookup-item.jpg"
      }, {
          "id": 2,
          "title": "SAP",
          "subtitle": "",
          "image": "lookup-item.jpg"
      }, {
          "id": 3,
          "title": "PLM",
          "subtitle": "",
          "image": "lookup-item.jpg"
      }];

      element.contexts = [{
          "id": 1,
          "title": "Master",
          "subtitle": "",
          "image": "lookup-item.jpg"
      }, {
          "id": 2,
          "title": "Germany Website",
          "subtitle": "",
          "image": "lookup-item.jpg"
      }, {
          "id": 3,
          "title": "UK Website",
          "subtitle": "",
          "image": "lookup-item.jpg"
      }];
  }
});
