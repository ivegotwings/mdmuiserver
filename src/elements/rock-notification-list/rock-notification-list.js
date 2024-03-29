/**
`<rock-notification-list>` Represents an element that displays all the notifications as a list.

### Example

    <rock-notification-list notifications="jsonData" show-line-index="1"></rock-notification-list>

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--notification-image-size` | The notification image width and height | 40px
`--notification-item-max-width` | The notification item max width | `250px`
`--notification-item-max-height` | The notification item max height | `60px`
`--notification-item-padding` | The notification item padding | `2px`
`--notification-font-size` | The notification item font size | `12px`
`--notification-margin-bottom` | The notification item bottom margin | `10px`
`--notification-container-styles` | Mixin applied to the notification item container | `{}`
`--image-box-styles` | Mixin applied to the image box | `{}`
`--when-box-styles` | Mixin applied to the when box | `{}`
`--desc-box-styles` | Mixin applied to the description box | `{}`
`--profile-flex-verticle-max-width` | The notification "when" and "description" items verticle max width | `180px`

@group rock Elements
@element rock-notification-list
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-heading.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../pebble-image-viewer/pebble-image-viewer.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-button/pebble-button.js';
import '../pebble-horizontal-divider/pebble-horizontal-divider.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockNotificationList
  extends mixinBehaviors([RUFBehaviors.UIBehavior
  ], PolymerElement) {
  static get template() {
    return html`
    <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-heading bedrock-style-icons">      
      /*For sizing the image*/      
      .thumb-image {
        width: var(--notification-image-size, 40px);
        height: var(--notification-image-size, 40px);
      }      
      
      /*Profile container style*/      
      .container {
        @apply --notification-container-styles;
        padding: 5px 20px;
        position:relative;
        cursor: pointer;
      }

      /*For Image*/      
      .img-box {
        width: var(--notification-image-box-width, 16px);
        @apply --image-box-styles;
      }

      /*For Name*/      
      .when-box {
        color: var(--notification-when-color, #928d8d);
        @apply --when-box-styles;
        display: inline-block;
        font-size: 12px !important;
        margin-right: -7px;
        margin-top: 5px;
      }

      /*For Description*/
      .notification-container {
        width: calc(100% - 20px);
      }
      
      .desc-box {
        color: var(--notification-desc-color, #000000);
        display: inline-block;
        vertical-align: middle;
        text-align: left;
        line-height: 20px;
        padding-top: 4px;
        float: left;
      }

      /*Notification horizontal div styles*/      
      .flex-horizontal {
        @apply --layout-horizontal;
      }

      /*Notification content style*/      
      .box {
        display: flex;
        display: -webkit-flex;
        justify-content: left;
        -webkit-justify-content: left;
        align-items: start;
        -webkit-align-items: start;
        align-content: left;
        -webkit-align-content: left;
        font-size: 14px;
        line-height: 25px;
        margin-right: 10px;
        margin-top:5px;
      }
      
      pebble-horizontal-divider {
        background-color: var(--palette-pale-grey-three, #e7ebf0);
        margin-right: 20px;
        margin-left: 20px      
      }
     
      .btn {
        float: right;
        font-size: 12px;
        line-height: 1.5;
        color: var(--palette-cerulean, #036bc3);
        padding: 5px 20px 10px 20px;
      }

      .btn {
        --pebble-button:{
        padding-top: 0px;
        padding-right: 0px;
        padding-bottom: 0px;
        padding-left: 0px;
        font-weight: normal;
      } 
    }

      .popup-title{
        margin-right: 20px;
        margin-left: 20px;
      }  

      p.notification-msg{
        text-align: left;
        margin:0 !important;
        padding:5px 20px;
        font-size: var(--default-font-size, 14px);
        color: var(--toast-font-color, #4b4e51);
      }

      ul.notification-msgs{
        text-align: left;        
        margin:0 !important;
        font-size: var(--default-font-size, 14px);
        color: var(--toast-font-color, #4b4e51);
      }
      
      ul.notification-msgs li{
        font-size: var(--default-font-size, 14px);
        font-family: var(--default-font-family);
        color: var(--toast-font-color, #4b4e51);
        list-style-type: disc;
      }
      .scroller{
        max-height:360px;
        overflow-y: auto;
        overflow-x:auto;
        display:block;
      }
      .container.flex-horizontal:hover {
          background-color: var(--bgColor-hover, #e8f4f9);
          color: var(--focused-line, #026bc3);
        }
    </style>
    <template is="dom-if" if="{{!_isNotificationAvailable(notifications)}}">
      <h4 class="popup-title default-message">You don't have any notifications yet.</h4>
      <p class="notification-msg">New notifications will appear here when:</p>
      <ul class="notification-msgs">
        <li>You are assigned new tasks as per workflow processes</li>
        <li>Items you are working on have errors/warnings</li>
        <li>Other users share tasks/content with you</li>
      </ul>
    </template>
    <template is="dom-if" if="{{_isNotificationAvailable(notifications)}}">
      <div class="scroller">
      <template is="dom-repeat" items="{{notifications}}">
        <template is="dom-if" if="[[_showLine(index)]]"></template>
        <div class="container flex-horizontal" data="[[item.data]]" on-tap="_onNotificationTap">
          <!-- Image section -->
          <div class="img-box box">
            <pebble-icon icon="[[_getIcon(item)]]" class="[[_getClass(item)]]"></pebble-icon>
          </div>
          <!-- when & description section -->
          <div class="notification-container">
            <div class="desc-box">
              [[item.desc]]
            </div>
            <div class="when-box">
              [[item.when]]
              <pebble-icon icon="pebble-icon:action-scope-take-selection" class="pebble-icon-size-16"></pebble-icon>
            </div>            
          </div>
        </div>
        <pebble-horizontal-divider></pebble-horizontal-divider>
      </template>
      </div>
      <div>
        <pebble-button class="btn btn-link m-b-10" button-text="CLEAR ALL" on-tap="_onClearNotifications">
        </pebble-button>
      </div>
    </template>
`;
  }

  static get is() {
    return 'rock-notification-list';
  }

  static get properties() {
    return {
      notifications: {
        type: Array,
        notify: true,
        value: []
      },

      /*
       *  Indicates an index to show a line above the specified item.
      */
      showLineIndex: {
        type: Number,
        value: -1
      }
    }
  }

  /**
   *  Indicates the list of notifications in the JSON format.
  */
  _showLine (index) {
    return index == this.showLineIndex;
  }

  _isNotificationAvailable (notifications) {
    if (notifications.length) {
      return true
    }
    return false;
  }

  _onClearNotifications () {
    this.notifications = [];
    let appCommon = RUFUtilities.appCommon;
    if (appCommon) {
      let notificationBadge = appCommon.shadowRoot.querySelector('rock-notification');

      if (notificationBadge) {
        notificationBadge.label = 0;
      }
    }
  }

  _onNotificationTap (e) {
    let mainApp = RUFUtilities.mainApp;
    if (mainApp) {
      let dataObjectNotificationHandler = mainApp.shadowRoot.querySelector('bedrock-dataobject-notification-handler');
      if (dataObjectNotificationHandler) {
        dataObjectNotificationHandler.fireBedrockEvent("notification-tap", e.currentTarget.data, { ignoreId: true, isMainApp: true });
      }
    }
    // this.fireBedrockEvent("notification-tap", e.currentTarget.data, { ignoreId: true, isMainApp: true });
  }
  _getClass (item) {
    let className = "pebble-icon-size-16";

    if(item && item.data && item.data.type) {
        if(item.data.type == "success") {
          className += " pebble-icon-color-success";
        } else if (item.data.type == "error") {
          className += " pebble-icon-color-error";
        } else if (item.data.type == "information") {
          className += " pebble-icon-color-warning";
        }
    }
    return className;
  }

  _getIcon (item) {
    let icon = "pebble-icon:comment";

    if(item && item.data && item.data.type) {
        if(item.data.type == "success") {
          icon = "pebble-icon:goveranance-success";
        } else if (item.data.type == "error") {
          icon = "pebble-icon:governance-failed";
        } else if (item.data.type == "information") {
          icon = "pebble-icon:notification-error";
        }
    }

    return icon;
  }
}
customElements.define(RockNotificationList.is, RockNotificationList)
