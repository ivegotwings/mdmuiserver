'use strict';

require("babel-register");
require("babel-polyfill");

var ConfigService = require('./ConfigService');

function testOfflineInitialization() {
    var configService = new configService({ mode: "offline" });
}

function testOfflineGetConfig() {
    console.log('testOfflineGetConfig started..');
    var configService = new ConfigService({ mode: "dev-offline" });

    var request = {};
    var response = configService.getConfigs(request);

    console.log(JSON.stringify(response));

    console.log('testOfflineGetConfig completed..');
}

module.exports = {
    testOfflineInitialization: testOfflineInitialization,
    testOfflineGetConfig: testOfflineGetConfig
};

module.exports = new function () {
    testOfflineGetConfig();
}











