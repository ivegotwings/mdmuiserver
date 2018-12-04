/**
`rock-widget-panel` Represents an element that displays the `rock-widgets` 
based on the configuration that the user provided.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../rock-widget/rock-widget.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockWidgetPanel
    extends mixinBehaviors([
    RUFBehaviors.UIBehavior,
    RUFBehaviors.ComponentContextBehavior
    ], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-scroll-bar">
            #widget-panel {
                padding: 5px;
                height: 100%;
                min-height: 100%;
                background: var(--palette-pale-grey-five, #f5f7f9);
                @apply --rock-widget-panel;
            }

            .grid-stack {
                display: grid;
                grid-template-columns: repeat(12, 8.333%);
                grid-template-rows:minmax(40px, 10%) minmax(40px, 10%)
                minmax(40px, 10%) minmax(40px, 10%) 
                minmax(40px, 10%) minmax(40px, 10%)
                minmax(40px, 10%) minmax(40px, 10%)
                minmax(40px, 10%) minmax(40px, 10%);
                width: 100%;
                height:100%;
                overflow: auto;
            }

            .grid-stack>.grid-stack-item {
                width: 100%;
                padding: 7px;
                position: relative;
                transition: opacity 400ms ease-in-out;
                opacity: 1;
                overflow: auto;
            }

             /* IE edge specific fix for widgets getting disappeared on click of their contents */
            _:-ms-lang(x), _:-webkit-full-screen,  .grid-stack>.grid-stack-item { 
                transition: initial;
            }

            .grid-stack>.grid-stack-item.hidden {
                opacity: 0;
            }

            .grid-stack>.grid-stack-item>.grid-stack-item-content {
                height: 100%;
                overflow-x: hidden;
                overflow-y: auto;
                box-shadow: 1px 4px 6px rgba(0, 0, 0, .2);
            }          
        </style>

        <div id="widget-panel">
            <div class="grid-stack">
                <template is="dom-repeat" items="{{config.widgets}}" as="widget">
                    <div id\$="[[_computeWidgetId(index)]]" class="grid-stack-item hidden">
                        <div class="grid-stack-item-content">
                            <rock-widget id="[[widget.name]]" readonly="[[readonly]]" config="[[widget.config]]" context-data="[[contextData]]" icon-buttons="[[widget.iconButtons]]" non-closable="[[widget.nonClosable]]" non-maximizable="[[widget.nonMaximizable]]" non-draggable="[[widget.nonDraggable]]" widget-id="[[index]]" on-rock-widget-loaded="_widgetAdded">
                            </rock-widget>
                        </div>
                    </div>
                </template>
            </div>
        </div>
`;
  }

  static get is() { return 'rock-widget-panel' }
  static get properties() {
      return {
          config: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true
          },
          /**
           * If set as true , it indicates the component is in read only mode
           */
          readonly: {
              type: Boolean,
              value: false
          },
          /**
          * <b><i>Content development is under progress... </b></i> 
          */
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          }
      }
  }
  /*
          * Indicates the configuration information that the user provided.
          */


  get widgets() {
      return this.shadowRoot.querySelectorAll("rock-widget");
  }

  getControlIsDirty () {
      let widgets = this.widgets;
      
      if(!widgets || !widgets.length) return false;
      
      for (let i = 0, l = widgets.length; i < l; i++) {
          if (widgets[i].getControlIsDirty) {
              let isDirty = widgets[i].getControlIsDirty();
              if (isDirty) {
                  return true;
              }
          }
      }
  }

  _computeWidgetId (_index) {
      return "grid_widget_item_" + _index;
  }

  _widgetAdded (ev) {
      const { widgetId, config } = ev.detail;

      let {
          height,
          width,
          'position-x': x,
          'position-y': y
      } = config;

      const widgetWrapper = this.shadowRoot.getElementById(`${this._computeWidgetId(widgetId)}`);

      if (!widgetWrapper) return;

      widgetWrapper.setAttribute('data-gs-height', height);

      widgetWrapper.style.gridColumn = `${++x} / ${x + width}`;
      widgetWrapper.style.gridRow = `${++y} / ${y + height}`;

      requestAnimationFrame(() => {
          widgetWrapper.classList.remove('hidden');
      });
  }
  /**
       * <b><i>Content development is under progress... </b></i> 
      */
  reloadWidgets () {
      let widgets = this.widgets;

      if(!widgets || !widgets.length) return false;

      for (let i = 0, l = widgets.length; i < l; i++) {
          if (widgets[i].refresh) {
              widgets[i].refresh();
          }
      }
  }

  refresh () {
      this.reloadWidgets();
  }
}
customElements.define(RockWidgetPanel.is, RockWidgetPanel);
