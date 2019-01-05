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

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/data-helper.js';
import '../pebble-button/pebble-button.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockSavedSearchesTags
    extends mixinBehaviors([
    RUFBehaviors.UIBehavior,
    RUFBehaviors.ComponentConfigBehavior
    ], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common">
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
            };
            --pebble-menu-button: {
                height: 30px !important;
                border-top: 1px solid var(--palette-cerulean);
                border-right: 1px solid var(--palette-cerulean);
                border-bottom: 1px solid var(--palette-cerulean);
                background: #FFFFFF;
                box-sizing: border-box;
            };
            --actions-icon-button: {
                height: 16px;
                width: 16px;
                background: #FFFFFF;
                color: var(--palette-cerulean);
                padding-top: 0px !important;
                padding-right: 0px !important;
                padding-bottom: 0px !important;
                padding-left: 0px !important;
                margin-top: 0;
                margin-right: 5px;
                margin-bottom: 0;
                margin-left: 5px;
                top: -2px;
            };
            --pebble-button-paper-menu: {
                background: #FFFFFF;
            };
            --pebble-button-paper-menu-item: {
                background: #FFFFFF;
                color: var(--palette-cerulean);
                padding-top: 0px;
                padding-right: 8px;
                padding-bottom: 0px;
                padding-left: 8px;
            };
            --paper-button-text:{
                padding-top: 0px;
                padding-right: 2px;
                padding-bottom: 0px;
                padding-left: 0px;
                max-width: 225px;
          };
        }
       
        </style>
        <template is="dom-if" if="[[_savedSearchesButtons.length]]]]">
            <template is="dom-repeat" items="[[_savedSearchesButtons]]" as="savedSearch">
                <pebble-button class="action" noink="" raised="" action-menu="" elevation="0" horizontal-align="right" vertical-align="top" icon="[[savedSearch.icon]]" button-text="[[savedSearch.name]]" data="[[savedSearch]]" actions-data="[[_getActionData(_actionsData,savedSearch)]]" enable-ellipsis="true">&gt;
                </pebble-button>
            </template>
        </template>        
        <template is="dom-if" if="[[!_savedSearchesButtons.length]]">
            <div class="default-message">You don't have any [[savedSearchCategory]] yet.</div>
        </template>
`;
  }

  static get is() { return 'rock-saved-searches-tags' }
  static get properties() {
      return {
          savedSearchCategory: {
              type: String
          },

          /**
           * Indicates the saved searches.
           */
          savedSearches: {
              type: Object,
              notify: true,
              value: function () {
                  return {}
              },
              observer: '_loadSavedSearches'
          },

          _savedSearchesButtons: {
              type: Array,
              notify: true,
              value: function () {
                  return []
              },
          },
          _actionsData: {
              type: Object,
              notify: true,
              value: function () {
                  return {}
              }
          },
          contextData: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: '_onContextDataChange'
          }
      }
  }

  _onContextDataChange () {
      if(!_.isEmpty(this.contextData)) {
          let context = DataHelper.cloneObject(this.contextData);
          //App specific
          let appName = ComponentHelper.getCurrentActiveAppName();
          if(appName) {
              context[ContextHelper.CONTEXT_TYPE_APP] = [{
                  "app": appName
              }];
          }
          this.requestConfig('rock-saved-searches-tags', context);
      }
  }
  onConfigLoaded (componentConfig) {
      if(componentConfig && componentConfig.config) {
          let actionData = componentConfig.config;
          for(let action in actionData){
              if(actionData[action]){
                  actionData[action] = DataHelper.convertObjectToArray(actionData[action]);
              }
          }
          this._actionsData =actionData;
      }
  }
  _loadSavedSearches () {
      if (this.savedSearches) {
          this._savedSearchesButtons = this.savedSearches[this.savedSearchCategory];
      }
  }
  _getActionData (e,savedSearchesObj) {
      //delete functionality made available only the creater of the saved search.
      //Favourite action not needed in other tabs when search is in favourites tab
      if(!_.isEmpty(this._actionsData)){
          let actionsDataArray = DataHelper.cloneObject(this._actionsData[this.savedSearchCategory]);
          let currentUser = DataHelper.getUserId();
          if(actionsDataArray && actionsDataArray.length > 0) {
              let maxIndex = actionsDataArray.length - 1;
              for(let i = maxIndex; i >= 0; i--) {
                  if(actionsDataArray[i].name.toLowerCase()=='delete' && currentUser != savedSearchesObj.createdby) {
                  actionsDataArray.splice(i,1);
                  } else if(actionsDataArray[i].name.toLowerCase() == 'favourites' && savedSearchesObj.isFavourite) {
                  actionsDataArray[i].icon = "pebble-icon:bookmark";
                  }
              }
          }
          return actionsDataArray;
      }
      
  }
}
customElements.define(RockSavedSearchesTags.is, RockSavedSearchesTags);
