import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@polymer/paper-radio-button/paper-radio-button.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-text-alignment.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-floating.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../bedrock-app-context-behavior/bedrock-app-context-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/format-helper.js';
import '../pebble-button/pebble-button.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-textbox-collection/pebble-textbox-collection.js';
import '../pebble-textarea/pebble-textarea.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-textbox/pebble-textbox.js';
import '../pebble-lov/pebble-lov.js';
import '../pebble-boolean/pebble-boolean.js';
import '../pebble-data-table/pebble-data-table.js';
import '../pebble-datetime-picker/pebble-datetime-picker-overlay.js';
import '../rock-entity-lov/rock-entity-lov.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockAttributeFilterPopover extends mixinBehaviors([RUFBehaviors.UIBehavior,RUFBehaviors.AppContextBehavior,RUFBehaviors.ComponentContextBehavior], 
                            OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-floating bedrock-style-padding-margin bedrock-style-text-alignment">
                
        pebble-textarea {
            --autogrowtextarea:{
                min-height: 30px !important;
            }
            --pebble-textarea:{
                width: 260px;               
            }
        }
        .dialogOptions paper-radio-button {
            display: block;
        }
        paper-radio-group paper-radio-button{
            --paper-radio-button-unchecked-color: var(--radio-button-border, #026bc3);
            --paper-radio-button-checked-color: var(--radio-button-selected, #026bc3);
        }
        .input-content::slotted(input), .input-content::slotted(textarea), .input-content::slotted(iron-autogrow-textarea),
        .input-content::slotted(.paper-input-input) {
            font-size: var(--default-font-size, 14px);
        }
        
        pebble-textbox-collection {
            --tags-container: {
                min-height: 0px;
                margin-right: 0px;
            }
            --text-collection-container: {
                min-height: 0px;
                margin-top: 0px;
            }
        }

        #filterPopover{
            padding-right:10px;
            padding-left:10px;
        }
        pebble-toggle-button {
          --pebble-toggle-button-checked-bar-color: var(--success-color, #4caf50);
          --pebble-toggle-button-checked-button-color: var(--success-color, #4caf50);
          --pebble-toggle-button-checked-ink-color: var(--success-color, #4caf50);
          display: block;

        }
        </style>
         
        <!-- Filter popover starts here -->         
        <pebble-popover id="filterPopover" for="" no-overlap="" vertical-align="auto" horizontal-align="right">
                <template is="dom-if" if="{{attributeValuesExistsSearchEnabled}}">
                    <pebble-toggle-button class="m-l-20 m-b-10" checked="{{currentFilterObj.attributeHasValueChecked}}">[[_toggleButtonText]]</pebble-toggle-button>
                </template>
                <template is="dom-if" if="{{_showTagModifier('textbox',currentFilterObj.displayType)}}">
                    <pebble-textbox-collection id="textCollection" max-allowed-values-for-search="[[maxAllowedValuesForSearch]]" values="{{txtBoxCollection}}" no-popover="" textbox-label="Enter values to search" show-seperator="" seperator="or" disabled="[[!currentFilterObj.attributeHasValueChecked]]"></pebble-textbox-collection>
                    <div class="PebbleButtonPadding text-center m-t-15">
                    <pebble-button class="btn btn-secondary m-r-5" target-id="filterPopover" on-tap="_closeLov" raised="" elevation="1" button-text="Close"></pebble-button>
                    <pebble-button class="btn btn-success" button-text="Apply" raised="" elevation="1" on-tap="_onUpdateValue"></pebble-button> 
                    <div class="clearfix"></div>
                    </div>
                </template>
                <template is="dom-if" if="{{_showTagModifier('textarea',currentFilterObj.displayType)}}">
                    <pebble-textarea class="input" label="Enter text here" value="{{txtAreaInput}}" disabled="[[!currentFilterObj.attributeHasValueChecked]]"></pebble-textarea>
                    <div class="PebbleButtonPadding text-center m-t-15">
                    <pebble-button class="btn btn-secondary m-r-5" target-id="filterPopover" on-tap="_closeLov" raised="" elevation="1" button-text="Close"></pebble-button>
                    <pebble-button class="btn btn-success" button-text="Apply" raised="" elevation="1" on-tap="_onUpdateValue"></pebble-button> 
                    <div class="clearfix"></div>
                    </div> 
                </template>
                <template is="dom-if" if="{{_showTagModifier('richtexteditor',currentFilterObj.displayType)}}">
                    <pebble-textarea class="input" label="Enter text here" value="{{txtAreaInput}}" disabled="[[!currentFilterObj.attributeHasValueChecked]]"></pebble-textarea>
                    <div class="PebbleButtonPadding text-center m-t-15">
                    <pebble-button class="btn btn-secondary m-r-5" target-id="filterPopover" on-tap="_closeLov" raised="" elevation="1" button-text="Close"></pebble-button>
                    <pebble-button class="btn btn-success" button-text="Apply" raised="" elevation="1" on-tap="_onUpdateValue"></pebble-button> 
                    <div class="clearfix"></div>
                    </div>
                </template>
                <template is="dom-if" if="{{_showTagModifier('referencelist',currentFilterObj.displayType)}}">
                    
                </template>
                <template is="dom-if" if="{{_showTagModifier('boolean',currentFilterObj.displayType)}}">
                    <pebble-boolean class="text-center" id="booleanDisplay" true-text="TRUE" false-text="FALSE" value="{{booleanvalue}}" required="" disabled="[[!currentFilterObj.attributeHasValueChecked]]"></pebble-boolean>
                    <div class="PebbleButtonPadding text-center m-t-15">
                    <pebble-button class="btn btn-secondary m-r-5" target-id="filterPopover" on-tap="_closeLov" raised="" elevation="1" button-text="Close"></pebble-button>
                    <pebble-button class="btn btn-success" button-text="Apply" raised="" elevation="1" on-tap="_onUpdateValue"></pebble-button>
                    </div> 
                </template>
                <template is="dom-if" if="{{_showTagModifier('numeric',currentFilterObj.displayType)}}">
                <paper-radio-group aria-labelledby="{{longName}}" class="dialogOptions" on-paper-radio-group-changed="_onRadioGroupChange">
                    <paper-radio-button name="range" disabled="[[!currentFilterObj.attributeHasValueChecked]]">
                        <div class="colspan-2 pull-left">
                            <pebble-textbox label="Min" prevent-invalid-input="" allowed-pattern="[0-9.]" invalid="{{numericMinInvalid}}" show-error="" input-data-type="[[currentFilterObj.dataType]]" value="{{gte}}">
                            </pebble-textbox>
                        </div>
                        <div class="colspan-2 pull-left">
                            <pebble-textbox label="Max" prevent-invalid-input="" allowed-pattern="[0-9.]" invalid="{{numericMaxInvalid}}" show-error="" input-data-type="[[currentFilterObj.dataType]]" value="{{lte}}">
                            </pebble-textbox>
                        </div>
                        <div class="clearfix"></div>
                    </paper-radio-button>
                <paper-radio-button name="equalToData" disabled="[[!currentFilterObj.attributeHasValueChecked]]">
                    <div class="col-90 pull-left">
                    <pebble-textbox-collection id="textNumericCollection" max-allowed-values-for-search="[[maxAllowedValuesForSearch]]" values="{{_tagsNumericCollection}}" no-popover="" textbox-label="Enter values to search" show-seperator="" seperator="or" allowed-pattern="[0-9.]" text-collection-input="{{_tagNumericInput}}"></pebble-textbox-collection>
                    </div>
                    <div class="clearfix"></div>
                </paper-radio-button>
                </paper-radio-group>
                <div class="PebbleButtonPadding text-center">
                <pebble-button class="btn btn-secondary m-r-5" target-id="filterPopover" on-tap="_closeLov" raised="" elevation="1" button-text="Close"></pebble-button>
                <pebble-button class="btn btn-success" button-text="Apply" raised="" elevation="1" on-tap="_onUpdateValue" disabled="{{_updateDisable}}"></pebble-button>
                </div>
            </template>
            <rock-entity-lov id="rockEntityLov" hidden="" multi-select="" show-action-buttons="" selected-items="{{_selectedItems}}" disable-selection="[[!currentFilterObj.attributeHasValueChecked]]" get-title-from-model=""></rock-entity-lov>
            </pebble-popover>
            <bedrock-pubsub event-name="on-popover-close" handler="_onFilterPopoverClose" target-id="filterPopover"></bedrock-pubsub>
            <bedrock-pubsub event-name="entity-lov-confirm-button-tap" handler="_onLOVConfirmTap" target-id="rockEntityLov"></bedrock-pubsub>
            <bedrock-pubsub event-name="entity-lov-close-button-tap" handler="_onLOVCloseTap" target-id="rockEntityLov"></bedrock-pubsub>
        
            <!-- Already overlay, so out of popover -->
            <pebble-datetime-picker-overlay id="rangepicker" for="" picker-type="daterange" show-ranges="" heading-format="ddd, MMM DD YYYY" start-date-text="{{displaygte}}" end-date-text="{{displaylte}}" start-date-value="{{gte}}" end-date-value="{{lte}}" on-date-range-selected="_onUpdateValue" has-value-checked="{{currentFilterObj.attributeHasValueChecked}}" has-value-toggle-enable="[[attributeValuesExistsSearchEnabled]]">
            </pebble-datetime-picker-overlay>
            <!-- Filter popover ends here -->  
`;
  }

  static get is() {
      return 'rock-attribute-filter-popover'
  }
  connectedCallback() {
      super.connectedCallback();
      
      this._rangePicker = this.shadowRoot.querySelector('#rangepicker');
      this._filterPopover = this.shadowRoot.querySelector('#filterPopover');
      let _computedStyle = getComputedStyle(this);
      if(_computedStyle){
          let _propertyValue = _computedStyle.getPropertyValue('--focused-line');
          if(_propertyValue){
              this._defaultRadioButtonColor = _propertyValue;
          }
      }
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          currentFilterObj: {
              type: Object,
              notify: true                
          },

          txtBoxCollection: {
              type: Array,
              value: function() {
                  return [];
              }
          },
          txtAreaInput:{
              type: String,
              value: ""
          },
          booleanvalue:{
              type: Boolean                
          },
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
              computed: '_disableUpdate(numericMinInvalid, numericMaxInvalid, _tagsNumericCollection, _tagNumericInput, gte, lte,attributeValuesExistsSearchEnabled)'
          },
          _tagsNumericCollection: {
              type: Array,
              value: function() {
                  return [];
              }
          },           
          currentTargetRowName:{
              type: String,
              value: ""
          },
          _toggleButtonText:{
              type: String,
              value: "Has Value"
          },
          attributeValuesExistsSearchEnabled:{
              type: Boolean,
              value: true,
          },
          _defaultRadioButtonColor:{
              type: String,
              value:"#026bc3"
          },
          maxAllowedValuesForSearch:{
              type: Number                        
          }
      }
  }

  /**
   *   When attribute is selected, which popover component need to show
  */
  static get observers() {
      return [
          "_onToggleButtonChange(currentFilterObj.attributeHasValueChecked)"
          ]
  }
  _showTagModifier(displayType) {
      if(!this.currentFilterObj){
          return;
      } else if (this.currentFilterObj.dataType.toLowerCase() == "integer" || this.currentFilterObj.dataType.toLowerCase() == "decimal"){
          this.currentFilterObj.displayType = "numeric";
      } 

      this.currentFilterObj.displayType = this.currentFilterObj.displayType || "textbox";
      
      if (this.currentFilterObj.displayType.toLowerCase() == displayType.toLowerCase()) {
          return true;
      }
      return false;
  }

  /**
   *   Handles the opening of filter popover
  */
  onOpenFilterPopover(filterInputValue,items,forTarget,currenGridName,attributeValuesExistsSearchEnabled) {  

      if(items){
          this.currentFilterObj = items.attributeModel;
      }
      if(currenGridName == "relationshipGrid"){
          if(attributeValuesExistsSearchEnabled){
              this.attributeValuesExistsSearchEnabled = true;
          }
      }else if(currenGridName == "relatedEntityGrid"){
          this.attributeValuesExistsSearchEnabled = false;
      }
      if(filterInputValue.indexOf("has value") > -1 || filterInputValue.indexOf("has no value") > -1){
          let _hasValueChecked = filterInputValue.indexOf("has value") > -1 ? true : false;
          this.set("currentFilterObj.attributeHasValueChecked",_hasValueChecked);
          filterInputValue = "";
      }
      let scope = dom(this).getOwnerRoot();
      let target = dom(scope).querySelector('#' + forTarget);

      let filterPopover = this._filterPopover;
      let lovComponent = filterPopover.querySelector('#rockEntityLov');

      if(lovComponent) {
          lovComponent.setAttribute("hidden", "");
      }

      //DateTime Control
      if (this.currentFilterObj && this.currentFilterObj.displayType && 
          (this.currentFilterObj.displayType.toLowerCase() == "datetime" || this.currentFilterObj.displayType.toLowerCase() == "date")){
          let rangePicker = this._rangePicker;
          if(filterInputValue == "") {
              rangePicker.startDateValue = "";
              rangePicker.endDateValue = "";
              rangePicker.setDate(new Date());
              rangePicker.setRangeType(null);                                                     
          } else {
              if(filterInputValue.indexOf('-')> -1){
                  let filterInputValues = filterInputValue.split('-');
                  rangePicker.startDateValue = filterInputValues[0];
                  rangePicker.endDateValue = filterInputValues[1];
              } else {
                  rangePicker.startDateValue = filterInputValue;
                  rangePicker.endDateValue = "";
              }
              let _date = new Date(rangePicker.startDateValue);
              rangePicker.setDate(_date);
          }

          rangePicker.positionTarget = target;
          rangePicker.noOverlap = true;
          rangePicker.show(true);
          return; 
      }
      
      filterPopover.for = "";
      if(forTarget) {
          filterPopover.positionTarget = target;
          filterPopover.show(true);
      }

      const displayType = this.currentFilterObj && this.currentFilterObj.displayType ? this.currentFilterObj.displayType.toLowerCase() : "textbox";

      if (displayType == "textbox") {
          microTask.run(() => {
              let collectionInput = filterPopover.querySelector('#textCollection').shadowRoot.querySelector("#txtInputTag"); 
              this.txtBoxCollection = [];
              if(filterInputValue) {
                  let filterInputValues = filterInputValue.split(' '+ 'or' +' ');
                  //If the value has already been added, show it in the textbox for updating
                  this.txtBoxCollection = filterInputValues;
              }
              collectionInput.value = "";                    
              collectionInput.focus();
          });
      } else if (displayType == "textarea" || displayType === 'richtexteditor'){
          let filterInput = filterPopover.querySelector('.input');
          this.txtAreaInput = "";
          if (filterInput) {
              filterInput.value = filterInputValue;
              this.txtAreaInput = filterInputValue;
              filterInput.focus();  
          }  
      } else if (displayType == "boolean") {
          let filterInput = filterPopover.querySelector('#booleanDisplay');
          this.booleanvalue = "";
          if (filterInput) {
              filterInput.value = filterInputValue;
              this.booleanvalue = filterInputValue;
          }
      } else if (displayType == "referencelist") {
          if(lovComponent) {
              lovComponent.removeAttribute("hidden");
              let titlePattern = "";
              let subTitlePattern = "";
              if(this.currentFilterObj.referenceEntityInfo && this.currentFilterObj.referenceEntityInfo.length) {
                  titlePattern = this.currentFilterObj.referenceEntityInfo[0].listTitle || "{entity.name}";
                  subTitlePattern = this.currentFilterObj.referenceEntityInfo[0].listSubTitle;
              }
              lovComponent.idField = "id";
              lovComponent.titlePattern = titlePattern;
              lovComponent.subTitlePattern = subTitlePattern;
              lovComponent.valueField = "name";
              this._selectedItems = [];
              if(filterInputValue) {
                  lovComponent.selectedItems = items.selectedItems;
                  this._selectedItems = items.selectedItems;
              } 
              let itemContexts = [];
              if(this.currentFilterObj && this.currentFilterObj.referenceEntityInfo.length) {
                  let refEntityTypes = [this.currentFilterObj.referenceEntityInfo[0].refEntityType];
                  for (let i in refEntityTypes) {
                      itemContexts.push({
                          "type": refEntityTypes[i]
                      });
                  }
              }
              let contextData = DataHelper.cloneObject(this.contextData);
              contextData[this.CONTEXT_TYPE_ITEM] = itemContexts;
              lovComponent.requestData = DataRequestHelper.createEntityGetRequest(contextData);
              lovComponent.requestData.params.additionalIds = this.currentFilterObj.selectedIds;
          } 
      } else if (displayType == "numeric"){

          this._tagsNumericCollection = [];
          this._tagNumericInput = ""; 
          this.lte = "";
          this.gte = "";

          if(filterInputValue) {
              let filterInputValues = [];
              if(filterInputValue.indexOf('-') > -1) {
                  filterInputValues = filterInputValue.split('-');
                  this.gte = filterInputValues[0];
                  this.lte = filterInputValues[1];
              } else if (filterInputValue.indexOf('<=') > -1) {
                  filterInputValues = filterInputValue.split('<=');
                  this.lte = filterInputValues[1];
                  this.gte = "";
              } else if (filterInputValue.indexOf('>=') > -1) {
                  filterInputValues = filterInputValue.split('>=');
                  this.gte = filterInputValues[1];
                  this.lte = "";
              } else {
                  filterInputValues = filterInputValue.split(' '+ 'or' +' ');
                  this._tagsNumericCollection = filterInputValues;
              }
          }           
           
      } 

  }

  get radioGroup() {
      this._radioGroup = this._radioGroup || this.shadowRoot.querySelector('paper-radio-group');
      return this._radioGroup;
  }

  /**
  * validate the input for numeric display type and disables the update button
  */
  _disableUpdate(numericMinInvalid, numericMaxInvalid, _tagsNumericCollection, _tagNumericInput, gte, lte,attributeValuesExistsSearchEnabled) {
      if(attributeValuesExistsSearchEnabled){
          return false;
      }
      if (!_.isEmpty(this.gte + "") || !_.isEmpty(this.lte + "") || !_.isEmpty(_tagsNumericCollection) || _tagNumericInput) {
          const radioGroup = this.radioGroup;
          if ( radioGroup && radioGroup.selected == "range") {
              return (numericMaxInvalid || numericMinInvalid);
          } else {
              return _.isEmpty(_tagsNumericCollection) && !_tagNumericInput;
          }
      } else {
          return true;
      }
  }

  /**
   * checks if the min value is less than maximum value in numeric display type popover
  */
  _isMaxGreaterThanMin() {
      if (!_.isEmpty(this.gte + "") && !_.isEmpty(this.lte + "")) {
      if (parseFloat(this.gte) > parseFloat(this.lte)) {
          this.set('numericMaxInvalid', true);
      } else {
          this.set('numericMaxInvalid', false);
      }
      } else {
      this.set('numericMaxInvalid', false);
      }
  }

  /**
   *  Handles updating of the filter popover content 
  */
  _onUpdateValue(e){

      //Updating Date and Datetime inputs
      if(this.currentFilterObj.displayType.toLowerCase() == "datetime" || this.currentFilterObj.displayType.toLowerCase() == "date") {
          if (this.gte == this.lte) { 
              filterInputValue = this.displaygte;
          } else {                    
              if (this.displaygte == this.displaylte) {
                  filterInputValue = this.displaygte;
              } else {
                  filterInputValue = this.displaygte + "-" + this.displaylte;
              }
          } 
            
          let eventDetail = {
              "attributeHasValueChecked":this.currentFilterObj.attributeHasValueChecked,
              "filterInputValue": filterInputValue,
              "attributeValuesExistsSearchEnabled": this.attributeValuesExistsSearchEnabled
          }

          this.fireBedrockEvent('on-filter-update',eventDetail);

          return;
      }
     
      //Updating other inputs
      let filterPopover = this._filterPopover;
      let filterInput;
      let filterInputValue;

      const displayType = this.currentFilterObj.displayType.toLowerCase();
      if (displayType === "textbox") {
          let collectionInput = filterPopover.querySelector('#textCollection').shadowRoot.querySelector("#txtInputTag"); 
          filterInputValue = collectionInput.value;               
          if(this.txtBoxCollection.length > 0) {
              filterInputValue = this.txtBoxCollection.join(' '+ 'or' +' ');
          }
      } else if (displayType === "textarea" || displayType === 'richtexteditor') {
          filterInput = filterPopover.querySelector('.input');
          filterInputValue = filterInput.value;
      } else if (displayType === "boolean") {
          filterInput = filterPopover.querySelector('#booleanDisplay');
          filterInputValue = FormatHelper.checkTrueBooleanVal(this.booleanvalue, "TRUE", "FALSE");
      } else if(displayType === "numeric"){
          if (this.radioGroup.selected == "range") {
              if (!(this.gte || this.lte) && !this.attributeValuesExistsSearchEnabled) {
                  this.logWarning("FilterValuesEmpty");
                  return;
              } else {
                  if(this.gte || this.lte){
                      let gteAsString = (parseFloat(this.gte)).toString();
                      let lteAsString = (parseFloat(this.lte)).toString();
                      if (!this.gte) {                   
                          filterInputValue = "<=" + lteAsString;
                      } else if (!this.lte) {                  
                          filterInputValue = ">=" + gteAsString;
                      } else {                   
                          filterInputValue = gteAsString + "-" + lteAsString;
                      }
                  }else if(this.attributeValuesExistsSearchEnabled){
                      filterInputValue = "";
                  }
                 
              }
          } else if (this._tagsNumericCollection.length > 0){
              filterInputValue = this.formatFilterCollectionDisplay(this._tagsNumericCollection)
          } 
      }
      let eventDetail = {
          "attributeHasValueChecked":this.currentFilterObj.attributeHasValueChecked,
          "filterInputValue": filterInputValue,
          "attributeValuesExistsSearchEnabled": this.attributeValuesExistsSearchEnabled
      }
      this.fireBedrockEvent('on-filter-update',eventDetail);
      //close the filter popover
      filterPopover.close();

  }

  /**
   *  Handles referencelist confirm tap 
  */
  formatFilterCollectionDisplay(collection, seperator) {
      seperator = seperator || 'or';
      return collection.join(' '+ seperator +' ');
  }

  _onLOVConfirmTap(){

      let filterInputValue = [];
      let selectedItemsObj = this._selectedItems;
      if(selectedItemsObj){
          for (let i = 0; i < selectedItemsObj.length; i++) {
              if (selectedItemsObj[i].title) {
                  filterInputValue.push(selectedItemsObj[i].title);
              }            
          }
      }
      let eventDetail = {
          "filterInputValue": filterInputValue.join(" or "),
          "selectedItems" : this._selectedItems,
          "attributeHasValueChecked":this.currentFilterObj.attributeHasValueChecked,
          "attributeValuesExistsSearchEnabled": this.attributeValuesExistsSearchEnabled
      }
      this.fireBedrockEvent('on-filter-update',eventDetail);

      //close the filter popover
      this._onLOVCloseTap();
  }

  /**
   *  Handles referencelist close tap 
  */
  _onLOVCloseTap(){
      this._filterPopover.close();
  }

  /**
   *  Clear radio button selection  
  */
  _onRadioGroupChange() {
      this.gte = this.lte = "";
      this._tagsNumericCollection = [];
      this._tagNumericInput = "";

      this._clearCollectionInput(this._filterPopover, '#textNumericCollection', '#txtInputTag');
  }

  _clearCollectionInput(filterPopover, collection, input) {
      let filterNumericCollection = filterPopover.querySelector(collection);
      if(filterNumericCollection) {
          let collectionInput = filterNumericCollection.shadowRoot.querySelector(input);
          if(collectionInput) {
              collectionInput.value = "";
          }
      }
  }

  /**
   *  Close lov whose target-id is defined
  */
  _closeLov(e) {
      let targetId = e.target.getAttribute("target-id");
      if(targetId) {
          let targetObj = this.shadowRoot.querySelector("#"+targetId);               
          if(targetObj){
              targetObj.hide();
          }               
      }           
  }
  _onToggleButtonChange(toggleState){
      let currentItem = this.currentFilterObj.displayType.toLowerCase();
      if(toggleState){
          this._toggleButtonText =  "Has Value"
          this.updateStyles({
              '--radio-button-border': this._defaultRadioButtonColor,
          });
      }else{
          this._toggleButtonText = "Has No Value";
          this.updateStyles({
              '--radio-button-border': '#bdbdbd',
          });
          if(currentItem == "referencelist"){
          this._selectedItems = "";
          }else if(currentItem == "numeric"){
              this.gte = "";
              this.lte = "";
              this._tagsNumericCollection = [];
              this._tagNumericInput = "";
          }else if(currentItem == "textbox"){
              this.txtBoxCollection = [];
              this._tagInput = "";
          }else if(currentItem == "textarea"){
              this.txtAreaInput = "";
          }else if(currentItem == "boolean"){
              this.booleanvalue = "";
          }
      }
  }
}
customElements.define(RockAttributeFilterPopover.is, RockAttributeFilterPopover);
