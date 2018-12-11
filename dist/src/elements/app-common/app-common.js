import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
import '@polymer/app-layout/app-header/app-header.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-app-context-behavior/bedrock-app-context-behavior.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../rock-navmenu/rock-navmenu.js';
import '../rock-disclaimer/rock-disclaimer.js';
import '../rock-quick-actions/rock-quick-actions.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-progress/paper-progress.js';
import '../pebble-badge/pebble-badge.js';
import '../pebble-main-logo/pebble-main-logo.js';
import '../pebble-vertical-divider/pebble-vertical-divider.js';
import '../pebble-tenant-logo/pebble-tenant-logo.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-horizontal-divider/pebble-horizontal-divider.js';
import '../pebble-badge/pebble-badge.js';
import '../pebble-button/pebble-button.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-toast/pebble-toast.js';
import '../rock-profile/rock-profile.js';
import '../rock-header-search/rock-header-search.js';
import '../rock-notification/rock-notification.js';
import '../rock-notification-list/rock-notification-list.js';
import '../rock-hotline-settings/rock-hotline-settings.js';
import '../rock-business-function-dialog/rock-business-function-dialog.js';
import '../bedrock-style-manager/styles/bedrock-style-floating.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-tooltip.js';
import '../bedrock-init/bedrock-init.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import { flush } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import ProgressTracker from '../app-main/ProgressTracker.js';

class AppCommon
extends mixinBehaviors([
    RUFBehaviors.UIBehavior,
    RUFBehaviors.AppContextBehavior,
    RUFBehaviors.ComponentConfigBehavior
], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-variables bedrock-style-common bedrock-style-tooltip bedrock-style-floating bedrock-style-icons bedrock-style-padding-margin">
            app-header {
                color: var(--top-header-font-color);
                width: 100%;
                height: var(--app-header-height);
                padding: 0 10px;
                background: var(--top-header-background);
                z-index: 4;
                position: fixed;
                left: 0;
                top: 0;
                right: 0;
            }

            app-header div[align="left"] {
                width: 30%;
                padding-left: 35px;
                float: left;
                height: 40px;
                display: -ms-flexbox;
                display: -webkit-flex;
                display: flex;
                align-items: center;
            }

            app-header div[align="right"] {
                width: calc(70% - 280px);
                float: right;
                font-size: 0;
                height: 40px;
                display: -ms-flexbox;
                display: -webkit-flex;
                display: flex;
                align-items: center;
            }

            paper-progress {
                width: 100%;
                position: absolute !important;
                margin-left: 10px;
            }

            app-header paper-icon-button {
                --paper-icon-button-ink-color: var(--top-header-icon-color);
            }

            #navMenu {
                --paper-menu: {
                    background: var(--left-nav-background);
                    overflow: hidden;
                }
            }

            app-toolbar {
                color: var(--palette-white);
                height: var(--app-header-height);
                padding-right: 0;
                padding-left: 0;
                display: block;
            }

            pebble-vertical-divider {
                background: var(--top-header-vertical-divider-color, #ffffff);
                --pebble-vertical-divider-height: 18px;
                border-right: none;
                opacity: 1;
            }

            app-toolbar a {
                text-decoration: none;
            }

            pebble-vertical-divider {
                background: var(--top-header-vertical-divider-color);
                --pebble-vertical-divider-height: 18px;
                border-right: none;
                opacity: 1;
            }

            drawer-list {
                margin: 0 20px;
            }

            .drawer-list a {
                display: block;
                padding: 0 16px;
                text-decoration: none;
                color: var(--app-secondary-color);
                line-height: 40px;
            }

            .drawer-list a.iron-selected {
                color: var(--border-black, #000);
                font-weight: var(--font-bold, bold);
            }

            rock-notification {
                height: 20px;
                display: inline-block;
                vertical-align: middle;
                margin: 0px 5px 0 5px;

                --header-badge: {
                    background: var(--header-notification-color);
                    color: var(--header-notification-text-color);
                    border-color: var(--header-notification-color);
                }
            }

            #popoverUserNotifications,
            #popoverSystemNotifications {
                margin-top: 9px;
                --pebble-popover-width: 542px;
                --pebble-popover-max-width: 556px;
                --pebble-popover-max-height: 366px;

                --popover: {
                    padding-top: 15px !important;
                    padding-bottom: 15px !important;
                }
            }

            #userNotificationsList,
            #systemNotificationsList {
                --notification-font-size: var(--default-font-size, 14px);
                --profile-flex-verticle-max-width: 500px;

                --desc-box-styles: {
                    text-align: left;
                }
            }

            #appProgress {
                --paper-progress-container: {
                    background: transparent !important;
                    z-index: -1;
                }
            }

            .rock-header-style {
                --search-icon-fill-color: #09c021;
                position: relative;
                display: inline-block;
                vertical-align: middle;
                width: 100%;
            }

            app-drawer {
                margin-top: 40px;
                z-index: 999;

                --app-drawer-content-container: {
                    background-color: transparent !important;
                    -webkit-transition: all 0.3s;
                    -moz-transition: all 0.3s;
                    -o-transition: all 0.3s;
                    transition: all 0.3s;
                }

                ;
                --app-drawer-scrim-background: none;
            }

            pebble-main-logo,
            pebble-tenant-logo {
                display: inline-grid;
                display: -ms-inline-grid;
                vertical-align: middle;
            }

            app-header pebble-button {
                display: inline-block;
                vertical-align: middle;
                height: 20px;
                margin-top: 2px;
            }

            .search-wrap {
                flex-grow: 1;
            }

            .search-wrap,
            .quick-wrap {
                float: right;
            }

            [visibility-hidden] {
                visibility: hidden;
            }

            pebble-horizontal-divider {
                background-color: var(--palette-pale-grey-three, #e7ebf0);
                margin-right: 20px;
                margin-left: 20px
            }

            .popup-title {
                margin: 0px;
                font-size: var(--default-font-size, 14px);
                font-weight: var(--font-medium, 500);
                text-align: left;
            }

            #clipboard {
                position: absolute;
                height: 0;
                width: 0;
                top: -20px;
                left: -20px;
            }

            .preview-wrap {
                position: absolute;
                width: 100%;
                height: 40px;
                text-align: center;
                margin-left: -10px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            #previewtitle {
                color: #fff;
                font-size: 14px
            }

            #edithtml {
                color: #fff;
                font-size: 14px;
                margin-left: 10px;
                text-decoration: underline;
                cursor: pointer;
            }
        </style>
        <bedrock-init locale-resource-path="/src/resources/locales.json" default-language="en"></bedrock-init>
        <app-header fixed="" effects="waterfall">
            <app-toolbar>
                <div align="left">
                    <pebble-main-logo logo-url="[[mainLogo]]" on-logo-click="onLogoClick"></pebble-main-logo>
                    <pebble-vertical-divider class="m-r-10 m-l-10"></pebble-vertical-divider>
                    <pebble-tenant-logo logo-url="[[tenantLogo]]" logo-text="[[tenantLogoText]]" on-logo-click="onLogoClick"></pebble-tenant-logo>
                </div>
                <div id="toastArea" align="center"></div>
                <rock-profile id="userProfile" src="../src/images/no-photo.jpg" context-data="[[contextData]]" icon="pebble-icon:navigation-action-down"></rock-profile>
                <div hidden\$="{{showHeaderSideBar}}">
                    <div class="preview-wrap">
                        <span id="previewtitle">Showing preview for
                            <i>{{previewdata.entityname}}</i> with template
                            <i>{{previewdata.templateid}}</i>
                        </span>
                        <a id="edithtml" on-tap="_editHtml">Edit</a>
                    </div>
                </div>
                <div hidden\$="{{!showHeaderSideBar}}">
                    <div align="right">
                        <div class="search-wrap">
                            <rock-header-search class="rock-header-style" context-data="[[contextData]]">
                            </rock-header-search>
                        </div>
                        <div class="quick-wrap">
                            <rock-quick-actions id="quick-actions" context-data="[[contextData]]" page-route="[[pageRoute]]"></rock-quick-actions>
                        </div>
                        <pebble-icon icon="pebble-icon:help" class="icon-button pebble-icon-color-white pebble-icon-size-20 m-r-5 m-l-5 tooltip-bottom" onclick="window.open('/docportal')" data-tooltip="Help"></pebble-icon>
                        <rock-notification id="mdmUserNotifications" label="0" on-click="showUserNotifications" class="tooltip-bottom" data-tooltip="Notifications"></rock-notification>
                        <template is="dom-if" if="[[_popoverUserNotificationsDialog]]">
                            <pebble-popover id="popoverUserNotifications" for="mdmUserNotifications" no-overlap="" display-arrow-as-per-target="" horizontal-align="right">
                                <div class="popup-title p-b-5 p-r-20 p-l-20">Notifications</div>
                                <pebble-horizontal-divider></pebble-horizontal-divider>
                                <rock-notification-list id="userNotificationsList" show-line-index="1">
                                </rock-notification-list>
                            </pebble-popover>
                        </template>
                        <rock-hotline-settings context-data="[[contextData]]"></rock-hotline-settings>
                    </div>
                </div>
                <div class="clearfix"></div>
            </app-toolbar>
            <paper-progress id="appProgress" class="middle fit" value="0" min="0" max="1000"></paper-progress>
        </app-header>
        <rock-disclaimer context-data="[[contextData]]"></rock-disclaimer>
        <pebble-toast id="pebbleAppToast" vertical-align="top">
            [[toastText]]
        </pebble-toast>
        <app-drawer id="drawerLayout" transition-duration="0" on-app-drawer-transitioned="onAppDrawerTransitioned" align="start" persistent="" opened="" has-scrolling-region="">
            <rock-navmenu id="navMenu" page="{{page}}" query-params="{{queryParams}}" context-data="[[contextData]]" menu-items="{{menuItems}}" active-items="{{activeItems}}" route="{{routeData}}" on-menu-click="onMenuClick" on-menu-close-click="onMenuCloseClick"></rock-navmenu>
        </app-drawer>
        <rock-business-function-dialog id="contextDialog"></rock-business-function-dialog>
        <textarea id="clipboard"></textarea>
        <bedrock-pubsub on-bedrock-event-previewid="_previewId" name="bedrock-event-previewid"></bedrock-pubsub>
`;
  }

  static get is() {
      return 'app-common'
  }

  static get properties() {
      return {
          page: {
              type: String,
              notify: true,
              value: function () {
                  return "";
              }
          },
          menuItems: {
              type: Array,
              notify: true,
              value: function () {
                  return [];
              }
          },
          subMenuItem: {
              type: Array,
              notify: true,
              value: function () {
                  return [];
              }
          },
          globalSettings: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          activeItems: {
              type: Array,
              notify: true,
              value: function () {
                  return [];
              }
          },
          toastText: {
              type: String
          },
          queryParams: {
              type: Object,
              notify: true,
              value: function () {
                  return {};
              }
          },
          tenantLogo: {
              type: String,
              value: ""
          },
          tenantLogoText: {
              type: String,
              value: ""
          },
          mainLogo: {
              type: String,
              value: "../src/images/mainlogo.svg"
          },
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          showHeaderSideBar: {
              type: Boolean,
              value: true
          },
          contentContainerWidth: {
              type: String,
              value: "45px"
          }
      }
  }

  ready() {
      super.ready();
      this._handleDocumentClick = this._handleDocumentClick.bind(this);
      RUFUtilities.drawerLayout = this.shadowRoot.querySelector("#drawerLayout");
      RUFUtilities.clipboard = this.shadowRoot.querySelector("#clipboard");
      RUFUtilities.appDrawer = this.shadowRoot.querySelector("app-drawer");
      RUFUtilities.navMenu = this.shadowRoot.querySelector("rock-navmenu");
      RUFUtilities.navMenu.addEventListener("click", this._handleDocumentClick);
      document.addEventListener("click", this._collapseExpandDrawer);

      RUFUtilities.progressBar = this.shadowRoot.querySelector("#appProgress");

      this._popoverUserNotifications = this.shadowRoot.querySelector("#popoverUserNotifications");
      this._mdmUserNotifications = this.shadowRoot.querySelector("#mdmUserNotifications");
  }
  disconnectedCallback() {
      super.disconnectedCallback();
      document.removeEventListener("click", this._collapseExpandDrawer);
  }
  connectedCallback() {
      super.connectedCallback();
      RUFUtilities.appCommon = this;
      RUFUtilities.pebbleAppToast = this.shadowRoot.querySelector("#pebbleAppToast");
      RUFUtilities.popoverUserNotifications = this.shadowRoot.querySelector("#popoverUserNotifications");
      RUFUtilities.mdmUserNotifications = this.shadowRoot.querySelector("#mdmUserNotifications");
      RUFUtilities.userNotificationsList = this.shadowRoot.querySelector("#userNotificationsList");
      microTask.run(() => {
          let paperProgress = this.shadowRoot.querySelector("#appProgress");
          if (_.isEmpty(ProgressTracker.progressBar) && paperProgress) {
              ProgressTracker.progressBar = paperProgress;
          }
          let navMenu = this.shadowRoot.querySelector("#navMenu");
          if (navMenu && navMenu._collapseExpandDrawer) {
              if (navMenu.doNotCollapse) {
                  navMenu.doNotCollapse = false;
                  return;
              }
              this._collapseExpandDrawer();
          }
      });
  }
  _handleDocumentClick(e) {
      if (RUFUtilities.drawerLayout && RUFUtilities.drawerLayout.$.contentContainer.style.width !=
          this.contentContainerWidth && e.__domApi && e.__domApi.rootTarget) {
          if (e.__domApi.rootTarget.id != "trigger" && e.__domApi.rootTarget.className.indexOf("menu-trigger") == -1 && e.__domApi.rootTarget.className.indexOf("iron-selected") == -1) {
              let navMenu = RUFUtilities.navMenu;
              if (navMenu) {
                  if (navMenu.doNotCollapse) {
                      return;
                  }
                  navMenu.$.toggleItem.click();
              }
          }
      }
  }
  onLogoClick() {
      let drawer = this.drawerLayout;
      //ToDo: remove hard coded style and use class toggle
      drawer.setAttribute("menu-expanded", "");
      drawer.style.width = "266px";
  }

  onMenuCloseClick(e, customArgs) {
      this._clearEntityManagePagesRefs();
      RUFUtilities.mainApp.contentViewManager.closeView(customArgs.item.data_route, customArgs.item.queryParams);
  }
  onRefreshClick() {
      location.reload();
  }
  showUserNotifications() {
      this._popoverUserNotificationsDialog = true;
      flush();

      this._popoverUserNotifications = this.shadowRoot.querySelector("#popoverUserNotifications");
      this._popoverUserNotifications.show();
      this._mdmUserNotifications.label = 0;
  }
  _collapseExpandDrawer(e) {
      //do not close if we click on navbar
      //e.path is not a standard does not work in some browsers so we use e.composedPath() as a fallback
      //for cross-browser compatibility.
      if (RUFUtilities.navMenu._isMenuOpened && e) {
          if (e.path) {
              if (e.path.indexOf(RUFUtilities.navMenu) !== -1) {
                  return;
              }
          } else if (e.composedPath()) {
              if (e.composedPath().indexOf(RUFUtilities.navMenu) !== -1) {
                  return;
              }
          }
      }

      this.contentContainerWidth = "45px";
      //Set navmenu width as 50px for Edge browser 
      if (DataHelper.checkBrowser('edge') || DataHelper.checkBrowser('firefox')) {
          this.contentContainerWidth = "50px";
      }

      RUFUtilities.navMenu._collapseSubMenu();
      RUFUtilities.drawerLayout.removeAttribute("menu-expanded");
      RUFUtilities.navMenu._isMenuOpened = false;
      RUFUtilities.drawerLayout.style.width = this.contentContainerWidth;
      RUFUtilities.drawerLayout.$.contentContainer.style.width = this.contentContainerWidth;
  }
  getFunctionDialog() {
      return this.$.contextDialog;
  }
  _clearEntityManagePagesRefs() {
      let appsIdsToClose = Object.keys(RUFUtilities.pubsubEventNameRegistry).filter(appId =>
          appId.indexOf("app-entity-manage-component-") > -1);

      appsIdsToClose.forEach(appId => {
          delete RUFUtilities.pubsubEventNameRegistry[appId];
          delete RUFUtilities.pubsubListenerRegistry[appId];
      });
  }
  _editHtml() {
      let eventData = {
          name: "editpreviewclicked"
      };
      this.dispatchEvent(new CustomEvent("bedrock-event", {
          detail: eventData,
          bubbles: true,
          composed: true
      }));
  }
  _previewId(e) {
      this.previewdata = e.detail;
  }
}
customElements.define(AppCommon.is, AppCommon)
