/**
`<pebble-lov>` Represents a control which contains a list of items with the material design styling. 
This control contains a search box where you can type and filter the items. It allows you to 
select single item or multiple items.
The following code renders a list of values control which contains item with the title, subtitle, and image. You 
can select single value.
### Example
    <pebble-lov items={{items}} show-image no-sub-title></pebble-lov>

The following code renders a list of values control which contains item with title, subtitle, and image. You 
can select multiple values.
    <pebble-lov items={{items}} show-image multi-select></pebble-lov>
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/iron-input/iron-input.js';
import '@polymer/iron-list/iron-list.js';
import '@polymer/iron-scroll-threshold/iron-scroll-threshold.js';
import { timeOut, microTask } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import '../bedrock-helpers/validation-helper.js';
import '../bedrock-helpers/element-helper.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-lov-behavior/bedrock-lov-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../pebble-checkbox/pebble-checkbox.js';
import '../pebble-button/pebble-button.js';
import '../pebble-image-viewer/pebble-image-viewer.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-spinner/pebble-spinner.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-text-alignment.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../pebble-position-tracker/pebble-position-tracker.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import { IronA11yKeysBehavior } from '@polymer/iron-a11y-keys-behavior/iron-a11y-keys-behavior.js';
import * as gestures from '@polymer/polymer/lib/utils/gestures.js';
import * as  Settings  from '@polymer/polymer/lib/utils/settings.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleLov extends mixinBehaviors([RUFBehaviors.UIBehavior,RUFBehaviors.LovBehavior], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-grid-layout bedrock-style-icons bedrock-style-padding-margin bedrock-style-text-alignment">
            :host {
                display: block;
                max-height: var(--pebble-lov-height, 250px);
                border-radius: 3px;
                padding:0px 20px;
                @apply --pebble-lov;
            }

            #scroller {
                max-height: calc(var(--pebble-lov-height, 250px) - 94px);
                min-height: 100px;
                overflow: auto;
            }
            #searchbox{
                width:100%;
            }

            #searchbox pebble-icon {
                position: absolute;
                color: var(--default-icon-color, #8994a0);
                top: 5px;
                left: 8px;
                @apply --lov-searchbox-icon;
            }

            #searchbox,
            #selector .item {
                cursor: pointer;
                color: var(--primary-text-color, #212121);
            }

            input[type=text],
            select {
                width: 100%;
                padding: 4px 10px 3px 30px;
                margin: 0;
                display: inline-block;
                border: 1px solid var(--textbox-border, #d2d8de);
                border-radius: 4px;
                box-sizing: border-box;
                height: 27px;
                font-size: var(--font-size-sm, 12px);
                vertical-align: middle;
            }

            #selector .item {
                text-align: left;
                color: var(--palette-steel-grey, #75808b);
                
            }

            #selector .item:focus {
                color: var(--primary-button-color, #036bc3);
                background-color: var(--bgColor-hover, #e8f4f9);
            }

            #selector:not([touch-device]) .item:hover {
                background: var(--dropdown-selected, #e8f4f9);
                color: var(--dropdown-selected-font, #036bc3);
            }

            #selector .item:hover {
                background-color: var(--bgColor-hover, #e8f4f9);
                color: var(--focused-line, #026bc3);
            }

            .color-wrapper {
                width: var(--pebble-thumb-color-size, 34px);
                height: var(--pebble-thumb-color-size, 24px);
                display: inline-block;
                vertical-align: middle;
                border-radius: 2px;
                margin-right: 5px;
            }

            .thumb-image {
                width: 100%;
                height: 100%;
            }

            .image-wrapper {
                width: var(--pebble-thumb-image-size, 24px);
                height: var(--pebble-thumb-image-size, 24px);
                display: inline-block;
                margin-right: 5px;
                vertical-align: middle;
                padding: 2px 0;
            }

            .favourite-wrapper {
                display: inline-block;
                margin-left: 5px;
                vertical-align: middle;
                padding: 2px 0;
            }

            .favourite-badge {
                opacity: 0;
                transition: all 0.3s;
                -webkit-transition: all 0.3s;
            }

            .un-favourite-badge {
                opacity: 1;
            }

            .title {
                font-size: var(--font-size-sm, 12px);
                line-height: 14px;
            }

            .sub-title {
                font-size: var(--font-size-sm, 12px);
                color: var(--color-steal-grey, #75808b);
                width: 190px;
                line-height: 13px
            }

            .title,
            .item-list {
                font-size: var(--default-font-size, 14px);
                line-height: 14px;
            }

            .item-list:hover,
            .item[selected] .item-list {
                color: var(--focused-line, #026bc3);
            }

            .item:hover .only-badge, .item:hover .favourite-badge {
                opacity: 1;
            }

            .only-badge {
                font-size: 11px;
                color: var(--text-primary-color, #364653);
                margin-left: 10px;
                opacity: 0;
                transition: all 0.3s;
                -webkit-transition: all 0.3s;
            }

           
            .item-length-overflow {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                @apply --item-length-overflow;
            }

            #selector .item[selected],
            #selector .item[focused] {
                background: var(--pebble-lov-selected-item-background, #DBE4EB) !important;
            }

            #selector.multiselect .item {
                background: var(--palette-white, #ffffff) !important;
            }

            #overlay-div {
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.1);
                z-index: 2;
            }

            _:-ms-lang(x),
            _:-webkit-full-screen,
            .item-list {
                transition: inital;
                -ms-transition: inital;
            }

            _:-ms-lang(x),
            _:-webkit-full-screen,
            .only-badge .favourite-badge {
                transition: inital;
                -ms-transition: inital;
            }
            .item-list {
                display: flex;
                align-items: center;
            }
            .search-control{
                display: flex;
            }
            .overflow-auto {
                overflow: auto;
            }
            
        </style>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1 search-control">
                <template is="dom-if" if="[[_isSelectAllEnabled(selectAll,multiSelect)]]">
                    <div id="selectall" class="checkbox-wrapper m-t-5">
                        <pebble-checkbox checked="[[_isAllItemsSelected(selectedItems)]]" indeterminate="[[_isSelectAllIndeterminate(selectedItems.length, items.length)]]" on-tap="_selectAllItems"></pebble-checkbox>
                    </div>
                </template>
                <div id="searchbox" class="p-relative p-b-10">
                    <pebble-icon icon="pebble-icon:search-entity" class="iconstyle pebble-icon-size-16"></pebble-icon>
                    <input is="iron-input" id="input" type="text" autocomplete="off" autocapitalize="none" value="{{_inputElementSearchValue::input}}" placeholder\$="[[_placeholder]]" on-keyup="_inputValueChanged" on-change="_stopPropagation" key-event-target="" on-paste="_onPaste" disabled="[[disableSelection]]">
                </div>
            </div>
            <div class="base-grid-structure-child-2 overflow-auto">
                <template is="dom-if" if="[[enableOverlay]]">
                    <div class="p-relative full-height">
                        <div id="overlay-div"></div>
                    </div>
                </template>
                <pebble-spinner active="[[_loading]]"></pebble-spinner>
                <div hidden="{{!_noReferenceDataPresent}}">
                    <div class="msg default-message">{{noReferenceDataMessage}}</div>
                </div>
                <div id="scroller" scroller="[[_getScroller()]]" hidden="{{_noReferenceDataPresent}}" on-tap="_stopPropagation">
                    <iron-list id="selector" class\$="[[_getMultiselectClass()]]" role="listbox" touch-device\$="[[_touchDevice]]" on-touchend="_preventDefault" multi-selection="[[multiSelect]]" items="[[_itemsObject]]" selected-item="{{selectedItem}}" selected-items="{{selectedItems}}" scroll-target="[[_getScroller()]]">
                        <template>
                            <div class="item item-list" on-tap="_onTap" selected\$="[[_isItemSelected(item, selectedItems, selectedItem)]]" role\$="[[_getAriaRole(index)]]" aria-selected\$="[[_getAriaSelected(_focusedIndex,index)]]" focused\$="[[_isItemFocused(_focusedIndex, index)]]">
                                <template is="dom-if" if="[[multiSelect]]">
                                    <div class="m-r-5 checkbox-wrapper">
                                        <pebble-checkbox item="[[item]]" checked\$="[[_isItemSelected(item, selectedItems, selectedItem)]]" noink="" tabindex="-1"></pebble-checkbox>
                                    </div>
                                </template>
                                <template is="dom-if" if="[[showImage]]">
                                    <div class="image-wrapper">
                                        <pebble-image-viewer id\$="[[item.imageId]]" callback="{{_positionCallback}}" lazy-load="" src="[[_getItemImage(item)]]" alt="text" sizing="contain" class="thumb-image"></pebble-image-viewer>
                                    </div>
                                </template>
                                <template is="dom-if" if="[[showColor]]">
                                    <div id="cw_[[item.title]]" class="color-wrapper">
                                    </div>
                                    [[_applyColor(item)]]
                                </template>
                                <div class="item-wrapper p-t-5 p-b-5 item-length-overflow" tabindex="-1">
                                    <template is="dom-if" if="[[noSubTitle]]">
                                        <div class="item-list item-length-overflow" style\$="[[_getItemColorAndFontStyle(item)]]" title="[[_getItemTitle(item)]]">[[_getItemTitle(item)]]
                                            <template is="dom-if" if="[[multiSelect]]">
                                                <span class="only-badge" on-tap="_selectCurrentItemOnly"> only </span>
                                            </template>
                                        </div>
                                    </template>
                                    <template is="dom-if" if="[[!noSubTitle]]">
                                        <div title="[[_getItemToolTip(item)]]" class="item-length-overflow">
                                            <div class="title item-length-overflow" style\$="[[_getItemColorAndFontStyle(item)]]">
                                                [[_getItemTitle(item)]]
                                                <template is="dom-if" if="[[multiSelect]]">
                                                    <span class="only-badge" on-tap="_selectCurrentItemOnly"> only </span>
                                                </template>
                                            </div>
                                            <div class="sub-title item-length-overflow">
                                                [[_getItemSubTitle(item)]]
                                            </div>
                                        </div>
                                    </template>
                                </div>
                                <template is="dom-if" if="[[allowFavourites]]">
                                    <div class="favourite-wrapper">
                                        <pebble-icon class\$="[[_getFavouriteIconClass(item)]]" icon="[[_getFavouriteIcon(item)]]" item="[[item]]" on-tap="_onFavouriteIconTap"></pebble-icon>
                                    </div>
                                </template>
                            </div>
                        </template>
                    </iron-list>
                </div>
            </div>

        </div>
        <!-- this element will load more data when the user scrolls down and reached the lower threshold -->
        <iron-scroll-threshold id="scrollTheshold" on-lower-threshold="_onLowerThreshold" scroll-target="[[_getScroller()]]">
        </iron-scroll-threshold>
        <template is="dom-if" if="[[showActionButtons]]">
            <div id="actionButtons" class="buttons m-t-10 text-center">
                <pebble-button id="cancelButton" class="close btn btn-secondary m-r-5" button-text="Close" noink="" elevation="2" on-tap="_onClose"></pebble-button>
                <pebble-button id="confirmButton" disabled="[[readonly]]" class="apply btn btn-success" button-text="Apply" noink="" elevation="2" on-tap="_onConfirm"></pebble-button>
            </div>
        </template>
       
    
    <bedrock-pubsub event-name="on-popover-open-focus" handler="_onPopoverOpen"></bedrock-pubsub>
`;
  }

  static get is() {
      return "pebble-lov";
  }

  static get properties() {
      return {
          /*
           * Specifies whether or not the element is disabled.
           */
          disabled: {
              type: Boolean,
              value: false,
              reflectToAttribute: true
          },

          /*
           * Specifies whether or not the element is set to "read-only".
           */
          readonly: {
              type: Boolean,
              value: false,
              reflectToAttribute: true
          },

          /**
           * Indicates a function that provides items lazily. Receives parameters such as `opts`, `callback`, and `err`.
           *
           * `opts.page` indicates the requested page index.
           *
           * `opts.pageSize` indicates the current page size.
           *
           * `opts.filter` indicates the current filter parameters.
           *
           * `opts.sortOrder` indicates the current sorting parameters.
           */
          rDataSource: {
              type: Function
          },

          /**
           * Specifies whether or not to generate the console logs.
           */
          verbose: {
              type: Boolean,
              value: false
          },

          selectAll: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates that pushing of items in control is in progress
           */
          _loading: {
              type: Boolean,
              value: false
          },

          _selectedItemId: {
              type: String,
              value: "-1",
              notify: true
          },

          _selectedItemIds: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },

          _previousSelectedItemId: {
              type: String,
              value: "-1",
              notify: true
          },

          _previousSelectedItemIds: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _touchDevice: {
              type: Boolean,
              reflectToAttribute: true,
              value: function () {
                  try {
                      document.createEvent('TouchEvent');
                      return true;
                  } catch (e) {
                      return false;
                  }
              }
          },

          _itemsObject: {
              type: Object
          },

          _inputElementSearchValue: {
              type: String
          },

          _placeholder: {
              type: String,
              value: "Search"
          },

          _filter: {
              type: String,
              value: '',
              notify: true
          },

          _filteredItems: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _focusedIndex: {
              type: Number,
              notify: true,
              value: -1
          },

          _focusedItem: {
              type: String,
              computed: '_getFocusedItem(_focusedIndex)'
          },

          _imageUrl: {
              type: String,
              value: ""
          },

          _closeOnBlurIsPrevented: {
              type: Boolean
          },

          _handler: {
              type: Object
          },

          _page: {
              type: Number,
              value: 0
          },

          minFilterLength: {
              type: Number,
              value: 1
          },

          selectedItem: {
              type: Object,
              notify: true,
              value: function () {
                  return {};
              }
          },

          selectedItems: {
              type: Array,
              notify: true,
              value: function () {
                  return [];
              }
          },

          _positionCallback: {
              type: Object,
              value: function () {
                  return this._getImageSrc.bind(this);
              }
          },

          imageSource: {
              type: Object
          },

          allowSearchQueryFormat: {
              type: Boolean,
              value: false
          },

          deletedItemsCount: {
              type: Number,
              value: 0
          },

          disableSelection: {
              type: Boolean,
              value: false,
              observer: "_onSelectionChange"
          },

          enableOverlay: {
              type: Boolean,
              value: false
          },

          noPopover: {
              type: Boolean,
              value: false
          },

          noReferenceDataMessage: {
              type: String,
              value: ""
          },

          _noReferenceDataPresent: {
              type: Boolean,
              value: false
          },

          allowFavourites: {
              type: Boolean,
              value: false
          }
      };
  }

  static get observers() {
      return [
          '_itemsChanged(items.*)',
          '_focusedIndexChanged(_focusedIndex)',
          '_filterChanged(_filter)',
          '_filteredItemsChanged(_filteredItems.*)',
          '_selectedItemChanged(selectedItem)',
          '_selectedItemsChanged(selectedItems.*)',
          '_pageChanged(rDataSource, _page)',
          '_multiSelectChanged(multiSelect)'
      ];
  }

  /* LifeCycle Callbacks */
  constructor() {
      super();
  }

  connectedCallback() {
      super.connectedCallback();

      // Fix for #182. Only relevant for iron-list 1.0.X and 1.1.X.
      // 1.2.X works fine without this.
      if (this.$.selector._scroller !== undefined) {
          this.$.selector._scroller = this._getScroller();
      }

      this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(5000), () => {
          if (this.multiSelect) {
              this._previousSelectedItemIds = this._selectedItemIds
          } else {
              this._previousSelectedItemId = this._selectedItemId
          }
      });

      this.addEventListener("on-mousedown", this._preventDefault);
      this.addEventListener("keydown", this._onKeyDown);

      this._handler = this._outsideClickListener.bind(this);
      this.$.input.focus();
  }

  disconnectedCallback() {
      super.disconnectedCallback();

      this.removeEventListener("on-mousedown", this._preventDefault);
      this.removeEventListener("keydown", this._onKeyDown);

      this.cancelDebouncer('lov-filter-changed');
  }

  /* Template Methods */

  /* Note: this whole scroller thing is done to support iron lists scrollToIndex()
  and features that use it like keyboard navigation in IE11 for iron-list 1.0.x.
  Tested that iron-list 1.2.x works nicely even without the external scroller, but
  left these here for now for backwards compatibility.
  */
  _getScroller() {
      return this.$.scroller;
  }

  _isItemSelected(item, selectedItems, selectedItem) {
      if (item) {
          if (this.multiSelect == false) {
              return item === selectedItem;
          } else {
              if (selectedItems) {
                  let index = this._functiontofindIndexByKeyValue(selectedItems, "id", item.id); // Move to helper file
                  if (index != null || index != undefined) {
                      return index >= 0;
                  } else {
                      return false;
                  }
              }
          }
      }
  }

  /*
   *  Check if selectAll checkbox is enabled or not
   *  selectAll option provided for multi select only 
   */
  _isSelectAllEnabled(selectAll, multiSelect) {
      if (selectAll && multiSelect) {
          return true;
      } else {
          return false;
      }
  }

  /*
   *  Check if all the items in the lov are selected or not
   */
  _isAllItemsSelected(selectedItems) {
      if (!_.isEmpty(this.selectedItems) && !_.isEmpty(this.items) && this.selectedItems.length == this.items.length) {
          return true;
      } else {
          return false;
      }
  }

  /*
   *  Check if selectall is inderterminate
   */
  _isSelectAllIndeterminate(length, size) {
      return size > 0 && length > 0 && length < size;
  }

  /*
   *  Select/Unselect all items when selectAll checkbox is clicked
   */
  _selectAllItems(e) {
      let clonedItems = DataHelper.cloneObject(this.items);
      if (e.target.checked) {
          this._selectCheckbox(clonedItems);
          this.selectedItems = clonedItems;
      } else {
          this._deSelectCheckBox(clonedItems);
          this.selectedItems = [];
      }
  }

  /*
   *  Select only the current item and unselect remaining 
   */
  _selectCurrentItemOnly(e) {
      let self = this;
      let clonedItems = DataHelper.cloneObject(self.selectedItems);
      if (clonedItems && clonedItems.length) {
          for (let i = 0; i < clonedItems.length; i++) {
              self._selectionChanged(clonedItems[i]);
          }
      }
      this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(50), () => {
          // call apply button handler
          self._onConfirm();

          // close the pop over
          this._closePopover(self);
      });
  }
  _onPopoverOpen(){
      this.$.input.focus();
  }

  _closePopover(self) {
      self = self || this;
      if (typeof self.parentNode.closePopover === 'function') {
          self.parentNode.closePopover();
      } else if (self.offsetParent && self.offsetParent.close && typeof self.offsetParent.close === 'function') {
          if(self.offsetParent.tagName == "PEBBLE-POPOVER"){
              self.offsetParent.close();
          } 
      }
  }

  _getAriaSelected(focusedIndex, itemIndex) {
      return this._isItemFocused(focusedIndex, itemIndex).toString();
  }

  _isItemFocused(focusedIndex, itemIndex) {
      return focusedIndex == itemIndex;
  }

  _getAriaRole(itemIndex) {
      return itemIndex !== undefined ? 'option' : false;
  }

  _getFocusedItem(focusedIndex) {
      if (focusedIndex >= 0) {
          return this._itemsObject[focusedIndex];
      }
  }

  // Apply color to div as per data
  _applyColor(item) {
      setTimeout(() => {
          this.shadowRoot.querySelector('#cw_' + item.title).style['background-color'] = item.color;
      }, 150); // Delayed to apply color to div 
  }

  _multiSelectChanged() {
      if (this.multiSelect != undefined) {
          this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(1000), () => {
              if (this.multiSelect) {
                  this._previousSelectedItemIds = this._selectedItemIds
              } else {
                  this._previousSelectedItemId = this._selectedItemId
              }
          });
      }

      this.$.selector.className = this._getMultiselectClass();
  }

  _onLowerThreshold() {
      //load more data only when - items are more than current page can hold
      if (this.items && ((this.items.length + this.deletedItemsCount) < this._page * this.pageSize)) {
          return;
      }
      this._page++;                
  }

  _pageChanged(rDataSource, currentPage) {
      if (!(rDataSource === undefined || currentPage === undefined)) {
          if (typeof (rDataSource) == 'function' && currentPage > 0) {
              this._loading = true;

              // Note: Reference from Iron Datatable - LoadPage Method
              let success = this._success.bind(this);
              let error = this._error.bind(this);
              let inputValue = this._inputElementSearchValue;
              rDataSource({
                  page: this._page,
                  pageSize: this.pageSize,
                  filter: inputValue,
                  sortOrder: this.sortOrder
              }, success, error);
          }
      }
  }

  _success(data) {
      if (data && data.length > 0) {
          this._noReferenceDataPresent = false;
          let lastVisibleIndex = this._lastVisibleIndex();
          if (this._page == 1) {
              this.$.selector.reset();
              this.set("items", []);
          }
          for (let i = 0; i < data.length; i++) {
              this.push('items', data[i]);
          }
          this.$.selector.scrollToIndex(lastVisibleIndex);
          this.$.scrollTheshold.clearTriggers();
      } else if (this.items.length > 0) {
          this._loading = false;
      } else {
          this.page = -1; // Future Enhancement
          this._showNoReferenceDataPresent();
      }
      this._loading = false;
      this._selectItemOnFilter();
  }

  _selectItemOnFilter() {
      if (this._inputElementSearchValue != "") {
          this._userDefinedFilter = true;
          this._filter = "";
          this._filter = this._inputElementSearchValue;
          this._userDefinedFilter = false;
      }
  }

  _error(_msg) {
      this._loading = false;
      if (_msg) {
          this._showNoReferenceDataPresent(_msg);
      }
  }

  _showNoReferenceDataPresent(msg = "No data available") {
      this._noReferenceDataPresent = true;
      this.noReferenceDataMessage = msg;
  }

  _itemsChanged(e) {
      if (this.items != undefined) {
          let path = ElementHelper.getElementPath(e);

          if (path === 'items' || path === 'items.splices') {
              if (this.allowFavourites) {
                  if (_.isEmpty(this.items)) {
                      this.$.selector.reset();
                  }
                  this.moveFavouritesToTop(this.items);
              }
              this._filteredItems = this.items ? this.items.slice(0) : this.items;
          }
      }
  }

  _onTap(e) {
      if (this.multiSelect) {
          let checkBox = e.currentTarget.querySelector("pebble-checkbox");
          let path = ElementHelper.getElementPath(e);
          if (checkBox && path.indexOf(checkBox) == -1) {
              if (!checkBox.checked) {
                  checkBox.checked = true;
              } else {
                  checkBox.checked = false;
              }
          }
      }

      this._selectionChanged(e.model.item);

      if (!this.multiSelect) {
          let searchValue = this._inputElementSearchValue;
          this._clearFilter();
          /**
          * If lov is single select and items are filtered with some search criterian,
          * and when an item is selected, search text has to be cleared and LOV should 
          * go back to it's original state. Hence resetting only when there is some
          * search criterian existing instead of restting every time an item selected.
          * When there are actionButtons and popover is there, no need to reset the LOV.
          * */
          if (!this.showActionButtons && !this.noPopover && !_.isEmpty(searchValue)) {
              this.reset();
          }
      }
  }

  _inputValueChanged(e) {
      if(ValidationHelper.checkNaviagationAndFunctionKey(e)){
          return;
      }
      this._noReferenceDataPresent = false;
      let length = this._inputElementSearchValue ? this._inputElementSearchValue.replace(/\s/g, '').length : 0;
      if (length > 0 && length < this.minFilterLength) {
          return;
      }

      if (this.rDataSource && this.rDataSource instanceof Function) {
          this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(500), () => {
              if (this.items) {
                  this.set("items", []);
              }
              this._page = 0;
              this._page++;
          });
      } else if (this.id !== "contextLov") {
          // Handle only input events from our inputElement.
          let path = ElementHelper.getElementPath(e);
          if (path && path.indexOf(this.$.input) !== -1) {
              if (this._filter === this._inputElementSearchValue) {
                  // Filter and input value might get out of sync, while keyboard navigating for example.
                  // Afterwards, input value might be changed to the same value as used in filtering.
                  // In situation like these, we need to make sure all the filter changes handlers are run.
                  this._filterChanged(this._filter);
              } else {
                  this._userDefinedFilter = true;
                  this._filter = this._inputElementSearchValue;
                  this._userDefinedFilter = false;
              }
          }
      }
  }

  _filterChanged(filter) {
      if (filter != undefined && _.isEmpty(this.rDataSource) && this.rDataSource instanceof Function == false) {
          if (this.items) {
              this._filteredItems = this._filterItems(this.items, filter);
          }
      }
  }

  _filteredItemsChanged(e) {
      if (this._filteredItems != undefined) {
          let path = ElementHelper.getElementPath(e);
          if (path === '_filteredItems' || path === '_filteredItems.splices') {
              this._setOverlayItems();
              if (this._userDefinedFilter) {
                  this._focusedIndex = this._indexOfTitle(this._filter);
              }
          }
      }
  }

  _filterItems(arr, filter) {
    return DataHelper.applyLocalFilter(arr,filter,["title","subtitle"])
  }

  _setOverlayItems() {
      let selectedItem = this.selectedItem;
      let selectedItems = this.selectedItems;
      //TODO: There is something wrong with observers and using set function
      // see here: https://github.com/Polymer/polymer/issues/3254
      //As a workaround setting/notifying the observer with the value undefined helps
      this.notifyPath('_itemsObject', undefined);
      this.set('_itemsObject', this._filteredItems);
      // After filter selected items were set to NULL by Iron List
      if (!this.multiSelect) {
          this.selectedItem = undefined;
          this.selectedItem = selectedItem;
      } else {
          //this.notifyPath('selectedItems', undefined);
          this.set('selectedItems', []);
          this.set('selectedItems', selectedItems);
      }
  }

  _focusedIndexChanged(index) {
      if (index != undefined && !this.noPopover) {
          if (index >= 0) {
              this._scrollIntoView(index);
          }
      }
  }

  _indexOfTitle(title) {
      if (this._itemsObject && title) {
          for (let i = 0; i < this._itemsObject.length; i++) {
              if (this._getItemTitle(this._itemsObject[i]).toString().toLowerCase() === title.toString()
                  .toLowerCase()) {
                  return i;
              }
          }
      }
      return 0;
  }

  _getMultiselectClass() {
      if (this.multiSelect) {
          return "multiselect";
      } else {
          return "";
      }
  }

  _getItemId(item) {
      let itemId = this.get("id", item);
      if (itemId === undefined || itemId === null) {
          itemId = item ? item.toString() : '';
      }
      return itemId;
  }

  _getItemsIds(items) {
      let itemsIds = [];
      if (items) {
          for (let i = 0; i < items.length; i++) {
              itemsIds.push(this._getItemId(items[i]));
          }
      }
      return itemsIds;
  }

  _getItemTitle(item) {
      let title = this.get('title', item);
      if (title === undefined || title === null) {
          title = item ? item.toString() : '';
      }
      return title;
  }

  _getItemImage(item) {
      let image = this.get("imageId", item);
      if (image === undefined || image === null) {
          image = this._imageUrl;
      }
      return image;
  }

  _getItemSubTitle(item) {
      let subtitle = this.get("subtitle", item);
      if (subtitle === undefined || subtitle === null) {
          subtitle = '';
      }
      return subtitle;
  }

  clear() {
      if (this.items) {
          this._clearSelection();
      }
  }

  _clearSelection() {
      if (!this.multiSelect) {
          this._clearFilter();
      }
      this._deSelectCheckBox();
      this.$.selector.clearSelection();
  }

  _clearFilter() {
      this._inputElementSearchValue = '';
      this._filter = "";
  }

  _selectCheckbox(items) {
      this._toggleSelectionForCheckBoxes(true, items);
  }

  _deSelectCheckBox(items) {
      this._toggleSelectionForCheckBoxes(false, items);
  }

  _toggleSelectionForCheckBoxes(checkedStatus, items) {
      let checkBoxes = this.$.selector.querySelectorAll("pebble-checkbox");
      if (checkBoxes && checkBoxes.length > 0) {
          if (items) {
              for (let i = 0; i < items.length; i++) {
                  for (let j = 0; j < checkBoxes.length; j++) {
                      let checkBox = checkBoxes[j];
                      if (items[i].id === checkBox.item.id) {
                          checkBox.checked = checkedStatus;
                          break;
                      }
                  }
              }
          } else {
              for (let i = 0; i < checkBoxes.length; i++) {
                  let listItem = checkBoxes[i];
                  listItem.checked = checkedStatus;
              }
          }
      }
  }

  /* Stlyling and Positioning Methods */
  _scrollIntoView(index) {
      if (this._visibleItemsCount() === undefined) {
          // Scroller is not visible. Moving is unnecessary.
          return;
      }
      let targetIndex = index;
      if (index > this._lastVisibleIndex()) {
          // Index is below the bottom, scrolling down. Make the item appear at the bottom.
          targetIndex = index - this._visibleItemsCount() + 1;
          // From iron-list 1.2.4, scrolling to an index guarantees that the item
          // is visible into the viewport, but does not gurarantee that it is at the
          // first position. Jumping first to the item we want to be at the bottom,
          // fixes the problem.
          this.$.selector.scrollToIndex(index);
      } else if (index > this.$.selector.firstVisibleIndex) {
          // The item is already visible, scrolling is unnecessary per se. But we need to trigger iron-list to set
          // the correct scrollTop on the scrollTarget. Scrolling to firstVisibleIndex.
          targetIndex = this.$.selector.firstVisibleIndex;
      }
      this.$.selector.scrollToIndex(Math.max(0, targetIndex));
  }

  _ensureItemsRendered() {
      this.$.selector.flushDebouncer('_debounceTemplate');
      this.$.selector._render && this.$.selector._render();
  }

  _updateViewportBoundaries() {
      this._cachedViewportTotalPadding = undefined;
      this.$.selector._updateViewportBoundaries();
  }

  get _viewportTotalPadding() {
      if (this._cachedViewportTotalPadding === undefined) {
          let itemsStyle = window.getComputedStyle(this._unwrapIfNeeded(this.$.selector.$.items));
          this._cachedViewportTotalPadding = [
              itemsStyle.paddingTop,
              itemsStyle.paddingBottom,
              itemsStyle.borderTopWidth,
              itemsStyle.borderBottomWidth
          ].map(function (v) {
              return parseInt(v, 10);
          }).reduce(function (sum, v) {
              return sum + v;
          });
      }
      return this._cachedViewportTotalPadding;
  }

  /* Stlyling and Positioning Methods */
  /* Utility Methods */
  _visibleItemsCount() {
      let firstItemIndex = this.$.selector._physicalStart;
      let firstItemHeight = this.$.selector._physicalSizes[firstItemIndex];
      let viewportHeight = this.$.selector._viewportHeight || this.$.selector._viewportSize; //Changed in v1.3.0.
      if (firstItemHeight && viewportHeight) {
          let visibleItems = (viewportHeight - this._viewportTotalPadding) / firstItemHeight;
          return Math.floor(visibleItems);
      }
  }

  _lastVisibleIndex() {
      if (this._visibleItemsCount()) {
          return this.$.selector.firstVisibleIndex + this._visibleItemsCount() - 1;
      }
  }

  _stringToBoolean(_str) {
      return _str === "true";
  }

  _functiontofindIndexByKeyValue(arraytosearch, key, valuetosearch) {
      for (let i = 0; i < arraytosearch.length; i++) {
          if (arraytosearch[i] && arraytosearch[i][key] == valuetosearch) {
              return i;
          }
      }
      return null;
  }

  _hasItems(array) {
      return array && array.length;
  }

  _preventDefault(e) {
      e.preventDefault();
  }

  _stopPropagation(e) {
      e.stopPropagation();
  }

  /* Utility Methods */
  /* KeyBoard Methods */
  _onKeyDown(e) {
      if (this._isEventKey(e, 'down')) {
          this._closeOnBlurIsPrevented = true;
          this._onArrowDown();
          this._closeOnBlurIsPrevented = false;
          // prevent caret from moving
          e.preventDefault();
      } else if (this._isEventKey(e, 'up')) {
          this._closeOnBlurIsPrevented = true;
          this._onArrowUp();
          this._closeOnBlurIsPrevented = false;
          // prevent caret from moving
          e.preventDefault();
      } else if (this._isEventKey(e, 'enter')) {
          this._onEnter(e);
      } else if (this._isEventKey(e, 'esc')) {
          this._onEscape();
      } else if (this._isEventKey(e, 'tab')) {
          this._closePopover();
      } else if (this._isEventKey(e, 'space')) {
          // this._onSpace();
          // Do not submit the surrounding form.
          // e.preventDefault();
      }
  }

  _isEventKey(e, k) {
      return IronA11yKeysBehavior.keyboardEventMatchesKeys(e, k.toString());
  }

  _onArrowDown() {
      if (this._itemsObject) {
          this._focusedIndex = Math.min(this._itemsObject.length - 1, this._focusedIndex + 1);
      }
  }

  _onArrowUp() {
      if (this._focusedIndex > -1) {
          this._focusedIndex = Math.max(0, this._focusedIndex - 1);
      } else {
          if (this._itemsObject) {
              this._focusedIndex = this._itemsObject.length - 1;
          }
      }
  }

  _onEnter(e) {
      if (!this.multiSelect && (this._focusedIndex > -1)) {
          this._close();
          // Do not submit the surrounding form.
          e.preventDefault();
      }

      if (this._focusedIndex > -1 && this.multiSelect) {
          let focusedItem = this._itemsObject[this._focusedIndex];
          this._selectionChanged(focusedItem);
      }
  }

  _onEscape() {
      if (this._focusedIndex > -1) {
          this._focusedIndex = -1;
          // this._revertInputValue();
      } else {
          this._cancel();
      }
  }

  _onSpace() {
      if (this._focusedIndex > -1 && this.multiSelect) {
          let focusedItem = this._itemsObject[this._focusedIndex];
          this._selectionChanged(focusedItem);
      }
  }

  _cancel() {
      this._close();
  }

  /*
   * Can be used to activate and ensure that all the items are rendered in the control
   */
  activate() {
      // Prevent _open() being called when input is disabled or read-only
      if (!this.disabled && !this.readonly) {
          this._open();
      }
  }

  refereshTemplate() {
      microTask.run(() => {
          this._filter = '';
          this.$.input.focus();
          this._deSelectCheckBox(); // Will DeSelect All CheckBox
          this._selectCheckbox(this.selectedItems);
      });

  }

  _open() {
      this._addOutsideClickListener();
  }

  _close() {
      this._removeOutsideClickListener();
      if (this._focusedIndex > -1) {
          if (!this.multiSelect) {
              let focusedItem = this._itemsObject[this._focusedIndex];
              this._selectionChanged(focusedItem);
          } else {
              this._focusedIndex = -1;
              // this._revertInputValue();
          }
      } else if (this._inputElementSearchValue === '') {
          this.clear();
      }
      this._clearFilter();
  }

  // We need to listen on 'click' / 'tap' event and capture it and close the overlay before
  // propagating the event to the listener in the button. Otherwise, if the clicked button would call
  // open(), this would happen: https://www.youtube.com/watch?v=Z86V_ICUCD4
  _outsideClickListener(event) {
      let eventPath = event.composedPath();
      if (!this.multiSelect) {
          if (eventPath.indexOf(this) === -1 || (eventPath.indexOf(this) >= 0 && eventPath.indexOf(
                  this.$.searchbox) < 1)) {
              this._close();
          }
      } else {
          if (eventPath.indexOf(this) === -1) {
              this._close();
          }
      }
  }

  _addOutsideClickListener() {
      // With desktop mouse, 'click' will make Polymer to fire 'tap' event.
      // With touch devices, 'touchend' will make Polymer to fire 'tap' event, but browser will also fire 'click'.
      // So, 'click' and 'tap' can come in any order and we need to make sure that the first one fired will close the overlay.
      if (this._touchDevice) {
          gestures.add(this, 'tap', null);
          document.addEventListener('tap', this._handler, true);
      } else {
          document.addEventListener('click', this._handler, true);
      }
  }

  _removeOutsideClickListener() {
      if (this._touchDevice) {
          // Not sure if this is a good idea to remove this Gesture globally, but that's how the iron-overlay-behavior does it.
          gestures.remove(this, 'tap', null);
          document.removeEventListener('tap', this._handler, true);
      } else {
          document.removeEventListener('click', this._handler, true);
      }
  }

  /* Dropdown Methods */
  _selectionChanged(selectedItem) {
      if (!this.multiSelect) {
          if (this.selectedItem && this.selectedItem.id == selectedItem.id) {
              this.selectedItem = undefined;
              this.selectedItems = undefined;
          } else {
              this.selectedItem = selectedItem;
          }
      } else {
          if (selectedItem) {
              // If undefined set as empty array
              if (!this.selectedItems) {
                  this.selectedItems = [];
              }

              let selectedItemIndex = -1;
              for (let i = 0; i < this.selectedItems.length; i++) {
                  if (selectedItem.id == this.selectedItems[i].id) {
                      selectedItemIndex = i;
                      break;
                  }
              }

              if (selectedItemIndex >= 0) {
                  this.splice('selectedItems', selectedItemIndex, 1);
              } else {
                  this.push('selectedItems', selectedItem);
              }

              //Notify selected items
              let selectedItemList = this.selectedItems;
              this.selectedItems = [];
              this.selectedItems = selectedItemList;
          }
      }
      this.dispatchEvent(new CustomEvent('selection-changed', {
          detail: {
              item: selectedItem
          },
          bubbles: true,
          composed: true
      }));
  }

  _selectedItemChanged(selectedItem) {
      if (!this._filteredItems || this._filteredItems.length < 1) {
          return;
      }
      if (selectedItem === null || selectedItem === undefined) {
          this._selectedItemId = -1;
      } else {
          this._selectedItemId = this._getItemId(selectedItem);
      }
      if (selectedItem) {
          this._focusedIndex = this._functiontofindIndexByKeyValue(this._filteredItems, 'id',
              selectedItem.id);
      } else {
          this._focusedIndex = -1;
      }
  }

  _selectedItemsChanged(selectedItems) {
      if (selectedItems != undefined) {
          if (selectedItems.path == 'selectedItems') {
              this.selectedItems = selectedItems.value;
          }
          if (this.selectedItems === null || this.selectedItems === undefined || this.selectedItems.length <= 0) {
              this._selectedItemIds = [];
          } else {
              this.set('_selectedItemIds', this._getItemsIds(this.selectedItems));
          }
      }
  }

  _onConfirm(event) {
      if (event && event.currentTarget && event.currentTarget.disabled) {
          return;
      }
      if (this.multiSelect) {
          this._previousSelectedItemIds = this._selectedItemIds
      } else {
          this._previousSelectedItemId = this._selectedItemId
      }

      let eventDetail = {
          data: {
              id: this.id
          }
      };
      this.dispatchEvent(new CustomEvent("lov-confirm-button-tap", {
          detail: eventDetail,
          bubbles: true,
          composed: false
      }));
      this._inputValueChanged();
      this._clearFilter();
  }

  _onClose(event) {
      if (this.multiSelect) {
          if (!DataHelper._isEqual(this._previousSelectedItemIds, this._selectedItemIds)) {
              let selectedItems = [];

              for (let i = 0; i < this._previousSelectedItemIds.length; i++) {
                  selectedItems.push(this._getItemById(this._previousSelectedItemIds[i]));
              }

              // Todo.. Verify this minor change
              this.set("selectedItems", selectedItems);
          }
      } else {
          if (!DataHelper._isEqual(this._previousSelectedItemId, this._selectedItemId)) {
              this.selectedItem = this._getItemById(this._previousSelectedItemId);
          }
      }

      let eventDetail = {
          data: {
              id: this.id
          }
      }

      this.dispatchEvent(new CustomEvent("lov-close-button-tap", {
          detail: eventDetail,
          bubbles: true,
          composed: true
      }));
  }

  _unwrapIfNeeded(element) {
      let isWrapped = Settings.hasShadow && !Settings.nativeShadow;
      return isWrapped ? window.unwrap(element) : element;
  }

  _getItemById(itemId) {
      return DataHelper._findItemByKeyValue(this.items, "id", itemId);
  }

  refreshData() {
      if (this.rDataSource && this.rDataSource instanceof Function) {
          if (this.items) {
              this.set("items", []);
          }
          this._page = 0;
          this._page++;
      }
  }

  reset() {
      this._inputElementSearchValue = '';
      this.refreshData();
  }

  _getImageSrc(detail) {
      if (detail && detail.target) {
          let target = detail.target;
          detail.imageId = target.src;
          if (typeof (this.imageSource) == 'function') {
              this.imageSource(detail);
          }
      }
  }

  _onPaste(e) {
      //If LOV consumer do not want to format then return without any format
      if (!this.allowSearchQueryFormat) {
          this._inputValueChanged();
          return;
      }
      let pastedQuery = "";
      let formattedQuery = "";

      e.preventDefault();

      if (e.clipboardData) {
          pastedQuery = e.clipboardData.getData('text/plain');
      } else if (window.clipboardData) { //IE
          pastedQuery = window.clipboardData.getData("text");
      }

      formattedQuery = DataHelper.getFormatedSearchQuery(pastedQuery);

      //assign _inputElementSearchValue if not set earlier
      if (!this._inputElementSearchValue) {
          this._inputElementSearchValue = "";
      }

      if (DataHelper.isTextSelected(this.$.input)) {
          // What if user select spaces and there are multiple spaces?
          this._inputElementSearchValue = this._inputElementSearchValue.replace(DataHelper.getSelectedText(this.$.input), formattedQuery);
      } else {
          this._inputElementSearchValue = DataHelper.replaceAt(this._inputElementSearchValue, this.$.input.selectionStart, formattedQuery);
      }

      this._inputValueChanged();
  }

  _getItemColorAndFontStyle(item) {
      let style = "";

      if (!_.isEmpty(item.textColor)) {
          style = style + "color:" + item.textColor + ";";
      }
      if (!_.isEmpty(item.fontStyle)) {
          style = style + "font-style:" + item.fontStyle + ";";
      }

      return style;
  }

  _onSelectionChange(currentState) {
      this.enableOverlay = currentState ? true : false;
  }

  _getItemToolTip(item) {
      let title = this.get('title', item);
      let subtitle = this.get("subtitle", item);
      if (_.isEmpty(title)) {
          title = item ? item.toString() : '';
      }
      if (_.isEmpty(subtitle)) {
          return title;
      }
      return title + '\n' + subtitle;
  }

  _getFavouriteIcon(item) {
      if (item.isFavourite) {
          return "pebble-icon:bookmark";
      }
      return "pebble-icon:un-bookmark";
  }

  _getFavouriteIconClass(item) {
      if (item.isFavourite) {
          return "un-favourite-badge pebble-icon-size-16";
      }
      return "favourite-badge pebble-icon-size-16";
  }

  _onFavouriteIconTap(e) {
      this._loading = true;
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent("lov-favourite-icon-tap", {
          detail: e.currentTarget.item,
          bubbles: true,
          composed: true
      }));
  }

  moveFavouritesToTop(items) {
      if (!_.isEmpty(items)) {
          let favouriteItems = items.filter(item => item.isFavourite === true);
          if (!_.isEmpty(favouriteItems)) {
              favouriteItems.forEach(function (favItem) {
                  let index = items.findIndex(item => item.id === favItem.id);
                  if (index > -1) {
                      items.splice(index, 1);
                  }
              }, this);

              items.unshift(...favouriteItems);
          }
      }

      this._loading = false;
  }
}
customElements.define(PebbleLov.is, PebbleLov);
