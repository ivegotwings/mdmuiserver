/**
`<rock-layout>` Represents a layout structure for developing an App. 
It exhibits as a simple plain layout with the combination of its child elements such as
 `<rock-titlebar>`, `<rock-header>`,  and `<rock-sidebar>`.

### Example

1. Simple layout:
        <rock-layout> 
            main layout content . . .
        </rock-layout>

2. Layout with the titlebar:
        <rock-layout>
            <rock-titlebar>
                titlebar content . . .
            </rock-titlebar>
            main layout content . . .
        </rock-layout>

3. Layout with the sidebar:
        <rock-layout>
            <rock-sidebar>
                sidebar content . . .
            </rock-sidebar>
            main layout content . . .
        </rock-layout>

4. Layout with the header:
        <rock-layout>
            <rock-header>
                header content . . .
            </rock-header>
            main layout content . . .
        </rock-layout>

5. Layout with the header, sidebar, and titlebar:
        <rock-layout>
            <rock-titlebar>
                titlebar content . . .
            </rock-titlebar>
            <rock-header>
                header content . . .
            </rock-header>
            <rock-sidebar>
                sidebar content . . .
            </rock-sidebar>
            main layout content . . .
        </rock-layout>

It can contain any elements or components.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../rock-footer/rock-footer.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockLayout
    extends mixinBehaviors([], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-scroll-bar">
            #layoutContainer {
                width: 100%;
                height: 100%;
                display: -webkit-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: flex;
                flex-direction: column;
                -webkit-flex-direction: column;
                justify-content: unset;
                -webkit-justify-content: unset;
            }

            /* Firefox specific fix for vertical scroll */

            #container {
                width: inherit;
                height: 100%;
                display: -webkit-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: flex;
                flex-direction: row;
                -webkit-flex-direction: row;
            }

            #rockLayoutContainer {
                height: 100%;
                width: 100%;
                overflow-y: auto;
                overflow-x: hidden;
                white-space: normal;
                @apply --scroller;
            }

            #mainContent {
                height: 100%;
                width: 100%;
            }
            
        </style>
        <slot name="rock-titlebar">

        </slot>
        <slot id="headerContent" name="rock-header"></slot>
        <div id="layoutContainer">
            <div id="container">
                <div id="rockLayoutContainer">
                    <div id="mainContent">
                        <slot></slot>
                    </div>
                </div>
                <slot id="sidebarContent" name="rock-sidebar"></slot>
            </div>
        </div>
        <rock-footer></rock-footer>
`;
  }

  static get is() {
      return 'rock-layout';
  }

  static get properties() {
      return {
          hideFooter: {
              type: Boolean,
              value: false
          }
      }
  }

  /**
   * Specifies whether or not a footer is shown on the layout.
   */
}
customElements.define(RockLayout.is, RockLayout)
