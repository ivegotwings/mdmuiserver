/**
`rock-wizard` Represents an element that displays the steps in a sequence
based on the given configuration.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

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
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockWizard
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-grid-layout bedrock-style-padding-margin">
            :host {
                display: block;
                height: 100%;
            }

            #step-container {
                border-radius: 5px;
                height: 100%;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 0px 10px;
                @apply --step-container;
            }

            #stepper {
                margin: 10px 0px;
                @apply --stepper;
            }

            .stepper-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .stepper-style {
                --pebble-connected-badge-width: 40px;
                --pebble-connected-badge-height: 40px;
                --pebble-connected-badge-fontSize: 20px;
                --pebble-horizontal-step-connector-line-width: 200px;
                --pebble-horizontal-step-connector-line-height: 3px;
            }            
        </style>
        <div id="wizard-container" class="base-grid-structure">
            <div class="base-grid-structure-child-1">
                <div class="stepper-wrapper">
                    <div id="stepper" hidden\$="[[_computeStepper(hideStepper)]]">
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
                </div>
            </div>
            <div class="base-grid-structure-child-2">
                <div class="base-grid-structure">
                    <div class="base-grid-structure-child-1">
                        <div id="message-container" hidden\$="[[!noSteps]]">
                            <div class="default-message">[[noDataMessage]]</div>
                        </div>
                    </div>
                    <div class="base-grid-structure-child-2">
                        <div id="step-container">
                            <!-- step component should be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
            <pebble-spinner active="[[_loading]]"></pebble-spinner>
        </div>
        <bedrock-pubsub event-name="component-creating" handler="_onComponentCreating" target-id=""></bedrock-pubsub>
`;
  }

  static get is() { return 'rock-wizard' }
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
          * Indicates the properties of the object for the wizard.
          */
          properties: {
              type: Object,
              value: function () {
                  return {};
              }
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
          parentComponent: {
              type: Element
          }
      }
  }

  /*
  * Indicates the configuration information that the user provided.
  */

  _computeStepper () {
      return this.hideStepper;
  }
  /**
   * Can be used to move forward to the next step.
   */
  goToNext () {
      if (this._currentStepIndex < this.config.steps.length - 1) {
          this.goToStep(this._currentStepIndex + 1);
      } else {
          this.fire("cancel-event");
      }
  }
  /**
   * Can be used to move backward to the previous step.
   */
  goToPrevious () {
      if (this._currentStepIndex > 0) {
          this.goToStep(this._currentStepIndex - 1);
      }
  }
  /**
   * Can be used to go to a particular step in the wizard.
   */
  goToStep (stepIndex) {
      //load content based on current step config
      if (stepIndex >= 0 && stepIndex < this.config.steps.length) {
          this._currentStepIndex = stepIndex;
          let stepConfig = this.config.steps[stepIndex];
          this._renderComponent(stepConfig);
          this._addEventListeners(stepConfig);
          this._updateStepperSelectedStep(stepIndex);
      }
  }
  _updateStepperSelectedStep (stepIndex) {
      let stepper = this.shadowRoot.querySelector('#pebbleStepper');
      let previousItem = undefined;
      if (stepper.selectedItem) {
          previousItem = stepper.selectedItem;
          stepper.selectedItem.status = "completed";
      }
      stepper.selected = stepIndex;
      let stepperChildren = FlattenedNodesObserver.getFlattenedNodes(stepper).filter(n => n.nodeType === Node.ELEMENT_NODE);
      let currentStepperChildren = stepperChildren[stepIndex];
      if (currentStepperChildren && currentStepperChildren != previousItem) {
          currentStepperChildren.status = "inprogress";
      };
      // if(stepper.selectedItem && stepper.selectedItem != previousItem) {
      //     stepper.selectedItem.status = "inprogress";
      // }
  }
  _configChanged (config) {
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
                  "status": "pending"
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
          let lineWidth = 1000 / (config.steps.length * 2);
          if (lineWidth < 200) {
              this._stepperConnectorLineWidth = lineWidth + "px";
          }
          this.set("_stepperConfig", stepperConfig);
          this.shadowRoot.querySelector("#steps-template").render();
          this.goToStep(0);
      }
  }

  get stepContainer() {
      this._stepContainer = this._stepContainer || this.shadowRoot.querySelector('#step-container');
      return this._stepContainer;
  }

  _renderComponent (config) {
      let contentElement = this.stepContainer;
      if (config && config.component && contentElement) {
          if (this.sharedData) {
              if (!config.component.properties) {
                  config.component.properties = {};
              }
              for (let key in this.sharedData) {
                  if (!this.sharedData.hasOwnProperty(key)) continue;
                  config.component.properties[key] = this.sharedData[key];
              }
              if (this.readonly) {
                  config.component.properties.mode = 'view';
                  config.component.properties.readonly = this.readonly;
              }
          }

          //Add stepper events to component
          this._addStepperEventsToComponent(config);
          ComponentHelper.loadContent(contentElement, config.component, this);
          this._loading = false;
      }
  }

  _addStepperEventsToComponent (config) {
      let componentEvents = [];
      let eventStyles = {
          "primary": "btn btn-primary m-r-5",
          "secondary": "btn btn-secondary m-r-5",
          "success": "btn btn-success"
      };

      if (config.backEvent) {
          componentEvents.push({
              "id": "backEvent",
              "text": "Back",
              "event": config.backEvent,
              "class": eventStyles.secondary
          });
      }
      if (config.skipEvent) {
          componentEvents.push({
              "id": "skipEvent",
              "text": "Skip",
              "event": config.skipEvent,
              "class": eventStyles.secondary
          });
      }
      if (config.cancelEvent) {
          componentEvents.push({
              "id": "cancelEvent",
              "text": "Cancel",
              "event": config.cancelEvent,
              "class": eventStyles.primary
          });
      }
      if (config.nextEvent) {
          componentEvents.push({
              "id": "nextEvent",
              "text": "Save",
              "event": config.nextEvent,
              "class": eventStyles.success
          });
      }

      if (componentEvents.length) {
          config.component.properties["component-events"] = componentEvents;
      }
  }

  _onNext (e, detail, sender) {
      let data = detail.data;
      this._loadSharedData();
      if (data && data.skipNext) {
          this._updateStepperSelectedStep(this._currentStepIndex + 1);
          this._currentStepIndex++;
      }
      if (this._currentStepIndex == this.config.steps.length - 1) {
          if (!detail) {
              detail = {};
          }
          detail.closeBusinessFunction = true;
          this.dispatchEvent(new CustomEvent('next-step', { detail: detail, bubbles: true, composed: true }));
      } else {
          if (detail) {
              this.dispatchEvent(new CustomEvent('next-step', { detail: detail, bubbles: true, composed: true }));
          }
          this.goToNext();
      }
  }
  _onBack (e, detail, sender) {
      let data = detail.data;
      if (data && data.skipBack) {
          this._updateStepperSelectedStep(this._currentStepIndex - 1);
          this._currentStepIndex--;
      }
      if (this._currentStepIndex && this._currentStepIndex != 0) {
          this.goToPrevious();
      } else if (this._currentStepIndex == 0) {
          this.dispatchEvent(new CustomEvent('first-step-cancelled', { bubbles: true, composed: true }));
      }
  }
  _onSkip (e, detail, sender) {
      this._loadSharedData();
      this.goToNext();
  }
  _onCancel (e, detail, sender) {
      this.fire("cancel-event", detail);
  }
  _onComponentCreating (e, detail, sender) {

  }
  _addEventListeners (config) {
      if (!config) return;
      
      let events = this._getEventData(config);
      events.forEach(event => {
          if (event.eventname) {
              let domElement = this.shadowRoot.querySelector('#' + event.id);
              if(domElement && domElement.eventName && domElement.eventName == event.eventname){
                  // if pubsub already exists then skip creating new pubsub element
              } else {
                  let pubsubEle = customElements.get('bedrock-pubsub');
                  let pubSub = new pubsubEle();
                  pubSub.id = event.id;
                  pubSub.eventName = event.eventname;
                  pubSub.handler= event.eventhandler;
                  this.shadowRoot.appendChild(pubSub);
              }
          }
      });
  }
  _getEventData(config){
      return [
              {
                  id: "next-event",
                  eventname: config.nextEvent,
                  eventhandler: "_onNext"
              },
              {
                  id: "back-event",
                  eventname: config.backEvent,
                  eventhandler: "_onBack"
              },
              {
                  id: "skip-event",
                  eventname: config.skipEvent,
                  eventhandler: "_onSkip"
              },
              {
                  id: "cancel-event",
                  eventname: config.cancelEvent,
                  eventhandler: "_onCancel"
              }
          ];
  }
  _loadSharedData () {
      let contentElement = this.stepContainer;
      let currentComponent = contentElement.firstElementChild;
      let currentConfig = this.config.steps[this._currentStepIndex];
      if (currentConfig.sharedProperties) {
          let sharedProperties = currentConfig.sharedProperties;
          for (let i in sharedProperties) {
              this.sharedData[i] = currentComponent[sharedProperties[i]];
          }
      }
  }
  /**
  * Can be used to get if the current component loaded in the wizard is dirty or not.
  */
  getIsDirty () {
      let content = this.stepContainer;
      if (content && content.firstElementChild && content.firstElementChild.getIsDirty) {
          return content.firstElementChild.getIsDirty();
      }
      return false;
  }

  _onReadonly () {
      let content = this.stepContainer;
      if (content && content.firstElementChild) {
          content.firstElementChild.readonly = this.readonly;
      }
  }

  _onNoSteps () {
      if (this.noSteps) {
          this._loading = false;
      }
  }
}
customElements.define(RockWizard.is, RockWizard);
