/**
`grid-tile-view` Represents an element that displays the items in the `grid-tile-view`.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-list/iron-list.js';
import '@polymer/paper-item/paper-item.js';
import '../pebble-spinner/pebble-spinner.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-list.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-floating.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-button/pebble-button.js';
import '../pebble-checkbox/pebble-checkbox.js';
import '../pebble-data-table/grid-selection-popover.js';
import '../pebble-info-icon/pebble-info-icon.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../rock-image-viewer/rock-image-viewer.js';
import './grid-item-view-behavior.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class GridTileView
extends mixinBehaviors([
    RUFBehaviors.GridItemViewBehavior
], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-grid-layout bedrock-style-floating bedrock-style-icons bedrock-style-padding-margin bedrock-style-list">
            :host {
                display: block;
                height: 100%;
            }

            iron-list {
                height: auto;
                display: block;
                min-height: 0px;
                -webkit-overflow-scrolling: touch;
                overflow-y: auto;
                overflow-x: hidden;
                width: 100%;

                --iron-list-items-container: {
                    width: 100%;
                }
            }

            :host {
                @apply --paper-font-common-base;
                width: 100%;
            }

            pebble-spinner {
                --pebble-spinner-position: {
                    top: 150px;
                }
            }

            .trim {
                display: block;
                width: 100%;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }

            .title {
                font-weight: var(--font-bold, bold);
                max-width: 100%;
                display: -ms-flexbox;
                display: -webkit-flex;
                display: flex;
                height: 21px;
            }

            .key-title {
                max-width: 60%;
                display: -ms-flexbox;
                display: -webkit-flex;
                display: flex;
            }

            .value-title {
                font-weight: var(--font-bold, bold);
                max-width: 100%;
                display: -ms-flexbox;
                display: -webkit-flex;
                display: flex;
                min-width: 0;
            }

            .subtitle {
                margin-bottom: 10px;
                font-size: var(--font-size-sm, 12px);
                color: var(--palette-steel-grey, #75808b);
                max-width: 100%;
                display: -webkit-box;
                height: 34px;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: normal;
                -webkit-line-clamp: 2;
            }

            .block-text {
                font-weight: var(--font-medium, 500);
            }

            .button-container {
                position: relative;
                float: left;
                margin: 8px 0px 0 5px;
            }

            .photoContent {
                position: relative;
                width: 100%;
                background-color: var(--white, #fff);
                border: solid 1px var(--default-border-color, #c1cad4);
                border-radius: var(--default-border-radius, 3px);
                box-shadow: 0 0 3px 0 rgba(193, 202, 212, 0.7);
            }

            .photoContent .right {
                float: right;
            }

            #image-container {
                width: calc(100% - 20px);
                height: 120px;
                margin: 10px 10px 10px 10px;
                text-align: center;
                border-radius: var(--default-border-radius, 3px);
                float: left;
            }

            .text {
                margin: 0px 10px 0px 10px;
            }

            .item-container {
                display: -webkit-inline-flex;
                display: inline-flex;
                border-radius: var(--default-border-radius, 3px);
                padding: 0 10px 10px 0px;
                width: calc(20% - 20px);
            }

            @media (min-width: 1600px) {
                .item-container {
                    width: calc(99.9% / (8/var(--grid-tile-col-length, 1)));
                }
            }

            @media (max-width: 1600px) {
                .item-container {
                    width: calc(99.9% / (6/var(--grid-tile-col-length, 1)));
                }
            }

            @media (max-width: 1024px) {
                .item-container {
                    width: calc(99.9% / (5/var(--grid-tile-col-length, 1)));
                }
            }

            @media (max-width: 768px) {
                .item-container {
                    width: calc(99.9% / (4/var(--grid-tile-col-length, 1)));
                }
            }

            @media (max-width: 480px) {
                .item-container {
                    width: 99.9%;
                }
            }

            .photoContent:hover {
                box-shadow: 1px 2px 5px -1px var(--default-border-color, #c1cad4);
            }

            .right {
                float: right;
            }

            .center {
                text-align: center;
                color: var(--palette-water-blue, #139de6);
            }

            .top {
                display: inline-flex;
                display: -webkit-inline-flex;
                width: 100%;
                text-align: center;
                box-sizing: border-box;
                padding: 0px 7px 7px 0px;
            }

            .top grid-selection-popover {
                float: left;
                margin-top: -3px;
            }

            .header-button-container {
                position: relative;
                float: left;
            }


            .actions {
                margin-left: 2%;
            }

            .actionsPopover {
                @apply --pebble-actions-popover;
                --default-popup-t-p: 5px;
                --default-popup-b-p: 5px;
            }

            pebble-popover paper-item {
                cursor: pointer;
                font-size: var(--font-size-sm, 12px);
                color: var(--palette-steel-grey, #75808b);
                text-align: left;
                transition: all 0.3s;
                -webkit-transition: all 0.3s;
            }

            pebble-popover paper-item[disabled] {
                cursor: no-drop;
                pointer-events: visible !important;

                --pebble-icon-container: {
                    opacity: 0.5;
                }
            }

            pebble-popover paper-item[disabled] .action-container {
                pointer-events: none;
            }

            pebble-popover paper-item:hover {
                background-color: var(--bgColor-hover, #e8f4f9);
                color: var(--focused-line, #026bc3);
            }

            pebble-popover paper-item:focus {
                color: var(--primary-button-color, #036bc3);
                background-color: var(--bgColor-hover, #e8f4f9);
            }

            pebble-icon {
                padding: 0;
                margin-top: 8px;
                margin-right: 5px;
                color: var(--primary-icon-color, #75808b);
            }

            .listContent {
                display: -ms-flexbox;
                display: -webkit-flex;
                display: flex;
                -ms-flex: 1 0 auto;
                -webkit-flex: 1 0 auto;
                flex: 1 0 auto;
                font-size: var(--default-font-size, 14px);
                color: var(--palette-steel-grey, #75808b);
                max-width: 100%;
            }

            #gridSelectionPopover {
                cursor: pointer;
                width: 20px;

                --popover-position: {
                    margin-top: -3px;
                    margin-left: 3px;
                }

                ;
            }

            .isPrimary {
                background-color: #e8ecf1;
            }

            .coalesced-value {
                font-style: italic;
            }

            .view-source-information-popover {
                font-weight: normal;
                text-transform: initial;
                text-align: left;
                margin-left: -12px;
                margin-top: 7px;
                --default-popup-b-p: 5px;
                --default-popup-t-p: 5px;
                --default-font-size: 12px;
                width: 180px;
            }

            .view-source-information-popover::after,
            .view-source-information-popover::before {
                bottom: 100%;
                left: 20px;
                border: solid transparent;
                content: " ";
                height: 0;
                width: 0;
                position: absolute;
                pointer-events: none;
            }

            .view-source-information-popover::after {
                border-color: rgba(255, 255, 255, 0);
                border-bottom-color: #ffffff;
                border-width: 6px;
                margin-left: -6px;
            }

            .view-source-information-popover::before {
                border-color: rgba(194, 225, 245, 0);
                border-bottom-color: rgb(216, 221, 228);
                border-width: 7px;
                margin-left: -7px;
            }

            .source-information-header,
            .source-information-description,
            .source-information-path {
                padding-left: 10px;
                padding-right: 10px;
            }

            .source-information-header {
                font-weight: bold;
                border-bottom: thin solid rgb(216, 221, 228);
                padding-bottom: 3px;
            }

            .source-information-path {
                margin-top: 10px;
                margin-bottom: 0px;
            }

            .source-information-path .path-item {
                color: var(--link-text-color, #139ee7);
                display: inline-block;
            }

            .source-information-path .path-item::after {
                content: " >>";
                color: var(--default-text-color, #444444);
            }

            .source-information-path .path-item:last-of-type::after {
                content: "";
            }
            a {
                text-decoration: none;
            }
            li {
                text-align: inherit;
            }

            .full-height {
                height: calc(100% - 20px);
            }
        </style>
        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <div class="top" hidden="[[!enableMultiSelection]]">
                    <pebble-checkbox class="header-button-container" header="" on-tap="_toggleSelectAll" checked="[[_isSelectAllChecked(selectedItems.length, selectedItems.inverted, items.length)]]" indeterminate="[[_isSelectAllIndeterminate(selectedItems.length, items.length)]]"></pebble-checkbox>
                    <template is="dom-if" if="[[advanceSelectionEnabled]]">
                        <grid-selection-popover selection-options="[[advanceSelectionOptions]]" id="gridSelectionPopover" on-selection-changed="_onPopoverSelectionChange"></grid-selection-popover>
                    </template>
                </div>
            </div>

            <div class="base-grid-structure-child-2">
                <iron-list id="list" as="item" items="[[items]]" grid="" class="full-height">
                    <template>
                        <div class="item-container" id\$="gridItem[[index]]">
                            <div class\$="{{_computePrimaryClass(item)}}" tabindex\$="[[tabIndex]]">
                                <pebble-checkbox on-tap="_tapEvent" class="button-container" checked="[[_isSelected(item,selectedItems, selectedItems.*)]]" noink="" disabled\$="[[_disableGridCheckBox]]"></pebble-checkbox>
                                <div class="right">
                                    <template is="dom-if" if="[[_hasCoalescedValue(item)]]">
                                        <pebble-icon id="action_[[item.id]]_sourceInfo" title="View source information" class="actionButton pebble-icon-size-16 m-r-5 m-l-5" icon="pebble-icon:hierarchy" on-tap="_onSourceInformationClick" item="[[item]]" index="[[index]]" action-index="[[colIndex]]"></pebble-icon>
                                        <pebble-popover class="view-source-information-popover" id="action_[[item.id]]_sourceInfo-popover" for="action_[[item.id]]_sourceInfo">
                                            <div class="attributes-description">
                                                <div class="source-information-header">Source Information</div>
                                                <div class="source-information-description">This value was sourced from the following path</div>
                                                <template is="dom-if" if="[[_hasContextCoalescedValue(item)]]">
                                                    <ul class="source-information-path">
                                                        Context:
                                                        <br>
                                                        <template is="dom-repeat" items="[[item.contextCoalescePaths]]" as="coalescePath">
                                                            <li class="path-item">[[coalescePath]]</li>
                                                        </template>
                                                    </ul>
                                                </template>
                                                <template is="dom-if" if="[[_hasRelatedEntityCoalescedValue(item)]]">
                                                    <ul class="source-information-path">
                                                        Related Entity:
                                                        <br>
                                                        <template is="dom-if" if="[[!_isRelatedEntityRecieved]]">
                                                            Calculating . . .
                                                        </template>
                                                        <template is="dom-if" if="[[_isRelatedEntityRecieved]]">
                                                            <a href="[[_relatedEntityLink]]">
                                                                [[_relatedEntityName]]
                                                            </a>
                                                        </template>
                                                    </ul>
                                                </template>
                                            </div>
                                        </pebble-popover>
                                    </template>
                                    <template is="dom-if" if="[[_isActionsAvailable(actions)]]">
                                    <pebble-icon id="actions_container_{{item.id}}" class="dropdown-trigger pebble-icon-size-16" name="more" icon="pebble-icon:actions-more-vertical" title="More options" on-tap="_onActionsTap" noink=""></pebble-icon>
                                    <pebble-popover id\$="action_list_{{item.id}}" class="actionsPopover p-r-20 p-l-20" for="actions_container_{{item.id}}" no-overlap="" horizontal-align="right">
                                        <template is="dom-repeat" items="[[_getActions(item)]]" as="action">
                                            <paper-item id="action_[[item.id]]_[[action.name]]" title\$="[[action.tooltip]]" item="[[item]]" disabled\$="[[action.disabled]]">
                                                <div class="action-container" action="[[action]]" on-tap="_onActionItemTap">
                                                    <div>
                                                        <template is="dom-if" if="[[action.icon]]">
                                                            <pebble-icon icon="[[action.icon]]"></pebble-icon>
                                                        </template>
                                                    </div>
                                                    <div>
                                                        <template is="dom-if" if="[[action.text]]">
                                                            [[action.text]]
                                                        </template>
                                                    </div>
                                                </div>
                                            </paper-item>
                                        </template>
                                    </pebble-popover>
                                    </template>
                                </div>
                                <rock-image-viewer alt="Product image." id="image-container" sizing="contain" src="{{_computeImage(item,tileItems.image)}}" thumbnail-id="{{_computeValue(item,tileItems.thumbnailId)}}" asset-details="[[item]]">
                                </rock-image-viewer>
                                <div class="clearfix"></div>
                                <div class="text">
                                    <div class="title block-text" title\$="[[_computeTitle(item,tileItems.title,titlePattern)]]">
                                    <template is="dom-if" if="[[_hasLinkTemplate(tileItems)]]">
                                            <a href\$="[[_getLink(item)]]" class\$="text-ellipsis [[_getStyleClass(item)]]">[[_computeTitle(item,tileItems.title,titlePattern)]]</a>
                                        </template>
                                        <template is="dom-if" if="[[!_hasLinkTemplate(tileItems)]]">
                                            <div class\$="text-ellipsis [[_getStyleClass(item)]]">[[_computeTitle(item,tileItems.title,titlePattern)]]</div>
                                        </template>
                                       
                                    </div>
                                    <div class="clearfix"></div>
                                    <div title\$="[[_computeSubTitle(item,tileItems.subtitle,tileItems.fields,subTitlePattern)]]">
                                        <div class\$="text-ellipsis [[_getStyleClass(item)]] subtitle">[[_computeSubTitle(item,tileItems.subtitle,tileItems.fields,subTitlePattern)]]</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </iron-list>

            </div>
        </div>
        <template is="dom-if" if="{{loading}}">
            <pebble-spinner active="[[loading]]"></pebble-spinner>
        </template>
`;
  }

  static get is() {
      return 'grid-tile-view'
  }
  static get properties() {
      return {
          resultRecordSize: {
              type: Number,
              value: 0
          },

          /**
           * Indicates the config of the `grid-tile-view`.
           */
          tileItems: {
              type: Object
          },

          _disableGridCheckBox: {
              type: Boolean,
              value: false
          },

          _viewMode: {
              type: String,
              value: 'Tile'
          },
          subTitlePattern: {
              type: String
          },
          titlePattern: {
              type: String
          },
          _isRelatedEntityRecieved: {
              type: Boolean,
              value: false
          },
          _relatedEntityLink: {
              type: String,
              value: ""
          },
          _relatedEntityName: {
              type: String,
              value: ""
          }
      }
  }

  connectedCallback() {
      super.connectedCallback();
      afterNextRender(this, this._loadMoreData.bind(this));
  }

  _notifyResize(e) {
      //this.$.list.notifyResize();
  }

  _onPopoverSelectionChange(e) {
      this._disableGridCheckBox = false;
      if (RUFBehaviors.GridItemViewBehavior._onPopoverSelectionChange.call(this, e)) {
          this._disableGridCheckBox = true;
      }
  }
  _loadMoreData() {
      //load more data only when - items are more than current page can hold
      if (this.items && ((this.items.length < this.page * this.pageSize) || (this.resultRecordSize && this.items.length == this.resultRecordSize))) {
          return;
      }
      this.page++;
  }
  /**
   * <b><i>Content development is under progress... </b></i>
   */
  reloadData() {
      if (!this.loading) {
          this.page = -1;
          this.items = [];
          this.page = 1;
      }

  }

  _resetAdvanceSelection() {
      const successReset = RUFBehaviors.GridItemViewBehavior._resetAdvanceSelection.call(this);

      if (successReset) {
          this._disableGridCheckBox = false;
      }
  }
  /**
   * This is an internal function to handle the tap event. It fires event 'deselecting-item' if an item was already selected.
   *  It fires event 'selecting-item' if an item was not selected. The data of the event fired is the data of the item.
   */
  _tapEvent(e) {
      if (this.selectionInfo && this.selectionInfo.mode == "query") {
          return;
      }
      RUFBehaviors.GridItemViewBehavior._tapEvent.call(this, e);
  }
  /**
   * This is an internal function, used to compute the image url based on the config.
   */
  _computeImage(item, image) {
      if (item) {
          return item[image];
      }
  }
  /**
   * This is an internal function, used to compute the title based on the config.
   */
  _computeTitle(item, title, titlePattern) {
      if (item) {
          if (!_.isEmpty(titlePattern)) {
              return DataHelper.prepareTitleByPattern(item, titlePattern);
          } else {
              return item[title]
          }
      }
  }
  _computeSubTitle(item, subtitle, fieldsinObj, subTitlePattern) {
      if (item) {
          if (!_.isEmpty(subTitlePattern)) {
              return DataHelper.prepareTitleByPattern(item, subTitlePattern);
          } else {
              let subTitle = item ? item[subtitle] || "" : "";
              let fields = this._getArrayFromObject(fieldsinObj);
              (fields || []).forEach(function (field) {
                  if (field && item && item[field.name]) {
                      subTitle += subTitle ? " | " + item[field.name] : item[field.name]
                  }
              });
              return subTitle;
          }
      }
  }

  /**
   * Check for the field type and display the item details accordingly
   */
  _isItemFieldEnabled(item, field) {
      if (this.tileItems.title == field.name) return '';
      if (field.type && item) {
          let fieldTypes = field.type.toString();
          return (field.type == "All" || fieldTypes.indexOf(item.type) > -1);
      }
      return true;
  }

  /**
   * This is an internal function, used to compute the value of the attribute to be displayed.
   */
  _computeValue(item, field) {
      if (item) {
          return item[field];
      }
  }

  /*
   * Can be used to select all the items in the list.
   */
  selectAll() {
      this.set('selectedItems', []);
      this.set('selectedItems.inverted', true);
  }
  /**
   * Can be used to clear the current selection state.
   */
  clearSelection() {
      this.set('selectedItems', []);
      RUFBehaviors.GridItemViewBehavior._clearSelection.call(this);
  }

  _computePrimaryClass(item) {
      if (item.isprimary) {
          if (item.isprimary == "true") {
              return "photoContent isPrimary"
          }
      }
      return "photoContent";
  }
  _isActionsAvailable(actions){
    if(actions && actions.length >0){
        return true;
    }
    return false
}
  _getActions (item) {
      let actions = DataHelper.cloneObject(this.actions);
      if (this._addSourceInfoAction(actions, item)) {
          actions.forEach(function (item) {
              if (item.eventName == "delete-item") {
                  item.disabled = true;
                  item.tooltip = "Sourced relationship can not be deleted";
              }
          });
      }
      return actions;
  }
  _hasLinkTemplate (tileItems) {
      return !!tileItems.linkTemplate;
  }
  _getLink (item) {
      let linkTemplate;
      if(item && item.disableLink){
          return;
      }
      linkTemplate = this.tileItems.linkTemplate;
      return "/" + DataHelper.getTenantId() + "/" + linkTemplate.replace(/\{\S+?\}/g,
          function (match) {
              let attrName = match.replace("{", "").replace("}", "");
              return item[attrName];
      });                    
  }

  _hasCoalescedValue(item) {
      return this._hasContextCoalescedValue(item) || this._hasRelatedEntityCoalescedValue(item);
  }

  _hasContextCoalescedValue(item) {
      if (item && !_.isEmpty(item.contextCoalescePaths)) {
          return true;
      }
  }

  _hasRelatedEntityCoalescedValue(item) {
      return item && item.os === "graph" && !_.isEmpty(item.osid) && !_.isEmpty(
          item.ostype);
  }

  _getStyleClass(item) {
      if (this._hasCoalescedValue(item)) {
          return "coalesced-value";
      }
  }

  _onSourceInformationClick(e) {
      let item = e.currentTarget.item;
      let popoverId = "#action_" + item.id + "_sourceInfo-popover";
      let sourceInformation = this.shadowRoot.querySelector(popoverId);
      if (sourceInformation) {
          sourceInformation.show();
      }
      e.stopPropagation();

      if (this._hasRelatedEntityCoalescedValue(item)) {
          this._isRelatedEntityRecieved = false;
          this._relatedEntityLink = "";
          this._relatedEntityName = "";
          let eventDetail = {
              data: {
                  "id": item.osid,
                  "type": item.ostype
              },
              callback: this._onRelatedEntityInfoGet.bind(this),
              name: "source-info-open"
          }
          ComponentHelper.fireBedrockEvent("source-info-open", eventDetail, {
              ignoreId: true
          });
      }
  }

  _onRelatedEntityInfoGet(entity) {
      if (!_.isEmpty(entity)) {
          this._isRelatedEntityRecieved = true;
          this._relatedEntityLink = "entity-manage?id=" + entity.id + "&type=" + entity.type;
          this._relatedEntityName = entity.name;
      } else {
          this._isRelatedEntityRecieved = true;
          this._relatedEntityName = "NA";
      }
  }
}
customElements.define(GridTileView.is, GridTileView);
