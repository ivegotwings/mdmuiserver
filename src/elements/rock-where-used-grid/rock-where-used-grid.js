/**

  `rock-relationship-grid` Represents an association relationship grid for an entity.
The following JSON objects depicts the entity that loads the relationship grid.
Based on the configuration, relationship grid gets loaded with the defined attributes from the given data object.

```json
{
  "crossSell": {
    "viewMode": "Tabular",
    "mode": "Read",
    "title": "Related Products",    
    "tabular": {
      "settings": {
        "isMultiSelect": true,
        "actions": [
          {
            "name": "delete",
            "icon": "pebble-icon:action-delete",
            "eventName": "delete-item"
          }
        ]
      },
      "columns": [
        {
          "header": "Related Entity",
          "name": "Related Entity",
          "sortable": true,
          "filterable": false,
          "editType": ""
        },
        {
          "header": "price in kit",
          "name": "price in kit",
          "sortable": true,
          "filterable": false,
          "editType": "textbox"
        },
        {
          "header": "quality",
          "name": "quality",
          "sortable": true,
          "filterable": false,
          "editType": "textbox"
        }
      ]
    }
  },
  "accessories": {
    "viewMode": "Tabular",
    "mode": "Read",
    "title": "Related Products",
    "tabular": {
      "settings": {
        "isMultiSelect": true,
        "actions": [
          {
            "name": "delete",
            "icon": "pebble-icon:action-delete",
            "eventName": "delete-item"
          }
        ]
      },
      "columns": [
        {
          "header": "Related Entity",
          "name": "Related Entity",
          "sortable": true,
          "filterable": false,
          "editType": ""
        }
      ]
    }
  }
}
```
The following JSON object is a sample of data which binds the grid.
```json
{
  "id": "e2",
  "type": "product",
  "properties": {
    "source": "PLM",
    "createdByService": "entityservice",
    "createdBy": "jim",
    "createdDate": "2016-07-16T18:10:52.412-07:00",
    "modifiedByService": "entityservice",
	"modifiedBy": "user",
    "modifiedDate": "2016-07-16T18:33:52.412-07:00"
  },
  "tags": [
    "Shrug"
  ],
  "data": {
    "contexts": [
      {
        "context": {
          "list": "master"
        },
        "attributes": {
          "productName": {
            "values": [
              {
                "value": "Toggle Shrug",
                "source": "PLM",
                "locale": "en-US"
              }
            ]
          }
        },
        "relationships": {
          "crossSell": [
            {
              "id": "rel1",
              "direction": "both",
              "source": "PLM",
              "operation": "association",
              "attributes": {
                "status": {
                  "values": [
                    {
                      "value": "Active",
                      "source": "PLM",
                      "locale": "en-US"
                    }
                  ]
                },
                "quantity": {
                  "values": [
                    {
                      "value": "5",
                      "source": "PLM",
                      "locale": "en-US"
                    }
                  ]
                },
                "price in kit": {
                  "values": [
                    {
                      "value": "1000",
                      "source": "PLM",
                      "locale": "en-US"
                    }
                  ]
                }
              },
              "relTo": {
                "id": "e5",
                "type": "product"
              }
            }
          ],
          "accessories": [
            {
              "id": "rel6",
              "direction": "both",
              "source": "PLM",
              "operation": "association",
              "relTo": {
                "id": "e6",
                "type": "product"
              }
            }
          ]
        }
      }
    ]
  }
}
```
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/entity-helper.js';
import '../bedrock-helpers/message-helper.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../bedrock-toast-behavior/bedrock-toast-behavior.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../bedrock-navigation-behavior/bedrock-navigation-behavior.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-rest/liquid-rest.js';
import '../liquid-dataobject-utils/liquid-dataobject-utils.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../liquid-entity-data-save/liquid-entity-data-save.js';
import '../liquid-entity-govern-data-get/liquid-entity-govern-data-get.js';
import '../pebble-lov/pebble-lov.js';
import '../pebble-button/pebble-button.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-horizontal-divider/pebble-horizontal-divider.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
// import '../bedrock-style-manager/styles/bedrock-style-tooltip.js';
import EntityTypeManager from '../bedrock-managers/entity-type-manager.js';
import '../pebble-accordion/pebble-accordion.js';
import '../pebble-toggle-button/pebble-toggle-button.js';
import '../pebble-actions/pebble-actions.js';
import '../rock-entity-lov/rock-entity-lov.js';
import '../rock-entity-quick-manage/rock-entity-quick-manage.js';
import '../rock-grid/rock-grid.js';
import '../rock-grid-data-sources/entity-search-grid-datasource.js';
import '../rock-govern-data-grid/rock-govern-data-grid.js';
import '../rock-entity-relationship-search-result-actions/rock-entity-relationship-search-result-actions.js';
import '../rock-business-actions/rock-business-actions.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockWhereUsedGrid extends mixinBehaviors([RUFBehaviors.AppBehavior, RUFBehaviors.ComponentContextBehavior,
    RUFBehaviors.LoggerBehavior, RUFBehaviors.ToastBehavior,  RUFBehaviors.NavigationBehavior
  ],
  OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
    <style include="bedrock-style-common bedrock-style-grid-layout bedrock-style-icons bedrock-style-padding-margin bedrock-style-buttons">
      :host {
        display: block;
        height: 100%;
      }

      pebble-button.icon-text-button {
        --pebble-button: {
          height: 30px;
          padding-top: 0.5em;
          padding-right: 0em;
          padding-bottom: 0.5em;
          padding-left: 0em;
          border: 1px solid var(--primary-color);
        }
      }

      pebble-horizontal-divider {
        --pebble-horizontal-divider-color: var(rgba(25, 32, 39, 1));
      }

      pebble-lov {
        width: 300px !important;
        max-height: 350px !important;
      }

      #messageCard {
        text-align: center;
      }

      pebble-toggle-button {
        --pebble-toggle-button-checked-bar-color: var(--success-color, #4caf50);
        --pebble-toggle-button-checked-button-color: var(--success-color, #4caf50);
        --pebble-toggle-button-checked-ink-color: var(--success-color, #4caf50);
        --pebble-toggle-button-label-color: var(--secondary-button-text-color, #75808b);
      }

      .toggle-button {
        float: right;
        padding: 20px 20px 0px 0px;
        font-size: var(--font-size-sm, 12px);
        @apply --rock-where-used-grid-govern-toggle;
      }

      .govern-grid-actions {
        float: right;
        margin: 15px 10px 0px 0px;
      }

      .refresh {
        color: var(--icon-color, #757575);
        width: 14px;
        height: 14px;
        padding: 0px;
        float: right;
        margin: 22px 10px 0px 0px;
        cursor: pointer;
      }

      .rock-grid-wrap {
        width: 100%;
      }

      .header-button {
        display: flex;
        justify-content: flex-end;
        padding: 10px;
      }

      .col-8-4-grid {
        display: -ms-grid;
        display: grid;
        -ms-grid-rows: 1fr;
        grid-template-rows: 1fr;
        -ms-grid-columns: 8fr 4fr;
        grid-template-columns: 8fr 4fr;
        height: 100%;
      }

      .col-8-4-grid .col-8-4-grid-child-1 {
        -ms-grid-row: 1;
        -ms-grid-column: 1;
        height: auto;
        min-height: 0px;
        min-width: 0px;
      }

      .col-8-4-grid .col-8-4-grid-child-2 {
        -ms-grid-row: 1;
        -ms-grid-column: 2;
        min-height: 0px;
        min-width: 0px;
      }

      .divider-wrapper {
        position: absolute;
        top: 0px;
        left: 0px;
        height: 100%;
      }
    </style>
    <pebble-spinner active="[[_loading]]"></pebble-spinner>

    <template is="dom-if" if="[[!_isMessageAvailable]]">
      <div id="relContainer_[[relationship]]" class="full-height">
        <pebble-accordion header-text="[[_getRelationshipTypeTitle(relationship)]]" is-collapsed="{{isCollapsed}}" show-accordion="[[showAccordion]]">
          <span slot="header-actions">
            <template is="dom-if" if="[[relationshipGridConfig.gridConfig]]">
              <pebble-info-icon description-object="[[relationshipGridConfig.gridConfig]]"></pebble-info-icon>
            </template>
          </span>
          <div slot="accordion-content" class="p-relative full-height">
            <div class="base-grid-structure">
              <div class="base-grid-structure-child-1">
                <div class="header-button">

                  <template is="dom-if" if="[[showActionButtons]]">
                    <template is="dom-if" if="[[!isPartOfBusinessFunction]]">
                        <pebble-button class="action-button btn btn-secondary m-r-5" id="cancel" button-text="Cancel" raised="" on-tap="_revertAll"></pebble-button>
                    </template>
                </template>
    
                  <template is="dom-if" if="[[relationshipGridConfig.copyActionConfig]]">
                    <div>
                      <pebble-button class="btn btn-primary m-r-5" id="copy_btn" title\$="[[_clipboardTooltip]]" button-text="Copy ID(s)" on-tap="_onTapCopyAction" on-mouseout="_onMouseoutCopyAction"></pebble-button>
                    </div>
                  </template>
                  <template is="dom-if" if="[[relationshipGridConfig.addRelationConfig]]">
                    <pebble-button icon="pebble-icon:action-add" disabled="[[readonly]]" id="button_[[relationship]]" relationship="[[relationship]]" class="btn btn-primary m-r-5 auto-width addbutton" button-text="Add" on-tap="_onAddRelClick"></pebble-button>
                  </template>
                  <pebble-popover for\$="button_[[relationship]]" vertical-align="auto" horizontal-align="auto" no-overlap="">
                    <rock-entity-lov on-lov-confirm-button-tap="_onLovConfirmButtonTapped" id="lov_[[relationship]]" data-index\$="[[dataIndex]]" request-data="[[_requestForAddRelationshipList(relationship)]]" id-field="[[_getIdField(relationship)]]" sub-title-pattern="[[_getSubTitlePattern(relationship)]]" image-id-field="[[_getImageIdField()]]" title-pattern="[[_getTitlePattern(relationship)]]" selected-items="[[_getSavedRelationshipItems(relationship, _savedRelationshipItems)]]" excluded-ids="[[excludedIds]]" multi-select="" no-sub-title="" show-action-buttons=""></rock-entity-lov>
                  </pebble-popover>

                  <bedrock-pubsub event-name="entity-lov-confirm-button-tap" handler="_onLovConfirmButtonTapped" target-id="lov_[[relationship]]"></bedrock-pubsub>
                  <bedrock-pubsub event-name="entity-lov-close-button-tap" handler="_onLovCloseButtonTapped" target-id="lov_[[relationship]]"></bedrock-pubsub>
                  <!-- <pebble-button icon="pebble-icon:action-add" disabled="[[readonly]]" id="button_[[relationship]]" relationship="[[relationship]]"
                    class="btn btn-primary m-r-10 auto-width addbutton" button-text="Add" on-tap="_onAddRelClick"></pebble-button> -->
                  <template is="dom-if" if="[[relationshipGridConfig.gridConfig.hasWritePermission]]">
                    <template is="dom-if" if="[[relationshipGridConfig.addNewRelationConfig]]">
                      <div>
                        <pebble-button icon="pebble-icon:action-add" disabled="[[readonly]]" id="addnewbutton_[[relationship]]" relationship="[[relationship]]" class="btn btn-primary m-r-5 auto-width addbutton" button-text="Add New" on-tap="_onAddNewRelClick"></pebble-button>
                      </div>
                      <bedrock-pubsub event-name="entity-created" handler="_onEntityCreated"></bedrock-pubsub>
                    </template>
                  </template>
                  <template is="dom-if" if="[[_showToggle(relationshipGridConfig.governGridConfig)]]">
                    <pebble-toggle-button class="toggle-button" noink="" checked="{{_loadGovernData}}">Govern Data</pebble-toggle-button>
                    <template is="dom-if" if="[[_loadActions(_loadGovernData, relationshipGridConfig.governGridConfig)]]">
                      <pebble-icon icon="pebble-icon:refresh" class="refresh pebble-icon-size-16" on-tap="_governGridRefresh"></pebble-icon>
                      <rock-business-actions id="businessActions" context-data="[[contextData]]" button-text="[[relationshipGridConfig.governGridConfig.actionsTitle]]" button-icon="[[relationshipGridConfig.governGridConfig.actionsIcon]]" show-workflow-actions=""></rock-business-actions>
                      <bedrock-pubsub event-name="business-actions-action-click" handler="_onGovernGridActionTap" target-id="businessActions"></bedrock-pubsub>
                    </template>
                  </template>

                  <template is="dom-if" if="[[showActionButtons]]">
                    <pebble-button class="action-button-focus dropdownText btn btn-success m-r-5" id="next" button-text="Save" raised="" on-tap="_save"></pebble-button>
                  </template>
                </div>
              </div>
              <div class="base-grid-structure-child-2">
                <div class\$="grid-wrap-container full-height [[_applyClass(_quickManageEnabled)]]">
                  <div class="container col-8-4-grid-child-1 full-height">
                    <entity-search-grid-datasource id="datasource_[[relationship]]" request="[[_getRelationshipGridRequest(relationship)]]" r-data-source="{{rDataSource}}" r-data-formatter="{{rDataFormatter}}" buffer-record-size="{{size}}" current-record-size="{{currentRecordSize}}" result-record-size="{{resultRecordSize}}" total-count="{{totalCount}}" data-index\$="[[dataIndex]]" attribute-models="[[_getRelationshipAttributeModels(relationship)]]"></entity-search-grid-datasource>
                    <div class\$="[[_getEditModeClass(relationshipGridConfig.gridConfig.mode)]] rock-grid-wrap">
                      <rock-grid hidden\$="[[_loadGovernData]]" readonly="[[readonly]]" id\$="[[relationship]]" r-data-source="{{rDataSource}}" r-data-source-id="datasource_[[relationship]]" config="{{relationshipGridConfig.gridConfig}}" attribute-models="[[_getRelationshipAttributeModels(relationship)]]" grid-data-size="{{size}}" current-record-size="{{currentRecordSize}}" result-record-size="{{resultRecordSize}}" max-configured-count="[[maxConfiguredCount]]" total-count="{{totalCount}}" page-size="50" inline-edit-validation-enabled="">
                        <rock-entity-relationship-search-result-actions slot="toolbar" id="gridActions" context-data="[[contextData]]" has-write-permissions="[[_hasWritePermissions(relationshipGridConfig.gridConfig)]]" relationship="[[relationship]]" direction="[[relationshipGridConfig.direction]]"></rock-entity-relationship-search-result-actions>
                      </rock-grid>
                    </div>
                    <bedrock-pubsub event-name="grid-bulk-relationship-edit-items" handler="_onBulkRelationshipEdit" target-id="[[relationship]]"></bedrock-pubsub>
                    <bedrock-pubsub event-name="grid-bulk-edit-items" handler="_onBulkEdit" target-id="[[relationship]]"></bedrock-pubsub>
                    <bedrock-pubsub event-name="grid-link-clicked" handler="_onRelationshipLinkClicked"></bedrock-pubsub>

                    <template is="dom-if" if="[[_loadGovernData]]">
                      <rock-govern-data-grid id\$="[[relationship]]" context-data="[[contextData]]" request="[[_getRelationshipGridRequest(relationship)]]" entity-name-attribute="[[relationshipGridConfig.governGridConfig.entityNameAttribute]]"></rock-govern-data-grid>
                    </template>
                  </div>

                  <template is="dom-if" if="[[_quickManageEnabled]]">

                    <div class="quick-manage-container col-8-4-grid-child-2">
                      <div class="divider-wrapper">
                        <pebble-vertical-divider></pebble-vertical-divider>
                      </div>
                      <rock-entity-quick-manage id="entityQuickManage" readonly="[[readonly]]" data-object-type="relationship" no-header="" context-data="[[contextData]]" current-index="{{_currentIndex}}" current-record-size="[[currentRecordSize]]" selected-entity="[[_selectedEntity]]" relationship="[[relationship]]" quick-manage-enabled="{{_quickManageEnabled}}"></rock-entity-quick-manage>
                      <bedrock-pubsub event-name="on-attribute-save-quickmanage" handler="_onAttributeSave"></bedrock-pubsub>
                      <bedrock-pubsub target-id="entityQuickManage" event-name="on-tap-previous" handler="_onClickPrevious"></bedrock-pubsub>
                      <bedrock-pubsub target-id="entityQuickManage" event-name="on-tap-next" handler="_onClickNext"></bedrock-pubsub>
                    </div>
                  </template>

                </div>
              </div>
              <bedrock-pubsub event-name="grid-selecting-item" handler="_onSelectingGridItem" target-id="[[relationship]]"></bedrock-pubsub>
              <bedrock-pubsub event-name="delete-item" handler="_onDeleteEntityRelationshipAction" target-id="[[relationship]]"></bedrock-pubsub>
              <bedrock-pubsub target-id="[[relationship]]" event-name="on-grid-msg-dialog-ok" handler="_onRevertDialogOk"></bedrock-pubsub>
              <bedrock-pubsub event-name="grid-download-item" handler="_onDownload" target-id="[[relationship]]"></bedrock-pubsub>
              <bedrock-pubsub event-name="grid-upload-item" handler="_onUpload" target-id="[[relationship]]"></bedrock-pubsub>
              <bedrock-pubsub event-name="grid-custom-toolbar-event" handler="_onCustomToolbarEvent" target-id="[[relationship]]"></bedrock-pubsub>

            </div>
        
      </div>
      <liquid-entity-data-get id="entityGetData" data-index\$="[[dataIndex]]" name="entityGet" operation="getbyids" request-data="{{_entityGetRequest}}" last-response="{{entitiesResponse}}"></liquid-entity-data-get>
      <liquid-entity-data-get id="entityGetAddData" data-index\$="[[dataIndex]]" name="entityGet" operation="getbyids" request-data="{{_entityGetAddRequest}}" last-response="{{relEntitiesResponse}}"></liquid-entity-data-get>
      <liquid-entity-data-save name="entitySaveService" request-data="{{_saveRequest}}" last-response="{{_saveResponse}}" on-response="_onSaveResponse" on-error="_onSaveError">
        <liquid-entity-data-save id="entityRelationsDeleteService" data-index\$="[[dataIndex]]" on-response="_onRelationsDeleteResponse" on-error="_onRelationsSaveError">
          <liquid-entity-data-save name="attributeSaveDataService" data-index\$="[[dataIndex]]" operation="update" request-data="{{_saveRequest}}" last-response="{{_saveResponse}}" on-response="_onSaveResponse"></liquid-entity-data-save>
    </liquid-entity-data-save></liquid-entity-data-save></pebble-accordion></div></template>
    <pebble-dialog id="gridMsgDialog" dialog-title="Confirmation" show-ok="" show-cancel="" show-close-icon="" alert-box="" modal="">
      <p id="msgDialog"></p>
    </pebble-dialog>
    <div id="messageCard">
    </div>
    <liquid-entity-data-get id="currentEntityGet" operation="getbyids" on-response="_currentEntityResponse"></liquid-entity-data-get>
    <bedrock-pubsub target-id="gridMsgDialog" event-name="on-buttonok-clicked" handler="_onDialogOk"></bedrock-pubsub>
    <bedrock-pubsub event-name="global-edit" handler="_onGlobalEdit"></bedrock-pubsub>
    <bedrock-pubsub event-name="quick-manage-event" handler="_onTapQuickManage"></bedrock-pubsub>
`;
  }

  static get is() {
    return "rock-where-used-grid";
  }
  static get properties() {
    return {
      /**
       * Indicates the data which is wrapped in the data-source that is used as a grid data.
       * The format for the JSON object is given in the above description.
       */
      data: {
        type: Object,
        notify: true
      },
      /**
       * If set as true , it indicates the component is in read only mode
       */
      readonly: {
        type: Boolean,
        value: false
      },
      /*
       *	Indicates the transformed relationship data for the grid.
       */
      relationshipGridData: {
        type: Array,
        notify: true,
        value: function () {
          return [];
        }
      },
      /**
       * Indicates the transformed relationship grid configuration for the grid.
       */
      relationshipGridConfig: {
        type: Object,
        notify: true
      },
      /**
       * Indicates the attribute models.
       */
      attributeModels: {
        type: Object,
        value: function () {
          return {};
        }
      },
      /*
       * Indicates the currently selected relationship type.
       */
      relationship: {
        type: String,
        notify: true
      },
      /*
       * Indicates the title for the selected relationship type.
       */
      relationshipTitle: {
        type: String,
        notify: true
      },
      /**
       * <b><i>Content development is under progress... </b></i>
       */
      rDataFormatter: {
        type: Object,
        notify: true,
        value: function () {
          return this._populateDataForGrid.bind(this);
        }
      },
      /**
       * <b><i>Content development is under progress... </b></i>
       */
      dataObjects: {
        type: Array,
        notify: true,
        value: function () {
          return [];
        }
      },
      /**
       * <b><i>Content development is under progress... </b></i>
       */
      relReq: {
        type: Object,
        value: function () {
          return {};
        }
      },
      /**
       * <b><i>Content development is under progress... </b></i>
       */
      contextData: {
        type: Object,
        value: function () {
          return {};
        }
      },
      maxConfiguredCount: {
        type: Number,
        value: function () {
          return DataObjectFalcorUtil.getPathKeys().dataIndexInfo.entityData.maxRecordsToReturn;
        }
      },
      /**
       * <b><i>Content development is under progress... </b></i>
       */
      doSyncValidation: {
        type: Boolean,
        value: true
      },
      /*
       */
      _entityGetRequest: {
        type: Object,
        notify: true,
        value: function () {
          return {};
        }
      },
      _entityGetAddRequest: {
        type: Object,
        notify: true,
        value: function () {
          return {};
        }
      },
      _isMessageAvailable: {
        type: Boolean,
        value: false
      },
      _liquidTracker: {
        type: Array,
        value: function () {
          return [];
        }
      },
      _loading: {
        type: Boolean,
        value: false
      },
      /**
       * <b><i>Content development is under progress... </b></i>
       */
      messageCodeMapping: {
        type: Object,
        value: function () {
          return {};
        }
      },
      governDataConfig: {
        type: Object,
        computed: '_computeGovernConfig(relationshipGridConfig)'
      },
      _loadGovernData: {
        type: Boolean,
        value: false
      },
      governGridActionsConfig: {
        type: Object
      },
      _clipboardTooltip: {
        type: String,
        value: "Copy to clipboard."
      },
      dataIndex: {
        type: String,
        value: "entityData"
      },
      excludeNonContextual: {
        type: Boolean,
        value: false
      },
      _quickManageEnabled: {
        type: Boolean,
        value: false
      },

      _relationshipDeleteItems: {
        type: Object,
        value: function () {
          return {};
        }
      },
      _entityRelations: {
        type: Array,
        value: function () {
          return [];
        }
      },
      showAccordion: {
        type: Boolean,
        value: true
      },
      _savedRelationshipItems: {
        type: Object,
        value: function () {
          return {};
        }
      },
      isCollapsed: {
        type: Boolean,
        notify: true
      },
      _currentEntity: {
        type: Object,
        value: function () {
          return {};
        }
      },
      showActionButtons: {
        type: Boolean,
        value: false
      },
      _additionalAttributes: {
        type: Array,
        value: function () {
          return ["rootexternalname", "path", "externalnamepath"];
        }
      },
      navigationData: {
        type: Object,
        value: function () {
            return {};
        }
      }
    }
  }

  static get observers() {
    return [
      '_convertIntoEntityLovList(searchResultResponse)',
      '_addRelationship(relEntitiesResponse)',
      '_getCurrentEntity(contextData)'
    ]
  }
  constructor() {
    super();
    this._currentSelectedLov = null;
    this._currentLovItems = null;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('editMode', this._onEditMode);
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('editMode', this._onEditMode);
  }

  _hasWritePermissions(gridConfig) {
    if (gridConfig["hasWritePermission"]) {
      return true;
    }

    return false;
  }

  //This flow is needed only for classification type
  _getCurrentEntity() {
    if (_.isEmpty(this.contextData)) {
      return;
    }
    let itemContext = ContextHelper.getFirstItemContext(this.contextData);
    if (!itemContext || itemContext.type != "classification") {
      return;
    }
    let currentEntityGetElement = this.shadowRoot.querySelector("#currentEntityGet");
    if (currentEntityGetElement) {
      let request = DataRequestHelper.createEntityGetRequest(this.contextData);
      request.params.fields.attributes = this._additionalAttributes;
      currentEntityGetElement.requestData = request;
      currentEntityGetElement.generateRequest();
    }
  }

  _currentEntityResponse(e, detail) {
    if (detail && DataHelper.validateGetEntitiesResponse(detail.response)) {
      this._currentEntity = detail.response.content.entities[0];
    }
  }

  _onBulkRelationshipEdit(e, detail) {
    let grid = this._getRelationshipGrid();
    let selectedItems = grid.getSelectedItems();
    let selectionMode = grid.getSelectionMode();
    let selectionQuery = grid.getSelectedItemsAsQuery();
    let currentRel = this.relationship;
    let originalEntity = this.dataObjects[currentRel];
    selectionQuery.ids = [originalEntity.id];
    if (selectedItems && selectedItems.length && this.contextData) {
      let itemContexts = [];
      let typesCriterion = [];

      let itemContext = {
        "type": originalEntity.type
      };
      let relAndTypeAttributes = this._getAttributeList();
      let relAttributeNames = relAndTypeAttributes && relAndTypeAttributes.relationshipAttributes ?
        relAndTypeAttributes.relationshipAttributes : [];
      if (_.isEmpty(relAttributeNames)) {
        this.showInformationToast("No relationship attribute configured in the grid for bulk edit.");
        return;
      }
      // var relAttributeNames = ["linkdescription","enabled","status","displayname"];
      itemContext.relationshipAttributes = relAttributeNames;
      itemContext.relationships = [currentRel];
      itemContexts.push(itemContext);
      if (!typesCriterion.find(type => type === currentRel.relTo.type)) {
        typesCriterion.push(itemContext.type);
      }
      selectionQuery.filters.typesCriterion = typesCriterion; //Based on relationship entityType
      let clonedContextData = DataHelper.cloneObject(this.contextData);
      clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = itemContexts;

      const sharedData = {
        "context-data": clonedContextData,
        "selection-query": selectionQuery,
        "selection-mode": selectionMode,
        "selected-entities": selectedItems,
        "original-entity": originalEntity,
        "relationship": currentRel,
        "edit-attributes-only": false,
        "edit-relationship-attributes-only": true
      };

      this.openBusinessFunctionDialog({
        name: 'rock-wizard-entity-bulk-edit',
        configName: 'wizardConfig'
      }, sharedData);
    } else {
      this.showInformationToast("Select at least one entity from grid to edit.");
    }
  }

  getEntityName() {
    if (!this._entityName && !_.isEmpty(this.contextData)) {
      let itemContext = ContextHelper.getFirstItemContext(this.contextData);
      this._entityName = itemContext.name || "";
    }
    return this._entityName || "";
  }

  _getRelationshipGrid() {
    return this.shadowRoot.querySelector("rock-grid");
  }

  _getAttributeList() {
    if (this.relationshipGridConfig) {
      return this.relationshipGridConfig.relationshipTypeAndAttributes;
    }
  }
  _getFromEntityAttributeList() {
    let attributes = this._getAttributeList();
    let fromEntityAttributes = [];
    if (attributes && attributes.relatedEntityAttributes) {
      fromEntityAttributes = attributes.relatedEntityAttributes;
    }
    return fromEntityAttributes;
  }
  _getRelationshipTypeTitle() {
    if (this.relationshipGridConfig) {
      let config = this.relationshipGridConfig.gridConfig;
      if (config && config.title && config.title != "") {
        return config.title;
      }
    }
    return this.relationship;
  }
  _getRelationshipGridConfig() {
    let gridConfig = undefined;
    if (this.relationshipGridConfig) {
      gridConfig = this.relationshipGridConfig.gridConfig;
    }
    return gridConfig;
  }
  _getRelationshipAddRelLovConfig() {
    return this.relationshipGridConfig ? this.relationshipGridConfig.addRelLovConfig : undefined;
  }
  _getRelationshipGridRequest(relationshipTypeName) {
    let req = DataHelper.cloneObject(this.relReq);

    if (req && relationshipTypeName) {
      let relConfig = this.relationshipGridConfig;
      let relAttr = this._getAttributeList();
      if (relAttr) {
        req.params.fields.relationshipAttributes = relAttr.relationshipAttributes;
        req.params.fields.attributes = relAttr.relatedEntityAttributes;
      }
      if (relConfig && relConfig.direction && relConfig.direction == "up") {
        const {
          id,
          type
        } = this.getFirstItemContext();
        req.params.query.filters.typesCriterion = relConfig.fromEntityTypes;

        delete req.params.query.ids;
        delete req.params.query.id;

        let dataContexts = ContextHelper.getDataContexts(this.contextData);
        let relCriterion = {};
        relCriterion[relationshipTypeName] = {
          relTo: {
            id,
            type
          }
        };
        if (dataContexts && dataContexts.length && this.excludeNonContextual) {
          relCriterion[relationshipTypeName]["contexts"] = dataContexts,
            relCriterion[relationshipTypeName]["nonContextual"] = !this.excludeNonContextual
          req.params.query.filters.nonContextual = !this.excludeNonContextual;
        }
        req.params.query.filters.relationshipsCriterion = [relCriterion];
      }

      req.params.fields.relationships = [relationshipTypeName];
    }
    return req;
  }
  _getRelationshipAttributeModels(relationshipTypeName) {
    let config = this.relationshipGridConfig;
    let attrModels = {};
    if (config) {
      attrModels = config.relationshipAttributeModels;
      let relEntityAttrModels = config.relatedEntityModel.relatedEntityAttributeModels;
      for (let key in relEntityAttrModels) {
        attrModels[key] = relEntityAttrModels[key];
      }
    }
    return attrModels;
  }
  _onClickPrevious(e, detail, sender) {
    if (this._currentIndex > 0) {
      this._selectRelationship(this._currentIndex - 1);
    }
  }
  _onClickNext(e, detail, sender) {
    let currentIndex = this._currentIndex + 1;
    if (currentIndex < this.currentRecordSize) {
      this._selectRelationship(currentIndex);
    }
  }
  _selectRelationship(index, nav) {
    if (!(index < 0)) {
      let grid = this._getRelationshipGrid();
      let gridData = grid.getData();
      let selectedItem = gridData[index];
      this._selectedEntity = selectedItem;
      let itemContext = ContextHelper.getFirstItemContext(this.contextData);
      if (!_.isEmpty(selectedItem)) {
        itemContext.relationshipId = selectedItem.relationshipId;
        itemContext.id = selectedItem.id;
        itemContext.relationships = [this.relationship];
        grid.clearSelection(); //Clear current selection
        grid.selectItem(selectedItem); //
        this._currentIndex = grid.getSelectedItemIndex();
        grid.scrollToIndex(this._currentIndex);
      }
      this._reloadQuickManage();
    }
  }
  _getRelatedEntityContexts() {
    let config = this.relationshipGridConfig;
    let relatedEntityContexts;
    if (config) {
      relatedEntityContexts = config.relatedEntityModel.relatedEntityContexts;
    }
    return relatedEntityContexts;
  }
  _populateDataForGrid(respData) {
    let data = [];
    let savedItems = [];
    let currentRel = this.relationship;
    let itemContext = this.getFirstItemContext();
    let entityTypeManager = EntityTypeManager.getInstance();
    if (respData && itemContext) {
      let currentEntityId = itemContext.id;
      if (respData.content && respData.content.entities && currentEntityId) {
        let entities = respData.content.entities;
        if (entities && entities.length > 0) {
          entities.forEach(function (entity) {
            this.dataObjects.push(entity);
            let record = {};
            let savedItem = {};

            record["From Entity"] = record["id"] = entity.id;
            record["Entity Type"] = entity.type;
            record["type"] = entity.type;

            savedItem["id"] = savedItem["title"] = entity.id;

            savedItems.push(savedItem);

            let isSelfContext = false;

            let relConfig = this.relationshipGridConfig;
            let dataContext = this.getFirstDataContext();
            if (relConfig && _.isEmpty(dataContext)) {
              isSelfContext = relConfig.selfContext;
            }
            this._entityRelations = this._entityRelations.concat(entity);
            let relationships = EntityHelper.getRelationshipsBasedOnContext(entity, dataContext, isSelfContext);
            if (!_.isEmpty(relationships)) {
              let relatedEntities = relationships[currentRel];
              if (this.dataObjects) {
                if (!this.dataObjects[currentRel]) {
                  this.dataObjects[currentRel] = entity;
                }
              }
              relatedEntities.forEach(function (relItem) {
                if (relItem && relItem.relTo && relItem.relTo.id == currentEntityId) {
                  record["relationshipId"] = relItem.relTo.id;
                  record["Relationship Id"] = relItem.id;
                    if (relItem.relTo.type) {
                      record["typeExternalName"] = entityTypeManager.getTypeExternalNameById(relItem.relTo
                        .type);
                    }
                    if (relItem.attributes) {
                      Object.keys(relItem.attributes).forEach(function (item) {
                        if (item && relItem.attributes[item]) {
                          let valueObjs = relItem.attributes[item].values;
                          if (!_.isEmpty(valueObjs)) {
                            if (valueObjs.length > 1) {
                              let values = [];
                              for (let valueIndex = 0; valueIndex < valueObjs.length; valueIndex++) {
                                values.push(valueObjs[valueIndex].value);
                              }
                              record[item] = values;
                            } else {
                              record[item] = valueObjs[0].value;
                            }
                          }
                        }
                      }, this);
                    }
                }
              }, this);
            }

            let attributes = EntityHelper.getAllAttributes(entity);
            if (attributes) {
              Object.keys(attributes).forEach(function (attrItem) {
                if (attrItem && attributes[attrItem]) {
                  let valueObjs = attributes[attrItem].values;
                  if (!_.isEmpty(valueObjs)) {
                    if (valueObjs.length > 1) {
                      let values = [];
                      for (let valueIndex = 0; valueIndex < valueObjs.length; valueIndex++) {
                        values.push(valueObjs[valueIndex].value);
                      }
                      record[attrItem] = values;
                    } else {
                      record[attrItem] = valueObjs[0].value;
                    }
                  }
                }
              }, this);
            }

            data.push(record);
          }, this);

          // display selected LoV data
          let savedRelationships = this._savedRelationshipItems;
          savedRelationships[currentRel] = savedItems;

          this._savedRelationshipItems = {};
          this._savedRelationshipItems = savedRelationships;
        }
      }
    }
    return data;
  }
  _onEditMode(e) {
    this.showActionButtons = true;
  }
  _save(e) {
    let currentRel = this.relationship;
    let entityId, entityType;
    let currentRelGrid = this.shadowRoot.querySelector('rock-grid[id=' + currentRel + ']');
    let itemContext = ContextHelper.getFirstItemContext(this.contextData);
    if (!_.isEmpty(itemContext) && itemContext.id && itemContext.type) {
      entityId = itemContext.id;
      entityType = itemContext.type;
    } else {
      entityId = DataHelper.getParamValue('id');
      entityType = DataHelper.getParamValue('type');
    }
    let relConfig = this.relationshipGridConfig;
    let utils = SharedUtils.DataObjectFalcorUtil;

    let originalEntities = [];

    if (currentRelGrid && relConfig) {
      let gridData = currentRelGrid.getModifiedData();

      if (gridData && gridData.length > 0) {
        gridData.forEach(function (data) {
          let entity = data;

          if (entity) {
            let relationships = EntityHelper.getRelationshipByType(entity, this.getFirstDataContext(),
              currentRel, relConfig.selfContext);
            let relObject = {}

            relObject.relTo = {};
            relObject.relTo.id = entityId;
            relObject.relTo.type = entityType;
            let existingRelationships = EntityHelper.getRelationshipByRelationshipType(entity, this.getFirstDataContext(),
              currentRel);
            if (existingRelationships) {
              existingRelationships.length = 0;
            }

            // Add all updated relatinships in entity's current relationship reference.
            if (relObject) {
              existingRelationships.push(relObject);
            }
            originalEntities.push(entity);
          }
        }, this);
      }
    }

    let isAllClassificationEntities = EntityHelper.isAllEntitiesOfSameType(originalEntities, "classification");
    this._saveRequest = {
      "entities": isAllClassificationEntities ? this._updateEntitiesWithAdditionalAttributes(originalEntities) : originalEntities
    };

    this._saveEntity();

  }

  _updateEntitiesWithAdditionalAttributes(originalEntities) {
    let pathSeperator = this.appSetting('dataDefaults').categoryPathSeparator || ">>";
    let entities = DataHelper.cloneObject(originalEntities) || [];
    let relEntities = [];

    if (DataHelper.validateGetEntitiesResponse(this.relEntitiesResponse)) {
      relEntities = this.relEntitiesResponse.content.entities;
    }

    if (DataHelper.isValidObjectPath(this._currentEntity, "data.attributes") && !_.isEmpty(entities)) {
      entities.forEach(entity => {
        entity.data.attributes = DataHelper.cloneObject(this._currentEntity.data.attributes);
        //Update paths
        if (entity.data.attributes.externalnamepath) {
          entity.data.attributes.externalnamepath.values.forEach(item => {
            item.value = item.value + pathSeperator + entity.externalName;
          });
        }
        if (entity.data.attributes.path) {
          entity.data.attributes.path.values.forEach(item => {
            item.value = item.value + pathSeperator + entity.id;
          });
        }

        //Delete existing relationships
        let currentRelEntity = relEntities.find(e => {
          return e.id == entity.id;
        });
        if (DataHelper.isValidObjectPath(currentRelEntity, "data.relationships") &&
          currentRelEntity.data.relationships &&
          currentRelEntity.data.relationships[this.relationship]) {
          currentRelEntity.data.relationships[this.relationship].forEach(relObj => {
            relObj.action = "delete";
            entity.data.relationships[this.relationship].push(relObj);
          })
        }
      })
    }
    return entities;
  }

  _onTapQuickManage(e) {
    let relationship = this.relationship;
    if (e && e.detail && e.detail.enableQuickManage) {
      if (!this._quickManageEnabled) {
        this._quickManageEnabled = e.detail.enableQuickManage;
      }
    } else {
      this._quickManageEnabled = !this._quickManageEnabled;
    }
    let grid = this._getRelationshipGrid();
    if (this._quickManageEnabled) {
      let selectedItem = grid.selectedItem;
      if (!selectedItem) {
        let selectedItems = grid.getSelectedItems();
        if (selectedItems.length) {
          selectedItem = selectedItems[selectedItems.length - 1];
        }
      }
      this._selectedEntity = selectedItem;
      let itemContext = ContextHelper.getFirstItemContext(this.contextData);
      if (!_.isEmpty(selectedItem)) {
        itemContext.relationshipId = selectedItem.relationshipId;
        itemContext.relatedEntityType = selectedItem.type;
        itemContext.relationships = [relationship];
        itemContext.id = selectedItem.id;
        let relationshipsCriterion = {};
        relationshipsCriterion[relationship] = {
          "relTo": {
            "id": itemContext.id,
            "type": itemContext.type
          }
        };
        itemContext.type = selectedItem.type;
        itemContext.relationshipsCriterion = [relationshipsCriterion];
        grid.clearSelection(); //Clear current selection
        grid.selectItem(selectedItem); //
        this._currentIndex = grid.getSelectedItemIndex();
        grid.scrollToIndex(this._currentIndex);
      }
    } else {
      this._currentIndex = -1;
    }
    this._reloadQuickManage();
  }
  _applyClass(quickManageEnabled) {
    if (quickManageEnabled) {
      return "grid-quick-manage-container col-8-4-grid";
    }
    return "";
  }
  _reloadQuickManage() {
    const entityQuickManage = this.shadowRoot.querySelector("#entityQuickManage");
    if (entityQuickManage) {
      entityQuickManage.reload();
    }
  }
  _convertIntoEntityLovList(entitiesResponse) {
    if (entitiesResponse) {
      let items = [];
      let selectedItems = [];

      if (entitiesResponse.content && entitiesResponse.content.entities) {
        let entities = entitiesResponse.content.entities;
        entities.forEach(function (item) {
          if (item) {
            //TODO: this code has to be enhanced for based on config.
            let attributes = EntityHelper.getAllAttributes(item);
            items.push({
              "id": item.id,
              "title": item.id,
              "subtitle": item.type,
              "image": "/src/images/lookup-item.jpg"
            });
          }
        }, this);
      }

      if (this._currentSelectedLov) {
        let relGrid = this.shadowRoot.querySelector('rock-grid[id=' + this._currentSelectedLov.id + ']');
        let relGridData = [];
        if (relGrid) {
          relGridData = relGrid.getData();
        }

        this._currentSelectedLov.items = items;
        this._currentSelectedLov.selectedItems = relGridData;
        this._currentLovItems = items;
      }
    }
  }
  _onLovConfirmButtonTapped(event) {
    if (event.detail) {

      let lov = this.shadowRoot.querySelector("rock-entity-lov[id=" + event.detail.data.id + "]");

      let oldSelectedItemIds = [];
      let selectedItemIds = [...new Set(lov.selectedItems.map((obj) => obj.id))];
      let newItemIds = [];
      let relType = event.detail.data.id.replace("lov_", "");
      // TO-DO Pebble-LOV has to handle this filteration.
      let currentRelGrid = this.shadowRoot.querySelector('rock-grid[id=' + relType + ']');
      if (currentRelGrid) {
        let data = currentRelGrid.getData();
        data.forEach(function (item) {
          if (item) {
            oldSelectedItemIds.push(item.id);
          }
        }, this);
      }

      selectedItemIds.forEach(function (item) {
        if (item && oldSelectedItemIds.indexOf(item) < 0) {
          newItemIds.push(item);
        }
      }, this);

      this._addRelatedEntity(relType, newItemIds);
    }
  }
  _onLovCloseButtonTapped(event) {
    if (event.detail) {
      let id = event.detail.data.id.replace("lov_", "");
      let currentLovPopover = this.shadowRoot.querySelector('pebble-popover[for=button_' + id + ']');

      if (currentLovPopover) {
        currentLovPopover.hide();
      }
    }
  }
  _onAddRelClick(e) {
    if (e.currentTarget.disabled == true) {
      return;
    }
    let popover = this.shadowRoot.querySelector("pebble-popover[for=" + e.currentTarget.id + "]");
    this._currentSelectedLov = this.shadowRoot.querySelector('rock-entity-lov[id=lov_' + this.relationship +
      ']');
    popover.show();
  }
  _addRelatedEntity(relationshipType, entityIds) {
    if (entityIds && entityIds.length > 0) {
      let popover = this.shadowRoot.querySelector("pebble-popover[for=button_" + relationshipType + "]");

      let typesCriterion = this.relationshipGridConfig.fromEntityTypes
      let relatedEntityContexts = this._getRelatedEntityContexts();
      let contexts = [];
      let attributes = this._getRelatedEntityAttributeList();

      if (relatedEntityContexts) {
        relatedEntityContexts.forEach(function (relContexts) {
          if (relContexts) {
            if (relContexts.relContexts) {
              relContexts.relContexts.forEach(function (ctxItem) {
                contexts.push(ctxItem);
              }, this);
            }
          }
        }, this);
      }

      let valueContext = this.getFirstValueContext();

      //TODO-dimensions has to be set in req. same like did in relationship-manage
      let req = {
        "params": {
          "query": {
            "contexts": contexts,
            "ids": entityIds,
            "filters": {
              "typesCriterion": typesCriterion
            }
          },
          "fields": {
            "attributes": attributes,
            "relationships": [this.relationship]
          },
          "options": {
            "maxRecords": 10
          }
        }
      };
      DataRequestHelper.addDefaultContext(req);
      this.set('_entityGetAddRequest', req);
      let relAddLiquid = this.shadowRoot.querySelector('liquid-entity-data-get[id="entityGetAddData"]');
      if (relAddLiquid) {
        relAddLiquid.generateRequest();
      }
      popover.hide();
    }
  }
  _addRelationship() {
    if (this.relEntitiesResponse) {
      let relGrid = this.shadowRoot.querySelector('rock-grid[id=' + this.relationship + ']');

      if (relGrid) {
        let relData = [];
        if (this.relEntitiesResponse.content && this.relEntitiesResponse.content.entities) {
          let entities = this.relEntitiesResponse.content.entities;
          let relGridData = relGrid.getData();
          entities.forEach(function (relItem) {
            if (relItem) {
              let attributes = EntityHelper.getAllAttributes(relItem);
              let record = {};
              if (attributes) {
                Object.keys(attributes).forEach(function (attrItem) {
                  if (attrItem && attributes[attrItem]) {
                    record[attrItem] = attributes[attrItem].values[0].value;
                  }
                }, this);
              }
              record['Related Entity'] = record['id'] = relItem.id;
              record['type'] = relItem.type;
              record['properties'] = relItem.properties;
              record['relationshipType'] = this.relationship;
              relData.push(record);
            }
          }, this);
        }
        relGrid.addNewRecords(relData);
      }
    }
  }

  _getRelatedEntityAttributeList() {
    let attributes = this._getAttributeList();
    let relatedEntityAttributes = [];
    if (attributes && attributes.relatedEntityAttributes) {
      relatedEntityAttributes = attributes.relatedEntityAttributes;
    }
    return relatedEntityAttributes;
  }
  _onSelectingGridItem(e, detail, sender) {
    if (this._quickManageEnabled) {
      let grid = this._getRelationshipGrid();
      this._selectedEntity = detail.item;
      if (!_.isEmpty(this._selectedEntity)) {
        let itemContext = ContextHelper.getFirstItemContext(this.contextData);
        itemContext.relationshipId = this._selectedEntity.relationshipId;
        itemContext.relatedEntityType = this._selectedEntity.type;
        itemContext.id = this._selectedEntity.id;
        itemContext.relationships = [this.relationship];
        grid.clearSelection();
        microTask.run(() => {
          this._currentIndex = grid.getSelectedItemIndex();
        });
      }
    }
    this._reloadQuickManage();
  }
  _onDeleteEntityRelationshipAction(e, detail) {
    // deleting newly added record and reload reloadRelationshipLov.
    if (detail.isNewlyAddedDataRowDelete) {
      this._reloadRelationshipLov(detail.id);
      return;
    }
    this._modifiedEntityRelationship = {
      event: e,
      detail: detail,
      action: "delete"
    };
    this.openGridMsgDialog("Are you sure you want to delete?");
  }
  _onRevertDialogOk(e) {
    let currentRel = e.target.__dataHost.parentModel.relationship; //e.model.relationship;
    let currentRelGrid = this.shadowRoot.querySelector('rock-grid[id=' + currentRel + ']');
    if (currentRelGrid) {
      let gridData = currentRelGrid.getData();

      // Revert the grid data and set to read mode
      currentRelGrid.revertModifiedData(gridData);
      this._changeRelationshipToReadMode();

      // Reset Add LoV selection
      this._resetAddLoVSelection(currentRelGrid);
    }
  }

  _onCustomToolbarEvent(e, detail) {
    if (detail && detail.name == "delete") {
      let grid = this._getRelationshipGrid();
      let selectedItems = grid.getSelectedItems();
      if (selectedItems && selectedItems.length) {
        let savedRecords = [];
        let newRecordsIds = [];
        for (let idx = 0; idx < selectedItems.length; idx++) {
          let item = selectedItems[idx];
          if (DataHelper.isValidObjectPath(item, "_rowStatus.status") && item._rowStatus.status.toLowerCase() ==
            "new") {
            grid._deleteNewRowById(item.id);
            newRecordsIds.push(item.id);
          } else {
            savedRecords.push(item);
          }
        }

        //reload reloadRelationshipLov
        this._reloadRelationshipLov(newRecordsIds);

        // delete already saved records
        if (savedRecords && savedRecords.length) {
          let eDetail = {
            "selectedItems": savedRecords
          };
          this._modifiedEntityRelationship = {
            event: e,
            detail: eDetail,
            action: "bulk-delete"
          };
          this.openGridMsgDialog("Are you sure you want to delete?");
        }
      } else {
        this.showInformationToast("Select at least one relationship from grid to delete.");
      }
    }
  }
  _reloadRelationshipLov(ids) {
    let relationshipLov = dom(this).node.shadowRoot.querySelector('rock-entity-lov[id=lov_' + this.relationship +
      ']');
    if (relationshipLov && relationshipLov.selectedItems) {
      let relationshipLovSelectedItems = relationshipLov.selectedItems;
      if (_.isArray(ids)) {
        ids.forEach(function (elValue) {
          let relationshipLovItem = DataHelper._findItemByKeyValue(relationshipLovSelectedItems, "id",
            elValue);
          if (relationshipLovItem) {
            // reload the relationshipLov
            relationshipLovSelectedItems = relationshipLovSelectedItems.filter(function (selectedItem) {
              return selectedItem.id != elValue;
            });
          }
        });
      } else {
        // reload the relationshipLov
        relationshipLovSelectedItems = relationshipLovSelectedItems.filter(function (selectedItem) {
          return selectedItem.id != ids;
        });
      }
      relationshipLov.selectedItems = relationshipLovSelectedItems;
    }
  }
  openGridMsgDialog(msg) {
    this.shadowRoot.querySelector('#msgDialog').innerText = msg;
    this.shadowRoot.querySelector('#gridMsgDialog').open();
  }
  _saveEntity() {
    let liquidSave = this.shadowRoot.querySelector("[name=attributeSaveDataService]");
    if (liquidSave) {
      liquidSave.generateRequest();
    }
  }
  _onSaveResponse() {
    this.showSuccessToast('Relationships save request is submitted successfully!!');

    let currentRelGrid = this.shadowRoot.querySelector('rock-grid[id=' + this.relationship + ']');

    if (currentRelGrid) {
      this._changeRelationshipToReadMode();
      currentRelGrid.changeToReadMode();
    }
  }
  _revertAll(e) {
    let currentRel = this.relationship;
    let relationshipTitle = currentRel;
    if(DataHelper.isValidObjectPath(this.relationshipGridConfig, 'relationshipModel.properties.externalName')){
      relationshipTitle = this.relationshipGridConfig.relationshipModel.properties.externalName;
    }
    let currentRelGrid = this.shadowRoot.querySelector('rock-grid[id=' + currentRel + ']');
    if (currentRelGrid) {
      if (currentRelGrid.getIsDirty()) {
        currentRelGrid.openGridMsgDialog(relationshipTitle +
          " relationship has unsaved changes. Do you wants to revert those ?");
      } else {
        currentRelGrid.changeToReadMode();
        this._changeRelationshipToReadMode();
      }
    }
  }
  _setRelGridDataSource() {
    let repeat = this.shadowRoot.querySelector('template[is="dom-repeat"]');

    if (repeat) {
      repeat.addEventListener("dom-change", function (event) {
        let relDivs = this.parentNode.querySelectorAll('div[id^=relContainer_]');

        if (relDivs && relDivs.length > 0) {
          for (let i in relDivs) {
            let item = relDivs[i];
            if (typeof item === 'object') {
              let relGrid = item.querySelector('rock-grid');
              let dataSourceElement = item.querySelector('entity-search-grid-datasource');

              if (relGrid && dataSourceElement) {
                relGrid.dataSource = dataSourceElement.dataSource;

                dataSourceElement.addEventListener('current-record-size-changed', function (e) {
                  this.gridDataSize = e.currentTarget.bufferRecordSize;
                }.bind(relGrid));

                dataSourceElement.addEventListener('total-records-changed', function (e) {
                  this.currentRecordSize = e.currentTarget.currentRecordSize;
                }.bind(relGrid));
              }
            }
          }
        }
      });
    }
  }
  async _onDialogOk(e) {
    this.showActionButtons = false;
    if (this._modifiedEntityRelationship && "action" in this._modifiedEntityRelationship) {
      if (this._modifiedEntityRelationship.action == "bulk-delete" || this._modifiedEntityRelationship.action ==
        "delete") {
        if (this.relationship) {
          let selectedItems = this._modifiedEntityRelationship.detail.selectedItems;
          let id = this._modifiedEntityRelationship.detail.id;

          let selectedIds = [];
          let coalescedIds = [];

          if (!_.isEmpty(selectedItems)) {
            selectedItems.forEach(function (item) {
              if (this._hasContextCoalescedValue(item)) {
                coalescedIds.push(item.id);
              } else {
                selectedIds.push(item.id);
              }
            }, this);
          } else {
            selectedIds = [id];
          }

          if (!_.isEmpty(selectedIds)) {
            this._relationshipDeleteItems["relIds"] = selectedIds;
          }

          if (!_.isEmpty(coalescedIds)) {
            this._relationshipDeleteItems["coalescedRelIds"] = coalescedIds;

            if (_.isEmpty(selectedIds)) {
              let message = this._relationshipDeleteItems[
                "coalescedRelIds"].length + " relationships cannot be deleted because they are inherited.";
              this.showWarningToast(message, 10000);
            }
          }

          this._deleteRelatioshipsByIds(selectedIds);
        }
      }
    }
  }
  async _deleteRelatioshipsByIds(selectedIds) {
    if (!_.isEmpty(selectedIds)) {
      let updateRequests = [];
      // var updateRequest = DataRequestHelper.generateRelationshipProcessRequest(this.contextData);
      let relations = this._entityRelations;
      let modifiedRelations = [];
      let selectedEntities = [];
      let modifiedEntities = [];
      let entityId;
      let itemContext = ContextHelper.getFirstItemContext(this.contextData);
      if (!_.isEmpty(itemContext) && itemContext.id) {
        entityId = itemContext.id;
      } else {
        entityId = DataHelper.getParamValue('id');
      }
      if (selectedIds) {
        selectedIds.forEach(selectedId => {
          relations.forEach(relation => {
            if (selectedId.indexOf(relation.id) > -1) {
              modifiedEntities.push(relation)
            }
          })
        })
      }

      let modifiedEntityRelationships;
      let updateRequest;
      if (modifiedEntities) {
        modifiedEntities.forEach(modifiedEntity => {
          let currentDataContext = this.getFirstDataContext();

          if (!_.isEmpty(currentDataContext)) {
            let contextualRelaionship = EntityHelper.getRelationshipsBasedOnContext(modifiedEntity, currentDataContext);
            modifiedEntityRelationships = contextualRelaionship[this.relationship];
          } else {
            modifiedEntityRelationships = modifiedEntity.data.relationships[this.relationship];
          }
          modifiedEntityRelationships.forEach(modifiedEntityRelationship => {
            if (!_.isEmpty(modifiedEntityRelationship.relTo) && modifiedEntityRelationship.relTo.id ==
              entityId) {
              let updateRequest = DataRequestHelper.generateRelationshipProcessRequest(this.contextData);
              modifiedEntityRelationship.action = "delete";
              updateRequest.data.relationships[this.relationship] = [modifiedEntityRelationship];
              updateRequest["id"] = modifiedEntity.id;
              updateRequest["type"] = modifiedEntity.type;
              DataTransformHelper.prepareEntityForContextSave(updateRequest.data, {}, {}, this.contextData);
              updateRequests.push(updateRequest);
            }
          })
        });
      }

      let entityDelLiquid = this.shadowRoot.querySelector("#entityRelationsDeleteService");
      if (entityDelLiquid) {
        let isAllClassificationRequests = EntityHelper.isAllEntitiesOfSameType(updateRequests, "classification");
        entityDelLiquid.requestData = {
          "entities": isAllClassificationRequests ? this._resetEntitiesAdditionalAttributes(updateRequests) : updateRequests
        };
        entityDelLiquid.operation = "update";
        entityDelLiquid.generateRequest();
      }
    }
  }

  _resetEntitiesAdditionalAttributes(updateRequests) {
    let requests = DataHelper.cloneObject(updateRequests) || [];
    let attributes = {};
    for (let attributeName of this._additionalAttributes) {
      attributes[attributeName] = {
        "action": "delete"
      }
    }
    if (!_.isEmpty(requests)) {
      requests.forEach(request => {
        request.data.attributes = attributes;
      })
    }
    return requests;
  }

  _hasContextCoalescedValue(item) {
    return !_.isEmpty(item.contextCoalescePaths);
  }
  _onRelationsDeleteResponse(e, detail) {
    let message;
    if ("relIds" in this._relationshipDeleteItems && !("coalescedRelIds" in this._relationshipDeleteItems)) {
      message = "Relationship(s) delete request submitted successfully for " + this._relationshipDeleteItems[
        "relIds"].length + " relationship(s).";
      this.showSuccessToast(message, 10000);
    } else if ("coalescedRelIds" in this._relationshipDeleteItems) {
      if ("relIds" in this._relationshipDeleteItems) {
        message = "Relationship(s) delete request submitted successfully for " + this._relationshipDeleteItems[
            "relIds"].length + " relationship(s) and remaining" +
          this._relationshipDeleteItems["coalescedRelIds"].length + " relationships cannot be deleted because they are inherited.";
      } else {
        message = this._relationshipDeleteItems[
          "coalescedRelIds"].length + " relationships cannot be deleted because they are inherited.";
      }
      this.showWarningToast(message, 10000);
    }

    let relGrid = this.shadowRoot.querySelector('rock-grid[id=' + this.relationship + ']');
    if (relGrid) {
      this._entityRelations = [];
      relGrid.set('config.mode', "read");
      relGrid.reRenderGrid();
    }
    this._resetAddLoVSelection(relGrid);
  }
  _onRelationsSaveError(e, detail) {
    this._relationshipDeleteItems = {};
    this.logError("Unable to delete the entity relationship.", detail);
  }
  _changeRelationshipToReadMode() {
    if (this.relationship) {
      this.showActionButtons = false;

    }
  }
  _onDownload(e) {
    let rockGrid = this.shadowRoot.querySelector('rock-grid');
    let selectedItems = rockGrid.getSelectedItems();

    if (selectedItems && selectedItems.length && this.contextData) {
      const sharedData = {
        "selected-entities": selectedItems
      };

      this.openBusinessFunctionDialog({
        name: 'rock-entity-download'
      }, sharedData);
    } else {
      this.showInformationToast("Select at least one entity from grid to download.");
    }
  }
  _onCOPDownloadFailure(error) {
    this.logError("Failed to download entity data." + error);
    this._loading = false;
  }
  _onUpload(e, detail) {
    this.openBusinessFunctionDialog({
      name: 'rock-entity-upload'
    });
  }
  _computeGovernConfig(relationshipGridConfig) {
    if (relationshipGridConfig) {
      return relationshipGridConfig.governDataConfig;
    }
  }
  _showToggle(governDataConfig) {
    return governDataConfig && governDataConfig.showGovernDataToggle;
  }
  _onGovernGridActionTap(e, detail) {
    detail.data.relationship = this.relationship;
    this.fireBedrockEvent("govern-grid-action-click", detail);
  }
  _loadActions(_loadGovernData, governGridActionsConfig) {
    return _loadGovernData && governGridActionsConfig.enableActions;
  }
  _onMouseoutCopyAction() {
    this.set("_clipboardTooltip", "Copy to clipboard.");
  }
  _onTapCopyAction(ev) {
    let currentRel = this.relationship;
    let grid = this.shadowRoot.querySelector('rock-grid[id=' + currentRel + ']');
    if (grid) {
      let selectedItems = grid.getSelectedItems();
      if (selectedItems && selectedItems.length) {

        let delimeter = ",";
        if (this.relationshipGridConfig.copyActionConfig.delimeter) {
          delimeter = this.relationshipGridConfig.copyActionConfig.delimeter;
        }
        let _attr = "";
        if (this.relationshipGridConfig.copyActionConfig.attributeField) {
          _attr = this.relationshipGridConfig.copyActionConfig.attributeField;
        }
        let copyString = "";
        selectedItems.forEach(element => {
          if (element && element.id) {
            if (_attr && element[_attr]) {
              copyString += element[_attr] + delimeter;
            }
          }
        });
        if (copyString) {
          let finalCopyString = copyString.substr(0, copyString.length - delimeter.length);
          DataHelper.copyToClipboard(finalCopyString);
          this.set("_clipboardTooltip", "Copied!");
        }

      } else {
        this.showInformationToast("Select at least one relationship from grid to copy.");
      }
    }
  }
  getSelectedItems() {
    let grid;
    if (this._loadGovernData) {
      grid = this.shadowRoot.querySelector("rock-govern-data-grid[id=" + this.relationship + "]");
    } else {
      grid = this.shadowRoot.querySelector("rock-grid[id=" + this.relationship + "]");
    }

    if (grid) {
      return grid.getSelectedItems();
    }
  }
  getControlIsDirty() {
    let rockGridObj = this.$$("rock-grid");
    let rockGovernGridObj = this.$$("rock-govern-data-grid");
    if (rockGridObj && rockGridObj.getControlIsDirty) {
      return rockGridObj.getControlIsDirty();
    }

    if (rockGovernGridObj && rockGovernGridObj.getControlIsDirty) {
      return rockGovernGridObj.getControlIsDirty();
    }
  }

  refresh() {
    let rockGridObj = this.$$("rock-grid");
    let rockGovernGridObj = this.$$("rock-govern-data-grid");
    if (rockGridObj && rockGridObj.refresh) {
      rockGridObj.refresh();
    } else if (rockGovernGridObj && rockGovernGridObj.refresh) {
      rockGovernGridObj.refresh();
    }
  }
  _governGridRefresh() {
    let grid = this.shadowRoot.querySelector("rock-govern-data-grid[id=" + this.relationship + "]");

    if (grid && grid.reRenderGrid) {
      grid.reRenderGrid();
    }
  }
  _onBulkEdit(e, detail) {
    let grid = this.shadowRoot.querySelector("rock-grid[id=" + this.relationship + "]");
    let selectedItems = grid.getSelectedItems();
    let selectionMode = grid.getSelectionMode();
    let selectionQuery = grid.getSelectedItemsAsQuery();
    if (selectedItems && selectedItems.length && this.contextData) {
      let itemContexts = [];
      let typesCriterion = this.relationshipGridConfig.fromEntityTypes;
      if (typesCriterion && typesCriterion.length) {
        for (let i = 0; i < typesCriterion.length; i++) {
          let type = typesCriterion[i];
          if (!(itemContexts.find(obj => obj.type === type))) {
            let itemContext = {
              "type": type
            };
            itemContexts.push(itemContext);
          }
        }
      }
      let clonedContextData = DataHelper.cloneObject(this.contextData);
      clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = itemContexts;

      const sharedData = {
        "context-data": clonedContextData,
        "selection-query": selectionQuery,
        "selection-mode": selectionMode,
        "selected-entities": selectedItems,
        "edit-attributes-only": true,
        "edit-relationship-attributes-only": false
      };

      this.openBusinessFunctionDialog({
        name: 'rock-wizard-entity-bulk-edit',
        configName: 'wizardConfig',
        mergeTitle: true,
        "title": DataHelper.concatValuesFromArray([
          ContextHelper.getDataContexts(this.contextData),
          this.getEntityName()
        ])
      }, sharedData);
    } else {
      this.showInformationToast("Select at least one entity from grid to edit.");
    }
  }

  _onGlobalEdit(e) {
    let relGrid = this.$$(`#${this.relationship}`);

    if (relGrid) {
      relGrid.changeToEditMode();
    }
  }
  _onAddNewRelClick(item) {

    const {
      fromEntityTypes
    } = this.relationshipGridConfig;
    let contextData = DataHelper.cloneObject(this.contextData);
    //delete this.contextData.ItemContexts[0];
    contextData.ItemContexts[0] = {
      "type": fromEntityTypes[0],
      "relationship": this.relationship
    };

    let defaultEntity = {
      "data": {
        "relationships": {}
      }
    }
    let itemContext = ContextHelper.getFirstItemContext(this.contextData) || {};
    let rel = {
      "direction": "both",
      "relationshipType": this.relationshipGridConfig.relationshipModel.properties.relationshipType,
      "relTo": {
        "id": itemContext.id,
        "type": itemContext.type
      }
    };
    defaultEntity.data.relationships[this.relationship] = [rel];
    let domain;
    if(DataHelper.isValidObjectPath(this.contextData, "ItemContexts.0.domain") && !_.isEmpty(this.contextData.ItemContexts[0].domain)){
      domain = this.contextData.ItemContexts[0].domain;
    }
    else{
      domain = "";
    }
    let entityTypeManager = new EntityTypeManager()
    let fromEntityExternalName = entityTypeManager.getTypeExternalNameById(fromEntityTypes[0]);
    let title = DataHelper.concatValuesFromArray([
      fromEntityExternalName ? `Add New ${fromEntityExternalName}` : 'Add New Related Entity',
      ContextHelper.getDataContexts(this.contextData),
      this.getEntityName()
    ]);
    if (!_.isEmpty(this._currentEntity) && itemContext.type == "classification") {
      defaultEntity.data.attributes = this._currentEntity.data.attributes;
    }
    const sharedData = {
      "context-data": contextData,
      "entity-domain": domain,
      "title": title,
      "default-entity": defaultEntity
    };

    this.openBusinessFunctionDialog({
      name: 'rock-wizard-entity-create'
    }, sharedData);
  }
  _onEntityCreated(e) {
    let businessDialog = RUFUtilities.appCommon.shadowRoot.querySelector("rock-business-function-dialog");
    if (businessDialog) {
      let dialog = businessDialog.dialog;
      dialog.close();
    }
    let currentRelGrid = this.shadowRoot.querySelector('rock-grid[id=' + this.relationship + ']');
    if (currentRelGrid) {
      this._changeRelationshipToReadMode();
      currentRelGrid.changeToReadMode();
    }
  }
  _addClientStatus() {
    let clientState = {};
    clientState.notificationInfo = {};
    clientState.notificationInfo.showNotificationToUser = true;
    this._saveRequest["clientState"] = clientState;

  }

  _requestForAddRelationshipList(relationship) {
    let relatedEntityContexts = this._getRelatedEntityContexts(relationship);
    let attributes = this._getFromEntityAttributeList(relationship);

    let typesCriterion = this.relationshipGridConfig.fromEntityTypes;
    let contexts = [];

    if (relatedEntityContexts) {
      relatedEntityContexts.forEach(function (relContext) {
        if (relContext) {
          if (relContext.relContexts) {
            relContext.relContexts.forEach(function (ctxItem) {
              contexts.push(ctxItem);
            }, this);
          }
        }
      }, this);

      let valueContext = this.getFirstValueContext();

      let req = {
        "params": {
          "query": {
            "contexts": contexts,
            "filters": {
              "attributesCriterion": [],
              "typesCriterion": typesCriterion
            }
          },
          "fields": {
            "ctxTypes": [
              "properties"
            ],
            "attributes": attributes,
            "relationships": []
          },
          "options": {
            "from": 0,
            "to": 0
          }
        }
      };
      DataRequestHelper.addDefaultContext(req);
      return req;
    } else {
      let messageDiv = this.$.messageCard;
      if (messageDiv) {
        messageDiv.textContent = "Relationships are not configured for current entity type: " + this.relationshipTitle;
        this._isMessageAvailable = true;
      }
    }
  }
  _getIdField(relationship) {
    let idField = "";
    let addRelLovConfig = this._getRelationshipAddRelLovConfig(relationship);
    if (addRelLovConfig) {
      idField = addRelLovConfig.idField;
    }
    return idField;
  }
  _getTitlePattern(relationship) {
    let titlePattern = "";
    let addRelLovConfig = this._getRelationshipAddRelLovConfig(relationship);
    if (addRelLovConfig) {
      titlePattern = addRelLovConfig.titlePattern;
    }
    return titlePattern;
  }
  _getSubTitlePattern(relationship) {
    let subTitlePattern = "";
    let addRelLovConfig = this._getRelationshipAddRelLovConfig();
    if (addRelLovConfig) {
      subTitlePattern = addRelLovConfig.subTitlePattern;
    }

    return subTitlePattern;
  }
  _getAttrMessages(error) {
    return error.attrErrorMessages;
  }
  _getEditModeClass(mode) {
    if (mode == "edit") {
      return "button-siblings"
    }
    return "full-height";
  }

  _getSavedRelationshipItems(relationship, _savedRelationshipItems) {
    let savedRelationshipItems = [];
    let clonedSavedRelationshipItems = DataHelper.cloneObject(_savedRelationshipItems);
    if (clonedSavedRelationshipItems[relationship]) {
      savedRelationshipItems = clonedSavedRelationshipItems[relationship];
    }
    return savedRelationshipItems;
  }

  // Reset LoV selection
  _resetAddLoVSelection(currentRelGrid) {
    let relationship = this.relationship;
    let relationshipLov = this.$$('rock-entity-lov[id=lov_' + relationship + ']');

    if (currentRelGrid && relationshipLov) {
      let gridData = currentRelGrid.getData();

      if (gridData) {
        let savedRelationshipItems = [];
        savedRelationshipItems = gridData.map(item => {
          if (item.id) {
            return {
              'id': item.id,
              'title': item.id
            };
          }
        });

        this._savedRelationshipItems[relationship] = savedRelationshipItems;
        relationshipLov.selectedItems = savedRelationshipItems;
      }
    }
  }

  _onRelationshipLinkClicked(e){

    if(e && e.detail && e.detail.link && e.detail.link.indexOf("entity-manage") > -1 && e.detail.id) {
      if (!_.isEmpty(this.contextData)) {
        let navContextArr = this.contextData[ContextHelper.CONTEXT_TYPE_NAVIGATION];
        if(!_.isEmpty(navContextArr) && navContextArr[0]["rock-context-selector"]){
            this.navigationData = navContextArr[0]["rock-context-selector"];
        }
      }   
      if(!_.isEmpty(this.navigationData)){
          this.setNavigationData("rock-context-selector", this.navigationData, null ,"entity-manage",e.detail.id);
      }
    }
  }

  _onAttributeSave(){
    let grid = this._getRelationshipGrid();
    if (grid) {
      grid.resetControlDirty();
    }
  }
}
customElements.define(RockWhereUsedGrid.is, RockWhereUsedGrid);
