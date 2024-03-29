/**
` <pebble-tab>` Represents a tab with material design styling. It is used in conjunction with the `<pebble-tab-group>`.

### Accessibility

See the docs for `Polymer.IronControlState`, `Polymer.IronButtonState` and `Polymer.PaperRippleBehavior` for accessibility features implemented by this element.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { IronButtonState } from '@polymer/iron-behaviors/iron-button-state.js';
import { IronControlState } from '@polymer/iron-behaviors/iron-control-state.js';
import '@polymer/iron-dropdown/iron-dropdown.js';
// import '@polymer/paper-menu/paper-menu.js';   //to do replace with listbox
import '@polymer/paper-item/paper-item.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../pebble-icon/pebble-icon.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleTab extends mixinBehaviors([IronControlState, IronButtonState],
    PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-icons">
            :host {
                display: inline-block;
                position: relative;
                overflow: hidden;
                cursor: pointer;
                vertical-align: middle;
                @apply --paper-font-common-base;
                @apply --paper-tab;
            }

            :host(:focus) {
                outline: none;
            }

            :host([link]) {
                padding: 0;
            }

            .tab-content {
                height: 100%;
                transform: translateZ(0);
                -ms-transform: translateZ(0);
                -webkit-transform: translateZ(0);
                transition: opacity 0.1s cubic-bezier(0.4, 0.0, 1, 1);
                -webkit-transition: opacity 0.1s cubic-bezier(0.4, 0.0, 1, 1);
                @apply --layout-horizontal;
                @apply --layout-center-center;
                @apply --layout-flex-auto;
                @apply --paper-tab-content;
                position: relative;
            }

            :host(:not(.iron-selected))>.tab-content {
                opacity: 0.8;
                @apply --paper-tab-content-unselected;
            }

            :host(.iron-selected) pebble-icon {
                --pebble-icon-color: {
                    fill: var(--palette-cerulean, #036bc3);
                }
            }

            :host(:focus) .tab-content {
                opacity: 1;
                font-weight: 700;
            }

            paper-ripple {
                color: var(--paper-tab-ink, var(--paper-yellow-a100));
            }

            .tab-title {
                font-size: var(--default-font-size);
                font-weight: var(--font-medium);
                color: var(--palette-dark);
            }
            .iron-selected .tab-title {
                color: var(--palette-cerulean);
            }

            .tab-title-content {
                display: -webkit-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: flex;
                flex-direction: column;
                -webkit-flex-direction: column;
            }

            .tab-title-content>.tab-subtitle {
                display: -webkit-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: flex;
                flex-direction: row;
                -webkit-flex-direction: row;
                font-weight: 100;
                margin-left: 29%;
            }

            .tab-title-content>.tab-title {
                display: -webkit-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: flex;
                flex-direction: row;
                -webkit-flex-direction: row;
                padding-top: 5%;
            }

            pebble-badge {
                --pebble-badge-background: var(--palette-pumpkin-orange, #f78e1e);
                --pebble-badge-margin-left: 10px;
                --pebble-badge-margin-bottom: 10px;
            }

            :host(:not(.iron-selected))>.tab-content pebble-icon {
                color: var(--palette-dark, #1a2028);
            }

            content::slotted paper-item:hover {
                background-color: var(--bgColor-hover, #e8f4f9);
            }

            .error-circle {
                width: 22px;
                line-height: 22px;
                text-align: center;
                border-radius: 50%;
                background: var(--error-color, #ed204c);
                font-size: var(--font-size-xs, 10px);
                color: var(--palette-white, #fff);
                position: relative;
                top: 4px;
                cursor: text;
                display: inline-block;
                @apply --tab-error-circle;
            }

            #dropdown-wrapper .dropdown-trigger {
                padding: 0;
                margin-left: 8px;
            }

            .tab-content> ::slotted(*) {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            #dropdown-wrapper {
                display: flex;
                flex: 1;
                height: 100%;
                align-items: center;
                padding-right: 10px;
            }
        </style>
        <div class="tab-content">
            <slot name="tab-title-content">
                <div class="tab-subtitle-wrapper">
                    <slot name="tab-subtitle"></slot>
                    <slot name="tab-badge"></slot>
                </div>
                <div class="tab-title-wrapper">
                    <slot name="tab-title"></slot>
                </div>
            </slot>
            <template is="dom-if" if="{{displayMenu}}">
                <div id="dropdown-wrapper" on-tap="_toggle">
                    <pebble-icon class="dropdown-trigger pebble-icon-size-10" icon="pebble-icon:navigation-action-down" noink="">
                    </pebble-icon>
                </div>
            </template>
            <span class="error-circle" hidden="" on-tap="_errorCircleTap"></span>
        </div>
        <template is="dom-if" if="{{displayMenu}}">
            <iron-dropdown opened="{{_opened}}" focus-target="[[_dropdownContent]]">
                <div slot="dropdown-content" class="dropdown-content">
                    <slot name="list"></slot>
                </div>
            </iron-dropdown>
        </template>
`;
  }

  static get is() {
      return "pebble-tab";
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
           * Indicates whether or not the tab has a dropdown menu icon. 
           */
          displayMenu: {
              type: Boolean,
              value: false,
          },

          /**
           * Indicates whether or not the tab can forward keyboard clicks like `enter` or `space`
           * to the first anchor `element` found in its descendants.
           */
          link: {
              type: Boolean,
              value: false,
              reflectToAttribute: true
          },

          /**
           * Indicates whether or not the ink ripple effect is disabled. 
           * <b>Noink</b> property of all descendant <paper-tab> elements updates 
           * to the new value when this property is modified.
           */
          noink: {
              type: Boolean,
              value: false
          },

          _opened: {
              type: Boolean,
              value: false,
              notify: true,
              observer: '_openedChanged'
          },

          _dropdownId: {
              type: String
          },

          _dropdownContentId: {
              type: String
          },

          _dropdownContent: {
              type: Object
          }
      }
  }
  ready() {
      super.ready();
      this._ensureAttribute('role', 'tab');
  }
  connectedCallback() {
      super.connectedCallback();
      this.addEventListener('down', this._updateNoink);
      this.addEventListener('iron-select', this._onIronSelect);
      this._updateNoink();
  }
  disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('down', this._updateNoink);
      this.removeEventListener('iron-select', this._onIronSelect);
  }
  get _parentNoink() {
      let parent = dom(this).parentNode;
      return !!parent && !!parent.noink;
  }
  _errorCircleTap(e){
      e.stopPropagation();
  }

  _updateNoink() {
      this.noink = !!this.noink || !!this._parentNoink;
  }

  _onIronSelect() {
      // this._toggle();
  }

  _openedChanged(opened, oldOpened) {
      this._dropdownContent = this._contentElement;
  }

  get _contentElement() {
      return dom(this.shadowRoot.querySelector("#" + this._dropdownContentId)).getDistributedNodes()[0];
  }

  _toggle(e) {
      if (!this._opened) {
          this._openDropdown();
      } else {
          this._closeDropdown();
      }
      e.preventDefault();
      e.stopPropagation();
  }
  /**
   * <b><i>Content development is under progress... </b></i>
   */
  closeMenu() {
      if (this._opened) {
          this._closeDropdown();
      }
  }

  get ironDropdown() {
      this._ironDropdown = this._ironDropdown || this.shadowRoot.querySelector("iron-dropdown");
      return this._ironDropdown;
  }

  _openDropdown() {
      this.ironDropdown.open();
      this.dispatchEvent(new CustomEvent('bedrock-event', {
          detail: {
              name: "menu-open"
          },
          bubbles: true,
          composed: true
      }));
  }

  _closeDropdown() {
      this.ironDropdown.close();
      this.dispatchEvent(new CustomEvent('bedrock-event', {
          detail: {
              name: "menu-close"
          },
          bubbles: true,
          composed: true
      }));
  }
}
customElements.define(PebbleTab.is, PebbleTab);
