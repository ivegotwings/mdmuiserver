/**
<i><b>Content development is under progress... </b></i>
 @demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import '../bedrock-enums-util/bedrock-enums-util.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-datachannel/bedrock-datachannel.js';
import SharedEnumsUtil from '../bedrock-enums-util/bedrock-enums-util.js';
import '../liquid-dataobject-utils/liquid-dataobject-utils.js';
import LiquidDataObjectUtils from '../liquid-dataobject-utils/liquid-dataobject-utils.js'
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

class BedrockDataobjectNotificationHandler
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior
    ], PolymerElement) {
  static get template() {
    return html`
        <bedrock-pubsub event-name="dataobject-notification" handler="_onDataObjectNotification"></bedrock-pubsub>
        <bedrock-pubsub event-name="notification-tap" handler="_onNotificationTap"></bedrock-pubsub>
`;
  }

  static get is() { return 'bedrock-dataobject-notification-handler' }

  static get properties() {
      return {
          entityCompositeModels: {
              type: Array,
              value: [
                  "entityManageModel",
                  "entityDisplayModel",
                  "entityValidationModel",
                  "entityDefaultValuesModel"
              ]
          }
      }
  }
  /**
    * Content is not appearing - Content development is under progress.
    */
  disconnectedCallback() {
      super.disconnectedCallback();

  }
  connectedCallback() {
      super.connectedCallback();
      window.RUFEventHandlers = window.RUFEventHandlers || {};

      RUFEventHandlers.reloadClick = function (event) {
          if (event.currentTarget) {
              let appId = event.currentTarget.getAttribute('appId');
              let appElement;

              if (appId) {
                  appElement = ComponentHelper.getAppById(appId);
              } else {
                  appElement = ComponentHelper.getCurrentActiveApp();
              }

              if (appElement && appElement.refresh) {
                  appElement.refresh();
                  RUFEventHandlers.continueClick(event);
              }
          }
      };
      /**
        * Content is not appearing - Content development is under progress.
        */
      RUFEventHandlers.continueClick = function (event) {
          if (event.target) {
              let toast = this._getPebbleToast(event.target);
              if (toast) {
                  toast.close();
              }
          }
      }.bind(this);
  }

  _onDataObjectNotification(e) {
      let self = this;
      let data = e.detail;
      let actions = SharedEnumsUtil.Enums.actions;
      if (data) {
          switch (data.action) {
              case actions.SaveComplete: {
                  // clear cache
                  if (data.quickManageInfo && !_.isEmpty(data.quickManageInfo)) {
                      self._updateCache(data);
                      let dataId = data.context && data.context.id ? data.context.id : -1;
                      if (data.showNotificationToUser) {
                          self._onQuickManageSaveComplete(data);
                      }
                  } else {
                      self._fireNotificationEvent("save-complete", data);
                  }
                  break;
              }
              case actions.SystemSaveComplete:
              case actions.GovernComplete:
              case actions.ModelSaveComplete: {
                  //To avoid govern notification for quick manage save
                  // Because while saving from quick manage will trigger govern notification
                  if (data.quickManageInfo && !_.isEmpty(data.quickManageInfo)) {
                      return;
                  }
                  self._updateCache(data);
                  let dataId = data.context && data.context.id ? data.context.id : -1;
                  if (data.showNotificationToUser) {
                      self._debouncer = Debouncer.debounce(self._debouncer, timeOut.after(2000), () => {
                          self._onGovernComplete(data);
                      });
                  }
                  break;
              }
              case actions.WorkflowTransitionComplete: {
                  self._updateCache(data);
                  // There can be any number of notifications in case of transition based on govern rules, WF model.
                  // debounce of 1 second to ensure that UI doesn't get refreshed multiple times if there are many notifiations in 1 second.
                  let dataId = data.context && data.context.id ? data.context.id : -1;
                  if (data.showNotificationToUser) {
                      self._debouncer = Debouncer.debounce(self._debouncer, timeOut.after(2000), () => {
                          self._onWorkflowTransitionComplete(data);
                      });
                  }
                  break;
              }
              case actions.WorkflowAssignmentComplete: {
                  self._updateCache(data);
                  if (data.showNotificationToUser) {
                      self._onWorkflowTransitionComplete(data);
                  }
                  break;
              }
              case actions.SaveFail:
              case actions.GovernFail:
              case actions.SystemSaveFail:
              case actions.ModelSaveFail:
                  self._onSaveAndGovernFail(data);
                  break;
              case actions.WorkflowTransitionFail:
              case actions.WorkflowAssignmentFail:
                  self._onWorkflowTransitionFail(data);
                  break;
              case actions.RSConnectComplete:
                  self._onRSConnectComplete(data);
                  break;
              case actions.RSConnectFail:
                  self._onRSConnectFail(data);
                  break;
              case actions.BusinessConditionSaveComplete:
                  self._onBusinessConditionSaveComplete(data);
                  break;
              case actions.BusinessConditionSaveFail:
                  self._onBusinessConditionSaveFail(data);
                  break;
              case actions.ModelImportComplete:
                  self._onModelImportComplete(data);
                  break;
              case actions.ModelImportFail:
                  self._onModelImportFail(data);
                  break;

          }
      }
  }

  _onModelImportComplete(data) {
      if (data) {
          this._prepareParamsForTaskDetailApp(data, "success");
          let currentActiveApp = ComponentHelper.getCurrentActiveApp();
          if (currentActiveApp.id == data.appInstanceId) {
              //Introducing a delay to allow the file to get processed
              timeOut.after(ConstantHelper.MILLISECONDS_5000).run(() => {
                  ComponentHelper.fireBedrockEvent("refresh-tasklist", "", { ignoreId: true });
              });
          } else {
              this._prepareParamsForTaskDetailApp(data, "success");
              let description = "";
              if (data.taskId) {
                  description = 'Model import task ' + data.taskId + ' completed successfully.';
              } else {
                  description = 'Model import task is completed successfully.';
              }
              data.description = description;
              this._notifyUIOnBadge(data, true);
          }
      }
      return;
  }

  _onModelImportFail(data) {
      this._prepareParamsForTaskDetailApp(data, "error");
      let currentActiveApp = ComponentHelper.getCurrentActiveApp();
      if (currentActiveApp.id == data.appInstanceId) {
          ComponentHelper.fireBedrockEvent("refresh-tasklist", "", { ignoreId: true });
      } else {
          this._prepareParamsForTaskDetailApp(data, "error");
          let description = "";
          if (data.taskId) {
              description = 'Model import failed for task ID' + data.taskId + ' .';
          } else {
              description = 'Model import task is failed.';
          }
          data.description = description;
          this._notifyUIOnBadge(data, true);
      }
  }

  _updateCache(data) {
      if (data && data.context) {
          let dataObject = {
              "id": data.context.id,
              "type": data.context.type
          };

          if (!_.isEmpty(dataObject)) {
              LiquidDataObjectUtils.invalidateDataObjectCache(dataObject, data.dataIndex);

              if (data.dataIndex == "entityModel") {
                  if ((dataObject.type == "entityType" || this.entityCompositeModels.indexOf(dataObject.type) > -1)) {
                      dataObject.id = dataObject.id.replace(dataObject.type, "entityCompositeModel");
                      dataObject.type = "entityCompositeModel";

                      LiquidDataObjectUtils.invalidateDataObjectCache(dataObject, data.dataIndex);
                  }
              }
          }
      }
  }

  _onBusinessConditionSaveComplete(data) {
      if (data.context && data.tenantId) {
          if (data.context.appInstanceId) {
              let activeApp = ComponentHelper.getCurrentActiveApp();

              if (activeApp && activeApp.id == data.context.appInstanceId) {
                  ComponentHelper.fireBedrockEvent("business-condition-save-response", data, { ignoreId: true });
              } else {
                  let app = ComponentHelper.getAppById(data.context.appInstanceId);
                  if (app) {
                      let description = description = 'Some changes that you made have been verified by the system for a/an ' + data.context.type + ' with ID ' + data.context.id + '.';
                      data.description = description;
                      this._prepareParamsForEntityManageApp(data);
                      this._notifyUIOnBadge(data, false);
                  }
              }
          }
      }
  }

  _onBusinessConditionSaveFail(data) {
      let description = 'Some changes that you made have been verified by the system for a/an ' + data.context.type + ' with ID ' + data.context.id + '.';
      data.description = description;
      this._prepareParamsForEntityManageApp(data);
      this._notifyUIOnBadge(data, false);

  }

  // if app is active: auto refresh workflow panel by firing workflow-transition-complete event.
  // if app is minimized: send pebble toast with link saying wants to open entity. 
  _onWorkflowTransitionComplete(data) {
      if (data.context && data.tenantId) {
          if (data.context.appInstanceId) {
              let activeApp = ComponentHelper.getCurrentActiveApp();

              if (activeApp && activeApp.id == data.context.appInstanceId) {
                  activeApp.fireBedrockEvent("workflow-transition-complete", data, { ignoreId: true });
              } else {
                  let app = ComponentHelper.getAppById(data.context.appInstanceId);
                  if (app) {
                      data.description = data.context.workflowAction + " in " + data.context.workflowName + ": " + data.context.workflowActivityName + " has been successfully done for a/an " + data.context.type + " with ID " + data.context.id + ".";
                      this._prepareParamsForEntityManageApp(data);
                      this._notifyUIOnBadge(data, false);
                  }
              }
          }
      }
  }
  _onQuickManageSaveComplete(data) {
      if (!data.quickManageInfo) {
          return;
      }
      if (data.context && data.tenantId) {
          let isActiveApp = false;
          let isMinimizedApp = false;

          isActiveApp = this._isActiveApp(data.context.appInstanceId);
          if (!isActiveApp) {
              let app = ComponentHelper.getAppById(data.context.appInstanceId);
              if (app) {
                  isMinimizedApp = true;
              }
          }

          if (isActiveApp || isMinimizedApp) {
              let description = "";
              let actions = "";
              if (isActiveApp) {
                  // var link = "/" + data.tenantId + "/entity-manage?id=" + data.context.id + "&type=" + data.context.type;
                  description = 'Some changes that you made have been verified by the system. Do you want to refresh the page to see the changes?';
                  actions = '<div id="toast-button"><a href="#" onclick="RUFEventHandlers.reloadClick(event)" appId="' + data.context.appInstanceId + '">Reload</a></div>';
                  data.description = description + actions;
                  this._fireNotificationEvent("quick-manage-save-complete", data);
              }
          }
      }
  }
  //if app is active: send pebble toast with link saying wants to refresh entity.
  // if app is minimized: send pebble toast with link saying wants to open entity.                 
  _onGovernComplete(data) {
      if (data.context && data.tenantId) {
          let isActiveApp = false;
          let isMinimizedApp = false;

          isActiveApp = this._isActiveApp(data.context.appInstanceId);
          if (!isActiveApp) {
              let app = ComponentHelper.getAppById(data.context.appInstanceId);
              if (app) {
                  isMinimizedApp = true;
              }
          }

          if (isActiveApp || isMinimizedApp) {
              let description = "";
              let actions = "";
              if (isActiveApp) {
                  // var link = "/" + data.tenantId + "/entity-manage?id=" + data.context.id + "&type=" + data.context.type;
                  description = 'Some changes that you made have been verified by the system. Do you want to refresh the page to see the changes?';
                  actions = '<div id="toast-button"><a href="#" onclick="RUFEventHandlers.reloadClick(event)" appId="' + data.context.appInstanceId + '">Reload</a></div>';
                  data.description = description + actions;

                  if (data.action == SharedEnumsUtil.Enums.actions.ModelSaveComplete && data.processAction == "create") {
                      ComponentHelper.fireBedrockEvent("entity-model-created", { "id": data.context.id, "type": data.context.type }, { ignoreId: true });
                  } else {
                      this._fireNotificationEvent("govern-complete", data);
                      if (data && data.actionType && data.actionType == "addContext") {
                          ComponentHelper.fireBedrockEvent("contexts-added", data, { ignoreId: true });
                      }
                  }

              } else if (isMinimizedApp) {
                  description = 'Some changes that you made have been verified by the system for a/an ' + data.context.type + ' with ID ' + data.context.id + '.';
                  data.description = description;
                  this._prepareParamsForEntityManageApp(data);
                  this._notifyUIOnBadge(data, false);
              }
          }
      }

  }

  // update notification badge and notification list.
  _onSaveAndGovernFail(data) {
      if (data && data.context) {
          data.description = data.context.type + " " + data.context.id + " has some errors. Resolve.";
          this._prepareParamsForEntityManageApp(data);
          this._notifyUIOnBadge(data, false);
      }
  }

  // update notification badge and notification list.
  _onWorkflowTransitionFail(data) {
      if (data && data.context) {
          if (data && data.context) {
              data.description = data.context.type + " " + data.context.id + " could not be " + data.context.workflowAction + " in " + data.context.workflowName + ": " + data.context.workflowActivityName;
              this._prepareParamsForEntityManageApp(data);
              this._notifyUIOnBadge(data, false);
          }
      }
  }
  _onRSConnectEntityModelImportComplete(data) {
      let currentActiveApp = ComponentHelper.getCurrentActiveApp();
      if (currentActiveApp.id == data.appInstanceId) {
          ComponentHelper.fireBedrockEvent("refresh-tasklist", "", { ignoreId: true });
      }

      return;

      //code will not excute for now it for now:Todo
      // eslint-disable-next-line no-unreachable
      this._prepareParamsForTaskDetailApp(data, "success");
      let appName = data.paramData.appName;
      let appParams = data.paramData.params;

      if (appName && appParams) {
          let description = "";
          let actions = "";
          if (this._isAppOpened(appName, appParams)) {
              description = 'Model import task is completed successfully. Click on reload';
              actions = '<div id="toast-button"><a href="#" onclick="RUFEventHandlers.reloadClick(event)">Reload</a></div>';
              data.description = description + actions;
              this._sendToast(data);
          } else {
              if (data.taskId) {
                  description = 'Model import task ' + data.taskId + ' completed successfully.';
              } else {
                  description = 'Model import task is completed successfully.';
              }
              data.description = description;
              this._notifyUIOnBadge(data, true);
          }
      }
  }

  _onRSConnectDownloadComplete(data) {
      this._prepareParamsForTaskDetailApp(data, "success");

      let appName = data.paramData.appName;
      let appParams = data.paramData.params;

      if (appName && appParams) {
          let description = "";
          let actions = "";
          if (this._isAppOpened(appName, appParams)) {
              description = 'File for this task is ready for download. Click on reload';
              actions = '<div id="toast-button"><a href="#" onclick="RUFEventHandlers.reloadClick(event)">Reload</a></div>';

              data.description = description + actions;
              this._sendToast(data);
          } else {
              if (data.taskId) {
                  description = 'File for task ' + data.taskId + ' is ready for download.';
              } else {
                  description = 'File is ready for download.';
              }
              data.description = description;
              this._notifyUIOnBadge(data, true);
          }
      }
  }

  _onRSConnectComplete(data) {
      if (data && data.type && data.type == 'entityModel') {
          this._onRSConnectEntityModelImportComplete(data);
      } else {
          this._onRSConnectDownloadComplete(data);
      }
      //incase needs to do some other stuff.
      this._fireNotificationEvent("rsConnnect-complete", data);
  }

  _onRSConnectFail(data) {
      this._prepareParamsForTaskDetailApp(data, "error");

      let appName = data.paramData.appName;
      let appParams = data.paramData.params;

      if (appName && appParams) {
          let description = "";
          let actions = "";
          if (this._isAppOpened(appName, appParams)) {
              description = 'This task is completed with error(s). Click on reload for more details.';
              actions = '<div id="toast-button"><a href="#" onclick="RUFEventHandlers.reloadClick(event)">Reload</a></div>';

              data.description = description + actions;
              this._sendToast(data);
          } else {
              description = 'Task ' + data.taskId + ' is completed with error(s).';
              data.description = description;
              this._notifyUIOnBadge(data, true);
          }
      }

      //incase needs to do some other stuff
      this._fireNotificationEvent("rsConnnect-fail", data);
  }

  //if app is active: fire event with given event name for active app.
  _fireNotificationEvent(eventName, data) {
      if (data.context && data.context.appInstanceId) {
          let activeApp = ComponentHelper.getCurrentActiveApp();
          if (activeApp && activeApp.id && activeApp.id == data.context.appInstanceId) {
              activeApp.fireBedrockEvent(eventName, data, { ignoreId: true });
          }
      }
  }

  // update notification badge and notification list.
  _notifyUIOnBadge(data, isSystem) {
      let appCommon = RUFUtilities.appCommon;

      if (!appCommon) {
          return;
      }

      let notificationElement, notificationLabelElement;

      this._userNotificationsList = this._userNotificationsList || RUFUtilities.userNotificationsList;
      this._mdmUserNotifications = this._mdmUserNotifications || RUFUtilities.mdmUserNotifications;
      notificationElement = this._userNotificationsList;
      notificationLabelElement = this._mdmUserNotifications;

      if (!notificationElement) {
          return;
      }

      if (notificationElement) {
          let notifications = notificationElement.notifications;
          notificationElement.notifications = [];

          notifications.unshift({
              src: data.source || '',
              alt: data.alt || '',
              when: moment(data.timestamp).format("DD MMM YYYY hh:mm a") || '',
              desc: data.description || '',
              data: data.paramData
          });

          notificationElement.notifications = notifications;
          notificationElement.notifyPath("notifications", notificationElement.notifications.slice());

          if (notificationLabelElement) {
              notificationLabelElement.label += 1;
          }
      }
  }

  _isActiveApp(id) {
      let active = false;
      if (id) {
          let activeApp = ComponentHelper.getCurrentActiveApp();
          if (activeApp) {
              if (id == activeApp.id) {
                  active = true;
              }
          }
      }
      return active;
  }

  showToast(data) {
      if (data) {
          this._sendToast(data);
      }
  }

  _sendToast(data) {
      let appCommon = RUFUtilities.appCommon;

      if (!data || !appCommon) return;

      this._pebbleToastElement = this._pebbleToastElement || appCommon.shadowRoot.querySelector('#dataobject-notification-toast');

      if (!this._pebbleToastElement) {
          let pebbleToastEle = customElements.get("pebble-toast");
          this._pebbleToastElement = new pebbleToastEle();
          this._pebbleToastElement.setAttribute('id', 'dataobject-notification-toast');
          appCommon.root.appendChild(this._pebbleToastElement);
      }

      if (this._pebbleToastElement && !this._pebbleToastElement.opened) {
          let uniqueId = "";
          if (data.context && data.context.id) {
              uniqueId = data.context.id;
          } else if (data.taskId) {
              uniqueId = data.taskId;
          }

          this._pebbleToastElement.uniqueId = uniqueId;
          this._pebbleToastElement.innerHTML = data.description;
          this._pebbleToastElement.toastType = data.status;
          this._pebbleToastElement.alignToast = "top";
          this._pebbleToastElement.toastDuration = 25000;
          this._pebbleToastElement.autoClose = true;
          this._pebbleToastElement.show();
      }
  }

  _getPebbleToast(component) {
      let parentElement = component.parentElement;
      let pebbleToast = customElements.get('pebble-toast');
          
      if (pebbleToast && pebbleToast!== "undefined" && parentElement instanceof pebbleToast) {
          return parentElement;
      } else {
          return this._getPebbleToast(parentElement);
      }
  }

  _onNotificationTap(e, detail) {
      let appId = detail.appId;
      let appName = detail.appName;
      let params = detail.params;

      if (appId) {
          let appElement = ComponentHelper.getAppById(appId);
          if (appElement && appElement.refresh) {
              appElement.refresh();
          }
      } else {
          let viewName = ComponentHelper.getViewNameWithQueryParams(params, appName);
          let appElement = ComponentHelper.getContentViewByName(viewName);

          if (appElement) {
              const firstChild = appElement.$.content.firstElementChild;

              if (firstChild && typeof firstChild.refresh === 'function') {
                  firstChild.refresh();
              }
          }
      }

      ComponentHelper.appRoute(appName, params);

      let appCommon = RUFUtilities.appCommon;

      if (!appCommon) {
          return;
      }

      this._userNotificationElementPopover = this._userNotificationElementPopover || RUFUtilities.popoverUserNotifications;

      if (this._userNotificationElementPopover) {
          this._userNotificationElementPopover.hide();
      }
  }

  _prepareParamsForEntityManageApp(data) {
      if (data && data.context) {
          data.paramData = {
              "params": {
                  "id": data.context.id,
                  "type": data.context.type
              },
              "appId": data.context.appInstanceId,
              "appName": "entity-manage"
          };
      }
  }

  _prepareParamsForTaskDetailApp(data, msgType) {
      if (data) {
          data.paramData = {
              "params": {
                  "id": data.taskId
              },
              "appName": "task-detail",
              "type": msgType
          };
      }
  }

  _isAppOpened(appName, params) {
      let mainApp = RUFUtilities.mainApp;
      if (mainApp && mainApp.pageRoute) {
          let pageRoute = mainApp.pageRoute;

          if (pageRoute.path.indexOf(appName) >= 0) {
              let utils = SharedUtils.DataObjectFalcorUtil;
              if (utils.compareObjects(params, pageRoute.__queryParams)) {
                  return true;
              } else {
                  return false;
              }
          } else {
              return false;
          }
      }
      return false;
  }
}
customElements.define(BedrockDataobjectNotificationHandler.is, BedrockDataobjectNotificationHandler)
