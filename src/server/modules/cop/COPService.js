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
        var copRequest = this._prepareCOPRequestForTransform(request);
        //console.log('copRequest: ', JSON.stringify(copRequest, null, 2));
        return await this.post(copURL, copRequest);
    },
    _prepareCOPRequestForTransform: function(request) {
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
                    "profileName": "ExcelToRdpMapping.profile"
                },
                "data": {
                    "blob": ""
                }
            }
        };
        
        var fileName = request.body.fileName;
        copRequest.dataObject.id = uuidV1();
        copRequest.dataObject.properties.filename = fileName;
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
    }
};

module.exports = COPService;

