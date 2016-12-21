'use strict';

var DPServiceBase = require('../DPServiceBase');

var DPEntityManageService = function(options) {
    DPServiceBase.call(this, options);
};

DPEntityManageService.prototype = {
    getEntities: async function(request){
        var url = this.baseUrl + '/entityManageService/get';
        
        var options = {
            url: url,
            method: "POST",
            headers:{
                //"Content-type": "application/json",
                "Cache-Control": "no-cache"
            },
            body: request,
            json: true
        };

        var res = await this.client(options);
        return res;
    }
};

module.exports = DPEntityManageService;







