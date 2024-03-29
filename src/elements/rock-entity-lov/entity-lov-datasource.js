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
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../bedrock-lov-datasource-behavior/bedrock-lov-datasource-behavior.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import EntityTypeManager from '../bedrock-managers/entity-type-manager.js';


class EntityLovDatasource extends mixinBehaviors([
    RUFBehaviors.LOVDataSourceBehavior,
    RUFBehaviors.LoggerBehavior],
    PolymerElement) {
  static get template() {
    return html`
        <liquid-entity-data-get id="initGetEntitySearch" data-index\$="[[dataIndex]]" apply-locale-coalesce="[[applyLocaleCoalesce]]" operation="initiatesearch" request-data="[[request]]" on-error="_onGetSearchError" exclude-in-progress=""></liquid-entity-data-get>
        <liquid-entity-data-get id="getEntitySearchResults" data-index\$="[[dataIndex]]" apply-locale-coalesce="[[applyLocaleCoalesce]]" operation="getsearchresultdetail" request-data="[[request]]" request-id="[[_initGetEntitySearchResponse.content.requestId]]" on-error="_onGetSearchError" exclude-in-progress="" include-type-external-name=""></liquid-entity-data-get>
        <liquid-entity-data-get id="entitySearchAndGet" data-index\$="[[dataIndex]]" apply-locale-coalesce="[[applyLocaleCoalesce]]" operation="searchandget" request-data="[[request]]" on-response="_onEntitySearchAndGetResponse" last-response="{{entitySearchAndGetResponse}}" on-error="_onGetSearchError" exclude-in-progress="" include-type-external-name=""></liquid-entity-data-get>
`;
  }

  static get is() {
      return 'entity-lov-datasource';
  }
  static get properties() {
      return {
          /**
          * <b><i>Content development is under progress... </b></i>
          */
          rDataSource: {
              type: Object,
              notify: true
          },
          rDataFormatter: {
              type: Function,
              notify: true
          },
          baseRequest: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          applyLocaleCoalesce: {
              type: Boolean,
              value: false
          },
          dataIndex: {
              type: String,
              value: "entityData"
          },
          isInitResponseAttached: {
              type: Boolean,
              value: false
          },
          isGetResponseAttached: {
              type: Boolean,
              value: false
          },
          domain: {
              type: String,
              value: ""
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
          lazyLoadingDisabled: {
              type: Boolean,
              value: false
          }
      }
  }


  /**
  * <b><i>Content development is under progress... </b></i>
  */
  ready() {
      super.ready();
      this._liquidInitSearchElement = dom(this).node.shadowRoot.querySelector(
          "liquid-entity-data-get[id='initGetEntitySearch']");
      this._liquidGetSearchElement = dom(this).node.shadowRoot.querySelector(
          "liquid-entity-data-get[id='getEntitySearchResults']");
      this._liquidSearchAndGetElement = dom(this).node.shadowRoot.querySelector(
          "liquid-entity-data-get[id='entitySearchAndGet']");

      this.rDataSource = this._dataSource.bind(this);
  }

  async _dataSource(data, success, error) {

      if (data && data.page === 1) {
          this.isRequestInitiated = false;
      }

      if (_.isEmpty(this.baseRequest)) {
          success([]);
          return;
      }

      this.request = DataHelper.cloneObject(this.baseRequest);
      let entityType;
      // Bind Reponse
      if (!this.isInitResponseAttached) {
          DataHelper.oneTimeEvent(this._liquidInitSearchElement, 'response', this._onInitSearchResponse.bind(
              this));
          this._error = error;
          this.isInitResponseAttached = true;
      }

      if (!this.isGetResponseAttached) {
          DataHelper.oneTimeEvent(this._liquidGetSearchElement, 'response', this._onGetSearchResponse.bind(
              this, success, error));
          this._error = error;
          this.isGetResponseAttached = true;
      }

      // Filter
      //temporary code because RDF doesnt support OR search in attributesCriterion
      //so if there are more than one attrs to search in, then use keyword search
      let attributesCriterion;
      if(DataHelper.isValidObjectPath(this.request, 'params.query.filters.typesCriterion.0')){
            entityType= this.request.params.query.filters.typesCriterion[0];
        }
        let domain;
        if (entityType) {
            let entityTypeManager = new EntityTypeManager();
            domain = await entityTypeManager.getDomainByEntityTypeName(entityType);
        }
        let requestedEntityTypeDomain = domain ? domain : this.domain;
        let criterionKey = requestedEntityTypeDomain && (requestedEntityTypeDomain == "baseModel") ? "propertiesCriterion" : "attributesCriterion";
        
        if (this.attributesCriterionBuilder && this.attributesCriterionBuilder instanceof Function) {
            let attributesCriterionObj = this.attributesCriterionBuilder(data.filter,criterionKey);
            attributesCriterion = attributesCriterionObj[criterionKey];

            if (!_.isEmpty(attributesCriterion)) {
                if (_.isEmpty(this.request.params.query.filters[criterionKey])) {
                    this.request.params.query.filters[criterionKey] = [];
                }
                if (criterionKey == "attributesCriterion") {
                    attributesCriterion.forEach(function (attrCriterion) {
                        this.request.params.query.filters[criterionKey].push(attrCriterion);
                    }, this);
                    if (attributesCriterionObj["isAttributesCriterionOR"]) {
                        this.request.params.query.filters["isAttributesCriterionOR"] = true;
                    }
                } else {
                    this.request.params.query.filters[criterionKey] = [attributesCriterion[0]];
                }
            }
        }

      this._setSortCriterion(data.sort);

      if (this.checkIfRequestChanged()) {
          this.isRequestInitiated = false;
          data.page = 1;
      }

      // Set Range
      let from = data.page > 0 ? (data.page - 1) * data.pageSize : 0;
      let to = data.page > 0 ? data.page * data.pageSize - 1 : 0;

      let maxRecords = 50;
      if(this.lazyLoadingDisabled) {
          maxRecords = 200;
      }

      let options = {
          "from": from,
          "to": to,
          "maxRecords": maxRecords
      };
      
      this.set("request.params.options", options);

      // Initiate request only for First Time.
      if (!this.isRequestInitiated) {
          if (DataHelper.isValidObjectPath(this.request, "params.query.filters.isAttributesCriterionOR")) {
              if (this._getAttributeFilterOperation() == "AND") {
                  this.request.params.query.filters["isAttributesCriterionOR"] = false;
              }
          }
          this._liquidInitSearchElement.generateRequest();
      } else {
          this._liquidGetSearchElement.generateRequest();
      }
  }
  _getAttributeFilterOperation() {
      let operation = "OR";
      if (DataHelper.isValidObjectPath(this.request, "params.query.filters.attributesCriterion")) {
          let attributeCriterion = this.request.params.query.filters.attributesCriterion;
          if (attributeCriterion.length > 1) {
              let attributes = [];
              let attributeName;
              for (let i = 0; i < attributeCriterion.length; i++) {
                  const attribute = attributeCriterion[i];
                  attributeName = Object.keys(attribute)[0];
                  if (attributeName && attribute[attributeName]) {
                      if (attributes.indexOf(attributeName) > -1) {
                          operation = "AND";
                          break;
                      } else {
                          attributes.push(attributeName);
                      }
                  }
              }
          }
      }
      return operation;
  }
  _setKeywordCriterion(filter) {
      let keywordsCriterion;
      if (this.keywordsCriterionBuilder && this.keywordsCriterionBuilder instanceof Function) {
          keywordsCriterion = this.keywordsCriterionBuilder(filter);
      }

      delete this.request.params.query.filters.keywordsCriterion;
      delete this.request.params.query.ids;
      if (keywordsCriterion) {
          if (keywordsCriterion.isIdSearch) {
              this.set("request.params.query.ids", keywordsCriterion.ids);
          } else {
              this.set("request.params.query.filters.keywordsCriterion", keywordsCriterion);
          }
      }
  }
  _setSortCriterion(sort) {
      let sortCriterion;
      if (this.sortCriterionBuilder && this.sortCriterionBuilder instanceof Function) {
          sortCriterion = this.sortCriterionBuilder(sort);
      }
      if (sortCriterion) {
          delete this.request.params.sort;
          this.set("request.params.sort", sortCriterion);
      }
  }

  /**
  * <b><i>Content development is under progress... </b></i>
  */
  reTriggerRequest() {
      this.request = DataHelper.cloneObject(this.baseRequest);
      if (this.lazyLoadingDisabled && !this._isRelationshipGet()) {
          this._liquidSearchAndGetElement.generateRequest();
          return;
      }
      // Initiate Request only for First Time.
      if (!this.isRequestInitiated) {
          this._liquidInitSearchElement.generateRequest();
      } else {
          this._liquidGetSearchElement.generateRequest();
      }
  }

  _isRelationshipGet() {
      if (!_.isEmpty(this.baseRequest)) {
          if (DataHelper.isValidObjectPath(this.baseRequest, "params.fields.relationships")) {
              return true;
          }
      }
      return false;
  }

  _onInitSearchResponse(e) {
      this._lastRequest = DataHelper.cloneObject(this.request);
      this._initGetEntitySearchResponse = e.detail.response;
      delete this.request.params.query.contexts;
      this._liquidGetSearchElement.generateRequest();
      this.isRequestInitiated = true;
      this.isInitResponseAttached = false;
  }

  _onGetSearchResponse(success, error, e) {
      let getEntitySearchResultsResponse = e && e.detail ? e.detail.response : undefined;
      if (typeof (this.rDataFormatter) == 'function' && !_.isEmpty(getEntitySearchResultsResponse)) {
          if (getEntitySearchResultsResponse.status === "success") {
              success(this.rDataFormatter(getEntitySearchResultsResponse));
          } else {
              let detail = {
                  request: this.request,
                  response: getEntitySearchResultsResponse
              }
              this.logError("Entity search results request failed", detail);
              error();
          }
      } else {
          let detail = {
              request: this.request,
              response: "No response"
          }
          this.logError("Entity search results request failed, no response found.", detail);
      }
      this.isGetResponseAttached = false;
  }

  _onEntitySearchAndGetResponse(e) {
      if (this.entitySearchAndGetResponse && this.entitySearchAndGetResponse.status && this.entitySearchAndGetResponse.status.toLowerCase() == "success" && typeof (this.rDataFormatter) == 'function') {
          this.rDataFormatter(this.entitySearchAndGetResponse);
      } else {
          let detail = {
              request: this.request,
              response: e.detail
          }
          this.logError("Entity search and get request failed, no response found.", detail);
      }
  }

  _onGetSearchError(e) {
      let response = e.detail.response; //need to check why this is response.response
      if (response && response.status && response.status.toLowerCase() == "error") {
          if (response.errorCode && response.errorCode == "E0427") {
              let msg = "Data could not be loaded, try with keyword search";
              this._error(msg);
              this.logError("Records exceeded 30K", e.detail);
          } else if (response.message) {
              this._error(response.message);
              this.logError("Entity data get failed", e.detail);
          } else {
              this._error();
          }
      }
  }
}
customElements.define(EntityLovDatasource.is, EntityLovDatasource);
