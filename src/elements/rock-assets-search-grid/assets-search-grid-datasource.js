/**
`rock-assets-search-grid` Represents a component that serves as a source of data for the `rock-assets-search-grid`.
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
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class AssetsSearchGridDatasource extends mixinBehaviors([RUFBehaviors.DataSourceBehavior],
    PolymerElement) {
  static get template() {
    return html`
        <liquid-entity-data-get id="initGetEntitySearch" operation="initiatesearch" request-data="{{request}}" last-response="{{_initGetEntitySearchResponse}}" on-error="_onGetSearchError" exclude-in-progress=""></liquid-entity-data-get>
        <liquid-entity-data-get id="getEntitySearchResults" operation="getsearchresultdetail" request-data="{{request}}" request-id="[[_initGetEntitySearchResponse.content.requestId]]" last-response="{{getEntitySearchResultsResponse}}" on-error="_onGetSearchError" exclude-in-progress=""></liquid-entity-data-get>
`;
  }

  static get is() {
      return "assets-search-grid-datasource";
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

          _isResponseAttached: {
              type: Boolean,
              value: false
          },

          _isRequestInitiated: {
              type: Boolean,
              value: false
          },
          /**
           * Indicates the total number of records in the grid.
           *
           */
          totalCount: {
              type: Number,
              value: 0,
              notify: true
          },
          /**
           * Indicates the number of current records in the grid.
           *
           */
          currentRecordSize: {
              type: Number,
              value: 0,
              notify: true
          },

          resultRecordSize: {
              type: Number,
              value: 0,
              notify: true
          },
          assetSearchDataSource: {
              type: Object,
              notify: true
          },
          assetSearchDataformatter: {
              type: Function,
              notify: true
          }
      }
  }
  ready() {
      super.ready();
      this._liquidInitSearchElement = dom(this).node.shadowRoot.querySelector(
          "liquid-entity-data-get[id='initGetEntitySearch']");
      this._liquidGetSearchElement = dom(this).node.shadowRoot.querySelector(
          "liquid-entity-data-get[id='getEntitySearchResults']");

      this.assetSearchDataSource = this._dataSource.bind(this);
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
   * Can be used to reset the data source.
   *
   */
  resetDataSource() {
      this.currentRecordSize = 0;
      this.totalCount = 0;
      this._isRequestInitiated = false;
  }
  /**
   * Can be used to re-trigger the request.
   *
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
      this.totalCount = this._initGetEntitySearchResponse.content.totalRecords;
      this.resultRecordSize = this._initGetEntitySearchResponse.content.resultRecordSize;
      this._liquidGetSearchElement.generateRequest();
      this._isRequestInitiated = true;
  }

  _onGetSearchResponse(success, error) {
      if (typeof (this.assetSearchDataformatter) == 'function') {
          if (this.getEntitySearchResultsResponse.status === "success") {
              let formattedResults=this.assetSearchDataformatter(this.getEntitySearchResultsResponse);
              this.currentRecordSize=this.currentRecordSize+formattedResults.length;
              success(formattedResults);
          } else {
              error();
          }
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
customElements.define(AssetsSearchGridDatasource.is, AssetsSearchGridDatasource);
