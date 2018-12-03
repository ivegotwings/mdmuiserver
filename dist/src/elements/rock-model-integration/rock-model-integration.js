import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../bedrock-business-function-behavior/bedrock-business-function-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-tooltip.js';
import '../bedrock-style-manager/styles/bedrock-style-gridsystem.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../bedrock-toast-behavior/bedrock-toast-behavior.js';
import '../liquid-config-get/liquid-config-get.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-actions/pebble-actions.js';
import '../pebble-dialog/pebble-dialog.js';
import '../pebble-dropdown/pebble-dropdown.js';
import '../rock-layout/rock-layout.js';
import '../rock-model-download/rock-model-download.js';
import '../rock-wizard/rock-wizard.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockModelIntegration
  extends mixinBehaviors([
    RUFBehaviors.AppBehavior,
    RUFBehaviors.BusinessFunctionBehavior,
    RUFBehaviors.ComponentConfigBehavior,
    RUFBehaviors.ToastBehavior,
    RUFBehaviors.LoggerBehavior
  ], PolymerElement) {
  static get template() {
    return Polymer.html`
    <style include="bedrock-style-common bedrock-style-gridsystem bedrock-style-tooltip bedrock-style-grid-layout">
      :host {
        display: block;
        height: 100%;
      }

      .downloadButton {
        float: right;
        margin-bottom: 10px;
      }

      rock-wizard {
        --stepper: {
          margin: 0 !important;
          padding: 0 !important;
        }
      }
      .domainDropdown-wrap{
        align-items: center;
      }
    </style>
    <div class="base-grid-structure">
      <div class="base-grid-structure-child-1">
        <div class="row-wrap domainDropdown-wrap">
          <div class="col-4">
            <template is="dom-if" if="[[showDomain]]">
              <pebble-dropdown id="domainDropdown" class="dropdown" label="Domain" items="[[domains]]" selected-value="{{selectedDomain}}"></pebble-dropdown>
            </template>
          </div>
          <div class="col-8">
            <pebble-button class="btn dropdown-success downloadButton tooltip-bottom" icon="pebble-icon:download-asset" button-text="Download" data-tooltip="Download Model" on-click="_onModelDownloadClick"></pebble-button>
            <rock-model-download id="modelDownload" context-data="[[contextData]]" enable-async-download="[[enableAsyncDownload]]"></rock-model-download>
          </div>
        </div>
      </div>
      <div class="base-grid-structure-child-2">
        <rock-wizard id="rockwizard" config="{{wizardConfig}}" shared-data="[[sharedData]]" hide-stepper="true"></rock-wizard>
      </div>
    </div>
    <pebble-dialog id="downloadTaskDialog" dialog-title="Download" modal="" alert-box="" show-cancel="" show-ok="" no-cancel-on-outside-click="" no-cancel-on-esc-key="" button-ok-text="Show me the task details">
      <p>Download process is started, you can review the progress of the task [[_downloadTaskId]] in task details</p>
    </pebble-dialog>
    <bedrock-pubsub event-name="on-buttonok-clicked" handler="_onShowTaskDetailsTap" target-id="downloadTaskDialog"></bedrock-pubsub>
    <bedrock-pubsub event-name="onNext" handler="_onModelUploadSuccess"></bedrock-pubsub>
    <bedrock-pubsub event-name="onDownloadSuccess" handler="_onModelDownloadSuccess"></bedrock-pubsub>
    <liquid-rest id="liquidGetDomains" url="/data/pass-through/entitymodelservice/get" method="POST" on-liquid-response="_onDomainsReceived" on-liquid-error="_onDomiansGetFailed"></liquid-rest>
`;
  }

  static get is() { return 'rock-model-integration' }

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
      entityType: {
        type: String,
        value: null
      },
      appName: {
        type: String,
        value: "rock-model-integration"
      },
      channel: {
        type: String,
        value: ""
      },
      profiles: {
        type: String,
        value: ""
      },
      showDomain: {
        type: Boolean,
        value: false
      },
      domains: {
        type: Array,
        value: []
      },
      selectedDomain: {
        type: String,
        value: ""
      },
      fileName: {
        type: String,
        value: ""
      },
      modelDomain: {
        type: String
      },
      _downloadTaskId: {
        type: String,
        value: ""
      },
      enableAsyncDownload: {
        type: Boolean,
        value: true
      }
    }
  }

  constructor() {
    super();
    this.entityType = DataHelper.getParamValue('type');

    if (this.entityType) {
      let itemContext = {
        'type': this.entityType
      };

      this.contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
    }

    let userContext = {
      "roles": this.roles,
      "user": this.userId,
      "tenant": this.tenantId,
      "defaultRole": this.defaultRole
    };

    this.contextData[ContextHelper.CONTEXT_TYPE_USER] = [userContext];
    let valueContext = DataHelper.getDefaultValContext();
    if (valueContext) {
      this.contextData[ContextHelper.CONTEXT_TYPE_VALUE] = [valueContext];
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  connectedCallback() {
    super.connectedCallback();

    timeOut.after(100).run(() => {
      let pebbleDropDown = this.shadowRoot.querySelector("#domainDropdown");
      if (pebbleDropDown) {
        pebbleDropDown.addEventListener('change', this._onDropdownChange.bind(this));
      }
    });
    //Setting context information to loading component
    if (_.isEmpty(this.sharedData) || _.isEmpty(this.sharedData["context-data"])) {
      this.sharedData = { "context-data": this.contextData };
    }

    this._searchTimeStamp = new Date().toLocaleString();
    this.requestConfig(this.name, this.contextData);

    //Fetch the available domains 
    if (this.showDomain) {
      this.getDomains();
    }
  }


  _onDropdownChange(e, detail) {
    let selectedDomain = e.detail.newValue;
    this.selectedDomain = selectedDomain.replace("_domain", "");
  }
  /**
  * Function to read the config info
  */
  onConfigLoaded(componentConfig) {
    if (!componentConfig || !componentConfig.config) {
      this.logError("Component configuration is missing, contact administrator.");
      this._onCancel();
      return;
    }

    let downloadConfig = componentConfig.config.download;
    if (downloadConfig && typeof downloadConfig.enableAsyncDownload === "boolean") {
      this.enableAsyncDownload = downloadConfig.enableAsyncDownload;
    }

    let config = componentConfig.config.upload;
    //Update the channel for the model to be uploaded
    if (config.steps) {
      config.steps = DataHelper.convertObjectToArray(config.steps);
      config.steps[0].component.properties["cop-context"].channel = this.channel;
    }
    this.set('config', config); //set the configuration
  }

  /**
  * Function to generate a request for fetching available domains 
  */
  getDomains() {
    let req = {
      "params": {
        "query": {
          "filters": {
            "typesCriterion": ["domain"]
          }
        },
        "fields": {
          "properties": ["_ALL"]
        }
      }
    };

    let domainsGet = this.shadowRoot.querySelector("#liquidGetDomains");
    if (domainsGet) {
      domainsGet.requestData = req;
      domainsGet.generateRequest();
    }

  }

  /**
  * Function to handle liquidGetDomains call success
  * Populating the received domains in the dropdown
  */
  _onDomainsReceived(e) {
    if (e.detail && e.detail.response && e.detail.response.response) {
      let response = e.detail.response.response;
      let domainList = response.entityModels;
      let domains = [];
      for (let i = 0; i < domainList.length; i++) {
        let item = {};
        item.title = domainList[i].properties.externalName;
        item.value = domainList[i].id;
        //item.id = domainList[i].name;
        domains.push(item);
      }
      this.set('domains', domains);
    }
  }

  /**
  * Function to handle liquidGetDomains call failure 
  */
  _onDomiansGetFailed(e) {
    this.logError("Unable to perform the action now. Contact administrator.", e.detail);
  }

  /**
  * Function to handle successful model upload 
  */
  _onModelUploadSuccess() {
    this.showSuccessToast("File uploaded successfully");
    this.fireBedrockEvent("onRefreshWidget", "", { ignoreId: true });              
  }

  /**
  * Function to handle download model button click
  */
  _onModelDownloadClick(e, detail) {

    let modelDomain;
    if (this.showDomain) {
      modelDomain = this.selectedDomain;
    }
    else {
      modelDomain = this.modelDomain;
    }
    this.$.modelDownload.onDownload(this.profiles, this.fileName, modelDomain);
  }

  /**
  * Function to handle successful model download 
  */
  _onModelDownloadSuccess(e, detail) {
    if (this.enableAsyncDownload) {
      this._downloadTaskId = detail.workAutomationId;
      if (this.$.downloadTaskDialog) {
        this.$.downloadTaskDialog.open();
      }
    } else {
      this.showSuccessToast("Data Model downloaded successfully");
    }
  }

  _onShowTaskDetailsTap() {
    let mainApp = RUFUtilities.mainApp;
    if (mainApp && this._downloadTaskId) {
      let queryParams = {
        "id": this._downloadTaskId
      }
      ComponentHelper.setQueryParamsWithoutEncode(queryParams);
      mainApp.changePageRoutePath("task-detail");
    }
  }
}
customElements.define(RockModelIntegration.is, RockModelIntegration)
