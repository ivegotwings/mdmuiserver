/**
`<rock-entity-summary>` Represents an element that renders the widgets 
such as "to-do" and "to-fix" for an entity.

### Example

    <template is="dom-bind" id="demo-app">				
				<rock-entity-summary config="{{config}}"></rock-entity-summary>
		</template>

@group rock Elements
@element rock-entity-summary
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../rock-widget-panel/rock-widget-panel.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntitySummary
          extends mixinBehaviors([
          RUFBehaviors.ComponentContextBehavior,
          RUFBehaviors.ComponentConfigBehavior
          ], PolymerElement) {
  static get template() {
    return Polymer.html`
    <rock-widget-panel config="{{config}}" readonly="[[readonly]]" no-of-columns="" context-data="[[contextData]]"></rock-widget-panel>
`;
  }

  static get is() {
return 'rock-entity-summary';
}

  static get properties() {
    return {
      config: {
        type: Object,
        value: function () {
          return {};
        }
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
        },
        observer: "_onContextDataChange"
      }
    }
  }

  /**
   * Specifies the widget-panel config used for the "summary" dashboard.
   */


  _onContextDataChange() {
    if(!_.isEmpty(this.contextData)) {
      let context = DataHelper.cloneObject(this.contextData);            

      //App specific
      let appName = ComponentHelper.getCurrentActiveAppName();
      if(appName) {
        context[ContextHelper.CONTEXT_TYPE_APP] = [{
          "app": appName
        }];
      }
      
      this.requestConfig('rock-entity-summary', context);
    }
  }

  onConfigLoaded(componentConfig) {
    if(componentConfig && componentConfig.config) {
      let config = componentConfig.config;
      if(!_.isEmpty(config.widgets)) {
        config.widgets = DataHelper.convertObjectToArray(config.widgets);
        for(let i = 0; i < config.widgets.length; i++) {
          let widget = config.widgets[i];
          if(widget.config && widget.config.iconButtons) {
            widget.config.iconButtons = DataHelper.convertObjectToArray(widget.config.iconButtons);
          }
        }

        this.config = config;
      }
    }
  }

  refresh () {
    let rockWidgetPanel = this.$$("rock-widget-panel");
    rockWidgetPanel.refresh();
  }

  getControlIsDirty () {
    let rockWidgetPanel = this.$$("rock-widget-panel");
    if (rockWidgetPanel && rockWidgetPanel.getControlIsDirty) {
      return rockWidgetPanel.getControlIsDirty();
    }
  }
}
customElements.define(RockEntitySummary.is, RockEntitySummary)
