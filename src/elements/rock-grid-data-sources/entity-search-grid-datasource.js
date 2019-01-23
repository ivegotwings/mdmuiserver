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
import '../bedrock-grid-datasource-behavior/bedrock-grid-datasource-behavior.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../bedrock-toast-behavior/bedrock-toast-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/constant-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class EntitySearchGridDatasource
    extends mixinBehaviors([
    RUFBehaviors.LoggerBehavior,
    RUFBehaviors.ToastBehavior,
    RUFBehaviors.UIBehavior,
    RUFBehaviors.GridDataSourceBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <liquid-entity-data-get id="initiateSearchResult" operation="initiatesearch" request-data="[[_initSearchRequest]]" on-error="_onSearchError" data-index\$="[[dataIndex]]" exclude-in-progress=""></liquid-entity-data-get>
        <liquid-entity-data-get id="getSearchResultDetail" operation="getsearchresultdetail" apply-locale-coalesce="[[applyLocaleCoalesce]]" request-data="[[_searchResultRequest]]" request-id="[[_initSearchResponse.content.requestId]]" last-response="{{searchResultResponse}}" on-error="_onSearchResultError" exclude-in-progress="" include-type-external-name="" data-index\$="[[dataIndex]]"></liquid-entity-data-get>
`;
  }

  static get is() { return 'entity-search-grid-datasource' }
  static get properties() {
      return {
          attributeModels: {
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

          isCombinedGet: {
              type: Boolean,
              value: false
          },


          rDataSource: {
              type: Object,
              notify: true
          },

          applyContextCoalesce: {
              type: Boolean,
              value: false
          },

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
          _originalRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _initSearchRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _searchResultRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          relatedEntitySearchEnabled: {
              type: Boolean,
              value: false
          },
          applyLocaleCoalesce: {
              type: Boolean,
              value: false
          },
          dataIndex: {
              type: String,
              value: "entityData"
          },
          maxRecordsSize: {
              type: Number,
              value: 0
          }
      }
  }

  /**
    * <b><i>Content development is under progress... </b></i> 
    */



  constructor() {
      super();
      this.rDataSource = this._dataSource.bind(this);
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  ready () {
      super.ready();
      this._liquidInitSearchElement = dom(this).node.shadowRoot.querySelector(
          "liquid-entity-data-get[id='initiateSearchResult']");
      this._liquidGetSearchElement = dom(this).node.shadowRoot.querySelector(
          "liquid-entity-data-get[id='getSearchResultDetail']");

      if (this.applyContextCoalesce) {
          this._liquidInitSearchElement.useDataCoalesce = true;
          this._liquidGetSearchElement.useDataCoalesce = true;
      }
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  resetDataSource () {
      this._resetDataSource();
  }

  _dataSource (options, success, error) {
      // Bind Reponse Methods
      DataHelper.oneTimeEvent(this._liquidInitSearchElement, 'response', this._onInitSearchResponse.bind(this));

      DataHelper.oneTimeEvent(this._liquidGetSearchElement, 'response', this._onGetSearchResponse.bind(this, success, error));

      // Set Options
      this._options = options;

      // Set Range
      let requestOptions = this._prepareRequestOptions(this._options);

      if(this.maxRecordsSize && this.maxRecordsSize > 0) {
          requestOptions.maxRecords = this.maxRecordsSize;
      }

      if (this._options.sortOrder && this._options.sortOrder.length && this.attributeModels) {
          //TODO:: Currently only single column sorting is supported so always need to take care about last sort order object.
          let sortOrder = this._options.sortOrder[this._options.sortOrder.length - 1];

          let attributes = [];
          let attributeModel = this.attributeModels[sortOrder.path];
          let property = {};

          let direction = "_ASC";
          if (sortOrder.direction && attributeModel) {

              if (sortOrder.direction == "asc") {
                  direction = "_ASC";
              } else if (sortOrder.direction == "desc") {
                  direction = "_DESC";
              }

              property[sortOrder.path] = direction;
              property["sortType"] = ConstantHelper.getDataTypeConstant(attributeModel.dataType);
              attributes.push(property);
              this.request.params["sort"] = { "attributes": attributes };
          }
      } else {
          //TEMP": Vishal - REMOVED DEFAULT SORTING TILL RDF FIXES SORT PERF ISSUE
          // this.request.params["sort"] = {
          //     "properties": [
          //         {
          //             "modifiedDate": "_DESC",
          //             "sortType": "_DATETIME"
          //         }
          //     ]
          // };
      }

      this.set("request.params.options", requestOptions);

      this._originalRequest = DataHelper.cloneObject(this.request);

      let dataContexts = ContextHelper.getDataContexts(this.contextData);

      let requestParams = this._getRequestParams(this.request);

      if(!_.isEmpty(dataContexts) && 
          DataHelper.isValidObjectPath(requestParams, "query.filters") &&
          requestParams.query.filters) {
          /** when a context is selected, we need entities which are in that context.
           * For that we need to send this flag false
           * */
          requestParams.query.filters.nonContextual = false;
      }

      this._initSearchRequest = DataHelper.cloneObject(this.request);

      let initSearchRequestParams = this._getRequestParams(this._initSearchRequest);

      delete initSearchRequestParams.fields;

      if(this._isRelatedEntitySearch(initSearchRequestParams)) {
          initSearchRequestParams.isRelatedEntitySearch = true;

          requestParams = this._getRequestParams(this.request);
          requestParams.isRelatedEntitySearch = true;
      }

      // Initiate Request only for First Time.
      if (!this._isRequestInitiated) {
          this._liquidInitSearchElement.generateRequest();
      } else {
          this._generateSearchResultRequest();
      }
  }


  _onInitSearchResponse (e) {
      this._totalCount = this._resultRecordSize = e.detail.response.content.totalRecords;
      this._initSearchResponse = e.detail.response;

      this._generateSearchResultRequest();
  }

  _generateSearchResultRequest() {
      this._searchResultRequest = {
          "params" : this._getRequestParams(this._originalRequest)
      };
      this._searchResultRequest.params.options = this._prepareRequestOptions(this._options);

      delete this._searchResultRequest.params.query.filters.attributesCriterion;
      delete this._searchResultRequest.params.query.filters.relationshipsCriterion;
      delete this._searchResultRequest.params.query.filters.keywordsCriterion;

      DataRequestHelper.addDefaultContext(this.request);
      DataRequestHelper.addDefaultContext(this._searchResultRequest);

      this._liquidGetSearchElement.generateRequest();
      this._isRequestInitiated = true;
  }

  async _onGetSearchResponse (success, error) {
      if (this.searchResultResponse.status == "success") {
          // Format ResponseData
          let searchResults = await this._formatResponse(this.searchResultResponse);
          if (typeof (searchResults) == 'undefined') {
              searchResults = [];
          }

          // UpdateCurrent RecordSize
          this._updateCurrentRecordSize(this._options, searchResults, this._totalCount, this._resultRecordSize);

          // Invoke Callback
          success(searchResults);
      } else {
          error();
      }
  }

  _onSearchError (e) {
      this.logError("entity-search-grid-datasource - Failed to fetch search results for the given criteria", e.detail);
      this.fireBedrockEvent("search-error");
  }

  _onSearchResultError (e) {
      this.logError("entity-search-grid-datasource - Failed to fetch search results for the given criteria", e.detail);
      this.fireBedrockEvent("search-error");
  }

  _getRequestParams (request) {
      if (this.isCombinedGet) {
          if (request && request.entity && request.entity.data && request.entity.data.jsonData) {
              let searchQueries = request.entity.data.jsonData.searchQueries;
              for (let i = 0; i < searchQueries.length; i++) {
                  if (searchQueries[i].serviceName === "entityservice") {
                      return searchQueries[i].searchQuery;
                  }
              }
          }
      } else {
          return request.params;
      }
  }

  _isRelatedEntitySearch(params) {
      if(this.relatedEntitySearchEnabled && params && params.query && params.query.filters && params.query.filters.relationshipsCriterion
         && params.query.filters.relationshipsCriterion.length > 0) {
             for(let i=0; i< params.query.filters.relationshipsCriterion.length; i++) {
                 let relCriterion = params.query.filters.relationshipsCriterion[i];
                 for(let relType in relCriterion) {
                     if(!_.isEmpty(relCriterion[relType].query)) {
                         //means this is related entity search
                         return true;
                     }
                 }
             }
         }
  }
}
customElements.define(EntitySearchGridDatasource.is, EntitySearchGridDatasource);
