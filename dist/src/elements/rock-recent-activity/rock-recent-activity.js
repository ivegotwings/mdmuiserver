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
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-icon/pebble-icon.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../rock-widget-panel/rock-widget-panel.js';
import '../pebble-echo-html/pebble-echo-html.js';
import './entity-history-datasource.js';
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
        padding-bottom: 10px;
        display: flex;
      }

      #scrollingArea {
        padding-top:20px;
        padding-left:10px;
        -webkit-overflow-scrolling: touch;
      }

      .status-icon {
        display: -ms-flex;
        display: inline-flex;
        display: -webkit-inline-flex;
        vertical-align: top;
        align-items: center;
        justify-content: center;
        margin-right: 6px;
        position: relative;
        z-index: 0;
      }

      .message {
        font-size: var(--default-font-size, 14px);
      }

      .time-stamp {
        padding: 10px 0;
        color: var(--secondary-text-color, #727272);
        font-size: var(--font-size-sm, 12px);
      }

      .item-img {
        width: 30px;
        height: 30px;
        margin-right: 10px;
        border-radius: 50%;
        border: 2px solid var(--default-border-color, #c1cad4);
        overflow: hidden;
      }

      .item-img img {
        width: 100%;
        border: 2px solid #fff;
        border-radius: 50%;
      }

      .item-details {
        width: calc(100% - 40px);
        border-bottom: 1px solid var(--default-border-color, #c1cad4);
      }

      .item-wrapper-container:nth-last-child(2) .item-details {
        border-bottom: 0px;
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
      iron-scroll-threshold{
        height: 100%;
        overflow-x:hidden !important;
      }
    </style>
    <div class="base-grid-structure">
      <div class="base-grid-structure-child-1">
        <template is="dom-if" if="[[noRecord]]">
          <div class="default-message">No activities found.</div>
        </template>
      </div>
      <div class="base-grid-structure-child-2">
        <div id="scrollingArea" class="full-height">          
            <iron-scroll-threshold on-lower-threshold="_loadMoreData" id="scrollTheshold">
              <template is="dom-repeat" items="{{items}}" as="item">
                  <div class="item-wrapper-container">
                    <div class="item-wrapper">
                      <div class="item-img">
                        <img src="../src/images/no-photo.jpg">
                      </div>
                      <div class="item-details">
                        <div>
                          <pebble-echo-html html="{{item.message}}"></pebble-echo-html>
                        </div>
                        <div class="time-stamp">
                          <div class="status-icon">
                            <pebble-icon icon="{{_getIconName(item.action)}}" class="pebble-icon-size-16"></pebble-icon>
                          </div>
                          <span>on [[item.timeStamp]]</span>
                        </div>
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
    <bedrock-pubsub event-name="entity-history-refresh" handler="_refresh"></bedrock-pubsub>
    <entity-history-datasource id="eventDataSource" request="[[request]]" context-data="[[contextData]]" event-list-data-source="{{dataSource}}">
    </entity-history-datasource>
    <liquid-entity-model-composite-get name="compositeAttributeModelGet" request-data="{{_attributeModelRequest}}" on-entity-model-composite-get-response="_onCompositeModelGetResponse">
    </liquid-entity-model-composite-get>
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
        value: 10,
        notify: true
      },
      noRecord: {
        type: Boolean,
        value: false
      }
    }
  }
  static get observers() {
    return [
      '_pageChanged(dataSource, page)'
    ]
  }
  _loadMoreData() {
    this.page++;
  }
  _refresh() {
    let eventDataSource = this.shadowRoot.querySelector("#eventDataSource");
    if (eventDataSource) {
      eventDataSource.resetDataSource();
    }
    this.items = [];
    this.page = 0;
    this.page = 1;
  }
  _pageChanged(dataSource, currentPage) {
    if (!(dataSource === undefined || currentPage === undefined)) {
      if (typeof (dataSource) == 'function' && currentPage > 0) {
        if (DataHelper.isValidObjectPath(this.contextData, 'ItemContexts.0.id')) {
          this.request = DataRequestHelper.createEntityEventGetRequest(this.contextData.ItemContexts[0].id);

          let dataContexts = ContextHelper.getDataContexts(this.contextData);
          this.request.params.query.contexts = dataContexts;
        }

        this.loading = true;
        this.noRecord = false;
        let success = this._success.bind(this);
        let error = this._error.bind(this);
        dataSource({
          page: this.page,
          pageSize: this.pageSize,
          sortOrder: this.sortOrder,
          "viewMode": "List"
        }, success, error);
      }
    }
  }
  _success(data) {
    if (data && data.content && data.content.events && data.content.events.length > 0) {
      let events = data.content.events;
      let eventHistoryList = [];
      for (let i = 0; i < events.length; i++) {
        let event = events[i];
        if (event) {
          let attributes = event.data.attributes;
          let timeStamp = "";
          let messages = [];
          let actions = [];

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
                  }
                }
              }
            }
          }

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

            eventHistoryList.push(eventHistoryObj);
          }
        }
      }

      if (eventHistoryList.length > 0) {
        for (let i = 0; i < eventHistoryList.length; i++) {
          this.push('items', eventHistoryList[i]);
        }
        this.loading = false;
        this.$.scrollTheshold.clearTriggers();
      }
    } else {
      this.logError("event list datasource call failed");
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
