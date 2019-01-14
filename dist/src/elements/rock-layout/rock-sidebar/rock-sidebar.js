/**
`<rock-sidebar>` Represents a sidebar layout structure inside rock-layout. 
This element is a child of `<rock-layout>` element.

For example:

    <rock-layout>
        <rock-header>
            sidebar content . . .
        </rock-header>
        main layout content . . .
    </rock-layout>

It can contian any elements or components.

@demo ../demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '@polymer/paper-item/paper-item.js';
import '../../bedrock-style-manager/styles/bedrock-style-common.js';
import '../../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../../bedrock-style-manager/styles/bedrock-style-gridsystem.js';
import '../../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../../bedrock-pubsub/bedrock-pubsub.js';
import '../../pebble-icons/pebble-icons.js';
import '../../pebble-icon/pebble-icon.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockSidebar
    extends mixinBehaviors([
        RUFBehaviors.UIBehavior
    ], PolymerElement) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-gridsystem bedrock-style-icons">
            :host {
                display: -webkit-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: flex;
                height: auto; 
                position:relative;
                width: 30%;
                -webkit-transition: all .5s linear;
                transition: all .5s linear;  
                --accordion-header-text:{
                    white-space: nowrap;
                }     
            }
            
            #rockSidebarContainer {
                height: 100%;
                width: 100%;
                border-left: thin solid #D8DDE4;
                font-size: var(--default-font-size, 14px);
            }
            
            @media only screen and (max-width: 768px) {
                :host {
                    width: 100%;
                }
            }
            .toggle-area-outside{
                background: transparent;
                height: 100%;
                position: absolute;
                z-index: 1;
                width: 1px;
                left:0px;
                display: flex;
                align-items: center;
            }
            .toggle-area{
                position: absolute;
                left: 0px;
                width:20px;
                height: 42px;
                display: -ms-flexbox;
                display: -webkit-box;
                display: -webkit-flex;
                left:-19px;
            }
            .icon-wrapper{
                background: var(--palette-pale-grey,#e6ebf0);
                border-top-right-radius: 100px;
                border-bottom-right-radius: 100px;
                line-height: 42px;
                width: 100%;
                cursor: pointer;
                min-width: 20px;
            }
            
            :host(.collapse) .toggle-area .leftIcon{
                border-top-right-radius: 0px;
                border-bottom-right-radius: 0px;
                border-top-left-radius: 100px;
                border-bottom-left-radius: 100px;
                opacity:1;
                -webkit-transition: all .5s linear; 
                transition: all .5s linear;
            }
            :host(.collapse) .toggle-area .leftIcon pebble-icon{
                margin-left:5px;
            }
            .leftIcon{
                opacity: 0; 
            }
            :host(.collapse){
                -webkit-transition: all .5s linear;
                transition: all .5s linear;
                margin-right:-30%;
                --rock-sidebar-contents:{
                    display: none;
                }
            }
           
        </style>        
        <div id="rockSidebarContainer">  
            <template is="dom-if" if="[[collapsable]]">
                <div class="toggle-area-outside">
                    <div class="toggle-area">
                        <div class="icon-wrapper leftIcon" on-tap="_moveLeft">
                            <pebble-icon icon="pebble-icon:action-scope-release-selection" class="pebble-icon-size-12"></pebble-icon>
                        </div>
                        <div class="icon-wrapper rightIcon" on-tap="_moveright">
                            <pebble-icon icon="pebble-icon:action-scope-take-selection" class="pebble-icon-size-12"></pebble-icon>
                        </div>
                    </div>
                </div>
            </template>          
            <slot></slot>
        </div>
        <bedrock-pubsub event-name="collapse-sidebar" handler="_moveright"></bedrock-pubsub>
`;
  }

  static get is() { return 'rock-sidebar' }
  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              },
              observer: '_onContextDataChange'
          },

          position: {
              type: String
          },

          /*
          * Indicates width of sidebar on layout screen.
          * It can be `half` or `quarter`.
          */
          width: {
              type: String,
              value: "quarter"
          },
          collapse: {
              type: Boolean,
              value: false
          },
          collapsable: {
              type: Boolean,
              value: false
          }
      }
  }

  /*
  * Indicates position of sidebar in rock-layout like, `left` or `right` 
  */
  connectedCallback() {
      super.connectedCallback();
      let parentContainer = dom(this).parentNode.$.container;
      
      if(this.position == "left")
      {
          parentContainer.style.flexDirection = 'row-reverse';
          this.$.rockSidebarContainer.style.borderRight = 'thin solid #D8DDE4';
          this.$.rockSidebarContainer.style.borderLeft = 'none';
      }
      
      if(this.width){
          if(this.width.toLowerCase() == 'half') {
              this.style.width = "100%";
          } else if (this.width.toLowerCase() == "quarter") {
              this.style.width = "30%";
          }
      }
      if(this.collapsable && this.collapse){
          this.classList.add('collapse');
      }
  }

  _onContextDataChange() {
      if (!_.isEmpty(this.contextData)) {
          let context = DataHelper.cloneObject(this.contextData);
          
          //Set the default navigation for rock-tabs
          let navContextObj = context.NavigationContexts;
          if(!_.isEmpty(navContextObj)) {
              if(navContextObj[0][RockSidebar.is] && navContextObj[0][RockSidebar.is].collapse && !this.collapse){
                  this.collapse = navContextObj[0][RockSidebar.is].collapse;
                  this.classList.add('collapse');
              }                       
             
          }
      }                
  }

  _moveright(e){                
      this.classList.add('collapse');
      if(e && e.detail) {
          ComponentHelper.fireBedrockEvent("toggle-sidebar", e.detail, { ignoreId: true });
      }
      //Set navigationData                
      let eventDetail = {
              "parentElement" : RockSidebar.is,
              "properties" :{"collapse": true}
          } 
      ComponentHelper.fireBedrockEvent("navigation-change", eventDetail , { ignoreId: true });
     

  }
  _moveLeft(e){
      this.classList.remove('collapse');
      if(e && e.detail) {
          ComponentHelper.fireBedrockEvent("toggle-sidebar", e.detail, { ignoreId: true });
      }
      //Set navigationData 
      let eventDetail = {
              "parentElement" : RockSidebar.is,
              "properties" :{"collapse": false}
          } 
      ComponentHelper.fireBedrockEvent("navigation-change", eventDetail , { ignoreId: true });
  }
}
customElements.define(RockSidebar.is, RockSidebar);
