let DFRestService = require('../../common/df-rest-service/DFRestService'),
    uuidV1 = require('uuid/v1'),
    fs = require('fs'),
    config = require('config'),
    isEmpty = require('../../common/utils/isEmpty');

let COPService = function (options) {
    options.serverType = "cop";
    DFRestService.call(this, options);
};

COPService.prototype = {
    transform: async function (request) {
        //console.log('COPService.transform url ', request.url);
        let copURL = "copservice/transform";
        let validationResult = this._validateRequest(request);
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

        let copRequest = JSON.parse(request.body.requestData);
        let fileName = request.body.fileName;
        let files = request.files;
        copRequest.dataObject.data.blob = this._getFileContent(fileName, files);
        copRequest.dataObject.id = uuidV1();
        // console.log('copRequest: ', JSON.stringify(copRequest, null, 2));
        return await this.post(copURL, copRequest);
    },
    process: async function (request) {
        let processURL = "copservice/process";
        let validationResult = this._validateRequest(request);
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

        let fileName = request.body.fileName;
        let files = request.files;
        let processRequest = JSON.parse(request.body.requestData);
        processRequest.dataObject.id = uuidV1();
        processRequest.dataObject.data.blob = this._getFileContent(fileName, files);
        //console.log('processRequest: ', JSON.stringify(processRequest.dataObject.properties, null, 2));
        let result = await this.post(processURL, processRequest);

        // console.log('------------------RDF CALL RESPONSE ------------------------------');
        // console.log(JSON.stringify(result, null, 4));
        // console.log('-----------------------------------------------------------------\n\n');

        return result;
    },
    processmodel: async function (request) {
        let processModelURL = "copservice/processmodel";
        let validationResult = this._validateRequest(request);
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

        let fileName = request.body.fileName;
        let files = request.files;
        let processModelRequest = JSON.parse(request.body.requestData);
        processModelRequest.dataObject.id = uuidV1();
        processModelRequest.dataObject.data.blob = this._getFileContent(fileName, files);
        //console.log('processRequest: ', JSON.stringify(processModelRequest.dataObject.properties, null, 2));
        return await this.post(processModelURL, processModelRequest);
    },

    processJSON: async function (request) {
        let processJSONURL = "copservice/processJSON";
        let validationResult = this._validateRequest(request,false);
        if (!validationResult) {
            return {
                "entityOperationResponse": {
                    "status": "Error",
                    "statusDetail": {
                        "code": "RSUI0001",
                        "message": "Incorrect request for JSON process model.",
                        "messageType": "Error"
                    }
                }
            };
        }           
        let processJSONRequest = JSON.parse(request.body.requestData);
        processJSONRequest.dataObject.id = uuidV1();
        let jsonStr = JSON.stringify(processJSONRequest.JSONData);
        delete processJSONRequest.JSONData;
        processJSONRequest.dataObject.data.blob = new Buffer(jsonStr).toString('base64');
        //console.log('processJSON: ', JSON.stringify(processJSONRequest.dataObject.data.blob, null, 2));
        return await this.post(processJSONURL, processJSONRequest);
    },

    generateFieldMap: async function (request) {
        let generateFieldMapURL = "copservice/generateFieldMap";
        let validationResult = this._validateRequest(request);
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

        let fileName = request.body.fileName;
        let files = request.files;

        let generateFieldMapRequest = JSON.parse(request.body.requestData);
        generateFieldMapRequest.binaryObject.id = uuidV1();
        generateFieldMapRequest.binaryObject.data.blob = this._getFileContent(fileName, files);
        //console.log('generateFieldMapRequest: ', JSON.stringify(generateFieldMapRequest, null, 2));
        return await this.post(generateFieldMapURL, generateFieldMapRequest);
    },
    getHeaderFields: async function (request) {
        let getHeaderFieldsURL = "copservice/getHeaderFields";
        let validationResult = this._validateRequest(request);
        if (!validationResult) {
            return {
                "entityOperationResponse": {
                    "status": "Error",
                    "statusDetail": {
                        "code": "RSUI0000",
                        "message": "Incorrect request for COP get header fields.",
                        "messageType": "Error"
                    }
                }
            };
        }

        let fileName = request.body.fileName;
        let files = request.files;

        let getHeaderFieldsRequest = JSON.parse(request.body.requestData);
        getHeaderFieldsRequest.dataObject.id = uuidV1();
        getHeaderFieldsRequest.dataObject.data.blob = this._getFileContent(fileName, files);
        return await this.post(getHeaderFieldsURL, getHeaderFieldsRequest);
    },
    getMappings: async function (request) {
        let getMappingsURL = "copservice/getMappings";
        if (!request.body) {
            return {
                "entityOperationResponse": {
                    "status": "Error",
                    "statusDetail": {
                        "code": "RSUI0000",
                        "message": "Incorrect request for COP get mappings.",
                        "messageType": "Error"
                    }
                }
            };
        }
        return await this.post(getMappingsURL, request.body);
    },
    saveMappings: async function (request) {
        let saveMappingsURL = "copservice/saveMappings";
        if (!request.body) {
            return {
                "entityOperationResponse": {
                    "status": "Error",
                    "statusDetail": {
                        "code": "RSUI0000",
                        "message": "Incorrect request for COP save mappings.",
                        "messageType": "Error"
                    }
                }
            };
        }
        return await this.post(saveMappingsURL, request.body);
    },
    downloadModelExcel: async function (request, response) {
        let downloadModelURL = "copservice/downloadModelExcel";
        let timeStamp = Date.now();
        let parsedRequest = JSON.parse(request.body.data);
        let fileName = parsedRequest.fileName + '-' + timeStamp;

        //console.log('downloadModelRequest: ', JSON.stringify(request.body, null, 2));
        let modelResponse = await this.post(downloadModelURL, parsedRequest);

        this._handleDownloadResponse(modelResponse, fileName, response);
    },
    downloadModelJob: async function (request, response) {
        let downloadModelURL = "copservice/downloadModelJob";
        //let timeStamp = Date.now();
        let requestBody = request.body || {};
        //let fileName = request.fileName + '-' + timeStamp;

        //console.log('downloadModelRequest: ', JSON.stringify(request.body, null, 2));
        return await this.post(downloadModelURL, requestBody);
    },
    downloadDataExcel: async function (request, response) {
        let downloadDataURL = "copservice/downloadDataExcel";
        let timeStamp = Date.now();
        let parsedRequest = JSON.parse(request.body.data);
        let fileName = parsedRequest.fileName + '-' + timeStamp;

        //console.log('downloadDataRequest: ', JSON.stringify(parsedRequest, null, 2));
        let copResponse = await this.post(downloadDataURL, parsedRequest);

        this._handleDownloadResponse(copResponse, fileName, response);
    },
    _handleDownloadResponse: function (copResponse, fileName, response) {
        if (copResponse && copResponse.response) {
            if (copResponse.response.status.toLowerCase() == "success") {
                this._downloadFileContent(copResponse.response, fileName, response);
            } else {
                let message = 'Failed to get response from COP service.';
                if (copResponse.response.statusDetail && copResponse.response.statusDetail.message) {
                    message = copResponse.response.statusDetail.message;
                }
                response.status(500).send(message);
            }
        }
    },
    downloadDataJob: async function (request, response) {
        let downloadDataURL = "copservice/downloadDataJob";
        let downloadDataJobRequest = request.body;

        if (!downloadDataJobRequest) {
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

        if (downloadDataJobRequest.params && downloadDataJobRequest.params.isCombinedQuerySearch) {
            //delete options if exists
            delete downloadDataJobRequest.params.options;
            //set pagesize
            downloadDataJobRequest.params.pageSize = 30000;

            //delete options at each search query level.
            if (downloadDataJobRequest.entity && downloadDataJobRequest.entity.data && downloadDataJobRequest.entity.data.jsonData) {
                let searchQueries = downloadDataJobRequest.entity.data.jsonData.searchQueries;
                if (searchQueries) {
                    for (let i = 0; i < searchQueries.length; i++) {
                        let searchQuery = searchQueries[i];

                        if (searchQuery.searchQuery && searchQuery.searchQuery.options) {
                            delete searchQuery.searchQuery.options;
                        }
                    }
                }
            }
        }

        //console.log('downloadDataRequest: ', JSON.stringify(request.body, null, 2));
        return await this.post(downloadDataURL, downloadDataJobRequest);
    },
    publish: async function (request) {
        //console.log('COPService.publish url ', request.url);
        let copURL = "copservice/publish";
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
    getOverrides: async function (request) {
        let copURL = "copservice/getprofile";
        if (!request.body) {
            return {
                "dataOperationResponse": {
                    "status": "Error",
                    "statusDetail": {
                        "code": "RSUI0001",
                        "message": "Incorrect request to get user overrides",
                        "messageType": "Error"
                    }
                }
            };
        }
        return await this.post(copURL, request.body);
    },
    saveOverrides: async function (request) {
        let copURL = "copservice/saveoverrides";
        if (!request.body) {
            return {
                "dataOperationResponse": {
                    "status": "Error",
                    "statusDetail": {
                        "code": "RSUI0001",
                        "message": "Incorrect request to save user overrides",
                        "messageType": "Error"
                    }
                }
            };
        }
        return await this.post(copURL, request.body);
    },
    _validateRequest: function (request, validateFileName = true) {
      
        if (!request.body) {
            return false;
        }
        if (validateFileName && !request.body.fileName) {
            return false;
        }
        if (!request.body.requestData) {
            return false;
        }

        return true;
    },
    _getFileContent: function (fileName, files) {
        let binaryData = "";
        try {

            if (!files) {
                let dir = './upload';

                let fileStoragePath = config.get('modules.fileDownload.fileStoragePath');
                if (!isEmpty(fileStoragePath)) {
                    if (fs.existsSync(fileStoragePath)) {
                        dir = fileStoragePath + '/download';
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
            let binaryObject = copResponse.binaryObjects[0];
            if (binaryObject) {
                let fileExtension = "xlsm";
                if (binaryObject.properties && binaryObject.properties.extension) {
                    fileExtension = binaryObject.properties.extension;
                }

                let blob = binaryObject.data && binaryObject.data.blob ? binaryObject.data.blob : "";
                response.cookie('fileDownload', true, {
                    path: "/",
                    httpOnly: false
                });
                let contentType = (fileExtension === "xlsm") ? 'application/vnd.ms-excel.sheet.macroEnabled.12' : 'application/vnd.ms-excel'
                response.writeHead(200, {
                    'Content-Type': contentType, //ToDo: need to use different mime types based on file extensions
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