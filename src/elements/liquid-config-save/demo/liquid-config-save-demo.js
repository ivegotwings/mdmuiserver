import '@polymer/polymer/polymer-legacy.js';
import '../liquid-config-save.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';

Polymer$0({
  _template: html`
        <liquid-config-save verbose="" name="configSaveService" on-response="_onSaveResponse"></liquid-config-save>
`,

  is: 'liquid-config-save-demo',

  properties: {
      configs: {
          type: Object,
          value: function () {
              return {
                  "configObjects": [
                      {
                          "id": "app-entity-discovery_saved-search",
                          "name": "app-entity-discovery_saved-search",
                          "version": "1.0",
                          "type": "savedSearch",
                          "properties": {
                              "createdByService": "entityservice",
                              "createdBy": "user"
                          },
                          "data": {
                              "contexts": [
                                  {
                                      "context": {
                                          "app": "app-entity-discovery",
                                          "service": "_ALL",
                                          "component": "_ALL",
                                          "subComponent": "_ALL"
                                      },
                                      "jsonData": {
                                          "config": {
                                              "id": 10,
                                              "accesstype": "self",
                                              "name": "Women's Sport Wear & Dresses - Advanced",
                                              "icon": "pebble-icons:SavedSearch",
                                              "shared": true,
                                              "dimensions": {
                                                  "catalog": "productMaster",
                                                  "Source": "internal",
                                                  "Locale": "en-US",
                                                  "TimeSlice": "Now"
                                              },
                                              "searchQuery": "dresses",
                                              "searchTags": [
                                                  {
                                                      "name": "description",
                                                      "longName": "Description",
                                                      "options": {
                                                          "displayType": "textArea"
                                                      },
                                                      "value": {
                                                          "eq": "dresses"
                                                      }
                                                  }
                                              ]
                                          }
                                      }
                                  }
                              ]
                          }
                      }
                  ]
              };
          },
          notify: true
      },
      _isCreated: {
          type: Boolean,
          value: false
      },
      _isUpdated: {
          type: Boolean,
          value: false
      }
  },

  generateRequest: function () {
      var config = this.configs.configObjects[0];
      config.name = config.name + '-' + this.getRandomString();
      config.id = config.name + '_savedSearch';

      var configSaveService = this.shadowRoot.querySelector('[name="configSaveService"]');

      if(configSaveService) {
          configSaveService.operation = "create";
          configSaveService.requestData = this.configs;
          configSaveService.generateRequest();
      }
  },

  getRandomString: function () {
      var x = 2147483648;
      return Math.floor(Math.random() * x).toString(36) +
          Math.abs(Math.floor(Math.random() * x) ^ new Date().getTime()).toString(36);
  },

  _onSaveResponse: function (e) {
      if(!this._isCreated && !this._isUpdated) {
          console.log('config create response ', e.detail);
          this._isCreated = true;
          var config = this.configs.configObjects[0];

          config.data.contexts[0].jsonData.config.name = config.data.contexts[0].jsonData.config.name + '- updated - ' + this.getRandomString();

          var configSaveService = this.shadowRoot.querySelector('[name="configSaveService"]');

          if(configSaveService) {
              configSaveService.operation = "update";
              configSaveService.requestData = this.configs;
              configSaveService.generateRequest();
          }
      }
          
      if(!this._isUpdated) {
          console.log('config update response ', e.detail);
          this._isUpdated = true;
      }
  }
});
