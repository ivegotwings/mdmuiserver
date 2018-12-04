import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-toast-behavior/bedrock-toast-behavior.js';
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
          }
      }
  }
  disconnectedCallback() {
      super.disconnectedCallback();
  }


  connectedCallback() {
      super.connectedCallback();
      timeOut.after(this.timeout).run(() => {
          if (!this.isLoaded) {
              ComponentHelper.fireBedrockEvent('iframe-load-failed', {}, {ignoreId: true});
          }
      });
  }

  onLoad() {
      if(this.source && !window.postMessageAttached){
          let tempAnchorTag = document.createElement('a');
          tempAnchorTag.href = this.source;
          if(tempAnchorTag.origin){
              let crossDomain = tempAnchorTag.origin;
              window.addEventListener('message', (ev) => {
                  if(ev.origin != crossDomain){
                      return;
                  }
                  if(!_.isEmpty(ev.data)){
                      let eventData = ev.data;
                      if(eventData.page){
                          if(!_.isEmpty(eventData.data)){
                              ComponentHelper.appRoute(eventData.page, eventData.data);
                          }else if(!_.isEmpty(eventData.filterData)){
                              this.redirectToSearch(eventData.page, eventData.filterData);
                          }else{
                              this.showErrorToast("Please select filter");
                          }
                      }
                  }
                  window.postMessageAttached = true;
              }, false);
          }
          tempAnchorTag = null;
      }
      ComponentHelper.fireBedrockEvent('iframe-load-success', {}, {ignoreId: true});
      this.isLoaded = true;
  }

  redirectToSearch(page, filterData){
      if(!_.isEmpty(filterData)){
          let mappedContexts = [];
          if(!_.isEmpty(filterData.locales) && !_.isEmpty(filterData.sources)){
              filterData.locales.forEach(locale => {
                  filterData.sources.forEach(source => {
                      if(source.internal && locale.internal){
                          let valueContext = {
                              source:source.internal,
                              locale:locale.internal
                          }   
                          mappedContexts.push(valueContext);
                      }
                  })
              });
              filterData.mappedContextsString = JSON.stringify(mappedContexts);
              delete filterData.locales;
              delete filterData.sources;
          }
          //Workflow
          if(!_.isEmpty(filterData.workflowNames)){
              if(filterData.workflowNames.length == 1){
                  if(_.isEmpty(filterData.workflowActivityNames)){
                      this.showWarningToast('Please select workflow activity');
                      return;
                  }
                  let currentWorkflow = filterData.workflowNames[0];
                  filterData.wfName = currentWorkflow.external;
                  filterData.wfShortName = currentWorkflow.internal;
                  delete filterData.workflowNames;
              }
          }
          if(!_.isEmpty(filterData.workflowActivityNames)){
              if(_.isEmpty(filterData.wfName)){
                  this.showWarningToast('Please select workflow.');
                  return;
              }
              let activity = filterData.workflowActivityNames[0];
              filterData.wfActivityExternalName = activity.external;
              filterData.wfActivityName = activity.internal;
              delete filterData.workflowActivityNames;
          }

          //Attributes
          if(!_.isEmpty(filterData.attributes)){
              let attributes = {};
              filterData.attributes.forEach( attr => {
                  attributes[attr.internal] = attr.values;
              })
              delete filterData.attributes;
              filterData.attributes = attributes;
          }

          this.setState(filterData);
          let encodedData = {state: this.getQueryParamFromState()};
          ComponentHelper.appRoute(page, encodedData);
      }
  }

  refresh() {
      this.isLoaded = false;
  }

  logout() {
      let logoutUrl = this.source.substring(0,this.source.indexOf('app'));
      this.shadowRoot.querySelector('iframe').contentWindow.postMessage({logout: true}, logoutUrl);
  }
}
customElements.define(PebbleIframe.is, PebbleIframe);
