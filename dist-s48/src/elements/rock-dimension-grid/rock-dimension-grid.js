/**
`rock-dimension-grid` Represents a component that displays the dimension value of the given attribute.
It also updates or adds the current and future value for that attribute.

It displays dimensions like locale, source, context, and time.
The user can select any dimension where locale, source, and context is shown in "multiselect LOVs". 
The time is displayed in the "date-time-picker" control. The user can select the time range to list the attribute's 
history and future value.

The grid renders the data based on the selected dimensions from the left panel.
The user can view the past data but cannot modify it. However he/she can add or update the current and future value.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-helpers/format-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-floating.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-entity-data-save/liquid-entity-data-save.js';
import '../rock-grid-data-sources/entity-dimension-grid-datasource.js';
import '../pebble-checkbox/pebble-checkbox.js';
import '../pebble-accordion/pebble-accordion.js';
import '../pebble-button/pebble-button.js';
import '../pebble-tree/pebble-tree.js';
import '../pebble-lov/pebble-lov.js';
import '../pebble-horizontal-divider/pebble-horizontal-divider.js';
import '../rock-grid/rock-grid.js';
import '../rock-layout/rock-layout.js';
import '../rock-layout/rock-titlebar/rock-titlebar.js';
import '../rock-entity-lov/rock-entity-lov.js';
import '../rock-context-lov/rock-context-lov.js';
import '../rock-entity-model-lov/rock-entity-model-lov.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockDimensionGrid
  extends mixinBehaviors([
    RUFBehaviors.UIBehavior,
    RUFBehaviors.ComponentContextBehavior,
    RUFBehaviors.ComponentConfigBehavior
  ], PolymerElement) {
  static get template() {
    return html`
    <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-floating bedrock-style-grid-layout">
      :host {
        display:block;
        height:100%;
        --pebble-grid-container: {
          margin-top:0px;
          margin-bottom:0px;
        };
        --pebble-grid-container-header: {
          padding-right: 0;
          padding-left: 0;
        };
        --rock-grid-actions:{
          display:none;
        }
      }
      #dimensionGridContainer {
        height: 100%;
      }

      #dimensionFilters {
        width: 310px;
        float: left;
        height: 100%;
        padding-right: 10px;
        overflow: auto;        
      }

      #dimensionGrid {
        width: calc(100% - 320px);
        float: right;
      }
      
      pebble-lov {
        width: 100%;
        position: static !important;
      }

      .action-container {
        text-align: center;
      }

      pebble-lov {
        --pebble-lov-height: 125px;
      }

      pebble-checkbox {
        margin-top: 3px;
      }
    </style>
    <div id="dimensionGridContainer" class="full-height">
      <div id="dimensionFilters">
        <template is="dom-repeat" items="[[_updatedDimensionConfigs]]" as="configDataItem" notify-dom-change="">
          <div hidden\$="[[configDataItem.hidden]]">
            <pebble-accordion header-text="[[configDataItem.title]]">
             <div class="full-height" slot="accordion-content">
                <rock-entity-lov id="[[configDataItem.id]]" r-data="[[configDataItem]]" config-data-item-id="[[configDataItem.id]]" id-field="[[configDataItem.dataMappings.id]]" title-pattern="[[configDataItem.dataMappings.title]]" request-data="[[configDataItem.dataRequest]]" type-field="[[configDataItem.dataMappings.type]]" sort-field="[[configDataItem.dataMappings.sort]]" external-data-formatter="[[_entityExternalDataFormatter]]" on-selection-changed="_onDimensionChange" multi-select="" no-sub-title=""></rock-entity-lov>
                </div>
            </pebble-accordion>
          </div>
        </template>        
      </div>
      <div id="dimensionGrid" class="full-height">       
        <rock-grid config="[[_gridConfig]]" page-size="{{totalCount}}" attribute-models="[[gridAttributeModel]]" total-count="{{totalCount}}" context-data="[[_gridContextData]]"></rock-grid>
      </div>
      <div class="clearfix"></div>
    </div>
    <entity-dimension-grid-datasource id="searchGridDatasource" context-data="[[contextData]]" value-contexts="{{_valueContexts}}" contexts="{{_contexts}}" request="{{_request}}" r-data-source="{{rDataSource}}" total-count="{{totalCount}}"></entity-dimension-grid-datasource>
    <liquid-entity-model-get id="userModelGet" operation="getbyids" on-response="_onUserModelGetResponse"></liquid-entity-model-get>
`;
  }

  static get is() { return 'rock-dimension-grid' }
  static get properties() {
    return {
      contextData: {
        type: Object,
        value: function () {
          return {};
        },
        observer: "_onContextDataChange"
      },
      /*
       * Indicates an identifier for an entity.
       */
      dataId: {
        type: String,
        notify: true,
        value: ""
      },
      /*
       * Indicates an attribute model object of the given entity 
       * for which dimension values are rendered.
       */
      attributeModelObject: {
        type: String,
        value: function () {
          return {};
        }
      },

      /**
       * Indicates dimensions configuration
       */
      dimensionConfigs: {
        type: Array,
        value: function () {
          return [];
        }
      },
      _updatedDimensionConfigs: {
        type: Array,
        value: function () {
          return [];
        }
      },
      rDataSource: {
        type: Function
      },
      totalCount: {
        type: Number,
        value: 100
      },
      entityId: {
        type: String,
        value: ""
      },
      entityType: {
        type: String,
        value: ""
      },
      _valueContexts: {
        type: Array,
        value: function () {
          return []
        }
      },
      _contexts: {
        type: Array,
        value: function () {
          return []
        }
      },
      _dataContextModelObjects: {
        type: Object,
        value: function () {
          return {}
        }
      },
      _valueContextModelObjects: {
        type: Object,
        value: function () {
          return {}
        }
      },
      /*
       * Indicates request object based on current selected dimension objects.
       */
      _request: {
        type: Object,
        value: function () {
          return {};
        }
      },

      /*
       * Indicates save request object based on current selected dimension objects.
       */
      _saveRequest: {
        type: Object,
        value: function () {
          return {};
        }
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
      appName: {
        type: String,
        value: ""
      },
      dataType: {
        type: String,
        value: ""
      },
      _gridContextData: {
        type: Object,
        value: function () {
          return {};
        }
      }
    }
  }


  _onContextDataChange() {
    let context = DataHelper.cloneObject(this.contextData);
    context[ContextHelper.CONTEXT_TYPE_APP] = [{
      "app": this.appName
    }];

    if (!_.isEmpty(context)) {
      this.requestConfig('rock-dimension-grid', context);
    }
  }

  onConfigLoaded(componentConfig) {
      if(componentConfig && componentConfig.config) {
        this._gridConfig = componentConfig.config.gridConfig;
        this.dimensionConfigs = DataHelper.convertObjectToArray(componentConfig.config.dimensionsConfig);
        this.triggerSetup();
      }
  }

  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  async triggerSetup () {
     this.entityId = DataHelper.getParamValue('id');
     this.entityType = DataHelper.getParamValue('type');
     let dataModelObject = {}

     if(this.dimensionConfigs){
         let arrayToObj = {}
         for (let i = 0; i < this.dimensionConfigs.length; i++) {
           const dimension = this.dimensionConfigs[i];
           if(dimension){
             arrayToObj[dimension.id] = dimension;
             if(dimension.id === "context"){
               dataModelObject = dimension;
               this._dataContextModelObjects[dimension.id] = dimension;
               this._dataContextModelObjects[dimension.id]["selectedItems"] = [];
             }
           }
         }
     
         if (!_.isEmpty(this.contextData) && !_.isEmpty(arrayToObj)) {
           let dataContexts = this.getDataContexts();
           let valueContexts = this.getValueContexts();
           let dataContextKey = dataModelObject.id;
           let domainContexts = ContextHelper.getDomainContexts(this.contextData);
           let domain = domainContexts[0]["domain"];
           let dataContextType = await ContextModelManager.getContextTypesBasedOnDomain(domain);
           if(!_.isEmpty(dataModelObject)){
               if(_.isEmpty(dataContexts)){
                     this._dataContextModelObjects[dataContextKey]["selectedItems"] = [];
                 }else{
                   dataContexts.forEach(function(contextObj){
                   for (const contextKey in contextObj) {
                     if (contextObj.hasOwnProperty(contextKey)) {
                         let _obj = {
                           id:contextObj[contextKey],
                           title:contextObj[contextKey],
                           type:contextKey
                         }
                       
                         if(this._dataContextModelObjects[dataContextKey]){
                           this._dataContextModelObjects[dataContextKey]["selectedItems"].push(_obj);
                         }else{
                           this._dataContextModelObjects[dataContextKey] = arrayToObj[contextKey];
                           this._dataContextModelObjects[dataContextKey]["selectedItems"] = [ _obj ];
                         }
                   
                       }
                   }
                 }.bind(this));
               }
               let reqData = {
                             "params": {
                                 "query": {
                                     "filters": {
                                         "typesCriterion": dataContextType
                                     }
                                 }
                             }
                         };
               this._dataContextModelObjects[dataContextKey]["dataRequest"] = reqData;
               this._dataContextModelObjects[dataContextKey]["dataMappings"] = {"id":"name"};
               this._dataContextModelObjects[dataContextKey]["dataMappings"]["title"] = "name"
               this._dataContextModelObjects[dataContextKey]["dataMappings"]["type"] = dataContextType
         }
           
           valueContexts.forEach(function(valueContextObj){
               for (const valueContextKey in valueContextObj) {
                 if (valueContextObj.hasOwnProperty(valueContextKey) && arrayToObj[valueContextKey]) {
                     let _obj = {
                       id:valueContextObj[valueContextKey],
                       // title:valueContextObj[valueContextKey],
                       type:valueContextKey
                     }
                     let reqData = {
                         "params": {
                             "query": {
                                 "filters": {
                                     "typesCriterion": [valueContextKey]
                                 }
                             }
                         }
                     };
                     if(this._valueContextModelObjects[valueContextKey]){
                       let existingObjects = this._valueContextModelObjects[valueContextKey]["selectedItems"].filter( contextObj => {
                         return ((contextObj.id == _obj.id) && (contextObj.type == _obj.type) && (contextObj.title == _obj.title) )
                       })
                       if(_.isEmpty(existingObjects)){
                         this._valueContextModelObjects[valueContextKey]["selectedItems"].push( _obj );
                       }
                     }else{
                       this._valueContextModelObjects[valueContextKey] = arrayToObj[valueContextKey];
                       this._valueContextModelObjects[valueContextKey]["selectedItems"] = [ _obj ];
                     }
                     this._valueContextModelObjects[valueContextKey]["dataRequest"] = reqData;
                     this._valueContextModelObjects[valueContextKey]["dataMappings"]["id"] = "name";
                     this._valueContextModelObjects[valueContextKey]["dataMappings"]["title"] = "externalname";
                 }
               }
           }.bind(this));

     }

     this.set("_updatedDimensionConfigs", this.dimensionConfigs);

     let fields = this._gridConfig.itemConfig.fields;
     let modelObject = JSON.parse(this.attributeModelObject);
     if (!_.isEmpty(fields)) {
       for (let key in fields) {
         if (fields[key].header.toLowerCase() == "value") {
           fields[key].name = modelObject.name;
           if(modelObject.dataType === "nested") {
             fields[key].isNested = true;
           }
         }
       }
     }

     let attrModels = {};
     
     modelObject = JSON.parse(this.attributeModelObject);
     
     attrModels[modelObject.name] = modelObject;

     this.gridAttributeModel = undefined;
     this.gridAttributeModel = attrModels;

     setTimeout(() => {
       this._setDimensionSelection();
       this._onSelectionChange();
     }, 0)
   }
  }
  _entityExternalDataFormatter (data) {
      if(data && data.length > 0){
        let localeManager = ComponentHelper.getLocaleManager();
        data.forEach(function(element){
            if(element && !_.isEmpty(element)){
              if(element.title){
                let title = element.title;
                element.id = title;
              }
              if(element.type == "locale"){
                let localeObj = localeManager.getByName(element.id);
                if (!_.isEmpty(localeObj) && localeObj.externalName) {
                  element.title = localeObj.externalName;
                }
              }
            }
          }.bind(this))
      }
      return data;
  }

  _onDimensionChange (e) {
    if (e.currentTarget.selectedItems) {
      this._onSelectionChange(e);
    }
  }

  _onSelectionChange (event) {
    if (this.dataId) {
        let attributeNames = [];
        let modelObject = JSON.parse(this.attributeModelObject);
        attributeNames.push(modelObject.name);

        let newDimensions = {};

        for (const valueContext in this._valueContextModelObjects) {
          if(this._valueContextModelObjects[valueContext]){
            if(event && event.currentTarget && event.currentTarget.id === valueContext) {
              this._valueContextModelObjects[valueContext].selectedItems = event.currentTarget.selectedItems;
            }
            let selectedItems = this._valueContextModelObjects[valueContext].selectedItems;
            let values = [];
            if(selectedItems.length > 0) {
              selectedItems.forEach(function(selectedItem) {
                values.push(selectedItem.id);
              });
              newDimensions[valueContext] = values;
            }
          }
        }
        for (const context in this._dataContextModelObjects) {
          if(this._dataContextModelObjects[context]){
            if(event && event.currentTarget && event.currentTarget.id === context) {
              this._dataContextModelObjects[context].selectedItems = event.currentTarget.selectedItems;
            }
            let selectedItems = this._dataContextModelObjects[context].selectedItems;
            if(selectedItems.length > 0) {
              selectedItems.forEach(function(selectedItem) {
                if(!newDimensions[selectedItem.type]){
                  newDimensions[selectedItem.type] = [];
                }
                newDimensions[selectedItem.type].push(selectedItem.id)
            });
          }
          }
        }

        let contextData = {};
        ContextHelper.updateContextData(contextData, newDimensions);
        this.set("_gridContextData", contextData);
        let dataContexts = ContextHelper.getDataContexts(contextData);
        let valueContexts = ContextHelper.getValueContexts(contextData);

        if(!modelObject.isLocalizable) {
          valueContexts = [DataHelper.getDefaultValContext()];
        }

        this.set("_valueContexts", valueContexts);
        this.set("_contexts", dataContexts);

        let req = {
          "params": {
            "query": {
              "filters": {
                "typesCriterion": [
                  "entitymanageevent"
                ],
                "attributesCriterion": [
                  {
                    "entityId": {
                      "exact": this.dataId
                    }
                  },
                  {
                  "eventType":{
                      "exact":"NoChange",
                      "not":true
                    }
                  }
                ]
        
              }
            },
            "sort": {
              "properties": [
                {
                  "modifiedDate": "_DESC",
                  "sortType": "_DATETIME"
                }
              ]
            }

          }
        };

        let relationshipName = modelObject.relationshipName;
        if(relationshipName){
          req.params.fields = {
            "relationships": [relationshipName],
            "relationshipAttributes":attributeNames
          }
        }else{
          req.params.fields = {
            "attributes": attributeNames,
          }
        }
        //relationships criterion
        if(modelObject.relatedEntityType && modelObject.relationshipId && modelObject.relationshipName){
          let relObject = {};
          relObject[modelObject.relationshipName] = {
            relTo:{
              id:modelObject.relationshipId,
              type:modelObject.relatedEntityType
            }
          }
          req.params.query.filters['relationshipsCriterion'] = [relObject];
        }
        this._request = req;
       this.rDataSource({page: 0, pageSize: this.totalCount, resetSearch:true}, this._onAttributesGetResponse.bind(this), this._onAttributesGetErrorResponse.bind(this))
      }
  }

  _onAttributesGetResponse(res){
      if (res && res.status && (res.status == "success")) {
        let data = [];
        let modelObject = JSON.parse(this.attributeModelObject);
        let relationshipName = modelObject.relationshipName;
        let attrName = modelObject.name;
        let userIdList = [];
        let localeManager = ComponentHelper.getLocaleManager();

        if (res.content && res.content.events && res.content.events.length > 0) {
          let events = res.content.events;
          let columns = DataHelper.convertObjectToArray(this._gridConfig.itemConfig.fields);
          let _self = this;
          events.forEach(function (eventObj) {
            if(_self._contexts.length > 0) {
              for(let ctxIdx = 0; ctxIdx < _self._contexts.length; ctxIdx++) {
                let context = _self._contexts[ctxIdx];
                let _attribute = _self._getAttribute(eventObj, relationshipName, attrName, context);
                
                if(_attribute && ((_attribute.values && _attribute.values.length > 0)  || (_attribute.group && _attribute.group.length > 0))) {
                  _self._updateData(data, userIdList, eventObj, columns, _attribute, localeManager, attrName, modelObject, _self);
                }
              }
            } else {
              let _attribute = _self._getAttribute(eventObj, relationshipName, attrName);
              if(_attribute && ((_attribute.values && _attribute.values.length > 0)  || (_attribute.group && _attribute.group.length > 0))) {
                _self._updateData(data, userIdList, eventObj, columns, _attribute, localeManager, attrName, modelObject,  _self);
              }
            }
          });
          this._gridData = data;
          if(userIdList.length > 0){
              this._getUserList(userIdList);
          } else{
              this._populateGrid();
          }
        }
      }
  }

  _getAttribute(entity, relationshipName, attributeName, context) {
    let _attribute;
    let isSelfContext = !_.isEmpty(context) ? false : true;
    if(relationshipName){
      let _relationshipDataArray;
      let relationships;

      relationships = EntityHelper.getRelationshipsBasedOnContext(entity, context, isSelfContext);

      if(relationships) {
        _relationshipDataArray = relationships[relationshipName];
      }
      
      if(_relationshipDataArray && _relationshipDataArray.length > 0){
        let relAttributes = _relationshipDataArray[0].attributes;
        if(relAttributes && relAttributes[attributeName]){
            _attribute = relAttributes[attributeName];
            let relProperties = _relationshipDataArray[0].properties;
            if(_attribute && relProperties){
              _attribute.properties = relProperties;
            }
        }
      }
    }else{
      _attribute = EntityHelper.getattributeBasedOnContext(entity, attributeName, context);
    }

    return _attribute;
  }

  _updateData(data, userIdList, eventObj, columns, _attribute, localeManager, attributeName, attributeModel, self) {
    let firstValue, record, attrKey, attrValue, temporalDivElement;
    for(let valCtxIdx = 0; valCtxIdx < self._valueContexts.length; valCtxIdx++) {
      let valCtx = self._valueContexts[valCtxIdx];
      if(!_.isEmpty(_attribute.values)) {
        firstValue = AttributeHelper.getCurrentValue(_attribute.values, valCtx, attributeModel);
      } else if(!_.isEmpty(_attribute.group)) {
        let values = _attribute.group.filter(item => item.locale === valCtx.locale)
        if(!_.isEmpty(values)) {
          firstValue = {
            "value": values
          }
          AttributeHelper.populateValueContext(firstValue, valCtx);
        }
      }
      
      if(!_.isEmpty(firstValue)) {
        record = {};
        for (let i = 0; i < columns.length; i++) {
          const column = columns[i];
          attrKey = column.name.toLowerCase();
          if(firstValue[attrKey]){
            record[column.name] = firstValue[attrKey];
            if(attrKey == "locale"){
              record["localeId"] = firstValue[attrKey];
              let localeObj = localeManager.getByName(firstValue[attrKey]);
              if (!_.isEmpty(localeObj) && localeObj.externalName) {
                record[column.name] = localeObj.externalName;
              }
            }
          }
        }
        attrValue = "";
        if(firstValue.value){
          attrValue = firstValue.value;
          let _currentValue = "";
          if(Array.isArray(attrValue)){
            _currentValue = attrValue[0].value ? attrValue[0].value : attrValue[0]
          }else{
            _currentValue = attrValue;
          }
          if(_currentValue == ConstantHelper.NULL_VALUE){
            attrValue = "NULL";
            record["isNullValue"] = true;
          }
        }
        
        switch(attributeModel.displayType) {
          case "richtexteditor": {
            // TO-DO: Need to replace with rich text editor
            // temporary solution - stipe html tags from value and display only text
            temporalDivElement = document.createElement("div");
            temporalDivElement.innerHTML = attrValue;
            attrValue = temporalDivElement.textContent || temporalDivElement.innerText || "";
            temporalDivElement = null;
            break;
          }
          default: {
            break;
          }
        }
        record[attributeName] = attrValue;
        record.isValid = true;
        if(_attribute.properties){
          if(_attribute.properties.changeType){
              let changeType = _attribute.properties.changeType;
              if((changeType == "addAttributeToContext") 
                  || (changeType == "addValueToAttribute")
                  || (changeType == "addContext") 
                  || (changeType == "addAttributeToRelationship")){
                  record.icon = "pebble-icon:action-add";
                  if(_.isEmpty(attrValue)){
                      record.isValid = false;
                  }
              }else if((changeType == "deleteAttributeValuesFromContext") || (changeType == "deleteAttributeFromContext")){
                  record.icon = 'pebble-icon:action-delete';
                  record[attributeName] = "";
                  record["isEmptyValue"] = true;
              }else{
                  record.icon = 'pebble-icon:action-edit';
              }
          }
        }
        if(eventObj.properties && eventObj.properties.modifiedDate){
          record.Time = FormatHelper.convertFromISODateTimeToClientFormat(eventObj.properties.modifiedDate, 'datetime');
        }
        if(eventObj.properties && eventObj.properties.modifiedBy){
          let userId = eventObj.properties.modifiedBy;
          if(userIdList.indexOf(userId) == -1){
            userIdList.push(userId);
          }
          record.userId = userId; 
        }
        if(record.isValid){
          data.push(record);
        }
      }
    }
  }

  _getUserList(userIdList){
    let req = {
          "params": {
            "query": {
                "ids": userIdList,
                "filters": {
                    "typesCriterion": [
                        "user"
                    ]
                }
            },
            "fields": {
              "properties":[
                "firstName","lastName"
              ],
              // attributes are added to get the properties
              "attributes": [
                  "_ALL"
              ]
            }
        }
    };
    let liqUserModelsGet = this.$$("#userModelGet");
    if (liqUserModelsGet) {
      liqUserModelsGet.requestData = req;
      liqUserModelsGet.generateRequest();
    }
  }

  _onAttributesGetErrorResponse(e){
    console.error(e);
  }
  _onSelectAll (e) {
    const target = e.currentTarget;
    
    const entityType = target.id;
    
    let nodeId;
    let objectKey;
    
    switch(entityType) {
      case 'localeChk':
        nodeId = 'locale';
        objectKey = '_selectedLocales';
        break;
      case 'sourceChk':
        nodeId = 'source';
        objectKey = '_selectedSources';
        break;
      case 'channelChk':
        nodeId = 'channel';
        objectKey = '_selectedChannels';
        break;
      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }

    const node = dom(this).node.shadowRoot.querySelector(`rock-entity-model-lov[id=${nodeId}]`);

    node.selectedItems = target.checked ? this._getAllItemsOfLov(node): [];

    this[objectKey] = node.selectedItems;
  }

  _getAllItemsOfLov (lovElement) {
    let items = [];

    if (lovElement) {
      let pebbleLov = dom(lovElement).node.shadowRoot.querySelector('pebble-lov');
      if (pebbleLov) {
        items = pebbleLov.$.selector.items;
      }
    }

    return items;
  }

  _saveAction (e) {
    let attributesJSON = {};
    let grid = dom(this).node.shadowRoot.querySelector('rock-grid');
    let modelObject = JSON.parse(this.attributeModelObject);
    let attrName = modelObject.name;

    if (grid) {
      let data = grid.data;

      let entityData = {};
      if (this.response && this.response.content && this.response.content.entities) {
        let entities = DataHelper.cloneObject(this.response.content.entities);
        if (!_.isEmpty(entities)) {
          entityData = entities[0];
        }
      }

      if (!_.isEmpty(entityData)) {

        data.forEach(function (item) {
          item.Channel = _.isEmpty(item.Channel) ? item.Channel = 'self' : item.Channel;
          if (attributesJSON[item.Channel] == undefined) {
            attributesJSON[item.Channel] = {};
            attributesJSON[item.Channel][attrName] = {};
            attributesJSON[item.Channel][attrName].values = [];
          }

          if (attributesJSON[item.Channel][attrName]) {
            attributesJSON[item.Channel][attrName].values.push({
              "value": item[attrName],
              "source": item.Source,
              "locale": item.Locale
            })
          }
        }, this);

        if (this.dataId == entityData.id) {
          if (entityData.data) {
            if (!_.isEmpty(entityData.data.contexts)) {
              entityData.data.contexts.forEach(function (item) {
                if (attributesJSON[item.context.channel]) {
                  item.attributes = attributesJSON[item.context.channel];
                }
              }, this);
            }

            if (!_.isEmpty(entityData.data.attributes)) {
              entityData.data.attributes = attributesJSON['self'];
            }
          }

        }

        //set requestObject for save liquid
        this._saveRequest = {
          "entities": entityData
        };

        let liquidSave = this.shadowRoot.querySelector("[name=attributeSaveDataService]");
        if (liquidSave) {
          liquidSave.generateRequest();
        }
      }
    }
  }

  _cancelAction (e) {
    let dimGrid = dom(this).node.shadowRoot.querySelector('rock-grid');
    let pebbleDialog = this._getParentPebbleDialog(dom(this).node.parentElement);

    if (dimGrid) {
      dimGrid.changeToReadMode();
    }

    if (pebbleDialog) {
      pebbleDialog._close();
    }
    dom(this).node.parentElement.removeChild(this);
  }

  _getParentPebbleDialog (element) {
    if (element) {
      if (element instanceof PebbleDialog) {
        return element;
      } else {
        return this._getParentPebbleDialog(element.parentNode);
      }
    }
    return undefined;
  }

  _onSaveResponse () {
    RUFUtilities.appCommon.toastText = this.saveResponse.content.msg;
    let toastElement = RUFUtilities.pebbleAppToast;
    toastElement.toastType = "success";
    toastElement.heading = "Success";
    toastElement.autoClose = true;

    toastElement.show();
    this._cancelAction();
  }

  _entityGet () {
    if (this.response != undefined) {
      let dimGrid = dom(this).node.shadowRoot.querySelector('rock-grid');
      let data = [];
      let modelObject = JSON.parse(this.attributeModelObject);
      let attrName = modelObject.name;
      let dimensions = {
        "locales": this._selectedLocales,
        "channels": this._selectedChannels,
        "sources": this._selectedSources
      };

      if (this.response && this.response.content && this.response.content.entities) {
        let entity = this.response.content.entities[0];
        if (entity) {
          DataTransformHelper.transformEntityForDimensionGrid(entity, dimensions, modelObject);
          let currentContexts = entity.data.contexts;
          let selfAttributes = entity.data.attributes;

          if (selfAttributes && selfAttributes[attrName]) {
            let values = selfAttributes[attrName].values;
            if (values) {
              values.forEach(function (valueItem) {
                let record = {};
                record[attrName] = valueItem.value;
                record.Locale = valueItem.locale;
                record.Source = valueItem.source;
                record.Channel = "";
                data.push(record);
              }, this);
            }
          }

          if (currentContexts) {
            currentContexts.forEach(function (item) {

              let attributes = item.attributes;

              if (attributes) {
                let values = attributes[attrName].values;
                if (values) {
                  values.forEach(function (valueItem) {
                    let record = {};
                    record[attrName] = valueItem.value;
                    record.Locale = valueItem.locale;
                    record.Source = valueItem.source;
                    record.Channel = item.context.list;
                    data.push(record);
                  }, this);
                }
              }
            }, this);
          }
        }

        if (data) {
          dimGrid.data = data;
          if (dimGrid._getIronDataTable()) {
            dimGrid._getIronDataTable()._sizeChanged(data.length, 0);
            dimGrid.reRenderGrid();
          }
        }
      }
    }
  }

  _getIdsFromObject (arrayObject) {
    let ids = [];
    if (arrayObject) {
      arrayObject.forEach(function (item) {
        ids.push(item.id);
      }, this);
    }
    return ids;
  }

  _setDimensionSelection () {

    for (const dataContext in this._dataContextModelObjects) {
      if (this._dataContextModelObjects.hasOwnProperty(dataContext)) {
        let contextLovElement = this.shadowRoot.querySelector("#"+dataContext);
        if(contextLovElement){
          contextLovElement.selectedItems = this._dataContextModelObjects[dataContext].selectedItems;
        }
      }
    }

    for (const valueContext in this._valueContextModelObjects) {
      if (this._valueContextModelObjects.hasOwnProperty(valueContext)) {
        let entityLovElement = this.shadowRoot.querySelector("#"+valueContext);
        if(entityLovElement){
          entityLovElement.selectedItems = this._valueContextModelObjects[valueContext].selectedItems;
        }
      }
    }
  }

  _onUserModelGetResponse(e){
    let response = e.detail.response;
    if(DataHelper.validateGetModelsResponse(response)){
      let isUserFound = false;
      const userModels = response.content.entityModels;            
      this._gridData.forEach(function(item){    
        if(item.userId) {            
          for(let index = 0; index < userModels.length; index++){
            if(item.userId == userModels[index].id){
              item.user = userModels[index].properties.firstName + ' ' + userModels[index].properties.lastName;
              isUserFound = true;
              break;
            }
          }
          if(!isUserFound){
            item.user = item.userId.replace(/_user$/, "");
          }
        }
      });  
    }
    this._populateGrid(); 
  }

  _populateGrid(){
    if (this._gridData) {
      let dimGrid = this.shadowRoot.querySelector('rock-grid');
      dimGrid.data = this._gridData;
      if (dimGrid._getIronDataTable()) {
        dimGrid._getIronDataTable()._sizeChanged(this._gridData.length, 0);
        dimGrid.reRenderGrid();
      }
    }
  }
}
customElements.define(RockDimensionGrid.is, RockDimensionGrid);
