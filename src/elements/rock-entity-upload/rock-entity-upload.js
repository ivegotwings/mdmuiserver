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

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/polymer/lib/utils/async.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/entity-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/entity-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/attribute-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-text-alignment.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-fonts.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-floating.js';
import EntityTypeManager from '../bedrock-managers/entity-type-manager.js' 
import ContextModelManager from '../bedrock-managers/context-model-manager.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import '../liquid-entity-data-save/liquid-entity-data-save.js';
import '../liquid-rest/liquid-rest.js';
import '../liquid-config-get/liquid-config-get.js';
import '../liquid-config-save/liquid-config-save.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../pebble-file-upload/pebble-file-upload.js';
import '../pebble-dialog/pebble-dialog.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-checkbox/pebble-checkbox.js';
import '../pebble-button/pebble-button.js';
import '../rock-grid/rock-grid.js';
import '../rock-classification-tree/rock-classification-tree.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityUpload
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ComponentContextBehavior
    ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-grid-layout bedrock-style-floating bedrock-style-fonts bedrock-style-padding-margin bedrock-style-buttons bedrock-style-text-alignment">
            :host {
                display: block;
                height: 100%;
            }

            .placeHolder {
                margin-top: 5px;
                box-shadow: 0 0 10px 0 var(--cloudy-blue-color, #c1cad4);
                position: relative;
                height: 70%;
                padding-top: 20px;
                padding-bottom: 20px;
                width: calc(100% - 10px);
            }

            #content-label {
                box-shadow: 0 1px 7px 0 var(--palette-cloudy-blue, #c1cad4);
                padding: 15px;
                margin: 10px;
            }

            #image-container {
                width: 30px;
                height: 35px;
                vertical-align: middle;
            }

            .exportSmartExcelContent {
                height: 85vh;
            }

            .pathSelector {
                width: 225px;
            }
            .align-center {
                margin: 0 auto;
            }
            .text-steel-grey {
                color: var(--palette-steel-grey, #75808b);
            }
            .w-70{
                width:70%;
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>

        <div id="content-entity-import" hidden="" class="base-grid-structure w-70 align-center">
            <div class="base-grid-structure-child-1">
                <div align="right" class="checkbox-container">
                    <pebble-checkbox hidden\$="[[!enableMappings]]" id="customizeMappingsChk" class="text-steel-grey m-r-10" on-change="_onMappingsChange">Customize Mappings</pebble-checkbox>
                </div>
            </div>
            <div class="base-grid-structure-child-2 button-siblings">
                <div class="placeHolder p-10">
                    <div class="base-grid-structure">
                        <div class="base-grid-structure-child-1">
                            <p class="font-14 text-center text-steel-grey">
                                <a href="#" class="btn-link" on-tap="_exportDialogOpen">Download</a> a system template or just upload an existing data file
                            </p>
                        </div>
                        <div class="base-grid-structure-child-2">
                            <pebble-file-upload id="fileUpload" allowed-file-types="[[allowedFileTypes]]"></pebble-file-upload>
                        </div>
                        <pebble-dialog id="exportDialog" modal="" show-close-icon="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
                            <pebble-spinner active="[[_downloadInProgress]]"></pebble-spinner>
                            <div id="exportSmartExcelContent" class="exportSmartExcelContent">
                                <div class="base-grid-structure">
                                    <div class="base-grid-structure-child-1">
                                        Select one or more classifications to download the smart excel template. You can select the classification at any level and
                                        the data required for all child classifications will be shown in the template. You can also download the template without selecting classification.
                                        <span class="pull-right pathSelector">
                                            <pebble-dropdown id="pathSelector" label="Select path for classifications" items="[[paths]]" selected-value="{{selectedPath}}" on-change="_onClassificationRootChange" selected-index="{{selectedIndex}}">
                                            </pebble-dropdown>
                                        </span>
                                    </div>
                                    <div id="categoryTreeContainer" class="base-grid-structure-child-2">
                                        <div class="button-siblings">
                                            <rock-classification-tree id="contextTree" multi-select="[[multiSelect]]" root-node="[[pathRootNode]]" path-entity-type="[[pathEntityType]]" path-relationship-name="[[pathRelationshipName]]" context-data="[[contextData]]" selected-classifications="{{_selectedCategories}}" leaf-node-only="[[leafNodeOnly]]"></rock-classification-tree>
                                        </div>
                                        <div id="exportActions" class="buttonContainer-static" align="center">
                                            <pebble-button id="cancel" class="close btn btn-secondary m-r-10" button-text="Cancel" raised="" on-tap="_onCancelDownloadSelection"></pebble-button>
                                            <pebble-button id="download" class="apply btn btn-success" button-text="Download" raised="" on-tap="_exportSelectedCategory"></pebble-button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </pebble-dialog>
                        <!-- screen for import -->
                        <bedrock-pubsub event-name="pebble-file-upload-success" handler="_onFileUploadSuccess" target-id="fileUpload"></bedrock-pubsub>
                    </div>
                </div>
            </div>
            <div id="upload-actions" class="buttonContainer-static" align="center">
                <template is="dom-repeat" id="event-template" items="[[componentEvents]]">
                    <template is="dom-if" if="[[_showEvent(item)]]">
                        <pebble-button id="[[item.id]]" class\$="[[item.class]]" button-text="[[item.text]]" on-tap="_onTriggerEvent" data-args\$="[[item.event]]" elevation="1" raised=""></pebble-button>
                    </template>
                </template>
            </div>
        </div>
        <bedrock-pubsub event-name="field-map-save" handler="_onFieldMappingsSave" target-id=""></bedrock-pubsub>
        <bedrock-pubsub event-name="field-map-back" handler="_onFieldMappingsBack" target-id=""></bedrock-pubsub>
        <bedrock-pubsub event-name="field-map-import" handler="_onFieldMappingsImport" target-id=""></bedrock-pubsub>
        <bedrock-pubsub event-name="context-mapping-back" handler="_onContextMappingsBack" target-id=""></bedrock-pubsub>
        <bedrock-pubsub event-name="context-mapping-skip" handler="_onContextMappingsSkipOrSave" target-id=""></bedrock-pubsub>
        <bedrock-pubsub event-name="context-mapping-save" handler="_onContextMappingsSkipOrSave" target-id=""></bedrock-pubsub>
        <liquid-entity-model-get id="getEntityTypeModel" operation="getbyids" on-response="_onEntityTypeModelReceived" on-error="_onEntityTypeModelFailed"></liquid-entity-model-get>
        <liquid-entity-model-get id="liquidAttributeModelGet" operation="getbyids" on-error="_onAttributeModelGetError" on-response="_onAttributeModelGetResponse" exclude-in-progress=""></liquid-entity-model-get>
        <liquid-entity-data-get id="getEntity" operation="getbyids" data-index="entityData" data-sub-index="data" on-response="_onEntityGetResponse" on-error="_onEntityGetFailed"></liquid-entity-data-get>
        <liquid-rest id="classificationModelGet" url="/data/pass-through/entitymodelservice/get" method="POST" on-liquid-response="_onClassificationModelGetResponse"></liquid-rest>
`;
  }

    static get is() {
        return 'rock-entity-upload';
    }
    static get observers() {
        return [
            '_contextChanged(contextData)'
        ]
    }
    static get properties() {
        return {
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
             * Indicates the contexts which are retrieved from "Excel".
             */
            contexts: {
                type: Array,
                value: function () {
                    return [];
                }
            },
            _copRequest: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            _fileName: {
                type: String
            },
            _loading: {
                type: Boolean,
                value: false
            },
            _downloadInProgress: {
                type: Boolean,
                value: false
            },
            _isDirty: {
                type: Boolean,
                value: false
            },
            _workAutomationId: {
                type: String
            },
            uploadMode: {
                type: String,
                value: "process",
                observer: "_onUploadModeChange"
            },
            customizeMappings: {
                type: Boolean,
                value: false
            },
            _selectedCategories: {
                type: Array,
                value: function () {
                    return [];
                },
                notify: true
            },
            /**
             * <b><i>Content development is under progress... </b></i> 
             */
            enableMappings: {
                type: Boolean,
                value: false
            },
            _currentCOPService: {
                type: String,
                value: "process"
            },
            /**
             * <b><i>Content development is under progress... </b></i> 
             */
            skipNext: {
                type: Boolean,
                value: false
            },
            /**
             * <b><i>Content development is under progress... </b></i> 
             */
            businessFunctionData: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            allowedFileTypes: {
                type: Array,
                value: function () {
                    return [];
                }
            },
            _fileDetails: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            copContext: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            mappingConfig: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            mappingActions: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            componentEvents: {
                type: Array,
                value: function () {
                    return [];
                }
            },
            selectedOptions: {
                type: Object,
                value: function () {
                    return {
                        "role": "_DEFAULT",
                        "ownershipData": "_DEFAULT",
                        "saveType": "self"
                    }
                }
            },
            domain: {
                type: String,
                value: "generic"
            },
            multiSelect: {
                type: Boolean,
                value: false
            },
            leafNodeOnly: {
                type: Boolean,
                value: false
            },
            pathRootNode: {
                type: String,
                value: ""
            },
            pathEntityType: {
                type: String,
                value: ""
            },
            pathRelationshipName: {
                type: String,
                value: ""
            },
            paths: {
                type: Array,
                value: function () {
                    return []
                }
            },
            selectedPath: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            //Now skipping context mappings directly, if needed go with config
            skipContextMapping: {
                type: Boolean,
                value: true
            },
            selectedIndex: {
                type: Number,
                value: -1
            },
            defaultPath: {
                type: String,
                value: ""
            },
            attributeModels: {
                type: Array,
                value: function () {
                    return [];
                }
            },
            _classificationExtNameAttr: {
                type: String,
                value: ""
            },
            _pathRootNodes: {
                type: Array,
                value: function () {
                    return [];
                }
            }
        }
    }

    /**
     * <b><i>Content development is under progress... </b></i> 
     */
    ready() {
        super.ready();
    }

    _contextChanged(contextData) {
        if (!_.isEmpty(contextData)) {
            this._showView("entity-import");
            let itemContext = this.getFirstItemContext();
            this.entityType = itemContext.type;

            //Get domain for entity type
            this._prepareClassificationRootPaths();
        }
    }

    async _prepareClassificationRootPaths() {
        //entityType, then fetch domain
        let entityTypeManager = EntityTypeManager.getInstance();
        if (entityTypeManager) {
            this.domain = await entityTypeManager.getDomainByType(this.entityType);
        }
        let enhancerAttributes = await ContextModelManager.getEnhancerAttributeNamesBasedOnDomainAndContext(this.domain);
        this._liquidAttributeModelGetElement = this.$$('#liquidAttributeModelGet');
        if (this._liquidAttributeModelGetElement) {
            this._liquidAttributeModelGetElement.requestData = DataRequestHelper.createGetAttributeModelRequest(enhancerAttributes);
            this._liquidAttributeModelGetElement.generateRequest();
        }
    }

    _onClassificationRootChange(e) {
        if (DataHelper.isValidObjectPath(this.selectedPath, "properties.pathEntityInfo.0")) {
            let pathEntityInfo = this.selectedPath.properties.pathEntityInfo[0];
            this.pathEntityType = pathEntityInfo.pathEntityType;
            this.pathRelationshipName = pathEntityInfo.pathRelationshipName;
            this.pathRootNode = pathEntityInfo.rootNode;

            let exportDialog = this.shadowRoot.querySelector("#exportDialog");
            let contextTree = exportDialog.querySelector('#contextTree');
            if (contextTree) {
                // If you want to download excel with multiple rootNodes classifications, then comment below and and enable multiselect.
                contextTree.clearSelectedItems();
                contextTree.generateRequest();
            }
        }
    }

    _onAttributeModelGetResponse(e) {
        let response = e.detail.response;
        if (response && response.content && response.content.entityModels) {
            let attributeModels = response.content.entityModels;
            let pathModels = [];
            let pathRootNodes = [];
            attributeModels.forEach(function (model) {
                if (DataHelper.isValidObjectPath(model, "properties.displayType") &&
                    (model.properties.displayType || "").toLowerCase() == "path" &&
                    DataHelper.isValidObjectPath(model.properties, "pathEntityInfo.0.rootNode") &&
                    model.properties.pathEntityInfo[0].rootNode) {
                    pathModels.push(model);
                    pathRootNodes.push(model.properties.pathEntityInfo[0].rootNode);
                }
            });
            this.attributeModels = pathModels;
            this._pathRootNodes = pathRootNodes;

            if(_.isEmpty(pathRootNodes)) {
                this.logError("Classification root nodes not available for the process");
                this._loading = false;
                return;
            }

            //get classification manage model for external attribute
            this._getClassificationManageModel()
        }
    }

    _onAttributeModelGetError(e) {
        this.logError("Attribute model get error", e.detail);
        this._loading = false;
    }

    _getClassificationManageModel() {
        let request = DataRequestHelper.createGetManageModelRequest(["classification"]);

        let classificationModelGetElement = this.$$("#classificationModelGet");
        if (classificationModelGetElement) {
            classificationModelGetElement.requestData = request;
            classificationModelGetElement.generateRequest();
        }
    }

    _onClassificationModelGetResponse(e) {
        let response = DataHelper.isValidObjectPath(e, "detail.response.response") ? e.detail.response.response : "";

        if (response && !_.isEmpty(response.entityModels)) {
            let entityModel = response.entityModels[0];
            let externalNameAndExternalNameAttr = AttributeHelper.getExternalNameAndExternalNameAttr(entityModel);

            if (externalNameAndExternalNameAttr && externalNameAndExternalNameAttr.externalNameAttr) {
                this._classificationExtNameAttr = externalNameAndExternalNameAttr.externalNameAttr;
                this._triggerClassificationEntityGet();
            } else {
                this.logError("Attribute not found with isExternalName in classification entity manage model.", e.detail);
                this._loading = false;
            }
        } else {
            this.logError("Entity manage model not found for classification.", e.detail);
            this._loading = false;
        }
    }

    _getClassificationsEntityGetRequest() {
        let request = DataRequestHelper.createEntityGetRequest(this.contextData);
        delete request.params.query.id; 
        //Update attributes, type and ids
        request.params.fields.attributes = [this._classificationExtNameAttr];
        request.params.query.filters.typesCriterion = ["classification"];
        request.params.query.ids = this._pathRootNodes;

        return request;
    }

    _triggerClassificationEntityGet() {
        //Prepare entity get request with pathRootNodes
        let request = this._getClassificationsEntityGetRequest();        
        let liquidDataElement = this.shadowRoot.querySelector('#getEntity');
        if (liquidDataElement) {
            liquidDataElement.requestData = request;
            liquidDataElement.generateRequest();
        }
    }

    async _onEntityGetResponse(e, detail) {
        let entities = [];
        if (DataHelper.isValidObjectPath(detail, "response.content.entities")) {
            entities = detail.response.content.entities;
        }

        if(_.isEmpty(entities)) {
            this.logError("Classification entities missing for the process");
            this._loading = false;
            return;
        }

        let paths = [];
        this.attributeModels.forEach(function (model) {
            let classificationEntity = entities.filter(entity => {
                return entity.id == model.properties.pathEntityInfo[0].rootNode;
            }, this);

            let attributeValue = "";
            if (_.isEmpty(classificationEntity) ||
                !(attributeValue =  AttributeHelper.getFirstAttributeValue(EntityHelper.getAttribute(classificationEntity[0], this._classificationExtNameAttr)))) {
                return;
            }

            model.properties.pathEntityInfo[0].rootNodeExternalName = attributeValue;

            paths.push({
                "title": attributeValue,
                "value": model
            });
        }, this);
        this.paths = paths; //dropdown paths list

        if(_.isEmpty(this.paths)) {
            this.logError("Classification root paths are missing for the process");
            this._loading = false;
            return;
        }

        //Set default index
        let defaultIndex = 0;
        if (this.defaultPath) {
            for (let idx = 0; idx < this.paths.length; idx++) {
                if (this.paths[idx].value && this.paths[idx].value.name &&
                    this.defaultPath.toLowerCase() == this.paths[idx].value.name.toLowerCase()) {
                    defaultIndex = idx;
                    break;
                }
            }
        }
        this.selectedIndex = defaultIndex;
        this._loading = false;
    }

    _onEntityGetFailed(e) {
        this.logError("Classification entities data get failed", e.detail);
        this._loading = false;
    }

    _showView(viewName) {
        if (viewName) {
            let contentView = this.shadowRoot.querySelector("#content-" + viewName);
            if (contentView) {
                contentView.removeAttribute("hidden");
            }
        }
    }

    _hideView(viewName) {
        if (viewName) {
            let contentView = this.shadowRoot.querySelector("#content-" + viewName);
            if (contentView) {
                contentView.setAttribute("hidden", "");
            }
        }
    }

    _onFileUploadSuccess(e, detail, sender) {
        this._isDirty = true;
        this._loading = true;
        this.set("_fileName", detail.originalFileName);

        let fileDetails = {
            "file": detail.file,
            "fileName": detail.fileName,
            "originalFileName": detail.originalFileName
        };

        this.set("_fileDetails", fileDetails);

        let url = "";
        if (this.customizeMappings) {
            this._currentCOPService = "getHeaderFields";
            url = "/data/cop/getHeaderFields";
        } else {
            this._currentCOPService = "process";
            url = "/data/cop/process";
        }
        this._generateCopRequest(url, this._fileDetails);

        this.async(function () {
            //Clear file upload
            this.$$('pebble-file-upload').reset();
        });
    }
    
    _generateCopRequest(url, fileDetails) {
        let formData = new FormData();
        formData.append("file", fileDetails.file);
        formData.append("fileName", fileDetails.fileName);

        let hotline = false;
        if (DataHelper.isHotlineModeEnabled()) {
            hotline = true;
        }

        let req = DataRequestHelper.createImportRequest(fileDetails, this.copContext,
            hotline);
        if (this._currentCOPService == "process") {
            this._workAutomationId = DataHelper.generateUUID();
            req.dataObject.properties.workAutomationId = this._workAutomationId;
        }

        if (this._currentCOPService == "getHeaderFields") {
            let copMappingContext = this.mappingConfig["cop-mapping-context"];
            req.dataObject.dataObjectInfo.dataObjectType = copMappingContext.dataObjectType;
            req.dataObject.properties.service = copMappingContext.service;

            //Set properties for headerFields
            req.dataObject.properties.fileId = "";
            if (copMappingContext.excludeSubType) {
                delete req.dataObject.properties.subtype;
            }

            if (copMappingContext.excludeOrder) {
                delete req.dataObject.properties.order;
            }
        }

        formData.append("requestData", JSON.stringify(req));

        let xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.responseType = 'json';
        xhr.onload = function (e) {
            //Process triggred in async manner, so track the details through workAutomationId
            if (this._currentCOPService == "process") {
                return;
            }

            if (e.currentTarget && e.currentTarget.response) {
                let response = e.currentTarget.response;
                e.detail = {
                    "response": response
                }
                if ((response.response && response.response.status == "success") ||
                    (response.dataObjectOperationResponse && response.dataObjectOperationResponse
                        .status == "success")) {
                    this._onCOPSuccess(e);
                } else {
                    this._onCOPFailure(e);
                }

            }
        }.bind(this);
        xhr.send(formData);
        //After sending the form data show workAutomationId to user
        if (this._currentCOPService == "process") {
            this._onCOPProcessComplete();
        }
    }

    async _setContexts() {
        this.contexts = await ContextModelManager.getContextTypesBasedOnDomain(this.domain);

        if (this.contexts && this.contexts.length) {
            //Fetch externalNames
            let entityTypeModelGetEl = this.$$("#getEntityTypeModel");
            if (entityTypeModelGetEl) {
                let eTypeIds = [];
                if (this.contexts && this.contexts.length) {
                    for (let i = 0; i < this.contexts.length; i++) {
                        eTypeIds.push(this.contexts[i] + "_entityType"); //context
                    }
                }
                entityTypeModelGetEl.requestData = DataRequestHelper.createGetModelRequest("entityType", eTypeIds);
                entityTypeModelGetEl.generateRequest();
            }
        } else {
            this.logError("rock-entity-upload - Contexts not available in " + this.domain + "_entityContextModel");
            this._loading = false;
        }
    }

    _onEntityTypeModelReceived(e, detail) {
        if (DataHelper.isValidObjectPath(detail, "response.content.entityModels")) {
            let entityModels = detail.response.content.entityModels || [];
            let entityTypeExternalNames = {};
            for (let i = 0; i < entityModels.length; i++) {
                entityTypeExternalNames[entityModels[i].name] = entityModels[i].properties
                    .externalName;
            }

            this.entityTypeExternalName = entityTypeExternalNames[this.entityType];
            delete entityTypeExternalNames[this.entityType];
            this.contextExternalNames = entityTypeExternalNames; // Remaining context names
        } else {
            this.logError("rock-entity-upload - Entity type model not found for " + this.entityType, detail);
        }
        this._loadMappingComponent();
    }

    _onEntityTypeModelFailed(e, detail) {
        this.logError("rock-entity-upload - Entity type model get exception", e.detail);
        this._loadMappingComponent();
    }

    _loadMappingComponent() {
        this._loading = false;
        this._isDirty = false;
        this._setSelectedOptions();

        if (this.skipContextMapping) {
            this._importAttributeComponent(); //Attribute Mappings
        } else {
            this._importContextComponent(); //Context Mappings
        }
    }

    _onCOPSuccess(e) {
        let response = e.detail.response;
        let statusMessage = DataHelper.validateAndGetMessage(response);
        if (statusMessage == "") {
            let res = response.response ? response.response : response;
            if (this._currentCOPService == "getHeaderFields") {
                this.headerFields = [];
                this.attributeFields = [];
                this.fileFormat = "";
                let workAutomationId = "";
                if (DataHelper.isValidObjectPath(res, "dataObjectOperationResponse.statusDetail.message.headers")) {
                    let resHeaders = res.dataObjectOperationResponse.statusDetail.message.headers;
                    this.headerFields = resHeaders.entities;
                    this.fileFormat = resHeaders.format || "Excel";
                    //If skipContextMapping - true coming from config, then do not set based on headers
                    if (!this.skipContextMapping) {
                        this.skipContextMapping = resHeaders.skipContextMapping;
                    }
                }

                if (DataHelper.isValidObjectPath(res,
                    "dataObjectOperationResponse.statusDetail.message.workAutomationId"
                )) {
                    workAutomationId = res.dataObjectOperationResponse.statusDetail.message
                        .workAutomationId;
                }

                if (!this.headerFields || this.headerFields.length == 0) {
                    this.logError(
                        "Unable to continue with mappings customization.", e.detail
                    );
                    this._loading = false;
                    this._isDirty = false;
                    return;
                }
                //Fetch contexts, taxonomies, external names and domain
                this._setContexts();
            } else if (this._currentCOPService == "process") {
                this._onCOPProcessComplete();
            }
        } else {
            this.logError("rock-entity-upload - COP response error", e.detail);
            this.logError(statusMessage +
                ". Check the service.", e.detail);
            this._isDirty = false;
            this._loading = false;
        }
    }

    _onCOPFailure(e) {
        this.logError(
            "Unable to transform excel to json. Check the service.", e.detail
        );
        this._loading = false;
        this._isDirty = false;
    }

    _onCOPProcessComplete() {
        let _entityType = "";
        if (!_.isEmpty(this.contextData)) {
            let _itemContext = ContextHelper.getFirstItemContext(this.contextData);
            if (_itemContext) {
                _entityType = _itemContext.type;
            }
        }
        let data = {
            "messages": [{
                "message": "Entities will be created/updated using the uploaded file."
            },
            {
                "message": "You can view the status of the task " + this._workAutomationId +
                    " in the Task Details"
            }
            ],
            "actions": [{
                "name": "closeFunction",
                "text": "Take Me back to Where I started",
                "action": {
                    "name": "refresh-data"
                }
            },
            {
                "name": "gotoTaskDetails",
                "text": "Show me the task details",
                "dataRoute": "task-detail",
                "queryParams": {
                    "id": this._workAutomationId
                }
            },
            {
                "name": "nextAction",
                "text": "Upload more entities",
                "dataRoute": "upload-excel",
                "queryParams": {
                    "type": _entityType
                }
            }
            ]
        };
        this.businessFunctionData = data;
        ComponentHelper.getParentElement(this).businessFunctionData = data;
        let eventName = "onSave";
        let eventDetail = {
            name: eventName,
            data: {
                "skipNext": this.skipNext
            }
        };
        this._loading = false;
        this.fireBedrockEvent(eventName, eventDetail, {
            ignoreId: true
        });
    }

    _onSkipTap() {
        //Fetch contexts, taxonomies, external names and domain
        this._loading = true;
        this._setContexts();
    }

    _hideButtons() {
        let parentEl = ComponentHelper.getParentElement(this);
        if (parentEl && parentEl.hideCreateButtons) {
            parentEl.hideCreateButtons();
        }
    }

    _disableActions() {
        let saveButton = this.shadowRoot.querySelector("#next");
        let cancelButton = this.shadowRoot.querySelector("#skip")
        saveButton.setAttribute("disabled", true);
        cancelButton.setAttribute("disabled", true);
    }

    _onMappingsChange(e) {
        let chkbox = e.currentTarget;
        if (chkbox.checked) {
            this.customizeMappings = true;
        } else {
            this.customizeMappings = false;
        }
    }

    /**
     * <b><i>Content development is under progress... </b></i> 
     */
    getIsDirty() {
        return this._isDirty;
    }

    _exportDialogOpen() {
        let exportDialog = this.shadowRoot.querySelector("#exportDialog");

        if (exportDialog) {
            exportDialog.dialogTitle = "Download Smart Excel Template";
            this._selectedCategories = [];
            exportDialog.open();
        }
    }

    _onCancelDownloadSelection() {
        let exportDialog = this.shadowRoot.querySelector("#exportDialog");

        if (exportDialog) {
            exportDialog.close();
        }
    }

    _getDownloadRequest(entityTypes, fileName, contexts) {
        let req = DataRequestHelper.createGetManageModelRequest(entityTypes);
        req.fileName = fileName;
        if (!_.isEmpty(contexts)) {
            req.params.options = {
                "coalesceOptions": {
                    "enhancerAttributes": contexts
                }
            }
        }
        return req;
    }

    _exportSelectedCategory(e) {
        this._downloadInProgress = true;
        let contexts = [];
        let firstItemContext = this.getFirstItemContext();
        let fileName = _.isEmpty(this._selectedCategories) ? "EntityTypeTemplate" : "CategoryTemplate";
        let categoryPathSeperator = this.appSetting('dataDefaults').categoryPathSeparator;
        if (DataHelper.isValidObjectPath(this.selectedPath, "properties.pathEntityInfo.0.pathSeperator")) {
            categoryPathSeperator = this.selectedPath.properties.pathEntityInfo[0].pathSeperator;
        }
        this._selectedCategories.forEach(function (category) {
            let context = {};
            context[this.selectedPath.name] = category.externalNamePath;
            contexts.push(context);
        }, this);

        if (this._selectedCategories.length == 1) {
            fileName = this._selectedCategories[0].value.replace(/\W/g, '_');
        }

        if (firstItemContext && firstItemContext.type) {
            let req = this._getDownloadRequest([firstItemContext.type], fileName, contexts);

            let _this = this;
            RUFUtilities.fileDownload("/data/cop/downloadModelExcel", {
                httpMethod: 'POST',
                data: {
                    data: JSON.stringify(req)
                },
                fileName: fileName,
                successCallback: function (url) {
                    this._downloadInProgress = false;
                }.bind(_this),
                failCallback: function (responseHtml, url, error) {
                    this._onCOPDownloadFailure(error);
                }.bind(_this)
            });

        } else {
            this.logError("Entity type required to download template", e.detail);
            this._downloadInProgress = false;
        }
    }

    _onCOPDownloadFailure(e) {
        this.logError("Failed to download category model template", e);
        this._downloadInProgress = false;
    }

    _importContextComponent() {
        let copCtx = DataHelper.cloneObject(this.copContext);
        let mappingData = {
            "headerFields": this.headerFields || [],
            "contexts": this.contexts,
            "domain": this.domain,
            "entityTypeExternalName": this.entityTypeExternalName,
            "contextExternalNames": this.contextExternalNames,
            "fileFormat": this.fileFormat || "Excel",
            "selectedOptions": this.selectedOptions
        }

        this._loading = false;
        let eventName = "onNext";
        let eventDetail = {
            name: eventName,
            data: {}
        }
        //Prepare mapping data, and pass the same as businessFunctionData
        if (!this.businessFunctionData) {
            this.businessFunctionData = {};
        }
        this.businessFunctionData["context-mapping-data"] = mappingData;
        ComponentHelper.getParentElement(this).businessFunctionData = this.businessFunctionData;
        this.fireBedrockEvent(eventName, eventDetail, {
            ignoreId: true
        });
    }

    _importAttributeComponent() {
        let copCtx = DataHelper.cloneObject(this.copContext);
        let mappingData = {
            "headerFields": this.headerFields || [],
            "contexts": this.skipContextMapping ? [] : this.contexts,
            "domain": this.domain,
            "fileFormat": this.fileFormat || "Excel",
            "selectedOptions": this.selectedOptions,
            "isAplusSheet": this.skipContextMapping ? false : true
        }

        //Prepare mapping data, and pass the same as businessFunctionData
        if (!this.businessFunctionData) {
            this.businessFunctionData = {};
        }
        this.businessFunctionData["attribute-mapping-data"] = mappingData;
        ComponentHelper.getParentElement(this).businessFunctionData = this.businessFunctionData;

        let eventName = "onNext";
        let eventDetail = {
            name: eventName,
            data: {
                //"skipNext": true
            }
        }
        this.fireBedrockEvent(eventName, eventDetail, {
            ignoreId: true
        });
        this._loading = false;
    }

    _onBackTap(e) {
        let eventName = "onBack";
        let eventDetail = {
            name: eventName,
            data: {}
        }
        this.fireBedrockEvent(eventName, eventDetail, {
            ignoreId: true
        });
    }

    _showEvent(event) {
        //nextEvent is for upload success, so no button needed
        if (!_.isEmpty(event) && event.id != "nextEvent") {
            return true;
        }

        return false;
    }

    _onTriggerEvent(e, detail) {
        let event = e.target.getAttribute("id");
        if (event == "backEvent") {
            this._onBackTap(e);
        } else if (event == "skipEvent") {
            this._onSkipTap(e);
        }
    }

    _setSelectedOptions() {
        if (this.businessFunctionData && this.businessFunctionData.selectedOptions) {
            this.selectedOptions.role = this.businessFunctionData.selectedOptions.role.id || "_DEFAULT";
            this.selectedOptions.ownershipData = this.businessFunctionData.selectedOptions.ownershipData.title || "_DEFAULT";
            this.selectedOptions.saveType = this.businessFunctionData.selectedOptions.saveType || "self";
        }
    }

    _onUploadModeChange() {
        if (this.uploadMode && this.uploadMode.toLowerCase() == "mappings") {
            this.customizeMappings = true;
        } else {
            this.customizeMappings = false;
        }
    }
}
customElements.define(RockEntityUpload.is, RockEntityUpload);
