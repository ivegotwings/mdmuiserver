/**
`<rock-header-search>` Represents a textbox with a search icon that provides the global search.

### Example

    <rock-header-search></rock-header-search>

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|---------
`--search-box-width` | The width of the search box | 290px
`--search-box-height` | The height of the search box | 20px
`--search-box-border` | The border of the serach box | 1px solid #7d8690
`--search-box-radius` | The radius of the search box | 4px
`--search-box-padding` | The padding of the search box | 2px
`--search-box` | Mixin applied to search box | {}
`--search-icon-fill-color` | The fill color of search icon | #09c021
`--search-icon-stroke-color` | The stroke color of search icon | ''
`--search-icon-margin` | The margin of search icon | 3px 0 0 -28px
`--search-action-icon` | Mixin applied to search icon | {}
`--search-action-hover-pointertype` | The pointer type for serach icon | pointer

@group rock Elements
@element rock-header-search
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/paper-item/paper-item.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-popover/pebble-popover.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockHeaderSearch
extends mixinBehaviors([
    RUFBehaviors.ComponentConfigBehavior
], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-icons">
            .rock-search-form {
                display: none;
                width: 100%;
                height: 100%;
                position: absolute;
                left: 0;
                top: 0;
                padding: 0 40px 0 74px;
                box-sizing: border-box;
                background: var(--palette-white, #ffffff);
                z-index: 2;
            }

            .rock-search-form[show] {
                display: block;
            }

            .search-input {
                width: 100%;
                max-width: 400px;
                height: 24px;
                border-radius: 3px;
                background-color: var(--palette-white, #ffffff);
                line-height: 0.83;
                padding-left: 6px;
                padding-right: 30px;
                border: solid 1px var(--palette-white, #ffffff);
                font-family: var(--default-font-family);
                box-sizing: border-box;
                font-size: var(--font-size-sm, 12px);
                display: block;
                transition: all 0.3s;
            }

            .search-action {
                position: absolute;
                top: 4px;
                right: 6px;
                --pebble-icon-color: {
                    fill: var(--top-header-search-icon-color);
                }
            }

            .search-action:hover {
                cursor: var(--search-action-hover-pointertype, pointer);
            }

            .popup-title {
                text-align: left;
                font-size: var(--default-font-size, 14px);
                font-family: var(--default-font-family);
                color: var(--text-primary-color, #1a2028);
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 290px;
                white-space: nowrap;
                display: inline-block;
                padding-right: 5px;
            }

            pebble-popover {
                height: 60px;
                width: 390px;
                --popover: {
                    padding-top: 0;
                    padding-bottom: 0;
                }
            }

            pebble-popover paper-item {
                cursor: pointer;
                text-align: left;
                transition: all 0.3s;
                -webkit-transition: all 0.3s;
                min-height: 30px;
                font-size: var(--default-font-size, 14px);
                padding-left: 7px;
            }

            pebble-popover paper-item:hover {
                background-color: var(--bgColor-hover, #e8f4f9);
                color: var(--focused-line, #026bc3);
            }

            pebble-popover paper-item:focus {
                color: var(--primary-button-color, #036bc3);
                background-color: var(--bgColor-hover, #e8f4f9);
            }

            .list {
                display: block;
                overflow-y: scroll;
                max-height: 160px;
            }

            /* IE edge specific fix for vertical scroll */

            _:-ms-lang(x),
            _:-webkit-full-screen,
            .list {
                overflow-y: auto;
            }

            paper-item #actionItem {
                text-align: left;
                color: var(--palette-steel-grey, #75808b);
                font-size: var(--default-font-size, 14px);
                line-height: 17px;
                transition: all 0.3s;
                display: inline-flex;
                letter-spacing: 0.3px;
                font-style: normal;
                white-space: nowrap;
                max-width: 355px;
            }
        </style>

        <input id="searchInput" type="text" value="{{inputValue::input}}" placeholder\$="{{placeHolder}}" on-keyup="_searchOnEnter" class="search-input">
        <pebble-icon icon="pebble-icon:search-small" on-tap="_search" class="search-action pebble-icon-size-16"></pebble-icon>
        <pebble-popover id="searchOptionsPopover" for="searchInput" no-overlap="">

            <div class="list">
                <template is="dom-repeat" items="[[_searchOptions]]" as="searchOption">
                    <paper-item data="[[searchOption]]" on-tap="_onSearchOptionSelect">
                        <div id="actionItem">
                            <span class="popup-title"> [[inputValue]]</span> [[searchOption.text]]
                        </div>
                    </paper-item>
                </template>
            </div>
        </pebble-popover>
`;
  }

  static get is() {
      return 'rock-header-search';
  }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: '_onContextDataChange'
          },
          /*
           * Indicates a placeholder for the search.
           */
          placeHolder: {
              type: String,
              value: "Search your data"
          },

          /*
           * Indicates the input value for the search.
           */
          inputValue: {
              type: String,
              value: "",
              observer: "_onInputChange"
          },

          /*
           * Indicates the search action icon.
           */
          icon: {
              type: String,
              value: "pebble-icon:search-small"
          },

          searchConfig: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: "_onSearchConfigChange"
          },

          _searchOptions: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _selectedSearchOption: {
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

          this.requestConfig('rock-quick-search', context);
      }
  }
  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          this.searchConfig = componentConfig.config;
      }
  }
  _onSearchConfigChange() {
      if (this.searchConfig && !_.isEmpty(this.searchConfig)) {
          //Set searchOptions and default selectedSearchOption
          this._searchOptions = this.searchConfig.searchOptions;
          this._setDefaultSelectedOption();

          if (!_.isEmpty(this.searchConfig.placeHolderText)) {
              this.placeHolder = this.searchConfig.placeHolderText;
          }
      }
  }

  /*
   * Can be used to open a global search page.
   */
  _search() {                
      if (this._selectedSearchOption && !_.isEmpty(this._selectedSearchOption)) {
          ComponentHelper.appRoute(this._selectedSearchOption.route, {
              "searchtext": this.inputValue
          },true);
      } else {
          ComponentHelper.appRoute("search-thing", {
              "searchtext": this.inputValue
          },true); //Fallback
      }

      this.inputValue = '';
  }

  /*
   * Can be used to execute search on enter.
   */
  _searchOnEnter(e) {
      if (e.keyCode === 13) {
          this._search();
      }
  }

  _onInputChange() {
      let searchOptionsPopover = this.shadowRoot.querySelector('#searchOptionsPopover');

      if (searchOptionsPopover && this._searchOptions && this._searchOptions.length > 0) {
          if (this.inputValue && this.inputValue.trim() != "") {
              searchOptionsPopover.show();
          } else {
              this._setDefaultSelectedOption();
              searchOptionsPopover.hide();
          }
      }
  }

  _setDefaultSelectedOption() {
      if (this._searchOptions) {
          for (let i = 0; i < this._searchOptions.length; i++) {
              if (this._searchOptions[i].isDefault) {
                  this._selectedSearchOption = this._searchOptions[i];
                  break;
              }
          }
      }
  }

  _onSearchOptionSelect(e) {
      let searchOptionsPopover = this.shadowRoot.querySelector('#searchOptionsPopover');
      let data = e.currentTarget.data;
      this._selectedSearchOption = data;
      this._search();

      if (searchOptionsPopover) {
          searchOptionsPopover.hide();
      }
  }

  _onPaste(e) {
      let pastedQuery = "";
      let formattedQuery = "";

      e.preventDefault();

      if (e.clipboardData) {
          pastedQuery = e.clipboardData.getData('text/plain');
      } else if (window.clipboardData) { //IE
          pastedQuery = window.clipboardData.getData("text");
      }

      formattedQuery = DataHelper.getFormatedSearchQuery(pastedQuery);
      if (DataHelper.isTextSelected(this.$.searchInput)) {
          // What if user select spaces and there are multiple spaces?
          this.inputValue = this.inputValue.replace(DataHelper.getSelectedText(this.$.searchInput),
              formattedQuery);
      } else {
          this.inputValue = DataHelper.replaceAt(this.inputValue, this.$.searchInput.selectionStart,
              formattedQuery);
      }
  }
}
customElements.define(RockHeaderSearch.is, RockHeaderSearch)
