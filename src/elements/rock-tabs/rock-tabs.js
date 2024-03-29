/**
`<rock-tabs>` Represents a wrapper on top of the `<pebble-tab-group>` element. 
It generates the tabs with material design styling based on the given configuration.
It makes it easy to explore and switch between different views or functional aspects of an App. It helps to browse the categorized data sets dynamically.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-pages/iron-pages.js';
// import '@polymer/paper-menu/paper-menu.js'; //to do replace with listbox
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-paper-listbox.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../liquid-dataobject-utils/liquid-dataobject-utils.js';
import '../pebble-tab/pebble-tab.js';
import '../pebble-tab-group/pebble-tab-group.js';
import '../pebble-horizontal-divider/pebble-horizontal-divider.js';
import '../pebble-badge/pebble-badge.js';
import '../pebble-dialog/pebble-dialog.js';
import '../pebble-spinner/pebble-spinner.js';
import { flush } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { microTask, timeOut } from '@polymer/polymer/lib/utils/async.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockTabs
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-grid-layout bedrock-style-icons bedrock-style-paper-listbox">
            :host {
                display: block;
                height: 100%;
            }

            pebble-horizontal-divider {
                --pebble-horizontal-divider-color: var(--border-black, #000);
            }

            pebble-tab {
                margin-right: 15px;
                overflow: inherit;
                @apply --tab-error-circle;
            }

            pebble-tab:last-of-type {
                margin-right: 0;
            }

            pebble-icon {
                margin-right: var(--tab-icon-spacing, 0.5em);
            }

            paper-listbox pebble-icon {
                margin-right: 10px;
            }

            pebble-tab .dropdown-content {
                box-sizing: border-box;
                position: fixed;
                max-height: 250px;
                overflow: auto;
                padding: 10px 0px;
                font-size: var(--default-font-size, 14px);
                color: var(--primary-text-color, #212121);
            }

            .list-content {
                padding: 0px 20px;
                font-size: 14px;
            }

            .list-content:hover {
                background-color: var(--bgColor-hover, #e8f4f9);
                color: var(--focused-line, #026bc3);
            }

            .list-content:focus {
                color: var(--primary-button-color, #036bc3);
                background-color: var(--bgColor-hover, #e8f4f9);
            }

            paper-listbox {
                @apply --common-popup;
                margin-top: var(--default-tab-height, 38px);
            }

            .tab-title {
                font-size: var(--default-font-size);
                font-weight: var(--font-medium);
                color: var(--palette-dark);
            }

            .iron-selected .tab-title {
                color: var(--palette-cerulean);
            }

            .tab-subtitle {
                font-size: var(--font-size-sm, 12px);
                font-weight: var(--font-bold, bold);
                position: absolute;
                top: var(--subtitle-abs-position, -4px);
                max-width: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .iron-selected .tab-subtitle {
                color: var(--palette-cerulean, #036bc3);
            }

            .tab-subtitle-wrapper>pebble-badge {
                --pebble-badge-margin-left: 2%;
                --pebble-badge-margin-bottom: 1%;
            }

            paper-item {
                /* this can be moved if paper item is moved inside the pebble tab*/
                --paper-item-min-height: 30px;
                --paper-item-selected-weight: bold;

                --paper-item: {
                    font-size: var(--default-font-size, 14px);
                    color: var(--color-steal-grey, #75808b);
                }
            }

            .tab-content {
                height: 100%;
                overflow: auto;
                @apply --rock-tab-content;
                @apply --rock-tab-content-height;
                -webkit-transition: height 0.3s;
                -moz-transition: height 0.3s;
                -o-transition: height 0.3s;
                transition: height 0.3s;
            }

            @supports (-ms-ime-align:auto) {
                .tab-content {
                    transition: initial;
                }
            }

            /*IE 11 fix for paper-item alignment on hover of an element*/

            /*paper-item {
                height: 1px;
            }*/

            pebble-tab-group {
                margin-bottom: 20px;
                @apply --pebble-tab-group;
            }

            pebble-tab {
                height: 40px;
                @apply --pebble-tab;
            }

            pebble-tab-group#rockTabs pebble-tab {
                margin-left: 20px;
            }

            pebble-tab-group#rockTabs {
                margin-bottom: 0px;
            }

            #content-relationships {
                padding: 10px;
            }

            #content-entity-family {
                padding-top: 20px;
                padding-right: 20px;
                padding-bottom: 20px;
                padding-left: 20px;
            }
        </style>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <div id="menuProviders" hidden=""></div>
                <pebble-tab-group id\$="{{id}}" selected="{{selectedTabIndex}}" on-iron-select="_onIronSelect" on-iron-deselect="_onIronDeselect" noink="">
                    <template is="dom-repeat" items="[[_calculatedTabItems]]" as="tabItem">
                        <pebble-tab id="[[tabItem.name]]" display-menu="[[arrayItem(_calculatedTabItems.*, index, 'enableDropdownMenu')]]" tab-config="{{tabItem}}">
                            <div class="tab-title-content" slot="tab-title-content">
                                <div class="tab-subtitle" slot="tab-subtitle">
                                    <span class="tab-subtitle-content">[[tabItem.subtitle]]</span>
                                </div>
                                <div class="tab-badge" slot="tab-badge">
                                    <pebble-badge for="[[tabItem.name]]" hidden=""></pebble-badge>
                                </div>
                                <div class="tab-title" slot="tab-title">
                                    <template is="dom-if" if="[[tabItem.icon]]">
                                        <pebble-icon class="pebble-icon-size-18" icon="[[tabItem.icon]]"></pebble-icon>
                                    </template>
                                    <span>[[_temp(tabItem.title)]]</span>
                                </div>
                            </div>

                            <paper-listbox slot="list" class="dropdown-content">
                                <template is="dom-repeat" items="[[arrayItem(_calculatedTabItems.*, index, 'menuItems')]]" as="menuItem">
                                    <template is="dom-if" if="[[!_isDivider(menuItem)]]">
                                        <paper-item class="list-content" id="[[tabItem.name]]-[[menuItem.name]]" tab-config="[[tabItem]]" menu-item-config="[[menuItem]]">
                                            [[menuItem.title]]
                                        </paper-item>
                                    </template>
                                    <template is="dom-if" if="[[_isDivider(menuItem)]]">
                                        <pebble-horizontal-divider></pebble-horizontal-divider>
                                    </template>
                                </template>
                            </paper-listbox>
                        </pebble-tab>
                    </template>
                </pebble-tab-group>
                <pebble-spinner active="[[showLoadingSpinner]]"></pebble-spinner>
            </div>
            <div class="base-grid-structure-child-2">
                <template is="dom-if" if="{{hasComponentErrored(isComponentErrored)}}">
                    <div id="error-container"></div>
                </template>

                <template is="dom-if" if="{{!hasComponentErrored(isComponentErrored)}}">
                    <div id="tab-content" hidden="" class="tab-content"></div>
                </template>
                <bedrock-pubsub event-name="selection-changed" handler="_onSelectionChange" target-id=""></bedrock-pubsub>
            </div>
        </div>
`;
  }

  static get is() {
      return 'rock-tabs'
  }
  static get properties() {
      return {
          id: {
              type: String,
              notify: true
          },

          deferredRender: {
              type: Boolean,
              value: false
          },

          _isReadyToRender: { //flag that determines if the tabs can be rendered.
              type: Boolean,
              value: false
          },

          _renderOnTabSelection: {
              type: Boolean,
              value: false
          },
          /**
           * If set as true , it indicates the component is in read only mode
           */
          readonly: {
              type: Boolean,
              value: false,
              observer: '_onReadonly'
          },
          /**
           * Indicates the configuration of an `element`.
           */
          config: {
              type: Object,
              observer: '_configChanged',
              value: function () {
                  return {};
              }
          },

          _calculatedTabItems: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          /**
           * Indicates the selected index of a tab.
           */
          selectedTabIndex: {
              type: Number,
              notify: true
          },

          _currentTabName: {
              type: String
          },

          /**
           * Indicates the selected tab's configuration.
           */
          selectedTab: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true
          },

          _currentTabErrorLength: {
              type: Number,
              value: 0,
              notify: true,
              observer: '_errorLengthChanged'
          },

          _selectedTabConfig: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true
          },

          viewMode: {
              type: String,
              value: ""
          },

          viewModeSubMenu: {
              type: String,
              value: ""
          }
      }
  }

  constructor() {
      super();
      this.showLoadingSpinner = false;
  }

  connectedCallback() {
      super.connectedCallback();
      this._isReadyToRender = !this.deferredRender;
  }

  disconnectedCallback() {
      super.disconnectedCallback();
      if (this.loadContentTimeoutId1) clearTimeout(this.loadContentTimeoutId1);
      if (this.loadContentTimeoutId2) clearTimeout(this.loadContentTimeoutId2);
      if (this.loadContentTimeoutId3) clearTimeout(this.loadContentTimeoutId3);
  }

  getTabByName(tabName) {
      let pebbleTabGroup = this.shadowRoot.querySelector("#" + this.id);
      if (pebbleTabGroup) {
          return pebbleTabGroup.querySelector("#" + tabName);
      }
  }

  _tabChange(activeTab) {
      if (activeTab) {
          ComponentHelper.fireBedrockEvent("tabs-change", activeTab, {
              ignoreId: true
          });
      }
  }

  setBadgeValue(tabName, value) {
      let tab = this.shadowRoot.querySelector("#" + this.id).querySelector("#" + tabName);
      if (tab) {
          let badge = tab.querySelector("pebble-badge");
          if (badge && value) {
              badge.label = value;
              this.toggleBadge(tab, true);
          } else {
              this.toggleBadge(tab, false);
          }
      } else {
          this.logWarning("TabNameError", "tabName", tabName);
      }
  }

  _getTabGroup() {
      return this.shadowRoot.querySelector("#" + this.id);
  }

  getBadgeValue(tabName) {
      let pebbleTabGroup = this._getTabGroup();
      if (pebbleTabGroup) {
          let tab = pebbleTabGroup.querySelector("#" + tabName);
          if (tab) {
              let badge = tab.querySelector("pebble-badge");
              if (badge) {
                  return badge.label;
              }
          } else {
              this.logWarning("TabNameError", "tabName", tabName);
          }
      }
  }

  toggleBadge(tab, showHide) {
      if (tab) {
          let badge = tab.querySelector("pebble-badge");
          if (badge) {
              if (showHide) {
                  badge.removeAttribute("hidden");
              } else {
                  badge.setAttribute("hidden", "");
              }
          } else {
              this.logWarning("PebbleBadgeError");
          }
      } else {
          this.logWarning("Tab not found", "tabName", tab);
      }
  }

  _configChanged(config) {
      if (_.isEmpty(config)) return;

      if (config.tabItems) {
          this._tabContent = this.shadowRoot.querySelector('#tab-content');
          let tabItems = config.tabItems;
          if (tabItems && tabItems.length) {
              for (let tabItemIndex in tabItems) {
                  let tabItem = tabItems[tabItemIndex];
                  tabItem.index = tabItemIndex;
                  if (tabItem.selected) {
                      this.selectedTabIndex = tabItemIndex;
                  }
              }
          }

          this._calculatedTabItems = DataHelper.cloneObject(tabItems);
          for (let tabItemIndex in this._calculatedTabItems) {
              let tabItem = this._calculatedTabItems[tabItemIndex];
              if (tabItem.enableDropdownMenu) {
                  this._fillMenuItems(tabItem);
              } else if (_.isEmpty(this.selectedTab) || (this.selectedTab.index === tabItemIndex && tabItemIndex === this.selectedTabIndex)) {
                  this.loadContentTimeoutId1 = setTimeout(() => {
                      this.reloadCurrentTab();
                  }, 1000);
              }
          }

          let pebbleTabGroup = this._getTabGroup();
          if (pebbleTabGroup) {
              if (config.scrollable) {
                  pebbleTabGroup.scrollable = true;
              } else {
                  pebbleTabGroup.setAttribute("fitContainer", "");
              }
          }
      } else {
          this.logError("Tab config not found", "", true);
      }
  }

  _fillMenuItems(tabItem) {
      let menuProviders = this.$.menuProviders;
      if (tabItem.menuProviderComponent) {
          Object.keys(tabItem.component.properties).map(function (tabComponentProperty) {
              tabItem.menuProviderComponent.properties[tabComponentProperty] = tabItem.component.properties[tabComponentProperty];
          });
          ComponentHelper.loadContent(menuProviders, tabItem.menuProviderComponent, this, this._menuProviderCreated.bind(this, tabItem));
      } else {
          this.loadContentTimeoutId2 = setTimeout(() => {
              if (tabItem.selected || tabItem.name == this.selectedTab.name) {
                  if (tabItem.menuItems && tabItem.menuItems instanceof Array && tabItem.menuItems.length > 0) {
                      flush();
                      this._setSelectedMenuItem(tabItem);
                  }
                  this.reloadCurrentTab();
              } else {
                  // console.warn("tab is not yet selected", tabItem.selected, tabItem.name, this.selectedTab);
              }
          }, 1000);
      }
  }

  _menuProviderCreated(tabItem, menuProviderElement) {
      if (menuProviderElement) {
          if (tabItem && menuProviderElement.getMenu) {
              microTask.run(() =>
                  menuProviderElement.getMenu(tabItem, this._menuProviderCallback.bind(this, tabItem))
              );
          }
      }
  }

  _menuProviderCallback(tabItem, menuItems) {
      if (!tabItem) return;

      this.set('_calculatedTabItems.' + tabItem.index, tabItem);

      if (tabItem.menuItems) {
          if (!menuItems) {
              menuItems = [];
          }
          tabItem.menuItems.forEach(function (item) {
              menuItems.push(item);
          }, this);
      }

      if (!_.isEmpty(menuItems)) {
          this.set('_calculatedTabItems.' + tabItem.index + ".enableDropdownMenu", true);
          this.set('_calculatedTabItems.' + tabItem.index + ".menuItems", menuItems);
      } else {
          this.set('_calculatedTabItems.' + tabItem.index + ".enableDropdownMenu", false);
      }
      if (tabItem.selected || tabItem.name == this.selectedTab.name) {
          flush();
          this._setSelectedMenuItem(tabItem);
          this.readyToRender(true);
          this.reloadCurrentTab();
      }
  }

  _isDivider(item) {
      return item.name == "divider";
  }

  _onIronDeselect(e) {
      let tabName = e.detail.item.tabConfig.name;
      let currentItem = this._getTabGroup().querySelector("#" + tabName);
      if (currentItem) {
          let errorCircle = currentItem.shadowRoot.querySelector(".error-circle");
          errorCircle.hidden = true;
          errorCircle.textContent = "";
      }
  }

  _onIronSelect(e, retryCount) {
      //Dirty check while new tab menu item is selected
      let isDirty = this.getIsDirty();
      if (isDirty) {
          let cancelClicked = this._showWarning(e);
          if (cancelClicked) {
              let tabGrpObj = this.shadowRoot.querySelector("pebble-tab-group");
              tabGrpObj.resetSelection();
              return;
          }
      }

      this._currentTabErrorLength = 0; //reset errors
      if (isNaN(retryCount)) {
          retryCount = 1;
      }
      let currentApp = ComponentHelper.getCurrentActiveApp();
      if(currentApp) {
          let sideBar = currentApp.shadowRoot.querySelector("rock-sidebar");
          let entitySideBar = currentApp.shadowRoot.querySelector("rock-entity-sidebar");
          if(entitySideBar && entitySideBar.config && !entitySideBar.config.collapse && sideBar && sideBar.collapse && !sideBar.isUserTriggeredExpandCollapse
            && this._selectedTabConfig.tabConfig && this._selectedTabConfig.tabConfig.name !== e.detail.item.tabConfig.name) {
                ComponentHelper.fireBedrockEvent("open-sidebar","",{ ignoreId: true });      
          }
      }

      //NavigationContext needs to be set only when viewMode and viewModeSubMenu have been resolved
      let setnavConfig = true;
      let tagName = e.detail.item ? e.detail.item.tagName.toLowerCase() : undefined;

      if (tagName && !((tagName != 'paper-item' && this.viewMode) || (tagName == 'paper-item' && this.viewMode == e.detail.item.tabConfig.name))) {
          this.viewMode = "";
      }

      if (this.viewMode) {
          setnavConfig = false;
          let tab = this.getTabByName(this.viewMode);
          if (!tab) {
              return;
          }
          e.detail.item = tab;
          //Handle scenario for opening submenu item from the rock-tab dropdown
          if (this.viewModeSubMenu) {
              let menuItems = e.detail.item.tabConfig.menuItems;
              if (!_.isEmpty(menuItems)) {
                  let menuItemConfig = menuItems.filter(item => item.title === this.viewModeSubMenu);
                  e.detail.item.menuItemConfig = menuItemConfig[0];

                  let pebbleTabGroup = this.shadowRoot.querySelector("#" + this.id);
                  if(pebbleTabGroup) {
                      pebbleTabGroup.isMenuItemSelected = true;
                  }
                  
                  let menuListBox = e.detail.item.querySelector('paper-listbox');
                  if(menuListBox && _.isEmpty(menuListBox.selectedItem)) {
                      let selectedMenuItemId = e.detail.item.tabConfig.name + "-" + e.detail.item.menuItemConfig.name;
                      let selectedMenuItem = menuListBox.querySelector("#" + selectedMenuItemId);
                      if(selectedMenuItem) {
                          menuListBox._setSelectedItem(selectedMenuItem);
                      }
                  }
                  this.selectedTabIndex = e.detail.item.tabConfig.index;
                  this.viewModeSubMenu = "";
                  this.viewMode = "";
                  setnavConfig = true;
              } else {
                  //Handle the scenario where menuItems might not yet be loaded. For ex : User navigating from discovery page and loading a rock-tabs submenu directly
                  const maxRetryCount = 50;
                  timeOut.after(ConstantHelper.MILLISECONDS_100).run(() => {
                      if (_.isEmpty(menuItems)) {
                          if (retryCount < maxRetryCount) {
                              this._onIronSelect(e, ++retryCount);
                              return;
                          } else {
                              this.logError("rock-tabs - The menu-items did not load");
                          }
                      }
                  });
              }
          } else {
              this.viewMode = "";
              setnavConfig = true;
          }
      }

      if (!e || !e.detail || !e.detail.item) return;

      let tabGroup = this._getTabGroup();
      // Capturing selected tab configuration
      let tabConfig = this.selectedTab = e.detail.item.tabConfig;
      let menuItemConfig = e.detail.item.menuItemConfig;
      let subTitle = !_.isEmpty(menuItemConfig) ? menuItemConfig.title : '';

      //Capturing for Quick Manage, reload tab with this configuration
      this._selectedTabConfig = {
          "tabConfig": tabConfig,
          "menuItemConfig": menuItemConfig,
          "subTitle": subTitle
      };

      //update the navigationContext object to render accordingly after refresh
      if (!subTitle && menuItemConfig) {
          subTitle = menuItemConfig.title;
      }

      if (setnavConfig) {
          ComponentHelper.fireBedrockEvent("tab-nav-change", {
              "viewMode": tabConfig.name,
              "viewModeSubMenu": subTitle,
              "targetId": this.id
          }, {
                  ignoreId: true
              });
      } else {
          return;
      }

      if (tabConfig && menuItemConfig) {
          subTitle = menuItemConfig.title;
          if (this._renderOnTabSelection) { //protects multiple render because of ironselect being executed on first render
              this.readyToRender(true);
              this._loadContent(menuItemConfig, tabConfig.name);
          }
          this._resetSubTitles(tabConfig, subTitle);
      } else {
          if (this._renderOnTabSelection) {
              this.readyToRender(true);
              this._loadContent(tabConfig);
          }
          this._resetSubTitles(tabConfig, subTitle);
          this.selectedTabIndex = tabConfig.index;
      }
      if (subTitle) {
          this._applyMargin(tabConfig.name, true);
      } else {
          this._applyMargin(tabConfig.name, false);
      }

      tabGroup.highlightTabWithoutSelection(tabConfig.index);
  }

  _resetSubTitles(currentTabConfig, subtitle) {
      let tabsConfig = this.config.tabItems;
      let pebbleTabGroup = this._getTabGroup();

      if (!tabsConfig || !pebbleTabGroup) return;

      for (let index in tabsConfig) {
          let tabConfig = tabsConfig[index];
          let tab = pebbleTabGroup.querySelector("#" + tabConfig.name);

          if (!tab) continue;

          let tabSubTtile = tab.querySelector(".tab-subtitle-content");
          if (tabConfig && tabSubTtile) {
              if (currentTabConfig.name == tab.id) {
                  tabSubTtile.textContent = subtitle ? subtitle : "";
              } else {
                  tabSubTtile.textContent = "";
              }
          }
          let menu = tab.querySelector("paper-listbox");
          if (currentTabConfig.name !== tab.id && menu && menu.selected >= 0) {
              menu.selected = -1;
          }
      }
  }

  _loadContent(config, tabName, reload) {
      if (!this._isReadyToRender) return;

      if (!config || !config.component) {
          return this.logWarning("TabConfig");
      }

      this.showLoadingSpinner = true;

      const viewName = config.name;

      tabName = tabName || viewName;

      this._updateErrorVis(config.errorLength);

      this._isReadyToRender = false; //disable the flag again every render call must have readytorender() executed beforehand
      //enable iron select render only after the first render is complete.
      this._renderOnTabSelection = true;

      if (this.viewName === viewName && !reload) {
          this.showLoadingSpinner = false;
          return;
      };

      const contentElement = this._tabContent || this.shadowRoot.querySelector("#tab-content");

      ComponentHelper.displayNode(contentElement, false);

      this.viewName = viewName;
      this._currentTabName = tabName;

      this._tabChange(viewName);

      if (this.loadContentTimeoutId3) clearTimeout(this.loadContentTimeoutId);

      //Timeout needs to postpone the rendering until tab-animation has finished
      this.loadContentTimeoutId3 = setTimeout(() => {
          ComponentHelper.loadContent(contentElement, config.component, this, (content) => {
              content.readonly = this.readonly;
          });

          ComponentHelper.displayNode(contentElement, true);
          this.showLoadingSpinner = false;
      }, 500);
  }

  _applyMargin(tabName, apply) {
      let tab = this.getTabByName(tabName);

      if (!tab) return;

      let dropdownWrapper = tab.querySelector("#dropdown-wrapper");

      if (dropdownWrapper) {
          dropdownWrapper.style.marginTop = apply ? "2%" : "0%";
      }
  }

  readyToRender(renderReady) {
      this._isReadyToRender = renderReady;
  }

  refresh(options) {
      if (this._currentTabName) {
          let content = this._tabContent;
          if (content && content.firstChild) {
              content.firstChild.refresh(options);
          }
      }
  }

  editCurrentTab() {
      if (!this.shadowRoot) {
          return;
      }
      let currentElement = this._getTabGroup();

      if (!currentElement) {
          return;
      }
      let currentItem = currentElement.selectedItem;
      let currentTabConfig = undefined;
      let currentTabMenuConfig = undefined;

      if (currentItem) {
          currentTabConfig = currentItem.tabConfig;

          let menu = currentItem.querySelector('paper-listbox');
          let currentMenuItem;

          if (menu) {
              currentMenuItem = menu.selectedItem;
          }
          if (currentMenuItem) {
              currentTabMenuConfig = currentMenuItem.menuItemConfig;
          }
          if (currentTabConfig && this._selectedTabConfig && this._selectedTabConfig.tabConfig &&
              currentTabConfig.name !== this._selectedTabConfig.tabConfig.name) {
              currentTabConfig = this._selectedTabConfig.tabConfig;
              currentTabMenuConfig = this._selectedTabConfig.menuItemConfig;
          }
      }

      if (currentTabConfig && currentTabMenuConfig) {
          this._editContent(currentTabMenuConfig, currentTabConfig.name);
      } else {
          this._editContent(currentTabConfig, null);
      }

  }

  _editContent(config, tabName) {
      if (config) {
          let viewName = config.name;
          viewName = tabName ? tabName + '-' + viewName : viewName;
          let contentElement = this._tabContent;
          if (contentElement && contentElement.firstChild && typeof (contentElement.firstChild.globalEdit) == "function") {
              contentElement.firstChild.globalEdit();
          }
      }
  }

  reloadCurrentTab(isReloadByConfig) {
      //to reload the current selected tab after any changes to tabItemConfig
      //no inputs to this method. Find out the current selected tab and call _loadContent()
      if (!this.shadowRoot) {
          return;
      }
      let currentElement = this._getTabGroup();

      if (!currentElement) {
          return;
      }

      let currentItem = currentElement.selectedItem;

      let currentTabConfig = undefined;
      let currentTabMenuConfig = undefined;

      if (isReloadByConfig && this._selectedTabConfig.tabConfig) {
          currentTabConfig = this._selectedTabConfig.tabConfig;
          currentTabMenuConfig = this._selectedTabConfig.menuItemConfig;
      } else if (currentItem) {
          currentTabConfig = currentItem.tabConfig;
          let menu = currentItem.querySelector('paper-listbox');
          let currentMenuItem;
          if (menu) {
              currentMenuItem = menu.selectedItem;
          }
          if (currentMenuItem) {
              currentTabMenuConfig = currentMenuItem.menuItemConfig;
          }

          // Work Around: When user is reloading tab but currentMenuItem is not mataching
          //              with the one which is displayed to the user
          if (currentTabConfig && this._selectedTabConfig && this._selectedTabConfig.tabConfig &&
              currentTabConfig.name !== this._selectedTabConfig.tabConfig.name) {
              currentTabConfig = this._selectedTabConfig.tabConfig;
              currentTabMenuConfig = this._selectedTabConfig.menuItemConfig;

              // whenever a reload is happening, if current tabitem/menuitem config changes,
              // getting it from calculatedtabitems and assigning to currenttab and selected tab too
              let selectedTabConfig = this._calculatedTabItems.find(obj => obj.index === this._selectedTabConfig.tabConfig.index);
              if (selectedTabConfig) {
                  let menuItemConfig = !_.isEmpty(selectedTabConfig.menuItems) && this._selectedTabConfig.menuItemConfig ? selectedTabConfig.menuItems.find(obj => obj.name === this._selectedTabConfig.menuItemConfig.name) : undefined;
                  currentTabConfig = this._selectedTabConfig.tabConfig = selectedTabConfig;
                  if (menuItemConfig) {
                      currentTabMenuConfig = this._selectedTabConfig.menuItemConfig = menuItemConfig;
                  }
              }
          }
      }

      if (currentTabConfig && currentTabMenuConfig) {
          this._loadContent(currentTabMenuConfig, currentTabConfig.name, true);
      } else {
          this._loadContent(currentTabConfig, null, true);
      }
  }

  reloadTabs() {
      if (this.config && this.config.tabItems && this.config.tabItems.length > 0) {
          let tabItems = DataHelper.cloneObject(this.config.tabItems);
          for (let i = 0; i < tabItems.length; i++) {
              let tabItem = tabItems[i];
              let tabName = tabItem.name;
              let contentTab = this.shadowRoot.querySelector('pebble-tab[id=' + tabName + ']');
              if (contentTab) {
                  contentTab.tabConfig = tabItem;
              }
              this._fillMenuItems(tabItem);
          }
      }
      this.reloadCurrentTab();
  }

  reset() {
      this.set("_calculatedTabItems", []);
      this.selectedTabIndex = null;
  }

  _onSelectionChange(e, detail, sender) {
      this.viewMode = "";
      this.viewModeSubMenu = "";
      if (detail && (detail.defaultTab || detail.defaultSubMenu)) {
          this.viewMode = detail.defaultTab;
          this.viewModeSubMenu = detail.defaultSubMenu;
          this._onIronSelect(e);
      }
      let isDirty = this.getIsDirty();
      if (isDirty) {
          this._showWarning(e);
      }
  }

  getIsDirty() {
      if (this._currentTabName) {
          let content = this._tabContent;
          if (content && content.firstChild && content.firstChild.getIsDirty) {
              let isTabDirty = content.firstChild.getIsDirty();
              return isTabDirty;
          }
      }
  }

  getControlIsDirty() {
      if (this._currentTabName) {
          let content = this._tabContent;
          if (content && content.firstChild && content.firstChild.getControlIsDirty) {
              return content.firstChild.getControlIsDirty();
          }
      }
  }

  _onReadonly() {
      const tabView = this._tabContent && this._tabContent.firstChild;

      if (tabView)
          tabView.readonly = this.readonly;
  }

  _showWarning(event) {
      if (!window.confirm(
          "There are unsaved changes. Do you want to discard the changes?")) {
          event.preventDefault();
          return true;
      }
  }

  _getCurrentSelectedItem() {
      let tabGroup = this._getTabGroup();
      if (!tabGroup) return;
      return tabGroup.querySelector("#" + this._currentTabName);
  }

  _errorLengthChanged(errorLength) {
      let currentItem = this._getCurrentSelectedItem();
      if (!currentItem) return;

      let currentTabConfig = currentItem.tabConfig;
      let currentTabMenuConfig = currentItem.menuItemConfig;
      if (currentTabConfig && currentTabMenuConfig) {
          currentTabMenuConfig.errorLength = errorLength;
      } else {
          currentTabConfig.errorLength = errorLength;
      }
      this._updateErrorVis(errorLength);
  }

  _updateErrorVis(errorLength = 0) {
      let currentItem = this._getCurrentSelectedItem();
      if (!currentItem) return;
      let errorCircle = currentItem.shadowRoot.querySelector(".error-circle");
      if (errorLength > 0) {
          errorCircle.hidden = false;
          errorCircle.textContent = errorLength;
      } else {
          errorCircle.hidden = true;
          errorCircle.textContent = "";
      }
  }

  _temp(x) {
      return x;
  }

  arrayItem(change, index, path) {
      return this.get(path, change.base[index]);
  }

  _setSelectedMenuItem(tabItem) {
      let currentTab = this.shadowRoot.querySelector("#" + tabItem.name);
      if (!currentTab) return;

      let currentTabMenu = currentTab.querySelector("paper-listbox");
      if (currentTabMenu) {
          let selectedMenuIndex = this._getTabSelectedMenuIndex(tabItem);
          if (selectedMenuIndex >= 0) {
              currentTabMenu.selected = selectedMenuIndex;
          } else {
              //Reset menu, subtitle and load root content
              currentTabMenu.selected = -1;
              this._selectedTabConfig.menuItemConfig = undefined;
              this._resetSubTitles(currentTab.tabConfig, "");
              this._isReadyToRender = true;
          }
      }
  }

  _getTabSelectedMenuIndex(tabItem) {
      if (typeof tabItem.selectedMenuIndex != "undefined" && tabItem.selectedMenuIndex >= 0)
          return tabItem.selectedMenuIndex;

      if (!tabItem || !tabItem.menuItems || !tabItem.menuItems.length) return -1;

      let menuItems = tabItem.menuItems;

      for (let i = 0; i < menuItems.length; i++) {

          if (this._selectedTabConfig && this._selectedTabConfig.menuItemConfig) {
              if (this._selectedTabConfig.menuItemConfig.name == menuItems[i].name) {
                  return i;
              }
          } else {
              if (menuItems[i].selected) {
                  return i;
              }
          }
      }
  }
}
customElements.define(RockTabs.is, RockTabs);
