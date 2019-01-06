/**
`<rock-titlebar>` Represents a titlebar layout structure inside rock-layout. 
This element is a child of `<rock-layout>` element.

It can contian any elements or components.

For example:

        <rock-layout>
            <rock-titlebar icon="" sub-title="" main-title="" closable minimizable>
                title content . . .
            </rock-titlebar>
        </rock-layout>

@demo ../demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../../bedrock-pubsub/bedrock-pubsub.js';
import '../../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../../pebble-vertical-divider/pebble-vertical-divider.js';
import '../../pebble-button/pebble-button.js';
import '../../pebble-icon/pebble-icon.js';
import '../../pebble-icons/pebble-icons.js';
import '../../bedrock-style-manager/styles/bedrock-style-common.js';
import '../../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../../bedrock-style-manager/styles/bedrock-style-fonts.js';
import '../../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../../bedrock-style-manager/styles/bedrock-style-floating.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockToolbar
            extends mixinBehaviors([
                RUFBehaviors.UIBehavior
            ], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-tooltip bedrock-style-floating bedrock-style-icons bedrock-style-fonts bedrock-style-padding-margin">
            :host {
                display: -webkit-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: flex;
                position:relative;
                height: 34px;
            }
            .header {
                @apply --layout-horizontal;
                width: 100%;
                box-shadow: 0 1px 2px 0 rgba(193, 202, 211, 0.7);
                padding:0px 10px;
                justify-content: flex-end;
                align-items: center;
            }
            #title {
                display: flex;
                width: 100%;
                flex-direction: column;
                overflow: visible
            }
            #subTitle {
                color: var(--label-text-color, #96B0C5);
                line-height: 12px;
                overflow: visible
            }
            #mainTitle {
                font-family: var(--default-font-family);
                color: var(--pagetitle-text-color, #034c89);
                line-height: 14px;
            }
            .header .title-text {
                display: flex;
                height: 100%;
                align-items: center;
                width: 30%;
                flex-grow: 1;
            }
            pebble-vertical-divider {
                margin: 0;
                display: inline-block;
                vertical-align: middle;
                --pebble-vertical-divider-color: var(--divider-color, #c1cad4);
                min-width: 1px;
                margin-top: 10px;
                padding-right: 5px;
                margin-bottom: 10px;
                padding-left: 5px;
                min-height: 18px;
            }
            .entity-image {
                width: 20px;
                height: 20px;
                background: #ddd;
            }
            .context-selector-wrap{
                width: 60%;
                display: flex;
                flex-grow: 0;
                flex-shrink: 0;
                justify-content: flex-end;
                @apply --context-selector-wrap;
            }  
            .cursor-pointer{
                cursor: pointer;
            }
                      
        </style>
    <div id="rockTitle" class="header">
        <div hidden\$="{{!mainTitle}}" class="title-text ">
            <template is="dom-if" if="[[_entityHasImage(config)]]">
                <img class="entity-image" src="[[config.image]]">
            </template>
            <template is="dom-if" if="[[!_entityHasImage(config)]]">
                <pebble-icon class="m-r-10 pebble-icon-size-16 pebble-icon-color-blue " icon="[[icon]]"></pebble-icon>
            </template>
            <div id="title">
                <template is="dom-if" if="{{_isSubTitleDefined(subTitle, mainTitle)}}">
                    <div id="subTitle" class="text-ellipsis font-12 font-w-100" title\$="{{subTitle}}">{{subTitle}}</div>
                    <div title\$="{{mainTitle}}">
                        <div id="mainTitle" class="text-ellipsis font-w-500 font-14">{{mainTitle}}</div>
                    </div>
                </template>
                <template is="dom-if" if="{{!_isSubTitleDefined(subTitle, mainTitle)}}">
                    <div title\$="{{mainTitle}}">
                        <div id="mainTitle" class="text-ellipsis font-w-500 font-14">{{mainTitle}}</div>
                    </div>
                </template>
            </div>
        </div>
        <div class="context-selector-wrap"><slot></slot></div>
        <div class="pull-right">
            <template is="dom-if" if="[[noShare]]">
                <pebble-icon id="share" class="minimize pebble-icon-color-blue pebble-icon-size-16 m-l-5" title="Share" name="share" icon="pebble-icon:share"></pebble-icon>
            </template>
            <template is="dom-if" if="[[noSettings]]">
                <pebble-icon id="settings" class="minimize pebble-icon-color-blue pebble-icon-size-16 m-l-5" name="settings" title="Settings" icon="pebble-icon:settings"></pebble-icon>
            </template>
            <template is="dom-if" if="[[!nonMinimizable]]">
                <pebble-icon id="minimize" class="minimize cursor-pointer pebble-icon-color-blue pebble-icon-size-12 m-l-5" name="minimize" title="Minimize" icon="pebble-icon:window-action-minimize" on-tap="_onMinimize"></pebble-icon>
            </template>
            <template is="dom-if" if="[[!nonClosable]]">
                <pebble-icon id="close" name="close" icon="pebble-icon:window-action-close" title="Close" on-tap="_onClose" class="cursor-pointer pebble-icon-color-blue pebble-icon-size-12 m-l-5"></pebble-icon>
            </template>
        </div>
    </div>
`;
  }

  static get is() { return 'rock-titlebar' }
  static get properties() {
      return {
          config: {
              type: String,
              value: function () { return {}; }
          },
          /*
          * Indicates icon if value is set
          */
          icon: {
              type: String
          },
          /*
          * Indicates title if value is set
          */
          mainTitle: {
              type: String,
              notify: true
          },
          /*
          * Indicates sub title if value is set
          */
          subTitle: {
              type: String,
              notify: true
          },
          /*
          * Indicates close icon should come or not to close window
          */
          nonClosable: {
              type: Boolean
          },
          /* Specifies whether the card container have share icon or not.
           * If it is set to <b>true</b>, then the card container has share icon.
           */
          noShare: {
              type: Boolean
          },
          /* Specifies whether the card container have Minimize icon or not.
           * If it is set to <b>true</b>, then the card container has Minimize icon.
           */
          nonMinimizable: {
              type: Boolean
          },

          /* Specifies whether the card container have settings icon or not.
           * If it is set to <b>true</b>, then the card container has settings icon.
           */
          noSettings: {
              type: Boolean
          }
      }
  }

  _onMinimize () {
      const { contentViewManager } = RUFUtilities.mainApp;

      if(contentViewManager) {
          let contentView = contentViewManager.activeContentView;
          contentView.onMinimizeClick(contentView.name);
      }
  }
  _onClose () {
       let isDirty;
       const { contentViewManager } = RUFUtilities.mainApp;
       if(!contentViewManager) return;

       let contentView = contentViewManager.activeContentView;
       if(!contentView) return;

       let firstChild = contentView.shadowRoot.querySelector('#content').firstElementChild;
       if(firstChild && firstChild.getIsDirty) {
           isDirty = firstChild.getIsDirty();
       }

       if(isDirty) {
           let retVal = confirm("There are unsaved changes. Do you want to discard the changes?");
           if(retVal == true) {
               contentView.onCloseClick(contentView.name);
           }
       }
       else {
           contentView.onCloseClick(contentView.name);
       }
   }
  _isSubTitleDefined () {
      if (this.subTitle) {
          return true;
      }
      return false;
  }
  _entityHasImage(config) {
      if(config && config.image && config.image != "") {
          return true
      }
      return false;
  }
}
customElements.define(RockToolbar.is, RockToolbar);
