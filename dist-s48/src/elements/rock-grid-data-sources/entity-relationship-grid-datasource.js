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
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-helpers/data-helper.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class EntityRelationshipGridDatasource
    extends mixinBehaviors([
    RUFBehaviors.GridDataSourceBehavior,
    RUFBehaviors.AppBehavior,
    RUFBehaviors.LoggerBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <template is="dom-if" if="{{hasComponentErrored(isComponentErrored)}}">
            <div id="error-container"></div>
        </template>

        <template is="dom-if" if="{{!hasComponentErrored(isComponentErrored)}}">
            <template is="dom-if" if="[[!_isDataObjectTypeModel()]]">
                <liquid-entity-data-get id="getEntityRelationships" operation="getbyids" request-data="[[request]]" last-response="{{entityRelationshipsResponse}}" exclude-in-progress="" include-type-external-name="">
                </liquid-entity-data-get>
            </template>
            <template is="dom-if" if="[[_isDataObjectTypeModel()]]">
                <liquid-entity-model-get id="getEntityModelRelationships" operation="getbyids" request-data="[[request]]" last-response="{{entityRelationshipsResponse}}" exclude-in-progress="" include-type-external-name="">
                </liquid-entity-model-get>
            </template>
        </template>
`;
  }

  static get is() { return 'entity-relationship-grid-datasource' }
  static get properties() {
      return {
          applyContextCoalesce: {
              type: Boolean,
              value: false
          },
          dataObjectType: {
              type: String,
              value: "entity"
          },
          _success: {
              type: Function
          },
          _error: {
              type: Function
          },
          _options: {
              type: Object,
              value: function () {
                  return {}
              }
          }
      }
  }

  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  ready () {
      super.ready();
      this.rDataSource = this._dataSource.bind(this);
  }

  _dataSource (options, success, error) {
      // Attach one-time event
      this._success = success;
      this._error = error;

      // Set Options
      this._options = options;

      this._generateRequest();                
  }

  _generateRequest (retryCount = 5) {                
      if (!this.liqElementType) {
          // if liquid element not found, retry for retryCount times                         
          if (retryCount) {
              timeOut.after(ConstantHelper.MILLISECONDS_30).run(() => {
                  this._generateRequest(retryCount--);
              });
          } else {
              this.logError("Not able to access liquid element from DOM", "", true);
          }                        
      } else {
          // if liquid element found
          let liquidElement = this.liqElementType;

          liquidElement.returnObjectsCollectionName = 'entities';

          DataHelper.oneTimeEvent(liquidElement, 'response', this._onRelationshipsReponse.bind(this));

          // Set Range
          let requestOptions = this._prepareRequestOptions(this._options);
          this.request.params.options = requestOptions;

          if (this.applyContextCoalesce) {
              liquidElement.useDataCoalesce = true;
          }

          // Make Request
          liquidElement.generateRequest();
      }
  }

  get liqElementType() {
      return this.dataObjectType && this.dataObjectType.toLowerCase() == "entitymodel" ? this.shadowRoot.querySelector('#getEntityModelRelationships') : this.shadowRoot.querySelector('#getEntityRelationships');
  }

  async _onRelationshipsReponse (event) {
      let totalRelCount = undefined;

      // Format ResponseData
      let entityRelationships = await this._formatResponse(this.entityRelationshipsResponse, event);
      if (typeof (entityRelationships) == 'undefined') {
          entityRelationships = [];
      } else {
          //Get the total count of relationships
          let resp = this.entityRelationshipsResponse;
          if (resp) {
              if (resp.content && resp.content.entities) {
                  let entities = resp.content.entities;
                  if (entities && entities.length > 0) {
                      let entity = entities[0];
                      let relationshipsTotalCount = entity.relationshipsTotalCount;
                      if (relationshipsTotalCount && event.detail.request) {
                          let currentRel = event.detail.request.requestData.params.fields.relationships[0];
                          totalRelCount = relationshipsTotalCount[currentRel];
                      }
                      let attributes = {};
                      if (DataHelper.isValidObjectPath(entity, "data.attributes")) {
                          attributes = entity.data.attributes;
                      }
                      let eventDetail = {
                          "attributes": attributes
                      }
                      this.fireBedrockEvent("relationshipsGet", eventDetail, { ignoreId: true });
                  }
              }
          }
      }

      // UpdateCurrent RecordSize
      this._updateCurrentRecordSize(this._options, entityRelationships, totalRelCount, totalRelCount);

      // Invoke Callback
      this._success(entityRelationships);
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  resetDataSource () {
      this._resetDataSource();
  }

  _isDataObjectTypeModel () {
      if (!_.isEmpty(this.dataObjectType) && this.dataObjectType.toLowerCase() == "entitymodel") {
          return true;
      }
      return false;
  }
}
customElements.define(EntityRelationshipGridDatasource.is, EntityRelationshipGridDatasource);
