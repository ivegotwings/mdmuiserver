/**
<b><i>Content development is under progress... </b></i>

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/entity-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/data-helper.js';
import '../pebble-spinner/pebble-spinner.js';
import '../liquid-rest/liquid-rest.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityDownload extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        [[_message]]
        <liquid-rest id="copDownloadService" url="" method="POST" request-data="{{_copDownloadRequest}}" on-liquid-response="_onCOPDownloadSuccess" on-liquid-error="_onCOPDownloadFailure"></liquid-rest>
`;
  }

  static get is() {
      return "rock-entity-download";
  }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          skipNext: {
              type: Boolean,
              value: false
          },

          businessFunctionData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          selectedEntities: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _loading: {
              type: Boolean,
              value: false
          },

          selectionMode: {
              type: String,
              value: "count"
          },

          selectionQuery: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          selectedItemsCount: {
              type: Number,
              value: 0
          },

          syncThreshold: {
              type: Number,
              value: 0
          },

          _copDownloadRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          selectedAttributes: {
              type: Array
          },

          _message: {
              type: String
          },

          copContext: {
              type: Object,
              value: function () {
                  return {};
              }
          }
      };
  }

  static get observers() {
      return [
          '_onDownload(selectionMode, selectedEntities,selectedAttributes, copContext)'
      ];
  }

  constructor() {
      super();
  }

  connectedCallback() {
      super.connectedCallback();
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

  _onDownload(selectionMode, selectedEntities, selectedAttributes, copContext) {
      if (!_.isEmpty(selectionMode) && !_.isEmpty(selectedEntities) && !_.isEmpty(
          copContext)) {
          let profileContexts = [];
          profileContexts.push(copContext);
          let attributes = ["_ALL"];
          if (selectedAttributes && selectedAttributes.length) {
              attributes = selectedAttributes.map(function (item) {
                  return item.name;
              });
          }
          let attrLength = "all";
          if (attributes && attributes.length) {
              if (attributes[0] != "_ALL") {
                  attrLength = attributes.length;
              }
          }
          let count = this.selectedItemsCount || selectedEntities.length;
          this._message = "Downloading " + count + " entities with " + attrLength +
              " attributes";
          if (this.selectionMode == "query" || (this.selectionMode == "count" && this.selectedEntities
              .length > this.syncThreshold)) {
              let req = undefined;
              if (this.selectionMode == "query" && !_.isEmpty(this.selectionQuery)) {
                  req = {
                      "clientState": {
                          "notificationInfo": {
                              "userId": DataHelper.getUserId()
                          }
                      },
                      "params": {
                          "fields": {
                              "attributes": attributes,
                              "relationships": [
                                  "_ALL"
                              ]
                          },
                          "rsconnect": {
                              "includeValidationData": true,
                              "profilecontexts": profileContexts
                          }
                      }
                  };

                  req.params.rsconnect.profilecontexts[0].channel = "JOB";

                  if (this.selectionQuery.params && this.selectionQuery.params.isCombinedQuerySearch) {
                      req.params.isCombinedQuerySearch = true;
                      req.params.query = {};
                      req.params.query.entity = this.selectionQuery.entity;
                  } else {
                      req.params.query = this.selectionQuery.params ? this.selectionQuery
                          .params.query : this.selectionQuery;
                  }
              } else if (this.selectionMode == "count" && this.selectedEntities.length) {
                  if (this.selectedEntities && this.selectedEntities.length && this.contextData) {
                      this._loading = true;
                      req = this._prepareRequestObjectForSelectedEntities(this.selectedEntities,
                          attributes, profileContexts);
                  } else {
                      let data = {
                          "messages": [{
                              "message": "Select at least one entity from grid to download."
                          }],
                          "actions": [{
                              "name": "closeFunction",
                              "text": "Take Me back to Where I started",
                              "action": {
                                  "name": "refresh-data"
                              }
                          }]
                      };

                      this._gotToNextStep(data);
                  }
              }

              if (req) {
                  let valContexts = ContextHelper.getValueContexts(this.contextData);
                  if(!_.isEmpty(valContexts) && valContexts[0].locale){
                      if(DataHelper.isValidObjectPath(req,'params.query')) {
                          req.params.query.valueContexts = valContexts;
                      }
                  }
                  
                  req.params.rsconnect.profilecontexts[0].channel = "JOB";
                  req.fileName = "EntityData";
                  this._setHotlineRequest(req);
                  this._copDownloadRequest = req;

                  //console.log('cop download job req', JSON.stringify(req, null, 2));
                  let copDownloadLiquid = this.shadowRoot.querySelector(
                      "#copDownloadService");
                  if (copDownloadLiquid) {
                      copDownloadLiquid.url = "/data/cop/downloadDataJob";
                      copDownloadLiquid.timeout = 600000;
                      copDownloadLiquid.generateRequest();
                  }
              }
          } else {
              if (this.selectedEntities && this.selectedEntities.length && this.contextData) {
                  this._loading = true;
                  let req = this._prepareRequestObjectForSelectedEntities(this.selectedEntities, attributes, profileContexts);
                  let valContexts = ContextHelper.getValueContexts(this.contextData);
                  if (req) {
                      if(!_.isEmpty(valContexts) && valContexts[0].locale) {
                          if(DataHelper.isValidObjectPath(req,'params.query')) {
                              req.params.query.valueContexts = valContexts;
                          }
                      }

                      req.fileName = "EntityData";
                      this._setHotlineRequest(req);
                      let _this = this;
                      RUFUtilities.fileDownload("/data/cop/downloadDataExcel", {
                          httpMethod: 'POST',
                          fileName: "EntityData",
                          data: {
                              data: JSON.stringify(req)
                          },
                          successCallback: function (url) {
                              this._onDownloadSuccess();
                          }.bind(_this),
                          failCallback: function (responseHtml, url, error) {
                              this._onDownloadFailure(responseHtml);
                          }.bind(_this)
                      });
                  }
              }
          }
      }
  }

  _setHotlineRequest(request) {
      //Add hotline flag if hotline is enabled
      if (DataHelper.isHotlineModeEnabled()) {
          request.hotline = true;
      }
  }

  _onDownloadSuccess() {
      let data = {
          "messages": [{
              "message": "Data got downloaded successfully."
          }],
          "actions": [{
              "name": "closeFunction",
              "text": "Take Me back to Where I started",
              "action": {
                  "name": "refresh-data"
              }
          }]
      };
      this._gotToNextStep(data);
  }

  _onDownloadFailure(error) {
      this.logError("Failed to download entity data", error);
      let data = {
          "messages": [{
              "message": "Failed to download entity data. : " +
                  error
          }],
          "actions": [{
              "name": "closeFunction",
              "text": "Take Me back to Where I started",
              "action": {
                  "name": "refresh-data"
              }
          }]
      };

      this._gotToNextStep(data);
  }

  _onCOPDownloadSuccess(e) {
      if (e.detail && e.detail.response && e.detail.response.dataObjectOperationResponse) {
          let response = e.detail.response.dataObjectOperationResponse;
          let data = {};

          if (response.status.toLowerCase() == "success") {

              let taskId = response.dataObjects[0].properties.workAutomationId;
              data = {
                  "messages": [{
                      "message": "File download job started."
                  }],
                  "actions": [{
                      "name": "closeFunction",
                      "text": "Take Me back to Where I started",
                      "action": {
                          "name": "refresh-data"
                      }
                  },
                  {
                      "name": "nextAction",
                      "text": "Take Me To Task Detail View",
                      "dataRoute": "task-detail",
                      "queryParams": {
                          "id": taskId
                      },
                      "action": {
                          "name": "refresh-data"
                      }
                  }
                  ]
              };
          } else if (response.status.toLowerCase() == "error") {
              this.logError("Failed to start download entity data job", response);
              let error = response.statusDetail && response.statusDetail.message ?
                  response.statusDetail.message : "";
              data = {
                  "messages": [{
                      "message": "Failed to start download entity data job. Contact administrator: " +
                          error
                  }],
                  "actions": [{
                      "name": "closeFunction",
                      "text": "Take Me back to Where I started",
                      "action": {
                          "name": "refresh-data"
                      }
                  }]
              };
          }

          this._gotToNextStep(data);
      }
  }

  _onCOPDownloadFailure(e) {
      this.logError("Failed to start download entity data job", e.detail);
      if (e && e.detail && e.detail.response) {
          let error = DataHelper.validateAndGetMessage(e.detail.response);
          let data = {
              "messages": [{
                  "message": "Failed to start download entity data job. Contact administrator: " +
                      error
              }],
              "actions": [{
                  "name": "closeFunction",
                  "text": "Take Me back to Where I started",
                  "action": {
                      "name": "refresh-data"
                  }
              }]
          };

          this._gotToNextStep(data);
      }
  }

  _prepareRequestObjectForSelectedEntities(selectedEntities, attributes,
      profileContexts) {
      let req;

      if (selectedEntities && selectedEntities.length) {
          let clonedDataContext = DataHelper.cloneObject(this.contextData);
          let itemContext = {};
          itemContext.id = [];
          itemContext.type = [];

          this.selectedEntities.forEach(function (item) {
              if (item) {
                  itemContext.id.push(item.id);

                  if (itemContext.type.indexOf(item.type) == -1) {
                      itemContext.type.push(item.type);
                  }
              }
          }, this);

          itemContext.attributeNames = attributes;
          itemContext.relationships = ["_ALL"];
          itemContext.relationshipAttributes = ["_ALL"];
          clonedDataContext[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];

          req = DataRequestHelper.createEntityGetRequestForDownload(clonedDataContext,
              profileContexts);
      }

      return req;
  }

  _gotToNextStep(data) {
      this.businessFunctionData = data;
      ComponentHelper.getParentElement(this).businessFunctionData = data;
      let eventName = "onDownload";
      let eventDetail = {
          name: eventName,
          data: {
              "skipNext": this.skipNext
          }
      };
      this._loading = false;
      this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true
      });
  }
}

customElements.define(RockEntityDownload.is, RockEntityDownload);
