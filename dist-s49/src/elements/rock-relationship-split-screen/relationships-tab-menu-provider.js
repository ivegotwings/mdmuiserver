/**
<b><i>Content development is under progress... </b></i>

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-helpers/data-helper.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RelationshipsTabMenuProvider
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <liquid-entity-model-get id="liquidModeleGet" operation="getbyids" request-data="{{_request}}" on-response="_onModelReceived" on-error="_onModelGetFailed"></liquid-entity-model-get>
        <liquid-entity-model-get id="getRelDomains" operation="getbyids" on-response="_onRelModelsReceived" on-error="_onModelGetFailed"></liquid-entity-model-get>
`;
  }

  static get is() { return 'relationships-tab-menu-provider' }


  static get properties() {
      return {

          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          selectedMenuTitle: {
              type: String,
              value: ""
          },
          _callback: {
              type: Function
          },
          _tabItem: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _request: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           *  Indicates the domain of the relationship types.
           */
          domain: {
              type: String,
              value: "generic"
          }
      }
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  getMenu(tabItem, callback) {
      this._callback = callback;
      this._tabItem = tabItem;
      this._setRequestObject();
      if (!_.isEmpty(this._request)) {
          let liquid = this.$.liquidModeleGet;
          if (liquid) {
              liquid.generateRequest();
          }
      }
  }

  _onModelReceived(e) {
      let responseContent = DataHelper.validateAndGetResponseContent(e.detail.response)
      if (responseContent) {
          this._relationshipEntityTypeMappings = this._getRelationshipEntityTypeMappings(responseContent.entityModels);
          let relationshipTypeNames = this._relationshipEntityTypeMappings.map(function (rel) {
              return rel.relationshipTypeName + "_relationshipModel";
          });
          this._generateCheckDomainRequest(relationshipTypeNames);

      }
  }
  _generateCheckDomainRequest(relationshipTypeNames) {
      let req = DataHelper.cloneObject(this._request);
      delete req.params.query.id;
      req.params.query.ids = relationshipTypeNames;
      req.params.query.domain = this.domain;
      req.params.query.filters = {
          "typesCriterion": ["relationshipModel"]
      };
      req.params.fields = {};
      let checkDomainLiquid = this.shadowRoot.querySelector("#getRelDomains");
      if (checkDomainLiquid) {
          checkDomainLiquid.requestData = req;
          checkDomainLiquid.generateRequest();
      }
  }
  _onRelModelsReceived(e) {
      let responseContent = DataHelper.validateAndGetResponseContent(e.detail.response)
      if (responseContent) {
          let models = responseContent.entityModels;
          let relationshipTypeNames = [];
          for (let i = 0; i < models.length; i++) {
              if (models[i].domain == this.domain) {
                  relationshipTypeNames.push(models[i].name);
              }
          }

          for (let rel of this._relationshipEntityTypeMappings) {
              rel.relatedEntityTypes = rel.relatedEntityTypes.filter(relEntityType => {
                  relEntityType.properties.domain = this.domain;
                  return relationshipTypeNames.indexOf(rel.relationshipTypeName) > -1;
              });
          }
          let menuItems = this._buildMenuItems(this._relationshipEntityTypeMappings);
          this._callback(menuItems);
      }
  }

  _onModelGetFailed(e) {
      this.logError("TabMenuError", e);
  }

  _getRelationshipEntityTypeMappings(entityModels) {
      let relationshipEntityTypeMappings = [];
      if (entityModels && entityModels.length > 0) {
          let data = entityModels[0].data;
          if (data && data.relationships) {
              let relationshipModels = data.relationships;
              this._setRelationshipEntityTypeMappings(relationshipModels, relationshipEntityTypeMappings);
          }

          if (data && !_.isEmpty(data.contexts)) {
              let relationshipModels = data.contexts[0].relationships;
              this._setRelationshipEntityTypeMappings(relationshipModels, relationshipEntityTypeMappings);
          }
      }
      return relationshipEntityTypeMappings;
  }

  _setRelationshipEntityTypeMappings(relationshipModels, relationshipEntityTypeMappings) {
      if (!_.isEmpty(relationshipModels)) {
          Object.keys(relationshipModels).map(function (relationshipTypeName) {
              const relationshipTypeNameFound = DataHelper._findItemByKeyValue(relationshipEntityTypeMappings, "relationshipTypeName", relationshipTypeName);
              if (!relationshipTypeNameFound) {
                  let relationshipModel = {};
                  relationshipModel.relationshipTypeName = relationshipTypeName;
                  relationshipModel.relatedEntityTypes = relationshipModels[relationshipTypeName];
                  relationshipEntityTypeMappings.push(relationshipModel);
              }
          });
      }
  }

  _buildMenuItems(relationshipEntityTypeMappings) {
      let menuItems = [];
      
      if(DataHelper.isValidObjectPath(this._tabItem, 'menuProviderComponent.properties.default')) {
          //format relationshipEntityTypeMappings for taxonomy page scenario
          if(this._tabItem.menuProviderComponent.properties.default.indexOf(':')>-1) {
              let taxonomyDefaultConfig = this._tabItem.menuProviderComponent.properties.default.split(":");
              let taxonomyDefaultSelected = {
                  relationshipType: taxonomyDefaultConfig[0],
                  relatedEntityType: taxonomyDefaultConfig[1] 
              }
              this._setDefaultTabMenu(relationshipEntityTypeMappings, taxonomyDefaultSelected);
          } else {
              this.logError("Default selected tab Item not configured correctly for taxonomy page.")
          }
      }

      if (relationshipEntityTypeMappings && relationshipEntityTypeMappings instanceof Array && relationshipEntityTypeMappings.length > 0) {
          for (let i = 0; i < relationshipEntityTypeMappings.length; i++) {
              let relationshipTypeName = relationshipEntityTypeMappings[i].relationshipTypeName;
              let relatedEntityTypes = relationshipEntityTypeMappings[i].relatedEntityTypes;

              if (relatedEntityTypes && relatedEntityTypes instanceof Array) {
                  for (let j = 0; j < relatedEntityTypes.length; j++) {
                      let relatedEntityTypeProps = relatedEntityTypes[j].properties;
                      if (relatedEntityTypeProps) {
                          let menuItem = {};
                          let domain = relatedEntityTypeProps.domain;
                          menuItem.name = relatedEntityTypes[j].id;
                          menuItem.title = relatedEntityTypeProps.externalName || relatedEntityTypes[j].id;
                          menuItem.selected = this.selectedMenuTitle === menuItem.title ? true : false;
                          menuItem.component = DataHelper.cloneObject(this._tabItem.component);

                          let configContext = menuItem.component.properties["config-context"];
                          if (!configContext) {
                              configContext = {};
                          }
                          configContext.relationshipTitle = relatedEntityTypeProps.externalName;
                          configContext.relationshipTypeName = relationshipTypeName;
                          configContext.relationshipId = relatedEntityTypes[j].id;
                          if (domain) {
                              configContext.domain = domain;
                          }
                          if(relatedEntityTypeProps.relationshipOwnership == "whereused"){
                              configContext.direction = "up";
                              if(DataHelper.isValidObjectPath(relatedEntityTypeProps, 'relatedEntityInfo.0.relEntityType')){
                                  configContext.fromEntityType = relatedEntityTypeProps.relatedEntityInfo[0].relEntityType;
                              }
                          }
                          if (!menuItem.properties) {
                              menuItem.properties = {};
                          }
                          menuItem.component.properties["config-context"] = configContext;

                          menuItems.push(menuItem);
                      }
                  }
              }
          }
      }
      return this.sortItems(menuItems);
  }

  _setDefaultTabMenu(relationshipEntityTypeMappings, defaultSelected) {                
      relationshipEntityTypeMappings.forEach((elm, relationshipTypeIndex)=> {

          if(elm.relationshipTypeName === defaultSelected.relationshipType) {
              if(elm.relatedEntityTypes.length>0) {
                  elm.relatedEntityTypes.forEach((entityType, relatedEntityTypeIndex)=> {
                      if(entityType.id === defaultSelected.relatedEntityType) {
                          //setting default selected tab item
                         this.selectedMenuTitle = relationshipEntityTypeMappings[relationshipTypeIndex].relatedEntityTypes[relatedEntityTypeIndex].properties.externalName;
                      }
                  })
              }
          }
      });
  }
  sortItems(menuItems) {
      let titleA, titleB;
      if (menuItems && menuItems.sort) {
          menuItems = menuItems.sort(function (a, b) {
              if(a.title && b.title) {
                  titleA = a.title.toLowerCase();
                  titleB = b.title.toLowerCase();
                  if (titleA > titleB) return 1;
                  if (titleA < titleB) return -1;
                  return 0;
              }
          });
      }
      return menuItems;
  }
  _setRequestObject() {
      let firstDataContext = this.getFirstDataContext();
      let firstItemContext = this.getFirstItemContext();

      if (!firstItemContext) return;

      let entityType = firstItemContext.type;

      let req = {
          "params": {
              "query": {
                  "id": entityType + "_entityCompositeModel",
                  "filters": {
                      "typesCriterion": ["entityCompositeModel"]
                  }
              },
              "fields": {
                  "properties": ["_ALL"],
                  "relationships": ["_ALL"]
              }
          }
      };

      if (this.contextData) {
          DataRequestHelper.addContextsToModelRequest(req, this.contextData);
      } else if (!_.isEmpty(firstDataContext)) {
          req.params.query.contexts = [firstDataContext];
      }

      this._request = req;
  }
}
customElements.define(RelationshipsTabMenuProvider.is, RelationshipsTabMenuProvider)
