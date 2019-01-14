import '@polymer/polymer/polymer-element.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
/***
* `RUFBehaviors.GridItemViewBehavior` provides common properties for grid-list-view and grid-tile-view
*
*  ### Example
*
*     <dom-module id="x-app">
*        <template>
*        </template>
*        <script>
*           Polymer({
*             is: "x-app",
*
*             behaviors: [
*               RUFBehaviors.GridItemViewBehavior
*             ],
*
*             properties: {
*              
*             }
*           });
*        &lt;/script>
*     </dom-module>
*/

window.RUFBehaviors = window.RUFBehaviors || {};
/** @polymerBehavior RUFBehaviors.GridItemViewBehavior */
RUFBehaviors.GridItemViewBehavior = {
    properties: {
        /**
        * Indicates an array of items that needs the display in the `grid-tile-view`.
        */
        items: {
            type: Array,
            value: function () {
                return [];
            },
            observer: "_itemsChanged",
            notify: true
        },

        /**
        * <b><i>Content development is under progress... </b></i>
        */
        gridItemDataSource: {
            type: Object,
            value: function () {
                return {};
            },
            notify: true
        },

        /**
        * Indicates the current page in the `grid-tile-view`.
        */
        page: {
            type: Number,
            value: 0,
            notify: true
        },

        /**
        * Indicates the page size in the `grid-tile-view`.
        */
        pageSize: {
            type: Number,
            value: 15,
            notify: true
        },

        /**
        * Specifies whether or not to load the data. Set it to <b>true</b> to load the data
        * Otherwise, set it to <b>false</b>.
        */
        loading: {
            type: Boolean,
            value: false
        },

        /**
        * Specifies whether or not multiple items are selected at once. When it is set to <b>true</b>, multiple items are selected at once.
        * Otherwise, only one item is selected at a time.
        */
        multiSelection: {
            type: Boolean,
            value: false,
            notify: true
        },
        enableMultiSelection: {
            type: Boolean,
            value: false
        },
        /**
            * Indicates an array of the selected items. When it is <b>true</b>, this array contains the selected items.
            * However, if `selectedItems.inverted` is <b>true</b>, the array contains deselected items.
            */
        selectedItems: {
            type: Array,
            value: [],
            notify: true
        },
        /**
            * Indicates the currently selected item if the `multiSelection` is set to <b>false</b>.
            * It is set to "null" when no items are selected.
            */
        selectedItem: {
            type: Object,
            //value : {},
            notify: true
        },
        /**
            * Specifies whether or not the tapping a row selects the item.
            * The selection of the item places its data model in the set of selected items.
            * This is retrievable via the selection property.
            */
        selectionEnabled: {
            type: Boolean,
            value: false,
            notify: true
        },

        advanceSelectionEnabled: {
            type: Boolean,
            value: true
        },
        advanceSelectionOptions: {
            type: Array,
            value: function () {
                return [];
            }
        },

        actions: {
            type: Array,
            value: []
        },

        selectionInfo: {
            type: Object,
            value: function () { return {} },
            notify: true
        },

        attributeModelObject: {
            type: Object,
            value: function () {
                return {};
            }
        }
    },
    observers: [
        '_pageChanged(gridItemDataSource, page)'
    ],
    behaviors: [
        RUFBehaviors.UIBehavior
    ],

    _scrollToTop: function () {
        const scrollingRegion = this.shadowRoot.querySelector('#scrollingRegion');
        if (scrollingRegion) {
            scrollingRegion.scrollTop = 0;
        }
    },

    _onPopoverSelectionChange: function (e) {
        this.clearSelection();
        this._scrollToTop();
        if (e.detail) {
            if (e.detail.mode == "count") {
                let selectionCount = e.detail.itemCount;
                let items = this.items;
                let searchSelectedItems
                if (items.length >= selectionCount) {
                    searchSelectedItems = items.slice(0, selectionCount);
                    searchSelectedItems.forEach(function (value, key) {
                        if (value) {
                            this._selectItem(value);
                        }
                    }.bind(this));
                } else {
                    this.selectAll();
                }
            }
            this.set('selectionInfo', e.detail);
            
            if (e.detail.mode == "query") {
                this.selectAll();
                return true;
            }
        }
    },

    /**
    * This is an internal function, used to calculate the display name of an attribute.
    */
    _getDisplayName: function (label) {
        if (label) {
            return label + " ";
        }
    },

    _getArrayFromObject: function (obj) {
        return DataHelper.convertObjectToArray(obj);
    },

    _itemsChanged: function () {
        this._enableMultiSelection();
    },
    _enableMultiSelection: function () {
        this.enableMultiSelection = !!(this.multiSelection && this.items && this.items.length);
    },

    _error: function () {
        this.loading = false;
    },

    _pageChanged: function (gridItemDataSource, currentPage) {
        if (!(gridItemDataSource === undefined || currentPage === undefined)) {
            if (typeof (gridItemDataSource) == 'function' && currentPage > 0) {
                this.loading = true;
                let success = this._success.bind(this);
                let error = this._error.bind(this);
                gridItemDataSource({
                    page: this.page,
                    pageSize: this.pageSize,
                    sortOrder: this.sortOrder,
                    "viewMode": this._viewMode
                }, success, error);
            }
        }
    },

    _success: function (data) {
        if (data.length > 0) {
            this.items = this.items.concat(data);
        } else {
            this.page = -1; // Future Enhancement
        }
        this.loading = false;
        this._enableMultiSelection();
    },

    _getStyleClass: function (item) {
        if (this._hasContextCoalescedValue(item)) {
            return "coalesced-value";
        }
    },

    _hasContextCoalescedValue: function (item) {
        return !_.isEmpty(item.contextCoalescePaths);
    },

    _addSourceInfoAction: function (actions, item) {
        if (!_.isEmpty(actions) && this._hasContextCoalescedValue(item)) {
            actions.push({
                "name": "sourceInfo",
                "icon": "pebble-icon:hierarchy",
                "text": "",
                "visible": true,
                "tooltip": "Source Info"
            });
            return true;
        }
    },

    _onActionItemTap: function (e) {
        let action = e.model.action;
        let eventName = action.eventName;
        if (!eventName) {
            if (action.name == 'delete') {
                eventName = "grid-delete-item";
            } else if (action.name == 'edit') {
                eventName = "grid-edit-item";
            } else if (action.name == 'sourceInfo') {
                let sourceInformation = this.$$("#action_" + e.model.item.id + "_" + action.name + "-popover");
                if (sourceInformation) {
                    sourceInformation.show();
                }
            }
        }
        ComponentHelper.getParentElement(this).fireBedrockEvent(eventName, e.model.item);
        let id = 'action_list_' + e.model.item.id;
        this.shadowRoot.querySelector('#' + id).hide();
    },

    _fireEvent: function (eventName, item, defaultAction) {
        let e = this.dispatchEvent(new CustomEvent(eventName, { detail: { item: item }, cancelable: true, bubbles: true, composed: true }));
        if (!e.defaultPrevented) {
            defaultAction.call(this, item);
        }
    },
    _toggleSelectAll: function () {
        this._resetAdvanceSelection();
        if (this._isSelectAllChecked(this.selectedItems.length, this.selectedItems.inverted, this.items.length)) {
            this._fireEvent("deselecting-all-items", { items: this.selectedItems }, this.clearSelection);
        } else {
            this._fireEvent("selecting-all-items", { items: this.selectedItems }, this.selectAll);
        }
    },
    _isSelectAllChecked: function (selectedItemsLength, inverted, size) {
        return size > 0 && selectedItemsLength === (inverted ? 0 : size);
    },
    _isSelectAllIndeterminate: function (length, size) {
        return size > 0 && length > 0 && length < size;
    },
    _onActionsTap: function (e) {
        let id = 'action_list_' + e.model.item.id;
        this.shadowRoot.querySelector('#' + id).show();
    },

    _clearSelection: function () {
        this.set('selectedItems.inverted', false);
        if (!this.selectedItem) {
            this._setSelectedItem(null);
        }
    },
    _isSelected: function (item, selectedItems) {
        if (selectedItems && item) {
            let selected = selectedItems.indexOf(item) > -1;
            return selectedItems.inverted ? !selected : selected;
        }
    },

    /**
    * Can be used to deselect the given item list if it is already selected.
    *
    * @method deselect
    * @param {(Object|number)} item The item object or its index
    */
    deselectItem: function (item) {
        if (this.advanceSelectionEnabled == true) {
            this._resetAdvanceSelection();
        }
        if (typeof item === 'number' && item >= 0 && this.items && this.items.length > item) {
            this._deselectItem(this.items[item]);
        } else {
            this._deselectItem(item);
        }
    },
    _deselectItem: function (item) {
        this._setSelectedItem(null);
        let index = this.selectedItems.indexOf(item);
        if (this.selectedItems.inverted) {
            if (index === -1) {
                this.push('selectedItems', item);
            }
        } else {
            if (index > -1) {
                this.splice('selectedItems', index, 1);
            }
        }
    },

    _selectItem: function (item) {
        this._setSelectedItem(item);
        if (this.multiSelection) {
            if (this.selectedItems.inverted) {
                let index;
                if ((index = this.selectedItems.indexOf(item)) > -1) {
                    this.splice('selectedItems', index, 1);
                }
            } else {
                this.push('selectedItems', item);
            }
        } else {
            this.splice('selectedItems', 0, this.selectedItems.length, item);
        }
    },

    _setSelectedItem: function (item) {
        this.set('selectedItem', item);
    },
    _setSelectedItems: function (items) {
        this.set('selectedItems', items);
    },
    /**
    * Can be used to select the list item at the given index.
    *
    * @method selectItem
    * @param {(Object|number)} item The item object or its index
    */
    selectItem: function (item) {
        if (this.advanceSelectionEnabled == true) {
            this._resetAdvanceSelection();
        }
        if (typeof item === 'number' && item >= 0 && this.items && this.items.length > item) {
            this._selectItem(this.items[item]);
        } else {
            this._selectItem(item);
        }
    },

    _getAttributeModel: function (field) {
        if (this.attributeModelObject && this.attributeModelObject[field.name]) {
            return this.attributeModelObject[field.name].properties;
        }
    },

    /**
    * This is an internal function to handle the tap event. It fires event 'deselecting-item' if an item was already selected.
    *  It fires event 'selecting-item' if an item was not selected. The data of the event fired is the data of the item.
    */
    _tapEvent: function (e) {
        this._resetAdvanceSelection();
        if (this._isSelected(e.model.item, this.selectedItems)) {
            this._fireEvent('deselecting-item', e.model.item, this.deselectItem);
        } else {
            this._fireEvent('selecting-item', e.model.item, this.selectItem);
        }
    },


    /**
    * This is an internal function, used to calculate the class to apply trim or not.
    */
    _computeClass: function (noTrim) {
        if (noTrim) {
            return 'default';
        }
        return 'default trim';
    },
    resetAdvanceSelection: function () {
        this._resetAdvanceSelection();
    },
    _resetAdvanceSelection: function () {
        let getGridSelectionPopover = this.shadowRoot.querySelector("#gridSelectionPopover");
        if (getGridSelectionPopover && getGridSelectionPopover.resetSelection) {
            getGridSelectionPopover.resetSelection();
            this.set('selectionInfo', '{}');
            return true;
        }
    },

};
/** @polymerBehavior */
