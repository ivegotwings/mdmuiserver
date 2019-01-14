import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-helpers/constant-helper.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../rock-entity-model-lov/rock-entity-model-lov.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-spinner/pebble-spinner.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockUserSelector extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-padding-margin bedrock-style-buttons">
            .lov-wrapper{
                width: 100%;
                text-align: center;
            }
            .lov-container{
                width:460px;
                display:inline-block;
                padding: 20px;
                margin: 10px 0 0 10px;
                box-shadow: 1px 2px 5px -1px var(--default-border-color, #c1cad4);
                border: var(--box-style_-_border,solid 1px var(--default-border-color, #c1cad4));
                border-radius: var(--box-style_-_border-radius);
            }
        </style>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <div class="lov-wrapper">
            <div class="lov-container">
                <template is="dom-if" if="[[_isUserModelRequestPrepared(_userModelRequestData)]]">
                    <rock-entity-model-lov id="userModelLOV" readonly="[[readonly]]" id-field="id" title-pattern="{entity.properties.firstName}" sub-title-pattern="{entity.properties.email}" request-data="[[_userModelRequestData]]" selected-item="{{userToBeAssigned}}" external-data-formatter="[[_userDataFormatter]]" no-popover="true" deleted-items-count="[[deletedUsersCount]]"></rock-entity-model-lov>
                </template>
            </div>
        </div>
        <div id="buttonContainer" class="buttonContainer-static">
            <pebble-button id="cancelButton" class="btn btn-secondary m-r-5" button-text="Cancel" on-tap="_onCancelTap" elevation="1" raised=""></pebble-button>
            <pebble-button id="assign" class="focus btn btn-success" button-text="Confirm" on-tap="_confirm" elevation="1" raised=""></pebble-button>
        </div>
`;
  }

  static get is() { return 'rock-user-selector' }

  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _userModelRequestData:{
              type:Object,
              value:function(){
                  return {}
              }
          },
          userToBeAssigned:{
              type:Object,
              value:function(){
                  return {}
              }
          },
          allowedRoles: {
              type:Array,
              value:function(){
                  return [];
              }
          },
          currentUser: {
              type: String,
              value: ""
          },
          _userDataFormatter: {
              type: Object,
              value: function () {
                  return this._userDataFormatter.bind(this);
              }
          },
          workflowName: {
              type: String,
              value: ""
          },
          /**
          * Represents workflow external name
          */
          workflowExternalName: {
              type: String,
              value: ""
          },
          /**
          * Represents workflow activity name
          */
          workflowActivityName: {
              type: String,
              value: ""
          },
          /**
          * Represents workflow activity external name
          */
          workflowActivityExternalName: {
              type: String,
              value: ""
          },
          assignmentAction: {
              type: String,
              value: ""
          },
          deletedUsersCount: {
              type: Number,
              value: 0
          },
          workflowContext: {
              type: Object,
              value: function () {
                  return {};
              }
          }
      }
  }

  connectedCallback() {
      super.connectedCallback();
      if(this.assignmentAction !== "reassign") {
          let loggedUser = ContextHelper.getFirstUserContext(this.contextData);
          let loggedUserId = "";
          if(loggedUser && loggedUser.user){
              this.set("userToBeAssigned", loggedUser.user);
          }

          this._confirm();
      } else {
          this._prepareUserModelRequest();
      }
  }

  _isUserModelRequestPrepared(){
      if(this._userModelRequestData && !_.isEmpty(this._userModelRequestData)){
          return true;
      }
      return false;
  }

  _prepareUserModelRequest(){
      let req = DataRequestHelper.createGetModelRequest("user");
      let activityAllowedRoles = this.allowedRoles;

      if(activityAllowedRoles && activityAllowedRoles.length > 0){
          req.params.query.filters["propertiesCriterion"] = [{
              "roles": {
                  "exacts": activityAllowedRoles
              }
          }]
      };

      req.params["sort"] = {
          "properties": [
              {
                  "firstName": "_ASC",
                  "sortType": ConstantHelper.getDataTypeConstant("string")
              }
          ]
      }
      delete req.params.fields.attributes;
      delete req.params.fields.relationships;
      delete  req.params.query.ids;
      req.params.fields.properties = ["_ALL"];
      this.set("_userModelRequestData", req);
  }

  _userDataFormatter(formattedData, data){
      //Filter current assigned user
      let assingedUser = this.currentUser;
      this.deletedItemsCount = 0;
      let loggedUser = ContextHelper.getFirstUserContext(this.contextData);
      let loggedUserId = "";
      if (loggedUser && loggedUser.user) {
          loggedUserId = loggedUser.user;
      }
      if (formattedData && formattedData.length > 0) {
          formattedData = formattedData.filter((user) => {
              //Get firstname & lastname
              let userData = data.filter((eModel) => { return eModel.id == user.id; });
              if (userData && userData.length > 0 && userData[0].properties) {
                  let userProperties = userData[0].properties
                  if (userProperties.firstName) {
                      user.title = userProperties.firstName
                  } else {
                      user.title = "";
                  }
                  if (userProperties.lastName) {
                      user.title += " " + userProperties.lastName
                  }
              }

              let userId = user.id.replace("_user", "");
              return (userId != assingedUser) && loggedUserId && (loggedUserId != user.id);
          });
      }
      this.deletedUsersCount = data.length - formattedData.length; 
      return formattedData;
  }

  _confirm(){
      if(this.userToBeAssigned && !_.isEmpty(this.userToBeAssigned)){
          this._loading = false;
          let eventName = "onNext";
          let eventDetail = {
              name: eventName,
              data: {}
          }

          this.fireBedrockEvent(eventName, eventDetail, {
              ignoreId: true
          });
      } else{
          this.showWarningToast("Select at least one user.");
      }
  }

  _onCancelTap(){
      let eventName = "onCancel";
      this.fireBedrockEvent(eventName, {}, {
          ignoreId: true
      });
  }
}

customElements.define(RockUserSelector.is, RockUserSelector);
