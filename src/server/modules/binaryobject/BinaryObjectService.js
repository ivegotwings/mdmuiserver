var DFRestService = require('../common/df-rest-service/DFRestService'),
    isEmpty = require('../common/utils/isEmpty'),
    mime = require('mime-types'),
    uuidV1 = require('uuid/v1');

var BinaryObjectService = function (options) {
    DFRestService.call(this, options);
};

BinaryObjectService.prototype = {
    downloadBinaryObject: async function (request, response) {
        try {
            var URL = 'binaryobjectservice/getById';
            var parsedRequest = JSON.parse(request.body.data);

            var binaryObjectResponse = await this.post(URL, parsedRequest);
            if (binaryObjectResponse && binaryObjectResponse.response) {
                this._downloadFileContent(binaryObjectResponse.response, parsedRequest, response);
            }
            else {
                console.log('no binary object response found!!');
            }
        }
        catch (err) {
            console.log('Failed to get task details.\nError:', err.message, '\nStackTrace:', err.stack);
        }
        finally {
        }
    },
    _downloadFileContent: function (binaryObjectResponse, parsedRequest, response) {
        if (binaryObjectResponse && binaryObjectResponse.binaryObjects && binaryObjectResponse.binaryObjects.length > 0) {
            var binaryObject = binaryObjectResponse.binaryObjects[0];
            //console.log('binary object retrived ', JSON.stringify(binaryObject));

            if (binaryObject) {
                var fileName = parsedRequest.fileName;
                var taskType = parsedRequest.taskType;
                var fileExtension = 'xlsm';
                
                //Get filename and file extension from binary object
                if (binaryObject.properties) {
                    if(binaryObject.properties.fileName) {
                        fileName = binaryObject.properties.fileName;
                    }

                    if(binaryObject.properties.extension) {
                        fileExtension = binaryObject.properties.extension;
                    }
                }

                //Get content type based on extension
                var contentType = mime.lookup(fileExtension);

                //Identify object type...
                var objectType = 'binaryObject';
                if(taskType && taskType.toLowerCase().indexOf("system") >= 0) {
                    objectType = 'dataObject';
                }

                var blob = (binaryObject.data && binaryObject.data.blob) ? binaryObject.data.blob : "";
                response.cookie('fileDownload', true, { path: "/", httpOnly: false });
                response.writeHead(200, {
                    'Content-Type': contentType, 
                    'Content-disposition': 'attachment;filename=' + fileName + "." + fileExtension
                });

                var baseString = new Buffer(blob, 'base64');

                var utfString = baseString.toString('utf8');

                if (utfString) {
                    try {
                        var jsonParsedResponse = JSON.parse(utfString);
                        if (jsonParsedResponse) {
                            var object = jsonParsedResponse[objectType];
                            if(object && object.data && object.data.blob) {
                                blob = object.data.blob;
                            }
                        }
                    }
                    catch (e) {
                    }
                }

                response.end(new Buffer(blob, 'base64'));
            }
        } else {
            response.status(500).send('binaryObjects not found in response of download service.!')
        }
    }
};

module.exports = BinaryObjectService;