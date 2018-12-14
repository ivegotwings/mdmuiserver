/**
`pebble-file-upload` Represents an element with drag and drop feature. It can upload any file. 
It takes additional data through properties. It is available in small, medium, and large sizes.

### Example
    <pebble-file-upload></pebble-file-upload>

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-progress/paper-progress.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-flex-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-heading.js';
import '../pebble-button/pebble-button.js';
import ContentTypeHelper from './content-type-helper.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleFileUpload extends mixinBehaviors([RUFBehaviors.UIBehavior], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-heading bedrock-style-icons bedrock-style-padding-margin bedrock-style-flex-layout">
            :host {
                display: block;
                margin: 0 24px;
                height: 100%;
                @apply --pebble-file-upload;
            }

            .drop-zone,
            .progress-zone {
                height: 100%;
                border: 2px dotted var(--pebble-file-upload-zone-border-color, #D3DAE1);
                @apply --layout-vertical;
                @apply --layout-center-center;
                @apply --pebble-file-upload-zone;
                @apply --drop-zone-height;
            }

            .drop-zone.active {
                border-color: var(--pebble-file-upload-zone-border-color-active, #ed204c);
            }

            #main {
                height: 100%;
                background-color: var(--table-row-odd-bg-color, #F9FBFD);
                color: var(--palette-dark, #1a2028);
            }

            #file {
                display: none;
            }

            .with-file {
                opacity: 0;
            }

            .without-file {
                opacity: 1;
            }

            #image-container {
                width: 60px;
                height: 50px;
            }

            #progress-container {
                width: 80%;
                height: 50px;
                margin-top: 3%;
                margin-bottom: 3%;
            }

            .progress-div {
                display: inline-flex;
                display: -webkit-inline-flex;
            }

            a:link {
                color: #0a82cc;
            }

            a:visited {
                color: #660099;
            }


            .title {
                font-size: var(--font-size-sm, 12px);
                text-align: center;
                color: var(--default-icon-color, #8994a0);
            }

            .drag-drop {
                font-size: var(--font-size-xl, 20px);
                font-weight: 500;
                color: var(--default-icon-color, #8994a0);
                line-height: 16px;
            }            
        </style>

        <div id="main" class="layout vertical">
            <section id="dropSection" hidden\$="[[hasFile]]" class\$="[[_dropSectionClass]]">
                <pebble-icon icon="pebble-icon:download-asset" class="download-icon pebble-icon-size-30 m-b-10"></pebble-icon>
                <h3 class="drag-drop m-0">Drag &amp; Drop files here</h3>
                <span class="title">or</span>
                <span class="title">
                    <a href="#" class="btn-link" on-tap="_selectFile">Upload files</a>
                </span>
                <input type="file" id="file" on-change="_manualSelected" multiple\$="[[multiple]]" accept\$="[[accept]]">
            </section>
            <section id="progressSection" class="progress-zone" hidden\$="[[!hasFile]]">
                <div class="progress-div">
                    <img alt="Product image." id="image-container" src="/src/images/MicrosoftExcel50,100,500px/MicrosoftExcel_100.svg">
                    <div id="progress-container">
                        {{file.name}}

                        <paper-progress value="{{progress}}" error="{{error}}"></paper-progress>
                        <template is="dom-if" if="[[!complete]]">
                            <span>Uploading</span>
                        </template>
                        <template is="dom-if" if="[[complete]]">
                            <template is="dom-if" if="[[error]]">
                                <span>Error occured</span>
                            </template>
                            <template is="dom-if" if="[[!error]]">
                                <span>uploaded</span>
                            </template>
                        </template>

                    </div>
                    <div>
                        <pebble-button class="iconButton" icon="pebble-icon:governance-failed" on-tap="_cancelUpload"></pebble-button>
                    </div>
                </div>
            </section>
        </div>
`;
  }

  static get is() {
      return "pebble-file-upload";
  }

  static get properties() {
      return {
          /**
           * Indicates the target url to upload the files to.
           * When the name is added in the URL, it is replaced with the file name.
           */
          target: {
              type: String,
              value: ''
          },

          /**
           * Specifies whther or not the file is draggable. Set it to <b>true</b> make the file draggable.
           */
          dragging: {
              type: Boolean,
              value: false,
              readOnly: true,
              notify: true
          },

          /**
           * Indicates the computed css class name for drop section.
           */
          _dropSectionClass: {
              type: String,
              computed: '_computeDropSectionClassName(dragging)'
          },

          /**
           * Indicates the set of comma-separated strings each of which is a valid MIME type
           * with no parameters.
           */
          accept: {
              type: String
          },

          /**
           * Indicates the name for the file data in the `formData` object.
           */
          fileDataName: {
              type: String,
              value: 'file'
          },

          /**
           *  Indicates the progress of file upload to the server.
           */
          progress: {
              type: Number
          },

          /**
           *  Specifies whether or not there is an error during during file upload. Set it to <b>true</b>
           *  to indicate error during file-upload.
           */
          error: {
              type: Boolean,
              value: false
          },

          /**
           *  Specifies whether or not the file upload is complete. Set it to <b>true</b> to indicate file upload is completed.
           */
          complete: {
              type: Boolean,
              value: false
          },

          /**
           *  Indicates the max size of file that can be uploaded. It must be in bytes. The default limit is set 100 MB.
           **/
          sizeLimit: {
              type: Number,
              value: 100000000
          },

          /**
           * Specifies whether or not to use xhr's `withCredentials` on upload.
           */
          withCredentials: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates the file objects that are dropped into an element.
           **/
          file: {
              type: Object,
              value: null,
              notify: true
          },

          /**
           * Specifies whether or not an element received the files. Set it to <b>true</b> to indicate
           * that file is recieved.
           **/
          hasFile: {
              type: Boolean,
              value: false,
              computed: '_computeHasFile(file)'
          },

          /**
           * Indicates a key value map of header names and values.
           */
          headers: {
              type: Object,
              value: {}
          },

          allowedFileTypes: {
              type: Array,
              value: function () { return []; },
              observer: "_allowedFileTypesChanged"
          }
      };
  }

  connectedCallback() {
      super.connectedCallback();

      this.addEventListener("dragenter", this._onDragEnter);
      this.addEventListener("dragleave", this._onDragLeave);
      this.addEventListener("dragover", this._onDragOver);
      this.addEventListener("drop", this._onDrop);
  }

  disconnectedCallback() {
      super.disconnectedCallback();

      this.removeEventListener("dragenter", this._onDragEnter);
      this.removeEventListener("dragleave", this._onDragLeave);
      this.removeEventListener("dragover", this._onDragOver);
      this.removeEventListener("drop", this._onDrop);
  }

  /**
   * Can be used as a handler to set dragging.
  */
  _setDragging(dragging) {
      this.dragging = dragging;
  }

  /**
   *  Can be used as a handler for opening a file selector.
   */
  _selectFile(e) {
      e.preventDefault();
      this.$.file.click();
  }

  /**
   *  Can be used as a handler for drag-enter event.
   */
  _onDragEnter(e) {
      e.stopPropagation();
      e.preventDefault();
      this._setDragging(true);
  }

  /**
   *  Can be used as a handler for drag-leave event.
   */
  _onDragLeave(e) {
      e.stopPropagation();
      e.preventDefault();
      this._setDragging(false);
  }

  /**
   *  Can be used as a handler for drag-over event.
   */
  _onDragOver(e) {
      e.stopPropagation();
      e.preventDefault();
      this._setDragging(true);
  }

  /**
   *  Can be used as a handler for drop event.
   */
  _onDrop(event) {
      this._setDragging(false);
      event.stopPropagation();
      event.preventDefault();


      // Check if multiple upload is allowed
      if (this.file) {
          return;
      }

      let file = event.dataTransfer.files[0];

      // Check if filetype is accepted
      let isFileValid = this._validateFile(file);
      if (!isFileValid) {
          return;
      }

      this.set('error', false);
      this.set('complete', false);
      this.set('progress', 0);
      this.set('file', file);
      this._uploadFile(file);
  }

  /**
   * Fired when the user manually selects the file instead of drag and drop.
   */
  _manualSelected() {
      let input = this.$.file;

      if (!input.files.length) {
          this.set('file', undefined);
      } else {
          let file = input.files[0];
          let isFileValid = this._validateFile(file);
          if (isFileValid) {
              this.progress = 0;
              this.error = false;
              this.complete = false;
              this._uploadFile(file);
              this.set('file', file);
          } else {
              return;
          }
      }
  }

  _validateFile(file) {
      let mimeType = !_.isEmpty(file.type) ? file.type : null;
      let fileType = file.name.match(/\.[^\.]*$/)[0];
      let accept = this.accept ? this.accept.toLowerCase() : "";

      if (mimeType) {
          mimeType = mimeType.toLowerCase();
      }

      if (accept !== "" && !((accept.indexOf(mimeType) > -1) || (accept.indexOf(fileType) > -1))) {
          if (file.size > this.sizeLimit) {
              this.logError("The size of the file exceeded the maximum limit");
              this.showWarningToast("The size of the file exceeded the maximum limit");
              return false;
          }
          let type = mimeType ? mimeType : fileType;
          let message = this._buildMessage(type);
          this.logError(message);
          this.showWarningToast(message);
          return false;
      }
      return true;
  }

  _buildMessage(type) {
      let message = "The file type " + type + " is not a valid extension.";
      let allowedExtensions = undefined;
      let allowedFileTypes = this.allowedFileTypes;
      if (_.isEmpty(allowedFileTypes)) {
          let accept = this.accept.replace(/ /g, '');
          let fileTypes = accept.split(",");
          allowedFileTypes = ContentTypeHelper.getExtensions(fileTypes);
      }
      if (!_.isEmpty(allowedFileTypes)) {
          for (let i = 0; i < allowedFileTypes.length; i++) {
              let extension = allowedFileTypes[i];
              if (allowedExtensions) {
                  allowedExtensions = allowedExtensions + "," + extension;
              } else {
                  allowedExtensions = extension;
              }
          }
      }
      if (allowedExtensions) {
          message = message + " Valid extensions are " + allowedExtensions + ".";
      }
      return message;
  }

  /**
   *  Can be used to upload the file to the server.
   * @param file
   * @private
   */
  _uploadFile(file) {
      if (!file) {
          return;
      }
      let self = this;

      if (!_.isEmpty(this.target)) {
          let formData = new FormData();

          // Add additional data to send with the POST variable
          let addData = this.additional;
          for (let key in addData) {
              if (addData.hasOwnProperty(key)) {
                  formData.append(key, addData[key]);
              }
          }

          // Add the file data last to support POSTing to Amazon Web Services S3.
          formData.append(this.fileDataName, file, file.name);
          let xhr = file.xhr = new XMLHttpRequest();
          xhr.withCredentials = this.withCredentials;
          xhr.upload.onprogress = function (e) {
              let done = e.loaded, total = e.total;
              self.set('progress', Math.floor((done / total) * 1000) / 10);
          };

          let url = this.target.replace('<name>', file.name);
          xhr.open('POST', url, true);
          for (let key in this.headers) {
              if (this.headers.hasOwnProperty(key)) {
                  xhr.setRequestHeader(key, this.headers[key]);
              }
          }

          xhr.responseType = 'json';
          xhr.onload = function (e) {
              if (xhr.status >= 200 && xhr.status < 300) {
                  let actualFileName = file.name;
                  if (xhr.response && xhr.response.fileName) {
                      actualFileName = xhr.response.fileName;
                  }
                  let eventData = {
                      "originalFileName": file.name,
                      "fileName": actualFileName
                  };
                  self.fireBedrockEvent("pebble-file-upload-success", eventData);
                  self.set('complete', true);
                  self.set('progress', 100);
              } else {
                  let erroredEventData = {
                      "error": xhr.response
                  };
                  self.fireBedrockEvent("pebble-file-upload-success", erroredEventData);
                  self.set('error', true);
                  self.set('complete', true);
                  self.set('progress', 100);
              }
          };
          xhr.send(formData);
      } else {
          let successEventData = {
              "originalFileName": file.name,
              "fileName": file.name,
              "file": file

          };
          self.fireBedrockEvent("pebble-file-upload-success", successEventData);
          self.set('complete', true);
          self.set('progress', 100);
      }

  }

  /**
   *  Can be used to cancel an uploaded file.
   * @param e
   * @private
   */
  _cancelUpload(e) {
      e.preventDefault();
      if (this.file.xhr) {
          this.file.xhr.abort();
      }
      this.file = undefined;
      this.$.file.value = null;
      this.set('error', false);
      this.set('complete', false);
      this.set('progress', 0);
  }

  /**
   * Can be used to compute the class name for dragging section.
   */
  _computeDropSectionClassName(dragging) {
      let cls = 'drop-zone';
      if (dragging) {
          cls += ' active';
      }
      return cls;
  }

  /**
   *  Can be used to compute if an element received the file.
   */
  _computeHasFile(file) {
      return !!file;
  }

  /**
   * Can be used to reset the state of the element to the default view.
   */
  reset() {
      if (this.file.xhr) {
          this.file.xhr.abort();
      }
      this.file = null;
      this.$.file.value = null;
      this.set('error', false);
      this.set('complete', false);
      this.set('progress', 0);
  }

  _allowedFileTypesChanged(allowedFileTypes) {
      if (!_.isEmpty(allowedFileTypes)) {
          this.accept = ContentTypeHelper.getContentTypes(allowedFileTypes);
      }
  }
}
customElements.define(PebbleFileUpload.is, PebbleFileUpload);
