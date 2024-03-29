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

import '../bedrock-helpers/data-helper.js';
import '../bedrock-datasource-behavior/bedrock-datasource-behavior.js';
import '../bedrock-grid-datasource-behavior/bedrock-grid-datasource-behavior.js';
import '../liquid-event-get/liquid-event-get.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class EntityHistoryDatasource extends mixinBehaviors([RUFBehaviors.DataSourceBehavior, RUFBehaviors.GridDataSourceBehavior],
    PolymerElement) {
  static get template() {
    return html`
        <liquid-event-get id="initGetEventSearch" operation="initiatesearch" request-data="{{request}}" last-response="{{_initGetEventSearchResponse}}" on-error="_onGetSearchError" exclude-in-progress=""></liquid-event-get>
        <liquid-event-get id="getEventSearchResults" operation="getsearchresultdetail" request-data="{{request}}" request-id="[[_initGetEventSearchResponse.content.requestId]]" last-response="{{getEventSearchResultsResponse}}" on-error="_onGetSearchError" no-cache="true" exclude-in-progress=""></liquid-event-get>
`;
  }

  static get is() {
      return "entity-history-datasource";
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
      this.request.params.isSearchRequest = !this._isRequestInitiated;
      this.reTriggerRequest();
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
      if (this.contextData) {
          let valueContexts = ContextHelper.getValueContexts(this.contextData);
          this.request.params.query.valueContexts = valueContexts;
          this.request.params.query.valueContexts.push({});
      }
      this._lastRequest = DataHelper.cloneObject(this.request);
      this._liquidGetSearchElement.generateRequest();
      this._isRequestInitiated = true;
  }

  _onGetSearchResponse(success, error) {
      if (this.getEventSearchResultsResponse.status === "success") {
          let searchResults = this._formatResponse(this.getEventSearchResultsResponse);
          if (this._initGetEventSearchResponse && this._initGetEventSearchResponse.content && this._initGetEventSearchResponse
              .content.totalRecords) {
              searchResults["totalRecords"] = this._initGetEventSearchResponse.content.totalRecords
          }
          success(searchResults);
      } else {
          error();
      }
  }

  _onGetSearchError() {
      this._error();
  }

  _checkIfRequestChanged() {
      let utils = SharedUtils.DataObjectFalcorUtil;
      let requestFilterExists = false;
      let lastRequestFilterExists = false;
      if (this.request && this.request.params && this.request.params.query.filters) {
          requestFilterExists = true;
      }
      if (this._lastRequest && this._lastRequest.params && this._lastRequest.params.query.filters) {
          lastRequestFilterExists = true;
      }
      if (requestFilterExists != lastRequestFilterExists) {
          return true;
      }
      if (!utils.compareObjects(this.request.params.query.filters.keywordsCriterion, this._lastRequest
              .params.query.filters.keywordsCriterion)) {
          return true;
      }
      if (!utils.compareObjects(this.request.params.query.filters.typesCriterion, this._lastRequest
              .params.query.filters.typesCriterion)) {
          return true;
      }
      if (!utils.compareObjects(this.request.params.query.filters.attributesCriterion, this._lastRequest
              .params.query.filters.attributesCriterion)) {
          return true;
      }
      if (!utils.compareObjects(this.request.params.sort, this._lastRequest
              .params.sort)) {
          return true;
      }
      return false;
  }
}
customElements.define(EntityHistoryDatasource.is, EntityHistoryDatasource);
