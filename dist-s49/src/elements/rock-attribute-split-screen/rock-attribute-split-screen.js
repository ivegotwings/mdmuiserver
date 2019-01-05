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
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

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
static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-grid-layout bedrock-style-icons bedrock-style-padding-margin">
			.attribute-list {
				display: inline-block;
				float: left;
				width: 50%;
				flex: none;
				height: 100%;
				-webkit-flex: none;
				padding: 22px 20px 0px;
				height: 100%;
			}

			.attribute-list-1 {
				width: 100%;
			}

			.attribute-list-2 {
				width: 50%;
			}

			.attribute-list-3 {
				width: 33%;
			}

			.attribute-list-4 {
				width: 24%;
			}

			.dimension {
				width: 100%;
				@apply --layout;
				@apply --layout-horizontal;
				line-height: 30px;
				font-family: var(--default-font-family);
				font-size: var(--default-font-size, 14px);
				color: var(--palette-cerulean, #036bc3);
			}

			#dimensionValueContainer {
				margin-left: 20px;
				margin-top: auto;
			}

			.divider {
				width: 2%;
				height: auto;
			}

			pebble-vertical-divider {
				--pebble-vertical-divider-color: var(--pagelevel-divider, #bacedf);
				height: 100%;
				border: 0px;
				min-height: 0px;
			}

			.actionButton {
				float: right;
			}

			.attribute-manage-container {
				width: 100%;
				height: 100%;
				position: relative;				
			}

			.attribute-error-container {
				width: 100%;
				height: 100%;
				position: relative;
				color: var(--palette-pinkish-red, #ee204c);
			}

			.attribute-split-screen-container {
				height:100%;
				@apply --rock-tab-content-height;
				-webkit-transition: height 0.3s;
                -moz-transition: height 0.3s;
                -o-transition: height 0.3s;
                transition: height 0.3s;
			}
			@supports (-ms-ime-align:auto) {
                .attribute-split-screen-container{
                    transition: initial;
                }
            }
			.attribute-split-screen-title-container .attribute-list {
				padding: 10px 0 0 20px;
			}

			.attribute-split-screen-title-container {
				height: 100%;
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
			rock-attribute-manage{
				--nested-list:{
                    overflow-x: hidden !important;
                    overflow-y: hidden !important;
                }
			}
			.context-title{
				width:calc(100% - 21px)
			}
		</style>

		<div class="attribute-split-screen-container">
			<div class="base-grid-structure">
				<div class="base-grid-structure-child-1">
					<div id="split-screen-container" class="attribute-split-screen-title-container">
						<template is="dom-if" if="[[_contexts.length]]">
							<div class="dimension" show$="[[_getStyle()]]">
								<template is="dom-repeat" items="[[_contexts]]" as="context">
									<div id="sourceDimensionValueContainer" class$="[[_getListClassName()]]" title$="[[_getTitle(context)]]">
										<pebble-icon icon="pebble-icon:globe" class="pebble-icon-size-16 m-r-5 pebble-icon-color-blue"></pebble-icon>
										<div class="context-title">[[_getTitle(context)]]</div>
									</div>
								</template>
							</div>
						</template>
					</div>
				</div>
				<div class="base-grid-structure-child-2">
					<template is="dom-if" if="[[_contexts.length]]">
						<template is="dom-repeat" items="[[_contexts]]" as="context" initial-count="1" target-framerate="30">
							<div class$="[[_getListClassName()]]">
								<div id="[[context.value]]-attribute-container" class="attribute-manage-container">
									<rock-attribute-manage readonly="[[readonly]]" show-group-name mode="[[mode]]" context-data="[[_getContextData(context)]]"
									 config-context="[[configContext]]" no-of-columns="[[noOfColumns]]" allow-save-on-error="[[allowSaveOnError]]" do-sync-validation="[[doSyncValidation]]"
									 apply-context-coalesce="[[applyContextCoalesce]]" apply-locale-coalesce="[[applyLocaleCoalesce]]" attributes-chunk-length="[[attributesChunkLength]]"
									 load-govern-data="[[loadGovernData]]" data-index$="[[dataIndex]]" need-attributes-grouping$="[[needAttributesGrouping]]">
									</rock-attribute-manage>
								</div>
								<div id="[[context.value]]-error-container" class="attribute-error-container" hidden></div>
							</div>
						</template>

						<bedrock-pubsub event-name="global-edit" handler="_onGlobalEdit"></bedrock-pubsub>
					</template>
				</div>
			</div>
		</div>
    `;
}
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

			/**
			 * If set as true , it indicates the component is in read only mode
			 */
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
		if (this.verbose) {
			this.logInfo("SplitScreenCreated");
		}
	}

	/**
	 * <b><i>Content development is under progress... </b></i>
	 */
	connectedCallback () {
		super.connectedCallback();
		this.logInfo("SplitScreenAttached");
	}

	/**
	 * <b><i>Content development is under progress... </b></i>
	 */
	ready () {
		super.ready();
		this.logInfo("SplitScreenReady");
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
		let attributeManage = this.$$("rock-attribute-manage");
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
