/**
`rock-search-filter` Represents an element that contains the "search bar" and filter tags. 
The users can switch between a search mode and a filter mode to get the query they want to search.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import { microTask, timeOut } from '@polymer/polymer/lib/utils/async.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@polymer/paper-item/paper-item.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-app-context-behavior/bedrock-app-context-behavior.js';
import '../bedrock-helpers/constant-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-text-alignment.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-button/pebble-button.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-tags/pebble-tags.js';
import '../pebble-textbox/pebble-textbox.js';
import '../pebble-textbox-collection/pebble-textbox-collection.js';
import '../pebble-textarea/pebble-textarea.js';
import '../pebble-boolean/pebble-boolean.js';
import '../pebble-datetime-picker/pebble-datetime-picker-overlay.js';
import '../rock-entity-lov/rock-entity-lov.js';
import '../rock-search-bar/rock-search-bar.js';
import '../rock-attribute-model-lov/rock-attribute-model-lov.js';
import '../rock-path-selector/rock-path-selector.js';
import { flush } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockSearchFilter
  extends mixinBehaviors([
    RUFBehaviors.UIBehavior,
    RUFBehaviors.AppContextBehavior
  ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
    <style include="bedrock-style-common bedrock-style-padding-margin bedrock-style-text-alignment">
      :host{
        --pebble-lov:{
          padding:0px;
        }
      }
      pebble-tags {
        --tag-color: var(--top-header-background);
        --actions-icon-button: {
          height: var(--tag-icon-size);
          width: var(--tag-icon-size);
          padding-top: 0px;
          padding-right: 0px;
          padding-bottom: 0px;
          padding-left: 0px;
        }
      }
      .tagContainer {
        min-width: 0px;
      }

      pebble-textarea {
        --autogrowtextarea: {
          max-height: 200px;
        }
      }
      pebble-textarea .floated-label-placeholder {
        line-height: 0;
      }
      pebble-popover {
        --pebble-popover-max-width: 100%;
        --pebble-popover-width: 260px;
        --popover:{
          padding-left:20px;
          padding-right:20px;
          padding-top:20px;
          padding-bottom:20px;
        }
      }
      paper-radio-button {
        padding-top: 0;
        padding-bottom: 0;
        padding-left:0px;
        padding-right:0px;
        display: block;
        --paper-radio-button-unchecked-color: var(--radio-button-border, #026bc3);
        --paper-radio-button-checked-color: var(--radio-button-selected, #026bc3);
        --paper-radio-button-label:{
          width:calc(100% - 16px);
        }
      }
      pebble-textbox-collection {
        --tags-container: {
          min-height: 0px;
          margin-right: 0;
        }
        --text-collection-container: {
          min-height: 0px;
          margin-top: 0px;
        }
        --text-collection-manage-tag-container:{
          padding:0px;
        }
      }
      pebble-tags {
        --tag-item-container: {
          height: 26px;
          line-height: 24px;
        }
        --tag-name: {
          max-width: calc(100% - 20px);
        }
      }
      pebble-toggle-button {        
        --pebble-toggle-button-checked-bar-color: var(--success-color, #4caf50);
        --pebble-toggle-button-checked-button-color: var(--success-color, #4caf50);
        --pebble-toggle-button-checked-ink-color: var(--success-color, #4caf50);
        
      }
      .radiobuttons{
        float: left;
        width: 50%;
        padding-right:5px;
      }
      .radiobuttons:last-child{
        padding-right:0px;
        padding-left:5px;
      }
      .radiobutton-container{
        display: flex;
        width: calc(100% - 10px);
      }
      .non-searchmode-container{
        min-width: 0px;
        display: flex;
      }
      .full-width{
        width:100%;
      }
    </style>
    <template is="dom-if" if="{{!searchMode}}">
      <div class="non-searchmode-container">
        <template is="dom-if" if="{{!hideSearchTrigger}}">
          <pebble-button icon="search" class="button" on-tap="toggleMode" raised=""></pebble-button>
        </template>
        <!-- <template is="dom-if" if="[[showReferenceFilter]]"> -->
        <pebble-button id="filterButton" icon="{{icon}}" button-text="{{text}}" dropdown-icon="" noink="" class="dropdownText dropdownIcon btn dropdown-primary dropdown-trigger" on-tap="_openFilterLov"></pebble-button>
        <template is="dom-if" if="[[_refineFilterPopoverDialog]]">
          <pebble-popover id="refineFilterPopover" for="filterButton" no-overlap="" vertical-align="auto" horizontal-align="auto">
            <rock-attribute-model-lov id="attributeModelLov" mode="[[attributesType]]" context-data="[[contextData]]" no-sub-title="" id-field="name" title-pattern="externalName" type-field="[]" sort-details="[[filtersConfig]]" items="{{_filterAttributes}}" show-nested-child-attributes="[[_showNestedChildAttributes]]" show-nested-attributes="[[_showNestedAttributes]]" is-model-get-initiated="{{showReferenceFilter}}"></rock-attribute-model-lov>
          </pebble-popover>

          <bedrock-pubsub event-name="attribute-model-lov-selection-changed" handler="_onSelectedFilterChange" target-id="attributeModelLov"></bedrock-pubsub>
        </template>
        <!-- </template> -->

        <div class="tagContainer">
          <!--pebble-tags id="filter-entity-type-tag" tags="{{entityTypeTag}}" class="p-l-10 p-r-10">
          </pebble-tags-->
          <pebble-tags id="filter-tags" tags="{{tags}}" show-expand-icon="" show-remove-icon="" class="p-l-10 p-r-10">
          </pebble-tags>
        </div>
        <bedrock-pubsub event-name="on-tap-tag-item" handler="_onTagItemTap"></bedrock-pubsub>
        <bedrock-pubsub event-name="on-attached-tag-item" handler="_onTagItemTap"></bedrock-pubsub>
        <bedrock-pubsub event-name="tag-item-remove" handler="_onTagItemRemove"></bedrock-pubsub>
        <bedrock-pubsub event-name="entity-lov-confirm-button-tap" handler="_onLOVConfirmTap" target-id="rockEntityLov"></bedrock-pubsub>
        <bedrock-pubsub event-name="entity-lov-close-button-tap" handler="_onLOVCloseTap" target-id="rockEntityLov"></bedrock-pubsub>
        <bedrock-pubsub event-name="on-classification-update" handler="_onClassificationUpdate"></bedrock-pubsub>
        
        <!-- Refine popover starts here -->
        <pebble-popover id="filterPopover" for="pebble-tag" no-overlap="" vertical-align="auto" horizontal-align="left">
          <template is="dom-if" if="{{_isAttributeValuesExistsSearchEnabled}}">
            <pebble-toggle-button class="m-b-10" checked="{{currentTag.options.hasValueChecked}}">[[_toggleButtonText]]</pebble-toggle-button>
          </template>
          <template is="dom-if" if="{{_showTagModifier('textbox', _trigger)}}">
            <pebble-textbox-collection id="textCollection" class="full-width" values="{{_tagsCollection}}" max-allowed-values-for-search="[[maxAllowedValuesForSearch]]" no-popover="" textbox-label="Enter values to search" show-seperator="" seperator="or" text-collection-input="{{_tagInput}}" disabled="[[!currentTag.options.hasValueChecked]]"></pebble-textbox-collection>
            <div class="PebbleButtonPadding text-center m-t-15">
              <pebble-button class="btn btn-secondary m-r-5" on-tap="_dismissDialog" raised="" elevation="1" button-text="Close"></pebble-button>
              <pebble-button class="btn btn-success" button-text="Apply" raised="" elevation="1" on-tap="_onTextCollectionUpdate" disabled="{{_disableCollectionUpdate(_tagsCollection, _tagInput)}}"></pebble-button>
            </div>
          </template>
          <template is="dom-if" if="{{_showTagModifier('textArea', _trigger)}}">
            <pebble-textarea class="input" label="Enter text here" value="{{tav}}" disabled="[[!currentTag.options.hasValueChecked]]"></pebble-textarea>
            <div class="PebbleButtonPadding text-center m-t-15">
              <pebble-button class="btn btn-secondary m-r-5" on-tap="_dismissDialog" raised="" elevation="1" button-text="Close"></pebble-button>
              <pebble-button class="btn btn-success" button-text="Apply" raised="" elevation="1" on-tap="_updateValue" disabled="{{_disableTextAreaUpdate(tav)}}"></pebble-button>
            </div>
          </template>
          <template is="dom-if" if="{{_showTagModifier('richtexteditor', _trigger)}}">
            <pebble-textarea class="input" label="Enter text here" value="{{tav}}" disabled="[[!currentTag.options.hasValueChecked]]"></pebble-textarea>
            <div class="PebbleButtonPadding text-center m-t-15">
              <pebble-button class="btn btn-secondary m-r-5" on-tap="_dismissDialog" raised="" elevation="1" button-text="Close"></pebble-button>
              <pebble-button class="btn btn-success" button-text="Apply" raised="" elevation="1" on-tap="_updateValue"></pebble-button>
            </div>
          </template>
          <template is="dom-if" if="{{_showTagModifier('referenceList', _trigger)}}">
            <rock-entity-lov id="rockEntityLov" multi-select="" show-action-buttons="" apply-locale-coalesce="" apply-locale-coalesced-style="" apply-context-coalesced-style="" selected-items="{{_selectedItems}}" disable-selection="[[!currentTag.options.hasValueChecked]]">
            </rock-entity-lov>
          </template>
          <template is="dom-if" if="{{_showTagModifier('boolean', _trigger)}}">
            <pebble-boolean class="text-center" id="booleanDisplay" true-text="[[currentTag.options.trueText]]" false-text="[[currentTag.options.falseText]]" value="{{booleanvalue}}" disabled="[[!currentTag.options.hasValueChecked]]"></pebble-boolean>
            <div class="PebbleButtonPadding text-center m-t-15">
              <pebble-button class="btn btn-secondary m-r-5" on-tap="_dismissDialog" raised="" elevation="1" button-text="Close"></pebble-button>
              <pebble-button class="btn btn-success" button-text="Apply" raised="" elevation="1" on-tap="_updateValue"></pebble-button>
            </div>
          </template>
          <template is="dom-if" if="{{_showTagModifier('numeric', _trigger)}}">
            <paper-radio-group aria-labelledby="{{longName}}" class="dialogOptions" on-paper-radio-group-changed="_onRadioGroupChange">
              <paper-radio-button name="range" disabled="{{!currentTag.options.hasValueChecked}}">
                <div class="radiobutton-container">
                  <div class="radiobuttons">
                    <pebble-textbox label="Min" prevent-invalid-input="" allowed-pattern="[0-9.]" invalid="{{numericMinInvalid}}" show-error="" input-data-type="[[currentTag.options.dataType]]" value="{{gte}}">
                    </pebble-textbox>
                  </div>
                  <div class="radiobuttons">
                    <pebble-textbox label="Max" prevent-invalid-input="" allowed-pattern="[0-9.]" invalid="{{numericMaxInvalid}}" show-error="" input-data-type="[[currentTag.options.dataType]]" value="{{lte}}">
                    </pebble-textbox>
                  </div>
                </div>
              </paper-radio-button>
              <paper-radio-button name="equalToData" disabled="{{!currentTag.options.hasValueChecked}}">
                <div class="radiobutton-container">
                  <pebble-textbox-collection id="textNumericCollection" class="full-width" values="{{_tagsNumericCollection}}" no-popover="" textbox-label="Enter values to search" show-seperator="" seperator="or" allowed-pattern="[0-9.]" text-collection-input="{{_tagNumericInput}}" disabled="[[!currentTag.options.hasValueChecked]]"></pebble-textbox-collection>
                </div>
              </paper-radio-button>
            </paper-radio-group>
            <!-- </template> -->
            <div class="PebbleButtonPadding text-center">
              <pebble-button class="btn btn-secondary m-r-5" on-tap="_dismissDialog" raised="" elevation="1" button-text="Close"></pebble-button>
              <pebble-button class="btn btn-success" button-text="Apply" raised="" elevation="1" on-tap="_updateValue" disabled="{{_updateDisable}}"></pebble-button>
            </div>
          </template>
        </pebble-popover>
        <!-- Already overlay, so out of popover -->
        <template is="dom-if" if="[[_isPathSelector]]">  
            <rock-path-selector id="pathSelector" dialog-title="[[dialogTitle]]" for="pebble-tag" is-search-filter="true" values="{{_classificationValues}}" root-node="[[_rootNode]]" path-entity-type="[[_pathEntityType]]" path-relationship-name="[[_pathRelationshipName]]" multi-select="[[_isMultiSelect()]]" context-data="[[contextData]]" attribute-external-name="[[attributeExternalName]]" path-seperator="[[_pathSeperator]]" disable-child-node="">
              </rock-path-selector>
        </template>
      
        <template is="dom-if" if="[[_rangepicker]]">
          <pebble-datetime-picker-overlay id="rangepicker" for="pebble-tag" picker-type="daterange" heading-format="ddd, MMM DD YYYY" start-date-text="{{displaygte}}" end-date-text="{{displaylte}}" start-date-value="{{gte}}" end-date-value="{{lte}}" on-date-range-selected="_updateValue" has-value-checked="{{currentTag.options.hasValueChecked}}" attribute-values-exists-search-enabled="[[_isAttributeValuesExistsSearchEnabled]]" show-ranges="">
          </pebble-datetime-picker-overlay>
        </template>
        <!-- Refine popover ends here -->
      </div>
    </template>
`;
  }

  static get is() {
    return 'rock-search-filter';
  }
  static get observers() {
    return [
      "_onToggleButtonChange(currentTag.options.hasValueChecked)"
    ]
  }
  static get properties() {
    return {
      tags: {
        type: Array,
        notify: true,
        value: function () {
          return []
        }
      },

      entityTypeTag: {
        type: Array,
        value: function () {
          return []
        }
      },
      /**
       * Indicates the configuration that is used in filters.
       */
      filtersConfig: {
        type: Object,
        value: function () {
          return {};
        }
      },

      /**
       * Specifies whether or not an element is in the search or filter mode.
       */
      searchMode: {
        type: Boolean,
        value: false,
        notify: true
      },
      /**
       * Specifies whether or not the "search bar" triggered button is visible when the search mode is disabled.
       */
      hideSearchTrigger: {
        type: Boolean,
        value: false
      },

      disableChildNode:{
        type: Boolean,
        value: true
      },
      /**
       * Specifies the text for the search filter button.
       */
      text: {
        type: String,
        value: "Refine"
      },
      /**
       * Specifies the icon for the search filter button.
       */
      icon: {
        type: String,
        value: "pebble-icon:filter"
      },
      /**
       *  Indicates the reference to the currently opened tag.
       */
      currentTag: {
        type: Object,
        notify: true
      },

      _trigger: {
        type: String
      },

      _selectedItems: {
        type: Array,
        value: function () {
          return [];
        }
      },
      /**
       * <b><i>Content development is under progress... </b></i> 
       */
      colors: {
        type: Array,
        value: ['red', 'green', 'blue']
      },
      /**
       * <b><i>Content development is under progress... </b></i> 
       */
      contextData: {
        type: Object,
        value: function () {
          return {};
        }
      },
      /**
       * <b><i>Content development is under progress... </b></i> 
       */
      gte: {
        type: String,
        value: function () {
          return "";
        },
        observer: '_isMaxGreaterThanMin'
      },
      /**
       * <b><i>Content development is under progress... </b></i> 
       */
      lte: {
        type: String,
        value: function () {
          return "";
        },
        observer: '_isMaxGreaterThanMin'
      },
      /**
       * <b><i>Content development is under progress... </b></i> 
       */
      equalNum: {
        type: String,
        value: function () {
          return "";
        }
      },
      /**
       * <b><i>Content development is under progress... </b></i> 
       */
      numericMinInvalid: {
        type: Boolean,
        value: false
      },
      /**
       * <b><i>Content development is under progress... </b></i> 
       */
      numericMaxInvalid: {
        type: Boolean,
        value: false
      },
      /**
       * <b><i>Content development is under progress... </b></i> 
       */
      numericEqualInvalid: {
        type: Boolean,
        value: false
      },

      _updateDisable: {
        type: Boolean,
        computed: '_disableUpdate(numericMinInvalid, numericMaxInvalid, _tagsNumericCollection, _tagNumericInput, gte, lte, _isAttributeValuesExistsSearchEnabled)'
      },

      _tagsCollection: {
        type: Array,
        value: function () {
          return [];
        }
      },

      _tagsNumericCollection: {
        type: Array,
        value: function () {
          return [];
        }
      },

      _filterAttributes: {
        type: Array,
        value: function () {
          return [];
        },
        observer: '_onFilterAttributesChange'
      },
      attributesType: {
        type: String,
        value: "self"
      },
      settings: {
        type: Object,
        value: function () {
          return {};
        }
      },
      _showNestedChildAttributes: {
        type: Boolean,
        value: false,
        computed: '_getItemVisibility(settings,"showNestedChildAttributes")'
      },
      _showNestedAttributes: {
        type: Boolean,
        value: true,
        computed: '_getItemVisibility(settings,"showNestedAttributes")'
      },
      _isAttributeValuesExistsSearchEnabled: {
        type: Boolean,
        value: false,
        computed: '_getItemVisibility(settings,"attributeValuesExistsSearchEnabled")'
      },
      _tagNumericInput: {
        type: String,
        value: function () {
          return "";
        }
      },
      _toggleButtonText: {
        type: String,
        value: "Has Value"
      },
      _defaultRadioButtonColor: {
        type: String,
        value: "#026bc3"
      },
      showReferenceFilter: {
        type: Boolean,
        value: false
      },
      _isPathSelector:{
          type:Boolean,
          value: false
      },
      dialogTitle:{
        type:String,
        value: ""
      },
      _classificationValues:{
            type: Array,
            value: function () {
                return [];
            },
        },
        _rootNode:{
          type:Array,
          value:""
        },
        _pathEntityType:{
                    type:String,
                    value:""
        },
        _pathRelationshipName:{
            type:String,
            value:""
        },
        _pathSeperator:{
          type:String,
          value:""
        },
        attributeExternalName:{
          type:String,
          value:""
        }
    }
  }


  /**
   * Indicates the list of string type that holds the tags. 
   * Note that values in this array must be identical and duplicates must be avoided due to the definition of the tags.
   */


  getRefineFilterPopover() {
    this._refineFilterPopover = this._refineFilterPopover || this.shadowRoot.querySelector('#filterPopover');
    return this._refineFilterPopover;
  }
  /**
   * <b><i>Content development is under progress... </b></i> 
   */
  connectedCallback() {
    super.connectedCallback();
    let _computedStyle = getComputedStyle(this);
    if (_computedStyle) {
      let _propertyValue = _computedStyle.getPropertyValue('--focused-line')
      if (_propertyValue) {
        this._defaultRadioButtonColor = _propertyValue;
      }
    }
  }
  removeAllSearchFilters() {
    const filterTags = this.shadowRoot.querySelector("#filter-tags");
    if (filterTags) {
      filterTags.removeAllTags();
    }
    let modelLOV = this.shadowRoot.querySelector('#attributeModelLov');
    if (modelLOV) {
        modelLOV.reset();
        modelLOV.clearSelectedItem();
    }
  }

  /**
   * validate the input for numeric display type and disables the update button
   */
  _disableUpdate(numericMinInvalid, numericMaxInvalid, _tagsNumericCollection, _tagNumericInput, gte, lte, _isAttributeValuesExistsSearchEnabled) {
    if (_isAttributeValuesExistsSearchEnabled) {
      return false;
    }
    if (!_.isEmpty(this.gte + "") || !_.isEmpty(this.lte + "") || !_.isEmpty(_tagsNumericCollection) || _tagNumericInput) {
      const radioGroup = this.shadowRoot.querySelector('paper-radio-group');
      if (radioGroup && radioGroup.selected == "range") {
        return (numericMaxInvalid || numericMinInvalid);
      }

      return _.isEmpty(_tagsNumericCollection) && !_tagNumericInput;
    }

    return true;
  }

  _disableCollectionUpdate(_tagsCollection, input) {
    if (this._isAttributeValuesExistsSearchEnabled) {
      return false;
    }
    return !input && (!_tagsCollection || _tagsCollection.length == 0);
  }

  _disableTextAreaUpdate(tav) {
    if (this._isAttributeValuesExistsSearchEnabled) {
      return false;
    }
    return !tav || !tav.trim();
  }

  /**
   * checks if the min value is less than maximum value in numeric display type popover
   */
  _isMaxGreaterThanMin() {
    if (!_.isEmpty(this.gte + "") && !_.isEmpty(this.lte + "")) {
      if (parseFloat(this.gte) > parseFloat(this.lte)) {
        this.set('numericMaxInvalid', true);
        return;
      }
    }

    this.set('numericMaxInvalid', false);
  }

  /**
   * Updating the entity tags when the user updates the entity selection
   *
  onEntityTypeChange (selectedEntities) {
      var entityTypeTagStr = this._getEntityTypeDisplayValue(selectedEntities);
      var entityTypeTagObj =  this.shadowRoot.querySelector("#filter-entity-type-tag");
      if(entityTypeTagStr) {
        if(this.entityTypeTag.length > 0){
          entityTypeTagObj.set('tags.0.longName', entityTypeTagStr);
        } else {
          this.addEntityTypeTag(selectedEntities);
        }
      } else {
        this.entityTypeTag = [];
      }
  },

  /**
   * Displaying the selected entity types as tags
   *
  addEntityTypeTag (selectedEntities) {
      if(selectedEntities.length > 0) {
        this.entityTypeTag = [];
        var entityTypeTagStr = this._getEntityTypeDisplayValue(selectedEntities); 
        this.entityTypeTag["longName"] = entityTypeTagStr;
        this.shadowRoot.querySelector("#filter-entity-type-tag").addTag(this.entityTypeTag); 
      }
  },

  /**
   *  Formating the selected entity tag
   *
  _getEntityTypeDisplayValue (entityTypeList) {
    var tempArray = [];
    //Capitalizing the first character of the list
    if(entityTypeList.length > 0) {
      for(var i = 0 ; i < entityTypeList.length ; i++){
        tempArray[i] = entityTypeList[i].charAt(0).toUpperCase()+ entityTypeList[i].substr(1);
      }
      return "Entity Types: " + tempArray.join(",");
    }

  }*/

  /**
   * Can be used add a filter tag on selecting it from the dropdown.
   */
  _onSelectedFilterChange(e, detail) {
    //Reseting the selected values of the attribute
    this._selectedItems = [];
    let data = detail.data;
    let tag = {};
    if (data && data.displayType && data.displayType.toLowerCase() == "referencelist") {
      data.selectedItems = this._selectedItems; //reset 
    }
    if (data.displayType == "boolean" && !this._isAttributeValuesExistsSearchEnabled) {
      tag["value"] = (data.value && !_.isEmpty(data.value)) ? data.value : {
        "eq": data.trueText
      };
    } else {
      tag["value"] = (data.value && !_.isEmpty(data.value)) ? data.value : {
        "eq": "All"
      };
    }
    tag["displayParams"] = (data.displayParams && !_.isEmpty(data.displayParams)) ? data.displayParams : [
      "eq"
    ];
    let dataType = data.dataType;
    let displayType = data.displayType;

    if (displayType == "textCollection" || displayType == "image") {
      displayType = "textbox";
    }

    // For now, we are not showing LOV for textbox attributes,
    // as system does not know how to return distinct / unique values for given attribute in given search scope.
    // We fix would show textbox only to type freeflow data till we fix the api / get new api
    // if(displayType.toLowerCase() == "textbox") {
    //   displayType = "referenceList";
    // }

    if (displayType.toLowerCase() == "date") {
      this.displaygte = null;
      this.displaylte = null;
      displayType = "datetime";
    }

    if (dataType.toLowerCase() == "integer" || dataType.toLowerCase() == "decimal") {
      displayType = "numeric";
    }

    tag.value["type"] = ConstantHelper.getDataTypeConstant(dataType);

    tag.options = data;
    tag.options.displayType = displayType;
    tag["longName"] = data.attributeExternalNamePath ? data.attributeExternalNamePath : data.externalName;
    tag["name"] = data.name;
    tag.options.hasValueChecked = true;
    let filterTags = this.shadowRoot.querySelector("#filter-tags")
    let isTagExist = filterTags.checkTagExist(tag);
    if(isTagExist){
      this._onTagItemTap(e,tag);
    }else{
      filterTags.addTag(tag);
    }
    
    this._fireAddEvent(data.name);
    let refineFilterPopover = this.shadowRoot.querySelector('#refineFilterPopover');
    if (refineFilterPopover) {
      refineFilterPopover.close();
    }
  }
  /**
   *  Can be used to toggle between the search and filter mode.
   */
  toggleMode(e) {
    this.searchMode = !this.searchMode;
  }

  

  _prepareRequestData(contextData) {
    return DataRequestHelper.createEntityGetRequest(contextData, true);
  }

  // On tag tap should select the specific element 
  _onTagItemTap(e, detail) {
    //To avoid textcollection tag item tap
    if (!detail || !detail.options) {
      return;
    }
    this.currentTag = detail;
    let showTagPopover = true;

    if (detail && detail.options && detail.options.noPopoverOnAttach) {
      if (e.type.indexOf("on-tap-tag-item") == -1) {
        showTagPopover = false; //set only on attach
      }
      delete detail.options.noPopoverOnAttach; //delete, as it is only on attach
    }

    if (!this.currentTag || !this.currentTag.options) return;

    if (DataHelper.isValidObjectPath(this.currentTag, "value.hasvalue")) {
      this.currentTag.options.hasValueChecked = this.currentTag.value.hasvalue ? true : false;
    }
    //Remove the special characters like * and () in the currentTag value to display only plain text on UI
    if(this.currentTag.value && this.currentTag.value.eq){
      this.currentTag.value.eq = this.currentTag.value.eq.replace(/[()*]+/g, '');
    }
   
    const positionTarget = this.shadowRoot.querySelector('#filter-tags').shadowRoot.querySelector("#tag" + detail.index);
    let displayType = this.currentTag.options.displayType.toLowerCase();
    if (displayType == "path") {
          this._isPathSelector = true;
          this._classificationValues = [];
          this.attributeExternalName =  this.currentTag.options.externalName
          if (this.currentTag.options.pathEntityInfo) {
            let pathEntityInfo = this.currentTag.options.pathEntityInfo[0];
            if (!_.isEmpty(pathEntityInfo)) {
                if (pathEntityInfo.rootNode) {
                  this._rootNode = pathEntityInfo.rootNode;
                }
                if (pathEntityInfo.pathSeperator) {
                  this._pathSeperator = pathEntityInfo.pathSeperator;
                }else{
                  this._pathSeperator = this.appSetting('dataDefaults').categoryPathSeparator;
                }
                
                if (pathEntityInfo.pathEntityType) {
                  this._pathEntityType = pathEntityInfo.pathEntityType;
                }
                if (pathEntityInfo.pathRelationshipName) {
                  this._pathRelationshipName = pathEntityInfo.pathRelationshipName;
                }
              }
          }
          if (this.currentTag.value.exacts && this.currentTag.value.exacts != 'All') {
            this._classificationValues = DataHelper.cloneObject(this.currentTag.value.exacts);
          } else if (this.currentTag.value.exact && this.currentTag.value.exact != 'All') {
            this._classificationValues = [DataHelper.cloneObject(this.currentTag.value.exact)];
          } else if (this.currentTag.value.eq &&
            this.currentTag.value.pathCollection &&
            this.currentTag.value.eq != 'All') {
            this._classificationValues = DataHelper.cloneObject(this.currentTag.value.pathCollection);
          }

          microTask.run(() => {
            let pathSelector = this.shadowRoot.querySelector("#pathSelector");
            if(pathSelector){
              this.dialogTitle = this._pathSeperator ? "Refine By "+ this._pathSeperator + " " + this.currentTag.options.externalName : "Refine By >> "+ this.currentTag.options.externalName;
              if(showTagPopover) {
                pathSelector.classificationDialogOpen();
              }
            }
          })

         }else if (this.currentTag && (displayType == "datetime" || displayType == "date")) {
      this._rangepicker = true;
      flush();

      let rangePicker = this.shadowRoot.querySelector('#rangepicker');

      //Display range picker based on the currerntTag
      if (this.currentTag.value.eq != 'All') {
        if (this.currentTag.value.eq) {
          rangePicker.startDateValue = this.currentTag.value.eq;
          rangePicker.endDateValue = this.currentTag.value.eq;
        } else {
          rangePicker.startDateValue = this.currentTag.value.gte;
          rangePicker.endDateValue = this.currentTag.value.lte;
        }

        let _date = new Date(rangePicker.startDateValue);
        if(!_.isEmpty(rangePicker.startDateValue) && !_.isEmpty(rangePicker.endDateValue) && rangePicker.startDateValue != rangePicker.endDateValue) {              
          rangePicker.setStartDate(_date); 
          rangePicker.setEndDate(new Date(rangePicker.endDateValue)); 
          rangePicker.setRangeType("range");
        } else {
          rangePicker.setDate(_date);               
          rangePicker.setStartDate(_date); 
          rangePicker.setRangeType(null);              
          }
        } else {
          rangePicker.startDateValue = "";
          rangePicker.endDateValue = "";
          rangePicker.setDate(new Date());
          rangePicker.setRangeType(null);
        }         

      microTask.run(() => {
        rangePicker.positionTarget = positionTarget;
        rangePicker.noOverlap = true;
        if (showTagPopover) {
          rangePicker.show(true);          
        }
      });
    } else {
      this._trigger = Date.parse(new Date().toString()); //Just used to trigger popover element

      //Delayed to open the popover, because want to close the existing popover
      microTask.run(() => {
        let filterPopover = this.getRefineFilterPopover();

        filterPopover.positionTarget = positionTarget;
        if (showTagPopover) {
          filterPopover.show(true);
        }

        //Set values to the components
        let tagDisplayType = this.currentTag.options.displayType.toLowerCase();
        // textbox is a collection in filters
        if (tagDisplayType == "textbox") {
          let filterInput = filterPopover.querySelector('#textCollection');
          this._clearCollectionInput(filterPopover, '#textCollection', '#txtInputTag');

          if (!filterInput) {
            return;
          }

          filterInput.values = [];
          filterInput.textCollectionInput = "";
          if (this.currentTag.value.exacts && this.currentTag.value.exacts != 'All') {
            filterInput.values = DataHelper.cloneObject(this.currentTag.value.exacts);
          } else if (this.currentTag.value.exact && this.currentTag.value.exact != 'All') {
            filterInput.values = [DataHelper.cloneObject(this.currentTag.value.exact)];
          } else if (this.currentTag.value.contains && this.currentTag.value.contains != 'All') {
            filterInput.values = [DataHelper.cloneObject(this.currentTag.value.contains)];          
          } else if (this.currentTag.value.eq && this.currentTag.value.eq != 'All') {
            if(this.currentTag.value.operator){
              filterInput.values = this.currentTag.value.eq.split('|');
            } else {
              filterInput.values = [DataHelper.cloneObject(this.currentTag.value.eq)];
            }
          }
        

          setTimeout(() => {
            let collectionInput = filterInput.shadowRoot.querySelector("#txtInputTag");
            if (collectionInput) {
              collectionInput.focus();
            }
          }, 10); //Delayed to set the value and focus the input
        } else if (tagDisplayType == "richtexteditor" || tagDisplayType == "textarea") {
          let filterInput = filterPopover.querySelector('.input');
          if (filterInput) {

            filterInput.value = '';

            if (this.currentTag.value.exact && this.currentTag.value.exact != 'All') {
              filterInput.value = this.currentTag.value.exact;
            } else if (this.currentTag.value.contains && this.currentTag.value.contains != 'All') {
              filterInput.value = this.currentTag.value.contains;
            } else if (this.currentTag.value.eq && this.currentTag.value.eq != 'All') {
              filterInput.value = this.currentTag.value.eq;
            } 

            setTimeout(() => {
              filterInput.focus();
            }, 10); //Delayed to set the value and focus the input
          }
        } else if (tagDisplayType == "numeric") {
          this.gte = this.lte = "";
          this._tagsNumericCollection = [];
          this._tagNumericInput = "";
          this._clearCollectionInput(filterPopover, '#textNumericCollection', '#txtInputTag');

          if (this.currentTag.value.contains && this.currentTag.value.contains.length > 0 && this.currentTag.value.contains != 'All') {
            filterPopover.querySelector('paper-radio-group').selected = 'equalToData';
            this._tagsNumericCollection = this.currentTag.value.contains.split(" ");
          } else if (this.currentTag.value.exacts && this.currentTag.value.exacts != 'All'){           
              if(this.currentTag.value.exacts instanceof Array) {
                this._tagsNumericCollection = this.currentTag.value.exacts;
              } else {
                this._tagsNumericCollection = [this.currentTag.value.exacts];
              }   
          } else {
            if (filterPopover.querySelector('paper-radio-group')) {
              if (this.currentTag.value && (this.currentTag.value.lte || this.currentTag.value.gte)) {
                filterPopover.querySelector('paper-radio-group').selected = 'range';
              } else {
                filterPopover.querySelector('paper-radio-group').selected = 'equalToData';
              }
            }
            this.gte = this.currentTag.value.gte || "";
            this.lte = this.currentTag.value.lte || "";
            if(!_.isEmpty(this.currentTag.value.eq) && this.currentTag.value.eq != 'All'){ 
              if(this.currentTag.value.eq instanceof Array) {
               this._tagsNumericCollection = this.currentTag.value.eq; 
              } else {
               this._tagsNumericCollection = [this.currentTag.value.eq]; 
              }
            }  
          }
        } else if (tagDisplayType == "referencelist") {
          //Set Id, Title and Value to the LOV
          let lovComponent = filterPopover.querySelector('#rockEntityLov');

          if (this.currentTag.options.isReferenceType) {
            let titlePattern;
            let subTitlePattern;
            let valueField;
            let options = this.currentTag.options;

            if (options.properties && options.properties.referenceEntityInfo && options.properties.referenceEntityInfo.length) {
              titlePattern = options.properties.referenceEntityInfo[0].listTitle;
              valueField = options.properties.referenceEntityInfo[0].listValueAttribute;
              subTitlePattern = options.properties.referenceEntityInfo[0].listSubTitle;
            }

            lovComponent.idField = "id";
            lovComponent.titlePattern = titlePattern ? titlePattern : "name";
            lovComponent.subTitlePattern = subTitlePattern ? subTitlePattern : "";
            lovComponent.valueField = valueField ? valueField : "name";
            lovComponent.sortField = valueField ? valueField : "name";
            if (this.currentTag.value.hasOwnProperty('exact')) {
              lovComponent.selectedItems = [this.currentTag.value.exact];
            } else {
              lovComponent.selectedItems = this.currentTag.value.exacts;
            }
            let refEntityTypes = DataTransformHelper._getEntityTypesForLov(this.currentTag.options);
            let itemContexts = [];
            for (let i in refEntityTypes) {
              itemContexts.push({
                "type": refEntityTypes[i]
              });
            }
            let contextData = DataHelper.cloneObject(this.contextData);
            contextData[this.CONTEXT_TYPE_ITEM] = itemContexts;
            lovComponent.requestData = this._prepareRequestData(contextData);
            lovComponent.requestData.params.additionalIds = this.currentTag.options.selectedIds;
          } else {
            lovComponent.idField = this.currentTag.name;
            lovComponent.titlePattern = this.currentTag.name;
            lovComponent.valueField = this.currentTag.name;
            lovComponent.requestData = this._prepareRequestData(this.contextData);
            lovComponent.requestData.params.fields.attributes = [this.currentTag.name];
          }
          lovComponent.reset();
        } else if (tagDisplayType == "boolean") {
          let filterInput = filterPopover.querySelector('#booleanDisplay');
          if (filterInput) {
            filterInput.value = this.currentTag.value.eq;
          }
        }
      });
    }
  }

  // Refine filter radio buttons
  _onRadioGroupChange() {
    this.gte = this.lte = "";
    this._tagsNumericCollection = [];
    this._tagNumericInput = "";
    let filterPopover = this.getRefineFilterPopover();
    if (filterPopover) {
      this._clearCollectionInput(filterPopover, '#textNumericCollection', '#txtInputTag');
    }
  }

  _clearCollectionInput(filterPopover, collection, input) {
    let filterNumericCollection = filterPopover.querySelector(collection);
    if (filterNumericCollection) {
      let collectionInput = filterNumericCollection.shadowRoot.querySelector(input);
      if (collectionInput) {
        collectionInput.value = "";
      }
    }
  }

  _onLOVConfirmTap(e, detail) {
    let selectedItemString = "";
    let selectedItemSearchString = "";
    let selectedIds = [];
    let selectedItemsObj = this._selectedItems  || [];
    if (this._isAttributeValuesExistsSearchEnabled && !this.currentTag.options.hasValueChecked) {
      this.getUpdatedValue();
    } else {
      if (selectedItemsObj.length) {
        for (let i = 0; i < selectedItemsObj.length; i++) {
          if (selectedItemsObj[i].value) {
            selectedItemString = selectedItemString + selectedItemsObj[i].value + " ";
            selectedItemSearchString = selectedItemSearchString + selectedItemsObj[i].value + ", ";
          }
          if (selectedItemsObj[i].id) {
            selectedIds.push(selectedItemsObj[i].id);
          }
        }
        selectedItemString = selectedItemString.trim();
        selectedItemSearchString = selectedItemSearchString.substr(0, selectedItemSearchString.length - 2);
      }
      if (detail && detail.data) {
        this.currentTag.value = {
          "exacts": selectedItemSearchString.split(", ")
        }

        this.currentTag.options["selectedItem"] = detail.data;
        this.currentTag.options["selectedItems"] = selectedItemsObj;
        this.currentTag.options["selectedIds"] = selectedIds;
        this.currentTag.displayValue = detail.data.value;
        let isValueUpdated = false;
        if (this._isAttributeValuesExistsSearchEnabled) {
          isValueUpdated = this.getUpdatedValue(this.currentTag.value);
        }
        if (!isValueUpdated) {
          this.set('tags.' + this.currentTag.index + '.displayValue', this.formatFilterCollectionDisplay(selectedItemSearchString.split(", ")));
          this.set('tags.' + this.currentTag.index + '.value', this.currentTag.value);
        }
      }
    }

    this._dismissDialog();
    //Fire event
    this._fireChangeEvent();

  }

  _onTextCollectionUpdate(e, detail) {
    if (this._tagInput) {
      let filterPopover = this.getRefineFilterPopover();
      if (filterPopover) {
        let filterInput = filterPopover.querySelector('#textCollection');
        let item = { "name": this._tagInput };
        if (filterInput) {
          if (!filterInput.isExists(item)) {
            this._tagsCollection.push(this._tagInput);
          }
        }
      }
      this._tagInput = "";
    }

    if (this._isAttributeValuesExistsSearchEnabled && !this.currentTag.options.hasValueChecked) {
      this.getUpdatedValue();
    } else {
      this.currentTag.value = {
        "exacts": this._tagsCollection
      }
      let isValueUpdated = false;
      if (this._isAttributeValuesExistsSearchEnabled) {
        isValueUpdated = this.getUpdatedValue(this.currentTag.value);
      }

      if (!isValueUpdated) {
        this.set('tags.' + this.currentTag.index + '.displayValue', this.formatFilterCollectionDisplay(this._tagsCollection));
        this.set('tags.' + this.currentTag.index + '.value', this.currentTag.value);
      }
    }

    this._dismissDialog();
    //Fire event
    this._fireChangeEvent();
  }
  _isMultiSelect(){
    if(this.currentTag.options.isCollection){
      return true
    }
    return false;
  }

  preselectedFilters(items){
    /*
    To-do
    Need to support mulitiple preselected filters
    Need to support non-classification attributes
    */
    if(!_.isEmpty(items)){
      let firstFilter = items[0];
      firstFilter.noPopoverOnAttach = true;
      this._onSelectedFilterChange(null, {data:firstFilter});
      if(!_.isEmpty(firstFilter["preselectedValues"])){
        this._debouncer = Debouncer.debounce(this._debouncer,
            timeOut.after(ConstantHelper.MILLISECONDS_30), () => {
              this._classificationValues = firstFilter["preselectedValues"];
              this._onClassificationUpdate();
        });
      }
    }
  }

  _onClassificationUpdate(e, detail) {
    if (this._classificationValues) {

      if(this._isAttributeValuesExistsSearchEnabled && !this.currentTag.options.hasValueChecked){
          this.getUpdatedValue();
      } else {
        this.currentTag.value = {
            "exacts": this._classificationValues
        }
        let isValueUpdated = false;
        if(this._isAttributeValuesExistsSearchEnabled){
          isValueUpdated = this.getUpdatedValue(this.currentTag.value);
        }

        if(!isValueUpdated){
          this.set('tags.' + this.currentTag.index + '.displayValue', this.formatFilterCollectionDisplay(this._classificationValues));
          this.set('tags.' + this.currentTag.index + '.value', this.currentTag.value);
        }
      }
    //Fire event
    this._fireChangeEvent();
  }
}

  getUpdatedValue(currentValue) {
    let isValueAvailable = false;
    if (this.currentTag.options.hasValueChecked && typeof currentValue === 'object') {
      for (let key in currentValue) {
        if (key != "type" && key != "operator") {
          if (currentValue[key] != "" && currentValue[key] != undefined && currentValue[key] != "NaN" && currentValue[key] != "Invalid date") {
            isValueAvailable = true;
          }
        }
      }
    }
    if (!isValueAvailable) {
      let updatedValue = "!%&has value!%&";
      if (!this.currentTag.options.hasValueChecked) {
        updatedValue = "!%&has no value!%&";
      }
      this.currentTag.value = {
        "exacts": [updatedValue]
      }
      this.set('tags.' + this.currentTag.index + '.displayValue', updatedValue);
      this.set('tags.' + this.currentTag.index + '.value', updatedValue);
      if (this.currentTag.options.displayType.toLowerCase() == "boolean") {
        this.set('tags.' + this.currentTag.index + '.booleanSearchValue', updatedValue);
      }
      this.displaygte = "";
      this.displaylte = "";
      return true;
    }
    return false;
  }
  
  formatFilterCollectionDisplay(collection, seperator) {
    seperator = seperator || 'or';
    collection = collection.map(function (el) {
      return "'" + el + "'";
    });
    return collection.join(' ' + seperator + ' ');
  }

  // Closing the filter popover 
  _onLOVCloseTap(e, detail) {
    this._dismissDialog();
  }

  // Refine filter tags will be updated as per selection
  _updateValue(e) {
    let dataType = ConstantHelper.getDataTypeConstant(this.currentTag.options.dataType);
    let isValueUpdated = false;
    let displayType = "";
    if (this.currentTag && this.currentTag.options) {
      displayType = this.currentTag.options.displayType.toLowerCase();
    }
    if (this._isAttributeValuesExistsSearchEnabled && !this.currentTag.options.hasValueChecked) {
      this.getUpdatedValue()
    } else if (displayType == "datetime" || displayType == "date") { //DateTime
      // Note:- For datetime attribute it is necessary to pass dataType as 'datetime' because from UI the 
      //        system is currently passing datetime value instead of date value in range search
      this.currentTag.value = {
        "gte": this.gte,
        "lte": this.lte,
        "type": ConstantHelper.getDataTypeConstant(displayType)
      };

      if (this.gte == this.lte) {
        this.currentTag.displayValue = this.displaygte;
      } else {
        if (this.displaygte == this.displaylte) {
          this.currentTag.displayValue = this.displaygte;
        } else {
          this.currentTag.displayValue = this.displaygte + " - " + this.displaylte;
        }
      }

      if (this._isAttributeValuesExistsSearchEnabled) {
        isValueUpdated = this.getUpdatedValue(this.currentTag.value);
      }

      if (!isValueUpdated) {
        this.set('tags.' + this.currentTag.index + '.displayValue', this.currentTag.displayValue);
        this.set('tags.' + this.currentTag.index + '.value', this.currentTag.value);
      }
    } else if (this.currentTag.options.displayType.toLowerCase() == "numeric") { //Radio group
      if (this.shadowRoot.querySelector('paper-radio-group').selected == "range") {


        if (this.gte == "") {
          this.gte = undefined;
        }
        if (this.lte == "") {
          this.lte = undefined;
        }
        if (!(this.gte || this.lte) && !this._isAttributeValuesExistsSearchEnabled) {
          this.logWarning("FilterValuesEmpty");
          return;
        } else {
          let gteAsString = (parseFloat(this.gte)).toString();
          let lteAsString = (parseFloat(this.lte)).toString();
          if (!this.gte) {
            this.currentTag.value = {
              "gte": this.gte,
              "lte": lteAsString,
              "type": dataType
            };
            this.currentTag.displayValue = "<= " + lteAsString;
          } else if (!this.lte) {
            this.currentTag.value = {
              "gte": gteAsString,
              "lte": this.lte,
              "type": dataType
            };
            this.currentTag.displayValue = ">= " + gteAsString;
          } else {
            this.currentTag.value = {
              "gte": gteAsString,
              "lte": lteAsString,
              "type": dataType
            };
            this.currentTag.displayValue = gteAsString + " - " + lteAsString;
          }
        }
        if (this._isAttributeValuesExistsSearchEnabled) {
          isValueUpdated = this.getUpdatedValue(this.currentTag.value);
        }

        if (!isValueUpdated) {
          this.set('tags.' + this.currentTag.index + '.displayValue', this.currentTag.displayValue);
          this.set('tags.' + this.currentTag.index + '.value', this.currentTag.value);
        }
      } else {
        if (_.isEmpty(this._tagsNumericCollection) && this._tagNumericInput) {
          this._tagsNumericCollection.push(this._tagNumericInput);
          this._tagNumericInput = ""; //Reset
        }

        if (_.isEmpty(this._tagsNumericCollection) && !this._isAttributeValuesExistsSearchEnabled) {
          this.logWarning("FilterValuesEmpty");
          return;
        } else {
          this.currentTag.value = {
            "exacts": this._tagsNumericCollection,
            "type": dataType,
            "operator": "_OR"
          };
        }
        if (this._isAttributeValuesExistsSearchEnabled) {
          isValueUpdated = this.getUpdatedValue(this.currentTag.value);
        }

        if (!isValueUpdated) {
          this.set('tags.' + this.currentTag.index + '.displayValue', this.formatFilterCollectionDisplay(this._tagsNumericCollection));
          this.set('tags.' + this.currentTag.index + '.value', this.currentTag.value);
        }
      }
    } else if (this.currentTag.options.displayType.toLowerCase() == "boolean") { //boolean
      if (this.booleanvalue == "All" && this._isAttributeValuesExistsSearchEnabled) {
        this.booleanvalue = "";
      }
      this.currentTag.value = {
        "eq": this.booleanvalue,
        "type": dataType
      };
      this.currentTag.booleanSearchValue = FormatHelper.checkTrueBooleanVal(this.booleanvalue, this.currentTag.options.trueText, this.currentTag.options.falseText);
      // (this.booleanvalue == this.currentTag.options.trueText ? "true" : "false");
      this.currentTag.displayValue = this.booleanvalue;
      if (this._isAttributeValuesExistsSearchEnabled) {
        isValueUpdated = this.getUpdatedValue(this.currentTag.value);
      }

      if (!isValueUpdated) {
        this.set('tags.' + this.currentTag.index + '.displayValue', this.currentTag.displayValue);
        this.set('tags.' + this.currentTag.index + '.booleanSearchValue', this.currentTag.booleanSearchValue);
        this.set('tags.' + this.currentTag.index + '.value', this.currentTag.value);
      }
    } else { //TextArea
      if (!this.tav && !this._isAttributeValuesExistsSearchEnabled) {
        this.logWarning("FilterValuesEmpty");
        return;
      }

      let operator;
      this.tav = this.tav.trim();
      this.currentTag.displayValue = this.tav;
      let displayType = this.currentTag.options.displayType.toLowerCase();
      let splitQueryByAnd = this.tav.toLowerCase().split(' and ');
      let splitQueryByOr = this.tav.toLowerCase().split(' or ');
      let containsStr = this.tav;

      if (splitQueryByAnd.length > 1) {
        operator = "_AND";
        containsStr = splitQueryByAnd;
      } else if (splitQueryByOr.length > 1) {
        operator = "_OR";
        containsStr = splitQueryByOr;
      }

      if (containsStr instanceof Array) {
        containsStr = containsStr.join(' ');
      }

      if (operator || displayType == 'richtexteditor') {
        this.currentTag.value = {
          "eq": containsStr,
          "type": dataType,
          "operator": operator
        };
      } else {
        // exact search
        this.currentTag.value = {
          "eq": this.tav,
          "type": dataType
        };
      }
      if (this._isAttributeValuesExistsSearchEnabled) {
        isValueUpdated = this.getUpdatedValue(this.currentTag.value);
      }

      if (!isValueUpdated) {
        this.set('tags.' + this.currentTag.index + '.displayValue', this.currentTag.displayValue);
        this.set('tags.' + this.currentTag.index + '.value', this.currentTag.value);
      }
    }

    //Close the popover once value updated
    if (displayType == "datetime" || displayType == "date") {
      this.shadowRoot.querySelector('#rangepicker').hide();
    } else {
      this._dismissDialog();
    }

    //Fire event
    this._fireChangeEvent();
  }

  _fireChangeEvent() {
    //Fire the event to build the query string
    this.fireBedrockEvent("build-query", this.tags, {
      ignoreId: true
    });
  }

  _onTagItemRemove(e, detail) {

    //Fire the event to build the query string
    if (!detail.isChildTag) {
      this._fireChangeEvent();
    }
  }

  _fireAddEvent(_name, _value, _type) {
    let attribute = {
      name: _name
    };
    if (_name) {
      this.fireBedrockEvent('tag-item-added', attribute, {
        ignoreId: true
      });
    }
  }

  // When tag tapped, which popover component need to show
  _showTagModifier(displayType) {
    return this.currentTag && this.currentTag.options.displayType.toLowerCase() == displayType.toLowerCase();
  }

  //Hide the popover
  _dismissDialog() {
    let filterPopover = this.getRefineFilterPopover();
    if (filterPopover) {
      filterPopover.hide();
    }
  }
  _openFilterLov() {
    this._refineFilterPopoverDialog = true;
    flush();
    
    this.shadowRoot.querySelector("#refineFilterPopover").open();        
  }
  _openEntityTypeFilterLov() {
    this.shadowRoot.querySelector("#entityTypeFilterPopover").open();
  }

  _onFilterAttributesChange() {
    if (!this.tags || this.tags.length == 0) {
      return;
    }

    let tags = [];
    let removeTags = [];
    for (let i = 0; i < this.tags.length; i++) {
      if (this._filterAttributes.find(fa => fa.name == this.tags[i].name)) {
        tags.push(this.tags[i]);
        continue;
      } else {
        removeTags.push(this.tags[i]);
      }
    }

    this.tags = tags;
    if (removeTags.length > 0) {
      this.fireBedrockEvent('filter-tags-remove', removeTags, { ignoreId: true });
    }
  }

  refresh() {
    let attributesLov = this.shadowRoot.querySelector('[id=attributeModelLov]');
    if (attributesLov && attributesLov.refresh) {
      attributesLov.refresh();
    }
  }
  _getItemVisibility(settings, val) {
    if (settings) {
      if (!_.isEmpty(settings)) {
        return settings[val];
      }
    }
    if (val == "showNestedAttributes") {
      return true;
    }
    return false;
  }


  _onToggleButtonChange(toggleState) {
    let currentItem = this.currentTag.options.displayType;   
    if (toggleState) {
      this._toggleButtonText = "Has Value"
      this.updateStyles({
        '--radio-button-border': this._defaultRadioButtonColor,
      });
    } else {
      this._toggleButtonText = "Has No Value";
      this.updateStyles({
        '--radio-button-border': '#bdbdbd',
      });
      if (currentItem == "referencelist") {
        this._selectedItems = "";
      } else if (currentItem == "numeric") {
        this.gte = "";
        this.lte = "";
        this._tagsNumericCollection = [];
        this._tagNumericInput = "";
      } else if (currentItem == "textbox") {
        this._tagsCollection = [];
        this._tagInput = "";
      } else if (currentItem == "textarea") {
        this.tav = "";
      } else if (currentItem == "boolean") {
        this.booleanvalue = "";
      }
    }
  }  
}
customElements.define(RockSearchFilter.is, RockSearchFilter);
