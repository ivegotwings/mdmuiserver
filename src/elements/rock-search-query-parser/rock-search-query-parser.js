import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/constant-helper.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
/*!
Pass the query string:
The following query string is the sample string which binds to the parser:

"show sku with price > 20 and price<100 and description = Design Art or Wall Decor or Distributive Accessories having hasimages with isprimary = true and hascolorizedimage = true pending newproductsetup newskustosubmit"

*which means show all skus with price value between 20 and 100, description value Design Art or Wall Decor or Distributive Accessories having hasimages relationship with attributes isprimary and hascolrizedimage have value true and which are in new product submit workflow, new skus submit stage.

Stage 1 of parsing is to split the query string with keywords "show", "with", "having" and "pending".

Parsed query json after stage1 looks like:

{
    "show": "sku",
    "with": "price > 20 and price < 100",
    "having": "hasimages with isprimary = true and hascolorizedimage = true",
    "pending": "newproductsetup newskustosubmit"
}

Stage2 is to split the values of each keyword into values based on the keywords present in the value.

Parsed query json after stage2 looks like:

{
    "show": [
        "sku"
    ],
    "with": [
        "price > 20",
        "price < 100",
        "description = Design Art or Wall Decor or Distributive Accessories"
    ],
    "having": [
        {
            "hasimages": {
                "with": [
                    "isprimary = true",
                    "hascolorizedimage = true"
                ]
            }
        }
    ],
    "pending": [
        "newproductsetup",
        "newskustosubmit"
    ]
}

Srage3 is to replace attribute operators between attribute names and it's value with "lte", "gte" or "equals" accordingly.

Parsed query json after stage3 looks like:

{
    "show": [
        "sku"
    ],
    "with": [
        {
            "price": {
                "gte": "20",
                "lte": "100"
            }
        },
        {
            "description": {
                "equals": "Design Art or Wall Decor or Distributive Accessories"
            }
        }
    ],
    "having": [
        {
            "hasimage": {
                "with": [
                    {
                        "isprimary": {
                            "equals": true
                        }
                    },
                    {
                        "hascolorizedimage": {
                            "equals": true
                        }
                    }
                ]
            }
        }
    ],
    "pending": [
        "newproductsetup",
        "newskustosubmit"
    ]
}

Stage 4 is to get the final parsed query to which gives us inputs for the request object preperation for get entities api such as entity data, relationships data and workflow inputs etc.

Parsed query json after stage4 looks like:

{
    "entityData": {
        "types": [
            "sku"
        ],
        "attributes": [
            {
                "price": {
                    "gte": "20",
                    "lte": "20"
                }
            },
            {
                "description": {
                    "equals": "Design Art or Wall Decor or Distributive Accessories"
                }
            }
        ]
    },
    "entityRelationships": {
        "relationshipName": "hasimage",
        "attributes": [
            {
                "isprimary": {
                    "equals": true
                }
            },
            {
                "hascolorizedimage": {
                    "equals": true
                }
            }
        ]
    },
    "workflowCriterion": {
        "workflowShortName": "newproductsetup",
        "workflowActivityName": "newskustosubmit"
    }
}
*/

let queryParser = function () {};

queryParser.options = {};
queryParser.options["startsWith"] = "!%&show&%!";
queryParser.options["keywords"] = ["!%&show&%!", "!%&with&%!", "!%&having&%!", "!%&pending&%!", "!%&_ANY&%!"];
queryParser.options["attributeKeywords"] = ["!%&and&%!"];
queryParser.options["operators"] = ["=", ">", "<"];

queryParser.mappings = {
    "=": "equals",
    ">": "gte",
    "<": "lte"
};

queryParser.parse = function (string, options, mappings) {

    if (!options) {
        options = queryParser.options;
    } else {
        queryParser.options = options;
    }

    if (!mappings) {
        mappings = queryParser.mappings;
    } else {
        queryParser.mappings = mappings;
    }

    if (!string) {
        string = '';
    }

    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }

    if (!string.startsWith(options.startsWith)) {
        return "invalid string";
    }

    let parsedQuery = queryParser.parseQuery(string, true);

    let finalQuery = queryParser.getFinalQuery(parsedQuery, options, mappings);

    return finalQuery;

};

queryParser.parseQuery = function (string, followPreference, isSubQuery) {
    let keywordIndices = queryParser.getKeywordIndices(string, queryParser.options.keywords);

    if(keywordIndices.length > 0) {
        if(followPreference) {
            keywordIndices = queryParser.removeExtraIndices(keywordIndices);
        }
        keywordIndices.sort(function (a, b) { return a.index - b.index });
        let keyValuesFromIndices = queryParser.getKeyValuesFromIndices(string, keywordIndices, isSubQuery);
        
        if(!queryParser.isEmptyObject(keyValuesFromIndices)) {
            let keysWithSplitValuesByKeywords = queryParser.splitValuesByKeywords(keyValuesFromIndices, queryParser.options.attributeKeywords, isSubQuery);

            if(!queryParser.isEmptyObject(keysWithSplitValuesByKeywords)) {
                let keysWithSplitValuesByOperators = queryParser.splitValuesByOperators(keysWithSplitValuesByKeywords, queryParser.options.operators, queryParser.mappings);

                return keysWithSplitValuesByOperators;
            }
        }
    } else {
        return string;
    }
};

queryParser.getKeywordIndices = function (string, keywords) {
    let keywordIndices = [];
    for (let i = 0; i < keywords.length; i++) {
        let keyword = keywords[i];
        let keywordIndex = string.indexOf(keyword);
        if (keywordIndex !== -1) {
            let obj = {
                "key": keyword,
                "index": keywordIndex
            };
            keywordIndices.push(obj);
        }
    }

    if(keywordIndices.length > 0) {
        let obj = {
            "key": "end",
            "index": string.length
        }

        keywordIndices.push(obj);
    }

    return keywordIndices;
};

queryParser.removeExtraIndices = function(indices) {
    let indicesToRemove = [];
    for(let i = 1; i < indices.length; i++) {
        if(indices[i-1].index > indices[i].index) {
            indicesToRemove.push(i-1);
        }
    }

    if(indicesToRemove.length > 0) {
        for(let i=0; i<indicesToRemove.length; i++) {
        let indexToRemove = indicesToRemove[i];
        indices.splice(indexToRemove, 1);
        }
    }
    return indices;
};

queryParser.getKeyValuesFromIndices = function(string, indices, isSubQuery) {
    let keyValues = {};
    if(indices.length > 0 && indices[0].index !== 0) {
        let extraText = string.slice(0, indices[0].index);
        keyValues["extraText"] = extraText.trim();
    }
    
    for(let i=1; i<indices.length; i++) {
        let indexObject = indices[i-1];
        let indexObject1 = indices[i];
        let startIndex = indexObject.index;
        let endIndex = indexObject1.index;
        if(isSubQuery && indexObject.key === "!%&show&%!") {
            endIndex = indices[indices.length -1].index;
            i=indices.length;
        }
        let value = string.slice(startIndex, endIndex);
        let sepIndex = value.indexOf(" ");
        if(sepIndex) {
            value = value.slice(sepIndex + 1).trim();
        }
        keyValues[indexObject.key] = value;
    }

    return keyValues;
};

queryParser.splitValuesByKeywords = function(keyValues, keywords, isSubQuery) {
    let keys = Object.keys(keyValues);

    let valuesSplitByKeywords = {};
    if(keys && keys.length > 0) {
        let extraText;
        let obj = {};
        let regex = queryParser.prepareRegex(keywords);
        for(let i=0; i<keys.length; i++) {
            let key = keys[i];
            let value = keyValues[key];
            key = key.replace(/!|%|&/g,'');
            let valueList = undefined;
            if(key === "having") {
                // send the value for parsing
                valueList = [queryParser.parseQuery(value, false, true)];
            } else if(key === "pending") {
                valueList = value.split(" ");
            } else if(key === "extraText") {
                extraText = value;
            } else if(key === "_ANY") {
                valueList = [value];
            } else if(isSubQuery && key === "show") {
                let val = keys[i] + " " + value;
                valueList = [queryParser.parseQuery(val)];
            } else {
                valueList = value.split(regex).map(function(item) {
                    return item.trim();
                });
            }
            if(valueList) {
                obj[key] = valueList;
            }
        }
        if(extraText) {
            valuesSplitByKeywords[extraText] = obj;
        } else {
            valuesSplitByKeywords = obj;
        }
    }

    return valuesSplitByKeywords;
};

queryParser.splitValuesByOperators = function(keyValues, operators, mappings) {
    let keys = Object.keys(keyValues);

    let valuesSplitByOperators = {};
    if(keys && keys.length > 0) {
        let regex = queryParser.prepareRegex(operators);
        for(let i=0; i<keys.length; i++) {
            let key = keys[i];
            let val = keyValues[key];
            if(val instanceof Array && val.length > 0) {
                for(let j=0; j<val.length; j++) {
                    let value = val[j];
                    if(typeof(value) === "string") {
                        let operator = operators.find(char => value.indexOf(char) !== -1);
                        if(operator) {
                            let sepIndex = value.indexOf(operator);
                            let attrName = value.slice(0,sepIndex).trim();
                            value = value.slice(sepIndex + 1).trim();
                            operator = mappings[operator];
                            let valObj = {};
                            valObj[attrName] = valObj[attrName] || {};
                            valObj[attrName][operator] = value;
                            valuesSplitByOperators[key] = valuesSplitByOperators[key] || [];
                            let existingAttr = valuesSplitByOperators[key].find(obj => obj[attrName] !== undefined);
                            if(existingAttr) {
                                existingAttr[attrName][operator] = value;
                            } else {
                                valuesSplitByOperators[key].push(valObj);
                            }
                        } else {
                            valuesSplitByOperators[key] = valuesSplitByOperators[key] || [];
                            valuesSplitByOperators[key].push(value);
                        }
                    } else {
                        valuesSplitByOperators[key] = valuesSplitByOperators[key] || [];
                        valuesSplitByOperators[key].push(value);
                    }
                }
            } else if(val instanceof Object) {
                let valObj = queryParser.splitValuesByOperators(val, operators, mappings);
                valuesSplitByOperators[key] =[valObj];
            }
        }
    }

    return valuesSplitByOperators;
};

queryParser.getFinalQuery = function(parsedQuery) {
    if(!queryParser.isEmptyObject(parsedQuery)) {
        let finalQuery = {};

        let entityTypes = parsedQuery.show;
        let entityAttributes = parsedQuery.with && parsedQuery.with.length > 0 ? parsedQuery.with : undefined;
        let relatioshipsSection = parsedQuery.having && parsedQuery.having[0] ? parsedQuery.having[0] : undefined;
        let relationshipName;
        let relationshipAttributes;
        let relatedEntityQuery;
        if(relatioshipsSection) {
            if(typeof(relatioshipsSection) === "string") {
                relationshipName = relatioshipsSection;
            } else if(typeof(relatioshipsSection) === "object") {
                relationshipName = Object.keys(relatioshipsSection) && Object.keys(relatioshipsSection).length > 0 ? Object.keys(relatioshipsSection)[0] : undefined;
            }
            if(relationshipName && relatioshipsSection[relationshipName] && relatioshipsSection[relationshipName].length >0 && relatioshipsSection[relationshipName][0]) {
                let relData = relatioshipsSection[relationshipName][0];
                relationshipAttributes = relData.with && relData.with.length > 0 ? relData.with : undefined;
                relatedEntityQuery = relData.show && relData.show.length > 0 ? queryParser.getFinalQuery(relData.show[0]) : undefined;
            }
        }
        let workflowName = parsedQuery.pending && parsedQuery.pending.length > 0 ? parsedQuery.pending[0] : undefined;
        let workflowActivityName = parsedQuery.pending && parsedQuery.pending.length > 0 ? parsedQuery.pending[1] : undefined;

        let searchQuery = parsedQuery._ANY && parsedQuery._ANY.length > 0 ? parsedQuery._ANY[0] : undefined;

        if (entityTypes) {
            let entityData = {
                "types": entityTypes,
                "attributes": entityAttributes
            }
            finalQuery.entityData = entityData;
        }
        if (relationshipName) {
            let entityRelationships = {
                "relationshipName": relationshipName,
                "attributes": relationshipAttributes
            }
            if(relatedEntityQuery) {
                entityRelationships.relatedEntityData = relatedEntityQuery.entityData;
            }
            finalQuery.entityRelationships = entityRelationships;
        }
        if (workflowName && workflowActivityName) {
            let workflowCriterion = {
                "workflowShortName": workflowName,
                "workflowActivityName": workflowActivityName
            }
            finalQuery.workflowCriterion = workflowCriterion;
        }
        if(searchQuery) {
            finalQuery.searchQuery = searchQuery;
        }
        return finalQuery;
    }
};

queryParser.prepareRegex = function(keywords) {
    let strForRegex = "";
    for(let i=0; i<keywords.length; i++) {
        let keyword = keywords[i];
        if(i !== keywords.length - 1) {
            strForRegex = strForRegex + " " + keyword + " |";
        } else {
            strForRegex = strForRegex + " " + keyword;
        }
    }

    let regex = new RegExp(strForRegex, "ig");

    return regex;
};

queryParser.isEmptyObject = function (obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
};
/**

`rock-search-query-parser` Represents the element to be used to parse the query given in search box in entity-discovery page and return the search filters required to prepare request Object for get entities.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
class RockSearchQueryParser extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior],
  PolymerElement) {
  static get template() {
    return html`
    <liquid-entity-model-composite-get name="compositeAttributeModelGet" on-entity-model-composite-get-response="_onCompositeModelGetResponse">
    </liquid-entity-model-composite-get>
    <liquid-entity-model-get id="liquidModelGet" name="attributeModelGet" operation="getbyids" on-error="_onError" on-response="_onAttributeModelsResponse" exclude-in-progress=""></liquid-entity-model-get>
`;
  }

  static get is() {
    return "rock-search-query-parser";
  }
  static get properties() {
    return {
      contextData: {
        type: Object,
        value: function () {
          return {};
        }
      },
      query: {
        type: String,
        value: ""
      },

      parsedQuery: {
        type: Object,
        value: function () {
          return {};
        }
      },
      _entityAttributes: {
        type: Object,
        value: function () {
          return {};
        }
      },
      _relationshipAttributes: {
        type: Object,
        value: function () {
          return {};
        }
      },
      _relatedEntityAttributes: {
        type: Object,
        value: function () {
          return {};
        }
      },
      _relToEntityTypes: {
        type: Array,
        value: function () {
          return [];
        }
      },
      searchFilters: {
        type: Object,
        value: function () {
          return {};
        }
      },
      filterCriterionKey: {
        type: String,
        value: "attributesCriterion"
      },
      //Relationship name is notified from query builder
      relationshipName: {
        type: String,
        value: ""
      },
      _attributeModels: {
        type: Array,
        value: function () {
          return [];
        }
      },
      _attributeNames: {
        type: Array,
        value: function () {
          return [];
        }
      }
    }
  }
  get compositeAttributeModelGetLiq() {
    this._compositeAttributeModelGetLiq = this._compositeAttributeModelGetLiq || this.shadowRoot.querySelector(
      "[name=compositeAttributeModelGet]");
    return this._compositeAttributeModelGetLiq;
  }

  get modelGetLiquid() {
    this._modelGetLiquid = this._modelGetLiquid || this.shadowRoot.querySelector("[name=attributeModelGet]");
    return this._modelGetLiquid;
  }

  parseQueryToFilters(query) {
    let parsedQuery = this.parseQuery(query);
    this.transformQueryToFilters(parsedQuery);
  }

  parseQuery(query) {
    this.set("query", query);
    let parsedQuery = queryParser.parse(query);
    return parsedQuery;
  }

  transformQueryToFilters(queryObject) {
    let clonedContextData = DataHelper.cloneObject(this.contextData);
    let itemContexts = [];
    let itemContext = {};

    let entityTypes = queryObject.entityData && queryObject.entityData.types ? queryObject.entityData.types : [];
    this.searchFilters["typesCriterion"] = entityTypes;

    let searchQuery = queryObject.searchQuery ? queryObject.searchQuery : undefined;
    this.searchFilters["searchQuery"] = searchQuery;

    let workflowCriterion = queryObject.workflowCriterion ? queryObject.workflowCriterion : undefined;
    this.searchFilters["workflowCriterion"] = workflowCriterion;

    let attributeNames = queryObject.entityData && queryObject.entityData.attributes ? this._getAttributeNames(
      queryObject.entityData.attributes) : undefined;
    itemContext.attributeNames = attributeNames;
    this._entityAttributes = queryObject.entityData && queryObject.entityData.attributes ? queryObject.entityData
      .attributes : undefined;

    let relationshipName = queryObject.entityRelationships && queryObject.entityRelationships.relationshipName ?
      queryObject.entityRelationships.relationshipName : undefined;
    this.searchFilters["relationshipName"] = relationshipName;
    if (relationshipName) {
      if (relationshipName.indexOf("!%&") > -1) {
        relationshipName = relationshipName.replace(/!%&/g, "");
      }
      itemContext.relationships = [relationshipName];
      this._relationshipAttributes = queryObject.entityRelationships && queryObject.entityRelationships.attributes ?
        queryObject.entityRelationships.attributes : undefined;
      let relationshipAttributes = this._relationshipAttributes ? this._getAttributeNames(this._relationshipAttributes) :
        ["_ALL"];
      itemContext.relationshipAttributes = relationshipAttributes;

      this._relatedEntityAttributes = undefined;
      this._relToEntityTypes = [];
      if (queryObject.entityRelationships && queryObject.entityRelationships.relatedEntityData) {
        this._relatedEntityAttributes = queryObject.entityRelationships.relatedEntityData.attributes ?
          queryObject.entityRelationships.relatedEntityData.attributes : undefined;
        let relEntityAttributes = this._relatedEntityAttributes ? this._getAttributeNames(this._relatedEntityAttributes) :
          undefined;

        if (relEntityAttributes) {
          if (!itemContext.attributeNames) {
            itemContext.attributeNames = [];
          }
          itemContext.attributeNames = itemContext.attributeNames.concat(relEntityAttributes);
        }

        this._relToEntityTypes = queryObject.entityRelationships.relatedEntityData.types || [];
        entityTypes = entityTypes.concat(this._relToEntityTypes);
      }
    }

    this.set("_attributeNames", itemContext.attributeNames);

    if (entityTypes && entityTypes.length > 0) {
      this._currentIndex = entityTypes.length;
      this._currentItems = [];
      for (let i = 0; i < entityTypes.length; i++) {
        let entityType = entityTypes[i];

        itemContext.type = entityType;

        itemContexts.push(itemContext);
        clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = itemContexts;

        let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(clonedContextData);

        if (this.compositeAttributeModelGetLiq && compositeModelGetRequest) {
          if (compositeModelGetRequest.params.query.name) {
            delete compositeModelGetRequest.params.query.name;
          }
          compositeModelGetRequest.params.query.id = entityType + "_entityCompositeModel";
          this.compositeAttributeModelGetLiq.requestData = compositeModelGetRequest;
          this.compositeAttributeModelGetLiq.generateRequest();
        }
      }
    }
  }

  _onCompositeModelGetResponse(e) {
    if (DataHelper.isValidObjectPath(e, "detail.response.content.entityModels.0")) {
      let entityType = undefined;

      if (DataHelper.isValidObjectPath(e, 'detail.response.content.entityModels.0.id')) {
        entityType = e.detail.response.content.entityModels[0].id.split('_entityCompositeModel')[0];
      }

      if (entityType) {
        this._relationshipModels = this._relationshipModels || {};
        this._relationshipModels[entityType] = DataTransformHelper.transformRelationshipModels(e.detail.response
          .content.entityModels[0], this.contextData);
      }

      if (this._currentIndex == 1) {
        this._currentItems = [];
      }

      this.push('_currentItems', e.detail.response.content.entityModels[0]);

      if (this._currentItems.length == this._currentIndex) {
        //Delete the model only if source and destination type is not equal. Done for supporting
        //relationship from and to the same entity type.
        let relationshipName = this.searchFilters.relationshipName;
        if (relationshipName && !_.isEmpty(this._relToEntityTypes)) {
          if (relationshipName.indexOf("!%&") > -1) {
            relationshipName = relationshipName.replace(/!%&/g, "");
          }
          let relModel = undefined;
          if (!_.isEmpty(this._relationshipModels[this._relToEntityTypes[0]])) {
            relModel = this._relationshipModels[this._relToEntityTypes[0]][relationshipName].find((relModel) => {
              return relModel.id === this.relationshipName;
            });
          }
          if (relModel == undefined) {
            delete this._relationshipModels[this._relToEntityTypes[0]];
          } else {
            if (DataHelper.isValidObjectPath(relModel, 'properties.relatedEntityInfo.0.relEntityType') &&
              relModel.properties.relatedEntityInfo[0].relEntityType != this._relToEntityTypes[0]) {
              delete this._relationshipModels[this._relToEntityTypes[0]];
            }
          }
        }

        if (!_.isEmpty(this._attributeNames)) {
          let modelGetRequest = this._getModelGetRequest(this._attributeNames);
          if (this.modelGetLiquid) {
            this.modelGetLiquid.requestData = modelGetRequest;
            this.modelGetLiquid.generateRequest();
          }
        } else {
          this._prepareSearchFilters();
        }
      }
    }
  }

  _getModelGetRequest(attributeNames) {
    if (!_.isEmpty(attributeNames)) {
      let contextData = {};
      let itemContext = {
        "attributeNames": attributeNames,
        "type": "attributeModel"
      };
      contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
      let req = DataRequestHelper.createModelGetRequest(contextData);
      return req;
    }
  }

  _onAttributeModelsResponse(e) {
    if (DataHelper.isValidObjectPath(e, "detail.response.content.entityModels")) {
      let entityModels = e.detail.response.content.entityModels;
      if (!_.isEmpty(entityModels)) {
        let attributeModels = [];
        
        entityModels.forEach(function(model) {
          if(!_.isEmpty(model.properties)) {
            for (let prop in model.properties) {
              model[prop] = model.properties[prop];
            }
          }
        })
        for (let i = 0; i < entityModels.length; ++i) {
            let currentItem = entityModels[i];
            if ((currentItem.dataType == "nested") && !_.isEmpty(currentItem.childAttributes)) {
                if(typeof currentItem.childAttributes === 'string'){
                    currentItem.childAttributes = [currentItem.childAttributes]
                }
                currentItem.childAttributes.forEach(childAttrId => {
                    let availChildAttrs = entityModels.filter( availAttrItem => { return availAttrItem.id == childAttrId+'_attributeModel'; })
                    if(!_.isEmpty(availChildAttrs)){
                        if(!currentItem.group){
                            currentItem.group = [{}];
                        }
                        let attrId = availChildAttrs[0]['id'];
                        let attrName = availChildAttrs[0]['name'];
                        currentItem.group[0][attrName] = availChildAttrs[0];
                        entityModels = entityModels.filter(removalChild => { return removalChild.id != attrId});
                    }
                });
            }
        }

        entityModels.forEach(function(model) {
          if(!_.isEmpty(model.properties)) {
            if(model.dataType && model.dataType.toLowerCase() === "nested") {
              let nestedAttributeItems = DataHelper.getNestedAttributeItems(model, true, true);
              if(!_.isEmpty(nestedAttributeItems)) {
                attributeModels = attributeModels.concat(nestedAttributeItems);
              }
            } else {
              attributeModels.push(model);
            }
          }
        }, this);

        this.set("_attributeModels", attributeModels);
        this._prepareSearchFilters();
      }
    }
  }

  _prepareSearchFilters() {
    let attrsCriterion = this._prepareAttrsCriterion(this._attributeModels, this._entityAttributes);
    let relationshipsCriterion = this._prepareRelationshipsCriterion(this._relationshipModels, this._relationshipAttributes,
      this._relatedEntityAttributes, this._relToEntityTypes, this._attributeModels);
    this.searchFilters[this.filterCriterionKey] = !_.isEmpty(attrsCriterion) ? attrsCriterion : undefined;
    this.searchFilters["relationshipsCriterion"] = !_.isEmpty(relationshipsCriterion) ? [
      relationshipsCriterion
    ] : undefined;
    this.searchFilters["attributeModels"] = this._attributeModels;
    this.searchFilters["relationshipModels"] = this._mergeRelationships(this._relationshipModels);
    this.fireBedrockEvent('on-search-filters', this.searchFilters);
  }

  _prepareAttrsCriterion(attributeModels, attributes) {
    if (attributes && attributes.length > 0) {
      // let prefix = /^\"/i;
      // let suffix = /^.+\"$/gm;
      let selectedContext = ContextHelper.getDataContexts(this.contextData);
      for (let i = 0; i < attributes.length; i++) {
        let attribute = attributes[i];
        for (let attrName in attribute) {
          let attrModel = attributeModels.find(obj => obj.name === attrName);
          let attrVal = attribute[attrName];

          if (attrModel) {
            attrModel.displayType = attrModel.displayType || "textbox";
            let displayType = attrModel.displayType.toLowerCase();
            if(displayType === "referencelist") {
              attrModel.isLocalizable = true;
            }
            let dataType = ConstantHelper.getDataTypeConstant(attrModel.dataType.toLowerCase());
            if (dataType === "_DECIMAL" || dataType === "_INTEGER") {
              displayType = "numeric";
            }
            let keys = Object.keys(attrVal);

            if (keys && keys.length > 0) {
              for (let j = 0; j < keys.length; j++) {
                let key = keys[j];
                let val = attrVal[key];
                let valueStr =  "";
                let searchObj = DataHelper.getExactSearch(val)
                let isExactSearch = searchObj["isExactSearch"];
                let containsStr = searchObj["updatedVal"];
                
                let operator;
                let splitQueryByAnd = containsStr.toLowerCase().split("' and '");
                let splitQueryByOr = containsStr.toLowerCase().split("' or '");
                let splittedValue = [];
                if (splitQueryByAnd.length > 1) {
                  operator = "_AND";
                  splittedValue = splitQueryByAnd;
                } else if (splitQueryByOr.length > 1) {
                  operator = "_OR";
                  splittedValue = splitQueryByOr;
                }
                  if (val.indexOf("!%&") > -1) {
                    attrVal["hasvalue"] = val == "!%&has value!%&" ? true : false;
                    delete attrVal[key];
                  } else if (displayType === "path") {
                    if (key === "equals") {
                      if(splittedValue.length > 1){
                          valueStr = this._formatQueryValue(splittedValue,false,false)
                          attrVal["eq"] = valueStr;
                          attrVal["operator"] = operator
                      }else {
                        attrVal["eq"] = containsStr;
                      }
                    }
                    delete attrVal[key];
                  }
                  else if (displayType === "referencelist") {
                    if (key === "equals") {
                      if (splittedValue.length > 1) {
                        attrVal["exacts"] = splittedValue;
                        attrVal["operator"] = operator
                      } else {
                        attrVal["exact"] = containsStr;
                      }
                      delete attrVal[key];
                    }
                  }else if (displayType === "textbox") {
                    if (key === "equals") {
                      if(isExactSearch){
                        if (splittedValue.length > 1) {
                          attrVal["exacts"] = splittedValue;
                          attrVal["operator"] = operator;
                        }else {
                          attrVal["exact"] = containsStr;
                        }
                      }else{
                        if (splittedValue.length > 1) {
                          valueStr = this._formatQueryValue(splittedValue,true,true)
                          attrVal["eq"] = valueStr;
                          attrVal["operator"] = operator;
                        }else {
                          containsStr = DataHelper.removeSpecialCharacters(containsStr);
                          let value = DataHelper.populateWildcardForFilterText(containsStr);
                          attrVal["eq"] = value;
                        }
                      }
                    
                      delete attrVal[key];
                    }
                  } else if (displayType === "numeric") {
                    if (key === "equals") {
                      if (splittedValue.length > 1) {
                        attrVal["exacts"] = splittedValue;
                        attrVal["operator"] = operator;
                      }else {
                        attrVal["eq"] = containsStr;
                      }
                      delete attrVal[key];
                    }
                  } else if (displayType === "boolean") {
                    attrVal["eq"] = containsStr;
                    delete attrVal[key];
                  } else if (displayType === "richtexteditor" || displayType === "textarea") {
                    if(isExactSearch){
                      attrVal["eq"] = "\""+containsStr+"\"";
                      attrVal["operator"] = operator;
                    }else{
                      containsStr = containsStr.replace(/(^")|("$)/g, "");
                      containsStr = DataHelper.removeSpecialCharacters(containsStr);
                      attrVal["eq"] = DataHelper.populateWildcardForFilterText(containsStr)
                      attrVal["operator"] = operator;
                    }
                    delete attrVal[key];
                  } else if (displayType === "datetime") {
                    if (key === "gte") {
                      attrVal[key] = moment(attrVal[key]).startOf("day").format(FormatHelper.getISODateTimeFormat());
                    } else if (key === "lte") {
                      attrVal[key] = moment(attrVal[key]).endOf("day").format(FormatHelper.getISODateTimeFormat());
                    } else if (key === "equals") {
                      attrVal["gte"] = moment(attrVal[key]).startOf("day").format(FormatHelper.getISODateTimeFormat());
                      attrVal["lte"] = moment(attrVal[key]).endOf("day").format(FormatHelper.getISODateTimeFormat());
                      delete attrVal[key];
                    }
                  } else if (displayType === "date") {
                    let isoFormatDate = moment(attrVal[key], "MM/DD/YYYY", true).format("YYYY-MM-DD");
                    if (key === "equals") {
                      attrVal["gte"] = isoFormatDate;
                      attrVal["lte"] = isoFormatDate;
                      delete attrVal[key];
                    } else {
                      attrVal[key] = isoFormatDate;
                    }
                  } else {
                    if (operator) {
                      attrVal["contains"] = containsStr;
                      attrVal["operator"] = operator;
                    } else {
                      attrVal["exact"] = containsStr;
                    }
                    delete attrVal[key];
                  }
              }
              attrVal["type"] = dataType;
              let defaultValCtx = DataHelper.getDefaultValContext();
              if (!attrModel.isLocalizable && !attrModel.isNestedChildItem) {
                attrVal["valueContexts"] = [defaultValCtx];
              }
            }
          } else {
            //TODO: Need to change. 
            // Temperory fix. When search filters have context specific attribute and context is removed/changed
            // from dimension selector, we don't get model for that attribute.
            // request attributes criterion will go with empty object for this attribute, request throws error.
            // To handle this, when attribute model not found, sending it as contains search for that attribute
            if (attrVal["equals"]) {
              attrVal["contains"] = attrVal["equals"];
              attrVal["type"] = "_STRING";
              delete attrVal["equals"];
            }
          }

          if (attrName.indexOf(".") > -1) {
            let attrLevels = attrName.split(".");
            let nestedAttributeObj = {};
            if (attrLevels.length > 0) {
              for (let j = attrLevels.length; j > 0; j--) {
                let keyIndex = j - 1;
                let _currentLevel = attrLevels[keyIndex];
                if (_.isEmpty(nestedAttributeObj)) {
                  let attrData = attrVal["contains"];
                  if (attrData && (attrData.indexOf("!%&") > -1)) {
                    attrVal = {};
                    attrVal["hasvalue"] = attrData == "!%&has value!%&" ? true : false;
                  }
                  nestedAttributeObj[_currentLevel] = attrVal;
                } else {
                  nestedAttributeObj = {
                    "attributes": [nestedAttributeObj]
                  };
                  let clonedNestedAttribute = DataHelper.cloneObject(nestedAttributeObj);
                  nestedAttributeObj[_currentLevel] = clonedNestedAttribute;
                  if (nestedAttributeObj["attributes"] != undefined) {
                    delete nestedAttributeObj["attributes"];
                  }
                }
              }
              attribute = nestedAttributeObj;
            }
          }

          attributes[i] = attribute;
        }
      }
    }
    return attributes;
  }

  _formatQueryValue(valArray,addWildcard,removeSpecialCharacters){
    let valueStr = "";
    valArray.forEach(val => {
      if(removeSpecialCharacters){
        val = DataHelper.removeSpecialCharacters(val);
      }
      if(!_.isEmpty(valueStr)){
        valueStr += "|";
      }
      valueStr = addWildcard ? valueStr + "(" + DataHelper.populateWildcardForFilterText(val) + ")" : valueStr + "(" + val + ")"
    })
    return valueStr
  }

  _prepareRelationshipsCriterion(relationshipModels, relationshipAttributes, relatedEntityAttributes,
    relToEntityTypes, compositeModels) {
    let relType = this.searchFilters["relationshipName"];
    let relationshipsCriterion = {};
    let isNoRelationshipSearchRequest = undefined;

    if (relType) {
      let rel = undefined;
      if (relType.indexOf("!%&") > -1) {
        isNoRelationshipSearchRequest = true;
        relType = relType.replace(/!%&/g, "");
      }

      if (!_.isEmpty(relationshipModels)) {
        for (let entityType in relationshipModels) {
          if (relationshipModels[entityType] && relationshipModels[entityType][relType] && relationshipModels[
            entityType][relType].length > 0) {

            rel = relationshipModels[entityType][relType].find((relModel) => {
              return relModel.id === this.relationshipName;
            });
          }
        }
      }
      relationshipsCriterion[relType] = relationshipsCriterion[relType] || {};
      let relOwnership = rel && rel.properties ? rel.properties.relationshipOwnership : undefined;
      if (!_.isEmpty(relToEntityTypes)) {
        relationshipsCriterion[relType] = relationshipsCriterion[relType] || {};
        if (isNoRelationshipSearchRequest) {
          relationshipsCriterion[relType]["hasvalue"] = false;
        } else {
          relationshipsCriterion[relType]["relTo"] = {
            "type": relToEntityTypes[0]
          };
        }

        relationshipsCriterion[relType]["query"] = {
          "filters": {
            "typesCriterion": relToEntityTypes
          }
        };

        if (!_.isEmpty(relatedEntityAttributes)) {
          let relEntityAttrsCriterion = this._prepareAttrsCriterion(compositeModels, relatedEntityAttributes);

          relationshipsCriterion[relType].query.filters[this.filterCriterionKey] = relEntityAttrsCriterion;
        } else {
          if (relOwnership !== "whereused") {
            delete relationshipsCriterion[relType]["query"];
          }
        }
      }
      if (rel && rel.attributes) {
        let relData = {};
        relData.data = {};
        relData.data.attributes = rel.attributes;
        let relationshipAttrModels = DataTransformHelper.transformAttributeModels(relData, this.contextData);
        let keys = Object.keys(relationshipAttrModels);
        let relationshipAttributeModels = [];
        if (keys && keys.length > 0) {
          for (let i = 0; i < keys.length; i++) {
            relationshipAttributeModels.push(relationshipAttrModels[keys[i]]);
          }
        }
        let relationshipAttrsCriterion = this._prepareAttrsCriterion(relationshipAttributeModels,
          relationshipAttributes);
        relationshipsCriterion[relType] = relationshipsCriterion[relType] || {};
        relationshipsCriterion[relType]["attributes"] = relationshipAttrsCriterion;
      }
    }

    return relationshipsCriterion;
  }

  _getAttributeNames(attributes) {
    let attributeNames = [];
    for (let i = 0; i < attributes.length; i++) {
      let attribute = attributes[i];
      for (let attrName in attribute) {
        if (attrName.indexOf(".") > -1) {
          attributeNames = attributeNames.concat(attrName.split("."));
        }else{ 
          attributeNames.push(attrName);
        }
      }
    }
    return attributeNames;
  }

  formatValue(value) {
    if(value){
      let valSplitByOr = value.split("' or '");
      let valSplitByAnd = value.split("' and '");

      let values = valSplitByAnd.length > 1 ? valSplitByAnd : valSplitByOr.length > 1 ? valSplitByOr : [];

      if (!_.isEmpty(values)) {
        for (let i = 0; i < values.length; i++) {
          values[i] = this._formatValue(values[i]);
        }

        value = valSplitByAnd.length > 1 ? values.join("' and '") : valSplitByOr.length > 1 ? values.join("' or '") :
          value;
      } else {
        value = this._formatValue(value);
      }
    }
    return value;
  }

  _formatValue(value) {
    let prefix = /^\'|"/i;
    let suffix1 = /^.+\'$/gm;
    let suffix2 = /^.+\"$/gm;

    if (prefix.test(value)) {
      value = value.replace(/^.|$/g, '')
    }
    if (suffix1.test(value) || suffix2.test(value)) {
      value = value.replace(/^|.$/g, '')
    }

    return value;
  }

  _mergeRelationships(relationshipModels) {
    let mergedRelationships = {};
    Object.keys(relationshipModels).forEach(function (entityType) {
      mergedRelationships = DataMergeHelper.mergeRelationships(mergedRelationships, relationshipModels[
        entityType], true);
    });

    return mergedRelationships;
  }
}
customElements.define(RockSearchQueryParser.is, RockSearchQueryParser);
