import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
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
import '../liquid-config-get/liquid-config-get.js';
import '../pebble-dropdown/pebble-dropdown.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-horizontal-divider/pebble-horizontal-divider.js';
import '../pebble-accordion/pebble-accordion.js';
import '../rock-grid/rock-grid.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

class RockMatchMerge extends mixinBehaviors([
    RUFBehaviors.UIBehavior,
    RUFBehaviors.ComponentContextBehavior
], OptionalMutableData(PolymerElement)) {
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
    
                #actionButton {
                    width: 20%;
                }
    
                .button-siblings {
                    @apply --rock-match-merge-screen;
                }
    
                #content-status {
                    font-size: 12px;
                }
    
                #errorsDialog {
                    --popup-header-color: var(--palette-pinkish-red, #ee204c);
                }
                .infoMessage {
                    font-size: 12px;
                    padding-bottom: 5px;
                }
            </style>
            <template is="dom-if" if="[[showActionButtons]]">
                <div id="content-actions" class="buttonContainer-top-right" align="center">
                    <!-- Todo - Back button should be removed for new flow -->
                    <!-- <pebble-button class="action-button btn btn-secondary m-r-5" id="back" button-text="Change Data" raised on-tap="_onBackTap"></pebble-button> -->
                    <pebble-button class="action-button btn btn-secondary m-r-5" id="skip" button-text="Skip" raised on-tap="_onSkipTap" disabled\$="[[_disableSkip(reviewIndex, sourceEntities)]]"></pebble-button>
                    <template is="dom-if" if="[[_showDiscard]]">
                        <pebble-button class="action-button btn btn-primary m-r-5" id="discard" button-text="Discard" raised on-tap="_onDiscard"></pebble-button>
                    </template>
                    <template is="dom-if" if="[[_allowAction('createReview', showCreateButton, _canCreateReview)]]">
                        <pebble-button class="action-button btn btn-primary m-r-5" data-args="createReview" id="createReview" button-text="Send for Review" raised on-tap="_createEntity"></pebble-button>
                    </template>
                    <template is="dom-if" if="[[_allowAction('create', showCreateButton, _canCreate)]]">
                        <pebble-button class="action-button btn btn-success m-r-5" data-args="create" id="create" button-text="Create" raised on-tap="_createEntity"></pebble-button>
                    </template>
                    <template is="dom-if" if="[[_allowAction('merge', showMergeButton, _canMerge)]]">
                        <pebble-button class="action-button-focus dropdownText btn btn-success" id="merge" button-text="Merge" raised on-tap="_onMergeTap"></pebble-button>
                    </template>
                </div>
            </template>
            <div class="base-grid-structure button-siblings">
                <div class="base-grid-structure-child-1">
                    <div id="content-status" hidden\$="[[!isReviewProcess]]">
                        [[reviewCreatedEntities]] - Created, [[reviewMergedEntities]] - Merged, [[reviewSkipped]] - Skipped, [[reviewDiscarded]] - Discarded, [[reviewPending]] - Pending
                    </div>
                    <div class="pebble-dropdown-wrapper" hidden\$="[[_showMessageOnly]]">
                        <pebble-dropdown id="actionsButton" label="Filter By" selected-value="{{_selectedValue}}" items="[[_dropDownItems]]"></pebble-dropdown>
                    </div>
                    <div align="center" class="infoMessage">[[_matchProcessMessage]]</div>
                </div>
                <template is="dom-if" if="[[!_showMessageOnly]]">
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
                                            <rock-grid id="compareEntitiesGrid" data="{{_gridData}}" attribute-models="{{_attributeModels}}" config="{{_gridConfig}}" page-size="5" enable-column-select=[[enableColumnSelect]] context-data="[[contextData]]" nested-attribute-message="{noOfValues} values" hide-view-selector hide-toolbar grid-item-view></rock-grid>
                                        </div>
                                    </div>
                                </div>
                            </pebble-accordion>
                        </template>
                    </div>
                </template>
            </div>
            <pebble-dialog id="attributeDialog" dialog-title="Confirmation" modal medium vertical-offset=1 50 horizontal-align="auto" vertical-align="auto" no-cancel-on-outside-click no-cancel-on-esc-key show-ok show-cancel show-close-icon alert-box>
                <div id="attrDialogContainer" class="overflow-auto"></div>
            </pebble-dialog>
            <pebble-dialog id="errorsDialog" modal small vertical-offset=1 50 horizontal-align="auto" vertical-align="auto" no-cancel-on-outside-click no-cancel-on-esc-key dialog-title="Errors on page">
                <p>Found below errors in entity details: </p>
                <ul class="error-list">
                    <template is="dom-repeat" items="[[_syncValidationErrors]]">
                        <li>[[item.attributeExternalName]] with error: [[item.message]]</li>
                    </template>
                </ul>
                <div class="buttons">
                    <pebble-button id="ok" class="apply btn btn-secondary m-r-5" button-text="Cancel" on-tap="_fixServerErrors"></pebble-button>
                    <pebble-button id="skip" class="close btn btn-primary" button-text="Skip & Continue" on-tap="_skipServerErrors"></pebble-button>
                </div>
            </pebble-dialog>
            <pebble-dialog id="updateConfirmDialog" modal small vertical-offset=1 50 horizontal-align="auto" vertical-align="auto" no-cancel-on-outside-click no-cancel-on-esc-key dialog-title="Found Match">
                <p>Found the below matching entity in system: </p>
                <ul class="error-list">
                    <li>Entity Id: [[_matchedEntity.id]]</li>
                    <li>Entity Type: [[_matchedEntity.type]]</li>
                </ul>
                <p>Do you want to update the entity?</p>
                <div class="buttons">
                    <pebble-button id="ok" class="close btn btn-secondary m-r-5" button-text="Update" on-tap="_onMergeTap"></pebble-button>
                    <pebble-button id="skip" class="apply btn btn-success" button-text="Cancel" on-tap="_closeUpdateDialog"></pebble-button>
                </div>
            </pebble-dialog>
            <liquid-entity-model-composite-get name="compositeAttributeModelGet" request-data="{{attributeModelRequest}}" on-entity-model-composite-get-response="_onEntityCompositeModelGetResponse" on-error="_onCompositeModelGetError"></liquid-entity-model-composite-get>
            <liquid-entity-data-get operation="getbyids" id="matchedEntityDataGet" request-data="{{_matchedEntityGetRequest}}" on-response="_onMatchedEntityDataGetSuccess" on-error="_onMatchedEntityDataGetFailure"></liquid-entity-data-get>
            <liquid-entity-data-get operation="getbyids" id="sourceEntityDataGet" request-data="{{_sourceEntityGetRequest}}" on-response="_onSourceEntityDataGetSuccess" on-error="_onSourceEntityDataGetFailure"></liquid-entity-data-get>
            <liquid-entity-data-save id="entitySaveService" operation="[[_operation]]" request-data="{{_saveRequest}}" last-response="{{_saveResponse}}" on-response="_onSaveResponse" on-error="_onSaveError"></liquid-entity-data-save>
            <liquid-config-get id="matchConfigGet" operation="getbyids" on-response="_onMatchConfigGetResponse" on-error="_onMatchConfigGetError"></liquid-config-get>
            <liquid-rest id="entityMatchService" url="/data/pass-through/matchservice/search" method="POST" request-data={{_entityMatchRequest}} on-liquid-response="_onMatchSuccess" on-liquid-error="_onMatchFailure"></liquid-rest>
            <liquid-rest id="entityGovernService" url="/data/pass-through/entitygovernservice/validate" method="POST" request-data={{_entityGovernRequest}} on-liquid-response="_onEntityGovernResponse" on-liquid-error="_onEntityGovernFailed"></liquid-rest>
            <bedrock-pubsub event-name="refresh-grid" handler="_onRefreshGrid" target-id="compareEntitiesGrid"></bedrock-pubsub>
                `;
    }
    static get is() {
        return 'rock-match-merge';
    }
    static get properties() {
        return {
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
            _combinedEntitySetForRender: {
                type: Array,
                value: function () {
                    return [];
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
            _rowsModel: {
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
            sourceEntity: {
                type: Object,
                value: function () {
                    return {};
                },
                observer: "_onSourceEntityChange"
            },
            sourceEntities: {
                type: Array,
                value: function () {
                    return [];
                },
                observer: "_onSourceEntitiesChange"
            },
            sourceEntitiesData: {
                type: Array,
                value: function () {
                    return [];
                }
            },
            //Todo - Pick this from config
            matchConfig: {
                type: Object,
                value: function () {
                    return {
                        "allowCreate": true,
                        "title": "{noOfEntities} match(es) found, please select a matched entity to merge or create your entity anyway.",
                        "matchEntityTypes": {
                            "rsdraftsku": "sku",
                            "rsdraftproduct": "product"
                        }
                    };
                }
            },
            _matchThreshold: {
                type: Object,
                value: function () {
                    return {
                        "create": 0,
                        "merge": 100
                    }
                }
            },
            reviewCreatedEntities: {
                type: Number,
                value: 0,
                computed: "_reviewEntitiesCount(sourceEntitiesData, 'created')"
            },
            reviewMergedEntities: {
                type: Number,
                value: 0,
                computed: "_reviewEntitiesCount(sourceEntitiesData, 'merged')"
            },
            reviewSkipped: {
                type: Number,
                value: 0,
                computed: "_reviewEntitiesCount(sourceEntitiesData, 'skipped')"
            },
            reviewPending: {
                type: Number,
                value: 0,
                computed: "_reviewEntitiesCount(sourceEntitiesData, 'pending')"
            },
            reviewDiscarded: {
                type: Number,
                value: 0,
                computed: "_reviewEntitiesCount(sourceEntitiesData, 'discarded')"
            },
            reviewIndex: {
                type: Number,
                value: 0
            },
            showAllAttributes: {
                type: Boolean,
                value: false
            },
            _operation: {
                type: String,
                value: "create"
            },
            _syncValidationErrors: {
                type: Array,
                value: function () { return []; }
            },
            attributeMessages: {
                type: Object,
                value: function () {
                    return {};
                },
                notify: true
            },
            _currentEntityMatchType: {
                type: String,
                value: ""
            },
            _triggeredFromMergeProcess: {
                type: Boolean,
                value: false
            },
            _showMessageOnly: {
                type: Boolean,
                value: false
            },
            _matchProcessMessage: {
                type: String,
                value: ""
            },
            isReviewProcess: {
                type: Boolean,
                value: false
            },
            _showDiscard: {
                type: Boolean,
                value: false
            },
            _matchPermissions: {
                type: Object,
                value: function () {
                    return {
                        "submitPermission": true,
                        "mergePermission": false
                    };
                }
            }
        };
    }

    static get observers() {
        return []
    }

    constructor() {
        super();
        this.addEventListener('column-selection-changed', this._onColumnSelectionChanged);
    }

    connectedCallback() {
        super.connectedCallback();
        let pebbleDropDown = this.$$("#actionsButton");
        if (pebbleDropDown) {
            pebbleDropDown.addEventListener('change', this._onDropdownChange.bind(this));
        }
    }

    _onSourceEntitiesChange() {
        if (!_.isEmpty(this.sourceEntities)) {
            this._loading = true;
            //Todo - This is to fetch requestEntityType(requestsku) entity data, cross check the context data type
            let req = DataRequestHelper.createEntityGetRequest(this.contextData);
            req.params.fields.attributes = ["_ALL"]; // Todo - Pick from config?
            delete req.params.query.id;
            req.params.query.ids = this.sourceEntities;
            this.set("_sourceEntityGetRequest", req);
            let liquidDataGet = this.shadowRoot.querySelector("#sourceEntityDataGet");
            if (liquidDataGet) {
                liquidDataGet.generateRequest();
            }
        }
    }

    _onSourceEntityDataGetSuccess(e, detail) {
        if (DataHelper.isValidObjectPath(detail, "response.content.entities")) {
            this.sourceEntitiesData = detail.response.content.entities || [];
            this.sourceEntitiesData = this.sourceEntitiesData.map(entity => {
                //Todo - Changed the type to do exact match process
                if (this.matchConfig.matchEntityTypes[entity.type]) {
                    entity.type = this.matchConfig.matchEntityTypes[entity.type];
                }
                return {
                    "entity": entity,
                    "status": "pending"
                }
            });
            if (!_.isEmpty(this.sourceEntitiesData)) {
                this.reviewIndex = 0;
                this.sourceEntity = this.sourceEntitiesData[this.reviewIndex].entity;
            }
        } else {
            this._loading = false;
            this.logError("Entities data missing: ", e);
        }
    }

    _onSourceEntityDataGetFailure(e) {
        this._loading = false;
        this.logError("Entity get failed: ", e);
    }

    _onSourceEntityChange() {
        if (!_.isEmpty(this.sourceEntity)) {
            //Review process should trigger with sourceEntities only
            if (_.isEmpty(this.sourceEntities)) {
                this.isReviewProcess = false;
            }
            this._loading = true;
            this._reset();
            this._triggerMatchConfigGet();
            this._triggerAttributeModelGet();
        }
    }

    _tiggerMatchConfigGet() {
        let matchConfigGet = this.shadowRoot.querySelector("#matchConfigGet");
        if (matchConfigGet) {
            let entityType = this.matchConfig.matchEntityTypes[this.sourceEntity.type] || this.sourceEntity.type;
            let configId = entityType + "_matchConfig";
            let request = DataRequestHelper.createConfigGetRequestNew(configId);
            delete request.params.query.contexts;
            request.params.query.filters.typesCriterion = ["matchConfig"];
            matchConfigGet.requestData = request;
            matchConfigGet.generateRequest();
        }
    }

    //Todo, set _matchThreshold with the response details
    _onMatchConfigGetResponse(e, detail) {
        if (DataHelper.isValidObjectPath(detail, "response.content.configObjects.0.data.jsonData")) {
            let matchConfig = detail.response.content.configObjects[0].data.jsonData;
            if (matchConfig && !_.isEmpty(matchConfig.matchRules)) {
                let probabilisticRule = matchConfig.matchRules.find(rule => rule.matchType == "probabilistic");
                if (probabilisticRule && probabilisticRule.matchThresholds) {
                    this._matchThreshold.create = probabilisticRule.matchThresholds.createThreshold || 0;
                    this._matchThreshold.merge = probabilisticRule.matchThresholds.mergeThreshold || 100;
                }
            }
        }
    }

    _onMatchConfigGetError(e, detail) {
        this.logError("MatchConfigGetFail", detail);
    }

    _triggerAttributeModelGet() {
        let req = DataRequestHelper.createEntityModelCompositeGetRequest(this.contextData);
        this.set("attributeModelRequest", req);
        if (this._triggeredFromMergeProcess && this.showAllAttributes) {
            req.params.fields.attributes = ["_ALL"];
        }
        let liquidModelGet = this.shadowRoot.querySelector("[name=compositeAttributeModelGet]");
        if (liquidModelGet) {
            liquidModelGet.generateRequest();
        }
    }

    async _onEntityCompositeModelGetResponse(e) {
        let values = [];
        if (e && e.detail && DataHelper.validateGetAttributeModelsResponse_New(e.detail.response)) {
            this._entityModels = e.detail.response.content.entityModels;
            this._attributeModels = DataTransformHelper.transformAttributeModels(this._entityModels[0], this.contextData);

            if (!_.isEmpty(this._entityModels[0].properties)) {
                this._matchPermissions.submitPermission = this._entityModels[0].properties.submitPermission || this._matchPermissions.submitPermission;
                this._matchPermissions.mergePermission = this._entityModels[0].properties.mergePermission || this._matchPermissions.mergePermission;
            }
        }

        if (this._triggeredFromMergeProcess) {
            this._prepareGridData();
            this._triggeredFromMergeProcess = false;
        } else {
            this._triggerEntityMatch();
        }
    }

    _onCompositeModelGetError(e) {
        this._loading = false;
        this.logError("Composite model get exception", e);
    }

    //Todo, Single match service, So MLBased or Deterministic is known by score
    _triggerEntityMatch() {
        //Set match request
        this.set('_entityMatchRequest', {
            "entity": this.sourceEntity
        });
        //Todo, Match search is throwing error with entity - "domain": {}
        if (_.isEmpty(this._entityMatchRequest.entity.domain)) {
            delete this._entityMatchRequest.entity.domain;
        }
        let entityMatchService = this.shadowRoot.querySelector("#entityMatchService");
        if (entityMatchService) {
            entityMatchService.generateRequest();
        }
    }

    _onMatchSuccess(e, detail) {
        if (detail.response && detail.response.response) {
            let response = detail.response.response;
            if (!response || (response.status && response.status.toLowerCase() == "error")) {
                this.logError("MatchServiceRequestFail", e.detail);
                return;
            }

            //No matches found, create entity along with sync validation
            if (_.isEmpty(response.entities)) {
                this._tiggerCreateProcess();
                return;
            }

            //Match process starts
            let matchedEntities = response.entities;
            this._currentEntityMatchType = this._getMatchType(matchedEntities);

            if (this._currentEntityMatchType == "deterministic") {
                let entities = this._prepareEntities(matchedEntities, this._currentEntityMatchType);
                if (entities.fullList.length == 1) {
                    this._triggerMergeProcess(entities.fullList);
                    return;
                } else {
                    this._triggerDiscardProcess(entities.fullList);
                }
            }

            if (this._currentEntityMatchType == "mlbased") {
                this._mlbasedEntities = this._prepareEntities(matchedEntities, this._currentEntityMatchType);
                if (!this._mlbasedEntities.fullList.length || this._mlbasedEntities.fullList.length == this._mlbasedEntities.createList.length) {
                    this._tiggerCreateProcess()
                } else if (this._mlbasedEntities.mergeList.length) {
                    let highestRankedEntity = _.max(this._mlbasedEntities.mergeList, function (entity) { return entity.score; });
                    //Find all highest score entities
                    let highestRankedEntityList = this._mlbasedEntities.mergeList.filter(entity => {
                        return entity.score == highestRankedEntity.score;
                    });
                    if (highestRankedEntityList.length == 1) {
                        this._triggerMergeProcess(highestRankedEntityList);
                    } else {
                        this._triggerDiscardProcess(this._mlbasedEntities.mergeList);
                    }
                } else if (this._mlbasedEntities.createOrMergeList.length) {
                    this._showMatchedEntitiesPerPermissions(this._mlbasedEntities.createOrMergeList);
                }
            }
        } else {
            this._loading = false;
            this.logError("MatchSearchRequestFail", "response", JSON.stringify(detail));
        }
    }

    _tiggerCreateProcess() {
        if (this.isReviewProcess) {
            this._canCreate = true;
            this._matchProcessMessage = "No matches found Or matches found with less match ration, you can create entity."
        } else {
            this._matchProcessMessage = "Entity create process triggered.";
            this._createEntity();
        }
        this._showMessageOnly = true;
    }

    _triggerMergeProcess(entities) {
        if (this.isReviewProcess) {
            this._canMerge = true;
            this._showMatchedEntities(entities);
        } else {
            this._matchProcessMessage = "Entity merge process triggered.";
            this._showMessageOnly = true;
            this._matchedEntity = entities[0];
            this.shadowRoot.querySelector('#updateConfirmDialog').open();
        }
    }

    _triggerDiscardProcess(entities) {
        this._showDiscard = true;
        this._showMatchedEntities(entities);
    }

    _showMatchedEntitiesPerPermissions(entities) {
        if (this.isReviewProcess) {
            this._canCreate = this._matchPermissions.mergePermission;
        } else {
            this._canCreateReview = this._matchPermissions.submitPermission;
        }
        this._canMerge = this._matchPermissions.mergePermission;
        if (!(this._canCreate || this._canMerge || this._canCreateReview)) {
            this._matchProcessMessage = "You do not have permissions to create or merge";
        }
        this._showMatchedEntities(entities);
    }

    _showMatchedEntities(entities) {
        this.matchedEntityIds = entities.map(entity => entity.id);
        let entityType = ContextHelper.getFirstItemContext(this.contextData).type;
        this.matchedEntityTypes = [entityType];
        this.matchedEntitiesData = entities;
        this._triggerMatchAndMergeProcess();
    }

    _triggerMatchAndMergeProcess() {
        this._prepareContext();
        this._triggeredFromMergeProcess = true;
        this._triggerAttributeModelGet();
    }

    _prepareEntities(matchedEntities, type) {
        let entities = {
            "fullList": [],
            "createList": [],
            "mergeList": [],
            "createOrMergeList": []
        };
        for (let entity of matchedEntities) {
            let mEntity = {
                "id": entity.id,
                "type": entity.type || ""
            }

            if (type == "mlbased") {
                mEntity.score = AttributeHelper.getFirstAttributeValue(entity.data.attributes.score);
                if (mEntity.score < this._matchThreshold.create) {
                    entities.createList.push(mEntity);
                } else if (mEntity.score > this._matchThreshold.merge) {
                    entities.mergeList.push(mEntity);
                } else {
                    entities.createOrMergeList.push(mEntity);
                }
            }

            entities.fullList.push(mEntity);
        }

        return entities;
    }

    _getMatchType(matchedEntities) {
        let matchType = "deterministic";
        let entitiesHavingScore = matchedEntities.filter(entity => {
            if (DataHelper.isValidObjectPath(entity, "data.attributes.score")) {
                let score = AttributeHelper.getFirstAttributeValue(entity.data.attributes.score);
                if (score) {
                    return entity;
                }
            }
        });
        if (entitiesHavingScore.length) {
            matchType = "mlbased";
        }
        return matchType;
    }

    _prepareGridData() {
        let rows = [];
        let entityModel = this._entityModels[0];
        if (entityModel) {
            // to get value of attribute tagged with "isExternalName" flag to show as entity title
            let entityTitle = DataHelper.getExternalNameAttributeFromModel(entityModel);
            if (entityTitle) {
                this.set("entityTitle", entityTitle);
            }
        }
        this._sortModels(this._entityModels);
        this._prepareGridRowsModel(this._entityModels, rows);
        this._rowsModel = rows;
        this._dataGet();
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
        if (this.frozenAttributes.indexOf(key) >= 0) {
            frozenRowModels.push({
                "header": gridModelData.properties.externalName,
                "name": key,
                "isFrozen": true,
                "dataType": gridModelData.properties.dataType,
                "displayType": gridModelData.properties.displayType
            });
            this._attributeModels[key] = gridModelDataOriginal;
        } else {
            normalRowModels.push({
                "header": gridModelData.properties.externalName,
                "name": key,
                "dataType": gridModelData.properties.dataType,
                "displayType": gridModelData.properties.displayType
            });
            this._attributeModels[key] = gridModelDataOriginal;
        }
        return { formattedFrozenRowModels: frozenRowModels, formattedFormalRowModels: normalRowModels }
    }

    _prepareGridRowsModel(entityModels, rows) {
        let frozenRowModels = [];
        let normalRowModels = [];

        entityModels.forEach(function (entityModel) {
            if (entityModel && entityModel.data && entityModel.data.attributes) {
                let attributes = DataHelper.isValidObjectPath(entityModel,
                    'data.contexts.0.attributes') ? entityModel.data.contexts[0].attributes :
                    entityModel.data.attributes;

                //looping through attributes to form attribute Model for row
                Object.keys(attributes).forEach(function (key, index) {
                    if (attributes[key]) {
                        let attribute = attributes[key];
                        let grid = 'attributes';
                        this._pushDataInRowModel(key, frozenRowModels, normalRowModels, attribute, grid);
                    }
                }, this);
            }
        }, this);

        //attributes
        frozenRowModels.forEach(function (rowModel) {
            rows.push(rowModel);
        }, this);
        normalRowModels.forEach(function (rowModel) {
            rows.push(rowModel);
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

    async _onMatchedEntityDataGetSuccess(e) {
        let columns = [];
        let items = [];

        this.entities = e.detail.response.content.entities;
        let ent = this.entities;
        this._combinedEntitySetForRender.push(...ent);
        this.entities = this._combinedEntitySetForRender;

        if (this.entities && this.entities.length) {
            await this._prepareGridColumnsModelAndData(this.entities, columns, items);
        }
        //attributes grid
        let gridConfig = this._getBaseGridConfig();
        gridConfig.itemConfig.fields = _.extend({}, columns);
        gridConfig.itemConfig.rows = this._rowsModel;
        this._gridConfig = this._getConfigWithUpdatedTitle(gridConfig, this.entities);
        this._gridData = this._data = items;
        this._loading = false;
    }

    _getConfigWithUpdatedTitle(gridConfig, entities) {
        if (!_.isEmpty(this.matchConfig)) {
            let title = this.matchConfig["title"];
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

    transformAttributes(entity, attributeModels, contextData, outputSchema, applySort) {
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
            outputData = _.map(transformedAttributeModels, function (value, index) {
                return value;
            });
        } else {
            outputData = transformedAttributeModels;
        }

        return outputData;
    }

    //attributes grid column prepare
    async _prepareGridColumnsModelAndData(entities, columns, items) {
        if (this._rowsModel) {
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
                    "text": "Select for merge"
                }
            }
            columns.push(rowHeader);

            //Add column for new entity - if compare triggered from entity create
            if (!_.isEmpty(this.sourceEntity)) {
                entities.unshift(this.sourceEntity);
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
                            "link": this._getLink(entity.id, `entity-manage?id=${entity.id}&type=${entity.type}`)
                        }
                        if (this.sourceEntity) {
                            colDetails["selectable"] = {
                                "isAction": true,
                                "disable": this.sourceEntity.id == entity.id || !this._canMerge
                            };
                        }
                        nonSortedColumns.push(colDetails);
                    }
                    let attributes = await this.transformAttributes(entity, this._attributeModels, this._contextData);
                    let _isAttributeMapped = false;
                    this._entityModels.forEach(function (currentModel) {
                        let attrs = (DataHelper.isValidObjectPath(currentModel, 'data.contexts.0.attributes')) ? currentModel.data.contexts[0].attributes : currentModel.data.attributes;
                        if (attrs[row.name]) {
                            _isAttributeMapped = true;
                        }
                    }, this);

                    currAttrDataType = row.dataType;
                    currAttrDisplayType = row.displayType;
                    if (currAttrDisplayType === "richtexteditor") {
                        let el = document.createElement('p');
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
                        if (item[key] === ConstantHelper.NULL_VALUE) {
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

    _getLink(entityId, entityLink) {
        let link = "";
        if (entityLink) {
            let newEntityId = "";
            if (this.sourceEntity) {
                newEntityId = this.sourceEntity.id;
            }
            link = entityId == newEntityId ? "" : entityLink;
        }
        return link;
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

    _onMatchedEntityDataGetFailure(e) {
        this._loading = false;
        let reason = e.detail.response.reason;
        this.logError("Entity get failed due to following reason: ", reason);
    }

    _dataGet() {
        if (this._contextData) {
            let firstItemContext = this._contextData[ContextHelper.CONTEXT_TYPE_ITEM] &&
                this._contextData[ContextHelper.CONTEXT_TYPE_ITEM].length ? this._contextData[
                ContextHelper.CONTEXT_TYPE_ITEM][0] : undefined;
            if (firstItemContext) {
                firstItemContext.type = this.matchedEntityTypes;
            }
            let req = DataRequestHelper.createEntityGetRequest(this._contextData);
            this._contexts = ContextHelper.getDataContexts(this.contextData);
            this.set("_matchedEntityGetRequest", req);

            let liquidDataGet = this.shadowRoot.querySelector("#matchedEntityDataGet");
            liquidDataGet.generateRequest();
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

    _prepareContext() {
        let clonedContext = {};
        let entityIds = this.matchedEntityIds;
        let entityTypes = this.matchedEntityTypes;
        if (this.contextData) {
            let itemContext = {
                'id': entityIds,
                'type': entityTypes,
                'attributeNames': !_.isEmpty(this.attributeNames) ? this.attributeNames : ["_ALL"]
            };
            clonedContext[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
            clonedContext[ContextHelper.CONTEXT_TYPE_VALUE] = DataHelper.cloneObject(
                this.contextData[ContextHelper.CONTEXT_TYPE_VALUE]);
            this._contextData = clonedContext;
            this._contextData[ContextHelper.CONTEXT_TYPE_DATA] = DataHelper.cloneObject(
                this.contextData[ContextHelper.CONTEXT_TYPE_DATA]);
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
        if (filter) {
            let filterBy = filter.selectedValue;
            if (filterBy == "Has Values") {
                filteredData = this._data.filter(function (item) {
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
            } else if (filterBy == "Is Empty") {
                filteredData = this._data.filter(function (item) {
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
            } else if (filterBy == "Has Different Values") {
                filteredData = this._data.filter(function (item) {
                    if (item.diffValues) {
                        return item;
                    }
                });
            }
        }
        this._gridData = undefined;
        this._gridData = filteredData;
    }

    _getEntityHeader(entity) {
        let header = "";
        let preparedEntities = this.matchedEntitiesData || undefined;
        if (entity) {
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
            if (header === "" || header === "_EMPTY") {
                header = entity.id;
            }
            if (preparedEntity && preparedEntity.score) {
                header = header + " - Score " + preparedEntity.score + "%";
            }
        }

        if (header == "") {
            return "<No Name>";
        } else {
            return header;
        }
    }

    _updateEntityHeader(entityId, entityHeader) {
        if (_.isEmpty(this.sourceEntity)) {
            return entityHeader;
        }
        return entityId == this.sourceEntity.id ? "New - " + entityHeader :
            "Matched - " + entityHeader;
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

    _onSkipTap(e) {
        if (_.isEmpty(this.sourceEntitiesData)) {
            return;
        }
        if (this.sourceEntitiesData[this.reviewIndex].status != "completed") {
            this.sourceEntitiesData[this.reviewIndex].status = "skipped";
            this._notifySourceEntities();
        }
        this._moveToNextEntity();
    }

    _moveToNextEntity() {
        //Check is next entity available or not, if yes, then move to next
        if (this.sourceEntitiesData[this.reviewIndex + 1]) {
            this.reviewIndex++;
            this.sourceEntity = this.sourceEntitiesData[this.reviewIndex].entity;
        }
    }

    _notifySourceEntities() {
        let entities = this.sourceEntitiesData;
        this.sourceEntitiesData = [];
        this.sourceEntitiesData = entities;
    }

    _createEntity(e) {
        if (this.isReviewProcess && this.sourceEntitiesData[this.reviewIndex].status == "completed") {
            this.showSuccessToast("Entity process already completed");
            return;
        }
        this._loading = true;
        let sourceEntity = DataHelper.cloneObject(this.sourceEntity);
        //Todo - Verify is the sku changed to requestsku
        let requestEvent = e && e.target.getAttribute("data-args") == "createReview";
        if (requestEvent) {
            //sku to requestsku
            sourceEntity.type = (_.invert(this.matchConfig.matchEntityTypes))[sourceEntity.type] || sourceEntity.type;
        } else if (this.isReviewProcess) {
            //requestsku to sku
            sourceEntity.type = this.matchConfig.matchEntityTypes[sourceEntity.type] || sourceEntity.type;
        }
        sourceEntity.id = "e" + ElementHelper.getRandomString();
        this._saveRequest = {
            "entities": [sourceEntity]
        };
        this._operation = "create";
        this._triggerGovernRequest();
    }

    _onMergeTap(e) {
        if (this.isReviewProcess && this.sourceEntitiesData[this.reviewIndex].status == "completed") {
            this.showSuccessToast("Entity process already completed");
            return;
        }
        if (!this.selectedEntityId && !this._matchedEntity) {
            this.showWarningToast("Select an entity for merge.");
            return;
        }
        this._loading = true;
        let sourceEntity = DataHelper.cloneObject(this.sourceEntity);
        sourceEntity.id = this.selectedEntityId || this._matchedEntity.id;
        this._saveRequest = {
            "entities": [sourceEntity]
        };
        this._closeUpdateDialog(false);
        this._operation = "update";
        this._triggerGovernRequest();
    }

    //Todo - rel name? rel type? This should be added for create/merge
    _addReviewEntityAsRelationship(sourceEntity) {
        sourceEntity.data.relationships = {
            "relationshipName???": [
                {
                    "direction": "both",
                    "relationshipType": "type???",
                    "relTo": {
                        "id": this.sourceEntity.id,
                        "type": (_.invert(this.matchConfig.matchEntityTypes))[sourceEntity.type]
                    }
                }
            ]
        };
    }

    _triggerGovernRequest() {
        let governReq = {
            "entity": DataHelper.cloneObject(this._saveRequest.entities[0])
        }
        let liquidGovernGet = this.$.entityGovernService;
        if (liquidGovernGet) {
            this.set("_entityGovernRequest", governReq);
            liquidGovernGet.generateRequest();
        }
    }

    _onEntityGovernResponse(e, detail) {
        let response = detail ? detail.response : {};
        if (response.response && response.response.status && response.response.status.toLowerCase() == "success") {
            let res = response.response;
            let entityId = "";
            if (DataHelper.isValidObjectPath(detail, "request.requestData.entity.id")) {
                entityId = detail.request.requestData.entity.id;
            }

            let entity = DataHelper.findEntityById(res.entities, entityId);
            let attrMessages = {};
            if (entity && entity.data && entity.data.attributes) {
                let attributes = entity.data.attributes;
                attrMessages = MessageHelper.getAttributeMessages(attributes, this._attributeModels, this.messageCodeMapping, this.localize());
            }
            if (!_.isEmpty(attrMessages)) {
                let errorMessages = MessageHelper.getErrorsFromAttrMessages(attrMessages, this._attributeModels);
                this.set("_syncValidationErrors", errorMessages);
                this.shadowRoot.querySelector('#errorsDialog').open();
                return;
            } else {
                this._triggerSaveRequest();
            }
        } else {
            this._loading = false;
            this.logError("There is a problem in validation service.", e.detail);
        }
    }

    _onEntityGovernFailed(e) {
        this._loading = false;
        this.logError("There is a problem in validation service.", e.detail);
    }

    _closeErrorDialog(isCancelled = true) {
        if (isCancelled) {
            this._matchProcessMessage = "Process cancelled, fix the errors.";
        }
        let errorDialog = this.$.errorsDialog;
        if (errorDialog) {
            errorDialog.close();
        }
    }

    _closeUpdateDialog(isCancelled = true) {
        if (isCancelled) {
            this._matchProcessMessage = "Process cancelled.";
        }
        let updateConfirmDialog = this.$.updateConfirmDialog;
        if (updateConfirmDialog) {
            updateConfirmDialog.close();
        }
    }

    _skipServerErrors() {
        this._closeErrorDialog(false);
        this._triggerSaveRequest();
    }

    _fixServerErrors() {
        this._closeErrorDialog();
        let newAttributeMessages = {};

        if (this._syncValidationErrors) {
            for (let i = 0; i < this._syncValidationErrors.length; i++) {
                let attributeMessages = this._syncValidationErrors[i];
                let attributeName = attributeMessages.attributeName;
                let message = attributeMessages.message;
                if (attributeName && message) {
                    newAttributeMessages[attributeName] = [message];
                }
            }
        }
        this.set('attributeMessages', newAttributeMessages);
        this._loading = false;
    }

    _triggerSaveRequest() {
        //Todo - Add relationship
        let liquidSave = this.shadowRoot.querySelector("#entitySaveService");
        if (liquidSave) {
            liquidSave.generateRequest();
        }
    }

    _onSaveResponse(e) {
        let operation = e.detail.request.operation;
        let msg = "";

        if (operation == "create") {
            if (this.isReviewProcess) {
                this.sourceEntitiesData[this.reviewIndex].status = "created";
            }
            msg = "Entity created successfully.";
        }
        if (operation == "update") {
            if (this.isReviewProcess) {
                this.sourceEntitiesData[this.reviewIndex].status = "merged";
            }
            msg = "Entity updated successfully.";
        }
        if (this.isReviewProcess) {
            this._notifySourceEntities();
            this._moveToNextEntity();
        }
        setTimeout(() => {
            this._loading = false;
            this.showSuccessToast(msg);
        }, 100);
    }

    _allowAction(type) {
        let allowAction = false;
        if (type == "createReview") {
            allowAction = this.showCreateButton && this._canCreateReview;
        } else if (type == "create") {
            allowAction = this.showCreateButton && this._canCreate;
        } else if (type == "merge") {
            allowAction = this.showMergeButton && this._canMerge;
        }
        return allowAction;
    }

    _reset() {
        this._gridConfig = {};
        this._gridData = this._data = [];
        this._syncValidationErrors = [];
        this.attributeMessages = {};
        this._combinedEntitySetForRender = [];
        this._entityModels = [];
        this._attributeModels = {};
        this._matchProcessMessage = "";
        this._showMessageOnly = false;
        this._canCreate = this._canMerge = this._canCreateReview = this._showDiscard = false;
    }

    _reviewEntitiesCount(entities, status) {
        let reviewEntities = entities.filter(entity => {
            return entity.status == status;
        });
        return reviewEntities.length;
    }

    _disableSkip() {
        return _.isEmpty(this.sourceEntities) || (this.reviewIndex + 1) == this.sourceEntities.length;
    }

    _onDiscard() {
        if (this.isReviewProcess) {
            //Todo, What to do with the review entity in this scenario
            if (this.sourceEntitiesData[this.reviewIndex].status == "discarded") {
                return;
            }
            this.sourceEntitiesData[this.reviewIndex].status = "discarded";
            this._notifySourceEntities();
            this._moveToNextEntity();
        } else {
            ComponentHelper.closeCurrentApp();
        }
    }
}
customElements.define(RockMatchMerge.is, RockMatchMerge);