import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-style-manager/styles/bedrock-style-gridsystem.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-text-alignment.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockDataobjectSummaryCountviewItem extends mixinBehaviors([RUFBehaviors.UIBehavior],
    PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-gridsystem bedrock-style-text-alignment">
            .list-item {
                @apply --box-style;
                margin-top: var(--default-margin);
                margin-bottom: var(--default-margin);
                margin-right: var(--default-margin);
                line-height: var(--font-size-md);
                -webkit-flex-wrap: nowrap;
                /* Safari 6.1+ */
                flex-wrap: nowrap;
                cursor: var(--list-item-cursor, pointer);
                position: relative;
                padding: 8px 10px 8px 8px;
                overflow: hidden;
                display: inline-block;
                width: calc(50% - 10px);
                margin: 5px;
                float: left;
            }

            .square {
                color: var(--list-item-count-wrap-text-color, #036bc3);
                font-size: var(--font-size-lg, 18px);
                font-weight: 500;
                margin: 0 10px;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .object-status {
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                width: 8px;
            }

            .contentContainer {
                width: 100%;
                height: 30px;
            }

            .sub-content {
                white-space: nowrap;
                margin-left: 5px;
                flex-grow: 1;
            }

            .border-left-1 {
                background: rgba(18, 156, 230, 1);
            }

            .border-left-2 {
                background: rgba(54, 180, 74, 1);
            }

            .border-left-3 {
                background: rgba(120, 93, 168, 1);
            }

            .border-left-4 {
                background: rgba(247, 142, 30, 1);
            }

            .border-left-5 {
                background: rgba(246, 212, 12, 1);
            }

            .border-left-6 {
                background: rgba(238, 32, 76, 1);
            }

            .item-container {
                display: flex;
                align-items: center;
                height: 30px;
            }
        </style>
        <div class="list-item">
            <div class\$="{{_computeClass(dataobjectCount.status)}} object-status"></div>
            <div class="item-container">
                <div id="taskCount" class="square">
                    [[dataobjectCount.count]]
                    <div id="taskCountLoading">
                        <img id="loadingIcon" src="../../../../src/images/loading.svg">
                    </div>
                </div>
                <div id="externalNameContainer" on-tap="_onActivityTap" class="list-content block-text text-ellipsis">
                    [[dataobjectCount.externalName]]
                </div>
                <template is="dom-if" if="[[isBaseModel(domain)]]">
                    <div id="viewDetails" class="sub-content text-right btn-link" on-tap="_onActivityTap">
                        View details »
                    </div>
                </template>
            </div>
        </div>
        <liquid-entity-data-get name="dataobjectGet" operation="initiatesearchandgetcount" request-data="{{_entityDataRequest}}" data-index="[[dataIndex]]" on-response="_onEntityGetResponse" on-error="_onEntityGetError" exclude-in-progress=""></liquid-entity-data-get>
`;
  }

  static get is() {
      return "rock-dataobject-summary-countview-item";
  }
  static get properties() {
      return {
          _entityDataRequest: {
              type: Object,
              value: function () {
                  return {
                      "params": {
                          "query": {
                              "filters": {
                                  "typesCriterion": []
                              }
                          }
                      }
                  };
              }
          },
          dataobjectCount: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          dataobject: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          domain: {
              type: String
          },
          modelDomain: {
              type: String
          },
          dataIndex: {
              type: String,
              value: "entityModel"
          },
      }
  }
  connectedCallback() {
      super.connectedCallback();
      if (this.dataobject && !_.isEmpty(this.dataobject)) {
          this._entityDataRequest.params.query.filters.typesCriterion[0] = this.dataobject.governanceName;
          let entityDataLiquid = this.shadowRoot.querySelector("[name=dataobjectGet]");
          if (this.dataIndex == "entityModel") {
              if (this.modelDomain) {
                  this._entityDataRequest.params.query.domain = this.modelDomain;
              }
          }
          entityDataLiquid.generateRequest();
      }
  }
  _computeClass(status) {
      if (status) {
          if (status == "blue") {
              return 'border-left-1';
          } else if (status == "orange") {
              return 'border-left-2';
          } else {
              return 'border-left-3';
          }
      }
      return 'border-left-3';
  }
  _onEntityGetResponse(e) {
      if (e.detail && e.detail.response) {
          let response = e.detail.response;
          if (response && response.content) {
              let value = response.content.totalRecords || 0;
              this.set("dataobjectCount", {
                  "count": value,
                  "externalName": this.dataobject.externalName,
                  "type": this.dataobject.governanceName,
                  "status": "blue"
              });
              this._setTaskLoadingIndicatorVisibility(false);
          }
      }
  }
  _onEntityGetError(e) {
      this.logError("Entity get failed", e.detail);
      this._setTaskLoadingIndicatorVisibility(false);
  }
  _onActivityTap() {
      let appName = this._getAppNameToRedirect(this.domain);
      let params = {
          "type": this.dataobjectCount.type
      };
      if (this.modelDomain) {
          params["modelDomain"] = this.modelDomain;
      }
      this.setState(params);
      let stateObj = {
          state: this.getQueryParamFromState()
      };
      ComponentHelper.appRoute(appName, stateObj);
  }
  _getAppNameToRedirect(domain) {
      let appName = "search-" + domain.toLowerCase();
      return appName;
  }
  _setTaskLoadingIndicatorVisibility(isVisible) {
      this.shadowRoot.querySelector('#taskCountLoading').hidden = !isVisible;
      this.shadowRoot.querySelector('#taskCount').hidden = isVisible;
  }
  isBaseModel(domain) {
      if (domain == "dataModel") {
          return false;
      }
      return true;
  }
}
customElements.define(RockDataobjectSummaryCountviewItem.is, RockDataobjectSummaryCountviewItem);
