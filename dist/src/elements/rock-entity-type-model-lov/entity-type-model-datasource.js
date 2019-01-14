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
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '../bedrock-lov-datasource-behavior/bedrock-lov-datasource-behavior.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';

class EntityTypeModelDatasource
    extends mixinBehaviors([
        RUFBehaviors.LOVDataSourceBehavior,
        RUFBehaviors.LoggerBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <liquid-entity-model-get id="initGetEntities" operation="initiatesearch" request-data="{{request}}" last-response="{{_initGetEntitySearchResponse}}" on-error="_onError" on-response="_generateSearchRequest" exclude-in-progress="">
        <liquid-entity-model-get id="getEntitiesSearchResults" operation="getsearchresultdetail" request-data="{{request}}" request-id="[[_initGetEntitySearchResponse.content.requestId]]" on-response="_onGetResponse" on-error="_onError" exclude-in-progress="">
        </liquid-entity-model-get></liquid-entity-model-get>
        `;
  }
  static get is() { return 'entity-type-model-data-source' }

  constructor() {
    super();
  }

  ready(){
      super.ready();
      this._liquidInitSearchElement = this.shadowRoot.querySelector('#initGetEntities');
      this._liquidGetSearchElement = this.shadowRoot.querySelector('#getEntitiesSearchResults');
      this.dataSource = this._dataSource.bind(this);
  }

  static get properties() {
    return {
        request: {
            type: Object,
            value: function () {
                return {};
            },
            observer: '_initiateRequest'
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
        }
      }
  }
  
  _dataSource(data, success, error) {
    if (_.isEmpty(this.request)) {
        return;
    }

    // Bind Reponse
    if (!this.isResponseAttached) {
        this._liquidInitSearchElement.addEventListener('response', this._onInitSearchResponse.bind(this));
        this._liquidGetSearchElement.addEventListener('response', this._onGetSearchResponse.bind(this, success, error));

        this._error = error;
        this.isResponseAttached = true;
    }

    // Filter
    let keywordsCriterion;
    if (this.keywordsCriterionBuilder && this.keywordsCriterionBuilder instanceof Function) {
        keywordsCriterion = this.keywordsCriterionBuilder(data.filter);
    }

    if (keywordsCriterion) {
        this.set("request.params.query.filters.keywordsCriterion", keywordsCriterion);
    } else if (this.request.params.query.filters && typeof (this.request.params.query.filters.keywordsCriterion !== undefined)) {
        delete this.request.params.query.filters.keywordsCriterion;
    }

    if (this.checkIfRequestChanged()) {
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
    this._lastRequest = DataHelper.cloneObject(this.request);
    this._liquidGetSearchElement.generateRequest();
    this.isRequestInitiated = true;
}

_onGetSearchResponse(success, error) {
    if (event && event.detail && event.detail.response) {
        if (typeof (this.dataFormatter) == 'function') {
            if (event.detail.response.status === "success") {
                success(this.dataFormatter(event.detail.response));
            } else {
                error();
            }
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

        this.logError("Entity type model lov load failed" + message, e.detail);
    }
}

}

customElements.define(EntityTypeModelDatasource.is, EntityTypeModelDatasource);