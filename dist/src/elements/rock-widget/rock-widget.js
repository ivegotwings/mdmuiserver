/**
` <rock-widget> ` Represents an element that renders a material design JSON configured card.
  The config can have details about the component that a button, a widget, and an icon can  use.
  The widgets are usually used on the dashboard type of Apps.

@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/paper-button/paper-button.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../pebble-card/pebble-card.js';
import '../pebble-spinner/pebble-spinner.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockWidget
extends mixinBehaviors([
    RUFBehaviors.UIBehavior,
    RUFBehaviors.ComponentContextBehavior
], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-grid-layout">
            :host {
                display: block;
                height: 100%;
            }

            pebble-card {
                --pebble-card-widget-box: {
                    height: 100%;
                    margin-top: 0px;
                    margin-right: 0px;
                    margin-bottom: 0px;
                    margin-left: 0px;
                    min-width: auto;
                }
            }
        </style>

        <template is="dom-if" if="{{hasComponentErrored(isComponentErrored)}}">
            <div id="error-container"></div>
        </template>

        <template is="dom-if" if="{{!hasComponentErrored(isComponentErrored)}}">
            <pebble-card id="card" heading="[[_heading]]" header-icon="[[_headerIcon]]" non-maximizable="[[nonMaximizable]]" non-closable="[[nonClosable]]" non-draggable="[[nonDraggable]]" icon-buttons="[[_iconButtons]]" on-icon-button-click="_onIconButtonClick">
                <div class="full-height" slot="pebble-card-content">
                    <div class="full-height" id="content">
                    </div>
                    <div class="card-actions" id="actions" hidden\$="[[_isHideButtons(_buttons)]]">
                    </div>
                </div>
            </pebble-card>
        </template>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <bedrock-pubsub event-name="onRefreshWidget" handler="refresh"></bedrock-pubsub>
`;
  }

  static get is() {
      return 'rock-widget'
  }
  static get properties() {
      return {
          config: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: '_configChanged'
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
           * <b><i>Content development is under progress... </b></i> 
           */
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          /**
           * 
           * 
           */
          widgetId: {
              type: String,
              value: ""
          },
          /**
           * This is a private property and it is not used directly. This is bound to config.component.
           * Indicates the component that is shown in the card. It is a JSON with information about the component.
           * 
           */
          _component: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           * This is a private property and it is not used directly. This is bound to config.buttons.
           * Indicates the action buttons that are shown in bottom action area of the card.
           * 
           */
          _buttons: {
              type: Array,
              value: function () {
                  return [];
              },
              observer: '_buttonsChanged'
          },
          /**
           * This is a private property and is not used directly. This is bound to config.buttons.
           * Indicates title of the card.
           * 
           */
          _heading: {
              type: String,
              value: "Widget title"
          },
          /**
           * This is a private property and it is not used directly. This is bound to config.buttons.
           * Indicates the url of the title image of the card.
           * 
           */
          _headerIcon: {
              type: String,
              value: "pebble-icon:view-dashboard"
          },
          /**
           * Specifies whether or not the card container is closed.
           * If it is set to <b>true</b>, then the card container is not closable.
           *
           */
          nonClosable: {
              type: Boolean,
              value: false
          },
          /**
           * Specifies whether or not the card container is maximized.
           * If it set to <b>true</b>, then the card container is not maximized.
           */
          nonMaximizable: {
              type: Boolean,
              value: false
          },
          /**
           * Specifies whether or not the card container's position is draggable.
           * If it is set to <b>true</b>, then the card is not draggable.
           *
           */
          nonDraggable: {
              type: Boolean,
              value: false
          },
          /**
           * Indicates the list of actions available for the `more icon` on top right corner of the card.
           * Sample: {
                  "name": "refreshIcon",
                  "label": "Refresh",
                  "icon": "pebble-icon:refresh",
                  "showInMoreActions": false
              }
           */
          _iconButtons: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _loading: {
              type: Boolean,
              value: true
          }
      }
  }

  /**
   * Indicates the configuration for the widget.
   */


  ready() {
      super.ready();
      afterNextRender(this, () => {
          this.dispatchEvent(new CustomEvent("rock-widget-loaded", {
              detail: {
                  widgetId: this.widgetId,
                  config: this.config
              },
              bubbles: true,
              composed: true
          }));
      });
  }

  getControlIsDirty() {
      let component = this.$$('#content').firstElementChild;
      if (component && component.getControlIsDirty) {
          return component.getControlIsDirty();
      }
  }

  _onIconButtonClick(e, detail) {
      let currentComponent = this.shadowRoot.querySelector(this._component.name);
      let componentRefreshMethod = currentComponent ? typeof (currentComponent.refresh) : undefined;
      if (componentRefreshMethod == "function") {
          currentComponent.refresh();
      } else {
          this.refresh();
      }
  }

  _renderComponent() {
      timeOut.after(100).run(() => {
          let content = this.shadowRoot.querySelector("#content");
          if (!this.isComponentErrored && this._component && this._component.path) {
              ComponentHelper.loadContent(content, this._component, this);
          }
          this._loading = false;
      });
  }

  _renderButtons() {
      if (this._buttons && this._buttons.length > 0) {
          const fragment = document.createElement("div");
          let paperButtonEle = customElements.get("paper-button");
          for (let i = 0; i < this._buttons.length; i++) {
              let b = this._buttons[i];
              let dynamicButton = new paperButtonEle();
              dynamicButton.name = b.name;
              dynamicButton.innerText = b.label;
              dynamicButton.setAttribute("click-handler", b.onClick);
              this.listen(dynamicButton, "click", "_onButtonClick");
              fragment.appendChild(dynamicButton);
          }
          dom(this.$.actions).appendChild(fragment);
      }
  }

  _componentChanged() {
      if (_.isEmpty(this._component))
          return;

      ComponentHelper.clearNode(this.$.content);
      this._renderComponent();
  }

  _buttonsChanged() {
      ComponentHelper.clearNode(this.$.actions);
      this._renderButtons();
  }

  _configChanged() {
      //setting all data before rendering.
      //this will prevent the observer being trigged multiple times
      let curcomponent = this.config.component;
      if (curcomponent) {
          curcomponent.properties = curcomponent.properties || {};
          curcomponent.properties["context-data"] = this.contextData;
          this._component = curcomponent;
          this._componentChanged();
          this._buttons = this.config.buttons;
          this._heading = this.config.heading;
          this._headerIcon = this.config.headerIcon;
          this._iconButtons = this.config.iconButtons;
      } else {
          this.logError("widget config not found", "", true);
          this._loading = false;
          return;
      }
  }

  _onButtonClick(e) {
      if (e.target && e.target) {
          let clickHandler = e.target.getAttribute("click-handler");
          if (clickHandler) {
              let c = this.querySelector(".view-component");
              if (c && c[clickHandler]) {
                  c[clickHandler].apply(c, [{
                      "widget": this
                  }]);
              } else if (window[clickHandler]) {
                  console.warn('window clickhandler added', clickHandler, this);
                  window[clickHandler].apply(window, [{
                      "widget": this
                  }]);
              }
          }
      }
  }

  _isHideButtons(buttons) {
      return !(buttons && buttons.length);
  }
  /**
   * <b><i>Content development is under progress... </b></i> 
   */
  refresh() {
      this._loading = true;
      this._renderComponent();
  }

  _onReadonly() {
      let content = this.shadowRoot.querySelector('#content');
      if (content && content.firstElementChild) {
          content.firstElementChild.readonly = this.readonly;
      }
  }
}
customElements.define(RockWidget.is, RockWidget)
