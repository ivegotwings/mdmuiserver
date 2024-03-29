/**
`<pebble-textbox-collection>` Represents an element which contains tags with "add" and "edit" options.

### Example

    <pebble-textbox-collection label='Hashtags' values='[{"value":"color"}, {"value":"size"}]'></pebble-textbox-collection>

### Styling
The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--text-collection-manage-tag-container` | Mixin applied to manage tag container | {}
`--add-update-message` | Mixin applied to tag add/update message | {}
`--add-icon-fill-color` | The color property for icon under tag manage container | `green`
`--text-collection-container` | Mixin applied to component | {}
`--line-with-icon` | Mixing for a line and dropdown icon section | {}
`--line-with-icon-readonly` | Mixing for a line and dropdown icon section when readonly | {}
`--text-collection-label` | Mixin applied to component label | {}
`--tags-container` | Mixin applied to tags container | {}
`--tag-value` | Mixin applied to tag value | {}
`--tag-close-icon` | Mixin applied to tag close | {}
`--text-collection-popover` | Mixin applied to tags collection popover | {}
`--dropdown-icon` | Mixin applied to dropdown icon | {}

@group rock Elements
@element pebble-textbox-collection
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-textbox/pebble-textbox.js';
import './pebble-collection-container.js';
import { IronA11yKeysBehavior } from '@polymer/iron-a11y-keys-behavior/iron-a11y-keys-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleTextboxCollection extends
    mixinBehaviors([RUFBehaviors.UIBehavior], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common">
            pebble-icon {
                cursor: pointer;
            }

            .tag-container {
                padding: 0 10px 0 10px;
                width: 100%;
                height: 60px;
                @apply --text-collection-manage-tag-container;
            }

            .message {
                color: var(--palette-pinkish-red, #ee204c);
                @apply --add-update-message;
            }

            pebble-icon {
                --pebble-icon: {
                    vertical-align: top;
                    color: var(--palette-tree-green, #09c021) !important;
                }
            }
        </style>

        <bedrock-pubsub event-name="on-tap-tag-collection" handler="_onTapTag"></bedrock-pubsub>
        <bedrock-pubsub event-name="on-tap-remove-collection" handler="_onTagRemove"></bedrock-pubsub>
        <bedrock-pubsub event-name="on-tap-show-more" handler="_onTapShowMore"></bedrock-pubsub>
        <bedrock-pubsub event-name="on-popover-close" handler="_onPopoverClose"></bedrock-pubsub>
        <bedrock-pubsub event-name="on-popover-open" handler="_onPopoverOpen"></bedrock-pubsub>
        <pebble-collection-container values="{{_tags}}" is-readonly="[[isReadonly]]" display-limit="[[displayLimit]]" label="[[label]]" description-object="[[descriptionObject]]" no-label-float="[[noLabelFloat]]" on-tap="_onCollectionContainerTap" no-popover="[[noPopover]]" show-seperator="[[showSeperator]]" seperator="[[seperator]]">
            <div class="tag-container">
                <pebble-textbox id="txtInputTag" label="[[_getLabel(_isEdit)]]" value="{{_tagInputText}}" on-keyup="_onEnter" on-keydown="_onKeyDown" no-label-float="[[noLabelFloat]]" show-error="" validation-errors="{{_validationErrors}}" allowed-pattern="[[allowedPattern]]" disabled="[[disabled]]" on-paste="_onPaste">
                    <pebble-icon icon="[[_getIcon(_isEdit)]]" slot="suffix" on-tap="_onTapIcon"></pebble-icon>
                </pebble-textbox>
            </div>
        </pebble-collection-container>
`;
  }

  static get is() {
      return "pebble-textbox-collection";
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

          /**
           * Indicates the tag items.
           */
          _tags: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          /**
           * Indicates the label for the textbox collection.
           */
          label: {
              type: String,
              value: null
          },

          /**
           * Specifies whether or the control is "read-only".
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

          _tagInputText: {
              type: String,
              value: '',
              observer: '_onTagInputTextChange'
          },

          textCollectionInput: {
              type: String,
              notify: true,
              observer: '_onTextCollectionInputChange'
          },

          _currentEditTag: {
              type: Object,
              value: function () { return {}; }
          },

          _isEdit: {
              type: Boolean,
              value: false
          },

          _validationErrors: {
              type: Array,
              value: function () { return []; },
              notify: true
          },

          isPopoverOpened: {
              type: Boolean,
              value: false
          },

          isRemoveTriggered: {
              type: Boolean,
              value: false
          },

          isShowMoreTriggered: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates whether to disable the floating label or not.
           * Set the value as <b>true</b> to disable the floating label.
           */
          noLabelFloat: {
              type: Boolean,
              value: false
          },

          noPopover: {
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

          textboxLabel: {
              type: String,
              value: "Enter more values here to add"
          },

          showSeperator: {
              type: Boolean,
              value: false
          },

          seperator: {
              type: String,
              value: null
          },

          allowedPattern: {
              type: String
          },

          selectedValuesColor: {
              type: String,
              value: ""
          },

          selectedValuesFontStyle: {
              type: String,
              value: ""
          },

          disabled: {
              type: Boolean,
              value: false
          },

          maxAllowedValuesForSearch:{
              type: Number                        
          }
      };
  }

  static get observers() {
      return [
          '_onValuesChange(values)',
          '_selectedValueStyleChange(selectedValuesColor, selectedValuesFontStyle)'
      ];
  }

  constructor() {
      super();
  }

  connectedCallback() {
      super.connectedCallback();

      this._txtInputTag = this.shadowRoot.querySelector('#txtInputTag');
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

  /**
   * Can be used to add the tag to the collection.
   */
  add(item) {
      this._getCollectionContainer().add(item);
  }

  /**
   * Can be used to remove the tag from the collection.
   */
  remove(item) {
      this._getCollectionContainer().remove(item);
  }

  /**
   * Can be used to know whether or not tag exists.
   */
  isExists(item) {
      return this._getCollectionContainer().isExists(item);
  }

  //On values change, apply to tags
  _onValuesChange() {
      let _tags = [];

      if (this.values && this.values[0]!== ConstantHelper.NULL_VALUE) {
          for (let i = 0; i < this.values.length; i++) {
              let item = { "name": this.values[i], "longName": this.values[i], "color": "#d2d7dd", "isChildTag": true };
              _tags.push(item);
          }

          this._tags = _tags;
      } else {
          this._tags = [];
      }
  }

  _getCollectionContainer() {
      return ElementHelper.getElement(this, "pebble-collection-container");
  }

  _onCollectionContainerTap() {
      //Async used because this functionality should execute after closing the existing popover
      microTask.run(() => {
          if (this.isReadonly || this.isRemoveTriggered || this.isShowMoreTriggered) {
              this.isRemoveTriggered = false;
              this.isShowMoreTriggered = false;
              return;
          }

          this._isEdit = false;

          let collectionContainer = this._getCollectionContainer();
          if (collectionContainer && !this.isPopoverOpened) {
              collectionContainer.openPopover();
          }
      });
  }

  _onTapTag(e, detail, sender) {
      if (this.isReadonly) {
          return;
      }

      this._isEdit = true;
      this._currentEditTag = { "item": this._tags[detail.index], "index": detail.index };
      this._tagInputText = this._tags[detail.index].name;

      microTask.run(() => {
          this._getCollectionContainer().openPopover();
      });
  }

  _onTapShowMore() {
      this.isShowMoreTriggered = true;
  }

  _getLabel() {
      if (this._isEdit) {
          return "Update tag";
      }

      return this.textboxLabel;
  }

  _getIcon() {
      if (this._isEdit) {
          return "save";
      }

      return "pebble-icon:action-add-fill";
  }

  _onTapIcon() {

      let _tagInputText = this._tagInputText ? this._tagInputText.trim() : this._tagInputText;

      if (!_tagInputText) {
          this._raiseError('Required');
          return;
      }

      if (!this._isEdit) {
          if (this._validateInputData(_tagInputText)) {
              return;
          }

          this._notifyValues();

          this._reset();
      }
      else if (this._isEdit) {
          if (!this.isExists(this._currentEditTag.item)) {
              return;
          }
          //If updated input is already exists
          for (let i = 0; i < this._tags.length; i++) {
              if (i != this._currentEditTag.index && this._tags[i].name.toLowerCase() == _tagInputText.toLowerCase()) {
                  this._raiseError('Already exists');
                  return;
              }
          }

          this.set('_tags.' + this._currentEditTag.index + '.name', _tagInputText);
          this.set('_tags.' + this._currentEditTag.index + '.longName', _tagInputText);

          //Update to values here
          this.set('values.' + this._currentEditTag.index, _tagInputText);
          this._notifyValues();

          this._getCollectionContainer().closePopover();
      }
  }

  _onTagRemove(e, detail, sender) {
      if (this.values[detail.index]) {
          this.splice('values', detail.index, 1);
          this._notifyValues();
      }

      this.isRemoveTriggered = true;
  }

  _notifyValues() {
      let _values = this.values;
      this.values = [];
      this.values = _values;
  }

  _raiseError(message) {
      this._validationErrors = [];
      this.push('_validationErrors', message);

      let _validationErrors = this._validationErrors;
      this._validationErrors = [];
      this._validationErrors = _validationErrors;
  }

  _onEnter(e) {
      if (this._isEventKey(e, "enter")) {
          this._onTapIcon();
      }
  }

  _onKeyDown(e) {
      let collectionContainer = this._getCollectionContainer();
      if (this._isEventKey(e, "tab") && collectionContainer) {
          collectionContainer.closePopover();
      }
  }

  _isEventKey(e, k) {
      return IronA11yKeysBehavior.keyboardEventMatchesKeys(e, k.toString());
  }

  _reset() {
      this._tagInputText = '';
      this._validationErrors = [];
      this._isEdit = false;
      this._currentEditTag = {};
  }

  _onPopoverClose() {
      this.isPopoverOpened = false;
      this._reset();
  }

  _onPopoverOpen() {
      this.isPopoverOpened = true;
      this._txtInputTag.focus();
  }

  _onTagInputTextChange() {
      if (this._tagInputText) {
          this.textCollectionInput = this._tagInputText.trim();
          return;
      }

      this.textCollectionInput = this._tagInputText;
  }

  _onTextCollectionInputChange(value) {
      this._tagInputText = value;
  }

  _selectedValueStyleChange() {
      for (let i = 0; i < this._tags.length; i++) {
          this._tags[i].textColor = this.selectedValuesColor;
          this._tags[i].fontStyle = this.selectedValuesFontStyle;
      }
  }

  /* Formating the pasted query */
  _onPaste(e) {
      let pastedQuery = "";
      let formattedQuery = "";

      if (e.preventDefault) e.preventDefault();

      if (e.clipboardData) {
          pastedQuery = e.clipboardData.getData('text/plain');
      } else if (window.clipboardData) { //IE
          pastedQuery = window.clipboardData.getData("text");
      }
      
      //Preventing the search for pasted long queries 
      let pastedQueryLength = DataHelper.getPastedQueryLength(pastedQuery);
      if(this.maxAllowedValuesForSearch && pastedQueryLength > this.maxAllowedValuesForSearch){
          this.showErrorToast("More than " + this.maxAllowedValuesForSearch +" values are not supported for search.");
          return;
      }

      formattedQuery = DataHelper.getFormatedSearchQuery(pastedQuery);

      if (!_.isEmpty(this.allowedPattern)) {
          let pattern;
          if (this.allowedPattern == "[0-9.]") {    // added for numeric and decimal only
              pattern = /^[0-9.]*$/;
          }

          if (pattern) {
              let seperator = " " + this.seperator + " ";
              if (formattedQuery.indexOf(seperator) != -1) {  // copied multiple values
                  let queryValues = formattedQuery.split(seperator);
                  if (queryValues && queryValues.length) {
                      for (let i = 0; i < queryValues.length; i++) {
                          let queryItem = queryValues[i].substr(1).slice(0, -1);
                          if (pattern.test(queryItem)) {
                              continue;
                          } else {
                              this._tagInputText = " ";
                              this._raiseError('Only numeric values allowed');
                              return;
                          }
                      }
                  }
              } else {
                  if (!pattern.test(formattedQuery.trim())) {      // copied only one value
                      this._tagInputText = " ";
                      this._raiseError('Only numeric values allowed');
                      return;
                  }
              }
          } else {
              this._tagInputText = " ";
              this._raiseError('Does not match pattern');
              return;
          }
      }

      if (DataHelper.isTextSelected(this.$.txtInputTag)) {
          // What if user select spaces and there are multiple spaces?
          this._tagInputText = this._tagInputText.replace(DataHelper.getSelectedText(this.$.txtInputTag), formattedQuery);
      } else {
          if (_.isEmpty(this.$.txtInputTag.selectionStart)) {
              this.$.txtInputTag.selectionStart = 0;
          }
          this._tagInputText = DataHelper.replaceAt(this._tagInputText, this.$.txtInputTag.selectionStart, formattedQuery);
      }
  }

  _validateInputData(_tagInputText) {
      if (!_tagInputText) {
          return;
      }

      let seperator = " " + this.seperator + " ";
      let inputItems = _tagInputText.split(seperator);
      if (inputItems.length == 1) {    // keyboard entry and single copied entry
          let item = { "name": _tagInputText };
          if (this.isExists(item)) {
              this._raiseError('Already exists');
              return true;
          }
          this.add(item);

          //Add to values
          this.push('values', item.name);
      } else if (inputItems.length > 1) {  // multiple entires Copied & Pasted                            
          let isItemFound = false;
          let filteredItems = [];
          for (let i = 0; i < inputItems.length; i++) {
              // extract the individual items by removing first and last quotes
              let itemValue = inputItems[i].substr(1).slice(0, -1);
              let item = { "name": itemValue };

              // verify if item already present in the existing entry
              if (this.isExists(item)) {
                  isItemFound = true;
                  break;
              } else {
                  filteredItems.push(item);
              }
          }
          if (isItemFound) {
              this._raiseError('Already exists');
              return true;
          } else {
              if (filteredItems && filteredItems.length) {
                  filteredItems.forEach(function (item) {
                      this.add(item);

                      //Add to values
                      this.push('values', item.name);
                  }, this);
              }
          }
      }
      return false;
  }
}

customElements.define(PebbleTextboxCollection.is, PebbleTextboxCollection);
