/**
`<rock-header>` Represents a header layout structure inside rock-layout. 
This element is a child element of `<rock-layout>` element.

It can contian any elements or components.

### Accessibility

Defualt behavior, header will get shrunk while scrolling of rock layout content.
for that '<rock-header>' shold contain it's all content in two divs with class name of each `fixed-content` and `shrunk-content`.
So when header is shrunk then div with class `shrunk-content` content will get render else div with class `fixed-content` will get render inside `<rock-header>`. 

For example:

    <rock-layout>
        <rock-header>
            <div class='fixed-content'>
                fixed header content . . .
            </div>
            <div class='shrunk-content'>
                shrunk header content . . .
            </div>
        </rock-header>
        main layout content . . .
    </rock-layout>

To make header frozen in rock layout use `frozen` property, so that header will not get shrunk.

For example:

    <rock-layout>
        <rock-header frozen>
            <div class='fixed-content'>
                fixed header content . . .
            </div>
        </rock-header>
        main layout content . . .
    </rock-layout>

@demo ../demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../../bedrock-style-manager/styles/bedrock-style-common.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
class RockHeader extends PolymerElement {
  static get template() {
    return html`
        <style>
            :host {
                box-sizing: border-box;
            }

            #rockHeaderContainer {
                height: auto;
                width: 100%;
                white-space: normal;
            }

            #fixedHeader,
            #shrunkHeader {
                display: block;
                width: calc(100% - 0px);
            }

            #rightHeader {
                display: block;
                float: right;
            }

            #leftHeader {
                display: block;
                float: left;
            }

            @media only screen and (max-width: 768px) {
                #rockHeaderContainer {
                    width: auto;
                }
            }
        </style>
        <div id="rockHeaderContainer">
            <div id="rightHeader">
                <slot name="rock-header-right-sidebar">
                </slot>
            </div>
            <div id="fixedHeader">
                <slot id="headerContent" name="fixed-content"></slot>
            </div>
            <div id="shrunkHeader">
                <slot id="headerContent" name="shrunk-content"></slot>
            </div>
            <div id="leftHeader">
                <slot name="rock-header-left-sidebar">
                </slot>
            </div>
        </div>
`;
  }

  static get is() {
      return 'rock-header';
  }
  static get properties() {
      return {
          /*
           * Indicates that the header should be frozen or not while scrolling of rock layout content.
           * If `true` then header will be frozen.
           * If `false` then header will get shrunk while scrolling of rock layout content.
           */
          frozen: {
              type: Boolean
          },
          _headerContainerHeight: {
              type: Number,
              value: 0
          },
          _shrinkableHeight: {
              type: Number,
              value: 0
          },
          _scrollableHeight: {
              type: Number,
              value: 0
          },
          _scrollableContainerHeight: {
              type: Number,
              value: 0
          },
          _lastTop: {
              type: Number,
              value: 0
          }
      }
  }

  get _scrollerElement() {
      return dom(this).parentNode.$.mainContent;
  }
  connectedCallback() {
      super.connectedCallback();
      this._scrollerElement.addEventListener('scroll', this.scrollHandler, false);
      this._hideAndShowContent('block', 'none');
      this._headerContainerHeight = this.$.rockHeaderContainer.offsetHeight;
  }
  ready() {
      super.ready();
      this.scrollHandler = this._scroll.bind(this);
  }
  _scroll() {
      if (this._lastTop == 0) {
          this._shrinkableHeight = this._headerContainerHeight - 35;
          this._scrollableContainerHeight = this._scrollerElement.offsetHeight;
          this._scrollableHeight = this._scrollerElement.scrollHeight - this._scrollableContainerHeight;
      }
      this._updateScrollState();
  }
  _updateScrollState() {
      if (!this.frozen) {
          let headerHeight = 0;
          let scrollTop = this._scrollerElement.scrollTop;

          if (scrollTop > 0) {
              if (this._scrollableHeight > (this._shrinkableHeight * 2)) {
                  if (scrollTop >= (this._headerContainerHeight - 35)) {
                      this.$.rockHeaderContainer.style.height = '35px';
                      this.$.rockHeaderContainer.style.minHeight = '0px';
                      this._hideAndShowContent('none', 'block');
                  } else {
                      headerHeight = this._headerContainerHeight - scrollTop;
                      this.$.rockHeaderContainer.style.height = headerHeight + 'px';
                      this.$.rockHeaderContainer.style.minHeight = headerHeight + 'px';
                      this._hideAndShowContent('block', 'none');
                  }
              } else {
                  this.$.rockHeaderContainer.style.height = '35px';
                  this.$.rockHeaderContainer.style.minHeight = '0px';
                  this._hideAndShowContent('none', 'block');
              }

              this.$.headerContent.select = '.shrunk-content';
          } else if (scrollTop == 0) {
              this.$.rockHeaderContainer.style.height = 'auto';
              this.$.rockHeaderContainer.style.minHeight = this._headerContainerHeight + 'px';
              this.$.headerContent.select = '.fixed-content';
              this._hideAndShowContent('block', 'none');
          }

          this._lastTop = scrollTop;
      }
  }
  _hideAndShowContent(frozen, shrink) {
      this.$.fixedHeader.style.display = frozen;
      this.$.shrunkHeader.style.display = shrink;
      if (dom(this).firstElementChild && dom(this).firstElementChild.$) {
          dom(this).firstElementChild.$.fixedHeader.style.display = frozen;
          dom(this).firstElementChild.$.shrunkHeader.style.display = shrink;
      }
      if (dom(this).lastElementChild && dom(this).lastElementChild.$) {
          dom(this).lastElementChild.$.fixedHeader.style.display = frozen;
          dom(this).lastElementChild.$.shrunkHeader.style.display = shrink;
      }
  }
}
customElements.define(RockHeader.is, RockHeader);
