/**
`rock-wizard-manage` Represents an element that displays the steps in a sequence
based on the given configuration.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-ajax/iron-ajax.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-stepper/pebble-stepper.js';
import '../pebble-stepper/pebble-step.js';
import '../pebble-dialog/pebble-dialog.js';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockWizardManage
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior
    ], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-grid-layout bedrock-style-padding-margin">
            :host {
                display: block;
                height: 100%;
            }

            .navigation-buttons {
                align-self: flex-end;
                margin: 0 50px;
                position: absolute;
                width: 100%;
                bottom: 10px;
                right: 0px;
                display: flex;
                justify-content: flex-end;
                z-index: 1;
                @apply --navigation-buttons-wizard;
            }

            #step-container-manage {
                height: 100%;
                overflow-y: auto;
                overflow-x: hidden;
                margin: 0px 50px;
                @apply --step-container-manage;
            }

            #stepper {
                margin: 10px 0px;
                flex-direction: column;
                @apply --stepper;
            }

            .stepper-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                position: relative;                
                background: var(--palette-pale-grey-four, #eff4f8);
                border-bottom: 1px solid var(--default-border-color, #c1cad4);
                border-top: 1px solid var(--default-border-color, #c1cad4);
                @apply --stepper-wrapper;
            }
            .overflow-dialog-content{
                @apply --overflow-dialog-content;
            }

            .stepper-style {
                --pebble-connected-badge-width: 30px;
                --pebble-connected-badge-height: 30px;
                --content-connectorLine-width: 2px;
                --pebble-connected-badge-fontSize: 14px;
                --pebble-horizontal-step-connector-line-height: 3px;
            }
        </style>
        <div id="wizard-container" class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <div class="stepper-wrapper" hidden\$="[[_computeStepper(hideStepper)]]">
                    <div id="stepper">
                        <!-- place stepper here -->
                        <pebble-stepper id="pebbleStepper" horizontal="" horizontal-line-width="[[_stepperConnectorLineWidth]]" stepper-config="[[_stepperConfig]]">
                            <template is="dom-repeat" id="steps-template" items="[[_stepperConfig.items]]" as="item">
                                <pebble-step data="[[item]]" class="stepper-style">
                                    <div class="step-badge-content" slot="step-badge-content">
                                        <span>[[item.index]]</span>
                                    </div>
                                </pebble-step>
                            </template>
                        </pebble-stepper>
                    </div>
                    <template is="dom-if" if="[[showNavigationButtons]]">
                        <div id="content-actions" class="navigation-buttons" align="center">
                            <pebble-button class="action-button btn btn-outline-primary m-l-5" id="back" hidden\$="[[hideBack]]" button-text="Back" raised="" on-tap="_onBackTap"></pebble-button>
                            <pebble-button class="action-button-focus dropdownText btn btn-outline-primary m-l-5" id="next" hidden\$="[[hideNext]]" disabled\$="[[disableNext]]" button-text="Next" raised="" on-tap="_onNextTap"></pebble-button>
                        </div>
                    </template>
                </div>
            </div>
            <div class="base-grid-structure-child-2">
                <div class="base-grid-structure overflow-dialog-content">
                    <div class="base-grid-structure-child-1">
                        <div id="message-container" hidden\$="[[!noSteps]]">
                            <div class="default-message">[[noDataMessage]]</div>
                        </div>
                    </div>
                    <div class="base-grid-structure-child-2">
                        <div id="step-container-manage" class="button-siblings">
                            <!-- step component should be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
            <pebble-spinner active="[[_loading]]"></pebble-spinner>
            <pebble-dialog id="confirmationDialog" dialog-title="Confirmation" modal="" alert-box="" show-cancel="" show-ok="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
                <p>There are unsaved changes. Do you want to discard the changes?</p>
            </pebble-dialog>
            <bedrock-pubsub event-name="on-buttonok-clicked" handler="_onDiscardConfirm" target-id="confirmationDialog"></bedrock-pubsub>
            <bedrock-pubsub event-name="on-buttoncancel-clicked" handler="_onDiscardCancel" target-id="confirmationDialog"></bedrock-pubsub>
        </div>
        <bedrock-pubsub event-name="onNext" handler="_onFinishStep"></bedrock-pubsub>
        <bedrock-pubsub event-name="business-function-step-complete" handler="_onBusinessFunctionStepComplete"></bedrock-pubsub>
        <bedrock-pubsub event-name="business-function-close" handler="_onBusinessFunctionClose"></bedrock-pubsub>
`;
  }

  static get is() { return 'rock-wizard-manage' }
  static get properties() {
      return {
          config: {
              type: Object,
              observer: '_configChanged',
              value: function () {
                  return {};
              }
          },
          /**
           * If set as true , it indicates the component is in read only mode
           */
          readonly: {
              type: Boolean,
              value: false,
              observer: '_onReadonly'
          },
          _currentStepIndex: {
              type: Number,
              value: 0
          },

          _loading: {
              type: Boolean,
              value: true
          },
          /*
          * Indicates the data that is shared between all the steps of the wizard.
          */
          hideStepper: {
              type: Boolean,
              value: false
          },
          sharedData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _stepperConfig: {
              type: Array,
              value: function () { return []; }
          },
          noSteps: {
              type: Boolean,
              value: false,
              observer: '_onNoSteps'
          },
          noDataMessage: {
              type: String,
              value: ""
          },
          _stepperConnectorLineWidth: {
              type: String,
              value: "200px"
          },
          hideBack: {
              type: Boolean,
              value: false
          },
          hideNext: {
              type: Boolean,
              value: false
          },
          disableNext: {
              type: Boolean,
              value: false
          },
          showNavigationButtons: {
              type: Boolean,
              value: true
          },
          stateContainer: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          skippedStepList: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          isBackStepTriggered: {
              type: Boolean,
              value: false
          },
          stepTraverse: {
              type: Array,
              value: function () {
                  return [];
              }
          }
      }
  }

  /*
  * Indicates the configuration information that the user provided.
  */
  connectedCallback() {
      super.connectedCallback();
      this._confirmationDialog = this.shadowRoot.querySelector("#confirmationDialog");

  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

  _computeStepper() {
      return this.hideStepper;
  }

  get stepContainer() {
      this._stepContainer = this._stepContainer || this.shadowRoot.querySelector('#step-container-manage');
      return this._stepContainer;
  }

  //getter for current stepper element
  get stepperElement() {
      if (this.stepContainer) {
          this._stepperElement = this.stepContainer.firstElementChild;
      }
      return this._stepperElement;
  }

  _configChanged(config) {
      if (config && config.steps && config.steps.length > 0) {
          if(config.steps.length == 1){
              this.hideStepper = true;
          }
          let stepper = this.shadowRoot.querySelector('#pebbleStepper');
          if(stepper){
              stepper.selected = null;
          }
          let stepperConfig = {};
          stepperConfig.items = []
          for (let i = 0; i < config.steps.length; i++) {
              let step = {
                  "index": i + 1,
                  "title": config.steps[i] && config.steps[i].stepperTitle ? config.steps[i].stepperTitle : "",
                  "status": "pending",
                  "isMandatory": config.steps[i] && config.steps[i].isMandatory ? config.steps[i].isMandatory : false
              };
              stepperConfig.items.push(step);
          }
          /***
           * When there are more than 3 steps in BF, stepper isn't visible completely
           * because of static width(200px) of connector line. Calculating width of 
           * connectorline dynamically based on number of steps.
           * Has taken 1000px as available width in wizard as at this point
           * wizard and BF dialog aren't ready yet to get computed width value.
           * */
          let lineWidth = 800 / (config.steps.length * 2);
          if (lineWidth < 200) {
              this._stepperConnectorLineWidth = lineWidth + "px";
          }
          this.set("_stepperConfig", stepperConfig);
          this.shadowRoot.querySelector("#steps-template").render();
          this.sharedData["business-function-name"] = config.name || "";
          //This is to hide the cancel button for each step if its enabled
          this.sharedData["is-part-of-business-function"] = true;
          this.goToStep(0);
      }
  }

  /**
   * Can be used to go to a particular step in the wizard.
   */
  goToStep(stepIndex) {
      //load content based on current step config
      if (stepIndex >= 0 && stepIndex < this.config.steps.length) {
          this._currentStepIndex = stepIndex;
          if (this.stepTraverse.indexOf(stepIndex) == -1) {
              this.stepTraverse.push(stepIndex);
          }
          let stepConfig = this.config.steps[stepIndex];
          this._updateStepperSelectedStep(stepIndex);
          this._renderComponent(stepConfig);
          this._rePaintNavigationButtons(stepConfig, stepIndex);
          this.isBackStepTriggered = false; //reset
      }
  }

  _renderComponent(config) {
      let contentElement = this.stepContainer;
      if (config && config.component && contentElement) {
          let properties = config.component.properties ? config.component.properties : {};
          if (this.sharedData) {
              for (let key in this.sharedData) {
                  if (!this.sharedData.hasOwnProperty(key)) continue;
                  properties[key] = this.sharedData[key];
              }
              if (this.readonly) {
                  properties.mode = 'view';
                  properties.readonly = this.readonly;
              }
          }

          this._loadCurrentStepPropertiesToNextStep(properties); //Set only from 2nd step
          this._loadFinishStepData(properties); //Set only when it is last step
          this._setCurrentComponentState(properties); //Maintain state for properties
          this._setPropertiesForBackStep(properties); //Set result props when back step triggered
          config.component.properties = properties;
          ComponentHelper.loadContent(contentElement, config.component, this);
          this._loading = false;
      }
  }

  //This repaints the navigation buttons on certain scenarios
  _rePaintNavigationButtons(stepConfig, stepIndex) {
      //Last step next button
      if (stepIndex == this.config.steps.length - 1) {
          this.set('hideNext', true);
      } else {
          this.set('hideNext', false);
      }

      //First step back button
      if ((stepConfig.stepToBackOptionEnabled != undefined && !stepConfig.stepToBackOptionEnabled)
          || stepIndex == 0) {
          this.set('hideBack', true);
      }
      else {
          this.set('hideBack', false);
      }

      //Next button should be disabled if the step is mandatory
      if(!this.isBackStepTriggered) {
          this.set('disableNext', !!stepConfig.isMandatory);
      }
  }

  _updateStepperSelectedStep(stepIndex) {
      let stepper = this.shadowRoot.querySelector('#pebbleStepper');
      let previousStepName;
      if(stepIndex > 0){
          previousStepName = this.config.steps[stepIndex-1].name;
      }
      let previousItem = undefined;
      //Make the previous step as completed only if its not skipped and if its not a back option
      if (stepper.selectedItem && !this.isBackStepTriggered && this.skippedStepList.indexOf(previousStepName) == -1) {
          previousItem = stepper.selectedItem;
          previousItem.status = "completed";
      }
      stepper.selected = stepIndex;
      let stepperChildren = FlattenedNodesObserver.getFlattenedNodes(stepper).filter(n => n.nodeType === Node.ELEMENT_NODE);
      let currentStepperChildren = stepperChildren[stepIndex];
      if (currentStepperChildren && currentStepperChildren != previousItem) {
          currentStepperChildren.status = "inprogress";
      }
  }
  _disableStepper(stepIndex) {
      let stepper = this.shadowRoot.querySelector('#pebbleStepper');
      let stepperChildren = FlattenedNodesObserver.getFlattenedNodes(stepper).filter(n => n.nodeType === Node.ELEMENT_NODE);
      let currentStepperChildren = stepperChildren[stepIndex];
      if (currentStepperChildren) {
          currentStepperChildren.status = "pending";
      };
  }
  _setCurrentComponentState(properties) {
      let currentStepConfig = this.config.steps[this._currentStepIndex];

      if (properties) {
          //Capture component properties
          if (!this.stateContainer[currentStepConfig.name]) {
              this.stateContainer[currentStepConfig.name] = {};
          }
          this.stateContainer[currentStepConfig.name]["properties"] = properties;
      } else {
          //Capture current component result
          let currentComponent = this.stepperElement;
          if (currentComponent) {
              this.stateContainer[currentStepConfig.name]["componentResult"] = currentComponent.componentResult;
              this.stateContainer[currentStepConfig.name]["finishStepData"] = currentComponent.finishStepData;
              this.stateContainer[currentStepConfig.name]["contextData"] = currentComponent.contextData;
          }
      }
  }

  _loadCurrentStepPropertiesToNextStep(properties) {
      let currentComponent = this.stepperElement;
      if (currentComponent) {
          for (let property in currentComponent.constructor.properties) {
              //Not considering the property which starts with "_", as per standards it is private member
              if (currentComponent[property] && !(currentComponent[property] instanceof Element) && !property.startsWith("_")) {
                  let propertyKey = DataHelper.convertHyphenatedStringFromCamelCase(property);
                  properties[propertyKey] = currentComponent[property];
              }
          }
      }
  }

  _loadFinishStepData(properties) {
      if (this._currentStepIndex != this.config.steps.length - 1) {
          return;
      }

      let currentComponent = this.stepperElement;
      let configSteps = this.config.steps;
      let stepConfig = configSteps[this._currentStepIndex];

      //Finish step component check is needed because in some BF flow there is no finish step
      let isFinishComponent = stepConfig.component.path.indexOf("rock-business-function-finish") != -1 ||
          stepConfig.component.path.indexOf("rock-bulk-action-result") != -1;

      if (isFinishComponent) {
          if (_.isEmpty(stepConfig.component.properties["finish-step-data"])) {
              for (let idx = this._currentStepIndex - 1; idx >= 0; idx--) {
                  let stepState = this.stateContainer ? this.stateContainer[configSteps[idx].name] : {};
                  if (stepState && !_.isEmpty(stepState.finishStepData)) {
                      // BF V2 Cleanup - Change to finishStepData
                      properties["business-function-data"] = stepState.finishStepData;
                      properties["component-result"] = stepState.componentResult;
                      break;
                  }
              }
          } else {
              // BF V2 Cleanup - Change to finishStepData
              properties["business-function-data"] = stepConfig.component.properties["finish-step-data"];
              for (let idx = this._currentStepIndex - 1; idx >= 0; idx--) {
                  let stepState = this.stateContainer ? this.stateContainer[configSteps[idx].name] : {};
                  if (stepState && !_.isEmpty(stepState.componentResult) && stepState.componentResult.status == "completed") {
                      properties["component-result"] = stepState.componentResult;
                      break;
                  }
              }
          }
      }
  }

  _setPropertiesForBackStep(properties) {
      if (!this.isBackStepTriggered) {
          return;
      }

      let currentStepConfig = this.config.steps[this._currentStepIndex];
      let stepState = this.stateContainer[currentStepConfig.name] ? this.stateContainer[currentStepConfig.name] : {};
      if (!_.isEmpty(stepState)) {
          properties["finish-step-data"] = stepState.finishStepData;
          properties["component-result"] = stepState.componentResult;
          properties["context-data"] = stepState.contextData;
      }
      this._resetSkippedStepList(); //skipped list should be reset on coming back
  }

  _resetSkippedStepList() {
      let removeStepList = _.map(_.rest(this.config.steps, this._currentStepIndex) || [], function (step) {
          return step.name;
      });
      let skippedList = [];
      for (let idx = 0; idx < this.skippedStepList.length; idx++) {
          if (removeStepList.indexOf(this.skippedStepList[idx]) == -1) {
              skippedList.push(this.skippedStepList[idx]);
          }
      }
      this.skippedStepList = skippedList;
  }

  //gets the current step data through bedrock-component-business-function-behaviour
  getComponentBusinessFunctionData() {
      let componentStatusData = {};
      if (this.stepperElement) {
          componentStatusData =
              {
                  businessFunctionData: this.stepperElement.businessFunctionData,
                  componentResult: this.stepperElement.componentResult,
                  finishStepData: this.stepperElement.finishStepData,
                  isComponentDirty: this.stepperElement.getIsDirty instanceof Function ? this.stepperElement.getIsDirty() : false,
                  isPartOfBusinessFunction: this.stepperElement.isPartOfBusinessFunction

              };
      }
      return componentStatusData;
  }

  _onFinishStep(e, detail) {
      this._triggerComponentEvent(detail, detail.closeBusinessFunction || false);
  }

  _triggerComponentEvent(detail, closeBusinessFunction = false) {
      if (!detail) {
          detail = {};
      }
      detail.closeBusinessFunction = closeBusinessFunction;
      this.dispatchEvent(new CustomEvent('next-step', { detail: detail, bubbles: true, composed: true }));
  }

  //handler function for step complete
  _onBusinessFunctionStepComplete(e, detail) {
      let currentStepConfig = this.config.steps[this._currentStepIndex];
      //if step is finished and it is a mandatory step, then goes to next step
      if (currentStepConfig.isMandatory) {
          //Once operation is completed, then enable next button for mandatory step
          this.set('disableNext', false);
      }
      //Trigger events
      if (detail && !_.isEmpty(detail.eventDetails)) {
          detail.eventDetails.forEach(eventDetail => {
              this._triggerComponentEvent(eventDetail);
          });
      }
  }

  _onBusinessFunctionClose(e, detail) {
      if ((this._currentStepIndex == this.config.steps.length - 1) ||
          (detail && detail.forceClose)) {
          this.fire("cancel-event", detail);
      }
  }

  _getNextStepIndex() {
      let contentElement = this.stepContainer;
      let currentComponent = contentElement.firstElementChild;
      let currentStepConfig = this.config.steps[this._currentStepIndex];
      let nextStepIndex = this._currentStepIndex + 1;

      if (currentComponent &&
          currentComponent.componentResult &&
          currentComponent.componentResult.status != "completed") {
          this._disableStepper(this._currentStepIndex); //Show skipped step as disabled
          this.skippedStepList.push(currentStepConfig.name);
      }

      if (this.skippedStepList.length) {
          let foundNextStepIndex;
          for (let i = nextStepIndex; i < this.config.steps.length; i++) {
              if (this.config.steps[i].dependentOn &&
                  this.skippedStepList.indexOf(this.config.steps[i].dependentOn) != -1) {
                  this.skippedStepList.push(this.config.steps[i].name);
                  this._disableStepper(i); //Show skipped step as disabled
                  continue;
              } else {
                  foundNextStepIndex = i;
                  break;
              }
          }

          if (foundNextStepIndex) {
              nextStepIndex = foundNextStepIndex;
          } else {
              nextStepIndex = this.config.steps.length;
          }
      }

      return nextStepIndex;
  }

  goToNext() {
      let nextStepIndex = this._getNextStepIndex();
      if (nextStepIndex != this.config.steps.length) {
          this._setCurrentComponentState(); //For component result
          this.goToStep(nextStepIndex);
      } else {
          this.fire("cancel-event");
      }
  }

  /**
   * Can be used to move backward to the previous step.
   */
  goToPrevious() {
      this.isBackStepTriggered = true;
      if (this.stepperElement.getIsDirty  instanceof Function && this.stepperElement.getIsDirty()) {
          this._confirmationDialog.open();
      } else {
          this._triggerPreviousStep();
      }
  }

  _triggerPreviousStep() {
      if (this._currentStepIndex > 0) {
          let lastStepIndex = this.stepTraverse[this.stepTraverse.length - 1];
          let previousStepIndex = this.stepTraverse[this.stepTraverse.length - 2];
          for (let i = lastStepIndex; i > previousStepIndex; i--) {
              this._disableStepper(i);
          }
          this.stepTraverse.pop(); //remove current index
          let backStepIndex = this.stepTraverse[this.stepTraverse.length - 1];
          this.goToStep(backStepIndex);
      }
  }

  //Redirect to next or previous step
  _onDiscardConfirm() {
      if (this.isBackStepTriggered) {
          this._triggerPreviousStep();
      } else {
          this.goToNext();
      }
  }

  _onDiscardCancel() {
      this.isBackStepTriggered = false;
  }

  _onNextTap() {
      let componentStatusData = this.getComponentBusinessFunctionData();
      let currentStepConfig = this.config.steps[this._currentStepIndex];
      if (componentStatusData && componentStatusData.componentResult &&
          componentStatusData.componentResult.status != "completed") {
          if (currentStepConfig.isMandatory) {
              this.showErrorToast(
                  "Finish the mandatory step to continue."
              );
              return;
          }
      }

      if (componentStatusData.isComponentDirty) {
          this._confirmationDialog.open();
      }
      else {
          //skip or complete the step
          this.goToNext();
      }
  }

  _onBackTap() {
      if (this._currentStepIndex && this._currentStepIndex != 0) {
          this.goToPrevious();
      }
  }

  _onReadonly() {
      let content = this.stepContainer;
      if (content && content.firstElementChild) {
          content.firstElementChild.readonly = this.readonly;
      }
  }

  _onNoSteps() {
      if (this.noSteps) {
          this._loading = false;
      }
  }

  getIsDirty() {
      let stepperElement = this.stepperElement
      if (stepperElement && stepperElement.getIsDirty instanceof Function) {
          return stepperElement.getIsDirty();
      }
      return false;
  }

  getDataFunctionProperties() {
      let currentStepConfig = this.config.steps[this._currentStepIndex];
      let properties = {};
      if (this.stateContainer[currentStepConfig.name] && this.stateContainer[currentStepConfig.name].properties) {
          properties = this.stateContainer[currentStepConfig.name].properties;
      }
      return properties;
  }
}
customElements.define(RockWizardManage.is, RockWizardManage);
