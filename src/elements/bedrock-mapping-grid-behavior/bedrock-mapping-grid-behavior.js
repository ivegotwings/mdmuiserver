import '@polymer/polymer/polymer-legacy.js';
import '../bedrock-app-context-behavior/bedrock-app-context-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
/***
* `RUFBehaviors.MappingGridBehavior` provides common properties for rock-attribute-mapping-grid and rock-value-mapping-grid
*
*  ### Example
*
*     <dom-module id="x-app">
*        <template>
*        </template>
*        <script>
*           Polymer({
*             is: "x-app",
*
*             behaviors: [
*               RUFBehaviors.MappingGridBehavior
*             ],
*
*             properties: {
*              
*             }
*           });
*        &lt;/script>
*     </dom-module>
*/

window.RUFBehaviors = window.RUFBehaviors || {};
/** @polymerBehavior RUFBehaviors.MappingGridBehavior */
RUFBehaviors.MappingGridBehaviorImpl = {
    properties: {
        contextData: {
            type: Object,
            value: function () { return {}; }
        },

        modelContextData: {
            type: Object,
            value: function () { return {}; }
        },

        mappingConfig: {
            type: Object,
            value: function () { return {}; }
        },

        mappingData: {
            type: Object,
            value: function () { return {}; }
        },

        _deletedMappings: {
            type: Array,
            value: function () {
                return [];
            }
        },

        _loading: {
            type: Boolean,
            value: false
        },

        _taxonomies: {
            type: Array,
            value: function () {
                return [];
            }
        },

        _contexts: {
            type: Array,
            value: function() {
                return [];
            }
        },

        _gridData: {
            type: Array,
            value: function () { return []; }
        },

        _isMappingChanged: {
            type: Boolean,
            value: false
        },

        _dirtyCheckConfirmationMessage: {
            type: String,
            value: "Are you sure you want to discard the unsaved changes?"
        }
    },

    observers: [
        "_onMappingsDataChange(mappingData, contextData, copContext, mappingConfig)"
    ],

    get getMappingsLiq() {
        this._getMappingsLiq = this._getMappingsLiq || this.shadowRoot.querySelector("#getMappings");
        return this._getMappingsLiq;
    },

    get liquidAttributeModelGetLiq() {
        this._liquidAttributeModelGet = this._liquidAttributeModelGet || this.shadowRoot.querySelector("[name=liquidAttributeModelGet]");
        return this._liquidAttributeModelGet;
    },

    _onMappingsDataChange() {
        throw new Error('_onMappingsDataChange not implemented');
    },

    _sendMappingRequest(req) {
        if(this.getMappingsLiq) {
            this.getMappingsLiq.requestData = req;
            this.getMappingsLiq.generateRequest();
        }
    },

    _prepareContexts: function(inputContexts) {
        let _contexts = [];
        for(let i = 0; i < inputContexts.length; i++) {
            let context = {};
            if(this.selectedDimensions && 
                this.selectedDimensions[inputContexts[i]] && 
                this.selectedDimensions[inputContexts[i]].length) {
                context.type = inputContexts[i];
                context.value = this.selectedDimensions[inputContexts[i]][0];
            } else {
                context.type = inputContexts[i];
                context.value = "_DEFAULT";
            }
            _contexts.push(context);
        }

        return _contexts;
    },

    _isValidResponseStatus(detail) {
        return DataHelper.isValidObjectPath(detail, "response.response.status") && 
                    detail.response.response.status.toLowerCase() == "success";
    },

    _isDataAvailable: function (data) {
        return data && data.length > 0;
    },

    _onAddTap: function (data) {
        const gridData = Object.assign({
            "source": "ui",
            "action": "new",
            "index": this._gridData.length
        }, data);

        this.push("_gridData", gridData);
        this._isMappingChanged = true;
    },

    _onDeleteTap: function (predicat) {
        let grid = this.mappingGrid;
        if (!grid) return;

        let selectedItems = grid.getSelectedItems();
        if (selectedItems.length == 0) {
            //Show message if needed - Please select an item for delete
            return;
        }
        let gridData = [];
        for (let i = 0; i < this._gridData.length; i++) {
            let isDelete = false;
            for (let j = 0; j < selectedItems.length; j++) {
                if(predicat(this._gridData[i], selectedItems[j]) && this._gridData[i].index == selectedItems[j].index) {
                    isDelete = true;
                    break;
                }
            }

            if (!isDelete) {
                gridData.push(this._gridData[i]);
            } else {
                if (this._gridData[i].action != "new") {
                    this._gridData[i].action = "deleted";
                    this._deletedMappings.push(this._gridData[i]);
                }
                this._isMappingChanged = true;
            }
        }

        //Reset row index
        for(let i = 0; i < gridData.length; i++) {
            gridData[i].index = i;
        }

        this.set("_gridData", gridData);
    },

    _onContextsChanged: function(e, detail) {
        if(!detail && !detail.dimensions) {
            return;
        }
        let dimensions = detail.dimensions;
        if(!this._contexts || this._contexts.length == 0) {
            return;
        }

        let isContextAvailable = false;
        for(let ctxIdx = 0;  ctxIdx < this._contexts.length; ctxIdx++) {
            if(dimensions[this._contexts[ctxIdx]] && dimensions[this._contexts[ctxIdx]].length > 0) {
                isContextAvailable = true;
                break;
            }
        }

        if(!isContextAvailable) {
            return;
        }

        this.debounce('loadMappings', function () {
            //Load mappings
            this._loadMappings();
        }, 1000);
    },

    _loadMappings: function() {
        if(this.contextSelector) {
            let selectedDimensions = DataHelper.cloneObject(this.contextSelector.selectedDimensions);

            this.selectedDimensions = selectedDimensions;
            this._resetMappings(); // Reset before get
            this._getMappings(); // Get mappings based on dimensions
        }
    },

    _triggerDirtyCheck: function (component) {
        if (this._isMappingChanged) {
            this._openDirtyCheckDialog(component);
            return;
        }

        this._triggerEvent();
    },

    _openDirtyCheckDialog: function(component) {
        let id = "#" + component + "-mappings-dirty-check-Dialog";
        let dialog = this.shadowRoot.querySelector(id);

        if(dialog) {
            dialog.open();
        }
    },

    _triggerEvent: function () {
        let data = {};
        if (this.skipStep && this.currentEventName) {
            if (this.currentEventName.toLowerCase() == "onnext") {
                data.skipNext = this.skipStep;
            } else if (this.currentEventName.toLowerCase() == "onback") {
                data.skipBack = this.skipStep;
            }
        }

        let eventDetail = {
            name: this.currentEventName,
            data: data
        }

        this.fireBedrockEvent(this.currentEventName, eventDetail, {
            ignoreId: true
        });

        //reset
        this.currentEventName = "";
        this.currentEventDetails = {};
        this._isMappingChanged = false;
    },

    _isContextsAvailable: function (_contexts) {
        return !_.isEmpty(_contexts);
    }
};

/** @polymerBehavior */
RUFBehaviors.MappingGridBehavior = [RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior, RUFBehaviors.MappingGridBehaviorImpl];
