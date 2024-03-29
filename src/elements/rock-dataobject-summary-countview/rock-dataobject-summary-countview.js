import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import './rock-dataobject-summary-countview-item.js';
class RockDataobjectSummaryCountview extends PolymerElement{
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-gridsystem">
            :host {
                display: block;
                margin-left: -5px;
                margin-right: -5px;
            }
        </style>
        <template is="dom-if" if="[[_isExternalNameAvailable]]">
            <template is="dom-repeat" items="[[lists]]">
                <rock-dataobject-summary-countview-item model-domain="[[modelDomain]]" dataobject="[[item]]" domain="[[domain]]" data-index\$="[[dataIndex]]"></rock-dataobject-summary-countview-item>
            </template>

        </template>
        <liquid-entity-model-get id="externalNameGet" operation="getbyids" request-id="[[initexternalNameGet.content.requestId]]" on-response="_onExternalNameGetResponse" on-error="_onExternalNameGetError"></liquid-entity-model-get>
`;
  }

  static get is() {
      return "rock-dataobject-summary-countview";
  }
  static get properties() {
      return {
          dataobjectList: {
              type: Object,
              observer: '_dataobjectListChanged'
          },
          _externalNameRequest: {
              type: Object,
              value: function(){
                  return {
                      "params": {
                      "query": {
                      "filters": {
                          "typesCriterion": [
                          "entityType"
                          ]
                      },
                      "ids": []
                      },
                      "fields": {
                          "properties": [
                              "_ALL"
                          ],
                          "attributes": [
                              "_ALL"
                          ]
                      }
                  }
              }
          }
          },
          
          _isExternalNameAvailable: {
              type: Boolean,
              value: false
          },
          lists: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true,
          },
          domain: {
              type: String
          },
          modelDomain: {
              type: String
          },
          dataIndex: {
              type: String
          }
      }
  }
  _dataobjectListChanged(dataobjectList) {
          if(dataobjectList && dataobjectList.length != 0){
              let externalNameGet = this.shadowRoot.querySelector('#externalNameGet');
              if (typeof (externalNameGet) === "undefined" ||
                  externalNameGet == null) {
                      this.logError("IdNotFound");
                  return;
              }
              for(let key in dataobjectList){
                  this._externalNameRequest.params.query.ids.push(dataobjectList[key]+"_entityType");
              }
              externalNameGet.requestData = this._externalNameRequest;
              externalNameGet.generateRequest();
          }
      }
  _onExternalNameGetResponse(e) {
      let responseContent = DataHelper.validateAndGetResponseContent(e.detail.response);
      if (responseContent) {
          let entityTypes = responseContent.entityModels;

          for (let i = 0; i < entityTypes.length; i++) {
              let entityType = entityTypes[i];

              this.lists.push({
                  "externalName":entityType.properties.externalName,
                  "governanceName": entityType.name
              });
          }

          if (this.lists.length > 0) {
              this._isExternalNameAvailable = true;
          }
      }
  }
  _onExternalNameGetError(e) {
      this.logError("entityType error",e);
  }
}
customElements.define(RockDataobjectSummaryCountview.is, RockDataobjectSummaryCountview);
