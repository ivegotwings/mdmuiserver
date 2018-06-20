var DFRestService = require('../../common/df-rest-service/DFRestService'),
    isEmpty = require('../../common/utils/isEmpty'),
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
                var areFileDetailsAvailableInBinaryObject = false;
                if (binaryObject.properties) {
                    if(binaryObject.properties.fileName) {
                        fileName = binaryObject.properties.fileName;
                    }

                    if(binaryObject.properties.extension) {
                        areFileDetailsAvailableInBinaryObject = true;
                        fileExtension = binaryObject.properties.extension;

                        //Remove extension from fileName if exists...
                        var indexOfExtension = fileName.lastIndexOf("." + fileExtension);
                        if(indexOfExtension > 0) {
                            fileName = fileName.substr(0, indexOfExtension);
                        }
                    }
                }

                if(!areFileDetailsAvailableInBinaryObject) {
                    //File details are not available...
                    //Try to get details from fileName of the parsedRequest object
                    var indexOfExtension = fileName.lastIndexOf(".");

                    if(indexOfExtension > 0) {
                        //This logic is buggy in case fileName having '.' without extension
                        //TODO:: how to validate? regex??
                        fileExtension = fileName.substr(indexOfExtension, fileName.length);
                        fileName = fileName.substr(0, indexOfExtension);
                    } else {
                        //fileName is not having extension...
                        //Find out extension based on file type...
                        var fileType = parsedRequest.fileType;
                        if(fileType && fileType.toLowerCase() == 'rsjson') {
                            fileExtension = 'json';
                        } else {
                            //Set default extension
                            fileExtension = 'xlsm';
                        }
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
                    //fix for bug: 283435. Chrome browser has a problem with comma in file name in content-disposition.
                    //Sending filename in "" will solve the issue though file name has invalid characters.
                    'Content-disposition': 'attachment;filename="' + fileName + "." + fileExtension + '"'
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