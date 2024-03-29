import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-helpers/attribute-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../pebble-button/pebble-button.js';
import '../pebble-info-icon/pebble-info-icon.js';
import '../rock-grid/rock-grid.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockNestedAttributeGrid
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior
    ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-padding-margin">
            rock-grid {
                --data-table-container-position: relative;
                --nested-grid-font-size:{
                    font-size:11px;
                }
                --list: {
                    @apply --nested-list;
                }
            }

            .grid {
                margin-top: 10px;
                height: 100% !important
            }

            .attribute-view-wrapper {
                font-size: var(--font-size-sm, 12px);
                font-family: 'Roboto', Helvetica, Arial, sans-serif;
                font-weight: normal;
                font-style: normal;
                font-stretch: normal;
                line-height: 16px;
                text-transform: capitalize;
                color: var(--label-text-color, #96b0c6);
                width:calc(100% - 100px);  
                display:inline-block;              
                @apply --context-coalesce-label;
            }
            .attribute-view-label{
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                display:inline-block;
                max-width:calc(100% - 20px)
            }
        </style>
        <label class="attribute-view-wrapper" hidden\$="[[!_isLabelAvailable(label)]]" aria-hidden="true" title$="[[label]]">
                <span class="attribute-view-label">[[label]]</span>
            <template is="dom-if" if="[[__getDescriptionValue()]]">
                <pebble-info-icon description-object="[[__getDescriptionValue()]]"></pebble-info-icon>
            </template>
        </label>
        <template is="dom-if" if="[[_isEditMode(mode)]]">
            <template is="dom-if" if="[[_isAttributeEditable(attributeModelObject)]]">
                <div class="button">
                    <pebble-button icon="pebble-icon:action-add" id="button_add" class="btn btn-primary m-r-10" button-text="Add" on-click="_onAddRowClick"></pebble-button>
                </div>
            </template>
        </template>
        <div class="grid" hidden\$="[[!_showGrid]]">
            <rock-grid id\$="[[attributeModelObject.name]]-attributesGrid" config="{{_gridConfig}}" data="{{_gridData}}" attribute-models="[[_attributeModels]]" no-header="" page-size="20" is-dirty="{{_isGridDirty}}" context-data="[[contextData]]" apply-locale-coalesce="[[applyLocaleCoalesce]]" apply-graph-coalesced-style\$="[[applyGraphCoalescedStyle]]" dependent-attribute-objects="[[dependentAttributeObjects]]" dependent-attribute-model-objects="[[dependentAttributeModelObjects]]" inline-edit-validation-enabled="">
            </rock-grid>
            <bedrock-pubsub event-name="delete-item" handler="_onRowDelete" target-id="[[attributeModelObject.name]]-attributesGrid"></bedrock-pubsub>
            <bedrock-pubsub event-name="refresh-grid" handler="_onRefreshGrid" target-id="[[attributeModelObject.name]]-attributesGrid"></bedrock-pubsub>
        </div>
`;
  }

  static get is() {
      return 'rock-nested-attribute-grid'
  }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           * Indicates the label for the nested attribute grid.
           * It allows to add descriptive text for the nested attribute to inform the user about the type of data 
           * expected in the nested attribute. 
           */
          label: {
              type: String,
              value: ""
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
          * Indicates the JSON for the attribute value object. This object records all the user changes to the value.
          * Sample: {
                      "value":"Nivea Creme 400 Ml"
                    }
          */
          attributeObject: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true
          },
          /**
          * Indicates the JSON for the original attribute value object. This object does not record all the user changes to the value.
          * Sample: {
                      "value":"Nivea Creme 400 Ml"
                    }
          */
          originalAttributeObject: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
          * Indicates the JSON for the attribute model object.
          * It renders appropriate UI element to edit the attribute, to configure the validation, and other behaviors.
          * Sample: {
                      "name": "name",
                      "externalName": "Name",
                      "displayType": "textbox",
                      "minLength": 5,
                      "maxLength": 10
                    }
          */
          attributeModelObject: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           * Indicates whether or not an attribute object value is changed.
           */
          changed: {
              type: Boolean,
              value: false,
              notify: true,
              reflectToAttribute: true
          },
          applyLocaleCoalesce: {
              type: Boolean,
              value: false
          },
          dependentAttributeObjects: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          dependentAttributeModelObjects: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          applyGraphCoalescedStyle: {
              type: Boolean,
              value: false
          },
          _gridConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _gridData: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _attributeModels: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _isGridDirty: {
              type: Boolean,
              value: false
          },
          _isGridReady: {
              type: Boolean,
              value: false
          },
          _showGrid: {
              type: Boolean,
              value: false
          },
          _mode: {
              type: Boolean,
              value: "view"
          },
          nestedIdentifierKeys:{
              type:Array,
              value:[]
          }
      }
  }
  static get observers() {
      return [
          '_attributeModelObjectChanged(attributeModelObject)',
          '_attributeObjectChanged(attributeObject,attributeObject.value)',
          '_modeChanged(mode)',
          '_gridDataChanged(_isGridDirty)'
      ]
  }

  get attributesGrid() {
      return this.shadowRoot.querySelector("#"+ this.attributeModelObject.name +"-attributesGrid");
  }

  _attributeModelObjectChanged(attributeModelObject) {
      if (!_.isEmpty(attributeModelObject)) {
          this._prepareGridConfig(attributeModelObject);
      }
  }
  _attributeObjectChanged(attributeObject) {
      if (attributeObject.value && attributeObject.value.length == 0) {
          this.originalAttributeObject.value = [];
      }
      if ((!_.isEmpty(attributeObject) && attributeObject.value && (!this._isGridReady || (this.originalAttributeObject &&
          this.originalAttributeObject.value && DataHelper.areEqualArrays(attributeObject.value,
              this.originalAttributeObject.value)))) || (attributeObject.value && attributeObject.value[0] == ConstantHelper.NULL_VALUE)) {
          this._prepareGridData(attributeObject);
      }
  }
  _prepareGridConfig(attributeModelObject) {
      if (attributeModelObject && attributeModelObject.group && attributeModelObject.group.length > 0) {
          let gridConfig = {
              "viewMode": "Tabular",
              "schemaType": "colModel",
              "statusEnabled": true,
              "itemConfig": {
                  "sort": {
                      "default": []
                  },
                  "fields": {}
              },
              "viewConfig": {
                  "tabular": {
                      "settings": {
                          "isMultiSelect": false,
                          "disableSelectAll": true,
                          "rowIdentifier": "groupidentifier",
                          "actions": [{
                              "name": "delete",
                              "icon": "pebble-icon:action-delete",
                              "eventName": "delete-item"
                          }]
                      },
                      "fieldChanges": {}
                  }
              }
          };
          let attributeModels = attributeModelObject.group[0];
          for (let model in attributeModels) {
              attributeModels[model].hasWritePermission = true;
              this.dependentAttributeModelObjects[model] = attributeModels[model];
          }
          gridConfig.mode = this.mode === "edit" ? "edit" : "read";
          this.set("_attributeModels", attributeModels);
          let keys = Object.keys(attributeModels);
          if (keys && keys.length > 0) {
              for (let i = 0; i < keys.length; i++) {
                  let attributeModel = attributeModels[keys[i]];

                  if (attributeModel.sortType || attributeModel.sortSequence) {
                      let columnSortType = {
                          "field": attributeModel.name,
                          "sortType": attributeModel.sortType,
                          "sortSequence": attributeModel.sortSequence
                      };
                      gridConfig.itemConfig.sort.default.push(columnSortType);
                  }
                  let column = {
                      "header": attributeModel.externalName,
                      "name": attributeModel.name,
                      "filterable": true,
                      "sortable": true,
                      "visible": true,
                      "displaySequence": attributeModel.displaySequence,
                      "externalName": attributeModel.externalName
                  };
                  gridConfig.itemConfig.fields[attributeModel.name] = column;
              }
              gridConfig.itemConfig.fields = DataTransformHelper.sortAttributeModels(gridConfig.itemConfig
                  .fields);
          }
          this.set("_gridConfig", gridConfig);
      }
  }

  _prepareGridData(attributeObject) {
      let _gridData = [];
      this.async(function () {
          let hasErrorOrWarnings = false;
          let childAttrModels = this.attributeModelObject.group ? this.attributeModelObject.group[0] : [];
          if(!_.isEmpty(childAttrModels)){
              this.nestedIdentifierKeys = [];
              for (let model in childAttrModels) {
                  if(childAttrModels[model].isAttributeIdentifier && this.nestedIdentifierKeys.indexOf(model) == -1){
                       this.push('nestedIdentifierKeys', model);
                  }
              }
          }
        
          if (attributeObject && attributeObject.value && attributeObject.value.length > 0 && !_.isEmpty(childAttrModels)) {
              let errors = attributeObject.errors && attributeObject.errors.length ? attributeObject.errors[0] : undefined;
              for (let i = 0; i < attributeObject.value.length; i++) {
                  let value = attributeObject.value[i];
                  if (!_gridData.find(obj => value["valueIdentifier"] && (obj.valueIdentifier ===
                      value["valueIdentifier"].value))) {
                      let rowData = {};
                      for (let attrName in value) {
                          let chilAttrModel = childAttrModels[attrName];
                          if (typeof value[attrName] == 'object') {

                              if (chilAttrModel && chilAttrModel.dataType.toLowerCase() == "boolean") {
                                  let childAttrValue = typeof value[attrName].value != 'undefined'  ? value[attrName].value.toString() : "";
                                  if (!_.isEmpty(childAttrValue) && childAttrValue == "true" || childAttrValue == "false") {
                                      rowData[attrName] = childAttrValue == "true" ? chilAttrModel.trueText : chilAttrModel.falseText;
                                  }
                              } else {
                                  rowData[attrName] = value[attrName].value;
                              }
                              if (value[attrName].referenceDataId) {
                                  rowData[attrName + "_referenceDataId"] = value[attrName].referenceDataId;
                              }
                              if (value[attrName].properties) {
                                  rowData[attrName + "_properties"] = value[attrName].properties;
                              }
                              if (value[attrName].contextCoalescePaths) {
                                  rowData[attrName + "_contextCoalescePaths"] = value[
                                      attrName].contextCoalescePaths;
                              }
                              if (value[attrName].os === "graph" && value[attrName].osid && value[attrName].ostype) {
                                  rowData[attrName + "_os"] = value[attrName].os;
                                  rowData[attrName + "_osid"] = value[attrName].osid;
                                  rowData[attrName + "_ostype"] = value[attrName].ostype;
                              }
                          }
                      }
                      if (!_.isEmpty(errors) && DataHelper.isValidObjectPath(value, "valueIdentifier.value") && errors[value.valueIdentifier.value]) {
                          rowData.governanceErrors = errors[value.valueIdentifier.value];
                          hasErrorOrWarnings = true;
                      }
                      if (!this._isRowEmpty(rowData)){
                          _gridData.push(rowData);
                      } 
                  }
              }
          }
          this._gridData = _gridData;
          if (this.attributesGrid && hasErrorOrWarnings) {
              this.attributesGrid.inlineReadValidationEnabled = hasErrorOrWarnings;
          };
          this._originalGridData = DataHelper.cloneObject(this._gridData);
          this._modeChanged(this.mode, true);
      });
      this._isGridReady = true;
  }

  _modeChanged(mode, isReRender) {
      if (this._mode != mode || isReRender) {
          this._mode = mode;
          this._gridData = this._originalGridData ? DataHelper.cloneObject(this._originalGridData) : [];

          const _showGrid = mode === 'edit' || (mode === 'view' && !_.isEmpty(this.attributeObject.value));
          this.set("_showGrid", _showGrid);

          const _gridMode = mode === 'view' ? 'read' : mode;
          this.set('_gridConfig.mode', _gridMode);

          if (this.attributesGrid) {
              this.attributesGrid.reRenderGrid();
          }
      }
  }
  _gridDataChanged(_isGridDirty) {
      if (this.changed != _isGridDirty) {
          this.changed = _isGridDirty;
          this._setAttributeObject();
      }
  }
  __getDescriptionValue() {
      let props = undefined;
      if (this.attributeModelObject) {
          props = {
              'description': []
          };
          if (this.attributeModelObject.externalName && this.attributeModelObject.description) {
              props.description.push(this.attributeModelObject.externalName + ": " + this.attributeModelObject
                  .description);
          }
          if (this.attributeModelObject.group) {
              Object.getOwnPropertyNames(this.attributeModelObject.group[0]).forEach(function (name) {
                  let item = this.attributeModelObject.group[0][name];
                  if (item.externalName && item.description) {
                      props.description.push(item.externalName + ": " + item.description);
                  }
              }.bind(this));
          }
      }
      return props;
  }
  _setAttributeObject() {
      if (this.changed) {
          let modifiedData;
          if (this.attributesGrid) {
              modifiedData = this.attributesGrid.getModifiedData();
          }

          if (modifiedData && modifiedData.length > 0) {
              for (let i = 0; i < modifiedData.length; i++) {
                  let rowData = modifiedData[i];

                  let _status = rowData["_rowStatus"]["status"];
                  let value = this.attributeObject.value.find(obj => obj.valueIdentifier.value ===
                      rowData.valueIdentifier && obj.action !== "delete");
                  let deletedValue = this.attributeObject.value.find(obj => obj.valueIdentifier.value ===
                      rowData.valueIdentifier && obj.action === "delete");
                  let originalVal = this.originalAttributeObject.value.find(obj => obj.valueIdentifier
                      .value === rowData.valueIdentifier);

                  if (this._isRowEmpty(rowData)) {
                      if (value) {
                          /***means user cleared all child attributes in this row. Hence update status to "delete".***/
                          _status = "delete";     
                      }
                  } else {
                      if (!value && !deletedValue) {
                          /***when new row added, we are just modifying grid data, not nested attribute object.
                           * Nested attribute object will be modified only when user enters some value in 
                           * one of the child attributes. This is to make sure we don't send any row with empty data to RDF for save.
                           * Here when "value" and "deletedValue" are undefined, means its a new row added, creating one empty row, pushing it to attribute object
                           * to update the data of this row later***/
                          value = this._getNewValueObject(rowData);
                          this.attributeObject.value.push(value);
                      }
                  }

                  if (value) {
                      if (_status === "delete") {
                          /***find the row with this value, replace it with original data and mark it as delete.
                           * If not replaced with original data, RDF cannot be able to delete the row***/
                          let index = this.attributeObject.value.indexOf(value);
                          if (index !== -1) {
                              if (deletedValue && value.valueIdentifier.value === deletedValue.valueIdentifier
                                  .value || rowData.isNewlyAddedDataRowDelete) {
                                  /***if value and deleted value both are present, user has edited child attribute with
                                   * with isAttributeIdentifier flag first and then cleared all child attributes or marked 
                                   * it delete. In this case to avoid duplicating the rows to be deleted.***/
                                  this.attributeObject.value.splice(index, 1);
                                  let gridIndex = this._gridData.indexOf(rowData);
                                  this._gridData.splice(gridIndex, 1)
                                  if (this.attributesGrid) {
                                      this.attributesGrid.reRenderGrid();
                                  }
                              } else {
                                  if (originalVal) {
                                      /***replace the row data with original row data before marking the row with delete.***/
                                      this.attributeObject.value[index] = DataHelper.cloneObject(
                                          originalVal);
                                      this.attributeObject.value[index]["action"] = "delete";
                                  }else{
                                      /**update attributeObject with empty value ***/
                                      this._updateRowDataWithValue(rowData, value);
                                  }
                              }
                          }
                      } else if (this._isIdentifierUpdated(rowData, originalVal) && !deletedValue) {
                          /***if a child attribute with isAttributeIdentifier flag updated, we need to mark the 
                           * existing row as delete, create new row with new/modified data.***/
                          let index = this.attributeObject.value.indexOf(value);
                          if (index !== -1) {
                              if (originalVal) {
                                  /***replace the row data with original row data before marking the row with delete.***/
                                  this.attributeObject.value[index] = DataHelper.cloneObject(
                                      originalVal);
                              }
                              this.attributeObject.value[index]["action"] = "delete";
                          }

                          /***creating one new empty row***/
                          let valObj = this._getNewValueObject(rowData);
                          /***updating new row with updated data***/
                          this._updateRowDataWithValue(rowData, valObj);
                          /***pushing it to attribute object***/
                          this.attributeObject.value.push(valObj);
                      } else {
                          /***Child attribute without isAttributeIdentifier flag updated, directly
                           * update the original row.***/
                          this._updateRowDataWithValue(rowData, value);
                      }
                  }
              }
          }
          if(!_.isEmpty(this.nestedIdentifierKeys)){
              this._checkforDuplicates();
          }
          this.attributeObject.value = DataHelper.cloneObject(this.attributeObject.value);
      } else if (this.changed === false && _.isEmpty(this.attributeObject)) {
          this.attributeObject = DataHelper.cloneObject(this.originalAttributeObject);
      }
  }

  _checkforDuplicates(){
      let gridData = this.attributesGrid.getData();
      let nestedIdentifierObj = {};
      let attributeModelObject = this.attributeModelObject;
      if (attributeModelObject && attributeModelObject.group && attributeModelObject.group.length > 0 && gridData.length > 0) {
          let childAttrModels = attributeModelObject.group[0];
          for (let dataIndex = 0; dataIndex < gridData.length; dataIndex++) {
              let nestedIdentifierValues = ""
              let gridItem = gridData[dataIndex]
              let externalNameKeyValueObj = {};
              this.nestedIdentifierKeys.forEach((key) => {
                  nestedIdentifierValues += gridItem[key];
                  let attributeExternalName = childAttrModels[key].externalName;
                  externalNameKeyValueObj[attributeExternalName] = gridItem[key];
              })
              gridItem["duplicateKeysName"] = [];
              if(nestedIdentifierObj.hasOwnProperty(nestedIdentifierValues)){
                  let errorMessage = "";

                  for(let key in externalNameKeyValueObj){
                      gridItem["duplicateKeysName"].push(key);
                      gridData[nestedIdentifierObj[nestedIdentifierValues]]["duplicateKeysName"].push(key);
                      errorMessage = !_.isEmpty(errorMessage) ? errorMessage + " , "+ key + " : " + externalNameKeyValueObj[key] : key + " : " + externalNameKeyValueObj[key];
                  }
                  gridItem["duplicateValidationError"] = ["Duplicate row with " + errorMessage];
                  gridData[nestedIdentifierObj[nestedIdentifierValues]]["duplicateValidationError"] = ["Duplicate row with " + errorMessage];
              }else{
                  nestedIdentifierObj[nestedIdentifierValues] = dataIndex;
                  gridItem["duplicateValidationError"] = [];
              }
          }
      }
      this.updateAttributeErrors();
  }
  _isRowEmpty(rowData) {
      let attributes = Object.keys(rowData);
      let self = this;
      if (attributes && attributes.length) {
          let keysWithValue = attributes.filter(function (key) {
              if (self._attributeModels[key] && (!_.isEmpty(rowData[key]) || _.isNumber(
                  rowData[key]))) {
                  return key;
              }
          });
          if (keysWithValue && keysWithValue.length > 0) {
              return false;
          }
      }
      return true;
  }
  _getNewValueObject(rowData) {
      let values = DataTransformHelper.transformNestedAttributes({}, this.attributeModelObject, true);
      let value = values[0];
      value["valueIdentifier"].value = rowData.valueIdentifier;
      return value
  }
  _isIdentifierUpdated(data, value) {
      let identifierAttrName = undefined;
      for (let attrName in this._attributeModels) {
          if (this._attributeModels[attrName] && this._attributeModels[attrName].isAttributeIdentifier ===
              true) {
              identifierAttrName = this._attributeModels[attrName].name;
          }
      }
      if (identifierAttrName) {
          if (value && value[identifierAttrName] && data[identifierAttrName] !== value[
              identifierAttrName].value) {
              return true;
          }
      }
      return false;
  }
  _updateRowDataWithValue(rowData, value) {
      for (let attrName in rowData) {
          if (this._attributeModels[attrName]) {
              value[attrName] = value[attrName] ? value[attrName] : {};
              value[attrName]["value"] = rowData[attrName];
          }
          if (attrName.indexOf("referenceDataId") !== -1) {
              let name = attrName.substring(0, attrName.indexOf("_"));
              value[name]["referenceDataId"] = rowData[attrName];
          }
          if (attrName.indexOf("selectedLocales") !== -1) {
              let name = attrName.substring(0, attrName.indexOf("_"));
              value[name]["selectedLocales"] = rowData[attrName];
          }
      }
  }
  _onRowDelete(e, detail) {
      if(detail.isNewlyAddedDataRowDelete && this._isRowEmpty(detail)){
          /***when try to delete row which is empty, 
           * no need to update attribute objetc, just remove that row from the grid***/
          let gridIndex = this._gridData.indexOf(detail);
          this._gridData.splice(gridIndex, 1)
          if (this.attributesGrid) {
              this.attributesGrid.reRenderGrid();
          }
          if(!_.isEmpty(this.nestedIdentifierKeys)){
              this._checkforDuplicates();
          }
      }else{
          this._notifyDirty();
      }
  }
  _isEditMode(mode) {
      return mode === "edit";
  }
  _isAttributeEditable(attributeModelObject) {
      return attributeModelObject.hasWritePermission && !attributeModelObject.readOnly;
  }
  _onAddRowClick(e) {
      let length = this._gridData.length;
      let values = DataTransformHelper.transformNestedAttributes({}, this.attributeModelObject, true);
      let value = values[0];
      value["valueIdentifier"].value = DataHelper.generateUUID();
      let newRowItem = {};
      for (let attrName in value) {
          newRowItem[attrName] = value[attrName].value;
          if (value[attrName].referenceDataId) {
              newRowItem[attrName + "_referenceDataId"] = value[attrName].referenceDataId;
          }
      }
      if (this.attributesGrid) {
          this.attributesGrid.addNewRecords([newRowItem]);
      }
      if(!_.isEmpty(this.nestedIdentifierKeys)){
          this._checkforDuplicates();
      }

  }
  _notifyDirty() {
      let modifiedData;
      if (this.attributesGrid) {
          modifiedData = this.attributesGrid.getModifiedData();
      }
      if (!_.isEmpty(modifiedData)) {
          this._isGridDirty = undefined;
          this._isGridDirty = true;
      } else {
          this._isGridDirty = undefined;
          this._isGridDirty = false;
      }
  }
  _onRefreshGrid(e, detail) {
      let gridData = DataHelper.cloneObject(this._gridData);
      this._gridData = [];
      this._gridData = gridData;
  }

  _isLabelAvailable(label) {
      if (!_.isEmpty(label)) {
          return true;
      }

      return false;
  }
  getChildAttributeElements() {
      let allChildAttributeElements = [];
      if (this.attributesGrid && this.attributesGrid.getAllAttributeElements) {
          allChildAttributeElements = this.attributesGrid.getAllAttributeElements();
      }

      return allChildAttributeElements;
  }
  updateAttributeErrors() {
      if (this.attributesGrid && this.attributesGrid.updateAttributeErrors) {
          this.attributesGrid.updateAttributeErrors();
      }
  }
}
customElements.define(RockNestedAttributeGrid.is, RockNestedAttributeGrid)
