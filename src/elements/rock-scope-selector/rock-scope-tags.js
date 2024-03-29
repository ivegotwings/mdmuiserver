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

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/data-helper.js';
import '../pebble-button/pebble-button.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockScopeTags extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentConfigBehavior],
    PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common">
            :host {
                display: block;
                height: 100%;
            }

            pebble-button.action {
                display: inline-block;
                border: 1px solid var(--palette-cerulean, #036bc3);
                border-radius: 3px;
                height: 30px;
                margin: 0px 7px 10px 0px;

                --pebble-button: {
                    height: 30px !important;
                    color: var(--palette-cerulean);
                    font-size: var(--default-font-size, 14px);
                }
                ;
                --pebble-menu-button: {
                    height: 30px !important;
                    border-top: 1px solid var(--palette-cerulean);
                    border-right: 1px solid var(--palette-cerulean);
                    border-bottom: 1px solid var(--palette-cerulean);
                    background: #FFFFFF;
                    box-sizing: border-box;
                }
                ;
                --actions-icon-button: {
                    height: 16px;
                    width: 16px;
                    background: #FFFFFF;
                    color: var(--palette-cerulean);
                    padding-top: 0px !important;
                    padding-right: 0px !important;
                    padding-bottom: 0px !important;
                    padding-left: 0px !important;
                    margin-top: 0px;
                    margin-right: 5px;
                    margin-bottom: 0px;
                    margin-left: 5px;
                    top: -2px;
                }
                ;
                --pebble-button-paper-menu: {
                    background: #FFFFFF;
                }
                ;
                --pebble-button-paper-menu-item: {
                    background: #FFFFFF;
                    color: var(--palette-cerulean);
                    padding-top: 0px;
                    padding-right: 8px;
                    padding-bottom: 0px;
                    padding-left: 8px;
                }
                ;
                --paper-button-text: {
                    padding-top: 0px;
                    padding-right: 2px;
                    padding-bottom: 0px;
                    padding-left: 0px;
                    max-width: 225px;
                }
                ;
            }

            .default-message {
                margin: 0;
            }
        </style>
        <template is="dom-if" if="[[_scopeButtons.length]]]]">
            <template is="dom-repeat" items="[[_scopeButtons]]" as="scope">
                <pebble-button class="action" noink="" raised="" action-menu="" elevation="0" horizontal-align="right" vertical-align="top" icon="[[scope.icon]]" button-text="[[scope.name]]" data="[[scope]]" actions-data="[[_getActionData(actionsData,scope)]]" enable-ellipsis="true">&gt;
                </pebble-button>
            </template>
        </template>
        <template is="dom-if" if="[[_showMessage(_scopeButtons, loading)]]">
            <div class="default-message">You don't have any [[scopeCategory]] yet.</div>
        </template>
`;
  }

  static get is() {
      return "rock-scope-tags";
  }
  static get properties() {
      return {
          /*
           * Indicates the name of the scope category for which the tags are loaded.
           */
          scopeCategory: {
              type: String
          },

          /**
           * Indicates the scopes.
           */
          scopes: {
              type: Object,
              notify: true,
              value: function () {
                  return {}
              },
              observer: '_loadScopes'
          },

          loading: {
              type: Boolean,
              value: false
          },

          _scopeButtons: {
              type: Array,
              notify: true,
              value: function () {
                  return []
              },
          },
          actionsData: {
              type: Object,
              notify: true,
              value: function () {
                  return {};
              }
          },
          contextData: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: '_onContextDataChange'
          },

          // hide icons in scope selection
          scopeTagsActionsSettings: {
              type: Object,
              value: function () {
                  return {};
              }
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
          this.requestConfig('rock-scope-tags', context);
      }
  }
  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          let actionData = componentConfig.config;
          let scopeTagsActionsSettings = this.scopeTagsActionsSettings;
          for (let action in actionData) {
              if (actionData[action]) {
                  // delete the icon button if hidden is set from config                               
                  if (scopeTagsActionsSettings && scopeTagsActionsSettings[action]) {
                      let actions = _.keys(scopeTagsActionsSettings[action]);
                      actions.forEach(key => {
                          if (key) {
                              let path = key + '.' + "hidden";
                              if (DataHelper.isValidObjectPath(scopeTagsActionsSettings[action], path)) {
                                  delete actionData[action][key];
                              }
                          }
                      });
                  }

                  actionData[action] = DataHelper.convertObjectToArray(actionData[action]);
              }
          }
          this.actionsData = actionData;
      }
  }
  _showMessage(_scopeButtons, loading) {
      return _.isEmpty(_scopeButtons) && !loading;
  }
  _loadScopes() {
      if (this.scopes) {
          this._scopeButtons = this.scopes[this.scopeCategory];
      }
  }
  _getActionData(e, scopeObj) {
      //delete functionality made available only to the creator of the scope.
      //Favourite action not needed in other tabs when scope is in favourites tab
      if (!_.isEmpty(this.actionsData)) {
          let actionsDataArray = DataHelper.cloneObject(this.actionsData[this.scopeCategory]);
          let currentUser = DataHelper.getUserId();
          if (actionsDataArray) {
              let maxIndex = actionsDataArray.length - 1;
              for (let i = maxIndex; i >= 0; i--) {
                  if ((actionsDataArray[i].name.toLowerCase() == 'delete' || actionsDataArray[i].name
                          .toLowerCase() == 'edit') && currentUser != scopeObj.createdby) {
                      actionsDataArray.splice(i, 1);
                  } else if (actionsDataArray[i].name.toLowerCase() == 'favourites' && scopeObj.isFavourite) {
                      actionsDataArray[i].icon = "pebble-icon:bookmark";
                  }
              }
          }
          return actionsDataArray;
      }
  }
}
customElements.define(RockScopeTags.is, RockScopeTags);
