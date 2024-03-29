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

import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-text-alignment.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../liquid-rest/liquid-rest.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-button/pebble-button.js';
import '../pebble-card/pebble-card.js';
import '../pebble-accordion/pebble-accordion.js';
import '../rock-scope-selector/rock-scope-selector.js';
import '../rock-split-list/rock-split-list.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockScopeManage
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior,
        RUFBehaviors.ComponentConfigBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-grid-layout bedrock-style-padding-margin bedrock-style-buttons bedrock-style-text-alignment">
            :host {
                display: block;
                height: 100%;
            }

            #card {
                height: auto;
                padding-bottom: 20px;
            }

            .scope-manage-attribute-list-wrapper {
                min-height: 320px;
            }

            .overflow-auto-y {
                overflow-x: hidden;
                overflow-y: auto;
            }

            pebble-card {
                --pebble-card-widget-box: {
                    height: 100%;
                    padding-bottom: 10px;
                    margin-top: 0px;
                    margin-right: 0px;
                    margin-bottom: 0px;
                    margin-left: 0px;
                    min-width: auto;
                }
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <div class="message text-center">[[_message]]</div>
            </div>
            <div class="base-grid-structure-child-2 p-relative">
                <div class="button-siblings">
                    <div class="base-grid-structure">
                        <div class="base-grid-structure-child-1">
                            <pebble-card id="card" no-header="">
                                <rock-scope-selector id="scopeSelector" selected-scope="[[selectedItems]]" context-data="[[contextData]]" show-title="" allow-manage-scope="" show-settings="" slot="pebble-card-content">
                                </rock-scope-selector>
                                <bedrock-pubsub event-name="rock-scope-click" handler="_onScopeTagClicked"></bedrock-pubsub>
                                <bedrock-pubsub event-name="rock-scope-edit" handler="_onScopeEditClicked"></bedrock-pubsub>
                                <bedrock-pubsub event-name="rock-scope-loaded" handler="_onScopeLoad"></bedrock-pubsub>
                            </pebble-card>
                        </div>
                        <div class="base-grid-structure-child-2">
                            <pebble-card no-header="" class="full-height">
                                <pebble-accordion id="accordion" is-collapsed="{{!_isOpened}}" header-text="[[_getHeaderText(_selectedScope)]]" slot="pebble-card-content">
                                    <div slot="accordion-content" class="full-height overflow-auto-y">
                                        <template is="dom-if" if="[[_isOpened]]">
                                            <div class="scope-manage-attribute-list-wrapper full-height">
                                                <rock-split-list id="splitList" context-data="[[contextData]]" retain-selected-items="[[retainSelectedItems]]" selected-items="{{selectedItems}}" config="[[splitListConfig]]" object-type="attribute"></rock-split-list>
                                            </div>
                                        </template>
                                    </div>
                                </pebble-accordion>
                            </pebble-card>
                        </div>
                    </div>
                </div>
                <div id="buttonContainer" class="buttonContainer-static">
                    <pebble-button id="cancelButton" class="btn btn-secondary m-r-5 m-l-15" button-text="Cancel" on-tap="_onCancelTap" elevation="1" raised=""></pebble-button>
                    <pebble-button id="DownloadAll" class="btn btn-secondary m-r-5" button-text="Download All Attributes" on-tap="_downloadAll" elevation="1" raised=""></pebble-button>
                    <pebble-button id="Download" class="focus btn btn-success" button-text="Download" on-tap="_download" elevation="1" raised=""></pebble-button>
                </div>
            </div>
        </div>
`;
  }

  static get is() { return 'rock-scope-manage' }

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
              observer: '_onContextDataChange'
          },

          _loading: {
              type: Boolean,
              value: false
          },

          _message: {
              type: String
          },
          splitListConfig: {
              type: Object
          },
          selectedItems: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          retainSelectedItems: {
              type: Boolean,
              value: false
          },
          _selectedScope: {
              type: String,
              value: ""
          },
          _isOpened: {
              type: Boolean,
              value: true
          }
      }
  }


  _onContextDataChange() {
      if (!_.isEmpty(this.contextData)) {
          let context = DataHelper.cloneObject(this.contextData);
          //App specific
          let appName = ComponentHelper.getCurrentActiveAppName();
          if (appName) {
              context[ContextHelper.CONTEXT_TYPE_APP] = [{
                  "app": appName
              }];
          }
          this.requestConfig('rock-scope-manage', context);
      }
  }
  onConfigLoaded(componentConfig) {
      if (DataHelper.isValidObjectPath(componentConfig, "config.attributeSplitListConfig.tabular.fields")) {
          let splitListConfig = componentConfig.config.attributeSplitListConfig;
          let fields = DataHelper.convertObjectToArray(splitListConfig.tabular.fields);
          splitListConfig.tabular.fields = fields;
          this.set("splitListConfig", splitListConfig);
      } else {
          this.logError("rock-scope-manage - Split list config is not available/proper in config", componentConfig);
      }
  }
  _onScopeTagClicked(e, detail) {
      if (detail && detail.data) {
          this.selectedItems = [];
          this.selectedItems = detail.data.scope;
          this._download();
      }
  }
  _onScopeEditClicked(e, detail) {
      if (detail && detail.data) {
          this.set("_selectedScope", detail.data);
          if (!this._isOpened) {
              this.$.accordion.showContainer();
              this.$.accordion._transitionEnd();
          }
          this.selectedItems = [];
          this.async(function () {
              this.selectedItems = detail.data.scope;
              if (!this.retainSelectedItems) {
                  let splitlist = this.shadowRoot.querySelector("#splitList");
                  if (splitlist) {
                      splitlist.rerenderGrid();
                  }
              }
          });
      }
  }
  _onScopeLoad() {
      this._selectedScope = undefined;
      if (typeof this.$.accordion.hideContainer === 'function') {
          this.$.accordion.hideContainer();
      }
  }
  _save() {
      if (this._selectedScope) {
          let detail = {
              "name": this._selectedScope.name,
              "accesstype": this._selectedScope.accesstype,
              "selectedScope": this._selectedScope
          };
          this.$.scopeSelector.triggerSaveProcess(detail);
      } else {
          this.$.scopeSelector.isManageScopes = true;
      }
  }
  _downloadAll() {
      this.selectedItems = [];
      let eventDetail = {
          name: "onNext"
      };
      this.fireBedrockEvent("onNext", eventDetail, { "ignoreId": true });
  }
  _download() {
      if (!this.selectedItems || !this.selectedItems.length) {
          this.showWarningToast("Select at least 1 attribute for download");
          return;
      }
      let eventDetail = {
          name: "onNext"
      };
      this.fireBedrockEvent("onNext", eventDetail, { "ignoreId": true });
  }
  _onCancelTap() {
      let eventDetail = {
          name: "onCancel"
      };
      this.fireBedrockEvent("onCancel", eventDetail, { "ignoreId": true });
  }
  _getHeaderText(_selectedScope) {
      return this._selectedScope ? "Editing scope:  " + this._selectedScope.name : "Select attributes for download";
  }
}
customElements.define(RockScopeManage.is, RockScopeManage)
