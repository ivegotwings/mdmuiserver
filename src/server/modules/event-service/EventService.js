var DFRestService = require('../common/df-rest-service/DFRestService'),
    isEmpty = require('../common/utils/isEmpty'),
    uuidV1 = require('uuid/v1'),
    arrayContains = require('../common/utils/array-contains'),
    moment = require('moment');

var config = require('config');
var taskSummarizationProcessorEnabled = config.get('modules.webEngine.taskSummarizationProcessorEnabled');

var _ = require('underscore');

var Eventservice = function (options) {
    DFRestService.call(this, options);
};

const falcorUtil = require('../../../shared/dataobject-falcor-util');
const pathKeys = falcorUtil.getPathKeys();

const eventSubTypeMap = {
    'QUEUED': ['QUEUED', 'QUEUED_SUCCESS', 'PROCESSING_STARTED'],
    'PROCESSING': ['SUBMITTED', 'PROCESSING_COMPLETED', "PROCESSING_COMPLETE_WITH_WARNING"],
    'ERRORED': ['PROCESSING_ERROR', 'ABORTED', 'SUBMISSION_ERROR', 'QUEUED_ERROR', "PROCESSING_START_ERROR",
        "PROCESSING_COMPLETE_ERROR", "PROCESSING_SUBMISSION_ERROR"]
};

const eventTypesOrder = ["BATCH_COLLECT_ENTITY_IMPORT",
    "BATCH_TRANSFORM_ENTITY_IMPORT",
    "EXTRACT",
    "BATCH_COLLECT_ENTITY_EXPORT",
    "BATCH_TRANSFORM_ENTITY_EXPORT",
    "BATCH_PUBLISH_ENTITY_EXPORT"];

const eventSubTypesOrder = ["NONE",
    "QUEUED",
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
        var getBasedOnTaskSummarizationProcessor = false;
        
        //Task summarization processor temp changes...
        if(taskSummarizationProcessorEnabled) {
            if(request.params.fields) {
                var attributeList = request.params.fields.attributes;

                if(attributeList && arrayContains(attributeList, "isSummaryFromTaskProcessor")) {
                    getBasedOnTaskSummarizationProcessor = true;
                }
            }
        }

        if(getBasedOnTaskSummarizationProcessor) {
            response = await this.getImportTaskList(request);
        } else { 
            if (request.params.isTaskListGetRequest) {
                delete request.params.isTaskListGetRequest;
                response = await this.getTaskList(request);
            }
            else {
                //Remove valuecontexts as for events get it is not needed...
                if(request.params && request.params.query) {
                    delete request.params.query.valueContexts;
                }
                var eventServiceGetUrl = 'eventservice/get';
                response = await this.post(eventServiceGetUrl, request);
            }
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
                            if (currentEventSubTypeIndex > currentEventRecordIdx) {
                                highOrderEvent = event;
                                highOrderEvent.eventSubType = eventSubType;

                                currentEventRecordIdx = currentEventSubTypeIndex;
                            }

                            if(highOrderEvent) {
                                if (!this._getAttributeValue(highOrderEvent, "recordCount") && this._getAttributeValue(event, "recordCount")) {
                                    this._setAttributeValue(highOrderEvent, "recordCount", this._getAttributeValue(event, "recordCount"));
                                }
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

            //Task summarization processor temp changes...
            if(taskSummarizationProcessorEnabled) {
                response = await this._getTaskDetailsFromSummarizationProcessor(taskId);

                if(response && !isEmpty(response)) {
                    return response;
                }
            }

            //Get Batch Events to get basic information of reuested tasks...
            var attributeNames = ["fileId", "fileName", "fileType", "eventType", "eventSubType", "recordCount", "createdOn", "userId", "profileType", "taskName", "taskType", "message", "integrationType"];
            var eventTypeFilterString = "BATCH_COLLECT_ENTITY_IMPORT BATCH_TRANSFORM_ENTITY_IMPORT EXTRACT BATCH_COLLECT_ENTITY_EXPORT BATCH_TRANSFORM_ENTITY_EXPORT BATCH_PUBLISH_ENTITY_EXPORT";
            var eventSubTypeFilterString = "";
            var eventsGetRequest = this._generateEventsGetReq(taskId, attributeNames, eventTypeFilterString, eventSubTypeFilterString, false);

            //console.log('Batch events get request to RDF', JSON.stringify(eventsGetRequest));
            var eventServiceGetUrl = 'eventservice/get';
            var batchEventsGetRes = await this.post(eventServiceGetUrl, eventsGetRequest);

            //console.log('Batch events get response from RDF', JSON.stringify(batchEventsGetRes, null, 2));

            if (batchEventsGetRes && batchEventsGetRes.response && batchEventsGetRes.response.events && batchEventsGetRes.response.events.length > 0) {
                var events = batchEventsGetRes.response.events;
                var highOrderEvent = undefined;
                var processingStartedEvent = undefined;
                var highOrderEventTypeIndex = 0;

                var me = this;
                var eventGroups = _.groupBy(events, function (event) {
                    var groupKey = me._getAttributeValue(event, "eventType");

                    if (!groupKey) {
                        groupKey = "Unknown";
                    }

                    return groupKey;
                });

                for (var groupKey in eventGroups) {
                    var eventType = groupKey;
                    var currentEventTypeIndex =  eventTypesOrder.indexOf(eventType);

                    if(currentEventTypeIndex > highOrderEventTypeIndex) {
                        var eventGroup = eventGroups[groupKey];
                        var highOrderEventSubTypeIndex = 0;

                        for (var i = 0; i < eventGroup.length; i++) {
                            var event = eventGroup[i];
                            if (event && event.data && event.data.attributes) {
                                var eventSubType = this._getAttributeValue(event, "eventSubType");
                                var currentEventSubTypeIndex = eventSubTypesOrder.indexOf(eventSubType);
                                if (currentEventSubTypeIndex > highOrderEventSubTypeIndex) {
                                    highOrderEvent = event;

                                    highOrderEventSubTypeIndex = currentEventSubTypeIndex;
                                }
                            }
                        }

                        highOrderEventTypeIndex = currentEventTypeIndex;
                    }
                }

                for (var i = 0; i < events.length; i++) {
                    var event = events[i];
                    if (event && event.data && event.data.attributes) {
                        var eventSubType = this._getAttributeValue(event, "eventSubType");
                        
                        if(highOrderEvent) {
                            if (!this._getAttributeValue(highOrderEvent, "recordCount")) {
                                var currentEventRecordCount = this._getAttributeValue(event, "recordCount");
                                if(currentEventRecordCount) {
                                    this._setAttributeValue(highOrderEvent, "recordCount", currentEventRecordCount);
                                }
                            }
                        }

                        if (eventSubType == "PROCESSING_STARTED") {
                            processingStartedEvent = event;
                        }
                    }
                }

                if (highOrderEvent) {
                    //console.log('higher order event ', JSON.stringify(highOrderEvent, null, 2));
                    var eventType = this._getAttributeValue(highOrderEvent, "eventType");
                    var eventSubType = this._getAttributeValue(highOrderEvent, "eventSubType");
                    var taskType = this._getTaskType(highOrderEvent);

                    var taskName = this._getAttributeValue(highOrderEvent, "taskName");
                    var fileName = this._getAttributeValue(highOrderEvent, "fileName");
                    var fileId = this._getAttributeValue(highOrderEvent, "fileId");
                    var fileType = this._getAttributeValue(highOrderEvent, "fileType");
                    var submittedBy = this._getAttributeValue(highOrderEvent, "userId");
                    var totalRecords = this._getAttributeValue(highOrderEvent, "recordCount");
                    var message = this._getAttributeValue(highOrderEvent, "message");

                    response.taskId = taskId;
                    response.taskName = taskName ? taskName : "N/A";
                    response.taskType = taskType;
                    response.fileId = fileId ? fileId : "N/A";
                    response.fileName = fileName ? fileName : response.fileId;
                    response.fileType = fileType ? fileType : "N/A";
                    response.submittedBy = submittedBy ? submittedBy.replace("_user", "") : "N/A";
                    response.totalRecords = totalRecords ? totalRecords : "N/A";
                    response.message = message ? message : "N/A";
                    response.startTime = "N/A";
                    response.endTime = "N/A";

                    //Consider low order event in order to identify StartTime..
                    //Since events are sorted by DateTime in descending order, we can consider the last but one record (last record is with status Queued)...
                    if (processingStartedEvent) {
                        //console.log('processing started event', JSON.stringify(processingStartedEvent, null, 2));
                        var startTime = this._getAttributeValue(processingStartedEvent, "createdOn");

                        if (startTime) {
                            response.startTime = startTime
                        }
                    }

                    var taskStats = response["taskStats"] = {};
                    taskStats.error = "N/A";
                    taskStats.processing = "N/A";
                    taskStats.success = "N/A";
                    taskStats.createRecords = "0%";
                    taskStats.updateRecords = "0%";
                    taskStats.deleteRecords = "0%";
                    //By default setting noChange to 100%... At this stage we are not sure about the records which got changed.. 
                    //this will be calculated later on
                    taskStats.noChangeRecords = "100%"; 

                    //Get in progress requests stats in RDF based on the status of highOrderEvent
                    if (eventSubType == "PROCESSING_COMPLETED") {
                        if(eventType == "BATCH_COLLECT_ENTITY_IMPORT" || eventType == "BATCH_COLLECT_ENTITY_EXPORT") {
                            taskStats.processing = "100%";
                            taskStats.success = "0%";
                            taskStats.error = "0%";
                            response.taskStatus = "Processing";
                        }
                        else if(eventType == "BATCH_PUBLISH_ENTITY_EXPORT") {
                            taskStats.success = "100%";
                            taskStats.error = "0%";
                            taskStats.processing = "0%";
                            response.taskStatus = "Completed";

                            //End time is the time when event has been created...
                            response.endTime = this._getEventCreatedDate(highOrderEvent);
                        }
                        else if ((eventType != "BATCH_TRANSFORM_ENTITY_EXPORT" && (response.totalRecords == "N/A" || response.totalRecords == "0"))) {
                            //console.log(' marking complete sooner ', JSON.stringify(response), JSON.stringify(highOrderEvent));
                            taskStats.success = "100%";
                            taskStats.error = "0%";
                            taskStats.processing = "0%";
                            response.taskStatus = "Completed";

                            //End time is the time when event has been created...
                            response.endTime = this._getEventCreatedDate(highOrderEvent);
                        }
                        else {
                            //Get errored record events within COP/RSConnect for a requested task 
                            var preProcessErroredRecordsCount = 0;
                            var lastErroredRecordEvent;
                            var attributeNames = ["createdOn"]; //This attribute is needed to get endTime
                            var eventTypeFilterString = "RECORD_TRANSFORM_ENTITY_IMPORT RECORD_PUBLISH_ENTITY_IMPORT RECORD_PUBLISH_ENTITY_EXPORT LOAD";
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
                                response.endTime = this._getEventCreatedDate(lastErroredRecordEvent);
                            }
                            else if (!(eventType == "BATCH_COLLECT_ENTITY_EXPORT" || eventType == "BATCH_TRANSFORM_ENTITY_EXPORT" || eventType == "BATCH_PUBLISH_ENTITY_EXPORT")) {
                                //Generate request tracking get request...
                                var isBulkWorkflowTask = false;
                                if(taskType.toLowerCase().indexOf("workflow") >= 0) {
                                    isBulkWorkflowTask = true;
                                }

                                var requestTrackingGetRequest = this._generateRequestTrackingGetReqForTaskDetails(taskId, isBulkWorkflowTask, totalRecords);

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
                        response.endTime = this._getEventCreatedDate(highOrderEvent);
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
    //Task summarization processor temp changes...
    getImportTaskList: async function (request) {
        var response = {};
        try {
            var importTaskListGetRequest = this._generateImportTaskListGetRequest(request);
            
            var importTaskListGetUrl = 'requesttrackingservice/get';
            response = await this.post(importTaskListGetUrl, importTaskListGetRequest);

            if(response) {
                this._convertTaskSummaryObjectInToEvents(response);
            }
        }
        catch (err) {
            console.log('Failed to get task list.\nError:', err.message, '\nStackTrace:', err.stack);
        
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
    _generateRequestTrackingGetReqForTaskDetails: function (taskId, isBulkWorkflowTask, totalRecords) {
        var types = ["requestobject"];
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

            var impactedEventCriterion = {
                "impacted": {
                    "exact": "false"
                }
            };
            attributesCriteria.push(impactedEventCriterion);
        }
        
        req.params.query.filters.attributesCriterion = attributesCriteria;

         req.params.sort = {
            "properties": [{
                "createdDate": "_ASC",
                "sortType": "_DATETIME"
            }]
        };

        req.params.options = {
            "maxRecords": totalRecords
        }

        return req;
    },
    //Task summarization processor temp changes...
    _generateImportTaskListGetRequest: function (inputRequest) {
        var types = ["tasksummaryobject"];
        var req = this._getRequestJson(types);

        if(!inputRequest.params.isTaskListGetRequest) {
            var attributeNames = ["_ALL"];
            req.params.fields.attributes = attributeNames;
        }
        // req.params.query.valueContexts = [{
        //     "source": "rdp",
        //     "locale": "en-US"
        // }];

        if(inputRequest.params.query.ids) {
            req.params.query.ids = inputRequest.params.query.ids;
        } else if (inputRequest.params.query.id) {
            req.params.query.id = inputRequest.params.query.id;
        }

        var requestedAttributeCriteria = inputRequest.params.query.filters.attributesCriterion;
        if(requestedAttributeCriteria) {
            var status = undefined;
            var taskType = "entity_import";
            var taskTypeOperator = undefined;
            var userId = undefined;
            var integrationType = undefined;

            for (var i in requestedAttributeCriteria) {
                if(requestedAttributeCriteria[i].eventSubType) {
                    status = requestedAttributeCriteria[i].eventSubType.eq;
                } else if(requestedAttributeCriteria[i].taskType) {
                    taskType = requestedAttributeCriteria[i].taskType.contains;
                    taskTypeOperator = requestedAttributeCriteria[i].taskType.operator;
                } else if(requestedAttributeCriteria[i].userId) {
                    userId = requestedAttributeCriteria[i].userId.eq;
                } else if(requestedAttributeCriteria[i].integrationType) {
                    integrationType = requestedAttributeCriteria[i].integrationType.eq;
                }
            }

            var attributesCriteria = [];
            
            //Add task type criterion...
            var taskTypeCriterion = {
                "taskType": {
                    "contains": taskType
                }
            };

            if(taskTypeOperator) {
                taskTypeCriterion.taskType.operator = taskTypeOperator;
            }

            attributesCriteria.push(taskTypeCriterion);

            if (status) {
                //Add task status criterion...
                var taskStatusCriterion = {
                    "status": {
                        "contains": status.toLowerCase()
                    }
                };
                attributesCriteria.push(taskStatusCriterion);
            }

            if (userId) {
                //Add user id criterion...
                var userIdCriterion = {
                    "submittedBy": {
                        "eq": userId
                    }
                };
                attributesCriteria.push(userIdCriterion);
            }

            if(integrationType) {
                //Add integration type criterion...
                var integrationTypeCriterion = {
                    "integrationType": {
                        "eq": integrationType
                    }
                };
                attributesCriteria.push(integrationTypeCriterion);
            }

            req.params.query.filters.attributesCriterion = attributesCriteria;
        }

        var requestedKeywordCriteria = inputRequest.params.query.filters.keywordsCriterion;
        if(requestedKeywordCriteria) {
            req.params.query.filters.keywordsCriterion = requestedKeywordCriteria;
        }

        //checking for propertiesCriterion
        var propertiesCriterion = inputRequest.params.query.filters.propertiesCriterion;
        if(propertiesCriterion) {
            if(propertiesCriterion.length>0) {
                req.params.query.filters.propertiesCriterion = propertiesCriterion;
            }
        }
        

        req.params.sort = {
            "properties": [{
                "createdDate": "_DESC",
                "sortType": "_DATETIME"
            }]
        };

        var dataIndexInfo = pathKeys.dataIndexInfo["requestTracking"].dataSubIndexInfo["requestTracking"];
        req.params.options = {
            "maxRecords": dataIndexInfo.maxRecordsToReturn
        }

        return req;
    },
    //Task summarization processor temp changes...
    _convertTaskSummaryObjectInToEvents: function(taskSummaryObjectsResponse) {
        var response = taskSummaryObjectsResponse.response;

        if(response) {
            var taskSummaryObjects = response.requestObjects;
            if(taskSummaryObjects){
                response.events = [];
                for (let taskSummaryObject of taskSummaryObjects) {
                    var externalEvent = {};
                    externalEvent.id = taskSummaryObject.id;
                    externalEvent.name = taskSummaryObject.name;
                    externalEvent.type = "externalevent";
                    externalEvent.properties = taskSummaryObject.properties;

                    if(taskSummaryObject.data) {
                        var attributes = taskSummaryObject.data.attributes;

                        if(attributes) {
                            var eventAttributes = {};

                            eventAttributes["taskId"] = attributes["taskId"];
                            eventAttributes["taskName"] = attributes["taskName"];
                            eventAttributes["fileName"] = attributes["fileName"];
                            eventAttributes["fileType"] = attributes["fileType"];
                            eventAttributes["formatter"] = attributes["fileType"];
                            eventAttributes["eventSubType"] = attributes["status"];
                            eventAttributes["recordCount"] = attributes["totalRecords"];
                            eventAttributes["profileName"] = attributes["profileName"];
                            eventAttributes["createdOn"] = {"values": [
                                {
                                    "locale": "en-US",
                                    "source": "internal",
                                    "id": uuidV1(),
                                    "value": taskSummaryObject.properties ? taskSummaryObject.properties.createdDate : ""
                                }
                            ]};
                            eventAttributes["userId"] = attributes["submittedBy"];

                            var data = externalEvent["data"] = {};
                            data["attributes"] = eventAttributes;
                        }
                    }

                    response.events.push(externalEvent);
                }

                delete response.requestObjects;
            }
        }
    },
    //Task summarization processor temp changes...
    _getTaskDetailsFromSummarizationProcessor: async function(taskId) {
        var response = {};

        //Generate summary get request...
        var taskSummmaryGetRequest = this._generateTaskSummaryGetReq(taskId);

        var taskSummaryGetUrl = 'requesttrackingservice/get';
        var taskSummaryGetRes = await this.post(taskSummaryGetUrl, taskSummmaryGetRequest);

        if (taskSummaryGetRes && taskSummaryGetRes.response && taskSummaryGetRes.response.requestObjects && taskSummaryGetRes.response.requestObjects.length > 0) {
            var requestObject = taskSummaryGetRes.response.requestObjects[0];

            var taskType = this._getTaskType(requestObject);
            var taskName = this._getAttributeValue(requestObject, "taskName");
            var taskStatus = this._getAttributeValue(requestObject, "status");
            var fileName = this._getAttributeValue(requestObject, "fileName");
            var fileId = this._getAttributeValue(requestObject, "fileId");
            var fileType = this._getAttributeValue(requestObject, "fileType");
            var submittedBy = this._getAttributeValue(requestObject, "submittedBy");
            var totalRecords = this._getAttributeValue(requestObject, "totalRecords");
            var message = this._getAttributeValue(requestObject, "errorMessage");
            var startTime = requestObject.properties.createdDate;

            response.taskId = taskId;
            response.taskName = taskName ? taskName : "N/A";
            response.taskType = taskType;
            response.taskStatus = taskStatus ? taskStatus : "N/A";
            response.fileId = fileId ? fileId : "N/A";
            response.fileName = fileName ? fileName : response.fileId;
            response.fileType = fileType ? fileType : "N/A";
            response.submittedBy = submittedBy ? submittedBy.replace("_user", "") : "N/A";
            response.totalRecords = (totalRecords && totalRecords > -1) ? totalRecords : "N/A";
            response.message = message ? message : "N/A";
            response.startTime = startTime ? startTime : "N/A";
            response.endTime = "N/A";

            var taskStats = response["taskStats"] = {};
            taskStats.error = "0%";
            taskStats.processing = "100%";
            taskStats.success = "0%";
            taskStats.createRecords = "0%";
            taskStats.updateRecords = "0%";
            taskStats.deleteRecords = "0%";
            //By default setting noChange to 100%... At this stage we are not sure about the records which got changed.. 
            //this will be calculated later on
            taskStats.noChangeRecords = "100%"; 

            this._populateTaskStatsAndOtherProperties(requestObject, response);
            await this._populateSuccessRecords(taskId, response);
        }

        return response;
    },
    //Task summarization processor temp changes...
    _generateTaskSummaryGetReq: function (taskId) {
        var types = ["tasksummaryobject"];
        var req = this._getRequestJson(types);

        req.params.query.id = taskId;
        req.params.fields.attributes = ["_ALL"];
        req.params.query.valueContexts = [{
            "source": "internal",
            "locale": "en-US"
        }];

        req.params.options = {
            "maxRecords": 1
        }

        return req;
    },
    //Task summarization processor temp changes...
    _populateTaskStatsAndOtherProperties: function(requestObject, taskDetails) {
        var successCount = this._convertToPositiveInteger(this._getAttributeValue(requestObject, "totalRecordsSuccess"));
        var errorCount = this._convertToPositiveInteger(this._getAttributeValue(requestObject, "totalRDPErrors")) + this._convertToPositiveInteger(this._getAttributeValue(requestObject, "totalTransformError"));
        var createCount = this._convertToPositiveInteger(this._getAttributeValue(requestObject, "totalRecordsCreate"));
        var updateCount = this._convertToPositiveInteger(this._getAttributeValue(requestObject, "totalRecordsUpdate"));
        var deleteCount = this._convertToPositiveInteger(this._getAttributeValue(requestObject, "totalRecordsDelete"));

        //Calculate various stats
        var totalRecordCount = this._convertToPositiveInteger(taskDetails.totalRecords);
        var taskStatus = taskDetails.taskStatus.toLowerCase();

        if (taskStatus == "completed") {
            taskDetails.taskStatus = "Completed";
            taskDetails.taskStats.success = "100%";
            taskDetails.taskStats.error = "0%";
            taskDetails.taskStats.processing = "0%";
        } else if (taskStatus == "errored" || taskStatus == "failed") {
            taskDetails.taskStatus = "Errored";
            taskDetails.taskStats.error = "100%";
            taskDetails.taskStats.success = "0%";
            taskDetails.taskStats.processing = "0%";

            //Task is errored.. check whether any error message is available 
            //If yes, it could happen only during pre-process phase of task..Set appropriate flag
            if(taskDetails.message != "N/A") {
                taskDetails.preProcessFailure = true;
            }
        } else {
            // if (totalRecordCount > 0 && (totalRecordCount == successCount + errorCount)) {
            //     taskDetails.taskStatus = "Completed With Errors";
            // } 
            // else {
            //     taskDetails.taskStatus = "Processing"
            // }

            if(totalRecordCount > 0) {
                var inProgressCount = totalRecordCount - (successCount + errorCount);

                var successPercentage = (successCount * 100) / totalRecordCount;
                var errorPercentage = ((errorCount) * 100) / totalRecordCount;
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

                taskDetails.taskStats.success = this._convertToPositiveInteger(successPercentage) + "%";
                taskDetails.taskStats.error = this._convertToPositiveInteger(errorPercentage) + "%";
                taskDetails.taskStats.processing = this._convertToPositiveInteger(inProgressPercentage) + "%";
            }
        }

        if(totalRecordCount > 0) {
            var createPercentage = (createCount * 100) / totalRecordCount;
            var updatePercentage = (updateCount * 100) / totalRecordCount;
            var deletePercentage = (deleteCount * 100) / totalRecordCount;
            var noChangePercentage = ((totalRecordCount - successCount) * 100) / totalRecordCount;

            if(createPercentage > 100) {
                createPercentage = 100;
            }

            if(updatePercentage > 100) {
                updatePercentage = 100;
            }

            if(deletePercentage > 100) {
                deletePercentage = 100;
            }

            if(noChangePercentage > 100) {
                noChangePercentage = 100;
            }

            taskDetails.taskStats.createRecords = this._convertToPositiveInteger(createPercentage) + "%";
            taskDetails.taskStats.updateRecords = this._convertToPositiveInteger(updatePercentage) + "%";
            taskDetails.taskStats.deleteRecords = this._convertToPositiveInteger(deletePercentage) + "%";
            taskDetails.taskStats.noChangeRecords = this._convertToPositiveInteger(noChangePercentage) + "%";
        }

        if(taskStatus != "processing" && taskStatus != "queued") {
            taskDetails.endTime = requestObject.properties.modifiedDate;
        }
    },
    //Task summarization processor temp changes...
    _populateSuccessRecords: async function(taskId, taskDetails){
        var successObjIds = [];
        var successObjTypes = [];

        //Generate request tracking get request...
        var isBulkWorkflowTask = false;
        if(taskDetails.taskType.toLowerCase().indexOf("workflow") >= 0) {
            isBulkWorkflowTask = true;
        }

        //Generate details get request...
        var taskDetailsGetRequest = this._generateTaskDetailsGetReq(taskId, isBulkWorkflowTask, taskDetails.totalRecords);
        
        //console.log('Task details get request to RDF', JSON.stringify(taskDetailsGetRequest));
        var taskDetailsGetUrl = 'requesttrackingservice/get';
        var taskDetailsGetRes = await this.post(taskDetailsGetUrl, taskDetailsGetRequest);

        if (taskDetailsGetRes && taskDetailsGetRes.response)
            var requestObjects = taskDetailsGetRes.response.requestObjects;
            if(requestObjects && requestObjects.length > 0) {
                for (var i = 0; i < requestObjects.length; i++) {
                    var reqObj = requestObjects[i];

                    var objId = this._getAttributeValue(reqObj, "entityId");
                    var objType = this._getAttributeValue(reqObj, "entityType");
                    var action = this._getAttributeValue(reqObj, "entityAction");

                    if(action == "delete") {
                        objType = "delete" + objType;
                    }

                    if(objId) {
                        successObjIds.push(objId);

                        if (objType && successObjTypes.indexOf(objType) < 0) {
                            successObjTypes.push(objType);
                        }
                    }
                }
        }

        taskDetails.successEntities = {
            "ids": successObjIds,
            "types": successObjTypes
        }
    },
    //Task summarization processor temp changes...
    _generateTaskDetailsGetReq: function (taskId, isBulkWorkflowTask, totalRecords) {
        var types = ["requestobject"];
        var req = this._getRequestJson(types);

        var attributeNames = ["entityId", "entityType", "entityAction"];
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
        if (isBulkWorkflowTask) {
            serviceName = "entityGovernService";
        }

        var serviceNameCriterion = {
            "serviceName": {
                "eq": serviceName
            }
        };
        attributesCriteria.push(serviceNameCriterion);

        var requestStatusCriterion = {
            "requestStatus": {
                "eq": "success"
            }
        };
        attributesCriteria.push(requestStatusCriterion);

        var impactedEventCriterion = {
            "impacted": {
                "exact": "false"
            }
        };
        attributesCriteria.push(impactedEventCriterion);

        req.params.query.filters.attributesCriterion = attributesCriteria;

        req.params.sort = {
            "properties": [{
                "createdDate": "_ASC",
                "sortType": "_DATETIME"
            }]
        };

        req.params.options = {
            "maxRecords": totalRecords
        }

        return req;
    },
    _convertToPositiveInteger: function(strInteger) {
        var integer = parseInt(strInteger);

        if(!integer || integer < 0) {
            integer = 0;
        }

        return integer;
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
                else if (objStatus == "error") {
                    errorCount++;
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
        var noChangePercentage = ((totalRecordCount - successCount) * 100) / totalRecordCount;

        if(createPercentage > 100) {
            createPercentage = 100;
        }

        if(updatePercentage > 100) {
            updatePercentage = 100;
        }

        if(deletePercentage > 100) {
            deletePercentage = 100;
        }

        if(noChangePercentage > 100) {
            noChangePercentage = 100;
        }

        taskDetails.taskStats.createRecords = parseInt(createPercentage) + "%";
        taskDetails.taskStats.updateRecords = parseInt(updatePercentage) + "%";
        taskDetails.taskStats.deleteRecords = parseInt(deletePercentage) + "%";
        taskDetails.taskStats.noChangeRecords = parseInt(noChangePercentage) + "%";

        if(taskDetails.taskStatus != "Processing") {
            //Task has been completed... End time is the time of last request object creation...
            var lastCreatedReqObj = requestObjects[requestObjects.length - 1];
            if (lastCreatedReqObj && lastCreatedReqObj.properties) {
                var endTime = lastCreatedReqObj.properties.createdDate;

                if (endTime) {
                    taskDetails.endTime = endTime;
                }
            }
        }

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
    _getEventCreatedDate: function (event) {
        var createdDate = 'N/A';
        if (event && event.properties) {
            var endTime = event.properties.createdDate;
            if (endTime) {
                createdDate = endTime;
            }
        }

        return createdDate;
    },
    _getTaskType: function (obj) {
        var taskType;

        var taskType = this._getAttributeValue(obj, "profileType");
        if (!taskType) {
            taskType = this._getAttributeValue(obj, "taskType");
        }

        if (taskType) {
            switch (taskType.toLowerCase()) {
                case "entity_import":
                    taskType = "Entity Data Imports";

                    var integrationType = this._getAttributeValue(obj, "integrationType");
                    if (integrationType && integrationType.toLowerCase() == "system") {
                        taskType = "System Integrations - Entity Data Imports";
                    }
                    break;
                case "system_integrations_entity_import":
                    taskType = "System Integrations - Entity Data Imports";
                    break;
                case "entity_export":
                    taskType = "Entity Data Exports";

                    var integrationType = this._getAttributeValue(obj, "integrationType");
                    if (integrationType && integrationType.toLowerCase() == "system") {
                        taskType = "System Integrations - Entity Data Exports";
                    }
                    break;
                case "system_integrations_entity_export":
                    taskType = "System Integrations - Entity Data Exports";
                    break;
                case "transitionworkflow":
                case "transitionworkflow-query":
                case "transitionworkflow-multi-query":
                    taskType = "Bulk Workflow Transitions";
                    break;
                case "changeassignment":
                case "changeassignment-query":
                case "changeassignment-multi-query":
                    taskType = "Bulk Workflow Assignments";
                    break;
                case "process":
                case "process-query":
                case "process-multi-query":
                    taskType = "Bulk Edit";
                    break;
                case "delete":
                case "delete-query":
                case "delete-multi-query":
                    taskType = "Bulk Entity Delete";
                    break;
                case "ui_basedatamodel":
                    taskType = "Base Data Model Imports"
                    break;
                case "ui_governancemodel":
                    taskType = "Governance Model Imports"
                    break;
                case "ui_authorizationmodel":
                    taskType = "Authorization Model Imports"
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
    }
};

module.exports = Eventservice;