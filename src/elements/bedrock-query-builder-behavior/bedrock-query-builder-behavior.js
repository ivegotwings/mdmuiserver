import '@polymer/polymer/polymer-legacy.js';
import EntityTypeManager from '../bedrock-managers/entity-type-manager.js';
/***
 * `RUFBehaviors.QueryBuilderBehavior` provides common properties and methods that must be implemented for all
 *  query builder elements. It is a mandatory behavior for all query builder elements to implement.
 *
 *  ### Example
 *
 *     <dom-module id="x-lov">
 *        <template>
 *        </template>
 *        <script>
 *           Polymer({
 *             is: ""x-lov",
 *
 *             behaviors: [
 *               RUFBehaviors.QueryBuilderBehavior
 *             ],
 *
 *             properties: {
 *              
 *             }
 *           });
 *        <&lt;>/script>
 *     </dom-module>
 * @demo demo/index.html
 * @polymerBehavior RUFBehaviors.QueryBuilderBehavior
 */

window.RUFBehaviors = window.RUFBehaviors || {};
/** @polymerBehavior RUFBehaviors.QueryBuilderBehavior */
RUFBehaviors.QueryBuilderBehavior = {

    properties: {            
        outputQueryString:{
            type: String,
            value: ""                
        }
         
    },

    /**
     *  Returns the selected entitities titles list
    */        
    getSelectedEntityTypes: function(selectedEntityTypes){
        let entityTypes=[];
        if(selectedEntityTypes){
            for(let i=0;i<selectedEntityTypes.length; i++){
                entityTypes.push(selectedEntityTypes[i].id);
            }
        }
        
        return entityTypes;
    },

    /**
     *  Builds the query string
     */
    buildQuery: function(entityTypes,attributesList,queryBuilderData,isParserQuery,keywordSearch){
       
        let entityTypeExternalNames = [];
        let entityTypeManager = EntityTypeManager.getInstance();
        for (let i=0;i<entityTypes.length;i++) {
            entityTypeExternalNames.push(entityTypeManager.getTypeExternalNameById(entityTypes[i]));
        }
        //Build the selected entity type
        let queryString = "show \""+ entityTypeExternalNames.join(" and ") + "\"";

        if(isParserQuery) {
            queryString = "!%&show&%! "+ entityTypes.join(" !%&and&%! ");
        }

        //Build the selected attributes
        let selAttributesString = "";
        if(attributesList.length > 0) {
            selAttributesString = this.getSelectedAttributes(attributesList,isParserQuery);
            if(selAttributesString) {
                if(isParserQuery) {
                    selAttributesString = " !%&with&%! " + selAttributesString;
                } else {
                    selAttributesString = " with " + selAttributesString;
                }
            }      
        }
         
         //Build the relationship
        let selRelationshipsString = "";
        if(queryBuilderData && queryBuilderData.relationship && !isParserQuery) {
            selRelationshipsString = " having " + queryBuilderData.relationship;
        } else if (queryBuilderData && queryBuilderData.relationshipShortName && isParserQuery){
            selRelationshipsString = " !%&having&%! " + queryBuilderData.relationshipShortName;

        }

        //Build the relationship attributes
        if(queryBuilderData && queryBuilderData.relationshipGridData && queryBuilderData.relationshipGridData.length > 0) {
            let relAttrStr = this.getSelectedAttributes(queryBuilderData.relationshipGridData,isParserQuery); 
            if(relAttrStr) {
                if(isParserQuery) {
                    selRelationshipsString = selRelationshipsString + " !%&with&%! " + relAttrStr;
                } else {
                    selRelationshipsString = selRelationshipsString + " with " + relAttrStr;
                }
            }
        } 
          
        //Build Related Entity Attributes            
        let selRelEntityString = "";                      
        if(queryBuilderData && queryBuilderData.relEntity && queryBuilderData.relEntityGridData && queryBuilderData.relEntityGridData.length > 0) {
            let relEntityAttrStr = this.getSelectedAttributes(queryBuilderData.relEntityGridData,isParserQuery);
            if(isParserQuery) {
                selRelEntityString = " !%&show&%! " + queryBuilderData.relEntity;
            }
            if(relEntityAttrStr) {
                if(isParserQuery) {
                    selRelEntityString = selRelEntityString + " !%&with&%! " + relEntityAttrStr;
                } else {
                    selRelEntityString = " " + queryBuilderData.relEntity + " with " + relEntityAttrStr;
                }
            }
        } 

        //Build the workflow 
        let workflowString = "";
        if(queryBuilderData && queryBuilderData.workflowGridData && queryBuilderData.workflowGridData.length > 0){
           workflowString = this.getWorkflowAttributes(queryBuilderData.workflowGridData,isParserQuery);
           if(workflowString) {
               if(isParserQuery) {
                    workflowString = " !%&pending&%! " + workflowString;
               } else {
                    workflowString = " pending " + workflowString;
               }
            }  
        }

        //Adding the keyword search
        let keywordSearchStr = "";
        if(keywordSearch) {
            let isIdSearch = false;
            let prefix = /^id:/i;
            if(prefix.test(keywordSearch)) {
                isIdSearch = true;
            }

            if(isIdSearch){                    
                keywordSearchStr = " and " + keywordSearch.replace(":"," = ");
            } else {
                keywordSearchStr = " and _ANY = "+ keywordSearch; 
            }

            if(isParserQuery) {
                keywordSearchStr = " !%&_ANY&%! "+ keywordSearch; 
            }
        }

        //Build the query
        queryString = queryString+selAttributesString+selRelationshipsString+selRelEntityString+workflowString+keywordSearchStr;

        //Return the constructed query
        return queryString
    },

    /**
     *  Returns the selected attributes
    */
    getSelectedAttributes : function (gridData,isParserQuery) {
        let queryStr = "";

        if(gridData) {
            if(isParserQuery){
                for(let i=0;i<gridData.length; i++){
                    if(!gridData[i].attributeModel) {
                        break;
                    } 
                    if(gridData[i].attributeModel.name!="" && gridData[i].value!="") {
                        let value = gridData[i].value;
                        let displayType = gridData[i].attributeModel.displayType.toLowerCase();
                        if(displayType=="numeric" && gridData[i].value.indexOf(">=") > -1){
                            let tempvalue = value.substring(2,value.length);
                            queryStr =  queryStr + gridData[i].attributeModel.name + " > "+ tempvalue + " !%&and&%! ";
                        } else if(displayType=="numeric" && gridData[i].value.indexOf("<=") > -1) {  
                            let tempvalue = value.substring(2,value.length);                          
                            queryStr =  queryStr + gridData[i].attributeModel.name + " < "+ tempvalue + " !%&and&%! ";
                        } else if((displayType=="numeric" || displayType=="datetime" || displayType=="date") && gridData[i].value.indexOf("-") > -1){
                            let tempvalue = value.split("-");
                            queryStr =  queryStr + gridData[i].attributeModel.name + " > "+ tempvalue[0] + " !%&and&%! " + gridData[i].attributeModel.name + " < " + tempvalue[1] + " !%&and&%! ";
                        } else {
                            queryStr =  queryStr + gridData[i].attributeModel.name + " = " + gridData[i].value + " !%&and&%! ";    
                        }
                    } 
                }

            } else {
                for(let i=0;i<gridData.length; i++){
                    if(gridData[i].name!="" && gridData[i].value!="") {
                        let displayType = gridData[i].attributeModel.displayType.toLowerCase();
                        if(displayType=="numeric" && gridData[i].value.indexOf("=") > -1) {
                            queryStr =  queryStr + gridData[i].name + gridData[i].value + " and ";                                
                        } else if((displayType=="numeric" || displayType=="datetime" || displayType=="date") && gridData[i].value.indexOf("-") > -1) {
                            let tempvalue = gridData[i].value.split("-");
                            queryStr =  queryStr + gridData[i].name + " >= "+ tempvalue[0] + " and " + gridData[i].name + " <= " + tempvalue[1] + " and ";
                        } else {
                            let seperator = gridData[i].value.indexOf("!%&") > -1 ? " " : " = "
                            queryStr =  queryStr + gridData[i].name + seperator + gridData[i].value + " and "; 
                        }
                           
                    } 
                }
            }
        
           
            queryStr = queryStr.substring(0,queryStr.length-5);

            if(isParserQuery) {
                queryStr = queryStr.substring(0,queryStr.length-6);
            }
        } 

        return queryStr;
    },

    /**
     *  Returns the selected attributes
    */
    getWorkflowAttributes : function (gridData,isParserQuery) {
        let queryStr = "";

        if(gridData) {
            for(let i=0;i<gridData.length; i++){
                if(isParserQuery){
                    if(gridData[i].workflowShortName && gridData[i].workflowShortName!="" && gridData[i].workflowActivityShortName && gridData[i].workflowActivityShortName!="") {
                        queryStr =  queryStr + gridData[i].workflowShortName + " " + gridData[i].workflowActivityShortName;
                    }
                } else {
                    if(gridData[i].workflowExternalName && gridData[i].workflowExternalName!="" && gridData[i].workflowActivityExternalName && gridData[i].workflowActivityExternalName!="") {
                        queryStr =  queryStr + gridData[i].workflowExternalName + " " + gridData[i].workflowActivityExternalName;
                    }
                }
            }
        }

        return queryStr;
    }
    
};
