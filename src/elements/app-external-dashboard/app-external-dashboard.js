import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../pebble-iframe/pebble-iframe.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import '../rock-layout/rock-layout.js';
import '../rock-layout/rock-titlebar/rock-titlebar.js';
import '../pebble-spinner/pebble-spinner.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class AppExternalDashboard extends mixinBehaviors([RUFBehaviors.AppBehavior, RUFBehaviors.ComponentConfigBehavior, RUFBehaviors.LoggerBehavior], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common">
            rock-layout {
                --rock-footer-background-color: #f5f7f9;
            }
            pebble-iframe{
                    overflow:auto;
                    @apply --app-external-dashboard-content-height;
            }            
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <rock-layout>
            <rock-titlebar slot="rock-titlebar" icon="[[appConfig.icon]]" main-title="[[appConfig.title]]">
            </rock-titlebar>
            <template is="dom-if" if="[[!_loading]]">
                <pebble-iframe source="[[embedUrl]]"></pebble-iframe>
            </template>
        </rock-layout>
`;
  }

  static get is () {
      return "app-external-dashboard";
  }
  static get properties () {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          appConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          dashboardName: {
              type: String,
              value: ""
          },
          dashboardConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _loading: {
              type: Boolean,
              value: true
          }
      };
  }

  disconnectedCallback () {
      super.disconnectedCallback();
  }
  connectedCallback () {
      super.connectedCallback();
      let userContext = {
          "roles": this.roles,
          "user": this.userId,
          "ownershipData": this.ownershipData,
          "tenant": this.tenantId,
          "defaultRole": this.defaultRole
      };

      this.contextData[ContextHelper.CONTEXT_TYPE_USER] = [userContext];

      this.dashboardName = this.appConfig && this.appConfig.data_route;
      if (this.dashboardName) {
          this.contextData[ContextHelper.CONTEXT_TYPE_APP] = [{
              "app": this.dashboardName
          }];

          this.requestConfig("rock-" + this.dashboardName, this.contextData);
      } else {
          this.logError("Dashboard name not found.");
      }
  }
  onConfigLoaded (componentConfig) {
      if (componentConfig && componentConfig.config) {
          this.set("dashboardConfig", componentConfig.config);
          if (this.dashboardConfig.url.indexOf("[[WEB-URL]]") !== -1) {
              let originUrl = window.location.origin + this.dashboardConfig.url.substring(this.dashboardConfig
                  .url.lastIndexOf(":"), this.dashboardConfig.url.length);
              this.dashboardConfig.url = originUrl;
          }
          this.embedUrl = this.dashboardConfig.url;
          if (this.dashboardConfig.urlPath) {
              this.embedUrl += this.dashboardConfig.urlPath;
          }
          timeOut.after(ConstantHelper.MILLISECONDS_100).run(() => {
              this._loading = false;
          });
      } else {
          this.logError("Component config not found", "", true);
      }
  }
}

customElements.define(AppExternalDashboard.is, AppExternalDashboard);
