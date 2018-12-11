/**
@group rock Elements
@element rock-dashboard-widgets
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../rock-widget-panel/rock-widget-panel.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockDashboardWidgets
    extends mixinBehaviors([RUFBehaviors.ComponentConfigBehavior], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style>
            rock-widget-panel{
                display:block;
                @apply --rock-widget-panel;
            }
        </style>
       <rock-widget-panel config="[[config]]" context-data="[[contextData]]"></rock-widget-panel>
`;
  }

  static get is() { return 'rock-dashboard-widgets' }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function() {
                  return {};
              },
              observer: '_onContextDataChange'
          },
          config: {
              type: Object,
              value: function() {
                  return {};
              }
          },
          type: {
              type: String
          }
      }
  }
  /**
  *
  */
  connectedCallback() {
      super.connectedCallback();
  }
  /**
  *
  */
  disconnectedCallback() {
      super.disconnectedCallback();
  }
  _onContextDataChange() {
      afterNextRender(this,()=>{
          if(this.type && !_.isEmpty(this.contextData)) {
              let context = DataHelper.cloneObject(this.contextData);
              //App specific
              let appName = ComponentHelper.getCurrentActiveAppName();
              if(appName) {
                  context[ContextHelper.CONTEXT_TYPE_APP] = [{
                      "app": appName
                  }];
              }

          this.requestConfig("rock-"+this.type+"-widgets", context);
      }
      });
  }
  onConfigLoaded(componentConfig) {
      if(componentConfig && componentConfig.config) {
          let config = componentConfig.config;
          let widgets = DataHelper.convertObjectToArray(config.widgets);
          for(let widget in widgets){
              if(widgets[widget].config){
                  widgets[widget].config.iconButtons = DataHelper.convertObjectToArray(widgets[widget].config.iconButtons);
              }
          }
          config.widgets = widgets;
          this.config = config;
      }
  }
}
customElements.define(RockDashboardWidgets.is, RockDashboardWidgets);
