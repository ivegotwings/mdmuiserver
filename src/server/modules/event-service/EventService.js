var DFRestService = require('../common/df-rest-service/DFRestService'),
    isEmpty = require('../common/utils/isEmpty'),
    uuidV1 = require('uuid/v1');

var _ = require('underscore');

var Eventservice = function (options) {
    DFRestService.call(this, options);
};

const eventSubTypeMap = {
                            'QUEUED': ['QUEUED', 'QUEUED_SUCCESS', 'PROCESSING_STARTED'],
                            'PROCESSING': ['SUBMITTED', 'PROCESSING_COMPLETED', "PROCESSING_COMPLETE_WITH_WARNING"],
                            'ERRORED': ['PROCESSING_ERROR', 'ABORTED', 'SUBMISSION_ERROR', 'QUEUED_ERROR', "PROCESSING_START_ERROR", 
                                "PROCESSING_COMPLETE_ERROR", "PROCESSING_SUBMISSION_ERROR"]
                    };

const eventSubTypesOrder = [  "QUEUED",
                "QUEUED_SUCCESS",
                "PROCESSING_STARTED",
                "SUBMITTED",
                "PROCESSING_COMPLETED",
                "QUEUED_ERROR",
                "PROCESSING_START_ERROR",
                "PROCESSING_ERROR",
                "PROCESSING_COMPLETE_ERROR",
                "PROCESSING_COMPLETE_WITH_WARNING",
                "PROCESSING_SUBMISSION_ERROR" ];

Eventservice.prototype = {
    get: async function (request) {
         //console.log('prepare download request: ', request);
        var finalResponse = {};

        try {
            var eventServiceGetUrl = 'eventservice/get';
            var validationResult = this._validateRequest(request);

            if (!validationResult) {
                throw new Error("Incorrect request for event service get");
            }

            //console.log('event get request', JSON.stringify(request));

            var attributesCriteria = request.params.query.filters.attributesCriterion;
            var reqExternalEventSubType = undefined;

            for (var i in attributesCriteria) {
                if (attributesCriteria[i].eventSubType) {
                    var criteriaEventSubType = attributesCriteria[i].eventSubType.eq;
                    if(criteriaEventSubType && criteriaEventSubType.toUpperCase() != "ALL") {
                        reqExternalEventSubType = attributesCriteria[i].eventSubType.eq;
                        attributesCriteria.splice(i, 1);
                    }
                    break;
                }
            }

            delete request.params.options.from;
            delete request.params.options.to;
            //console.log('requested event sub type ', requestedEventSubType);
            //console.log('event get request to RDF', JSON.stringify(request));

            var res = await this.post(eventServiceGetUrl, request);
            
            var eventGroup = [];

            if(res && res.response && res.response.events && res.response.events.length > 0) {
                var events = res.response.events;
                var filteredEvents = [];
                //console.log('events ', JSON.stringify(events));

                var me = this;
                var groups = _.groupBy(events, function (event) { 
                        var groupKey =  me._getAttributeValue(event, "taskId");

                        if(!groupKey) {
                            groupKey = me._getAttributeValue(event, "fileName");
                        }

                        if(!groupKey) {
                            groupKey = "Unknown";
                        }

                        return groupKey;
                    });

                //console.log('groups ', JSON.stringify(groups));

                for(var groupKey in groups) {
                    var group = groups[groupKey];
                    var currentEventRecordIdx = 0;
                    var highOrderEvent = undefined;
                    var highOrderRecordCount = 0;

                    for (var i = 0; i < group.length; i++) { // start with 2nd record as first one is alread picked up
                        var event = group[i];
                        if(event && event.data && event.data.attributes && event.data.attributes.eventSubType && event.data.attributes.eventSubType.values) {
                            var eventSubType = this._getAttributeValue(event, "eventSubType");
                            var currentEventSubTypeIndex = eventSubTypesOrder.indexOf(eventSubType);
                            if(currentEventSubTypeIndex >= currentEventRecordIdx) {
                                highOrderEvent = event;
                                highOrderEvent.eventSubType = eventSubType;
                                
                                if(!this._getAttributeValue(highOrderEvent, "recordCount") && this._getAttributeValue(event, "recordCount")) {
                                    this._setAttributeValue(highOrderEvent, "recordCount", this._getAttributeValue(event, "recordCount"));
                                }

                                currentEventRecordIdx = currentEventSubTypeIndex;
                            }
                        }
                    }
                    //console.log('current high order event ', JSON.stringify(highOrderEvent));

                    if(highOrderEvent && (!reqExternalEventSubType || this._compareEventSubType(highOrderEvent.eventSubType, reqExternalEventSubType))) {

                        if(reqExternalEventSubType) {
                            this._setAttributeValue(highOrderEvent, "eventSubType", reqExternalEventSubType);
                        } 
                        else {
                            this._setAttributeValue(highOrderEvent, "eventSubType", this._getExternalEventSubType(highOrderEvent.eventSubType));
                        }
                        
                        filteredEvents.push(highOrderEvent);
                    }
                }

                res.response.events = filteredEvents;
            }

            finalResponse = res;

            //console.log('event get response: ', JSON.stringify(finalResponse, null, 2));
        }
        catch(err) {
            console.log('Failed to get event data.\nError:', err.message, '\nStackTrace:', err.stack);

            finalResponse = { 
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

        return finalResponse;
    },
    getTaskDetails: async function (request) {
        var response = {};

        try {
            
            var validationResult = this._validateRequest(request);

            if (!validationResult) {
                throw new Error("Incorrect request for event service get");
            }

            //console.log('event get request', JSON.stringify(request));

            //Get task details from events...
            var eventsGetRequest = this._generateEventsGetReqForTaskDetails(request.taskId);
            
            //console.log('event get request to RDF', JSON.stringify(eventsGetRequest));
            var eventServiceGetUrl = 'eventservice/get';
            var res = await this.post(eventServiceGetUrl, eventsGetRequest);

            if(res && res.response && res.response.events && res.response.events.length > 0) {
                var events = res.response.events;
                var currentEventRecordIdx = 0;
                var highOrderEvent = undefined;

                for (var i = 0; i < events.length; i++) { 
                    var event = events[i];
                    if(event && event.data && event.data.attributes && event.data.attributes.eventSubType && event.data.attributes.eventSubType.values) {
                        var currentEventSubTypeIndex = eventSubTypesOrder.indexOf(eventSubType);
                        if(currentEventSubTypeIndex >= currentEventRecordIdx) {
                            highOrderEvent = event;

                            if(!this._getAttributeValue(highOrderEvent, "recordCount") && this._getAttributeValue(event, "recordCount")) {
                                    this._setAttributeValue(highOrderEvent, "recordCount", this._getAttributeValue(event, "recordCount"));
                                }

                            currentEventRecordIdx = currentEventSubTypeIndex;
                        }
                    }
                }

                if(highOrderEvent) {
                    var eventSubType = this._getAttributeValue(highOrderEvent, "eventSubType");
                    var taskType = this._getAttributeValue(highOrderEvent, "profileType");
                    if(!taskType) {
                        taskType = this._getAttributeValue(highOrderEvent, "taskType");
                    }

                    var fileName = this._getAttributeValue(highOrderEvent, "fileName");
                    var submittedBy = this._getAttributeValue(highOrderEvent, "userId");
                    var totalRecords = this._getAttributeValue(highOrderEvent, "recordCount");
                    var message = this._getAttributeValue(highOrderEvent, "message");

                    response.taskId = request.taskId;
                    response.taskType = taskType ? taskType : "N/A";
                    response.fileName = fileName ? fileName : "N/A";
                    response.submittedBy = submittedBy ? submittedBy : "N/A";
                    response.totalRecords = totalRecords ? totalRecords : "N/A";
                    response.message = message ? message : "N/A";

                    //Consider low order event in order to identify StartTime..
                    //Since events are sorted by DateTime in descending order, we can consider the last record...
                    var lowOrderEvent = events[events.length - 1];
                    if(lowOrderEvent) {
                        var startTime = this._getAttributeValue(lowOrderEvent, "createdOn");

                        if(startTime) {
                            response.startTime = this._formatDate(new Date(startTime));
                        }
                    }

                    var taskStats = response["taskStats"] = {};
                    //Get in progress requests stats in RDF based on the status of highOrderEvent
                    if(eventSubType == "PROCESSING_COMPLETED") {
                        
                    }
                    else if(eventSubType == "PROCESSING_ERROR") {
                        taskStats.error = "100%";
                        taskStats.processing = "0%";
                        taskStats.success = "0%"; 
                        taskStats.createRecords = "0%";
                        taskStats.updateRecords = "0%";
                        taskStats.deleteRecords = "0%";
                        response.taskStatus = "Errored"; 
                    }
                    else {
                        taskStats.error = "0%";
                        taskStats.processing = "100%";
                        taskStats.success = "0%"; 
                        taskStats.createRecords = "0%";
                        taskStats.updateRecords = "0%";
                        taskStats.deleteRecords = "0%";
                        response.taskStatus = "Processing"; 
                    }
                }
            }

            //console.log('Task details get response: ', JSON.stringify(response, null, 2));
        }
        catch(err) {
            console.log('Failed to get task details.\nError:', err.message, '\nStackTrace:', err.stack);

            finalResponse = { 
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
    _generateEventsGetReqForTaskDetails: function (taskId) {
        var types = ["externalevent"];
        var attributeNames = ["fileName", "eventType", "eventSubType", "recordCount", "createdOn", "userId", "profileType", "taskType", "message"];
        var req = this._getRequestJson(types, attributeNames);
        req.params.query.valueContexts = [{
                        "source": "internal",
                        "locale": "en-US"
                    }];

        var attributesCriteria = [];
        var taskIdCriterion = {
            "taskId": {
                "exact": taskId
            }
        };
        var eventTypeCriterion = {
            "eventType": {
                "contains": "BATCH_COLLECT_ENTITY_IMPORT BATCH_TRANSFORM_ENTITY_IMPORT BATCH_EXTRACT"
            }
        };
        attributesCriteria.push(taskIdCriterion);
        attributesCriteria.push(eventTypeCriterion);
        req.params.query.filters.attributesCriterion = attributesCriteria;
        
        req.params.sort = {
            "attributes": [{
                "createdOn": "_DESC",
                "sortType": "_DATETIME"
            }]
        };

        return req;
    },
    _generateRequestTrackingGetReqForTaskDetails: function (taskId) {
        var types = ["requestObject"];
        var attributeNames = ["entityId", "entityAction", "requestStatus"];
        var req = this._getRequestJson(types, attributeNames);
        req.params.query.valueContexts = [{
                        "source": "internal",
                        "locale": "en-US"
                    }];

        var attributesCriteria = [];
        var taskIdCriterion = {
            "taskId": {
                "exact": taskId
            }
        };
        var serviceNameCriterion = {
            "serviceName": {
                "eq": "entityManageService"
            }
        };
        var entityActionCriterion = {
            "entityAction": {
                "contains": "create update delete"
            }
        };
        attributesCriteria.push(taskIdCriterion);
        attributesCriteria.push(serviceNameCriterion);
        attributesCriteria.push(entityActionCriterion);
        req.params.query.filters.attributesCriterion = attributesCriteria;

        return req;
    },
    _getRequestJson: function (types, attributeNames) {
        var req = {
                "params": {
                    "query": {
                        "filters": {
                            "typesCriterion": types
                        }
                    },
                    "fields": {
                        "ctxTypes": [
                            "properties"
                        ],
                        "attributes": attributeNames
                    }
                }
            };

        return req;
    },
    _getExternalEventSubType: function (internalEventSubType) {
        var eventSubFilterMap = eventSubTypeMap;

        for(var key in eventSubFilterMap) {
            var eventSubTypeFilters = eventSubFilterMap[key];

            //console.log('key ', key, 'event internal types ', JSON.stringify(eventSubTypeFilters), ' internal event sub types ', internalEventSubType);

            if(eventSubTypeFilters.indexOf(internalEventSubType) > -1) {
                return key;
            }
        }

        return "Unknown";
    },
    _compareEventSubType: function(currentInternalEventSubType, reqExternalEventSubType) {
        var externalEventSubType = this._getExternalEventSubType(currentInternalEventSubType);
        return externalEventSubType == reqExternalEventSubType;
    },
    _setAttributeValue: function(event, attrName, val) {
        if(event && event.data && event.data.attributes && event.data.attributes[attrName] && event.data.attributes[attrName].values) {
            if(event.data.attributes[attrName].values.length > 0) {
                event.data.attributes[attrName].values[0].value = val;
            }
            else {
                event.data.attributes[attrName].values.push({
                    "value": val,
                    "source": "internal",
                    "locale": "en-US"                    
                })
            }
        }
    },
    _getAttributeValue: function(event, attrName) {
        var val = undefined;
        if(event && event.data && event.data.attributes && event.data.attributes[attrName] && event.data.attributes[attrName].values && event.data.attributes[attrName].values.length > 0) {
            val = event.data.attributes[attrName].values[0].value;
        }
        
        return val;
    },
    _validateRequest: function (request) {
        return true;
    },
    _formatDate: function (date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
        return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " +
            strTime;
    },
};

module.exports = Eventservice;