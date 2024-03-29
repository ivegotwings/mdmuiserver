/**
<b><i>Content development is under progress... </b></i>

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../liquid-rest/liquid-rest.js';
import '../pebble-file-upload/pebble-file-upload.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-button/pebble-button.js';
import '../pebble-popover/pebble-popover.js';
import '../bedrock-helpers/data-helper.js';
import '../rock-value-mappings-lov/rock-value-mappings-lov.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockValueMappingsManage
        extends mixinBehaviors([
            RUFBehaviors.UIBehavior,
            RUFBehaviors.ComponentContextBehavior
        ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-padding-margin">
            .placeHolder {
                width: 70%;
                margin: 0 auto;
                padding: 30px;
                box-shadow: 0 0 10px 0 var(--cloudy-blue-color, #c1cad4);
                position: relative;
            }

            .message-info {
                font-size: var(--font-size-sm, 12px);
                margin-left: 16%;
            }

            pebble-file-upload {
                width: 100%;
                margin: 0;
                --pebble-file-upload-zone: {
                    height: 150px;
                }
            }

            .value-mappings-title {
                font-size: var( --default-font-size, 14px);
                font-weight: var(--font-bold, bold);
                color: var(--palette-dark, #1a2028);
                margin: 0 0 10px;
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <div id="content-entity-import">
            <div hidden\$="!_isMessageAvailable(_message)" class="message-info">[[_message]]</div>
            <div class="placeHolder">
                <p class="value-mappings-title">Download existing Value Mappings</p>
                <pebble-button id="actions" class="dropdownText btn btn-secondary m-r-5" button-text="{{_mainTitle}}" noink="" dropdown-icon="" on-tap="_onActionsTap"></pebble-button>
                <pebble-popover id="actionsPopover" for="actions" no-overlap="" horizontal-align="left">
                    <rock-value-mappings-lov multi-select="{{_multiSelect}}" domain="[[domain]]" id="valueMappingsLov"></rock-value-mappings-lov>
                </pebble-popover>
                <bedrock-pubsub event-name="value-mappings-selection-changed" handler="_onValueMappingsChange" target-id="valueMappingsLov"></bedrock-pubsub>
                <pebble-button id="downloadButton" class="apply btn btn-success m-l-5" button-text="Download" noink="" elevation="2" on-tap="_onDownloadTap"></pebble-button>
                <!-- screen for import -->
                <div class="value-mappings-export m-t-25">
                    <p class="value-mappings-title">Drag and drop to upload Value Mappings file or Select</p>
                    <pebble-file-upload id="fileUpload" allowed-file-types="[[allowedFileTypes]]"></pebble-file-upload>
                    <bedrock-pubsub event-name="pebble-file-upload-success" handler="_onFileUploadSuccess" target-id="fileUpload"></bedrock-pubsub>
                </div>
            </div>
        </div>
`;
  }

  static get is() {
      return 'rock-value-mappings-manage';
  }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _fileName: {
              type: String
          },

          _loading: {
              type: Boolean,
              value: false
          },

          _isDirty: {
              type: Boolean,
              value: false
          },

          _workAutomationId: {
              type: String
          },

          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          skipNext: {
              type: Boolean,
              value: false
          },

          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          businessFunctionData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          allowedFileTypes: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _fileDetails: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          copContext: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          domain: {
              type: String,
              value: null
          },

          _multiSelect: {
              type: Boolean,
              value: false
          },

          _mainTitle: {
              type: String,
              value: "Select Value Mapping"
          },

          _valueMappingsType: {
              type: String,
              value: null
          },

          _message: {
              type: String,
              value: ""
          }
      }
  }

  static get observers() {
      return [

      ]
  }



  _onActionsTap(e) {
      this.shadowRoot.querySelector('#actionsPopover').show();
  }

  _onValueMappingsChange(e, detail, sender) {
      this._valueMappingsType = detail.data.id;
      this._mainTitle = detail.data.title || detail.data.id;

      let popover = this.shadowRoot.querySelector("#actionsPopover");
      if (popover) {
          popover.hide();
      }
  }

  _onDownloadTap() {
      if (!this._valueMappingsType) {
          this.showWarningToast("Select value mappings type.");
          return;
      }

      if (_.isEmpty(this.copContext)) {
          this.showWarningToast("COP context missing in the configuration.");
          return;
      }

      let copContext = DataHelper.cloneObject(this.copContext);
      copContext.service = copContext.service.export;
      copContext.channel = 'UI';
      let message = "Downloading " + this._valueMappingsType + " started.";
      this._setMsgAndSpinner(message, true);

      let req = {
          "clientState": {
              "notificationInfo": {
                  "userId": DataHelper.getUserId()
              }
          },
          fileName: 'ValueMappingsData',
          "params": {
              "fields": {
                  "attributes": ["_ALL"],
                  "relationships": ["_ALL"]
              },
              "rsconnect": {
                  "includeValidationData": true,
                  "profilecontexts": [copContext]
              },
              query: {
                  "filters": {
                      "typesCriterion": [
                          this._valueMappingsType
                      ]
                  }
              }
          }
      };

      if (DataHelper.isHotlineModeEnabled()) {
          req.hotline = true;
      }
      let _this = this;
      RUFUtilities.fileDownload("/data/cop/downloadDataExcel", {
          httpMethod: 'POST',
          data: {
              data: JSON.stringify(req)
          },
          fileName: 'ValueMappingsData',
          successCallback: function (url) {
              this._setMsgAndSpinner("", false);
          }.bind(_this),
          failCallback: function (responseHtml, url, error) {
              this._setMsgAndSpinner("", false);
              this.logError(
                  "Failed to download value mappings template.", error);
          }.bind(_this)
      });
  }

  _isMessageAvailable(message) {
      return !!message;
  }
  _setMsgAndSpinner(msg, loading) {
      this._message = msg;
      this._loading = loading;
  }
  _onFileUploadSuccess(e, detail, sender) {
      this._isDirty = true;
      this._loading = true;
      this.set("_fileName", detail.originalFileName);

      let fileDetails = {
          "file": detail.file,
          "fileName": detail.fileName,
          "originalFileName": detail.originalFileName
      };

      this.set("_fileDetails", fileDetails);

      let url = "/data/cop/process";

      this._generateCopRequest(url, this._fileDetails);

      this.async(function () {
          //Clear file upload
          this.$$('pebble-file-upload').reset();
      });
  }
  _generateCopRequest(url, fileDetails) {
      let formData = new FormData();
      formData.append("file", fileDetails.file);
      formData.append("fileName", fileDetails.fileName);

      let hotline = false;
      if (DataHelper.isHotlineModeEnabled()) {
          hotline = true;
      }

      let copContext = DataHelper.cloneObject(this.copContext);
      copContext.service = copContext.service.import;
      let req = DataRequestHelper.createImportRequest(fileDetails, copContext, hotline);
      this._workAutomationId = DataHelper.generateUUID();
      req.dataObject.properties.workAutomationId = this._workAutomationId;

      formData.append("requestData", JSON.stringify(req));

      let xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.responseType = 'json';
      xhr.onload = function (e) {
          //Process triggred in async manner, so track the details through workAutomationId
          return;
      }.bind(this);
      xhr.send(formData);
      //After sending the form data show workAutomationId to user
      this._onCOPProcessComplete();
  }

  _onCOPProcessComplete() {
      let data = {
          "messages": [{
              "message": "Value Mappings will be created/updated using the uploaded file."
          },
          {
              "message": "You can view the status of the task " + this._workAutomationId +
                  " in the Task Details"
          }
          ],
          "actions": [{
              "name": "closeFunction",
              "text": "Take Me back to Where I started",
              "action": {
                  "name": "refresh-data"
              }
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
      ComponentHelper.getParentElement(this).businessFunctionData = data;
      let eventName = "onSave";
      let eventDetail = {
          name: eventName,
          data: {
              "skipNext": this.skipNext
          }
      };
      this._loading = false;
      this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true
      });
  }
}

customElements.define(RockValueMappingsManage.is, RockValueMappingsManage);
