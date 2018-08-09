require("babel-register");
require("babel-polyfill");

let ApiHealthCheckService = require('./ApiHealthCheckService');

let apiHealthCheckService = new ApiHealthCheckService();

let ApiHealthCheckServiceTest = function() {
}

ApiHealthCheckServiceTest.prototype = {
    executeGet: function(url) {
        return apiHealthCheckService.executeGetApi(url);
    },
    executeUpdate: function(url) {
        return apiHealthCheckService.executeProcessApi(url);
    }
}

let testService = new ApiHealthCheckServiceTest();

//check entityappservice/get api
//testService.callService("/data/healthcheck/entityappservice/get");

//check entityappservice/update api    
testService.executeUpdate("/data/healthcheck/entityappservice/update");

//check entityappservice/get api
//testService.callService("/data/healthcheck/entityappservice/get");


