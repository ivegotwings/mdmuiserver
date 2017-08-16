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
        var files = request.files;
        var copRequest = this._prepareCOPRequestForTransform(fileName, originalFileName, profileName, files);
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
        var files = request.files;
        var processRequest = this._prepareCOPRequestForProcess(fileName, originalFileName, profileName, files);
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
        var files = request.files;
        var generateFieldMapRequest = this._prepareCOPRequestForGenerateMap(fileName, originalFileName, profileName, files);
        //console.log('generateFieldMapRequest: ', JSON.stringify(generateFieldMapRequest, null, 2));
        return await this.post(generateFieldMapURL, generateFieldMapRequest);
    },
    downloadModelExcel: async function (request, response) {
        var downloadModelURL = "copservice/downloadModelExcel";
        var timeStamp = Date.now();
        var parsedRequest = JSON.parse(request.body.data);
        var fileName = parsedRequest.fileName + '-' + timeStamp;

        //console.log('downloadModelRequest: ', JSON.stringify(request.body, null, 2));
        var modelResponse = await this.post(downloadModelURL, parsedRequest);

        this._handleDownloadResponse(modelResponse, fileName, response);
    },
    downloadDataExcel: async function (request, response) {
        var downloadDataURL = "copservice/downloadDataExcel";
        var timeStamp = Date.now();
        var parsedRequest = JSON.parse(request.body.data);
        var fileName = parsedRequest.fileName + '-' + timeStamp;

        //console.log('downloadDataRequest: ', JSON.stringify(request.body, null, 2));
        var copResponse = await this.post(downloadDataURL, parsedRequest);

        this._handleDownloadResponse(copResponse, fileName, response);
    },
    _handleDownloadResponse: function (copResponse, fileName, response) {
        if (copResponse && copResponse.response) {
            if (copResponse.response.status.toLowerCase() == "success") {
                this._downloadFileContent(copResponse.response, fileName, response);
            } else {
                var message = 'Failed to get response from COP service.';
                if (copResponse.response.statusDetail && copResponse.response.statusDetail.message) {
                    message = copResponse.response.statusDetail.message;
                }
                response.status(500).send(message);
            }
        }
    },
    downloadDataJob: async function (request, response) {
        var downloadDataURL = "copservice/downloadDataJob";
        if (!request.body) {
            return {
                "dataOperationResponse": {
                    "status": "Error",
                    "statusDetail": {
                        "code": "RSUI0001",
                        "message": "Incorrect request for COP bulk download.",
                        "messageType": "Error"
                    }
                }
            };
        }

        //console.log('downloadDataRequest: ', JSON.stringify(request.body, null, 2));
        return await this.post(downloadDataURL, request.body);
    },
    publish: async function (request) {
        //console.log('COPService.publish url ', request.url);
        var copURL = "copservice/publish";
        if (!request.body) {
            return {
                "dataOperationResponse": {
                    "status": "Error",
                    "statusDetail": {
                        "code": "RSUI0001",
                        "message": "Incorrect request for COP publish.",
                        "messageType": "Error"
                    }
                }
            };
        }
        return await this.post(copURL, request.body);
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

    _prepareCOPRequestForTransform: function (fileName, originalFileName, profileName, files) {
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
        copRequest.dataObject.data.blob = this._getFileContent(fileName, files);
        return copRequest;
    },

    _prepareCOPRequestForProcess: function (fileName, originalFileName, profileName, files) {
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
        copRequest.dataObject.data.blob = this._getFileContent(fileName, files);
        return copRequest;
    },
    _prepareCOPRequestForGenerateMap: function (fileName, originalFileName, profileName, files) {
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
        copRequest.binaryObject.data.blob = this._getFileContent(fileName, files);
        return copRequest;
    },
    _getFileContent: function (fileName, files) {
        var binaryData = "";
        try {

            if (!files) {
                var dir = './upload';

                if (config && !isEmpty(config.fileStoragePath)) {
                    if (fs.existsSync(config.fileStoragePath)) {
                        dir = config.fileStoragePath + '/upload';
                    }
                }

                binaryData = fs.readFileSync(dir + '/' + fileName);
            } else {
                console.log("file");
                binaryData = files.file.data;
            }
        } catch (ex) {
            console.log('error while reading file: ', ex);
        }

        //console.log('binaryData ', binaryData);
        return new Buffer(binaryData).toString('base64');
    },
    _downloadFileContent: function (copResponse, fileName, response) {
        //console.log(JSON.stringify(response));
        if (copResponse && copResponse.binaryObjects && copResponse.binaryObjects.length) {
            var binaryObject = copResponse.binaryObjects[0];
            if (binaryObject) {
                var fileExtension = "xlsm";
                if (binaryObject.properties && binaryObject.properties.extension) {
                    fileExtension = binaryObject.properties.extension;
                }

                var blob = binaryObject.data && binaryObject.data.blob ? binaryObject.data.blob : "";
                response.cookie('fileDownload', true, { path: "/", httpOnly: false });
                response.writeHead(200, {
                    'Content-Type': 'application/vnd.ms-excel', //ToDo: need to use different mime types based on file extensions
                    'Content-disposition': 'attachment;filename=' + fileName + "." + fileExtension
                });

                response.end(new Buffer(blob, 'base64'));

            }
        } else {
            response.status(500).send('binaryObjects not found in response of download service.!')
        }

    }
};

module.exports = COPService;

