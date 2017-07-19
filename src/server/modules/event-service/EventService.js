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

const eventTypesOrder = ["BATCH_COLLECT_ENTITY_IMPORT",
    "BATCH_TRANSFORM_ENTITY_IMPORT",
    "PROCESSING_STARTED",
    "BATCH_EXTRACT",
    "BATCH_COLLECT_ENTITY_EXPORT",
    "BATCH_TRANSFORM_ENTITY_EXPORT",
    "BATCH_PUBLISH_ENTITY_EXPORT"];

const eventSubTypesOrder = ["QUEUED",
    "QUEUED_SUCCESS",
    "PROCESSING_STARTED",
    "SUBMITTED",
    "PROCESSING_COMPLETED",
    "QUEUED_ERROR",
    "PROCESSING_START_ERROR",
    "PROCESSING_ERROR",
    "PROCESSING_COMPLETE_ERROR",
    "PROCESSING_COMPLETE_WITH_WARNING",
    "PROCESSING_SUBMISSION_ERROR"];

Eventservice.prototype = {
    get: async function (request) {
        var response = {};

        if (request.params.isTaskListGetRequest) {
            delete request.params.isTaskListGetRequest;
            response = await this.getTaskList(request);
        }
        else {
            var eventServiceGetUrl = 'eventservice/get';
            response = await this.post(eventServiceGetUrl, request);
        }

        return response;
    },
    getTaskList: async function (request) {
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
                    if (criteriaEventSubType && criteriaEventSubType.toUpperCase() != "ALL") {
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

            if (res && res.response && res.response.events && res.response.events.length > 0) {
                var events = res.response.events;
                var filteredEvents = [];
                //console.log('events ', JSON.stringify(events));

                var me = this;
                var groups = _.groupBy(events, function (event) {
                    var groupKey = me._getAttributeValue(event, "taskId");

                    if (!groupKey) {
                        groupKey = me._getAttributeValue(event, "fileName");
                    }

                    if (!groupKey) {
                        groupKey = "Unknown";
                    }

                    return groupKey;
                });

                //console.log('groups ', JSON.stringify(groups));

                for (var groupKey in groups) {
                    var group = groups[groupKey];
                    var currentEventRecordIdx = 0;
                    var highOrderEvent = undefined;
                    var highOrderRecordCount = 0;

                    for (var i = 0; i < group.length; i++) { // start with 2nd record as first one is alread picked up
                        var event = group[i];
                        if (event && event.data && event.data.attributes && event.data.attributes.eventSubType && event.data.attributes.eventSubType.values) {
                            var eventSubType = this._getAttributeValue(event, "eventSubType");
                            var currentEventSubTypeIndex = eventSubTypesOrder.indexOf(eventSubType);
                            if (currentEventSubTypeIndex >= currentEventRecordIdx) {
                                highOrderEvent = event;
                                highOrderEvent.eventSubType = eventSubType;

                                if (!this._getAttributeValue(highOrderEvent, "recordCount") && this._getAttributeValue(event, "recordCount")) {
                                    this._setAttributeValue(highOrderEvent, "recordCount", this._getAttributeValue(event, "recordCount"));
                                }

                                currentEventRecordIdx = currentEventSubTypeIndex;
                            }
                        }
                    }
                    //console.log('current high order event ', JSON.stringify(highOrderEvent));

                    if (highOrderEvent && (!reqExternalEventSubType || this._compareEventSubType(highOrderEvent.eventSubType, reqExternalEventSubType))) {

                        if (reqExternalEventSubType) {
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
        catch (err) {
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

            var taskId = request.body.taskId;
            //console.log('Get details for ', taskId);

            //Get Batch Events to get basic information of reuested tasks...
            var attributeNames = ["fileId", "fileName", "formatter", "eventType", "eventSubType", "recordCount", "createdOn", "userId", "profileType", "taskType", "message", "integrationType"];
            var eventTypeFilterString = "BATCH_COLLECT_ENTITY_IMPORT BATCH_TRANSFORM_ENTITY_IMPORT BATCH_EXTRACT BATCH_COLLECT_ENTITY_EXPORT BATCH_TRANSFORM_ENTITY_EXPORT BATCH_PUBLISH_ENTITY_EXPORT";
            var eventSubTypeFilterString = "";
            var eventsGetRequest = this._generateEventsGetReq(taskId, attributeNames, eventTypeFilterString, eventSubTypeFilterString, false);

            //console.log('Batch events get request to RDF', JSON.stringify(eventsGetRequest));
            var eventServiceGetUrl = 'eventservice/get';
            var batchEventsGetRes = await this.post(eventServiceGetUrl, eventsGetRequest);

            //console.log('Batch events get response from RDF', JSON.stringify(batchEventsGetRes, null, 2));

            if (batchEventsGetRes && batchEventsGetRes.response && batchEventsGetRes.response.events && batchEventsGetRes.response.events.length > 0) {
                var events = batchEventsGetRes.response.events;
                var highOrderEvent = events[0];
                var lowerOrderEvent = events[events.length-1];
                var processingStartedEvent = undefined;

                for (var i = 1; i < events.length; i++) {
                    var event = events[i];
                    if (event && event.data && event.data.attributes) {
                        var eventSubType = this._getAttributeValue(event, "eventSubType");
                        if (!this._getAttributeValue(highOrderEvent, "recordCount") && this._getAttributeValue(event, "recordCount")) {
                            this._setAttributeValue(highOrderEvent, "recordCount", this._getAttributeValue(event, "recordCount"));
                        }

                        if (!processingStartedEvent && eventSubType == "PROCESSING_STARTED") {
                            processingStartedEvent = event;
                        }
                    }
                }

                if (highOrderEvent) {
                    //console.log('higher order event ', JSON.stringify(highOrderEvent, null, 2));
                    var eventType = this._getAttributeValue(highOrderEvent, "eventType");
                    var eventSubType = this._getAttributeValue(highOrderEvent, "eventSubType");
                    var taskType = this._getTaskTypeFromEvent(highOrderEvent);

                    var fileName = this._getAttributeValue(highOrderEvent, "fileName");
                    var fileId = this._getAttributeValue(highOrderEvent, "fileId");
                    var formatter = this._getAttributeValue(highOrderEvent, "formatter");
                    var submittedBy = this._getAttributeValue(highOrderEvent, "userId");
                    var totalRecords = this._getAttributeValue(highOrderEvent, "recordCount");
                    var message = this._getAttributeValue(highOrderEvent, "message");

                    response.taskId = taskId;
                    response.taskType = taskType;
                    response.fileId = fileId ? fileId : "N/A";
                    response.fileName = fileName ? fileName : response.fileId;
                    response.fileFormat = formatter ? formatter : "N/A";
                    response.submittedBy = submittedBy ? submittedBy.replace("_user", "") : "N/A";
                    response.totalRecords = totalRecords ? totalRecords : "N/A";
                    response.message = message ? message : "N/A";
                    response.endTime = "N/A";

                    //Consider low order event in order to identify StartTime..
                    //Since events are sorted by DateTime in descending order, we can consider the last but one record (last record is with status Queued)...
                    if (processingStartedEvent) {
                        //console.log('processing started event', JSON.stringify(processingStartedEvent, null, 2));
                        var startTime = this._getAttributeValue(processingStartedEvent, "createdOn");

                        if (startTime) {
                            response.startTime = this._formatDate(new Date(startTime));
                        }
                    }

                    var taskStats = response["taskStats"] = {};
                    taskStats.error = "N/A";
                    taskStats.processing = "N/A";
                    taskStats.success = "N/A";
                    taskStats.createRecords = "N/A";
                    taskStats.updateRecords = "N/A";
                    taskStats.deleteRecords = "N/A";

                    //Get in progress requests stats in RDF based on the status of highOrderEvent
                    if (eventSubType == "PROCESSING_COMPLETED") {
                        if(eventType == "BATCH_PUBLISH_ENTITY_EXPORT") {
                            taskStats.success = "100%";
                            taskStats.error = "0%";
                            taskStats.processing = "0%";
                            response.taskStatus = "Completed";
                        }
                        else if ((eventType != "BATCH_COLLECT_ENTITY_EXPORT" && eventType != "BATCH_TRANSFORM_ENTITY_EXPORT" 
                            && (response.totalRecords == "N/A" || response.totalRecords == "0"))) {
                            //console.log(' marking complete sooner ', JSON.stringify(response), JSON.stringify(highOrderEvent));
                            taskStats.success = "100%";
                            taskStats.error = "0%";
                            taskStats.processing = "0%";
                            response.taskStatus = "Completed";
                        }
                        else {
                            //Get errored record events within COP/RSConnect for a requested task 
                            var preProcessErroredRecordsCount = 0;
                            var lastErroredRecordEvent;
                            var attributeNames = [];
                            var eventTypeFilterString = "RECORD_TRANSFORM_ENTITY_IMPORT RECORD_PUBLISH_ENTITY_IMPORT RECORD_PUBLISH_ENTITY_EXPORT RECORD_LOAD";
                            var eventSubTypeFilterString = "PROCESSING_ERROR PROCESSING_COMPLETE_ERROR";
                            var eventsGetRequest = this._generateEventsGetReq(taskId, attributeNames, eventTypeFilterString, eventSubTypeFilterString, true);

                            //console.log('Record events get request to RDF', JSON.stringify(eventsGetRequest));
                            var recordEventsGetRes = await this.post(eventServiceGetUrl, eventsGetRequest);
                            //console.log('Record events get response to RDF', JSON.stringify(recordEventsGetRes));
                            if (recordEventsGetRes && recordEventsGetRes.response) {
                                preProcessErroredRecordsCount = recordEventsGetRes.response.totalRecords;

                                // Just to make sure if errors are more than total records submitted
                                if(preProcessErroredRecordsCount > totalRecords) {
                                    preProcessErroredRecordsCount = totalRecords;
                                }

                                if (recordEventsGetRes.response.events && recordEventsGetRes.response.events.length > 0) {
                                    lastErroredRecordEvent = recordEventsGetRes.response.events[0];
                                }
                            }

                            if (totalRecords == preProcessErroredRecordsCount) {
                                //All records errored out...
                                taskStats.error = "100%";
                                taskStats.processing = "0%";
                                taskStats.success = "0%";
                                response.taskStatus = "Errored";

                                //End time is the time when last errored record event has been created...
                                if (lastErroredRecordEvent && lastErroredRecordEvent.properties) {
                                    var endTime = lastErroredRecordEvent.properties.createdDate;

                                    if (endTime) {
                                        response.endTime = this._formatDate(new Date(endTime));
                                    }
                                }
                            }
                            else if (!(eventType == "BATCH_COLLECT_ENTITY_EXPORT" || eventType == "BATCH_TRANSFORM_ENTITY_EXPORT" || eventType == "BATCH_PUBLISH_ENTITY_EXPORT")) {
                                //Generate request tracking get request...
                                var isBulkWorkflowTask = false;
                                if(taskType.toLowerCase().indexOf("workflow") >= 0) {
                                    isBulkWorkflowTask = true;
                                }

                                var requestTrackingGetRequest = this._generateRequestTrackingGetReqForTaskDetails(taskId, isBulkWorkflowTask);

                                //console.log('Request tracking get request to RDF', JSON.stringify(requestTrackingGetRequest));
                                var requestTrackingGetUrl = 'requesttrackingservice/get';
                                var reqTrackingRes = await this.post(requestTrackingGetUrl, requestTrackingGetRequest);
                                //console.log('Request tracking get response from RDF', JSON.stringify(reqTrackingRes));
                                //console.log('Response object so far', JSON.stringify(response, null, 2));
                                if (reqTrackingRes && reqTrackingRes.response && reqTrackingRes.response.requestObjects && reqTrackingRes.response.requestObjects.length > 0) {
                                    this._populateTaskDetailsBasedOnReqTrackingResponse(response, reqTrackingRes, preProcessErroredRecordsCount, isBulkWorkflowTask);
                                }
                                else {
                                    taskStats.processing = "100%";
                                    taskStats.success = "0%";
                                    taskStats.error = "0%";
                                    response.taskStatus = "Processing";
                                }
                            }
                            else {
                                //console.log('no filter, so writing processing as generic status');
                                taskStats.processing = "100%";
                                taskStats.success = "0%";
                                taskStats.error = "0%";
                                response.taskStatus = "Processing";
                            }
                        }
                    }
                    else if (eventSubType == "PROCESSING_ERROR" || eventSubType == "PROCESSING_COMPLETE_ERROR" ||
                        eventSubType == "PROCESSING_START_ERROR" || eventSubType == "PROCESSING_SUBMISSION_ERROR") {
                        taskStats.error = "100%";
                        taskStats.processing = "0%";
                        taskStats.success = "0%";
                        response.taskStatus = "Errored";
                        response.preProcessFailure = true;

                        //End time is the time when error event has been created...
                        if (highOrderEvent.properties) {
                            var endTime = highOrderEvent.properties.createdDate;

                            if (endTime) {
                                response.endTime = this._formatDate(new Date(endTime));
                            }
                        }
                    }
                    else {
                        taskStats.processing = "100%";
                        taskStats.success = "0%";
                        taskStats.error = "0%";
                        response.taskStatus = "Processing";
                    }
                }

                //console.log('Task details get response: ', JSON.stringify(response, null, 2));
            }
        }
        catch (err) {
            console.log('Failed to get task details.\nError:', err.message, '\nStackTrace:', err.stack);

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
    _generateEventsGetReq: function (taskId, attributeNames, eventTypesFilterString, eventSubTypesFilterString, isRecordCountGet) {
        var types = ["externalevent"];
        var req = this._getRequestJson(types);

        if (attributeNames && attributeNames.length > 0) {
            req.params.fields.attributes = attributeNames;
            req.params.query.valueContexts = [{
                "source": "internal",
                "locale": "en-US"
            }];
        }

        var attributesCriteria = [];
        var taskIdCriterion = {
            "taskId": {
                "exact": taskId
            }
        };
        attributesCriteria.push(taskIdCriterion);

        if (eventTypesFilterString && eventTypesFilterString.length > 0) {
            var eventTypeCriterion = {
                "eventType": {
                    "contains": eventTypesFilterString
                }
            };
            attributesCriteria.push(eventTypeCriterion);
        }
        if (eventSubTypesFilterString && eventSubTypesFilterString.length > 0) {
            var eventSubTypeCriterion = {
                "eventSubType": {
                    "contains": eventSubTypesFilterString
                }
            };
            attributesCriteria.push(eventSubTypeCriterion);
        }
        req.params.query.filters.attributesCriterion = attributesCriteria;

        req.params.sort = {
            "attributes": [{
                "createdOn": "_DESC",
                "sortType": "_DATETIME"
            }]
        };

        if (isRecordCountGet) {
            req.params.options = {
                "maxRecords": 1
            }
        }

        return req;
    },
    _generateRequestTrackingGetReqForTaskDetails: function (taskId, isBulkWorkflowTask) {
        var types = ["requestObject"];
        var req = this._getRequestJson(types);

        var attributeNames = ["entityId", "entityType", "entityAction", "requestStatus"];
        req.params.fields.attributes = attributeNames;
        req.params.query.valueContexts = [{
            "source": "rdp",
            "locale": "en-US"
        }];

        var attributesCriteria = [];

        //Add task id criterion...
        var taskIdCriterion = {
            "taskId": {
                "exact": taskId
            }
        };
        attributesCriteria.push(taskIdCriterion);

        //Add service name criterion...
        var serviceName = "entityManageService";
        if(isBulkWorkflowTask) {
            serviceName = "entityGovernService";
        }

        var serviceNameCriterion = {
            "serviceName": {
                "eq": serviceName
            }
        };
        attributesCriteria.push(serviceNameCriterion);

        if(!isBulkWorkflowTask) {
            var entityActionCriterion = {
                "entityAction": {
                    "contains": "create update delete"
                }
            };
            attributesCriteria.push(entityActionCriterion);
        }
        
        req.params.query.filters.attributesCriterion = attributesCriteria;

        //  req.params.sort = {
        //     "properties": [{
        //         "createdDate": "_ASC",
        //         "sortType": "_DATETIME"
        //     }]
        // };

        return req;
    },
    _getRequestJson: function (types) {
        var req = {
            "params": {
                "query": {
                    "filters": {
                        "typesCriterion": types
                    }
                },
                "fields": {
                }
            }
        };

        return req;
    },
    _populateTaskDetailsBasedOnReqTrackingResponse: function (taskDetails, reqTrackingResponse, preProcessErroredRecordsCount, isBulkWorkflowTask) {
        var requestObjects = reqTrackingResponse.response.requestObjects;

        var successCount = 0;
        var errorCount = 0;
        var createCount = 0;
        var updateCount = 0;
        var deleteCount = 0;
        var successObjIds = [];
        var successObjTypes = [];

        if(isBulkWorkflowTask) {
            var me = this;
            var groups = _.groupBy(requestObjects, function (reqObj) {
                var groupKey = me._getAttributeValue(reqObj, "entityId");

                if (!groupKey) {
                    groupKey = "Unknown";
                }

                return groupKey;
            });

            //console.log('Req Objects groups ', JSON.stringify(groups));

            for (var groupKey in groups) {
                var group = groups[groupKey];

                var objId = undefined;
                var objType = undefined;
                var errored = false;
                var processing = false;

                for (var i = 0; i < group.length; i++) {
                    var reqObj = group[i];

                    if(!objId) {
                        objId = this._getAttributeValue(reqObj, "entityId");
                        objType = this._getAttributeValue(reqObj, "entityType");
                    }

                    var objStatus = this._getAttributeValue(reqObj, "requestStatus");
                    if(objStatus == "error") {
                        errorCount++;
                        errored = true;
                        break;
                    }
                    else if(objStatus == "inProgress") {
                        processing = true;
                        break;
                    }
                }

                if(!errored && !processing) {
                    successCount++;
                    successObjIds.push(objId);

                    if (successObjTypes.indexOf(objType) < 0) {
                        successObjTypes.push(objType);
                    }
                }
            }
        }
        else {
            for (var i = 0; i < requestObjects.length; i++) {
                var reqObj = requestObjects[i];

                var objId = this._getAttributeValue(reqObj, "entityId");
                var objType = this._getAttributeValue(reqObj, "entityType");
                var objStatus = this._getAttributeValue(reqObj, "requestStatus");
                var objAction = this._getAttributeValue(reqObj, "entityAction");

                if (objStatus == "success") {
                    successCount++;
                    successObjIds.push(objId);

                    if (successObjTypes.indexOf(objType) < 0) {
                        successObjTypes.push(objType);
                    }
                }
                else if (objStatus == "error") {
                    errorCount++;
                }

                switch (objAction) {
                    case "create":
                        createCount++;
                        break;
                    case "update":
                        updateCount++;
                        break;
                    case "delete":
                        deleteCount++;
                        break;
                }
            }
        }

        //Calculate various stats
        var totalRecordCount = parseInt(taskDetails.totalRecords);

        if (totalRecordCount == successCount) {
            taskDetails.taskStatus = "Completed";
            taskDetails.taskStats.success = "100%";
            taskDetails.taskStats.error = "0%";
            taskDetails.taskStats.processing = "0%";
        }
        else if (totalRecordCount == errorCount) {
            taskDetails.taskStatus = "Errored";
            taskDetails.taskStats.error = "100%";
            taskDetails.taskStats.success = "0%";
            taskDetails.taskStats.processing = "0%";
        }
        else {
            if (totalRecordCount == successCount + errorCount + preProcessErroredRecordsCount) {
                taskDetails.taskStatus = "Completed With Errors";
            }
            else {
                taskDetails.taskStatus = "Processing"
            }

            var inProgressCount = totalRecordCount - (successCount + errorCount + preProcessErroredRecordsCount);

            var successPercentage = (successCount * 100) / totalRecordCount;
            var errorPercentage = ((errorCount + preProcessErroredRecordsCount) * 100) / totalRecordCount;
            var inProgressPercentage = (inProgressCount * 100) / totalRecordCount;

            if(successPercentage > 100) {
                successPercentage = 100;
            }

            if(errorPercentage > 100) {
                errorPercentage = 100;
            }

            if(inProgressPercentage > 100) {
                inProgressPercentage = 100;
            }

            taskDetails.taskStats.success = parseInt(successPercentage) + "%";
            taskDetails.taskStats.error = parseInt(errorPercentage) + "%";
            taskDetails.taskStats.processing = parseInt(inProgressPercentage) + "%";
        }

        var createPercentage = (createCount * 100) / totalRecordCount;
        var updatePercentage = (updateCount * 100) / totalRecordCount;
        var deletePercentage = (deleteCount * 100) / totalRecordCount;

        taskDetails.taskStats.createRecords = parseInt(createPercentage) + "%";
        taskDetails.taskStats.updateRecords = parseInt(updatePercentage) + "%";
        taskDetails.taskStats.deleteRecords = parseInt(deletePercentage) + "%";

        //TODO:: Commenting end time calculation as requestObjects do not have created date...
        // if(taskDetails.taskStatus != "Processing") {
        //     //Task has been completed... End time is the time of last request object creation...
        //     var lastCreatedReqObj = requestObjects[requestObjects.length - 1];
        //     if (lastCreatedReqObj && lastCreatedReqObj.properties) {
        //         var endTime = lastCreatedReqObj.properties.createdDate;

        //         if (endTime) {
        //             taskDetails.endTime = this._formatDate(new Date(endTime));
        //         }
        //     }
        // }

        taskDetails.successEntities = {
            "ids": successObjIds,
            "types": successObjTypes
        }
    },
    _getExternalEventSubType: function (internalEventSubType) {
        var eventSubFilterMap = eventSubTypeMap;

        for (var key in eventSubFilterMap) {
            var eventSubTypeFilters = eventSubFilterMap[key];

            //console.log('key ', key, 'event internal types ', JSON.stringify(eventSubTypeFilters), ' internal event sub types ', internalEventSubType);

            if (eventSubTypeFilters.indexOf(internalEventSubType) > -1) {
                return key;
            }
        }

        return "Unknown";
    },
    _compareEventSubType: function (currentInternalEventSubType, reqExternalEventSubType) {
        var externalEventSubType = this._getExternalEventSubType(currentInternalEventSubType);
        return externalEventSubType == reqExternalEventSubType;
    },
    _setAttributeValue: function (event, attrName, val) {
        if (event && event.data && event.data.attributes) {
            if (event.data.attributes[attrName] && event.data.attributes[attrName].values && event.data.attributes[attrName].values.length > 0) {
                event.data.attributes[attrName].values[0].value = val;
            }
            else {
                event.data.attributes[attrName] = {};
                event.data.attributes[attrName].values = [{
                    "value": val,
                    "source": "internal",
                    "locale": "en-US"
                }];
            }
        }
    },
    _getAttributeValue: function (event, attrName) {
        var val = undefined;
        if (event && event.data && event.data.attributes && event.data.attributes[attrName] && event.data.attributes[attrName].values && event.data.attributes[attrName].values.length > 0) {
            val = event.data.attributes[attrName].values[0].value;
        }

        return val;
    },
    _getTaskTypeFromEvent: function (event) {
        var taskType;

        var taskType = this._getAttributeValue(event, "profileType");
        if (!taskType) {
            taskType = this._getAttributeValue(event, "taskType");
        }

        if (taskType) {
            switch (taskType.toLowerCase()) {
                case "entity_import":
                    taskType = "Entity data imports";

                    var integrationType = this._getAttributeValue(event, "integrationType");
                    if (integrationType && integrationType.toLowerCase() == "system") {
                        taskType = "System integrations - entity data imports";
                    }
                    break;
                case "entity_export":
                    taskType = "Entity data exports";

                    var integrationType = this._getAttributeValue(event, "integrationType");
                    if (integrationType && integrationType.toLowerCase() == "system") {
                        taskType = "System integrations - entity data exports";
                    }
                    break;
                case "transitionworkflow":
                case "transitionworkflow-query":
                    taskType = "Bulk Workflow Transitions";
                    break;
                case "changeassignment":
                case "changeassignment-query":
                    taskType = "Bulk Workflow Assignments";
                    break;
            }
        }
        else {
            taskType = "N/A";
        }

        return taskType;
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