/**
<b><i>Content development is under progress... </b></i>

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-helpers/data-helper.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class AttributeTabMenuProvider
    extends mixinBehaviors([
    RUFBehaviors.UIBehavior,
    RUFBehaviors.ComponentContextBehavior
    ], PolymerElement) {
    static get is() { return 'attribute-tab-menu-provider' }
    static get properties() {
        return {
            selectedMenuTitle: {
                type: String,
                value: ""
            },
            /**
              * <b><i>Content development is under progress... </b></i> 
              */
            isFirstMenuItemSelected: {
                type: Boolean,
                value: false
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
            }
        }
    }
/**
* <b><i>Content development is under progress... </b></i> 
*/
async getMenu (tabItem, callback) {
    this._callback = callback;
    this._tabItem = tabItem;
    this._setRequestObject();
    let entityCompositeModelManager = new EntityCompositeModelManager();
    if(entityCompositeModelManager) {
        let compositeModel = await entityCompositeModelManager.get(this._request, this.contextData);
        entityCompositeModelManager = null;
        let attributeGroups = this._getAttributeGroups(compositeModel);
        let menuItems = this._buildMenuItems(attributeGroups);
        this._callback(menuItems);
    }
}
_setRequestObject () {
    let firstDataContext = this.getFirstDataContext();
    let firstItemContext = this.getFirstItemContext();
    if(!firstItemContext){
        return;
    }
    let entityType = firstItemContext.type;

    let req = {
        "params": {
            "query": {
                "name": entityType,
                "filters": {
                    "typesCriterion": ["entityCompositeModel"]
                }
            },
            "fields": {
                "properties": [
                    "_ALL"
                ],
                "attributes": ["_ALL"]
            }
        }
    };

    if(this.contextData) {
        DataRequestHelper.addContextsToModelRequest(req, this.contextData);
    } else if (!_.isEmpty(firstDataContext)) {
        req.params.query.contexts = [firstDataContext];
    }

    let valContexts = this.getValueContexts();

    if (_.isEmpty(valContexts) && _.isEmpty(valContexts[0])) {
        valContexts = [DataHelper.getDefaultValContext()];
    }
    
    req.params.query.valueContexts = valContexts;
    
    req.applyEnhancerCoalesce = true;

    this._request = req;
}
_buildMenuItems (attributeGroups) {
    let menuItems = [];
    let attributeGroupNames = Object.keys(attributeGroups);
    attributeGroupNames.sort();
    for (let i = 0; i < attributeGroupNames.length; i++) {
        let attributeGroupName = attributeGroupNames[i];
        let attributeNames = attributeGroups[attributeGroupName];
        let menuItem = this._buildMenuItem(attributeGroupName, attributeNames);
        
        if(this.isFirstMenuItemSelected && i == 0) {
            menuItem.selected = true;
        }
        
        menuItems.push(menuItem);
    }
    return menuItems;
}
_buildMenuItem (attributeGroupName, attributeNames) {
    let menuItem = {};
    menuItem.component = DataHelper.cloneObject(this._tabItem.component);
    menuItem.name = attributeGroupName.replace(/\W/g, '_');
    menuItem.title = attributeGroupName;
    menuItem.selected = this.selectedMenuTitle === menuItem.title ? true : false;
    let configContext = {};
    configContext.groupName = attributeGroupName;
    configContext.attributeNames = attributeNames;
    if (!menuItem.properties) {
        menuItem.properties = {};
    }
    menuItem.component.properties["config-context"] = configContext;

    return menuItem;
}
_getAttributeGroups (entityModel) {
    let attributeGroups = [];
    if (entityModel && entityModel.data) {
        if (entityModel.data.attributes) {
            this._fillAttributesInGroups(entityModel.data.attributes, attributeGroups);
        }
        if (entityModel.data.contexts) {
            for (let j = 0; j < entityModel.data.contexts.length; j++) {
                let context = entityModel.data.contexts[j];
                if (context.attributes) {
                    this._fillAttributesInGroups(context.attributes, attributeGroups);
                }
            }
        }
    }
    return attributeGroups;
}
_fillAttributesInGroups (attributes, attributeGroups) {                
    for (let attributeName in attributes) {
        let attribute = attributes[attributeName];
        let attributeGroupName = attribute.properties && attribute.properties.groupName ? attribute.properties.groupName : 'Ungrouped Attributes';
        let attributeGroup = attributeGroups[attributeGroupName];
        if (!attributeGroup) {
            attributeGroup = [];
            attributeGroups[attributeGroupName] = attributeGroup;
        }
        if (attributeGroup.indexOf(attributeName) == -1) {
            attributeGroup.push(attributeName);
        }

        if(attribute.properties && attribute.properties.additionalViews){
            let additionalViews = attribute.properties.additionalViews.split('|');                        
            for(let index = 0; index < additionalViews.length; index++){
                let additionalViewsGroup = attributeGroups[additionalViews[index]];
                if(!additionalViewsGroup){
                    additionalViewsGroup = [];
                    attributeGroups[additionalViews[index]] = additionalViewsGroup;
                }                           
                if (additionalViewsGroup.indexOf(attributeName) == -1) {
                    additionalViewsGroup.push(attributeName);
                }
            }                  
        }
    }
}
}
customElements.define(AttributeTabMenuProvider.is, AttributeTabMenuProvider);
