import '@polymer/polymer/polymer-legacy.js';
/***
 * `RUFBehaviors.LovBehavior` provides common properties and methods that must be implemented for all
 *  `lov` elements. It is a mandatory behavior for all `lov` elements to implement.
 *
 *  ### Example
 *
 *     <dom-module id="x-lov">
 *        <template>
 *        </template>
 *        <script>
 *           Polymer({
 *             is: ""x-lov",
 *
 *             behaviors: [
 *               RUFBehaviors.LovBehavior
 *             ],
 *
 *             properties: {
 *              
 *             }
 *           });
 *        <&lt;>/script>
 *     </dom-module>
 * @demo demo/index.html
 * @polymerBehavior RUFBehaviors.LovBehavior
 */

window.RUFBehaviors = window.RUFBehaviors || {};
/** @polymerBehavior RUFBehaviors.LovBehavior */
RUFBehaviors.LovBehavior = {

    properties: {
        /*
         * Content is not appearing - Specifies whether or not multiple items are selected at once. When it is set to <b>true</b>, 
         * multiple items are selected at a time. In this case, selected item is an array of currently selected items.
         * When it is set to <b>false</b>, only one item is selected at a time.
         */
        multiSelect: {
            type: Boolean,
            value: false
        },
        /* 
         * Content is not appearing - Specifies whether or not to show an image with the item text.
         */
        showImage: {
            type: Boolean,
            value: false
        },
        /* 
         * Content is not appearing - Specifies whether or not to show the color with the item text.
         */
        showColor: {
            type: Boolean,
            value: false
        },
        /* 
         * Content is not appearing - Specifies whether or not to hide the sub-title.
         */
        noSubTitle: {
            type: Boolean,
            value: false
        },
        /* 
         * Content is not appearing - Specifies whether or not to show the action buttons.
         */
        showActionButtons: {
            type: Boolean,
            value: false,
        },
        /*
         * Content is not appearing - Indicates an array of items that determines how many instances of the template 
         * to stamp and to what instances the template binds to.
         */
        items: {
            type: Array,
            value: function () {
                return [];
            }
        },
        /*
         * Content is not appearing - Indicates the currently selected item when the multi-selection is false. 
         * It indicates null if no item is selected.
         */
        selectedItem: {
            type: Object,
            value: function () {
                return {};
            },
            notify: true
        },
        /*
         * Content is not appearing - Indicates an array that contains the selected items when the multi-selection is true.
         */
        selectedItems: {
            type: Array,
            value: function () {
                return [];
            },
            notify: true
        },
      /**
        * Content is not appearing - Content development is under progress. 
        */
        selectedIds: { // Todo.. should be removed or renamed
            type: Array,
            value: function () {
                return [];
            },
            notify: true
        },
      /**
        * Content is not appearing - Content development is under progress. 
        */
        selectedId: { // Todo.. should be removed or renamed
            type: String,
            value: "",
            notify: true
        },
      /**
        * Content is not appearing - Content development is under progress. 
        */
        pageSize: {
            type: Number,
            value: 10
        }
    }
};
