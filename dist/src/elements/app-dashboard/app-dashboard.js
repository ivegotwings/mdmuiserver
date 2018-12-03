import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../pebble-icons/pebble-icons.js';
import '../rock-layout/rock-layout.js';
import '../rock-layout/rock-titlebar/rock-titlebar.js';
import '../rock-dashboard-widgets/rock-dashboard-widgets.js';
import '../rock-dashboard-widget-elements/rock-dashboard-widget-elements.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class AppDashboard
    extends mixinBehaviors([
        RUFBehaviors.AppBehavior
    ], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style>
            rock-layout {
                --rock-footer-background-color: #f5f7f9;
            }

            rock-dashboard-widgets {
                @apply --app-dashboard-content-height;
                --rock-widget-panel: {
                    @apply --app-dashboard-content-height;
                }
            }
        </style>
        <rock-layout>
            <bedrock-pubsub event-name="component-creating" handler="_onComponentCreating"></bedrock-pubsub>
            <rock-titlebar slot="rock-titlebar" icon="pebble-icon:dashboard-user" main-title="[[appConfig.title]]">
            </rock-titlebar>
            <rock-dashboard-widgets type="[[appConfig.data_route]]" context-data="[[contextData]]"></rock-dashboard-widgets>
        </rock-layout>
        <bedrock-pubsub event-name="rock-saved-search-click" handler="_onSavedSearchTap" target-id=""></bedrock-pubsub>
        <bedrock-pubsub event-name="favourite-saved-search" handler="_markSavedSearchAsFavourite" target-id=""></bedrock-pubsub>
        <bedrock-pubsub event-name="delete-saved-search" handler="_markSavedSearchAsDelete" target-id=""></bedrock-pubsub>
`;
  }

  static get is() { return 'app-dashboard' }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          appConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          }
      }
  }
  constructor() {
      super();
      afterNextRender(this, () => {
          let userContext = {
              "roles": this.roles,
              "user": this.userId,
              "ownershipData": this.ownershipData,
              "tenant": this.tenantId,
              "defaultRole": this.defaultRole
          };
          this.contextData[ContextHelper.CONTEXT_TYPE_USER] = [userContext];
          this.importHref(this.resolveUrl("../app-entity-discovery/app-entity-discovery.html"), null, null, true);
      });
  }
  _markSavedSearchAsFavourite(e, detail) {
      if (detail) {
          // detail object has info of the favorite action button, its parent button and tab info.
      }
  }
  _markSavedSearchAsDelete(e, detail) {
      if (detail) {
          // detail object has info of the delete action button, its parent button and tab info.
      }
  }
  _onSavedSearchTap(e, detail) {
      if (detail) {
          ComponentHelper.appRoute("search-thing", { "_savedSearchId": encodeURIComponent(detail.id) });
      }
  }
  _onComponentCreating(e, detail) {
      let component = detail.data;
      component.properties["context-data"] = this.contextData;
  }
}
customElements.define(AppDashboard.is, AppDashboard)
