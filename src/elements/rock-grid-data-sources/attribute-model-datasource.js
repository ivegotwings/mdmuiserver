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
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class AttributeModelDatasource
    extends mixinBehaviors([
    RUFBehaviors.UIBehavior,
    RUFBehaviors.LOVDataSourceBehavior,
    RUFBehaviors.GridDataSourceBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <liquid-entity-model-composite-get id="compositeModelGet" name="compositeAttributeModelGet" on-entity-model-composite-get-response="_onCompositeGetResponse" on-error="_onCompositeGetError" exclude-in-progress="">
        </liquid-entity-model-composite-get>
        <liquid-entity-model-get id="liquidModelInitSearch" operation="initiatesearch" request-data="{{request}}" on-error="_onError" exclude-in-progress=""></liquid-entity-model-get>
        <liquid-entity-model-get id="liquidModelIdGet" operation="getbyids" request-data="{{request}}" on-error="_onError" last-response="{{searchResultResponse}}" exclude-in-progress=""></liquid-entity-model-get>
        <liquid-entity-model-get id="liquidModelGetResult" operation="getsearchresultdetail" request-data="{{request}}" on-error="_onError" request-id="[[_initSearchResponse.content.requestId]]" last-response="{{searchResultResponse}}" exclude-in-progress=""></liquid-entity-model-get>
        <liquid-entity-model-get id="nestedAttrModelGet" operation="getbyids" on-error="_onError" last-response="{{_nestedAttrModelResponse}}" exclude-in-progress=""></liquid-entity-model-get>
`;
  }

  static get is() { return 'attribute-model-datasource' }
  static get properties() {
      return {
          mode: {
              type: String,
              value: ""
          },
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
          _liquidModelIdGet: {
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
          isRequestById: {
              type: Boolean
          },
          isDomainAttributesLoaded:{
              type:Object,
              value:false
          },
          domainAttributes:{
              type:Array,
              value:function(){
                  return [];
              }
          },
          domain:{
              type:String,
              value:""
          }
      }
  }

  /**
    * <b><i>Content development is under progress... </b></i> 
    */

  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  ready () {
      super.ready();
      this._liquidInitSearchElement = this.$$('#liquidModelInitSearch');
      this._liquidGetSearchElement = this.$$('#liquidModelGetResult');
      this._liquidCompositeGetElement = this.$$('#compositeModelGet');
      this._liquidModelIdGet = this.$$('#liquidModelIdGet');
      this._liquidNestedAttrGet = this.shadowRoot.querySelector('#nestedAttrModelGet');

      if(!_.isEmpty(this.mode)) {
          if(this.mode === "all" || this.mode === "domainMapped" || this.mode === "DomainAndTaxonomy") {
              this.rDataSource = this._dataSource.bind(this);
          }
      }
  }

  resetDataSource () {
      this.isRequestInitiated = false;
      this._resetDataSource();
  }

  _dataSource (options, success, error) {

      if (_.isEmpty(this.request)) {
          return;
      }
      if(this.mode === "DomainAndTaxonomy"){
        this.domainAttributes = [];
        this.isDomainAttributesLoaded = false;
        if(this.domain){
            this.request.params.query["domain"] = this.domain;
        }
        this.isRequestInitiated = false;
      }         

      DataHelper.oneTimeEvent(this._liquidInitSearchElement, 'response', this._onInitSearchResponse.bind(
          this));

      DataHelper.oneTimeEvent(this._liquidGetSearchElement, 'response', this._onGetSearchResponse.bind(
          this, success, error));
     
      if(this.isRequestById){
          DataHelper.oneTimeEvent(this._liquidModelIdGet, 'response', this._onGetSearchResponse.bind(
              this, success, error));
      }

      DataHelper.oneTimeEvent(this._liquidNestedAttrGet, 'response', this._onNestedAttrModelResponse.bind(
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

      if(sortCriterion){
          this.request.params["sort"] = sortCriterion;
      } else{
          if(this.request.params.sort){
              delete  this.request.params.sort;
          }
      }

      if (filterCriterion) {
          if(filterCriterion.propertiesCriterion) {
              this.set("request.params.query.filters.propertiesCriterion", filterCriterion.propertiesCriterion);
          } else {
              delete this.request.params.query.filters.propertiesCriterion;
          }
          if(filterCriterion.attributesCriterion) {
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
      } else if (this.request.params.query.filters && this.request.params.query.filters.keywordsCriterion !== undefined) {
          delete this.request.params.query.filters.keywordsCriterion;
      }

      // Set Options
      this._options = options;
      this._options["viewMode"] = this.schema;


      if(this.checkIfRequestChanged()) {
          if(this.schema == "lov") {
              this.isRequestInitiated = false;
              this._options.page = 1;
          } else if(this.schema == "grid") {
              this.resetDataSource();
          }
      }

      if(this.mode != "domainMapped" && this.mode != "DomainAndTaxonomy"){
          // Set Range
          let requestOptions = this._prepareRequestOptions(this._options);
          this.set("request.params.options", requestOptions);
      }else{
          this.set("request.params.options",   {"maxRecords": 50});
      }
      this.reTriggerRequest();
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  reTriggerRequest () {
      if(this.mode === "all" || this.mode == "domainMapped" || this.mode === "DomainAndTaxonomy") {
          if(!this.isRequestById){

              if (!this.isRequestInitiated) {
                  if(this.mode == "domainMapped" && !DataHelper.isValidObjectPath(this.request, "params.options.maxRecords")){
                      this.set("request.params.options", {"maxRecords": 50});
                  }
                  this._liquidInitSearchElement.generateRequest();
              } else {
                  this._liquidGetSearchElement.generateRequest();
              }
          }
          else{
              this._liquidModelIdGet.generateRequest();
          }
      } else {
          this._getData();
      }
  }
  triggerNestedAttrRequest(reqData){
      this._liquidNestedAttrGet.requestData = reqData;
      this._liquidNestedAttrGet.generateRequest();
  }
  _onNestedAttrModelResponse(success, error){
      let _formattedData = this.rDataFormatter(this._nestedAttrModelResponse, error, true);
      success(false);
  }
  _onInitSearchResponse (e) {
      this._totalCount = e.detail.response.content.totalRecords;
      this._initSearchResponse = e.detail.response;
      this._resultRecordSize = e.detail.response.content.resultRecordSize;
      this._lastRequest = DataHelper.cloneObject(this.request);
      this._liquidGetSearchElement.generateRequest();
      this.isRequestInitiated = true;
  }
  _onGetSearchResponse (success, error) {
      if (typeof (this.rDataFormatter) == 'function') {
          if (this.searchResultResponse.status === "success") {
              if(this.schema === "lov") {
                  if(this.mode == "domainMapped"){
                      this.resetDataSource();
                  }
                  let _formattedData = this.rDataFormatter(this.searchResultResponse);
                  if(_formattedData != false){
                      success(_formattedData);
                  }
              } else if(this.schema === "grid") {
                    if(this.mode == "DomainAndTaxonomy"){
                        this.isRequestInitiated = false;
                        this.resetDataSource();
                        if(this.isDomainAttributesLoaded){
                            this.isDomainAttributesLoaded = false;
                            if(!_.isEmpty(this.domainAttributes)){
                                if(this.searchResultResponse.content && this.searchResultResponse.content.entityModels){
                                    this.searchResultResponse.content.entityModels = this.searchResultResponse.content.entityModels.concat(this.domainAttributes);
                                }
                            }
                        }else{
                            this.isDomainAttributesLoaded = true;
                            this.request.params.query["domain"] = "taxonomyModel";
                            if(this.searchResultResponse.content && this.searchResultResponse.content.entityModels){
                                this.domainAttributes = this.searchResultResponse.content.entityModels;
                            }
                            this.reTriggerRequest();
                            return;
                        }
                    }
                  if (this._lastPage < this._options.page) {
                      let searchResults = this._formatResponse(this.searchResultResponse);

                      if (typeof (searchResults) == 'undefined') {
                          searchResults = [];
                      }

                      // UpdateCurrent RecordSize
                      this._updateCurrentRecordSize(this._options, searchResults, this._totalCount,this._resultRecordSize);

                      // Invoke Callback
                      success(searchResults);
                  }
              }
          } else {
              error();
          }
      }
  }
  _onError (e) {
      let response = e.detail.response; //need to check why this is response.response
      if (response && response.status && response.status.toLowerCase() == "error") {
          let message = "";
          if (response.statusDetail && response.statusDetail.message) {
              message = " with message: " + response.statusDetail.message;
          }
          this.logError("attribute-model-datasource - Failed to load attribute models", e.detail);
          this._error();
      }
  }

  /**
  * <b><i>Content development is under progress... </b></i> 
  */
  _getData (request) {

      if (_.isEmpty(this.request)) {
          return;
      }

      if (this._liquidCompositeGetElement) {
          this._liquidCompositeGetElement.requestData = this.request;
          this._liquidCompositeGetElement.generateRequest();
      }
  }

  _onCompositeGetResponse (e) {
      let response = e.detail.response;
      if (typeof (this.rDataFormatter) == 'function') {
          if (response && response.status === "success") {
               this.rDataFormatter(response, e.detail.request.requestData);
          }
      }
  }

  _onCompositeGetError (e) {
      this.logError("attribute-model-datasource - Failed to get composite model", e.detail);
  }
}
customElements.define(AttributeModelDatasource.is, AttributeModelDatasource);
