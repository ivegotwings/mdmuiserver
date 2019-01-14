/**
` <rock-content-view-manager> ` Represents an element that manages the various content views.

@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-helpers/component-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../rock-content-view/rock-content-view.js';
import { flush } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import '../app-main/ProgressTracker.js';

class RockContentViewManager extends PolymerElement {
  static get template() {
    return html`
    <style>
      #contentViewManager {
        background-color: var(--white, #fff);
      }
    </style>
    <div id="contentViewManager"></div>
`;
  }

  static get is() {
    return "rock-content-view-manager";
  }
  static get properties() {
    return {
      _views: {
        type: Object,
        value: function () {
          return {};
        }
      },
      /**
       * Indicates the name of the view which is currently open.
       */
      currentViewName: {
        type: String
      },

      _openStack: {
        type: Array,
        value: function () {
          return [];
        }
      },

      _minimizeStack: {
        type: Array,
        value: function () {
          return [];
        }
      },

      _activeStack: {
        type: Array,
        value: function () {
          return [];
        }
      }
    }
  }
  /**
   * Can be used to open a view with the given name and configuration.
   * If a view with the same name is already opened, then same view is opened again.
   * @param {string} viewName The name of the view to be opened.
   * @param {string} config The configuration JSON for the new view. 
   * Sample config JSON: 
   * {
   *     "name": "entity-discovery",
   *     "title": "Entity Search & Refine",
   *     "data_route": "entity-discovery",
   *     "icon": "pebble-icons:search-entity",
   *     "href": "/entity-discovery",
   *     "nonClosable": true,
   *     "nonMinimizable": true,
   *     "component": {
   *         "name": "app-entity-discovery",
   *         "path": "../../src/elements/app-entity-discovery/app-entity-discovery.html",
   *         "properties": {
   *         }
   *     }
   *}
   */
  openView(viewName, config, queryParams, action) {
    ProgressTracker.resetProgress(true);

    let path = viewName;
    let contentView;
    viewName = ComponentHelper.getViewNameWithQueryParams(queryParams, viewName);

    if (!viewName) return;
    //Where rendering is going on, there is an issue closing and opening an app. So, we are making sure that it is flushed
    flush();

    if (viewName === this.currentViewName) return;

    this._displayView(this.currentViewName, false);
    //raise event - TODO: allow cancel?
    this.dispatchEvent(new CustomEvent('open', {
      detail: {
        "viewName": viewName,
        "contentView": undefined,
        "config": config
      },
      bubbles: true,
      composed: true
    }));

    let openSuccessful = false;
    //check for existing
    if (this._views[viewName]) {
      contentView = ComponentHelper.getContentViewByName(viewName);
      if (contentView) {
        this._displayView(viewName, true);
        //manage viewstack
        if (this._activeStack[this._activeStack.length - 1] != viewName) {
          this._takeOutFromStacks([
            this._minimizeStack,
            this._activeStack
          ], viewName);
          this._activeStack.push(viewName);
        }

        openSuccessful = true;
      }
    } else {
      // Polymer.importHref(this.resolveUrl('rock-content-view.html'),
      // () => this._loadContentView(viewName, config,queryParams,action, path),
      // true
      // );
      //if no existing, create new
      let cView = customElements.get('rock-content-view');
      contentView = new cView();
      contentView.name = viewName;
      contentView.setAttribute("name", viewName);
      let clonedConfig = DataHelper.cloneObject(config);
      contentView.component = clonedConfig.component;
      if (!contentView.component.properties) {
        contentView.component.properties = {};
      }
      contentView.component.properties["app-config"] = DataHelper.cloneObject(clonedConfig);
      contentView.viewTitle = clonedConfig.title;
      contentView.icon = clonedConfig.icon;
      contentView.nonClosable = clonedConfig.nonClosable;
      contentView.nonMinimizable = clonedConfig.nonMinimizable;
      contentView.noShare = clonedConfig.nonSharable;
      contentView.noSettings = clonedConfig.noSettings;
      contentView.manager = this;
      contentView.queryParams = queryParams;
      contentView.path = path;
      contentView.renderedCallback = function (renderedElement) {
        this.dispatchEvent(new CustomEvent('opened', {
          detail: {
            "contentView": renderedElement
          },
          bubbles: true,
          composed: true
        }));
      }.bind(this);
      this.$.contentViewManager.appendChild(contentView);
      contentView.render();

      this._views[viewName] = true;

      //manage viewstack
      this._activeStack.push(viewName);
      this._openStack.push(viewName);

      openSuccessful = true;
    }

    if (contentView) {
      let content = contentView.getContent();
      if (content && content.isRufComponent && action && action.name) {
        content.fire(action.name, action.data);
      }
    }
    //hide current view
    if (openSuccessful) {
      this.currentViewName = viewName;
    } else {
      this._displayView(this.currentViewName, true);
    }
  }

  /**
   * Can be used to close a view with the given name.
   * @param {string} viewName The name of the view to be opened.
   */
  closeView(viewName, queryParams, action, appId) {
    if (!viewName) return;

    viewName = ComponentHelper.getViewNameWithQueryParams(queryParams, viewName);
    let contentView = ComponentHelper.getContentViewByName(viewName);

    if (!contentView) return;
    
    if(!appId){
      this._clearCurrentAppRefs();
    }

    //Where rendering is going on, there is an issue closing and opening next app. So, we are making sure that it is flushed
    flush();

    //raise event - TODO: allow cancel?
    this.dispatchEvent(new CustomEvent('close', {
      detail: {
        "viewName": viewName,
        "contentView": contentView,
        "config": undefined
      },
      bubbles: true,
      composed: true
    }));

    ComponentHelper.removeNode(contentView);
    contentView = null;
    delete this._views[viewName];

    //manage viewstack
    this._takeOutFromStacks([
      this._activeStack,
      this._openStack,
      this._minimizeStack
    ], viewName);

    //show previous view when the current one is closed
    if (this.currentViewName == viewName) {
      this.currentViewName = "";
      if (this._activeStack.length) {
        this._navigateToLastOpenedContentView(action);
      } else {
        //no views to show, should go back to dashboard
        this._changeRoute("/dashboard");
      }
    }
  }

  /**
   * Can be used to minimize a view with the given name.
   * @param {string} viewName The name of the view to be opened.
   */
  minimizeView(viewName, queryParams) {
    if (!viewName) return;

    viewName = ComponentHelper.getViewNameWithQueryParams(queryParams, viewName);
    let contentView = ComponentHelper.getContentViewByName(viewName);

    if (!contentView) return;

    //Where rendering is going on, there is an issue minimizing and opening next app. So, we are making sure that it is flushed
    flush();

    //raise event - TODO: allow cancel?
    this.dispatchEvent(new CustomEvent('minimize', {
      detail: {
        "viewName": viewName,
        "contentView": contentView,
        "config": undefined
      },
      bubbles: true,
      composed: true
    }));

    this._displayView(viewName, false);

    //manage viewstack
    this._minimizeStack.push(viewName);
    this._takeOutFromStacks([this._activeStack], viewName); //ideally a pop, will change soon
    this.currentViewName = "";
    //show previous view when the current one is closed
    if (this._activeStack.length) {
      this._navigateToLastOpenedContentView();
    } else {
      //no views to show, should go back to dashboard
      this._changeRoute("/dashboard");
    }
  }

  _takeOutFromStacks(stacks = [], viewName) {
    stacks.forEach(stack => {
      const viewIndex = stack.findIndex(item => item === viewName);

      if (viewIndex >= 0) stack.splice(viewIndex, 1);
    });
  }

  /**
   * @method _displayView - handle view display state
   * @param {String} viewName
   * @param {Boolean} display
   */
  _displayView(viewName, display) {
    const contentView = ComponentHelper.getContentViewByName(viewName);

    if (!contentView) return;

    if (display)
      contentView.removeAttribute("hidden");
    else
      contentView.setAttribute("hidden", "");
  }

  _changeRoute(path, queryParams, action) {
    if (!queryParams) {
      queryParams = {};
    }

    let mainApp = RUFUtilities.mainApp;

    if (!mainApp) return;

    ComponentHelper.setQueryParamsWithoutEncode(queryParams);

    if (path !== mainApp.pageRoute.path) {
      mainApp.changePageRoutePath(path, action);
    }
  }

  _navigateToLastOpenedContentView(action) {
    let lastOpenedContentView = ComponentHelper.getContentViewByName(this._activeStack[this._activeStack.length - 1]);
    this._changeRoute(lastOpenedContentView.path, lastOpenedContentView.queryParams, action);
  }

  /** 
   * Can be used to get the elements if the current content view is dirty.
   */
  getIsDirty() {
    let currentView = undefined;
    if (this.currentViewName) {
      currentView = ComponentHelper.getContentViewByName(this.currentViewName);
    }

    if (currentView) {
      let content = currentView.$.content;
      if (content && content.firstElementChild && content.firstElementChild.getIsDirty) {
        let isDirty = content.firstElementChild.getIsDirty();
        return isDirty;
      }
    }
  }

  _clearCurrentAppRefs() {
    let currentAppId = ComponentHelper.getCurrentActiveApp() ? ComponentHelper.getCurrentActiveApp().id : "";

    if (currentAppId) {
      delete RUFUtilities.pubsubEventNameRegistry[currentAppId];
      delete RUFUtilities.pubsubListenerRegistry[currentAppId];
    }
  }

  get activeContentView() {
    return this.shadowRoot.querySelector("rock-content-view:not([hidden])");
  }

  /**
   * Fired when a `rock-content-view` is opened.
   *
   * @event 'open'
   * @param {{text: object}} the object has child properties for viewName, config object.
   */

  /**
   * Fired when a `rock-content-view` is closed.
   *
   * @event 'close'
   * @param {{text: object}} the object has child properties for viewName, contentView object.
   */

  /**
   * Fired when a `rock-content-view` is minimized.
   *
   * @event 'minimize'
   * @param {{text: object}} the object has child properties for viewName, contentView object.
   */
}
customElements.define(RockContentViewManager.is, RockContentViewManager);
