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
import '../bedrock-grid-datasource-behavior/bedrock-grid-datasource-behavior.js';
import '../bedrock-helpers/constant-helper.js';
import '../liquid-event-get/liquid-event-get.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class EntityDimensionGridDatasource
    extends mixinBehaviors([
        RUFBehaviors.GridDataSourceBehavior
    ], PolymerElement) {
  static get template() {
    return Polymer.html`
        <liquid-event-get id="initiateSearchResult" operation="initiatesearch" request-data="[[_searchRequest]]" last-response="{{_initSearchResponse}}" on-error="_onSearchError" exclude-in-progress=""></liquid-event-get>
        <liquid-event-get id="getSearchResultDetail" operation="getsearchresultdetail" request-data="[[_request]]" request-id="[[_initSearchResponse.content.requestId]]" last-response="{{searchResultResponse}}" exclude-in-progress=""></liquid-event-get>
`;
  }

  static get is() { return 'entity-dimension-grid-datasource' }
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
          _options: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          _totalCount: {
              type: Number,
              notify: true,
              value: 0
          },
          _request: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _searchRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          rDataSource: {
              type: Object,
              notify: true
          },
          valueContexts: {
              type: Array,
              value: function () {
                  return []
              }
          },
          contexts: {
              type: Array,
              value: function () {
                  return []
              }
          }
      }
  }

  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  ready () {
      super.ready();
      this._liquidInitSearchElement = this.shadowRoot.querySelector(
          "liquid-event-get[id='initiateSearchResult']");
      this._liquidGetSearchElement = this.shadowRoot.querySelector(
          "liquid-event-get[id='getSearchResultDetail']");

      this.rDataSource = this._dataSource.bind(this);
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  resetDataSource () {
      this._resetDataSource();
  }

  _dataSource (options, success, error) {
      // Bind Reponse Methods
      DataHelper.oneTimeEvent(this._liquidInitSearchElement, 'response', this._onInitSearchResponse.bind(
          this));

      DataHelper.oneTimeEvent(this._liquidGetSearchElement, 'response', this._onGetSearchResponse.bind(
          this, success, error));

      // Set Options
      this._options = options;

      // Set Range
      let requestOptions = this._prepareRequestOptions(this._options);

      if(options.resetSearch){
          this._isRequestInitiated = false;
      }

      this.set("request.params.options", requestOptions);
      this.set("_request.params.options", requestOptions);

      if(!_.isEmpty(this.contexts)){
          this.request.params.query.contexts = this.contexts;
      }

      this._searchRequest = DataHelper.cloneObject(this.request);

      if (!this._isRequestInitiated) {
          this._liquidInitSearchElement.generateRequest();
      } else {
          this._liquidGetSearchElement.generateRequest();
      }
  }


  _onInitSearchResponse (e) {
      this._totalCount = e.detail.response.content.totalRecords;
      this._resultRecordSize = e.detail.response.content.resultRecordSize;

      this._request = this._searchRequest;
      this._request.params.query.valueContexts = this.valueContexts;
      this._request.params.query.contexts = this.contexts;

      this._liquidGetSearchElement.generateRequest();
      this._isRequestInitiated = true;
  }

  _onGetSearchResponse (success, error) {
          if (this.searchResultResponse.status == "success") {
              // Format ResponseData
              let searchResults = this._formatResponse(this.searchResultResponse);
              if (typeof (searchResults) == 'undefined') {
                  searchResults = [];
              }

              // UpdateCurrent RecordSize
              this._updateCurrentRecordSize(this._options, searchResults, this._totalCount,this._resultRecordSize);

              // Invoke Callback
              success(searchResults);
          } else {
              error();
          }
  }

  _onSearchError (e) {
      let reason = e.detail.response.reason;
      //this.showErrorToast(reason, 10000);   //TODO: Find a way to display reason 
  }
}
customElements.define(EntityDimensionGridDatasource.is, EntityDimensionGridDatasource);
