var DFRestService = require('../common/df-rest-service/DFRestService');

var COPService = function (options) {
    DFRestService.call(this, options);
};

COPService.prototype = {
    transform: async function (request) {
        //console.log('PassThroughService.call ', request.url);
        var copURL = "copservice/transform";
        var copRequest = this._prepareCOPRequestForTransform(request);
        return await this.post(copURL, copRequest);
    },
    _prepareCOPRequestForTransform: function(request) {
        //TODO - write logic to prepare request for COP transform
        return request.body;
    }
};

module.exports = COPService;

