let DFRestService = require('../../common/df-rest-service/DFRestService'),
    isEmpty = require('../../common/utils/isEmpty'),
    uuidV1 = require('uuid/v1'),
    arrayContains = require('../../common/utils/array-contains'),
    moment = require('moment');

let _ = require('underscore');

let EntityHistoryEventservice = function (options) {
    DFRestService.call(this, options);
};

const falcorUtil = require('../../../../shared/dataobject-falcor-util');
const pathKeys = falcorUtil.getPathKeys();

EntityHistoryEventservice.prototype = {
    get: async function (requestObj) {
        let response = {};

        try {
            let request = falcorUtil.cloneObject(requestObj);
            if (request.params) {
                if (request.params.isSearchRequest) {
                    //This is for initiate search... make search call and return response
                    response = await this.post("entityservice/getentityhistory", request);
                    if (response && response.response && response.response.entities) {
                        let events = response.response.entities;
                        response.response.events = response.response.entities;
                        for (let i = 0; i < events.length; i++) {
                            let event = events[i];
                            event.type = "entityhistoryevent";
                        }
                    }
                } else {
                    //This is for getbyids...
                    let valContexts = undefined;
                    let dataContexts = undefined;
                    if (request.params.query && request.params.query.valueContexts) {
                        valContexts = falcorUtil.cloneObject(request.params.query.valueContexts);
                        delete request.params.query.valueContexts;
                    }
                    if (request.params.query && request.params.query.contexts) {
                        dataContexts = falcorUtil.cloneObject(request.params.query.contexts);
                    }

                    if (request.params.fields) {
                        request.params.fields.attributes = ["_ALL"];
                        request.params.fields.relationships = ["_ALL"];
                    }

                    response = await this.post("entityservice/getentityhistory", request);

                    if (response && response.response && response.response.entities) {
                        let events = response.response.entities;
                        let historyList = await this._generateHistoryData(events, valContexts, dataContexts);
                        response.response.entities = historyList;
                    }
                }
            }
        }
        catch (err) {
            console.log('Failed to get entity history event data.\nError:', err.message, '\nStackTrace:', err.stack);

            response = {
                "response": {
                    "status": "Error",
                    "statusDetail": {
                        "code": "RSUI0001",
                        "message": err.message,
                        "messageType": "Error"
                    }
                }
            };
        }

        return response;
    },

    _generateHistoryData: async function (events, valContexts, dataContexts) {
        let historyList = [];
        let historyListToBeReturned = [];
        let excludeAttribute = ['clientId', 'relatedRequestId', 'eventSubType', 'entityType', 'entityId', 'eventType', 'entityAction', 'taskId',"sourceTimestamp"];
        let defaultRelationship = ['eventTarget'];
        let defaultRelationshipAttributes = ['typeExternalName', 'id', 'name']
        let internalIds = {};
        internalIds.attributeList = [];
        internalIds.relationshipList = [];
        internalIds.entityTypeList = [];
        internalIds.userIdList = [];
        internalIds.currentEntityType = "";

        for (let i = 0; i < events.length; i++) {
            let event = events[i];

            //Note: When multiple updates happens at the same time, display updates in the order-
            //context attributes, relationships, self attributes, entity create. 
            //Hence adding updates in this order
            
            if (this._isValidObjectPath(event, 'data.contexts.0.attributes')) {
                let contextAttributes = event.data.contexts[0].attributes;
                let contextAttributeUpdateHistoryEvent = this._createAttributeUpdateHistoryEvent(event, contextAttributes, excludeAttribute, internalIds)
                Array.prototype.push.apply(historyList, contextAttributeUpdateHistoryEvent);
            }

            if (this._isValidObjectPath(event, 'data.relationships') && _.isEmpty(dataContexts)) {
                let relationships = event.data.relationships;
                let relatioshipsHistoryEvent = this._createRelationshipHistoryEvent(event, relationships, defaultRelationship, internalIds, defaultRelationshipAttributes)
                Array.prototype.push.apply(historyList, relatioshipsHistoryEvent);
            }
            if (this._isValidObjectPath(event, 'data.contexts.0.relationships')) {
                let relationships = event.data.contexts[0].relationships;
                let relatioshipsHistoryEvent = this._createRelationshipHistoryEvent(event, relationships, defaultRelationship, internalIds, defaultRelationshipAttributes)
                Array.prototype.push.apply(historyList, relatioshipsHistoryEvent);
            }

            if (this._isValidObjectPath(event, 'data.attributes') && _.isEmpty(dataContexts)) {
                let attributes = event.data.attributes;

                if (i == 0 && this._isValidObjectPath(attributes, 'entityType.values.0.value')) {
                    internalIds.currentEntityType = attributes.entityType.values[0].value;
                }

                if (this._isValidObjectPath(attributes, 'eventType.values.0.value')) {
                    let actionType = attributes.eventType.values[0].value;
                    if (actionType == 'EntityAdd') {
                        let attributeUpdateHistoryEvent = this._createAttributeUpdateHistoryEvent(event, attributes, excludeAttribute, internalIds)
                        Array.prototype.push.apply(historyList, attributeUpdateHistoryEvent);

                        let attributeAddHistoryEvent = this._createEntityAddHistoryEvent(event, attributes, internalIds);
                        Array.prototype.push.apply(historyList, attributeAddHistoryEvent);
                    }
                    else if (actionType == 'EntityUpdate') {
                        let attributeUpdateHistoryEvent = this._createAttributeUpdateHistoryEvent(event, attributes, excludeAttribute, internalIds)
                        Array.prototype.push.apply(historyList, attributeUpdateHistoryEvent);
                    }
                }
            }
        }

        //Resolve all internal ids to external names...
        let attributesKeyValue = {};
        let relationshipKeyValue = {};
        let userNamebyIdKeyValue = {};
        let entityTypeKeyValue = {};
        let externalResponse = {};
        let attributeModels = {};
        if (internalIds.attributeList.length > 0) {
            externalResponse = await this._fetchCurrentEntityDisplayModel(internalIds, valContexts, dataContexts);

            if (externalResponse) {
                this._getAttributeAndRelTypeExternalName(externalResponse, attributesKeyValue, relationshipKeyValue);
                if (this._isValidObjectPath(externalResponse, "response.entityModels.0.data")) {
                    let data = externalResponse.response.entityModels[0].data;

                    if (!isEmpty(data.attributes)) {
                        attributeModels = data.attributes;
                    }
                }
            }
        }

        if (internalIds.userIdList.length > 0) {
            let userDetailResponse = await this._fetchUserDetails(internalIds.userIdList);
            if (this._isValidObjectPath(userDetailResponse, "response.entityModels")) {
                let userList = userDetailResponse.response.entityModels;
                if (userList && userList.length > 0) {
                    userNamebyIdKeyValue = this._getUserNamebyId(userList);
                }
            }
        }

        if (internalIds.entityTypeList.length > 0) {
            let entityTypeDetailResponse = await this._fetchEntityTypeDetails(internalIds.entityTypeList);
            if (this._isValidObjectPath(entityTypeDetailResponse, "response.entityModels")) {
                let entityTypeList = entityTypeDetailResponse.response.entityModels;
                if (entityTypeList && entityTypeList.length > 0) {
                    entityTypeKeyValue = this._getEntityTypeName(entityTypeList);
                }
            }
        }

        for (let h = 0; h < historyList.length; h++) {
            let historyRecord = historyList[h];
            let message = "", userName = undefined, attributeExternalName = undefined, relationshipExternalName = undefined, 
                entityTypeExternalName = undefined, relToTypeExternalName = undefined, isNested = false, isRichTextEditor = false;
            let attributeDetails = {};
            if (historyRecord.user) {
                userName = userNamebyIdKeyValue[historyRecord.user];
                if(!userName) {
                    userName = historyRecord.user.replace(/_user$/, "");
                }
            }
                
            if (historyRecord.internalAttributeId) {
                attributeExternalName = attributesKeyValue[historyRecord.internalAttributeId];

                if(!attributeExternalName) {
                    attributeExternalName = historyRecord.internalAttributeId;
                }
                attributeDetails["attributeId"] = historyRecord.internalAttributeId;
                if(!_.isEmpty(attributeModels)){
                    let currentAttrModel = attributeModels[historyRecord.internalAttributeId];
                    if(currentAttrModel && currentAttrModel.properties){
                        if(currentAttrModel.properties.displayType == "nestedgrid"){
                            isNested = true;
                        }
                        if(currentAttrModel.properties.displayType == "richtexteditor"){
                            isRichTextEditor = true;
                        }
                    }
                }
            }
            if (historyRecord.relationshipType) {
                relationshipExternalName = relationshipKeyValue[historyRecord.relationshipType];

                if(!relationshipExternalName) {
                    relationshipExternalName = historyRecord.relationshipType;
                }
            }

            if(historyRecord.entityType) {
                entityTypeExternalName = entityTypeKeyValue[historyRecord.entityType];

                if(!entityTypeExternalName) {
                    entityTypeExternalName = historyRecord.entityType;
                }
            }

            if(historyRecord.relToType) {
                relToTypeExternalName = entityTypeKeyValue[historyRecord.relToType];

                if(!relToTypeExternalName) {
                    relToTypeExternalName = historyRecord.relToType;
                }
            }

            if(historyRecord.eventType == "entityAdd"){
                message = "<span class='userName'>" + userName + "</span> created this <span class='activity-property'>" + entityTypeExternalName + "</span>";
                historyRecord["entityAdd"] = true;
            } else if(historyRecord.eventType == "attributeUpdate"){
                if (historyRecord.data.attributes.action.values[0].value == "delete") {
                    message = "<span> removed <span class='activity-property'>" + attributeExternalName + "</span>";
                } else {
                    message = "<span> changed <span class='activity-property'>" + attributeExternalName + "</span>";
                    if(historyRecord.previousValues) {
                        if(historyRecord.previousValues.indexOf("_NULL") > -1){
                            historyRecord.previousValues = historyRecord.previousValues.replace("_NULL","NULL")
                        }
                        if((isNested || isRichTextEditor) && historyRecord.previousValues != "NULL"){
                            attributeDetails[historyRecord.internalAttributeId] = historyRecord.previousValues;
                            let attributePrevData = JSON.stringify(attributeDetails);
                            if(isRichTextEditor){
                                historyRecord.previousValues = [1];
                            }
                            message += "<span> from <span id='prevAttributeValue' class='prev-attribute-value' data='"+attributePrevData+"'><a href='#'>" + historyRecord.previousValues.length + " values</a></span></span>";
                        }else{
                        message += " from <span class='prev-attribute-value'>" + historyRecord.previousValues + "</span>";
                    }
                    }
                    if(historyRecord.attributeValues) {
                        if(historyRecord.attributeValues.indexOf("_NULL") > -1){
                            historyRecord.attributeValues = historyRecord.attributeValues.replace("_NULL","NULL")
                        }
                        if((isNested || isRichTextEditor) && historyRecord.attributeValues != "NULL"){
                            attributeDetails[historyRecord.internalAttributeId] = historyRecord.attributeValues;
                            let attributeData = JSON.stringify(attributeDetails);
                            if(isRichTextEditor){
                                historyRecord.attributeValues = [1];
                            }
                            message += "<span> to <span id='attributeValue' class='attribute-value' data='"+attributeData+"'><a href='#'>" + historyRecord.attributeValues.length + " values</a></span> </span>";
                        }else{
                        message += " to <span class='attribute-value'>" + historyRecord.attributeValues + "</span>";
                    }
                }
                }
            } else if(historyRecord.eventType == "relationshipChange"){
                if (historyRecord.data.attributes.action.values[0].value == "delete") {
                    message = "</span> removed <a href='?id="+ historyRecord.internalRelToId+"&type=" + historyRecord.relToType + "'>" + relToTypeExternalName + ": " + historyRecord.internalRelToId + "</a> having <span class='activity-property'>" + relationshipExternalName + "</span> relationship";
                } else {
                    message = "</span> added <a href='?id="+ historyRecord.internalRelToId+"&type=" + historyRecord.relToType + "'>" + relToTypeExternalName + ": " + historyRecord.internalRelToId + "</a> having <span class='activity-property'>" + relationshipExternalName + "</span> relationship";
                }
            } else if(historyRecord.eventType == "relationshipAttributeUpdate"){
                if (historyRecord.data.attributes.action.values[0].value == "delete") {
                    message = "</span> removed <span class='activity-property'>" + attributeExternalName + "</span> for <a href='?id="+ historyRecord.internalRelToId+"&type=" + historyRecord.relToType + "'>" + relToTypeExternalName + ": " + historyRecord.internalRelToId + "</a> having <span class='activity-property'>" + relationshipExternalName + "</span> relationship";
                } else if(historyRecord.previousValues) {
                    if(historyRecord.previousValues == "_NULL"){
                        historyRecord.previousValues = "NULL"
                    }
                    message = "</span> changed <span class='activity-property'>" + attributeExternalName + "</span>"+" from <span class='prev-attribute-value'>" + historyRecord.previousValues + "</span> to <span class='attribute-value'>" + historyRecord.attributeValues + "</span> for <a href='?id="+ historyRecord.internalRelToId+"&type=" + historyRecord.relToType + "'>" + relToTypeExternalName + ": " + historyRecord.internalRelToId + "</a> having <span class='activity-property'>" + relationshipExternalName + "</span> relationship";
                } else {
                    if(historyRecord.attributeValues == "_NULL"){
                        historyRecord.attributeValues = "NULL"
                    }
                    message = "</span> changed <span class='activity-property'>" + attributeExternalName + "</span> to <span class='attribute-value'>" + historyRecord.attributeValues + "</span> for <a href='?id="+ historyRecord.internalRelToId+"&type=" + historyRecord.relToType + "'>" + relToTypeExternalName + ": " + historyRecord.internalRelToId + "</a> having <span class='activity-property'>" + relationshipExternalName + "</span> relationship";
                }
            }

            let messageValue = {
                "id": uuidV1(),
                "value": message
            };

            //Check whether this historyRecord already added in historyListToBeReturned...
            //If yes append this message to the added record
            let addedHistoryRecord = undefined;
            for (let i = 0; i < historyListToBeReturned.length; i++) {
                let record = historyListToBeReturned[i];

                if(record.id == historyRecord.id) {
                    addedHistoryRecord = record;
                    break;
                }
            }

            if(addedHistoryRecord) {
                if(historyRecord.eventType == "entityAdd"){
                    addedHistoryRecord["entityAdd"] = true;
                }else{
                    let attributes = addedHistoryRecord.data.attributes;
                    attributes.message.values.push(messageValue);
                    attributes.action.values.push(historyRecord.data.attributes.action.values[0]);
                    if(historyRecord.eventType == "attributeUpdate" || historyRecord.eventType == "relationshipAttributeUpdate"){
                        addedHistoryRecord["noOfAttrsChanged"] = addedHistoryRecord.noOfAttrsChanged ? addedHistoryRecord.noOfAttrsChanged + 1 : 1;
                    }else if(addedHistoryRecord.eventType == "relationshipChange"){
                        addedHistoryRecord["noOfRelsChanged"] = addedHistoryRecord.noOfRelsChanged ? addedHistoryRecord.noOfRelsChanged + 1 : 1;
                    }
                }
            } else {

                if(historyRecord.eventType == "attributeUpdate" || historyRecord.eventType == "relationshipAttributeUpdate"){
                    historyRecord["noOfAttrsChanged"] = 1;
                }else if(historyRecord.eventType == "relationshipChange"){
                    historyRecord["noOfRelsChanged"] = 1;
                }

                historyRecord.data.attributes.message = {
                    "values": [
                        messageValue
                    ]
                };
                historyRecord.data.attributes["userDetail"] = {
                    "values":[
                        {
                            "id": uuidV1(),
                            "value": userName
                        }
                    ]
                };
                if(historyRecord.eventType != "entityAdd"){
                    historyListToBeReturned.push(historyRecord);
                }
            }
        }

        return historyListToBeReturned;
    },

    _createEntityAddHistoryEvent: function (event, attributes, internalIds) {
        let historyList = []
        let historyObj = {};
        this._populateHistoryRecord(event, undefined, historyObj, internalIds);
        historyObj.eventType = "entityAdd"

        if (this._isValidObjectPath(attributes, 'entityType.values.0.value')) {
            historyObj.entityType = attributes.entityType.values[0].value;
            internalIds.entityTypeList.push(historyObj.entityType + "_entityType");
        }

        historyList.push(historyObj)
        return historyList;
    },
    _getCombinedAttributeValues:function(attrObj){
        let attrValues="";
        if (attrObj && attrObj.values) {
            let attributeValues = attrObj.values;
            for (let valueIndex = 0; valueIndex < attributeValues.length; valueIndex++) {
                let attrbuteValue = attributeValues[valueIndex];
                if (attrbuteValue && attrbuteValue.value !== undefined) {
                    if (valueIndex > 0) {
                        attrValues = attrValues + ',';
                    }
                    attrValues = attrValues + attrbuteValue.value
                }
            }
        }else if(attrObj && attrObj.group){
            if(attrObj.group[0].value == "_NULL"){
                attrValues = attrObj.group[0].value;
            }else{
                attrValues = attrObj.group;
            }
        }
        return attrValues;
    },
    _createAttributeUpdateHistoryEvent: function (event, attributes, excludeAttribute, internalIds) {
        let historyList = [];
        let historyObj = {};
        for (let attribute in attributes) {
            if (attributes.hasOwnProperty(attribute)) {
                if ((excludeAttribute.indexOf(attribute) < 0) && (attribute.indexOf("previous-") < 0)) {
                    internalIds.attributeList.push(attribute);
                    let attrObj = attributes[attribute];
                    historyObj = {};
                    this._populateHistoryRecord(event, attrObj, historyObj, internalIds);
                    
                    historyObj.eventType = "attributeUpdate";
                    historyObj.internalAttributeId = attribute;

                    if(attributes.hasOwnProperty("previous-"+attribute)){
                        historyObj.previousValues = this._getCombinedAttributeValues(attributes["previous-"+attribute]);
                    }
                    historyObj.attributeValues = this._getCombinedAttributeValues(attrObj);
                    historyList.push(historyObj);
                }
            }
        }

        return historyList;
    },

    _createRelationshipHistoryEvent: function (event, relatioships, defaultRelationship, internalIds, excludeAttribute) {
        let historyList = [];
        let historyObj = {}
        for (let relationship in relatioships) {
            if (relatioships.hasOwnProperty(relationship)) {
                if (defaultRelationship.indexOf(relationship) < 0) {
                    let relationshipWith = relatioships[relationship];
                    for (let k = 0; k < relationshipWith.length; k++) {
                        let relTorelationship = relationshipWith[k];
                        if (relTorelationship && relTorelationship.relTo && relTorelationship.relTo.id) {
                            internalIds.relationshipList.push(relationship);
                            let isRelAttributeUpdate = false;
                            let relationshipChangeType = "";
                            if (this._isValidObjectPath(relTorelationship, 'properties.changeType')) {
                                relationshipChangeType = relTorelationship.properties.changeType;
                                if (relationshipChangeType.toLowerCase().indexOf('attribute') !== -1) {
                                    isRelAttributeUpdate = true;
                                }
                            }

                            if((isRelAttributeUpdate || relTorelationship.attributes) && !relationshipChangeType.startsWith("deleteRelationship")) {
                                let relAttributes = relTorelationship.attributes;
                                for (let attribute in relAttributes) {
                                    if (relAttributes.hasOwnProperty(attribute) && (excludeAttribute.indexOf(attribute) < 0) && (attribute.indexOf("previous-") < 0)) {
                                        let attrObj = relAttributes[attribute]
                                        historyObj = {};
                                        this._populateHistoryRecord(event, attrObj, historyObj, internalIds);
                                        isRelAttributeUpdate = true;
                                        historyObj.eventType = "relationshipAttributeUpdate";
                                        historyObj.internalAttributeId = attribute;
                                        historyObj.relationshipType = relationship;
                                        historyObj.internalRelToId = relTorelationship.relTo.id;
                                        historyObj.relToType = relTorelationship.relTo.type;
                                        historyObj.attributeValues = this._getCombinedAttributeValues(attrObj);
                                        if(relAttributes.hasOwnProperty("previous-"+attribute)){
                                            historyObj.previousValues = this._getCombinedAttributeValues(relAttributes["previous-"+attribute]);
                                        }
                                        historyList.push(historyObj);
                                    }
                                }
                            }
                            
                            if(!isRelAttributeUpdate){
                                historyObj = {};
                                this._populateHistoryRecord(event, relTorelationship, historyObj, internalIds);

                                historyObj.eventType = "relationshipChange";
                                historyObj.relationshipType = relationship;
                                historyObj.internalRelToId = relTorelationship.relTo.id;
                                historyObj.relToType = relTorelationship.relTo.type;
                                
                                historyList.push(historyObj);
                            }

                            let relToTypeId = relTorelationship.relTo.type + "_entityType";
                            if(internalIds.entityTypeList.indexOf(relToTypeId) == -1) {
                                internalIds.entityTypeList.push(relToTypeId);
                            }
                        }
                    }
                }
            }
        }
        return historyList;
    },

    _populateHistoryRecord: function (event, modelObj, historyObj, internalIds) {
        historyObj.id = event.id;
        historyObj.type = "entityhistoryevent";
        let data = historyObj["data"] = {};
        let historyAttributes = data["attributes"] = {};

        let user = "System",  action = "add";
        if(modelObj) {
            action = this._getActionType(modelObj);
        }
        historyAttributes.action = {
            "values": [
                {
                    "id": uuidV1(),
                    "value": action
                }
            ]
        };

        if (this._isValidObjectPath(event, 'properties.modifiedBy')) {
            user = event.properties.modifiedBy;
            if(internalIds.userIdList.indexOf(user) == -1) {
                internalIds.userIdList.push(user);
            }
            historyObj.user = user;
        };

        if (this._isValidObjectPath(event, 'properties.modifiedDate')) {
            historyAttributes.timeStamp = {
                "values": [
                    {
                        "id": uuidV1(),
                        "value": event.properties.modifiedDate
                    }
                ]
            };
        }
    },

    _getActionType: function (eventsObject) {
        let actionType = ""
        if (this._isValidObjectPath(eventsObject, 'properties.changeType')) {
            let changeType = eventsObject.properties.changeType;
            if (changeType.startsWith('add')) {
                actionType = "add";
            } else if (changeType.startsWith('update')) {
                actionType = "update";
            } else if (changeType.startsWith('delete')) {
                actionType = "delete";
            }
        }
        return actionType;
    },

    _fetchCurrentEntityDisplayModel: async function (internalIds, valContexts, dataContexts) {
        let req = {
            "params": {
                "query": {
                    "filters": {
                        "typesCriterion": [
                            "entityDisplayModel"
                        ]
                    },
                    "valueContexts": valContexts,
                    "contexts": dataContexts,
                    "id": internalIds.currentEntityType + "_entityDisplayModel"
                },
                "fields": {
                    "attributes": internalIds.attributeList,
                    "relationships": internalIds.relationshipList
                }
            }
        }
        let response = await this.post("entitymodelservice/getcoalesce", req);
        return response;
    },

    _fetchUserDetails: async function (userIdList) {
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
        let response = await this.post("entitymodelservice/get", req);
        return response;
    },

    _fetchEntityTypeDetails: async function (entityTypeIdList) {
        let req = {
            "params": {
                "query": {
                    "filters": {
                        "typesCriterion": [
                            "entityType"
                        ],
                        "ids": entityTypeIdList
                    }
                },
                "fields": {
                    "properties": [
                        "_ALL"
                    ]
                }
            }
        }
        let response = await this.post("entitymodelservice/get", req);
        return response;
    },
    
    _getAttributeAndRelTypeExternalName: function (externalResponse, attributesKeyValue, relationshipKeyValue) {
        if (this._isValidObjectPath(externalResponse, "response.entityModels.0.data")) {
            let data = externalResponse.response.entityModels[0].data;

            if(data.attributes && !isEmpty(data.attributes)) {
                let attributes = data.attributes;
                for (let attribute in attributes) {
                    if (attributes.hasOwnProperty(attribute)) {
                        let attrObj = attributes[attribute];
                        if (this._isValidObjectPath(attrObj, 'properties.externalName')) {
                            attributesKeyValue[attribute] = attrObj.properties.externalName;
                        }
                    }
                }
            }
        
            if(data.contexts && !isEmpty(data.contexts)) {
                let contexts = data.contexts;
                for (let i = 0; i < contexts.length; i++) {
                    let context = contexts[i];

                    if(context.attributes) {
                        for (let attribute in context.attributes) {
                            if (context.attributes.hasOwnProperty(attribute)) {
                                let attrObj = context.attributes[attribute];
                                if (this._isValidObjectPath(attrObj, 'properties.externalName')) {
                                    attributesKeyValue[attribute] = attrObj.properties.externalName;
                                }
                            }
                        }
                    }
                }
            
            }

            if(data.relationships && !isEmpty(data.relationships)) {
                let relationships = data.relationships;
                for (let relationship in relationships) {
                    if (relationships.hasOwnProperty(relationship)) {
                        let relObj = relationships[relationship][0];
                        if (this._isValidObjectPath(relObj, 'properties.externalName')) {
                            relationshipKeyValue[relationship] = relObj.properties.externalName;
                        }

                        if(relObj.attributes) {
                            for (let attribute in relObj.attributes) {
                                if (relObj.attributes.hasOwnProperty(attribute)) {
                                    let attrObj = relObj.attributes[attribute];
                                    if (this._isValidObjectPath(attrObj, 'properties.externalName')) {
                                        attributesKeyValue[attribute] = attrObj.properties.externalName;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    _getUserNamebyId: function (userList) {
        let userNames = {};
        for (let m = 0; m < userList.length; m++) {
            let userRecord = userList[m];
            let userName = "";
            if (this._isValidObjectPath(userRecord, 'properties.firstName')){
                userName = userRecord.properties.firstName;
            }
            if (this._isValidObjectPath(userRecord, 'properties.lastName')){
                userName = userName ? (userName + ' ' + userRecord.properties.lastName) : userRecord.properties.lastName;
            }
            if(_.isEmpty(userName)){
                userName = userRecord.properties.name
            }
            userNames[userRecord.id] = userName;
        }
        return userNames;
    },

    _getEntityTypeName: function (entityTypeList) {
        let entityTypeNames = {};
        for (let m = 0; m < entityTypeList.length; m++) {
            let entityTypeRecord = entityTypeList[m];
            if (this._isValidObjectPath(entityTypeRecord, 'properties.externalName'))
            entityTypeNames[entityTypeRecord.name] = entityTypeRecord.properties.externalName;
        }
        return entityTypeNames;
    },

    _isValidObjectPath: function (base, path) {
        let current = base;
        let components = path.split(".");
        for (let i = 0; i < components.length; i++) {
            if ((typeof current !== "object") || !(components[i] in current)) {
                return false;
            }
            current = current[components[i]];
        }
        return true;
    }
};

module.exports = EntityHistoryEventservice;