/**
`fake-liquid-entity-data-get`

@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import '@polymer/iron-ajax/iron-ajax.js';
import '../../liquid-base-behavior/liquid-base-behavior.js';
import '../../bedrock-helpers/data-helper.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';

Polymer$0({
  _template: html`
        <!--<iron-ajax url="SampleOutput.json" handle-as="json" last-response="{{entityData}}"> -->
`,

  is: 'fake-liquid-entity-data-get',

  attached: function () {
       
  },

  ready: function () {
  },

  properties: {
      lastResponse:{
          type: Object,
          notify: true,
          value: function() {
              return {};
          }
      },
      requestData:{
          type: Object,
          notify: true,
          value: function() {
              return {};
          }
      },
      entityData:{
          type: Object,
          value: { 
              "content":{
                  "entities":{
                      "e6": {
                          "id": "e6",
                          "type": "nart",
                          "properties": {
                              "createdBy": "vishal"
                          },
                          "data": {
                              "contexts": {
                                  "productMaster#@#_ALL#@#SAP#@#en-US": {
                                      "attributes": {
                                          "ProductName": {
                                              "values": [
                                                  {
                                                      "attribute": "attributes/ProductName",
                                                      "source": "SAP",
                                                      "locale": "en-US",
                                                      "value": "Soft Shampoo & Bath"
                                                  },
                                                  {
                                                      "attribute": "attributes/ProductName",
                                                      "source": "SAP",
                                                      "locale": "de-DE",
                                                      "value": "Soft Shampoo & Bath"
                                                  },
                                                  {
                                                      "attribute": "attributes/ProductName",
                                                      "source": "PIM",
                                                      "locale": "en-US",
                                                      "value": "Soft Shampoo & Bath"
                                                  },
                                                  {
                                                      "attribute": "attributes/ProductName",
                                                      "source": "PIM",
                                                      "locale": "de-DE",
                                                      "value": "Soft Shampoo & Bath"
                                                  }
                                              ]
                                          }
                                      }
                                  }
                              }
                          }
                      }
                  }
              }
          }
      }
  },

  observers:[
      '_formatResponse(requestData)'
  ],

  _formatResponse: function() {
      if(this.requestData && this.requestData.params) {

          var query = this.requestData.params.query;
          var lists = [];
          var sources = [];
          var locales = [];

          if(query.contexts) {
              query.contexts.forEach(function(item) {
                  lists.push(item.list);
              }, this);
          }

          if(query.valueContexts) {
              query.valueContexts.forEach(function(item) {
                  if(sources.indexOf(item.source) < 0){
                      sources.push(item.source);
                  }

                  if(locales.indexOf(item.locale) < 0){
                      locales.push(item.locale);
                  }
              }, this);
          }

          if(this.entityData) {
              var clonedEntity = DataHelper.cloneObject(this.entityData);
              if(this.entityData) {
                  var currContexts = this.entityData.content.entities["e6"].data.contexts;
                  var attribute = currContexts[Object.keys(currContexts)[0]].attributes["ProductName"];
                  var selectedValues = [];

                  attribute.values.forEach(function(item) {
                      if(sources.indexOf(item.source) >= 0 && locales.indexOf(item.locale) >= 0) {
                          selectedValues.push(item);
                      }
                  }, this);

                  clonedEntity.content.entities["e6"].data.contexts[Object.keys(currContexts)[0]].attributes["ProductName"].values = selectedValues;
                  this.lastResponse = clonedEntity;
              }
          }
      }
  }
});
