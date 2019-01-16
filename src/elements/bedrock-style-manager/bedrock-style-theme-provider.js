/* <link rel="import" href="themes/bedrock-style-theme-default.json"> */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-ajax/iron-ajax.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-app-context-behavior/bedrock-app-context-behavior.js';
import '../liquid-rest/liquid-rest.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class BedrockStyleThemeProvider
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.AppContextBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <iron-ajax auto="" url="{{themeURL}}" method="GET" handle-as="json" on-response="handleResponse" async=""></iron-ajax>
`;
  }

  static get is() { return 'bedrock-style-theme-provider' }

  static get properties() {
      return {

          themeURL: {
              name: {
                  type: String
              }
          }
      }
  }

  constructor() {
      super();
      let userContext = {
          "roles": this.roles,
          "user": this.userId,
          "defaultRole": this.defaultRole
      }
      this.contextData[this.CONTEXT_TYPE_USER] = [userContext];

  }
  initiateTheme(themeSettings) {
      if (themeSettings && themeSettings.themeName) {
          this.themeURL = '/src/elements/bedrock-style-manager/themes/bedrock-style-theme-' + themeSettings.themeName + '.json';
      } else {
          this.themeURL = '/src/elements/bedrock-style-manager/themes/bedrock-style-theme-default.json';
      }
  }
  handleResponse(e) {
      if (e && e.detail && e.detail.response) {
          let themeConfig = e.detail.response;
          let mainApp = RUFUtilities.mainApp;
          let updateStyleStructure = this._createStyleStructure(themeConfig)
          mainApp.updateStyles(updateStyleStructure);
      }
  }
  _createStyleStructure(themeConfig) {
      let styleStructure = {};
      for (let key in themeConfig) {
          if (themeConfig.hasOwnProperty(key)) {
              let updatedStyleKey = '--mdm-' + key;
              styleStructure[updatedStyleKey] = themeConfig[key];
          }
      }
      styleStructure['--window-inner-height'] = "" + window.innerHeight + "px"

      return styleStructure;
  }
}
customElements.define(BedrockStyleThemeProvider.is, BedrockStyleThemeProvider)
