let DFServiceRest = require("../common/df-rest-service/DFRestService");

let DataObjectLineageService = function(options) {
    DFServiceRest.call(this, options)
}

DataObjectLineageService.prototype = {
    get: async function(request) {
        let response = {};
        
        response = await this._getLineagePathDetails(request);

        return response;
    },

    _getLineagePathDetails: function(request) {
        let response = {};

        let entityId = "";
        let entityType = "";
        let relationshipType = "";

        let path = await this._get(entityId, entityType, relationshipType);

        // if fullPath

        // prepare entity object with attribute "lineagePath"

        // response = prepared entity.


        return response;
    },

    _get: async function(entityId, entityType, relType) {
        let path = [];
        // prepare request for relationshipCriterions

        // do initSearch

        // do searchResultGet
            
            // if entity is there then

                // path = _get(entityId, entityType, relType);
            
            // else 

                // return path

        return path;
    },
    
    _initSearch: async function(request) {

    },

    _getSearchResult: async function(request) {

    }
}

module.exports = DataObjectLineageService;