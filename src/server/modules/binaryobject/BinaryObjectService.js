var DFRestService = require('../common/df-rest-service/DFRestService'),
    isEmpty = require('../common/utils/isEmpty'),
    uuidV1 = require('uuid/v1');

var BinaryObjectService = function (options) {
    DFRestService.call(this, options);
};

BinaryObjectService.prototype = {
    downloadBinaryObject: async function (request, response) {
            var URL = 'binaryobjectservice/getById';
            var parsedRequest = JSON.parse(request.body.data);
            var fileName = parsedRequest.fileName;
            
            var binaryObjectResponse = await this.post(URL, parsedRequest);
            if (binaryObjectResponse && binaryObjectResponse.response) {
                this._downloadFileContent(binaryObjectResponse.response, fileName, response);
            }
            
    },
    _downloadFileContent: function (binaryObjectResponse, fileName, response) {
        if (binaryObjectResponse && binaryObjectResponse.binaryObjects && binaryObjectResponse.binaryObjects.length > 0) {
            var binaryObject = binaryObjectResponse.binaryObjects[0];
            if (binaryObject) {
                var blob = (binaryObject.data && binaryObject.data.blob) ? binaryObject.data.blob : "";
                response.cookie('fileDownload',true, { path: "/", httpOnly: false });
                response.writeHead(200, {
                    'Content-Type': 'vnd.ms-excel', //ToDo: need to use different mime types based on file extensions
                    'Content-disposition': 'attachment;filename=' + fileName
                });
                
                response.end(new Buffer(blob, 'base64'));
            }
        } else {
            response.status(500).send('binaryObjects not found in response of download service.!')
        }

    }
};

module.exports = BinaryObjectService;