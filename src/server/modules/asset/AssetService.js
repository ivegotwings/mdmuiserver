var DFRestService = require('../common/df-rest-service/DFRestService'),
    isEmpty = require('../common/utils/isEmpty'),
    uuidV1 = require('uuid/v1'),
    fs = require('fs');

var AssetService = function (options) {
    options.serverType = "cop";
    DFRestService.call(this, options);
};

AssetService.prototype = {
    upload: async function (request) {

        //console.log('Assets upload request: ', request);
        var response = {};

        try {
            var assetUploadURL = "assetservice/uploadasset";
            var validationResult = this._validateRequest(request);
            if (!validationResult) {
                throw new Error("Incorrect request for asset upload.");
            }

            var responseArray = response
            var filesData = request.body.filesData;
            var profileName = request.body.profileName;

            //Iterate through each file and make asset upload call and collect response...
            for (let file of filesData) {
                var fileName = file.fileName;
                var originalFileName = file.originalFileName;
                var assetRequest = this._prepareAssetRequestForUpload(fileName, originalFileName, profileName);
                //console.log('Single asset upload request: ', JSON.stringify(assetRequest, null, 2));
                var uploadRes = await this.post(assetUploadURL, assetRequest);   //TODO: Collect all asset upload responses and send final complete response array

                if(uploadRes && uploadRes.response && uploadRes.response.status && uploadRes.response.status.toLowerCase() == "success") {
                    response = uploadRes;
                }
            }
        }
        catch(err) {
            console.log('Failed to upload.\nError:', err.message, '\nStackTrace:', err.stack);

            if(response && response.response && response.response.status && response.response.status.toLowerCase() == "success")    {
                //Ignore error... as Upload operation is async operation and assets upload is happening one by one
                //some of the assets upload requests are successful. So we cannot failed entire operation.
                //Hence we need to send upload operation as successful.
                //Failed requests should be displayed in the job details.
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
    _validateRequest: function (request) {
        if (!request.body) {
            return false;
        }
        if (!request.body.filesData) {
            return false;
        }
        if(isEmpty(request.body.filesData)) {
            return false;
        }
        if(!request.body.profileName) {
            return false;
        }

        return true;
    },
    _prepareAssetRequestForUpload: function(fileName, originalFileName, profileName) {
        var assetRequest = {
            "dataObject": {
                "id": "",
                "type": "image",
                "properties": {
                    "createdByService": "user interface",
                    "createdBy": "user",
                    "createdDate": "2016-07-16T18:33:52.412-07:00",
                    "filename": "",
                    "encoding": "Base64",
                    "profileId": "d75a63f9-ed4f-4b6e-9973-8743396b61c0",
                    "profileName": "",
                    "type": "image"
                },
                "data": {
                    "blob": ""
                }
            }
        };

        assetRequest.dataObject.id = uuidV1();
        assetRequest.dataObject.properties.filename = originalFileName;
        assetRequest.dataObject.properties.profileName = profileName;
        assetRequest.dataObject.data.blob = this._getFileContent(fileName);
        return assetRequest;
    },
     _getFileContent: function (fileName) {
        var binaryData = "";
        try {
            binaryData = fs.readFileSync('./upload/' + fileName);
        } catch (ex) {
            console.log('error while reading file: ', ex);
        }

        //console.log('binaryData ', binaryData);
        return new Buffer(binaryData).toString('base64');
    }
};

module.exports = AssetService;