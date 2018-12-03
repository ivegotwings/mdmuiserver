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
import '../bedrock-lov-datasource-behavior/bedrock-lov-datasource-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class EntityModelLovDatasource
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.LOVDataSourceBehavior
    ], PolymerElement) {
  static get template() {
    return Polymer.html`
        <liquid-entity-model-get id="initEntityModelSearch" operation="initiatesearch" request-data="{{request}}" last-response="{{_initEntityModelSearchResponse}}" on-error="_onError" exclude-in-progress=""></liquid-entity-model-get>
        <liquid-entity-model-get id="getEntityModelSearchResult" operation="getsearchresultdetail" request-data="{{request}}" request-id="[[_initEntityModelSearchResponse.content.requestId]]" last-response="{{getEntityModelSearchResponse}}" on-error="_onError" exclude-in-progress=""></liquid-entity-model-get>
`;
  }

  static get is() { return 'entity-model-lov-datasource' }
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
          rDataSource: {
              type: Object,
              notify: true
          },
          rDataFormatter: {
              type: Function,
              notify: true
          }
      }
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  ready() {
      super.ready()
      this._liquidInitSearchElement = dom(this).node.shadowRoot.querySelector(
          "liquid-entity-model-get[id='initEntityModelSearch']");
      this._liquidGetSearchElement = dom(this).node.shadowRoot.querySelector(
          "liquid-entity-model-get[id='getEntityModelSearchResult']");

      this.rDataSource = this._dataSource.bind(this);
  }

  _dataSource(data, success, error) {
      // Bind Reponse
      if (!this.isResponseAttached) {
          this._liquidInitSearchElement.addEventListener('response', this._onInitSearchResponse.bind(
              this));
          this._liquidGetSearchElement.addEventListener('response', this._onGetSearchResponse.bind(
              this, success, error));
          this.isResponseAttached = true;
      }

      // Filter
      let keywordsCriterion;
      if (this.keywordsCriterionBuilder && this.keywordsCriterionBuilder instanceof Function) {
          keywordsCriterion = this.keywordsCriterionBuilder(data.filter);
      }

      if (keywordsCriterion) {
          this.set("request.params.query.filters.keywordsCriterion", keywordsCriterion);
      } else {
          delete this.request.params.query.filters.keywordsCriterion;
      }

      if (this.checkIfRequestChanged instanceof Function && this.checkIfRequestChanged()) {
          this.isRequestInitiated = false;
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

      if (keywordsCriterion) {
          this.set("request.params.query.filters.keywordsCriterion", keywordsCriterion);
      } else {
          delete this.request.params.query.filters.keywordsCriterion;
      }

      // Initiate Request only for First Time.
      if (!this.isRequestInitiated) {
          this._liquidInitSearchElement.generateRequest();
      } else {
          this._liquidGetSearchElement.generateRequest();
      }
  }

  _onInitSearchResponse() {
      this._lastRequest = DataHelper.cloneObject(this.request);
      this._liquidGetSearchElement.generateRequest();
      this.isRequestInitiated = true;
  }

  _onGetSearchResponse(success, error) {
      if (typeof (this.rDataFormatter) == 'function') {
          if (this.getEntityModelSearchResponse.status === "success") {
              success(this.rDataFormatter(this.getEntityModelSearchResponse));
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

          this.logError("Entity model load failed" + message, e.detail);
      }
  }
}
customElements.define(EntityModelLovDatasource.is, EntityModelLovDatasource);
