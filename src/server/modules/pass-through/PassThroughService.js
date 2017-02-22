var DFRestService = require('../common/df-rest-service/DFRestService');

var PassThroughService = function (options) {
    DFRestService.call(this, options);
};

PassThroughService.prototype = {
    call: async function (request) {
        //console.log('PassThroughService.call ', request.url);
        var passThroughUrl = request.url.replace('/pass-through/', '');

        return await this.post(passThroughUrl, request.body);
    }
};

module.exports = PassThroughService;

