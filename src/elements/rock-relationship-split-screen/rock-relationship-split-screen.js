/**
<b><i>Content development is under progress... </b></i>

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-split-screen-behavior/bedrock-split-screen-behavior.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../pebble-button/pebble-button.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-vertical-divider/pebble-vertical-divider.js';
import '../rock-relationship-manage/rock-relationship-manage.js';
import './relationships-tab-menu-provider.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

class RockRelationshipSplitScreen
    extends mixinBehaviors([
				RUFBehaviors.SplitScreenBehavior
    ], PolymerElement) {
        static get template() {
            return html`
            <style include="bedrock-style-common bedrock-style-grid-layout bedrock-style-icons bedrock-style-padding-margin">
                :host {
                    display: block;
                    height: 100%;
                    overflow-x: auto;
                    overflow-y:hidden;
                }
                .relationship-grid {
                    width: 50%;
                    height: 100%;
                    flex: none;
                    -webkit-flex: none;
                }
                .relationship-grid-1 {
                    height: 100%;
                    width: 100%;
                }
                .dimension {
                    width: 100%;
                    @apply --layout;
                    @apply --layout-horizontal;
                    height: 30px;
                    line-height: 30px;
                    margin-bottom: 5px;
                    font-family: var(--default-font-family);
                    font-size: var(--default-font-size, 14px);
                    color: var(--palette-cerulean, #036bc3);
                }
                .actionButton {
                    float: right;
                    margin-top: 10px;
                    padding-right: 10px;
                }
                #dimensionValueContainer {
                    margin-left: 20px;
                    margin-top: auto;
                }
                .relationshipGrid {
                    width: 100%;
                    height: 100%;
                }
                .relationshipErrorGrid {
                    width: 100%;
                    color: var(--palette-pinkish-red, #ee204c);
                    padding-right: 5px;
                }
                .relationship-split-screen-title-container .relationship-grid {
                    padding-left: 20px;
                    padding-top: 10px;
                    font-size: var(--default-font-size, 14px);
                    color: var(--palette-cerulean, #036bc3);
                }
                pebble-vertical-divider {
                    --pebble-vertical-divider-color: #c1cad4;
                    height: 100%;
                    opacity: 1;
                    position: absolute;
                    top: 0px;
                    left: 0px;
                }
                .relationship-split-screen-title-container {
                    display: flex;
                    flex-flow: row;
                }
                .split-relationship-content-column-wrapper {
                    position: relative;
                    height: 100%;
                }
                .split-relationship-content-wrapper {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: flex-start;
                }
                .relationship-split-screen-container {
                    @apply --rock-tab-content-height;
                    -webkit-transition: height 0.3s;
                    -moz-transition: height 0.3s;
                    -o-transition: height 0.3s;
                    transition: height 0.3s;
                }
                #sourceDimensionValueContainer {
                    display:flex;
                    align-items: center;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    word-break: break-word;
                    padding-right: 3%;
                }
                @supports (-ms-ime-align:auto) {
                    .relationship-split-screen-container {
                        transition: initial;
                    }
                }
                .dimension[show="true"]{
                    display: flex !important;
                }
                .context-title{
                    width:calc(100% - 21px)
                }
            </style>
            <div class="relationship-split-screen-container base-grid-structure">
                <div class="relationship-split-screen-title-container base-grid-structure-child-1">
                    <template is="dom-if" if="[[_contexts.length]]">
                        <div class$="dimension [[_getColLength()]]" show$="[[_getStyle()]]">
                            <template is="dom-repeat" items="[[_contexts]]" as="context">
                                <div id="sourceDimensionValueContainer" class$="[[_getListClassName()]]">
                                    <pebble-icon icon="pebble-icon:globe" class="pebble-icon-size-16 m-r-5 pebble-icon-color-blue"></pebble-icon>
                                    <div class="context-title">[[_getTitle(context)]]</div>
                                </div>
                            </template>
                        </div>
                    </template>
                </div>
                <div class="base-grid-structure-child-2">
                    <div class="split-relationship-content-wrapper">
                        <template is="dom-if" if="[[_contexts.length]]">
                            <template is="dom-repeat" index-as="index" items="[[_contexts]]" as="context" initial-count="1" target-framerate="30">
                                <div class$="[[_getListClassName()]]">
                                    <div class="split-relationship-content-column-wrapper">
                                        <template is="dom-if" if="[[!_isFirstIndex(index)]]">
                                            <pebble-vertical-divider></pebble-vertical-divider>
                                        </template>
                                        <div class="base-grid-structure">
                                            <div class="base-grid-structure-child-1">
                                                <div id="[[context.value]]-error-container" class="relationshipErrorGrid" hidden></div>
                                            </div>
                                            <div class="base-grid-structure-child-2 relationship-manage-content-height">
                                                <div id="[[context.value]]-relationship-container" class="relationshipGrid">
                                                    <rock-relationship-manage mode="[[mode]]" load-govern-data$="[[loadGovernData]]" data-index$="[[dataIndex]]"
                                                     context-data="[[_getContextData(context)]]" config-context="[[configContext]]" no-of-columns="[[noOfColumns]]"
                                                     do-sync-validation$="[[doSyncValidation]]"></rock-relationship-manage>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </template>
                    </div>
                </div>
            </div>
            `;
        }
    static get is() { return 'rock-relationship-split-screen' }

    static get properties() {
				return {

            readonly: {
                type: Boolean,
                value: false
            },
            verbose: {
                type: Boolean,
                value: false
            },
            dataIndex: {
                type: String,
                value: "entityData"
            },
            loadGovernData: {
                type: Boolean,
                value: true
            },

            listClassName: {
                type: String,
                value: 'relationship-grid'
            }
				}
    }
    disconnectedCallback() {
                super.disconnectedCallback();
                this.removeEventListener('scroll', this._onScrollDebounce);
    }
    connectedCallback() {
				super.connectedCallback();
				this.addEventListener('scroll', this._onScrollDebounce);
    }
    constructor() {
				super();
				
				this._onScrollDebounce = _.debounce(this._onScroll.bind(this), 300);
    }
    _isFirstIndex(_index) {
				if (_index == 0) return true;
				return false;
    }
    _onScroll(e) {
				const { scrollHeight, scrollTop, offsetHeight } = this;

				const scrollDiff = scrollHeight - offsetHeight - scrollTop;

				const PRELOAD_HEIGHT = 200;

				if (scrollDiff <= PRELOAD_HEIGHT) {
            this._fireLoadMoreRelationships();
				}

    }
    _getColLength(){				
				if(this._contexts){
            let contextlength = this._contexts.length;
            this.updateStyles({
                "--grid-tile-col-length": contextlength <= 2?contextlength:2
            });
				}
    }

    _fireLoadMoreRelationships() {
				ComponentHelper.fireBedrockEvent("load-more-relationships", null, { ignoreId: true });
    }			
    /**
     * Can be used to get the elements if they are dirty.
     */
    getIsDirty() {
				let relManage = this.shadowRoot.querySelector("rock-relationship-manage");
				return this._getIsDirty(relManage);
    }
    /**
     * Can be used to get the elements if they are dirty.
     */
    getControlIsDirty() {
				let relManage = this.$$("rock-relationship-manage");
				return this._getControlIsDirty(relManage);
    }

    refresh(options) {
				let relManageList = this.shadowRoot.querySelectorAll("rock-relationship-manage");
				if (relManageList && relManageList.length) {
            for (let relMngIdx = 0; relMngIdx < relManageList.length; relMngIdx++) {
                relManageList[relMngIdx].refresh(options);
            }
				}
    }
}
customElements.define(RockRelationshipSplitScreen.is, RockRelationshipSplitScreen)
