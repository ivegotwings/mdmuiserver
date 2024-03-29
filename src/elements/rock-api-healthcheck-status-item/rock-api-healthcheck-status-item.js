import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../liquid-rest/liquid-rest.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-flex-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-floating.js';
import '../bedrock-style-manager/styles/bedrock-style-gridsystem.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../pebble-dialog/pebble-dialog.js';
import '../pebble-icon/pebble-icon.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockApiHealthcheckStatusItem
  extends mixinBehaviors([
    RUFBehaviors.UIBehavior
  ], PolymerElement) {
  static get template() {
    return html`
      <style include="bedrock-style-common bedrock-style-gridsystem bedrock-style-scroll-bar bedrock-style-floating bedrock-style-icons bedrock-style-padding-margin bedrock-style-flex-layout">
         :host {
          margin-bottom: 5px;
          display: block;
          width: 100%;
        }
        .statusRow {
          cursor: pointer;
        }

        #descriptionRow {
          padding: 10px 10px 10px 20px;
          width: 100%;
          font-size: var(--default-font-size, 14px);
        }

        .descriptipn-title {
          vertical-align: text-top;
        }

        .status-title-wrap {
          background-color: var(--palette-pale-grey-four, #eff4f8);
        }

        .status-title {
          padding: 5px 0 5px 5px;
        }
        .healthcheck-dialog {
          height:75vh;
          overflow-y: auto;
          overflow-x:hidden;
        }
      </style>
    <div class="statusRow">
      <div class="status-title-wrap" on-click="_handleRowClick">        
          <div class="col-12">
            <div class="status-title">      
              <pebble-icon icon="pebble-icon:goveranance-success" id="statusIcon" class="pebble-icon-size-16"></pebble-icon>
              <span class="m-l-10 descriptipn-title">{{name}}</span>
              <div class="m-l-4 pull-right">
                <span class="descriptipn-title">{{timeTaken}} ms</span>
                <span class="flex"></span>
                <pebble-icon icon="pebble-icon:action-scope-take-selection" class="pebble-icon-size-16 pebble-status-desc-icon m-l-5" id="descriptionIcon"></pebble-icon>
              </div>
            </div>
          </div>        
      </div>
      <div id="descriptionRow" hidden\$="{{!collapse}}"> 
          <div><strong>Url: </strong>{{url}}</div>                  
          <div><strong>Message: </strong>{{message}}</div> 
          <pebble-button raised="" noink="" on-click="_handleModalOpen" class="btn btn-success m-t-15" button-text="View technical details"></pebble-button>
          <pebble-dialog id="pebbleDialog" show-close-icon="" show-ok="" button-ok-text="Ok" dialog-title="Technical detail" modal="">
            <div class="healthcheck-dialog">
                <pre>{{detail}}</pre>
            </div>
          </pebble-dialog>
      </div>      
    </div>
    <liquid-rest id="mycall" url="{{url}}" method="GET" request-data="{{request}}" on-response="_onResponseReceived" on-error="_onResponseFailed">
    </liquid-rest>
`;
  }

  static get is() { return 'rock-api-healthcheck-status-item' }
  static get properties() {
    return {
      name: {
        type: String
      },
      collapse: {
        type: Boolean,
        value: false

      },
      url: {
        name: {
          type: String
        }
      },
      message: {
        name: {
          type: String
        }
      },
      status: {
        type: String,
        value: "Unknown"
      },
      detail: {
        type: String,
        value: ""
      },
      timeTaken: {
        type: String,
        value: "-1"
      }
    }
  }

  ready () {
    super.ready();
    this.$.mycall.generateRequest();
  }
  _onResponseReceived (e) {
    let response = e.detail.response;

    if (response.status == "success") {
      this.$.statusIcon.icon = "pebble-icon:goveranance-success";
      this.$.statusIcon.classList.add('pebble-icon-color-success');
    }
    else if (response.status == "error") {
      this.$.statusIcon.icon = "pebble-icon:governance-failed";
      this.$.statusIcon.classList.add('pebble-icon-color-error');
    }
    else if (response.status == "warning") {
      this.$.statusIcon.icon = "pebble-icon:notification-error";
      this.$.statusIcon.classList.add('pebble-icon-color-warning');
    }

    this.status = response.status;
    this.message =response.msg;
    this.detail = JSON.stringify(response.detail, undefined, 2);
    this.timeTaken = response.detail && response.detail.stats && response.detail.stats.timeTaken ? response.detail.stats.timeTaken : "-1";
  }
  _onResponseFailed (event, response) {
    this.collapse = true;
    this.$.statusIcon.icon = "pebble-icon:governance-failed";
    this.$.statusIcon.classList.add('pebble-icon-color-error');
  }
  _handleRowClick () {
    this.collapse = !this.collapse;
    if (this.collapse) {
      this.$.descriptionIcon.icon = "pebble-icon:action-expand";
    } else {
      this.$.descriptionIcon.icon = "pebble-icon:action-less";
    }
  }
  _handleModalOpen () {
    this.$.pebbleDialog.open();
  }
}
customElements.define(RockApiHealthcheckStatusItem.is, RockApiHealthcheckStatusItem);
