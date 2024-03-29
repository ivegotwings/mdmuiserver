/**
`<pebble-combo-box>` Represents an element which contains the dimension selection.

### Example

    <pebble-combo-box
            id='multi-select-lov' 
            items='[{"id":1,"title":"color", "color": "blue"},{"id":2, "title":"Size", "color": "red"}]'
            selected-items='[{"id":1,"title":"color", "color": "blue"},{"id":2, "title":"Size", "color": "red"}]'
            multi-select 
            label="Multi Selection">
            Multi selection combo-box
    </pebble-combo-box>

### Styling
The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--text-collection-container` | Mixin applied to component | {}
`--line-with-icon` | Mixing for a line and dropdown icon section | {}
`--line-with-icon-readonly` | Mixing for a line and dropdown icon section when readonly | {}
`--text-collection-label` | Mixin applied to component label | {}
`--tags-container` | Mixin applied to tags container | {}
`--combo-box-tag-value` | Mixin applied to tag value | {}
`--tag-close-icon` | Mixin applied to tag close | {}
`--text-collection-popover` | Mixin applied to tags collection popover | {}
`--dropdown-icon` | Mixin applied to dropdown icon | {}
`--pebble-combobox-lov` | Mixing applied for LOV | {}

@group pebble Elements
@element pebble-combo-box
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/paper-input/paper-input.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../pebble-lov/pebble-lov.js';
import '../pebble-textbox-collection/pebble-collection-container.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleComboBox extends mixinBehaviors([RUFBehaviors.UIBehavior], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common">
            pebble-lov {
                @apply --pebble-combobox-lov;
            }
        </style>

        <bedrock-pubsub event-name="on-tap-remove-collection" handler="_tagItemRemoved"></bedrock-pubsub>
        <bedrock-pubsub event-name="on-tap-show-more" handler="_onTapShowMore"></bedrock-pubsub>
        <pebble-collection-container id="collectionContainer" label="[[label]]" description-object="[[descriptionObject]]" no-label-float="[[noLabelFloat]]" values="{{values}}" is-readonly="[[isReadonly]]" display-limit="[[displayLimit]]">
            <template is="dom-if" if="[[isPopoverOpened]]">
                <pebble-lov id="lov" r-data-source="{{rDataSource}}" image-source="{{imageSource}}" items="{{items}}" multi-select="[[multiSelect]]" no-sub-title="[[noSubTitle]]" show-action-buttons="[[showActionButtons]]" show-image="[[showImage]]" show-color="[[showColor]]" selected-items="{{_lovSelectedItems}}" selected-item="{{_lovSelectedItem}}" on-selection-changed="_lovSelectionChanged" no-popover="[[noPopover]]">
                </pebble-lov>
            </template>
        </pebble-collection-container>

        <bedrock-pubsub event-name="collection-container-open" handler="_onCollectionContainerOpen" target-id="collectionContainer"></bedrock-pubsub>
        <bedrock-pubsub event-name="collection-container-close" handler="_onCollectionContainerClose" target-id="collectionContainer"></bedrock-pubsub>
`;
  }

  static get is() {
      return "pebble-combo-box";
  }

  static get properties() {
      return {
          /**
           * Indicates the tag items.
           */
          values: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },

          rDataSource: {
              type: Function
          },

          /**
          * Indicates the selected values.
          */
          selectedValues: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },

          /**
           * Indicates the selected value.
           */
          selectedValue: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true
          },

          /**
           * Indicates the label for tag the collection.
           */
          label: {
              type: String,
              value: ""
          },

          /**
           * Indicates whether or not the combo-box is read-only.
           */
          isReadonly: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates the display limit for the tags.
           */
          displayLimit: {
              type: Number
          },

          /*
           * Specifies whether or not multiple items is selected at once. When it is set to <b>true</b>,
           * multiple items are selected at a time. In this case, it is an array of currently selected items.
           * When it is set to <b>false</b>, only one item is selected at a time.
           */
          multiSelect: {
              type: Boolean,
              value: false
          },

          /*
           * Specifies whether or not to show the image with the item text.
           */
          showImage: {
              type: Boolean,
              value: false
          },

          /*
           * Specifies whether or not to show color with the item text.
           */
          showColor: {
              type: Boolean,
              value: false
          },

          /*
           * Specifies whether or not to show the subtitle.
           */
          noSubTitle: {
              type: Boolean,
              value: false
          },

          /*
           * Specifies whether or not to show the action buttons.
           */
          showActionButtons: {
              type: Boolean,
              value: false
          },

          /*
           * Indicates an array of items that determines how many instances of the template
           * to stamp and to what instances the template binds to.
           */
          items: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          /**
           * Indicates an array of the selected Ids.
           *
           */
          selectedIds: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },

          /**
           * Indicates the selected Id.
           *
           */
          selectedId: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true
          },

          /*
           * Indicates the currently selected item when multiSelection is false.
           * It indicates null if no item is selected.
           */
          _lovSelectedItem: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true
          },

          /*
           * Indicates an array that contains the selected items when the  multiselection is true.
           */
          _lovSelectedItems: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },

          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          isPopoverOpened: {
              type: Boolean,
              value: false
          },

          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          isRemoveTriggered: {
              type: Boolean,
              value: false
          },

          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          isShowMoreTriggered: {
              type: Boolean,
              value: false
          },

          imageSource: {
              type: Object
          },

          /**
           * Indicates whether to disable the floating label or not.
           * Set the value as <b>true</b> to disable the floating label.
           */
          noLabelFloat: {
              type: Boolean,
              value: false
          },

          /**
           * Description object should contain non-empty
           * description field (type type: Array or String)
           */
          descriptionObject: {
              type: Object,
              notify: true,
              value: function () {
                  return {};
              }
          },

          selectedValuesColor: {
              type: String,
              value: ""
          },

          selectedValuesFontStyle: {
              type: String,
              value: ""
          },

          selectedValuesLocale: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },

          noPopover: {
              type: Boolean,
              value: false
          }
      }

  }

  static get observers() {
      return [
          '_onSelectedIdsChange(selectedIds)',
          '_onSelectedIdChange(selectedId)',
          '_selectedValueStyleChange(selectedValuesColor, selectedValuesFontStyle)'
      ]
  }

  get pebbleLov() {
      this._pebbleLov = this._pebbleLov || this.shadowRoot.querySelector("pebble-lov");
      return this._pebbleLov;
  }

  _getCollectionContainer() {
      return ElementHelper.getElement(this, "pebble-collection-container");
  }

  /**
   * Can be used to add a tag to collection
   */
  add(item) {
      this._getCollectionContainer().add(item);
  }

  /**
   * Can be used to remove a tag from collection
   */
  remove(item) {
      this._getCollectionContainer().remove(item);
  }

  /**
   * Can be used to know is tag exists in collection or not
   */
  isExists(item) {
      return this._getCollectionContainer().isExists(item);
  }

  _lovSelectionChanged(e) {
      if (!this.multiSelect) {
          this.splice('values', 0, 1);

          let lovSelectedId = e.detail.item.id;
          if(lovSelectedId == this.selectedId){
            this.set("selectedValue", "");
            this.set("selectedValuesLocale", []);
            this.set('selectedId', "");
          }else{
            this.set("selectedValue", e.detail.item.value);
            this.set("selectedValuesLocale", [e.detail.item.locale]);
            this.set('selectedId', e.detail.item.id);
          }

          this._getCollectionContainer().closePopover();
      } else {
          let itemList = [];
          let selectedValues = DataHelper.cloneObject(this.selectedValues);
          let selectedValuesLocale = this.selectedValuesLocale ? DataHelper.cloneObject(this.selectedValuesLocale) : [];
          if (e.detail.item.length >= 1) {
              itemList = e.detail.item;
          } else {
              itemList.push(e.detail.item);
          }
          for (let i = 0; i < itemList.length; i++) {
              let item = itemList[i];
              if (this._lovSelectedItems.indexOf(item) == -1) {
                  let indexToRemove = -1;
                  this.values.forEach(function (currentElement, index) {
                      if (currentElement.options.referenceDataId === item.id) {
                          indexToRemove = index;
                          return;
                      }
                  });
                  this.splice('values', indexToRemove, 1);

                  indexToRemove = -1;
                  indexToRemove = selectedValues.indexOf(item.value);
                  selectedValues.splice(indexToRemove, 1);

                  indexToRemove = -1;
                  indexToRemove = this.selectedIds.indexOf(item.id);
                  this.splice('selectedIds', indexToRemove, 1);
                  selectedValuesLocale.splice(indexToRemove, 1);
              } else {
                  this.add({
                      "name": item.value,
                      "longName": item.value,
                      "color": "#d2d7dd",
                      "textColor": item.textColor,
                      "options": {
                          "referenceDataId": item.id
                      }
                  });

                  if (selectedValues && selectedValues.indexOf(item.value) == -1) {
                      selectedValues.push(item.value);
                  }

                  if (this.selectedIds && this.selectedIds.indexOf(item.id) == -1) {
                      this.push("selectedIds", item.id);
                      selectedValuesLocale.push(item.locale);
                  }
              }
          }
          if (selectedValues) {
              this.set("selectedValues", selectedValues);
              this.set("selectedValuesLocale", selectedValuesLocale);
          }
      };
      this.dispatchEvent(new CustomEvent('selection-changed', { bubbles: true, composed: true }));
  }

  _tagItemRemoved(e, detail) {
      if (!this.multiSelect) {
          this._lovSelectedItem = {};
          this.selectedValue = "";
          this.selectedId = "";
      } else {
          let indexToRemove = -1;
          this._lovSelectedItems.forEach(function (currentElement, index) {
              if (currentElement.id === detail.options.referenceDataId) {
                  indexToRemove = index;
                  return;
              }
          });
          this.splice('_lovSelectedItems', indexToRemove, 1);

          indexToRemove = -1;
          indexToRemove = this.selectedValues.indexOf(detail.name);
          this.splice('selectedValues', indexToRemove, 1);

          indexToRemove = -1;
          indexToRemove = this.selectedIds.indexOf(detail.options.referenceDataId);
          this.splice('selectedIds', indexToRemove, 1);
      }

      this.isRemoveTriggered = true;
      this.dispatchEvent(new CustomEvent('tag-removed', { bubbles: true, composed: true }));
  }

  _onTapShowMore() {
      this.isShowMoreTriggered = true;
  }

  _onSelectedIdsChange() {
      if (this.multiSelect) {
          if (this.values && this.values.length > 0) {
              this.set("values", []);
          }

          let selectedItems = [];
          let tempSelectedItems = [];

          if (this._lovSelectedItems) {
              selectedItems = DataHelper.cloneObject(this._lovSelectedItems);
              this.set('_lovSelectedItems', []);
          }
          if (this.selectedValues && this.selectedValues[0] != ConstantHelper.NULL_VALUE) {
              for (let i = 0; i < this.selectedValues.length; i++) {
                  // Assumption: Values and Ids are in Seq.
                  let selectedItem = !_.isEmpty(selectedItems) ? selectedItems.find(obj => obj.id === this.selectedIds[i]) : undefined;
                  let color = this.selectedValuesColor;
                  let fontStyle = this.selectedValuesFontStyle;

                  if (!_.isEmpty(selectedItem)) {
                      color = selectedItem.textColor;
                      fontStyle = selectedItem.fontStyle;
                  }

                  this.add({
                      "name": this.selectedValues[i],
                      "longName": this.selectedValues[i],
                      "color": "#d2d7dd",
                      "textColor": color,
                      "fontStyle": fontStyle,
                      "options": {
                          "referenceDataId": this.selectedIds[i]
                      }
                  });

                  tempSelectedItems.push({
                      "id": this.selectedIds[i],
                      "title": this.selectedValues[i],
                      "textColor": color,
                      "fontStyle": fontStyle,
                  });

              }
          }

          this._lovSelectedItems = [];
          this._lovSelectedItems = tempSelectedItems;
      }
  }

  _onSelectedIdChange() {
      if (!this.multiSelect) {
          if (this.values && this.values.length > 0) {
              this.set("values", []);
          }

          let selectedItem = undefined;

          if (this._lovSelectedItem) {
              selectedItem = DataHelper.cloneObject(this._lovSelectedItem);
              this.set('_lovSelectedItem', {});
          }
          if (this.selectedValue && this.selectedValue != ConstantHelper.NULL_VALUE) {
              let color = this.selectedValuesColor;;
              let fontStyle = this.selectedValuesFontStyle;;
              
              if (!_.isEmpty(selectedItem)) {
                  color = selectedItem.textColor;
                  fontStyle = selectedItem.fontStyle;
              }

              this.add({
                  "name": this.selectedValue,
                  "longName": this.selectedValue,
                  "color": "#d2d7dd",
                  "textColor": color,
                  "fontStyle": fontStyle,
                  "options": {
                      "referenceDataId": this.selectedId
                  }
              });

              if (this.selectedId) {
                  this.set('_lovSelectedItem', {
                      "id": this.selectedId,
                      "title": this.selectedValue,
                      "textColor": color,
                      "fontStyle": fontStyle,
                  });
              }
          }
      }
  }

  /**
   * <b><i>Content development is under progress... </b></i> 
   */
  refreshData() {
      this.pebbleLov.refreshData();
  }

  clear() {
      this._clearValues();
  }

  _onCollectionContainerOpen() {
      this.isPopoverOpened = true;
      
      this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(500), () => {
          if (this.selectedId && this.selectedValue && this._lovSelectedItem == null) {
              this._lovSelectedItem = {
                  "id": this.selectedId,
                  "title": this.selectedValue
              };
          }
          let pebbleLov = this.shadowRoot.querySelector("pebble-lov");
          if (pebbleLov) {
              if (pebbleLov.items.length == 0) {
                  pebbleLov.refreshData();
              }
              pebbleLov.refereshTemplate();
          }
      });
  }

  _onCollectionContainerClose() {
      this.pebbleLov.items = [];
      this.isPopoverOpened = false;
  }

  _clearValues() {
      if (this.values && this.values.length > 0) {
          this.values = [];
      }
      this._lovSelectedItems = [];
  }

  _selectedValueStyleChange() {
      /**
      * Most dirty way to change text styles of tags but no other alternative when it comes to nested child.
      * In case of nested when mode is changed, text styles changing rapidly but due to some lag in adding tags
      * latest styles are not being reflected on tags.
      * There will not be many tags for any given attribute in most of the cases. resetting ids which in turn 
      * remove and add tags with latest styles.
      * */
      if(!_.isEmpty(this.values)) {
          if(!_.isEmpty(this._lovSelectedItem)) {
              this._lovSelectedItem.textColor = this.selectedValuesColor;
              this._lovSelectedItem.fontStyle = this.selectedValuesFontStyle;
          }
          if(!_.isEmpty(this._lovSelectedItems)) {
              this._lovSelectedItems.forEach((item)=> {
                  item.textColor = this.selectedValuesColor;
                  item.fontStyle = this.selectedValuesFontStyle;
              }, this);
          }
          this._onSelectedIdChange();
          this._onSelectedIdsChange();
      }
  }
}
customElements.define(PebbleComboBox.is, PebbleComboBox);
