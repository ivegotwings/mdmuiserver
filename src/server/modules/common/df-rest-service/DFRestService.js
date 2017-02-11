'use strict';

const DFServiceBase = require('../service-base/DFServiceBase'),
        OfflineRestService = require('./OfflineRestService'),
        config = require('./df-rest-service-config.json');
 
var offlineRestService = null;

var DFRestService = function(options) {
    DFServiceBase.call(this, options);
    
    offlineRestService = new OfflineRestService(options);

    this.post = async function(url, request, offlineCallback = this.defaultOfflineCallback) {
        //console.log('DFRestService url', url);

        var serviceConfig = config.services[url];

        var actualUrl = serviceConfig.url,
            configMode = serviceConfig.mode;
        
        if(configMode === "disabled") {
            throw "Requested service url " + url + " is disabled / not available.";
        }
        else {
            var mode = options && options.runOffline && options.runOffline === "true" ? "offline" : configMode;

            if(mode == "online") {
                return await this.requestJson(actualUrl, request);
            } 
            else {
                return await offlineCallback(url, request);
            }
        }
    };

    this.defaultOfflineCallback = async function(url, request) {
        return await offlineRestService.post(url, request);
    };
};

module.exports = DFRestService;








