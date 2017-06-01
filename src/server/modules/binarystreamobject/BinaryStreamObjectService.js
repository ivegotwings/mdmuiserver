var DFRestService = require('../common/df-rest-service/DFRestService'),
    isEmpty = require('../common/utils/isEmpty'),
    uuidV1 = require('uuid/v1');

var BinaryStreamObjectService = function (options) {
    DFRestService.call(this, options);
};

BinaryStreamObjectService.prototype = {
    prepareUpload: async function (request) {

        //console.log('prepare upload request: ', request);
        var prepareUploadResponse = {};

        try {
            var prepareUploadURL = 'binarystreamobjectservice/prepareUpload';
            var validationResult = this._validateRequest(request, 'upload');
            if (!validationResult) {
                throw new Error("Incorrect request for upload.");
            }
            
            var binaryStreamRequests = request.body;
            for (let binaryStreamRequest of binaryStreamRequests) {
                var res = await this.post(prepareUploadURL, binaryStreamRequest);

                //Collect successfull responses...
                if(res && res.response && res.response.status && res.response.status.toLowerCase() == "success") {
                    if(isEmpty(prepareUploadResponse)) {
                        prepareUploadResponse = res;
                    }
                    else {
                        if(!prepareUploadResponse.response.binaryStreamObjects) {
                            prepareUploadResponse.response.binaryStreamObjects = [];
                        }
                        
                        if(res.response.binaryStreamObjects && !isEmpty(res.response.binaryStreamObjects)) {
                            for(let binaryStreamObject of res.response.binaryStreamObjects) {
                                prepareUploadResponse.response.binaryStreamObjects.push(binaryStreamObject);
                            }
                        }
                    }
                } 
            }

            //console.log('prepare upload response: ', JSON.stringify(prepareUploadResponse, null, 2));
        }
        catch(err) {
            console.log('Failed to upload.\nError:', err.message, '\nStackTrace:', err.stack);

            if(prepareUploadResponse && prepareUploadResponse.response && prepareUploadResponse.response.status && prepareUploadResponse.response.status.toLowerCase() == "success")    {
                //As operation is sucessful for some of the files... ignore error
            }
            else {
                prepareUploadResponse = { 
                    "response": {
                    "status": "Error",
                    "statusDetail": {
                        "code": "RSUI0001",
                        "message": err.message,
                        "messageType": "Error"
                        }
                    }
                };
            }
        }
        finally {
        }

        return prepareUploadResponse;
    },
    prepareDownload: async function (request) {

        //console.log('prepare download request: ', request);
        var response = {};

        try {
            var prepareDownloadURL = 'binarystreamobjectservice/prepareDownload';
            var validationResult = this._validateRequest(request, 'download');
            if (!validationResult) {
                throw new Error("Incorrect request for download.");
            }
                
            response = await this.post(prepareDownloadURL, request.body);
            //console.log('prepare download response: ', JSON.stringify(response, null, 2));
        }
        catch(err) {
            console.log('Failed to upload.\nError:', err.message, '\nStackTrace:', err.stack);

            response = { 
                "response": {
                "status": "Error",
                "statusDetail": {
                    "code": "RSUI0001",
                    "message": err.message,
                    "messageType": "Error"
                    }
                }
            };
        }
        finally {
        }

        return response;
    },
    create: async function (request) {

        //console.log('create request: ', request);
        var response = {};

        try {
            var prepareUploadURL = 'binarystreamobjectservice/create';
            var validationResult = this._validateRequest(request, 'create');
            if (!validationResult) {
                throw new Error("Incorrect request for create.");
            }
            
            var binaryStreamRequests = request.body;
            for (let binaryStreamRequest of binaryStreamRequests) {
                var res = await this.post(prepareUploadURL, binaryStreamRequest);

                //Collect successfull responses...
                if(res && res.response && res.response.status && res.response.status.toLowerCase() == "success") {
                    response = res;
                } 
            }

            //console.log('create response: ', JSON.stringify(response, null, 2));
        }
        catch(err) {
            console.log('Failed to create binary stream object.\nError:', err.message, '\nStackTrace:', err.stack);

            if(response && response.response && response.response.status && response.response.status.toLowerCase() == "success") {
                //As operation is sucessful for some of the requests... ignore error
            }
            else {
                response = { 
                    "response": {
                    "status": "Error",
                    "statusDetail": {
                        "code": "RSUI0001",
                        "message": err.message,
                        "messageType": "Error"
                        }
                    }
                };
            }
        }
        finally {
        }

        return response;
    },
    _validateRequest: function (request, operation) {
        if (!request.body || isEmpty(request.body)) {
            return false;
        }

        if(operation == 'download') {
            var binaryStreamObject = request.body.binaryStreamObject;
            if (!binaryStreamObject || isEmpty(binaryStreamObject)) {
                return false;
            }

            if(!binaryStreamObject.id) {
                return false;
            }
        }

        return true;
    }
};

module.exports = BinaryStreamObjectService;