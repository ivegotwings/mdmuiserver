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
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-toast-behavior/bedrock-toast-behavior.js';
import '../liquid-rest/liquid-rest.js';
import '../pebble-file-upload/pebble-file-upload.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockModelImport
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior,
        RUFBehaviors.ToastBehavior
    ], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-grid-layout bedrock-style-padding-margin">
            .placeHolder {
                width: calc(100% - 10px);
                height: 100%;
                margin: 0 auto;
                box-shadow: 0 0 10px 0 var(--cloudy-blue-color, #c1cad4);
                position: relative;
                padding-top: 20px;
                padding-bottom: 20px;
                @apply --placeholder;
            }

            :host {
                display: block;
                height: 100%;

            }

            .model-import-wrapper {
                height: 100%;
                padding: 10px 0px;
            }

            .title {
                font-size: var(--default-font-size, 14px);
                text-align: center;
                color: var(--palette-steel-grey, #75808b);
            }
        </style>
        <div class="model-import-wrapper">
            <div class="placeHolder p-10 base-grid-structure">
                <div class="base-grid-structure-child-1">
                    <!-- <p class="title"></p> -->
                    <!--a href="#" class="btn-link" on-tap="_selectFile">Download</a> a system template or just upload an existing data file
            
            <!-- screen for import -->
                </div>
                <div class="base-grid-structure-child-2">
                    <div class="pebble-file-upload-wrapper full-height">
                        <pebble-file-upload id="fileUpload" allowed-file-types="[[allowedFileTypes]]"></pebble-file-upload>
                    </div>
                </div>
                <bedrock-pubsub event-name="pebble-file-upload-success" handler="_onFileUploadSuccess" target-id="fileUpload"></bedrock-pubsub>
            </div>
        </div>
`;
  }

  static get is() { return 'rock-model-import' }

  static get properties() {
      return {
          _copProcessModelRequest: {
              type: Object,
              value: function () { return {}; }
          },
          _fileName: {
              type: String
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
          copContext: {
              type: Object,
              value: function () { return {}; }
          },
          _workAutomationId: {
              type: String
          }
      }
  }

  _onFileUploadSuccess(e, detail, sender) {

      let fileName = detail.fileName;
      this.set("_fileName", detail.originalFileName);

      let formData = new FormData();
      formData.append("file", detail.file);
      formData.append("fileName", fileName);

      let fileDetails = {
          "file": detail.file,
          "fileName": detail.fileName,
          "originalFileName": detail.originalFileName
      };

      let req = DataRequestHelper.createImportRequest(fileDetails, this.copContext);
      this._workAutomationId = DataHelper.generateUUID();
      req.dataObject.properties.workAutomationId = this._workAutomationId;
      let clientState = {};
      clientState.notificationInfo = {};
      clientState.notificationInfo.showNotificationToUser = true;
      clientState.notificationInfo.userId = DataHelper.getUserId();
      let currentActiveApp = ComponentHelper.getCurrentActiveApp();
      if (currentActiveApp) {
          clientState.notificationInfo.appInstanceId = currentActiveApp.id;
      }
      req["clientState"] = clientState;

      formData.append("requestData", JSON.stringify(req));

      let xhr = new XMLHttpRequest();
      xhr.open('POST', '/data/cop/processmodel', true);
      xhr.responseType = 'json';
      xhr.onload = function (e) {
          if (e.currentTarget && e.currentTarget.response) {
              let response = e.currentTarget.response;
              e.detail = {
                  "response": response
              }
              if ((response.response && response.response.status == "success") ||
                  (response.dataObjectOperationResponse && response.dataObjectOperationResponse.status == "success")) {
                  this._onProcessModelSuccess(e);
              } else {
                  this._onProcessModelFailure(e);
              }

          }
      }.bind(this);
      xhr.send(formData);

      let liqTransform = this.shadowRoot.querySelector("#copProcessModel");
      if (liqTransform) {
          liqTransform.generateRequest();
      }
  }
  _onProcessModelSuccess(e) {                
      let response = e.detail.response;
      if (response && response.dataObjectOperationResponse && response.dataObjectOperationResponse.status.toLowerCase() == "success") {
          // go to next step in wizard
          let data = {
              "messages": [
                  {
                      "message": "The Data Model has been uploaded and will be processed by the system"
                  },
                  {
                      "message": "You can view the status of the processing in the Data Model Dashboard"
                  }
              ],
              "actions": [
                  {
                      "name": "closeFunction",
                      "text": "Take me back to where I started",
                      "action": { "name": "refresh-data" }
                  },
                  {
                      "name": "gotoTaskDetails",
                      "text": "Show me the task details",
                      "dataRoute": "task-detail",
                      "queryParams": {
                          "id": this._workAutomationId
                      }
                  }
              ]
          };
          this.businessFunctionData = data;
          let eventName = "onNext";
          let eventDetail = {
              name: eventName
          };
          setTimeout(() => {
              this.fireBedrockEvent(eventName, eventDetail, {
                  ignoreId: true
              });
          }, 1000);
      } else {
          this._onProcessModelFailure(e);
      }
  }
  _onProcessModelFailure(e) {
      this.showErrorToast("Unable to process the data model. Check the service or contact your administrator.");
      this.logError("Unable to process the data model. Check the service or contact your administrator.", e.detai);
  }
}
customElements.define(RockModelImport.is, RockModelImport)
