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
                        "code": "COAI0000",
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
                        "code": "COAI0000",
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
    downloadModelExcel: async function (request) {
        var downloadModelURL = "copservice/downloadModelExcel";
        //console.log('downloadModelRequest: ', JSON.stringify(request.body, null, 2));
        var response = await this.post(downloadModelURL, request);
        console.log('cop service response:', JSON.stringify(response, null, 2));
        var blob = "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";
        this._downloadFileContent(blob);
        return response;
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
    },
    _downloadFileContent: function(blob) {
        var binaryData = "";
        try {
            binaryData = fs.writeFileSync('./download/jay.xlsx', blob, 'base64');
        } catch(ex) {
            console.log('error while reading file: ', ex);
        }
    }
};

module.exports = COPService;

