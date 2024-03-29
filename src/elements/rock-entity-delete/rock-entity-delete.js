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
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityDelete extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style>
            .message {
                text-align: center;
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <div class="message">[[_message]]</div>
        <liquid-rest id="asyncEntityBulkDelete" method="POST" url="{{_requestURL}}" request-data="{{_asyncDeleteRequest}}" on-liquid-response="_onAsyncDeleteSuccess" on-liquid-error="_onAsyncDeleteFailure">
        </liquid-rest>
`;
  }

  static get is() {
      return "rock-entity-delete";
  }

  static get properties() {
      return {
          /**
           * Represents selection mode query or count
           */
          selectionMode: {
              type: String,
              value: "count"
          },

          /**
           * Represents criteria query
           */
          selectionQuery: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          contextData: {
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

          _message: {
              type: String
          },

          _deleteRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _asyncDeleteRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _requestURL: {
              type: String,
              value: null
          },

          _taskId: {
              type: String,
              value: null
          },

          syncThreshold: {
              type: String,
              value: 20
          }
      };
  }

  static get observers() {
      return [
          '_executeDeleteProcess(contextData)'
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

  _executeDeleteProcess() {
      // Start process when all the details are available
      if (this.contextData && !_.isEmpty(this.contextData)) {
          this._loading = true;
          this._message = "Delete process started";
          this._generateDeleteRequest();
      }
  }

  _generateDeleteRequest() {
      // No selectionMode or selectionMode as count should have selectedEntities to do process
      if ((!this.selectionMode || this.selectionMode == "count") && (!this.selectedEntities || this.selectedEntities.length == 0)) {
          this._message = "Entities not available, unable to execute delete process";
          this._loading = false;
          return;
      }

      if (!this.selectionQuery || _.isEmpty(this.selectionQuery)) {
          this._message = "Selection query not available, unable to execute delete process";
          this._loading = false;
          return;
      }

      //Initiate request
      let deleteRequest = {
          "params": {
              "soft-delete": true
          }
      };

      //Add hotline flag if hotline is enabled
      if (DataHelper.isHotlineModeEnabled()) {
          deleteRequest.hotline = true;
      }

      //Async process
      deleteRequest.params.operationType = "inboundService";

      let requestURL = "/data/pass-through/bulkentityservice/createtask";
      if (this.selectionQuery.params && this.selectionQuery.params.isCombinedQuerySearch) {
          deleteRequest.params.taskType = "delete-multi-query";
          deleteRequest.entities = [this.selectionQuery.entity];
          requestURL = "/data/pass-through-combined-query/bulkentityservice/createtask";
      } else {
          deleteRequest.params.taskType = "delete-query";
          deleteRequest.params.query = this.selectionQuery.params ? this.selectionQuery.params.query : this.selectionQuery;
      }

      //Add clientAttributes
      let valueContext = ContextHelper.getFirstValueContext(this.contextData);
      let userContext = ContextHelper.getFirstUserContext(this.contextData);
      let clientMessage = "Delete entities";

      deleteRequest.clientAttributes = {
          "taskName": {
              "values": [{
                  "source": valueContext.source,
                  "locale": valueContext.locale,
                  "value": clientMessage
              }]
          }
      };

      this.set("_asyncDeleteRequest", deleteRequest);
      this.set("_requestURL", requestURL);

      let asyncLiquidDelete = this.shadowRoot.querySelector("#asyncEntityBulkDelete");
      if (asyncLiquidDelete) {
          asyncLiquidDelete.generateRequest();
      }
  }

  _onAsyncDeleteSuccess(e) {
      let response = e.detail.response && e.detail.response.response ? e.detail.response.response : e.detail.response;
      let request = e.detail.response ? e.detail.response.request : undefined;

      if ((!response || _.isEmpty(response)) ||
          (DataHelper.isValidObjectPath(response, "dataObjectOperationResponse.status") && response.dataObjectOperationResponse.status.toLowerCase() == "error") ||
          (response.status && response.status.toLowerCase() == "error")) {
          this.logError("Entity delete process failed", e.detail);
          this._message = "Entity delete process failed, contact administrator";
          this._loading = false;
          return;
      } else {
          if (response.status && response.status.toLowerCase() == "success") {
              if (request && request.taskId) {
                  this._taskId = request.taskId;
              }
          }

          this._message = "Delete request triggered successfully";
          this._triggerFinishStep();
      }
  }

  _onAsyncDeleteFailure(e) {
      this._loading = false;
      this._message = "Entity delete process failed, contact administrator";
      this.logError("Entity delete process failed", e.detail);
  }

  _triggerFinishStep() {
      let message = "Delete process is started, you can review the progress of the task " + this._taskId + " in task details.";
      let actions = [{
          "name": "goBack",
          "text": "Take me back to where I started",
          "isNotApp": true
      },
      {
          "name": "gotoJobDetails",
          "text": "Show me the task details",
          "isNotApp": true,
          "dataRoute": "task-detail",
          "queryParams": {
              "id": this._taskId
          }
      }];

      let data = {
          "messages": [{
              "message": message
          }],
          "actions": actions
      };

      this.businessFunctionData = data;
      let eventName = "onComplete";
      let eventDetail = {
          name: eventName
      }

      this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true
      });

      this._message = "About to complete, please wait...";
      this._loading = true;

      //Reset
      this.contextData = {};
      this.selectedEntities = [];
  }
}

customElements.define(RockEntityDelete.is, RockEntityDelete);
