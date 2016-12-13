'use strict';

var DataConnection = require('./DataConnection');

function EntityManageService(options) {

}

EntityManageService.prototype = {
    getEntities: function(request){
        var dataConnection = new DataConnection();
        var client = dataConnection.getClient();

        //var url = 'http://172.30.7.51:8085/t1/api/entityManageService/get';
        var url = dataConnection.getBaseUrl() + '/entityManageService/get';
        
        var options = {
            //url: url,
            //method: "POST",
            headers:{
                //"Content-type": "application/json",
                "Cache-Control": "no-cache"
            },
            json: request
        };

        var res = client("POST", url, options);
      
        var response = {};

        var resBody = res.getBody('utf8');

        if(resBody !== undefined){
            response = JSON.parse(resBody);
        }

        return response;
    }
};

module.exports = EntityManageService;







