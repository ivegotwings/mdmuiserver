/**
` <rock-content-view> ` Represents a view that holds the content for the middle area of the application.
  It takes the configuration for the component that is rendered in the content view.
  It supports `minimize` and `close` actions that are configured using the boolean properties.
  Make sure to use the `rock-content-view` always with `rock-content-view-manager`.

@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-app-layout-height.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockContentView extends mixinBehaviors([RUFBehaviors.UIBehavior], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-app-layout-height">
            /* */
        </style>
        <div id="content-view-container" class="content-view-container">
            <div id="content">
            </div>
        </div>
`;
  }

  static get is() {
      return "rock-content-view";
  }
  static get properties() {
      return {
          /**
           * Indicates the title of the view.
           * 
           */
          viewTitle: {
              type: String,
              value: "View Title"
          },
          /**
           * Indicates the url of the title icon image of the view.
           * 
           */
          icon: {
              type: String,
              value: "pebble-icon:view-dashboard"
          },
          /**
           * Indicates the name of the view.
           * Make sure that it is unique since the content view manager finds the content view based on the name.
           */
          name: {
              type: String
          },

          /**
           * Indicates the callback function, which is invoked once the content is rendered.
           */
          renderedCallback: {
              type: Function
          }
      }
  }
  /**
   * Can be used to render the component based on the given configuration. 
   * This method is used by `content-view-manager`.
   */
  render() {
      let contentElement = this.$.content;
      if (contentElement && this.component && this.component.path) {
          this.component.path = this.component.path.replace("../../src/elements/", "../");
          ComponentHelper.loadContent(contentElement, this.component, this, this.renderedCallback);
      }
  }
  /**
   * Can be used to invoke the event handler function when the `close` icon is clicked.
   * 
   */
  onCloseClick() {
      this.manager.closeView(this.name);
  }
  /**
   * Can be used to invoke the event handler function when the `minimize` icon is clicked.
   * 
   */
  onMinimizeClick() {
      this.manager.minimizeView(this.name);
  }
  /**
   * <b><i>Content development is under progress... </b></i> 
   */
  getContent() {
      if (this.$.content && this.$.content.firstChild) {
          return this.$.content.firstChild;
      } else {
          return null;
      }
  }
}
customElements.define(RockContentView.is, RockContentView);
