import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-list.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-tooltip.js';
import '../bedrock-style-manager/styles/bedrock-style-gridsystem.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../bedrock-toast-behavior/bedrock-toast-behavior.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import '../pebble-dialog/pebble-dialog.js';
import '../pebble-spinner/pebble-spinner.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockMultipleFileDownload
    extends mixinBehaviors([
        RUFBehaviors.ComponentConfigBehavior,
        RUFBehaviors.LoggerBehavior
    ], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-gridsystem bedrock-style-tooltip bedrock-style-grid-layout bedrock-style-padding-margin bedrock-style-list">
            .attribute-value {
                font-size: var(--font-size-sm, 12px);
                font-weight: var(--font-medium, 500);
                color: var(--buttontext-color, #616161);
                width: 75%;
            }
            .multipleFileDownload-list-wrapper{
                height:50vh;
            }
            .multipleFileDownload-list{
                padding: 3px 0px;
            }
            li{
                list-style-type: decimal;
            }
            .not-allowed {
                cursor: not-allowed;
            }
            .overflow-auto {
                overflow: auto;
            }
        </style>
        <div class="tooltip-bottom" data-tooltip\$="[[_getMultipleFileDownloadLinkLabel()]]">
            <div class="attribute-value text-ellipsis">
                <a href="#" class="btn-link" on-tap="_onMultipleFileDownloadLinkClick">[[_getMultipleFileDownloadLinkLabel()]]</a>
            </div>
        </div>
        <pebble-dialog id="multipleFileDownload" dialog-title="{{_getMultipleFileDownloadDialogTitle()}}" show-close-icon="" alert-box="" modal="">             
           <div class="multipleFileDownload-list-wrapper">
            <ul class="button-siblings overflow-auto p-l-15">                                   
                <template is="dom-repeat" items="[[fileDetails.fileName]]" as="item">
                    <li class="tooltip-bottom multipleFileDownload-list" data-tooltip\$="[[item]]">
                        <div class="btn-link text-ellipsis" file-name\$="[[item]]" file-id\$="[[_getFileId(index)]]" on-tap="_onSelectedFileDownloadClick">[[item]]</div>
                    </li>
                </template>                                    
            </ul>
            <div class="buttons">
                <pebble-button id="close" class="close btn btn-secondary m-r-5" button-text="Close" on-tap="_onCloseMultipleFileDownloadDialog"></pebble-button>
                <span class\$="[[_getDownloadAllClass(maxFilesCountForDownloadAll)]]" data-tooltip\$="[[_getDownloadAllTooltip(maxFilesCountForDownloadAll)]]">
                    <pebble-button class="apply btn btn-success" disabled="[[_isMultipleDownloadAllFilesDisabled(maxFilesCountForDownloadAll)]]" on-tap="_onDownloadAll" button-text="Download All"></pebble-button>
                </span>
            </div>
            </div>
            <pebble-spinner active="[[_downloadInProgress]]"></pebble-spinner>
        </pebble-dialog>
`;
  }

  static get is() { return 'rock-multiple-file-download' }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
              return {};
              }
          },                
          config: {
              type: Object,
              value: function () { return {}; }
          },
          fileDetails: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          profileName:{
              type: String,
              value: ""
          },
          downloadFromBlobStorage: {
              type: Boolean,
              value: false
          },
          maxFilesCountForDownloadAll: {
              type: Number,
              value: 10 
          },
          _downloadInProgress: {
              type: Boolean,
              value: false
          }
      }
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }
  connectedCallback() {
      super.connectedCallback();
      this.fileDownloadManager = FileDownloadManager.getInstance();
      this.requestConfig('rock-multiple-file-download', this.contextData);
  }

  /**
   * Function to read the config info
   */
  onConfigLoaded(componentConfig) {
      if (!componentConfig || !componentConfig.config) {
          this.logError("Component configuration is missing, contact administrator.");          
          return;
      } else {
          if(componentConfig.config.properties.maxFilesCountForDownloadAll) {
              this.maxFilesCountForDownloadAll = componentConfig.config.properties.maxFilesCountForDownloadAll;
          }
      }       
  }

  /**
   * Function to get the no. of files are available for download
   */
  _getTotalDownloadableFiles(){
      if(this.fileDetails && this.fileDetails.fileName && this.fileDetails.fileName.length > 0){
          return this.fileDetails.fileName.length;
      }
      return 0;
  }

  /**
   * Function to open the multiple-file-download dialog
   */
  _onMultipleFileDownloadLinkClick() {
      this.multipleFileDownloadDialog = this.shadowRoot.querySelector("#multipleFileDownload");
      if(this.multipleFileDownloadDialog) {
          this.multipleFileDownloadDialog.open();
      }
  }

  /**
   * Function to get the multiple-file-download link label
   */
  _getMultipleFileDownloadLinkLabel(){
      return this._getTotalDownloadableFiles() + " files exported";
  }

  /**
   * Function to get the multiple-file-download dialog title
   */
  _getMultipleFileDownloadDialogTitle(){
      let profileName = "";
      if(this.profileName && this.profileName!= "N/A"){
          profileName = this.profileName + " >> ";
      }
      return "Exported files >> " + profileName  + this._getTotalDownloadableFiles() + " files";
  }

  /**
   * Function to close the multiple-file-download dialog
   */
  _onCloseMultipleFileDownloadDialog() {
      this.multipleFileDownloadDialog = this.shadowRoot.querySelector("#multipleFileDownload");
      if(this.multipleFileDownloadDialog) {
          this.multipleFileDownloadDialog.close();
      }
  }

  /**
   * Function to check if downloadAll button inside multiple-file-download dialog should be disabled or not
   */
  _isMultipleDownloadAllFilesDisabled(maxFilesCountForDownloadAll) {
      let totalFileToDownload = this._getTotalDownloadableFiles();
      let downloadAllDisabled = false;
      if(totalFileToDownload > maxFilesCountForDownloadAll) {
          downloadAllDisabled = true;
      }
      return downloadAllDisabled;
  }

  /**
  * Function to get the fileId of the given index to be displayed in the multiple-file-download dialog
  */
  _getFileId(index){
      if(this.fileDetails && this.fileDetails.fileId && this.fileDetails.fileId instanceof Array) {
          return this.fileDetails.fileId[index];
      }
  }

  /**
   * Function to get styles for downloadAll button inside multiple-file-download dialog
   */
  _getDownloadAllClass(maxFilesCountForDownloadAll){
      if(this._isMultipleDownloadAllFilesDisabled(maxFilesCountForDownloadAll)){
          return "tooltip-top not-allowed";
      }
      return "tooltip-top";
  }

  /**
   * Function to get tooltip for downloadAll button inside multiple-file-download dialog
   */
  _getDownloadAllTooltip(maxFilesCountForDownloadAll){
      if(this._isMultipleDownloadAllFilesDisabled(maxFilesCountForDownloadAll)){
          return "Too many files to download at once, use individual links";
      }
      return "Download All";
  }

  /**
   * Function to handle click on the specific file in the multiple-file-download dialog
   */
  _onSelectedFileDownloadClick(e){
      this._downloadInProgress = true;
      let fileDetails = {};
      if(e && e.currentTarget) {
          fileDetails.fileId = e.currentTarget.getAttribute("file-id");
          fileDetails.fileName = e.currentTarget.getAttribute("file-name");
      }
      if(this.fileDetails) {
          fileDetails.fileType = this.fileDetails.fileType;
          fileDetails.fileExtension = this.fileDetails.fileExtension;
          fileDetails.taskType = this.fileDetails.taskType;
      }            
      
      this.fileDownloadManager.downloadFile(fileDetails,this.downloadFromBlobStorage,this);
      
  }

  /**
   * Function to handle downloadAll button click on the multiple-file-download dialog
   */
  _onDownloadAll() { 
      this._downloadInProgress = true;
      let fileItem = {};
      if(this.fileDetails.fileName instanceof Array) {
          fileItem.fileType = this.fileDetails.fileType;
          fileItem.fileExtension = this.fileDetails.fileExtension;
          fileItem.taskType = this.fileDetails.taskType;
          for(let i=0;i<this.fileDetails.fileName.length;i++){
              fileItem.fileId = this.fileDetails.fileId[i];
              fileItem.fileName = this.fileDetails.fileName[i];
              this.fileDownloadManager.downloadFile(fileItem,this.downloadFromBlobStorage,this);
          }                    
      }          
  }

  /**
   * Function to handle the file download success 
   */
  onFileDownloadSuccess(){
      this._downloadInProgress = false;
  }

  /**
   * Function to handle the file download failure 
   */
  onFileDownloadFailure(e){
      this.showErrorToast("Failed to download file, contact administrator.");
      this.logError("Failed to download file.", e.detail || "");
      this._downloadInProgress = false;
  }
}
customElements.define(RockMultipleFileDownload.is, RockMultipleFileDownload)
