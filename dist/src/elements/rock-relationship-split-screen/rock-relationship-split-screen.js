/**
<b><i>Content development is under progress... </b></i>

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

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
    }
    connectedCallback() {
				super.connectedCallback();
				this.logInfo("SplitScreenAttached");
				this.addEventListener('scroll', this._onScrollDebounce);
    }
    constructor() {
				super();
				if (this.verbose) {
            this.logInfo("SplitScreenCreated");
				}
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
