var DFRestService = require('../common/df-rest-service/DFRestService'),
    isEmpty = require('../common/utils/isEmpty');

var PassThroughService = function (options) {
    DFRestService.call(this, options);
};

PassThroughService.prototype = {
    call: async function (request) {
        //console.log('PassThroughService.call ', request.url);
        var passThroughUrl = request.url.replace('/pass-through/', '');

        return await this.post(passThroughUrl, request.body);
    },

    bulkCall: async function (request) {
        //console.log('Bulk Operation Request - ', request.body);
        var passThroughUrl = request.url.replace('/pass-through-bulk/', '');
        var singleEntityRequest = {};
        var bulkOperationResponse = [];
        var params = request.body.params;
        var clientState = request.body.clientState;
        var requestedEntities = request.body.entities;

        //Construct single entity request...
        if(params){
            singleEntityRequest["params"] = params;
        }

        if(clientState){
            singleEntityRequest["clientState"] = clientState;
        }
        
        if(requestedEntities && !isEmpty(requestedEntities)){
            //Iterate through each entity and make RDF call and collect response...
            for (let entity of requestedEntities) {
                singleEntityRequest["entity"] = entity;
                //console.log('Constructed single entity request - ', singleEntityRequest);

                var operationResponse = await this.post(passThroughUrl, singleEntityRequest);

                //Construct response...
                var entityResponse = {};
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
    }
};

module.exports = PassThroughService;

