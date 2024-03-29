/**
`grid-list-view` Represents an element that displays the items in the `grid-list-view`.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/paper-item/paper-item.js';
import '@polymer/iron-list/iron-list.js';
import '../pebble-spinner/pebble-spinner.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-list.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-button/pebble-button.js';
import '../pebble-checkbox/pebble-checkbox.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-data-table/grid-selection-popover.js';
import '../pebble-info-icon/pebble-info-icon.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../rock-image-viewer/rock-image-viewer.js';
import './check-box-with-indeterminate-state.js';
import './grid-item-view-behavior.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class GridListView
    extends mixinBehaviors([
        RUFBehaviors.GridItemViewBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-icons bedrock-style-padding-margin bedrock-style-list">
            :host{
                display: block;
                height:100%;
            }
            iron-list {
                display: block;
                height: 100%;
                overflow-y: auto;
                overflow-x: hidden;
                -webkit-overflow-scrolling: touch;
                border-radius: 3px;
                border: 1px solid var(--divider-color, #c1cad4);
                @apply --grid-list-view-scrollingRegion;
            }

            .left {
                width: 3%;
                text-align: center;
            }

            .button-container {
                position: relative;
            }

            .container {
                width: 100%;
                display: inline-flex;
                display: -webkit-inline-flex;
                padding: 10px;
                align-items: center;
                box-sizing: border-box;
                border-top: 1px solid var(--divider-color, #c1cad4);
                @apply --pebble-grid-list-container;
            }
            .container:nth-child(1),template + .container:nth-child(2){
                border-top: none;
            }

            .isPrimary {
                background-color: #e8ecf1;
            }

            #image-container {
                width: var(--default-thumb-size, 40px);
                height: var(--default-thumb-size, 40px);
            }

            .trim {
                display: block;
                width: 100%;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .default {
                margin-right: 5%;
                width: 95%;
            }

            /*.actions {*/

            /*margin-left: 2%;*/

            /*}*/

            .top {
                display: inline-flex;
                display: -webkit-inline-flex;
                width: 100%;
                text-align: center;
                box-sizing: border-box;
                /*border-bottom: 1px solid var(--divider-color, #c1cad4);*/
                padding: var(--list-padding, 7px);
                margin-top: -15px;
            }

            .top grid-selection-popover {
                float: left;
                margin-top: -3px;
            }

            .header-button-container {
                position: relative;
                float: left;
            }

            .actionsPopover {
                @apply --pebble-actions-popover;
                --default-popup-t-p: 5px;
                --default-popup-b-p: 5px;
            }

            pebble-popover paper-item {
                cursor: pointer;
                font-size: var(--default-font-size, 14px);
                min-height: 40px;
                color: var(--palette-steel-grey, #75808b);
                text-align: left;
                transition: all 0.3s;
                -webkit-transition: all 0.3s;
                padding-left: var(--default-popup-item-l-p, 20px);
                padding-right: var(--default-popup-item-r-p, 20px);
            }

            pebble-popover paper-item:hover {
                background-color: var(--bgColor-hover, #e8f4f9);
                color: var(--focused-line, #026bc3);
            }

            pebble-popover paper-item:focus {
                color: var(--primary-button-color, #036bc3);
                background-color: var(--bgColor-hover, #e8f4f9);
            }

            pebble-popover paper-item pebble-icon:hover {
                color: var(--focused-line, #026bc3) !important;
            }

            rock-image-viewer {
                margin: 0 10px;
            }

            .title {
                font-size: var(--default-font-size, 14px);
                color: var(--dark-title-color, #1a2028);
                margin: 3px 0;
            }

            .subtitle {
                font-size: var(--font-size-sm, 12px);
                color: var(--secondary-text-color, #727272);
            }

            .details-wrap {
                width: 30%;
                margin-right: 15px;
            }

            .status-wrap {
                width: 30%;
                margin-right: 15px;
                color: var(--secondary-text-color, #727272);
            }

            .result-wrap {
                width: 30%;
                text-align: right;
                color: var(--secondary-text-color, #727272);
            }

            .completed {
                color: var(--success-button-color, #09c021);
            }

            .inprogress {
                color: var(--warning-button-color, #f78e1e);
            }

            .completed,
            .inprogress,
            .error {
                font-weight: 500;
            }

            .result-wrap .error {
                color: var(--error-button-color, #f30440);
                font-weight: var(--font-bold, bold);
            }

            .list-content {
                margin: 3px 0;
            }

            .list-content span {
                margin: 0;
            }

            a {
                text-decoration: none;
            }

            iron-list {
                will-change: normal;
                --iron-list-items-container: {
                    width: inherit;
                }
            }

            .text-ellipsis {
                width: 100%;
            }

            #gridSelectionPopover {
                cursor: pointer;
                --popover-position: {
                    margin-top: -3px;
                    margin-left: 3px;
                }
            }

            pebble-spinner {
                --pebble-spinner-position: {
                    top: 140px;
                }
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

            li {
                text-align: inherit;
            }
            .block{
                display: block;
            }
        </style>
        <template is="dom-if" if="[[_isMultiSelectEnabled(enableMultiSelection)]]">
            <div class="top">
                <pebble-checkbox header="" class="header-button-container" on-tap="_toggleSelectAll" checked="[[_isSelectAllChecked(selectedItems.length, selectedItems.inverted, items.length)]]" indeterminate="[[_isSelectAllIndeterminate(selectedItems.length, items.length)]]"></pebble-checkbox>
                <!--<span class="actions">Actions</span>-->
                <template is="dom-if" if="[[advanceSelectionEnabled]]">
                    <grid-selection-popover selection-options="[[advanceSelectionOptions]]" id="gridSelectionPopover" on-selection-changed="_onPopoverSelectionChange"></grid-selection-popover>
                </template>
            </div>
        </template>
        <iron-list id="list" items="[[items]]" as="item">
            <template>
                <div class\$="{{_computePrimaryClass(item)}}" on-tap="_tapEvent">
                    <template is="dom-if" if="[[_isMultiSelectEnabled(enableMultiSelection)]]">
                        <div class="left">
                            <pebble-checkbox class="button-container" checked="[[_isSelected(item, selectedItems, selectedItems.*)]]"></pebble-checkbox>
                        </div>
                    </template>
                    <div>
                        <rock-image-viewer alt="Product image." id="image-container" src="{{_computeImage(item,listItems.image)}}" thumbnail-id="{{_computeValue(item,listItems.thumbnailId)}}" asset-details="[[item]]"></rock-image-viewer>
                    </div>
                    <div class="details-wrap">
                        <div class="title" title\$="[[_computeTitle(item,listItems.title)]]">
                            <template is="dom-if" if="[[_hasLinkTemplate(listItems)]]">
                                <a href\$="[[_getLink(item)]]" class\$="[[_getStyleClass(item)]] text-ellipsis block">[[_computeTitle(item,listItems.title)]]</a>
                            </template>
                            <template is="dom-if" if="[[!_hasLinkTemplate(listItems)]]">
                                <span class\$="[[_getStyleClass(item)]] text-ellipsis block">[[_computeTitle(item,listItems.title)]]</span>
                            </template>
                        </div>
                        <div class\$="list-content subtitle [[_getStyleClass(item)]]">[[_computeTitle(item,listItems.subtitle)]]</div>
                        <template is="dom-repeat" items="{{_firstColFields}}" as="field">
                            <div class="list-content">
                                <div class\$="{{_computeClass(field.noTrim)}}" title\$="[[_computeValue(item,field.name)]]">{{_getDisplayName(field.header)}}
                                    <template is="dom-if" if="[[_hasLinkTemplate(field)]]">
                                        <a class\$="block-text firstCol{{index}} [[_getStyleClass(item)]] block text-ellipsis" href\$="[[_getLink(item,field.linkTemplate)]]">[[_computeValue(item,field.name)]]</a>
                                    </template>
                                    <template is="dom-if" if="[[!_hasLinkTemplate(field)]]">
                                        <span class\$="block-text firstCol{{index}} [[_getStyleClass(item)]] block text-ellipsis">[[_computeValue(item,field.name)]]</span>
                                    </template>
                                </div>
                            </div>
                        </template>
                    </div>
                    <div class="status-wrap">
                        <template is="dom-repeat" items="{{_secColFields}}" as="field">
                            <div class="list-content">
                                <div class\$="{{_computeClass(field.noTrim)}}" title\$="[[_computeValue(item,field.name)]]">{{_getDisplayName(field.label)}}
                                    <template is="dom-if" if="[[_getAttributeModel(field)]]">
                                        <pebble-info-icon description-object="[[_getAttributeModel(field)]]" icon-size="small"></pebble-info-icon>
                                    </template>
                                    <template is="dom-if" if="[[_hasLinkTemplate(field)]]">
                                        <a class\$="subtitle secondCol{{index}} [[_getStyleClass(item)]] block text-ellipsis" href\$="[[_getLink(item,field.linkTemplate)]]">[[_computeValue(item,field.name)]]</a>
                                    </template>
                                    <template is="dom-if" if="[[!_hasLinkTemplate(field)]]">
                                        <span class\$="subtitle secondCol{{index}} [[_getStyleClass(item)]] block text-ellipsis">[[_computeValue(item,field.name)]]</span>
                                    </template>
                                </div>
                            </div>
                        </template>
                    </div>
                    <div class="result-wrap">
                        <template is="dom-repeat" items="{{_thirdColFields}}" as="field">
                            <div class="list-content">
                                <div class\$="{{_computeClass(field.noTrim)}}" title\$="[[_computeValue(item,field.name)]]">{{_getDisplayName(field.label)}}
                                    <template is="dom-if" if="[[_hasLinkTemplate(field)]]">
                                        <a class\$="block-text thirdCol{{index}} [[_getStyleClass(item)]] block text-ellipsis" href\$="[[_getLink(item,field.linkTemplate)]]">[[_computeValue(item,field.name)]]</a>
                                    </template>
                                    <template is="dom-if" if="[[!_hasLinkTemplate(field)]]">
                                        <span class\$="block-text thirdCol{{index}} [[_getStyleClass(item)]] block text-ellipsis">[[_computeValue(item,field.name)]]</span>
                                    </template>
                                </div>
                            </div>

                        </template>
                    </div>
                    <template is="dom-if" if="[[_hasCoalescedValue(item)]]">
                        <pebble-icon id="action_[[item.id]]_sourceInfo" title="View source information" class="actionButton pebble-icon-size-16 m-r-5 m-l-5 " icon="pebble-icon:hierarchy" on-tap="_onSourceInformationClick" item="[[item]]" index="[[index]]" action-index="[[colIndex]]"></pebble-icon>
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
                    <template is="dom-if" if="[[_actionsPresent]]">
                        <div class="right">
                            <pebble-icon id="actions_container_{{item.id}}" class="dropdown-trigger pebble-icon-size-16" name="more" icon="pebble-icon:actions-more-vertical" title="More options" on-tap="_onActionsTap"></pebble-icon>
                                
                            <pebble-popover id\$="action_list_{{item.id}}" class="actionsPopover" for="actions_container_{{item.id}}" no-overlap="" horizontal-align="right">

                                <template is="dom-repeat" items="[[_getActions(item)]]" as="action">
                                    <paper-item id="action_[[item.id]]_[[action.name]]" on-tap="_onActionItemTap" action="[[action]]" item="[[item]]" title\$="[[action.tooltip]]">
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
                                    </paper-item>
                                </template>
                            </pebble-popover>
                        </div>
                    </template>
                </div>
            </template>
        </iron-list>

        <template is="dom-if" if="{{loading}}">
                <pebble-spinner active="[[loading]]"></pebble-spinner>
        </template>
`;
  }

  static get is() { return 'grid-list-view' }
  static get properties() {
      return {
          listItems: {
              type: Object,
              observer: '_splitIntoCols'
          },

          /**
           * This is an internal property, represents fields to be displayed in first column of grid-list-view.
           */
          _firstColFields: {
              type: Array,
              value: []
          },
          /**
           * This is an internal property, represents fields to be displayed in second column of grid-list-view.
           */
          _secColFields: {
              type: Array,
              value: []
          },

          /**
           * This is an internal property, represents fields to be displayed in third column of grid-list-view.
           */
          _thirdColFields: {
              type: Array,
              value: []
          },

          _actionsPresent: {
              type: Boolean,
              computed: '_hasActions(actions)'
          },
          /**
           * <b><i>Content development is under progress... </b></i>
           */
          schemaType: {
              type: String,
              value: ""
          },

          _viewMode: {
              type: String,
              value: 'List'
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

  /**
   * Indicates the list items of the `grid-list-view`.
   */


  connectedCallback() {
      super.connectedCallback();
       afterNextRender(this, this._loadMoreData.bind(this));
  }

  _loadMoreData () {
      this.page++;
  }
  _hasLinkTemplate (field) {
      return !!field.linkTemplate;
  }
  _getLink (item, linkTemplate) {
      if(item && item.disableLink){
          return;
      }
      if (!linkTemplate) {
          linkTemplate = this.listItems.linkTemplate;
      }
      return "/" + DataHelper.getTenantId() + "/" + linkTemplate.replace(/\{\S+?\}/g,
          function (match) {
              let attrName = match.replace("{", "").replace("}", "");
              return item[attrName];
      });                    
  }
  /**
   * <b><i>Content development is under progress... </b></i>
   */
  reloadData () {
    if (!this.loading) {
        this.items = [];
        this.page = 0;
        this.page = 1;
    }
  }
  _hasActions (actions) {
      let hasActions = actions && actions.length > 0;
      return hasActions;
  }

  _isMultiSelectEnabled (enableMultiSelection) {
      return enableMultiSelection;
  }
  /**
   * This is an internal function, used to split the fields into three columns.
   */
  _splitIntoCols () {
      if (this.listItems && this.listItems.fields && !_.isEmpty(this.listItems.fields)) {
          let fields = this._getArrayFromObject(this.listItems.fields);
          let totalFields = fields.length;
          let n = totalFields / 3 + 1;
          if (totalFields < 3) {
              this._secColFields = fields.slice(0, 1);
              this._thirdColFields = fields.slice(1, totalFields);
          } else if (totalFields == 3) {
              this._secColFields = fields.slice(0, 2);
              this._thirdColFields = fields.slice(2, totalFields);
          } else {
              if (totalFields % 3 == 0) {
                  this._firstColFields = fields.slice(0, n - 3);
                  this._secColFields = fields.slice(n - 3, 2 * n - 3);
                  this._thirdColFields = fields.slice(2 * n - 3,
                      totalFields);
              } else {
                  this._firstColFields = fields.slice(0, n - 2);
                  this._secColFields = fields.slice(n - 2, 2 * n - 2);
                  this._thirdColFields = fields.slice(2 * n - 2,
                      totalFields);
              }
          }
      }
  }

  /**
   * This is an internal function, used to compute the image url based on the config.
   */
  _computeImage (item, image) {
      if (item && image) {
          if (item.fileTypeImage) {
              item.fileTypeImage = item.fileTypeImage.replace(/ /g, '');
          }
          return item[image];
      }
  }

  /**
   * This is an internal function, used to compute the title based on the config.
   */
  _computeTitle (item, title) {
      if (this.schemaType == "attribute") {
          if (item.attributes && item.attributes.hasOwnProperty(title)) {
              return item.attributes[title].value;
          }
      }
      return item[title];
  }

  /**
   * This is an internal function, used to compute the value of the attribute to be displayed.
   */
  _computeValue (item, field) {
      if (!item || !field || this.listItems.title == field) return '';
      
      if (this.schemaType == "attribute") {
          if (item.attributes && item.attributes.hasOwnProperty(field)) {
              return item.attributes[field].value;
          }
      }
      return item[field];
  }

  /*
   * Can be used to select all the items in the list.
   */
  selectAll () {
      let length = this.selectedItems.length;
      this.splice('selectedItems', 0, length);
      this.set('selectedItems.inverted', true);
  }
  /**
   * Can be used to clear the current selection state.
   */
  clearSelection () {
      let length = this.selectedItems.length;
      this.splice('selectedItems', 0, length);
      RUFBehaviors.GridItemViewBehavior._clearSelection.call(this);
  }

  _computePrimaryClass (item) {
      if (item.isprimary == "true") {
          return "container isPrimary"
      }
      return "container";
  }

  _getActions(item) {
      let actions = DataHelper.cloneObject(this.actions);
      this._addSourceInfoAction(actions, item);
      return actions;
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
      if(this._hasCoalescedValue(item)) {
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
customElements.define(GridListView.is, GridListView);
