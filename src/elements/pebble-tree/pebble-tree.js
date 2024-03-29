/**
`pebble-tree` Represents an element that displays a list of nodes in a tree structure.

### Example

        <pebble-tree data="[[data]]"
                     selected-item="{{selectedItem}}" 
                     selected-items="{{selectedItems}}" 
                     multi-select 
                     enable-search>
        </pebble-tree>

### Styling
The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
--pebble-tree | Mixin applied to tree | {}
--pebble-tree-parent-list | Mixin applied to parent tree list | {}
--pebble-tree-nodeitem | Mixin applied to tree list item | {}
--pebble-tree-nodeitem-hover | Mixin applied to tree list item hover | {}
--pebble-tree-nodeitem-active | Mixin applied to tree list item active | {}
--pebble-tree-nodeitem-selected | Mixin applied to tree list item active | {}
--pebble-tree-node | Mixin applied to inner tree list | {}
--pebble-tree-node-arrow | Mixin applied to tree list arrow | {}
--pebble-tree-checkbox | Mixin applied to tree list item checkbox | {}
--pebble-tree-icon | Mixin applied to tree list item icon | {}
--pebble-tree-height | The max-height of pebble-tree | 500px
--pebble-tree-checkbox-size | The size of tree list item checkbox | 12px
--pebble-tree-checkbox-color | The color of tree list item checkbox | #0a9ec1
--pebble-tree-checkbox-border-color | The border color of tree list item checkbox | #aaaaaa
--pebble-tree-checkbox-checkmark-color | The checkmark color of tree list item checkbox | ``
--pebble-tree-icon-width | The tree list item icon width | 16px
--pebble-tree-icon-height | The tree list item icon height | 16px
--pebble-tree-icon-fill-color | The tree list item icon fill color | #0a9ec1
--pebble-tree-icon-stroke-color | The tree list item icon stroke color | ``
--pebble-tree-search-text-color | The text color of search box | ``
--pebble-tree-search-font-family | The text font style of search box | ``

@group Pebble Elements
@element pebble-tree
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/iron-list/iron-list.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import '../bedrock-helpers/element-helper.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import './pebble-tree-node.js';
import '../rock-search-bar/rock-search-bar.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleTree extends
    mixinBehaviors([RUFBehaviors.UIBehavior], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common">
            :host {
                display: block;
                background-color: var(--palette-white, #ffffff);
                color: var(--border-black, #000);
                border-radius: 2px;
                font-size: var(--default-font-size, 14px);
                cursor: default;
                @apply --pebble-tree;
            }



            ul {
                margin-left: 0;
                padding-left: 0;
                margin: 0px;
                padding: 10px 0px 10px 10px;
                @apply --pebble-tree-parent-list;
            }

            rock-search-bar {
                display: inline-flex;
                display: -webkit-inline-flex;
                width: 100%;
                height: 32px;
            }
        </style>
        <template is="dom-if" if="{{enableSearch}}">
            <rock-search-bar placeholder="Enter search text" query="{{searchKeyword}}"></rock-search-bar>
        </template>
        <ul>
            <template is="dom-repeat" id="treeNodesList" items="{{_nav}}">
                <pebble-tree-node disabled="[[disabled]]" item-path\$="[[index]]" search-keyword="[[searchKeyword]]" default-child-depth="[[defaultChildDepth]]" default-expand-depth="[[defaultExpandDepth]]" node-data="{{item}}" selected-item="{{selectedItem}}" selected-items="{{selectedItems}}" indeterminate-items="{{indeterminateItems}}" multi-select="[[multiSelect]]" selected-node="{{selectedNode}}" selected-nodes="{{selectedNodes}}" tree="[[tree]]" check-child-nodes="[[checkChildNodes]]" check-parent-nodes="[[checkParentNodes]]" addable-levels="[[addableLevels]]" select-parent-item="[[selectParentItem]]" value-path\$="[[_getValuePath(item)]]" leaf-node-only="[[leafNodeOnly]]" expand-collapse-icon-object="[[expandCollapseIconObject]]" disable-child-node="[[disableChildNode]]" hide-leaf-node-checkbox="[[hideLeafNodeCheckbox]]" show-warning-on-unselect="[[showWarningOnUnselect]]">
                 </pebble-tree-node>
            </template>
        </ul>
`;
  }

  static get is() {
      return "pebble-tree";
  }

  static get properties() {
      return {
          /**
           * Indicates the currently selected item.
           */
          selectedItem: {
              type: Object,
              notify: true
          },

          /**
           * Indicates the currently selected item list.
           */
          selectedItems: {
              type: Array,
              value: function () { return []; },
              notify: true
          },
          
          /**
          * Indicates  list of items for which at least one of the child element is selected.
          */
          indeterminateItems: {
              type: Array,
              value: function () { return []; },
              notify: true
          },
          
          /**
           * Indicates a reference to the selected element's node.
           *
           * @property selectedElem
           * @type Object
           */
          selectedNode: {
              type: Object,
              notify: true
          },

          /**
           * Indicates a reference to the list of selected elements' node. 
           * A node which is not yet rendered in the `dom` does not appear in this list. 
           * For example : Element A has five child elements. 
           * If you just select the element A, it does not select all five child elements. 
           * You must expand the element A so that these elements get added to the `dom`. 
           * That makes these elements a part of `selectedNodes` list.
           *
           * @property selectedElem
           * @type Object
           */
          selectedNodes: {
              type: Array,
              value: function () { return []; },
              notify: true
          },

          /**
          * Indicates a keyword for the search.
          */
          searchKeyword: {
              type: String,
              value: ''
          },

          /**
          * Indicates an initial navigation in the form of an array.
          */
          data: {
              type: Array,
              value: function () { return []; }
          },

          /**
          * Specifies a model of the current navigation with search filters or other mutations
          * applied by this component's methods. This is calculated with the changes from the base
          * property `data` which is defined by this component's parent.
          *
          */
          _nav: {
              type: Object
          },
          
          /**
           * Indicates a boolean flag to make the tree as either multi-select or single-select.
           */
          multiSelect: {
              type: Boolean,
              value: false
          },

          /**
           * Specifies whether or not to show the search box.
           */
          enableSearch: {
              type: Boolean,
              value: false
          },

          /**
           * Specifies the default depth to which the tree is expanded by default.
           */
          defaultExpandDepth: {
              type: Number,
              value: 0
          },

          /**
           * Specifies whether or not the child elements are selected based on the parent elements.
           */
          checkChildNodes: {
              type: Boolean,
              value: false
          },

          /**
           * Specifies whether or not the parent elements are made indeterminate based on the child elements selection.
           */
          checkParentNodes: {
              type: Boolean,
              value: false
          },

          /**
          * Indicates a reference to the tree.
          */
          tree: {
              type: Object,
              value: function () {
                  return this;
              }
          },

          /**
           * Specifies the level at which add buttons are present so that the new child elements can be added. 
           * 
           */
          addableLevels: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          
          /**
           * Specifies whether the tree is disabled or not
           */
          disabled: {
              type: Boolean,
              value: false
          },

          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          defaultChildDepth: {
              type: Number,
              value: 0
          },

          /**
          * Specifies whether or not only leaf-node selection is enabled.
          */
          leafNodeOnly: {
              type: Boolean,
              value: false
          },

          /**
          * Specifies expand / collapse icons
          */
          expandCollapseIconObject: {
              type: Object,
              value: function () {
                  return {}
              }
          },

          disableChildNode: {
              type: Boolean,
              value: false
          },

          hideLeafNodeCheckbox: {
              type: Boolean,
              value: false
          },
          showWarningOnUnselect:{
              type:Boolean,
              value: false
          },
          selectParentItem:{
              type:Boolean,
              value:false
          }
      };
  }

  static get observers() {
      return [
          '_computedNav(data, searchKeyword)'
      ];
  }

  constructor() {
      super();
  }

  connectedCallback() {
      super.connectedCallback();

      this.addEventListener("item-selected", this._itemSelected);
      this.addEventListener("item-de-selected", this._itemDeSelected);
  }

  disconnectedCallback() {
      super.disconnectedCallback();

      this.removeEventListener("item-selected", this._itemSelected);
      this.removeEventListener("item-de-selected", this._itemDeSelected);
  }


  /** Can be used re-render the tree. */
  refreshTree() {
      this.shadowRoot.querySelector("#treeNodesList").render();
  }

  /**
  * Fired when the search keyword is changed to call the filter on the `nav`.
  * You need to have debounce in place so that you don't do this on every single key down.
  *
  */
  _computedNav(navArr, searchKeyword) {
      if (!(navArr === undefined || searchKeyword === undefined)) {
          if (searchKeyword === '') {
              this.set('_nav', this.data);
              this.refreshTree();
              return;
          }
          this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(50), () => {
              this.set('_nav', this._buildNav(navArr, searchKeyword));
              this.refreshTree();
          });
      }
  }

  /**
  * Fired when a search keyword is entered. It builds and returns a new `nav`
  * object that only contains the search query.
  *
  */
  _buildNav(navArr, searchKeyword) {
      if (!navArr) {
          return [];
      }
      if (!searchKeyword || searchKeyword == "") {
          return navArr;
      }
      let foundItems = [];
      for (let i = 0; i < navArr.length; i++) {
          let childMatch = false;
          if (navArr[i].children) {
              childMatch = this._checkChildMatch(navArr[i].children, searchKeyword);
          }
          if (navArr[i].text.toLowerCase().indexOf(searchKeyword.toLowerCase()) != -1 || childMatch) {
              foundItems.push(navArr[i]);
          }
      }

      //returns a rebuilt, filtered nav
      return foundItems;
  }

  _checkChildMatch(navArr, searchKeyword) {
      if (!navArr) {
          return false;
      }
      let childMatch = false;
      for (let i = 0; i < navArr.length; i++) {
          if (navArr[i].text.toLowerCase().indexOf(searchKeyword.toLowerCase()) != -1) {
              return true;
          } else {
              if (navArr[i].children) {
                  childMatch = this._checkChildMatch(navArr[i].children, searchKeyword);
              }
              if (childMatch) {
                  return true;
              }
          }
      }
      return false;
  }

  /**
   * Can be used to clear the selected item list and checkbox selection.
   */
  clearSelectedItems() {
      this.selectedItems = [];
      this.indeterminateItems = [];
      this.selectedNodes = [];
  }

  /**
   * Can be used to clear the selected item and style.
   */
  clearSelectedItem() {
      this.selectedItem = '';
      this.selectedNode = null;
      //Clear selected item
      let item = this.querySelector('.selected');
      if (item) {
          item.classList.remove('selected');
      }
  }

  /**
   * Can be used to get the element from the given path in the tree.
   */
  getElementByPath(path) {
      let indices = path.split(".");
      let elem = this._nav[indices[0]];
      for (let i = 1; i < indices.length; i++) {
          elem = elem.children[indices[i]];
      }
      return elem;
  }

  /**
   * Can be used to get the element's node from the given path in the tree.
   *     
   */
  getElementNodeByPath(path) {
      if (path) {
          let paths = path.split("#@#");
          if (paths && paths.length > 0) {
              let currentNode = this;
              let currentPath = "";
              for (let i = 0; i < paths.length; i++) {
                  currentPath = currentPath + paths[i];
                  let selector = "pebble-tree-node[value-path='" + currentPath.replace(/\'/g, "\\'") + "']";
                  let node = ElementHelper.getElement(currentNode, selector);
                  currentNode = node;
                  currentPath = currentPath + "#@#";
              }
              return currentNode;
          }
      }
  }

  /**
   * Can be used to get the element's node from the given item path in the tree.
   *     
   */
  getElementNodeByItemPath(path) {
      if (path) {
          let paths = path.split(".");
          if (paths && paths.length > 0) {
              let currentNode = this;
              let currentPath = "";
              for (let i = 0; i < paths.length; i++) {
                  currentPath = currentPath + paths[i];
                  let selector = "pebble-tree-node[item-path='" + currentPath.replace(/\'/g, "\\'") + "']";
                  let node = ElementHelper.getElement(currentNode, selector);
                  currentNode = node;
                  currentPath = currentPath + ".";
              }
              return currentNode;
          }
      }
  }

  /**
   * Can be used to get the parent's object for a given child node.
   */
  getParentItemForNode(node) {
      return node.getParent();
  }

  /**
   * Can be used to check if a given node is parent node of another node.
   */
  checkIfParentNode(parentNode, childNode) {
      let parentItem = childNode.getParent();
      return (parentItem && parentItem == parentNode.nodeData);
  }

  /**
   * Can be used to check if the given two nodes are each other's siblings.
   */
  checkIfSiblingNodes(node1, node2) {
      let parent1 = node1.getParent();
      let parent2 = node2.getParent();
      return parent1 == parent2;
  }

  /**
   * Can be used to check if the given element is parent element of another element.
   */
  checkIfParentElement(parent, child) {
      let parentItemPaths = this.getElementPathByText(parent.text);
      let childItemPaths = this.getElementPathByText(child.text);
      for (let i = 0; i < parentItemPaths.length; i++) {
          for (let j = 0; j < childItemPaths.length; j++) {
              let lastIndex = childItemPaths[j].lastIndexOf(".");
              if (parentItemPaths[i] == childItemPaths[j].substring(0, lastIndex)) {
                  return true;
              }
          }
      }
      return false;
  }

  /**
   * Can be used to check if there is a parent element with the given text to 
   * another element with the given text.
   */
  checkIfParentElementByText(parentText, childText) {
      let parentItemPaths = this.getElementPathByText(parentText);
      let childItemPaths = this.getElementPathByText(childText);
      for (let i = 0; i < parentItemPaths.length; i++) {
          for (let j = 0; j < childItemPaths.length; j++) {
              let lastIndex = childItemPaths[j].lastIndexOf(".");
              if (parentItemPaths[i] == childItemPaths[j].substring(0, lastIndex)) {
                  return true;
              }
          }
      }
      return false;
  }

  /**
   * Can be used to check if the given two elements are each other's siblings.
   */
  checkIfSiblingElements(element1, element2) {
      let element1Paths = this.getElementPathByText(element1.text);
      let element2Paths = this.getElementPathByText(element2.text);
      for (let i = 0; i < element1Paths.length; i++) {
          for (let j = 0; j < element2Paths.length; j++) {
              let lastIndex1 = element1Paths[i].lastIndexOf(".");
              let lastIndex2 = element2Paths[j].lastIndexOf(".");
              if (lastIndex1 == -1 && lastIndex2 == -1) {
                  return true;
              } else if (lastIndex1 == -1 || lastIndex2 == -1) {
                  continue;
              }
              if (element1Paths[i].substring(0, lastIndex1) == element2Paths[j].substring(0, lastIndex2)) {
                  return true;
              }
          }
      }
      return false;
  }

  /**
   * Can be used to check if there are sibling elements with the given text.
   */
  checkIfSiblingElementsByText(text1, text2) {
      let element1Paths = this.getElementPathByText(text1);
      let element2Paths = this.getElementPathByText(text2);
      for (let i = 0; i < element1Paths.length; i++) {
          for (let j = 0; j < element2Paths.length; j++) {
              let lastIndex1 = element1Paths[i].lastIndexOf(".");
              let lastIndex2 = element2Paths[j].lastIndexOf(".");
              if (lastIndex1 == -1 && lastIndex2 == -1) {
                  return true;
              } else if (lastIndex1 == -1 || lastIndex2 == -1) {
                  continue;
              }
              if (element1Paths[i].substring(0, lastIndex1) == element2Paths[j].substring(0, lastIndex2)) {
                  return true;
              }
          }
      }
      return false;
  }

  /**
   * Can be used to find the path of an element from its text.
   */
  getElementPathByText(text) {
      let paths = [];
      this._checkText(paths, text, this._nav, "");
      return paths;
  }

  /**
   * Can be used to find the element's node from its text.
   */
  getElementNodeByText(text) {
      let paths = this.getElementPathByText(text);
      let nodes = [];
      if (paths && paths.length > 0) {
          for (let i = 0; i < paths.length; i++) {
              nodes.push(this.getElementNodeByPath(paths[i]));
          }
      }
      return nodes;
  }

  /**
   * Can be used to find the elements's data from its text.
   */
  getElementByText(text) {
      let paths = this.getElementPathByText(text);
      let elements = [];
      if (paths && paths.length > 0) {
          for (let i = 0; i < paths.length; i++) {
              elements.push(this.getElementByPath(paths[i]));
          }
      }
      return elements;
  }

  _checkText(paths, text, nav, path) {
      if (!path) {
          path = "";
      }
      for (let i = 0; i < nav.length; i++) {
          let currentPath = path == "" ? path + i : path + "." + i;
          if (nav[i].text == text) {
              paths.push(currentPath);
          } else {
              if (nav[i].children) {
                  this._checkText(paths, text, nav[i].children, currentPath);
              }
          }
      }
  }

  /**
   * Can be used to find the path of an element from its value. 
   * The value is custom or user-defined data associated with a given node.
   */
  getElementPathByValue(value) {
      return this._checkValue(value, this._nav, "");
  }

  /**
   * Can be used to find the element's node from its value.
   */
  getElementNodeByValue(value) {
      let path = this.getElementPathByValue(value);
      if (path) {
          return this.getElementNodeByPath(path);
      }
  }

  /**
   * Can be used to find the element's data from its value.
   */
  getElementByValue(value) {
      let path = this.getElementPathByValue(value);
      if (path) {
          return this.getElementByPath(path);
      }
  }

  _checkValue(value, nav, path) {
      if (!path) {
          path = "";
      }
      for (let i = 0; i < nav.length; i++) {
          let currentPath = path == "" ? path + i : path + "." + i;
          if (nav[i].value == value) {
              return currentPath;
          } else {
              if (nav[i].children) {
                  let res = this._checkValue(value, nav[i].children, currentPath);
                  if (res != currentPath) {
                      return res;
                  }
              }
          }
      }
      return path;
  }

  _itemSelected(e) {
      let eventName = "tree-node-selected";
      let eventDetail = {
          name: eventName,
          data: e.detail.data
      }
      this.fireBedrockEvent(eventName, eventDetail, { ignoreId: true });
  }

  _itemDeSelected(e) {
      let eventName = "tree-node-de-selected";
      let eventDetail = {
          name: eventName,
          data: e.detail.data
      }
      this.fireBedrockEvent(eventName, eventDetail, { ignoreId: true });
  }

  _getValuePath(item) {
      if (item.value) {
          return item.value;
      }
      return item.text;
  }

  _checkId(id, nav, path) {
      if (!path) {
          path = "";
      }
      if(!_.isEmpty(nav)) {
          for (let navIdx = 0; navIdx < nav.length; navIdx++) {
              let currentPath = path == "" ? path + navIdx : path + "." + navIdx;
              if (nav[navIdx].id == id) {
                  return currentPath;
              } else {
                  if (nav[navIdx].children) {
                      let res = this._checkId(id, nav[navIdx].children, currentPath);
                      if (res != currentPath) {
                          return res;
                      }
                  }
              }
          }
      }
      return path;
  }

  /**
   * Can be used to find the path of an element from its value. 
   * The value is custom or user-defined data associated with a given node.
   */
  getElementPathById(id) {
      return this._checkId(id, this._nav, "");
  }

  /**
   * Can be used to find the element's node from its value.
   */
  getElementNodeById(id) {
      let path = this.getElementPathById(id);
      if (path) {
          return this.getElementNodeByItemPath(path);
      }
  }

  /**
   * Can be used to get the actual selected items by user
   */
  getSelectedItems() {
      let selectedItems = DataHelper.cloneObject(this.selectedItems);
      selectedItems = (selectedItems || []).filter(item => { return item.selected; });
      return selectedItems;
  }
}

customElements.define(PebbleTree.is, PebbleTree);
