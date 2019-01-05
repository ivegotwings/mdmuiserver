/**
<b><i>Content development is under progress... </b></i>

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import './my-todo-product-view.js';
class MyTodoDetailView extends PolymerElement {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common">
            .header-container {
                display: -webkit-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: flex;
                /*width: 95%;*/
                padding: 0 0 10px 0;
                line-height: var(--default-font-size);
                /*color: #838D97*/
            }

            .name {
                font-weight: var(--font-medium);
                color: var(--block-text-color, #8994a0);
            }

            .right {
                margin-left: auto;
            }

            .content-div {
                width: 98%;
            }
            
            .default-link {
                font-size: var(--font-size-sm);
                color: var(--link-text-color);
            }

            .view-all {
                cursor: var(--detail-view-all-cursor, pointer);
            }
        </style>
        <div class="container">
            <div class="header-container list-content">
                <div class="name widget-sub-title">{{myTodo.name}}</div>
                <template is="dom-if" if="{{_areProductsMoreThanThree(myTodo.products)}}">
                    <div>&nbsp; (Showing 3 of {{myTodo.numberOfTasks}} )
                    </div>
                    <div class="right default-link view-all" on-tap="_onTapEvent">View All »</div>
                </template>
            </div>
            <div>

                <template is="dom-if" if="{{!_areProductsMoreThanThree(myTodo.products)}}">
                    <template is="dom-repeat" items="{{myTodo.products}}">
                        <my-todo-product-view product="{{item}}"></my-todo-product-view>
                    </template>
                </template>
                <template is="dom-if" if="{{_areProductsMoreThanThree(myTodo.products)}}">
                    <my-todo-product-view product="{{_getProductWithIndex(0)}}"></my-todo-product-view>
                    <my-todo-product-view product="{{_getProductWithIndex(1)}}"></my-todo-product-view>
                    <my-todo-product-view product="{{_getProductWithIndex(2)}}"></my-todo-product-view>
                </template>
            </div>
        </div>
`;
  }

  static get is() {
      return 'my-todo-detail-view'
  }
  static get properties() {
      return {
          myTodo: {
              type: Object,
              notify: true,
              value: {},
              observer: '_areProductsMoreThanThree'
          }
      }
  }

  /**
   *  This is an internal function, returns true if more than 3 products are there in my-todo.
   */
  _areProductsMoreThanThree(products) {
      if (products && products.length > 3) {
          return true;
      } else {
          return false;
      }
  }
  /**
   *  This is an internal function, return the product from products based on index.
   */
  _getProductWithIndex(index) {
      if (this.myTodo.products) {
          return this.myTodo.products[index];
      }
      return {};
  }
  /**
   * This is internal function used to fire an rock-my-todo-view-all when View All is tapped.
   */
  _onTapEvent(e) {
      let eventData = {
          name: "rock-my-todo-view-all",
          data: this.myTodo.products
      }
      this.dispatchEvent(new CustomEvent('bedrock-event', {
          detail: eventData,
          bubbles: true,
          composed: true
      }))
  }
}

customElements.define(MyTodoDetailView.is, MyTodoDetailView);
