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
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/data-helper.js';
import '../liquid-rest/liquid-rest.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockModelDownload
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior
    ], PolymerElement) {
  static get template() {
    return Polymer.html`
        <liquid-rest id="copDownloadService" url="/data/cop/downloadModelJob" method="POST" on-liquid-response="_onAsyncDownloadSuccess" on-liquid-error="_onAsyncDownloadFailure"></liquid-rest>
`;
  }

  static get is() { return 'rock-model-download' }

  static get properties() {
      return {
          /**
           * <b><i>Content development is under progress... </b></i> 
           */
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          enableAsyncDownload: {
              type: Boolean,
              value: true
          }
      }
  }
  onDownload(profile, filename, domain) {
      let req = this._prepareRequest(profile, filename, domain);
      if (req) {
          if (this.enableAsyncDownload) {
              let downloadLiq = this.shadowRoot.querySelector("#copDownloadService");
              if (downloadLiq) {
                  downloadLiq.requestData = req;
                  downloadLiq.generateRequest();
              }
          } else {
              let _this = this;
              RUFUtilities.fileDownload("/data/cop/downloadModelExcel", {
                  httpMethod: 'POST',
                  data: {
                      data: JSON.stringify(req)
                  },
                  fileName: filename,
                  successCallback: function (url) {
                      this._onSyncDownloadSuccess();
                  }.bind(_this),
                  failCallback: function (responseHtml, url, error) {
                      this._onSyncDownloadFailure(error);
                  }.bind(_this)
              });
          }
      }
  }

  _prepareRequest(profile, filename, domain) {
      if (!domain) {
          domain = "";
      }
      let profiles = [];
      profiles.push(profile);
      let req = {
          "params": {
              "fields": {
                  "attributes": [
                      "_ALL"
                  ]
              },
              "rsconnect": {
                  "domain": domain,
                  "includeValidationData": true,
                  "profiles": profiles
              }
          },
          "fileName": filename
      };

      if (this.enableAsyncDownload) {
          let user = "";
          let userContext = ContextHelper.getFirstUserContext(this.contextData);
          if (userContext) {
              user = userContext.user;
          }
          req["clientState"] = {
              "notificationInfo": {
                  "userId": user
              }
          }
      }

      return req;
  }

  _onSyncDownloadSuccess() {
      this.fireBedrockEvent("onDownloadSuccess", "Success", {
          ignoreId: true
      });
  }

  _onSyncDownloadFailure(e) {
      let response = "";
      if (e && e.detail && e.detail.response) {
          response = e.detail.response;
      }
      this._triggerErrorToast(response);
  }

  _onAsyncDownloadSuccess(e, detail) {
      if (DataHelper.isValidObjectPath(detail, "response.dataObjectOperationResponse.dataObjects.0.properties.workAutomationId") &&
          detail.response.dataObjectOperationResponse.status == "success") {
          let eventDetails = {
              "status": "success",
              "workAutomationId": detail.response.dataObjectOperationResponse.dataObjects[0].properties.workAutomationId
          }
          this.fireBedrockEvent("onDownloadSuccess", eventDetails, {
              ignoreId: true
          });
          return;
      }
      this._triggerErrorToast(detail.response);
  }

  _onAsyncDownloadFailure(e, detail) {
      let response = "";
      if (detail && detail.response) {
          response = detail.response;
      }
      this._triggerErrorToast(response);
  }

  _triggerErrorToast(response) {
      this.logError(
          "Unable to download the data model. Check the service or contact your administrator.", response);
  }
}
customElements.define(RockModelDownload.is, RockModelDownload)
