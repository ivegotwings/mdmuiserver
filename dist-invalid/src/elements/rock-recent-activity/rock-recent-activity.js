/**
`<rock-entity-summary>` Represents an element that renders the widgets 
such as "to-do" and "to-fix" for an entity.

### Example

    <template is="dom-bind" id="demo-app">				
				<rock-entity-summary config="{{config}}"></rock-entity-summary>
		</template>

@group rock Elements
@element rock-entity-summary
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/iron-list/iron-list.js';
import '@polymer/iron-scroll-threshold/iron-scroll-threshold.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import '../rock-nested-attribute-grid/rock-nested-attribute-grid.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-dialog/pebble-dialog.js';
import '../pebble-richtexteditor/pebble-richtexteditor.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../rock-widget-panel/rock-widget-panel.js';
import '../pebble-echo-html/pebble-echo-html.js';
import './entity-history-datasource.js';
import '../rock-grid-data-sources/attribute-model-datasource.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockRecentActivity extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior,
    RUFBehaviors.LoggerBehavior
  ],
  OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
    <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-grid-layout bedrock-style-icons">
      :host {
        display: block;
        height: 100%;
        position: relative;

        --pebble-echo: {
          font-size: var(--font-size-sm, 12px);
        }
      }

      .item-wrapper {
        padding-top: 10px;
        display: flex;
      }

      #scrollingArea {
        padding-top: 20px;
        padding-left: 10px;
        -webkit-overflow-scrolling: touch;
      }

      .status-icon {
        display: -ms-flex;
        display: inline-flex;
        display: -webkit-inline-flex;
        vertical-align: top;
        justify-content: center;
        margin-right: 6px;
        position: relative;
      }

      .message {
        font-size: var(--default-font-size, 14px);
      }

      .time-stamp {
        color: var(--secondary-text-color, #727272);
        font-size: var(--font-size-sm, 12px);
        display: flex
      }

      .item-img {
        width: 30px;
        height: 30px;
        margin-right: 5px;
        border-radius: 50%;
        border: 2px solid var(--default-border-color, #c1cad4);
        overflow: hidden;
        margin-top: 3px;
      }

      .item-img img {
        width: 100%;
        border: 2px solid #fff;
        border-radius: 50%;
      }

      .item-details {
        width: calc(100% - 40px);
      }

      .group-item-details {
        margin-left: 30px
      }

      .item-wrapper-container:nth-last-child(2) .item-details {
        border-bottom: 0px;
        margin-left: 30px
      }

      .userName {
        color: var(--palette-cerulean, #036bc3);
        font-weight: 600;
      }

      .activity-property {
        font-weight: bold;
      }

      .attribute-value {
        color: var(--success-color, #4caf50);
        font-weight: bold;
      }

      .default-message {
        margin-right: 10px;
        margin-left: 10px;
      }

      iron-scroll-threshold {
        height: 100%;
        overflow-x: hidden !important;
      }

      div.panel {
        display: none;
      }

      div.panel.show {
        display: block !important;
        transition: all var(--accordion-duration, 300ms) ease;
        -webkit-transition: all var(--accordion-duration, 300ms) ease;
        -moz-transition: all var(--accordion-duration, 300ms) ease;
        -ms-transition: all var(--accordion-duration, 300ms) ease;
      }

      .header {
        box-shadow: none;
        cursor: pointer;
        position: relative;
        display: flex;
      }

      .header-text a {
        text-decoration: none;
        color: var(--text-primary-color, #1a2028);
      }

      .header-content {
        width: calc(100% - 40px);
        display: flex;
        padding-bottom: 2px;
      }

      .header-text {
        width: calc(100% - 30px);
        font-size: var(--font-size-sm, 12px);
      }

      .accordion {
        border-bottom: 1px solid var(--default-border-color, #c1cad4);
      }

      #pebble_accordion_container {
        padding-bottom: 5px
      }

      #accordion_content_container:last-child {
        border-bottom: 1px solid var(--default-border-color, #c1cad4);
        padding-bottom: 10px
      }

      .active pebble-icon {
        transition: all var(--accordion-duration, 300ms) ease;
        -webkit-transition: all var(--accordion-duration, 300ms) ease;
        -moz-transition: all var(--accordion-duration, 300ms) ease;
        -ms-transition: all var(--accordion-duration, 300ms) ease;
        -webkit-transform: rotate(90deg);
        -moz-transform: rotate(90deg);
        -o-transform: rotate(90deg);
        -ms-transform: rotate(90deg);
        transform: rotate(90deg);
      }
    </style>
    <div class="base-grid-structure">
      <div class="base-grid-structure-child-1">
        <template is="dom-if" if="[[noRecord]]">
          <div class="default-message">No activities found.</div>
        </template>
      </div>
      <div class="base-grid-structure-child-2">
        <div id="scrollingArea" class="full-height p-t-20 p-l-5">
          <iron-scroll-threshold on-lower-threshold="_loadMoreData" id="scrollTheshold">
            <template is="dom-repeat" items="{{items}}" as="item">
              <div id="pebble_accordion_container">
                <div class="accordion" on-tap="_onHeaderClick">
                  <div class="header">
                    <pebble-icon icon="pebble-icon:action-scope-take-selection" class="pebble-icon-size-12 m-r-5 m-t-10 accordion-icon" id="accordion_icon"></pebble-icon>
                    <div class="header-content">
                      <div class="item-img">
                        <img src="../src/images/no-photo.jpg">
                      </div>
                      <div class="header-text">
                        <pebble-echo-html html="[[_getHeadreText(item)]]"></pebble-echo-html>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="panel">
                  <div id="accordion_content_container">
                    <template is="dom-repeat" items="{{item.itemlist}}" as="newitem">
                      <div class="item-wrapper-container">
                        <div class="item-wrapper">
                          <div class="item-details group-item-details">
                            <div class="time-stamp">
                              <div class="status-icon m-t-5">
                                <pebble-icon icon="{{_getIconName(newitem.action)}}" class="pebble-icon-size-12"></pebble-icon>
                              </div>
                              <div>
                                <pebble-echo-html html="{{newitem.message}}"></pebble-echo-html>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="clearfix"></div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
        
      

  </template>
  </iron-scroll-threshold>
  </div>
  </div>
  </div>
  <div class="loadingIndicator">
    <pebble-spinner active="[[loading]]"></pebble-spinner>
  </div>
  <pebble-dialog id="attributeDialog" dialog-title="Confirmation" modal="" large="" no-cancel-on-outside-click="" no-cancel-on-esc-key="" show-close-icon="">
    <div id="attrDialogContainer" style="height:80vh">
    </div>
  </pebble-dialog>
  <bedrock-pubsub event-name="open-attribute-dialog" handler="_onOpenAttributeDialog"></bedrock-pubsub>

  <bedrock-pubsub event-name="entity-history-refresh" handler="_refresh"></bedrock-pubsub>

  <liquid-rest id="entityEventGetLiquidRest" url="/data/pass-through-entity-history/get" method="POST" on-liquid-response="_onEventsResponse"></liquid-rest>


  <entity-history-datasource id="eventDataSource" request="[[request]]" context-data="[[contextData]]" event-list-data-source="{{dataSource}}">
  </entity-history-datasource>
  <liquid-entity-model-composite-get name="compositeAttributeModelGet" request-data="{{_attributeModelRequest}}" on-entity-model-composite-get-response="_onCompositeModelGetResponse">
  </liquid-entity-model-composite-get>
  <attribute-model-datasource id="attributeModelDataSource" mode="[[attributeMode]]" request="[[modelGetRequest]]" r-data-source="{{rDataSource}}" r-data-formatter="{{_dataFormatter}}" schema="lov">
  </attribute-model-datasource>
`;
  }

  static get is() {
    return "rock-recent-activity";
  }
  static get properties() {
    return {
      /**
       * Specifies the widget-panel config used for the "summary" dashboard.
       */
      config: {
        type: Object,
        value: function () {
          return {};
        }
      },
      /**
       * If set as true , it indicates the component is in read only mode
       */
      loading: {
        type: Boolean,
        value: false
      },
      /**
       * <b><i>Content development is under progress... </b></i> 
       */
      contextData: {
        type: Object,
        value: function () {
          return {};
        }
      },
      /**
       * <b><i>Content development is under progress... </b></i> 
       */
      items: {
        type: Array,
        value: function () {
          return [];
        }
      },
      attributekeyName: {
        type: Array,
        value: function () {
          return [];
        }
      },
      eventList: {
        type: Array,
        value: function () {
          return [];
        }
      },
      _attributeModelRequest: {
        type: Object,
        value: function () {
          return {};
        }
      },
      dataSource: {
        type: Object,
        value: function () {
          return {};
        }
      },
      request: {
        type: Object,
        value: function () {
          return {};
        }
      },
      page: {
        type: Number,
        value: 0,
        notify: true
      },
      pageSize: {
        type: Number,
        value: 200,
        notify: true
      },
      noRecord: {
        type: Boolean,
        value: false
      },
      attributeModelObject: {
        type: Object,
        value: {}
      },
      attributeObject: {
        type: Object,
        value: {}
      },
      _dataFormatter: {
        type: Object,
        value: function () {
          return {};
        }
      },
      rDataSource: {
        type: Object,
        value: function () {
          return {}
        }
      },
      attributeMode: {
        type: String,
        value: "self"
      },
      modelGetRequest: {
        type: Object,
        value: {}
      },
      attributeModels: {
        type: Object,
        value: {}
      },
      maxRecords: {
        type: Number,
        value: 200
      }
    }
  }
  _loadMoreData() {
    this.page++;
  }
  _onHeaderClick(e) {
    e.currentTarget.classList.toggle("active");
    e.currentTarget.nextElementSibling.classList.toggle("show");
  }
  _refresh() {
    this.items = [];
    this.page = 0;
    this.page = 1;
    this.getEvents();
  }

  ready() {
    super.ready();
    let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(this.contextData);
    compositeModelGetRequest.params.fields.attributes = ["_ALL"];
    this.modelGetRequest = compositeModelGetRequest;
    this.reTriggerRequest();
    this.isModelGetInitiated = true;
    this.getEvents();
    this._dataFormatter = this._getAttributeFormattedData.bind(this);

  }
  getEvents() {
    if (DataHelper.isValidObjectPath(this.contextData, 'ItemContexts.0.id')) {
      let req = DataRequestHelper.createEntityEventGetRequest(this.contextData.ItemContexts[0].id, this.contextData.ItemContexts[0].type, this.maxRecords);
      let dataContexts = ContextHelper.getDataContexts(this.contextData);
      if (!_.isEmpty(dataContexts) && !_.isEmpty(dataContexts[0])) {
        req.params.query.contexts = dataContexts;
        req.params.query.filters.nonContextual = false;
        req.params.query.contexts = dataContexts;
      }
      this.request = req
      let _liquidRestElement = this.shadowRoot.querySelector("#entityEventGetLiquidRest");
      if (_liquidRestElement) {
        _liquidRestElement.requestData = this.request;
        _liquidRestElement.generateRequest();
      }
      this.loading = true;
      this.noRecord = false;
    }
  }
  _getAttributeFormattedData(data) {
    if (data && data.content && !_.isEmpty(data.content.entityModels[0])) {
      this.attributeModels = DataTransformHelper.transformAttributeModels(data.content.entityModels[0], this.contextData);
    }

  }
  _onOpenAttributeDialog(e) {
    if (!_.isEmpty(e.detail)) {
      let attributeData = e.detail
      let attributeId = attributeData.attributeId
      let attributeModel = this.attributeModels[attributeId];
      let dialogElement = "";
      this.attributeModelObject = attributeModel;
      let rockComponent = "";
      let rockElement = ""


      if (!_.isEmpty(attributeModel)) {
        let attrExternalName = attributeModel.externalName;
        if (attributeModel.dataType == "nested") {
          rockComponent = customElements.get("rock-nested-attribute-grid");
          rockElement = new rockComponent();
          rockElement.attributeModelObject = attributeModel;
          let attributeValue = this._getRowData(attributeData, attributeId, attributeModel);
          rockElement.attributeObject = attributeValue;
          rockElement.mode = "view";
        } else if (attributeModel.displayType && attributeModel.displayType.toLowerCase() === "richtexteditor") {
          rockComponent = customElements.get("pebble-richtexteditor");
          rockElement = new rockComponent();
          rockElement.value = attributeData[attributeId];
          rockElement.descriptionObject = attributeModel.properties;
          rockElement.readOnly = true;
        }
        let dialogElement = this.shadowRoot.querySelector("#attributeDialog");
        if (dialogElement) {
          let attrDialogContainer = dialogElement.querySelector('#attrDialogContainer');
          if (attrDialogContainer) {
            ComponentHelper.removeNode(attrDialogContainer.firstElementChild);
            attrDialogContainer.appendChild(rockElement);
          }
          dialogElement.dialogTitle = "Recent Activity : " + attrExternalName + " - " + (this.contextData.ItemContexts[0].name || this.contextData.ItemContexts[0].id);
          dialogElement.open();
        }
      }
    }
  }
  _getRowData(item, attributeId, attrModel) {
    if (item) {
      let firstDataContext = ContextHelper.getFirstDataContext(this.contextData);
      let firstValueContext = ContextHelper.getFirstValueContext(this.contextData);

      if (attrModel && attrModel.group && attrModel.group.length > 0) {
        let attrValue = DataTransformHelper.transformNestedAttributes({
          "group": item[attributeId]
        }, attrModel, false, firstDataContext, firstValueContext);

        let attributeObject = {
          "value": attrValue
        };
        return attributeObject;
      }
    }
  }
  reTriggerRequest() {
    this.shadowRoot.querySelector('#attributeModelDataSource').reTriggerRequest();
  }
  _cloneObject(o) {
    return DataHelper.cloneObject(o);
  }
  _isGroup(eventObj) {
    if (eventObj.isgroup) {
      return true;
    }
    return false;
  }
  _getHeadreText(item) {
    let currentItem = item.itemlist[0];
    let changedItemText = "";
    if (item.noOfAttrsChanged > 0) {
      changedItemText = item.noOfAttrsChanged + " attributes";
    }
    if (item.noOfRelsChanged > 0) {
      changedItemText = changedItemText ? changedItemText + " and " + item.noOfRelsChanged + " relationships" : item.noOfRelsChanged + " relationships";
    }
    let changedItem = "attributes";
    if (currentItem.eventType == "relationshipChange") {
      changedItem = "relationships"
    };
    if (item.isEntityCreatedEvent) {
      return "<span class='userName'>" + currentItem.userName + "</span> created entity with " + changedItemText + " on <span class='timeStamp'> " + currentItem.timeStamp + "</span>"
    } else {
      return "<span class='userName'>" + currentItem.userName + "</span> changed " + changedItemText + " on <span class='timeStamp'> " + currentItem.timeStamp + "</span>"
    }
  }
  _onEventsResponse(e) {
    if (e.detail && e.detail.response && e.detail.response.response && e.detail.response.response.entities && e.detail.response.response.entities.length > 0) {
      let events = e.detail.response.response.entities
      let eventHistoryList = [];
      let eventGroup = [];
      for (let i = 0; i < events.length; i++) {
        let event = events[i];
        if (event) {
          let attributes = event.data.attributes;
          let timeStamp = "";
          let messages = [];
          let actions = [];
          let userName = [];

          for (let attribute in attributes) {
            if (attributes.hasOwnProperty(attribute)) {
              let attrObj = attributes[attribute];
              if (attrObj && attrObj.values && attrObj.values.length > 0) {
                let valueObjs = attrObj.values;
                if (attribute == "timeStamp") {
                  let value = valueObjs[0].value;
                  timeStamp = FormatHelper.convertFromISODateTimeToClientFormat(value, 'datetime');
                } else {
                  let values = [];
                  for (let j = 0; j < valueObjs.length; j++) {
                    let valueObj = valueObjs[j];
                    values.push(valueObj.value);
                  }

                  if (attribute == "action") {
                    actions = values;
                  } else if (attribute == "message") {
                    messages = values;
                  } else if (attribute == "userDetail") {
                    userName = values
                  }
                }
              }
            }
          }
          eventHistoryList = [];
          for (let k = 0; k < messages.length; k++) {
            let message = messages[k];
            let action = actions[k];

            let eventHistoryObj = {}
            eventHistoryObj["eventType"] = event.eventType;
            eventHistoryObj["id"] = event.id;
            eventHistoryObj["type"] = event.type;
            eventHistoryObj["message"] = message;
            eventHistoryObj["action"] = action;
            eventHistoryObj["timeStamp"] = timeStamp;
            eventHistoryObj["userName"] = userName;
            eventHistoryObj["noOfAttributesChanged"] = messages.length;

            eventHistoryList.push(eventHistoryObj);
          }
        }
        eventGroup[i] = {
          "itemlist": eventHistoryList
        };
        if (event.entityAdd) {
          eventGroup[i]["isEntityCreatedEvent"] = event.entityAdd;
        }
        if (event.noOfRelsChanged) {
          eventGroup[i]["noOfRelsChanged"] = event.noOfRelsChanged;
        }
        if (event.noOfAttrsChanged) {
          eventGroup[i]["noOfAttrsChanged"] = event.noOfAttrsChanged;
        }
      }

      if (eventGroup.length > 0) {
        for (let i = 0; i < eventGroup.length; i++) {
          this.push('items', eventGroup[i]);
        }
        this.loading = false;
        this.$.scrollTheshold.clearTriggers();
      }
    } else {
      this.logError("event list get call failed");
      if (this.items.length == 0) {
        this.noRecord = true;
      }
    }
    this.loading = false;
  }
  _error() {
    this.loading = false;
  }
  _getIconName(action) {
    let iconName = "";
    switch (action) {
      case "add":
        iconName = "pebble-icon:add-history";
        break;
      case "update":
        iconName = "pebble-icon:edit-history";
        break;
      case "delete":
        iconName = "pebble-icon:delete-history";
        break;
    }
    return iconName;
  }
}
customElements.define(RockRecentActivity.is, RockRecentActivity);
