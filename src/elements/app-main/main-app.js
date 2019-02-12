/* loading behaviors early to avoid behavior is null error */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/app-route/app-route.js';
import '@polymer/app-route/app-location.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
// import 'web-animations-js/web-animations-next-lite.min.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '../bedrock-managers/bedrock-managers.js';
import LocaleManager from '../bedrock-managers/locale-manager.js';
import ContextModelManager from '../bedrock-managers/context-model-manager.js';
import '../bedrock-managers/entity-composite-model-manager.js';
import '../bedrock-helpers/constant-helper.js';
import '../bedrock-datasource-behavior/bedrock-datasource-behavior.js';
import '../bedrock-query-builder-behavior/bedrock-query-builder-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-app-context-behavior/bedrock-app-context-behavior.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-notification-receiver/bedrock-notification-receiver.js';
import '../bedrock-dataobject-notification-handler/bedrock-dataobject-notification-handler.js';
import '../rock-self-help/rock-self-help.js';
import '../rock-app-repository/rock-app-repository.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import '../bedrock-helpers/bedrock-helpers.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-variables.js';
import '../bedrock-style-manager/bedrock-style-theme-provider.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-base.js';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings.js';
import * as gestures from '@polymer/polymer/lib/utils/gestures.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
// import { importHref } from '@polymer/polymer/lib/utils/import-href.js';
import { resolveUrl } from '@polymer/polymer/lib/utils/resolve-url.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import EntityTypeManager from '../bedrock-managers/entity-type-manager.js';

/**
`main-app`
Main os app for riversand ui framework

@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
function isEmpty(obj) {
    for (let x in obj) {
        return false;
    }
    return true;
}

// Polymer.telemetry.register = function(prototype) {
//     //NOTE: Polymer.telemetry is holding stale ref of elements and leaking memory. 
//     // Overriding this method with empty logic to avoid memory leaks
// }

class MainApp
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.AppContextBehavior,
        RUFBehaviors.ComponentConfigBehavior
    ], OptionalMutableData(PolymerElement)) {
    static get template() {
        return html`
        <style include="bedrock-style-variables bedrock-style-common">
            #middle-container {
                margin-left: 45px;
                padding-bottom: 30px;
                padding-top: 40px;
            }

            .header-loading,
            .nav-loading {
                display: block;
                opacity: var(--loading-opacity, 0);
                position: absolute;
                top: 0px;
                left: 0px;
                transition: opacity 2s ease-in-out;
                -moz-transition: opacity 2s ease-in-out;
                -webkit-transition: opacity 2s ease-in-out;

            }

            .header-loading {
                background: var(--top-header-background);
                height: 40px;
                width: 100%;
                left: 45px;
            }

            .nav-loading {
                background: var(--left-nav-background);
                width: 45px;
                height: 100%;
            }

            .app-failure {
                text-align: center;
                color: #757f8a;
                position: absolute;
                align: center;
                top: 30%;
                width: 100%;
            }
        </style>
        <bedrock-style-theme-provider></bedrock-style-theme-provider>

        <div class="header-loading"></div>
        <div class="nav-loading"></div>
        <div class="app-failure" id="app-failure-message"></div>

        <div style="display:none">
            <app-location id="pageRoute" route="{{pageRoute}}"></app-location>
            <app-route route="{{pageRoute}}" pattern="/:page" data="{{routeData}}" query-params="{{queryParams}}" tail="{{subRoute}}"></app-route>
            <app-route route="{{subRoute}}" pattern="/:id" data="{{subRouteData}}"></app-route>
            <template is="dom-if" if="[[readyForLoad]]">
                <bedrock-pubsub event-name="app-status-changed" handler="_onAppStatusChanged" app-id="main-app"></bedrock-pubsub>
                <bedrock-pubsub on-bedrock-event-appstatusupdated="_updateActiveItemsAppStatusTitle" name="bedrock-event-appstatusupdated"></bedrock-pubsub>
                <bedrock-pubsub event-name="app-repository-get-error" handler="_onAppRepositoryGetError" name="bedrock-event-app-repository-get-error"></bedrock-pubsub>
                <bedrock-notification-receiver></bedrock-notification-receiver>
                <bedrock-dataobject-notification-handler></bedrock-dataobject-notification-handler>
                <rock-self-help context-data="[[contextData]]" help-settings="{{helpSettings}}"></rock-self-help>
                <rock-app-repository context-data="[[contextData]]" app-repository="{{appRepository}}"></rock-app-repository>
            </template>
        </div>
        <template is="dom-if" if="[[readyForLoad]]">
            <app-common sub-menu-item="{{subMenuItem}}" tenant-logo="{{tenantLogo}}" tenant-logo-text="{{tenantLogoText}}" main-logo="{{mainLogo}}" route="{{routeData}}" tenant-id="{{tenantId}}" context-data="[[contextData]]" page="{{page}}" query-params="{{queryParams}}" menu-items="{{menuItems}}" active-items="{{activeItems}}" help-settings="[[helpSettings]]"></app-common>
            <div id="middle-container">
                <rock-content-view-manager id="contentViewManager" on-open="onViewOpen" on-opened="onViewOpened" on-close="onViewClose" on-minimize="_onViewMinimize"></rock-content-view-manager>
            </div>
        </template>
`;
    }

    static get is() {
        return 'main-app';
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
            pages: {
                type: Object,
                value: []
            },
            menuItems: {
                type: Array,
                notify: true,
                value: function () {
                    return [];
                }
            },
            activeItems: {
                type: Array,
                notify: true,
                value: function () {
                    return [];
                }
            },
            appRepository: {
                type: Object,
                notify: true
            },
            globalSettings: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            queryParams: {
                type: Object,
                notify: true,
                value: function () {
                    return {};
                }
            },
            tenantId: {
                type: String,
                notify: true,
                value: "t1"
            },
            userId: {
                type: String,
                notify: true,
                value: ""
            },
            fullName: {
                type: String,
                value: ""
            },
            userName: {
                type: String,
                notify: true,
                value: ""
            },
            ownershipData: {
                type: String,
                notify: true,
                value: ""
            },
            ownershipEditData: {
                type: String,
                notify: true,
                value: ""
            },
            isAuthenticated: {
                type: Boolean,
                value: false
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
            versionInfo: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            contextData: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            localeManager: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            roles: {
                type: String,
                value: ""
            },
            defaultRole: {
                type: String,
                value: ""
            },
            errorList: {
                type: Array,
                value: function () {
                    return [];
                }
            },
            readyForLoad: {
                type: Boolean,
                value: false
            },
            helpSettings: {
              type: Object,
              value: function () {
                  return{};
              }
          }
        }
    }

    static get observers() {
        return [
            "_routePageChanged(routeData.page)",
            "_pageChanged(page,appRepository,queryParams)"
        ]
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    async connectedCallback() {
        super.connectedCallback();
        RUFUtilities.initializeLogger(RUFUtilities.Logger.levelError);

        if (!this._isHttp2Protocol()) {
            let self = this;
            setTimeout(function () {
                let loaderEle = document.getElementById("loader");
                ComponentHelper.removeNode(loaderEle);
                let domContainer = self.shadowRoot.querySelector("#app-failure-message");

                self.logError("Application is not configured for http2 protocol", "", true, "Application is not configured for http2 protocol. Contact administrator", domContainer);
            }, 1000);

            return;
        }

        let response = await fetch('/data/appservice/baseinfo/get', {
            cache: "reload",
            credentials: "include"
        });
        let userInfo = await response.json();
        //console.log('user info', userInfo);
        this.initializeApp(userInfo);
    }

    ready() {
        super.ready();
        setPassiveTouchGestures(true);
        gestures.add(document.documentElement, "down", null);
    }

    initializeApp(userInfo) {
        if (userInfo) {
            Object.keys(userInfo).map((key) => this[key] = userInfo[key]);
        } else {
            RUFUtilities.Logger.error('No user data available at get UserInfo. Unauthorized at main-app');
        }

        if (this.isAuthenticated) {

            let versionInfo = this.versionInfo;
            if (SharedUtils && SharedUtils.ModuleVersionManager) {
                ModuleVersionManager.initialize(versionInfo.moduleVersions);
                //console.log('module versions: ', JSON.stringify(ModuleVersionManager.getAll()));
            }

            if (SharedUtils && SharedUtils.RuntimeVersionManager) {
                RuntimeVersionManager.setVersion(versionInfo.runtimeVersion);
                //console.log('runtime version: ', RuntimeVersionManager.getVersion());
            }

            if (!_.isEmpty(this.roles)) {
                this.roles = this.roles.split(",");
            }

            RUFUtilities.mainApp = dom(document).querySelector("main-app");

            timeOut.after(ConstantHelper.MILLISECONDS_100).run(() => {
                RUFUtilities.navbarPlaceholder = this.shadowRoot.querySelectorAll(".nav-loading")[0];
                RUFUtilities.middleContainer = this.shadowRoot.querySelectorAll("#middle-container")[0];
            });

            let logDetail = {
                "userName": this.userName,
                "userAgent": navigator.userAgent
            };

            RUFUtilities.Logger.info("RUF_BROWSER_APPLICATION_LOADED", logDetail, "main-app");

            this.requestConfig("global-settings", this.contextData);
        }

        this.readyForLoad = true;


    }

    changePageRoutePath(newPath, action) {
        if (newPath) {
            this.set("pageRoute.path", newPath);
            //Disabling push state management, history is managed by app-localion. This is so because function
            //gets called multiple times so multiple history states are pushd. //TODO-FIX ME
            //window.history.pushState({}, "", this.pageRoute.path);
            window.dispatchEvent(new CustomEvent("location-changed"));
        }
        this.openAction = action;
    }

    onConfigLoaded(componentConfig) {
        if (componentConfig && componentConfig.config) {
            let globalSettings = componentConfig.config;
            this.initGlobalSettings(globalSettings);
            this._renderTenantLogo(globalSettings.themeSettings);
            this._themeProvider = this._themeProvider || this.shadowRoot.querySelector("bedrock-style-theme-provider");
            this._themeProvider.initiateTheme(globalSettings.themeSettings);

            this.localeManager = new LocaleManager();
        } else {
            ComponentHelper.removeNode(document.getElementById("loader"));
            let domContainer = this.shadowRoot.querySelector("#middle-container");
            this.logError("Base configs are missing", "", true, "Configurations are missing. Contact administrator", domContainer);
        }
    }

    onConfigError(detail) {
        ComponentHelper.removeNode(document.getElementById("loader"));
        let domContainer = this.shadowRoot.querySelector("#middle-container");
        this.logError("Base configs are missing", detail, true, "Configurations are missing. Contact administrator", domContainer);
    }

    _onAppRepositoryGetError(e, detail) {
        ComponentHelper.removeNode(document.getElementById("loader"));
        let domContainer = this.shadowRoot.querySelector("#middle-container");
        this.logError("Base configs are missing", detail, true, "Configurations are missing. Contact administrator", domContainer);
    }

    onLogoClick() {
        let drawer = this.drawerLayout;
        //ToDo: remove hard coded style and use class toggle
        drawer.setAttribute("menu-expanded", "");
        drawer.style.width = "266px";
    }

    get contentViewManager() {
        this._contentViewManager = this._contentViewManager || this.shadowRoot.querySelector("#contentViewManager");

        return this._contentViewManager;
    }

    onMenuCloseClick(e, customArgs) {
        this.contentViewManager.closeView(customArgs.item.data_route, customArgs.item.queryParams);
    }

    onRefreshClick() {
        location.reload();
    }

    onViewOpen(e, customArgs) {
        let queryParams;

        if (!customArgs || !customArgs.config) {
            return;
        }

        if (!isEmpty(this.queryParams)) {
            queryParams = this.queryParams;
            RUFUtilities.notinnavmenu = RUFUtilities.notinnavmenu ? RUFUtilities.notinnavmenu : _.difference(Object.keys(this.appRepository), RUFUtilities.menuTitles);
            if (RUFUtilities.notinnavmenu.indexOf(customArgs.config.data_route) === -1) {
                for (let ind = 0; ind < this.menuItems.length; ind++) {
                    if (this.menuItems[ind].data_route == customArgs.config.data_route) {
                        if (!queryParams || JSON.stringify(queryParams) == JSON.stringify(this.menuItems[ind].queryParams)) {
                            return;
                        }
                    }

                    if (this.menuItems[ind].menuItems) {
                        for (let subind = 0; subind < this.menuItems[ind].menuItems.length; subind++) {
                            if (this.menuItems[ind].menuItems[subind].data_route == customArgs.config.data_route) {
                                if (!queryParams || JSON.stringify(queryParams) == JSON.stringify(this.menuItems[ind].menuItems[subind].queryParams)) {
                                    return;
                                }
                            }
                        }
                    }
                }
            }
            for (let actind = 0; actind < this.activeItems.length; actind++) {
                if (this.activeItems[actind].data_route == customArgs.config.data_route) {
                    if (!queryParams || JSON.stringify(queryParams) == JSON.stringify(this.activeItems[actind].queryParams)) {
                        return;
                    }
                }
            }
        }

        let config = DataHelper.cloneObject(customArgs.config);
        config.queryParams = queryParams;
        this.push("activeItems", config);
    }

    onViewOpened(e, customArgs) {
        if (customArgs) {
            let app = customArgs.previousView ? customArgs.previousView : customArgs.contentView;

            if (this.activeItems.length && app && app.getAppCurrentStatus) {
                let activeItem = this.activeItems[this.activeItems.length - 1];
                if (activeItem.component.name == app.localName) {
                    activeItem = this.pop("activeItems");
                    activeItem.appStatus = app.getAppCurrentStatus(activeItem);
                    this.push("activeItems", activeItem);
                }
            }
        }

        this.loadAppCommon();
    }

    loadAppCommon() {
        let cElement = customElements.get("app-common");

        // This shall / must execute only on first view opened event...as after that customElements registry would already have app-common element
        if (!cElement) {
            this.updateStyles({
                "--loading-opacity": 1
            });

            ComponentHelper.removeNode(document.getElementById("loader"));

            timeOut.after(ConstantHelper.MILLISECONDS_100).run(() => {
                afterNextRender(this, () => {
                    import("../app-common/app-common.js");
                    let localeManager = ComponentHelper.getLocaleManager();
                    if (localeManager) {
                        localeManager.preload();
                    }
                    let entityTypeManager = EntityTypeManager.getInstance();

                    if (entityTypeManager) {
                        entityTypeManager.preload();
                    }
                    // if (ContextModelManager && ContextModelManager.preload) {
                    //     ContextModelManager.preload();
                    // }
                });
            });
        }
    }

    onViewClose(e, customArgs) {
        let viewIndex;
        for (let actIndex = 0; actIndex < this.activeItems.length; actIndex++) {
            let viewName = ComponentHelper.getViewNameWithQueryParams(this.activeItems[actIndex].queryParams, this.activeItems[actIndex].data_route);
            if (viewName == customArgs.viewName) {
                viewIndex = actIndex;
                break;
            }
        }
        if (viewIndex || viewIndex == 0) {
            this.splice("activeItems", viewIndex, 1);
        }
    }

    getIsDirty() {
        return this.contentViewManager && this.contentViewManager.getIsDirty();
    }

    _routePageChanged(page) {
        if (page) {
            this.page = page || "";
        }
    }

    _fillPages(pages, appRepository) {
        if (_.isEmpty(this.pages) && !_.isEmpty(appRepository)) {
            for (let appName in appRepository) {
                let appConfig = appRepository[appName];
                if (!_.isEmpty(appConfig) && appConfig.data_route && pages.indexOf(appConfig.data_route) < 0) {
                    pages.push(appConfig.data_route);
                }
            }
        }
    }

    _pageChanged(page, appRepository, queryParams) {
        this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(0),
            () => {
                if (page != undefined && queryParams != undefined && !_.isEmpty(appRepository)) {
                    this._fillPages(this.pages, appRepository);
                    //Extract page from URL
                    let pageurl = "";
                    let queryParamSplit = location.href.split("?");
                    if (queryParamSplit.length) {
                        let urlWithoutParam = queryParamSplit[0];
                        if (urlWithoutParam) {
                            let slashIndex = urlWithoutParam.lastIndexOf("/") + 1;
                            pageurl = urlWithoutParam.substr(slashIndex, urlWithoutParam.length);
                        }
                    }

                    if (this.pages.indexOf(pageurl) !== -1) {
                        this.page = pageurl;
                        this.changePageRoutePath(pageurl);
                        let that = this;
                        import("../rock-content-view-manager/rock-content-view-manager.js").then(function () {
                            let contentViewManager = that.contentViewManager;
                            if (contentViewManager) {
                                ComponentHelper.setQueryParamsWithoutEncode(queryParams);
                                contentViewManager.openView(page, that.appRepository[page], that.queryParams, that.openAction);
                            }
                        }, null, true);
                    } else {
                        if (!_.isEmpty(pageurl)) {
                            this.logError("Requested app '" + this.page + "' is not available in app repository.");
                        }

                        this.page = "dashboard";
                        this.changePageRoutePath("dashboard");
                    }
                }
                this.dispatchEvent(new CustomEvent("bedrock-event", {
                    detail: {
                        name: "route-changed",
                        data: {
                            route: this.pageRoute
                        }
                    },
                    bubbles: true,
                    composed: true
                }));
            });
    }

    get mainAppErrorPanel() {
        this._mainAppErrorPanel = this._mainAppErrorPanel || this.shadowRoot.querySelector("#mainAppErrorPanel");
        return this._mainAppErrorPanel;
    }

    _renderTenantLogo(_tenantConfig) {
        if (_tenantConfig) {
            this.tenantLogo = _tenantConfig.headerLogoUrl;
            this.tenantLogoText = _tenantConfig.footerTitle;

            if (!_.isEmpty(_tenantConfig.mainLogoUrl)) {
                this.mainLogo = _tenantConfig.mainLogoUrl;
            }
        } else {
            console.error("Configuration not found for User:" + this.userName);
            //RUFUtilities.Logger.error("Configuration not found for user");
        }
    }

    _onViewMinimize(e, customArgs) {
        this._updateActiveItemsAppStatus(customArgs);
    }

    _onAppStatusChanged(e, customArgs) {
        this._updateActiveItemsAppStatus(customArgs);
    }

    _updateActiveItemsAppStatus(customArgs) {
        let viewIndex;
        for (let actIndex = 0; actIndex < this.activeItems.length; actIndex++) {
            let viewName = ComponentHelper.getViewNameWithQueryParams(this.activeItems[actIndex].queryParams, this.activeItems[actIndex].data_route);
            if (viewName == customArgs.viewName) {
                viewIndex = actIndex;
                break;
            }
        }

        let appInstance = customArgs.contentView.shadowRoot.querySelector(".view-component");
        if (viewIndex >= 0 && appInstance && appInstance.getAppCurrentStatus) {
            let appStatus = appInstance.getAppCurrentStatus(this.activeItems[viewIndex]);
            let activeItems = this.activeItems;
            activeItems[viewIndex].appStatus = appStatus;
            this.activeItems = [];
            this.set("activeItems", activeItems);
        }
    }

    _updateActiveItemsAppStatusTitle(customArgs) {
        let activeItems = DataHelper.cloneObject(this.activeItems);
        for (let actIndex = 0; actIndex < activeItems.length; actIndex++) {
            if (JSON.stringify(activeItems[actIndex].queryParams) == JSON.stringify(customArgs.detail.queryParams)) {
                activeItems[actIndex].appStatus.title = customArgs.detail.title;
                break;
            }
        }
        if (activeItems.length > 0) {
            this.activeItems = [];
            this.set("activeItems", activeItems);
        }
    }

    _isHttp2Protocol() {
        // Edge and firefox ddoes not support proper navigation api 2 so skipping for these browsers
        if (DataHelper.checkBrowser('edge') || DataHelper.checkBrowser('firefox')) {
            return true;
        }

        let protocol = performance.getEntriesByType('navigation')[0].nextHopProtocol;

        if (!(protocol && (protocol.toLowerCase() == "h2" || protocol.toLowerCase() == "http/2"))) {
            let logDetail = {
                "userName": this.userName,
                "userAgent": navigator.userAgent,
                "protocol": protocol
            };

            RUFUtilities.Logger.error("RUF_BROWSER_PROTOCOL_ERROR", logDetail, "main-app");
        }

        return true;
    }
}
customElements.define(MainApp.is, MainApp)

