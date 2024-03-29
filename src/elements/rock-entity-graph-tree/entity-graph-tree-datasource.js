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

import '../bedrock-grid-datasource-behavior/bedrock-grid-datasource-behavior.js';
import '../bedrock-helpers/data-helper.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class EntityGraphTreeDatasource
    extends mixinBehaviors([
        RUFBehaviors.GridDataSourceBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <liquid-entity-data-get id="ownedRelationships" operation="getbyids" request-data="{{ownedRelationshipsRequest}}" exclude-in-progress=""></liquid-entity-data-get>

        <liquid-entity-data-get id="initiateSearch" operation="initiatesearch" request-data="{{whereUsedRequest}}" last-response="{{initiateSearchResponse}}" on-error="_onSearchError" exclude-in-progress=""></liquid-entity-data-get>
        <liquid-entity-data-get id="getSearchResultDetail" operation="getsearchresultdetail" request-data="{{whereUsedRequest}}" request-id="[[initiateSearchResponse.content.requestId]]" last-response="{{searchResultResponse}}" on-error="_onSearchError" exclude-in-progress=""></liquid-entity-data-get>
`;
  }

  static get is() { return 'entity-graph-tree-datasource' }
  static get properties() {
      return {

          _ownedOptions: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          _whereUsedOptions: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          response: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          whereUsedRequest: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          whereUsedDataSource: {
              type: Object,
              notify: true
          },
          _ownedRelationshipsElement: {
              type: Object
          },
          ownedDataSource: {
              type: Object,
              notify: true
          },
          ownedRelationshipsRequest: {
              type: Object,
              notify: true
          },
          _liquidInitSearchElement: {
              type: Object
          },
          _liquidGetSearchElement: {
              type: Object
          }
      }
  }

  ready () {
      super.ready();
      this._ownedRelationshipsElement = this.shadowRoot.querySelector("#ownedRelationships");

      this._liquidInitSearchElement = this.shadowRoot.querySelector("#initiateSearch");
      this._liquidGetSearchElement = this.shadowRoot.querySelector('#getSearchResultDetail');

      this.ownedDataSource = this._ownedDataSource.bind(this);
      
      this.whereUsedDataSource = this._whereUsedDataSource.bind(this);
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  resetDataSource() {
      this._resetDataSource();
  }

  _ownedDataSource(options, success, error){
      if (_.isEmpty(this.ownedRelationshipsRequest)) {
          return;
      }
      DataHelper.oneTimeEvent(this._ownedRelationshipsElement, 'response', this._onOwnedRelationshipsReponse
              .bind(this, success, error));

      // Set Options
      this._ownedOptions = options;

      let requestOptions = this._prepareRequestOptions(options);
      this.set("ownedRelationshipsRequest.params.options", requestOptions);

      this._ownedRelationshipsElement.generateRequest();
  }
  _onOwnedRelationshipsReponse(success, error, ev){
      if(ev && ev.detail && ev.detail.response){
          if(ev.detail.response.status == "success"){
              success(ev.detail.response)
          }
      }
  }
  _whereUsedDataSource (options, success, error) {
      if (_.isEmpty(this.whereUsedRequest)) {
          return;
      }
      DataHelper.oneTimeEvent(this._liquidInitSearchElement, 'response', this._onInitSearchResponse.bind(
          this));

      DataHelper.oneTimeEvent(this._liquidGetSearchElement, 'response', this._onGetSearchResponse.bind(
          this, success, error));

      this._error=error;
      // Set Options
      this._whereUsedOptions = options;

      // Set Range
      let requestOptions = this._prepareRequestOptions(this._whereUsedOptions);
      this.set("whereUsedRequest.params.options", requestOptions);

      if(options.initResponse){
          this.set("initiateSearchResponse", options.initResponse);
          this._liquidGetSearchElement.generateRequest();
      }else{
          // Make Request
          this._liquidInitSearchElement.generateRequest();
      }
  }
  _onInitSearchResponse(e){
      let liqGetSearchResultDetail = this.shadowRoot.querySelector('#getSearchResultDetail');
      if(liqGetSearchResultDetail){
          liqGetSearchResultDetail.generateRequest();
      }
  }
  _onGetSearchResponse (success, error) {
      if (this.searchResultResponse.status == "success") {
          let searchResults = this._formatResponse(this.searchResultResponse);
          if (typeof (searchResults) == 'undefined') {
              searchResults = [];
          }

          // UpdateCurrent RecordSize
          this._updateCurrentRecordSize(this._whereUsedOptions, searchResults, this._totalCount,this._resultRecordSize);

          let totalRecords = 0;
          let maxRecords = 0;
          if(this.initiateSearchResponse && this.initiateSearchResponse.content){
              totalRecords = this.initiateSearchResponse.content.totalRecords;
              maxRecords = this.initiateSearchResponse.content.maxRecords;
          }
          let resObj = {totalCount:totalRecords, result:searchResults, initResponse:this.initiateSearchResponse, maxRecords:maxRecords}
          // Invoke Callback
          success(resObj);
          
      } else {
          error();
      }
  
  }
  _onSearchError () {
      this._error();
  }
}
customElements.define(EntityGraphTreeDatasource.is, EntityGraphTreeDatasource);
