var DFRestService = require('../common/df-rest-service/DFRestService'),
    uuidV1 = require('uuid/v1'),
    fs = require('fs');

var COPService = function (options) {
    options.serverType = "cop";
    DFRestService.call(this, options);
};

COPService.prototype = {
    transform: async function (request) {
        //console.log('COPService.transform url ', request.url);
        var copURL = "copservice/transform";
        var validationResult = this._validateRequest(request);
        if(!validationResult) {
            return {
                "entityOperationResponse": {
                    "status" :"Error",
                    "statusDetail" : {
                        "code": "RSUI0000",
                        "message": "Incorrect request for COP transform.",
                        "messageType": "Error"
                    }
                }
            };
        }

        var fileName = request.body.fileName;
        var profileName = request.body.profileName;
        var copRequest = this._prepareCOPRequestForTransform(fileName, profileName);
        //console.log('copRequest: ', JSON.stringify(copRequest, null, 2));
        return await this.post(copURL, copRequest);
    },
    process: async function (request) {
        var processURL = "copservice/process";
        var validationResult = this._validateRequest(request);
        if(!validationResult) {
            return {
                "entityOperationResponse": {
                    "status" :"Error",
                    "statusDetail" : {
                        "code": "RSUI0000",
                        "message": "Incorrect request for COP process.",
                        "messageType": "Error"
                    }
                }
            };
        }

        var fileName = request.body.fileName;
        var profileName = request.body.profileName;
        var processRequest = this._prepareCOPRequestForProcess(fileName, profileName);
        //console.log('processRequest: ', JSON.stringify(processRequest.dataObject.properties, null, 2));
        var result = await this.post(processURL, processRequest);

        // console.log('------------------RDF CALL RESPONSE ------------------------------');
        // console.log(JSON.stringify(result, null, 4));
        // console.log('-----------------------------------------------------------------\n\n');

        return result;
    },
    processmodel: async function (request) {
        var processModelURL = "copservice/processmodel";
        var validationResult = this._validateRequest(request);
        if(!validationResult) {
            return {
                "entityOperationResponse": {
                    "status" :"Error",
                    "statusDetail" : {
                        "code": "RSUI0000",
                        "message": "Incorrect request for COP process model.",
                        "messageType": "Error"
                    }
                }
            };
        }

        var fileName = request.body.fileName;
        var profileName = request.body.profileName;
        var processModelRequest = this._prepareCOPRequestForProcess(fileName, profileName);
        //console.log('processRequest: ', JSON.stringify(processModelRequest.dataObject.properties, null, 2));
        return await this.post(processModelURL, processModelRequest);
    },
    _validateRequest: function(request) {
        if(!request.body) {
            return false;
        }
        if(!request.body.fileName) {
            return false;    
        }
        if(!request.body.profileName) {
            return false;    
        }

        return true;
    },
    _prepareCOPRequestForTransform: function(fileName, profileName) {
        var copRequest = {
            "dataObject": {
                "id": "",
                "dataObjectInfo": {
                    "dataObjectType": "entityjson"
                },
                "properties": {
                    "createdByService": "user interface",
                    "createdBy": "user",
                    "createdDate": "2016-07-16T18:33:52.412-07:00",
                    "filename": "",
                    "encoding": "Base64",
                    "profileId": "d75a63f9-ed4f-4b6e-9973-8743396b61c0",
                    "profileName": ""
                },
                "data": {
                    "blob": ""
                }
            }
        };
        
        copRequest.dataObject.id = uuidV1();
        copRequest.dataObject.properties.filename = fileName;
        copRequest.dataObject.properties.profileName = profileName;
        copRequest.dataObject.data.blob = this._getFileContent(fileName);
        return copRequest;
    },
    _prepareCOPRequestForProcess: function(fileName, profileName) {
        var copRequest = {
            "dataObject": {
                "id": "",
                "dataObjectInfo": {
                    "dataObjectType": "excelfile"
                },
                "properties": {
                    "createdByService": "user interface",
                    "createdBy": "user",
                    "createdDate": "2016-07-16T18:33:52.412-07:00",
                    "filename": "",
                    "encoding": "Base64",
                    "profileId": "d75a63f9-ed4f-4b6e-9973-8743396b61c0",
                    "profileName": "",
                    "workAutomationId": "uuid"
                },
                "data": {
                    "blob": ""
                }
            }
        };
        
        copRequest.dataObject.id = uuidV1();
        copRequest.dataObject.properties.filename = fileName;
        copRequest.dataObject.properties.profileName = profileName;
        copRequest.dataObject.data.blob = this._getFileContent(fileName);
        return copRequest;
    },
    _getFileContent: function(fileName) {
        var binaryData = "";
        try {
            binaryData = fs.readFileSync('./upload/' + fileName);
        } catch(ex) {
            console.log('error while reading file: ', ex);
        }
        
        //console.log('binaryData ', binaryData);
        return new Buffer(binaryData).toString('base64');
    }
};

module.exports = COPService;

