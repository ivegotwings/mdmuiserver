import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/liquid-response-helper.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../liquid-rest/liquid-rest.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class FileDownloadManager
                
    extends mixinBehaviors([
        RUFBehaviors.LoggerBehavior
    ], PolymerElement) {

    static get is() {
        return "file-download-manager";
    }

    constructor() {
        super();
        this.requestData;
        this.parentObj;
        if (!RUFUtilities.fileDownloadManager) {
            RUFUtilities.fileDownloadManager = this;
        }
        return RUFUtilities.fileDownloadManager;
    }
    
    /**
     * Function to get the FileDownloadManager instance 
     */ 
    static getInstance() {
        if (!RUFUtilities.fileDownloadManager) {
            RUFUtilities.fileDownloadManager = new FileDownloadManager();;
        }
        return RUFUtilities.fileDownloadManager;
    } 

    /**
     * Function to download a file 
     */ 
    downloadFile(fileDetails,downloadFromBlobStorage,parentObj,isSeedDataStreamType){
        this.parentObj = {};
        if(parentObj) {
            this.parentObj = parentObj;
        }
        if(!fileDetails) {
            this.logError('No File to download');
            return;
        }
        const {
            fileId,
            fileName,
            fileType,
            fileExtension,
            taskType
        } = fileDetails;

        if (!downloadFromBlobStorage) {
            let req = {
                "params": {
                    "query": {
                        "id": fileId
                    }
                },
                fileName,
                fileType,
                fileExtension,
                taskType
            }

            let _this = this;
            RUFUtilities.fileDownload("/data/binaryobjectservice/downloadBinaryObject", {
                httpMethod: 'POST',
                data: {
                    data: JSON.stringify(req)
                },
                fileName: fileName,
                successCallback: function (url) {
                    this._onSuccess();                                     
                }.bind(_this),
                failCallback: function (responseHtml, url, error) {
                    this._onError(error);
                }.bind(_this)
            });
        } else {
            this._downloadFileFromBlobStorage(fileId,isSeedDataStreamType);
        }
    }
    
    /**
     * Function to trigger a request to download large file 
     */ 
     _downloadFileFromBlobStorage(fileId,isSeedDataStreamType){
        this.requestData = {};
        let binaryStreamObjects = [];
        let type = "importDataStream";

        if(isSeedDataStreamType){
            type = "seedDataStream";
        }
        if (fileId) {
            binaryStreamObjects.push({
                "binaryStreamObject": {
                    "id": fileId,
                    "type": type,
                    "data": {}
                }
            })
        }
       
        if (!_.isEmpty(binaryStreamObjects)) {
            this.requestData = binaryStreamObjects;
            this._generateRequest();                              
        } else {
            this._onError("No binaryStreamObjects found");
        }
    }
    
    /**
     * Function to handle file download error
     */ 
    _onError(ev){
        let detail = "";
        if(ev){
            if(ev.detail) {
                detail = ev.detail;
            } else {
                detail = ev;
            }
        }
        this.logError('File download failed', detail);
        if(this.parentObj && this.parentObj.onFileDownloadFailure) {
            this.parentObj.onFileDownloadFailure(ev);
        }
    }
    
    /**
     * Function to handle file download success
     */ 
    _onSuccess(){
        if(this.parentObj && this.parentObj.onFileDownloadSuccess) {
            this.parentObj.onFileDownloadSuccess(); 
        }
    }
    
    /**
     * Function to generate a request for a liquid call to download a large file in new window
     */ 
    _generateRequest() {
        let liquidRestCustomElement = customElements.get("liquid-rest");
        let liquidObj = new liquidRestCustomElement();
        liquidObj.url = "/data/binarystreamobjectservice/prepareDownload";
        liquidObj.method = "POST";

        let _onResponse = (e) => {
            if (DataHelper.isValidObjectPath(e, "detail.response.response")) {
                LiquidResponseHelper.downloadURLResponseMapper(e, downloadURL => {
                    window.open(downloadURL, "_blank");
                });
                this._onSuccess();
            } else {
                this._onError("Null response");
            }               
        };

        liquidObj.addEventListener("response", _onResponse.bind(this));
        liquidObj.addEventListener("error", this._onError.bind(this));
        liquidObj.requestId = "";

        liquidObj.requestData = this.requestData;
        liquidObj.generateRequest();
    }
}
customElements.define(FileDownloadManager.is, FileDownloadManager);
export default FileDownloadManager