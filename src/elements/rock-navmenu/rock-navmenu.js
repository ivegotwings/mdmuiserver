/**
`rock-navmenu` Represents the main menu component to navigate in the framework. It implements an accessible material design menu. 

@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/iron-collapse/iron-collapse.js';
// import '@polymer/paper-menu/paper-submenu.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '../bedrock-helpers/element-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-paper-listbox.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-button/pebble-button.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-badge/pebble-badge.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../pebble-horizontal-divider/pebble-horizontal-divider.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockNavmenu
    extends mixinBehaviors([
        RUFBehaviors.ComponentConfigBehavior
    ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-icons bedrock-style-padding-margin bedrock-style-paper-listbox">
            :host {
                --pebble-badge: {
                    background: var(--palette-white, #ffffff);
                    color: var(--default-text-color, #444444);
                    margin-top: 4px;   
                    border-color: var(--palette-white, #ffffff);                                     
                };
            } 
            pebble-badge {
                font-weight: normal;
                font-size: var(--font-size-xs, 10px);
                border-radius: 50%;
                position: absolute;
                top: 1px !important;
                right: 6px;
                left: auto!important;
            }
            .drawer-content {
                background-color: var(--left-nav-background, var(--mdm-secondary-color, #364653));
                color: var(--palette-white, #ffffff) !important;
                height: 100%;
                position: relative;
                z-index: 999;                   
                display:block;                
            }
            .drawer-content::-webkit-scrollbar-track {
                -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
                background-color: #A9A9AA;
            }
            .drawer-content::-webkit-scrollbar {
                width: 4px;
                background-color: #A9A9AA;
            }

            .drawer-content::-webkit-scrollbar-thumb {
                background-color: #A9A9AA;
                border: 1px solid #A9A9AA;
            }
            pebble-icon{
                --pebble-icon: {
                    fill: var(--paletter-white, #ffffff);
                    margin-top:10px;
                    margin-right:12px;
                    margin-bottom:10px;
                    margin-left:13px;
                };
            }
            pebble-icon:hover {
                color: var(--left-nav-link-over, #78a4c7);
            }         
            a {
                text-decoration: none;
                color: var(--paletter-white, #ffffff);
                display: -ms-flexbox;
                display: -webkit-flex;
                display: inline-flex;
                display: -webkit-inline-flex;
                flex: 0 0 auto;
                /* for IE 11*/
                object-fit: scale-down;
                /* for FireFox */
                flex-direction: row;
                -webkit-flex-direction: row;
                flex: 0 0 auto;                    
                /* for FireFox */
                -ms-flex-align: center;
                align-items: center;
                -webkit-align-items: center;
                /* Safari 7.0+ */
                -webkit-font-smoothing: antialiased;
                text-rendering: optimizeLegibility;
                font-family: var(--default-font-family);
                font-size: var(--default-font-size, 14px);
                font-weight: var(--font-regular, 400);
                line-height: 24px;
                white-space: nowrap;
                /* overflow: hidden; commented as part of Edge perf. */ 
                box-sizing: border-box;
                cursor: pointer;
                transition: all 0.3s;
                -webkit-transition: all 0.3s;
            }
            a:hover {
                color: var(--left-nav-link-over, #78a4c7);
            }
            a[hide] {
                display: none;
            }
            paper-listbox {
                padding: 0;
                background-color:transparent;
                max-height:100%;
                overflow-y: auto;
                overflow-x: hidden;
            }
            paper-listbox paper-item{
                padding-left:0;
                padding-right:0;
                font-size: var(--default-font-size, 14px);
                cursor: pointer;
                outline: none;
                white-space: nowrap;
                overflow: hidden;
                width: 255px;
                box-sizing: border-box;
                color: var(--palette-white, #ffffff);
                opacity: 0.95;
                @apply --layout;
                @apply --layout-horizontal;
            }
            paper-item {
                --paper-item: {
                    cursor: pointer;
                    padding: 0px;
                    min-height: 40px;
                };
            }
            .sublist paper-item {
                padding-left: 30px;
                padding-right: 25px;
                position: relative;
            }
            paper-listbox paper-item pebble-icon {
                 margin-left: -4px; 
            }
            paper-listbox paper-item pebble-icon:hover {
                --pebble-icon-color: {
                    fill: var(--left-nav-link-over, #78a4c7);
                } 
            }
            #headerMenuItem {
                @apply --transition;
                width: 45px;
                height: 40px;
                position: absolute;
                top: -40px;
                background: var(--left-nav-background, var(--mdm-secondary-color, #364653));
            } 

            /* IE edge specific fix for #headerMenuItem */
            _:-ms-lang(x), _:-webkit-full-screen,  #headerMenuItem { 
                width: 50px;
            }
            @-moz-document url-prefix() {
                #headerMenuItem {
                    width: 50px;
                }
            }

            .menu-item:after,
            .menu-item:before,
            #headerMenuItem:before,
            #headerMenuItem:after {
                display: none;
            }
            .menuIcon {
                float: left;
                cursor: pointer;
                position: relative;
                padding: 5px 15px;
                --pebble-icon: {
                    fill: var(--button-text-color, #ffffff);
                };
            }
            pebble-horizontal-divider {
                margin-left: 8px;
                margin-right: 8px;
                background-color: var(--left-menu-divider, #6b7d8d);
            }
            .selected{
                display: none;
            }
            .selected {
                width: 4px;
                height: 30px;
                background-color: var(--left-menu-selected-border);
                position: absolute;
                top: 5px;
                left: 0;
            }
            .subMenuSelected {
                width: 4px;
                height: 40px;
                background: var(--palette-white, #ffffff);
                color: var(--default-text-color, #444444);
                margin-top: 4px;   
                border-color: var(--palette-white, #ffffff);                                     
            }
            .righticon {
                position:absolute; 
                right:6px;
                top:0;
            }
            .subHeaderSubtext {
                font-size: var(--font-size-xs);
            }            
            #close {
                --pebble-icon:{
                    width:14px;
                    height: 14px;
                    margin-top: 5px;
                    margin-right: 5px;
                    margin-bottom: 5px;
                    margin-left: 5px;
                }
            }

            .closeAll {
                opacity : 0;                   
            }
            .btn-link {
                font-size: var(--font-size-sm, 12px);
                padding-top: 0px;
                padding-right: 0px; 
                padding-bottom: 0px;
                padding-left: 5px;
                color: var(--palette-white, #ffffff);
            }
            paper-listbox paper-item:hover .closeAll{
                opacity : 0.65;
            }
            .showMoreLess{
                padding-left: 45px;
                cursor: pointer;                    
                color: #ffffff;
                opacity: 0.65;                    
            }
            .page-title{
                width:calc(100% - 60px);
                display: inline-block;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .page-title-icon{
                display:inline-block;
            }
            .underline{
                --pebble-button: {
                    text-decoration: underline;
                    padding-top: 0;
                    padding-right: 0;
                    padding-bottom: 0;
                    padding-left: 0;
                }
            }
            .menu-selected .selected{
                display: block;
            }
            .menu-selected-open{
                background:#fff;
                color:var(--left-nav-background, var(--mdm-secondary-color, #364653));
            }
            .menu-selected-open a,.menu-selected-open paper-item{
                font-weight: bold;
                color:var(--left-nav-background, var(--mdm-secondary-color, #364653));
            }
            .menu-selected-open pebble-icon{
                --pebble-icon-color: {
                    fill:var(--left-nav-background, var(--mdm-secondary-color, #364653));
                }
            }            
        </style>
      <div class="drawer-content">
        <paper-item id="headerMenuItem">
            <span id="toggleItem" class="menuIcon" on-click="_onHamburgerIconClick">
                <pebble-icon icon="pebble-icon:navigation-menu" class="pebble-icon-size-16 pebble-icon-color-white"></pebble-icon>
            </span>
        </paper-item>
        <paper-listbox id="mainMenu" attr-for-item-title="label" multi="" attr-for-selected="data-route" selected="{{page}}">
           <template is="dom-repeat" items="[[menuItems]]">
               <template is="dom-if" if="[[_checktitle(item.name)]]">
                <template is="dom-if" if="[[!_isDivider(item)]]">
                    <template is="dom-if" if="[[_hasSubmenu(item)]]">
                        <paper-listbox label="[[item.title]]">
                            <paper-item class="menu-trigger">
                                <template is="dom-if" if="[[_subMenuSelected(item,page,queryParams)]]">
                                    <div class="selected"></div>
                                </template>
                                <span on-click="_onSubMenuIconClick" item="[[item]]" class="menuIcon">
							        <pebble-icon id="menuIcon[[index]]" icon="{{item.icon}}" class="pebble-icon-color-white pebble-icon-size-20"></pebble-icon>
                                    <pebble-badge for="menuIcon[[index]]" label="[[_getWindowCount(item.menuItems)]]"></pebble-badge>                                    
                                </span>                                                                
                                <a item="[[item]]" is-landing-page\$="[[item.isLandingPage]]" on-tap="_menuClicked" title="[[item.title]]">{{item.title}}</a>
                                <div class="closeAll"><pebble-button class="btn-link" data-items="{{item.menuItems}}" on-tap="_onCloseAll" button-text="Close All"></pebble-button></div>
                            </paper-item>
                                <template is="dom-if" if="[[_isMenuOpened]]">
                                    <paper-listbox id="mainItem[[index]]" show-all="false" class="menu-content sublist" multi="">
                                        <template is="dom-repeat" items="{{item.menuItems}}" as="subMenuItem" index-as="submenu_index">                                                            
                                            <template is="dom-if" if="[[!_isSubMenuItemsHidden(submenu_index,item.menuItems.length,index,showAll)]]">
                                                <a id="submenuIcon[[submenu_index]][[index]]" class\$="[[_selected(subMenuItem,page,queryParams,_isMenuOpened)]]" sub-menu-item="[[subMenuItem]]" on-tap="_subMenuClicked" title="[[_getSubMenuToolTip(subMenuItem,item)]]">
                                                        <div class="selected"></div>
                                                    <paper-item item="[[item]]">                                                                    
                                                        <template is="dom-if" if="[[_hasAppStatus(subMenuItem)]]">
                                                            <div class="text-ellipsis m-l-20 ">
                                                                [[_getMinimizedAppTitle(subMenuItem)]]
                                                                <div class="subHeaderSubtext">[[_getMinimizedAppSubTitle(subMenuItem)]]<div>
                                                            </div>
                                                        </div></div></template>
                                                        <template is="dom-if" if="[[!_hasAppStatus(subMenuItem)]]">
                                                            <div class="text-ellipsis m-l-10 p-10">[[subMenuItem.title]]</div>
                                                        </template>
                                                        <template is="dom-if" if="[[!item.nonClosable]]">
                                                            <pebble-icon name="close" id="close" icon="pebble-icon:window-action-close" title="Close" on-tap="_onCloseClick" class="righticon pebble-icon-size-10 pebble-icon-color-white"></pebble-icon>
                                                        </template>                                                                    
                                                    </paper-item>
                                                </a>
                                            </template>
                                            <template is="dom-if" if="[[_isShowMoreSubMenuItems(submenu_index,item.menuItems.length,index,showAll)]]">
                                                <div class="showMoreLess"><pebble-button class="btn-link underline" target-id="mainItem[[index]]" on-tap="_onShowMoreClick" button-text="[[_getRemainingSubMenuItems(item.menuItems.length)]] more open"></pebble-button></div>
                                            </template>                                                           
                                        </template>
                                        <template is="dom-if" if="[[_isShowLessSubMenuItems(index,item.menuItems.length,showAll)]]">
                                            <div class="showMoreLess"><pebble-button class="btn-link underline" target-id="mainItem[[index]]" on-tap="_onShowLessClick" button-text="show less"></pebble-button></div>
                                        </template>
                                    </paper-listbox>
                                </template>
                        </paper-listbox>
                    </template>
                    <template is="dom-if" if="[[!_hasSubmenu(item)]]">
                        <paper-item class\$="menu-item [[_selected(item,page,queryParams,_isMenuOpened)]]">
                            <a item="[[item]]" is-landing-page\$="[[item.isLandingPage]]" id="pageMenuIcon" class="menuIcon page-title-icon" on-tap="_menuClicked" title="[[item.title]]">
                                 <div class="selected"></div>
                                <pebble-icon id="menuIcon[[index]]" icon="{{item.icon}}" class="pebble-icon-color-white"></pebble-icon>
                            </a>
                                <a item="[[item]]" class="page-title" title="[[item.title]]" is-landing-page\$="[[item.isLandingPage]]" on-tap="_menuClicked">[[item.title]]</a>
                        </paper-item>
                    </template>
                </template>
                <template is="dom-if" if="[[_isDivider(item)]]">
                    <pebble-horizontal-divider></pebble-horizontal-divider>
                </template>
               </template>
            </template>           
        </paper-listbox>
      </div>
`;
  }

  static get is() {
      return 'rock-navmenu';
  }
  static get observers() {
      return [
          "_activeItemsAddedRemoved(activeItems.splices)"
      ]
  }

  static get properties() {
      return {
          menuItems:
              {
                  type: Array,
                  notify: true,
                  value: function () {
                      return [];
                  }
              },
          /**
          * Specifies the route of the current page if routing is enabled.
          * 
          */
          route: {
              type: Object,
              notify: true
          },
          /**
          * Specifies the current route page if routing is enabled.
          * 
          */
          page: {
              type: String,
              notify: true
          },
          /**
         * Specifies the current route page's query parameters.
         * 
         */
          queryParams: {
              type: Object,
              notify: true
          },
          /**
           * Specifies the list of the links which are opened and are not part of the menu.
           *
           */
          activeItems: {
              type: Array,
              notify: true
          },

          /**
          * Specifies the openwindow menu.
          * 
          */
          _openedWindowMenu: {
              type: Object,
              value: function () {
                  return {
                      name: "openedWindows",
                      title: "Other Open Windows",
                      icon: "pebble-icon:open-windows",
                      menuItems: []
                  };
              }
          },

          /**
          * Specifies the unused menu. 
          * 
          */
          _dummyMenu: {
              type: Object,
              value: function () {
                  return {
                      name: "dummyMenu",
                      title: "",
                      icon: "",
                      menuItems: []
                  };
              }
          },

          /**
          * Specifies that window should not be collapsed.
          * 
          */
          doNotCollapse: {
              type: Boolean,
              value: false
          },

          /**
          * Specifies the menu is in expanded/opened view or not
          * 
          */
          _isMenuOpened: {
              type: Boolean,
              value: false
          },

          /**
          * Specifies the max open windows that will be shown under each main icon
          * 
          */
          _maxVisibleSubMenu: {
              type: Number,
              value: 2
          },

          showAll: {
              type: Boolean,
              value: false
          },
          contextData: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: '_onContextDataChange'
          },
          mainMenuWidth: {
              type: String,
              value: "45px"
          }
      }
  }


  /**
  * Specifies the list of menu item as a JSON array.
  * The following format depicts the JSON menu item format:
   { 
      "name": "charts",
      "title": "Charts",
      "data_route": "charts",
      "icon": "pebble-icons:trending-up"
   }
  * 
  */

  connectedCallback() {
      super.connectedCallback();
      this.mainMenuWidth = "45px";
      //Set width as 50px for Edge browser 
      if (DataHelper.checkBrowser('edge') || DataHelper.checkBrowser('firefox')) {
          this.mainMenuWidth = "50px";
      }
  }

  _onContextDataChange(){
      if(!_.isEmpty(this.contextData)) {
          let context = DataHelper.cloneObject(this.contextData);
          let appName = ComponentHelper.getCurrentActiveAppName();
          if(appName) {
              context[ContextHelper.CONTEXT_TYPE_APP] = [{
                  "app": appName
              }];
          }
          this.requestConfig("rock-navmenu", context);
      }
  }
  onConfigLoaded (componentConfig) {
      if(componentConfig && componentConfig.config) {
          this.menuItems = DataHelper.convertObjectToArray(componentConfig.config);
          RUFUtilities.menuTitles = this.menuItems.map((item) => {return item.name});
      }
  }

  onConfigError (error) {
      // message to be shown. TBD where to show and what
  }
  /**
  * Can be used to check whether the menu item has submenu.
  *
  * @param {Element} item A menu item
  */
  _hasSubmenu (item) {
      if (item.menuItems && item.menuItems.length > 0) {
          return true;
      }
      else {
          return false;
      }
  }

  /**
  * Can be used to check whether menu item is a divider.
  *
  * @param {Element} item A menu item
  * 
  */
  _isDivider (item) {
      return item.name == "divider";
  }

  /**
   * Can be used to toggle the size of side menu and collapse the opened sub-menus.
   */
  _onHamburgerIconClick (e) {
      this._collapseExpandDrawer();
      this._collapseSubMenu();
      ElementHelper.noBubble(e);
  }

  /**
   * Can be used to trigger an event on clicking the icon of menu which contains sub-menus. It toggles the sub-menus and toggles the size of side menu bar.
   */
  _onSubMenuIconClick (e) {
      e = e || window.event;
      this._collapseExpandDrawer();
      let collapse = e.currentTarget.parentElement;//.parentElement.parentElement.$.collapse || e.currentTarget.parentElement.parentElement.$.collapse;
      let trigger = e.currentTarget.parentElement;//.parentElement.parentElement.$.trigger || e.currentTarget.parentElement.parentElement.$.trigger;
      if (collapse.className.indexOf("iron-selected") > -1) {
          trigger.click();
      }
      ElementHelper.noBubble(e);
  }

  /**
   * Can be used to trigger an event on clicking the sub-menu item. It toggles the size of side menu bar.
   */
  _onSubMenuItemClick (e) {
      e = e || window.event;
      this._collapseExpandDrawer();
      ElementHelper.noBubble(e);
  }

  /**
   * Can be used to collapse the side menu list.
   */
  _collapseSubMenu () {

      let subMenus = dom(this.$.mainMenu).querySelectorAll("paper-submenu");
      if (subMenus && subMenus.length > 0) {
          for (let i = 0; i < subMenus.length; i++) {
              if (subMenus[i].$.collapse.className.indexOf("iron-collapse-opened") > -1) {
                  subMenus[i].$.trigger.click();
              }
          }
      }
  }

  /**
   *  Can be used to toggle the size of the side menu.
   */
  _collapseExpandDrawer (collapsed) {
      //Edge doesnt support transition
      let edgeBrowser = DataHelper.checkBrowser('edge');
      let firefoxBrowser = DataHelper.checkBrowser('firefox');
      if(!edgeBrowser) {
          RUFUtilities.drawerLayout.transitionDuration = '200';
      }                     
      let drawer = RUFUtilities.appCommon.shadowRoot.querySelector("#drawerLayout");
      let mainMenu = this.shadowRoot.querySelector("#mainMenu");
      let subMenuContent = this.shadowRoot.querySelector(".menu-content");
      if (drawer) {
          //ToDo: remove hard coded style and use class toggle                      
          if (!collapsed && drawer.style.width == this.mainMenuWidth) {
              drawer.setAttribute("menu-expanded", "");
              this._isMenuOpened = true;
              drawer.style.width = "266px";
              drawer.$.contentContainer.style.width = "266px";
              if(subMenuContent)
              {
                  subMenuContent.style.visibility = "visible";                                
              }
          }
          else {
              if(subMenuContent){
                  subMenuContent.style.visibility = "hidden";                               
              }
              this.mainMenuWidth = "45px";  
              //Set the navmenu width as 50px for Edge browser if scrollbar is visible
              if((firefoxBrowser || edgeBrowser) && mainMenu && mainMenu.scrollHeight > mainMenu.clientHeight) {
                  this.mainMenuWidth = "50px";                                
              } 
              this._collapseSubMenu();
              drawer.removeAttribute("menu-expanded");
              this._isMenuOpened = false;
              drawer.style.width = this.mainMenuWidth;
              drawer.$.contentContainer.style.width = this.mainMenuWidth;                                                  
          }
      }
  }

  /**
   *  It is a close click handler for submenu close icon
   */
  _onCloseClick (e) {
     this.doNotCollapse = true;
     e.cancelBubble = true;
     this.dispatchEvent(new CustomEvent("menu-close-click", {detail:{ "item": e.currentTarget.parentElement.parentElement.subMenuItem },bubbles:true,composed:true}));
  }

  /**
   *  Handle the close all click
   */
  _onCloseAll(e){
      e.cancelBubble = true;
      let closableItems = e.currentTarget.dataItems;
      //Reversing the closable items to get the proper previous view as active items are reversed while displaying in this._activeItemsAddedRemoved method 
      closableItems = closableItems.reverse();                    
      for(let i=0;i<closableItems.length;i++){
          this.doNotCollapse = true;                    
          this.dispatchEvent(new CustomEvent("menu-close-click", {detail:{ "item": closableItems[i] },bubbles:true,composed:true}));
      }                  
  }

  /**
   *  Can be used to check whether or not a menu-item is selected.
   */
  _selected (item, page, queryParams,isMenuOpened) {
      let menuSelected ="menu-selected"
      if(isMenuOpened){
          menuSelected ="menu-selected-open"
      }
      if (!queryParams || isEmpty(queryParams)) {
          if ((item.data_route == page && !item.queryParams) || (item.isLandingPage && page == "")) {
              return menuSelected;
          }
      } else {
          if ((item.data_route == page && JSON.stringify(queryParams) == JSON.stringify(item.queryParams)) || (item.isLandingPage && page == "")) {
              return menuSelected;
          }
      }
      return false;
  }

  /**
   *  Can be used to check whether or not any of menu item's sub-menu is selected.
   */
  _subMenuSelected (item, page) {
      for (let i = 0; i < item.menuItems.length; i++) {
          if (item.menuItems[i].data_route == page) {
              return true;
          }
      }
      return false;
  }

  /**
   *  It is a click event handler for menu item click
   */
  _menuClicked (e) {
      this._changeRoute(e.currentTarget.item,e);
  }

  /**
   *  It is a click event handler for submenu click
   */
  _subMenuClicked (e) {
      this._changeRoute(e.currentTarget.subMenuItem,e);
  }

  /**
   *  It is used to change the application route
   */
  _changeRoute (item,e) {
      let queryParams = {};

      if (item.queryParams) {
          queryParams = item.queryParams;
      }

      let mainApp = RUFUtilities.mainApp;
      let isDirty = mainApp.getIsDirty();
      let drawer = RUFUtilities.appCommon.shadowRoot.querySelector("#drawerLayout");
      if (isDirty) {
          if (window.confirm("There are unsaved changes. Do you want to discard the changes?")) {
              let contentViewManager = mainApp.contentViewManager;
              let currentViewName = contentViewManager.currentViewName;
              contentViewManager.currentViewName = "";
              contentViewManager.closeView(currentViewName);
          }
          else {
              return;
          }
      }
      
      if (item.data_route == mainApp.pageRoute.path) {                       
          if(item.queryParams && mainApp.pageRoute.__queryParams && item.queryParams.id != mainApp.pageRoute.__queryParams.id){
              if(!(e.currentTarget.id == "pageMenuIcon" && drawer.style.width == this.mainMenuWidth)){
                  this._onHamburgerIconClick(e);
              }
          }
          ComponentHelper.setQueryParamsWithoutEncode(queryParams);
      } else {
          if(!(e.currentTarget.id == "pageMenuIcon" && drawer.style.width == this.mainMenuWidth)){
              this._onHamburgerIconClick(e);
          }
          ComponentHelper.setQueryParamsWithoutEncode(queryParams);
          mainApp.changePageRoutePath(item.data_route);                        
      }
      
  }

  /**
   *  It's an observer for submenu items, so whenever submenu items gets changed, it executes
   */
  _activeItemsAddedRemoved () {

      if (this.menuItems && this.menuItems.length) {
          let menus = DataHelper.cloneObject(this.menuItems);
          let activeItems = DataHelper.cloneObject(this.activeItems);
          let removedActiveItems = []; 
          
          //Remove the items which will not have submenus
          activeItems = activeItems.filter(function(item){
              if(item.queryParams)return item;
          });
          
          //Reset the dummy item 
          if(this._isDummyItem(menus[menus.length-1])){
              menus.splice(menus.length-1,1);
          }

          //Getting the latest item to the first
          activeItems = activeItems.reverse(); 

          //Reset the submenu items
          for(let i=0;i<menus.length;i++) {
              if(menus[i].menuItems){
                  menus[i].menuItems.length = 0;
              }                            
          }                                      

          //Populate the submenu items                                  
          if (activeItems.length) {
              for(let j=0;j<activeItems.length;j++){
                  for(let i=0;i<menus.length;i++) {
                      if(activeItems[j].data_route == menus[i].name){  
                          if(!menus[i].menuItems){
                              menus[i].menuItems = [];
                          }                                             
                          menus[i].menuItems.push(activeItems[j]);
                          removedActiveItems.push(j);
                          break;                                                                        
                      }                                                                       
                  }
              }
          }

          //Remove the assigned activeItems
          if(removedActiveItems.length > 0){
              activeItems = activeItems.filter(function(val,index){
                  return removedActiveItems.indexOf(index)==-1;
              })
          }
          
          //Reset the openwindows 
          if(this._isOpenedWindowsItem(menus[menus.length-1])){
              menus.splice(menus.length-1,1);
          }

          //Adding the rest of the active items to open windows                       
          if (activeItems.length) {
              let openedWindowItem = DataHelper.cloneObject(this._openedWindowMenu);
              openedWindowItem.menuItems = [];
              for(let j=0;j<activeItems.length;j++){
                  openedWindowItem.menuItems.push(activeItems[j]);                                
              }
              //Add the openwindows
              menus[menus.length] = openedWindowItem;
          }

          //Add the dummy item
          //Fix for FF and Edge - splicing last item of the array doesnt update UI, hence adding a dummy item as the last item
          let dummyItem = DataHelper.cloneObject(this._dummyMenu);
          menus[menus.length] = dummyItem;

          //Reset and populate the menu
          this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(500), () => {
              if (menus) {
                  this.set("menuItems", []);
                  this.set("menuItems",menus);
              }                           
          });                     
          
      }
  }

  /**
   *  Returns the submenu items count
   */
  _getWindowCount(items){
      return items.length;
  }

  /**
   *  It checks whether the current menu item is opened windows item
   */
  _isOpenedWindowsItem (item) {
      return item.name == "openedWindows";
  }

  /**
   *  It checks whether the current menu item is dummy item
   */
  _isDummyItem (item) {
      return item.name == "dummyMenu";
  }

  /**
   *  Opened windows menu item will have submenu with app status so it checks whether that property is there or not
   */
  _hasAppStatus(subMenuItem){
      return subMenuItem && subMenuItem.appStatus ? true : false; 
  }

  /**
   *  Get the submenu/item title
   */
  _getMinimizedAppTitle(subMenuItem){
      if(subMenuItem && subMenuItem.appStatus && subMenuItem.appStatus.title && subMenuItem.appStatus.title != ""){
         return subMenuItem.appStatus.title;
      } else if(subMenuItem.title){
         return subMenuItem.title;
      }
      return;
  }

  /**
   *  Get the submenu title
   */
  _getMinimizedAppSubTitle(subMenuItem){
      return  "(" + subMenuItem.appStatus.subTitle + " " + subMenuItem.appStatus.subTitleValue + ")";
  }

  /**
   *  It provides submenu tooltip
   */
  _getSubMenuToolTip(subMenuItem,item){
      let line1 = this._getMinimizedAppTitle(subMenuItem);
      if(!line1) {
          line1 = item.title;
      }
      //var line2 = this._getMinimizedAppSubTitle(subMenuItem);
      let tooltip = line1;
      return tooltip;
  }

  /**
   *  Check if the submenu items must be hidden or not
   */
  _isSubMenuItemsHidden(index,subMenuLength,mainItemIndex,showAll){
      
      let obj = this.shadowRoot.querySelector("#mainItem"+mainItemIndex);
      if(obj && obj.getAttribute("show-all") == "true"){
          return false;
      }                        
      
      if(subMenuLength <= this._maxVisibleSubMenu){
          return false;
      } else {
          if(index+1 <= this._maxVisibleSubMenu){
              return false;
          } else {
              return true;
          }
      }
  }

  /**
   *  Check if show more items must be shown
   */
  _isShowMoreSubMenuItems(index,subMenuLength,mainItemIndex,showAll){
      if(this._isSubMenuItemsHidden(index,subMenuLength,mainItemIndex,showAll)){
          if(index == this._maxVisibleSubMenu){
              return true;
          }
      }
      return false;
  }

  /**
   *  Check if show less items must be shown
   */
  _isShowLessSubMenuItems(mainItemIndex,menuLength){
     if(menuLength <= this._maxVisibleSubMenu){
         return false;
     }
     let obj = this.shadowRoot.querySelector("#mainItem"+mainItemIndex);
     if(obj && obj.getAttribute("show-all") == "true"){
         return true;
     }
     return false;
 }

  /**
   *  Returns the count of the submenuItems that were hidden under "more open" link
   */
  _getRemainingSubMenuItems(itemLength){
      return itemLength-this._maxVisibleSubMenu;
  }

  /**
   *  Handling show more items click
   */
  _onShowMoreClick(e){
      e.cancelBubble = true;
      this.doNotCollapse = true; 
      let obj = this.shadowRoot.querySelector("#"+e.currentTarget.targetId);
      obj.setAttribute("show-all", "true");
      this.showAll = !this.showAll;
  }

  /**
   *  Handling show less items click
   */
  _onShowLessClick(e){
      e.cancelBubble = true;
      this.doNotCollapse = true; 
      let obj = this.shadowRoot.querySelector("#"+e.currentTarget.targetId);
      obj.setAttribute("show-all", "false");
      this.showAll = !this.showAll;
  }
  _checktitle(title){
      return title == "dummyMenu" ? false : true;
  }
}
customElements.define(RockNavmenu.is, RockNavmenu)
