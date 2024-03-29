import './element-helper.js';
import { flush } from '@polymer/polymer/lib/utils/flush.js';
//import { importHref } from '@polymer/polymer/lib/utils/import-href.js';

window.ComponentHelper = window.ComponentHelper || {};

ComponentHelper.fireBedrockEvent = function (name, data, settings, element) {
    let returnVal;
    if (element) {
        return ComponentHelper._fireBedrockEvent(name, data, settings, element);
    }

    let eventNameRegistries = ['universal'];
    const activeApp = ComponentHelper.getCurrentActiveApp();
    let currentAppId = activeApp ? activeApp.id : "";
    if (currentAppId) {
        eventNameRegistries.push(currentAppId);
    }
    eventNameRegistries.forEach((registry) => {
        const registryEvent = RUFUtilities.pubsubEventNameRegistry[registry];
        let eventIndex = registryEvent && registryEvent.indexOf(name);
        if (eventIndex !== -1 && RUFUtilities.pubsubListenerRegistry[registry]) {
            let listeners = RUFUtilities.pubsubListenerRegistry[registry][eventIndex];
            listeners.forEach((listener) => {
                if (listener && listener.element) {
                    ComponentHelper.fireBedrockEvent(name, data, settings, listener.element);
                }
            })
        }
    });
};

ComponentHelper._fireBedrockEvent = function (name, data, settings, element) {
    if ((!settings || !settings.ignoreId) && element.id) {
        name = name + "-" + element.id;
    }
    let cancelable = false;
    if (settings && settings.cancelable) {
        cancelable = true;
    }

    if (settings && settings.appId) {
        name = name + "-" + settings.appId;
    } else if (settings && settings.isMainApp) {
        name = name + "-" + element.appId;
    } else if (element.appId) {
        name = name + "-" + element.getAppId();
    }
    return element.fire('bedrock-event' + "-" + name, data, {
        cancelable: cancelable
    });
};

ComponentHelper.displayNode = function (node, state) {
    if (!(node instanceof HTMLElement)) return;

    state ? node.removeAttribute('hidden') : node.setAttribute('hidden', '');
};

ComponentHelper.clearNode = function (contentElement) {
    if (!contentElement) return;

    let rangeObj = new Range();
    rangeObj.selectNodeContents(contentElement);
    rangeObj.deleteContents();
    flush();
};

ComponentHelper.removeNode = function (node) {
    if (!(node instanceof HTMLElement) || !(node.parentNode)) return;
    node.parentNode.removeChild(node);
    flush();
};

ComponentHelper.loadContent = function (contentElement, component, element, callback) {
    if (!contentElement) return;
    //if properties bag is not created then create it
    if (!component.properties) {
        component.properties = {};
    }

    let createComponent = (cElement) => {
        let dynamicEl = new cElement();
        this._componentCreating(component, element);
        for (let property in component.properties) {
            if (component.properties.hasOwnProperty(property)) {
                let val = component.properties[property];
                let propertyName = DataHelper.convertCamelCaseStringFromHyphenated(property);
                if(dynamicEl.get(propertyName) != undefined){
                    dynamicEl[propertyName] = val;
                }else if (typeof val == "object") {
                    dynamicEl.setAttribute(property, JSON.stringify(val));
                } else {
                    //Polymer takes default as true, so do not set attribute for boolean false
                    if (typeof val != "boolean" || (typeof val == "boolean" && val)) {
                        dynamicEl.setAttribute(property, val);
                    }
                }
            }
        }
        if (element.nodeName == "ROCK-CONTENT-VIEW") {
            dynamicEl.contentViewManager = element.manager;
        }
        dynamicEl.setAttribute("id", component.name + "-component-" + ElementHelper.getRandomId());
        dynamicEl.setAttribute("class", dynamicEl.getAttribute("class") + " view-component");

        //remove any existing child elements
        this.clearNode(contentElement);
        
        contentElement.appendChild(dynamicEl);
        ComponentHelper._componentCreated(component, element);
        if (callback) {
            callback(dynamicEl);
        }
    };

    let cElement = customElements.get(component.name);
    if (cElement) {
        createComponent(cElement);
    } else {
        if(component.path.indexOf('html') !== -1)  //to do fix needs to be in configs
            component.path = component.path.replace(/html$/g,'js')
            let path = '', fragmentImport = {}
            try {
                if(__PRODUCTION__){
                    fragmentImport = import( /* webpackInclude: /\.js$/ */
                        /* webpackExclude: /\.noimport\.js$/ */
                        /* webpackChunkName: `chunk-${component.name}.js` */
                        /* webpackMode: "lazy" */
                        /* webpackPrefetch: true */ 
                        /* webpackPreload: true */
                        `../dynamic-fragments/${component.name}.js`)                
                }
            }catch(e) {
                fragmentImport = import(component.path)            
            }
            fragmentImport.then(function (e) {
                let cElement = customElements.get(component.name);
                createComponent(cElement);
            }, function (e) {
                console.log('dynamic component load failed with exception', e); //import failed
            });
    }
};

ComponentHelper._componentCreating = function (...arg) {
    this._onComponentCreate('component-creating', ...arg);
};

ComponentHelper._componentCreated = function (...arg) {
    this._onComponentCreate('component-created', ...arg);
};

ComponentHelper._onComponentCreate = function (eventName, component, element) {
    let eventData = component;
    let eventDetail = {
        name: eventName,
        data: eventData
    }
    this.fireBedrockEvent(eventName, eventDetail, {
        ignoreId: true
    }, element);
};

ComponentHelper.getCurrentActiveApp = function () {
    let mainApp = RUFUtilities.mainApp;
    if (mainApp && mainApp.shadowRoot) {
        let contentViewMgr = mainApp.contentViewManager;
        if (contentViewMgr) {
            let activeContentView = contentViewMgr.activeContentView;
            if (activeContentView) {
                let viewComponent = activeContentView.shadowRoot.querySelector(
                    "#content-view-container").querySelector(".view-component");
                return viewComponent;
            }
            return mainApp;
        }
    }
};

ComponentHelper.getCurrentActiveAppName = function (currentComponent) {
    if(currentComponent && currentComponent.businessFunctionName){
        return currentComponent.businessFunctionName;
    }

    let currentActiveApp = ComponentHelper.getCurrentActiveApp();
    if (currentActiveApp && DataHelper.isValidObjectPath(currentActiveApp, 'appConfig.component.name')) {
        return currentActiveApp.appConfig.component.name;
    }
};

ComponentHelper.getAppById = function (appId) {
    let mainApp = RUFUtilities.mainApp;
    if (!mainApp || !mainApp.contentViewManager) return null;

    let contentViewMgr = mainApp.contentViewManager;
    let openedContentViews = contentViewMgr.$.contentViewManager.querySelectorAll("rock-content-view");

    if (!openedContentViews || (openedContentViews && openedContentViews.length == 0)) return null;
    
    let appComponent = null;
    for (let viewId = 0; viewId < openedContentViews.length; viewId++) {
        const element = openedContentViews[viewId];
        if(element && element.shadowRoot){
            let viewContainer = element.shadowRoot.querySelector("#content-view-container");
            if(viewContainer){
                let viewComponent = viewContainer.querySelector(".view-component");
                if (viewComponent && viewComponent.id == appId) {
                    appComponent = viewComponent;
                    break;
                }
            }
            
        }
    }
    return appComponent;
};

ComponentHelper.getContentViewByName = function (viewName) {
    this.mainApp = this.mainApp || RUFUtilities.mainApp;

    if (!this.mainApp) return null;

    const contentViewManager = this.mainApp.contentViewManager;

    return contentViewManager ? contentViewManager.shadowRoot.querySelector(
        `rock-content-view[name="${viewName}"]`) : null;
};

ComponentHelper.getAppContainerById = function (appId) {
    let contentView;
    if (appId) {
        let app = ComponentHelper.getAppById(appId);
        if (app) {
            contentView = ComponentHelper.getParentElement(app);
        }
    }
    return contentView;
};

ComponentHelper.getProgressBar = function () {
    let appCommon = RUFUtilities.appCommon;
    if (appCommon) {
        this._progressBar = this._progressBar || appCommon.querySelector("paper-progress");
        return this._progressBar;
    }
};

ComponentHelper.getViewNameWithQueryParams = function (queryParams, viewName) {
    if (queryParams && !isEmpty(queryParams)) {
        let queryString = JSON.stringify(queryParams).replace(/,/g, '');
        queryString = queryString.replace(/"|{|}\s*/g, "").replace(/:\s*/g, "-");
        viewName += queryString;
    }
    return viewName;
};

ComponentHelper.getParentElement = function (component) {
    if (!component) return;

    let parentNode = component.parentNode;
    if (parentNode) {
        if (parentNode.isRufComponent) {
            return parentNode;
        }
        if (parentNode.host && parentNode.host.isRufComponent) {
            return parentNode.host;
        }
        return ComponentHelper.getParentElement(parentNode);
    }
};

ComponentHelper.closeCurrentApp = function (action) {
    let activeApp = ComponentHelper.getCurrentActiveApp();
    let contentView = ComponentHelper.getParentElement(activeApp);
    let manager;
    if (contentView) {
        manager = contentView.manager;
    }
    if (manager) {
        manager.closeView(contentView.name, {}, action);
    }
};

ComponentHelper.appRoute = function (appName, queryParams, encodeUrl) {
    let mainApp = RUFUtilities.mainApp;

    if (mainApp) {
        if (!_.isEmpty(queryParams)) {
            if(encodeUrl) {
                ComponentHelper.setQueryParams(queryParams);
            } else {
                ComponentHelper.setQueryParamsWithoutEncode(queryParams);
            }
        }
        mainApp.changePageRoutePath(appName);
    }
};

ComponentHelper.setQueryParams = function (queryParams) {
    for (let key in queryParams) {
        if (queryParams.hasOwnProperty(key)) {
            let element = queryParams[key];
            queryParams[key] = encodeURIComponent(element);
        }
    }
    RUFUtilities.mainApp.set('pageRoute.__queryParams', queryParams);
};

ComponentHelper.setQueryParamsWithoutEncode = function (queryParams) {
    RUFUtilities.mainApp.set('pageRoute.__queryParams', queryParams);
};

ComponentHelper.closeBusinessFunction = function (action) {
    let bfDialog = document.querySelector("#businessFunctionDialog");
    if (bfDialog) {
        bfDialog.close();
        if (action && action.name) {
            ComponentHelper.getCurrentActiveApp().fire(action.name, action);
        }
    } else {
        ComponentHelper.closeCurrentApp(action);
    }
};

ComponentHelper.getComputedStyleValue = function (element, styleClass) {
    let value;

    if (window.ShadyCSS) {
        value = ShadyCSS.getComputedStyleValue(element, styleClass);
    } else {
        value = getComputedStyle(element).getPropertyValue(styleClass);
    }

    return value;
};

ComponentHelper.getLocaleManager = function () {
    let mainApp = RUFUtilities.mainApp;
    if (mainApp) {
        return mainApp.localeManager;
    }
}
