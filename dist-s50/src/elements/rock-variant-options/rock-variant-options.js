import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-business-function-behavior/bedrock-business-function-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../liquid-config-get/liquid-config-get.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-rest/liquid-rest.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import '../rock-grid/rock-grid.js';
import '../pebble-button/pebble-button.js';
import '../pebble-spinner/pebble-spinner.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

class RockVariantOptions
    extends mixinBehaviors([
        RUFBehaviors.AppBehavior,
        RUFBehaviors.BusinessFunctionBehavior,
        RUFBehaviors.ComponentConfigBehavior,
        RUFBehaviors.AppContextBehavior,
        RUFBehaviors.UIBehavior
    ], PolymerElement) {
    static get template() {
        return html`
        <style include="bedrock-style-common bedrock-style-grid-layout bedrock-style-padding-margin bedrock-style-buttons">
            :host {
                display: block;
                height: 100%;
            }

            .refresh-grid {
                position: absolute;
                right: 0px;
                top:0px;
            }
            .w-80{
                width:80%;
            }
        </style>

        <div class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <div id="content-description" align="center" class="p-relative">
                    <!-- description message here -->
                    <div class="title m-0 w-80">
                        You can create multiple variants.
                    </div>
                    <template is="dom-if" if="[[!isExceededMaxThreshold]]">
                        <div class="refresh-grid">
                            <pebble-button id="refreshButton" button-text="Refresh" on-tap="_onRefreshClick" noink="" class="btn btn-primary"></pebble-button>
                        </div>
                    </template>
                </div>
                <template is="dom-if" if="[[isNotificationMessage]]">
                    <div class="m-20" align="center">
                        [[notificationMessage]]
                    </div>
                </template>
                <template is="dom-if" if="[[_isValidDisplayMessage]]">
                    <div class="m-20" align="center">
                        [[displayMessage]]
                    </div>
                </template>
            </div>
            <pebble-spinner active="[[isSpinnerActive]]"></pebble-spinner>   
            <div class="base-grid-structure-child-2">
                <div class="button-siblings">
                    <template is="dom-if" if="[[isVariantOptionsGridReady]]">
                        <rock-grid id="variantOptionsGrid" data="{{variantOptionsGridData}}" hide-view-selector="" hide-toolbar="" config="{{gridConfig}}" page-size="10"></rock-grid>
                    </template>
                </div>
                <div class="buttonContainer-static" align="center">
                    <pebble-button id="backButton" class="close btn btn-secondary m-r-5" button-text="Back" noink="" elevation="2" on-tap="_onBack"></pebble-button>
                    <pebble-button id="cancelButton" class="close btn btn-secondary m-r-5" button-text="Cancel" noink="" elevation="2" on-tap="_onCancel"></pebble-button>
                    <pebble-button id="confirmButton" class="apply btn btn-success" disabled="[[isCreateDisabled]]" button-text="Create" noink="" elevation="2" on-tap="_onCreate"></pebble-button>
                </div>
            </div>
        </div>

        <liquid-rest id="variantOptions" url="/data/pass-through/entityappservice/generatevariants" method="POST" on-liquid-response="_onVariantOptionsReceivedSuccess" on-liquid-error="_onVariantOptionsReceivedFailure"></liquid-rest>        
        <liquid-entity-data-save id="syncEntityCreate" operation="[[_entityDataOperation]]" on-response="_onSyncEntityCreateSuccess" on-error="_onSyncEntityCreateError"></liquid-entity-data-save>
        <bedrock-pubsub event-name="grid-data-loaded" handler="_onVariantGridLoaded" target-id="variantOptionsGrid"></bedrock-pubsub>
    `;
    }

    static get is() { return 'rock-variant-options' }

    connectedCallback() {
        super.connectedCallback();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.selectAllVariants = false;
    }

    static get properties() {
        return {
            contextData: {
                type: Object,
                value: function () {
                    return {};
                },
                observer: '_contextChanged'
            },

            config: {
                type: Object,
                value: function () {
                    return {};
                }
            },

            gridConfig: {
                type: Object,
                value: function () {
                    return {};
                }
            },

            masterVariantsData: {
                type: Array,
                value: function () {
                    return [];
                }
            },

            variantOptionsGridData: {
                type: Array,
                value: function () {
                    return [];
                }
            },
            isVariantOptionsGridReady: {
                type: Boolean,
                value: false
            },

            isExceededMaxThreshold: {
                type: Boolean,
                value: false
            },

            isWarningMessage: {
                type: Boolean,
                value: false
            },

            _isValidDisplayMessage: {
                type: Boolean,
                computed: "_showDisplayMessage(isExceededMaxThreshold, isWarningMessage)"
            },

            displayMessage: {
                type: String,
                value: ""
            },

            isNotificationMessage: {
                type: Boolean,
                value: false
            },

            notificationMessage: {
                type: String,
                value: ""
            },

            businessFunctionData: {
                type: Object,
                value: function () { return {}; }
            },

            isSpinnerActive:{
                type: Boolean,
                value: false
            },
            
            _entityDataOperation: {
                type: String,
                value: 'update'
            },

            isCreateDisabled: {
                type: Boolean,
                computed: '_isCreateDisabled(variantOptionsGridData,isWarningMessage)'
            },

            copContext: {
                type: Object,
                value: function () { return {}; }
            }                        
        }
    }

    /**
     *  Request the required configs
     */
    _contextChanged() {
        if (!_.isEmpty(this.contextData)) {
            let context = DataHelper.cloneObject(this.contextData);
            this.requestConfig('rock-variant-options', context);
        }
    }

    /**
     *  Handle config loaded event
     */
    onConfigLoaded(componentConfig) {
        if (componentConfig && componentConfig.config) {
            this.config = componentConfig.config;
            this.maxThresholdForDisplay = componentConfig.config.maxVariantsForDisplay;
            this.maxThresholdForSyncCreate = componentConfig.config.maxThresholdForSyncCreate;
            //load the variants
            this._loadVariantOptions();
        } else {
            this.logWarning("Config not found for rock-variant-options", "response", componentConfig);
        }
    }

    /**
     *  Function to load the variant options
     */
    _loadVariantOptions() {
        if (!_.isEmpty(this.businessFunctionData.attributeModels)) {                        
            this.attributeModels = this.businessFunctionData.attributeModels;

            //Update the gridConfig with dynamic columns
            this._updateGridConfig();

            //generate a request to get the grid data 
            this._showVariantOptions();                        
        }
    }

    /**
     *  Function to update the gridConfig with dynamic fields
     */
    _updateGridConfig() {
        let columns = {};
        let gridConfig = DataHelper.cloneObject(this.config.gridConfig);
        let gridConfigColumn = gridConfig.itemConfig.fields;
        for (let key in gridConfigColumn) {
            columns[key] = gridConfigColumn[key];
        }
        
        for (let i = 0; i < this.businessFunctionData.attributeList.length; i++) {
            let model = this.attributeModels[this.businessFunctionData.attributeList[i]];
            if (model) {
                columns[model.name] = {
                    "header": model.externalName,
                    "name": model.name,
                    "sortable": true,
                    "filterable": true,
                    "visible": true,
                    "isMetaDataColumn": false
                };
            }
        }

        gridConfig.itemConfig.fields = columns;
        this.gridConfig = gridConfig;
    }

    /**
     *  Display the variant options screen
     */
    _showVariantOptions() {
        if (this.businessFunctionData.totalVariantsCount > this.maxThresholdForDisplay) {
            //this.displayMessage = "The total number of variants that can be generated has crossed the configured max threshold value. Click on create button to create all the variants.";
            this.displayMessage = "".concat("The estimated number of variants (", this.businessFunctionData.totalVariantsCount, ") exceeds the configured max threshold value (", this.maxThresholdForDisplay, "). Click on create button to start variant generation.");
            this.isExceededMaxThreshold = true;
        } else {
            //Display the message
            if (this.businessFunctionData.noNotification) {
                this.isNotificationMessage = true;
                this.notificationMessage = "Saving attribute values took longer than expected. If you do not see your latest combinations in the list, click refresh button after some time.";
            }

            //Get the attributeModels
            this.isExceededMaxThreshold = false;
            this.variantOptionsGridData = [];
            this._getVariantOptions();
        }
    }

    /**
     *  Handle refresh button click
     */
    _onRefreshClick() {
        this._showVariantOptions();
    }

    /**
     *  Request the variant options available
     */
    _getVariantOptions() {
        //Displaying the variants is taking sometime, hence showing the loader
        this.isSpinnerActive = true;
        this.createVariants = false;
        let requestData = this._getVariantOptionsRequest();
        let liquidObj = this.shadowRoot.querySelector("#variantOptions");

        //Fetch all possible variants  
        if (requestData && liquidObj) {
            liquidObj.requestData = requestData;
            liquidObj.generateRequest();
        }
    }

    /**
     *  Check if the displayMessage has to be shown
     */
    _showDisplayMessage() {
        if (this.isExceededMaxThreshold || this.isWarningMessage) {
            return true;
        } else {
            return false;
        }
    }

    /**
     *  Create the request obj for getting the variants
     */
    _getVariantOptionsRequest(pFlag) {
        let createVariants = "true";
        if (!pFlag) {
            createVariants = "false";
        }

        if (this.businessFunctionData) {
            let request = {
                "params": {
                    "createVariants": createVariants
                },
                "entity": {
                    "id": this.businessFunctionData.id,
                    "name": this.businessFunctionData.name,
                    "type": this.businessFunctionData.type
                }
            }

            //Adding the context to the request if available
            if (!_.isEmpty(this.contextData.Contexts)) {
                request.entity.data = {};
                let contexts = request.entity.data.contexts = [];
                let contextObj = {};
                contextObj.context = this.contextData.Contexts[0];
                contexts.push(contextObj);
            }

            return request;
        }
    }

    /**
     *  Handle the get variants options success
     */
    async _onVariantOptionsReceivedSuccess(e) {
        this.isSpinnerActive = false;
        if (e.detail && e.detail.response && e.detail.response.response) {
            let response = e.detail.response.response;
            let request = e.detail.response ? e.detail.response.request : undefined;
            this.isWarningMessage = false;
            this.selectAllVariants = false;
            
            if (response.status == "success" && !this.createVariants) {
                //Display the variants grid
                this.masterVariantsData = await DataTransformHelper.transformEntitiesToVariantGridFormat(response.entities, this._getGridColumns());
                //Display only leaf level entitites
                let leafLevelEntity = _.max(this.businessFunctionData.targetEntities, function(targetEntity){ return targetEntity.levelNumber; });
                let gridData = this.masterVariantsData[leafLevelEntity.targetEntity];
                //Show the entities with status new on the top
                this.variantOptionsGridData = _.sortBy(gridData, 'variantStatus').reverse();
                this.isVariantOptionsGridReady = true;    
                this.selectAllVariants = true;                                                
            } else if (response.status == "success" && this.createVariants) {
                this._taskId = request.taskId;
                this._triggerFinishStep();
            } else if (response.status == "error") {
                this.isWarningMessage = true;
                this.displayMessage = "No variants to create. Update the dimension attributes from the previous screen to generate variants"
                return;
            }
        }
    }

    /**
     *  Function to select all the grid data by default if total no. of variants crosses the configured maxThresholdForSyncCreate value
     */
    _onVariantGridLoaded() {
        if(!_.isEmpty(this.variantOptionsGridData) && this.selectAllVariants && (this.variantOptionsGridData.length > this.maxThresholdForSyncCreate)) {
            let rockGridObj = this.shadowRoot.querySelector('#variantOptionsGrid') ;
            rockGridObj.selectAll();                                   
        }
    }

    /**
     *  Function to get the grid columns
     */
    _getGridColumns() {
        if (this.gridConfig && this.gridConfig.tabular && this.gridConfig.tabular.columns) {
            return this.gridConfig.tabular.columns;
        }
        let columns = [];
        if (DataHelper.isValidObjectPath(this.gridConfig, 'itemConfig.fields')) {
            columns = DataHelper.convertObjectToArray(this.gridConfig.itemConfig.fields);
        }
        return columns;
    }

    /**
     *  Handle the get variants options failure
     */
    _onVariantOptionsReceivedFailure(e) {
        this.isSpinnerActive = false;
        this.logError("Failed to fetch variant options", e.detail);
    }

    /**
     *  Close variant options 
     */
    _onCancel() {
        let eventName = "onCancel";
        let eventDetail = {
            name: eventName
        }

        this.fireBedrockEvent(eventName, eventDetail, {
            ignoreId: true
        });
    }

    /**
     *  Go Back to variant dimetion attribute screen 
     */
    _onBack() {
        let eventName = "onBack";
        let eventDetail = {
            name: eventName
        }

        this.fireBedrockEvent(eventName, eventDetail, {
            ignoreId: true
        });
    }

    /**
     * Function to check if the create button has to be disabled
     */
    _isCreateDisabled(gridData, isWarningMessage) {
        if (!_.isEmpty(gridData)) {
            let existsItems = _.filter(gridData, function(item){ return item.variantStatus.toLowerCase() == "exists"; });
            //If all the items in the grid are having status as exists,then disable the create button
            if(existsItems.length == gridData.length) {
                return true;
            }
        } else if (_.isEmpty(gridData) && isWarningMessage){ 
            // When "No variants are displayed" disable the create button
            return true;
        }

        return false;
    }

    /**
     *  Generate a request to create variants
     *  Use createvariants API if the grid is not displayed or if all the entities are selected by default
     *  Use the sync create/update API if the grid is displayed and entities may be excluded
     */
    _onCreate() {
        this.isSpinnerActive = true;
        let requestData = {};
        let liquidObj = {};
        
        if (!this.isExceededMaxThreshold) {
            let rockGridObj = this.shadowRoot.querySelector('#variantOptionsGrid');
            let selectedEntities = rockGridObj.getSelectedItems();
            if (selectedEntities.length <= 0) {
                this.showInformationToast("Select at least one entity from grid to create.");
                this.isSpinnerActive = false;
                return;
            } else if (selectedEntities.length <= this.maxThresholdForSyncCreate) {
                //Create or update entities in sync mode
                this._currentIndex = selectedEntities.length;
                this._currentItems = [];  
                let additionalEntities = this._getSelectedEntitiesParents(selectedEntities);                          
                if(!_.isEmpty(additionalEntities)){
                    selectedEntities = selectedEntities.concat(additionalEntities); 
                }
                for (let i = 0; i < selectedEntities.length; i++) {
                    //update or create based on requirement
                    if(selectedEntities[i].orgVariantStatus == "newForContext"){
                        this._entityDataOperation = "update";
                    } else {
                        this._entityDataOperation = "create";                                   
                    }
                    requestData = this._getSyncCreateRequest(selectedEntities[i]);
                    liquidObj = this.shadowRoot.querySelector("#syncEntityCreate");
                    liquidObj.requestData = requestData;
                    liquidObj.generateRequest();
                }
            } else { 
                //If all the variants in the grid are selected and no exclusions are there, invoke createVariants api 
                if(selectedEntities.length == this.businessFunctionData.totalVariantsCount){
                    this._createVariants();
                } else {
                    //Invoke cop request to create entities in batch job   
                    this._onBulkEntityCreate(selectedEntities);      
                }                        
            }
        } else {
            //Invoke createVariants api 
            this._createVariants();
        }                    
    }

    /**
     * Function to get the parent entities of the given selected entities 
     * If appendParentsToSelectedEntities is true , return the concatenated set of selected and parent entities
     **/
    _getSelectedEntitiesParents(selectedEntities, appendParentsToSelectedEntities){
        let tempParentEntityList = [];
        for (let i = 0; i < selectedEntities.length; i++) {
            //Get the parent entities for new variants only, ignore the newForContext
            if(selectedEntities[i].orgVariantStatus == "newForContext"){
                selectedEntities[i].action = "update";
            } else {
                selectedEntities[i].action = "create";
                //Get Selected Entity's relationships's id and type
                let key = Object.keys(selectedEntities[i].data.relationships)[0];
                if(key) {
                    let relToId = selectedEntities[i].data.relationships[key][0].relTo.id;
                    let relToType = selectedEntities[i].data.relationships[key][0].relTo.type;
                    //Do not add the root level parent to the tempParentEntityList  
                    if(relToId == this.businessFunctionData.id){
                        continue;
                    }
                    //Avoid adding duplicate parent entity
                    let matchFound = _.find(tempParentEntityList, function(item){ return item.id == relToId; });
                    //Add the parent entity
                    if(!matchFound) {
                        let parentEntity = DataHelper._findItemByKeyValue(this.masterVariantsData[relToType], "id", relToId);
                        parentEntity.action = "create";
                        tempParentEntityList.push(parentEntity);
                    }
                }
            }
        }

        if(appendParentsToSelectedEntities) {
            if(!_.isEmpty(tempParentEntityList)){
                selectedEntities = selectedEntities.concat(tempParentEntityList);
            }
            return selectedEntities;
        }

        return tempParentEntityList;
    }

    /**
     *  Function to create variants using createVariants api 
     */
    _createVariants(){
        this.createVariants = true;
        let requestData = this._getVariantOptionsRequest(this.createVariants);
        let liquidObj = this.shadowRoot.querySelector("#variantOptions");
        if (requestData && liquidObj) {
            requestData.clientAttributes = this.getClientAttributes();
            liquidObj.requestData = requestData;
            liquidObj.generateRequest();
        }
    }

    /**
     *  Function to get clientAttributes
     */
    getClientAttributes() {
        let valueContext = ContextHelper.getFirstValueContext(this.contextData);
        let userContext = ContextHelper.getFirstUserContext(this.contextData);
        let clientMessage = "Create Variants";

        let clientAttributes = {
            "taskName": {
                "values": [{
                    "source": valueContext.source,
                    "locale": valueContext.locale,
                    "value": clientMessage
                }]
            }
        };

        return clientAttributes;
    }

    /**
     *  Generate a request to create entities in sync mode
     */
    _getSyncCreateRequest(selectedEntity) {
        let saveRequest = {};
        saveRequest = {
            "entities": [selectedEntity]
        };
        return saveRequest;
    }

    /**
     *  Generate a request to create bulk entities
     */
    _onBulkEntityCreate(selectedEntities) {                   
        let formData = new FormData();
        let req = DataRequestHelper.createImportRequest({}, this.copContext);
        this._taskId = DataHelper.generateUUID();
        req.dataObject.properties.workAutomationId = this._taskId;                   
        req["userId"] = DataHelper.getUserId();
        req["JSONData"] = this._getSelectedEntitiesParents(selectedEntities,true);  
        formData.append("requestData", JSON.stringify(req));
        
        let xhr = new XMLHttpRequest();
        xhr.open('POST', '/data/cop/processJSON', true);
        xhr.responseType = 'json';
        xhr.onload = function (e) {
            if (e.currentTarget && e.currentTarget.response) {
                let response = e.currentTarget.response;
                e.detail = {
                    "response": response
                }
                if ((response.response && response.response.status == "success") ||
                    (response.dataObjectOperationResponse && response.dataObjectOperationResponse.status == "success")) {
                    this._onBulkCreateSuccess(e);
                } else {
                    this._onBulkCreateFailure(e);
                }

            }
        }.bind(this);                    
                            
        xhr.send(formData);
    }

    _onBulkCreateSuccess(e) {
        let response = e.detail.response;
        if (response && response.dataObjectOperationResponse && response.dataObjectOperationResponse.status.toLowerCase() == "success") {
            this._triggerFinishStep();
        } else {
            this.logError("UnexpectedCOP - Bulk create request failed", e.detail);                     
        }
    }

    _onBulkCreateFailure(e) {
        this.isSpinnerActive = false;
        this.logError("UnexpectedCOP - Failed to perform the Bulk entity create", e.detail);
    }

    /**
     *  Handle success of sync create of selected entities 
     */
    _onSyncEntityCreateSuccess(e) {
        if (e.detail.response.status == "success") {
            this._currentItems.push(e.detail.response);
            //After all the required entities are created through sync mode, trigger  the last step
            if (this._currentItems.length == this._currentIndex) {
                this._triggerFinishStep(true);
            }
        }
    }

    /**
     *  Handle failure of sync create of selected entities 
     */
    _onSyncEntityCreateError(e) {
        this.isSpinnerActive = false;
        this.logError("Failed to create entity", e.detail);
    }

    /**
     *  Last step for create variants
     *  If pShowFirstActionOnly flag is true, then show only 1st button in the last screen
     */
    _triggerFinishStep(pShowFirstActionOnly) {
        this.isSpinnerActive = false;
        let message = "Variant creation process is started";

        //Refresh the entity graph page when user clicks on "Take me back to where I started" button
        let actions = [
            {
                "name": "goBack",
                "text": "Take me back to where I started",
                "action": { "name" : "grid-data-refreshed", "refreshFirstNode":true },
                "isNotApp": true
            }
        ];

        //Update the display message and add button to got to task details
        if (!pShowFirstActionOnly) {
            message = message + ", you can review the progress of the task " + this._taskId + " in task details.";

            actions.push({
                "name": "gotoJobDetails",
                "text": "Show me the task details",
                "isNotApp": true,
                "dataRoute": "task-detail",
                "queryParams": {
                    "id": this._taskId
                }
            })
        }

        let messages = [
            {
                "message": message
            }
        ]
        let data = {
            "messages": messages,
            "noGrid": true,
            "actions": actions,
        };

        this.businessFunctionData = data;
        let eventName = "onComplete";
        let eventDetail = {
            name: eventName
        }

        this.fireBedrockEvent(eventName, eventDetail, {
            ignoreId: true
        });
    }
}

customElements.define(RockVariantOptions.is, RockVariantOptions)
