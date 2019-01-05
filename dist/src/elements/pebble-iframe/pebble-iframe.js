import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-toast-behavior/bedrock-toast-behavior.js';
import '../pebble-dialog/pebble-dialog.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleIframe extends 
    mixinBehaviors([
        RUFBehaviors.UIBehavior,
        RUFBehaviors.ToastBehavior,
    ], PolymerElement){
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-scroll-bar bedrock-style-common">
            :host {
                height: 100%;
                display: block;
            }

            .wrapper {
                width: 100%;
                height: 100%;
                margin: 0 auto;
                overflow: auto;
            }

            .intrinsic-container {
                position: relative;
                height: 0;
                overflow: hidden;
            }

            /* 16x9 Aspect Ratio */

            .intrinsic-container-16x9 {
                padding-bottom: 56.25%;
            }

            /* 4x3 Aspect Ratio */

            .intrinsic-container-4x3 {
                padding-bottom: 75%;
            }
            
            .intrinsic-container iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
            }
            iframe{
                @apply --app-external-dashboard-inner-content-height;
            }
        </style>
        <div class="wrapper">
            <div class="h_iframe">
                <div class="intrinsic-container intrinsic-container-16x9">
                    <iframe onload="{{onLoad()}}" src="[[source]]" sandbox="[[restrictions]]" frameborder="0"></iframe>
                </div>
            </div>
        </div>
        <pebble-dialog id="confirmationDialog" dialog-title="Confirmation" modal="" alert-box="" show-cancel="" show-ok="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
            <p>Are you sure you want to delete?</p>
        </pebble-dialog>
        <bedrock-pubsub event-name="on-buttonok-clicked" handler="_onConfirm" target-id="confirmationDialog"></bedrock-pubsub>
        <bedrock-pubsub event-name="on-buttoncancel-clicked" handler="_onCancel" target-id="confirmationDialog"></bedrock-pubsub>
        
        <bedrock-pubsub event-name="iframe-open-dialog" handler="_openDialog"></bedrock-pubsub>
        
        <bedrock-pubsub on-bedrock-event-user-logout="logout" name="bedrock-event-user-logout"></bedrock-pubsub>
`;
  }

  static get is() {
      return "pebble-iframe";
  }
  static get properties() {
      return {
          source: {
              type: String,
              value: ''
          },
          restrictions: {
              type: String,
              value: 'allow-forms allow-scripts allow-popups allow-same-origin allow-modals'
          },
          timeout: {
              type: Number,
              value: 1
          },
          isLoaded: {
              type: Boolean,
              value: false
          },
          _externalData:{
              type:Object,
              value:function(){
                  return {}
              }
          }
      }
  }
  disconnectedCallback() {
      super.disconnectedCallback();
  }


  connectedCallback() {
      super.connectedCallback();
      timeOut.after(this.timeout).run(() => {
          if (this.isLoaded) {
              APIExternalCommunication.getInstance().iframeRegister(this.source);
          }else{
              ComponentHelper.fireBedrockEvent('iframe-load-failed', {}, {ignoreId: true});
          }
      });
  }

  onLoad() {
      ComponentHelper.fireBedrockEvent('iframe-load-success', {}, {ignoreId: true});
      this.isLoaded = true;
  }

  refresh() {
      this.isLoaded = false;
  }

  logout() {
      let logoutUrl = this.source.substring(0,this.source.indexOf('app'));
      this.shadowRoot.querySelector('iframe').contentWindow.postMessage({logout: true}, logoutUrl);
  }
  _openDialog(ev){
      this.set("_externalData", {});
      if(ev.detail && ev.detail.message){
          let confirmationDialog = this.shadowRoot.querySelector("#confirmationDialog");
          if(confirmationDialog){
              confirmationDialog.innerHTML = '<p>'+ev.detail.message+'</p>';
              if(ev.detail.showOk){
                  confirmationDialog.showOk = true;
              }else{
                  confirmationDialog.showOk = false;
              }
              if(ev.detail.data){
                  this.set("_externalData", ev.detail.data);
              }
              confirmationDialog.open();
          }
      }
  }
  _onConfirm(event){
      if(!_.isEmpty(this._externalData)){
          let clonedData = DataHelper.cloneObject(this._externalData);
          APIExternalCommunication.getInstance().redirectToSearch(clonedData);
          this.set("_externalData", {});
      }
  }
  _onCancel(){
      this.set("_externalData", {});
  }
}
customElements.define(PebbleIframe.is, PebbleIframe);
