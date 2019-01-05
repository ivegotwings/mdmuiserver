/*
	`rock-attribute-split-screen` Represents component to render the manage attributes screen based on the 
	dimensions selected from the `rock-context-selector`. If multiple values are selected for any of the 
	dimensions, then the screen splits into number of dimension 
	values selected.
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../bedrock-split-screen-behavior/bedrock-split-screen-behavior.js';
import '../pebble-button/pebble-button.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-vertical-divider/pebble-vertical-divider.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../rock-attribute-manage/rock-attribute-manage.js';
import './attribute-tab-menu-provider.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

class RockAttributeSplitScreen
extends mixinBehaviors([
    RUFBehaviors.SplitScreenBehavior
], PolymerElement) {
static get is() { return 'rock-attribute-split-screen' }
    static get properties() {
        return {
						attributesChunkLength: {
                type: Number,
                value: 10
						},

						/**
						 * <b><i>Content development is under progress... </b></i>
						 */
						allowSaveOnError: {
                type: Boolean,
                value: false
						},
						/**
						 * <b><i>Content development is under progress... </b></i>
						 */

						applyLocaleCoalesce: {
                type: Boolean,
                value: false
						},

						applyContextCoalesce: {
                type: Boolean,
                value: false
						},

						/**
						 * Indicates whether or not to write the logs.
						 */
						verbose: {
                type: Boolean,
                value: false
						},

						listClassName: {
                type: String,
                value: 'attribute-list'
						},

						needAttributesGrouping: {
                type: Boolean,
                value: false
						},
						readonly: {
                type: Boolean,
                value: false
						}
        }
    }

/**
 * <b><i>Content development is under progress... </b></i>
 */
constructor () {
    super();
}

/**
 * <b><i>Content development is under progress... </b></i>
 */
refresh () {
    RUFBehaviors.SplitScreenBehaviorIml.refresh.call(this);
    /***
     * Getting all the views in split screen and finding views which are dirty,
     * refreshing views which are not dirty.
     * TODO: Showing a message to the user before going ahead with all view refresh, saying
     * "Following views have unsaved changes. You want to refresh them?".
     * If "Yes", refresh all views, if "No" refresh only undirty views.
     * */
    let attributeManageEls = this.shadowRoot.querySelectorAll("rock-attribute-manage");
    if (attributeManageEls && attributeManageEls.length > 0) {
        for (let i = 0; i < attributeManageEls.length; i++) {
						let attributeManage = attributeManageEls[i];
						if (attributeManage.getIsDirty && !attributeManage.getIsDirty()) {
                attributeManage.refresh();
						}
        }
    }
}
/**
 * Can be used to get the elements if they are dirty.
 */
getIsDirty () {
    let attributeManage = this.shadowRoot.querySelector("rock-attribute-manage");
    return this._getIsDirty(attributeManage);
}
getControlIsDirty () {
    let attributeManage = this.$$("rock-attribute-manage");
    return this._getControlIsDirty(attributeManage);
}

_computeScreens (...args) {
    RUFBehaviors.SplitScreenBehaviorIml._computeScreens.call(this, ...args);
    if(this._contexts){
        this.attributesChunkLength = this._contexts.length > 1 ? 10 : this.attributesChunkLength;
    }
}

_onGlobalEdit (e) {
    if (!e || !e.detail) return;

    let attrsWritePermissions = [];
    let rockAttributeManageList = this.shadowRoot.querySelectorAll("rock-attribute-manage");

    if (rockAttributeManageList.length > 0) {
        for (let i = 0; i < rockAttributeManageList.length; i++) {
						let rockAttributeManage = rockAttributeManageList[i];

						if (rockAttributeManage.areAttributesEditable) {
                rockAttributeManage.globalEdit = true;
						}

						attrsWritePermissions.push(rockAttributeManage.areAttributesEditable);
        }

        // if no attributes are editable
        if (!attrsWritePermissions.some(function (attr) { return attr === true; })) {
						this.showWarningToast("No editable attributes available");
        }
    }
}
}
customElements.define(RockAttributeSplitScreen.is, RockAttributeSplitScreen);
