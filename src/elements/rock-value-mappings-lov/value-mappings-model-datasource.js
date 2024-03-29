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

import '../bedrock-lov-datasource-behavior/bedrock-lov-datasource-behavior.js';
import '../bedrock-grid-datasource-behavior/bedrock-grid-datasource-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/bedrock-helpers.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class ValueMappingsModelDatasource extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.LOVDataSourceBehavior,
        RUFBehaviors.GridDataSourceBehavior
    ],
    PolymerElement) {
  static get template() {
    return html`
        <liquid-entity-model-get id="liquidModelInitSearch" operation="initiatesearch" request-data="{{request}}" on-error="_onError" last-response="{{_initSearchResponse}}" exclude-in-progress=""></liquid-entity-model-get>
        <liquid-entity-model-get id="liquidModelGetResult" operation="getsearchresultdetail" request-data="{{request}}" on-error="_onError" request-id="[[_initSearchResponse.content.requestId]]" last-response="{{searchResultResponse}}" exclude-in-progress=""></liquid-entity-model-get>
`;
  }

  static get is() {
      return "value-mappings-model-datasource";
  }
  static get properties() {
      return {
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          schema: {
              type: String,
              value: ""
          },
          _liquidInitSearchElement: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _liquidGetSearchElement: {
              type: Object,
              value: function () {
                  return {};
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
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          rDataSource: {
              type: Object,
              notify: true
          },
          rDataFormatter: {
              type: Function,
              notify: true
          },
          request: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          searchResultResponse: {
              type: Object,
              value: function () {
                  return {};
              }
          }
      }
  }
  ready() {
      super.ready();
      this._liquidInitSearchElement = this.$$('#liquidModelInitSearch');
      this._liquidGetSearchElement = this.$$('#liquidModelGetResult');

      this.rDataSource = this._dataSource.bind(this);
  }

  resetDataSource() {
      this.isRequestInitiated = false;
      this._resetDataSource();
  }

  _dataSource(options, success, error) {

      if (_.isEmpty(this.request)) {
          return;
      }

      DataHelper.oneTimeEvent(this._liquidInitSearchElement, 'response', this._onInitSearchResponse.bind(
          this));

      DataHelper.oneTimeEvent(this._liquidGetSearchElement, 'response', this._onGetSearchResponse.bind(
          this, success, error));

      this._error = error;

      // Filter
      let keywordsCriterion;
      if (this.keywordsCriterionBuilder instanceof Function) {
          keywordsCriterion = this.keywordsCriterionBuilder(options.filter);
      }
      let sortCriterion;
      if (this.sortCriterionBuilder instanceof Function) {
          sortCriterion = this.sortCriterionBuilder(options.sortOrder);
      }
      let filterCriterion;
      if (this.filterCriterionBuilder instanceof Function) {
          filterCriterion = this.filterCriterionBuilder(options.filter);
      }

      if (sortCriterion) {
          this.request.params["sort"] = sortCriterion;
      } else {
          if (this.request.params.sort) {
              delete this.request.params.sort;
          }
      }

      if (filterCriterion) {
          if (filterCriterion.propertiesCriterion) {
              this.set("request.params.query.filters.propertiesCriterion", filterCriterion.propertiesCriterion);
          } else {
              delete this.request.params.query.filters.propertiesCriterion;
          }
          if (filterCriterion.attributesCriterion) {
              this.set("request.params.query.filters.attributesCriterion", filterCriterion.attributesCriterion);
          } else {
              delete this.request.params.query.filters.attributesCriterion;
          }
      } else if (this.request.params.query.filters) {
          delete this.request.params.query.filters.propertiesCriterion;
          delete this.request.params.query.filters.attributesCriterion;
      }

      if (keywordsCriterion) {
          this.set("request.params.query.filters.keywordsCriterion", keywordsCriterion);
      } else if (this.request.params.query.filters && this.request.params.query.filters.keywordsCriterion !==
          undefined) {
          delete this.request.params.query.filters.keywordsCriterion;
      }

      // Set Options
      this._options = options;
      this._options["viewMode"] = this.schema;


      if (this.checkIfRequestChanged()) {
          if (this.schema == "lov") {
              this.isRequestInitiated = false;
              this._options.page = 1;
          } else if (this.schema == "grid") {
              this.resetDataSource();
          }
      }

      // Set Range
      let requestOptions = this._prepareRequestOptions(this._options);
      this.set("request.params.options", requestOptions);

      this.reTriggerRequest();
  }
  /**
   * <b><i>Content development is under progress... </b></i> 
   */
  reTriggerRequest() {
      if (!this.isRequestInitiated) {
          this._liquidInitSearchElement.generateRequest();
      } else {
          this._liquidGetSearchElement.generateRequest();
      }
  }
  _onInitSearchResponse(e) {
      this._totalCount = e.detail.response.content.totalRecords;
      this._resultRecordSize = e.detail.response.content.resultRecordSize;
      this._lastRequest = DataHelper.cloneObject(this.request);
      this._liquidGetSearchElement.generateRequest();
      this.isRequestInitiated = true;
  }
  _onGetSearchResponse(success, error) {
      if (typeof (this.rDataFormatter) == 'function') {
          if (this.searchResultResponse.status === "success") {
              if (this.schema === "lov") {
                  success(this.rDataFormatter(this.searchResultResponse));
              } else if (this.schema === "grid") {
                  if (this._lastPage < this._options.page) {
                      let searchResults = this._formatResponse(this.searchResultResponse);

                      if (typeof (searchResults) == 'undefined') {
                          searchResults = [];
                      }

                      // UpdateCurrent RecordSize
                      this._updateCurrentRecordSize(this._options, searchResults, this._totalCount,
                          this._resultRecordSize);

                      // Invoke Callback
                      success(searchResults);
                  }
              }
          } else {
              error();
          }
      }
  }
  _onError(e) {
      let response = e.detail.response; //need to check why this is response.response
      if (response && response.status && response.status.toLowerCase() == "error") {
          let message = "";
          if (response.statusDetail && response.statusDetail.message) {
              message = " with message: " + response.statusDetail.message;
          }

          this.logError("Value mappings lov load failed" + message, e.detail);
      }
  }
}
customElements.define(ValueMappingsModelDatasource.is, ValueMappingsModelDatasource);
