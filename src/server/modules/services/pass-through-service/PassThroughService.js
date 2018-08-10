let DFRestService = require('../../common/df-rest-service/DFRestService'),
    isEmpty = require('../../common/utils/isEmpty');

let PassThroughService = function (options) {
    DFRestService.call(this, options);
};

let logger = require('../../common/logger/logger-service.js');

PassThroughService.prototype = {
    call: async function (request) {
        //console.log('PassThroughService.call ', request.url);
        //logger.debug("PassThroughService --> "+JSON.stringify(request))
        let passThroughUrl = request.url.replace('/data/pass-through/', '');
        return await this.post(passThroughUrl, request.body);
    },

    snapshotCall: async function(request){
        let passThroughUrl = request.url.replace('/data/pass-through-snapshot/', 'entityappservice/');
        return await this.post(passThroughUrl, request.body);
    },
    
    bulkCall: async function (request) {
        //console.log('Bulk Operation Request - ', request.body);
        let passThroughUrl = request.url.replace('/pass-through-bulk/', '');
        let singleEntityRequest = {};
        let bulkOperationResponse = [];
        let params = request.body.params;
        let clientState = request.body.clientState;
        let requestedEntities = request.body.entities;
        let hotline = request.body.hotline;

        //Construct single entity request...
        if(params){
            singleEntityRequest["params"] = params;
        }

        if(clientState){
            singleEntityRequest["clientState"] = clientState;
        }

        if(hotline){
            singleEntityRequest["hotline"] = hotline;
        }

        if(requestedEntities && !isEmpty(requestedEntities)){
            //Iterate through each entity and make RDF call and collect response...
            for (let entity of requestedEntities) {
                singleEntityRequest["entity"] = entity;
                //console.log('Constructed single entity request - ', singleEntityRequest);

                let operationResponse = await this.post(passThroughUrl, singleEntityRequest);

                //Construct response...
                let entityResponse = {};
                entityResponse['id'] = entity.id;
                entityResponse['operationResponse'] = operationResponse;
                //console.log('Operation response from the RDF for single entity - ', entityResponse);

                bulkOperationResponse.push(entityResponse);
            }
        }
        else {
            //Entity data is mandatory...
            //TODO: send error message as response.
        }

        //console.log('Bulk Operation Response - ', bulkOperationResponse);
        return bulkOperationResponse;
    },
    createTaskForCombinedQuery: async function (request) {
        //console.log('PassThroughService.call ', request.url);
        let createTaskRequest = request.body;

        if(createTaskRequest) {
            let passThroughUrl = request.url.replace('/data/pass-through-combined-query/', '');

            if(createTaskRequest.params) {
                delete createTaskRequest.params.options;
                createTaskRequest.params.pageSize = 30000;
            }

            if(createTaskRequest.entities && createTaskRequest.entities.length > 0) {
                if(createTaskRequest.entities[0].data && createTaskRequest.entities[0].data.jsonData) {
                    let searchQueries = createTaskRequest.entities[0].data.jsonData.searchQueries;
                    if(searchQueries) {
                        for (let i = 0; i < searchQueries.length; i++) {
                            let searchQuery = searchQueries[i];

                            if (searchQuery.searchQuery && searchQuery.searchQuery.options) {
                                delete searchQuery.searchQuery.options;
                            }
                        }
                    }
                }
            }

            return await this.post(passThroughUrl, createTaskRequest);
        }
    }
};

module.exports = PassThroughService;

