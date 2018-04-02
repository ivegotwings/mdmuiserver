var DFRestService = require('../common/df-rest-service/DFRestService'),
    isEmpty = require('../common/utils/isEmpty'),
    uuidV1 = require('uuid/v1'),
    arrayContains = require('../common/utils/array-contains'),
    moment = require('moment');

var _ = require('underscore');

var EntityHistoryEventservice = function (options) {
    DFRestService.call(this, options);
};

const falcorUtil = require('../../../shared/dataobject-falcor-util');
const pathKeys = falcorUtil.getPathKeys();

EntityHistoryEventservice.prototype = {
    get: async function (requestObj) {
        var response = {};

        try {
            request = falcorUtil.cloneObject(requestObj);
            if (request.params) {
                if (request.params.query && request.params.query.filters) {
                    request.params.query.filters.typesCriterion = ["entitymanageevent"]
                }

                if (request.params.isSearchRequest) {
                    //This is for initiate search... make search call and return response
                    response = await this.post("eventservice/get", request);

                    if (response && response.response && response.response.events) {
                        var events = response.response.events;

                        for (var i = 0; i < events.length; i++) {
                            var event = events[i];
                            event.type = "entityhistoryevent";
                        }
                    }
                } else {
                    //This is for getbyids...
                    var valContexts = undefined;
                    var dataContexts = undefined;
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

                    response = await this.post("eventservice/get", request);
                    if (response && response.response && response.response.events) {
                        var events = response.response.events;
                        var historyList = await this._generateHistoryData(events, valContexts, dataContexts);

                        response.response.events = historyList;
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

        finally {
        }
        return response;
    },

    _generateHistoryData: async function (events, valContexts, dataContexts) {
        var historyList = [];
        var historyListToBeReturned = [];
        var defaultAttribute = ['clientId', 'relatedRequestId', 'eventSubType', 'entityType', 'entityId', 'eventType', 'entityAction', 'taskId'];
        var defaultRelationship = ['eventTarget'];
        var internalIds = {};
        internalIds.attributeList = [];
        internalIds.relationshipList = [];
        internalIds.entityTypeList = [];
        internalIds.userIdList = [];
        internalIds.currentEntityType = "";

        for (var i = 0; i < events.length; i++) {
            var event = events[i];

            //Note: When multiple updates happens at the same time, display updates in the order-
            //context attributes, relationships, self attributes, entity create. 
            //Hence adding updates in this order
            if (this._isValidObjectPath(event, 'data.contexts.0.attributes')) {
                var contextAttributes = event.data.contexts[0].attributes;
                var contextAttributeUpdateHistoryEvent = this._createAttributeUpdateHistoryEvent(event, contextAttributes, defaultAttribute, internalIds)
                Array.prototype.push.apply(historyList, contextAttributeUpdateHistoryEvent);
            }

            if (this._isValidObjectPath(event, 'data.relationships')) {
                var relationships = event.data.relationships;
                var relatioshipsHistoryEvent = this._createRelationshipHistoryEvent(event, relationships, defaultRelationship, internalIds)
                Array.prototype.push.apply(historyList, relatioshipsHistoryEvent);
            }

            if (this._isValidObjectPath(event, 'data.attributes')) {
                var attributes = event.data.attributes;

                if (i == 0 && this._isValidObjectPath(attributes, 'entityType.values.0.value')) {
                    internalIds.currentEntityType = attributes.entityType.values[0].value;
                }

                if (this._isValidObjectPath(attributes, 'eventType.values.0.value')) {
                    var actionType = attributes.eventType.values[0].value;
                    if (actionType == 'EntityAdd') {
                        var attributeUpdateHistoryEvent = this._createAttributeUpdateHistoryEvent(event, attributes, defaultAttribute, internalIds)
                        Array.prototype.push.apply(historyList, attributeUpdateHistoryEvent);

                        var attributeAddHistoryEvent = this._createEntityAddHistoryEvent(event, attributes, internalIds);
                        Array.prototype.push.apply(historyList, attributeAddHistoryEvent);
                    }
                    else if (actionType == 'EntityUpdate') {
                        var attributeUpdateHistoryEvent = this._createAttributeUpdateHistoryEvent(event, attributes, defaultAttribute, internalIds)
                        Array.prototype.push.apply(historyList, attributeUpdateHistoryEvent);
                    }
                }
            }
        }

        //Resolve all internal ids to external names...
        var attributesKeyValue = {};
        var relationshipKeyValue = {};
        var userNamebyIdKeyValue = {};
        var entityTypeKeyValue = {};

        if (internalIds.attributeList.length > 0) {
            var externalResponse = await this._fetchCurrentEntityManageModel(internalIds, valContexts, dataContexts);

            if(externalResponse) {
                this._getAttributeAndRelTypeExternalName(externalResponse, attributesKeyValue, relationshipKeyValue)
            }
        }

        if (internalIds.userIdList.length > 0) {
            var userDetailResponse = await this._fetchUserDetails(internalIds.userIdList);
            if (this._isValidObjectPath(userDetailResponse, "response.entityModels")) {
                var userList = userDetailResponse.response.entityModels;
                if (userList && userList.length > 0) {
                    userNamebyIdKeyValue = this._getUserNamebyId(userList);
                }
            }
        }

        if (internalIds.entityTypeList.length > 0) {
            var entityTypeDetailResponse = await this._fetchEntityTypeDetails(internalIds.entityTypeList);
            if (this._isValidObjectPath(entityTypeDetailResponse, "response.entityModels")) {
                var entityTypeList = entityTypeDetailResponse.response.entityModels;
                if (entityTypeList && entityTypeList.length > 0) {
                    entityTypeKeyValue = this._getEntityTypeName(entityTypeList);
                }
            }
        }

        for (var h = 0; h < historyList.length; h++) {
            var historyRecord = historyList[h];
            var message = "", userName = undefined, attributeExternalName = undefined, relationshipExternalName = undefined, 
                entityTypeExternalName = undefined, relToTypeExternalName = undefined;

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
            } else if(historyRecord.eventType == "attributeUpdate"){
                if (historyRecord.data.attributes.action.values[0].value == "delete") {
                    message = "<span class='userName'>" + userName + "</span> removed <span class='activity-property'>" + attributeExternalName + "</span>";
                } else {
                    message = "<span class='userName'>" + userName + "</span> changed <span class='activity-property'>" + attributeExternalName + "</span>";
                    if(historyRecord.previousValues) {
                        message += " from <span class='prev-attribute-value'>" + historyRecord.previousValues + "</span>";
                    }
                    if(historyRecord.attributeValues) {
                        message += " to <span class='attribute-value'>" + historyRecord.attributeValues + "</span>";
                    }
                }
            } else if(historyRecord.eventType == "relationshipChange"){
                if (historyRecord.data.attributes.action.values[0].value == "delete") {
                    message = "<span class='userName'>" + userName + "</span> removed <a href='?id="+ historyRecord.internalRelToId+"&type=" + historyRecord.relToType + "'>" + relToTypeExternalName + ": " + historyRecord.internalRelToId + "</a> having <span class='activity-property'>" + relationshipExternalName + "</span> relationship";
                } else {
                    message = "<span class='userName'>" + userName + "</span> added <a href='?id="+ historyRecord.internalRelToId+"&type=" + historyRecord.relToType + "'>" + relToTypeExternalName + ": " + historyRecord.internalRelToId + "</a> having <span class='activity-property'>" + relationshipExternalName + "</span> relationship";
                }
            } else if(historyRecord.eventType == "relationshipAttributeUpdate"){
                if (historyRecord.data.attributes.action.values[0].value == "delete") {
                    message = "<span class='userName'>" + userName + "</span> removed <span class='activity-property'>" + attributeExternalName + "</span> for <a href='?id="+ historyRecord.internalRelToId+"&type=" + historyRecord.relToType + "'>" + relToTypeExternalName + ": " + historyRecord.internalRelToId + "</a> having <span class='activity-property'>" + relationshipExternalName + "</span> relationship";
                } else {
                    message = "<span class='userName'>" + userName + "</span> changed <span class='activity-property'>" + attributeExternalName + "</span> to <span class='attribute-value'>" + historyRecord.attributeValues + "</span> for <a href='?id="+ historyRecord.internalRelToId+"&type=" + historyRecord.relToType + "'>" + relToTypeExternalName + ": " + historyRecord.internalRelToId + "</a> having <span class='activity-property'>" + relationshipExternalName + "</span> relationship";
                }
            }

            var messageValue = {
                "id": uuidV1(),
                "value": message
            };

            //Check whether this historyRecord already added in historyListToBeReturned...
            //If yes append this message to the added record
            var addedHistoryRecord = undefined;
            for (var i = 0; i < historyListToBeReturned.length; i++) {
                var record = historyListToBeReturned[i];

                if(record.id == historyRecord.id) {
                    addedHistoryRecord = record;
                    break;
                }
            }

            if(addedHistoryRecord) {
                var attributes = addedHistoryRecord.data.attributes;
                attributes.message.values.push(messageValue);
                attributes.action.values.push(historyRecord.data.attributes.action.values[0])
            } else {
                historyRecord.data.attributes.message = {
                    "values": [
                        messageValue
                    ]
                };

                historyListToBeReturned.push(historyRecord);
            }
        }

        return historyListToBeReturned;
    },

    _createEntityAddHistoryEvent: function (event, attributes, internalIds) {
        var historyList = []
        var historyObj = {};
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
        var attrValues="";
        if (attrObj && attrObj.values) {
            var attributeValues = attrObj.values;
            for (var k = 0; k < attributeValues.length; k++) {
                var attrbuteValue = attributeValues[k];
                if (attrbuteValue && attrbuteValue.value !== undefined) {
                    if (k > 0) {
                        attrValues = attrValues + ',';
                    }
                    attrValues = attrValues + attrbuteValue.value
                }
            }
        }
        return attrValues;
    },
    _createAttributeUpdateHistoryEvent: function (event, attributes, defaultAttribute, internalIds) {
        var historyList = [];
        var historyObj = {};
        for (var attribute in attributes) {
            if (attributes.hasOwnProperty(attribute)) {
                if ((defaultAttribute.indexOf(attribute) < 0) && (attribute.indexOf("previous-") < 0)) {
                    internalIds.attributeList.push(attribute);
                    var attrObj = attributes[attribute]
                    historyObj = {};
                    this._populateHistoryRecord(event, attrObj, historyObj, internalIds);
                    
                    historyObj.eventType = "attributeUpdate";
                    historyObj.internalAttributeId = attribute;
                    historyObj.attributeValues = undefined;

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

    _createRelationshipHistoryEvent: function (event, relatioships, defaultRelationship, internalIds) {
        var historyList = [];
        var historyObj = {}
        for (var relationship in relatioships) {
            if (relatioships.hasOwnProperty(relationship)) {
                if (defaultRelationship.indexOf(relationship) < 0) {
                    var relationshipWith = relatioships[relationship];
                    for (var k = 0; k < relationshipWith.length; k++) {
                        var relTorelationship = relationshipWith[k];
                        if (relTorelationship && relTorelationship.relTo && relTorelationship.relTo.id) {
                            internalIds.relationshipList.push(relationship);
                            var isRelAttributeUpdate = false;
                            var relationshipChangeType = "";
                            if (this._isValidObjectPath(relTorelationship, 'properties.changeType')) {
                                relationshipChangeType = relTorelationship.properties.changeType;
                                if (relationshipChangeType.toLowerCase().indexOf('attribute') !== -1) {
                                    isRelAttributeUpdate = true;
                                }
                            }

                            if((isRelAttributeUpdate || relTorelationship.attributes) && !relationshipChangeType.startsWith("deleteRelationship")) {
                                var relAttributes = relTorelationship.attributes;
                                for (var attribute in relAttributes) {
                                    if (relAttributes.hasOwnProperty(attribute)) {
                                        var attrObj = relAttributes[attribute]
                                        historyObj = {};
                                        this._populateHistoryRecord(event, relTorelationship, historyObj, internalIds);

                                        historyObj.eventType = "relationshipAttributeUpdate";
                                        historyObj.internalAttributeId = attribute;
                                        historyObj.relationshipType = relationship;
                                        historyObj.internalRelToId = relTorelationship.relTo.id;
                                        historyObj.relToType = relTorelationship.relTo.type;
                                        historyObj.attributeValues = this._getCombinedAttributeValues(attrObj);
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

                            var relToTypeId = relTorelationship.relTo.type + "_entityType";
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
        var data = historyObj["data"] = {};
        var historyAttributes = data["attributes"] = {};

        var user = "System",  action = "add";
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
        var actionType = ""
        if (this._isValidObjectPath(eventsObject, 'properties.changeType')) {
            var changeType = eventsObject.properties.changeType;
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

    _fetchCurrentEntityManageModel: async function (internalIds, valContexts, dataContexts) {
        var req = {
            "params": {
                "query": {
                    "filters": {
                        "typesCriterion": [
                            "entityManageModel"
                        ]
                    },
                    "valueContexts": valContexts,
                    "contexts": dataContexts,
                    "id": internalIds.currentEntityType + "_entityManageModel"
                },
                "fields": {
                    "attributes": internalIds.attributeList,
                    "relationships": internalIds.relationshipList
                }
            }
        }
        response = await this.post("entitymodelservice/getcoalesce", req);
        return response
    },

    _fetchUserDetails: async function (userIdList) {
         var req = {
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
        response = await this.post("entitymodelservice/get", req);
        return response
    },

    _fetchEntityTypeDetails: async function (entityTypeIdList) {
        var req = {
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
        response = await this.post("entitymodelservice/get", req);
        return response
    },
    
    _getAttributeAndRelTypeExternalName: function (externalResponse, attributesKeyValue, relationshipKeyValue) {
        if (this._isValidObjectPath(externalResponse, "response.entityModels.0.data")) {
            var data = externalResponse.response.entityModels[0].data;

            if(data.attributes && !isEmpty(data.attributes)) {
                var attributes = data.attributes;
                for (var attribute in attributes) {
                    if (attributes.hasOwnProperty(attribute)) {
                        var attrObj = attributes[attribute];
                        if (this._isValidObjectPath(attrObj, 'properties.externalName')) {
                            attributesKeyValue[attribute] = attrObj.properties.externalName;
                        }
                    }
                }
            }
        
            if(data.contexts && !isEmpty(data.contexts)) {
                var contexts = data.contexts;
                for (var i = 0; i < contexts.length; i++) {
                    var context = contexts[i];

                    if(context.attributes) {
                        for (var attribute in context.attributes) {
                            if (context.attributes.hasOwnProperty(attribute)) {
                                var attrObj = context.attributes[attribute];
                                if (this._isValidObjectPath(attrObj, 'properties.externalName')) {
                                    attributesKeyValue[attribute] = attrObj.properties.externalName;
                                }
                            }
                        }
                    }
                }
            
            }

            if(data.relationships && !isEmpty(data.relationships)) {
                var relationships = data.relationships;
                for (var relationship in relationships) {
                    if (relationships.hasOwnProperty(relationship)) {
                        var relObj = relationships[relationship][0];
                        if (this._isValidObjectPath(relObj, 'properties.externalName')) {
                            relationshipKeyValue[relationship] = relObj.properties.externalName;
                        }

                        if(relObj.attributes) {
                            for (var attribute in relObj.attributes) {
                                if (relObj.attributes.hasOwnProperty(attribute)) {
                                    var attrObj = relObj.attributes[attribute];
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
        var userNames = {};
        for (var m = 0; m < userList.length; m++) {
            var userRecord = userList[m];
            if (this._isValidObjectPath(userRecord, 'properties.firstName'))
                userNames[userRecord.id] = userRecord.properties.firstName + ' ' + userRecord.properties.lastName;
        }
        return userNames;
    },

    _getEntityTypeName: function (entityTypeList) {
        var entityTypeNames = {};
        for (var m = 0; m < entityTypeList.length; m++) {
            var entityTypeRecord = entityTypeList[m];
            if (this._isValidObjectPath(entityTypeRecord, 'properties.externalName'))
            entityTypeNames[entityTypeRecord.name] = entityTypeRecord.properties.externalName;
        }
        return entityTypeNames;
    },

    _isValidObjectPath: function (base, path) {
        var current = base;
        var components = path.split(".");
        for (var i = 0; i < components.length; i++) {
            if ((typeof current !== "object") || (!components[i] in current)) {
                return false;
            }
            current = current[components[i]];
        }
        return true;
    }
};

module.exports = EntityHistoryEventservice;