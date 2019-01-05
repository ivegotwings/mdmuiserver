/*<link rel="import" href="../liquid-dataobject-utils/liquid-dataobject-utils.html">*/
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
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../liquid-rest/liquid-rest.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-button/pebble-button.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockRePublish
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior
    ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style>
            .message {
                text-align: center;
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <div class="message">[[_message]]</div>
        <liquid-rest id="rePublish" url="/data/cop/publish" method="POST" request-data="{{_rePublishRequest}}" on-liquid-response="_onRePublishSuccess" on-liquid-error="_onRePublishFailure"></liquid-rest>
`;
  }

  static get is() { return 'rock-re-publish' }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          syncThreshold: {
              type: Number,
              value: 0
          },

          selectionQuery: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
          * <b><i>Content development is under progress... </b></i> 
          */
          selectedEntities: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          profiles: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _loading: {
              type: Boolean,
              value: false
          },

          _message: {
              type: String
          },

          _rePublishRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _rePublishResponse: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _isPublished: {
              type: Boolean,
              value: false
          },
          selectionMode: {
              type: String,
              value: "count"
          },
          _workAutomationId: {
              type: String
          }
      }
  }
  static get observers() {
      return [
          '_executeRePublishProcess(selectedEntities)'
      ]
  }
  _executeRePublishProcess() {

      if (this.selectedEntities && this.selectedEntities.length > 0 &&
          this.profiles && this.profiles.length > 0) {
          let validatePublishResult = this._validateRePublish();
          if (validatePublishResult.valid) {

              this._loading = true;
              this._message = "Publish process started";
              this._generateRePublishRequest();
          }
          else {
              this._showToastMessage(validatePublishResult);
          }
      }

  }
  _showToastMessage(msgObject) {
      if (msgObject) {
          if (msgObject.type == "error") {
              this.showWarningToast(msgObject.message, 10000);
          } else if (msgObject.type == "success") {
              this.showSuccessToast(msgObject.message, 10000);
          }
      }
  }
  _validateRePublish() {
      let resultObj = {
          valid: false,
          type: 'error',
          message: "welcome"
      };

      let selectedEntities = this.selectedEntities;

      if (this.selectionMode == "query" || (this.selectionMode == "count" && this.selectedEntities.length > this.syncThreshold)) {
          resultObj.message = "Config Not Found."
          let rock_republish_config = this.parentElement.__dataHost.config;
          if (rock_republish_config) {
              let rePublishConfig = rock_republish_config.steps;
              if (rePublishConfig && rePublishConfig.length > 0) {
                  let profiles = rePublishConfig[0].component.properties.profiles;
                  if (profiles && profiles.length > 0) {
                      let typesInConfig = [];

                      _.each(profiles, function (element) {
                          typesInConfig = _.union(typesInConfig, element[
                              "types-criterion"]);
                      });
                      let isValid = true;

                      if (typesInConfig.length > 0) {
                          for (let index = 0; index < selectedEntities.length; index++) {
                              let element = selectedEntities[index];
                              if (typesInConfig[0] != "_ALL" && typesInConfig.indexOf(element.type) == -1) {
                                  isValid = false;
                                  resultObj.message =
                                      "You can publish only following entity types: " +
                                      typesInConfig.toString();
                                  break;
                              }
                          }
                      }
                      resultObj.valid = isValid;
                  }
              }
          }
      }
      return resultObj;
  }
  _generateRePublishRequest() {
      //Prepare request without entity
      let req = DataRequestHelper.createRePublishRequest(this.profiles, this.contextData);
      if (DataHelper.isValidObjectPath(req, 'params.query.filters.typesCriterion') && req.params.query.filters.typesCriterion.length == 0) {
          if (DataHelper.isValidObjectPath(this.selectionQuery, 'filters.typesCriterion')) {
              req.params.query.filters.typesCriterion = this.selectionQuery.filters.typesCriterion;
          } else if (DataHelper.isValidObjectPath(this.selectionQuery, 'params.query.filters.typesCriterion')) {
              req.params.query.filters.typesCriterion = this.selectionQuery.params.query.filters.typesCriterion;
          }
      }
      let profileContexts = [];
      if (this.profiles && this.profiles.length) {
          let copContext = this.profiles[0].copContext;
          profileContexts.push(copContext);
      }
      if (this.selectionMode == "query" && !_.isEmpty(this.selectionQuery)) {
          req = {
              "clientState": {
                  "notificationInfo": {
                      "userId": DataHelper.getUserId()
                  }
              },
              "params": {
                  "fields": {
                      "relationships": [
                          "_ALL"
                      ],
                      "attributes": [
                          "_ALL"
                      ]
                  },
                  "rsconnect": {
                      "includeValidationData": true,
                      "profilecontexts": profileContexts
                  }
              }
          };
          if (this.selectionQuery.params && this.selectionQuery.params.isCombinedQuerySearch) {
              req.params.isCombinedQuerySearch = true;
              req.params.query = {};
              req.params.query.entity = this.selectionQuery.entity;
          } else {
              req.params.query = this.selectionQuery.params ? this.selectionQuery.params.query : this.selectionQuery;
          }
          req.fileName = "EntityData";
      } else if (this.selectionMode == "count" && this.selectedEntities.length) {
          let entities = [];
          for (let i = 0; i < this.selectedEntities.length; i++) {
              entities.push(this.selectedEntities[i].id);
          }
          req["params"]["query"]["ids"] = entities;
      }
      if (DataHelper.isHotlineModeEnabled()) {
          req.hotline = true;
      }
      //Add contexts to request
      let dataContexts = ContextHelper.getDataContexts(this.contextData);
      if (!_.isEmpty(dataContexts) && req.params.query) {
          req.params.query.contexts = dataContexts;
      }
      this.set("_rePublishRequest", req);
      let liquidRePublish = this.shadowRoot.querySelector("#rePublish");
      if (liquidRePublish) {
          this.set("_workAutomationId", "");
          liquidRePublish.generateRequest();
      }
  }
  _onRePublishSuccess(e) {
      let response = e.detail.response;
      if (response && response["dataObjectOperationResponse"]) {
          this.set("_rePublishResponse", response['dataObjectOperationResponse']);
          if (this._rePublishResponse && this._rePublishResponse["status"]
              && (this._rePublishResponse["status"] == "success")) {
              this._isPublished = true;
              if (this._rePublishResponse["statusDetail"] && this._rePublishResponse["statusDetail"]['childTaskIds']) {
                  let childTaskIds = this._rePublishResponse["statusDetail"]['childTaskIds'];
                  if (childTaskIds.length > 0) {
                      this._workAutomationId = childTaskIds[0];
                  }
              }
          }
      }
      this._triggerFinishStep();
  }
  _onRePublishFailure(e) {
      console.warn("Failed to perform publish with error: ", e.detail);
      this._triggerFinishStep();
  }
  _triggerFinishStep() {

      let data = {
          "messages": [
              {
                  "message": "Failed to perform publish. Contact administrator."
              }
          ],
          "actions": [
              {
                  "name": "goBack",
                  "text": "Take Me back to Where I started"
              }
          ]
      };

      if (this._isPublished) {
          data["messages"][0]["message"] = "Publish successful.";
          let _resultMessage = "You can view the task details";
          if (this._workAutomationId) {
              _resultMessage = "You can view the status of the task " + this._workAutomationId + " in the Task Details";
          }
          data["messages"].push({
              "message": _resultMessage
          });
          data["actions"].push({
              "name": "gotoTaskDetails",
              "text": "Show me the task details",
              "dataRoute": "task-detail",
              "queryParams": {
                  "id": this._workAutomationId
              }
          })
      }
      this._message = "";
      this._loading = false;

      this.businessFunctionData = data;
      let eventName = "onComplete";
      let eventDetail = {
          name: eventName
      }
      this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true
      });

      //Reset
      this.selectedEntities = [];
      this.profiles = [];
  }
}
customElements.define(RockRePublish.is, RockRePublish)
