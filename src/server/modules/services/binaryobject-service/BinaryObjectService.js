let DFRestService = require('../../common/df-rest-service/DFRestService'),
isEmpty = require('../../common/utils/isEmpty'),
mime = require('mime-types'),
uuidV1 = require('uuid/v1');

let BinaryObjectService = function (options) {
DFRestService.call(this, options);
};

BinaryObjectService.prototype = {
downloadBinaryObject: async function (request, response) {
    try {
        let URL = 'binaryobjectservice/getById';
        let parsedRequest = JSON.parse(request.body.data);

        let binaryObjectResponse = await this.post(URL, parsedRequest);
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
},
_downloadFileContent: function (binaryObjectResponse, parsedRequest, response) {
    if (binaryObjectResponse && binaryObjectResponse.binaryObjects && binaryObjectResponse.binaryObjects.length > 0) {
        let binaryObject = binaryObjectResponse.binaryObjects[0];
        //console.log('binary object retrived ', JSON.stringify(binaryObject));

        if (binaryObject) {
            let fileName = parsedRequest.fileName;
            let taskId = parsedRequest.params.query.id;
            let taskType = parsedRequest.taskType;
            let fileExtension = parsedRequest.fileExtension && parsedRequest.fileExtension.toLowerCase() != "n/a" ? parsedRequest.fileExtension : 'xlsm';

            //Get filename and file extension from binary object
            let areFileDetailsAvailableInBinaryObject = false;
            if (binaryObject.properties) {
                if(binaryObject.properties.fileName) {
                    fileName = binaryObject.properties.fileName;
                }

                if(binaryObject.properties.extension) {
                    areFileDetailsAvailableInBinaryObject = true;
                    fileExtension = binaryObject.properties.extension;

                    //Remove extension from fileName if exists...
                    let indexOfExtension = fileName.lastIndexOf("." + fileExtension);
                    if(indexOfExtension > 0) {
                        fileName = fileName.substr(0, indexOfExtension);
                    }
                }
            }

            if(!areFileDetailsAvailableInBinaryObject) {
                //File details are not available...
                //Try to get details from fileName of the parsedRequest object
                let indexOfExtension = fileName.lastIndexOf(".");

                if(indexOfExtension > 0) {
                    //This logic is buggy in case fileName having '.' without extension
                    //TODO:: how to validate? regex??
                    fileExtension = fileName.substr(indexOfExtension, fileName.length);
                    fileName = fileName.substr(0, indexOfExtension);
                } else {
                    //fileName is not having extension...
                    //Find out extension based on file type...
                    let fileType = parsedRequest.fileType;
                    if(fileType && fileType.toLowerCase() == 'rsjson') {
                        fileExtension = 'json';
                    }
                }
            }

            //Get content type based on extension
            let contentType = mime.lookup(fileExtension);

            //Identify object type...
            let objectType = 'binaryObject';
            if(taskType && taskType.toLowerCase().indexOf("system") >= 0) {
                objectType = 'dataObject';
            }

            let blob = (binaryObject.data && binaryObject.data.blob) ? binaryObject.data.blob : "";
            response.cookie('fileDownload', true, { path: "/", httpOnly: false });
            response.writeHead(200, {
                'Content-Type': contentType, 
                //fix for bug: 283435. Chrome browser has a problem with comma in file name in content-disposition.
                //Sending filename in "" will solve the issue though file name has invalid characters.
                'Content-disposition': 'attachment;filename="' + fileName + "." + fileExtension + '"'
            });

            let baseString = new Buffer(blob, 'base64');

            let utfString = baseString.toString('utf8');

            if (utfString) {
                try {
                    let jsonParsedResponse = JSON.parse(utfString);
                    if (jsonParsedResponse) {
                        let object = jsonParsedResponse[objectType];
                        if(object && object.data && object.data.blob) {
                            blob = object.data.blob;
                        }
                    }
                }
                catch (ex) {
                    console.log('Task '+taskId+ ' - Failed to parse response. Ignore this error as the response is already in blob format.');
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