import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../rock-layout/rock-layout.js';
import '../rock-layout/rock-titlebar/rock-titlebar.js';
import '../pebble-templatizer/pebble-templatizer.js';
import '../rock-entity-preview/rock-entity-preview.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

class AppEntityPreview extends mixinBehaviors([RUFBehaviors.AppBehavior], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style>
            rock-layout {
                --rock-footer-background-color: #f5f7f9;
            }
        </style>
        <rock-layout>
            <rock-entity-preview context-data="[[contextData]]" entity-type="[[entityType]]" entity-id="[[entityId]]" template-id="[[templateId]]"></rock-entity-preview>
        </rock-layout>
        <bedrock-pubsub on-bedrock-event-initializeshell="_initializeshell" name="bedrock-event-initializeshell"></bedrock-pubsub>
`;
  }

  static get is() {
      return "app-entity-preview";
  }

  static get properties() {
      return {

          appConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          dataModel: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          rendercms: {
              type: Boolean,
              value: false
          }
      }
  }

  ready() {
      super.ready();
      let state = DataHelper.getStateFromQueryParams();
      this.contextData = state.contextData;
      this.entityType = state._entityType;
      this.entityId = state._entityId;
      this.templateId = state.templateId;
  }

  _onComponentCreating(e, detail) {
      let component = detail.data;
      component.properties["context-data"] = this.contextData;
  }

  _initializeshell() {
      RUFUtilities.appCommon.showHeaderSideBar = false;
      RUFUtilities.appDrawer.hidden = true;
      RUFUtilities.progressBar.hidden = true;
      RUFUtilities.navbarPlaceholder.hidden = true;
      RUFUtilities.middleContainer.style["margin-left"] = 0;
  }
}

customElements.define(AppEntityPreview.is, AppEntityPreview)
