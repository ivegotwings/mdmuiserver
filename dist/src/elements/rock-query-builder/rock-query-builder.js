import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-card/paper-card.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-text-alignment.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../bedrock-app-context-behavior/bedrock-app-context-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-query-builder-behavior/bedrock-query-builder-behavior.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../pebble-button/pebble-button.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-textbox-collection/pebble-textbox-collection.js';
import '../pebble-textarea/pebble-textarea.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-textbox/pebble-textbox.js';
import '../pebble-lov/pebble-lov.js';
import '../pebble-data-table/pebble-data-table.js';
import '../rock-attribute-model-lov/rock-attribute-model-lov.js';
import '../rock-entity-type-model-lov/rock-entity-type-model-lov.js';
import '../rock-entity-lov/rock-entity-lov.js';
import '../rock-attribute-filter-popover/rock-attribute-filter-popover.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

class RockQueryBuilder extends mixinBehaviors([RUFBehaviors.UIBehavior,RUFBehaviors.AppContextBehavior,RUFBehaviors.QueryBuilderBehavior, RUFBehaviors.ComponentContextBehavior], PolymerElement) {
  static get template() {
    return Polymer.html`
    <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-grid-layout bedrock-style-icons bedrock-style-padding-margin bedrock-style-text-alignment">
        .queryBuilderContainer {
            position: absolute;
            width: 580px;
            top: 32px;
            right: 0;
            height: auto;
            border-radius: 3px;
            box-shadow: 0 0 var(--popup-box-shadow-size,8px) 0 var(--popup-box-shadow,#8A98A3);
            background-color: #fff;
            opacity: 0;
        }
        .queryBuilderContainer paper-card {
            width: 100%;
            box-shadow: none;
        }     
        .queryHeading {
            border-bottom: 1px solid var(--default-border-color, #c1cad4);
            padding: 5px 0;
            line-height: 0;            
            position: relative;
        }
        .queryHeadingButton {
            height: 18px;
            line-height: 15px;
            font-weight: 500;
            --pebble-button: {
                min-width: auto;
                padding-top: 0;
                padding-right: 0;
                padding-bottom: 0;
                padding-left: 0;
            }
        }
        .relationshipGridContainer {
            border-radius: 3px;
            width: 100%;
            margin: 5px auto 0 auto;
            box-shadow: 0 0 var(--popup-box-shadow-size,8px) 0 var(--popup-box-shadow,#8A98A3);
            position: relative;
            overflow-y: auto;
            padding: 0 2px 5px 2px;
        }
        .actionButtons {
            text-align: center;
        }
        pebble-textbox {
            --paper-input-container: {
                padding-top: 0px;
                padding-right: 0px;
                padding-bottom: 0px;
                padding-left: 0px;
                position: relative;
            }
        }        
        #inputDiv  pebble-textbox {
            --pebble-textbox-paper-input-style : {  
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;                  
                width: 90%;
            }
        }               
        data-table-row[header] {
           display: none;
        } 
        data-table-row:not([header]) {
            color: var(--palette-dark, #1a2028);
            font-size: var(--default-font-size, 12px);
            height: 100%;
            background-color: var(--palette-white, #ffffff);
        }        
        data-table-row:not([header]):hover,
        data-table-row[selected] {
            background-color: var(--table-row-selected-color, #c1cad4) !important;
        }        
        data-table-row:not([header]):hover data-table-checkbox,
        data-table-row[selected] data-table-checkbox {
            background-color: var(--palette-white, #ffffff) !important;
        }
        pebble-data-table {
            --data-table-container-position: relative;
            --pebble-data-table-header : {
                 display: none;
            };
            --list:{
                min-height:70px;
            }           
        }

        data-table-cell {
            height: 35px;
            padding-left: 20px;
            padding-right: 0;
            position: relative;
            flex-basis: auto!important;
        }
        data-table-cell #iconDiv {
            position: absolute;
            right: 6px;
            bottom: 5px;
        }
        data-table-cell #inputDiv {
            width: 100%;
        }
        #entityTypeFilterButton {
            --paper-button-text: {
                max-width: 74px;
            }  
        }        
        .queryHeadingReset {
            position: absolute;
            right: 0px;
            bottom: 11px;
        }
        .queryHeadingReset pebble-button {
            height: 18px;
            --pebble-button: {
                padding-top: 0;
                padding-right: 0;
                padding-bottom: 0;
                padding-left: 0;
                height: 18px;
            }
        }
        .relEntityContainer {
            padding: 5px;
            border-radius: 3px;
            width: 95%;
            margin: 0 auto;
            box-shadow: 0 0 var(--popup-box-shadow-size,8px) 0 var(--popup-box-shadow,#8A98A3);
            display: none;
        }

        .card-content {
            overflow-y: auto;
            max-height: 50vh;
        }

        .card-content-header {
            padding: 16px 0 0 16px;
        }
        paper-card{
            --paper-card-content:{
                padding-bottom:0;
            }
        }
        pebble-toggle-button {
          --pebble-toggle-button-checked-bar-color: var(--success-color, #4caf50);
          --pebble-toggle-button-checked-button-color: var(--success-color, #4caf50);
          --pebble-toggle-button-checked-ink-color: var(--success-color, #4caf50);
          min-width: 130px;
        }
        #overlay-div {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0,0,0,0.1);
            z-index: 2;
        }

        .scroll-wrapper {
            display: flex;
            flex-direction: column;
        }
    </style>   
        <div class="queryBuilderContainer">
            <paper-card>
                <!-- Entity Type search -->
                <div class="card-content-header">
                    <pebble-button id="entityTypeFilterButton" icon="pebble-icon:filter" button-text="{{selectedEntityTypeNames}}" title="{{selectedEntityTypeNames}}" dropdown-icon="" noink="" class="dropdownText dropdownIcon btn dropdown-outline-primary dropdown-trigger" is-ruf-component="" target-id="productSearchPopover" on-tap="_openLov"></pebble-button>
                    <template is="dom-if" if="{{_isRelationshipsExistsSearchEnabled}}">
                            <pebble-toggle-button class="m-l-20 m-b-10" checked="{{_hasRelationshipChecked}}" disabled\$="{{disableHasRelationshipExistSearchToggle}}">[[_toggleButtonText]]</pebble-toggle-button>
                    </template>
                    <template is="dom-if" if="{{!_isRelationshipsExistsSearchEnabled}}">
                            <pebble-button class="queryHeadingButton m-b-5 m-r-5 m-l-5" on-tap="" button-text="HAVING"></pebble-button>
                    </template>
                    <pebble-button id="relationshipButton" button-text="{{selectedRelationshipName}}" title="{{selectedRelationshipName}}" dropdown-icon="" noink="" class="dropdownText dropdownIcon btn dropdown-primary dropdown-trigger" is-ruf-component="" target-id="relationshipPopover" on-tap="_openRelationshipModelLov"></pebble-button>
                    <pebble-popover id="productSearchPopover" for="entityTypeFilterButton" vertical-align="auto" horizontal-align="auto">
                        <rock-entity-type-model-lov id="entityTypeLov" settings="[[lovSettings]]" domain="[[domain]]" select-all="true" allowed-entity-types="{{allowedEntityTypes}}" selected-items="{{selectedEntityTypes}}"></rock-entity-type-model-lov>
                        <div class="PebbleButtonPadding text-center m-t-10">
                            <pebble-button class="btn btn-secondary m-r-5" target-id="productSearchPopover" on-tap="_closeLov" raised="" elevation="1" button-text="Close"></pebble-button>
                            <pebble-button class="btn btn-success" button-text="Apply" raised="" elevation="1" on-tap="_onSelectedEntityTypesChange" target-id="entityTypeLov"></pebble-button>
                        </div>
                    </pebble-popover>
                    <bedrock-pubsub event-name="entity-type-model-lov-confirm-button-tap" handler="_onSelectedEntityTypesChange" target-id="entityTypeLov"></bedrock-pubsub>
                    <bedrock-pubsub event-name="entity-type-model-lov-close-button-tap" handler="_closeLov" target-id="productSearchPopover"></bedrock-pubsub>
                </div>
                <div class="card-content p-r-20 p-l-20">
                    <!-- Attribute Search -->
                    <template is="dom-if" if="{{_enableAttributeList}}">
                        <div>
                        <!-- Attributes search - supports multiple attributes -->
                            <div class="queryHeading">
                                <pebble-button icon="pebble-icon:action-add-fill" class="queryHeadingButton" target-id="attribute-grid" on-tap="_onAddRowClick" button-text="WITH"></pebble-button>                   
                            </div>            
                            <div class="attributeGridContainer">
                                <pebble-data-table id="attribute-grid" items="{{attributeGridData}}">
                                    <data-table-column slot="column-slot" flex="0" class="first">
                                        <template>
                                            <pebble-icon slot="cell-slot-content" icon="pebble-icon:action-delete" target-id="attribute-grid" class="pebble-icon-size-16" on-tap="_onDeleteRowClick"></pebble-icon>                        
                                        </template>
                                    </data-table-column>
                                    <data-table-column slot="column-slot">
                                        <template>
                                            <div id="inputDiv" slot="cell-slot-content" on-tap="" index="[[index]]">
                                                <pebble-textbox readonly="" id="attributes-text_[[index]]" row-id="[[index]]" value="{{item.name}}" no-label-float="true"></pebble-textbox>
                                            </div>
                                            <div id="iconDiv" slot="cell-slot-content">
                                                <pebble-icon class="dropdown-icon pebble-icon-size-10" id="txtDropdownIcon_[[index]]" row-id="[[index]]" icon="pebble-icon:navigation-action-down" on-tap="_openAttributeModelLov"></pebble-icon>
                                            </div>                         
                                        </template>                        
                                    </data-table-column>
                                    <data-table-column slot="column-slot">
                                        <template>
                                            <div id="inputDiv" slot="cell-slot-content" on-tap="" index="[[index]]">
                                                <pebble-textbox readonly="" id="attributes-value_[[index]]" row-id="[[index]]" value="{{item.value}}" no-label-float="true"></pebble-textbox>
                                            </div>
                                            <div id="iconDiv" slot="cell-slot-content">
                                                <pebble-icon class="dropdown-icon pebble-icon-size-10" id="txtDropdownIcon_[[index]]" row-id="[[index]]" icon="pebble-icon:navigation-action-down" on-tap="_onOpenFilterPopover"></pebble-icon>
                                            </div>                         
                                        </template>  
                                    </data-table-column>
                                </pebble-data-table>
                                <bedrock-pubsub event-name="attribute-model-lov-selection-changed" handler="_onAttributeSelection" target-id="attributeModelLov"></bedrock-pubsub>
                                <pebble-popover id="attributesPopover" for="" no-overlap="" vertical-align="auto" horizontal-align="auto">
                                    <rock-attribute-model-lov id="attributeModelLov" mode="mapped" context-data="{{_contextData}}" no-sub-title="" id-field="name" title-pattern="externalName" type-field="[]" sort-details="[[filtersConfig]]"></rock-attribute-model-lov>
                                </pebble-popover>                      
                            </div>
                        </div>
                    </template>
                    <!-- filter options -->
                    <rock-attribute-filter-popover id="rockfilter" max-allowed-values-for-search="[[maxAllowedValuesForSearch]]" context-data="[[contextData]]" attribute-values-exists-search-enabled="[[_isAttributeValuesExistsSearchEnabled]]"></rock-attribute-filter-popover>
                    <bedrock-pubsub event-name="on-filter-update" handler="onUpdateFilter" target-id="rockfilter"></bedrock-pubsub>

                    <div class="queryHeading">
                        <liquid-entity-model-composite-get id="liquidModelGet" request-data="{{relationshipRequest}}" on-entity-model-composite-get-response="_onModelReceived" on-error="_onModelGetFailed" exclude-in-progress=""></liquid-entity-model-composite-get>        
                        <liquid-rest id="entityModelGet" url="/data/pass-through/entitymodelservice/get" method="POST" request-data="{{_relModelGetRequest}}" on-liquid-response="_onRelModelReceived" on-liquid-error="_onRelModelGetFailed"></liquid-rest>
                        <pebble-popover id="relationshipPopover" for="relationshipButton" vertical-align="auto" horizontal-align="auto">
                            <pebble-lov id="relationshipModelLov" on-selection-changed="_onRelationshipLovSelectionChanged" selected-item="{{selectedRelationship}}"></pebble-lov>    
                        </pebble-popover>
                        <div class="queryHeadingReset">
                            <pebble-button class="btn-link" on-tap="_onResetRelationship" button-text="Reset"></pebble-button>                   
                        </div>    
                    </div>
                    <div class="base-grid-structure scroll-wrapper">
                        <div class="relationshipGridContainer base-grid-structure-child-1">
                            <div id="overlay-div" hidden="[[!enableOverlay]]"></div>
                            <div class="queryHeading">
                                <pebble-button icon="pebble-icon:action-add-fill" class="queryHeadingButton m-l-10" target-id="relationship-grid" on-tap="_onAddRowClick" button-text="WITH"></pebble-button> 
                                <div class="queryHeadingReset m-r-10">
                                    <pebble-button class="btn-link" on-tap="_onResetRelationshipGrid" button-text="Reset"></pebble-button>                   
                                </div>                   
                            </div>
                            <div class="p-5">
                                <pebble-data-table id="relationship-grid" items="{{relationshipGridData}}">
                                    <data-table-column slot="column-slot" flex="0">
                                    <template>
                                        <pebble-icon slot="cell-slot-content" icon="pebble-icon:action-delete" target-id="relationship-grid" class="pebble-icon-size-16" on-tap="_onDeleteRowClick"></pebble-icon>                        
                                    </template>
                                    </data-table-column>
                                    <data-table-column slot="column-slot">
                                    <template>
                                        <div id="inputDiv" slot="cell-slot-content" on-tap="" index="[[index]]">
                                            <pebble-textbox readonly="" id="relationship-text_[[index]]" target-id="relationshipGrid" row-id="[[index]]" value="{{item.name}}" no-label-float="true"></pebble-textbox>
                                        </div>
                                        <div id="iconDiv" slot="cell-slot-content">
                                            <pebble-icon class="dropdown-icon pebble-icon-size-10" id="rtxtDropdownIcon_[[index]]" row-id="[[index]]" icon="pebble-icon:navigation-action-down" on-tap="_openRelationshipAttributeModelLov"></pebble-icon>
                                        </div>                         
                                    </template>                        
                                    </data-table-column>
                                    <data-table-column slot="column-slot">
                                    <template>
                                        <div id="inputDiv" slot="cell-slot-content" on-tap="" index="[[index]]">
                                            <pebble-textbox readonly="" id="relationship-value_[[index]]" row-id="[[index]]" target-id="relationshipGrid" value="{{item.value}}" no-label-float="true"></pebble-textbox>
                                        </div>
                                        <div id="iconDiv" slot="cell-slot-content">
                                            <pebble-icon class="dropdown-icon pebble-icon-size-10" id="rtxtDropdownIcon_[[index]]" row-id="[[index]]" icon="pebble-icon:navigation-action-down" target-row-name="relationship-value_" on-tap="_onOpenFilterPopover"></pebble-icon>
                                        </div>                                                
                                    </template>  
                                    </data-table-column>
                                </pebble-data-table>
                            </div>
                            <pebble-popover id="relAttributesPopover" for="" no-overlap="" vertical-align="auto" horizontal-align="auto">
                                <pebble-lov id="relAttributeModelLov" on-selection-changed="_onRelAttributeLovSelectionChanged"></pebble-lov>
                            </pebble-popover>
                                                    
                        <!-- Related Entity search
                        - Related Entity attributes -->                     
                            <div class="relEntityContainer">
                                <liquid-entity-model-composite-get id="liquidRelEntityAttributeGet" on-entity-model-composite-get-response="_onRelEntityAttributeGetReceived" on-error="_onRelEntityAttributeGetFailed" exclude-in-progress=""></liquid-entity-model-composite-get>
                                <pebble-button id="relEntityButton" button-text="{{selectedRelEntityName}}" title="{{selectedRelEntityName}}" dropdown-icon="" noink="" class="dropdownText dropdownIcon btn dropdown-primary dropdown-trigger" disabled="" is-ruf-component=""></pebble-button>
                                
                                <div class="queryHeading">
                                    <pebble-button icon="pebble-icon:action-add-fill" class="queryHeadingButton m-l-10" target-id="relEntity-grid" on-tap="_onAddRowClick" button-text="WITH"></pebble-button> 
                                    <div class="queryHeadingReset m-r-10">
                                        <pebble-button class="btn-link" on-tap="_onResetRelEntityGrid" button-text="Reset"></pebble-button>                   
                                    </div>                   
                                </div>
                                <div class="p-5">
                                    <pebble-data-table id="relEntity-grid" items="{{relEntityGridData}}">
                                        <data-table-column slot="column-slot" flex="0">
                                            <template>
                                                <pebble-icon slot="cell-slot-content" icon="pebble-icon:action-delete" target-id="relEntity-grid" class="pebble-icon-size-16" on-tap="_onDeleteRowClick"></pebble-icon>                        
                                            </template>
                                        </data-table-column>
                                        <data-table-column slot="column-slot">
                                            <template>
                                                <div id="inputDiv" slot="cell-slot-content" on-tap="" index="[[index]]">
                                                    <pebble-textbox readonly="" id="relEntity-text_[[index]]" target-id="relatedEntityGrid" row-id="[[index]]" value="{{item.name}}" no-label-float="true"></pebble-textbox>
                                                </div>
                                                <div id="iconDiv" slot="cell-slot-content">
                                                    <pebble-icon class="dropdown-icon pebble-icon-size-10" id="rtxtDropdownIcon_[[index]]" row-id="[[index]]" icon="pebble-icon:navigation-action-down" on-tap="_openRelEntityAttributeModelLov"></pebble-icon>
                                                </div>                         
                                            </template>                        
                                        </data-table-column>
                                        <data-table-column slot="column-slot">
                                            <template>
                                                <div id="inputDiv" slot="cell-slot-content" on-tap="" index="[[index]]">
                                                    <pebble-textbox readonly="" id="relEntity-value_[[index]]" row-id="[[index]]" target-id="relatedEntityGrid" value="{{item.value}}" no-label-float="true"></pebble-textbox>
                                                </div>
                                                <div id="iconDiv" slot="cell-slot-content">
                                                    <pebble-icon class="dropdown-icon pebble-icon-size-10" id="rtxtDropdownIcon_[[index]]" row-id="[[index]]" icon="pebble-icon:navigation-action-down" target-row-name="relEntity-value_" on-tap="_onOpenFilterPopover"></pebble-icon>
                                                </div>                                                
                                            </template>  
                                        </data-table-column>
                                    </pebble-data-table>
                                </div>
                                <pebble-popover id="relEntityAttributesPopover" for="" no-overlap="" vertical-align="auto" horizontal-align="auto">
                                    <pebble-lov id="relEntityAttributeModelLov" on-selection-changed="_onRelEntityAttributeLovSelectionChanged"></pebble-lov>
                                </pebble-popover>
                            </div>
                        </div>
                        <div class="workflowGridContainer base-grid-structure-child-2">
                            <div class="queryHeading">
                                <pebble-button class="queryHeadingButton" target-id="workflow-grid" button-text="PENDING"></pebble-button>
                                <div class="queryHeadingReset">
                                    <pebble-button class="btn-link" on-tap="_onResetWorkflowGrid" button-text="Reset"></pebble-button>
                                </div>
                            </div>
    
                            <div class="p-10">
                                <pebble-data-table id="workflow-grid" items="{{workflowGridData}}">
                                    <data-table-column slot="column-slot">
                                        <template>
                                            <div id="inputDiv" slot="cell-slot-content" on-tap="" index="[[index]]">
                                                <pebble-textbox readonly="" id="workflow-text_[[index]]" row-id="[[index]]" value="{{item.name}}" no-label-float="true"></pebble-textbox>
                                            </div>
                                            <div id="iconDiv" slot="cell-slot-content">
                                                <pebble-icon class="dropdown-icon pebble-icon-size-10" id="wtxtDropdownIcon_[[index]]" row-id="[[index]]" icon="pebble-icon:navigation-action-down" on-tap="_openWorkflowModelLov"></pebble-icon>
                                            </div>
                                        </template>
                                    </data-table-column>
                                    <data-table-column slot="column-slot">
                                        <template>
                                            <div id="inputDiv" slot="cell-slot-content" on-tap="" index="[[index]]">
                                                <pebble-textbox readonly="" id="workflow-value_[[index]]" row-id="[[index]]" value="{{item.value}}" no-label-float="true"></pebble-textbox>
                                            </div>
                                            <div id="iconDiv" slot="cell-slot-content">
                                                <pebble-icon class="dropdown-icon pebble-icon-size-10" id="wtxtDropdownIcon_[[index]]" row-id="[[index]]" icon="pebble-icon:navigation-action-down" on-tap="_openWorkflowActivityLov"></pebble-icon>
                                            </div>
                                        </template>
                                    </data-table-column>
                                </pebble-data-table>
                            </div>
                            <pebble-popover id="workflowPopover" for="" no-overlap="" vertical-align="auto" horizontal-align="auto">
                                <pebble-lov id="workflowModelLov" on-selection-changed="_onWorkflowLovSelectionChanged"></pebble-lov>
                            </pebble-popover>
                            <pebble-popover id="workflowActivityPopover" for="" no-overlap="" vertical-align="auto" horizontal-align="auto">
                                <pebble-lov id="workflowActivityLov" on-selection-changed="_onWorkflowActivityLovSelectionChanged"></pebble-lov>
                            </pebble-popover>
                        </div>
                    </div>
                    <liquid-entity-model-get id="getWorkflowMappingDefinition" operation="getbyids" request-id="req1" request-data="{{workflowMappingDefinitionRequest}}" on-response="_onWfMappingsReceived" on-error="_onMappingsGetFailed"></liquid-entity-model-get>
                    <liquid-entity-model-get id="entityGetWorkflowDefinition" operation="getbyids" request-id="req1" request-data="{{workflowDefinitionRequest}}" on-response="_onDefinitionReceived" on-error="_onDefinitionGetFailed"></liquid-entity-model-get> 
                </div>
                <div class="actionButtons p-b-10">
                    <pebble-button id="cancelButton" class="close btn btn-secondary m-r-5" button-text="Cancel" noink="" elevation="2" on-tap="_onClose"></pebble-button>
                    <pebble-button id="confirmButton" class="apply btn btn-success" button-text="Apply" noink="" elevation="2" on-tap="_onApply"></pebble-button>
                </div>
            </paper-card>
    </div>
`;
  }

  static get is() { return 'rock-query-builder' }

  ready() {
      super.ready();  
      this._isAttributeValuesExistsSearchEnabled = this._attributeValuesExistsSearchEnabledDefaultValue
      this._close = this._close.bind(this);
      let that = this;
      timeOut.after(3000).run(() => {
          that.shadowRoot.querySelector('.queryBuilderContainer').style['opacity'] = 1;
      });
  }

  static get properties() {
      return {
      inputQueryString:{
          type: String,
          value: ""
          //observer: "_onQueryStringChange"
      },
      allowedEntityTypes: {
          type: Array,
          value: function () {
              return [];
          }
      },
      _relModelGetRequest: {
          type: Object,
          value: function () {
              return {};
          }
      },                   
      selectedEntityTypes: {
          type: Array,
          value: function () {
              return [];
          }
      },
      selectedRelationship:{
          type: String,
          value: ""
      },
      selectedRelationshipName:{
          type: String,
          computed: "getSelectedRelationship(selectedRelationship)"
      },          
      _showAttributeSearchGrid: {
          type: Boolean,
          value: false
      },
			domains: {
          type: Array,
          value: function () { return []; }
			},
      _contextData: {
          type: Object,
          value: function () {
              return {};
          }
      },
			contextData: {
          type: Object,
          value: function () {
              return {};
          }
      },
      _relationshipsLookup: {
          type: Object,
          value: function() {
              return {}
          }
      },
      attributeGridData: {
          type: Array,
          value: function () {
              return [
                  {
                      "name": "",
                      "value": ""    
                  }
                                         
              ];
          }
      },     
      relationshipGridData: {
          type: Array,
          value: function () {
              return [
                  {
                      "name": "",
                      "value": ""    
                  }                           
              ];
          }
      },           
      workflowGridData:{
          type: Array,
          value: function () {
              return [
                  {
                      "name": "",
                      "value": ""    
                  }    
              ];
          } 
      },
      workflowEntityTypes:{
           type: Array,
           value: {}
      },            
      _selectedItems: {
          type: Array,
          value: function () {
              return [];
          }
      },
      relationshipRequest: {
          type: Object,
          value: function () {
              return {};
          }
      },           
      domain:{
          type:String
      }, 
      _enableAttributeList:{
          type: Boolean,
          value: false
      },
      workflowMappingDefinitionRequest: {
          type: Object,
          value: function() {
              return {};
          }
      },
      workflowDefinitionRequest: {
          type: Object,
          value: function () {
              return {};
          }
      },
      _mappedWorkflowNames: {
          type: Array,
          value: function () { return []; }
      },
      workflowName: {
          type: String,
          value: ""
      },
      selectedEntityTypeNames:{
         type: String,
         computed: "getSelectedEntityTypeNames(selectedEntityTypes)"             
      },
      searchQuery: {
          type: String,
          value: ""
      },
      _workflowData: {
          type: Object,
          value: function() { return {}; }
      },
      relationshipsData: {
          type: Object,
          value: function() { return {}; },
          observer: "_updateRelationshipData"
      },
      relEntityData: {
          type: Object,
          value: function() { return {}; },
          observer: "_updateRelEntityData"
      },
      workflowCriterion: {
          type: Object,
          value: function () { return {}; },
          observer: "_updateWorkflowData"
      },
      selectedRelEntity:{
          type: String,
          value: ""
      },
      selectedRelEntityName:{
          type: String,
          computed: "getSelectedRelEntityName(selectedRelEntity)"
      },
      relEntityGridData:{
          type: Array,
          value: function () {
              return [
                  {
                      "name": "",
                      "value": ""    
                  }                           
              ];
          }
      },
      currentTargetRowName:{
          type: String,
          value: ""
      },
      currentTargetRowId:{
          type: String,
          value: ""
      },
      entityTypeFilterText: {
          type: String
      },
      lovSettings:{
          type: Object
      },
      showNestedChildAttributes:{
          type: Boolean,
          value: false,
          computed: '_getItemVisibility(settings,"showNestedChildAttributes")',
      },
      showNestedAttributes:{
          type: Boolean,
          value: true,
          computed: '_getItemVisibility(settings,"showNestedAttributes")',

      },
      settings: {
          type: Object,
          value: function () {
              return {};
          }
      },
      _toggleButtonText:{
          type: String,
          value: "Having"
      },
      _isRelationshipsExistsSearchEnabled:{
          type: Boolean,
          value: false,
          computed: '_getItemVisibility(settings,"relationshipsExistsSearchEnabled")',
      },
      _isAttributeValuesExistsSearchEnabled:{
          type: Boolean,
          value: false,
      },
      _attributeValuesExistsSearchEnabledDefaultValue:{
          type: Boolean,
          value: false,
          computed: '_getItemVisibility(settings,"attributeValuesExistsSearchEnabled")'
      },
      _hasRelationshipChecked:{
          type: Boolean,
          value: true,
          observer: "_onToggleButtonChange"
      },
      enableOverlay:{
          type: Boolean,
          value: false
      },
      currenGridName:{
          type:String,
          value: ""
      },
      disableHasRelationshipExistSearchToggle:{
          type: Boolean,
          value: false
      },
      relationshipExistsSearchCriterionData:{
          type: Object,
          value: function () {
              return {};
          }
      },
      //Added to keep the selected relationship for the query builder
      relationshipName: {
          type: String,
          value:"",
          notify: true
      },
      maxAllowedValuesForSearch:{
          type: Number                        
      }
      }
  }

  /**
   *  Add Listener to close the query builder when clicked elsewhere
  */
  connectedCallback() {
      super.connectedCallback();
      document.addEventListener('down', this._close, true);
      //add methods to get workflow mappings, relationships, rulecontext mappings when selected entity types available
      if(!_.isEmpty(this.selectedEntityTypes) && !_.isEmpty(this.contextData)) {
          //get relationshipmodels for selected entity types
          this._getRelationshipModels();
          //get mapped workflows data for the selected entity types
          this._getWorkflowMappings();
      }
  }

  /**
   *  Remove Listener to close the query builder
  */
  disconnectedCallback() {
      super.disconnectedCallback();
      document.removeEventListener('down',this._close, true);
  }

  get liquidRelEntityAttributeGet() {
      this._liquidRelEntityAttributeGet = this._liquidRelEntityAttributeGet || this.shadowRoot.querySelector("#liquidRelEntityAttributeGet");
      return this._liquidRelEntityAttributeGet;
  }

  /**
   *  Open lov whose target-id is defined
  */
  _openLov(e) {
      let targetId = e.target.getAttribute("target-id");
      this.shadowRoot.querySelector("#"+targetId).show();
  }

  /**
   *  Close lov whose target-id is defined
  */
  _closeLov(e) {
      let targetId = e.target.getAttribute("target-id");
      this.shadowRoot.querySelector("#"+targetId).hide();
  }

  /**
   *  Close query builder
  */
  _onClose() {
      this.fireBedrockEvent('hide-query-builder');
  }

  /**
   *  Close query builder if the user is not using on the query builder
  */
  _close(event) {
      let queryBuilderFound = false;
      let eventPath = ElementHelper.getElementPath(event);
      if(eventPath){
          for(let key=0; key<eventPath.length; key++){
              if(eventPath[key].tagName){
                  if(eventPath[key].tagName.toUpperCase() == "ROCK-QUERY-BUILDER"){
                  queryBuilderFound = true;
                  break;
                  }
              }
          }
      }
      if(!queryBuilderFound){
          this._onClose();  
      }
  }

  /**
  * Re-initialise the query builder components when the query builder is opened
 */
  onOpenQueryBuilder() {
      if(this.reset) {
          this._onResetAllGrids(); 
          this.reset = false;
      } else {
          this.reRenderGrid();
      }
      
      if(this.selectedRelEntity){
          this.showBlock('.relEntityContainer');
      } else {
          this.hideBlock('.relEntityContainer');
      }            
  }

  _onResetAllGrids() {
      this._onResetRelationship();
      this._onResetWorkflowGrid(); 
  }

  /**
  * Function to reset the query builder
  */
  resetQueryBuilder(){
      this.reset = true;
      this.attributeGridData = [];
      this._onResetAllGrids();
      this._hasRelationshipChecked = true;
      this.disableHasRelationshipExistSearchToggle = false;
  }

  /**
   * Function to reset the relationship drop-down
   */
  _onResetRelationship(){
      this.selectedRelationship = [];
      this._onResetRelationshipGrid();
      this.selectedRelEntity = "";
      //Remove the dropdown list items 
      let relAttributeModelLov = this.shadowRoot.querySelector('#relAttributeModelLov');
      relAttributeModelLov.items = [];
      let relEntityAttributeModelLov = this.shadowRoot.querySelector('#relEntityAttributeModelLov');
      relEntityAttributeModelLov.items = [];      
  }

  /**
   * Function to reset the relationship attributes
   */
  _onResetRelationshipGrid(){
      this.relationshipGridData = [];
      this._selectedItems = [];
      this.currentFilterObj = "";
      this.relationshipGridData = [{"name": "","value": ""}];
      this.currentTargetRowName = "";
      this.currentTargetRowId = ""; 
      this._onResetRelEntityGrid();            
  }

  /**
   * Function to reset the workflow attributes
   */
  _onResetWorkflowGrid(){
      this.workflowGridData = [];
      this.workflowEntityTypes = [];
      this.workflowGridData = [{"name": "","value": ""}]; 
  }

  /**
  * Function to reset the relationship attributes
  */
  _onResetRelEntityGrid(){
     this.relEntityGridData = [];
     this._selectedItems = [];
     this.currentFilterObj = "";
     this.relEntityGridData = [{"name": "","value": ""}];
     this.currentTargetRowName = "";
     this.currentTargetRowId = "";
 }

  //Rerendering of grids 
  reRenderGrid(){
      let relationshipGrid = this.shadowRoot.querySelector('#relationship-grid');
      relationshipGrid.clearCache();
      let relGrid = this.shadowRoot.querySelector('#relEntity-grid');
      relGrid.clearCache();
      let workflowGrid = this.shadowRoot.querySelector('#workflow-grid');
      workflowGrid.clearCache();
  }
  /**
   * Function to get the query builder data to form the query
   */
  getQueryBuilderData(){            
      let queryBuilderData = {};

      let relModelLov = this.shadowRoot.querySelector('#relationshipModelLov');
      if(relModelLov.selectedItem && !_.isEmpty(relModelLov.selectedItem)) {
          this.set("relationshipName", relModelLov.selectedItem.id);
          if(this._isRelationshipsExistsSearchEnabled && !this._hasRelationshipChecked){
              queryBuilderData.relationship = "!%& No !%&" + relModelLov.selectedItem.title;
              queryBuilderData.relationshipShortName = "!%&"+relModelLov.selectedItem.relationshipName+"!%&";
          }else{
              queryBuilderData.relationship = relModelLov.selectedItem.title;
              queryBuilderData.relationshipShortName = relModelLov.selectedItem.relationshipName;
          }
      }
      if(this.relationshipGridData) {
          let _updatedRelationshipGridData = this._getUpdatedGridData(this.relationshipGridData);
          queryBuilderData.relationshipGridData = _updatedRelationshipGridData;
      }

      if(this.selectedRelEntity){
          queryBuilderData.relEntity = this.selectedRelEntity;
      }
      if(this.relEntityGridData) {
          let _updatedRelatedEntityGridData = this._getUpdatedGridData(this.relEntityGridData);
          queryBuilderData.relEntityGridData = _updatedRelatedEntityGridData;
      }
      if(this.workflowGridData) {
          queryBuilderData.workflowGridData = this.workflowGridData;
      } 
      
      return queryBuilderData;
  }

  _getUpdatedGridData(gridData){
      let _currentGridData = gridData;
      if(!this._hasRelationshipChecked){
          return [{"name": "","value": ""}]                        
      }
      _currentGridData.forEach(element => {
              if(element.isHasAttributeValueSearchRequest){
                  if(element.value.indexOf("!%&") > -1){
                      element.value = element.value.replace( /!%&/g, "" );
                  }
                  element.value = "!%&" +element.value +"!%&"
              }
          });
      return _currentGridData;
  }
  _getRelationshipModels() {
      let entityTypes = this.getSelectedEntityTypes(this.selectedEntityTypes);
      let makeRelationshipGetRestCall = false;
      let entitiesNotInLookup = [];

      if (!_.isEmpty(entityTypes)) {
          if (!_.isEmpty(this._relationshipsLookup)) {
              let existingEntTypesInLookup = Object.keys(this._relationshipsLookup);

              entityTypes.forEach(entityType => {
                  if (!existingEntTypesInLookup.includes(entityType)) {
                      makeRelationshipGetRestCall = true;
                      entitiesNotInLookup.push(entityType + "_entityManageModel");
                  }
              });
          } else {
              makeRelationshipGetRestCall = true;
              entitiesNotInLookup = entityTypes.map(entityType => {
                  entityType = entityType + "_entityManageModel";
                  return entityType;
              });
          }

          if (makeRelationshipGetRestCall) {
              //preparing request for Rest call to fetch relationshipAttributes and relationships.
              this._relModelGetRequest = {
                  "params": {
                      "query": {
                          "ids": entitiesNotInLookup,
                          "filters": {
                              "typesCriterion": [
                                  "entityManageModel"
                              ]
                          }
                      },
                      "fields": {
                          "relationships": [
                              "_ALL"
                          ],
                          "relationshipAttributes": [
                              "_ALL"
                          ]
                      }
                  }
              };

              let liquidGet = this.shadowRoot.querySelector("#entityModelGet");
              if (liquidGet) {
                  liquidGet.generateRequest();
              }
          } else {
              this._entityCompositeGet();
          }
      }
  }

  _getRelationshipsAndRelationshipAttributesToQuery(relationships, entityTypesList) {
      let relationshipAttributesToQuery = [];
      let relationshipKeys = [];
      let relationshipsToQuery = [];
      let resultObject = [];

          entityTypesList.forEach(entityType=> {
              let relationships = this._relationshipsLookup[entityType];
              relationshipKeys = Object.keys(relationshipKeys);
              if(relationships) {
                  relationshipsToQuery.push(...(Object.keys(relationships)));
                  for(let relAttr in relationships) {
                      let relationshipAttributes =  relationships[relAttr];
                      if(!_.isEmpty(relationshipAttributes)) {
                          relationshipAttributesToQuery.push(...relationshipAttributes);
                      }
                  }
              }
          });
          
      resultObject = {
          relationshipsToQuery: _.uniq(relationshipsToQuery),
          relationshipAttributesToQuery: _.uniq(relationshipAttributesToQuery)
      }

      return resultObject;
  }

  /**
   *  On liquidModelGet success
   */
  _onRelModelReceived(e) {
     let entityModels;
     let relationshipsToQuery = [];
     if(DataHelper.isValidObjectPath(e, 'detail.response.response.entityModels')) {
         entityModels = e.detail.response.response.entityModels;
     } else {
          this.logError("No models found on entity-get-composite call", e.detail);
          return;
      }

     //preparing relationshipAttributes lookup

          let _relationshipsLookup = {};
          let relationships = {};
          let relationshipAttributesToQuery = [];

          entityModels.forEach(entityModel => {
              let obj = {};
              let rels;
              if(DataHelper.isValidObjectPath(entityModel, 'data.relationships')) {
                 rels = entityModel.data.relationships;

                 for (let rel in rels) {
                  if(rels.hasOwnProperty(rel) && !_.isEmpty(rels[rel]) && rels[rel][0].attributes) {
                     obj[rel] = Object.keys(rels[rel][0].attributes);
                  }
                 }
                 
                 let entityType = entityModel.id.split("_entityManageModel")[0];
                 _relationshipsLookup[entityType] = obj;

              } else {
                 this.logError("No relationships found on entityModel", e.detail);
              }
          });

          let _mergedRelationshipsLookup = this._relationshipsLookup;
          _.extend(_mergedRelationshipsLookup, _relationshipsLookup)
          this.set("_relationshipsLookup", _mergedRelationshipsLookup);

      //making composite call

      this._entityCompositeGet();
  }
  _onRelModelGetFailed(e) {
     this.logError("Entity model get failed", e.detail);
  }

  _entityCompositeGet() {
      let relationshipAttributes = [];
      let relationships = [];

      let entityTypes = this.getSelectedEntityTypes(this.selectedEntityTypes);
      let responseData = this._getRelationshipsAndRelationshipAttributesToQuery(this._relationshipsLookup, entityTypes);
      relationshipAttributes = responseData.relationshipAttributesToQuery;
      relationships = responseData.relationshipsToQuery;

      this._currentIndex = entityTypes.length;
      this._currentItems = [];

      let clonedContextData = DataHelper.cloneObject(this.contextData);
      for (let i = 0; i < entityTypes.length; i++) {
          let type = entityTypes[i];
          let itemContext = {};
          itemContext.type = type;
          itemContext.relationships = relationships;
          itemContext.relationshipAttributes = relationshipAttributes;

          clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];

          let compositeModelGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(clonedContextData);
          
          delete compositeModelGetRequest.params.query.name;
          compositeModelGetRequest.params.query.id = type+"_entityCompositeModel";

          this.set("relationshipRequest", compositeModelGetRequest);

          let liquidGet = this.shadowRoot.querySelector("#liquidModelGet");
          if (liquidGet) {
              liquidGet.generateRequest();
          }
      }
  }

  /**
*  On liquidModelGet success
*/
  _onModelReceived(e){
      let response = e.detail.response;
      let relationshipModels = DataTransformHelper.transformRelationshipModels(response.content.entityModels[0], this.contextData);
      let entityType = response.content.entityModels[0].name;

      if(DataHelper.isValidObjectPath(response, 'content.entityModels.0.id')){
          entityType = response.content.entityModels[0].id.split("_entityCompositeModel")[0];
      }
      
      if (this._currentIndex == 1) {
          this._currentItems = {};
      }
      this._currentItems[entityType] = relationshipModels;
      let keys = Object.keys(this._currentItems);
      if (keys && keys.length == this._currentIndex) {
          let relationships = {};
          for (let i = 0; i < keys.length; i++) {
              let currentItem = this._currentItems[keys[i]];
              if(currentItem){
                  let relTypes = Object.keys(currentItem);
                  if (relTypes && relTypes.length > 0) {
                      let rels = [];
                      for (let j = 0; j < relTypes.length; j++) {
                          let relType = relTypes[j];
                          let rel = currentItem[relType];
                          if (rel && rel.length > 0) {
                              for(let k=0; k<rel.length; k++) {
                                  if(rel[k].id){
                                      let newItem = {
                                          id: rel[k].id,
                                          relationshipName: relType,
                                          title: rel[k].properties && rel[k].properties.externalName ? rel[k].properties.externalName : "",
                                          relEntityType: rel[k].properties.relatedEntityInfo[0].relEntityType,
                                          attributes: rel[k].attributes,
                                          relationshipOwnership: rel[k].properties.relationshipOwnership
                                      };
                                      rels.push(newItem);
                                  }
                              }
                          }
                      }
                      relationships[keys[i]] = rels;
                  }
              }
          }
          this.set("_relationshipsData", relationships);
          if(!_.isEmpty(this.relationshipsData)) {
              this._populateRelationshipsGridData(this.relationshipsData);
          }
      }
  }

  /**
   *  On liquidModelGet failure
   */
  _onModelGetFailed(e) {
      this.logError("Rock query builder error",e);
  }

  /**
  * Function to generate a request to get the workflow mappings
  */
  _getWorkflowMappings(){           
      if (!_.isEmpty(this.contextData)) { 
          
          let selectedEntities =  this.getSelectedEntityTypes(this.selectedEntityTypes);
          let contextData = DataHelper.cloneObject(this.contextData);
          let itemContexts = [];
          let itemContext = {};
          itemContext.type = selectedEntities;
          itemContexts.push(itemContext);
          contextData[ContextHelper.CONTEXT_TYPE_ITEM] = itemContexts;
          this.workflowEntityTypes = itemContext.type;
          this.workflowMappingDefinitionRequest = DataRequestHelper.createWorkflowMappingGetRequest(contextData);
          this.shadowRoot.querySelector('#getWorkflowMappingDefinition').generateRequest();
      }
  }

  /**
  * Function to get the workflow mappings
  */
  _onWfMappingsReceived(e) {
      let response = e.detail.response;
      if(response) {
          let mappedWorkflowNames = [];
          let mappingModels = response.content && response.content.entityModels ? response.content.entityModels: undefined;
          if(mappingModels && mappingModels.length > 0) {
              for(let i=0; i<mappingModels.length;i++){
                  let wfDefinitionMappingModel = mappingModels[i];
                  let type = wfDefinitionMappingModel.name;
                  let wfRelationships = DataMergeHelper.mergeWorkflowMappings(wfDefinitionMappingModel, this.contextData);
                  let workflowNames = DataHelper.getRelToNames(wfRelationships.hasWorkflowsDefined);
                  mappedWorkflowNames = mappedWorkflowNames.concat(workflowNames);
                  this._mappedWorkflowNames[type] = workflowNames;
              }
              
              if(!_.isEmpty(mappedWorkflowNames)) {                   
                  let itemContext = this.getFirstItemContext();
                  itemContext.workflowNames = mappedWorkflowNames;
                  this.workflowDefinitionRequest = DataRequestHelper.createWorkflowDefinitionGetRequest(this.contextData);
                  this.shadowRoot.querySelector("#entityGetWorkflowDefinition").generateRequest();
              }                            
          }
      }
  }

  /**
  * Workflow mappings failed
  */
  _onMappingsGetFailed(e) {
      this.logWarning("Failed to get workflow mappings","response",JSON.stringify(e.detail));       
  }

  /**
  * Function to get the workflow definitions
  */
  _onDefinitionReceived(e) {
      let workflowDefinitionResponse = e.detail.response.content.entityModels;
      if(workflowDefinitionResponse.length>=1){
          let workflows = {};
          for(let i=0;i<workflowDefinitionResponse.length;i++) {
              let name = workflowDefinitionResponse[i].name;
              let mappedEntityType = undefined;
              for(let type in this._mappedWorkflowNames) {
                  if(this._mappedWorkflowNames[type].indexOf(name) !== -1) {
                      mappedEntityType = type;
                      break;
                  }
              }

              workflows[mappedEntityType] = workflows[mappedEntityType] ? workflows[mappedEntityType] : [];
              let wfObj = workflowDefinitionResponse[i].data.attributes;
              if(!_.isEmpty(wfObj)){
                  let newItem = {
                      name : workflowDefinitionResponse[i].name,
                      title : AttributeHelper.getFirstAttributeValue(wfObj.workflowName),
                      attributes : wfObj.activities.group
                  }
                  workflows[mappedEntityType].push(newItem);
              }
          }

          this.set("_workflowData", workflows);

          if(!_.isEmpty(this.workflowCriterion)) {
              this._populateWorkflowGridData(this.workflowCriterion);
          }
      }
  }

  /**
  * Workflow definitions failed
  */
  _onDefinitionGetFailed(e) {
      this.logWarning("workflow definition get failed with error",JSON.stringify(e.detail)); 
  }

  _populateRelationshipsGridData(relationshipsData) {
      let selectedRelationship = {
          "id": relationshipsData.relationshipName,
          "title": relationshipsData.relationshipLongName,
      };
      if(this.relationshipExistsSearchCriterionData.hasRelationshipChecked != undefined){
          this._hasRelationshipChecked = this.relationshipExistsSearchCriterionData.hasRelationshipChecked;
      }
      if(this.relationshipExistsSearchCriterionData.relationshipOwnership){
          if(this.relationshipExistsSearchCriterionData.relationshipOwnership != "owned"){
              this._hasRelationshipChecked = true;
              this.disableHasRelationshipExistSearchToggle = true;
          }
      }

      this.set("selectedRelationship", selectedRelationship);

      if(!_.isEmpty(relationshipsData.selectedAttributes)) {
          let relationshipGridData = [];
          for(let i=0;i<relationshipsData.selectedAttributes.length; i++) {
              let attribute = relationshipsData.selectedAttributes[i];
              let rowData = {
                  "name": attribute.longName,
                  "value": attribute.displayValue,
                  "attributeModel": attribute.options
              };
              if(attribute.displayValue.indexOf("!%&") > -1){
                  rowData.value = attribute.displayValue.replace( /!%&/g, "" );
                  rowData.isHasAttributeValueSearchRequest = true;
              }
             
              relationshipGridData.push(rowData);
          }

          this.set("relationshipGridData", relationshipGridData);
      }
  }

  _populateWorkflowGridData(workflowCriterion) {
      let wfName = workflowCriterion.workflowShortName;
      let wfActivityName = workflowCriterion.workflowActivityName;

      let wfLongName;
      let wfActivityLongName;
      for(let type in this._workflowData) {
          let wf = this._workflowData[type].find(obj => obj.name === wfName);
          if(!wf) continue;
          
          wfLongName = wf.title;
          let wfActivity = wf.attributes.find(obj => AttributeHelper.getFirstAttributeValue(obj.activityName) === wfActivityName);
          if(wfActivity) {
              wfActivityLongName = AttributeHelper.getFirstAttributeValue(wfActivity.externalName);
          }
          break;
      }
      let rowData = {
          "name": wfLongName,
          "value": wfActivityLongName,
          "workflowExternalName": wfLongName,
          "workflowShortName": wfName,
          "workflowActivityExternalName": wfActivityLongName,
          "workflowActivityShortName": wfActivityName
      };

      this.set("workflowGridData", [rowData]);
  }

  _populateRelEntityGridData(relEntityData) {
      let selectedRelEntity = relEntityData.relEntityType;

      this.set("selectedRelEntity", selectedRelEntity);

      if(!_.isEmpty(relEntityData.selectedAttributes)) {
          let relEntityGridData = [];
          for(let i=0;i<relEntityData.selectedAttributes.length; i++) {
              let attribute = relEntityData.selectedAttributes[i];
              let rowData = {
                  "name": attribute.longName,
                  "value": attribute.displayValue,
                  "attributeModel": attribute.options
              };
              if(attribute.displayValue.indexOf("!%&") > -1){
                  rowData.value = attribute.displayValue.replace( /!%&/g, "" );
                  rowData.isHasAttributeValueSearchRequest =true
              }
              relEntityGridData.push(rowData);
          }

          this.set("relEntityGridData", relEntityGridData);
      }
  }

  /**
  * Function to read the input query string
  * //TODO - For enabling copy paste of the query into the searchbar
  **/
  _onQueryStringChange(){
      if(this.inputQueryString == this.outputQueryString) return;               

      if(this.inputQueryString == "") return;
              
      let tempStr = this.inputQueryString;
      tempStr = tempStr.toLowerCase();
      
      let start_pos = tempStr.indexOf('show') + 4;
      let end_pos1 = tempStr.indexOf('with');
      let end_pos2 = tempStr.indexOf('having');
      let end_pos = end_pos1;
      if(end_pos2 > -1) {  //case where having is not defined
          end_pos = Math.min(end_pos1, end_pos2);
      }
          
      if(start_pos < end_pos) {
          let entityTypesStr = tempStr.substring(start_pos,end_pos);
          let entityTypes = entityTypesStr.split(",");                      
      }

      tempStr = tempStr.substring(end_pos,tempStr.length);
      start_pos = tempStr.indexOf('with') + 4;
      end_pos = tempStr.indexOf('having');
      if(start_pos < end_pos) {
          let attributesStr = tempStr.substring(start_pos,end_pos); 
          let attributesPair = attributesStr.split("and");                           
      }

      tempStr = tempStr.substring(end_pos,tempStr.length); 
      start_pos = tempStr.indexOf('having') + 6;  
      end_pos = tempStr.indexOf('with');
      if(start_pos < end_pos) {
          let relationshipStr = tempStr.substring(start_pos,end_pos);                         
      }

      tempStr = tempStr.substring(end_pos,tempStr.length);
      start_pos = tempStr.indexOf('with') + 4;
      end_pos = tempStr.length;
      if(start_pos < end_pos) {
          let relationshipAttributesStr = tempStr.substring(start_pos,end_pos);
          let relationshipAttributesPair = relationshipAttributesStr.split("and");                  
          
      } 
  }

  /**
   *  Build the query, Hide the querybuilder
  */
  _onApply(){  
      let entityTypes = this.getSelectedEntityTypes(this.selectedEntityTypes); 
      let queryBuilderData = {};
      queryBuilderData = this.getQueryBuilderData();
                
      this.outputQueryString =  this.buildQuery(entityTypes,this.attributeGridData,queryBuilderData,false,this.searchQuery);
      let parserQueryString =  this.buildQuery(entityTypes,this.attributeGridData,queryBuilderData,true,this.searchQuery);
      
      let eventDetail = {
          "displayQuery": this.outputQueryString,
          "parsableQuery": parserQueryString
      };
      this.fireBedrockEvent('on-query-build',eventDetail);            
      this._onClose();                  
  }

  /**
  * Function to close the entity type popover
  */
  _onEntityTypePopoverClose(e, detail) {
      this.shadowRoot.querySelector("#productSearchPopover").close();
  }

  /**
   *  Handles the selected entitity change
  */
  _onSelectedEntityTypesChange(e){

      if(this.selectedEntityTypes && this.selectedEntityTypes.length <= 0){
          this.showWarningToast("Select at least one Entity Type");
          return;
      }
      this.disableHasRelationshipExistSearchToggle = false;
      this.selectedRelationship = "Relationships";

      //get relationshipmodels for selected entity types
      this._getRelationshipModels();
      //get mapped workflows data for the selected entity types
      this._getWorkflowMappings();
      
      this._onEntityTypePopoverClose();  
      this._onResetRelationship();          
  }

  /**
   * Function to display the selected entity names on the entityTypeFilterButton
   */
  getSelectedEntityTypeNames(selectedEntityTypes){
      let entityTypeExternalNames = [];
      for (let i=0;i<selectedEntityTypes.length;i++) {
          if(selectedEntityTypes[i].title){
              entityTypeExternalNames.push(selectedEntityTypes[i].title);
          }else if(selectedEntityTypes[i].id){
              entityTypeExternalNames.push(selectedEntityTypes[i].id);
          }
      }
                  let selectedEntityStr = entityTypeExternalNames.join();

      if(selectedEntityStr.length <= 0){
          return this.entityTypeFilterText

      }
      return selectedEntityStr;             
  }

  /**
   *  Opens the attribute Model lov
  */
  _openAttributeModelLov(e){
      let rowId = e.currentTarget.rowId;
      if(rowId >= 0) {
          let lov = this.shadowRoot.querySelector("#attributeModelLov");
          let popover = this.shadowRoot.querySelector("#attributesPopover");
          if(lov && popover) {
              lov.currentRowId = rowId;
              popover.for = "attributes-text_" + rowId;
              popover.show();
          }
      } 
  }

  /**
   *  Handles the attribute selection
  */
  _onAttributeSelection(e, detail) {
      let lov = this.shadowRoot.querySelector("#attributeModelLov");
      if(lov) {
          let rowId = lov.currentRowId;
          if(rowId >= 0) {
              let attributeTxtbox = this.root.querySelector("#attributes-text_" + rowId);
              if(!attributeTxtbox) {
                  attributeTxtbox = this.shadowRoot.querySelector("#attributes-text_" + rowId);
              }                
              let row = this._getParentRow(attributeTxtbox)
              if(row) {
                  row.item.attributeModel = detail.data;
                  row.item["rowModified"] = true;
                  row.item.name = detail.data.title;
                  attributeTxtbox.value = row.item.name;
                  attributeTxtbox.title = row.item.name;
              }                               
          }
      }
      let popover = this.shadowRoot.querySelector("#attributesPopover");
      popover.for = "";
      popover.hide();
    
  }

  /**
   *  Get the parent row
  */
  _getParentRow(element) {
      if (element) {
          if(element.targetId){
              this.currenGridName = element.targetId;
          }
          if (element instanceof DataTableRow) {
              return element;
          }
          return this._getParentRow(element.parentNode);
      }
  }

  /**
   *  Handles the add row click
  */
  _onAddRowClick(e) {    
      let gridId = e.target.getAttribute("target-id");
      let grid = this.shadowRoot.querySelector("#"+gridId);
      let newRowItem = 
      {
          "name": "",
          "value": ""    
      }  
      newRowItem.id = grid.items.length;            
      grid.items.push(newRowItem);
      grid.clearCache();
  }

  /**
   *  Handles delete row click
  */
  _onDeleteRowClick(e){
      let gridId = e.target.getAttribute("target-id");
      let grid = this.shadowRoot.querySelector("#"+gridId);
      let row = this._getParentRow(e.currentTarget);
      let index = row.index;
      grid.items.splice(index, 1);
      grid.clearCache();
  }

  /**
   *  Open relationship lov 
  */
  _openRelationshipModelLov() {
      //Get the intersection if the selected entities are more than 1
      let entityTypes = this.getSelectedEntityTypes(this.selectedEntityTypes);
      if(!_.isEmpty(entityTypes) && !_.isEmpty(this._relationshipsData)) {
          let relationships = [];
          for(let i=0; i<entityTypes.length; i++) {
              let type = entityTypes[i];
              if(this._relationshipsData[type]) {
                  relationships = relationships.concat(this._relationshipsData[type]);
              }
          }

          if(!_.isEmpty(relationships)) {
              relationships = this.findDuplicate(relationships, 'title');
          }
          let relationshipPopover = this.shadowRoot.querySelector('#relationshipPopover');
          let relationshipModelLov = this.shadowRoot.querySelector('#relationshipModelLov');
          relationshipModelLov.items = [];
          relationshipModelLov.items = relationships;
          relationshipPopover.show();
      }
  }

  /**
   *  Function to find the duplicate items in an object array
   */
  findDuplicate (arrayOfObj, key) {
      return arrayOfObj.filter((item, index, array) => {
          return array.map((mapItem) => mapItem[key]).indexOf(item[key]) === index
      })
  }

  /**
   *  Function to populate relationship attributes
   */
  _onRelationshipLovSelectionChanged(e){
      this._onResetRelationshipGrid();
      let attributesList = [];
      if(DataHelper.isValidObjectPath(e.detail,"item.relationshipOwnership")){
          if(e.detail.item.relationshipOwnership == "owned"){
              this.disableHasRelationshipExistSearchToggle = false;
              if(this._attributeValuesExistsSearchEnabledDefaultValue){
                  this._isAttributeValuesExistsSearchEnabled = true
              }
          }else{
              this._isAttributeValuesExistsSearchEnabled = false
              this.disableHasRelationshipExistSearchToggle = true;
              this._hasRelationshipChecked = true;
          }
      }
     
      if(DataHelper.isValidObjectPath(e.detail, "item.attributes")) {
          let relModel = DataTransformHelper.transformRelationshipAttributeModels(e.detail.item);
          let currentAttributeItems = DataHelper.convertObjectToArray(relModel);
          attributesList = this._getAttributeList(currentAttributeItems);
      }
      let attributes = [];
      for(let i=0; i<attributesList.length; i++){
          let currentItem = attributesList[i];
          if(currentItem.dataType != "nested" ||  (currentItem.dataType == "nested" && this.showNestedAttributes)) {
              let newItem = {
                  id:attributesList[i].name,
                  name : attributesList[i].name,
                  title : attributesList[i].externalName,
                  dataType : attributesList[i].dataType,
                  displayType : attributesList[i].displayType,
                  groupName : attributesList[i].groupName,
                  referenceEntityInfo : attributesList[i].referenceEntityInfo,
                  attributeHasValueChecked : true,
                  attributeGroupName: "Relationship Attributes"
              }
              attributes.push(newItem);
          }
      }

     //Populate the relAttributeModelLov
     let relAttributeModelLov = this.shadowRoot.querySelector('#relAttributeModelLov');
     relAttributeModelLov.items = [];
     relAttributeModelLov.items = attributes;
      
     //Close the relationshipModelLov
     let relationshipPopover = this.shadowRoot.querySelector('#relationshipPopover');
     relationshipPopover.close();
     
     //Display the related entity
     this.populateRelatedEntity(e);           
  }

  _updateRelationshipData() {
      if(!_.isEmpty(this.relationshipsData)) {
          this._getRelationshipModels();
      }
  }

  _updateRelEntityData() {
      if(!_.isEmpty(this.relEntityData)) {
          let e = {
              detail: {
                  item: {
                      relEntityType : this.relEntityData.relEntityType
                  }
              }
          };

          this.populateRelatedEntity(e);
      }
  }

  _updateWorkflowData() {
      if(!_.isEmpty(this.workflowCriterion)) {
          this._getWorkflowMappings();
      }
  }

  /**
  * Function to display the selected relationship item's related Entity Type
  * Populate the related entity's attributes 
  */
  populateRelatedEntity(e){

      this.showBlock('.relEntityContainer');
      
      //Rerender the grids to prevent dynamic calculation of the width while hiding/showing the grid contents 
      this.reRenderGrid();

      this.selectedRelEntity = e.detail.item.relEntityType;
      let clonedContextData = DataHelper.cloneObject(this.contextData);
      let itemContext = {};
      itemContext.type = this.selectedRelEntity;
      itemContext.relationships = ["_ALL"];
      itemContext.relationshipAttributes = ["_ALL"];
      clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
      let req = DataRequestHelper.createEntityModelCompositeGetRequest(clonedContextData);
      req.params.fields.attributes = ["_ALL"];

      /*let req = DataRequestHelper.createGetManageModelRequest([this.selectedRelEntity]);*/
      let refModelsGetLiquid = this.liquidRelEntityAttributeGet;
      if (refModelsGetLiquid) {
          refModelsGetLiquid.requestData = req;
          refModelsGetLiquid.generateRequest();
      }          
  }

  showBlock(className) {
      let displayBlock = this.shadowRoot.querySelector(className);
      if(displayBlock) {
          displayBlock.setAttribute("show","true");
      }            
  }

  hideBlock(className) {
      let hideBlock = this.shadowRoot.querySelector(className);
      if(hideBlock) {
          hideBlock.setAttribute("show","false");
      }
  }
  _getAttributeList(attributeItems){
      let attributeList = [];
      for (let i = 0; i < attributeItems.length; i++) {
              let currentItem = attributeItems[i];
              let nestedAttributeItems = [];
              if (currentItem.dataType == "nested") {
                  if(this.showNestedChildAttributes || this.showNestedAttributes){
                      nestedAttributeItems = DataHelper.getNestedAttributeItems(currentItem,this.showNestedAttributes,this.showNestedChildAttributes);
                      if (nestedAttributeItems.length > 0) {
                          attributeList = attributeList.concat(nestedAttributeItems);
                      }
                  }
              } else{
                  attributeList.push(currentItem);
              }
          }
      return attributeList;
  }

  _onRelEntityAttributeGetReceived(e,detail){
      let response = e.detail.response;
      let referenceModels = {};
      let responseContent = DataHelper.validateAndGetResponseContent(detail.response);
      let attributes = [];
      
      if (responseContent && !_.isEmpty(responseContent.entityModels)) {
          let attributesModel = [];
          attributesModel.push(DataTransformHelper.transformAttributeModels(responseContent.entityModels[0], this.contextData));
          let attributesList = [];
          if(attributesModel && attributesModel.length > 0){
              attributesList = DataHelper.convertObjectToArray(attributesModel[0]);
          }

          let finalAttributeList = this._getAttributeList(attributesList);
          
          for(let j = 0; j < finalAttributeList.length; j++){
              let currentItem = finalAttributeList[j];
                  if(currentItem.dataType != "nested" ||  (currentItem.dataType == "nested" && this.showNestedAttributes)){
                      let newItem = { 
                          id: currentItem.name,
                          name: currentItem.name,
                          title: currentItem.externalName,
                          dataType: currentItem.dataType,
                          displayType: currentItem.displayType,
                          groupName: currentItem.groupName,
                          referenceEntityInfo: currentItem.referenceEntityInfo
                      }
                      attributes.push(newItem);
                  }
          }
      }              
      let relEntityAttributeModelLov = this.shadowRoot.querySelector('#relEntityAttributeModelLov');
      relEntityAttributeModelLov.items = [];
      relEntityAttributeModelLov.items = attributes;

      if(!_.isEmpty(this.relEntityData)) {
          this._populateRelEntityGridData(this.relEntityData);
      }
  }


  _onRelEntityAttributeGetFailed(e){
      this.logWarning("relEntity Attribute get failed with error",JSON.stringify(e.detail)); 
  }
  /**
  * Function to display the selected relationship on the button
  */
  getSelectedRelationship(selectedRelationship){
      if(selectedRelationship && selectedRelationship.title){
          return selectedRelationship.title;
      } else {
          return "Relationships";
      }
  }

  /**
  * Function to display the selected relationship on the button
  */
  getSelectedRelEntityName(selectedRelEntity){
      if(selectedRelEntity){
          return EntityTypeManager.getInstance().getTypeExternalNameById(selectedRelEntity);
      } else {
          return "Related Entity";
      }
  }

  /**
   *  Function to open relationship attributes lov
   */
  _openRelationshipAttributeModelLov(e){
      let rowId = e.currentTarget.rowId;
      if(rowId >= 0) {
          let lov = this.shadowRoot.querySelector("#relAttributeModelLov");
          let popover = this.shadowRoot.querySelector("#relAttributesPopover");
          if(lov && popover) {
              lov.currentRowId = rowId;
              popover.for = "relationship-text_" + rowId;
              popover.show();
          }
      } 
  }

  /**
  *  Function to open relationship attributes lov
  */
  _openRelEntityAttributeModelLov(e){
     let rowId = e.currentTarget.rowId;
     if(rowId >= 0) {
         let lov = this.shadowRoot.querySelector("#relEntityAttributeModelLov");
         let popover = this.shadowRoot.querySelector("#relEntityAttributesPopover");
         if(lov && popover) {
             lov.currentRowId = rowId;
             popover.for = "relEntity-text_" + rowId;
             popover.show();
         }
     } 
 }

  /**
  *  Function to select relationship attribute from the lov
  */
  _onRelAttributeLovSelectionChanged(e){
      let lov = this.shadowRoot.querySelector("#relAttributeModelLov");
      if(lov) {
          let rowId = lov.currentRowId;
          if(rowId >= 0) {
              let relattributeTxtbox = this.root.querySelector("#relationship-text_" + rowId);
              if(!relattributeTxtbox) {
                  relattributeTxtbox = this.shadowRoot.querySelector("#relationship-text_" + rowId);
              }                
              let row = this._getParentRow(relattributeTxtbox)
              if(row) {
                  row.item.attributeModel = e.detail.item;
                  row.item["rowModified"] = true;
                  row.item.name = e.detail.item.title;
                  relattributeTxtbox.value = row.item.name;
                  relattributeTxtbox.title = row.item.name;
              }                               
          }
      }
      let popover = this.shadowRoot.querySelector("#relAttributesPopover");
      popover.for = "";
      popover.hide();
  }

  /**
  *  Function to select related entity attribute from the lov
  */
  _onRelEntityAttributeLovSelectionChanged(e){
      let lov = this.shadowRoot.querySelector("#relEntityAttributeModelLov");
      if(lov) {
          let rowId = lov.currentRowId;
          if(rowId >= 0) {
              let relattributeTxtbox = this.root.querySelector("#relEntity-text_" + rowId);
              if(!relattributeTxtbox) {
                  relattributeTxtbox = this.shadowRoot.querySelector("#relEntity-text_" + rowId);
              }                
              let row = this._getParentRow(relattributeTxtbox)
              if(row) {
                  row.item.attributeModel = e.detail.item;
                  row.item["rowModified"] = true;
                  row.item.name = e.detail.item.title;
                  relattributeTxtbox.value = row.item.name;
                  relattributeTxtbox.title = row.item.name;
                  row.item.attributeModel["attributeHasValueChecked"] = true
              }                               
          }
      }
      let popover = this.shadowRoot.querySelector("#relEntityAttributesPopover");
      popover.for = "";
      popover.hide();
  }
  /**
  * Open the Workflow Lov
  */
  _openWorkflowModelLov(e) {

      //If entity types are not changed, return without making a rdf call
      let selectedEntities =  this.getSelectedEntityTypes(this.selectedEntityTypes);
      
      if(!_.isEmpty(selectedEntities) && !_.isEmpty(this._workflowData)) {
          let workflows = [];
          for(let i=0; i<selectedEntities.length; i++) {
              let type = selectedEntities[i];
              if(this._workflowData[type]) {
                  workflows = workflows.concat(this._workflowData[type]);
              }
          }

          let rowId = e.currentTarget.rowId;
          if(rowId >= 0) {
              let lov = this.shadowRoot.querySelector("#workflowModelLov");
              lov.items = workflows;
              let popover = this.shadowRoot.querySelector("#workflowPopover");
              if(lov && popover) {
                  lov.currentRowId = rowId;
                  popover.for = "workflow-text_" + rowId;
                  popover.show();
              }
          }
      }
  }

  /**
  *  Function to select workflow attribute from the lov
  */
  _onWorkflowLovSelectionChanged(e){
      let lov = this.shadowRoot.querySelector("#workflowModelLov");
      if(lov) {
          let rowId = lov.currentRowId;
          if(rowId >= 0) {
              let wfattributeTxtbox = this.root.querySelector("#workflow-text_" + rowId);
              if(!wfattributeTxtbox) {
                  wfattributeTxtbox = this.shadowRoot.querySelector("#workflow-text_" + rowId);
              }                
              let row = this._getParentRow(wfattributeTxtbox)
              if(row) {
                  row.item.workflowExternalName = e.detail.item.title;
                  row.item.workflowShortName = e.detail.item.name;
                  row.item.attributeModel = e.detail.item;
                  row.item["rowModified"] = true;
                  row.item.name = e.detail.item.title;
                  wfattributeTxtbox.value = row.item.name;
                  wfattributeTxtbox.title = row.item.name;
              }                               
          }
      }
      let popover = this.shadowRoot.querySelector("#workflowPopover");
      popover.for = "";
      popover.hide();
  }

  /**
  * Open the Workflow Activity Lov
  */
  _openWorkflowActivityLov(e) {        
      let rowId = e.currentTarget.rowId;
  
      if(rowId >= 0) {
          let wfattributeTxtbox = this.root.querySelector("#workflow-text_" + rowId);
          if(!wfattributeTxtbox) {
              wfattributeTxtbox = this.shadowRoot.querySelector("#workflow-text_" + rowId);
          }
          let row = this._getParentRow(wfattributeTxtbox);
          let wfName = row && row.item && row.item.workflowShortName ? row.item.workflowShortName : "";
          let wfAttributes = [];

          for(let type in this._workflowData) {
              let workflow = this._workflowData[type].find(obj => obj.name === wfName);
              if(workflow) {
                  wfAttributes = workflow.attributes;
                  break;
              } else {
                  continue;
              }
          }

          //Populate the Workflow Activity Lov
          let workflowActivities = [];
          for(let i=0;i<wfAttributes.length;i++){
              let newItem = {
                  name : AttributeHelper.getFirstAttributeValue(wfAttributes[i].activityName),
                  title : AttributeHelper.getFirstAttributeValue(wfAttributes[i].externalName)
              }                        
              workflowActivities.push(newItem);
          }
          let lov = this.shadowRoot.querySelector("#workflowActivityLov");
          lov.items = [];
          lov.items = workflowActivities;
          let popover = this.shadowRoot.querySelector("#workflowActivityPopover");
          if(lov && popover) {
              lov.currentRowId = rowId;
              popover.for = "workflow-value_" + rowId;
              popover.show();
          }
      } 
  }

  /**
  *  Function to select workflow activity attribute from the lov
  */
  _onWorkflowActivityLovSelectionChanged(e){
      let lov = this.shadowRoot.querySelector("#workflowActivityLov");
      if(lov) {
          let rowId = lov.currentRowId;
          if(rowId >= 0) {
              let wfattributeTxtbox = this.root.querySelector("#workflow-value_" + rowId);
              if(!wfattributeTxtbox) {
                  wfattributeTxtbox = this.shadowRoot.querySelector("#workflow-value_" + rowId);
              }                
              let row = this._getParentRow(wfattributeTxtbox)
              if(row) {
                  row.item.workflowActivityExternalName = e.detail.item.title;
                  row.item.workflowActivityShortName = e.detail.item.name;
                  row.item["rowModified"] = true;
                  row.item.value = e.detail.item.title;
                  wfattributeTxtbox.value = row.item.value;
                  wfattributeTxtbox.title = row.item.value;
              }                               
          }
      }
      let popover = this.shadowRoot.querySelector("#workflowActivityPopover");
      popover.for = "";
      popover.hide();
  }

  _isWorkflowSearchEnabled(workflowName) {
      if(workflowName && workflowName !== "") {
          return false;
      }
      return true;
  }

  _onOpenFilterPopover(e){
      let rowId = e.currentTarget.rowId;
      this.currentTargetRowName = "";
      this.currentTargetRowId = "";

      this.currentTargetRowName = e.currentTarget.getAttribute("target-row-name");
      this.currentTargetRowId = rowId;

      let filterInputValue = "";
      let attributeValTxtbox = this.root.querySelector("#"+ this.currentTargetRowName + this.currentTargetRowId);
      if(attributeValTxtbox.value){
          filterInputValue = attributeValTxtbox.value;
      }

      let row = this._getParentRow(attributeValTxtbox);            
      let rockFilterObj = this.shadowRoot.querySelector("#rockfilter");
      let forTarget = "";
      let items = "";
      if(rowId >= 0) {
          forTarget = this.currentTargetRowName  + rowId;
          items = row.item;
      }
      rockFilterObj.onOpenFilterPopover(filterInputValue,items,forTarget,this.currenGridName,this._isAttributeValuesExistsSearchEnabled);
  }

  onUpdateFilter(eventDetail){
      let filterInputValue = "";
      if(eventDetail){
          filterInputValue = eventDetail.detail.filterInputValue;
      }
        
      let attributeValTxtbox = this.root.querySelector("#"+ this.currentTargetRowName + this.currentTargetRowId);
      let row = this._getParentRow(attributeValTxtbox);
      let _isHasAttributeValueSearchRequest = false
      if(row) {
          row.item.selectedItems = eventDetail.detail.selectedItems;
          row.item.value = "";
          attributeValTxtbox.value = "";
          attributeValTxtbox.title = "";  
          let attributeValuesExistsSearchEnabled = eventDetail.detail.attributeValuesExistsSearchEnabled
          if(attributeValuesExistsSearchEnabled && (!eventDetail.detail.attributeHasValueChecked || _.isEmpty(filterInputValue))){
              if(_.isEmpty(filterInputValue)){
                  filterInputValue = "has value"
              }
              if(!eventDetail.detail.attributeHasValueChecked){
                  filterInputValue = "has no value"
              }
              _isHasAttributeValueSearchRequest = true;
          }else{
              _isHasAttributeValueSearchRequest = false;
          }
          row.item.value = filterInputValue;   
          attributeValTxtbox.value = filterInputValue;
          attributeValTxtbox.title = filterInputValue;
          if(this.relationshipGridData[this.currentTargetRowId] && this.currenGridName == "relationshipGrid"){
              this.relationshipGridData[this.currentTargetRowId]["isHasAttributeValueSearchRequest"] = _isHasAttributeValueSearchRequest;
          }else if(this.relEntityGridData[this.currentTargetRowId] && this.currenGridName == "relatedEntityGrid"){
              this.relEntityGridData[this.currentTargetRowId]["isHasAttributeValueSearchRequest"] = _isHasAttributeValueSearchRequest;
          }
      }
  }
  _onToggleButtonChange(toggleState){
      if(toggleState){
      this._toggleButtonText =  "Having";
      this.enableOverlay = false;
      }else{
          this.enableOverlay = true;
          this._onResetRelationshipGrid();
          this._toggleButtonText = "Having No";
      }
}

  _getItemVisibility(settings,val) {
        if(settings){
            if(!_.isEmpty(settings)){
                return settings[val];
            }
        }
        if(val == "showNestedAttributes"){
            return true;
        }
        return false;
    }
}

customElements.define(RockQueryBuilder.is, RockQueryBuilder);
