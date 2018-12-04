import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-validator/bedrock-validator.js';
import '../bedrock-helpers/format-helper.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-app-context-behavior/bedrock-app-context-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-dialog/pebble-dialog.js';
import '../pebble-info-icon/pebble-info-icon.js';
import '../pebble-textbox-collection/pebble-collection-container.js';
import '../rock-classification-tree/rock-classification-tree.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockPathSelector extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior],
    OptionalMutableData(PolymerElement)) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-padding-margin bedrock-style-grid-layout bedrock-style-buttons">

        </style>
           <bedrock-pubsub event-name="on-tap-tag-collection" handler="_onTapTag"></bedrock-pubsub>
           <bedrock-pubsub event-name="on-tap-remove-collection" handler="_onTagRemove"></bedrock-pubsub>
            <pebble-collection-container hidden\$="[[isSearchFilter]]" values="{{_classificationTags}}" is-readonly="[[isReadonly]]" display-limit="[[displayLimit]]" label="[[label]]" description-object="[[descriptionObject]]" no-label-float="[[noLabelFloat]]" on-tap="_onCollectionContainerTap" no-popover="[[noPopover]]" show-seperator="[[showSeperator]]" seperator="[[seperator]]" collection-icon="pebble-icon:Open-window">
                </pebble-collection-container>
                <pebble-dialog id="classification-popover" modal="" show-close-icon="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
                        <div id="classificationContent" style="height:85vh">
                            <div id="categoryTreeContainer" title="dialog-title" class="button-siblings">
                                <rock-classification-tree id="classification-contextTree" root-node="[[rootNode]]" path-entity-type="[[pathEntityType]]" path-relationship-name="[[pathRelationshipName]]" context-data="[[contextData]]" multi-select="[[multiSelect]]" check-child-nodes="[[checkChildNodes]]" disable-child-node="[[disableChildNode]]" check-parent-nodes="[[checkParentNodes]]" leaf-node-only="[[leafNodeOnly]]" root-node-external-name="{{rootNodeExternalName}}"></rock-classification-tree>
                            </div>
                            <div id="exportActions" class="buttonContainer-static" align="center">
                                <pebble-button class="btn btn-secondary m-r-5" id="cancel" button-text="Cancel" raised="" on-tap="_onCancelClassificationSelection"></pebble-button>
                                <pebble-button class="btn btn-success" id="download" button-text="Select" raised="" on-tap="_selectClassification"></pebble-button>
                            </div>
                        </div>
                    </pebble-dialog>
`;
  }

  constructor() {
      super();
      this.FALLBACK_PATH_DELIMITER =  ">>";
  }
  static get is() {
      return "rock-path-selector";
  }
  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          values: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },
          _classificationTags:{
              type: Array,
              value: function () {
                  return [];
              },
          },
          multiSelect:{
              type: Boolean,
              value: false
          },
          isReadonly: {
              type: Boolean,
              value: false
          },
          leafNodeOnly: {
              type: Boolean,
              value: false
          },
          rootNode:{
              type:String,
              value:""
          },
          pathEntityType:{
              type:String,
              value:""
          },
          pathRelationshipName:{
              type:String,
              value:""
          },
          isSearchFilter:{
              type:Boolean,
              value:false
          },
          dialogTitle:{
              type:String,
              value:""
          },
          disableChildNode:{
              type:Boolean,
              value:true
          },
          checkChildNodes:{
              type:Boolean,
              value:true
          },
          checkParentNodes:{
              type:Boolean,
              value:false
          },
          pathSeperator:{
              type:String,
              value:""
          },
          label:{
              type:String,
              value:""
          },
          applyLocaleCoalescedStyle: {
              type: Boolean,
              value: false
          },
          applyContextCoalescedStyle: {
              type: Boolean,
              value: false
          },
          hasFallbackValue: {
              type: Boolean,
              value: false
          },
          hasContextCoalescedValue: {
              type: Boolean,
              value: false
          },
          rootNodeExternalName: {
              type: String,
              value: ""
          }
      }
  }
  ready() {
      super.ready();

  }
  static get observers() {
      return [
          '_onValuesChange(values)',
      ]
  }

  _onCollectionContainerTap() {
      if (this.isReadonly){
          return;
      }
      this.classificationDialogOpen();
  }


  classificationDialogOpen() {
      let classificationDialog = this.shadowRoot.querySelector("#classification-popover");
      let selectedClassifications = [];
      let contextTree = this.shadowRoot.querySelector("#classification-contextTree");
      if (contextTree) {
          if(this._classificationTags.length > 0){
              for(let tagIndex = 0;tagIndex<this._classificationTags.length;tagIndex++){
                  let selectedClassificationTags = this._classificationTags[tagIndex].name.split(this.pathSeperator);
                  selectedClassificationTags.shift();
                  selectedClassifications.push(selectedClassificationTags);
              }
          }
          contextTree.selectedClassifications = selectedClassifications;
          contextTree.generateRequest();
          contextTree.clearSelectedItems();
      }

      if (classificationDialog) {
          classificationDialog.dialogTitle = this.dialogTitle
          classificationDialog.open();
      }
  }
  _onValuesChange() {
      let _tags = [];

      let fontStyle = undefined;
      let color = "#d2d7dd";
      if(this.hasContextCoalescedValue && this.applyContextCoalescedStyle) {
          fontStyle = "italic";
      }

      if(this.hasFallbackValue && this.applyLocaleCoalescedStyle) {
          color = "#0bb2e8";
      }

      if (!_.isEmpty(this.values)) {
          if(this.multiSelect) {
              for (let i = 0; i < this.values.length; i++) {
                  let item = { "name": this.values[i], "longName": this.values[i], "color": color, "fontStyle": fontStyle, "isChildTag": true };
                  _tags.push(item);
              }
          } else {
              let value = _.isArray(this.values) ? this.values[0] : this.values;
              let item = { "name": value, "longName": value, "color": color, "fontStyle": fontStyle, "isChildTag": true };
              _tags.push(item);
          }

          this._classificationTags = _tags;
      }
      else{
          this._classificationTags = [];
      }
  }
  _selectClassification() {
      let contextTree = this.shadowRoot.querySelector("#classification-contextTree");
      if (!this.rootNodeExternalName) {
          this.logError("Classification root node extenal name missing, cannot select classification paths.");
          return;
      }
      if (contextTree) {
          if (contextTree.selectedClassifications && contextTree.selectedClassifications.length > 0) {
              let _values = [];
              for(let classificationIndex = 0 ; classificationIndex < contextTree.selectedClassifications.length ;classificationIndex++){
                  let valuePath = this._getClassificationValuePath(contextTree.selectedClassifications[classificationIndex]);
                  _values.push(this.rootNodeExternalName + this.pathSeperator +  valuePath[0]);
              }
              this.set("values",[]);
              this.set("values",_values)
          }
      }
      this.fireBedrockEvent("on-classification-update", "", { ignoreId: true });
      this._onCancelClassificationSelection();
  }
  _getClassificationValuePath(classification) {
      let valuePath = [];
      if (classification && classification.valuePath) {
          valuePath.push(classification.valuePath.replace(/#@#/g, this.pathSeperator));
      }

      return valuePath;
  }
  _onCancelClassificationSelection(){
      let classificationDialog = this.shadowRoot.querySelector("#classification-popover");
      if (classificationDialog) {
          classificationDialog.close();
      }
  }
  _onTagRemove(e, detail, sender) {
      if (this.values[detail.index]) {
          this.splice('values', detail.index, 1);
          this._notifyValues();
      }

      // this.isRemoveTriggered = true;
  }
  _notifyValues() {
      let _values = this.values;
      this.values = [];
      this.values = _values;
  }
}
customElements.define(RockPathSelector.is, RockPathSelector);
