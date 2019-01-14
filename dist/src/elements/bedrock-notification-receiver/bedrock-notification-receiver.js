/**
`bedrock-notification-receiver` creates the 
client connection to send or receive the notification message for either all users or a specific user.

It reads the server details of where the notification engine is running from the `src/data/config.js` file and generates 
the client's connection for the communication with the server.

After adding this component, you must use the function `window.globalFunctions.getClientSocket();` to get the current running socket 
in the current window tab of the browser.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-ajax/iron-ajax.js';
import '../bedrock-externalref-socketio/bedrock-externalref-socketio.js';
import '../bedrock-enums-util/bedrock-enums-util.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
window._clientSocket = null
class BedrockNotificationReceiver extends mixinBehaviors([
    RUFBehaviors.UIBehavior
], PolymerElement) {
  static get template() {
    return html`

`;
  }

  static get is() { return 'bedrock-notification-receiver' }

  static get properties() {
      return {
          /*
          * Indicates the `serverConfig` object that contains the host and port details where the notification engine is hosted.
          */
          serverConfig: {
              type: Object,
              notify: true,
              value: function () {
                  return {};
              },
              observer: '_init'
          }
      }
  }

  _init() {
      let self = this;

      let socketServerUrl = window.location.origin;

      let connectionOptions = {
          "force new connection": true,
          "reconnection": true,
          "reconnectionDelay": 2000,                  //starts with 2 secs delay, then 4, 6, 8, until 60 where it stays forever until it reconnects
          "reconnectionDelayMax": 60000,             //1 minute maximum delay between connections
          "reconnectionAttempts": "Infinity",         //to prevent dead clients, having the user to having to manually reconnect after a server restart.
          "timeout": 10000,                           //before connect_error and connect_timeout are emitted.
          "transports": ["websocket", "polling"]     //forces the transport to be only websocket as priority. Server needs to be setup as well/
      }

      self._debouncer = Debouncer.debounce(self._debouncer, timeOut.after(15000), () => {
          //console.log('initializing socket connection to the path ', JSON.stringify(socketServerUrl));
          self._clientSocket = io.connect(socketServerUrl, connectionOptions);
          //self._clientSocket = io.connect(socketServerUrl);
          
          self._clientSocket.on('connect', function () {
              let userInfo = {
                  "userId": DataHelper.getUserId(),
                  "tenantId": DataHelper.getTenantId()
              }
              //console.log("Transport being used: " + self._clientSocket.io.engine.transport.name);
              //console.log("fired from client to reset: " + self._clientSocket.id + " user id" + userId);
              self._clientSocket.emit('Connect new user', userInfo);
          });

          self._clientSocket.on("new message", function (data) {
              //console.log('notification received from server ', JSON.stringify(data));

              let mainApp = RUFUtilities.mainApp;
              if (mainApp) {
                  let dataObjectNotificationHandler = mainApp.$$('bedrock-dataobject-notification-handler');
                  if (dataObjectNotificationHandler) {
                      dataObjectNotificationHandler.fireBedrockEvent("dataobject-notification", data, { ignoreId: true });
                  }
              }
          }.bind(self));

      });


      window.globalFunctions = window.globalFunctions || {};
      globalFunctions.getClientSocket = function () {
          return self._clientSocket;
      }

  }
}
customElements.define(BedrockNotificationReceiver.is, BedrockNotificationReceiver)
