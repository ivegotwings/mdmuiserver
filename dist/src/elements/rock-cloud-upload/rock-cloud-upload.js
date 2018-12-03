/**
<b><i>Content development is under progress... </b></i>

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/entity-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-gridsystem.js';
import '../liquid-rest/liquid-rest.js';
import '../pebble-bulk-file-upload/pebble-bulk-file-upload.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-spinner/pebble-spinner.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockCloudUpload
        extends mixinBehaviors([
            RUFBehaviors.UIBehavior
        ], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-gridsystem">

            :host{
                height:100%;
                display:block;
            }
            .content-upload-wrapper{
                height:100%;
                padding:10px 0px;
            }
            .placeHolder {
                width: 70%;
                margin: 0 auto;
                padding: 30px;
                box-shadow: 0 0 10px 0 var(--cloudy-blue-color, #c1cad4);
                position: relative;
            }
        </style>

        <pebble-spinner active="[[_loading]]"></pebble-spinner>

        <liquid-rest id="prepareUploadLiquid" url="/data/binarystreamobjectservice/prepareUpload" method="POST" on-liquid-response="_onPrepareUploadLiquidSuccess" on-liquid-error="_onPrepareUploadLiquidFailure"></liquid-rest>
        <liquid-rest id="notifyTenantSeedDeploy" url="/pass-through-deploytenantseed/adminservice/deploytenantseed" method="POST" on-liquid-response="_onDeployTenantSeedLiquidSuccess" on-liquid-error="_onDeployTenantSeedLiquidFailure"></liquid-rest>
        <liquid-rest id="createUploadedFilesLiquid" url="/data/binarystreamobjectservice/create" method="POST" request-data="{{_createUploadedFilesRequest}}" on-liquid-response="_onCreateUploadedFilesLiquidSuccess" on-liquid-error="_onCreateUploadedFilesLiquidFailure"></liquid-rest>

        <div id="content-upload" class="content-upload-wrapper">
            <div class="placeHolder">
                <pebble-bulk-file-upload method="PUT" accept="" no-auto="true" s3-upload="true" max-file-size="[[maxFileSize]]" max-files="[[maxFiles]]"></pebble-bulk-file-upload>
                <bedrock-pubsub event-name="pebble-bulk-file-upload-started" handler="_onUploadStarted"></bedrock-pubsub>
                <bedrock-pubsub event-name="pebble-bulk-file-upload-success" handler="_onUploadSuccess"></bedrock-pubsub>
                <bedrock-pubsub event-name="pebble-bulk-file-upload-failed" handler="_onUploadFailed"></bedrock-pubsub>
            </div>
        </div>
`;
  }

  static get is() { return 'rock-cloud-upload' }
  static get properties() {
      return {
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          target: {
              type: String,
              value: ''
          },
          _createUploadedFilesRequest: {
              type: Object,
              value: function () { return {}; }
          },
          _loading: {
              type: Boolean,
              value: false
          },
          /**
           * Indicates an array of files that are either processed or uploaded.
           **/
          files: {
              type: Array,
              notify: true,
              value: function () {
                  return [];
              }
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          businessFunctionData: {
              type: Object,
              value: function () { return {}; }
          },
          allowedFileTypes: {
              type: Array,
              value: function () { return []; }
          },
          maxFileSize: {
              type: Number,
              value: 5000000000
          },
          maxFiles: {
              type: Number,
              value: 350
          },
          dataRoute: {
              type: String,
              value: null
          },
          uploadRequest: {
              type: Object,
              value: function () { return {}; }
          },
          s3ObjectKey: {
              type: String,
              value: ""
          }
      }
  }

  get prepareUploadLiquid() {
      this._prepareUploadLiquid = this._prepareUploadLiquid || this.shadowRoot.querySelector("#prepareUploadLiquid");
      return this._prepareUploadLiquid;
  }

  get bulkEditUploadElement() {
      this._bulkEditUploadElement = this._bulkEditUploadElement || this.shadowRoot.querySelector('pebble-bulk-file-upload');
      return this._bulkEditUploadElement;
  }

  _onUploadStarted (e, uploadedFiles, sender) {
      let prepareUploadRequest = [];
      this.files = [];

      Object.keys(uploadedFiles).forEach(key => {
          let file = uploadedFiles[key]
          if (!file.error) {
              this.files.push(file);

              //Generate unique file name...
              this.s3ObjectKey = this._generateS3ObjectKey(file.name);
              file.s3ObjectKey = this.s3ObjectKey;

              //Allowed types check
              if(this.allowedFileTypes && this.allowedFileTypes.length) {
                  if(!ValidationHelper.fileExtensionValidator(file.name, this.allowedFileTypes)) {
                      this.showWarningToast("The uploaded file's type is not valid. Valid extensions are " + this.allowedFileTypes.join(", "));
                      this._resetUploadElement();
                      return;
                  }
              }

              let originalFileName = file.name;
              //Request type
              let type = this.uploadRequest && this.uploadRequest.type ? this.uploadRequest.type : "binarystreamobject";
              let binaryStreamObject = {
                  "binaryStreamObject": {
                      "id": DataHelper.generateUUID(),
                      "type": type,
                      "properties": {
                          "objectKey": this.s3ObjectKey,
                          "originalFileName": originalFileName
                      },
                      "data": {}
                  }
              };

              //Apply cop-context details to request properties
              if(this.uploadRequest && !_.isEmpty(this.uploadRequest["cop-context"])) {
                  let properties = binaryStreamObject.binaryStreamObject.properties;
                  for(let contextKey in this.uploadRequest["cop-context"]) {
                      properties[contextKey] = this.uploadRequest["cop-context"][contextKey];
                  }
              }

              prepareUploadRequest.push(binaryStreamObject);
          }
      });

      if(prepareUploadRequest.length > 0) {
          let liq = this.prepareUploadLiquid;
          if (liq) {
              liq.requestData = prepareUploadRequest;
              liq.generateRequest();
          }
      }
  }

  _resetUploadElement () {
      this._isDirty = false;
      this._loading = false;
      this.bulkEditUploadElement.reset();
  }

  _onPrepareUploadLiquidSuccess (e) {
      let response = e.detail.response;
      let canUpload = false;

      if (response && response.response) {
          let binarystreamobjects = response.response.binaryStreamObjects;
          if (binarystreamobjects) {
              for (let binarystreamobject of binarystreamobjects) {
                  let headersObj = {};
                  let data = binarystreamobject.data;

                  if (data && data.properties && data.properties.uploadURL && data.properties.uploadURL.length > 0) {
                      if(data.properties.headers && data.properties.headers.length > 0){
                          let headers = data.properties.headers;
                          for (let i = 0; i < headers.length; i++) {
                              headersObj = Object.assign(headersObj, headers[i]);
                          }
                      }
                      for (let file of this.files) {
                          if (file.s3ObjectKey == data.properties.objectKey) {
                              file.uploadTarget = data.properties.uploadURL;
                              file.headers = headersObj;
                              canUpload = true;
                              break;
                          }
                      }
                  }
              }
          }
      }

      if (canUpload) {
          this.bulkEditUploadElement.uploadFiles(this.files);
      }
      else {
          this.logError("Unable to upload.", e.detail);
          this._resetUploadElement();
      }
  }
  _onPrepareUploadLiquidFailure (e) {
      this.logError("Unable to upload.", e.detail);
      this._resetUploadElement();
  }
  _onUploadSuccess (e, succeededFilesData, sender) {
      //Make a liquid call for deploying tenant seed data
      if(this.uploadRequest && this.uploadRequest.type == "seedDataStream"){
          let deployTenantSeedRequestObject = {
              "adminObject":
              {
                  "id": DataHelper.generateUUID(),
                  "type": "adminObject",
                  "properties": {
                      "storageType": "stream",
                      "objectKey": this.s3ObjectKey,
                      "tenantId": DataHelper.getTenantId()
                  }
              }
          }
          
          let liq = this.shadowRoot.querySelector("#notifyTenantSeedDeploy");
          if (liq) {
              liq.requestData = deployTenantSeedRequestObject;
              liq.generateRequest();
          }
          
      } else {
          this._triggerFinishStep();
      }
      
  }

  _onDeployTenantSeedLiquidSuccess(e){
      let response = e.detail.response;
      if (response && response.response && response.response.status == "success") {
          this._triggerFinishStep();
      } else {
          this.showErrorToast("Unable to upload. Contact Administrator");
          this.logError("Unable to deploy tenant seed.", e.detail);
          this._resetUploadElement();
      }
  }

  _onDeployTenantSeedLiquidFailure(e){
      this.showErrorToast("Unable to upload. Contact Administrator");
      this.logError("Unable to upload.", e.detail);
      this._resetUploadElement();
  }

  _triggerFinishStep (){
      this._isDirty = true;
      this._loading = true;

      let data = {
          "messages": [
              {
                  "message": "File upload is in process."
              },
              {
                  "message": "You can view the status of the processing in the File Upload Status Dashboard"
              }
          ],
          "actions": [
              {
                  "name": "closeFunction",
                  "text": "Take Me back to Where I started"
              },
              {
                  "name": "nextAction",
                  "text": "Take me to User Dashboard",
                  "dataRoute": "dashboard"
              },
              {
                  "name": "nextAction",
                  "text": "Upload more files",
                  "dataRoute": this.dataRoute
              }
          ]
      };
      this.businessFunctionData = data;
      let eventName = "onSave";
      let eventDetail = {
          name: eventName,
          data: { "skipNext": false }
      };
      setTimeout(() => {
          this._loading = false;
          this.fireBedrockEvent(eventName, eventDetail, {
              ignoreId: true
          });
      }, 5000);
  }
  _onUploadFailed (e, errorMessage, sender) {
      this.logError(errorMessage);
  }
  _onCreateUploadedFilesLiquidFailure (e) {
      this.logError("Unable to upload.", e.detail);
      this._resetUploadElement();
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  getIsDirty () {
      return this._isDirty;
  }
  _generateS3ObjectKey (fileName) {
      let s3ObjectKey;
      let indexOfExtension = fileName.lastIndexOf(".");
      let fileNameText = fileName.substr(0, indexOfExtension);
      let fileExt = fileName.substr(indexOfExtension, fileName.length);

      let uuid = DataHelper.generateUUID();
      s3ObjectKey = uuid + fileExt;
      return s3ObjectKey;
  }
  _generateCreateRequest (succeededFilesData) {
      let createRequest = [];
      for (let fileData of succeededFilesData) {
          let uuid = DataHelper.generateUUID();
          let s3ObjectKey = fileData.fileName;

          let fileObject = undefined;
          for (let file of this.files) {
              if (file.s3ObjectKey == s3ObjectKey) {
                  fileObject = file;
                  break;
              }
          }

          let originalFileName = s3ObjectKey;
          let fullObjectPath = s3ObjectKey;

          if (fileObject) {
              originalFileName = fileObject.name;
              fullObjectPath = fileObject.fullObjectPath;
          }


          let binaryStreamObject = {
              "binaryStreamObject": {
                  "id": uuid,
                  "type": "binarystreamobject",
                  "properties": {
                      "objectKey": s3ObjectKey,
                      "fullObjectPath": fullObjectPath,
                      "originalFileName": originalFileName
                  }
              }
          };

          createRequest.push(binaryStreamObject);
      }

      return createRequest;
  }
  _showView (viewName) {
      if (viewName) {
          let contentView = this.shadowRoot.querySelector("#content-" + viewName);
          if (contentView) {
              contentView.removeAttribute("hidden");
          }
      }
  }
}
customElements.define(RockCloudUpload.is, RockCloudUpload);
