/**
<b><i>Content development is under progress... </b></i>

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../bedrock-helpers/data-helper.js';
import '../bedrock-datasource-behavior/bedrock-datasource-behavior.js';
import '../liquid-event-get/liquid-event-get.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class EventListDatasource extends mixinBehaviors([RUFBehaviors.DataSourceBehavior], PolymerElement) {
  static get template() {
    return Polymer.html`
        <liquid-event-get id="initGetEventSearch" operation="initiatesearch" request-data="{{request}}" last-response="{{_initGetEventSearchResponse}}" on-error="_onGetSearchError" exclude-in-progress=""></liquid-event-get>
        <liquid-event-get id="getEventSearchResults" operation="getsearchresultdetail" request-data="{{request}}" request-id="[[_initGetEventSearchResponse.content.requestId]]" last-response="{{getEventSearchResultsResponse}}" on-error="_onGetSearchError" no-cache="true" exclude-in-progress=""></liquid-event-get>
`;
  }

  static get is() {
      return "event-list-datasource";
  }
  static get properties() {
      return {
          _liquidInitSearchElement: {
              type: Object,
              value: function () {
                  return {}
              }
          },

          _liquidGetSearchElement: {
              type: Object,
              value: function () {
                  return {}
              }
          },

          _isRequestInitiated: {
              type: Boolean,
              value: false
          },
          eventListDataSource: {
              type: Object,
              notify: true
          },
          gridDataFormatter: {
              type: Function,
              notify: true
          }
      }
  }
  ready() {
      super.ready();
      this._liquidInitSearchElement = dom(this).node.shadowRoot.querySelector(
          "liquid-event-get[id='initGetEventSearch']");
      this._liquidGetSearchElement = dom(this).node.shadowRoot.querySelector(
          "liquid-event-get[id='getEventSearchResults']");

      this.eventListDataSource = this._dataSource.bind(this);
  }

  _dataSource(data, success, error) {

      if (_.isEmpty(this.request)) {
          success([]);
          return;
      }
      DataHelper.oneTimeEvent(this._liquidInitSearchElement, 'response', this._onInitSearchResponse.bind(
          this));

      DataHelper.oneTimeEvent(this._liquidGetSearchElement, 'response', this._onGetSearchResponse.bind(
          this, success, error));
      this._error = error;

      if (this._checkIfRequestChanged()) {
          this._isRequestInitiated = false;
          data.page = 1;
      }

      // Set Range
      let from = data.page > 0 ? (data.page - 1) * data.pageSize : 0;
      let to = data.page > 0 ? data.page * data.pageSize - 1 : 0;

      let options = {
          "from": from,
          "to": to
      };
      this.set("request.params.options", options);

      // Initiate Request only for First Time.
      if (!this._isRequestInitiated) {
          this._liquidInitSearchElement.generateRequest();
      } else {
          this._liquidGetSearchElement.generateRequest();
      }
  }
  /**
   * <b><i>Content development is under progress... </b></i> 
   */
  resetDataSource() {
      this._isRequestInitiated = false;
  }
  /**
   * <b><i>Content development is under progress... </b></i> 
   */
  reTriggerRequest() {
      // Initiate Request only for First Time.
      if (!this._isRequestInitiated) {
          this._liquidInitSearchElement.generateRequest();
      } else {
          this._liquidGetSearchElement.generateRequest();
      }
  }

  _onInitSearchResponse() {
      this._lastRequest = DataHelper.cloneObject(this.request);
      this._liquidGetSearchElement.generateRequest();
      this._isRequestInitiated = true;
  }

  _onGetSearchResponse(success, error) {
      if (typeof (this.gridDataFormatter) == 'function') {
          if (this.getEventSearchResultsResponse.status === "success") {
              success(this.gridDataFormatter(this.getEventSearchResultsResponse));
          } else {
              error();
          }
      }
      let eventName = "batch-task-msg-handler";
      let data = {
          msg: "No batch tasks found."
      };
      if (this.getEventSearchResultsResponse.content.events == 0) {
          data.eventType = "noData";
      } else {
          data.eventType = "data";
      }

      ComponentHelper.fireBedrockEvent(eventName, data, {
          ignoreId: true
      });

  }

  _onGetSearchError() {
      let eventName = "batch-task-msg-handler";
      let data = {
          msg: "Cannot fetch batch tasks with selected filters, try changing the filters to see batch tasks.",
          eventType: "apiFailed"
      }
      ComponentHelper.fireBedrockEvent(eventName, data, {
          ignoreId: true
      });
      this._error();
  }

  _checkIfRequestChanged() {
      let compareResult = this._compareRequests(this.request, this._lastRequest);
      return compareResult;
  }
  _compareRequests(currentReq, lastReq) {
      let requestFilterExists = false;
      let lastRequestFilterExists = false;
      let utils = SharedUtils.DataObjectFalcorUtil;
      

      if (currentReq && currentReq.params && currentReq.params.query.filters) {
          requestFilterExists = true;
      }
      if (lastReq && lastReq.params && lastReq.params.query.filters) {
          lastRequestFilterExists = true;
      }
      if (requestFilterExists != lastRequestFilterExists) {
          return true;
      }

      if (currentReq && lastReq) {
          let propertiesCriterionCurrent = currentReq.params.query.filters.propertiesCriterion;
          let propertiesCriterionLastReq = lastReq.params.query.filters.propertiesCriterion;
          let attributesCriterionCurrent = currentReq.params.query.filters.attributesCriterion;
          let attributesCriterionLastReq = lastReq.params.query.filters.attributesCriterion;
          let typesCriterionCurrent = currentReq.params.query.filters.typesCriterion;
          let typesCriterionLastReq = lastReq.params.query.filters.typesCriterion;
          let keywordsCriterionCurrent = currentReq.params.query.filters.keywordsCriterion;
          let keywordsCriterionLastReq = lastReq.params.query.filters.keywordsCriterion;
      
          if (!utils.compareObjects(keywordsCriterionCurrent, keywordsCriterionLastReq)) {
              return true;
          }
          if (!utils.compareObjects(typesCriterionCurrent, typesCriterionLastReq)) {
              return true;
          }
          if (!utils.compareObjects(attributesCriterionCurrent, attributesCriterionLastReq)) {
              return true;
          }
          if (!utils.compareObjects(propertiesCriterionCurrent, propertiesCriterionLastReq)) {
              return true;
          }
          if (!utils.compareObjects(currentReq.params.sort, lastReq.params.sort)) {
              return true;
          }
      }
      return false;
  }
}
customElements.define(EventListDatasource.is, EventListDatasource);
