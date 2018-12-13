/**
<b><i>Content development is under progress... </b></i>

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../../bedrock-style-manager/styles/bedrock-style-common.js';
import '../../bedrock-style-manager/styles/bedrock-style-text-alignment.js';
import '../../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class MyTodoProductView
    extends mixinBehaviors([
        RUFBehaviors.ComponentConfigBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-padding-margin bedrock-style-text-alignment">
            .input-panel {
                width: 100%;
                cursor: var(--input-panel-cursor, pointer);
                @apply --layout-horizontal;
                @apply --layout-center;
            }
            
            #image-container {
                width: 60px;
                height: 40px;
                background: #ddd;
                margin: var(--default-list-spacing,8px);
                border-radius:var(--default-border-radius);
            }
            
            .content-div {
                width: calc( 100% - 200px);
            }
            
            .to-do-name {
                /*font-weight: var(--font-medium, 500);*/
                width: 200px;
                text-overflow: ellipsis;
                overflow: hidden;
            }
            
            .text-style {
                width: 135px;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        </style>
        <div class="input-panel list-content list-item" on-tap="_onTapEvent">
            <img alt="Product image." id="image-container" src="[[product.imageUrl]]">
            <div class="content-div">
                <div class="to-do-name block-text">{{_displayName(product.name)}}</div>
                <div class="to-do-body">#{{product.id}}</div>
            </div>
            <div class="last-div to-do-body sub-content text-right m-r-10">
                <div class="text-style">{{product.vendorName}}</div>
                <div class="text-style">{{_ComputePath(product.categoryPath)}}</div>
            </div>
        </div>
`;
  }

  static get is() { return 'my-todo-product-view' }
  static get properties() {
      return {
          product: {
              type: Object,
              notify: true,
              value: {}
          }
      }
  }


  /**
   *  This is an internal function, used to display category path
   */
  _ComputePath (categoryPath) {
      if (categoryPath) {
          let s = categoryPath.split('/');
          let path = '' + s[1];
          for (let i = 2; i < s.length; i++) {
              path = path + ' » ' + s[i];
          }
          if (path.length > 20) {
              path = path.substring(0, 20) + '...'
          }
          return path;
      }
      return '';
  }

  /**
   *  This is an internal function. If the name of the product exceeds 20 characters, it displays first 20 characters and ...
   */
  _displayName(productName) {
      let displayName = '';
      if (productName && productName.length > 20) {
          displayName = productName.substring(0, 20) + '...'
      }

      return displayName;
  }

  /**
   * This is internal function used to fire an rock-my-todo-product-click when any product in my-todo element is tapped
   */
  _onTapEvent (e) {
      let eventData = {
          name: "rock-my-todo-product-click",
          data: this.product
      }
      this.dispatchEvent(new CustomEvent('bedrock-event', {detail:eventData,bubbles:true,composed:true}))
  }
}
customElements.define(MyTodoProductView.is, MyTodoProductView);
