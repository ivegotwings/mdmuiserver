/**
`rock-attribute`
Represents the attribute component in the framework. It understands the details of the attribute from 
the parameters it has recieved and renders appropriate UI elements to manage an attribute value.
@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-validator/bedrock-validator.js';
import '../bedrock-helpers/format-helper.js';
import '../pebble-textbox/pebble-textbox.js';
import '../pebble-textbox-collection/pebble-textbox-collection.js';
import '../pebble-textarea/pebble-textarea.js';
import '../pebble-richtexteditor/pebble-richtexteditor.js';
import '../pebble-dropdown/pebble-dropdown.js';
import '../pebble-boolean/pebble-boolean.js';
import '../pebble-button/pebble-button.js';
import '../pebble-datetime-picker/pebble-datetime-picker.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-list.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-floating.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-dialog/pebble-dialog.js';
import '../pebble-info-icon/pebble-info-icon.js';
import '../rock-entity-combo-box/rock-entity-combo-box.js';
import '../rock-nested-attribute-grid/rock-nested-attribute-grid.js';
import '../rock-path-selector/rock-path-selector.js';
import './pebble-error-list.js';
import { flush } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockAttribute extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior],
    OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-floating bedrock-style-icons bedrock-style-padding-margin bedrock-style-list">
            :host(.fallback-value) {
                --locale-coalesce-marker: {
                    color: var(--color-variant-1);
                }
            }

            :host([changed]) .attribute {
                background-color: var(--edit-attribute-bgcolor) !important;
            }

            .attribute {
                @apply --layout-horizontal;
                --pebble-grid-container: {
                    background-color: var(--palette-white, #ffffff);
                    margin-left: 0;
                    margin-right: 0;
                    padding-right: 20px;
                    padding-left: 20px;
                }
            }

            :host(.coalesced-value) {
                --context-coalesce-marker: {
                    font-style: italic;
                }
            }
            .attribute-view-label {
                font-size: var(--font-size-sm, 12px);
                font-family: 'Roboto', Helvetica, Arial, sans-serif;
                font-weight: normal;
                font-style: normal;
                font-stretch: normal;
                line-height: 16px;                
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                display:inline-block;
                max-width: calc(100% - 20px);
                color: var(--label-text-color, #96b0c6);
                @apply --context-coalesce-label;
            }

            .attribute-label-wrapper{
                width:calc(100% - 100px);
                display:block;
            }

            .attribute-coalesced-label .attribute-view-label {
                font-style: italic;
            }

            .attribute-coalesced-label {
                --context-coalesce-label: {
                    font-style: italic;
                }
            }

            .attribute-non-coalesced-label .attribute-view-label {
                color: #000;
                font-weight: 500;
            }

            .attribute-non-coalesced-label {
                --context-coalesce-label: {
                    color: #000;
                    font-weight: 500;
                }
            }

            .attribute {
                @apply --layout-horizontal;
            }

            .attribute.list {
                @apply --layout-center-center;
                padding: 5px 20px 25px 10px;
                margin-bottom: 10px;
            }

            .attribute-main {
                width: 100%;
                position: relative;
                @apply --attribute-main;
            }

            .attribute-icons-wrapper {
                position: absolute;
                right: 0px;
                top: -5px;
                z-index: 2;
            }

            .attribute-icons {
                display: inline-block;
               
            }
            .attribute-icons pebble-icon{
                opacity: 0;
                transition: all 0.3s;
                -webkit-transition: all 0.3s;
            }

            .attribute-icons pebble-info-icon {
                opacity: 1;
            }

            .attribute-main:hover .attribute-icons pebble-icon{
                opacity: 1;
            }

            .attribute-view {
                border-bottom: 1px solid #E0E0E0;
                box-shadow: 0 2px 6px -6px #000;
                -webkit-box-shadow: 0 2px 6px -6px #000;
                -moz-box-shadow: 0 2px 6px -6px #000;
                -ms-box-shadow: 0 2px 6px -6px #000;
            }

            .attribute-view,
            .attribute-edit {
                clear: both;
            }

            .attribute-edit {
                @apply --attribute-edit;
                --pebble-dt-default-inputarea: {
                    width: 100%;
                }
            }

            .attribute-view.grid {
                margin-top: 0;
            }

            .attribute-view.grid .attribute-view-value {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .attribute-view.grid {
                --pebble-textarea-input: {
                    max-height: 25px;
                }
            }

            .attribute-view-value {
                font-size: var(--default-font-size, 14px);
                display: inline-block;
                width: 100%;
                vertical-align: middle;
                max-height: 100px;
                overflow-y: auto;
                @apply --locale-coalesce-marker;
                @apply --context-coalesce-marker;
            }

            .attribute-icons pebble-icon {
                padding: 0;
                transition: all 0.3s;
                cursor: pointer;
                -webkit-transition: all 0.3s;
                --pebble-icon-color: {
                    fill: var(--secondary-icon-color, #c1cad4);
                }
            }

            .attribute-icons pebble-icon:hover {
                --pebble-icon-color: {
                    fill: var(--primary-icon-color, #75808b);
                }
            }

            .datetimepicker-container {
                width: 100%;
                position: relative;
            }

            #dateTimeTriggerContainer {
                position: absolute;
                right: -11px;
                bottom: -6px;
            }

            #dateTimeTriggerContainer {
                --paper-button: {
                    min-width: auto;
                }
            }

            #error-display {
                position: absolute;
                right: 0;
                left: 0;
                bottom: -23px;
            }

            .error {
                color: var(--error-color, #ed204c);
                font-size: var(--font-size-sm, 12px);
                font-weight: var(--font-medium, 500);
                letter-spacing: 0.011em;
                line-height: 11px;
                width: calc(100% - 18px);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                display: inline-block;
            }

            .error-circle {
                height: 18px;
                width: 18px;
                line-height: 18px;
                text-align: center;
                border-radius: 50%;
                background: var(--error-color, #ed204c);
                color: var(--palette-white, #fff);
                font-size: var(--font-size-xs, 10px);
                float: right;
                margin-top: 1px;
            }

            .warning {
                color: var(--warning-color, #f78e1e);
                font-size: var(--font-size-sm, 12px);
                font-weight: var(--font-medium, 500);
                letter-spacing: 0.011em;
                line-height: 11px;
                width: calc(100% - 18px);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                display: inline-block;
            }

            .warning-circle {
                height: 18px;
                width: 18px;
                line-height: 18px;
                text-align: center;
                border-radius: 50%;
                background: var(--warning-color, #f78e1e);
                color: var(--palette-white, #fff);
                font-size: var(--font-size-xs, 10px);
                float: right;
                margin-top: 1px;
            }

            pebble-textbox-collection {
                --text-collection-label: {
                    font-size: var(--font-size-sm, 12px);
                    color: var(--label-text-color, #96B0C5);
                }
                ;
                --text-collection-manage-tag-container: {
                    height: 65px;
                }
            }

            .close-item {
                position: absolute;
                top: 30px;
                right: -14px;
            }

            .delete-item {
                position: absolute;
                top: 27px;
                right: -38px;
            }

            pebble-popover#view-source-information-popover {
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

            pebble-richtexteditor p {
                margin: 0px;
            }

            /*For IE/Edge Specifically...else new line being created in edge due to Quill Issue*/

            pebble-richtexteditor .ql-clipboard {
                left: -100000px;
                height: 1px;
                overflow-y: hidden;
                position: absolute !important;
                top: 50%;
            }

            /*For IE/Edge Specifically...to get placeholder text and border*/

            pebble-richtexteditor .ql-editor.ql-blank::before {
                color: rgba(0, 0, 0, 0.6);
                content: "Enter the text here...";
                font-style: italic;
                pointer-events: none;
                position: absolute;
            }

            pebble-richtexteditor .ql-editor {
                border: 1px solid #c1c1c1 !important;
                border-top: 0;
                font-size: var(--default-font-size, 14px) !important;
                color: var(--attrpanel-color-text, #1a2028);
                padding: 12px 15px;
                tab-size: 4;
                white-space: pre-wrap;
                word-wrap: break-word;
            }

            pebble-popover#view-source-information-popover::after,
            pebble-popover#view-source-information-popover::before {
                bottom: 100%;
                left: 20px;
                border: solid transparent;
                content: " ";
                height: 0;
                width: 0;
                position: absolute;
                pointer-events: none;
            }

            pebble-popover#view-source-information-popover::after {
                border-color: rgba(255, 255, 255, 0);
                border-bottom-color: #ffffff;
                border-width: 6px;
                margin-left: -6px;
            }

            pebble-popover#view-source-information-popover::before {
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
            .attribute-edit-mode-icons .source-information-icon{
                opacity: 1;
            }
            .popup-link-text{
                color: var(--text-primary-color, #1a2028);
                font-size: var(--font-size-sm, 12px);
            }

            #messagePopover{
                --popover: {
                    max-height: 350px;
                    overflow-y: auto;
                    overflow-x: auto;
                }
            }
            #rtePopover{
                --pebble-popover-width: 260px;
                --popover: {
                    max-height: 350px;
                }
            }
            
        </style>
        <div class\$="attribute [[functionalMode]]">
            <div class\$="attribute-main [[_getCoalescedLabelClass()]]">
                <div class\$="attribute-icons-wrapper [[_getAttributeIconEditClass(mode)]]">
                    <div class="attribute-icons" hidden\$="[[_isGridType]]">
                        <template is="dom-if" if="[[!_isEditMode(mode)]]">
                            <template is="dom-if" if="[[_isAttributeEditable(attributeModelObject)]]">
                                <pebble-icon disabled\$="[[readonly]]" name="edit" class="pebble-icon-size-16 m-l-5" icon="pebble-icon:action-edit" title="Edit" on-tap="_onEditClick" tabindex="-1"></pebble-icon>
                            </template>
                        </template>
                        <template is="dom-if" if="[[_isComponentEditable(mode, attributeModelObject)]]">
                            <template is="dom-if" if="[[_hasValue(attributeObject)]]">
                                <pebble-icon name="clear" class="pebble-icon-size-12 m-l-5 close-item" icon="pebble-icon:window-action-close" title="Clear value" on-tap="_onClearClick" tabindex="-1"></pebble-icon>
                            </template>
                        </template>
                        <template is="dom-if" if="[[_isComponentEditable(mode, attributeModelObject)]]">
                            <template is="dom-if" if="[[showDeleteIcon]]">
                                <pebble-icon name="delete" class="pebble-icon-size-16 m-l-5 delete-item" icon="pebble-icon:action-delete" title="Remove Attribute" on-tap="_onDeleteClick" tabindex="-1"></pebble-icon>
                            </template>
                            <template is="dom-if" if="[[_isValueChanged]]">
                                <pebble-icon name="revert" class="pebble-icon-size-16 m-l-5" icon="pebble-icon:revert" title="Revert" on-tap="_onRevertClick" tabindex="-1" hidden\$="[[hideRevert]]"></pebble-icon>
                            </template>
                        </template>
                        <template is="dom-if" if="[[_isEditMode(mode)]]">
                            <template is="dom-if" if="[[_isAttributeEditable(attributeModelObject)]]">
                                <pebble-icon name="saveasnull" class="pebble-icon-size-16 m-l-5" icon="pebble-icon:save-as-null" title="Set as Null" on-tap="_onTapSaveAsNull" tabindex="-1" hidden\$="[[hideSaveAsNull]]"></pebble-icon>
                            </template>
                        </template>
                        <pebble-icon name="time" class="pebble-icon-size-16 m-l-5" icon="pebble-icon:time" title="Manage historical data" on-tap="_onTimeClick" tabindex="-1" hidden\$="[[hideHistory]]"></pebble-icon>
                        
                        <pebble-icon name="locale" hidden="" class="pebble-icon-size-16 m-l-5 pebble-icon-color-blue" icon="pebble-icon:globe" title="Manage in multiple locales" on-tap="_onLocaleClick" tabindex="-1"></pebble-icon>
                         <template is="dom-if" if="[[_sourceInfoVisible]]"> 
                           <pebble-icon name="owner" class="pebble-icon-size-16 m-l-5 source-information-icon" icon="pebble-icon:hierarchy" id="view-source-information" title="View source information" on-tap="_onSourceInformationClick" tabindex="-1"></pebble-icon>
                           <template is="dom-if" if="[[_isReadyToShowSourceInfoPopover]]">
                               <pebble-popover id="view-source-information-popover" for="view-source-information">
                                   <div class="attributes-description">
                                       <div class="source-information-header">Source Information</div>
                                       <div class="source-information-description">This value was sourced from the following path</div>
                                       <template is="dom-if" if="[[_hasFallbackValue()]]">
                                           <ul class="source-information-path">
                                               Locale:
                                               <br>
                                               <template is="dom-repeat" items="[[_fallbackList]]">
                                                   <li class="path-item">[[item]]</li>
                                               </template>
                                           </ul>
                                       </template>
                                       <template is="dom-if" if="[[_hasContextCoalescedValue()]]">
                                           <ul class="source-information-path">
                                               Context:
                                               <br>
                                               <template is="dom-repeat" items="[[_contextCoalescePathList]]">
                                                   <li class="path-item">[[item]]</li>
                                               </template>
                                           </ul>
                                       </template>
                                       <template is="dom-if" if="[[_hasRelatedEntityCoalescedValue()]]">
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
                          </template>
                        <div class="clearfix"></div>
                    </div>
                </div>
                <template is="dom-if" if="[[_isComponentEditable(mode, attributeModelObject)]]">
                    <div class\$="[[_getAttributeEditClass(changed)]]">
                        <!-- TEXTAREA -->
                        <template is="dom-if" if="[[_isTextArea(attributeModelObject)]]">
                            <pebble-textarea id="input" no-label-float="[[noLabelFloat]]" description-object="[[_getDescriptionObject()]]" validation-errors="{{validationErrors}}" label="{{_getLabel(attributeModelObject.externalName)}}" value="{{attributeDisplayValue}}" maxlength="[[attributeModelObject.maxLength]]" invalid="{{invalid}}" tabindex="[[tabindex]]"></pebble-textarea>
                        </template>

                        <!-- DROPDOWN -->
                        <template is="dom-if" if="[[_isDropDown(attributeModelObject)]]">
                            <pebble-dropdown id="input" label="{{_getLabel(attributeModelObject.externalName)}}" items="{{attributeModelObject.allowedValues}}" selected-value="{{attributeDisplayValue}}" invalid="{{invalid}}" no-label-float="[[noLabelFloat]]" description-object="[[_getDescriptionObject()]]" tabindex="[[tabindex]]">
                            </pebble-dropdown>
                        </template>
                        <!-- BOOLEAN -->
                        <template is="dom-if" if="[[_isBoolean(attributeModelObject)]]">
                            <pebble-boolean id="input" label="[[_getLabel(attributeModelObject.externalName)]]" value="{{attributeDisplayValue}}" invalid="{{invalid}}" no-label-float="[[noLabelFloat]]" description-object="[[_getDescriptionObject()]]" true-text="[[isNullOrEmpty(attributeModelObject.trueText, 'TRUE')]]" false-text="[[isNullOrEmpty(attributeModelObject.falseText,'FALSE')]]" tabindex="[[tabindex]]">
                            </pebble-boolean>
                        </template>
                        <!-- DATE -->
                        <template is="dom-if" if="[[_isDate(attributeModelObject)]]">
                            <pebble-datetime-picker id="datePicker" min-date="[[_convertRangeFieldToDate(attributeModelObject, 'rangeFrom')]]" max-date="[[_convertRangeFieldToDate(attributeModelObject, 'rangeTo')]]" label="[[_getLabel(attributeModelObject.externalName)]]" value="{{attributeDisplayValue}}" picker-type="date" no-label-float="[[noLabelFloat]]" description-object="[[_getDescriptionObject()]]" tabindex="[[tabindex]]">
                            </pebble-datetime-picker>
                        </template>
                        <!-- DATETIME -->
                        <template is="dom-if" if="[[_isDateTime(attributeModelObject)]]">
                            <pebble-datetime-picker id="dateTimePicker" min-date="[[_convertRangeFieldToDate(attributeModelObject, 'rangeFrom')]]" max-date="[[_convertRangeFieldToDate(attributeModelObject, 'rangeTo')]]" label="[[_getLabel(attributeModelObject.externalName)]]" value="{{attributeDisplayValue}}" picker-type="datetime" no-label-float="[[noLabelFloat]]" description-object="[[_getDescriptionObject()]]" tabindex="[[tabindex]]" default-time="[[_getDefaultTime(attributeObject.value)]]">
                            </pebble-datetime-picker>
                        </template>
                        <!-- TEXTBOX-COLLECTION -->
                        <template is="dom-if" if="[[_isTextboxCollection(attributeModelObject)]]">
                            <div class="text-collection-container">
                                <pebble-textbox-collection label="{{_getLabel(attributeModelObject.externalName)}}" id="txtCollection" no-label-float="[[noLabelFloat]]" description-object="[[_getDescriptionObject()]]" values="{{attributeObject.value}}" tabindex="[[tabindex]]" selected-values-color="[[_fallbackColor]]" selected-values-font-style="[[_coalescedFontStyle]]">
                                </pebble-textbox-collection>
                            </div>
                        </template>
                        <!-- If display type is not supported then textbox is used -->
                        <!-- TEXTBOX -->
                        <template is="dom-if" if="[[_isTextBox(attributeModelObject)]]">
                            <pebble-textbox id="input" label="{{_getLabel(attributeModelObject.externalName)}}" value="{{attributeDisplayValue}}" maxlength="[[attributeModelObject.maxLength]]" invalid="{{invalid}}" no-label-float="[[noLabelFloat]]" description-object="[[_getDescriptionObject()]]" tabindex="[[tabindex]]"></pebble-textbox>
                        </template>

                        <template is="dom-if" if="[[_isPathSelector(attributeModelObject)]]">
                            <rock-path-selector values="{{attributeDisplayValue}}" path-entity-type="[[pathEntityType]]" path-relationship-name="[[pathRelationshipName]]" root-node="[[_rootNode]]" multi-select="[[_isMultiSelect(attributeModelObject)]]" context-data="[[contextData]]" is-readonly="[[isReadonly]]" label="{{_getLabel(attributeModelObject.externalName)}}" no-label-float="[[noLabelFloat]]" dialog-title="[[_dialogTitle]]" leaf-node-only="[[_isLeafNodeOnly(attributeModelObject)]]" attribute-external-name="{{_getLabel(attributeModelObject.externalName)}}" path-seperator="[[_pathSeperator]]" has-fallback-value="[[_hasFallbackValue(attributeModelObject, attributeObject)]]" has-context-coalesced-value="[[_hasContextCoalescedValue(attributeModelObject, attributeObject)]]" disable-child-node="" apply-locale-coalesced-style="" apply-context-coalesced-style="">
                            </rock-path-selector>
                        </template>
                    </div>
                </template>

                <template is="dom-if" if="[[!_isComponentEditable(mode, attributeModelObject)]]">
                    <template is="dom-if" if="[[_useDefaultReadMode(attributeModelObject)]]">
                        <div class\$="attribute-view [[functionalMode]]">
                            <span hidden="[[_isGridType]]" class="attribute-label-wrapper" title$="{{attributeModelObject.externalName}}">
                                <span class="attribute-view-label">{{attributeModelObject.externalName}} </span>
                                <template is="dom-if" if="[[_getDescriptionObject()]]">
                                    <pebble-info-icon hidden\$="[[_isGridOrNested(attributeModelObject)]]" description-object="[[_getDescriptionObject()]]"></pebble-info-icon>
                                </template>
                            </span>
                            <span class="attribute-view-value" title$="{{_formatValue(attributeModelObject, attributeObject)}}">{{_formatValue(attributeModelObject, attributeObject)}}</span>
                        </div>
                    </template>
                   
                    <!-- TEXTBOX-COLLECTION -->
                    <template is="dom-if" if="[[_isTextboxCollection(attributeModelObject)]]">
                        <div class="text-collection-container">
                            <pebble-textbox-collection label="{{_getLabel(attributeModelObject.externalName)}}" id="txtCollection" values="{{attributeDisplayValue}}" no-label-float="[[noLabelFloat]]" description-object="[[_getDescriptionObject()]]" tabindex="[[tabindex]]" selected-values-color="[[_fallbackColor]]" selected-values-font-style="[[_coalescedFontStyle]]" is-readonly="">
                            </pebble-textbox-collection>
                        </div>
                    </template>

                    <template is="dom-if" if="[[_isPathSelector(attributeModelObject)]]">
                        <rock-path-selector values="{{attributeDisplayValue}}" context-data="[[contextData]]" is-readonly="" label="{{_getLabel(attributeModelObject.externalName)}}" no-label-float="[[noLabelFloat]]" multi-select="[[_isMultiSelect(attributeModelObject)]]" has-fallback-value="[[_hasFallbackValue(attributeModelObject, attributeObject)]]" has-context-coalesced-value="[[_hasContextCoalescedValue(attributeModelObject, attributeObject)]]" disable-child-node="" apply-locale-coalesced-style="" apply-context-coalesced-style="">
                        </rock-path-selector>
                    </template>

                </template>

                <template is="dom-if" if="[[_isLOV(attributeModelObject)]]">
                    <template is="dom-if" if="[[_isCollection(attributeModelObject)]]">
                        <rock-entity-combo-box id="multi-select-combo-box" apply-locale-coalesce="[[applyLocaleCoalesce]]" no-popover="" apply-locale-coalesced-style="" apply-context-coalesced-style="" selected-values-color="[[_fallbackColor]]" selected-values-font-style="[[_coalescedFontStyle]]" selected-values-locale="{{attributeObject.selectedLocales}}" id-field="[[_getMappedColumn('id', attributeModelObject)]]" value-field="[[_getMappedColumn('value', attributeModelObject)]]" image-id-field="[[_getMappedColumn('imageId', attributeModelObject)]]" title-pattern="[[_getMappedColumn('title', attributeModelObject)]]" sub-title-pattern="[[_getMappedColumn('subtitle', attributeModelObject)]]" multi-select="" label="[[_getLabel(attributeModelObject.externalName)]]" is-readonly="[[!_isComponentEditable(mode, attributeModelObject)]]" request-data="[[_prepareRequestObjectForLov(attributeModelObject, dependentAttributeObjects)]]" selected-values="{{attributeObject.value}}" selected-ids="{{attributeObject.referenceDataId}}" no-label-float="[[noLabelFloat]]" has-write-permission="[[attributeModelObject.hasWritePermission]]" description-object="[[_getDescriptionObject()]]" context-data="[[contextData]]" on-tag-removed="_onTagItemRemoved" mode="[[mode]]">
                        </rock-entity-combo-box>
                    </template>
                    <template is="dom-if" if="[[!_isCollection(attributeModelObject)]]">
                        <rock-entity-combo-box id="combo-box" apply-locale-coalesce="[[applyLocaleCoalesce]]" no-popover="" apply-locale-coalesced-style="" apply-context-coalesced-style="" selected-values-color="[[_fallbackColor]]" selected-values-font-style="[[_coalescedFontStyle]]" selected-values-locale="{{attributeObject.selectedLocales}}" id-field="[[_getMappedColumn('id', attributeModelObject)]]" value-field="[[_getMappedColumn('value', attributeModelObject)]]" image-id-field="[[_getMappedColumn('imageId', attributeModelObject)]]" title-pattern="[[_getMappedColumn('title', attributeModelObject)]]" sub-title-pattern="[[_getMappedColumn('subtitle', attributeModelObject)]]" label="[[_getLabel(attributeModelObject.externalName)]]" is-readonly="[[!_isComponentEditable(mode, attributeModelObject)]]" request-data="[[_prepareRequestObjectForLov(attributeModelObject, dependentAttributeObjects)]]" selected-value="{{attributeObject.value}}" selected-id="{{attributeObject.referenceDataId}}" context-data="[[contextData]]" has-write-permission="[[attributeModelObject.hasWritePermission]]" no-label-float="[[noLabelFloat]]" description-object="[[_getDescriptionObject()]]" on-tag-removed="_onTagItemRemoved" mode="[[mode]]">
                        </rock-entity-combo-box>
                    </template>
                </template>

                <!-- NESTED ATTRIBUTES -->
                <template is="dom-if" if="[[_isNested(attributeModelObject)]]">
                    <template is="dom-if" if="[[!_isGridType]]">
                        <rock-nested-attribute-grid label="{{_getLabel(attributeModelObject.externalName)}}" attribute-model-object="[[attributeModelObject]]" original-attribute-object="[[_cloneObject(attributeObject)]]" attribute-object="{{attributeObject}}" context-data="[[contextData]]" mode="[[mode]]" changed="{{changed}}" apply-locale-coalesce="[[applyLocaleCoalesce]]" apply-graph-coalesced-style\$="[[applyGraphCoalescedStyle]]" dependent-attribute-objects="[[dependentAttributeObjects]]" dependent-attribute-model-objects="[[dependentAttributeModelObjects]]"></rock-nested-attribute-grid>
                    </template>
                    <template is="dom-if" if="[[_isGridType]]">
                        <span id="nestedAttributeLink" class="popup-link-text" on-tap="_nestedAttributeLinkTapped">Click here</span>
                        <pebble-dialog id="nestedAttributeModal" modal="" show-ok="" button-ok-text="Ok" show-close-icon="" no-cancel-on-outside-click="" no-cancel-on-esc-key="" dialog-title="{{attributeModelObject.externalName}}">
                            <rock-nested-attribute-grid label="{{_getLabel(attributeModelObject.externalName)}}" attribute-model-object="[[attributeModelObject]]" original-attribute-object="[[_cloneObject(attributeObject)]]" attribute-object="{{attributeObject}}" context-data="[[contextData]]" mode="[[mode]]" apply-locale-coalesce="[[applyLocaleCoalesce]]" apply-graph-coalesced-style\$="[[applyGraphCoalescedStyle]]" dependent-attribute-objects="[[dependentAttributeObjects]]" dependent-attribute-model-objects="[[dependentAttributeModelObjects]]"></rock-nested-attribute-grid>
                        </pebble-dialog>
                    </template>
                </template>

                <!-- RICHTEXTEDITOR -->
                <template is="dom-if" if="[[_isRichTextEditor(attributeModelObject)]]">
                    <!-- Show the popover for read-only mode for the grid-->
                    <template is="dom-if" if="[[_isGridType]]">
                        <template is="dom-if" if="[[!_isEditMode(mode)]]">
                            <span id="rtelink" class="fallback-value popup-link-text" on-mouseenter="_rteLinkHovered" on-mouseleave="_rteLinkHoveredOut">Show More</span>
                            <template is="dom-if" if="[[_isRteLinkHovered]]" restamp>
                                <pebble-popover id="rtePopover" class="p-10" for="rtelink" no-overlap="" horizontal-align="auto" vertical-align="auto" on-mouseenter="_rtePopoverHovered" on-mouseleave="_rtePopoverHoveredOut">
                                    <pebble-richtexteditor id="input" description-object="[[_getDescriptionObject()]]" validation-errors="{{validationErrors}}" label="{{_getLabel(attributeModelObject.externalName)}}" invalid="{{invalid}}" value="{{attributeDisplayValue}}" tabindex="[[tabindex]]" read-only="[[!_isComponentEditable(mode, attributeModelObject)]]" selected-values-font-style="[[_coalescedFontStyle]]" selected-values-color="[[_fallbackColor]]"></pebble-richtexteditor>
                                </pebble-popover>
                            </template>
                        </template>
                        <template is="dom-if" if="[[_isEditMode(mode)]]">
                            <span id="rteEditLink" class="popup-link-text" on-tap="_rteEditLinkTapped">Click to Edit</span>
                            <template is="dom-if" if="[[_isRteEditLinkTapped]]" restamp>
                                <pebble-dialog id="rteSingleEdit" modal="" show-ok="" button-ok-text="Ok" show-close-icon="" no-cancel-on-outside-click="" no-cancel-on-esc-key="" dialog-title="Edit rich text">
                                    <rock-attribute id="singleEdit" hide-save-as-null="true" mode="[[mode]]" functional-mode="list" attribute-model-object="{{attributeModelObject}}" attribute-object="{{attributeObject}}"></rock-attribute>
                                </pebble-dialog>
                            </template>
                        </template>
                    </template>
                    <template is="dom-if" if="[[!_isGridType]]">
                        <pebble-richtexteditor id="input" description-object="[[_getDescriptionObject()]]" validation-errors="{{validationErrors}}" label="{{_getLabel(attributeModelObject.externalName)}}" invalid="{{invalid}}" value="{{attributeDisplayValue}}" tabindex="[[tabindex]]" read-only="[[!_isComponentEditable(mode, attributeModelObject)]]" selected-values-font-style="[[_coalescedFontStyle]]" selected-values-color="[[_fallbackColor]]"></pebble-richtexteditor>
                    </template>
                </template>

                <bedrock-validator validation-errors="{{validationErrors}}" validation-warnings="{{validationWarnings}}" input="[[_getInputValue(attributeObject.value)]]" input-data-type="[[attributeModelObject.dataType]]" pattern="[[_getPatternFieldValue(attributeModelObject, 'regexPattern')]]" regex-hint="[[_getPatternFieldValue(attributeModelObject, 'regexHint')]]" min-length="[[attributeModelObject.minLength]]" max-length="[[attributeModelObject.maxLength]]" precision="[[attributeModelObject.precision]]" required="[[attributeModelObject.required]]" invalid="{{invalid}}" min="[[_getRangeFieldValue(attributeModelObject, 'rangeFrom')]]" max="[[_getRangeFieldValue(attributeModelObject, 'rangeTo')]]" min-inclusive="[[_getRangeFieldValue(attributeModelObject, 'isRangeFromInclusive')]]" max-inclusive="[[_getRangeFieldValue(attributeModelObject, 'isRangeToInclusive')]]" date-format="[[attributeModelObject.dateFormat]]" type="[[attributeModelObject.validationType]]" type-array="[[attributeModelObject.validationTypeArray]]">
                </bedrock-validator>

                <div id="error-display" hidden="[[_messageAbsent(messages)]]" on-tap="_messageTapped">
                    <span class\$="[[_getValidationClass(validationMessage)]]">[[validationMessage.text]] </span>
                    <span id="message-circle" class\$="[[_getValidationClass(validationMessage, 'true')]]">[[messagesLength]]</span>
                </div>
            </div>
        </div>

        <template is="dom-if" if="[[_isReadyToShowMessagesPopover]]">
            <pebble-popover id="messagePopover" for="message-circle" no-overlap="" horizontal-align="right">
                <pebble-error-list id="attrErrorList" messages="[[_getErrorMessages(messages)]]" errors="[[_getErrorMessages(errors)]]" warnings="[[validationWarnings]]" show-fix-now="[[!_isEditMode(mode)]]"></pebble-error-list>
            </pebble-popover>
            <bedrock-pubsub target-id="attrErrorList" event-name="fix-error" handler="_fixError"></bedrock-pubsub>
        </template>
`;
  }

  constructor() {
      super();
      this.FALLBACK_PATH_DELIMITER = ">>";
  }
  static get is() {
      return "rock-attribute";
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
           * If set as true , it indicates the component is in read only mode
           */
          readonly: {
              type: Boolean,
              value: false
          },
          /**
           * Indicates whether the attribute is rendered in edit mode or view mode.
           * The two possible values are <b>view</b> and <b>edit</b>.
           */
          mode: {
              type: String,
              value: "view",
              notify: true
          },
          /**
           * Indicates the JSON for the attribute value object. This object records all the user changes to the value.
           * Sample: {
                      "value":"Nivea Creme 400 Ml"
                      }
              */
          attributeObject: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true
          },
          /**
           * Indicates the JSON for the original attribute value object. This object does not record all the user changes to the value.
           * Sample: {
                      "value":"Nivea Creme 400 Ml"
                      }
              */
          originalAttributeObject: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
           * Indicates the JSON for the attribute model object.
           * It renders appropriate UI element to edit the attribute, to configure the validation, and other behaviors.
           * Sample: {
                      "name": "name",
                      "externalName": "Name",
                      "displayType": "textbox",
                      "minLength": 5,
                      "maxLength": 10
                      }
              */
          attributeModelObject: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          dependentAttributeObjects: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          dependentAttributeModelObjects: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          /**
           * Indicates whether or not an attribute object value is changed.
           */
          changed: {
              type: Boolean,
              value: false,
              notify: true,
              reflectToAttribute: true
          },
          _isInitialized: {
              type: Boolean,
              value: false
          },
          /**
           * Specifies the errors in an attribute object received from the server.
           */
          serverErrors: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },
          /**
           * Specifies the errors that are raised after validating the attribute object value.
           */
          validationErrors: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },
          validationWarnings: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },
          /**
           * Indicates all server errors and validation errors of attribute object value.
           */
          messages: {
              type: Array,
              notify: true,
              computed: '_getAllMessages(serverErrors, validationErrors, validationWarnings)'
          },
          errors: {
              type: Array,
              notify: true,
              computed: '_getAllMessages(serverErrors, validationErrors)'
          },
          /**
           * Specifies the length of the error message.
           */
          messagesLength: {
              type: Number,
              notify: true,
              value: 0
          },
          /**
           * Specifies the error message to be shown.
           */
          validationMessage: {
              type: Object,
              notify: true,
              computed: '_getMessage(serverErrors, validationErrors, validationWarnings)'
          },
          /**
           * Indicates the functional mode of the attribute object.
           */
          functionalMode: {
              type: String,
              notify: true,
              value: "list"
          },
          _isGridType: {
              type: Boolean,
              notify: true,
              computed: '_isGrid(functionalMode)'
          },
          /**
           * <b><i>Content development is under progress... </b></i>
           */
          tabindex: {
              type: Number
          },
          rtePopoverIn:{
            type: Boolean,
            value: false
          },
          rtePopoverTimeOut:{
              type:Number
          },
          showDeleteIcon: {
              type: Boolean,
              value: false
          },
          /**
           * Indicates whether to disable the floating label or not.
           * Set the value as <b>true</b> to disable the floating label.
           */
          noLabelFloat: {
              type: Boolean,
              value: true
          },

          _fallbackList: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _contextCoalescePathList: {
              type: Array,
              value: function () {
                  return [];
              }
          },

          _sourceInfoVisible: {
              type: Boolean,
              value: false
          },
          _fallbackColor: {
              type: String,
              value: ""
          },
          _coalescedFontStyle: {
              type: String,
              value: ""
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
          },
          applyLocaleCoalesce: {
              type: Boolean,
              value: false
          },
          _isValueChanged: {
              type: Boolean,
              value: false,
              computed: "_getValueChange(attributeObject.*, changed)"
          },
          hideRevert: {
              type: Boolean,
              value: false
          },
          hideHistory: {
              type: Boolean,
              value: false
          },
          _rootNode: {
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
          _dialogTitle: {
              type: String,
              value: ""
          },
          _pathSeperator: {
              type: String,
              value: ""
          },
          applyGraphCoalescedStyle: {
              type: Boolean,
              value: false
          },
          attributeDisplayValue: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          
          hideSaveAsNull: {
              type: Boolean,
              value: false
          },
          tappedSaveAsNull: {
              type: Boolean,
              value: false
          },
          _isReadyToShowMessagesPopover: {
              type: Boolean,
              value: false
          },
          _isReadyToShowSourceInfoPopover: {
              type: Boolean,
              value: false
          },
          _isRteEditLinkTapped: {
              type: Boolean,
              value: false
          },
          _isRteLinkHovered: {
              type: Boolean,
              value: false
          }
      }
  }
  connectedCallback() {
      super.connectedCallback();
      this._isInitialized = true;
  }
  static get observers() {
      return [
          '_attributeObjectChanged(attributeObject.*)',
          '_messagesChanged(serverErrors, validationErrors, validationWarnings)',
          '_attributeObjectValueChanged(attributeDisplayValue)'
      ]
  }
  addValidationMessages(validationMessage, isError = true) {
      let validationMessages = isError ? this.validationErrors : this.validationWarnings;
      if (validationMessages.indexOf(validationMessage) == -1) {
          validationMessages.push(validationMessage);
      }

      if (isError) {
          this.validationErrors = [];
          this.validationErrors = validationMessages;
      } else {
          this.validationWarnings = [];
          this.validationWarnings = validationMessages;
      }
  }
  removeValidationMessagesAt(index, isError = true) {
      let validationMessages = isError ? this.validationErrors : this.validationWarnings;
      validationMessages.splice(index, 1);

      if (isError) {
          this.validationErrors = [];
          this.validationErrors = validationMessages;
      } else {
          this.validationWarnings = [];
          this.validationWarnings = validationMessages;
      }
  }
  revertAll(){

    //resetting rock-entity-combo-box selectedId
    let comboBoxElement = this.shadowRoot.querySelector('#combo-box');
    if(comboBoxElement && this.attributeObject && this.attributeObject.value){
        comboBoxElement.selectedValueChanged();
    }
  }
  _formatValue(model, object) {
      //This display nothing if the initial display of rock attribute is _NULL
      if(object.value == ConstantHelper.NULL_VALUE){
          object.value = "";
      }
      if (model &&
          model.dataType) {
          if (model.dataType.toLowerCase() == "date" ||
              model.dataType.toLowerCase() == "datetime") {
              return FormatHelper.convertFromISODateTime(object.value, model.dataType, model.dateFormat);
          }
          if (model.dataType.toLowerCase() == "boolean") {
              if (object.value == "true" || object.value == "false") {
                  return object.value == "true" ? model.trueText : model.falseText;
              }
          }
      }

      return object.value;
  }
  _isEditMode(mode) {
      return mode === "edit";
  }
  _getValue(val, trueText, falseText) {
      if (val) {
          return FormatHelper.checkTrueBooleanVal(val, trueText, falseText);
      }

      return val;
  }
  _isAttributeEditable(attributeModelObject) {
      return attributeModelObject.hasWritePermission && !attributeModelObject.readOnly;
  }
  _isComponentEditable(mode, attributeModelObject) {
      return mode === "edit" && attributeModelObject.hasWritePermission && !attributeModelObject.readOnly;
  }
  _onChange(event) {
      //todo: this is not working right now, have to find out how to propagate change event up the control hierarchy
      if (this.shadowRoot) {
          this.dispatchEvent(new CustomEvent(event.type, {
              detail: {
                  sourceEvent: event
              },
              node: this,
              cancelable: event.cancelable,
              bubbles: event.bubbles,
              composed: true
          }));
      }
  }
  _getCoalescedLabelClass() {
      let coalescedClass = (this.attributeModelObject && this.attributeModelObject.modelContextCoalesce) ?
          "attribute-coalesced-label" : "attribute-non-coalesced-label"
      return coalescedClass;
  }
  _isTextBox(model) {
      //If display type is not supported then also textbox is used
      let displayType = model.displayType ? model.displayType.toLowerCase() : model.displayType;
      return displayType === "textbox" && !model.isCollection ||
          (!this._isTextArea(model) && !this._isDropDown(model) &&
              !this._isBoolean(model) && !this._isDate(model) &&
              !this._isDateTime(model) && !this._isTextboxCollection(model) &&
              !this._isLOV(model) && !this._isRichTextEditor(model)) && !this._isNested(model) && !this._isPathSelector(model);
  }
  _isTextArea(model) {
      return model.displayType && model.displayType.toLowerCase() === "textarea";
  }
  _isRichTextEditor(model) {
      return model.displayType && model.displayType.toLowerCase() === "richtexteditor";
  }
  _isLOVSingleValued(model) {
      return model.displayType && model.displayType.toLowerCase() === "referencelist" && !model.isCollection;
  }
  _isLOV(model) {
      return model.displayType && model.displayType.toLowerCase() === "referencelist";
  }
  _isLOVCollection(model) {
      return model.displayType && model.displayType.toLowerCase() === "referencelist" && model.isCollection;
  }
  _isDropDown(model) {
      return model.displayType && model.displayType.toLowerCase() === "dropdown";
  }
  _isBoolean(model) {
      return model.displayType && model.displayType.toLowerCase() === "boolean";
  }
  _isDate(model) {
      return model.displayType && model.displayType.toLowerCase() === "date";
  }
  _isDateTime(model) {
      return model.displayType && model.displayType.toLowerCase() === "datetime";
  }
  _isTextboxCollection(model) {
      return model.displayType && model.displayType.toLowerCase() === "textbox" && model.isCollection;
  }
  _useDefaultReadMode(model) {
      let displayType = model.displayType ? model.displayType.toLowerCase() : "";
      return !(model.isCollection || displayType === "referencelist" || displayType === "path" || displayType ===
          "richtexteditor" || displayType === "nestedgrid");
  }
  _isCollection(model) {
      return model.isCollection;
  }
  _isMultiSelect(model) {
      return model.isCollection;
  }
  _isLeafNodeOnly(model) {
      return model.isLeafNodeOnly;
  }
  _isGridOrNested(model) {
      return (this._isNested(model) || this._isGridType);
  }
  _isNested(model) {
      return model.displayType && model.displayType.toLowerCase() === "nestedgrid";
  }
  _isPathSelector(model) {
      return model.displayType && model.displayType.toLowerCase() === "path";
  }
  _onEditClick(e) {
      if (e.currentTarget.disabled) {
          return;
      }
      const mode = 'edit';
      this._showFixNow = false;

      this.dispatchEvent(new CustomEvent("attribute-mode-changed", {
          detail: {
              mode
          },
          bubbles: true,
          composed: true
      }));
  }
  getControlIsDirty() {
      return this.mode == "edit";
  }
  _getInputValue() {
      let attributeObjectValue = this.attributeObject.value;
      let inputValue;
      if(_.isArray(attributeObjectValue) && attributeObjectValue[0] == ConstantHelper.NULL_VALUE){
          inputValue = [];
      }
      else if(attributeObjectValue == ConstantHelper.NULL_VALUE){
          inputValue = "";
      }
      else{
          inputValue = attributeObjectValue;
      }
      if (this.attributeModelObject.displayType == "boolean" && (inputValue == this.attributeModelObject
          .trueText || inputValue == this.attributeModelObject.falseText)) {
          return inputValue == this.attributeModelObject.trueText ? "true" : "false";
      }

      return inputValue;
  }

  _attributeObjectValueChanged(value){
      /*This block executes when we change rock attribute and then it updates the attributeObject value
      No need to set attribute object value save null is clicked, because attribute object value
      will be empty or _NULL that time. */
      /*For nested grid we need to update attributeObject for empty 
      value too otherwise it will save the row with previous value*/

      if(!this.tappedSaveAsNull || this.attributeModelObject && this.attributeModelObject.isNestedChild){
          this.set("attributeObject.value", value);
      }
  }
  _attributeObjectChanged(changeRecord) {
      if (this.attributeModelObject.dataType == "boolean" && (this.attributeObject.value != "true" &&
          this.attributeObject.value != "false")) {
          this.attributeObject.value = this._getValue(this.attributeObject.value, this.attributeModelObject
              .trueText, this.attributeModelObject.falseText);
      }
      let value = this.attributeObject.value;
      /*if its a collection or nested attribute and both the display object and attribute 
      object is not same, then set the value for the display object empty array or value */
      if(_.isArray(value)){
          /**
          * when value is an array type, value and attributeDisplayValue are equal arrays, then it will go
          * to else if block. Hence moving array comparision inside.
          * */
          if(!DataHelper.areEqualArrays(value, this.attributeDisplayValue)) {
              this.set('attributeDisplayValue', value[0] == ConstantHelper.NULL_VALUE ? [] : value);
          }
      }
      else if(value != this.attributeDisplayValue){
          this.set('attributeDisplayValue', value == ConstantHelper.NULL_VALUE ? "" : value);
      }
      
      if (this.attributeObject.value && this.attributeObject.action) {
          let isCollection = this.attributeModelObject && this.attributeModelObject.isCollection ?
              true : false;
          if (!isCollection || (isCollection && this.attributeObject.value.length > 0)) {
              delete this.attributeObject.action;
          }
      }

      //Checking for imported RTE values that might not be formatted as required by the editor
      if (!this.changed && this.attributeModelObject && this._isRichTextEditor(this.attributeModelObject) && !_.isEmpty(this.originalAttributeObject.value)) {
          if (!_.isEqual(this.attributeObject.value, this.originalAttributeObject.value)) {
            let rteObj = this.shadowRoot.querySelector("pebble-richtexteditor");
            if (rteObj && !rteObj.isValueChanged(this.originalAttributeObject.value)) {
                changeRecord.path = "attributeObject";
            }
          } else {
              //If this.originalAttributeObject.value and this.attributeObject.value are equal, then there is no change, hence return
              this._onAttributeObjectChangedEnd();
              return;
          }
      }

      if (this._isInitialized && changeRecord.path != "attributeObject" && changeRecord.path !=
          "attributeObject.errors") {
          this.changed = true;
          this.dispatchEvent(new CustomEvent("attribute-value-changed", {
              detail: this.attributeObject,
              bubbles: true,
              composed: true
          }));
      }

      if (this.attributeModelObject.displayType && this.attributeModelObject.displayType.toLowerCase() == "path") {
          if (!_.isEmpty(this.attributeModelObject)) {
              let attrModelObj = this.attributeModelObject;

              if (attrModelObj.pathEntityInfo) {
                  let pathEntityInfo = attrModelObj.pathEntityInfo[0];
                  if (!_.isEmpty(pathEntityInfo)) {
                      if (pathEntityInfo.pathSeperator) {
                          this._pathSeperator = pathEntityInfo.pathSeperator
                      } else {
                          this._pathSeperator = this.appSetting('dataDefaults').categoryPathSeparator;
                      }
                      if (pathEntityInfo.rootNode) {
                          this._rootNode = pathEntityInfo.rootNode;
                      }
                      if (pathEntityInfo.pathEntityType) {
                          this.pathEntityType = pathEntityInfo.pathEntityType;
                      }
                      if (pathEntityInfo.pathRelationshipName) {
                          this.pathRelationshipName = pathEntityInfo.pathRelationshipName;
                      }
                  }
              }
              if (attrModelObj.externalName) {
                  this._dialogTitle = "Edit " + this._pathSeperator + " " + attrModelObj.externalName;
              }
          }
      }

      this._onAttributeObjectChangedEnd();
  }

  isNullOrEmpty (val, fallbackVal) {
      return _.isNullOrEmpty(val, fallbackVal);
  }
  _onAttributeObjectChangedEnd() {
      this._fallbackList = this._getFallbackPath();
      this._contextCoalescePathList = this.attributeObject.contextCoalescePaths;
      this._updateMarkerClass();
      this._showSourceInfo();
  }
  _getValueChange() {
      //Nested
      if (this.attributeModelObject && this.attributeModelObject.dataType === "nested") {
          return this.changed;
      }

      //String and Collections
      if (!this.attributeObject || !this.originalAttributeObject) {
          return false;
      }
      return !_.isEqual(this.attributeObject.value, this.originalAttributeObject.value);
  }
  _getAttributeEditClass(changed) {
      if (changed) {
          return 'attribute-edit attribute-edit-changed';
      } else {
          return 'attribute-edit';
      }
  }
  _onRevertClick() {
      this.set("attributeObject.value", this.originalAttributeObject.value);
      this.attributeObject = this._cloneObject(this.originalAttributeObject); //can't assign directly, its by ref - thus using cloning
      this.dispatchEvent(new CustomEvent("attribute-value-changed", {
          detail: {
              revertClicked: true
          },
          bubbles: true,
          composed: true
      }));
      this.changed = false;
  }
  _onClearClick() {
      let setValue = this.attributeModelObject && this.attributeModelObject.isCollection ? [] : "";
      this.set("attributeObject.value", setValue);
      this.set("attributeObject.referenceDataId", setValue);
      this.set("attributeObject.action", "delete");
      this.changed = true;
      this.fireBedrockEvent("attribute-value-cleared", this.attributeObject, {
        ignoreId: true
      });
  }
  _cloneObject(o) {
      return DataHelper.cloneObject(o);
  }
  _onTimeClick() {
      let _dataObj = DataHelper.cloneObject(this.attributeModelObject);
      if (!_.isEmpty(this.contextData)) {
          let itemContext = ContextHelper.getFirstItemContext(this.contextData)
          if (itemContext && itemContext.relationships && itemContext.relationships.length > 0) {
              _dataObj.relationshipName = itemContext.relationships[0];
              if(itemContext.relatedEntityType){
                  _dataObj.relatedEntityType = itemContext.relatedEntityType;
              }
              if(itemContext.relationshipId){
                  _dataObj.relationshipId = itemContext.relationshipId;
              }
              if(itemContext.relationshipsCriterion){
                  _dataObj.relationshipsCriterion = itemContext.relationshipsCriterion;
              }
              if(itemContext.id){
                  _dataObj.relatedEntityId = itemContext.id;
              }
          }
      }
      let eventDetail = {
          data: _dataObj,
          name: "dimension-grid-open"
      }

      this.fireBedrockEvent("dimension-grid-open", eventDetail, {
          ignoreId: true
      });
  }
  _onTapSaveAsNull(){
      this.tappedSaveAsNull = true;
      let attributeObjectValue = this.attributeModelObject && this.attributeModelObject.isCollection ? [ConstantHelper.NULL_VALUE] : ConstantHelper.NULL_VALUE;
      let attributeDisplayValue = this.attributeModelObject && this.attributeModelObject.isCollection ? [] : "";
      if(this.attributeModelObject.dataType == "nested"){
          let nestedAttributeLength = this.originalAttributeObject.value.length;
          while(attributeObjectValue.length < nestedAttributeLength){
              attributeObjectValue.push(ConstantHelper.NULL_VALUE);
          }
      }
      //Executes when user click clear , then save as null
      if(this.attributeObject.action){
          delete this.attributeObject.action;
      }
      this.set("attributeObject.value", attributeObjectValue);
      this.set("attributeObject.referenceDataId", attributeDisplayValue);
      this.changed = true;
      this.tappedSaveAsNull = false;
  }
  _onSourceInformationClick(e) {
      this._isReadyToShowSourceInfoPopover = true;
      flush();
      let sourceInformation = this.$$("#view-source-information-popover");
      if (sourceInformation) {
          sourceInformation.show();
      }
      e.stopPropagation();

      if (this._hasRelatedEntityCoalescedValue()) {
          let eventDetail = {
              data: {
                  "id": this.attributeObject.osid,
                  "type": this.attributeObject.ostype
              },
              callback: this._onRelatedEntityInfoGet.bind(this),
              name: "source-info-open"
          }
          ComponentHelper.fireBedrockEvent("source-info-open", eventDetail, {
              ignoreId: true
          });
      }
  }
  _showPicker(e) {
      let pickerId = e.target.getAttribute('picker-id');
      if (pickerId) {
          let picker = this.shadowRoot.querySelector("#" + pickerId);
          if (picker) {
              picker.show();
          } else {
              alert('picker with picker-id ' + pickerId + ' not found');
          }
      } else {
          alert('picker-id attribute not found on target.');
      }
  }
  _getAllMessages(serverErrors, validationErrors, validationWarnings) {
      validationErrors = this._prepareErrorMessages(validationErrors);
      validationWarnings = this._prepareErrorMessages(validationWarnings);
      let messages = _.uniq((serverErrors || []).concat(validationErrors || []).concat(validationWarnings || []));
      return messages;
  }
  _prepareErrorMessages(messages) {
      if (this.attributeModelObject && this.attributeModelObject.dataType == "nested" && !_.isEmpty(messages)) {
          let obj = {};
          obj[this.attributeObject.name] = messages;
          messages = [obj];
      }
      return messages;
  }
  _getErrorMessages(messages) {
      if (this.attributeModelObject && this.attributeModelObject.dataType == "nested" && !_.isEmpty(this.messages)) {
          return messages[0][this.attributeObject.name] || messages;
      }
      return messages;
  }
  _getMessage() {
      if (this.errors && this.errors.length) {
          if (this.attributeModelObject && this.attributeModelObject.dataType == "nested") {
              let errors = this.errors[0][this.attributeObject.name];
              if (!_.isEmpty(errors)) {
                  return {
                      "text": errors[0],
                      "isError": true
                  };
              }
          } else {
              return {
                  "text": this.errors[0],
                  "isError": true
              };
          }
      }
      if (this.validationWarnings && this.validationWarnings.length) {
          return {
              "text": this.validationWarnings[0],
              "isError": false
          };
      }
  }
  /**
   * <b><i>Content development is under progress... </b></i>
   */
  hasModelErrors() {
      return this.validationErrors && this.validationErrors.length > 0;
  }
  _messagesChanged() {
      this.messagesLength = _.uniq((this.serverErrors || []).concat(this.validationErrors || []).concat(
          this.validationWarnings || [])).length;
  }
  _messageAbsent(messages) {
      if (this._isGridType) {
          return true;
      }
      if (this.attributeModelObject && this.attributeModelObject.dataType == "nested") {
          messages = messages.length && messages[0][this.attributeModelObject.name] ? messages[0][this.attributeModelObject.name] : [];
          return messages && messages.length == 0;
      } else {
          return messages.length == 0;
      }
  }
  _messageTapped() {
      this._isReadyToShowMessagesPopover = true;
      flush();
      let messagePopover = this.shadowRoot.querySelector('#messagePopover');
      if (messagePopover) {
          messagePopover.positionTarget = this.shadowRoot.querySelector('#message-circle');
          messagePopover.open();
      }
  }
  _getValidationClass(message, isIcon = false) {
      if (isIcon) {
          return message && message.isError ? "error-circle" : "warning-circle"
      } else {
          return message && message.isError ? "error" : "warning"
      }
  }
  _fixError(e) {
      let messagePopover = this.shadowRoot.querySelector('#messagePopover');
      if (messagePopover) {
          messagePopover.close();
      }
      this._isReadyToShowMessagesPopover = false;
      this._onEditClick(e);
  }
  _isGrid(functionalMode) {
      return functionalMode == "grid";
  }
  _rteLinkHovered() {
    this._isRteLinkHovered = true;
    flush();  
    this.shadowRoot.querySelector('#rtePopover').show();
  }
  _rteLinkHoveredOut() {
    this.rtePopoverIn = false;
    this.rtePopoverTimeOut = setTimeout(() => {
        if(!this.rtePopoverIn){        
            this.shadowRoot.querySelector('#rtePopover').hide();
        }
        clearTimeout(this.rtePopoverTimeOut);
        this._isRteLinkHovered = false;
    },10);
  }
  _rtePopoverHovered() {
      this.rtePopoverIn = true;
  }
  _rtePopoverHoveredOut() {   
    this.shadowRoot.querySelector('#rtePopover').hide();
}
  _rteEditLinkTapped() {
    this._isRteEditLinkTapped = true;
    flush();
    this.shadowRoot.querySelector('#rteSingleEdit').open();
  }
  _nestedAttributeLinkTapped() {
      this.shadowRoot.querySelector('#nestedAttributeModal').open();
  }
  //TODO: this did not work for entityTypes, need to check why
  _prepareRequestObjectForLov(attributeModel) {
      let refEntityTypes = [];

      //find from manage model, looks like this:
      // "referenceEntityInfo": [
      //                     {
      //                         "refRelationshipName": "hasReferenceTo",
      //                         "refEntityType": "color"
      //                     }
      //                  ]
      if (attributeModel.referenceEntityInfo) {
          for (let i = 0; i < attributeModel.referenceEntityInfo.length; i++) {
              let refEntityInfo = attributeModel.referenceEntityInfo[i];
              if (refEntityInfo.refRelationshipName == 'hasReferenceTo' && refEntityInfo.refEntityType) {
                  refEntityTypes.push(refEntityInfo.refEntityType);
              }
          }
      }

      let relationshipsCriterion = [];
      let dependencyInfo = attributeModel.dependencyInfo;
      if (!DataHelper.isEmptyObject(dependencyInfo) && !DataHelper.isEmptyObject(this.dependentAttributeObjects) &&
          !DataHelper.isEmptyObject(this.dependentAttributeModelObjects)) {
          for (let i = 0; i < dependencyInfo.length; i++) {
              let dependentAttrInfo = dependencyInfo[i];
              let dependentAttributeModelObject = this.dependentAttributeModelObjects[
                  dependentAttrInfo.dependentOn];
              let dependentAttributeObject = this.dependentAttributeObjects.find(attr => attr.name ===
                  dependentAttrInfo.dependentOn);

              if (dependentAttributeObject && dependentAttributeObject.value &&
                  dependentAttributeObject.value.length && dependentAttributeObject.action !==
                  "delete") {
                  let relCriteria = this._prepareRelationshipCriterion(dependentAttrInfo.dependencyRelationship,
                      dependentAttributeObject.referenceDataId, dependentAttributeModelObject.referenceEntityTypes[
                      0]);
                  relationshipsCriterion.push(relCriteria);
              }
          }
      }

      let clonedContextData = DataHelper.cloneObject(this.contextData);

      let itemContext = {
          'type': refEntityTypes,
          'relationshipsCriterion': relationshipsCriterion
      };

      clonedContextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];



      let requestData = DataRequestHelper.createEntityGetRequest(clonedContextData, true);
      return requestData;
  }
  _prepareRelationshipCriterion(relName, relToId, relToType) {
      relToId = relToId || "";
      let relCriteria = {};
      relCriteria[relName] = {
          "relTo": {}
      };
      if (relToId instanceof Array) {
          relCriteria[relName].relTo.ids = relToId;
      } else {
          relCriteria[relName].relTo.id = relToId;
      }
      relCriteria[relName].relTo.type = relToType;
      return relCriteria
  }

  _getMappedColumn(columName, attributeModelObject) {
      if (columName && attributeModelObject) {
          if (attributeModelObject.referenceEntityInfo) {
              for (let i = 0; i < attributeModelObject.referenceEntityInfo.length; i++) {
                  let refEntityInfo = attributeModelObject.referenceEntityInfo[i];
                  if (refEntityInfo.refRelationshipName == 'hasReferenceTo') {

                      let columNameToReturn = undefined;

                      columName = columName.toLowerCase();

                      if (columName == "id") {
                          // Id is mandatory for Lov.
                          // Hence if pattern for Id not available then set entity.id
                          columNameToReturn = refEntityInfo.id;
                          if (DataHelper.isEmptyObject(columNameToReturn)) {
                              columNameToReturn = "entity.id";
                          }
                      }

                      // if (columName == "title") {
                      //     // Default fallback to Name, otherwise it will show empty values
                      //     columNameToReturn = refEntityInfo.listTitle;
                      //     if (DataHelper.isEmptyObject(columNameToReturn)) {
                      //         columNameToReturn = "{entity.name}";
                      //     }
                      // }

                      if (columName == "subtitle") {
                          columNameToReturn = refEntityInfo.listSubTitle;
                      }

                      if (columName == "image") {
                          columNameToReturn = refEntityInfo.image;
                      }
                      if (columName == "imageid") {
                          columNameToReturn = refEntityInfo.thumbnail;
                          if (!columNameToReturn || columNameToReturn.toLowerCase() === "none") {
                              columNameToReturn = "";
                          }
                      }

                      if (columName == "color") {
                          columNameToReturn = refEntityInfo.color;
                      }

                      // if (columName == "value") {
                      //     //refEntityInfo.value = "referencedatavalue";
                      //     columNameToReturn = refEntityInfo.listValueAttribute;
                      //     if (DataHelper.isEmptyObject(columNameToReturn)) {
                      //         columNameToReturn = "entity.name";
                      //     }
                      // }

                      return columNameToReturn;
                  }
              }
          }
      }
  }
  _hasValue(attributeObject) {
      let value = attributeObject.value;
      if (!_.isEmpty(value) || attributeObject.isNullValue || attributeObject.isBulkEdit) {
          return true;
      } else {
          return false;
      }
  }
  _getLabel(label) {
      if (this._isGridType) {
          return "";
      } else {
          return label;
      }
  }
  _onDeleteClick() {
      this.fireBedrockEvent("attribute-delete", {
          data: this.attributeModelObject
      }, {
              ignoreId: true
          });
  }
  _onTagItemRemoved(e) {
      // Note:- In a scenario where attribute is of type Reference List and is Non Collection then,
      //        removing a tag should perform the same action what the component is performing when
      //        user clicks on clear Icon - ok
      let isCollection = this.attributeModelObject && this.attributeModelObject.isCollection ? true :
          false;
      if (!isCollection || (isCollection && this.attributeObject && _.isEmpty(this.attributeObject.value))) {
          this._onClearClick();
      }
  }
  _updateMarkerClass() {
      let root = this.root && this.root.host;
      if (!root) return;
      if (!this._isNested(this.attributeModelObject)) {
          if (this._hasFallbackValue()) {
              root.classList.add('fallback-value');
              this.set("_fallbackColor", "#0bb2e8");
          } else {
              root.classList.remove('fallback-value');
              this.set("_fallbackColor", "");
          }

          if (this._hasContextCoalescedValue() || this._hasRelatedEntityCoalescedValue()) {
              root.classList.add('coalesced-value');
              this.set("_coalescedFontStyle", "italic");
          } else {
              root.classList.remove('coalesced-value');
              this.set("_coalescedFontStyle", "");
          }
      }
  }
  _hasFallbackValue() {
      return !!(this.attributeModelObject && this.attributeModelObject.isLocalizable &&
          this.attributeObject.properties && this.attributeObject.properties.localeCoalescePath);

  }
  _hasContextCoalescedValue() {
      return this.attributeObject.contextCoalescePaths && this.attributeObject.contextCoalescePaths.length;
  }

  _hasRelatedEntityCoalescedValue() {
      return this.applyGraphCoalescedStyle && this.attributeObject.os === "graph" && !_.isEmpty(this.attributeObject.osid) && !_.isEmpty(
          this.attributeObject.ostype);
  }

  _getFallbackPath() {
      const {
          properties
      } = this.attributeObject;
      const localeCoalescePath = properties && properties.localeCoalescePathExternalName;
      if (localeCoalescePath) {
          return localeCoalescePath.split(this.FALLBACK_PATH_DELIMITER);
      }
      return [];
  }
  _getDescriptionObject() {
      if (!this.attributeModelObject.isNestedChild) {
          return this.attributeModelObject.properties;
      }
  }
  _showSourceInfo() {
      this._sourceInfoVisible = this._hasFallbackValue() || this._hasContextCoalescedValue() || this._hasRelatedEntityCoalescedValue();
  }
  _getFallbackValueColor() {
      if (this._hasFallbackValue()) {
          // var color = this.getComputedStyleValue("--color-variant-1");
          // return color;

          //TODO: Currently hard coded color code value, as the above computation function
          //taking ~8ms per attribute. Need to figure out better way to extract css variable value.
          return "#0bb2e8";
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

  _getDefaultTime(dateTimeValue) {
      if (!dateTimeValue && this.appSetting('dateTimePicker.defaultTime')) {
          return this.appSetting('dateTimePicker.defaultTime');
      }
  }

  _convertRangeFieldToDate(attributeModelObject, fieldName) {
      let strDate = this._getRangeFieldValue(attributeModelObject, fieldName);
      if (strDate) {
          let date = new Date(strDate);
          if (date && date != "Invalid Date") {
              return new Date(date.toDateString());
          }
      }
  }
  _getAttributeIconEditClass(mode){
      if(mode == "edit"){
          return "attribute-edit-mode-icons";
      }
  }
  _getPatternFieldValue(attributeModelObject, fieldName){
    if (!_.isEmpty(attributeModelObject.pattern)) {
        return attributeModelObject.pattern[0][fieldName];
    }
  }
  _getRangeFieldValue(attributeModelObject, fieldName) {
      if (_.isEmpty(attributeModelObject) || !fieldName) {
          return;
      }

      if (attributeModelObject[fieldName]) {
          return attributeModelObject[fieldName];
      }

      if (!_.isEmpty(attributeModelObject.range)) {
          return attributeModelObject.range[0][fieldName];
      }
  }
}
customElements.define(RockAttribute.is, RockAttribute);
