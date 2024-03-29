/**
`pebble-step` Represents a child element of the `pebble-stepper` element. 
Each step indicates the given flow in the `pebble-stepper`.

@group Pebble Elements
@element pebble-step
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/paper-badge/paper-badge.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../pebble-button/pebble-button.js';
import '../pebble-image-viewer/pebble-image-viewer.js';
import '../pebble-textarea/pebble-textarea.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleStep
  extends mixinBehaviors([
    RUFBehaviors.UIBehavior
  ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
    <style>
      /* horizontal step style */

      :host([_horizontal]) {
        @apply --layout-horizontal;
        @apply --paper-font-common-base;
      }

      :host([_horizontal]) #label {
        @apply --layout-vertical;
        @apply --layout-center;
        position: relative;
      }

      :host([_horizontal]) #step-heading {
        @apply --layout-vertical;
        @apply --layout-center;
        max-width: var(--pebble-connected-badge-width, 26px);
      }

      :host([_horizontal]) #connectedBadge {
        z-index: 1;
        @apply --layout-horizontal;
      }

      :host([_horizontal]) #textWrapper {
        z-index: 1;
        color: var(--paper-grey-400);
        @apply --layout-vertical;
        width: 250px;
      }
      :host([_horizontal]) #step-title{
        text-align: center;
      }

      :host([_horizontal]) #beforeConnectorLine,
      :host([_horizontal]) #afterConnectorLine {
        width: var(--pebble-horizontal-step-connector-line-width, 60px);
        background: var(--connectorLine-color, #e0e0e0);
        height: var(--pebble-horizontal-step-connector-line-height, 1px);
        margin-top: calc(var(--pebble-connected-badge-width, 26px)/2);
      }

      :host([_horizontal]) #contentConnectorLine {
        height: var(--pebble-horizontal-step-connector-line-height, 1px);
        background: var(--divider-color, #c1cad4);
      }

      :host([_horizontal]) #collapse {
        @apply --layout-horizontal;
        --iron-collapse-transition-duration: var(--pebble-vertical-step-transition-duration, 500ms);
      }

      /* horizontal child step style */

      :host([_horizontal]) #childLabel {
        @apply --layout-vertical;
        @apply --layout-center;
        position: relative;
      }

      :host([_horizontal]) #connectedChildBadge {
        @apply --layout-horizontal;
        margin-top: calc((var(--pebble-connected-badge-width, 26px) - var(--pebble-connected-childBadge-width, 12px))/2);
      }

      :host([_horizontal]) #child-step-heading {
        @apply --layout-vertical;
        @apply --layout-center;
        max-width: var(--pebble-connected-child-badge-width, 12px);
      }

      :host([_horizontal]) #childBeforeConnectorLine,
      :host([_horizontal]) #childAfterConnectorLine {
        width: var(--pebble-horizontal-step-child-connector-line-width, 40px);
        background: var(--palette-pale-grey, #e6ebf0);
        height: var(--pebble-horizontal-step-child-connector-line-height, 1px);
        margin-top: calc(var(--pebble-connected-child-badge-width, 12px)/2);
      }

      :host([_horizontal]) #childContentConnectorLine {
        height: var(--pebble-horizontal-step-child-connector-line-height, 1px);
        background: var(--palette-pale-grey, #e6ebf0);
      }

      /* vertical step style */

      :host(:not([_horizontal])) {
        position: relative;
        z-index: 0;
        @apply --layout-vertical;
        @apply --paper-font-common-base;
        @apply --layout-flex;
      }

      :host(:not([_horizontal])) #label {
        @apply --layout-horizontal;
        @apply --layout-center;
        position: relative;
      }

      :host(:not([_horizontal])) #step-heading {
        @apply --layout-horizontal;
        @apply --layout-center;
        max-height: var(--pebble-connected-badge-width, 26px);
      }

      :host(:not([_horizontal])) #connectedBadge {
        z-index: 1;
        padding-left: 10px;
        width: 100%;
        transition: all 0.3s;
        -webkit-transition: all 0.3s;
        @apply --layout-vertical;
      }

      :host(:not([_horizontal])) #connectedBadge:hover {
        background-color: var(--bgColor-hover, #e8f4f9);
      }

      :host(:not([_horizontal])) #connectedBadge:hover #textLabel {
        color: var(--focused-line, #026bc3);
      }

      :host(:not([_horizontal])) #textWrapper {
        z-index: 1;
        color: var(--paper-grey-400);
        padding-left: 10px;
        @apply --layout-vertical;
      }

      :host(:not([_horizontal])) #beforeConnectorLine,
      :host(:not([_horizontal])) #afterConnectorLine {
        width: var(--connectorLine-width, 4px) !important;
        background: var(--connectorLine-color, #e0e0e0);
        height: var(--connectorLine-height, 10px);
        margin-left: 16px;
      }

      :host(:not([_horizontal])) #contentConnectorLine {
        width: var(--content-connectorLine-width, 3px) !important;
        background: var(--connectorLine-color, #e0e0e0);
        margin-left: calc(11px + var(--pebble-connected-badge-width, 26px)/2);
        margin-right: 24px;
      }

      :host(.completed) #contentConnectorLine {
        background: var(--success-button-color, #09c021);
      }

      :host(.inprogress) #contentConnectorLine {
        background: var(--primary-border-button-color, #026bc3);
      }

      /*Vertical child step style*/

      :host(:not([_horizontal])) #childLabel {
        @apply --layout-horizontal;
        @apply --layout-center;
        position: relative;
      }

      :host(:not([_horizontal])) #connectedChildBadge {
        @apply --layout-vertical;
        margin-left: calc(19px + (var(--pebble-connected-badge-width, 26px) - var(--pebble-connected-childBadge-width, 12px))/2);
      }

      #child-step-heading {
        margin-left: 1px;
      }

      :host(:not([_horizontal])) #child-step-heading {
        @apply --layout-horizontal;
        @apply --layout-center;
        max-height: var(--pebble-connected-child-badge-width, 12px);
      }

      :host(:not([_horizontal])) #childBeforeConnectorLine,
      :host(:not([_horizontal])) #childAfterConnectorLine {
        width: var(--child-connectorLine-width, 3px) !important;
        background: var(--palette-pale-grey, #e6ebf0);
        margin-left: calc(var(--pebble-connected-child-badge-width, 12px)/2);
        height: 10px;
      }

      :host(:not([_horizontal])) #childContentConnectorLine {
        width: var(--child-connectorLine-width, 3px) !important;
        background: var(--palette-pale-grey, #e6ebf0);
        margin-left: calc(19px + (var(--pebble-connected-childBadge-width, 12px))/2 + (var(--pebble-connected-badge-width, 26px) - var(--pebble-connected-childBadge-width, 12px))/2);
        margin-right: 18px;
      }

      :host(.first-step) #beforeConnectorLine,
      :host(.last-step) #afterConnectorLine {
        background: none !important;
      }

      :host([_horizontal].first-step) #beforeConnectorLine,
      :host([_horizontal].last-step) #afterConnectorLine {
        display: none;
      }

      /* step styles */

      #textLabel {
        font-size: var(--default-font-size, 14px);
        color: var(--secondary-button-text-color, #75808b);
      }
      .textLabel-with-madatory {
        position: relative;
        padding: 0px 10px;
      }

      #collapse {
        --iron-collapse-transition-duration: var(--pebble-vertical-step-transition-duration, 500ms);
        max-height: none !important;
      }

      #stepContent {
        @apply --layout-horizontal;
      }

      #stepDetails {
        @apply --layout-vertical;
      }

      

      #step-subtitle {
        @apply --layout-horizontal;
        font-size: var(--font-size-sm);
        color: var(--palette-steel-grey);
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }

      paper-badge {
        --paper-badge-background: #f5f0f0;
        --paper-badge-text-color: #616161;
        padding: 18px 0px 0px 24px;
        margin-left: 5px;
        --paper-badge: {
          border: 1px solid #616161;
        }
        .badge {
          background-color: #0abf21;
        }
      }

      #outerBadge {
        width: var(--pebble-connected-badge-width, 26px);
        height: var(--pebble-connected-badge-height, 26px);
        background: var(--pebble-step-outer-badge-background, white);
        border-radius: 50%;
        border: 2px solid;
        border-color: var(--pebble-step-outer-badge-color, #c1cad4);
        @apply --layout;
        @apply --layout-center-center;
        z-index: 1;
      }

      #badge {
        width: calc(var(--pebble-connected-badge-width, 26px) - 4px);
        height: calc(var(--pebble-connected-badge-height, 26px) - 4px);
        background: var(--pebble-step-outer-badge-color, #c1cad4);
        border-radius: 50%;
        color: var(--pebble-step-connected-badge-color, white);
        font-size: var(--pebble-connected-badge-fontSize, 12px);
        text-shadow: 0 1px 1px rgba(137, 147, 159, 0.57);
        @apply --layout;
        @apply --layout-center-center;
        pointer-events: auto;
      }

      :host(.last-step) #contentConnectorLine {
        visibility: hidden;
      }

      :host #textWrapper {
        color: var(--paper-grey-600);
        pointer-events: auto;
      }

      :host([opened]) paper-badge {
        visibility: hidden;
      }

      :host([opened]) #step-subtitle {
        display: none;
      }

      [hidden] {
        display: none;
      }

      /* child step Styles */

      .childCollapse {
        --iron-collapse-transition-duration: var(--pebble-vertical-step-transition-duration, 500ms);
        @apply --layout-horizontal;
      }

      /**
       * Buttons
       */

      #buttonsWrapper {
        @apply --layout-horizontal;
        @apply --layout-center;
      }

      .action-button {
        margin-right: 6px;
      }

      #childBadge {
        width: var(--pebble-connected-childBadge-width, 12px);
        height: var(--pebble-connected-childBadge-height, 12px);
        background: var(--pebble-connected-childBadge-background, var(--paper-grey-300));
        border-radius: 50%;
        color: var(--pebble-connected-childBadge-color, white);
        font-size: var(--pebble-connected-childBadge-fontSize, 12px);
        @apply --layout;
        @apply --layout-center-center;
      }

      /* Styles for Completed Step */

      :host(.completed) #textLabel {
        color: var(--completed-steper-color, #09c021);
      }

      :host(.completed) #badge {
        background-color: var(--completed-steper-color, #09c021);
      }

      :host(.completed) #outerBadge {
        border-color: var(--completed-steper-color, #09c021);
        background-color: var(--outer-badge-bg-color, #ffffff);
      }

      :host(.completed) #beforeConnectorLine,
      :host(.completed) #afterConnectorLine {
        background-color: var(--completed-steper-color, #09c021);
      }

      /* Styles for Executing Step */

      :host(.inprogress) #textLabel {
        color: var(--inprogress-stepper-color, #026bc3);
      }

      :host(.inprogress) #badge {
        background-color: var(--inprogress-stepper-color, #026bc3);
      }

      :host(.inprogress) #outerBadge {
        border-color: var(--inprogress-stepper-color, #026bc3);
        background-color: var(--outer-badge-bg-color, #ffffff);
      }

      :host(.inprogress) #beforeConnectorLine,
      :host(.inprogress) #afterConnectorLine {
        background: var(--inprogress-stepper-color, #026bc3);
      }

      :host(.failed) #textLabel {
        color: var(--failed-stepper-color, #f30440);
      }

      :host(.failed) #badge {
        background-color: var(--failed-stepper-color, #f30440);
      }

      :host(.failed) #outerBadge {
        border-color: var(--failed-stepper-color, #f30440);
        background-color: var(--outer-badge-bg-color, #ffffff);
      }

      :host(.failed) #beforeConnectorLine,
      :host(.failed) #afterConnectorLine {
        background: var(--failed-stepper-color, #f30440);
      }
      _:-ms-lang(x),
      _:-webkit-full-screen,
      iron-collapse {
          transition: initial !important;
          transition-property: none !important;
          max-height: initial !important;
      }
      _:-ms-lang(x),
      _:-webkit-full-screen,
      iron-collapse:not(.iron-collapse-opened){
          max-height: 0px !important;
      }
      .mandatory{
        height: 5px;
        width: 5px;
        background-color:var(--error-color, #ed204c);
        border-radius: 50%;
        position: absolute;
        top: 6px;
        left: 0px;
      }
    </style>
    <div id="label">
      <div id="connectedBadge">
        <div id="beforeConnectorLine"></div>
        <div id="step-heading">
          <div id="outerBadge">
            <div id="badge" on-tap="_selectStep">
              <slot id="stepBadgeContent" name="step-badge-content"></slot>
            </div>
          </div>
          <div id="textWrapper" on-tap="_selectStep">
            <div id="step-title">
              <span id="textLabel" class="textLabel-with-madatory">
                  <template is="dom-if" if="[[data.isMandatory]]">
                      <span class="mandatory"></span>
                      </template>
                [[data.title]]</span>
              <template is="dom-if" if="{{_isBadgeLabel(data)}}">
                <paper-badge id="itemsBadge" for="textLabel" label="+{{_badgeLabel(data)}}"></paper-badge>
              </template>
            </div>
            <div id="step-subtitle">
              <template is="dom-if" if="{{_isSubtitle(data)}}">
                <span>[[data.subtitle]]</span>
              </template>
            </div>
          </div>
        </div>
        <div id="afterConnectorLine" class="connectorLine"></div>
      </div>
    </div>
    <iron-collapse id="collapse" horizontal="[[_horizontal]]" opened="[[opened]]">
      <div id="stepContent">
        <div id="contentConnectorLine"></div>
        <div id="stepDetails">
          <slot id="stepDetailsContent" name="step-details"></slot>
          <div id="buttonsWrapper">
            <template is="dom-repeat" items="{{data.actions}}">
              <pebble-button class="action-button" raised="" disabled="[[_computeDisabled()]]" icon="[[item.actionIcon]]" button-text="[[item.action]]" on-tap="_buttonTap"></pebble-button>
            </template>
          </div>
        </div>
      </div>
      <template is="dom-repeat" items="{{data.items}}">
        <div id="childLabel">
          <div id="connectedChildBadge">
            <div id="childBeforeConnectorLine"></div>
            <div id="child-step-heading">
              <div id="childBadge" on-tap="_expand"></div>
              <div id="textWrapper" on-tap="_expand">
                <span id="textLabel">
                  [[item.label]]
                </span>
              </div>
            </div>
            <div id="childAfterConnectorLine" class="connectorLine"></div>
          </div>
        </div>
        <iron-collapse id="[[_getCollapseId(item)]]" horizontal="[[_horizontal]]" class="childCollapse">
          <div id="childContentConnectorLine"></div>
          <div id="stepWrapper">
            <div id="paperStepWrapper"></div>
            <div id="buttonsWrapper">
              <template is="dom-repeat" items="{{item.actions}}">
                <pebble-button class="action-button" raised="" icon="[[item.actionIcon]]" button-text="[[item.action]]" on-tap="_childActionTap"></pebble-button>
              </template>
            </div>
          </div>
      </iron-collapse></template>
      </iron-collapse>
`;
  }

  static get is() { return 'pebble-step' }
  static get properties() {
    return {
      /**
       * Indicates the open or closed state of the step.
       */
      opened: {
        type: Boolean,
        value: false
      },
      /**
       * Indicates the layout of the step and its child steps.
       */
      _horizontal: {
        type: Boolean,
        reflectToAttribute: true
      },
      /**
       * Indicates the model given to the step.
       */
      data: {
        type: Array,
        value: null
      },
      /**
      * Indicates the number of total steps in the given flow.
      */
      _steps: {
        type: Number,
        value: null
      },
      /**
      * Indicates an index value of the current step.
      */
      _index: {
        type: Number,
        value: null
      },
      /**
      * Indicates the status of the step. 
      * Valid values are "completed", "in-progress", and "pending".
      */
      status: {
        type: String,
        observer: '_stepStatusChanged'
      },
      horizontalLineWidth: {
        type: String,
        value: "200px"
      }
    }
  }
  static get observers() {
    return [
      '_toggleClassPosition(_index)',
      '_stepdataChanged(data)',
      '_widthChanged(horizontalLineWidth)'
    ]
  }
  _toggleClassPosition(_index) {
    if (_index != undefined) {
      microTask.run(() => {
        this.toggleClass('first-step', (_index == 1), this);
        this.toggleClass('last-step', (_index == this._steps), this);
      });
    }
  }
  _widthChanged() {
    if (this._horizontal && this.horizontalLineWidth !== "200px") {
      let beforeConnectorLine = this.shadowRoot.querySelector("#beforeConnectorLine");
      let afterConnectorLine = this.shadowRoot.querySelector("#afterConnectorLine");
      if (beforeConnectorLine) {
        beforeConnectorLine.style.width = this.horizontalLineWidth;
      }
      if (afterConnectorLine) {
        afterConnectorLine.style.width = this.horizontalLineWidth;
      }
    }
  }
  _selectStep() {
    this.dispatchEvent(new CustomEvent('select-step', { bubbles: true, composed: true }));
  }
  _badgeLabel() {
    if (this.data && this.data.items) {
      return this.data.items.length;
    }
  }
  _isBadgeLabel() {
    if (this.data && this.data.items && this.data.items.length > 0) {
      return true;
    }
    return false;
  }
  _isSubtitle() {
    if (this.data && this.data.subtitle) {
      return true;
    }
    return false;
  }
  _expand(e) {
    let collapse = this.shadowRoot.querySelector('#child-collapse-' + e.model.item.name);
    if (collapse) {
      if (collapse.opened) {
        collapse.toggle();
      }
      else {
        collapse.show();
      }
    }
  }
  _getCollapseId(item) {
    return "child-collapse-" + item.name;
  }
  _buttonTap(e) {
    let eventName = "pebble-step-action-click";
    let eventDetail = {
      name: eventName,
      data: e.model.get('item.event')
    }
    this.fireBedrockEvent(eventName, eventDetail, { ignoreId: true });
  }
  _stepStatusChanged(newValue, oldValue) {
    microTask.run(() => {
      this.toggleClass(newValue, true, this);
      this.toggleClass(oldValue, false, this);
    });
  }
  _computeDisabled() {
    if (!this.status || this.status == "pending") {
      return true;
    }
    else {
      return false;
    }
  }

  _stepdataChanged(data) {
    if (data && data.status) {
      this.status = data.status;
    }
  }
}
customElements.define(PebbleStep.is, PebbleStep)
