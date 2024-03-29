/**
` <pebble-tab-group>` Represents a group of tabs with material design styling.

### Accessibility

See the docs for `Polymer.IronResizableBehavior`, `Polymer.IronMenubarBehavior` for accessibility features implemented by this element.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { IronMenubarBehavior } from '@polymer/iron-menu-behavior/iron-menubar-behavior.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import '@polymer/paper-tabs/paper-tabs-icons.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../pebble-tab/pebble-tab.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { IronMenuBehaviorImpl } from '@polymer/iron-menu-behavior/iron-menu-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleTabGroup extends mixinBehaviors([RUFBehaviors.UIBehavior, IronResizableBehavior, IronMenubarBehavior], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-icons bedrock-style-padding-margin">
            :host {
                @apply --layout;
                @apply --layout-center;
                height: var(--default-tab-height);
                font-size: var(--default-font-size, 14px);
                font-weight: var(--font-medium, 500);
                /*overflow: hidden;*/
                -moz-user-select: none;
                -ms-user-select: none;
                -webkit-user-select: none;
                user-select: none;
                /* NOTE: Both values are needed, since some phones require the value to be \`transparent\`. */
                -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
                -webkit-tap-highlight-color: transparent;
                @apply --paper-tabs;
                border-bottom: 1px solid var(--palette-cloudy-blue, #c1cad4);
                box-sizing: border-box;
                margin-top: 5px;
            }

            :host-context([dir=rtl]) {
                @apply --layout-horizontal-reverse;
            }

            #tabsContainer {
                position: relative;
                height: 100%;
                white-space: nowrap;
                overflow: hidden;
                @apply --layout-flex-auto;
                @apply --paper-tabs-container;
            }

            #tabsContent {
                height: 100%;
                flex-basis: auto;
                -webkit-flex-basis: auto;
                /* Safari 6.1+ */
                @apply --paper-tabs-content;
            }

            #tabsContent.scrollable {
                position: absolute;
                white-space: nowrap;
            }

            #tabsContent:not(.scrollable),
            #tabsContent.scrollable.fit-container {
                @apply --layout-horizontal;
            }

            #tabsContent.scrollable.fit-container {
                min-width: 100%;
            }

            #tabsContent.scrollable.fit-container> ::slotted(*) {
                /* IE - prevent tabs from compressing when they should scroll. */
                -ms-flex: 1 0 auto;
                -webkit-flex: 1 0 auto;
                flex: 1 0 auto;
            }

            .hidden {
                display: none;
            }

            .not-visible {
                opacity: 0;
                cursor: default;
            }

            pebble-tab paper-menu paper-item {
                padding: 0 10px;
            }

            #selectionBar {
                position: absolute;
                height: 2px;
                bottom: 0;
                left: 0;
                right: 0;
                background: var(--palette-cerulean-two, #026bc3);
                -webkit-transform: scale(0);
                -ms-transform: scale(0);
                transform: scale(0);
                -webkit-transform-origin: left center;
                -ms-transform-origin: left center;
                transform-origin: left center;
                transition: -webkit-transform;
                transition: transform;
                @apply --paper-tabs-selection-bar;
            }

            #selectionBar.align-bottom {
                top: 0;
                bottom: auto;
            }

            #selectionBar.expand {
                transition-duration: 0.15s;
                -webkit-transition-duration: 0.15s;
                transition-timing-function: cubic-bezier(0.4, 0.0, 1, 1);
                -webkit-transition-timing-function: cubic-bezier(0.4, 0.0, 1, 1);
            }

            #selectionBar.contract {
                transition-duration: 0.18s;
                -webkit-transition-duration: 0.18s;
                transition-timing-function: cubic-bezier(0.0, 0.0, 0.2, 1);
                -webkit-transition-timing-function: cubic-bezier(0.0, 0.0, 0.2, 1);
            }

            /* #tabsContent> ::slotted(*) {
                height: 100%;
            } */
        </style>
        <pebble-icon icon="pebble-icon:action-scope-release-selection" class\$="[[_computeScrollButtonClass(_leftHidden, scrollable, hideScrollButtons)]] pebble-icon-size-16 m-r-15 m-l-5" on-up="_onScrollButtonUp" on-down="_onLeftScrollButtonDown" tabindex="-1" noink=""></pebble-icon>

        <div id="tabsContainer" on-down="_down">
            <div id="tabsContent" class\$="[[_computeTabsContentClass(scrollable, fitContainer)]]">
                <div id="selectionBar" class\$="[[_computeSelectionBarClass(noBar, alignBottom)]]" on-transitionend="_onBarTransitionEnd"></div>
                <slot></slot>
            </div>
        </div>

        <pebble-icon icon="pebble-icon:action-scope-take-selection" class\$="[[_computeScrollButtonClass(_rightHidden, scrollable, hideScrollButtons)]] pebble-icon-size-16 m-r-5 m-l-15" on-up="_onScrollButtonUp" on-down="_onRightScrollButtonDown" tabindex="-1" noink=""></pebble-icon>
`;
  }

  static get is() {
      return "pebble-tab-group";
  }
  static get properties() {
      return {
          /**
           * Indicates the identification of an `element`.
           */
          id: {
              type: String,
              reflectToAttribute: true
          },

          /**
           * Indicates whether or not the ink ripple effect is disabled.
           * Change in this property causes all descendant <paper-tab> 
           * elements to have their noink property changed to the new value. 
           */
          noink: {
              type: Boolean,
              value: false,
              observer: '_noinkChanged'
          },

          /**
           * Indicates whether or not the `bottom bar` that shows the selected tab is displayed.
           */
          noBar: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates whether or not the slide effect for the `bottom bar` is disabled.
           */
          noSlide: {
              type: Boolean,
              value: false
          },

          /**
           * Specifies whether or not the tabs are scrollable and the tab width is based on the label width.
           */
          scrollable: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates whether or not the tabs can expand to fit their container. Currently this is applied only when
           * scrollable is true.
           */
          fitContainer: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates whether or not the dragging on the tabs to scroll is disabled.
           */
          disableDrag: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates whether or not the left and right arrow scroll buttons are hidden for scrollable tabs.
           */
          hideScrollButtons: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates whether or not the tabs are aligned to the `bottom`. Note that the selection bar appears at the top.
           */
          alignBottom: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates the name of the item element that is used as a sub-tree of pebble-tab-group.
           */
          selectable: {
              type: String,
              value: 'pebble-tab' // * This property is used by the 'IronMenubarBehavior' behaviour. See issue #192 on github in paper tabs repo.
          },

          /**
           * Indicates whether or not the tabs are selected automatically when you focus using the
           * keyboard.
           */
          autoselect: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates the delay when the user stops interacting
           * with the tabs through the keyboard and when the focused item is
           * automatically selected. This happens only when `autoselect` is set to <b>true</b>. 
           * Note that the delay is in milliseconds.
           */
          autoselectDelay: {
              type: Number,
              value: 0
          },

          _step: {
              type: Number,
              value: 10
          },

          _holdDelay: {
              type: Number,
              value: 1
          },

          _leftHidden: {
              type: Boolean,
              value: false
          },

          _rightHidden: {
              type: Boolean,
              value: false
          },

          _previousTab: {
              type: Object
          },
          /**
           * Indicates the data model that is passed to `pebble-tab-group`.
           */
          data: {
              type: Object,
              notify: true
          },

          isMenuItemSelected: {
              type: Boolean,
              value: false
          }
      }
  }
  constructor() {
      super();
      this._holdJob = null;
      this._pendingActivationItem = undefined;
      this._pendingActivationTimeout = undefined;
      this._bindDelayedActivationHandler = this._delayedActivationHandler.bind(this);
      this.addEventListener('blur', this._onBlurCapture.bind(this), true);
  }
  ready() {
      super.ready();
      this.setScrollDirection('y', this.$.tabsContainer);
      this._tabsContent = this.shadowRoot.querySelector("#tabsContent");
  }
  connectedCallback() {
      super.connectedCallback();
      this.addEventListener('iron-items-changed', this._onTabSizingChanged);
      this.addEventListener('iron-select', this._onIronSelect);
      this.addEventListener('iron-deselect', this._onIronDeselect);
  }
  disconnectedCallback() {
      super.disconnectedCallback();
      this._cancelPendingActivation();
      this.removeEventListener('iron-items-changed', this._onTabSizingChanged);
      this.removeEventListener('iron-select', this._onIronSelect);
      this.removeEventListener('iron-deselect', this._onIronDeselect);
  }
  get keyBindings() {
      return {
          'left:keyup right:keyup': '_onArrowKeyup'
      };
  }
  _noinkChanged(noink) {
      let childTabs = dom(this).querySelectorAll('pebble-tab');
      childTabs.forEach(noink ? this._setNoinkAttribute : this._removeNoinkAttribute);
  }

  _setNoinkAttribute(element) {
      element.setAttribute('noink', '');
  }

  _removeNoinkAttribute(element) {
      element.removeAttribute('noink');
  }

  /**
   * Function to compute 'transition end' and call the handler to handle it.
   * Note : Edge browser does'nt listen to the "transition end" event all times by default
   */
  _computeTransitionEnd() {
      let transitions = {
          'transition': 'transitionend',
          'OTransition': 'oTransitionEnd',
          'MozTransition': 'transitionend',
          'WebkitTransition': 'webkitTransitionEnd'
      }

      let transitionEnd = false;
      for (let t in transitions) {
          if (this.$.selectionBar.style[t] !== undefined) {
              transitionEnd = true;
              break;
          }
      }

      if (transitionEnd) {
          this._onBarTransitionEnd();
      }
  }

  _computeScrollButtonClass(hideThisButton, scrollable, hideScrollButtons) {
      if (!scrollable || hideScrollButtons) {
          return 'hidden';
      }

      if (hideThisButton) {
          // Note: Show both icons on a page 
          // return 'not-visible';
      }

      return '';
  }

  _computeTabsContentClass(scrollable, fitContainer) {
      return scrollable ? 'scrollable' + (fitContainer ? ' fit-container' : '') :
          ' fit-container';
  }

  _computeSelectionBarClass(noBar, alignBottom) {
      if (noBar) {
          return 'hidden';
      } else if (alignBottom) {
          return 'align-bottom';
      }

      return '';
  }

  _onTabSizingChanged() {
      this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(10), () => {
          this._scroll();
          this._tabChanged(this.selectedItem);

          let tabGroupRect = this.getBoundingClientRect();
          let tabs = this.querySelectorAll("pebble-tab");
          if (tabs && tabs.length > 0) {
              let totalWidth = 0;
              for (let i = 0; i < tabs.length; i++) {
                  let tab = tabs[i.toString()];
                  if (tab) {
                      totalWidth += tab.getBoundingClientRect().width;
                  }
              }
              if (totalWidth <= tabGroupRect.width) {
                  this.hideScrollButtons = true;
              }
          }
      });
  }

  /**
   * Function to reset the current tab selection
   */
  resetSelection() {
      this.clearSelection = true;
  }

  /**
   * Function to reset the current tab menu selection
   */
  resetSelectedTabIndex(selectedTabIndex) {
      let selectedTab = this.querySelectorAll('pebble-tab')[selectedTabIndex];
      if (selectedTab) {
          let menu = selectedTab.querySelector("paper-listbox");
          if (menu && menu.selected >= 0) {
              menu.selected = -1;
          }
      }
  }

  _onIronSelect(event) {
      let tab;

      //Handling scenario when the current tab menu selection is reset
      if (this.clearSelection) {
          this.clearSelection = false;
          this.resetSelectedTabIndex(this._previousTabIndex);
          this._previousTab.closeMenu();
          return;
      }

      // Note: More Info. available in Select method
      if (event) {
          if (event.target.nodeName === "PAPER-LISTBOX") {
              this.isMenuItemSelected = true;
              if (event.detail && event.detail.item) {
                  let item = event.detail.item;
                  if (item) {
                      tab = this.querySelector("#" + item.tabConfig.name);
                  }
              }
              tab.closeMenu();
          } else {
              tab = event.detail.item;
          }
      }

      this._tabChanged(tab, this._previousTab);
      this._previousTab = tab;
      this._previousTabIndex = tab.tabConfig.index;
      if (this._debouncer && this._debouncer.cancel) {
          this._debouncer.cancel();
      }
  }

  _onIronDeselect(event) {
      if (event.detail.item.nodeName !== "PAPER-ITEM") {
          this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(1), () => {
              this._tabChanged(null, this._previousTab);
              this._previousTab = null;
              // See polymer/polymer#1305
          });
      }
  }

  _activateHandler() {
      // Cancel item activations scheduled by keyboard events when any other
      // action causes an item to be activated (e.g. clicks).
      this._cancelPendingActivation();
      IronMenuBehaviorImpl._activateHandler.apply(this, arguments);
  }

  _scheduleActivation(item, delay) {
      this._pendingActivationItem = item;
      this._pendingActivationTimeout = setTimeout(() => {
          this._bindDelayedActivationHandler, delay
      });
  }

  _delayedActivationHandler() {
      let item = this._pendingActivationItem;
      this._pendingActivationItem = undefined;
      this._pendingActivationTimeout = undefined;
      item.fire(this.activateEvent, null, {
          bubbles: true,
          cancelable: true
      });
  }

  _cancelPendingActivation() {
      if (this._pendingActivationTimeout !== undefined) {
          this.cancelAsync(this._pendingActivationTimeout);
          this._pendingActivationItem = undefined;
          this._pendingActivationTimeout = undefined;
      }
  }

  _onArrowKeyup(event) {
      if (this.autoselect) {
          this._scheduleActivation(this.focusedItem, this.autoselectDelay);
      }
  }

  _onBlurCapture(event) {
      // Cancel a scheduled item activation (if any) when that item is
      // blurred.
      if (event.target === this._pendingActivationItem) {
          this._cancelPendingActivation();
      }
  }

  get _tabContainerScrollSize() {
      return Math.max(0,
          this.$.tabsContainer.scrollWidth -
          this.$.tabsContainer.offsetWidth
      );
  }

  _scroll(e, detail) {
      if (!this.scrollable) {
          return;
      }

      let ddx = (detail && -detail.ddx) || 0;
      this._affectScroll(ddx);
  }

  _down(e) {
      // go one beat async to defeat IronMenuBehavior
      // autorefocus-on-no-selection timeout
      setTimeout(() => {
          if (this._defaultFocusAsync) {
              this.cancelAsync(this._defaultFocusAsync);
              this._defaultFocusAsync = null;
          }
      }, 1);
  }

  _affectScroll(dx) {
      this.$.tabsContainer.scrollLeft += dx;

      let scrollLeft = this.$.tabsContainer.scrollLeft;

      this._leftHidden = scrollLeft === 0;
      this._rightHidden = scrollLeft === this._tabContainerScrollSize;
  }

  _onLeftScrollButtonDown() {
      this._clearHoldJobInterval();
      this._scrollToLeft();
      this._holdJob = setInterval(this._scrollToLeft.bind(this), this._holdDelay);
  }

  _onRightScrollButtonDown() {
      this._clearHoldJobInterval();
      this._scrollToRight();
      this._holdJob = setInterval(this._scrollToRight.bind(this), this._holdDelay);
  }

  _clearHoldJobInterval() {
      if (!this._holdJob) return;

      clearInterval(this._holdJob);
      this._holdJob = null;
  }

  _onScrollButtonUp() {
      this._clearHoldJobInterval();
  }

  _scrollToLeft() {
      this._affectScroll(-this._step);
  }

  _scrollToRight() {
      this._affectScroll(this._step);
  }

  _tabChanged(tab, old) {
      if (!tab) {
          // Remove the bar without animation.
          this.$.selectionBar.classList.remove('expand');
          this.$.selectionBar.classList.remove('contract');
          this._positionBar(0, 0);
          return;
      }

      let r = this.$.tabsContent.getBoundingClientRect();
      let w = r.width;
      let tabRect = tab.getBoundingClientRect();
      let tabOffsetLeft = tabRect.left - r.left;

      this._pos = {
          width: this._calcPercent(tabRect.width, w),
          left: this._calcPercent(tabOffsetLeft, w)
      };

      if (this.noSlide || old == null) {
          // Position the bar without animation.
          this.$.selectionBar.classList.remove('expand');
          this.$.selectionBar.classList.remove('contract');
          this._positionBar(this._pos.width, this._pos.left);
          return;
      }

      let oldRect = old.getBoundingClientRect();
      let oldIndex = this.items.indexOf(old);
      let index = this.items.indexOf(tab);
      let m = 5;

      // bar animation: expand
      this.$.selectionBar.classList.add('expand');

      let moveRight = oldIndex < index;
      let isRTL = this._isRTL;
      if (isRTL) {
          moveRight = !moveRight;
      }

      if (moveRight) {
          this._positionBar(this._calcPercent(tabRect.left + tabRect.width - oldRect.left, w) - m, this._left);
      } else {
          this._positionBar(this._calcPercent(oldRect.left + oldRect.width - tabRect.left, w) - m, this._calcPercent(tabOffsetLeft, w) + m);
      }

      if (this.scrollable) {
          this._scrollToSelectedIfNeeded(tabRect.width, tabOffsetLeft);
      }

      //Compute transition end for Edge browser as the browser does'nt listen to the "transition end" event all times
      if (DataHelper.checkBrowser('edge')) {
          this._computeTransitionEnd();
      }
  }

  _scrollToSelectedIfNeeded(tabWidth, tabOffsetLeft) {
      let l = tabOffsetLeft - this.$.tabsContainer.scrollLeft;
      if (l < 0) {
          this.$.tabsContainer.scrollLeft += l;
      } else {
          l += (tabWidth - this.$.tabsContainer.offsetWidth);
          if (l > 0) {
              this.$.tabsContainer.scrollLeft += l;
          }
      }
  }

  _calcPercent(w, w0) {
      return 100 * w / w0;
  }

  _positionBar(width, left) {
      width = width || 0;
      left = left || 0;

      this._width = width;
      this._left = left;
      this.transform(
          'translateX(' + left + '%) scaleX(' + (width / 100) + ')',
          this.$.selectionBar);
  }

  _onBarTransitionEnd(e) {
      let cl = this.$.selectionBar.classList;
      // bar animation: expand -> contract
      if (cl.contains('expand')) {
          cl.remove('expand');
          cl.add('contract');
          this._positionBar(this._pos.width, this._pos.left);
          // bar animation done
      } else if (cl.contains('contract')) {
          cl.remove('contract');
      }

      if (!e && DataHelper.checkBrowser('edge')) {
          cl.remove('contract');
      }
  }
  /**
   * Can be used to override the method from Polymer.IronSelectionBehavior.
   */
  select(selectedTabIndex) {
      /*
      Hacky Work: Here we have overrided the method of IronSelection Behaviour
      */
      let eventName = "selection-changed";
      let eventDetail = {
          name: eventName
      };
      let e = this.fireBedrockEvent(eventName, eventDetail, {
          ignoreId: true,
          cancelable: true
      });
      if (e.defaultPrevented == false) {
          this._selectTab(selectedTabIndex);
      }
  }

  _selectTab(selectedTabIndex) {
      /*
          Issue 1: If a user has loaded some content of a menuitem and
                      if user wants to loaded the content of a tab, then
                      it will not work because the tabitem selection has not been changed.

          Fix:     Added a flag "isMenuItemSelected". If true then allow then control to load
                      tab content else ignore
      */
      let selectedTab = this.querySelectorAll('pebble-tab')[selectedTabIndex];

      this._closeDropdownMenus(selectedTab.id);

      if (selectedTab) {
          let menu = selectedTab.querySelector("paper-listbox");
          if (menu && menu.selected >= 0) {
              menu.selected = -1;
          }
      }

      if (this._previousTab) {
          let menu = this._previousTab.querySelector("paper-listbox");
          if (menu && menu.selected >= 0) {
              menu.selected = -1;
          }
      }

      if (this._selection.multi) {
          this._selection.toggle(selectedTab);
      } else if (this._selection.get() !== selectedTab || this.isMenuItemSelected) {
          this.isMenuItemSelected = false;
          selectedTab.menuItemConfig = "";
          this._selection.setItemSelected(this._selection.get(), false);
          this._selection.setItemSelected(selectedTab, true);
      }
  }

  _closeDropdownMenus(tabId) {
      let tabs = FlattenedNodesObserver.getFlattenedNodes(this._tabsContent).filter(n => n.nodeType === Node.ELEMENT_NODE);
      if (tabs) {
          for (let index in tabs) {
              let tab = tabs[index];
              if (tab && tab.shadowRoot) {
                  let ironDropdown = tab.shadowRoot.querySelector("iron-dropdown"); // Shadow DOM
                  if (tab.id !== tabId) {
                      if (ironDropdown && ironDropdown.opened) {
                          ironDropdown.close();
                      }
                  }
              }
          }
      }
  }

  /***
   * Function which can be used for adding specific CSS class to
   * element with 'index' (for instance: we want to make some tab header blinking).
   * this.selectedClass will be applied if no className value is provided.
   * @param index
   * @param className
   */
  highlightTabWithoutSelection(index, className) {
      className = className || this.selectedClass;
      if (className) {
          let tabs = this.querySelectorAll("pebble-tab");
          for (let i = 0, length = tabs.length; i < length; i++) {
              if (i == index) {
                  tabs[i].classList.add(className);
              } else {
                  tabs[i].classList.remove(className);
              }
          }
      }
  }
}
customElements.define(PebbleTabGroup.is, PebbleTabGroup);
