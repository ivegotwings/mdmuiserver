/**
`<rock-entity-todo>` Represents an element that displays the list of "to-do" items for an entity.

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--entity-todo-icon-outer` | Mixin applied to icon outer circle | {}
`--entity-todo-container` | Mixin applied to entity item container | {}
`--entity-todo-content` | Mixin applied to entity item content | {}
`--entity-todo-icon-width` | The width of icon | ``
`--entity-todo-icon-height` | The height of icon | ``

@group rock Elements
@element rock-entity-todo
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../bedrock-helpers/component-helper.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-image-viewer/pebble-image-viewer.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityTodo extends mixinBehaviors([RUFBehaviors.UIBehavior,
RUFBehaviors.ComponentConfigBehavior, RUFBehaviors.ComponentContextBehavior], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-icons">
            .container {
                @apply --layout-horizontal;
                align-items: center;
                -webkit-align-items: center;
                /* Safari 7.0+ */
                max-height: 250px;
                padding: 2px 0px;
                cursor: pointer;
                @apply --entity-todo-container;
                position: relative;
            }

            .entity-icon-outer {
                @apply --layout;
                @apply --layout-center-center;
                @apply --paper-font-common-base;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                margin-right: 10px;
                @apply --entity-todo-icon-outer;
            }

            .entity-content {
                align-self: flex-center;
                -webkit-align-self: flex-center;
                @apply --entity-todo-content;
                font-size: 12px !important;
                color: var(--dark-title-color, #1a2028);
            }

            .entity-content:hover {
                color: var(--focused-line, #026bc3);
            }

            .container:hover {
                color: var(--focused-line, #026bc3);
                background-color: var(--bgColor-hover, #e8f4f9);
            }

            .container:hover::before {
                position: absolute;
                content: '';
                top: 0;
                width: 20px;
                bottom: 0;
                left: -20px;
                background-color: var(--bgColor-hover, #e8f4f9);
            }

            .container:hover::after {
                position: absolute;
                content: '';
                top: 0;
                width: 20px;
                bottom: 0;
                right: -20px;
                background-color: var(--bgColor-hover, #e8f4f9);
            }

            .todo-data-container {
                max-height: 100%;
                overflow-x: hidden;
                overflow-y: auto;
                position: relative;
            }
        </style>
        <div class="todo-data-container">
            <div hidden\$="[[_isTodosAvailable(todos)]]">No todos available for this entity</div>
            <template is="dom-repeat" items="[[todos]]">
                <div class="container" id="[[_getId(item.data.name, index)]]" data="[[item.data]]" on-tap="_onTap">
                    <div class="entity-icon-outer">
                        <pebble-icon icon="[[_setIcon(item.icon.name)]]" class="pebble-icon-size-20"></pebble-icon>
                    </div>
                    <div class="entity-content">
                        [[item.data.label]]
                    </div>
                </div>
                [[_applyStyle(item, index)]]
            </template>
        </div>
`;
  }

  static get is() {
      return "rock-entity-todo";
  }

  static get properties() {
      return {
          /**
          *  Indicates the list of entities in the "JSON" format.
          */
          data: {
              type: Object,
              notify: true,
              value: function () { return {}; }
          },

          _defaultIcon: {
              type: String,
              value: "pebble-icon:channel-filled"
          },

          contextData: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: "_onContextDataChange"
          },

          todos: {
              type: Array,
              value: function () {
                  return [];
              }
          }
      };
  }

  constructor() {
      super();
  }

  connectedCallback() {
      super.connectedCallback();
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

  _onContextDataChange() {
      if (!_.isEmpty(this.contextData)) {
          let context = DataHelper.cloneObject(this.contextData);

          //App specific
          let appName = ComponentHelper.getCurrentActiveAppName();
          if (appName) {
              context[ContextHelper.CONTEXT_TYPE_APP] = [{
                  "app": appName
              }];
          }

          // if there are multiple context combinations selected, config cannot be 
          // fetched for multiple contexts. At a time only for one context.
          // Showing self level mapped when there are multiple context combinations.
          let dataContexts = ContextHelper.getDataContexts(context);

          if (dataContexts && dataContexts.length > 1) {
              context[ContextHelper.CONTEXT_TYPE_DATA] = [];
          }

          this.requestConfig('rock-entity-todo', context);
      }
  }

  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config && componentConfig.config.todos) {
          this.todos = DataHelper.convertObjectToArray(componentConfig.config.todos);
      }
  }

  _isTodosAvailable() {
      if (!this.todos || this.todos.length == 0) {
          return false;
      }
      return true;
  }

  /**
   * Can be used to raise on-tap events as per the configuration.
   */
  _onTap(e) {
      if (this._getWritePermission() === false) {
          this.showWarningToast("You do not have permissions to perform this action.");
          return;
      }
      let eventDetail = {
          name: e.currentTarget.data.eventName,
          data: e.currentTarget.data
      };
      this.dispatchEvent(new CustomEvent('bedrock-event', { detail: eventDetail, bubbles: true, composed: true }));
  }

  _getId(name, index) {
      return name + '_' + index;
  }

  _applyStyle(item, index) {
      if (!item.icon) {
          return;
      }
      setTimeout(() => {
          let container = this.shadowRoot.querySelector('#' + this._getId(item.data.name, index));
          if (container) {
              let outerdiv = container.querySelector('.entity-icon-outer');
              let icon = container.querySelector('pebble-icon');

              outerdiv.style['background-color'] = item.icon.backgroundColor;
              icon.style['color'] = item.icon.stroke;
              icon.style['background-color'] = item.icon.fill;
          }
      }, 150); //Delayed to capture dom elements
  }

  _setIcon(icon) {
      if (!icon) {
          return this._defaultIcon;
      }
      return icon;
  }

  _getWritePermission() {
      let writePermission = true;
      let itemContext = this.getFirstItemContext();
      if (DataHelper.isValidObjectPath(itemContext, "permissionContext.writePermission")) {
          writePermission = itemContext.permissionContext.writePermission;
      }
      return writePermission;
  }
}

customElements.define(RockEntityTodo.is, RockEntityTodo);
