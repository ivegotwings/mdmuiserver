import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../bedrock-business-function-behavior/bedrock-component-business-function-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import EntityCompositeModelManager from '../bedrock-managers/entity-composite-model-manager.js';
import '../liquid-rest/liquid-rest.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import '../pebble-dropdown/pebble-dropdown.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-horizontal-divider/pebble-horizontal-divider.js';
import '../pebble-accordion/pebble-accordion.js';
import '../rock-grid/rock-grid.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockCompareEntities extends mixinBehaviors([
    RUFBehaviors.UIBehavior,
    RUFBehaviors.ComponentContextBehavior,
    RUFBehaviors.ComponentBusinessFunctionBehavior
], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-grid-layout bedrock-style-padding-margin">
            :host {
                display: block;
                height: 100%;
            }

            :host(.one-accordion) {
                height: 100%;
            }

            .pebble-dropdown-wrapper {
                display: flex;
                justify-content: flex-end;
            }

            .compare-container {
                position: relative;
                height: 100%;

                --pebble-grid-container: {
                    margin-left: 10px;
                    margin-right: 10px;
                }

                --pebble-grid-container-header: {
                    padding-right: 10px;
                    padding-left: 10px;
                }
                --height-compare: {
                    height: 49vh !important;
                }
            }

            .buttonContainer-top-right {
                text-align: right;
                padding-top: 10px;
                margin-bottom: 0px;
                margin-top: 0px;
            }
            .overflow-auto {
                overflow: auto;
            }
            #actionButton{
                width:20%;
            }
            .button-siblings{
                @apply --rock-snapshot-screen;
            }
        </style>
        <template is="dom-if" if="[[showActionButtons]]">
            <div id="content-actions" class="buttonContainer-top-right" align="center">
                <pebble-button class="action-button btn btn-secondary m-r-5" id="back" button-text="Change Data" raised on-tap="_onBackTap"></pebble-button>
                <template is="dom-if" if="[[_allowAction(compareEntitiesContext, 'discard')]]">
                    <pebble-button class="action-button btn btn-primary m-r-5" id="discard" button-text="Discard" raised on-tap="_onDiscardTap"></pebble-button>
                </template>
                <template is="dom-if" if="[[_allowAction(compareEntitiesContext, 'createReview')]]">
                    <pebble-button class="action-button btn btn-primary m-r-5" data-args="createReview" id="createReview" button-text="Send for Review" raised on-tap="_onCreateTap"></pebble-button>
                </template>
                <template is="dom-if" if="[[_allowAction(compareEntitiesContext, 'create', showCreateButton)]]">
                    <pebble-button class="action-button btn btn-success m-r-5" data-args="create" id="create" button-text="Create" raised on-tap="_onCreateTap"></pebble-button>
                </template>
                <template is="dom-if" if="[[_allowAction(compareEntitiesContext, 'merge', showMergeButton)]]">
                    <pebble-button class="action-button-focus dropdownText btn btn-success" id="merge" button-text="Merge" raised on-tap="_onMergeTap"></pebble-button>
                </template>
            </div>
        </template>
        <div class="base-grid-structure button-siblings">
            <div class="base-grid-structure-child-1">
                <div class="pebble-dropdown-wrapper">
                    <pebble-dropdown id="actionsButton" label="Filter By" selected-value="{{_selectedValue}}" items="[[_dropDownItems]]"></pebble-dropdown>
                </div>
            </div>

            <div class="base-grid-structure-child-2">
                <template is="dom-if" if="{{hasComponentErrored(isComponentErrored)}}">
                    <div id="error-container"></div>
                </template>

                <template is="dom-if" if="{{!hasComponentErrored(isComponentErrored)}}">

                    <!-- Attributes compare Accordian -->
                    <pebble-accordion header-text="Attributes" show-accordion="true">
                        <div class="compare-container" slot="accordion-content">
                            <div class="rock-compare-entities full-height">
                                <pebble-spinner active="[[_loading]]"></pebble-spinner>
                                <bedrock-pubsub event-name="pebble-actions-action-click" handler="_onActionItemTap" target-id=""></bedrock-pubsub>
                                <div class="full-height">
                                    <rock-grid id="compareRelationshipsGrid" data="{{_gridData}}" attribute-models="{{_attributeModels}}" config="{{_gridConfig}}" page-size="5" enable-column-select="[[enableColumnSelect]]" context-data="[[contextData]]" nested-attribute-message="{noOfValues} values" hide-view-selector="" hide-toolbar="" grid-item-view=""></rock-grid>
                                </div>
                            </div>
                        </div>
                    </pebble-accordion>

                    <!-- Relationship Compare Accordian -->
                    <template is="dom-if" if="[[_getRelationshipVisibilityStatus(enableRelationshipsCompare, enableRelationshipsMatchMerge)]]">
                        <pebble-accordion header-text="Relationships" show-accordion="true" is-collapsed="true">
                            <div class="compare-container" slot="accordion-content">
                                <div class="rock-compare-entities full-height">
                                    <pebble-spinner active="[[_loading]]"></pebble-spinner>
                                    <!-- <pebble-dropdown id="actionsButtonRelationships" label="Filter By" selected-value="{{_selectedValueRel}}" items="[[_dropDownItems]]"></pebble-dropdown> -->
                                    <bedrock-pubsub event-name="pebble-actions-action-click" handler="_onActionItemTap" target-id=""></bedrock-pubsub>
                                    <div class="full-height">
                                        <rock-grid id="compareEntitiesGrid" data="{{_gridDataRelationships}}" attribute-models="{{_relationshipModels}}" config="{{_gridConfigRelationships}}" page-size="5" context-data="[[contextData]]" nested-attribute-message="{noOfValues} Relationships" hide-view-selector="" hide-toolbar="" grid-item-view=""></rock-grid>
                                    </div>
                                </div>
                            </div>
                        </pebble-accordion>
                    </template>

        <pebble-dialog id="attributeDialog" dialog-title="Confirmation" modal="" medium="" vertical-offset="1" 50="" horizontal-align="auto" vertical-align="auto" no-cancel-on-outside-click="" no-cancel-on-esc-key="" show-ok="" show-cancel="" show-close-icon="" alert-box="">
            <div id="attrDialogContainer" class="overflow-auto" style="height:80vh"></div>
        </pebble-dialog>

    </template>
    <liquid-entity-data-get operation="getbyids" id="entityDataGet" request-data="{{_entityGetRequest}}" on-response="_onEntityDataGetSuccess" on-error="_onEntityDataGetFailure">
    </liquid-entity-data-get>
    <liquid-rest id="snapshotDataGet" url="/data/pass-through/snapshotManageService/get" method="POST" request-data="{{_snapshotGetRequest}}" on-liquid-response="_onEntityDataGetSuccess">
    </liquid-rest>
    <bedrock-pubsub event-name="refresh-grid" handler="_onRefreshGrid" target-id="compareEntitiesGrid"></bedrock-pubsub>
    <bedrock-pubsub event-name="refresh-grid" handler="_onRefreshGrid" target-id="compareRelationshipsGrid"></bedrock-pubsub>

    </div></div>
`;
  }

  static get is() {
      return 'rock-compare-entities';
  }
  static get properties() {
      return {
          compareEntitiesContext: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: "_onCompareEntitiesContextChange"
          },
          attributeNames: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          selectedEntities: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          entityTitle: {
              type: String,
              value: 'id'
          },
          frozenAttributes: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _entityGetRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          _liquidDataGetCompleted: {
              type: Boolean,
              value: false
          },
          _liquidDataSnapshotGetCompleted: {
              type: Boolean,
              value: false
          },
          _isLiquidDataGetInitiated: {
              type: Boolean,
              value: false
          },
          _applicableContext: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _isLiquidDataSnapshotGetInitiated: {
              type: Boolean,
              value: false
          },
          _combinedEntitySetForRender: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _snapshotGetRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _relationships: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _isRelationshipsPresent: {
              type: Boolean,
              value: false
          },
          _snapshotRollbackRequest: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _gridConfig: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _gridData: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _gridConfigRelationships: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _mergedCompositeModel: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _gridDataRelationships: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _rowsModel: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _rowsModelRelationships: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          isSnapshot: {
              type: Boolean,
              value: false
          },
          _entityTypes: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _modelGetTracker: {
              type: Number,
              value: 0
          },
          _entityModels: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _contexts: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _data: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          showCreateButton: {
              type: Boolean,
              value: true
          },
          showMergeButton: {
              type: Boolean,
              value: true
          },
          _dataRelationships: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _dropDownItems: {
              type: Array,
              value: [{
                  "value": "None",
                  "title": "None"
              },
              {
                  "value": "Has Values",
                  "title": "Has Values"
              },
              {
                  "value": "Has Partial Values",
                  "title": "Has Partial Values"
              },
              {
                  "value": "Has Same Values",
                  "title": "Has Same Values"
              },
              {
                  "value": "Is Empty",
                  "title": "Is Empty"
              },
              {
                  "value": "Has Different Values",
                  "title": "Has Different Values"
              }
              ]
          },
          _selectedValue: {
              type: String,
              value: 'None'
          },
          _loading: {
              type: Boolean,
              value: false
          },
          _attributeModels: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _relationshipModels: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          enableRelationshipsCompare: {
              type: Boolean,
              value: false
          },
          enableRelationshipsMatchMerge: {
              type: Boolean,
              value: false
          },
          showActionButtons: {
              type: Boolean,
              value: false
          },
          enableColumnSelect: {
              type: Boolean,
              value: false
          },
          selectedEntityId: {
              type: String,
              value: null
          },
          showAllAttributes: {
              type: Boolean,
              value: false
          }
      };
  }
  constructor() {
      super();
      this._onCompositeModelGetResponse = this._onCompositeModelGetResponse.bind(this);
      this.addEventListener('column-selection-changed', this._onColumnSelectionChanged);
  }
  connectedCallback() {
      super.connectedCallback();
      let pebbleDropDown = this.$$("#actionsButton");
      if (pebbleDropDown) {
          pebbleDropDown.addEventListener('change', this._onDropdownChange.bind(this));
      }
      if (_.isEmpty(this.compareEntitiesContext)) {
          this._triggerCompareEntitiesContextChange();
      }
  }
  _onCompareEntitiesContextChange() {
      if (!_.isEmpty(this.compareEntitiesContext)) {
          this._combinedEntitySetForRender = [];
          this._entityModels = [];
          this._triggerCompareEntitiesContextChange(false); //Not from session
      }
  }
  _triggerCompareEntitiesContextChange(fromSession = true) {
      this._prepareContext(fromSession);
      this._attributeModelGet();
  }
  async _attributeModelGet() {
      if (this._contextData) {
          this._loading = true;
          this._modelGetTracker = this._entityTypes.length;
          if (this._entityTypes && this._entityTypes.length) {
              let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(this._contextData);
              if (this._getRelationshipVisibilityStatus()) {
                  compositeModelGetRequest.params.fields.relationships = ["_ALL"];
              }
              if (this.showAllAttributes) {
                  compositeModelGetRequest.params.fields.attributes = ["_ALL"];
              }
              for(let index=0; index<this._entityTypes.length; index++) {
                  if(DataHelper.isValidObjectPath(compositeModelGetRequest, 'params.query.name')) {
                      compositeModelGetRequest.params.query.name = [this._entityTypes[index]]
                  }
                      if(compositeModelGetRequest) {
                          let compositeModel = await this._getCompositeModel(compositeModelGetRequest);
                          this._onCompositeModelGetResponse(compositeModel);
                      }
              }
          }
      }
  }

  async _getCompositeModel(compositeModelGetRequest) {
      let compositeModel = {};
      let entityCompositeModelManager = new EntityCompositeModelManager();
      if(entityCompositeModelManager && compositeModelGetRequest) {
          compositeModelGetRequest.applyEnhancerCoalesce = true;
          // replacing name with current entity type as multiple entity types in name are not supported
          compositeModel = await entityCompositeModelManager.get(compositeModelGetRequest, this.contextData);
      }
      entityCompositeModelManager = null;
      return compositeModel;
  }

  _onCompositeModelGetResponse(compositeModel) {
      let rows = [];
      let rowsRelationships = [];
      let entityModel = compositeModel;
      if (entityModel) {
          this._entityModels.push(entityModel);
          if (!this.isSnapshot) {
              // to get value of attribute tagged with "isExternalName" flag to show as entity title
              let entityTitle = DataHelper.getExternalNameAttributeFromModel(entityModel);
              if (entityTitle) {
                  this.set("entityTitle", entityTitle);
              }
          }

      }
      this._modelGetTracker--;
      if (this._modelGetTracker == 0) {
          this._sortModels(this._entityModels);
          this._prepareGridRowsModel(this._entityModels, rows, rowsRelationships);
          this._rowsModel = rows;
          this._rowsModelRelationships = rowsRelationships;
          this._dataGet();
      }
  }

  _sortModels(models) {
      if (_.isEmpty(models)) {
          return;
      }
      let firstItemContext = ContextHelper.getFirstItemContext(this.contextData);
      if (firstItemContext && firstItemContext.attributeNames) {
          models.forEach(model => {
              if (!_.isEmpty(model.data.attributes)) {
                  for (let attrKey in model.data.attributes) {
                      if (firstItemContext.attributeNames.indexOf(attrKey) != -1) {
                          model.data.attributes[attrKey].properties["rank"] = 1;
                      } else {
                          model.data.attributes[attrKey].properties["rank"] = 2;
                      }
                  }
              }
          })
      }
      models.forEach(model => {
          model.data.attributes = DataHelper.sortObject(model.data.attributes, ["properties.rank", "properties.groupName"]);
      })
  }

  _pushDataInRowModel(key, frozenRowModels, normalRowModels, gridModelData, gridType) {
      let gridModelDataOriginal = gridModelData;
      if(gridType === 'relationship') {
          gridModelData = gridModelData[0];
      }
      if (this.frozenAttributes.indexOf(key) >= 0) {
          frozenRowModels.push({
              "header": gridModelData.properties.externalName,
              "name": key,
              "isFrozen": true,
              "dataType": gridModelData.properties.dataType,
              "displayType": gridModelData.properties.displayType
          });
          if(gridType === 'relationship') {
              this._relationshipModels[key] = gridModelDataOriginal;
          } else {
              this._attributeModels[key] = gridModelDataOriginal;
          }
      } else {
          normalRowModels.push({
              "header": gridModelData.properties.externalName,
              "name": key,
              "dataType": gridModelData.properties.dataType,
              "displayType": gridModelData.properties.displayType
          });
          if(gridType === 'relationship') {
              this._relationshipModels[key] = gridModelDataOriginal;
              normalRowModels[normalRowModels.length-1]["isRelationship"] = true;
          } else {
              this._attributeModels[key] = gridModelDataOriginal;
          }
      }
      return {formattedFrozenRowModels: frozenRowModels, formattedFormalRowModels: normalRowModels}
  }
  _prepareGridRowsModel(entityModels, rows, rowsRelationships) {
      let frozenRowModels = [];
      let normalRowModels = [];

      let frozenRowModelsRelationshipGrid = [];
      let normalRowModelsRelationshipGrid = [];
      entityModels.forEach(function (entityModel) {
          if (entityModel && entityModel.data && entityModel.data.attributes) {
              let attributes = DataHelper.isValidObjectPath(entityModel,
                  'data.contexts.0.attributes') ? entityModel.data.contexts[0].attributes :
                  entityModel.data.attributes;
              //relationships model
              this._isRelationshipsPresent = DataHelper.isValidObjectPath(entityModel, 'data.relationships') && !_.isEmpty(entityModel.data.relationships);

              let relationships = undefined;

              if (this._isRelationshipsPresent) {
                  relationships = DataHelper.isValidObjectPath(entityModel, 'data.contexts.0.relationships') ? entityModel.data.contexts[0].relationships : entityModel.data.relationships;
              }

              //looping through attributes to form attribute Model for row
              Object.keys(attributes).forEach(function (key, index) {
                  if (attributes[key]) {
                      let attribute = attributes[key];
                      let grid = 'attributes';
                      this._pushDataInRowModel(key, frozenRowModels, normalRowModels, attribute, grid);
                  }
              }, this);

              //looping over relationships
              if (this._isRelationshipsPresent) {
                  Object.keys(relationships).forEach(function (key, index) {
                      //Second condition is to skip the where-used scenario...will be handled in future
                      if (relationships[key] && relationships[key][0].properties.relationshipOwnership ==
                          'owned') {
                          let relationship = relationships[key];
                          if (relationship.length > 0) {
                              let grid = 'relationship';
                              this._pushDataInRowModel(key, frozenRowModelsRelationshipGrid, normalRowModelsRelationshipGrid, relationship, grid);
                          }
                      }
                  }, this);
              }

          }
      }, this);

      //attributes
      normalRowModels = _.uniq(normalRowModels, false, (model)=>model.name);
      frozenRowModels = _.uniq(frozenRowModels, false, (model)=>model.name);
      frozenRowModels.forEach(function (rowModel) {
          rows.push(rowModel);
      }, this);
      normalRowModels.forEach(function (rowModel) {
          rows.push(rowModel);
      }, this);

      //relationships
      normalRowModelsRelationshipGrid = _.uniq(normalRowModelsRelationshipGrid, false, (model)=>model.name);
      frozenRowModelsRelationshipGrid = _.uniq(frozenRowModelsRelationshipGrid, false, (model)=>model.name);
      frozenRowModelsRelationshipGrid.forEach(function (rowModel) {
          rowsRelationships.push(rowModel);
      }, this);
      normalRowModelsRelationshipGrid.forEach(function (rowModel) {
          rowsRelationships.push(rowModel);
      }, this);

  }
  _rowNameExist(rowName, rows) {
      let existingRows = [];
      if (rowName && rows && rows.length) {
          existingRows = rows.filter(function (row) {
              return row.name == rowName
          });
      }
      if (existingRows) {
          if (existingRows.length) {
              return true;
          } else {
              return false;
          }
      } else {
          return false;
      }
  }

  async _onEntityDataGetSuccess(e) {
      let columns = [];
      let items = [];

      let columnsRelationships = [];
      let itemsRelationships = [];
      if (e.detail.response.hasOwnProperty("response")) {
          this.entities = e.detail.response.response.entities;
          this._liquidDataSnapshotGetCompleted = true;
      } else {
          this.entities = e.detail.response.content.entities;
          this._liquidDataGetCompleted = true;
      }
      let allowPrepareGrid = false;
      if (this._isLiquidDataGetInitiated && this._isLiquidDataSnapshotGetInitiated) {
          if (!this._liquidDataGetCompleted || !this._liquidDataSnapshotGetCompleted) {
              allowPrepareGrid = false;
          } else {
              allowPrepareGrid = true;
          }
      } else {
          allowPrepareGrid = true;
      }
      this._mergeCompositeModels();
      if(!_.isEmpty(this._mergedCompositeModel) && !_.isEmpty(this._mergedCompositeModel.transformedAttributeModels)){
          this.entities.forEach(entity =>{
              DataTransformHelper.transformAttributes(entity,this._mergedCompositeModel.transformedAttributeModels,this.contextData,"array",false)
          })
      }
      let ent = this.entities;
      this._combinedEntitySetForRender.push(...ent);
      this.entities = this._combinedEntitySetForRender;
      if (this.entities && this.entities.length && allowPrepareGrid) {
          await this._prepareGridColumnsModelAndData(this.entities, columns, items);
          if (this._isRelationshipsPresent) {
              await this._prepareGridColumnsModelAndDataRelationshipGrid(this.entities,
                  columnsRelationships, itemsRelationships);
          }
      }
      //attributes grid
      let gridConfig = this._getBaseGridConfig();
      gridConfig.itemConfig.fields = _.extend({}, columns);
      gridConfig.itemConfig.rows = this._rowsModel;
      this._gridConfig = this._getConfigWithUpdatedTitle(gridConfig, this.entities);
      this._gridData = this._data = items;

      //relationship grid _rowsModelRelationships
      let gridConfigRelationships = this._getBaseGridConfig();
      gridConfigRelationships.itemConfig.fields = _.extend({}, columnsRelationships);
      gridConfigRelationships.itemConfig.rows = this._rowsModelRelationships;
      this._gridConfigRelationships = this._getConfigWithUpdatedTitle(gridConfigRelationships, this.entities);
      this._gridDataRelationships = this._dataRelationships = itemsRelationships;

      if (allowPrepareGrid) {
          this._loading = false;
      }
  }
  _getRelationshipVisibilityStatus() {
      if (this.enableRelationshipsCompare || this.enableRelationshipsMatchMerge) {
          return true;
      }
      return false;
  }
  _getConfigWithUpdatedTitle(gridConfig, entities) {
      if (!_.isEmpty(this.compareEntitiesContext) && this.compareEntitiesContext.matchConfig) {
          let title = this.compareEntitiesContext.matchConfig["compare-title"];
          if (title) {
              title = title.replace("{noOfEntities}", entities.length - 1);
              if (entities && entities.length == 0) {
                  title = "No details available for matched entities.";
                  this.showCreateButton = false;
                  this.showMergeButton = false;
              } else {
                  title = title.replace("{noOfEntities}", entities.length - 1);
              }
              gridConfig.titleTemplates.compareEntitiesTitle = title;
              gridConfig.titleTemplates.compareEntitiesTitle = title;
          }
      }
      return gridConfig;
  }

  snapshotTransformAttributes(entity, attributeModels, contextData, outputSchema, applySort) {
      let firstDataContext = ContextHelper.getFirstDataContext(contextData);
      let firstValueContext = ContextHelper.getFirstValueContext(contextData);
      let firstItemContext = ContextHelper.getFirstItemContext(contextData);

      let sortedAttributeModels = attributeModels;
      if (applySort) {
          sortedAttributeModels = DataTransformHelper.sortAttributeModels(attributeModels);
      }

      let transformedAttributeModels = DataTransformHelper.transformAttributes(entity, sortedAttributeModels, this.contextData);

      let outputData = undefined;

      if (outputSchema == "array") {
          //manage returns output as array...instead of keyed attributes
          outputData = _.map(transformedAttributeModels , function (value, index) {
              return value;
          });
      } else {
          outputData = transformedAttributeModels;
      }

      return outputData;
  }

  async snapshotTransformRelationships(entity, relationshipModels, contextData, outputSchema, applySort) {
      let firstDataContext = ContextHelper.getFirstDataContext(contextData);
      let firstValueContext = ContextHelper.getFirstValueContext(contextData);

      let mergedRelationships = {};

      let sortedAttributeModels = relationshipModels;
      if (applySort) {
          sortedAttributeModels = DataTransformHelper.sortAttributeModels(relationshipModels);
      }

      //second condition added to check for a normal entity.
      if (firstDataContext) {
          let dataContexts = ContextHelper.getDataContexts(contextData);

          for (let dataContext of dataContexts) {
              if (dataContext) {
                  let ctxRelationships = SharedUtils.DataObjectFalcorUtil.getRelationshipsByCtx(
                      entity, dataContext);

                  if (mergedRelationships && !_.isEmpty(ctxRelationships)) {
                      Object.keys(ctxRelationships).forEach((relName) => {
                          if (!_.isEmpty(ctxRelationships[relName])) {
                              if (!_.isEmpty(mergedRelationships[relName])) {
                                  mergedRelationships[relName] = [...mergedRelationships[
                                      relName], ...ctxRelationships[relName]];
                              } else {
                                  mergedRelationships[relName] = ctxRelationships[relName];
                              }

                          }
                      });
                  }
              }
          }

      } else {
          //taking self
          mergedRelationships = entity.data.relationships;
      }
      let outputData = undefined;

      if (outputSchema == "array") {
          //manage returns output as array...instead of keyed attributes
          outputData = _.map(mergedRelationships, function (value, index) {
              return value;
          });
      } else {
          outputData = mergedRelationships;
      }

      return outputData;
  }

  //relationships grid column prepare
  async _prepareGridColumnsModelAndDataRelationshipGrid(entities, columnRelationships, itemsRelationships) {
      if (this._rowsModelRelationships) {
          let rowHeader = {
              "header": "",
              "name": "Relationships",
              "sortable": false,
              "filterable": true,
              "filterBy": "Relationships",
              "readFrom": "properties",
              "isRowHeader": true,
              "visible": true
          }
          columnRelationships.push(rowHeader);
          let compositeModel = {
              "data": {
                  "relationships": this._relationshipModels
              }
          };
          // var transformedRelModels = DataTransformHelper.transformRelationshipAttributeModels(relationshipModels, this._contextData);
          //Add column for new entity - if compare triggered from entity create.
          // if (!_.isEmpty(this.compareEntitiesContext) && this.compareEntitiesContext.newEntity) {
          //     entities.unshift(this.compareEntitiesContext.newEntity);
          // }
          for (let i = 0; i < this._rowsModelRelationships.length; i++) {
              let item = {};
              let nonSortedColumns = [];
              let row = this._rowsModelRelationships[i];
              for (let entity of entities) {
                  let entityHeader = this._getEntityHeader(entity);
                  if (i == 0) {
                      let colDetails = {
                          "header": this._updateEntityHeader(entity.id, entityHeader),
                          "name": entity.id,
                          "sortable": false,
                          "filterable": false,
                          "readFrom": "properties",
                          "visible": true,
                          "type": entity.type,
                          "version": this._getSnapshotMetadata(entity).snapVersion
                      }
                      nonSortedColumns.push(colDetails);
                  }
                  let relationships;
                  if(DataHelper.isValidObjectPath(this._mergedCompositeModel, 'transformedRelationshipModels')) {
                      relationships = await this.snapshotTransformRelationships(entity,
                      this._mergedCompositeModel.transformedRelationshipModels, this._contextData);
                  }
                  if (relationships && relationships[row.name]) {
                      item[entity.id] = relationships[row.name];
                  } else {
                      item[entity.id] = "";
                  }
                  relationships = [];
              }

              if (!_.isEmpty(nonSortedColumns)) {
                  nonSortedColumns = nonSortedColumns.sort(function (a, b) {
                      return b.version - a.version;
                  });
                  let currentEnt = nonSortedColumns[nonSortedColumns.length - 1];
                  if (currentEnt.type && currentEnt.type.indexOf('snapshot') == -1) {
                      currentEnt = nonSortedColumns.pop();
                      nonSortedColumns.unshift(currentEnt);
                  }
                  columnRelationships.push(...nonSortedColumns);
              }

              let isEmptyRec = false;
              let hasPartialValues = false;
              let hasValues = false;
              let sameValues = false;
              let diffValues = false;

              //using itemFilter as an intermediate thing to set the correct filter values.
              let itemFilter = DataHelper.cloneObject(item);
              for (let prop in itemFilter) {
                  itemFilter[prop] = itemFilter[prop].length + " Relationships";
              }

              Object.keys(itemFilter).forEach(function (key) {
                  if (!hasPartialValues) {
                      if (_.isEmpty(itemFilter[key])) {
                          if (hasValues) {
                              hasPartialValues = true;
                              hasValues = false;
                          } else {
                              isEmptyRec = true;
                          }
                      } else {
                          if (isEmptyRec) {
                              hasPartialValues = true;
                              isEmptyRec = false;
                          } else {
                              hasValues = true;
                          }
                      }
                  }
              }, this);
              if (hasValues) {
                  let uniqueValues = _.uniq(_.values(itemFilter));
                  if (uniqueValues && uniqueValues.length == 1) {
                      sameValues = true;
                  } else {
                      diffValues = true;
                  }
              }

              //adding nested flag to relationship Item
              if (row.hasOwnProperty('isRelationship')) {
                  item.isRelationshipType = true;
              }

              //adding snapshot flag
              item.isSnapshot = this.isSnapshot;
              item["Relationships"] = row.header;
              item["attributeName"] = row.name;
              item["isEmpty"] = isEmptyRec;
              item["hasPartialValues"] = hasPartialValues;
              item["hasValues"] = hasValues;
              item["sameValues"] = sameValues;
              item["diffValues"] = diffValues;
              item.relationshipModel = this._relationshipModels;
              itemsRelationships.push(item);
          }
      }
  }

  //attributes grid column prepare
  async _prepareGridColumnsModelAndData(entities, columns, items) {
      if (this._rowsModel) {
          let matchConfig = (this.compareEntitiesContext || {}).matchConfig;
          let isMergeEnabled = matchConfig && matchConfig.matchMerge && matchConfig.matchMerge.canMerge;
          let rowHeader = {
              "header": "",
              "name": "Attributes",
              "sortable": false,
              "filterable": true,
              "filterBy": "Attributes",
              "readFrom": "properties",
              "isRowHeader": true,
              "visible": true
          }
          //Normal Scenario
          if (this.enableColumnSelect) {
              rowHeader["selectable"] = {
                  "isAction": false,
                  "text": this.isSnapshot ? "Select for rollback" : "Select for merge"
              }
          }
          columns.push(rowHeader);

          //Add column for new entity - if compare triggered from entity create
          if (!_.isEmpty(this.compareEntitiesContext) && this.compareEntitiesContext.newEntity) {
              entities.unshift(this.compareEntitiesContext.newEntity);
          }

          for (let i = 0; i < this._rowsModel.length; i++) {
              let item = {};
              let nonSortedColumns = [];
              let row = this._rowsModel[i];
              let currAttrDataType = undefined;
              let currAttrDisplayType = undefined;
              for (let entity of entities) {
                  let entityHeader = this._getEntityHeader(entity);
                  if (i == 0) {
                      let colDetails = {
                          "header": this._updateEntityHeader(entity.id, entityHeader),
                          "name": entity.id,
                          "sortable": false,
                          "filterable": false,
                          "readFrom": "properties",
                          "visible": true,
                          "type": entity.type,
                          "version": this._getSnapshotMetadata(entity).snapVersion,
                          "link": this._getLink(entity.id, `entity-manage?id=${entity.id}&type=${entity.type}`)
                      }
                      if (!_.isEmpty(this.compareEntitiesContext)) {
                          let disable;
                          if (this.enableColumnSelect) {
                              disable = this.contextData.ItemContexts[0].id == entity.id;
                          } else if (this.compareEntitiesContext.newEntity) {
                              disable = this.compareEntitiesContext.newEntity.id == entity.id;
                          }

                          if (typeof disable == "boolean") {
                              colDetails["selectable"] = {
                                  "isAction": true,
                                  "disable": disable || !isMergeEnabled
                              };
                          }
                      }
                      nonSortedColumns.push(colDetails);
                  }
                  let attributes = await this.snapshotTransformAttributes(entity, this._mergedCompositeModel.transformedAttributeModels, this._contextData);
                  let _isAttributeMapped = false;
                  this._entityModels.forEach(function (currentModel) {
                      let attrs = (DataHelper.isValidObjectPath(currentModel, 'data.contexts.0.attributes')) ? currentModel.data.contexts[0].attributes : currentModel.data.attributes;
                      if (attrs[row.name]) {
                          _isAttributeMapped = true;
                      }
                  }, this);
                  
                  currAttrDataType = row.dataType;
                  currAttrDisplayType = row.displayType;
                  if(currAttrDisplayType === "richtexteditor") {
                      let el = document.createElement( 'p' );
                      el.innerHTML = attributes[row.name].value
                      attributes[row.name].value = el.innerText;
                  }
                  if (!_isAttributeMapped) {
                      item[entity.id] = "NA";
                  } else if (currAttrDataType == "datetime" || currAttrDataType == "date") {
                      item[entity.id] = FormatHelper.convertFromISODateTime(this._getAttributeValue(attributes[row.name]), currAttrDataType);
                  } else if (attributes && attributes[row.name]) {
                      item[entity.id] = this._getAttributeValue(attributes[row.name]);
                  } else {
                      item[entity.id] = "";
                  }
              }

              if (!_.isEmpty(nonSortedColumns)) {
                  nonSortedColumns = nonSortedColumns.sort(function (a, b) {
                      return b.version - a.version;
                  });
                  let currentEnt = nonSortedColumns[nonSortedColumns.length - 1];
                  if (this.isSnapshot && currentEnt.type && currentEnt.type.indexOf('snapshot') == -1) {
                      currentEnt = nonSortedColumns.pop();
                      nonSortedColumns.unshift(currentEnt);
                  }

                  columns.push(...nonSortedColumns);
              }

              let isEmpty = false;
              let hasPartialValues = false;
              let hasValues = false;
              let sameValues = false;
              let diffValues = false;

              if (currAttrDataType == "nested") {
                  let itemFilter = DataHelper.cloneObject(item);
                  for (let prop in itemFilter) {
                      itemFilter[prop] = itemFilter[prop].length + " values";
                  }

                  //setting filter values for nested attrs
                  Object.keys(itemFilter).forEach(function (key) {
                      if (!hasPartialValues) {
                          if (_.isEmpty(itemFilter[key])) {
                              if (hasValues) {
                                  hasPartialValues = true;
                                  hasValues = false;
                              } else {
                                  isEmpty = true;
                              }
                          } else {
                              if (isEmpty) {
                                  hasPartialValues = true;
                                  isEmpty = false;
                              } else {
                                  hasValues = true;
                              }
                          }
                      }
                  }, this);
                  if (hasValues) {
                      let uniqueValues = _.uniq(_.values(itemFilter));
                      if (uniqueValues && uniqueValues.length == 1) {
                          sameValues = true;
                      } else {
                          diffValues = true;
                      }
                  }
              } else {
                  let isNumber = false;
                  let isBoolean = false;
                  //setting filter values for other attrs.
                  Object.keys(item).forEach(function (key) {

                      //checking for prmitive types which _isEmpty cannot check 
                      if (item[key]) {
                          if (typeof item[key] == 'number') {
                              item[key] = item[key] + "";
                              isNumber = true;
                          }
                          if (typeof item[key] == 'boolean') {
                              item[key] = item[key] + "";
                              isBoolean = true;
                          }
                      }
                      if(item[key] === ConstantHelper.NULL_VALUE){
                          item[key] = "";
                      }
                      if (!hasPartialValues) {
                          if (_.isEmpty(item[key])) {
                              if (hasValues) {
                                  hasPartialValues = true;
                                  hasValues = false;
                              } else {
                                  isEmpty = true;
                              }
                          } else {
                              if (isEmpty) {
                                  hasPartialValues = true;
                                  isEmpty = false;
                              } else {
                                  hasValues = true;
                              }
                          }
                      }
                  }, this);

                  if (hasValues) {
                      //comparison of collection type attributes
                      if (Array.isArray(item[Object.keys(item)[0]])) {
                          let spreadItems = _.values(item);
                          let areAllArraysEqual = _.isEqual(...spreadItems);
                          sameValues = areAllArraysEqual;
                          diffValues = !sameValues;
                      } else {
                          let uniqueValues = _.uniq(_.values(item));
                          if (uniqueValues && uniqueValues.length == 1) {
                              sameValues = true;
                          } else {
                              diffValues = true;
                          }
                      }

                      //replacing original values once filtering flags are computed
                      Object.keys(item).forEach(key => {
                          if (isNumber && !_.isEmpty(item[key])) {
                              item[key] = parseFloat(item[key]).toFixed(2);
                          }
                          if (isBoolean && !_.isEmpty(item[key])) {
                              item[key] = item[key] == 'true';
                          }

                      });
                      isNumber = false;
                      isBoolean = false;
                  }
              }

              item["Attributes"] = row.header;
              item["attributeName"] = row.name;
              item["isEmpty"] = isEmpty;
              item["hasPartialValues"] = hasPartialValues;
              item["hasValues"] = hasValues;
              item["sameValues"] = sameValues;
              item["diffValues"] = diffValues;
              items.push(item);
          }
      }
  }

  _mergeCompositeModels () {
      let firstDataContext = ContextHelper.getFirstDataContext(this.contextData);
      let transformedRelModels;
      let transformedAttrModels;
      if (!_.isEmpty(this._entityModels)) {
      //merging attribute Models from different entity types
      let mergedAttributesFromModels;
      let mergedRelationshipsFromModels;
      let mergedCompositeModel = DataHelper.cloneObject(this._entityModels[0]);

      if(firstDataContext && 
         DataHelper.isValidObjectPath(mergedCompositeModel, 'data.contexts.0.attributes') && 
         DataHelper.isValidObjectPath(mergedCompositeModel, 'data.contexts.0.relationships')) {
          mergedCompositeModel.data.contexts[0].attributes = this._attributeModels;
          mergedCompositeModel.data.contexts[0].relationships = this._relationshipModels;
      } else {
      mergedCompositeModel.data.attributes = this._attributeModels;
      mergedCompositeModel.data.relationships = this._relationshipModels;
      }
      mergedCompositeModel.id = "";
      mergedCompositeModel.type = "";
      transformedAttrModels = DataTransformHelper.transformAttributeModels(mergedCompositeModel, this._contextData);
      transformedRelModels = DataTransformHelper.transformRelationshipModels(mergedCompositeModel, this._contextData);

      //set attr models with transformed models
      if (!_.isEmpty(transformedAttrModels)) {
          this._attributeModels = transformedAttrModels;
      }
      //set rel models with transformed models
      if (!_.isEmpty(transformedRelModels)) {
          this._relationshipModels = transformedRelModels
      }

      this.set('_mergedCompositeModel', { transformedAttributeModels: transformedAttrModels,
       transformedRelationshipModels: transformedRelModels});
      }
  }
  _getSnapshotMetadata(entity) {
      let snapData = {};
      if (entity && entity.type && entity.type.indexOf("_snapshot") !== -1) {

          let contextArr = entity.data.contexts;
          for (let contextIndex = 0; contextIndex < contextArr.length; contextIndex++) {
              let currContext = contextArr[contextIndex];
              if (currContext.context && currContext.context.hasOwnProperty('snapshot')) {

                  //Snap Label
                  if (DataHelper.isValidObjectPath(currContext, 'attributes.snapshotLabel.values')) {
                      let value = currContext.attributes.snapshotLabel.values[0];
                      if (value.hasOwnProperty('value')) {
                          snapData.snapLabel = value.value;
                      }
                  }

                  //Snap version
                  if (DataHelper.isValidObjectPath(currContext, 'attributes.version.values')) {
                      let value = currContext.attributes.version.values[0];
                      if (value.hasOwnProperty('value')) {
                          snapData.snapVersion = parseInt(value.value);
                      }
                  }
              }
          }
      } else {
          snapData.snapVersion = 0;
      }
      return snapData;
  }

  _getAttributeValue(attribute) {
      if (attribute && !_.isEmpty(attribute.value) &&
          this._attributeModels &&
          this._attributeModels[attribute.name] &&
          this._attributeModels[attribute.name].dataType == "nested") {
          if (this._attributeModels[attribute.name].group && this._attributeModels[
              attribute.name].group.length > 0) {
              for (let nestedIdx = 0; nestedIdx < attribute.value.length; nestedIdx++) {
                  for (let key in this._attributeModels[attribute.name].group[0]) {
                      let value = attribute.value[nestedIdx][key]
                      if (value.referenceDataId && value.referenceEntityType) {
                          let referenceData = value.referenceEntityType + "/" + value.referenceDataId;
                          value.properties = value.properties || {};
                          value.properties["referenceData"] = referenceData;
                          delete value.referenceDataId;
                          delete value.referenceEntityType;
                      }
                      attribute.value[nestedIdx][key] = {
                          "values": [value]
                      }
                  }
              }
          }
      }
      return attribute ? attribute.value : "";
  }
  _onEntityDataGetFailure(e) {
      this._loading = false;
      let reason = e.detail.response.reason;
      this.logError("Entity get failed due to following reason: ", reason);
  }
  _getEntitySnapshotRequest() {
      let contextData = DataHelper.cloneObject(this.contextData);
      let req = DataRequestHelper.createEntityGetRequest(contextData)

      req.params.fields.attributes = ["_ALL"]
      return req;
  }

  _dataGet() {
      if (this._contextData) {
          let onlySnapshotsSelected = true;
          let firstItemContext = this._contextData[ContextHelper.CONTEXT_TYPE_ITEM] &&
              this._contextData[ContextHelper.CONTEXT_TYPE_ITEM].length ? this._contextData[
              ContextHelper.CONTEXT_TYPE_ITEM][0] : undefined;
          if (firstItemContext) {
              firstItemContext.type = this._entityTypes;
          }
          let req = DataRequestHelper.createEntityGetRequest(this._contextData);
          DataRequestHelper.addDefaultContext(req);
          this._contexts = ContextHelper.getDataContexts(this.contextData);

          //adding params to get relationship related data
          req.params.fields.relationships = ["_ALL"];

          let liquidDataSnapshotGet = undefined;
          let reqSnapshot = undefined;

          if (this.isSnapshot) {
              let reqEntity = DataHelper.cloneObject(req);
              reqSnapshot = DataHelper.cloneObject(req);
              liquidDataSnapshotGet = this.shadowRoot.querySelector("#snapshotDataGet");
              req.params.query.ids.forEach((element, index) => {
                  if (element.hasOwnProperty("notSnapshot")) {
                      reqEntity.params.query.ids = reqSnapshot.params.query.ids.splice(
                          index, 1);
                      reqEntity.params.query.ids = [reqEntity.params.query.ids[0]
                          .id
                      ];
                      req.params.query.ids[index] = req.params.query.ids[index].id;
                      onlySnapshotsSelected = false;
                  }
              });
              reqSnapshot.params.query.filters.typesCriterion[0] = reqSnapshot.params.query
                  .filters.typesCriterion[0] + "_snapshot";
              reqSnapshot.params.fields.attributes = ["_ALL"];
              reqEntity.params.fields.attributes = ["_ALL"];

              //adding custom context 
              reqEntity.params.query.contexts = this._contexts;
              this.set("_snapshotGetRequest", reqSnapshot);
              this.set("_entityGetRequest", reqEntity);
          } else {
              this.set("_entityGetRequest", req);
          }

          let liquidDataGet = this.shadowRoot.querySelector("#entityDataGet");

          //Call segregation for snapshot scenario
          if (this.isSnapshot) {
              if (liquidDataGet && !onlySnapshotsSelected) {
                  liquidDataGet.generateRequest();
                  this._isLiquidDataGetInitiated = true;
              }

              if (liquidDataSnapshotGet && (reqSnapshot.params.query.id || reqSnapshot.params.query.ids)) {
                  liquidDataSnapshotGet.generateRequest();
                  this._isLiquidDataSnapshotGetInitiated = true;
              }
          } else {
              liquidDataGet.generateRequest();
          }
      }
  }
  _getBaseGridConfig() {
      return {
          "viewMode": "Tabular",
          "readOnly": true,
          "schemaType": "colModel",
          "itemConfig": {
              "settings": {
                  "isMultiSelect": false,
                  "disableSelectAll": true
              },
              "fields": [],
              "rows": []
          },
          "viewConfig": {
              "tabular": {
                  "visible": true
              }
          },
          "titleTemplates": {
              "compareEntitiesTitle": "Comparing {noOfEntities} entities for {noOfAttributes} attributes."
          },
          "toolbarConfig": {
              "buttonItems": [{
                  "buttons": [{
                      "name": "pageRange",
                      "icon": "",
                      "text": "0 - 0 / 0",
                      "visible": false,
                      "tooltip": "Page Range"
                  },
                  {
                      "name": "refresh",
                      "icon": "pebble-icon:refresh",
                      "text": "",
                      "visible": true,
                      "tooltip": "Refresh"
                  }
                  ]
              }]
          }
      };
  }
  _prepareContext(fromSession = true) {
      let compareEntitiesContext = {};
      if (fromSession) {
          let contextId = DataHelper.getParamValue('compareEntitiesContextId');
          compareEntitiesContext = JSON.parse(sessionStorage.getItem(contextId));
      } else {
          compareEntitiesContext = this.compareEntitiesContext;
      }
      if (compareEntitiesContext) {
          let clonedContext = {};
          let entityIds = compareEntitiesContext["entityIds"];
          let entityTypes = this._entityTypes = compareEntitiesContext["entityTypes"];
          this.contextData = compareEntitiesContext["contextData"];
          if (this.contextData) {
              let itemContext = {
                  'id': entityIds,
                  'type': entityTypes,
                  'attributeNames': this.attributeNames && this.attributeNames.length >
                      0 ? this.attributeNames : ["_ALL"]
              };
              clonedContext[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
              clonedContext[ContextHelper.CONTEXT_TYPE_VALUE] = DataHelper.cloneObject(
                  this.contextData[ContextHelper.CONTEXT_TYPE_VALUE]);
              this._contextData = clonedContext;
              this._contextData[ContextHelper.CONTEXT_TYPE_DATA] = DataHelper.cloneObject(
                  this.contextData[ContextHelper.CONTEXT_TYPE_DATA]);
          }
      }
  }
  _getActionData() {
      return [{
          "actions": [{
              "name": "Has Values",
              "text": "Has Values",
              "visible": true,
              "eventName": "has-values"
          },
          {
              "name": "Is Empty",
              "text": "Is Empty",
              "visible": true,
              "eventName": "is-empty"
          },
          {
              "name": "Has Partial Values",
              "text": "Has Partial Values",
              "visible": true,
              "eventName": "has-partial-values"
          },
          {
              "name": "Has Same Values",
              "text": "Has Same Values",
              "visible": true,
              "eventName": "has-same-values"
          },
          {
              "name": "Has Different Values",
              "text": "Has Different Values",
              "visible": true,
              "eventName": "has-different-values"
          }
          ]
      }]
  }
  _onRefreshGrid() {
      this._dataGet();
  }
  _onDropdownChange(e, detail) {
      let filter = this.shadowRoot.querySelector("#actionsButton");
      let filteredData = this._data;
      let filteredDataRelationships = this._dataRelationships;
      if (filter) {
          let filterBy = filter.selectedValue;
          if (filterBy == "Has Values") {
              filteredData = this._data.filter(function (item) {
                  if (item.hasValues) {
                      return item;
                  }
              });
              filteredDataRelationships = this._dataRelationships.filter(function (item) {
                  if (item.hasValues) {
                      return item;
                  }
              });
          } else if (filterBy == "Has Partial Values") {
              filteredData = this._data.filter(function (item) {
                  if (item.hasPartialValues) {
                      return item;
                  }
              });
              filteredDataRelationships = this._dataRelationships.filter(function (item) {
                  if (item.hasPartialValues) {
                      return item;
                  }
              });
          } else if (filterBy == "Is Empty") {
              filteredData = this._data.filter(function (item) {
                  if (item.isEmpty) {
                      return item;
                  }
              });
              filteredDataRelationships = this._dataRelationships.filter(function (item) {
                  if (item.isEmpty) {
                      return item;
                  }
              });
          } else if (filterBy == "Has Same Values") {
              filteredData = this._data.filter(function (item) {
                  if (item.sameValues) {
                      return item;
                  }
              });
              filteredDataRelationships = this._dataRelationships.filter(function (item) {
                  if (item.sameValues) {
                      return item;
                  }
              });
          } else if (filterBy == "Has Different Values") {
              filteredData = this._data.filter(function (item) {
                  if (item.diffValues) {
                      return item;
                  }
              });
              filteredDataRelationships = this._dataRelationships.filter(function (item) {
                  if (item.diffValues) {
                      return item;
                  }
              });
          }
      }
      this._gridData = undefined;
      this._gridData = filteredData;
      this._gridDataRelationships = filteredDataRelationships;
  }
  _getEntityHeader(entity) {


      let header = "";
      let preparedEntities = this.compareEntitiesContext ? this.compareEntitiesContext[
          "entities-data"] : undefined;
      if (entity) {
          if (!this.isSnapshot) {
              let preparedEntity = !_.isEmpty(preparedEntities) ? preparedEntities.find(obj => obj.id ===
                  entity.id) : undefined;
              if (entity[this.entityTitle]) {
                  header = entity[this.entityTitle];
              } else {
                  let attributes = entity.data.attributes;
                  if (attributes && attributes[this.entityTitle]) {
                      header = attributes[this.entityTitle].values ? attributes[this.entityTitle].values[
                          0].value : "";
                  }
              }
              if (header === "" || header === "_EMPTY" || header === ConstantHelper.NULL_VALUE) {
                  header = entity.id;
              }
              if (preparedEntity && preparedEntity.score) {
                  header = header + " - Score " + preparedEntity.score + "%";
              }
          } else {
              //For Snapshot Scenario
              if (entity.type.indexOf("_snapshot") == -1) {
                  header = "Current Entity: " + entity.name
              } else {
                  let snapLabel = this._getSnapshotMetadata(entity).snapLabel;
                  if (snapLabel == "") {
                      snapLabel = "No Label";
                  }
                  header = snapLabel;
                  if (DataHelper.isValidObjectPath(entity, "properties.createdDate")) {
                      let createdDate = FormatHelper.convertFromISODateTime(entity.properties.createdDate,
                          'datetime');
                      header = header + ": " + createdDate;
                  }


              }
          }
      }

      if (header == "") {
          return "<No Name>";
      } else {
          return header;
      }
  }
  _updateEntityHeader(entityId, entityHeader) {
      if (_.isEmpty(this.compareEntitiesContext)) {
          return entityHeader;
      }
      if (!this.isSnapshot) {
          return entityId == this.compareEntitiesContext.newEntity.id ? "New - " + entityHeader :
              "Matched - " + entityHeader;
      } else {
          return entityHeader;
      }
  }
  _getLink(entityId, entityLink) {
      let link = "";
      if (!this.isSnapshot && entityLink) {
          let newEntityId = "";
          if (this.compareEntitiesContext && this.compareEntitiesContext.newEntity) {
              newEntityId = this.compareEntitiesContext.newEntity.id;
          }
          link = entityId == newEntityId ? "" : entityLink;
      }
      return link;
  }
  _onColumnSelectionChanged(e) {
      if (e.detail.checked) {
          this.selectedEntityId = e.detail.value;
      } else {
          this.selectedEntityId = "";
      }
  }
  _onBackTap(e) {
      this._reset();
      let eventName = "compare-entities-back";
      this.fireBedrockEvent(eventName, null);
  }
  _onDiscardTap(e) {
      this._reset();
      let eventName = "compare-entities-discard";
      this.fireBedrockEvent(eventName, null);
  }
  _onCreateTap(e) {
      //Already new entity details available, so just trigger the event
      let eventName = "compare-entities-create";
      let isReviewProcess = e.target.getAttribute("data-args") == "createReview";
      this.fireBedrockEvent(eventName, {
          "isReviewProcess": isReviewProcess
      });
  }
  _onMergeTap(e) {
      if (!this.selectedEntityId) {
          this.showWarningToast("Select an entity for merge.");
          return;
      }
      let matchedEntity = {};
      for (let i = 0; i < this.entities.length; i++) {
          if (this.entities[i].id == this.selectedEntityId) {
              matchedEntity = this.entities[i];
              break;
          }
      }
      let eventName = "compare-entities-merge";
      this.fireBedrockEvent(eventName, {
          "matchedEntity": matchedEntity
      });
  }

  _allowAction(compareEntitiesContext, type) {
      let allowAction = false;
      if (compareEntitiesContext &&
          compareEntitiesContext.matchConfig &&
          compareEntitiesContext.matchConfig.matchMerge) {
          let matchConfig = compareEntitiesContext.matchConfig;
          if (type == "create") {
              allowAction = matchConfig["allow-create"] && matchConfig.matchMerge.canCreate && this.showCreateButton;
          } else if (type == "createReview") {
              allowAction = matchConfig["allow-create"] && matchConfig.matchMerge.canCreateReview;
          } else if (type == "merge") {
              allowAction = matchConfig.matchMerge.canMerge && this.showMergeButton;
          } else if (type == "discard") {
              allowAction = matchConfig.matchMerge.canDiscard;
          }
      }
      return allowAction;
  }
  _reset() {
      this._modelGetTracker = 0;
      this.selectedEntities = [];
      this._gridConfig = {};
      this._gridData = this._data = [];

      this._gridConfigRelationships = {};
      this._gridDataRelationships = this._dataRelationships = [];
  }
}
customElements.define(RockCompareEntities.is, RockCompareEntities);
