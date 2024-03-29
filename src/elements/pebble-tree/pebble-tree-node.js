/**
`pebble-tree-node` Represents an individual tree list that is combined to make the `rock-tree`.

@group Pebble Elements
@element pebble-tree-node
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/paper-input/paper-input.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-list.js';
import '../bedrock-style-manager/styles/bedrock-style-flex-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../pebble-button/pebble-button.js';
import '../pebble-horizontal-divider/pebble-horizontal-divider.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-checkbox/pebble-checkbox.js';
import '../pebble-textbox/pebble-textbox.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-dialog/pebble-dialog.js';
import '../rock-search-bar/rock-search-bar.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleTreeNode extends mixinBehaviors([RUFBehaviors.UIBehavior], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-icons bedrock-style-flex-layout bedrock-style-list">
            :host {
                @apply --pebble-tree-node;
            }

            .flex {
                display: -webkit-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: flex;
                align-items: center;
                -webkit-align-items: center;
                /* Safari 7.0+ */
            }

            li {
                list-style: none;
                -ms-transition: initial;
                -webkit-transition: all 0.3s;
                -moz-transition: all 0.3s;
                -o-transition: all 0.3s;
                transition: all 0.3s;
                align-items: flex-start;
                -webkit-align-items: flex-start;
                @apply --pebble-tree-node-list;
            }

            /* IE edge specific fix for #actionButton */

            _:-ms-lang(x),
            _:-webkit-full-screen,
            #actionButton {
                line-height: 24px;
            }

            _:-ms-lang(x),
            _:-webkit-full-screen,
            li {
                transition: initial;
            }
             _:-ms-lang(x),
            _:-webkit-full-screen,
            iron-collapse {
                transition: initial !important;
                transition-property: none !important;
                max-height: initial !important;
            }
            _:-ms-lang(x),
            _:-webkit-full-screen,
            iron-collapse:not(.iron-collapse-opened){
                max-height: 0px !important;
            } 
            
            li:hover,
            li a:hover {
                color: var(--dropdown-selected-font, #036bc3);
                cursor: pointer;
                @apply --pebble-tree-nodeitem-hover;
            }

            li:active {
                color: var(--active-icon-color, #036bc3);
                @apply --pebble-tree-nodeitem-active;
            }

            .selected {
                color: var(--dropdown-selected-font, #036bc3);
                background-color: #eaeaea;
                border-left: 5px solid var(--dropdown-selected-font, #036bc3);
                padding: 5px;
                @apply --pebble-tree-nodeitem-selected;
            }

            ul {
                margin: 5px 0 5px 0;
                padding-left: 23px;
                @apply --pebble-tree-node;
            }

            .tree-node-holder {
                @apply --pebble-tree-node-holder;
            }

            .arrow-down,
            .arrow-right {
                width: 0;
                height: 0;
                border-top: 5px solid transparent;
                border-bottom: 5px solid transparent;
                border-left: 8px solid;
                padding-right: 2px;
                margin-right: 5px;
                color: var(--palette-azure, #0bb2e8);
                @apply --pebble-tree-node-arrow;
            }

            .arrow-down {
                -webkit-transform: rotate(90deg);
                -ms-transform: rotate(90deg);
            }

            pebble-button.iconButton {
                --pebble-button: {
                    padding-left: 0px;
                    padding-top: 0;
                    padding-right: 0;
                    padding-bottom: 0;
                    height: auto;
                    min-width: auto;
                    margin-left: 0px;
                    margin-right: 0px;
                    margin-top: 0px;
                    margin-bottom: 0px;
                    color: var(--primary-icon-color, #75808b);
                }
            }

            .right {
                margin-left: auto;
            }

            .node-border {
                border-top: 1px solid var(--default-border-color, #c1cad4);
                border-bottom: 1px solid var(--default-border-color, #c1cad4);
                margin-top: -1px;
            }

            .nodetext {
                padding-left: 10px;
                @apply --pebble-tree-node-nodetext;
            }
            .flex{
                flex-basis: auto;
            }

            .highlight-node {
                color: var(--palette-cerulean, #036bc3);
            }

            .check-box-wrapper {
                margin: 0 0px 0 23px;
            }

            pebble-icon+.check-box-wrapper {
                margin: 0 0px 0 10px;
            }

            .leaf-node-active .check-box-wrapper {
                margin: 0px;
            }

            .pagination pebble-button {
                letter-spacing: 0.3px;
                margin-left: 10px;
                color: var(--palette-cerulean, #036bc3);
                @apply --pebble-tree-node-pagination-button;
            }

            .hidden {
                visibility: hidden;
            }

            .visible {
                visibility: visible;
            }

            .detailtext {
                font-size: 11px;
                color: var(--text-primary-color, #364653);
                margin-left: 10px;
                padding-top: 5px;
            }

            .flex-grow-zero{
                flex-grow: 0;
            }
            .toggle-icon{
                cursor:pointer;
            }
            li:hover,li:active,li a:hover,li a:active{
                cursor:default;
                color:#000;
            }
            .check-box-wrapper ~ .nodetext:hover,.check-box-wrapper ~ .nodetext-wrapper .nodetext:hover,
            .check-box-wrapper ~ .nodetext:hover a,.check-box-wrapper ~ .nodetext-wrapper .nodetext:hover a{
                cursor:pointer;
            }
        </style>
        <template is="dom-if" if="[[!hasChildren(nodeData.*,itemPath)]]">
            <li class\$="[[_getNodeClass(nodeData)]] [[_getLeafNodeClass()]]" on-tap="_itemClick">
                <div class="check-box-wrapper">
                    <template is="dom-if" if="[[hideLeafNodeCheckbox]]">
                        <pebble-icon class="iconButton pebble-icon-size-14 toggle-icon" icon="pebble-icon:action-expand"></pebble-icon>
                    </template>
                    <template is="dom-if" if="[[!hideLeafNodeCheckbox]]">
                        <pebble-checkbox disabled="[[disabled]]" checked="[[_isSelected(nodeData,selectedItems,selectedItems.*,selectedItem)]]"></pebble-checkbox>
                    </template>
                </div>
                <pebble-icon src="[[nodeData.src]]" icon="[[nodeData.icon]]" hidden="[[!_iconPassed(nodeData)]]"></pebble-icon>
                <div class\$="nodetext [[_getSelectedNodeClass(highlightNode)]]">
                    <a class\$="nav-lnk" on-tap="_itemTextClick">[[nodeData.text]]</a>
                </div>
                <div class="flex">
                    <div class="detailtext nodetext">[[_getPathValue()]]</div>
                </div>
                <div class="right" hidden="[[isNotAddable(addableLevels)]]">
                    <pebble-icon class="iconButton" icon="pebble-icon:action-add-fill" on-tap="_addNewElement"></pebble-icon>
                </div>
            </li>
        </template>
        <template is="dom-if" if="[[hasChildren(nodeData.*,itemPath)]]">
            <li class\$="[[_getNodeClass(nodeData)]]" on-tap="_itemClick">
                <pebble-icon class="iconButton pebble-icon-size-14 toggle-icon" id="toggle-icon" icon\$="[[_expandClass(expanded)]]" on-click="_toggle"></pebble-icon>
                <template is="dom-if" if="[[!leafNodeOnly]]">
                    <div class="check-box-wrapper">
                        <pebble-checkbox disabled\$="[[_isDisabled(nodeData,selectedItems,selectedItems.*,selectedItem)]]" indeterminate="[[_isIndeterminate(nodeData,indeterminateItems,indeterminateItems.*)]]" checked="[[_isSelected(nodeData,selectedItems,selectedItems.*,selectedItem)]]"></pebble-checkbox>
                    </div>
                </template>
                <div class="flex flex-grow-zero nodetext-wrapper">
                    <pebble-icon src="[[nodeData.src]]" icon="[[nodeData.icon]]" hidden="[[!_iconPassed(nodeData)]]"></pebble-icon>
                    <div class\$="nodetext [[_getSelectedNodeClass(highlightNode, nodeData.highlightNode, itemPath)]]" on-tap="_itemTextClick">[[nodeData.text]]</div>
                </div>
                <div class="flex">
                    <div class="detailtext nodetext">[[_getPathValue()]]</div>
                </div>
                <div class="right" hidden="[[isNotAddable(addableLevels)]]">
                    <pebble-icon class="iconButton" icon="pebble-icon:action-add-fill" on-tap="_addNewElement"></pebble-icon>
                </div>
            </li>
        </template>
        <iron-collapse id="collapse" opened\$="[[expanded]]">
            <ul class="flex" hidden\$="[[!nodeData.addNewItem]]">
                <pebble-checkbox disabled\$="[[disabled]]" checked="{{newItemChecked}}" hidden="[[!multiSelect]]"></pebble-checkbox>
                <pebble-textbox id="newItem" disabled="[[disabled]]" label="text input" no-label-float="" on-change="_keyPressed"></pebble-textbox>
            </ul>
            <template is="dom-if" if="[[hasChildren(nodeData.*,itemPath)]]">
                <ul class="tree-node-holder">
                    <pebble-spinner active="[[_loading]]"></pebble-spinner>
                    <template is="dom-if" if="[[nodeData.searchNode]]">
                        <div>
                            <rock-search-bar id="nodeSearch" placeholder="Enter search text" query="{{nodeData.searchKeyword}}"></rock-search-bar>
                            <bedrock-pubsub event-name="rock-search" handler="_onSearch" target-id="nodeSearch"></bedrock-pubsub>
                        </div>
                    </template>
                    <template is="dom-if" if="{{paginationObj.prevTitle}}">
                        <div class="pagination">
                            <pebble-button button-text="{{paginationObj.prevTitle}}" on-tap="_onPaginationPrevHandler"></pebble-button>
                        </div>
                    </template>
                    <template is="dom-repeat" id="childList" items="[[_getChildren(searchKeyword,nodeData.children)]]">
                        <pebble-tree-node disabled="[[disabled]]" node-data="{{item}}" search-keyword="[[searchKeyword]]" select-parent-item="[[selectParentItem]]" default-expand-depth="[[defaultExpandDepth]]" default-child-depth="[[defaultChildDepth]]" selected-item="{{selectedItem}}" selected-items="{{selectedItems}}" indeterminate-items="{{indeterminateItems}}" multi-select="[[multiSelect]]" parent-item="{{nodeData}}" parent-tree-node="[[_setParentTreeNode()]]" item-path\$="[[_setItemPath(index)]]" value-path\$="[[item.valuePath]]" selected-node="{{selectedNode}}" selected-nodes="{{selectedNodes}}" tree="[[tree]]" check-child-nodes="[[checkChildNodes]]" check-parent-nodes="[[checkParentNodes]]" addable-levels="[[addableLevels]]" leaf-node-only="[[leafNodeOnly]]" expand-collapse-icon-object="[[expandCollapseIconObject]]" disable-child-node="[[disableChildNode]]" hide-leaf-node-checkbox="[[hideLeafNodeCheckbox]]">
                        </pebble-tree-node>
                    </template>
                    <template is="dom-if" if="{{paginationObj.nextTitle}}">
                        <div class="pagination">
                            <pebble-button button-text="{{paginationObj.nextTitle}}" on-tap="_onPaginationNextHandler"></pebble-button>
                        </div>
                    </template>
                </ul>
            </template>
        </iron-collapse>
        <pebble-dialog id="treeConfirmationDialog" dialog-title="Confirmation" button-cancel-text="No, do not remove" modal="" alert-box="" show-cancel="" show-ok="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
        <p>Remove [[selectedNodeName]] and all its child contexts?</p>
    </pebble-dialog>
        <bedrock-pubsub event-name="on-buttonok-clicked" handler="_deSelectItem" target-id="treeConfirmationDialog"></bedrock-pubsub>
        <bedrock-pubsub event-name="on-buttoncancel-clicked" handler="selectItem" target-id="treeConfirmationDialog"></bedrock-pubsub>
`;
  }

  static get is() {
      return "pebble-tree-node";
  }

  static get properties() {
      return {
          /**
           * Indicates the navigation item.
           */
          nodeData: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true
          },

          /**
           * Indicates the parent of current navigation item.
           */
          parentItem: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true
          },

          /**
           * Indicates the currently selected item.
           */
          selectedItem: {
              type: Object,
              notify: true,
              value: function () {
                  return {};
              }
          },

          /**
           * Indicates the currently selected item-list.
           */
          selectedItems: {
              type: Array,
              notify: true,
              value: function () {
                  return [];
              }
          },

          /**
           * Indicates the list of items for which atleast one of the child elements are selected.
           */
          indeterminateItems: {
              type: Array,
              notify: true,
              value: function () { return []; }
          },

          /**
           * Indicates the reference to the selected element's node.
           *
           * @property selectedNode
           * @type Object
           */
          selectedNode: {
              type: Object,
              notify: true
          },

          /**
           * Indicates the reference to the list of selected elements' node. A node which is not yet rendered in the `dom` does not appear in this list. 
           * For example, element A has five child elements. 
           * Just selecting the element A does not select all five child elements. 
           * You need to expand the same so that these elements get added to the `dom`. 
           * That makes these elements a part of `selectedNodes` list.
           *
           * @property selectedNodes
           * @type Object
           */
          selectedNodes: {
              type: Array,
              notify: true,
              value: function () {
                  return [];
              }
          },

          /**
           * Indicates the path of the item which is used to traverse to the element.
           *
           * @property itemPath
           * @type String
           */
          itemPath: {
              type: String
          },

          /**
           * Indicates the value path of the item which is used to traverse to the element.
           *
           * @property valuePath
           * @type String
           */
          valuePath: {
              type: String
          },

          /**
           * Specifies the default depth to which the tree will be expanded by default.
           */
          defaultExpandDepth: {
              type: Number,
              value: 0
          },

          /**
           * Specifies whether the current node is in the "expand" or "collapsed" mode.
           */
          expanded: {
              type: Boolean,
              value: false
          },

          /**
           * Specifies whether child elements are selected or not on selecting the parent elements.
           */
          checkChildNodes: {
              type: Boolean,
              value: false
          },

          /**
           * Specifies whether child elements are selected or not on selecting the parent elements.
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
           * Specifies the level at which add buttons should be present so that new child elements can be added. 
           */
          addableLevels: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          defaultChildDepth: {
              type: Number,
              value: 0
          },

          /**
           * Specifies whether or not the tree is disabled.
           */
          disabled: {
              type: Boolean,
              value: false
          },

          /**
           * Specifies the parent node of the current node in tree.
           **/
          parentTreeNode: {
              type: Element
          },

          /**
           * Indicates that pushing of items in control is in progress
           */
          _loading: {
              type: Boolean,
              value: false,
              reflectToAttribute: true
          },

          /**
          * Specifies whether or not only leaf-node selection is enabled.
          */
          leafNodeOnly: {
              type: Boolean,
              value: false
          },

          highlightNode: {
              type: Boolean,
              value: function () {
                  return false;
              },
              notify: true
          },

          searchNode: {
              type: Boolean,
              value: false
          },

          expandCollapseIconObject: {
              type: Object
          },

          paginationObj: {
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
          selectParentItem:{
              type:Boolean,
              value:false
          },
          showWarningOnUnselect:{
              type:Boolean,
              value: false
          },
          selectedNodeName:{
              type:String,
              value:""
          }
      };
  }

  static get observers() {
      return [
          '_defaultExpandDepthChanged(defaultExpandDepth,itemPath)',
          '_nodeDataExpandedChanged(nodeData.expanded)'
      ];
  }

  constructor() {
      super();
  }

  connectedCallback() {
      super.connectedCallback();

      this._collapse = this.shadowRoot.querySelector('#collapse');
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }



  /**
   *  Can be used to return `arrow-down`, if `item.expanded` is <b>true</b>. Otherwise,
   *  `arrow-right` is returned.
   *
   **/
  _arrowClass(item) {
      return (item) ? 'arrow-down' : 'arrow-right';
  }

  _getLeafNodeClass() {
      return (this.leafNodeOnly == true) ? 'leaf-node-active' : 'leaf-node-inactive';
  }

  _expandClass(item) {
      // if(this.expandCollapseIconObject){
      //     return (item) ? this.expandCollapseIconObject.expand : this.expandCollapseIconObject.collapse;
      // }
      return (item) ? 'pebble-icon:action-expand' : 'pebble-icon:action-scope-take-selection';
  }

  _getSelectedNodeClass(_highlight) {
      if (this.highlightNode || (this.nodeData && this.nodeData.highlightNode)) {
          return 'highlight-node';
      }
      return "";
  }

  _isDisabled(item) {
      if (this.disabled || item.isDisabled) {
          return true;
      }
      return false;

  }

  _isSelected(item) {
      /* most of  this logic have to move to some other method isselected method should return only true or false*/
      if (!this.multiSelect && !this.disableChildNode) {
          return (this.selectedItem == this.nodeData);
      }
      if (this.selectedItems != undefined && item) {
          if (this.selectedItems.indexOf(item) > -1) {
              if (this.selectedNodes.indexOf(this) == -1) {
                  this.selectedNodes.push(this);
                  if (this.checkParentNodes) {
                      
                       if (this._allSiblingsSelected()) {
                           let parentNode = this.getParentNode();
                           if (parentNode) {
                               parentNode.selectItem();
                           }
                       } else {
                          this._makeParentIndeterminate();
                      }
                  } else if (this.checkChildNodes && !this.leafNodeOnly) { // If tree is enabled for multi-select and if it is leaf node only it should not select parent nodes. This is temp fix.
                      if (this._hasChildren(item)) {
                          this.checkAllChildNodes(item);
                      }
                      if (this._allSiblingsSelected()) {
                          let parentNode = this.getParentNode();
                          if (parentNode) {
                              parentNode.selectItem();
                          }
                      } else {
                          this._makeParentIndeterminate();
                      }
                  }
              }
              return true;
          } else {
              let index = this.selectedNodes.indexOf(this);
              if (index > -1) {
                  this.splice('selectedNodes', index, 1);
              }
              return false;
          }
      } else {
          return false;
      }
  }

  _isIndeterminate(item, indeterminateItems) {
      if (indeterminateItems != undefined) {
          return indeterminateItems.indexOf(item) > -1;
      }

  }

  /**
   *  Can be used to select the current Item. 
   *  If `checkChildNodes` is set to true, then make sure to 
   *  select the child nodes and make the parent node as indeterminate unless all the sibling nodes are also selected.
   */
  selectItem(isItemSelected = false) {
      if (!this.disabled) {
          let nodeData = this.nodeData;
          this.nodeData.valuePath = this.valuePath;
          if (!this.multiSelect) {
              if (isItemSelected) {
                  this.selectedItem = nodeData;
              }
              this.selectedNode = this;
              if (this.disableChildNode) {
                  this.push('selectedItems', nodeData);
                  if (this._hasChildren(nodeData)) {
                      this.checkAllChildNodes(nodeData);
                  }
              }
              if (this.checkParentNodes) {
                  if (this._allSiblingsSelected()) {
                           let parentNode = this.getParentNode();
                           if (parentNode) {
                               parentNode.selectItem();
                           }
                       } else {
                          this._makeParentIndeterminate();
                      }
              }
          } else {
              if (this.selectedItems.indexOf(nodeData) == -1) {
                  //Set the selected only when isItemSelected is true
                  if (isItemSelected) {
                      nodeData.selected = true;
                  }
                  this.push('selectedItems', nodeData);
                  this.selectedNodes.push(this);
                  if (this.checkParentNodes && !this.selectParentItem) {
                      this._makeParentIndeterminate();
                  }else if(this.selectParentItem){
                      let parentNode = this.getParentNode();
                      if (parentNode) {
                          parentNode.selectItem();
                      }
                  }
              }
              if (this.checkChildNodes && !this.leafNodeOnly) { // If tree is enabled for multi-select and if it is leaf node only it should not select parent nodes. This is temp fix.
                  if (this._hasChildren(nodeData)) {
                      this.checkAllChildNodes(nodeData);
                  }
                  if (this._allSiblingsSelected()) {
                      let parentNode = this.getParentNode();
                      if (parentNode) {
                          parentNode.selectItem();
                      }
                  } else {
                      this._makeParentIndeterminate();
                  }
                  let indeterminateIndex = this.indeterminateItems.indexOf(nodeData);
                  if (indeterminateIndex > -1) {
                      this.splice('indeterminateItems', indeterminateIndex, 1);
                  }
              }
          }
      }
  }

  /**
   *  Can be used de-select the current Item. If `checkChildNodes` is set to true, then make sure to 
   *  de-select the child nodes and make the parent node as determinate unless at least one sibling node is selected.
   */
  _deSelectItem(){
       this.deSelectItem()
  }

  deSelectItem(removeChildNode) {
      if (!this.disabled) {
          if (!this.multiSelect) {
              this.selectedItem = {};
              this.selectedNode = undefined;
              this.selectedItems = [];
              if (this.checkParentNodes) {
                  this._changeParentDeterminateState();
              }
          } else {
              let items = this.selectedItems.filter(obj => {
                return (obj.value === this.nodeData.value && obj.externalNamePath === this.nodeData.externalNamePath)
              });
              if(!_.isEmpty(items)) {
                  items.forEach((item) => {
                      let index = this.selectedItems.indexOf(item);
                      if (index > -1) {
                          this.splice('selectedItems', index, 1);
                      }
                  }, this);
              }
              let nodeIndex = this.selectedNodes.indexOf(this);
              if (nodeIndex > -1) {
                  this.splice('selectedNodes', nodeIndex, 1);
              }
              if (this.checkParentNodes) {
                  this._changeParentDeterminateState();
              }
              if (this.checkChildNodes || removeChildNode == undefined) {
                  if (this._hasChildren(this.nodeData)) {
                      this.unCheckAllChildNodes(this.nodeData);
                  }
                  if(!this.selectParentItem){
                      this._changeParentDeterminateState();
                  }
              }
          }
      }
  }

    _getPathValue() {
        if (this.nodeData && this.nodeData.isSearchMode && this.nodeData.externalNamePath) {
            return ` [${this.nodeData.externalNamePath}]`;
        } else {
            return "";
        }
    }
  /**
   *  Can be used to select all the child nodes without affecting the state of the parent node.
   */
  checkAllChildNodes(nodeData) {
      let children = nodeData.children;
      for (let i = 0; i < children.length; i++) {
          if (this.selectedItems.indexOf(children[i]) == -1) {
              if (this.disableChildNode) {
                  children[i]["isDisabled"] = true;
              }
              this.push('selectedItems', children[i]);
          }
          if (this._hasChildren(children[i])) {
              this.checkAllChildNodes(children[i]);
          }
      }
  }

  /**
   *  Can be used to de-select all the child nodes without affecting the state of the parent node.
   */
  unCheckAllChildNodes(nodeData) {
      let children = nodeData.children;
      for (let i = 0; i < children.length; i++) {
          children[i]["isDisabled"] = false;
          delete children[i]["selected"];
          let index = this.selectedItems.indexOf(children[i]);
          if (index > -1) {
              this.splice('selectedItems', index, 1);
          }
          if (this._hasChildren(children[i])) {
              this.unCheckAllChildNodes(children[i]);
          }
      }
  }

  /**
   *  Can be used to select all the child nodes and also change the state of parent element depending on the state of the sibling elements. 
   *  This works only if the child elements are loaded in the `dom`. If not, use the `checkAllChildNodes` method.
   */
  selectChildNodes() {
      let childNodes = this.getChildNodes();
      for (let i = 0; i < childNodes.length; i++) {
          if (childNodes[i]) {
              childNodes[i].selectItem();
          }
      }
  }

  /**
   *  Can be used to de-select all the child nodes and change the state of the parent elements depending on the state of sibling elements.
   *  This works only if the child elements are loaded in the `dom`. If not, use the `unCheckAllChildNodes` method.
   */
  deSelectChildNodes() {
      let childNodes = this.getChildNodes();
      for (let i = 0; i < childNodes.length; i++) {
          childNodes[i].deSelectItem();
      }
  }

  /**
   * Can be used to get all the child nodes of the current element.
   */
  getChildNodes() {
      let children = this.nodeData.children;
      let path = this.itemPath;
      let childNodes = [];
      if (children && children.length) {
          for (let i = 0; i < children.length; i++) {
              let childPath = path + "." + i;
              let childNode = this.shadowRoot.querySelector("pebble-tree-node[item-path='" + childPath + "']");
              if (childNode) {
                  childNodes.push(childNode);
              }
          }
      }
      return childNodes;
  }

  triggerNodeClick() {
      this._itemTextClick();
  }

  /**
   * Fired when an item text is clicked.
   */
  _itemTextClick(evt) {
      this.dispatchEvent(new CustomEvent('tree-node-clicked', { detail: { data: this }, bubbles: true, composed: true }));
  }

  /**
   * Fired when search node query updated
   */
  _onSearch(ev) {
      this.dispatchEvent(new CustomEvent('node-search-updated', { detail: { data: this, query: ev.detail.query }, bubbles: true, composed: true }));
  }

  /**
   * Fired when next pagination node clicked
   */
  _onPaginationNextHandler(ev) {
      this.dispatchEvent(new CustomEvent('node-pagination-handler', { detail: { data: this, mode: "NEXT" }, bubbles: true, composed: true }));
  }

  /**
   * Fired when prev pagination node clicked
   */
  _onPaginationPrevHandler(ev) {
      this.dispatchEvent(new CustomEvent('node-pagination-handler', { detail: { data: this, mode: "PREV" }, bubbles: true, composed: true }));
  }

  /**
   * Fired when an item is clicked. It sets the selected item and its style.
   */
  _itemClick(evt) {
      if(evt.target.id == 'toggle-icon'){
          return;
      }
      if (this.nodeData.isDisabled) {
          return;
      }
      let nodeData = this.nodeData;
      if (this.multiSelect) {
          if (this.selectedItems.indexOf(nodeData) == -1) {
              this.selectItem(true);
              this.dispatchEvent(new CustomEvent('item-selected', { detail: { data: this }, bubbles: true, composed: true }));
          } else {
              if(this.showWarningOnUnselect && this._hasChildren(this.nodeData)){
                  this.deSelectItem(false);
                  if(this.nodeData.name){
                      this.selectedNodeName = this.nodeData.name;
                  }
                  this.shadowRoot.querySelector("#treeConfirmationDialog").open();
              }else{
                  this.deSelectItem()
              }
              this.dispatchEvent(new CustomEvent('item-de-selected', { detail: { data: this }, bubbles: true, composed: true }));
          }
      } else {
          if (this.disableChildNode && this.selectedItems.length > 0) {
              this.selectedItems.forEach(element => {
                  if (!this.disabled) {
                      element.isDisabled = false;
                  }
              });
          }
          if (this.disableChildNode) {
              this.set("selectedItems", []);
              this.set("indeterminateItems", []);
          }
          if (this.selectedItem == nodeData) {
              this.deSelectItem();
          } else {
              this.selectItem(true);
          }
      }
  }

  /**
   * Fired when a menu is clicked on. It toggles the menu, and ensures the arrows on the menu are correct.
   */
  _toggle(evt) {
      this.dispatchEvent(new CustomEvent('tree-node-expanded', { detail: this, bubbles: true, composed: true }));
      this._collapse.toggle();
      this.expanded = !this.expanded;
      this.set('nodeData.addNewItem', false);
  }

  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  expand(evt) {
      if (!this.expanded) {
          this._collapse.toggle();
          this.expanded = true;
          this.set('nodeData.addNewItem', false);
      }
      this.dispatchEvent(new CustomEvent('tree-node-expanded', { detail: this, bubbles: true, composed: true }));
  }

  get newItem() {
      this._newItem = this._newItem || this.shadowRoot.querySelector('#newItem');
      return this._newItem;
  }

  _addNewElement(evt) {
      if (!this.disabled) {
          if (!this.expanded) {
              this._toggle();
          }
          microTask.run(() => {
              if (this.newItem) {
                  this.newItem.focus();
              }
          });
          this.set('nodeData.addNewItem', true);
      }
  }

  /**
   * Fired when enter key is pressed after creating a new node
   */
  _keyPressed(e) {
      const newItem = this.newItem;
      let value = newItem.value;
      newItem.text = value;
      if (!this.nodeData.children) {
          this.nodeData.children = [];
      }
      this.set('nodeData.addNewItem', false);
      newItem.value = '';
      this.unshift('nodeData.children', newItem);
      microTask.run(() => {
          if (this.newItemChecked) {
              this.getElementNodeByPath(this.itemPath + ".0").selectItem();
              this.newItemChecked = false;
          } else {
              this.getElementNodeByPath(this.itemPath + ".0")._changeParentDeterminateState();
          }
      });
      this.refreshChildList();
      this.dispatchEvent(new CustomEvent('new-item-added', { detail: { nodeData: newItem, path: this.itemPath + ".0" }, bubbles: true, composed: true }));
  }

  /**
   * Can be used to clear the selected item list and checkbox selection.
   */
  clearSelectedItems() {
      this.selectedItems = [];
      this.selectedNodes = [];
      this.indeterminateItems = [];
      //Clear selected items
      let selectionCheckboxList = this.querySelectorAll('pebble-checkbox');
      for (let idx = 0; idx < selectionCheckboxList.length; idx++) {
          selectionCheckboxList[idx].checked = false;
      }
  }

  /**
   * Can be used to clear the selected item and style.
   */
  clearSelectedItem() {
      this.selectedItem = {};
      this.selectedNode = null;
      //Clear selected item
      let item = this.querySelector('.selected');
      if (item) {
          item.classList.remove('selected');
      }
  }

  /**
   * Can be used to check whether the given item has children.
   */
  _hasChildren(item) {
      return item.hasChildren || (item.children && item.children.length > 0);
  }

  /**
   * Can be used to check whether the current node has children.
   */
  hasChildren() {
      let currentLevel = undefined;
      if (this.itemPath) {
          currentLevel = (this.itemPath.length + 1) / 2;
      }
      if (!this._changeToLeafMode && currentLevel <= this.defaultChildDepth) {
          return true;
      }

      return this.nodeData.children && this.nodeData.children.length > 0;
  }

  /**
   * Can be used to check whether an icon is passed.
   */
  _iconPassed(item) {
      if (item.icon || item.src) {
          return true;
      }
      return false;
  }

  /**
   *  Can be used to get the parent element of the current item.
   *
   */
  getParent() {
      if (this.parentItem.hasOwnProperty("text")) {
          return this.parentItem;
      } else {
          return null;
      }
  }

  /**
   *  Can be used to get the parent node of the current node.
   *
   */
  getParentNode() {
      let lastIndex = this.valuePath.lastIndexOf("#@#");
      let parentPath = this.valuePath.substring(0, lastIndex);
      return this.tree.getElementNodeByPath(parentPath);
  }

  _makeParentIndeterminate() {
      let parent = this.getParent();
      let index = this.selectedItems.indexOf(parent);
      if (index > -1) {
          this.splice('selectedItems', index, 1);
      }
      if (parent && this.indeterminateItems.indexOf(parent) == -1) {
          this.push('indeterminateItems', parent);
          let parentNode = this.getParentNode();
          if (parentNode) {
              parentNode._makeParentIndeterminate();
          }
      }
  }

  _changeParentDeterminateState() {
      let parent = this.getParent();
      if (parent) {
          let children = parent.children;
          for (let i = 0; i < children.length; i++) {
              if (this.selectedItems.indexOf(children[i]) > -1 || this.indeterminateItems.indexOf(children[i]) > -1) {
                  this._makeParentIndeterminate();
                  return;
              }
          }
          let parentNode = this.getParentNode();
          let index = this.indeterminateItems.indexOf(parent);
          if (index > -1) {
              this.splice('indeterminateItems', index, 1);
              if (parentNode) {
                  parentNode._changeParentDeterminateState();
              }
          } else {
              let selIndex = this.selectedItems.indexOf(parent);
              if (selIndex > -1) {
                  this.splice('selectedItems', selIndex, 1);
                  if (parentNode) {
                      parentNode._changeParentDeterminateState();
                  }
              }
          }
      }
  }

  _setItemPath(index) {
      return this.itemPath + "." + index;
  }

  /**
   * Can be used to get the element's node from its path in the tree.
   */
  getElementNodeByPath(path) {
      return this.tree.querySelector("pebble-tree-node[item-path='" + path + "']");
  }

  _defaultExpandDepthChanged(defaultExpandDepth, itemPath) {
      if (!(defaultExpandDepth === undefined || itemPath === undefined)) {
          let currentLevel = (itemPath.length + 1) / 2;
          if (defaultExpandDepth >= currentLevel) {
              this.expanded = true;
          }
      }
  }

  _nodeDataExpandedChanged(expanded) {
      if (expanded) {
          this.expanded = true;
      }
  }

  _allSiblingsSelected() {
      let parent = this.getParent();
      if (parent) {
          let children = parent.children;
          for (let i = 0; i < children.length; i++) {
              if (this.selectedItems.indexOf(children[i]) == -1) {
                  return false;
              }
          }
          return true;
      }
      return false;
  }

  /*
   *  Can be used to check if the current level is addable nor not.
   */
  isNotAddable(addableLevels) {
      let currentLevel = (this.itemPath.length + 1) / 2;
      if (this.addableLevels.indexOf(currentLevel) > -1) {
          return false;
      }
      return true;
  }

  _getChildren(searchKeyword) {
      let navArr = this.nodeData.children;
      if (!navArr || _.isEmpty(navArr)) {
          return [];
      }

      let children = [];
      if (!searchKeyword || searchKeyword == "") {
          children = navArr;
      } else {
          let foundItems = [];
          let len = navArr.length;
          for (let i = 0; i < len; i++) {
              if (navArr[i].text.toLowerCase().indexOf(searchKeyword.toLowerCase()) != -1) {
                  foundItems.push(navArr[i]);
                  continue;
              }
              let childMatch = false;
              if (navArr[i].children) {
                  childMatch = this.tree._checkChildMatch(navArr[i].children, searchKeyword);
              }
              if (childMatch) {
                  foundItems.push(navArr[i]);
              }
          }
          if (foundItems.length > 0) {
              this.expanded = true;
          }
          children = foundItems;
      }

      if (children.length > 0) {
          for (let i = 0; i < children.length; i++) {
              let child = children[i];
              child.valuePath = this._computeValuePath(child);
          }
      }
      if (this._isSelected(this.nodeData)) {
          this.selectItem();
      }
      return children;
  }

  /*
   * Can be used to refresh the tree node if there are any changes in the "child" node data.
   */
  refreshChildList() {
      let _children = this.nodeData.children;
      this.set("nodeData.children", []);
      this.set("nodeData.children", _children);
      this.shadowRoot.querySelector("#childList").render();
      if (_.isEmpty(_children)) {
          if (!this.multiSelect && this.selectedNode) {
              this.selectedNode.deSelectItem();
          }
          if (this._isSelected(this.nodeData)) {
              this.deSelectItem();
          }
          this.selectItem(true);
      }
      this._loading = false;
      this.fireBedrockEvent('tree-node-child-list-refreshed', this, { "ignoreId": true });
  }

  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  changeToLeafMode() {
      this._changeToLeafMode = true;
  }

  _getNodeClass(nodeData) {
      if (nodeData.border) {
          return "flex node-border";
      }
      else {
          return "flex";
      }
  }

  _computeValuePath(nodeData) {
      return this.valuePath + "#@#" + (nodeData.value || nodeData.text);
  }

  _setParentTreeNode() {
      return this;
  }

  /**
   * Can be used to collapse the current node.
   **/
  collapse() {
      this.expanded = false;
  }

  /**
   * Can be used to select the parent node of the current node.
   **/
  selectParentNode() {
      let parentNode = this.getParentNode();
      if (parentNode) {
          parentNode.selectItem();
      }
  }

  /**
  * Can be used to select all parent nodes, grand parent nodes of the current node
  **/
  selectAllParentNodes() {
      let parentNode = this.getParentNode();
      if (parentNode) {
          parentNode.selectItem();
          parentNode.selectAllParentNodes();
      }
  }

  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  isTreeNodeSelected(nodeData) {
      let data = this.selectedItems.find(function (item) {
          if (item.text == nodeData.text) {
              if (nodeData.value || data.value) {
                  return nodeData.value == data.value;
              }
              return true;
          } else {
              return false;
          }
      });
  }

  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  startLoading() {
      this._loading = true;
  }
}

customElements.define(PebbleTreeNode.is, PebbleTreeNode);
