/*<link rel="import" href="classification-get-data.html">*/
/**
`rock-entity-snapshot-compare` Represents a component that renders entity snapshots.

@element rock-entity-snapshot-compare
@group rock-elements
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-ajax/iron-ajax.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/element-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../bedrock-helpers/message-helper.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import '../liquid-entity-data-save/liquid-entity-data-save.js';
import '../liquid-entity-govern-data-get/liquid-entity-govern-data-get.js';
import '../liquid-rest/liquid-rest.js';
import '../pebble-accordion/pebble-accordion.js';
import '../pebble-vertical-divider/pebble-vertical-divider.js';
import '../pebble-tree/pebble-tree.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-dialog/pebble-dialog.js';
import '../pebble-button/pebble-button.js';
import '../rock-attribute-list/rock-attribute-list.js';
import '../rock-compare-entities/rock-compare-entities.js';
import '../rock-classification-tree/rock-classification-tree.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntitySnapshotCompare extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-grid-layout bedrock-style-padding-margin bedrock-style-buttons">
            :host {
                display: block;
                height: 100%;
                transform: translate3d(0, 0, 0);
            }

            .buttonContainer-fixed {
                bottom: 0px;
            }
            .overflow-auto-y {
                overflow-x: hidden;
                overflow-y: auto;
            }            
        </style>

        <pebble-spinner active="[[_loading]]"></pebble-spinner>

        <div class="button-siblings overflow-auto-y">
            <div id="snapshot-compare-content" class="full-height">
                <template is="dom-if" if="{{_getContextData(_compareEntitiesContext)}}">
                    <rock-compare-entities id="compareSnapshots" is-snapshot="true" enable-relationships-compare="[[enableRelationshipsCompare]]" compare-entities-context="{{_compareEntitiesContext}}" attribute-names="{{_attributeNames}}" enable-column-select=""></rock-compare-entities>

                </template>
            </div>

        </div>

        <div id="buttonContainer" align="center" class="buttonContainer-fixed">
            <pebble-button id="cancel" class="btn btn-secondary m-r-5" button-text="Cancel" on-tap="_onCancelTap" elevation="1" raised=""></pebble-button>
            <pebble-button id="save" class="focus btn btn-primary" button-text="Rollback" on-tap="_onRollback" elevation="1" raised=""></pebble-button>
        </div>
        <liquid-rest id="snapshotRollback" url="/data/pass-through-snapshot/restoresnapshot" method="POST" request-data="{{_snapshotRollbackRequest}}" on-liquid-response="_onRollbackSuccess">
            </liquid-rest>
`;
  }

  static get is() {
      return "rock-entity-snapshot-compare";
  }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          compareEntitiesContext: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          businessFunctionData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          enableRelationshipsCompare: {
              type: Boolean,
              value: false
          },

          _snapshotRollbackRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _loading: {
              type: Boolean,
              value: false
          },

          _contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _rollbackRqstCounter: {
              type: Number,
              value: 0
          },

          _compareEntitiesContext: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          attributeNames: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _attributeNames: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _rockCompareEntities: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          taxonomy: {
              type: String,
              value: ""
          }
      };
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

  ready() {
      super.ready();

      let snapshotIdArray = this.businessFunctionData.selectedItems.map(function (elm, index) {
          return elm.snapshotId;
      });

      snapshotIdArray.forEach((elm, index) => {
          if (elm == undefined) {
              snapshotIdArray[index] = {
                  "id": this.contextData.ItemContexts[0].id,
                  "notSnapshot": true
              };
          }
      });

      let attributeNames = ["_ALL"]

      let compareEntitiesContext =
          {
              entityIds: snapshotIdArray,
              entityTypes: [
                  this.contextData.ItemContexts[0].type
              ],
              contextData: this.contextData
          }
      this._attributeNames = attributeNames;
      this._compareEntitiesContext = compareEntitiesContext;
  }

  _getContextData(_compareEntitiesContext) {
      if (!_.isEmpty(_compareEntitiesContext)) {
          return true;
      } else return false;

  }

  _onCancelTap(e) {
      let eventName = "onCancel";
      let eventDetail = {
          name: eventName
      }

      this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true
      });
  }

  async _getEntityRollbackRequest(currentEntityId, currEntityType, selectedEntityId) {
      let clientState = {};
      clientState.notificationInfo = {};
      clientState.notificationInfo.showNotificationToUser = true;
      clientState.notificationInfo.userId = DataHelper.getUserId();
      let currentActiveApp = ComponentHelper.getCurrentActiveApp();
      let nonContextual;
      if (currentActiveApp) {
          clientState.notificationInfo.context = {};
          clientState.notificationInfo.context.appInstanceId = currentActiveApp.id;
      }

      let dataContexts = ContextHelper.getDataContexts(this.contextData) || [];
      if (!_.isEmpty(dataContexts)) {
          dataContexts = dataContexts.map(dataContext => {
              return {
                  "context": dataContext
              }
          });
          nonContextual = false;
      } else {
          nonContextual = true;
      }

      let req = {
          "clientState": clientState,
          "entity": {
              "id": currentEntityId,
              "type": currEntityType,
              "data": {
                  "contexts": dataContexts
              }
          },
          "params": {
              "snapshotId": selectedEntityId,
              "allContextual": false,
              "nonContextual": nonContextual
          }
      }

      return req;

  }

  _businessFunctionDataSet(messages) {
      let data = {
          "messages": messages,
          "actions": [
              {
                  "name": "closeFunction",
                  "text": "Take Me back to Where I started"
              },
              {
                  "name": "nextAction",
                  "text": "Take me to User Dashboard",
                  "dataRoute": "dashboard"
              }
          ]
      };
      this.businessFunctionData = data;
      ComponentHelper.getParentElement(this).businessFunctionData = data;

  }

  _onRollbackSuccess(e) {
      this._loading = false;
      let messages = undefined;
      if (DataHelper.isValidObjectPath(e, 'detail.response.response.statusDetail.messages')) {
          messages = e.detail.response.response.statusDetail.messages;
      }

      this._businessFunctionDataSet(messages);

      let eventName = "onNext";
      let eventDetail = {
          name: eventName
      }

      this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true
      });
  }

  async _onRollback(e) {
      this._loading = true;
      this._rockCompareEntities = this.shadowRoot.querySelector('rock-compare-entities');
      let selectedEntityId = undefined;

      if (this._rockCompareEntities) {
          selectedEntityId = this._rockCompareEntities.selectedEntityId;
      }

      if (_.isEmpty(selectedEntityId)) {
          this.showWarningToast("Select at least 1 snapshot for Rollback.");
          this._loading = false;
          return;
      }
      
      let currentEntityId = this.contextData.ItemContexts[0].id;
      let currEntityType = this.contextData.ItemContexts[0].type;

      let req = await this._getEntityRollbackRequest(currentEntityId, currEntityType, selectedEntityId);
      let liquidDataRollback = this.shadowRoot.querySelector("#snapshotRollback");

      this.set("_snapshotRollbackRequest", req);
      liquidDataRollback.generateRequest();
  }
}

customElements.define(RockEntitySnapshotCompare.is, RockEntitySnapshotCompare);
