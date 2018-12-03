/**
`pebble-accordion` Represents an element that creates a collapsible block of contents. The contents are shown after the text is clicked on the header. 
In addition to this, you can setup an icon for the collapsed status that contains any component or contents that you can either show or hide.
    
    <pebble-accordion header="Please click me" default-icon="expand-less" open-icon="expand-more">...</pebble-accordion>
	
By default, the collapsed block disappears after you click on the header text again.
    
The accordion element provides some custom CSS properties for styling the element.

Custom property | Description | Default
----------------|-------------|----------
`--accordion-header` | mixin for the header | `{}`
`--accordion-header-text` | mixin for the header text | `{}`
`--accordion-duration` | Transition duration time which defines how long the transition takes | `300ms`


@demo demo/index.html
@element pebble-accordion
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../pebble-icon/pebble-icon.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
class PebbleAccordion extends PolymerElement {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-grid-layout bedrock-style-icons bedrock-style-padding-margin">
            :host {
                display: block;
                height: 100%;
            }

            :host([content-collapsed="true"]) {
                transition: all var(--accordion-duration, 300ms) ease;
                -webkit-transition: all var(--accordion-duration, 300ms) ease;
                -moz-transition: all var(--accordion-duration, 300ms) ease;
                -ms-transition: all var(--accordion-duration, 300ms) ease;
                height: 40px;
                margin-bottom: 10px;
                overflow: hidden;
            }

            #accordion_content_container {
                transition: all var(--accordion-duration, 300ms) ease;
                -webkit-transition: all var(--accordion-duration, 300ms) ease;
                -moz-transition: all var(--accordion-duration, 300ms) ease;
                -ms-transition: all var(--accordion-duration, 300ms) ease;
                height: 100%;
                box-shadow: 0 0 0 0;
                @apply --accordion-card-actions;
            }

            :host([content-collapsed="true"]) #accordion_content_container {
                margin-top: -200%;
                height: 0px;
            }

            :host([content-collapsed="true"]) pebble-icon#accordion_icon {
                transition: all var(--accordion-duration, 300ms) ease;
                -webkit-transition: all var(--accordion-duration, 300ms) ease;
                -moz-transition: all var(--accordion-duration, 300ms) ease;
                -ms-transition: all var(--accordion-duration, 300ms) ease;
                -webkit-transform: rotate(-90deg);
                -moz-transform: rotate(-90deg);
                -o-transform: rotate(-90deg);
                -ms-transform: rotate(-90deg);
                transform: rotate(-90deg);
            }

            .header {
                width: 100%;
                background-color: var(--palette-pale-grey-four, #eff4f8);
                border: none;
                box-shadow: none;
                height: 40px;
                margin-bottom: 10px;
                cursor: pointer;
                position: relative;
                z-index: 0;
                @apply --accordion-header;

            }

            .header-text {
                width: 100%;
                text-align: left;
                font-weight: var(--font-bold, bold);
                display: flex;
                align-items: center;
                height: 40px;
                @apply --accordion-header-text;
            }

            .header-text a {
                text-decoration: none;
                color: var(--text-primary-color, #1a2028);
                @apply --accordion-header-text;
            }

            .header-items-space {
                padding-left: 5px;
                @apply --accordion-header-items-space;
            }

            .container {
                display: block;
                width: 100%;
            }

            .inline {
                display: inline-block;
                vertical-align: middle;
                padding-top: 4px;
            }

            #open_link {
                color: var(--dark-title-color, #1a2028);
                vertical-align: middle;
            }

            #pebble_accordion_container {
                overflow: hidden;
                transition: all var(--accordion-duration, 300ms) ease;
                -webkit-transition: all var(--accordion-duration, 300ms) ease;
                -moz-transition: all var(--accordion-duration, 300ms) ease;
                -ms-transition: all var(--accordion-duration, 300ms) ease;
            }

            #pebble_accordion_container .header {
                border-top: 0px;
                border-bottom: 0px;
            }

            pebble-accordion pebble-lov {
                box-shadow: none;
            }

            @supports (-ms-ime-align:auto) {
                :host,
                :host([content-collapsed="true"]),
                #pebble_accordion_container,
                #accordion_content_container {
                    transition: initial !important;
                }
                :host([content-collapsed="true"]) pebble-icon#accordion_icon,
                #pebble_accordion_container {
                    transition: initial !important;
                }
            }
        </style>
        <div id="pebble_accordion_container" class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <template is="dom-if" if="[[showAccordion]]">
                    <div class="header" on-tap="_onHeaderClick">
                        <div>
                            <div class="header-text">
                                <div class="inline">
                                    <slot name="header-content"></slot>
                                </div>
                                <pebble-icon icon="pebble-icon:action-expand" class="pebble-icon-size-16 m-r-10 m-l-10" id="accordion_icon"></pebble-icon>
                                <a href="#" id="open_link" hidden\$="[[!headerText]]">[[headerText]]</a>
                                <slot name="header-actions"></slot>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
            <div class="base-grid-structure-child-2">
                <div id="accordion_content_container">
                    <slot id="cont" name="accordion-content"></slot>
                </div>
            </div>
        </div>
`;
  }

  static get is() { return 'pebble-accordion' }

  static get properties() {
      return {
          /*
          *  
          * @attribute header-Text
          * <b><i>Content development is under progress... </b></i> 
          */
          headerText: {
              type: String,
              value: ''
          },

          /*
          * Specifies whether or not to pass the expected icon. An expected icon is passed if the header contains an icon.
          * Note that only the icons of the `pebble-icon` set are supported.
          * @attribute default-Icon
          */
          defaultIcon: {
              type: String,
              value: ''
          },

          /*
          * Indicates an icon which is displayed if an accordion is collapsed.
          * @attribute open-Icon
          */
          openIcon: {
              type: String,
              value: ''
          },

          showAccordion: {
              type: Boolean,
              value: true
          },

          /*
          * Specifies whether or not the text block is collapsed.
          * @property isCollapsed
          */
          isCollapsed: {
              type: Boolean,
              value: false,
              notify: true,
              observer: '_collapseChanged'
          }
      }
  }
  disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('transitionend', this._transitionEnd);
  }
  ready() {
      super.ready();
      this._ensureAttribute('content-collapsed', 'false');
  }
  connectedCallback() {
      super.connectedCallback();
      this.addEventListener('transitionend', this._transitionEnd);
      if (this.showAccordion) {
          this._collapseChanged();
      }

  }
  _computeIfSpaceNeeded(headerText, iconValue, openIconValue) {
      let classValue = 'header-items-space';
      if (!headerText && !iconValue && !openIconValue) {
          return null;
      }

      if (headerText && iconValue) {
          return classValue;
      }

      if (headerText && openIconValue) {
          return classValue;
      }
  }

  _onHeaderClick(e) {
      this.toggleAccordion();
  }

  toggleAccordion() {
      if (this.isCollapsed) {
          this._closeallAccordion();
      }
      this.isCollapsed = !this.isCollapsed;
  }

  _closeallAccordion() {
      const _allAccordion = this.parentNode.querySelectorAll('pebble-accordion');
      for (let i = 0; i < _allAccordion.length; i++) {
          const _currentAccordion = _allAccordion[i];
          if (_currentAccordion && !(_currentAccordion.getAttribute('content-collapsed') == "true")) {
              _currentAccordion.isCollapsed = !_currentAccordion.isCollapsed;
          }
      }
  }
  _collapseChanged() {
      this.setAttribute('content-collapsed', this.isCollapsed);
  }

  _transitionEnd(e) {
      this.dispatchEvent(new CustomEvent("accordion-transition-end", { detail: { "isCollapsed": this.isCollapsed, "accordion": this }, bubbles: true, composed: true }));
  }
}
customElements.define(PebbleAccordion.is, PebbleAccordion)
