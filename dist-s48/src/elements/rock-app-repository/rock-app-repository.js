import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockAppRepository
    extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior, RUFBehaviors.ComponentConfigBehavior], PolymerElement) {
  static get template() {
    return html`

`;
  }

  static get is() { return 'rock-app-repository' }
  ready() {
      super.ready();
  }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: '_onContextDataChange'
          },
          appRepository: {
              type: Object,
              notify: true
          }
      };
  }

  static get observers() {
      return [];
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
          if(appName) {
              context[ContextHelper.CONTEXT_TYPE_APP] = [{
                  "app": appName
              }];
          }

          this.requestConfig('app-repository', context);
      }
  }

  onConfigLoaded(componentConfig) {
      if (componentConfig && componentConfig.config) {
          this.set('appRepository', componentConfig.config);
      }
  }

  onConfigError (detail) {
      this.fireBedrockEvent("app-repository-get-error", detail, { ignoreId: true });
  }
}
customElements.define(RockAppRepository.is, RockAppRepository);
