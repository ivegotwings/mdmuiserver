'use strict';

var DPServiceBase = require('../DPServiceBase');

var DPEntityManageService = function(options) {
    DPServiceBase.call(this, options);
};

DPEntityManageService.prototype = {
    getEntities: function(request){
        var url = this.baseUrl + '/entityManageService/get';
        var options = {
            //url: url,
            //method: "POST",
            headers:{
                //"Content-type": "application/json",
                "Cache-Control": "no-cache"
            },
            json: request
        };

        var res = this.client("POST", url, options);
        var resBody = res.getBody('utf8');
        
        var response = {};
        if(resBody !== undefined){
            response = JSON.parse(resBody);
            //console.log('server data', JSON.stringify(response));
        }

        return response;
    }
};

module.exports = DPEntityManageService;







