require("babel-register");
require("babel-polyfill");

var ApiHealthCheckService = require('./ApiHealthCheckService');

var apiHealthCheckService = new ApiHealthCheckService();

ApiHealthCheckServiceTest = function() {
}

ApiHealthCheckServiceTest.prototype = {
    executeGet: function(url) {
        return apiHealthCheckService.executeGetApi(url);
    },
    executeUpdate: function(url) {
        return apiHealthCheckService.executeProcessApi(url);
    }
}

var testService = new ApiHealthCheckServiceTest();

//check entityappservice/get api
//testService.callService("/data/healthcheck/entityappservice/get");

//check entityappservice/update api    
testService.executeUpdate("/data/healthcheck/entityappservice/update");

//check entityappservice/get api
//testService.callService("/data/healthcheck/entityappservice/get");


