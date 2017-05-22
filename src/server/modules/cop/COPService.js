var DFRestService = require('../common/df-rest-service/DFRestService'),
    uuidV1 = require('uuid/v1'),
    fs = require('fs'),
    config = require('../../config/rdf-connection-config.json'),
    isEmpty = require('../common/utils/isEmpty');

var COPService = function (options) {
    options.serverType = "cop";
    DFRestService.call(this, options);
};

COPService.prototype = {
    transform: async function (request) {
        //console.log('COPService.transform url ', request.url);
        var copURL = "copservice/transform";
        var validationResult = this._validateRequest(request);
        if (!validationResult) {
            return {
                "entityOperationResponse": {
                    "status": "Error",
                    "statusDetail": {
                        "code": "RSUI0001",
                        "message": "Incorrect request for COP transform.",
                        "messageType": "Error"
                    }
                }
            };
        }

        var fileName = request.body.fileName;
        var originalFileName = request.body.originalFileName;
        var profileName = request.body.profileName;
        var copRequest = this._prepareCOPRequestForTransform(fileName, originalFileName, profileName);
        //console.log('copRequest: ', JSON.stringify(copRequest, null, 2));
        return await this.post(copURL, copRequest);
    },
    process: async function (request) {
        var processURL = "copservice/process";
        var validationResult = this._validateRequest(request);
        if (!validationResult) {
            return {
                "entityOperationResponse": {
                    "status": "Error",
                    "statusDetail": {
                        "code": "RSUI0001",
                        "message": "Incorrect request for COP process.",
                        "messageType": "Error"
                    }
                }
            };
        }

        var fileName = request.body.fileName;
        var originalFileName = request.body.originalFileName;
        var profileName = request.body.profileName;
        var processRequest = this._prepareCOPRequestForProcess(fileName, originalFileName, profileName);
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
        if (!validationResult) {
            return {
                "entityOperationResponse": {
                    "status": "Error",
                    "statusDetail": {
                        "code": "RSUI0001",
                        "message": "Incorrect request for COP process model.",
                        "messageType": "Error"
                    }
                }
            };
        }

        var fileName = request.body.fileName;
        var originalFileName = request.body.originalFileName;
        var profileName = request.body.profileName;
        var processModelRequest = this._prepareCOPRequestForProcess(fileName, originalFileName, profileName);
        //console.log('processRequest: ', JSON.stringify(processModelRequest.dataObject.properties, null, 2));
        return await this.post(processModelURL, processModelRequest);
    },
    generateFieldMap: async function (request) {
        var generateFieldMapURL = "copservice/generateFieldMap";
        var validationResult = this._validateRequest(request);
        if (!validationResult) {
            return {
                "entityOperationResponse": {
                    "status": "Error",
                    "statusDetail": {
                        "code": "RSUI0000",
                        "message": "Incorrect request for COP generate field mappings.",
                        "messageType": "Error"
                    }
                }
            };
        }

        var fileName = request.body.fileName;
        var originalFileName = request.body.originalFileName;
        var profileName = request.body.profileName;
        var generateFieldMapRequest = this._prepareCOPRequestForGenerateMap(fileName, originalFileName, profileName);
        //console.log('generateFieldMapRequest: ', JSON.stringify(generateFieldMapRequest, null, 2));
        return await this.post(generateFieldMapURL, generateFieldMapRequest);
    },
    downloadModelExcel: async function (request) {
        var downloadModelURL = "copservice/downloadModelExcel";
        var timeStamp = Date.now();
        var fileName = request.body.fileName + '-' + timeStamp;

        //console.log('downloadModelRequest: ', JSON.stringify(request.body, null, 2));
        var response = await this.post(downloadModelURL, request.body);

        if (response && response.response && response.response.status.toLowerCase() == "success") {
            this._downloadFileContent(response.response, fileName);
        }

        return response;
    },
    downloadDataExcel: async function (request) {
        var downloadDataURL = "copservice/downloadDataExcel";
        var timeStamp = Date.now();
        var fileName = request.body.fileName + '-' + timeStamp;

        //console.log('downloadDataRequest: ', JSON.stringify(request.body, null, 2));
        var response = await this.post(downloadDataURL, request.body);

        if (response && response.response && response.response.status.toLowerCase() == "success") {
            this._downloadFileContent(response.response, fileName);
        }

        return response;
    },
    _validateRequest: function (request) {
        if (!request.body) {
            return false;
        }
        if (!request.body.fileName) {
            return false;
        }
        if (!request.body.originalFileName) {
            return false;
        }
        if (!request.body.profileName) {
            return false;
        }

        return true;
    },

    _prepareCOPRequestForTransform: function (fileName, originalFileName, profileName) {
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
        copRequest.dataObject.properties.filename = originalFileName;
        copRequest.dataObject.properties.profileName = profileName;
        copRequest.dataObject.data.blob = this._getFileContent(fileName);
        return copRequest;
    },

    _prepareCOPRequestForProcess: function (fileName, originalFileName, profileName) {
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
        copRequest.dataObject.properties.filename = originalFileName;
        copRequest.dataObject.properties.profileName = profileName;
        copRequest.dataObject.data.blob = this._getFileContent(fileName);
        return copRequest;
    },
    _prepareCOPRequestForGenerateMap: function (fileName, originalFileName, profileName) {
        var copRequest = {
            "binaryObject": {
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
                    "profileName": "",
                    "profileType": "COPProfile"
                },
                "data": {
                    "blob": ""
                }
            }
        };

        copRequest.binaryObject.id = uuidV1();
        copRequest.binaryObject.properties.filename = originalFileName;
        copRequest.binaryObject.properties.profileName = profileName;
        copRequest.binaryObject.data.blob = this._getFileContent(fileName);
        return copRequest;
    },
    _getFileContent: function (fileName) {
        var binaryData = "";
        try {
            var dir = './upload';

            if (config && !isEmpty(config.fileStoragePath)) {
                if (fs.existsSync(config.fileStoragePath)) {
                    dir = config.fileStoragePath + '/upload';
                }
            }

            binaryData = fs.readFileSync(dir + '/' + fileName);
        } catch (ex) {
            console.log('error while reading file: ', ex);
        }

        //console.log('binaryData ', binaryData);
        return new Buffer(binaryData).toString('base64');
    },
    _downloadFileContent: function (response, fileName) {
        //console.log(JSON.stringify(response));
        if (response && response.binaryObjects && response.binaryObjects.length) {
            var binaryObject = response.binaryObjects[0];
            response.fileName = fileName;
            
            if (binaryObject) {
                var fileExtension = "xlsx";
                if (binaryObject.properties && binaryObject.properties.extension) {
                    fileExtension = binaryObject.properties.extension;
                }

                response.fileExtension = fileExtension;

                var blob = binaryObject.data && binaryObject.data.blob ? binaryObject.data.blob : "";

                var binaryData = "";
                try {
                    var dir = './download';

                    if (config && !isEmpty(config.fileStoragePath)) {
                        if (fs.existsSync(config.fileStoragePath)) {
                            dir = config.fileStoragePath + '/download';
                        }
                    }

                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }

                    var completeFileName = dir + '/' + fileName + '.' + fileExtension;
                    binaryData = fs.writeFileSync(completeFileName, blob, 'base64');
                } catch (ex) {
                    console.log('error while writing file: ', ex);
                }
            }
        } else {
            response.status = "error";
            response.statusDetail = {};
            response.code = "RSUI0002";
            response.statusDetail.message = "binaryObjects not found in response of download service.";
            response.statusDetail.messageType = "Error";
        }

    }
};

module.exports = COPService;

