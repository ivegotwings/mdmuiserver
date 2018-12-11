/**
`bedrock-init` Represents the <b>init</b> component of the framework. This helps the `bedrock-i18n` and `bedrock-pubsub` 
elements with one time initialization. This happens at the initialization stage of the application. 
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '../bedrock-i18n/bedrock-i18n.js';

import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class BedrockInit
  extends mixinBehaviors([
    RUFBehaviors.Internationalization
  ], PolymerElement) {
  static get template() {
    return html`

`;
  }

  static get is() { return 'bedrock-init' }

  static get properties() {
    return {

      /**
      * Indicates an action for the resources and how the resources are added.
      * The possible values are <b>add</b> and <b>append</b>.
      */
      action: {
        type: String,
        value: 'add' //other possible values: append
      },
      /**
      * Indicates an identification for the current tenant.
      */
      tenantId: {
        type: String,
        value: ''
      },
      /**
      * Indicates an identification for the currently logged-in user.
      */
      userId: {
        type: String,
        value: ''
      },
      /**
      * Indicates an identification for the consumer element.
      */
      componentId: {
        type: String,
        value: ''
      },

      /**
      * Indicates an identification for an app.
      */
      appId: {
        type: String,
        value: ''
      },

      /**
      * Indicates the resource path for localization resources.
      */
      localeResourcePath: {
        type: String,
        value: ''
      },
      /**
      * Indicates the default language for localization resources. It is provided by the host application.
      * The translation does not exist for that key.
      */
      defaultLanguage: {
        type: String,
        value: 'en'
      }
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.action == 'add') {
      this.init(this.localeResourcePath, this.defaultLanguage);
    }
  }
}
customElements.define(BedrockInit.is, BedrockInit);
