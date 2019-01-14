/**
    `rock-entity-create` Represents a component that renders a view for the creation of a new entity with different options such as "single entity creation",
    "multiple entities creation", and "bulk entity creation with import".

    @demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-business-function-behavior/bedrock-component-business-function-behavior.js';
import '../pebble-actions/pebble-actions.js';
import '../pebble-button/pebble-button.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityCreate
extends mixinBehaviors([
    RUFBehaviors.UIBehavior,
    RUFBehaviors.AppBehavior,
    RUFBehaviors.ComponentConfigBehavior
], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-grid-layout bedrock-style-padding-margin">
            :host {
                display: block;
                height: 100%;
            }

            #content-buttons {
                padding: var(--default-box-padding, 20px);
            }

            #manualActions {
                --pebble-manual-actions: {
                    margin-top: 0;
                }
            }

            .title {
                font-size: var(--default-font-size, 14px);
                text-align: center;
                color: var(--palette-steel-grey, #75808b);
            }

            #content-create {
                height: 100%;
            }
        </style>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <div id="content-description" align="center" hidden="">
                    <!-- description message here -->
                    <div class="title m-0">
                        Select how you would like to create a new product. You can create one manually or by importing data in any format you have.
                    </div>
                </div>
                <div id="content-message" align="center" hidden="">
                    <!-- Attributes message here -->
                    <div class="title m-0">
                        Attributes not available for entity create, contact administrator.
                    </div>
                </div>
                <div id="content-buttons" align="center" hidden="">
                    <!-- manual and import buttons here -->
                    <template is="dom-if" if="{{showManualButton}}">
                        <pebble-button id="manualButton" class="action-button-focus dropdownText btn btn-success m-r-10" button-text="Manual" raised="" on-tap="_onManualTap"></pebble-button>
                    </template>
                </div>
                <div id="step-label">
                    <!-- label of the current step here -->
                </div>
            </div>
            <div class="base-grid-structure-child-2">
                <div id="content-create" hidden=""></div>
            </div>
        </div>
        <bedrock-pubsub event-name="pebble-actions-action-click" handler="_onActionItemTap" target-id=""></bedrock-pubsub>
`;
  }

  static get is() {
      return 'rock-entity-create'
  }
  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: "_onContextDataChange"
          },
          /**
           * Indicates the names of the attributes that are rendered while creating a single entity.
           */
          attributeNames: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          messageCodeMapping: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           * Represents taxonomy 
           */
          taxonomy: {
              type: String
          },

          enableRelationshipsMatchMerge: {
              type: Boolean,
              value: false
          },
          /**
           * Represents create actions 
           */
          showManualButton: {
              type: Boolean
          },
          matchConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          defaultEntity: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          skipNext: {
              type: Boolean,
              value: false
          },
          showCreateOptions: {
              type: Boolean,
              value: false
          },
          ignoreDirtyCheck: {
              type: Boolean,
              value: false
          },
          dataIndex: {
              type: String,
              value: "entityData"
          },
          entityDomain: {
              type: String,
              value: ""
          },
          onSaveContextChange: {
              type: Boolean,
              value: false
          }
      }
  }

  _onContextDataChange() {
      if(this.onSaveContextChange) {
          this.onSaveContextChange = false;
          return;
      }

      if (!_.isEmpty(this.contextData)) {
          let context = DataHelper.cloneObject(this.contextData);
          //App specific
          let appName = "";
          appName = ComponentHelper.getCurrentActiveAppName(this);
          if (appName) {
              context[ContextHelper.CONTEXT_TYPE_APP] = [{
                  "app": appName
              }];
          }

          this.requestConfig('rock-entity-create', context);
      }
  }

  //Config properties are already set in config behavior
  onConfigLoaded(componentConfig) {
          this._onManualTap();
  }

  _onManualTap(e, detail) {
      if (this.getIsDirty()) {
          if (window.confirm("There are unsaved changes. Do you really want to leave the page?")) {
              // do nothing
          } else {
              return;
          }
      }

      if (_.isEmpty(this.attributeNames)) {
          this._showView("message");
          return;
      }

      this._hideView("description");
      this._showView("create");
      this.hideCreateButtons();

      let component = {
          "name": "rock-entity-create-single",
          "path": "/../../src/elements/rock-entity-create-single/rock-entity-create-single.html",
          "properties": {
              "attribute-names": this.attributeNames,
              "context-data": this.contextData,
              "message-code-mapping": this.messageCodeMapping,
              "match-config": this.matchConfig,
              "skip-next": this.skipNext,
              "default-entity": this.defaultEntity,
              "data-index": this.dataIndex,
              "entity-domain": this.entityDomain,
              "is-part-of-business-function": this.isPartOfBusinessFunction
          }
      };
      let contentEl = this.shadowRoot.querySelector("#content-create");
      ComponentHelper.loadContent(contentEl, component, this);
  }

  _showView(viewName) {
      if (viewName) {
          let contentView = this.shadowRoot.querySelector("#content-" + viewName);
          if (contentView) {
              contentView.removeAttribute("hidden");
          }
      }
  }

  _hideView(viewName) {
      if (viewName) {
          let contentView = this.shadowRoot.querySelector("#content-" + viewName);
          if (contentView) {
              contentView.setAttribute("hidden", "");
          }
      }
  }
  /**
   * Can be used to get the information whether the element is dirty or not.
   */
  getIsDirty() {
      if (this.ignoreDirtyCheck) {
          return false;
      }

      let content = this.shadowRoot.querySelector('#content-create');
      if (content && content.firstElementChild && content.firstElementChild.getIsDirty) {
          return content.firstElementChild.getIsDirty();
      }
  }
  /**
   * <b><i>Content development is under progress... </b></i> 
   */
  hideCreateButtons() {
      this._hideView("buttons");
  }
}
customElements.define(RockEntityCreate.is, RockEntityCreate)
