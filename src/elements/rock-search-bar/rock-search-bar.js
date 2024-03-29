/**
`rock-search-bar`
Represents a single-line textbox to enter the search text.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-input/iron-input.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../pebble-button/pebble-button.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

class RockSearchBar
    extends mixinBehaviors([
                RUFBehaviors.UIBehavior
            ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common ">
			:host {
				@apply --layout-horizontal;
				@apply --layout-center;
                display: inline-flex;
                display: -webkit-inline-flex;
                width: 100%;
                height: 30px;
                border: 0;
                overflow: inherit!important;
                margin-bottom: 6px;
                @apply --rock-search-bar;
			}
			.input-panel {
				width: 100%;
				@apply --layout-horizontal;
				@apply --layout-center;
                position: relative;
            }

            #input {
                outline: 0;
                cursor: text;
                font-family: var(--default-font-family, 'Roboto', Helvetica, Arial, sans-serif);
                background: transparent;
                color: var(--search-text-color, #75808b);
                font-size: var(--font-size-sm, 12px);
                width: calc(100% - 28px);
                border: 1px solid var(--default-border-color, #c1cad4);
                border-radius: 3px;
                border-top-right-radius: 0;
                border-bottom-right-radius: 0;
                padding: 5px 10px 5px;
                height: 30px;
                border-right: 0;
            }
            #input::-webkit-input-placeholder { 
                font-style: italic;
            }
            #input::-moz-placeholder { 
                font-style: italic;
            }
            #input:-ms-input-placeholder {
                font-style: italic;
            }
            #input:-moz-placeholder { 
                font-style: italic;
            }

            pebble-button.toolbarsearch {
                border-top-left-radius: 0!important;
                border-bottom-left-radius: 0!important;
                background-color: var(--primary-button-color, #139ee7)!important;
                border-color: var(--primary-button-color, #139ee7)!important;
                --pebble-button: {
                    min-width:0px;
                    padding-top: 5px;
                    padding-right: 5px;
                    padding-bottom: 5px;
                    padding-left: 5px;
                };
                --pebble-icon-color: {
                    fill: var(--palette-white, #ffffff);
                };
                --pebble-icon-dimension: {
                    width: 16px;
                    height: 16px;
                };
            }
        </style>

        <div class="input-panel" title\$="[[placeholder]]">
            <input is="iron-input" id="input" value="{{query::input}}" placeholder\$="[[placeholder]]" on-keyup="searchOnEnter" on-paste="_onPaste" on-focus="_onInutFocus" on-focusout="_onInputFocusout">
            <!-- <pebble-textbox id="input" value="{{query::input}}" placeholder\$="[[placeholder]]" 
                    on-keyup="searchOnEnter" on-paste='_onPaste'
                    on-focus="_onInutFocus" on-focusout="_onInputFocusout"></pebble-textbox> -->
            <pebble-button icon="pebble-icon:search-entity" class="btn btn-primary toolbarsearch" on-tap="search"></pebble-button>
        </div>
`;
  }

  static get is() { return 'rock-search-bar' }
  static get properties() {
      return {
          query: {
              type: String,
              notify: true,
              value: '',
              observer: '_queryUpdated'
          },
          /**
           * Indicates the text for the user search.
           */
          internalQuery: {
              type: String,
              notify: true,
              value: '',
              observer: '_queryUpdated'
          },
          /**
           * Indicates an icon which is shown on the search textbox.
           */
          icon: {
              type: String,
              value: 'search'
          },
          /**
           * Indicates the text shown in the search box if the user does not enter any query.
           */
          placeholder: {
              type: String,
              value: 'Search'
          },
          /**
           * Indicates that the text is passed as a JSON object for the search input. This usually comes from the filter query.
           */
          searchInput: {
              type: Object,
              notify: true,
              value: function () {
                  return [];
              },
              observer: "searchQueryFromInput"
          },
          searchText: {
              type: String,
              value: ""
          },

          /**
          * If true indicates that the user entered text will be shown
          * If false, RBL (Riversand business language) query text will be shown
          **/
          hideRbl: {
              type: Boolean,
              value: false
          },

          /**
          * Max allowed rows that can be pasted for the search criteria
          **/
          maxAllowedValuesForSearch:{
              type: Number                        
          }
      }
  }

  /**
   * The `pub-sub` event named `rock-search` is fired when the user requests to search for a query. 
   * The data passed in the event is in the following format:  
   * {'name':'rock-search', 'data':this.query}
   *
   * @event bedrock-event
   */
  /**
   * Indicates the text for the user search.
   */

  /**
   * Can be used to clear the search query.
   */
  clear () {
      this.query = "";
      this.searchText = "";
      this.$.input.focus();
      this.fireBedrockEvent('rock-search-clear', null);
  }
  /**
   * Can be used to invoke the search functionality.
   */
  search (e, onEnter) {
      if(onEnter !== true) {
          this.query = this.searchText;
      }
      let eventDetail = {
          "query": this.query
      };
      this.fireBedrockEvent('rock-search', eventDetail);
  }
  /**
   * Can be used to invoke the search functionality on the press of an `enter` key.
   */
  searchOnEnter (e) {                
      if (e.keyCode === 13) { 
          //Display the user entered query in the search box 
          if(this.hideRbl){
              this.searchText = this.query;
          }                    
          this.search(e, true);
      }
  }
  /**
   * Can be used to observe the `searchInput` JSON array. It creates the search query 
   * using the `searchInput`.
   */
  searchQueryFromInput () {
      let length = this.searchInput.length;
      for (let i = 0; i < length; i++) {
          this.query += this.searchInput[i].name + " = " + this.searchInput[i].value;
          if (i < length - 1) {
              this.query += " and ";
          }
      }
  }

  _queryUpdated () {
      this.fireBedrockEvent('rock-search-update', this.query);
  }

  /* Formating the pasted query */
  _onPaste (e) {
      let pastedQuery = "";
      let formattedQuery = "";

      e.preventDefault();

      if (e.clipboardData) {
          pastedQuery = e.clipboardData.getData('text/plain');
      } else if (window.clipboardData) { //IE
          pastedQuery = window.clipboardData.getData("text");
      }
      
      //Preventing the search for pasted long queries 
      let pastedQueryLength = DataHelper.getPastedQueryLength(pastedQuery);
      if(pastedQueryLength > this.maxAllowedValuesForSearch){
          this.showErrorToast("More than " + this.maxAllowedValuesForSearch +" values are not supported for search.");
          return;
      }

      formattedQuery = DataHelper.getFormatedSearchQuery(pastedQuery);
      if (DataHelper.isTextSelected(this.$.input)) {
          // What if user select spaces and there are multiple spaces?
          this.query = this.query.replace(DataHelper.getSelectedText(this.$.input), formattedQuery);
      } else {
          this.query = DataHelper.replaceAt(this.query, this.$.input.selectionStart, formattedQuery);
      }
  }
  _onInutFocus(e) {
      this.query = this.searchText;
  }
  _onInputFocusout(e) {
      this.searchText = this.query;
      
      //Do not reset the user entered text
      if(!this.hideRbl) {
          this.query = "";
      }
  }
}
customElements.define(RockSearchBar.is, RockSearchBar)
