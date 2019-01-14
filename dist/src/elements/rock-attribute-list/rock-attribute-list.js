/**
`rock-attribute-list` Represents the attribute-list component in the framework.
It renders the list of attributes based on the specified parameters.

@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/paper-spinner/paper-spinner-lite.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../pebble-button/pebble-button.js';
import '../pebble-horizontal-divider/pebble-horizontal-divider.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../pebble-accordion/pebble-accordion.js';
import '../rock-attribute/rock-attribute.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockAttributeList extends mixinBehaviors([RUFBehaviors.UIBehavior,RUFBehaviors.ComponentContextBehavior],OptionalMutableData(PolymerElement)){
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-grid-layout">
            :host{
                display: block;	
                height:100%;
                --data-table-container-position-dialog:{
                    position: relative;
                } 
            }

            paper-spinner-lite {
                 margin: 0 auto;
                 display: none;
             }
 
             paper-spinner-lite[active] {
                 display: block;
            }

            .attribute-list-container{
                height:100%;
            }

            .group-name {
                font-weight: var(--font-bold, bold);
                font-family: var(--default-font-family);
                clear: both;
                margin: 0px;
                font-size: var(--font-size-md, 16px);
                color: var(--title-text-color, #191e22);
            }

            .group-container {
                margin-bottom: 20px;
            }

            .group-name-container {
                clear: left;
                @apply --layout-horizontal;
                background: var(--palette-pale-grey-four, #eff4f8);
                padding: 6px;
                border-radius: 3px;
            }

            .group-line-box {
                margin-top: 16px;
                margin-left: 8px;
                margin-right: 8px;
                @apply --layout-flex;
            }

            .group-line-container {
                float: right;
                border-bottom: 1px solid var(--border-black, #000);
            }

            .attribute-box {
                display: inline-block;
                padding: 0 20px;
                vertical-align: bottom;
            }

            .attribute-wrapper {
                margin: 0 -30px;
            }

            .attribute-box-1 {
                width: 100%;
            }

            .attribute-box-2 {
                width: calc(50% - 2px);
            }

            .attribute-box-3 {
                width: 33%;
            }

            .attribute-box-4 {
                width: 24%;
            }

            pebble-horizontal-divider {
                border-top: 1px dotted var(--default-border-color, #c1cad4);
            }

            .content {
                height: 100%;
                overflow-x:hidden;
                overflow-y: auto;
                @apply --attribute-list-content;
            }
            .multi-attribute-group .attribute-group-container-wrapper {
                height: auto;
            }
            .full-height-overflow {
                height: 100%;
                overflow-x:hidden;
                overflow-y: auto;
            }
            .nested-attribute{
                max-height:100%;
                overflow-x:hidden;
                overflow-y: auto;
            }

        </style>
        <div class="content">
            <div class\$="attribute-list-container [[_getMultiAttributeClass(attributesGroups)]]">
                <template is="dom-repeat" items="[[attributesGroups]]" as="group" initial-count="1" target-framerate="20">
                    <div class="attribute-group-container-wrapper full-height">
                        <pebble-accordion header-text="[[_getAttributeGroupTitle(group.groupName)]]" show-accordion="[[_checkRenderGroupBar(group.groupName)]]">

                            <div slot="accordion-content" class="full-height-overflow">
                                <div class="attribute-group-container-wrapper full-height">
                                    <template is="dom-repeat" items="[[getGroupAttributes(group, group.attributes.*)]]" as="attribute" initial-count="20" target-framerate="20">
                                        <div class\$="[[_getAttributeClass(noOfColumns, attribute)]]" name\$="[[attribute.name]]">
                                            <rock-attribute context-data="[[contextData]]" mode="[[mode]]" readonly="[[readonly]]" errors="{{attribute.errors}}" server-errors="[[_getAttributeMessage(attribute,attributeMessages)]]" attribute-model-object="[[_getAttributeModel(attributeModels, attribute)]]" attribute-object="{{attribute}}" original-attribute-object="[[_cloneObject(attribute)]]" tabindex="[[_getTabIndex(attribute)]]" on-attribute-value-changed="updateDependentAttributesAndResetErrors" show-delete-icon="[[showDeleteIcon]]" dependent-attribute-objects="[[_getDependentAttributes(attribute)]]" dependent-attribute-model-objects="[[_getDependentAttributeModels(attribute)]]" on-attribute-mode-changed="_onModeChange" apply-locale-coalesce="[[applyLocaleCoalesce]]" hide-revert\$="[[hideRevert]]" hide-history\$="[[hideHistory]]" apply-graph-coalesced-style\$="[[applyGraphCoalescedStyle]]">
                                            </rock-attribute>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </pebble-accordion>
                    </div>
                    <paper-spinner-lite active="[[loading]]"></paper-spinner-lite>
                </template>
            </div>
        </div>
        <bedrock-pubsub event-name="attribute-delete" handler="_ondeletingAttribute" target-id=""></bedrock-pubsub>
`;
  }

  static get is() {
      return "rock-attribute-list";
  }
  static get properties() {
      return {
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
           * If set as true , it indicates the component is in read only mode
           */
          readonly: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates whether the attribute is rendered in edit mode or view mode. 
           * The two possible values are <b>view</b> and <b>edit</b>.
           */
          mode: {
              type: String,
              value: "view",
              notify: true
          },
          /**
           * Indicates the number of columns in which the attributes are rendered. Possible values are 1, 2 and 3.
           */
          noOfColumns: {
              type: Number,
              value: 1
          },
          /**
           * Indicates the attribute model objects which renders the attributes.
           * JSON sample to be added here.
           */
          attributeModels: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           * Indicates the attribute value objects which renders the attributes.
           * JSON sample to be added here.
           */
          attributeValues: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          /**
           * Indicates the attribute value objects which renders the attributes.
           * JSON sample to be added here.
           */
          attributeMessages: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: '_onAttributeMessagesChange'
          },
          /**
           * Indictaes the locale dimension for which the attribute list is used.
           */
          locale: {
              type: String
          },
          /**
           * Indictaes the list for which the attribute list is used.
           */
          list: {
              type: String
          },
          /**
           * Indictaes the source dimension for which the attribute list is used.
           */
          source: {
              type: String
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          showGroupName: {
              type: Boolean,
              value: false
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          groupName: {
              type: String,
              value: "My Attributes"
          },
          _runningTabIndex: {
              type: Number,
              value: 1
          },
          _previousViewName: {
              type: String,
              value: ""
          },
          showDeleteIcon: {
              type: Boolean,
              value: false
          },
          attributesChunkLength: {
              type: Number,
              value: 0
          },
          _lazyLoad: {
              type: Boolean,
              value: false
          },
          applyLocaleCoalesce: {
              type: Boolean,
              value: false
          },
          loading: {
              type: Boolean,
              value: true
          },
          needAttributesGrouping: {
              type: Boolean,
              value: false
          },
          attributesGroups: {
              type: Array,
              value: function() {
                  return [];
              }
          },
          dependentAttributeModels: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          dependentAttributeValues: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          hideRevert: {
              type: Boolean,
              value: false
          },
          hideHistory: {
              type: Boolean,
              value: false
          },
          applyGraphCoalescedStyle: {
              type: Boolean,
              value: function () {
                  return this.appSetting("dataDefaults").applyGraphCoalescedStyle;
              }
          }
      }
  }
  static get observers(){
      return [
      '_onAttributeValuesChange(attributeValues.*)'
      ]
  }
  constructor() {
      super();
      this._onScrollListDebounce = _.debounce(this._onScrollList.bind(this), 300);
  }
  connectedCallback() {
      super.connectedCallback();
      this.scrollContainer.addEventListener('scroll', this._onScrollListDebounce);
  }
  disconnectedCallback() {
      super.disconnectedCallback();
      this.scrollContainer.removeEventListener('scroll', this._onScrollListDebounce);
      if (this.loadContentFrameId) cancelAnimationFrame(this.loadContentFrameId);
  }
  get scrollContainer() {
      this._scrollContainer = this._scrollContainer || this.shadowRoot.querySelector('.content');
      return this._scrollContainer;
  }

  get hasScroll() {
      const { scrollHeight, offsetHeight } = this.scrollContainer;

      return scrollHeight > offsetHeight;
  }

  get isLoadFinished() {
      return this.attributesGroups[0] && this.attributesGroups[0].attributes.length === this.attributeValues.length;
  }

  _onScrollList(activeContent) {
      if(!this._lazyLoad || this.needAttributesGrouping) return;

      const { scrollHeight, scrollTop, offsetHeight } = this.scrollContainer;

      const scrollDiff = scrollHeight - offsetHeight - scrollTop;

      const PRELOAD_HEIGHT = 100;

      if(this.isLoadFinished) {
          this.loading = false;
          return;
      }

      if (scrollTop && scrollDiff <= PRELOAD_HEIGHT)
          return this._loadMoreAttributes();
  }

  _loadMoreAttributes() {
      const displayedAttributes = this.attributesGroups[0].attributes;
      const itemsToPush = this.attributeValues.slice(displayedAttributes.length, displayedAttributes.length + this.attributesChunkLength);

      if (!itemsToPush.length) {
          this.loading = false;
          return;
      }

      this.loading = true;

      this.loadContentFrameId = requestAnimationFrame(()=> {
          this.set(`attributesGroups.0.attributes`, displayedAttributes.concat(itemsToPush));
      });
  }

  _onAttributeValuesChange(changeRecord) {
      this._previousViewName = "";
      this.loading = true;

      if (!this.attributeValues.length) {
          this.loading = false;
          this.attributesGroups = [];
          return;
      }

      this._calculateErrorLength(this.attributeValues);

      microTask.run(() => {
          const attributesByGroup = this._getAttributesByGroup();

          this.attributesGroups = Object.keys(attributesByGroup).map(groupName => {
              return {
                  groupName,
                  attributes: attributesByGroup[groupName]
              };
          });

          this._lazyLoad = !this._isMultipleGroups() && !!this.attributesChunkLength;

          if(!this._lazyLoad || this.isLoadFinished) {
              this.loading = false;
              return;
          }

          //after rendering initial attributes need to check if container has scroll
          //in case it doesn't have, need to trigger loading next chunk manually
          setTimeout(()=> {
              if(!this.hasScroll)
                  this._loadMoreAttributes();
          }, 0);
      });
  }

  getGroupAttributes(group, atts) {
      //need array mutation here to render changes in bulk-edit
      return group.attributes.slice(0, group.attributes.length);
  }

  _getAttributesByGroup() {
      return this.attributeValues.reduce((res, attribute) => {
          let groupName = this.needAttributesGrouping && this.attributeModels[attribute.name] ? this.attributeModels[attribute.name].groupName || this.groupName : this.groupName;

          if(!res[groupName])
              res[groupName] = [];

          attribute.groupName = groupName;

          res[groupName].push(attribute);
          return res;
      }, {});
  }

  _getAttributeClass(n, attribute) {
      let model = this._getAttributeModel(this.attributeModels, attribute);
      let displayType = model && model.displayType ? model.displayType.toLowerCase() : "";
      if(displayType === "textarea" || displayType === "richtexteditor" || displayType === "nestedgrid") {
          n = 1;
      }
      if(displayType === "nestedgrid"){
          n = 1;
      }
      return "attribute-box attribute-box-" + n;
  }
  _getAttributeModel(attributeModels, attribute) {
      let model;
      if (attributeModels) {
          if (attribute.name in attributeModels) {
              model = attributeModels[attribute.name];
          }
      }

      if (_.isEmpty(model)) {
          //set default model as textbox
          //TODO: find a better way for getting default model
          model = {
              "name": attribute.name,
              "longName": attribute.name,
              "displayType": "textbox",
              "viewName": "Other Attributes"
          };
      }

      if (_.isEmpty(model.dataType)) {
          model.dataType = 'string';
      }

      if (_.isEmpty(model.displayType)) {
          let dataType = model.dataType ? model.dataType.toLowerCase() : model.dataType;
          model.displayType = this._getDisplayType(dataType);
      }

      return model;
  }
  _getDisplayType(dataType) {
      let displayType = 'textbox';

      switch (dataType) {
          case 'boolean':
              {
                  displayType = 'boolean';
                  break;
              }
          case 'date':
              {
                  displayType = 'date';
                  break;
              }
          case 'datetime':
              {
                  displayType = 'datetime';
                  break;
              }
          case 'decimal':
              {
                  displayType = 'textbox';
                  break;
              }
      }

      return displayType;
  }
  /**
  * Can be used to get all the attribute objects that are changed in the attribute-list.
  */
  getChangedAttributeElements() {
      let node = dom(this).node;
      let changedAttributeElements = dom(this).node.querySelectorAll('rock-attribute[changed]');
      if (changedAttributeElements == undefined || changedAttributeElements.length == 0) {
          changedAttributeElements = dom(this).node.root.querySelectorAll('rock-attribute[changed]');
      }
      return changedAttributeElements;
  }
  /**
  * Can be used to get all the attribute objects that are changed in the attribute-list.
  */
  getDependentAttributeElements(currentAttribute) {
      let node = dom(this).node;
      let allAttributeElements = dom(this).node.querySelectorAll('rock-attribute');
      if(allAttributeElements == undefined || allAttributeElements.length == 0) {
          allAttributeElements = dom(this).node.root.querySelectorAll('rock-attribute');
      }

      return DataHelper.getDependentAttributesOfAttribute(allAttributeElements, currentAttribute);
  }

  /**
   * Can be used to reset all the changed attribute objects to their original object values.
   */
  resetChanged() {
      let changedAttributeElements = this.getChangedAttributeElements();
      for (let i = 0; i < changedAttributeElements.length; i++) {
          let attributeElement = changedAttributeElements[i];
          attributeElement.changed = false;
      }
  }
  /**
   * Can be used to reset all the changed attribute objects to their original object values and switch
   * the mode from "edit" to "view".
   */
  revertAll() {
      let changedAttributeElements = this.getChangedAttributeElements();
      for (let i = 0; i < changedAttributeElements.length; i++) {
          let attributeElement = changedAttributeElements[i];
          attributeElement.attributeObject = this._cloneObject(attributeElement.originalAttributeObject);
          this._updateDependentAttributes(attributeElement, true);
          attributeElement.changed = false;
      }
      this.mode = "view";
  }
  _cloneObject(o) {
      return DataHelper.cloneObject(o);
  }

  _isMultipleGroups() {
      return this.attributesGroups.length > 1;
  }

  _getMultiAttributeClass(){
      return this._isMultipleGroups() ? "multi-attribute-group" : "";
  }

  /**
   * <b><i>Content development is under progress... </b></i> 
   */
  updateDependentAttributesAndResetErrors(e) {
      if(e) {
          let attribute = e.currentTarget || e.sourceElement;
          /***
           * Bug 337779: When there are more than 30 attributes in list,
           * due to lazy loading feature of attributes in list as user scrolls down
           * changed nested attributes up above the list as well reloading
           * As changed child attribute values not propagating till attribute-list control.
           * Hence had to update nested one manually
           * */
          this._updateNestedAttributeObject(attribute);
          let isRevertClicked = e.detail.revertClicked;
          this._updateDependentAttributes(attribute, isRevertClicked);
      }

      this._calculateErrorLength(this.attributeValues);
  }

  _updateNestedAttributeObject(attribute) {
      if(attribute && attribute.attributeModelObject && attribute.attributeModelObject.dataType && attribute.attributeModelObject.dataType.toLowerCase() === "nested") {
          let attributeName = attribute.attributeModelObject.name;
          let attributeGroupName = this.needAttributesGrouping ? attribute.attributeModelObject.groupName : this.groupName;
          let attributesGroup = !_.isEmpty(this.attributesGroups) ? this.attributesGroups.find(group => group.groupName === attributeGroupName) : undefined;
          if(attributesGroup && !_.isEmpty(attributesGroup.attributes)) {
              let groupIndex = this.attributesGroups.indexOf(attributesGroup);
              let attributeFromGroup = attributesGroup.attributes.find(attr => attr.name === attributeName);
              if(attributeFromGroup) {
                  let attributeIndex = attributesGroup.attributes.indexOf(attributeFromGroup);
                  this.attributesGroups[groupIndex].attributes[attributeIndex] = attribute.attributeObject;
              }
          }
      }
  }

  _updateDependentAttributes(currentAttribute, isRevertButtonClicked) {
      let dependentAttributeElements = this.getDependentAttributeElements(currentAttribute);
      DataHelper.updateDependentAttributeElements(dependentAttributeElements, currentAttribute, isRevertButtonClicked);
  }

  _calculateErrorLength(attributeValues) {
      let errorCount = 0;
      for (let i = 0; i < attributeValues.length; i++) {
          let att = attributeValues[i];
          if (att.errors && att.errors.length > 0) {
              errorCount++;
          }
      }

      this.fireBedrockEvent("error-length-changed", errorCount, {
          ignoreId: true
      });
  }
  //On messages change re-calculate tab error length
  _onAttributeMessagesChange() {
      if (this.attributeValues && this.attributeMessages) {
          for (let i = 0; i < this.attributeValues.length; i++) {
              let _currentAttribute = this.attributeValues[i];
              if (this.attributeMessages[_currentAttribute.name]) {
                  if (!_currentAttribute["errors"] || _currentAttribute["errors"].length == 0) {
                      _currentAttribute["errors"] = this.attributeMessages[_currentAttribute.name];
                  }
              }
          }
      }
  }
  _onModeChange(e) {
      const mode = e.detail.mode;
      
      if(!mode) return;

      this.mode = mode;

      this.dispatchEvent(new CustomEvent("list-mode-changed", {
          detail: { mode }, 
          bubbles: true, 
          composed: true
      }));
  }
  /**
   * Can be used to get the elements if they are dirty.
   */
  getIsDirty() {
      let changedAttributeElements = this.getChangedAttributeElements();
      return !!(changedAttributeElements && changedAttributeElements.length);
  }
  /**
  * Can be used to get the controls if they are dirty.
  */
  getControlIsDirty() {
      return this.mode == "edit";
  }
  _checkRenderGroupBar(groupName) {
      if (this._previousViewName === groupName) return false;

      this._previousViewName = groupName;

      if(this.needAttributesGrouping && this._isMultipleGroups()) return true;

      return this._isMultipleGroups();
  }

  _getAttributeGroupTitle(groupName) {
      return this.needAttributesGrouping ? groupName : this.groupName;
  }

  _getAttributeMessage(attribute) {
      if (attribute && this.attributeMessages) {
          let messages = this.attributeMessages[attribute.name];
          if (messages && messages.length) {
              return messages;
          }
      }
      return [];
  }
  /**
       * <b><i>Content development is under progress... </b></i> 
      */
  hasModelErrors() {
      let _attributes = dom(this).node.querySelectorAll('rock-attribute');
      if (_attributes == undefined || _attributes.length == 0) {
          _attributes = dom(this).node.root.querySelectorAll('rock-attribute');
      }
      for (let i = 0; i < _attributes.length; i++) {
          if (_attributes[i].hasModelErrors()) {
              return true;
          }
      }
      return false;
  }
  _getTabIndex(attribute) {
      return this._runningTabIndex++;
  }
  getAttributeValues() {
      return this.attributeValues;
  }
  _ondeletingAttribute(e, detail) {
      let attributeModelObject = detail.data;
      let attribute = this.attributeValues.find(obj => obj.name === attributeModelObject.name);
      if(attribute) {
          let index = this.attributeValues.indexOf(attribute);
          this.splice("attributeValues", index, 1);
          this.fireBedrockEvent("attribute-control-delete", { data: attribute }, { ignoreId: true });
      }
  }
  _getDependentAttributes(currentAttribute) {
      let dependentAttributeModels = DataHelper.getDependentAttributeModels(this.attributeModels, this.dependentAttributeModels, currentAttribute);
      let dependentAttributeValues = [];

      if(!_.isEmpty(this.dependentAttributeValues)) {
          for(let attributeName in dependentAttributeModels) {

              let dependentAttributeModel = dependentAttributeModels[attributeName];
              for(let j = 0; j < this.dependentAttributeValues.length; j++) {
                  if(dependentAttributeModel.name === this.dependentAttributeValues[j].name) {
                      dependentAttributeValues.push(this.dependentAttributeValues[j]);
                      break;
                  }
              }
          }
      }

      return dependentAttributeValues;
  }
  _getDependentAttributeModels(currentAttribute) {
      return DataHelper.getDependentAttributeModels(this.attributeModels, this.dependentAttributeModels, currentAttribute);
  }
}
customElements.define(RockAttributeList.is, RockAttributeList);
