/**
`rock-relationship-manage` Represents a relationship component in the framework.
It renders the list of attributes based on the specified relationship type.

@group rock Elements
@element rock-relationship-manage
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-demo-helpers/demo-pages-shared-styles.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-entity-data-save/liquid-entity-data-save.js';
import '../pebble-horizontal-divider/pebble-horizontal-divider.js';
import '../pebble-button/pebble-button.js';
import '../rock-entity-relationship-search-result/rock-entity-relationship-search-result.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockRelationshipManage
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior,
        RUFBehaviors.ComponentConfigBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-grid-layout bedrock-style-scroll-bar">
            :host {
                height: 100%;
                display: block;
                @apply --relationship-manage;
            }

            @media (min-height: 600px) {
                .multiple-grid rock-entity-relationship-search-result {
                    height: 100% !important;
                }
            }

            @media (min-height: 700px) {
                .multiple-grid rock-entity-relationship-search-result {
                    height: 80% !important;
                }
            }

            @media (min-height: 850px) {
                .multiple-grid rock-entity-relationship-search-result {
                    height: 60% !important;
                }
            }

            .multiple-grid {
                --accordion-grid-container: {
                    padding-bottom: 30px;
                }
            }
            .multiple-grid .multiple-grid-overflow-content{
                overflow: auto;
            }


            #messageCard {
                text-align: center;
                padding: 15px;
                margin: 0 auto;
            }
        </style>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <div id="messageCard" hidden="[[!_isMessageAvailable]]">
                </div>
            </div>
            <div class="base-grid-structure-child-2">
                <div class\$="full-height [[getMultipleGridClass(displayedRelationshipTypeListChunks)]] ">
                    <div class="full-height multiple-grid-overflow-content">
                        <template is="dom-if" if="displayedRelationshipTypeListChunks.length">
                            <template is="dom-repeat" items="[[displayedRelationshipTypeListChunks]]" as="relationshipTypeList">
                                <template is="dom-repeat" items="{{relationshipTypeList}}" as="relationship">
                                    <rock-entity-relationship-search-result id="entityRelationshipSearchResult_[[relationship]]" relationship-items="[[relationshipTypeList]]" readonly="[[readonly]]" relationship="[[relationship]]" config-context="[[configContext]]" page-size="100" context-data="[[contextData]]" do-sync-validation="[[doSyncValidation]]" functional-mode="[[functionalMode]]" load-govern-data\$="[[loadGovernData]]" data-index\$="[[dataIndex]]" _ismessageavailable="{{_isMessageAvailable}}" exclude-non-contextual="[[excludeNonContextual]]" is-part-of-business-function="[[isPartOfBusinessFunction]]" domain="[[domain]]">
                                    </rock-entity-relationship-search-result>
                                </template>
                            </template>
                        </template>
                    </div>
                </div>
            </div>
        </div>
        <bedrock-pubsub event-name="load-more-relationships" handler="_onLoadMoreRelationshipsDebounced"></bedrock-pubsub>

        <liquid-entity-data-get name="relatedEntityGet" operation="getbyids" on-response="_relatedEntityGetResponse" exclude-in-progress=""></liquid-entity-data-get>
        <bedrock-pubsub event-name="source-info-open" handler="_onSourceInfoOpen"></bedrock-pubsub>
`;
  }

  static get is() { return 'rock-relationship-manage' }

  static get properties() {
      return {
          /**
            * <b><i>Content development is under progress... </b></i>
            */
          contextData: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: "_onContextDataChange"
          },
          /**
           * If set as true , it indicates the component is in read only mode
           */
          readonly: {
              type: Boolean,
              value: false
          },
          relationshipTypeName: {
              type: String,
              value: ""
          },
          domain: {
              type: String,
              value: ""
          },
          addRelationshipMode: {
              type: String,
              value: ""
          },
          relationshipNames: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          /**
            * <b><i>Content development is under progress... </b></i>
            */
          configContext: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: '_onConfigContextChange'
          },
          _isMessageAvailable: {
              type: Boolean,
              value: false
          },
          functionalMode: {
              type: String,
              value: "default"
          },
          globalEdit: {
              type: Boolean,
              notify: true
          },
          doSyncValidation: {
              type: Boolean,
              value: true
          },
          displayedRelationshipTypeListChunks: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          relationshipChunkLength: {
              type: Number,
              value: 10
          },
          dataIndex: {
              type: String,
              value: "entityData"
          },
          loadGovernData: {
              type: Boolean,
              value: true
          },
          excludeNonContextual: {
              type: Boolean,
              value: false
          }
      }
  }

  constructor() {
      super();
      this.relationshipTypeListChunks = [];
      this.displayedRelationshipTypeListChunks = [];
      this.displayedRelationshipTypeListChunksIndex = 1;

      this._onLoadMoreRelationshipsDebounced = _.debounce(this._onLoadMoreRelationships.bind(this), 300);
  }

  disconnectedCallback() {
      super.disconnectedCallback();
      if (this.loadContentFrameId) cancelAnimationFrame(this.loadContentFrameId);
  }

  get isLoadFinished() {
      return this.displayedRelationshipTypeListChunks.length === this.relationshipTypeListChunks.length;
  }

  getMultipleGridClass(displayedRelationshipTypeListChunks) {
      if (displayedRelationshipTypeListChunks && displayedRelationshipTypeListChunks[0] && displayedRelationshipTypeListChunks[0].length > 1) {
          return "multiple-grid";
      }
      return "";
  }

  _onLoadMoreRelationships() {
      if (this.isLoadFinished) return;

      const itemsToPush = this.relationshipTypeListChunks.slice(this.displayedRelationshipTypeListChunksIndex, ++this.displayedRelationshipTypeListChunksIndex);

      if (!itemsToPush.length) return;

      this.loadContentFrameId = window.requestAnimationFrame(() => {
          this.displayedRelationshipTypeListChunks = this.displayedRelationshipTypeListChunks.concat(itemsToPush);
      });
  }

  _onContextDataChange() {
      if (this.isPartOfBusinessFunction && !_.isEmpty(this.contextData)) {
          let context = DataHelper.cloneObject(this.contextData);
          //App specific
          let appName = "";
          appName = ComponentHelper.getCurrentActiveAppName(this);
          if (appName) {
              context[ContextHelper.CONTEXT_TYPE_APP] = [{
                  "app": appName
              }];
          }
          this.requestConfig(this.nodeName.toLowerCase(), context);                    
      }
  }

  onConfigLoaded(componentConfig) {
  }

  _onConfigContextChange() {
      let relationshipTypeName, relationshipNames;
      if(this.relationshipTypeName || !_.isEmpty(this.relationshipNames)) {
          relationshipTypeName = this.relationshipTypeName;
          relationshipNames = this.relationshipNames;
      } else {
          relationshipTypeName = this.configContext.relationshipTypeName;
          relationshipNames = this.configContext.relationshipNames;
      }

      const relationshipTypeList = relationshipTypeName ? [relationshipTypeName] : relationshipNames;

      if (!relationshipTypeList || !relationshipTypeList.length) {
          this._isMessageAvailable = true;
          let messageDiv = this.$.messageCard;
          if (messageDiv) {
              messageDiv.textContent = "No Default Relationship is configured. Select a relationship from the menu.";
          }
          return;
      } else {
          this._isMessageAvailable = false;
      }

      microTask.run(() => {
          this.relationshipTypeListChunks = relationshipTypeList.reduce((res, item, i) => {
              const chunkIndex = res.length;

              const currentChunk = res[chunkIndex - 1];

              if (chunkIndex && currentChunk && currentChunk.length < this.relationshipChunkLength)
                  currentChunk.push(item);
              else
                  res.push([item]);

              return res;
          }, []);

          this.displayedRelationshipTypeListChunks = this.relationshipTypeListChunks.slice(0, this.displayedRelationshipTypeListChunksIndex);
      });
  }

  getIsDirty() {
      let searchResult = this.shadowRoot.querySelector('rock-entity-relationship-search-result');

      return searchResult && searchResult.getIsDirty();
  }

  getControlIsDirty() {
      let searchResult = this.shadowRoot.querySelector('rock-entity-relationship-search-result');

      return searchResult && searchResult.getControlIsDirty();
  }

  refresh(options) {
      let searchResult = this.shadowRoot.querySelector('rock-entity-relationship-search-result');

      return searchResult && searchResult.refresh(options);
  }

  reset() {
      this.relationshipTypeListChunks = [];
      this.displayedRelationshipTypeListChunks = [];
      this.displayedRelationshipTypeListChunksIndex = 1;
  }

  _onSourceInfoOpen(e) {
      let data = e.detail.data;
      let callback = e.detail.callback;
      let relatedEntityGetElement = this.$$("[name=relatedEntityGet]");

      this._relatedEntityGetResponse = function (e) {
          if (e.detail && e.detail.response && e.detail.response.content) {
              let entities = e.detail.response.content.entities;

              if (!_.isEmpty(entities)) {
                  callback(entities[0]);
              }
          }
      }

      if (!_.isEmpty(data) && relatedEntityGetElement) {
          let req = {
              "params": {
                  "query": {
                      "id": data.id,
                      "filters": {
                          "typesCriterion": [
                              data.type
                          ]
                      }
                  }
              }
          }
          relatedEntityGetElement.requestData = req;
          relatedEntityGetElement.generateRequest();
      }
  }
}
customElements.define(RockRelationshipManage.is, RockRelationshipManage);
