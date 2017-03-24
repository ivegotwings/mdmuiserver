'use strict';
const COPService = require('./COPService');
var uuidV1 = require('uuid/v1');
var options = {};
var runOffline = process.env.RUN_OFFLINE;

if (runOffline) {
    options.runOffline = runOffline;
}

const copService = new COPService(options);

var COPRouter = function (app) {
    app.post('/cop/transform', async function (req, res) {
        var response = await copService.transform(req);
        //console.log('cop response:', JSON.stringify(response, null, 2));
        if(!(response && response.response && response.response.entities 
                && response.response.entities.length > 0)) {
            response = {
                "response": {
                    "entities": [
                        
                    ]
                }
            };
            for(var i=0; i<3; i++) {
                var uid1 = uuidV1();
                var e = {
                            "type": "sku",
                            "id": "sku_" + uid1,
                            "data": {
                                "contexts": [
                                    {
                                        "context": {
                                            "list": "productMaster",
                                            "classification": "_ALL"
                                        },
                                        "attributes": {
                                            "displayname": {
                                                "values": [
                                                    {
                                                        "source": "internal",
                                                        "locale": "en-US",
                                                        "value": "Import Dummy "+ uid1
                                                    }
                                                ]
                                            },
                                            "description": {
                                                "values": [
                                                    {
                                                        "source": "internal",
                                                        "locale": "en-US",
                                                        "value": "Import Dummy Desc "+ uid1
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                ]
                            }
                        };
                response.response.entities.push(e);
            }
        }
        res.status(200).send(response);

    });
};

module.exports = function (app) {
    return new COPRouter(app);
};
