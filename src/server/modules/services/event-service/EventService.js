let DFRestService = require('../../common/df-rest-service/DFRestService'),
    isEmpty = require('../../common/utils/isEmpty'),
    uuidV1 = require('uuid/v1'),
    arrayContains = require('../../common/utils/array-contains'),
    moment = require('moment');
let tenantSystemConfigService = require('../configuration-service/TenantSystemConfigService');
let config = require('config');
let taskSummarizationProcessorEnabled = config.get('modules.webEngine.taskSummarizationProcessorEnabled');

let _ = require('underscore');

let Eventservice = function (options) {
    DFRestService.call(this, options);
};

const falcorUtil = require('../../../../shared/dataobject-falcor-util');
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
    
let tenantSetting = null;
let tenantConfigKey = null;
Eventservice.prototype = {
    get: async function (request) {
        let response = {};
        let getBasedOnTaskSummarizationProcessor = false;
        
        tenantSetting = await tenantSystemConfigService.prototype.getCachedTenantMetaData();
        tenantConfigKey = tenantSetting["tenant-settings-key"];
        //Task summarization processor temp changes...
        if(taskSummarizationProcessorEnabled) {
            if(request.params.fields) {
                let attributeList = request.params.fields.attributes;

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
                let eventServiceGetUrl = 'eventservice/get';
                response = await this.post(eventServiceGetUrl, request);
            }
        }

        return response;
    },
    getTaskList: async function (request) {
        //console.log('prepare download request: ', request);
        let finalResponse = {};

        try {
            let eventServiceGetUrl = 'eventservice/get';
            let validationResult = this._validateRequest(request);

            if (!validationResult) {
                throw new Error("Incorrect request for event service get");
            }

            //console.log('event get request', JSON.stringify(request));

            let attributesCriteria = request.params.query.filters.attributesCriterion;
            let reqExternalEventSubType = undefined;

            for (let i in attributesCriteria) {
                if (attributesCriteria[i].eventSubType) {
                    let criteriaEventSubType = attributesCriteria[i].eventSubType.eq;
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

            let res = await this.post(eventServiceGetUrl, request);

            let eventGroup = [];

            if (res && res.response && res.response.events && res.response.events.length > 0) {
                let events = res.response.events;
                let filteredEvents = [];
                //console.log('events ', JSON.stringify(events));

                let me = this;
                let groups = _.groupBy(events, function (event) {
                    let groupKey = me._getAttributeValue(event, "taskId");

                    if (!groupKey) {
                        groupKey = me._getAttributeValue(event, "fileName");
                    }

                    if (!groupKey) {
                        groupKey = "Unknown";
                    }

                    return groupKey;
                });

                //console.log('groups ', JSON.stringify(groups));

                for (let groupKey in groups) {
                    let group = groups[groupKey];
                    let currentEventRecordIdx = 0;
                    let highOrderEvent = undefined;
                    let highOrderRecordCount = 0;

                    for (let i = 0; i < group.length; i++) { // start with 2nd record as first one is alread picked up
                        let event = group[i];
                        if (event && event.data && event.data.attributes && event.data.attributes.eventSubType && event.data.attributes.eventSubType.values) {
                            let eventSubType = this._getAttributeValue(event, "eventSubType");
                            let currentEventSubTypeIndex = eventSubTypesOrder.indexOf(eventSubType);
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

        return finalResponse;
    },
    getTaskDetails: async function (request) {
        let response = {};

        try {
            let validationResult = this._validateRequest(request);

            if (!validationResult) {
                throw new Error("Incorrect request for event service get");
            }

            let taskId = request.body.taskId;
            //console.log('Get details for ', taskId);

            //Task summarization processor temp changes...
            if(taskSummarizationProcessorEnabled) {
                response = await this._getTaskDetailsFromSummarizationProcessor(taskId);

                if(response && !isEmpty(response)) {
                    return response;
                }
            }

            //Get Batch Events to get basic information of reuested tasks...
            let attributeNames = ["fileId", "fileName", "fileType", "eventType", "eventSubType", "recordCount", "createdOn", "userId", "profileType", "taskName", "taskType", "message", "integrationType"];
            let eventTypeFilterString = "BATCH_COLLECT_ENTITY_IMPORT BATCH_TRANSFORM_ENTITY_IMPORT EXTRACT BATCH_COLLECT_ENTITY_EXPORT BATCH_TRANSFORM_ENTITY_EXPORT BATCH_PUBLISH_ENTITY_EXPORT";
            let eventSubTypeFilterString = "";
            let eventsGetRequest = this._generateEventsGetReq(taskId, attributeNames, eventTypeFilterString, eventSubTypeFilterString, false);

            //console.log('Batch events get request to RDF', JSON.stringify(eventsGetRequest));
            let eventServiceGetUrl = 'eventservice/get';
            let batchEventsGetRes = await this.post(eventServiceGetUrl, eventsGetRequest);

            //console.log('Batch events get response from RDF', JSON.stringify(batchEventsGetRes, null, 2));

            if (batchEventsGetRes && batchEventsGetRes.response && batchEventsGetRes.response.events && batchEventsGetRes.response.events.length > 0) {
                let events = batchEventsGetRes.response.events;
                let highOrderEvent = undefined;
                let processingStartedEvent = undefined;
                let highOrderEventTypeIndex = 0;

                let me = this;
                let eventGroups = _.groupBy(events, function (event) {
                    let groupKey = me._getAttributeValue(event, "eventType");

                    if (!groupKey) {
                        groupKey = "Unknown";
                    }

                    return groupKey;
                });

                for (let groupKey in eventGroups) {
                    let eventType = groupKey;
                    let currentEventTypeIndex =  eventTypesOrder.indexOf(eventType);

                    if(currentEventTypeIndex > highOrderEventTypeIndex) {
                        let eventGroup = eventGroups[groupKey];
                        let highOrderEventSubTypeIndex = 0;

                        for (let i = 0; i < eventGroup.length; i++) {
                            let event = eventGroup[i];
                            if (event && event.data && event.data.attributes) {
                                let eventSubType = this._getAttributeValue(event, "eventSubType");
                                let currentEventSubTypeIndex = eventSubTypesOrder.indexOf(eventSubType);
                                if (currentEventSubTypeIndex > highOrderEventSubTypeIndex) {
                                    highOrderEvent = event;

                                    highOrderEventSubTypeIndex = currentEventSubTypeIndex;
                                }
                            }
                        }

                        highOrderEventTypeIndex = currentEventTypeIndex;
                    }
                }

                for (let i = 0; i < events.length; i++) {
                    let event = events[i];
                    if (event && event.data && event.data.attributes) {
                        let eventSubType = this._getAttributeValue(event, "eventSubType");
                        
                        if(highOrderEvent) {
                            if (!this._getAttributeValue(highOrderEvent, "recordCount")) {
                                let currentEventRecordCount = this._getAttributeValue(event, "recordCount");
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
                    let eventType = this._getAttributeValue(highOrderEvent, "eventType");
                    let eventSubType = this._getAttributeValue(highOrderEvent, "eventSubType");
                    let taskType = this._getTaskType(highOrderEvent);

                    let taskName = this._getAttributeValue(highOrderEvent, "taskName");
                    let fileName = this._getAttributeValue(highOrderEvent, "fileName");
                    let fileId = this._getAttributeValue(highOrderEvent, "fileId");
                    let fileType = this._getAttributeValue(highOrderEvent, "fileType");
                    let submittedBy = this._getAttributeValue(highOrderEvent, "userId");
                    let totalRecords = this._getAttributeValue(highOrderEvent, "recordCount");
                    let message = this._getAttributeValue(highOrderEvent, "message");

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
                        let startTime = this._getAttributeValue(processingStartedEvent, "createdOn");

                        if (startTime) {
                            response.startTime = startTime
                        }
                    }

                    let taskStats = response["taskStats"] = {};
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
                            let preProcessErroredRecordsCount = 0;
                            let lastErroredRecordEvent;
                            let attributeNames = ["createdOn"]; //This attribute is needed to get endTime
                            let eventTypeFilterString = "RECORD_TRANSFORM_ENTITY_IMPORT RECORD_PUBLISH_ENTITY_IMPORT RECORD_PUBLISH_ENTITY_EXPORT LOAD";
                            let eventSubTypeFilterString = "PROCESSING_ERROR PROCESSING_COMPLETE_ERROR";
                            let eventsGetRequest = this._generateEventsGetReq(taskId, attributeNames, eventTypeFilterString, eventSubTypeFilterString, true);

                            //console.log('Record events get request to RDF', JSON.stringify(eventsGetRequest));
                            let recordEventsGetRes = await this.post(eventServiceGetUrl, eventsGetRequest);
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
                                let isBulkWorkflowTask = false;
                                if(taskType.toLowerCase().indexOf("workflow") >= 0) {
                                    isBulkWorkflowTask = true;
                                }

                                let requestTrackingGetRequest = this._generateRequestTrackingGetReqForTaskDetails(taskId, isBulkWorkflowTask, totalRecords);

                                //console.log('Request tracking get request to RDF', JSON.stringify(requestTrackingGetRequest));
                                let requestTrackingGetUrl = 'requesttrackingservice/get';
                                let reqTrackingRes = await this.post(requestTrackingGetUrl, requestTrackingGetRequest);
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

        return response;
    },
    //Task summarization processor temp changes...
    getImportTaskList: async function (request) {
        let response = {};
        try {
            let importTaskListGetRequest = this._generateImportTaskListGetRequest(request);
            
            let importTaskListGetUrl = 'requesttrackingservice/get';
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

        return response;
    },
    _generateEventsGetReq: function (taskId, attributeNames, eventTypesFilterString, eventSubTypesFilterString, isRecordCountGet) {
        let types = ["externalevent"];
        let req = this._getRequestJson(types);

        //Below value context for event request and all events are always stored with en-US locale..do not apply tenant-config based default locale here
        if (attributeNames && attributeNames.length > 0) {
            req.params.fields.attributes = attributeNames;
            req.params.query.valueContexts = [{
                "source": tenantSetting[tenantConfigKey].defaultValueSource,
                "locale": tenantSetting[tenantConfigKey].defaultValueLocale
            }];
        }

        let attributesCriteria = [];
        let taskIdCriterion = {
            "taskId": {
                "exact": taskId
            }
        };
        attributesCriteria.push(taskIdCriterion);

        if (eventTypesFilterString && eventTypesFilterString.length > 0) {
            let eventTypeCriterion = {
                "eventType": {
                    "contains": eventTypesFilterString
                }
            };
            attributesCriteria.push(eventTypeCriterion);
        }
        if (eventSubTypesFilterString && eventSubTypesFilterString.length > 0) {
            let eventSubTypeCriterion = {
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
        let types = ["requestobject"];
        let req = this._getRequestJson(types);

        let attributeNames = ["entityId", "entityType", "entityAction", "requestStatus"];
        req.params.fields.attributes = attributeNames;

        let attributesCriteria = [];

        //Add task id criterion...
        let taskIdCriterion = {
            "taskId": {
                "exact": taskId
            }
        };
        attributesCriteria.push(taskIdCriterion);

        //Add service name criterion...
        let serviceName = "entityManageService";
        if(isBulkWorkflowTask) {
            serviceName = "entityGovernService";
        }

        let serviceNameCriterion = {
            "serviceName": {
                "eq": serviceName
            }
        };
        attributesCriteria.push(serviceNameCriterion);

        if(!isBulkWorkflowTask) {
            let entityActionCriterion = {
                "entityAction": {
                    "contains": "create update delete"
                }
            };
            attributesCriteria.push(entityActionCriterion);

            let impactedEventCriterion = {
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
        let types = ["tasksummaryobject"];
        let req = this._getRequestJson(types);

        if(!inputRequest.params.isTaskListGetRequest) {
            let attributeNames = ["_ALL"];
            req.params.fields.attributes = attributeNames;
        }

        if(inputRequest.params.query.ids) {
            req.params.query.ids = inputRequest.params.query.ids;
        } else if (inputRequest.params.query.id) {
            req.params.query.id = inputRequest.params.query.id;
        }

        let requestedAttributeCriteria = inputRequest.params.query.filters.attributesCriterion;
        if(requestedAttributeCriteria) {
            let status = undefined;
            let taskType = { "contains": "entity_import" };
            let taskTypeOperator = undefined;
            let userId = undefined;
            let integrationType = undefined;
            let parentTaskHasValue = undefined;

            for (let i in requestedAttributeCriteria) {
                if(requestedAttributeCriteria[i].eventSubType) {
                    status = requestedAttributeCriteria[i].eventSubType.eq;
                } else if(requestedAttributeCriteria[i].taskType) {
                    taskType = requestedAttributeCriteria[i].taskType;
                    taskTypeOperator = requestedAttributeCriteria[i].taskType.operator;
                } else if(requestedAttributeCriteria[i].userId) {
                    userId = requestedAttributeCriteria[i].userId.eq;
                } else if(requestedAttributeCriteria[i].integrationType) {
                    integrationType = requestedAttributeCriteria[i].integrationType.eq;
                } else if(requestedAttributeCriteria[i].parentTaskId) {
                    parentTaskHasValue = requestedAttributeCriteria[i].parentTaskId.hasvalue;
                }
            }

            let attributesCriteria = [];

            //Add task type criterion...
            let taskTypeCriterion = {
                "taskType": taskType
            };

            if(taskTypeOperator) {
                taskTypeCriterion.taskType.operator = taskTypeOperator;
            }

            attributesCriteria.push(taskTypeCriterion);

            if (status) {
                //Add task status criterion...
                let taskStatusCriterion = {
                    "status": {
                        "contains": status.toLowerCase()
                    }
                };
                attributesCriteria.push(taskStatusCriterion);
            }

            //If _user is not added to user This code will check that and append the user
            if (userId) {
                if (userId.indexOf("_user") == -1) {
                    userId = userId + "_user";
                }
                //Add user id criterion...
                let userIdCriterion = {
                    "submittedBy": {
                        "eq": userId
                    }
                };
                attributesCriteria.push(userIdCriterion);
            }

            if(integrationType) {
                //Add integration type criterion...
                let integrationTypeCriterion = {
                    "integrationType": {
                        "eq": integrationType
                    }
                };
                attributesCriteria.push(integrationTypeCriterion);
            }

            if(typeof parentTaskHasValue === "boolean") {
                //Add parentId criterion...
                let parentIdCriterion = {
                    "parentTaskId": {
                        "hasvalue": parentTaskHasValue
                    }
                };
                attributesCriteria.push(parentIdCriterion);
            }

            req.params.query.filters.attributesCriterion = attributesCriteria;
        }

        let requestedKeywordCriteria = inputRequest.params.query.filters.keywordsCriterion;
        if(requestedKeywordCriteria) {
            req.params.query.filters.keywordsCriterion = requestedKeywordCriteria;
        }

        //checking for propertiesCriterion
        let propertiesCriterion = inputRequest.params.query.filters.propertiesCriterion;
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

        let dataIndexInfo = pathKeys.dataIndexInfo["requestTracking"];
        req.params.options = {
            "maxRecords": dataIndexInfo.maxRecordsToReturn
        }
        return req;
    },
    //Task summarization processor temp changes...
    _convertTaskSummaryObjectInToEvents: function(taskSummaryObjectsResponse) {
        let response = taskSummaryObjectsResponse.response;

        if(response) {
            let taskSummaryObjects = response.requestObjects;
            if(taskSummaryObjects){
                response.events = [];
                for (let taskSummaryObject of taskSummaryObjects) {
                    let externalEvent = {};
                    externalEvent.id = taskSummaryObject.id;
                    externalEvent.name = taskSummaryObject.name;
                    externalEvent.type = "externalevent";
                    externalEvent.properties = taskSummaryObject.properties;

                    if(taskSummaryObject.data) {
                        let attributes = taskSummaryObject.data.attributes;

                        if(attributes) {
                            let eventAttributes = {};

                            eventAttributes["taskId"] = attributes["taskId"];
                            eventAttributes["taskName"] = attributes["taskName"];
                            eventAttributes["fileName"] = attributes["fileName"];
                            eventAttributes["fileType"] = attributes["fileType"];
                            eventAttributes["formatter"] = attributes["fileType"];
                            eventAttributes["eventSubType"] = attributes["status"];
                            eventAttributes["recordCount"] = attributes["totalRecords"];
                            eventAttributes["profileName"] = attributes["profileName"];
                            eventAttributes["hasChildTasks"] = attributes["hasChildTasks"];
                            eventAttributes["isExtractComplete"] = attributes["isExtractComplete"];
                            eventAttributes["createdOn"] = {"values": [
                                {
                                    "source": tenantSetting[tenantConfigKey].defaultValueSource,
                                    "locale": tenantSetting[tenantConfigKey].defaultValueLocale,
                                    "id": uuidV1(),
                                    "value": taskSummaryObject.properties ? taskSummaryObject.properties.createdDate : ""
                                }
                            ]};
                            eventAttributes["userId"] = attributes["submittedBy"];

                            //Updating the taskName for createVariants
                            if(attributes["taskType"] && attributes["taskType"].values[0].value.search(/createvariants/i) > -1){
                                eventAttributes["taskName"] = {"values": [
                                    {
                                        "source": tenantSetting[tenantConfigKey].defaultValueSource,
                                        "locale": tenantSetting[tenantConfigKey].defaultValueLocale,
                                        "id": uuidV1(),
                                        "value": "Create Variants"
                                    }
                                ]};
                            }
                            let data = externalEvent["data"] = {};
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
        let response = {};

        //Generate summary get request...
        let taskSummmaryGetRequest = this._generateTaskSummaryGetReq(taskId);

        let taskSummaryGetUrl = 'requesttrackingservice/get';
        let taskSummaryGetRes = await this.post(taskSummaryGetUrl, taskSummmaryGetRequest);

        if (taskSummaryGetRes && taskSummaryGetRes.response && taskSummaryGetRes.response.requestObjects && taskSummaryGetRes.response.requestObjects.length > 0) {
            let requestObject = taskSummaryGetRes.response.requestObjects[0];

            let taskType = this._getTaskType(requestObject);
            let taskName = this._getTaskName(requestObject);
            let taskStatus = this._getAttributeValue(requestObject, "status");
            let profileName = this._getAttributeValue(requestObject, "profileName");
            let fileName = this._getAttributeValues(requestObject, "fileName");
            let fileId = this._getAttributeValues(requestObject, "fileId");
            let fileType = this._getAttributeValue(requestObject, "fileType");
            let fileExtension = this._getAttributeValue(requestObject, "fileExtension");
            let submittedBy = this._getAttributeValue(requestObject, "submittedBy");
            let totalRecords = this._getAttributeValue(requestObject, "totalRecords");
            let message = this._getAttributeValue(requestObject, "errorMessage");
            let hasChildTasks = this._getAttributeValue(requestObject, "hasChildTasks");
            let isExtractComplete = this._getAttributeValue(requestObject, "isExtractComplete");
            let startTime = requestObject.properties.createdDate;

            response.taskId = taskId;
            response.taskName = taskName ? taskName : "N/A";
            response.taskType = taskType;
            response.taskStatus = taskStatus ? taskStatus : "N/A";
            response.fileId = fileId ? fileId : "N/A";
            response.profileName = profileName ? profileName : "N/A";
            if(taskName && taskName.search(/create variants/i) > -1){
                response.fileName = "N/A";
            } else {
                response.fileName = fileName ? fileName : response.fileId;
            }
            response.fileType = fileType ? fileType : "N/A";
            response.fileExtension = fileExtension ? fileExtension : "N/A";
            response.submittedBy = submittedBy ? submittedBy.replace("_user", "") : "N/A";
            response.totalRecords = (totalRecords && totalRecords > -1) ? totalRecords : "N/A";
            response.message = message ? message : "N/A";
            response.startTime = startTime ? startTime : "N/A";
            response.endTime = "N/A";
            response.hasChildTasks = typeof hasChildTasks === "boolean" ? hasChildTasks : "N/A";
            response.isExtractComplete = typeof isExtractComplete === "boolean" ? isExtractComplete : "N/A";

            let taskStats = response["taskStats"] = {};
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
        let types = ["tasksummaryobject"];
        let req = this._getRequestJson(types);

        req.params.query.id = taskId;
        req.params.fields.attributes = ["_ALL"];
        req.params.query.valueContexts = [{
            "source": tenantSetting[tenantConfigKey].defaultValueSource,
            "locale": tenantSetting[tenantConfigKey].defaultValueLocale
        }];

        req.params.options = {
            "maxRecords": 1
        }

        return req;
    },
    //Task summarization processor temp changes...
    _populateTaskStatsAndOtherProperties: function(requestObject, taskDetails) {
        let successCount = this._convertToPositiveInteger(this._getAttributeValue(requestObject, "totalRecordsSuccess"));
        let errorCount = this._convertToPositiveInteger(this._getAttributeValue(requestObject, "totalRDPErrors")) + this._convertToPositiveInteger(this._getAttributeValue(requestObject, "totalTransformError")) + this._convertToPositiveInteger(this._getAttributeValue(requestObject, "totalLoadError"));
        let createCount = this._convertToPositiveInteger(this._getAttributeValue(requestObject, "totalRecordsCreate"));
        let updateCount = this._convertToPositiveInteger(this._getAttributeValue(requestObject, "totalRecordsUpdate"));
        let deleteCount = this._convertToPositiveInteger(this._getAttributeValue(requestObject, "totalRecordsDelete"));

        //Calculate various stats
        let totalRecordCount = this._convertToPositiveInteger(taskDetails.totalRecords);
        let taskStatus = taskDetails.taskStatus.toLowerCase();

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
                let inProgressCount = totalRecordCount - (successCount + errorCount);

                let successPercentage = (successCount * 100) / totalRecordCount;
                let errorPercentage = ((errorCount) * 100) / totalRecordCount;
                let inProgressPercentage = (inProgressCount * 100) / totalRecordCount;

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
            let createPercentage = (createCount * 100) / totalRecordCount;
            let updatePercentage = (updateCount * 100) / totalRecordCount;
            let deletePercentage = (deleteCount * 100) / totalRecordCount;
            let noChangePercentage = ((totalRecordCount - successCount) * 100) / totalRecordCount;

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
        let successObjIds = [];
        let successObjTypes = [];

        //Generate request tracking get request...
        let isBulkWorkflowTask = false;
        if(taskDetails.taskType.toLowerCase().indexOf("workflow") >= 0) {
            isBulkWorkflowTask = true;
        }
        
        //Generate details get request...
        let totalRecords = (taskDetails.totalRecords == "N/A") ? 200 : taskDetails.totalRecords;
        let isParentTask = taskDetails.hasChildTasks && taskDetails.hasChildTasks != "N/A";
        let taskDetailsGetRequest = this._generateTaskDetailsGetReq(taskId, isBulkWorkflowTask, totalRecords, isParentTask);

        //console.log('Task details get request to RDF', JSON.stringify(taskDetailsGetRequest));
        let taskDetailsGetUrl = 'requesttrackingservice/get';
        let taskDetailsGetRes = await this.post(taskDetailsGetUrl, taskDetailsGetRequest);

        if (taskDetailsGetRes && taskDetailsGetRes.response) {
            let requestObjects = taskDetailsGetRes.response.requestObjects;
            if(requestObjects && requestObjects.length > 0) {
                for (let i = 0; i < requestObjects.length; i++) {
                    let reqObj = requestObjects[i];

                    let objId = this._getAttributeValue(reqObj, "entityId");
                    let objType = this._getAttributeValue(reqObj, "entityType");
                    let action = this._getAttributeValue(reqObj, "entityAction");

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
        }

        taskDetails.successEntities = {
            "ids": successObjIds,
            "types": successObjTypes
        }
    },

    //Task summarization processor temp changes...
    _generateTaskDetailsGetReq: function (taskId, isBulkWorkflowTask, totalRecords, isParentTask) {
        let types = ["requestobject"];
        let req = this._getRequestJson(types);

        let attributeNames = ["entityId", "entityType", "entityAction"];
        req.params.fields.attributes = attributeNames;

        let attributesCriteria = [];

        //Add task id criterion...
        let taskIdCriterion = {};
        taskIdCriterion[isParentTask ? "parentTaskId" : "taskId"] = {
            "exact": taskId
        };
        attributesCriteria.push(taskIdCriterion);

        //Add service name criterion...
        let serviceName = "entityManageService";
        if (isBulkWorkflowTask) {
            serviceName = "entityGovernService";
        }

        let serviceNameCriterion = {
            "serviceName": {
                "eq": serviceName
            }
        };
        attributesCriteria.push(serviceNameCriterion);

        let requestStatusCriterion = {
            "requestStatus": {
                "eq": "success"
            }
        };
        attributesCriteria.push(requestStatusCriterion);

        let impactedEventCriterion = {
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
    _convertToPositiveInteger: function(value) {
        let integer = Math.round(value);

        if(!integer || integer < 0) {
            integer = 0;
        }

        return integer;
    },
    _getRequestJson: function (types) {
        let req = {
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
        let requestObjects = reqTrackingResponse.response.requestObjects;

        let successCount = 0;
        let errorCount = 0;
        let createCount = 0;
        let updateCount = 0;
        let deleteCount = 0;
        let successObjIds = [];
        let successObjTypes = [];

        if(isBulkWorkflowTask) {
            let me = this;
            let groups = _.groupBy(requestObjects, function (reqObj) {
                let groupKey = me._getAttributeValue(reqObj, "entityId");

                if (!groupKey) {
                    groupKey = "Unknown";
                }

                return groupKey;
            });

            //console.log('Req Objects groups ', JSON.stringify(groups));

            for (let groupKey in groups) {
                let group = groups[groupKey];

                let objId = undefined;
                let objType = undefined;
                let errored = false;
                let processing = false;

                for (let i = 0; i < group.length; i++) {
                    let reqObj = group[i];

                    if(!objId) {
                        objId = this._getAttributeValue(reqObj, "entityId");
                        objType = this._getAttributeValue(reqObj, "entityType");
                    }

                    let objStatus = this._getAttributeValue(reqObj, "requestStatus");
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
            for (let i = 0; i < requestObjects.length; i++) {
                let reqObj = requestObjects[i];

                let objId = this._getAttributeValue(reqObj, "entityId");
                let objType = this._getAttributeValue(reqObj, "entityType");
                let objStatus = this._getAttributeValue(reqObj, "requestStatus");
                let objAction = this._getAttributeValue(reqObj, "entityAction");

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
        let totalRecordCount = parseInt(taskDetails.totalRecords);

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

            let inProgressCount = totalRecordCount - (successCount + errorCount + preProcessErroredRecordsCount);

            let successPercentage = (successCount * 100) / totalRecordCount;
            let errorPercentage = ((errorCount + preProcessErroredRecordsCount) * 100) / totalRecordCount;
            let inProgressPercentage = (inProgressCount * 100) / totalRecordCount;

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

        let createPercentage = (createCount * 100) / totalRecordCount;
        let updatePercentage = (updateCount * 100) / totalRecordCount;
        let deletePercentage = (deleteCount * 100) / totalRecordCount;
        let noChangePercentage = ((totalRecordCount - successCount) * 100) / totalRecordCount;

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
            let lastCreatedReqObj = requestObjects[requestObjects.length - 1];
            if (lastCreatedReqObj && lastCreatedReqObj.properties) {
                let endTime = lastCreatedReqObj.properties.createdDate;

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
        let eventSubFilterMap = eventSubTypeMap;

        for (let key in eventSubFilterMap) {
            let eventSubTypeFilters = eventSubFilterMap[key];

            //console.log('key ', key, 'event internal types ', JSON.stringify(eventSubTypeFilters), ' internal event sub types ', internalEventSubType);

            if (eventSubTypeFilters.indexOf(internalEventSubType) > -1) {
                return key;
            }
        }

        return "Unknown";
    },
    _compareEventSubType: function (currentInternalEventSubType, reqExternalEventSubType) {
        let externalEventSubType = this._getExternalEventSubType(currentInternalEventSubType);
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
                    "source": tenantSetting[tenantConfigKey].defaultValueSource,
                    "locale": tenantSetting[tenantConfigKey].defaultValueLocale
                }];
            }
        }
    },
    _getAttributeValue: function (event, attrName) {
        let val = undefined;
        if (event && event.data && event.data.attributes && event.data.attributes[attrName] && event.data.attributes[attrName].values && event.data.attributes[attrName].values.length > 0) {
            val = event.data.attributes[attrName].values[0].value;
        }

        return val;
    },

    _getAttributeValues: function (event, attrName) {
        let val = undefined;
        if (event && event.data && event.data.attributes && event.data.attributes[attrName] && event.data.attributes[attrName].values && event.data.attributes[attrName].values.length > 0) {
            if(event.data.attributes[attrName].values.length <= 1) {
                val = event.data.attributes[attrName].values[0].value;
            } else {
                let tempValues = event.data.attributes[attrName].values;
                val = [];
                val =_.pluck(tempValues, 'value'); 
            }
        }

        return val;
    },
    
    _getEventCreatedDate: function (event) {
        let createdDate = 'N/A';
        if (event && event.properties) {
            let endTime = event.properties.createdDate;
            if (endTime) {
                createdDate = endTime;
            }
        }

        return createdDate;
    },
    _getTaskName: function (requestObject) {
        let taskType = this._getInternalTaskType(requestObject);
        let taskName = "";
        if(taskType && taskType.toLowerCase() == "createvariants"){
            taskName = "Create Variants";
        } else {
            taskName = this._getAttributeValue(requestObject, "taskName");
        }    
        return taskName;
    },
    _getInternalTaskType: function (obj){
        let taskType = this._getAttributeValue(obj, "profileType");
        if (!taskType) {
            taskType = this._getAttributeValue(obj, "taskType");
        }
        
        return taskType;
    },    
    _getTaskType: function (obj) {
        let taskType = this._getInternalTaskType(obj);
        if (taskType) {
            switch (taskType.toLowerCase()) {
                case "entity_import": {
                    taskType = "Entity Data Imports";
                    let integrationType = this._getAttributeValue(obj, "integrationType");
                    if (integrationType && integrationType.toLowerCase() == "system") {
                        taskType = "System Integrations - Entity Data Imports";
                    }
                    break;
                }
                case "system_integrations_entity_import":
                    taskType = "System Integrations - Entity Data Imports";
                    break;
                case "entity_export": {
                    taskType = "Entity Data Exports";

                    let integrationType = this._getAttributeValue(obj, "integrationType");
                    if (integrationType && integrationType.toLowerCase() == "system") {
                        taskType = "System Integrations - Entity Data Exports";
                    }
                    break;
                }
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
                case "createvariants":                
                    taskType = "Bulk Create/Edit";
                    break;
                case "delete":
                case "delete-query":
                case "delete-multi-query":
                    taskType = "Bulk Entity Delete";
                    break;
                case "ui_basedatamodel":
                    taskType = "Base Data Model Imports"
                    break;
                case "ui_instancedatamodel":
                    taskType = "Instance Data Model Imports"
                    break;
                case "ui_governancemodel":
                    taskType = "Governance Model Imports"
                    break;
                case "ui_authorizationmodel":
                    taskType = "Authorization Model Imports"
                    break;
                case "ui_basedatamodel_export":
                    taskType = "Base Data Model Exports"
                    break;
                case "ui_governancemodel_export":
                    taskType = "Governance Model Exports"
                    break;
                case "ui_instancedatamodel_export":
                    taskType = "Instance Data Model Exports"
                    break;    
                case "ui_authorizationmodel_export":
                    taskType = "Authorization Model Exports"
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