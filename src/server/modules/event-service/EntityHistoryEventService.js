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
    get: async function (request) {
        var response = {};

        try {
            if (request.params) {
                if (request.params.query && request.params.query.filters) {
                    request.params.query.filters.typesCriterion = ["entitymanageevent"]
                }

                if (request.params.isSearchRequest) {
                    //This is for initiate search... make search call and return response
                    response = await this.post("eventservice/get", request);
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
                        delete request.params.query.contexts;
                    }

                    if (request.params.fields) {
                        request.params.fields.attributes = ["_ALL"];
                        request.params.fields.relationships = ["_ALL"];
                    }

                    response = await this.post("eventservice/get", request);
                    if (response && response.response && response.response.events) {
                        var events = response.response.events;
                        // console.log('babu',urlModule.parse(request.headers))
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
        var defaultAttribute = ['clientId', 'relatedRequestId', 'eventSubType', 'entityType', 'entityId', 'eventType', 'entityAction'];
        var defaultRelationship = ['eventTarget'];
        var internalIds = {};
        internalIds.attributeList = [];
        internalIds.userMailIdList = [];
        internalIds.currentEntityType = ""


        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            if (this._isValidObjectPath(event, 'data.attributes')) {
                var attributes = event.data.attributes;
                if (i == 0 && this._isValidObjectPath(attributes, 'entityType.values.0.value')) {
                    internalIds.currentEntityType = attributes.entityType.values[0].value;
                }
                if (this._isValidObjectPath(attributes, 'eventType.values.0.value')) {
                    var actionType = attributes.eventType.values[0].value;
                    if (actionType == 'EntityAdd') {
                        var attributeAddHistoryEvent = this._createEntityAddHistoryEvent(event, attributes, internalIds);
                        Array.prototype.push.apply(historyList, attributeAddHistoryEvent);
                    }
                    else if (actionType == 'EntityUpdate') {
                        var attributeUpdateHistoryEvent = this._createAttributeUpdateHistoryEvent(event, attributes, defaultAttribute, internalIds)
                        Array.prototype.push.apply(historyList, attributeUpdateHistoryEvent);
                    }
                }
            }

            if (this._isValidObjectPath(event, 'data.relationships')) {
                var relatioships = event.data.relationships;
                var relatioshipsHistoryEvent = this._createRelationshipHistoryEvent(event, relatioships, defaultRelationship, internalIds)
                Array.prototype.push.apply(historyList, relatioshipsHistoryEvent);
            }
        }

        if (internalIds.attributeList.length > 0) {
            var externalResponse = await this._fetchCurrentEntityManageModel(internalIds, valContexts, dataContexts);
            if (this._isValidObjectPath(externalResponse, "response.entityModels.0.data.attributes")) {
                var attributes = externalResponse.response.entityModels[0].data.attributes;
                var attributesKeyValue = this._getAtttibuteExternalName(attributes);
                console.log('userDetails', JSON.stringify(attributesKeyValue));
            }
        }
        if (internalIds.userMailIdList.length > 0) {
            uniqueIdList = internalIds.userMailIdList.filter(function (item, pos) {
                return internalIds.userMailIdList.indexOf(item) == pos;
            })
            console.log("req start", uniqueIdList);
            var userDetailResponse = await this._fetchUserDetails(uniqueIdList, valContexts, dataContexts);
            if (this._isValidObjectPath(userDetailResponse, "response.entityModels")) {
                var userList = userDetailResponse.response.entityModels;
                if (userList.length > 0) {
                    var UserNamebyEnailKeyValue = this._getUserNamebyEmail(userList);
                    console.log('userDetails', JSON.stringify(UserNamebyEnailKeyValue));
                }
            }
        }
        for (var h = 0; h < historyList.length; h++) {
            var historyReccord = historyList[h];
            var message="";
            if (historyReccord && historyReccord.user) {
                historyReccord["userName"] = UserNamebyEnailKeyValue[historyReccord.user];
            }
            if (historyReccord.eventType == 'attributeUpdate') {
                var externalName = "";
                if (historyReccord && historyReccord.internalObjId) {
                    externalName = attributesKeyValue[historyReccord.internalObjId];
                    historyReccord["ExtenalName"] = externalName;
                }
            }  
            if(historyReccord.eventType == "attributeAdd"){
                message = "<span class='userName'>" + historyReccord.userName + "</span> created this <span class='activity-property'>" + historyReccord.entityType + "</span>";
            }else if(historyReccord.eventType == "attributeUpdate"){
                if (historyReccord.data.attributes.action.values[0].value == "delete") {
                    message = "<span class='userName'>" + historyReccord.userName + "</span> removed <span class='activity-property'>" + historyReccord.ExtenalName + "</span>";
                } else {
                    message = "<span class='userName'>" + historyReccord.userName + "</span> changed <span class='activity-property'>" + historyReccord.ExtenalName + "</span> to " + historyReccord.attributeValues;
                }

            }else if(historyReccord.eventType == "relationship"){
                if (historyReccord.data.attributes.action.values[0].value == "delete") {
                    message = "<span class='userName'>" + historyReccord.userName + "</span> removed <a href='?id="+ historyReccord.internalObjId+"&type="+historyReccord.relToType+"'>" + historyReccord.internalObjId + "</a> from <span class='activity-property'>" + historyReccord.relationshipType + "</span> relationship";
                } else {
                    message = "<span class='userName'>" + historyReccord.userName + "</span> added relationship <span class='activity-property'>" + historyReccord.relationshipType + "</span> with <a href='?id="+ historyReccord.internalObjId+"&type="+historyReccord.relToType+"'>" + historyReccord.internalObjId + "</a>";
                }
            }
            historyReccord.data.attributes.message = {
                "values": [
                    {
                        "id": uuidV1(),
                        "value": message
                    }
                ]
            };
        }
        return historyList;
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
                    "relationships": [
                        "_ALL"
                    ]
                }
            }
        }
        response = await this.post("entitymodelservice/getcoalesce", req);
        return response
    },

    _getUserNamebyEmail: function (userList) {
        var userNames = {};
        for (var m = 0; m < userList.length; m++) {
            var userRecord = userList[m];
            if (this._isValidObjectPath(userRecord, 'properties.firstName'))
                userNames[userRecord.name] = userRecord.properties.firstName;
        }
        return userNames;
    },
    _getAtttibuteExternalName: function (attributes) {
        var attributeName = {};
        for (var attribute in attributes) {
            if (attributes.hasOwnProperty(attribute)) {
                var attrValue = attributes[attribute];
                if (this._isValidObjectPath(attrValue, 'properties.externalName'))
                    attributeName[attribute] = attrValue.properties.externalName;
            }
        }
        return attributeName;
    },
    _fetchUserDetails: async function (uniqueIdList, valContexts, dataContexts) {
        var req = {
            "params": {
                "query": {
                    "filters": {
                        "typesCriterion": [
                            "user"
                        ],
                        "propertiesCriterion": [
                            {
                                "email": {
                                    "exacts": ["business1jcp@riversand.com", "admin@riversand.com"]
                                }
                            }
                        ]
                    }
                },
                "fields": {
                    "attributes": [
                        "_ALL"
                    ],
                    "relationships": [
                        "_ALL"
                    ]
                }
            }
        }
        response = await this.post("entitymodelservice/get", req);
        return response
    },
    _createEntityAddHistoryEvent: function (event, attributes, internalIds) {
        var historyList = []
        var historyObj = {}
        historyObj.id = event.id;
        historyObj.type = "entitymanageevent";
        historyObj.eventType = "attributeAdd"
        var data = historyObj["data"] = {};
        var historyAttributes = data["attributes"] = {};
        historyAttributes.action = {
            "values": [
                {
                    "id": uuidV1(),
                    "value": "add"
                }
            ]
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

        var user = "System";
        if (this._isValidObjectPath(event, 'properties.modifiedBy')) {
            user = event.properties.modifiedBy;
            if (user.substr(user.length - 5) == "_user") {
                user = user.slice(0, -5)
            }
            historyObj.user = user;
            internalIds.userMailIdList.push(user);
        }

        if (this._isValidObjectPath(attributes, 'entityType.values.0.value')) {
            historyObj.entityType = attributes.entityType.values[0].value;
        }
        historyList.push(historyObj)
        return historyList;
    },

    _createAttributeUpdateHistoryEvent: function (event, attributes, defaultAttribute, internalIds) {
        var historyList = [];
        var historyObj = {};
        for (var attribute in attributes) {
            if (attributes.hasOwnProperty(attribute)) {
                if (defaultAttribute.indexOf(attribute) < 0) {
                    internalIds.attributeList.push(attribute);
                    var user = "",action = "",attrValues="";
                    var attrObj = attributes[attribute]
                    historyObj = {}
                    historyObj.id = event.id;
                    historyObj.type = "entitymanageevent";
                    historyObj.eventType = "attributeUpdate";
                    historyObj.internalObjId = attribute;
                    historyObj.attributeValues = "";
                    var data = historyObj["data"] = {};
                    var historyAttributes = data["attributes"] = {};
                    action = this._getActionType(attrObj);
                    historyAttributes.action = {
                        "values": [
                            {
                                "id": uuidV1(),
                                "value": action
                            }
                        ]
                    };
                    if (attrObj && attrObj.values) {
                        var attributeValues = attrObj.values;
                        for (var k = 0; k < attributeValues.length; k++) {
                            var attrbuteValue = attributeValues[k];
                            if (attrbuteValue && attrbuteValue.value) {
                                if (k > 0) {
                                    attrValues = attrValues + ',';
                                }
                                attrValues = attrValues + attrbuteValue.value
                            }
                        }
                        historyObj.attributeValues = attrValues;
                    }
                    if (this._isValidObjectPath(event, 'properties.modifiedBy')) {
                        user = event.properties.modifiedBy;
                        if (user.substr(user.length - 5) == "_user") {
                            user = user.slice(0, -5)
                        }
                        historyObj.user = user;
                        internalIds.userMailIdList.push(user);
                    }
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
                    if (this._isValidObjectPath(attributes, 'entityType.values.0.value')) {
                        historyObj.entityType = attributes.entityType.values[0].value;
                    }
                    historyList.push(historyObj);
                }
            }
        }
        return historyList;
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
                            historyObj = {}
                            historyObj.id = event.id;
                            historyObj.type = "entitymanageevent";
                            historyObj.eventType = "relationship";
                            var data = historyObj["data"] = {};
                            var historyAttributes = data["attributes"] = {};
                            var user = "",  action = "";
                            action = this._getActionType(relTorelationship);
                            historyAttributes.action = {
                                "values": [
                                    {
                                        "id": uuidV1(),
                                        "value": action
                                    }
                                ]
                            };
                            historyObj.relationshipType = relationship;
                            historyObj.internalObjId = relTorelationship.relTo.id;
                            historyObj.relToType = relTorelationship.relTo.type;
                            if (this._isValidObjectPath(event, 'properties.modifiedBy')) {
                                user = event.properties.modifiedBy;
                                if (user.substr(user.length - 5) == "_user") {
                                    user = user.slice(0, -5)
                                }
                                historyObj.user = user;
                                internalIds.userMailIdList.push(user);
                            }
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
                            historyList.push(historyObj);
                        }
                    }

                }
            }
        }
        return historyList;
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