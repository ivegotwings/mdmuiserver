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
            "icon": "pebble-icons:action-delete",
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
            "icon": "pebble-icons:action-delete",
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
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/attribute-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../bedrock-helpers/entity-helper.js';
import MessageHelper from '../bedrock-helpers/message-helper.js';
import EntityTypeManager from '../bedrock-managers/entity-type-manager.js';
import '../bedrock-helpers/liquid-response-helper.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-toast-behavior/bedrock-toast-behavior.js';
import '../bedrock-navigation-behavior/bedrock-navigation-behavior.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-entity-data-save/liquid-entity-data-save.js';
import '../liquid-rest/liquid-rest.js';
import '../liquid-dataobject-utils/liquid-dataobject-utils.js';
import '../pebble-lov/pebble-lov.js';
import '../pebble-button/pebble-button.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-horizontal-divider/pebble-horizontal-divider.js';
import '../pebble-accordion/pebble-accordion.js';
import '../pebble-info-icon/pebble-info-icon.js';
import '../pebble-vertical-divider/pebble-vertical-divider.js';
import '../rock-entity-quick-manage/rock-entity-quick-manage.js';
import '../rock-entity-lov/rock-entity-lov.js';
import '../rock-grid/rock-grid.js';
import '../rock-grid-data-sources/entity-relationship-grid-datasource.js';
import '../rock-entity-relationship-search-result-actions/rock-entity-relationship-search-result-actions.js';
import { dom, flush } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockRelationshipGrid
  extends mixinBehaviors([
    RUFBehaviors.AppBehavior,
    RUFBehaviors.ComponentContextBehavior,
    RUFBehaviors.ToastBehavior,
    RUFBehaviors.LoggerBehavior,
    RUFBehaviors.NavigationBehavior,
    RUFBehaviors.ComponentBusinessFunctionBehavior
  ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
    <style include="bedrock-style-common bedrock-style-grid-layout bedrock-style-padding-margin bedrock-style-buttons">
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

      .accordion-grid-container {
        height: 100%;
        @apply --accordion-grid-container;
      }

      .buttonContainer-top-right {
        text-align: right;
        padding-top: 10px;
        margin-bottom: 0px;
        margin-top: 0px;
      }

      .relation-name-container {
        display: flex;
        flex-direction: row-reverse;
        padding: 10px 20px;
      }

      pebble-horizontal-divider {
        --pebble-horizontal-divider-color:rgba(25, 32, 39, 1);
      }

      pebble-lov {
        width: 300px !important;
        max-height: 350px !important;
      }

      #errorsDialog {
        --popup-header-color: var(--palette-pinkish-red, #ee204c);
      }

      #messageCard {
        text-align: center;
      }

      .quick-manage-container {
        width: 100%;
        position: relative;
      }

      .container {
        width: 100%;
        height: 100%;
      }

      pebble-vertical-divider {
        --pebble-vertical-divider-color: #c1cad4;
        height: 100%;
        border-top: 0px;
        border-right: 0px;
        border-bottom: 0px;
        border-left: 0px;
        min-height: 0px;
        width: 2px;
        margin-top: 0px;
        margin-right: 0px;
        margin-bottom: 0px;
        margin-left: 0px;
      }

      pebble-popover {
        --pebble-popover-max-width: 100%;
        --pebble-popover-width: 260px;
      }

      .relContainer {
        display: block;
        height: 100%;
        @apply --relationship-container-height;
      }

      .relation-name-container pebble-button {
        @apply --grid-actions;
      }

      .grid-wrap-container {
        height: 100%;
      }

      .quick-manage {
        @apply --grid-quick-manage;
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
      .error-list{
        overflow: auto;
        max-height: 200px;
      }
      .buttons{
          text-align: center;
      }
    </style>

    <template is="dom-if" if="[[!_isMessageAvailable]]">
      <div id="relContainer_[[relationship]]" class="relContainer">
        <pebble-accordion header-text="[[relationshipGridConfig.gridConfig.title]]" show-accordion="[[showAccordion]]" is-collapsed="{{isCollapsed}}">
          <span slot="header-actions">
            <template is="dom-if" if="[[relationshipGridConfig.gridConfig]]">
              <pebble-info-icon description-object="[[relationshipGridConfig.gridConfig]]"></pebble-info-icon>
            </template>
          </span>
          <div slot="accordion-content" class="accordion-grid-container base-grid-structure">
            <div class="base-grid-structure-child-1">
            </div>
            <div class="contentContainer accordion-grid-content-row-item base-grid-structure-child-2">
              <div class\$="[[_applyClass(_quickManageEnabled)]]">
                <div class="container col-8-4-grid-child-1">
                  <template is="dom-if" if="[[_loadRelationshipEntities]]">
                    <entity-relationship-grid-datasource id="datasource_[[relationship]]" request="[[_getRelationshipGridRequest(relationship)]]" r-data-source="{{rDataSource}}" data-index\$="[[dataIndex]]" r-data-formatter="{{rDataFormatter}}" buffer-record-size="{{size}}" current-record-size="{{currentRecordSize}}" data-object-type="[[relationshipGridConfig.gridConfig.dataObjectType]]" result-record-size="{{resultRecordSize}}" total-count="{{totalCount}}" apply-context-coalesce="[[relationshipGridConfig.gridConfig.applyContextCoalesce]]" filter-attribute="{{filterAttribute}}"></entity-relationship-grid-datasource>
                  </template>
                  <div class="base-grid-structure">
                    <div class="relation-name-container accordion-grid-header-row-item base-grid-structure-child-1">
                      <template is="dom-if" if="[[relationshipGridConfig.gridConfig.hasWritePermission]]">
                         

                           <template is="dom-if" if="[[showActionButtons]]">
                                <pebble-button class="action-button-focus dropdownText btn btn-success m-l-5" id="next" button-text="Save" raised="" on-tap="_save"></pebble-button>
                            </template>
              
                        <template is="dom-if" if="[[relationshipGridConfig.copyActionConfig]]">
                          <pebble-button class="btn btn-primary m-l-5" id="copy_btn" title\$="[[_clipboardTooltip]]" button-text="Copy ID(s)" on-tap="_onTapCopyAction" on-mouseout="_onMouseoutCopyAction"></pebble-button>
                        </template>
                        <template is="dom-if" if="[[relationshipGridConfig.addRelationConfig]]">
                          <pebble-button icon="pebble-icon:action-add" disabled="[[readonly]]" id="button_[[relationship]]" relationship="[[relationship]]" class="btn btn-primary auto-width addbutton m-l-5" button-text="Add" on-tap="_onAddRelClick"></pebble-button>
                        </template>
                        <template is="dom-if" if="[[_displayAddNewRelationship(relationshipGridConfig)]]">
                          <pebble-button icon="pebble-icon:action-add" disabled="[[readonly]]" id="addnewbutton_[[relationship]]" relationship="[[relationship]]" class="btn btn-primary auto-width addbutton m-l-5" button-text="Add New" on-tap="_onAddNewRelClick"></pebble-button>
                          <bedrock-pubsub event-name="entity-created" handler="_onEntityCreated"></bedrock-pubsub>
                        </template>
                        <template is="dom-if" if="[[showActionButtons]]">
                            <template is="dom-if" if="[[!isPartOfBusinessFunction]]">
                              <pebble-button class="action-button btn btn-secondary m-l-5" id="cancel" button-text="Cancel" raised="" on-tap="_revertAll"></pebble-button>
                            </template>
                           </template>
                      </template>
                      <template is="dom-if" if="[[_isReadyToShowRelationshipAddPopover]]" restamp>
                        <pebble-popover for\$="button_[[relationship]]" vertical-align="auto" horizontal-align="auto" no-overlap="">
                          <rock-entity-lov on-lov-confirm-button-tap="_onLovConfirmButtonTapped" id="lov_[[relationship]]" data-index\$="[[dataIndex]]" request-data="[[_requestForAddRelationshipList(relationship)]]" sub-title-pattern="[[_getSubTitlePattern()]]" id-field="[[_getIdField()]]" image-id-field="[[_getImageIdField()]]" title-pattern="[[_getTitlePattern()]]" selected-items="[[_getSavedRelationshipItems( relationship, _savedRelationshipItems)]]" excluded-ids="[[excludedIds]]" multi-select="" show-action-buttons=""></rock-entity-lov>
                        </pebble-popover>
                      </template>

                      <bedrock-pubsub event-name="relationshipsGet" handler="_onRelationshipsGet"></bedrock-pubsub>
                      <bedrock-pubsub event-name="entity-lov-confirm-button-tap" handler="_onLovConfirmButtonTapped" target-id="lov_[[relationship]]"></bedrock-pubsub>
                      <bedrock-pubsub event-name="entity-lov-close-button-tap" handler="_onLovCloseButtonTapped" target-id="lov_[[relationship]]"></bedrock-pubsub>
                    </div>
                    <div class="base-grid-structure-child-2">
                      <rock-grid id\$="[[relationship]]" class\$="[[getwrapClass]]" readonly="[[readonly]]" context-data="[[contextData]]" r-data-source="{{rDataSource}}" r-data-source-id="datasource_[[relationship]]" config="{{relationshipGridConfig.gridConfig}}" attribute-models="[[_getRelationshipAttributeModels(relationship)]]" grid-data-size="{{size}}" current-record-size="{{currentRecordSize}}" max-configured-count="[[maxConfiguredCount]]" row-drag-drop-enabled="[[_getRowDragDropEnabled()]]" on-row-drop-event-raised="_onRowDropEventRaised" result-record-size="{{resultRecordSize}}" total-count="{{totalCount}}" page-size="[[pageSize]]" apply-context-coalesce="[[relationshipGridConfig.gridConfig.applyContextCoalesce]]" inline-edit-validation-enabled="">
                        <rock-entity-relationship-search-result-actions slot="toolbar" id="gridActions" context-data="[[contextData]]" has-write-permissions="[[_hasWritePermissions(relationshipGridConfig.gridConfig)]]" relationship="[[relationship]]"></rock-entity-relationship-search-result-actions>
                      </rock-grid>
                    </div>
                  </div>
                  <bedrock-pubsub event-name="grid-selecting-item" handler="_onSelectingGridItem" target-id="[[relationship]]"></bedrock-pubsub>
                  <bedrock-pubsub event-name="grid-deselecting-item" handler="_onDeSelectingGridItem" target-id="[[relationship]]"></bedrock-pubsub>
                  <bedrock-pubsub event-name="download-original-asset" handler="_onOriginalAssetDownloadAction" target-id="[[relationship]]"></bedrock-pubsub>
                  <bedrock-pubsub event-name="delete-item" handler="_onDeleteEntityRelationshipAction" target-id="[[relationship]]"></bedrock-pubsub>
                  <bedrock-pubsub target-id="[[relationship]]" event-name="on-grid-msg-dialog-ok" handler="_onRevertDialogOk"></bedrock-pubsub>
                  <bedrock-pubsub event-name="grid-bulk-edit-items" handler="_onBulkEdit" target-id="[[relationship]]"></bedrock-pubsub>
                  <bedrock-pubsub event-name="grid-bulk-relationship-edit-items" handler="_onBulkRelationshipEdit" target-id="[[relationship]]"></bedrock-pubsub>
                  <bedrock-pubsub event-name="grid-custom-toolbar-event" handler="_onCustomToolbarEvent" target-id="[[relationship]]"></bedrock-pubsub>
                  <bedrock-pubsub event-name="grid-link-clicked" handler="_onRelationshipLinkClicked"></bedrock-pubsub>
        
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

          </div>
        </pebble-accordion>
      </div>

      <liquid-entity-data-get id="entityGetData" name="entityGet" operation="getbyids" data-index\$="[[dataIndex]]" request-data="{{_entityGetRequest}}" last-response="{{entitiesResponse}}"></liquid-entity-data-get>
      <liquid-entity-data-get id="entityGetAddData" name="entityGet" operation="getbyids" data-index\$="[[dataIndex]]" request-data="{{_entityGetAddRequest}}" last-response="{{relEntitiesResponse}}"></liquid-entity-data-get>
      <liquid-entity-data-save name="attributeSaveDataService" operation="update" data-index\$="[[dataIndex]]" request-data="{{_saveRequest}}" last-response="{{_saveResponse}}" on-response="_onSaveResponse"></liquid-entity-data-save>
      <liquid-rest id="entityGovernService" url="/data/pass-through/entitygovernservice/validate" method="POST" request-data="{{_entityGovernRequest}}" on-liquid-response="_onEntityGovernResponse" on-liquid-error="_onEntityGovernFailed">
      </liquid-rest>
      <liquid-entity-data-save id="entityRelationsSaveService" data-index\$="[[dataIndex]]" request-data="[[_saveRelationsRequest]]" last-response="{{_saveRelationsResponse}}" on-response="_onRelationsSaveResponse" on-error="_onRelationsSaveError">
      </liquid-entity-data-save>
      <liquid-entity-data-save id="entityRelationsDeleteService" data-index\$="[[dataIndex]]" on-response="_onRelationsDeleteResponse" on-error="_onRelationsSaveError">
      </liquid-entity-data-save>
      <pebble-dialog id="errorsDialog" dialog-title="Errors on page" modal="" small="">
        <p>Found below errors in entity details: </p>
        <ul class="error-list">
          <template is="dom-repeat" items="[[_errorMessages]]">
            <li>[[item.relationshipRelToId]] with error:[[item.message]]</li>
          </template>
        </ul>
        <p>Do you want to fix the errors or continue?</p>
        <div class="buttons">
          <pebble-button dialog-confirm="" class="btn btn-success" button-text="Fix" on-tap="_fixErrors"></pebble-button>
          <pebble-button dialog-confirm="" class="btn btn-secondary" on-tap="_skipErrors" button-text="Skip &amp; Continue"></pebble-button>
        </div>
      </pebble-dialog>

    </template>
    <bedrock-pubsub on-bedrock-event-gridsaveinsplit="refresh" name="bedrock-event-gridsaveinsplit"></bedrock-pubsub>
    <bedrock-pubsub event-name="refresh-relationship-grid" handler="_onRefreshRelationshipGridEvent"></bedrock-pubsub>
    <liquid-rest id="getDownloadUrl" url="/data/binarystreamobjectservice/prepareDownload" method="POST" on-liquid-response="_onGetDownloadUrlResponse">
    </liquid-rest>
    <div id="messageCard">
    </div>
    <pebble-dialog id="gridMsgDialog" dialog-title="Confirmation" show-ok="" show-cancel="" show-close-icon="" alert-box="" modal="">
      <p id="msgDialog"></p>
    </pebble-dialog>
    <bedrock-pubsub target-id="gridMsgDialog" event-name="on-buttonok-clicked" handler="_onDialogOk"></bedrock-pubsub>
    <bedrock-pubsub event-name="global-edit" handler="_onGlobalEdit"></bedrock-pubsub>
    <bedrock-pubsub event-name="quick-manage-event" handler="_onTapQuickManage"></bedrock-pubsub>
    <liquid-entity-model-composite-get name="compositeAttributeModelGet" request-data="{{_relationshipModelRequest}}" on-entity-model-composite-get-response="_onCompositeModelGetResponse">
    </liquid-entity-model-composite-get>
`;
  }

  static get is() { return 'rock-relationship-grid' }

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

      getwrapClass: {
        type: String,
        value: ""
      },

      showActionButtons: {
        type: Boolean,
        value: false
      },
      /*
       *	Indicates the transformed relationship grid configuration for the grid.
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
      relationshipType: {
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
      /*
       * Indicates the list of relationships.
       */
      relationship: {
        type: String,
        value: ""
      },
      /**
       * <b><i>Content development is under progress... </b></i>
       */
      rDataFormatter: {
        notify: true,
        value: function () {
          return this._populateDataForGrid.bind(this);
        }
      },
      /**
       * <b><i>Content development is under progress... </b></i>
       */
      dataObject: {
        type: Object,
        notify: true,
        value: function () {
          return {};
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
      maxConfiguredCount: {
        type: Number,
        value: function () {
          return DataObjectFalcorUtil.getPathKeys().dataIndexInfo.entityData.maxRecordsToReturn;
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
      /**
       * <b><i>Content development is under progress... </b></i>
       */
      doSyncValidation: {
        type: Boolean,
        value: true
      },
      _savedRelationshipItems: {
        type: Object,
        value: function () {
          return {};
        }
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
      _selectedDimensions: {
        type: Object,
        value: function () {
          return {};
        }
      },
      _relationshipModelRequest: {
        type: Object,
        value: function () {
          return {};
        }
      },
      _isMessageAvailable: {
        type: Boolean,
        value: false
      },
      _quickManageEnabled: {
        type: Boolean,
        value: false
      },
      showAccordion: {
        type: Boolean,
        value: true
      },
      /**
       * <b><i>Content development is under progress... </b></i>
       */
      messageCodeMapping: {
        type: Object,
        value: function () { return {}; }
      },
      functionalMode: {
        type: "String",
        value: "default"
      },
      _entityRelations: {
        type: Array,
        value: function () {
          return [];
        }
      },
      _deleteItemRelationshipType: {
        type: String,
        value: null
      },
      _modifiedEntityRelationship: {
        type: Object
      },
      _clipboardTooltip: {
        type: String,
        value: "Copy to clipboard."
      },
      globalEdit: {
        type: Boolean,
        notify: true
      },
      _originalEntity: {
        type: Object
      },
      addRelationshipGridConfig: {
        type: Object,
        value: function () {
          return {};
        }
      },
      excludedIds: {
        type: Array,
        value: function () {
          return [];
        }
      },
      dataIndex: {
        type: String,
        value: "entityData"
      },
      loadGovernData: {
        type: Boolean,
        value: true
      },
      _relationshipModels: {
        type: Object,
        value: function () { return {}; }
      },
      _relationshipDeleteItems: {
        type: Object,
        value: function () {
          return {};
        }
      },
      domain: {
        type: String,
        value: "generic"
      },
      _loadLovEntities: {
        type: Boolean,
        value: false
      },
      filterRules: {
        type: Array,
        value: []
      },
      filterAttribute: {
        type: String,
        value: ""
      },
      filterAttributeValue: {
        type: String,
        value: ""
      },
      _loadRelationshipEntities: {
        type: Boolean,
        value: false
      },
      isCollapsed: {
        type: Boolean,
        notify: true
      },
      navigationData: {
        type: Object,
        value: function () {
            return {};
        }
      },
      _isReadyToShowRelationshipAddPopover: {
        type: Boolean,
        value: false
      }
    }
  }
  static get observers() {
    return [
      '_convertIntoEntityLovList(searchResultResponse)',
      '_addRelationship(relEntitiesResponse)'
    ]
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("editMode", this._onEditMode);
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("editMode", this._onEditMode);
  }


  get getDownloadUrlLiq() {
    this._getDownloadUrl = this._getDownloadUrl || this.shadowRoot.querySelector("#getDownloadUrl");
    return this._getDownloadUrl;
  }

  get entityName() {
    if (!this._entityName && !_.isEmpty(this.contextData)) {
      let itemContext = ContextHelper.getFirstItemContext(this.contextData);
      this._entityName = itemContext.name || "";
    }
    return this._entityName || "";
  }

  _applyClass(quickManageEnabled) {
    if (quickManageEnabled) {
      return "grid-wrap-container grid-quick-manage-container col-8-4-grid";
    }
    return "grid-wrap-container";
  }
  ready() {
    super.ready()
    this._currentSelectedLov = null;
    this._currentLovItems = null;

    let firstItemContext = ContextHelper.getFirstItemContext(this.contextData);
    if (!_.isEmpty(firstItemContext)) {
      this.excludedIds.push(firstItemContext.id);
    }
        
    let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(this.contextData);
    this.set("_relationshipModelRequest", compositeModelGetRequest);
    let liquidModelGet = this.shadowRoot.querySelector("[name=compositeAttributeModelGet]");
    if (liquidModelGet && compositeModelGetRequest) {
      liquidModelGet.generateRequest();
    }
  }
  _hasWritePermissions(gridConfig) {
    return gridConfig["hasWritePermission"];
  }
  _getRelationshipGrid() {
    return this.shadowRoot.querySelector("rock-grid");
  }
  _getRowDragDropEnabled() {
    let isOrderAvailable = false;
    let isRowDragDropEnabled = false;
    let dragDropEnable = false;
    let isOrderAvailableInColumns = false;
    if (DataHelper.isValidObjectPath(this.relationshipGridConfig, "gridConfig.itemConfig.fields")) {
      let columns = this.relationshipGridConfig.gridConfig.itemConfig.fields;
      let columnsList = DataHelper.convertObjectToArray(columns)
      if (columnsList) {
        for (let i = 0; i < columnsList.length; i++) {
          if (columnsList[i].name == "order") {
            isOrderAvailableInColumns = true;
            break;
          }
        }
      }
    }
    if (isOrderAvailableInColumns && DataHelper.isValidObjectPath(this.relationshipGridConfig, "gridConfig.itemConfig.sort.default")) {
      let defaultSortList = this.relationshipGridConfig.gridConfig.itemConfig.sort.default;
      if (defaultSortList) {
        for (let i = 0; i < defaultSortList.length; i++) {
          if (defaultSortList[i].field == "order") {
            isOrderAvailable = true;
            break;
          }
        }
      }
    }
    if (DataHelper.isValidObjectPath(this.relationshipGridConfig, "gridConfig.rowDragDropEnabled")) {
      isRowDragDropEnabled = this.relationshipGridConfig.gridConfig.rowDragDropEnabled;
    }
    if (isOrderAvailable && isRowDragDropEnabled) {
      dragDropEnable = true;
    }
    return dragDropEnable;
  }
  _onSelectingGridItem(e, detail, sender) {
    if (this._quickManageEnabled) {
      let grid = this._getRelationshipGrid();
      this._selectedEntity = detail.item;
      if (!_.isEmpty(this._selectedEntity)) {
        let itemContext = ContextHelper.getFirstItemContext(this.contextData);
        itemContext.relationshipId = this._selectedEntity.relationshipId;
        itemContext.relatedEntityType = this._selectedEntity.type;
        itemContext.relationships = [this.relationship];
        grid.clearSelection();
        microTask.run(() => {
          this._currentIndex = grid.getSelectedItemIndex();
        });
      }
    }
    this._reloadQuickManage();
  }
  _reloadQuickManage() {
    const entityQuickManage = this.shadowRoot.querySelector("#entityQuickManage");
    if (entityQuickManage) {
      entityQuickManage.reload();
    }
  }
  _onDeSelectingGridItem(e, detail, sender) {
    if (this._quickManageEnabled) {
      this._selectedEntity = {};
    }
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
        itemContext.relationships = [this.relationship];
        grid.clearSelection(); //Clear current selection
        grid.selectItem(selectedItem); //
        this._currentIndex = grid.getSelectedItemIndex();
        grid.scrollToIndex(this._currentIndex);
      }
      this._reloadQuickManage();
    }
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
  _getAttributeList() {
    if (this.relationshipGridConfig) {
      return this.relationshipGridConfig.relationshipTypeAndAttributes;
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
  _getRelationshipTypeTitle() {
    if (this.relationshipGridConfig) {
      let config = this.relationshipGridConfig.gridConfig;
      if (config && config.title && config.title != "") {
        return config.title;
      }
    }
    return this.relationship;
  }
  _getQuickManageConfig(configName) {
    return this.relationshipGridConfig.quickManageConfig[configName];
  }
  _getRelationshipGridRequest(relationshipTypeName) {
    let req = DataHelper.cloneObject(this.relReq);
    DataRequestHelper.addDefaultContext(req);
    if (req && relationshipTypeName) {
      let relAttr = this._getAttributeList();
      if (relAttr) {
        req.params.fields.relationshipAttributes = relAttr.relationshipAttributes;
        req.params.fields.relatedEntityAttributes = relAttr.relatedEntityAttributes;
      }
      req.params.fields.relationships = [relationshipTypeName];
      if (this.filterAttribute) {
        req.params.fields.attributes = [this.filterAttribute]
      }
    }
    return req;
  }
  _getRelationshipAttributeModels() {
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
  _getRelationshipModel() {
    let config = this.relationshipGridConfig;
    let relModel = {};
    if (config && "relationshipModel" in config) {
      relModel = config.relationshipModel;
    }
    return relModel;
  }
  _getRelatedEntityContexts() {
    let config = this.relationshipGridConfig;
    let relatedEntityContexts;
    if (config) {
      relatedEntityContexts = config.relatedEntityModel.relatedEntityContexts;
    }
    return relatedEntityContexts;
  }
  _populateDataForGrid(respData, event) {
    let data = [];
    if (respData) {

      if (respData.content && respData.content.entities) {
        let entities = respData.content.entities;
        if (entities && entities.length > 0) {

          let entity = entities[0];
          //Need to check why is this required?
          if (this.dataObject && !this.dataObject["blankEntity"]) {
            this.dataObject["blankEntity"] = entity;
          }

          let currentRel = "";
          let isSelfContext = false;
          if (event.detail.request) {
            currentRel = event.detail.request.requestData.params.fields.relationships[0];
            if (currentRel) {
              let currentRelGrid = this.shadowRoot.querySelector('rock-grid[id=' + currentRel + ']');
              if (currentRelGrid && currentRelGrid.config && currentRelGrid.config.mode && currentRelGrid.config.mode == "edit") {
                currentRelGrid.changeToEditMode();
              }
            }
          }

          let relConfig = this.relationshipGridConfig;

          let relationships = EntityHelper.getCoalescedRelationshipByType(entity, this.contextData, currentRel);
          if (!_.isEmpty(relationships)) {
            //Need to check why is this required?
            this._entityRelations = this._entityRelations.concat(relationships);

            if (this.dataObject) {
              if (!this.dataObject[currentRel]) {
                this.dataObject[currentRel] = entity;
              }
            }
            let relationshipAttributeModels = this._getRelationshipAttributeModels();
            let savedItems = [];
            let entityTypeManager = EntityTypeManager.getInstance();
            let applyGraphCoalescedStyle = this.appSetting("dataDefaults").applyGraphCoalescedStyle;
            relationships.forEach(function (relItem) {
              if (relItem) {
                let record = {};
                let savedItem = {};
                if (relItem.attributes) {
                  Object.keys(relItem.attributes).forEach(function (item) {
                    if (item && relItem.attributes[item]) {
                      let valueObjs = relItem.attributes[item].values;
                      let model = relationshipAttributeModels[item];
                      let refEntityType = model && model.referenceEntityTypes && model.referenceEntityTypes.length > 0 ? model.referenceEntityTypes[0] : "";
                      if (!_.isEmpty(valueObjs)) {
                        if (valueObjs.length > 1) {
                          let values = [];
                          let referenceDataIds = [];
                          for (let valueIndex = 0; valueIndex < valueObjs.length; valueIndex++) {
                            values.push(valueObjs[valueIndex].value);
                            if (valueObjs[valueIndex].properties && valueObjs[valueIndex].properties.referenceData) {
                              let referenceData = valueObjs[valueIndex].properties.referenceData;
                              let referenceDataId = referenceData.replace(refEntityType + "/", "");
                              referenceDataIds.push(referenceDataId);
                            }
                          }
                          record[item] = values;
                          if (!_.isEmpty(referenceDataIds)) {
                            record[item + "_referenceDataId"] = referenceDataIds;
                          }
                        } else {
                          record[item] = valueObjs[0].value;
                          if (valueObjs[0].properties && valueObjs[0].properties.referenceData) {
                            let referenceData = valueObjs[0].properties.referenceData;
                            let referenceDataId = referenceData.replace(refEntityType + "/", "");
                            record[item + "_referenceDataId"] = referenceDataId;
                          }
                        }
                      }
                    }
                  }, this);
                }

                if (relItem.properties) {
                  if (!_.isEmpty(relItem.properties.contextCoalesce) || !_.isEmpty(relItem.properties.instanceCoalesce)) {
                    record["contextCoalescePaths"] = DataTransformHelper.getContextCoalescePaths(relItem.properties, this.getFirstDataContext());
                  }
                }

                if(applyGraphCoalescedStyle && relItem.os === "graph" && !_.isEmpty(relItem.osid) && !_.isEmpty(relItem.ostype)) {
                  record["os"] = relItem.os;
                  record["osid"] = relItem.osid;
                  record["ostype"] = relItem.ostype;
                }

                if (relItem.relTo) {
                  record["relationshipId"] = relItem.relTo.id;
                  record["Relationship Id"] = relItem.relTo.id;
                  record["Related Entity"] = record["id"] = relItem.relTo.id;
                  record["type"] = relItem.relTo.type;
                  savedItem["id"] = relItem.relTo.id;
                  savedItem["title"] = relItem.relTo.id;
                  savedItem["type"] = relItem.relTo.type;
                  record["typeExternalName"] = entityTypeManager.getTypeExternalNameById(relItem.relTo.type);
                  savedItems.push(savedItem);

                  //It will required in case of default sorting.
                  if (relItem.relTo.properties) {
                    let properties = relItem.relTo.properties;
                    Object.keys(properties).forEach(function (property) {
                      if (property && properties[property]) {
                        record[property.toLocaleLowerCase()] = properties[property];
                      }
                    }, this);
                  }

                  if (relItem.relTo.data) {
                    //var relCtxList = relContexts[item];
                    let relatedAttributes = EntityHelper.getAllAttributes(relItem.relTo);
                    if (relatedAttributes) {
                      Object.keys(relatedAttributes).forEach(function (
                        attrItem) {
                        if (attrItem && relatedAttributes[attrItem]) {
                          let valueObjs = relatedAttributes[attrItem].values;
                          let model = relationshipAttributeModels[attrItem];
                          let refEntityType = model && model.referenceEntityTypes && model.referenceEntityTypes.length > 0 ? model.referenceEntityTypes[0] : "";
                          if (!_.isEmpty(valueObjs)) {
                            if (valueObjs.length > 1) {
                              let values = [];
                              let referenceDataIds = [];
                              for (let valueIndex = 0; valueIndex < valueObjs.length; valueIndex++) {
                                values.push(valueObjs[valueIndex].value);
                                if (valueObjs[valueIndex].properties && valueObjs[valueIndex].properties.referenceData) {
                                  let referenceData = valueObjs[valueIndex].properties.referenceData;
                                  let referenceDataId = referenceData.replace(refEntityType + "/", "");
                                  referenceDataIds.push(referenceDataId);
                                }
                              }
                              record[attrItem] = values;
                              if (!_.isEmpty(referenceDataIds)) {
                                record[attrItem + "_referenceDataId"] = referenceDataIds;
                              }
                            } else {
                              record[attrItem] = valueObjs[0].value;
                              if (valueObjs[0].properties && valueObjs[0].properties.referenceData) {
                                let referenceData = valueObjs[0].properties.referenceData;
                                let referenceDataId = referenceData.replace(refEntityType + "/", "");
                                record[attrItem + "_referenceDataId"] = referenceDataId;
                              }
                            }
                          }
                        }
                      }, this);
                    }
                  }
                }
                if (!record.thumbnailid) {
                  record.thumbnailid = "";
                  if (this.typeThumbnailMapping && this.typeThumbnailMapping[record.type]) {
                    record.thumbnailid = this.typeThumbnailMapping[record.type];
                  }
                }
                data.push(record);
              }
            }, this);


            //Need to check why is this required?
            let savedRelationships = this._savedRelationshipItems;
            if (savedRelationships[currentRel]) {
              savedRelationships[currentRel] = savedRelationships[currentRel].concat(savedItems);
            }
            else {
              savedRelationships[currentRel] = savedItems;
            }

            this._savedRelationshipItems = {};
            this._savedRelationshipItems = savedRelationships;

            let defaultSort;
            if (DataHelper.isValidObjectPath(relConfig, "gridConfig.itemConfig.sort.default")) {
              defaultSort = relConfig.gridConfig.itemConfig.sort.default;
            }
            if (!_.isEmpty(defaultSort)) {
              data = this._sortRelationshipRecords(data, defaultSort);
            }
          }
        }
      }
    }

    return data;
  }

  _sortRelationshipRecords(data, defaultSort) {
    let resultData = DataHelper.cloneObject(data);
    if (data && defaultSort && defaultSort.length) {
      resultData = this._setDefaultValue(resultData, defaultSort);
      if (defaultSort.length > 1) {  // multiple column sort              
        let firstSortItem = defaultSort.slice(0, 1)[0];
        let addtionalSortItems = defaultSort.slice(1);
        for (let i = 0; i < addtionalSortItems.length; i++) {
          let field = addtionalSortItems[i].field;
          addtionalSortItems[i].name = field;
          addtionalSortItems[i].dataType = this._getDataTypeByName(field);
        }
        let dataType = this._getDataTypeByName(firstSortItem.field);
        resultData = DataHelper.sort(resultData, firstSortItem.field, dataType, firstSortItem.sortType, addtionalSortItems);

      } else if (defaultSort.length == 1) { // one column sort              
        let sortItem = defaultSort[0];
        let dataType = this._getDataTypeByName(sortItem.field);
        resultData = DataHelper.sort(resultData, sortItem.field, dataType, sortItem.sortType);
      }
    }
    return resultData;
  }

  //Set null field with default value if any
  _setDefaultValue(resultData, defaultSort) {
    for (let i = 0; i < defaultSort.length; i++) {
      if (defaultSort[i].defaultValue) {
        for (let j = 0; j < resultData.length; j++) {
          if (!resultData[j][defaultSort[i].field]) {
            resultData[j][defaultSort[i].field] = defaultSort[i].defaultValue;
          }
        }
      }
    }

    return resultData;
  }

  _getDataTypeByName(attrName) {
    let dataType = "string";
    if (attrName) {
      dataType = AttributeHelper.getPropertyTypeByName(attrName);
      if (_.isEmpty(dataType)) {
        let attrModels = this._getRelationshipAttributeModels();
        if (attrModels && attrModels[attrName]) {
          dataType = attrModels[attrName].properties.dataType;
        }
      }
    }
    return dataType;
  }
  _onMouseoutCopyAction() {
    this.set("_clipboardTooltip", "Copy to clipboard.");
  }
  _onTapCopyAction(ev) {
    let grid = this._getRelationshipGrid();
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
  _onAddRelClick(e) {
    if (e.currentTarget.disabled == true) {
      return;
    }
    if (this.addRelationshipMode == "lov") {
      this._isReadyToShowRelationshipAddPopover = this._loadLovEntities;
      flush();
      let popover = this.shadowRoot.querySelector("pebble-popover[for=" + e.currentTarget.id + "]");
      this._currentSelectedLov = this.shadowRoot.querySelector('rock-entity-lov[id=lov_' + this.relationship + ']');
      popover.show();
    } else {
      let rel = e.currentTarget.relationship;
      const { relatedEntityTypes, selfContext } = this.relationshipGridConfig;
      const { id, type } = ContextHelper.getFirstItemContext(this.contextData);
      let mode = this.domain == "digitalAsset" ? "asset" : "relationship";
      let savedRelationships = this._getSavedRelationshipItems(rel, this._savedRelationshipItems);
      let filterRules = this._prepareFilterRules();
      let contextData = DataHelper.cloneObject(this.contextData);
      contextData[ContextHelper.CONTEXT_TYPE_DOMAIN] = [{
        "domain": this.domain
      }];
      const sharedData = {
        "mode": mode,
        "types-criterion": relatedEntityTypes,
        "relationship-type": rel,
        "heading": this._getRelationshipTypeTitle(rel),
        "selected-entities": [{ id, type }],
        "pre-selected-items": savedRelationships,
        "self-context": selfContext,
        "add-relationship-grid-config": this.addRelationshipGridConfig,
        "dataIndex": this.dataIndex,
        "filter-rules": filterRules,
        "context-data": contextData
      };

      this.openBusinessFunctionDialog({
        name: 'rock-wizard-entity-relationship-add',
        mergeTitle: true,
        title: this.entityName
      }, sharedData);
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
      let selectedItemIds = [];
      if (lov) {
        selectedItemIds = [...new Set(lov.selectedItems.map((obj) => obj.id))];
      }
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
        this._isReadyToShowRelationshipAddPopover = false;
      }
    }
  }
  _addRelatedEntity(relationshipType, entityIds) {
    if (entityIds && entityIds.length > 0) {
      let popover = this.shadowRoot.querySelector("pebble-popover[for=button_" + relationshipType + "]");

      let relatedEntityContexts = this._getRelatedEntityContexts();
      let typesCriterion = [];
      let contexts = [];
      let attributes = this._getRelatedEntityAttributeList();

      if (relatedEntityContexts) {
        relatedEntityContexts.forEach(function (relContexts) {
          if (relContexts) {
            typesCriterion.push(relContexts.relEntityType);
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
            "attributes": attributes
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
      this._isReadyToShowRelationshipAddPopover = false;
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
  _onEditMode(e) {
    this.showActionButtons = true;
  }
  async _save(e) {
    if (e.currentTarget.disabled == true) {
      return;
    }

    let currentRel = e.target.__dataHost.parentModel.relationship; //e.model.relationship;
    let currentRelGrid = this.shadowRoot.querySelector('rock-grid[id=' + currentRel + ']');

    if (currentRelGrid) {
      let modifiedRelData = currentRelGrid.getModifiedData();
      let originalEntity;

      //Check whether any row is modified or not.
      if (!modifiedRelData || (modifiedRelData && modifiedRelData.length == 0)) {
        this.showInformationToast("No changes to save");
        return;
      }

      if (this.dataObject) {
        if (this.dataObject[currentRel]) {
          originalEntity = this.dataObject[currentRel];
        } else if (this.dataObject['blankEntity']) {
          originalEntity = this.dataObject['blankEntity'];
        }
      }

      if (originalEntity) {
        this._originalEntity = DataHelper.cloneObject(originalEntity);

        if (!_.isEmpty(modifiedRelData)) {
          let existingRelationships = EntityHelper.getRelationshipByRelationshipType(originalEntity, this.getFirstDataContext(), currentRel);
          let relObjects = this._getUpdatedRelationshipsFromModifiedGridData(originalEntity, existingRelationships, modifiedRelData, currentRel);

          // Remove all relationships exist in entity's current relationship reference, it may possible that only few relationships are modified.
          if (existingRelationships) {
            existingRelationships.length = 0;
          }

          // Add all updated relatinships in entity's current relationship reference.
          if (relObjects) {
            relObjects.forEach(function (relItem) {
              existingRelationships.push(relItem);
            }, this);
          }
        }

        // Prepare entity for context save where relationships will be filtered or modified by context model. 
        DataTransformHelper.prepareEntityForContextSave(originalEntity.data, {}, this._relationshipModels, this.contextData)
      }

      this._saveRequest = {
        "entities": [DataHelper.cloneObject(originalEntity)]
      };

      if (this.doSyncValidation) {
        let req = DataRequestHelper.createSyncValidationRequest(originalEntity.id, originalEntity.type, originalEntity.data);
        this.set('_entityGovernRequest', req);
        delete this._entityGovernRequest.entity.name;
        let liquidGovernGet = this.shadowRoot.querySelector('#entityGovernService');
        if (liquidGovernGet && this.loadGovernData) {
          liquidGovernGet.generateRequest();
        }
      } else {
        this._saveEntity();
      }
    }
  }

  _getUpdatedRelationshipsFromModifiedGridData(originalEntity, existingRelationships, modifiedRelData, currentRel) {
    let relObjects = [];

    if (modifiedRelData) {
      let relAndRelEntityAttributes = this._getAttributeList(currentRel);
      let valueContext = this.getFirstValueContext();

      // Get updated relationships by adding or updating exiting relationship data.
      modifiedRelData.forEach(function (modItem) {
        let relObject;
        // Find out if modified relaitionship is exist in current entity data.
        if (!_.isEmpty(existingRelationships)) {
          existingRelationships.forEach(function (relItem) {
            if (relItem && ("relTo" in relItem) && relItem.relTo.id == modItem["Related Entity"]) {
              relObject = relItem;
            }
          }, this);
        }

        // ADD and UPDATE case will be diceded based upon modified relationship is exist in entity.
        if (relObject) {
          // UPDATE
          // Existing relatsionship update.
          let relAttributes = relObject.attributes ? relObject.attributes : relObject.attributes = {};

          if ("relationshipAttributes" in relAndRelEntityAttributes) {
            relAndRelEntityAttributes.relationshipAttributes.forEach(function (relAttr) {
              if (relAttr) {
                let relAttribute = relAttributes ? relAttributes[relAttr] : undefined;
                if (relAttribute) {
                  relAttribute.values[0].value = modItem[relAttr];
                } else {
                  if (modItem[relAttr]) {
                    relAttributes[relAttr] = {};
                    relAttributes[relAttr].values = [{
                      "value": modItem[relAttr],
                      "source": valueContext.source,
                      "locale": DataHelper.getDefaultLocale()
                    }];
                  }
                }

                let originalValue = modItem[relAttr + "_originalValue"];
                if (!_.isEmpty(originalValue) && modItem[relAttr] == "") {
                  relAttributes[relAttr].values[0].value = originalValue;
                  relAttributes[relAttr].values[0].action = "delete";
                }
              }
            }, this);
          }
        } else {
          // ADD
          // Add new relationship.
          let relId = modItem["Related Entity"];
          let relToType = modItem['type'];

          if (relId && relToType) {
            relObject = {};
            relObject.direction = "both";
            relObject.operation = "association";
            relObject.attributes = {};

            if (relAndRelEntityAttributes) {
              relAndRelEntityAttributes.relationshipAttributes.forEach(function (relAttr) {
                if (relAttr && modItem[relAttr]) {
                  relObject.attributes[relAttr] = {};
                  relObject.attributes[relAttr].values = [{
                    "value": modItem[relAttr],
                    "source": valueContext.source,
                    "locale": valueContext.locale
                  }];
                }
              }, this);
            }

            relObject.relTo = {};
            relObject.relTo.id = relId;
            relObject.relTo.type = relToType;
            relObject.relTo.properties = modItem['properties'];
          }
        }

        relObjects.push(relObject);
      }, this);
    }

    return relObjects;
  }

  _onEntityGovernResponse(e) {
    if (e && e.detail && e.detail.response && e.detail.response.response && e.detail.response.response.status == "success") {
      let res = e.detail.response.response;

      //Verify validation messages to process or not
      let syncValidations = this.relationshipGridConfig.gridConfig.syncValidations;
      let validationMessage;

      if (syncValidations && syncValidations.length > 0) {
        for (let i = 0; i < syncValidations.length; i++) {
          if (DataHelper.isValidObjectPath(res, "entities.0.data.attributes." + syncValidations[i].attribute + ".properties.messages")) {
            let attrMessages = res.entities[0].data.attributes[syncValidations[i].attribute].properties.messages;
            if (attrMessages.length > 0 && attrMessages.find(obj => obj.messageCode == syncValidations[i].code)) {
              validationMessage = validationMessage ? validationMessage + ", " + syncValidations[i].message : syncValidations[i].message;
            }
          }
        }
      }

      if (validationMessage) {
        this.showWarningToast(validationMessage);
        return;
      }

      let itemContext = this.getFirstItemContext();
      let entityId;
      if (itemContext) {
        entityId = itemContext.id;
      }

      let entity = DataHelper.findEntityById(res.entities, entityId);

      let relMessages = {};

      if (entity && entity.data && entity.data.relationships) {
        let relationships = entity.data.relationships;
        for (let i in relationships) {
          let relationshipType = i;
          let relTitle = this._getRelationshipTypeTitle(relationshipType);
          let relationshipMessages = MessageHelper.getRelationshipsMessages(relationships[i], this.messageCodeMapping, this.localize());
          if (relationshipMessages && relationshipMessages.length > 0) {
            let relAttributes = relationships[i][0].attributes;
            let attrModels = this._getRelationshipAttributeModels(relationshipType);
            let relationshipObj = {
              "relTitle": relTitle,
              "relMessage": relationshipMessages,
              "relAttributes": relAttributes,
              "attrModels": attrModels,
              "relationship": relationships[i]
            };
            relMessages[relationshipType] = relationshipObj;
          }
        }
      }

      if (!_.isEmpty(relMessages)) {
        let errorMessages = MessageHelper.getErrorsFromRelMessages(relMessages);
        this.set("_errorMessages", errorMessages);
        this.shadowRoot.querySelector('#errorsDialog').open();
        return;
      } else {
        this._saveEntity();
      }
    } else {
      this.logError("AttributeManageValidationFail:- There is a problem in validation service.", e.detail);
    }
  }
  _onEntityGovernFailed(e) {
    this.logError("AttributeManageValidationFail:- There is a problem in validation service.", e.detail);
  }
  _skipErrors() {
    this._fixErrors();

    this._saveEntity();
  }
  _fixErrors() {
    let errorDialog = this.shadowRoot.querySelector('#errorsDialog');
    if (errorDialog) {
      errorDialog.close();
      if (this.dataObject) {
        let currentRel = this.relationship;
        if (this.dataObject[currentRel]) {
          this.dataObject[currentRel] = this._originalEntity;
        }
      }
    }
  }
  _saveEntity() {
    let liquidSave = this.shadowRoot.querySelector("[name=attributeSaveDataService]");
    if (liquidSave) {
      liquidSave.generateRequest();
    }
  }
  _onSaveResponse() {
    //TO-DO will get changed
    RUFUtilities.appCommon.toastText = "Relationships save request is submitted successfully!!";

    let eventData = {
      name: "gridsaveinsplit"
    }
    this.dispatchEvent(new CustomEvent('bedrock-event', { detail: eventData, bubbles: true, composed: true }));

    let toastElement = RUFUtilities.pebbleAppToast;
    toastElement.toastType = "success";
    toastElement.heading = "Success";
    toastElement.autoClose = true;

    toastElement.show();

    let currentRelGrid = this.shadowRoot.querySelector('rock-grid[id=' + this.relationship + ']');
    let gridData = currentRelGrid.getData();
    let savedRelationshipItems = gridData.map(function (item) {
      if (item.id) {
        return { 'id': item.id, 'title': item.id, 'type': item.type }
      }
    });
    this._savedRelationshipItems[this.relationship] = DataHelper.cloneObject(savedRelationshipItems);
    let data = {"savedRelationships": this._savedRelationshipItems};
    let eventDetails = [];
    if (currentRelGrid) {
      this._changeRelationshipToReadMode();
      currentRelGrid.changeToReadMode();
    }
    this.dataFunctionComplete(data, eventDetails, true);
  }
  _onRevertDialogOk(e) {
    let currentRel = e.target.__dataHost.parentModel.relationship; //e.model.relationship;
    let currentRelGrid = this.shadowRoot.querySelector('rock-grid[id=' + currentRel + ']');
    if (currentRelGrid) {
      let gridData = currentRelGrid.getData();

      // Revert the grid data and set to read mode
      currentRelGrid.revertModifiedData(gridData);
      this._changeRelationshipToReadMode();

      // Reset LoV selection
      this._resetAddLoVSelection(currentRelGrid);
    }
  }
  _revertAll(e) {
    let currentRel = this.relationship; //e.model.relationship;
    let relationshipTitle = currentRel;
    if(DataHelper.isValidObjectPath(this.relationshipGridConfig, 'relationshipModel.properties.externalName')){
      relationshipTitle = this.relationshipGridConfig.relationshipModel.properties.externalName;
    }
    let currentRelGrid = this.shadowRoot.querySelector('rock-grid[id=' + currentRel + ']');
    if (this.functionalMode == "dataFunction") {
      let eventName = "onSkip";
      let eventDetail = {
        name: eventName
      };
      this.fireBedrockEvent(eventName, eventDetail, { ignoreId: true });
    } else if (currentRelGrid) {
      if (currentRelGrid.getIsDirty()) {
        currentRelGrid.openGridMsgDialog(relationshipTitle +
          " relationship has unsaved changes. Do you wants to revert those ?");
      } else {
        currentRelGrid.changeToReadMode();
        this._changeRelationshipToReadMode();
      }
    }
  }

  getIsDirty() {
    let relGridContainer = this.$$("div[id^='relContainer_']:not([hidden])");
    if (relGridContainer) {
      let relGridDirty = false;
      let relGrid = relGridContainer.querySelector('rock-grid');
      if (relGrid && relGrid.getIsDirty) {
        relGridDirty = relGrid.getIsDirty();
      }
      let quickManageDirty = false;
      let quickManage = relGridContainer.querySelector('rock-entity-quick-manage');
      if (quickManage && quickManage.getIsDirty) {
        quickManageDirty = quickManage.getIsDirty();
      }

      if (relGridDirty || quickManageDirty) {
        return true;
      }
    }
    return false;
  }
  getControlIsDirty() {
    let quickManageControlDirty = false;
    let relGridControlDirty = false;
    let popoverControlDirty = false;
    let dialogControlDirty = false;
    let relGridContainer = this.$$("div[id^='relContainer_']:not([hidden])");
    if (relGridContainer) {
      //Quick manage is edited
      let quickManage = relGridContainer.querySelector('rock-entity-quick-manage');
      if (quickManage && quickManage.getControlIsDirty) {
        quickManageControlDirty = quickManage.getControlIsDirty();
      }

      //Rock grid items are selected or edited
      let relGrid = relGridContainer.querySelector('rock-grid');
      if (relGrid && relGrid.getControlIsDirty) {
        relGridControlDirty = relGrid.getControlIsDirty();
      }

      //popover is opened
      let popoverObj = relGridContainer.querySelector('pebble-popover');
      if (popoverObj && popoverObj.getControlIsDirty) {
        popoverControlDirty = popoverObj.getControlIsDirty();
      }

      //Dialog is opened
      let businessFunctionDialog = RUFUtilities.appCommon.getFunctionDialog();
      if (businessFunctionDialog) {
        dialogControlDirty = businessFunctionDialog.getControlIsDirty();
      }
    }

    return quickManageControlDirty || relGridControlDirty || popoverControlDirty || dialogControlDirty;
  }

  refresh(options) {
    if (options && !_.isEmpty(options) && options.partialRefresh) {
      //What to do here...
    }

    let rockGrid = this.$$("rock-grid");
    rockGrid.refresh(options);
    if (this._quickManageEnabled == true) {
      let quickManage = this.$$("rock-entity-quick-manage");
      quickManage.refresh();
    }
  }

  async _onDialogOk(e) {
    this.showActionButtons = false;
    if (this._modifiedEntityRelationship && "action" in this._modifiedEntityRelationship) {
      if (this._modifiedEntityRelationship.action == "bulk-delete" || this._modifiedEntityRelationship.action == "delete") {
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
              let message = this._relationshipDeleteItems["coalescedRelIds"].length + " relationships cannot be deleted because they are inherited.";
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
      let updateRequest = DataRequestHelper.generateRelationshipProcessRequest(this.contextData);
      let relations = this._entityRelations;
      let modifiedRelations = [];

      if (relations) {
        relations.forEach(function (relation) {
          if (selectedIds.indexOf(relation.relTo.id) > -1) {
            modifiedRelations.push(relation);
          }
        });
      }

      modifiedRelations.forEach(function (rel) {
        rel.action = "delete";
      });

      updateRequest.data.relationships[this.relationship] = modifiedRelations;
      DataTransformHelper.prepareEntityForContextSave(updateRequest.data, {}, this._relationshipModels, this.contextData);

      let entityDelLiquid = this.shadowRoot.querySelector("#entityRelationsDeleteService");
      if (entityDelLiquid) {
        entityDelLiquid.requestData = {
          "entities": [updateRequest]
        };
        entityDelLiquid.operation = "update";
        entityDelLiquid.generateRequest();
      }
    }
  }

  _onRelationsDeleteResponse(e, detail) {
    let message;
    if ("relIds" in this._relationshipDeleteItems && !("coalescedRelIds" in this._relationshipDeleteItems)) {
      message = "Relationship(s) delete request submitted successfully for " + this._relationshipDeleteItems["relIds"].length + " relationship(s).";
      this.showSuccessToast(message, 10000);
    } else if ("coalescedRelIds" in this._relationshipDeleteItems) {
      if ("relIds" in this._relationshipDeleteItems) {
        message = "Relationship(s) delete request submitted successfully for " + this._relationshipDeleteItems["relIds"].length + " relationship(s) and remaining" + this._relationshipDeleteItems["coalescedRelIds"].length + " relationships cannot be deleted because they are inherited.";
      } else {
        message = this._relationshipDeleteItems["coalescedRelIds"].length + " relationships cannot be deleted because they are inherited.";
      }
      this.showWarningToast(message, 10000);
    }

    let relGrid = this.shadowRoot.querySelector('rock-grid[id=' + this.relationship + ']');
    if (relGrid) {
      this._entityRelations = [];
      relGrid.set('config.mode', "read");
      relGrid.reRenderGrid();

      // Reset Add LoV selection
      this._resetAddLoVSelection(relGrid);
    }
  }

  _changeRelationshipToReadMode() {
    if (this.relationship) {
      this.showActionButtons = false;
    }
  }
  _requestForAddRelationshipList(relationship) {
    let relatedEntityContexts = this._getRelatedEntityContexts();
    let attributes = this._getRelatedEntityAttributeList();
    let filterRules = this._prepareFilterRules();
    let attributesCriterion = filterRules.filterAttributesCriterion;

    let typesCriterion = [];
    let contexts = [];
    if (relatedEntityContexts) {
      relatedEntityContexts.forEach(function (relContext) {
        if (relContext) {
          typesCriterion.push(relContext.relEntityType);
          if (relContext.relContexts) {
            relContext.relContexts.forEach(function (ctxItem) {
              contexts.push(ctxItem);
            }, this);
          }
        }
      }, this);

      if (!_.isEmpty(filterRules.filterContexts)) {
        contexts.push(filterRules.filterContexts);
      }
      let valueContext = this.getFirstValueContext();

      let req = {
        "params": {
          "query": {
            "contexts": contexts,
            "filters": {
              "attributesCriterion": attributesCriterion,
              "typesCriterion": typesCriterion
            }
          },
          "fields": {
            "attributes": attributes,
            "relationships": []
          },
          "options": {
            "from": 0,
            "to": 0
          }
        }
      };
      if(!_.isEmpty(contexts)){
        req.params.query.filters["nonContextual"] = false;
      }

      DataRequestHelper.addDefaultContext(req);

      return req;
    }
    let messageDiv = this.$.messageCard;
    if (messageDiv) {
      messageDiv.textContent = "Relationships are not configured for current entity type: " + this.relationshipTitle;
      this._isMessageAvailable = true;
    }
  }
  _prepareFilterRules() {
    let contextObj = {};
    let filterobj = {};
    let attributesCriterion = [];
    let dataContext = this.getDataContexts();
    if (!_.isEmpty(this.filterRules)) {
      this.filterRules.forEach(filterRule => {
        let attrName = filterRule.filterByToEntityAttribute;
        if (attrName) {
          let attrObject = {};
          let attrCriterionObj = {};
          if (filterRule.filterByValues) {
            this.filterAttributeValue = filterRule.filterByValues
          }
          if (!_.isEmpty(this.filterAttributeValue)) {
            if(_.isArray(this.filterAttributeValue)){
              attrObject["exacts"] = this.filterAttributeValue;
            }
            else{
              attrObject["exact"] = this.filterAttributeValue;
            }
            attrObject["operator"] = "_OR";
            attrObject["type"] = "_STRING";
            attrCriterionObj[attrName] = attrObject;
            attributesCriterion.push(attrCriterionObj);
          }
        }

        if (!_.isEmpty(filterRule.filterByCurrentContext) && dataContext.length > 0) {
          let contextsToFilter = !_.isArray(filterRule.filterByCurrentContext) ? [filterRule.filterByCurrentContext]
                                                                               : filterRule.filterByCurrentContext;
          if (!_.isEmpty(contextsToFilter)) {

            contextsToFilter.forEach(contextToFilter => {
              if(!_.isEmpty(dataContext[0][contextToFilter])){
                contextObj[contextToFilter] = dataContext[0][contextToFilter]
              }
            })
          }
        }
      })
    }
    filterobj["filterAttributesCriterion"] = attributesCriterion;
    filterobj["filterContexts"] = !_.isEmpty(contextObj) ? contextObj : {};

    return filterobj;
  }
  _onRelationshipsGet(event) {
    if (!_.isEmpty(event.detail.attributes) && !_.isEmpty(event.detail.attributes[this.filterAttribute])) {
      this.filterAttributeValue = AttributeHelper.getAttributeValues(event.detail.attributes[this.filterAttribute].values)
    }
    this._loadLovEntities = true;
  }
  _getIdField() {
    let idField = "";
    if (this.relationshipGridConfig) {
      let addRelLovConfig = this.relationshipGridConfig.addRelLovConfig;
      if (addRelLovConfig) {
        idField = addRelLovConfig.idField;
      }
    }
    return idField;
  }
  _getImageIdField() {
    let imageIdField = "";
    if (this.relationshipGridConfig) {
      let addRelLovConfig = this.relationshipGridConfig.addRelLovConfig;
      if (addRelLovConfig && addRelLovConfig.imageIdField) {
        imageIdField = addRelLovConfig.imageIdField;
      }
    }
    return imageIdField;
  }
  _getTitlePattern() {
    let titlePattern = "";
    if (this.relationshipGridConfig) {
      let addRelLovConfig = this.relationshipGridConfig.addRelLovConfig;
      if (addRelLovConfig) {
        titlePattern = addRelLovConfig.titlePattern;
      }
    }
    return titlePattern;
  }
  _getSubTitlePattern() {
    let subTitlePattern = "";
    if (this.relationshipGridConfig) {
      let addRelLovConfig = this.relationshipGridConfig.addRelLovConfig;
      if (addRelLovConfig) {
        subTitlePattern = addRelLovConfig.subTitlePattern;
      }
    }
    return subTitlePattern;
  }
  _getSavedRelationshipItems(relationship, savedRelationships) {
    let savedRelationshipItems = [];
    let clonedSavedRelationshipItems = DataHelper.cloneObject(savedRelationships);
    if (clonedSavedRelationshipItems[relationship]) {
      savedRelationshipItems = clonedSavedRelationshipItems[relationship];
    }
    return savedRelationshipItems;
  }
  _onRefreshRelationshipGridEvent(e, detail) {
    this.fireBedrockEvent("refresh-entity-thumbnail", {}, { "ignoreId": true });
    let rel = detail.relationshipType;
    let grid = this.shadowRoot.querySelector("#" + rel);
    this._entityRelations = [];
    if (grid) grid.reRenderGrid();
  }
  //Download asset functions
  _onOriginalAssetDownloadAction(e, detail) {
    if (!this.getDownloadUrlLiq || !detail) return;

    let fileName = detail.property_objectkey;
    if (fileName) {
      let req = {
        "binaryStreamObject": {
          "id": fileName,
          "type": "binarystreamobject",
          "data": {}
        }
      };
      this.getDownloadUrlLiq.requestData = [req];
      this.getDownloadUrlLiq.generateRequest();
    }
  }
  _onGetDownloadUrlResponse(e) {
    LiquidResponseHelper.downloadURLResponseMapper(e, downloadURL => {
      window.open(downloadURL, "_blank");
    });
  }
  openGridMsgDialog(msg) {
    this.shadowRoot.querySelector('#msgDialog').innerText = msg;
    this.shadowRoot.querySelector('#gridMsgDialog').open();
  }
  _onDeleteEntityRelationshipAction(e, detail) {
    // deleting newly added record and reload reloadRelationshipLov.
    if (detail.isNewlyAddedDataRowDelete) {
      this._reloadRelationshipLov(detail.id);
      return;
    }
    this._modifiedEntityRelationship = { event: e, detail: detail, action: "delete" };
    this.openGridMsgDialog("Are you sure you want to delete?");
  }
  _onRelationsSaveResponse(e, detail) {
    let relGrid = this.shadowRoot.querySelector('rock-grid[id=' + this.relationship + ']');
    if (relGrid) {
      this._entityRelations = [];
      relGrid.reRenderGrid();
    }
  }

  _onRelationsSaveError(e, detail) {
    this._relationshipDeleteItems = {};
    this.logError("Unable to delete the entity relationship, contact administrator.", e.detail);
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
          if (DataHelper.isValidObjectPath(item, "_rowStatus.status") && item._rowStatus.status.toLowerCase() == "new") {
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
          let eDetail = { "selectedItems": savedRecords };
          this._modifiedEntityRelationship = { event: e, detail: eDetail, action: "bulk-delete" };
          this.openGridMsgDialog("Are you sure you want to delete?");
        }
      } else {
        this.showInformationToast("Select at least one relationship from grid to delete.");
      }
    }
  }
  _onRowDropEventRaised(e, detail) {
    let gridData = detail && detail.dragDropItems && detail.dragDropItems[0] ? detail.dragDropItems[0] : [];
    let item, updatedId, getOrderPosition, rockAttr;
    if (!_.isEmpty(gridData)) {
      if (DataHelper.isValidObjectPath(this.relationshipGridConfig, "gridConfig.itemConfig.fields")) {
        let columns = this.relationshipGridConfig.gridConfig.itemConfig.fields;
        let columnsList = DataHelper.convertObjectToArray(columns);
        if (columnsList) {
          for (let j = 0; j < columnsList.length; j++) {
            if (columnsList[j].name == "order") {
              getOrderPosition = j;
              break;
            }
          }
        }
      }
      if (getOrderPosition != undefined) {
        this._updateRelGridData(gridData, detail);
      }
    }
  }

  _updateRelGridData(data, detail) {
    let grid = this._getRelationshipGrid();
    let item, updatedId;
    if (grid) {
      for (let i = 0; i < data.length; i++) {
        item = data[i]
        updatedId = (i + 1).toString();
        if (item) {
          item["order"] = updatedId;
          grid.updateRowStatus(item, "update");
        }
      }
      grid.updateGridData(data, detail);
    }
  }
  _onBulkEdit(e, detail) {
    let grid = this._getRelationshipGrid();
    let selectedItems = grid.getSelectedItems();
    let selectionMode = grid.getSelectionMode();
    let selectionQuery = grid.getSelectedItemsAsQuery();
    if (!_.isEmpty(selectionQuery) && selectedItems && selectedItems.length && this.contextData) {
      selectionQuery.filters = {};
      let selectedItemTypes = selectedItems.map(item => item.type).filter((value, index, self) => self.indexOf(value) === index);
      selectionQuery.filters["typesCriterion"] = selectedItemTypes;

      let clonedContextData = DataHelper.cloneObject(this.contextData);
      clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [{ "type": selectedItemTypes[0] }];
      const sharedData = {
        "context-data": clonedContextData,
        "workflow-criterion": this.workflowCriterion,
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
          this.entityName
        ])
      }, sharedData);
    } else {
      this.showInformationToast("Select at least one entity from grid to edit.");
    }
  }

  _onBulkRelationshipEdit(e, detail) {
    let grid = this._getRelationshipGrid();
    let selectedItems = grid.getSelectedItems();
    let selectionMode = grid.getSelectionMode();
    let selectionQuery = grid.getSelectedItemsAsQuery();
    let currentRel = this.relationship;
    let originalEntity = this.dataObject[currentRel];
    selectionQuery.ids = [originalEntity.id];
    if (selectedItems && selectedItems.length && this.contextData) {
      let itemContexts = [];
      let typesCriterion = [];

      let itemContext = { "type": originalEntity.type };
      let relAndTypeAttributes = this._getAttributeList();
      let relAttributeNames = relAndTypeAttributes && relAndTypeAttributes.relationshipAttributes ? relAndTypeAttributes.relationshipAttributes : [];
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
        configName: 'wizardConfig',
        mergeTitle: true,
        "title": DataHelper.concatValuesFromArray([
          ContextHelper.getDataContexts(this.contextData),
          this.entityName
        ])
      }, sharedData);
    } else {
      this.showInformationToast("Select at least one entity from grid to edit.");
    }
  }
  _onGlobalEdit(e) {
    const relGrid = this.$$(`rock-grid`);

    relGrid.changeToEditMode();
  }
  _onCompositeModelGetResponse(e) {
    let itemContext = this.getFirstItemContext();
    if (e && e.detail && DataHelper.validateGetModelsResponse(e.detail.response)) {
      let compositeModel = e.detail.response.content.entityModels[0];
      if (compositeModel && compositeModel.data) {
        this._relationshipModels = DataTransformHelper.transformRelationshipModels(compositeModel, this.contextData);
        let relationshipModel = this._relationshipModels[this.relationship] && this._relationshipModels[this.relationship].length ? this._relationshipModels[this.relationship][0] : "";
        if (!_.isEmpty(relationshipModel) && DataHelper.isValidObjectPath(relationshipModel, 'properties.filterRules')) {
          this.filterRules = relationshipModel.properties.filterRules;
          if (!_.isEmpty(this.filterRules) && _.isEmpty(this.filterRules[0].filterByValues)) {
            this.filterAttribute = this.filterRules[0].filterByFromEntityAttribute;
            this._loadRelationshipEntities = true;
          } else {
            this._loadRelationshipEntities = true;
            this._loadLovEntities = true;
          }
        } else {
          this._loadRelationshipEntities = true;
          this._loadLovEntities = true;
        }
      }
    } else {
      this.logError("Composite get model request failed", e.detail);
    }
  }
  _hasContextCoalescedValue(item) {
    return !_.isEmpty(item.contextCoalescePaths);
  }
  _onAddNewRelClick(item) {

    const { relatedEntityTypes } = this.relationshipGridConfig;
    let contextData = DataHelper.cloneObject(this.contextData);
    //delete this.contextData.ItemContexts[0];
    contextData.ItemContexts[0] = { "type": relatedEntityTypes[0], "relationship": this.relationship };
    let domain;
    if(DataHelper.isValidObjectPath(this.contextData, "ItemContexts.0.domain") && !_.isEmpty(this.contextData.ItemContexts[0].domain)){
      domain = this.contextData.ItemContexts[0].domain;
    }
    else{
      domain = "";
    }
    const sharedData = {
      "context-data": contextData,
      "entity-domain": domain
    };
    let entityTypeManager=new EntityTypeManager()
    let relEntityExternalName = entityTypeManager.getTypeExternalNameById(relatedEntityTypes[0]);
    let title = DataHelper.concatValuesFromArray([
    relEntityExternalName ? `Add New ${relEntityExternalName}`: 'Add New Related Entity',
        ContextHelper.getDataContexts(this.contextData),
        this.entityName
      ]);
    this.openBusinessFunctionDialog({
      name: 'rock-wizard-entity-create',
      "title": title
    }, sharedData);
  }
  _onEntityCreated(e) {
    this._createRelationshipsDown(e.detail);
  }

  _createRelationshipsDown(createdEntity) {

    let upRelationshipRequests = [];
    let rel = {
      "direction": "both",
      "relationshipType": this.relationshipGridConfig.relationshipModel.properties.relationshipType,
      "relTo": {
        "id": createdEntity.id,
        "type": createdEntity.type
      }
    };

    let { id: id, type: type } = this.contextData.ItemContexts[0];
    let upRelationshipRequest = { id: id, type: type, "data": { "relationships": {} } }

    upRelationshipRequest.data.relationships[this.relationship] = [rel];
    upRelationshipRequests.push(upRelationshipRequest);

    this._saveRequest = {
      "entities": upRelationshipRequests
    };
    this._addClientStatus();
    this._saveEntity();
    let businessDialog = RUFUtilities.appCommon.shadowRoot.querySelector("rock-business-function-dialog");
    if (businessDialog) {
      let dialog = businessDialog.dialog;
      dialog.close();
    }

  }
  _addClientStatus() {
    let clientState = {};
    clientState.notificationInfo = {};
    clientState.notificationInfo.showNotificationToUser = true;
    this._saveRequest["clientState"] = clientState;
  }

  /**
   * Reload the relationshipLov.
   * {ids} ids used for filter
   */
  _reloadRelationshipLov(ids) {
    let relationshipLov = dom(this).node.shadowRoot.querySelector('rock-entity-lov[id=lov_' + this.relationship + ']');
    if (relationshipLov && relationshipLov.selectedItems) {
      let relationshipLovSelectedItems = relationshipLov.selectedItems;
      if (_.isArray(ids)) {
        ids.forEach(function (elValue) {
          let relationshipLovItem = DataHelper._findItemByKeyValue(relationshipLovSelectedItems, "id", elValue);
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
  _displayAddNewRelationship(relationshipGridConfig) {
    if (relationshipGridConfig && relationshipGridConfig.addNewRelationConfig) {
      if (this.domain && this.domain != "digitalAsset") {
        return true;
      }
    }
    return false;
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
            return { 'id': item.id, 'title': item.id, 'type': item.type };
          }
        });

        this._savedRelationshipItems[relationship] = savedRelationshipItems;
        relationshipLov.selectedItems = savedRelationshipItems;
      }        
    }
  }

  _onRelationshipLinkClicked(e) {
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
customElements.define(RockRelationshipGrid.is, RockRelationshipGrid)
