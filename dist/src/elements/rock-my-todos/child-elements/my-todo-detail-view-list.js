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

import '../../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../../pebble-list-view/pebble-list-view.js';
import '../../pebble-list-item/pebble-list-item.js';
import './my-todo-detail-view.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class MyTodoDetailViewList
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common">
            .list-group {
                /*height: 490px;*/
                overflow-y: auto;
                /*padding: 0px 5px 0 0;*/
            }
        </style>        
        <template is="dom-if" if="[[list.length]]">
            <pebble-list-view class="list-group column">
                <template is="dom-repeat" items="[[_getList()]]">
                    <pebble-list-item slot="pebble-list-item">
                        <my-todo-detail-view my-todo="{{item}}"></my-todo-detail-view>
                    </pebble-list-item>
                </template>
            </pebble-list-view>
        </template>
            
        <template is="dom-if" if="[[!list.length]]">
            <div class="default-message">You don't have any details to view yet.</div>
        </template>
`;
  }

  static get is() { return 'my-todo-detail-view-list' }
  static get properties() {
      return {
          list: {
              type: Array,
              value: function () {
                  return [];
              }
          }
      }
  }

  _getList () {
      if (this.list && this.list.length) {
          return this.list;
      }
  }

  _isListAvailable (list) {
      return list ? list.length > 0 : false;
  }
}
customElements.define(MyTodoDetailViewList.is, MyTodoDetailViewList);
