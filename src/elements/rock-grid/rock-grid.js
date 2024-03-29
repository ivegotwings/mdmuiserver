/**

`rock-grid` Represents the grid control of the framework. It creates the visual consistency between the layouts 
while allowing the flexibility across a wide variety of designs.
Following are the three ways to use the `rock-grid`:

### 1. Pass the "config" and "data":
The following `girdData` JSON object is a sample of data which binds the grid:
```json

	{
		"shortName": "web Price",
		"longName": "Web Price",
		"productType": "Electronics",
		"description": "product web price",
		"isNew": false,
		"isApproved": true
	},
	{
		"shortName": "catalog",
		"longName": "Catalog",
		"productType": "Toys",
		"description": "catalog information",
		"isNew": true,
		"isApproved": false
	},
	{
		"shortName": "cost1",
		"longName": "Cost2",
		"productType": "Value",
		"description": "cost of the product1",
		"isNew": false,
		"isApproved": true
	}
```
### Example
```html
	<rock-grid data="{{gridData}}" config="{{gridConfig}}" page-size="10"></rock-grid>

```
### 2. Use the `x-data-source` component and then pass the data-source, config, record-size, and grid-data-size.
To use the `x-data-source`, you need to pass the following properties:

`request` - This is any liquid request from which the data is loaded.

`operation` - The liquid operation name for which the `request` object is prepared.

`data-formatter`  - This is a callback function which is triggered on every page load in the grid before binding the data to the grid. 
It is used for formatting the response data that comes from the liquid request into an array of records as per the grid configuration.
Then you need to access the auto calculated properties of `data-source` and pass it to the `rock-grid. For example, the properties such as`current-record-size` and 
`total-records` are passed to `record-size` and `grid-data-size` as shown in the following example:
### Example
		<dom-module id="app">
			<template>
				<x-data-source id="remote1" request="[[request]]" data-formatter="{{dataFormatter}}"
					buffer-record-size="{{size}}" total-records="{{totalRecords}}" data-source="{{rDataSource}}"></x-data-source>
				<rock-grid data-source="{{rDataSource}}" data-source-id="remote1" record-size="{{totalRecords}}" config="{{gridConfig}}"
					grid-data-size="{{size}}" page-size="10"></rock-grid>
			</template>
			<script>
				Polymer({
					is: 'app',
					properties: {
						dataFormater: {
							notify: true,
							value: function() {
								return this._dataFormatter.bind(this);
							}
						}
					},
					_dataFormatter: function(response) {
						var data = [];
						........
						.......
						...
						return data;
					}
				});
			</script>
		</dom-module>
### 3. Create external data-source and then pass the data-source, config, record-size, and grid-data-size.
### Example
	A. External Data Source:
```html
			<dom-module id="data-source">
				<template>
					<style include="bedrock-style-common"></style>
				</template>
				<script>
					Polymer({
						is: 'data-source',
						properties: {
							rDataSource: {
								notify: true,
								value: function() {
								return this._dataSource.bind(this);
								}
							},
							size: {
								type: Number,
								notify: true,
								value: 0
							},
							total-records: {
								type: Number,
								notify: true,
								value: 0
							}
						},
						_lastPage: -1,
						_dataSource: function(opts, cb) {
							var xhr = new XMLHttpRequest();
							xhr.onreadystatechange = function() {
								if (xhr.readyState == XMLHttpRequest.DONE) {
									if (xhr.status == 200 && this._lastPage < opts.page) {
										var data = JSON.parse(xhr.responseText);
										// This if condition is required for any data source to make vitualization work
										// pagination will work based on this inputs
										if(opts.pageSize <= data.length)
										{
											if (this.size / opts.pageSize >= opts.page) {
												this.size += this.size == 0 ? opts.pageSize * 2 : opts.pageSize;
											}
										}
										else
										{
											if(this.size == 0) {
												this.size = data.length;
											}
											else {
												this.size -= opts.pageSize;
											}
										}
										cb(data);
										this._lastPage = opts.page;
										this.totalRecords += data.length;
									}
								}
							}.bind(this);
							// page parameters could be used like this:
							xhr.open("GET", 'gridData.json?per_page=' +
								opts.pageSize + '&page=' + opts.page, true);
							xhr.send();
						}
					});
				</script>
			</dom-module>
```
	B. Usage of external data source in the rock grid:
```html
		<data-source data-source="{{rDataSource}}" size="{{size}}" total-records="{{totalRecords}}"></data-source>               
  		<rock-grid data-source="{{rDataSource}}" grid-data-size="{{size}}" record-size="{{totalRecords}}" config="{{gridConfig}}" 
		  page-size="10"></rock-grid>
```
The following JSON object is a config sample which configures the grid in all above three ways:
```json
{
    "viewMode": "Tabular",
    "title": "Simple Data Table",
    "readOnly":true,
    "tabular": {
        "settings": {
        
            "isMultiSelect": true
        
        },
        "columns": [
            {
                "header": "Short Name",
                "name": "shortName",
                "sortable": true,
                "filterable": false,
                "editType":"text"
            },
            {
                "header": "Long Name",
                "name": "longName",
                "sortable": false,
                "filterable": true,
                "editType":""
            },
            {
                "header": "Product Type",
                "name": "productType",
                "sortable": false,
                "filterable": false,
                "editType":"text"
            }
}
```

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-radio-button/paper-radio-button.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/polymer/lib/utils/async.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-list.js';
import '../bedrock-style-manager/styles/bedrock-style-paper-listbox.js';
import '../bedrock-style-manager/styles/bedrock-style-buttons.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-gridsystem.js';
import '../pebble-data-table/pebble-data-table.js';
import '../pebble-data-table/data-table-column.js';
import '../pebble-button/pebble-button.js';
import '../pebble-dialog/pebble-dialog.js';
import '../pebble-vertical-divider/pebble-vertical-divider.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-popover/pebble-popover.js';
import '../rock-attribute/rock-attribute.js';
import '../rock-image-viewer/rock-image-viewer.js';
import '../rock-nested-attribute-grid/rock-nested-attribute-grid.js';
import '../rock-entity-tofix/rock-entity-tofix.js';
import '../rock-toolbar-default-actions/rock-toolbar-default-actions.js';
import '../rock-snapshot-relationship-grid/rock-snapshot-relationship-grid.js';
import './remote-data.js';
import { dom, flush } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockGrid
extends mixinBehaviors([
    RUFBehaviors.UIBehavior
], OptionalMutableData(PolymerElement)) {
    static get is() {
				return 'rock-grid';
    }

    static get template() {
        return html`
		<style include="bedrock-style-common bedrock-style-gridsystem bedrock-style-grid-layout bedrock-style-icons bedrock-style-padding-margin bedrock-style-buttons bedrock-style-paper-listbox bedrock-style-list">
			:host {
				display: block;
				height: 100%;
			}

			pebble-data-table {
				--pebble-data-table-header: {
					min-height: 40px;
					padding-top: 10px;
					padding-right: 0;
					padding-bottom: 10px;
					padding-left: 0;
				}

				--pebble-data-table-row-odd: {
					background-color: var(--secondary-button-color, #ffffff);
				}
			}

			pebble-data-table[loading] {
				pointer-events: none;
			}

			data-table-row[header] {
				font-weight: var(--font-bold, bold);
				color: var(--palette-cerulean, #036bc3);
				border-bottom: none;
				text-transform: uppercase;
				font-size: var(--table-head-font-size, 11px);
				@apply --nested-grid-font-size;
			}

			data-table-row:not([header]) {
				color: var(--palette-dark, #1a2028);
				font-size: var(--default-font-size, 12px);
				height: 100%;
				background-color: var(--palette-white, #ffffff);
			}

			data-table-row:not([header]):hover,
			data-table-row[selected] {
				background-color: var(--table-row-selected-color, #c1cad4) !important;
			}

			data-table-row.value-updated {
				background-color: var(--edit-attribute-bgcolor, #EDF8FE) !important;
			}

			rock-attribute.value-duplicated {
				border-bottom: 1px solid var(--error-color, #ed204c);
			}

			data-table-row:not([header]):hover data-table-checkbox,
			data-table-row[selected] data-table-checkbox {
				background-color: var(--palette-white, #ffffff) !important;
			}


			#pebbleGridContainer {
				height: auto;
				min-height: 0px;
				font-family: var(--default-font-family);
				font-size: var(--default-font-size, 12px);
				margin-left: 20px;
				margin-right: 20px;
				@apply --pebble-grid-container;
			}

			#pebbleGridContainer grid-list-view {
				--pebble-grid-list-container: {
					will-change: unset;
					transform: none !important;
					-ms-transform: none !important;
					-webkit-transform: none !important;
				}
			}

			#gridHeader {
				justify-content: space-between;
				align-items: center;
				font-family: var(--default-font-family);
				font-size: var(--default-font-size, 12px);
				padding: 10px 20px 10px 20px;
				color: var(--palette-steel-grey, #75808b);
				@apply --pebble-grid-container-header;
			}

			#gridHeader #title,
			#selection-title {
				font-weight: var(--font-bold, bold);
				color: var(--palette-dark, #1a2028);
			}

			pebble-vertical-divider {
				min-width: 1px;
				min-height: 18px;
				border-right: 0;
				background: var(--divider-color, #c1cad4);
			}

			paper-dropdown-menu {
				width: 90px;

				--paper-input-container: {
					padding-top: 0px;
					padding-right: 0px;
					padding-bottom: 0px;
					padding-left: 0px;
				}

				--paper-input-container-underline: {
					display: none;
				}

				--paper-input-container-underline-focus: {
					display: none;
				}

				--paper-dropdown-menu-icon: {
					color: var(--palette-steel-grey, #75808b);
					margin-top: -5px;
				}

				--paper-input-container-input: {
					color: var(--palette-steel-grey, #75808b);
					font-size: var(--dropdown-inside-grid-size, 12px);
					vertical-align: top !important;
					line-height: 20px !important;
					padding-left: var(--gutter-width, 5px);
				}
			}

			data-table-checkbox {
				border-right: none;
				padding: 0 10px 0 0;
				height: 40px;
				flex-basis: 35px;
				background: var(--palette-white, #ffffff);
				justify-content: flex-start;
			}

			data-table-cell,
			data-table-cell[header] {
				padding: 0px 10px 0px 0;
				min-width: 0 !important;
				flex-basis: 150px;
				/* Set minimum width for columns */
				@apply --data-table-cell-width;
			}

			data-table-cell:not([header]) [slot=cell-slot-content] {
				width: 100%;

			}

			data-table-cell.fixedWidth [slot=cell-slot-content] {
				display: flex;
				justify-content: center;
			}

			data-table-cell[header] {
				font-size: var(--font-size-sm, 12px);
				color: var(--palette-cerulean, #036bc3);
				text-transform: uppercase;
				cursor: default;
				height: 40px;
				align-items: center;
				@apply --nested-grid-font-size;
			}

			data-table-row:not([header]) data-table-cell {
				min-height: 40px !important;
				height: 40px !important;
				z-index: auto !important;
			}

			.check-filter {
				flex-basis: 35px !important;
				flex-grow: 0 !important;
				overflow: visible !important;
				position: relative;
				padding: 0;
			}

			grid-selection-popover {
				position: absolute;
				left: 20px;
				top: auto;
			}

			pebble-data-table {
				--pebble-data-table-header: {
					height: auto;
				}
			}

			.attribute {
				width: 100%;

				--attribute-main: {
					padding-top: 0px;
					padding-right: 0px;
					padding-bottom: 0px;
					padding-left: 0px;
				}

				--attribute-edit: {
					margin-top: -4px;
				}

				--textarea-container: {
					padding-top: 0px;
					padding-right: 0px;
					padding-bottom: 0px;
					padding-left: 0px;
				}

				--paper-input-container-input: {
					min-height: 30px;
				}
			}

			#pebbleGridContainer data-table-row data-table-cell data-table-column-sort {
				--data-table-column-sort-order: {
					display: none !important;
				}
			}

			#pebbleGridContainer data-table-row data-table-cell pebble-button {
				--pebble-button: {
					margin-top: 5px;
				}
			}

			data-table-column-sort {
				--pebble-icon-opacity: {
					opacity: 1;
				}
			}

			paper-dropdown-menu {
				--paper-menu-button-content: {
					@apply --common-popup;
					top: 0;
					margin-top: var(--grid-header-height, 29px);
					overflow: visible !important;
				}
			}

			paper-listbox paper-item {
				font-size: var(--font-size-sm, 12px);
				color: var(--palette-steel-grey, #75808b);
				min-height: 30px;
				width: 120px;
				height: 1px;
			}

			paper-listbox.dropdown-content {
				padding: 12px 0px !important;
			}

			paper-listbox.dropdown-content paper-item {
				@apply --popup-item;
			}

			paper-listbox.dropdown-content paper-item:hover,
			paper-item.iron-selected {
				--pebble-icon-color: {
					fill: var(--focused-line, #026bc3);
				}
			}

			paper-item.iron-selected {
				font-weight: normal;
			}

			.trim {
				display: inline-flex;
				display: -webkit-inline-flex;
				width: 30%;
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
			}

			pebble-actions {
				padding-left: 10px;
				padding-right: 10px;
				height: 32px;

				--pebble-button: {
					background-color: var(--palette-white, #ffffff);
					color: var(--color-steal-grey, #75808b) !important;
				}
			}

			.error-circle {
				height: 18px;
				width: 18px !important;
				line-height: 18px;
				text-align: center;
				border-radius: 50%;
				background: var(--error-color, #ed204c);
				font-size: 9px;
				float: right;
				color: var(--palette-white, #ffffff);
			}

			.warning-circle {
				height: 18px;
				width: 18px !important;
				line-height: 18px;
				text-align: center;
				border-radius: 50%;
				background: var(--warning-color, #f78e1e);
				font-size: 9px;
				float: right;
				color: var(--palette-white, #ffffff);
			}

			.edit-options {
				display: none;
			}

			.edit-options pebble-button {
				vertical-align: top;
				margin-top: 5px;
			}

			.edit-options.show {
				display: block;
			}

			#gridHeader .grid-actions {
				align-items: center;
				@apply --rock-grid-actions;
			}

			.cell {
				font-size: 14px;
				display: inline-block;
				vertical-align: middle;
				max-height: 100px;
				overflow-y: auto;
				max-width: 100%;
			}

			#title {
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				text-align: left;
				padding-right: 5px;
			}

			#selection-title {
				flex: 1;
				text-align: left;
				white-space: nowrap
			}

			paper-dropdown-menu {
				--paper-menu-button-dropdown: {
					margin-top: 40px;
				}
			}

			#pebbleGridContainer pebble-data-table data-table-cell .cell {
				overflow: visible;
			}

			#pebbleGridContainer pebble-data-table data-table-cell span {
				text-overflow: ellipsis;
				white-space: nowrap;
				overflow: hidden;
				display: block;
			}

			.msg {
				text-align: center;
			}

			.image-container {
				width: 30px;
				height: 30px;
			}

			.fallback-value {
				color: var(--color-variant-1);
			}

			.disabled-value {
				color: var(--palette-steel-grey, #75808b);
			}

			.coalesced-value {
				font-style: italic;
			}

			.view-source-information-popover {
				font-weight: normal;
				text-transform: initial;
				text-align: left;
				margin-left: -12px;
				margin-top: 7px;
				--default-popup-b-p: 5px;
				--default-popup-t-p: 5px;
				--default-font-size: 12px;
				width: 180px;
			}

			.view-source-information-popover::after,
			.view-source-information-popover::before {
				bottom: 100%;
				left: 20px;
				border: solid transparent;
				content: " ";
				height: 0;
				width: 0;
				position: absolute;
				pointer-events: none;
			}

			.view-source-information-popover::after {
				border-color: rgba(255, 255, 255, 0);
				border-bottom-color: #ffffff;
				border-width: 6px;
				margin-left: -6px;
			}

			.view-source-information-popover::before {
				border-color: rgba(194, 225, 245, 0);
				border-bottom-color: rgb(216, 221, 228);
				border-width: 7px;
				margin-left: -7px;
			}

			.source-information-header,
			.source-information-description,
			.source-information-path {
				padding-left: 10px;
				padding-right: 10px;
			}

			.source-information-header {
				font-weight: bold;
				border-bottom: thin solid rgb(216, 221, 228);
				padding-bottom: 3px;
			}

			.source-information-path {
				margin-top: 10px;
				margin-bottom: 0px;
			}

			.source-information-path .path-item {
				color: var(--link-text-color, #139ee7);
				display: inline-block;
			}

			.source-information-path .path-item::after {
				content: " >>";
				color: var(--default-text-color, #444444);
			}

			.source-information-path .path-item:last-of-type::after {
				content: "";
			}

			li {
				text-align: inherit;
			}

			.actionsPopover {
				@apply --pebble-actions-popover;
				width: 30px !important;
				--default-popup-t-p: 5px;
				--default-popup-b-p: 5px;
			}

			pebble-popover paper-item {
				cursor: pointer;
				font-size: var(--default-font-size, 14px);
				min-height: 40px;
				color: var(--palette-steel-grey, #75808b);
				text-align: left;
				transition: all 0.3s;
				-webkit-transition: all 0.3s;
				padding-left: var(--default-popup-item-l-p, 20px);
				padding-right: var(--default-popup-item-r-p, 20px);
			}

			pebble-popover paper-item:hover {
				background-color: var(--bgColor-hover, #e8f4f9);
				color: var(--focused-line, #026bc3);
			}

			pebble-popover paper-item:focus {
				color: var(--primary-button-color, #036bc3);
				background-color: var(--bgColor-hover, #e8f4f9);
			}

			pebble-popover paper-item pebble-icon:hover {
				color: var(--focused-line, #026bc3) !important;
			}

			pebble-icon {
				padding: 0;
				color: var(--primary-icon-color, #75808b);
				color: var(--palette-steel-grey, #75808b);
			}

			data-table-cell[header] [slot=cell-slot-content] {
				position: relative;
				padding-right: 15px;
				max-width: calc(100% - 14px);
			}

			data-table-cell[header] [slot=cell-slot-content] .cell-content-text {
				max-width: 100%;
				cursor: default;
			}

			data-table-cell[header] [slot=cell-slot-content] pebble-info-icon {
				position: absolute;
				top: 1px;
				right: 0px;
			}

			.grid-header-wrapper {
				height: 100%;
			}

			.relationshipDialog-content {
				overflow-y: auto;
				overflow-x: auto;
				height: 50vh;
            }
            #attrDialogContainer{
                @apply --height-compare;
            }

			.overflow-auto {
				overflow: auto;
			}
		</style>
		<template is="dom-if" if="{{_dataIsNotNull(config, attributeModels)}}" restamp>
			<div class="base-grid-structure">
				<div class="base-grid-structure-child-1">
					<template is="dom-if" if="[[!noHeader]]">
						<div class="grid-header-wrapper">
							<div id="gridHeader" align="right" class="row">
								<div id="title" title="[[title]]">[[title]]</div>
								<div id="selection-title" title="[[selectionTitle]]">[[selectionTitle]]</div>
								<div class="grid-actions row">
									<!-- Toolbar slot -->
									<template is="dom-if" if="[[!hideToolbar]]">
										<slot slot="toolbar" name="toolbar"></slot>
										<template is="dom-if" if="[[_isToolbarSlotEmpty()]]">
											<rock-toolbar-default-actions id="gridActions" domain="[[domain]]" context-data="[[contextData]]"></rock-toolbar-default-actions>
										</template>
									</template>
									<bedrock-pubsub event-name="rock-toolbar-button-event" handler="_onToolbarEvent" target-id="gridActions"></bedrock-pubsub>
									<bedrock-pubsub event-name="on-page-range-requested" handler="_setPageRange" target-id="gridActions"></bedrock-pubsub>
									<template is="dom-if" if="[[!hideViewSelector]]">
										<pebble-vertical-divider class="m-l-10 m-r-5"></pebble-vertical-divider>
										<paper-dropdown-menu id="viewMode" label="{{config.viewMode}}" no-label-float title="View Mode">
											<paper-listbox slot="dropdown-content" class="dropdown-content" attr-for-selected="value" selected="{{config.viewMode}}">
												<paper-item value="Tabular">
													<pebble-icon icon="pebble-icon:view-tabular" class="pebble-icon-size-16 m-r-10"></pebble-icon>Tabular
												</paper-item>
												<paper-item value="List">
													<pebble-icon icon="pebble-icon:view-list" class="pebble-icon-size-16 m-r-10"></pebble-icon>List
												</paper-item>
												<paper-item value="Tile">
													<pebble-icon icon="pebble-icon:view-tile" class="pebble-icon-size-16 m-r-10"></pebble-icon>Tile
												</paper-item>
											</paper-listbox>
										</paper-dropdown-menu>
									</template>
								</div>
							</div>
						</div>
					</template>
				</div>
				<div id="pebbleGridContainer" class="base-grid-structure-child-2">
					<template is="dom-if" if="{{_isTabularMode(config.viewMode)}}" restamp>
						<div hidden="[[_configPresent('tabular')]]" class="msg default-message">Tabular view of grid not configured.</div>
						<template is="dom-if" if="[[_configPresent('tabular')]]">
							<pebble-data-table id=[[id]] min-filter-length="[[minFilterLength]]" advance-selection-options="[[config.advanceSelectionOptions]]" advance-selection-enabled="[[config.advanceSelectionEnabled]]" selection-info="{{selectionInfo}}" page-size="[[pageSize]]" size="[[gridDataSize]]" selection-enabled="[[selectionEnabled]]" multi-selection="[[config.itemConfig.isMultiSelect]]" r-data-source="[[rDataSource]]" items="[[data]]" selected-item="{{selectedItem}}" selected-items="{{selectedItems}}" sort-order="{{sortOrder}}" disable-select-all="[[config.itemConfig.disableSelectAll]]" on-row-dbl-clicked="_rowDblClicked" rows="[[config.itemConfig.rows]]" on-row-drop-event="_onRowDropEvent" row-drag-drop-enabled="[[rowDragDropEnabled]]" enable-column-select="[[enableColumnSelect]]" enable-column-multi-select="[[enableColumnMultiSelect]]">

								<data-table-column slot="column-slot" classes="fixedWidth" name="Actions" width="70px" flex="0" hidden$="[[!_showActions(config.mode)]]">
									<template>
										<div slot="cell-slot-content">
											<template is="dom-repeat" id="actionsDomRepeat" items="[[_getActions(config.mode, item)]]" as="action" index-as="colIndex">
												<pebble-icon id="actions_container_[[item.id]]" class="actionButton pebble-icon-size-16" icon="[[_actionValue(action)]]" on-tap="_fireActionEvent" item="[[item]]" index="[[index]]" action-index="[[colIndex]]"></pebble-icon>
												<template is="dom-if" if="[[_hasPopoverInfo(action)]]">
													<pebble-popover class="view-source-information-popover" id="action_[[item.id]]_sourceInfo-popover">
														<div class="attributes-description">
															<div class="source-information-header">Source Information</div>
															<div class="source-information-description">This value was sourced from the following path</div>
															<template is="dom-if" if="[[_hasContextCoalescedValue(item)]]">
																<ul class="source-information-path">
																	Context:
																	</br>
																	<template is="dom-repeat" items="[[item.contextCoalescePaths]]" as="coalescePath">
																		<li class="path-item">[[coalescePath]]</li>
																	</template>
																</ul>
															</template>
															<template is="dom-if" if="[[_hasRelatedEntityCoalescedValue(item)]]">
																<ul class="source-information-path">
																	Related Entity:
																	</br>
																	<div id="related-entity-info">Calculating . . .</div>
																</ul>
															</template>
														</div>
													</pebble-popover>
												</template>
											</template>
										</div>
									</template>
									<span id="error-circle[[index]]" class="error-circle" hidden name="error-circle" item="[[item]]" index="[[index]]" on-tap="_openPopover" on-mouseenter="_openPopover">
									</span>
								</data-table-column>

								<data-table-column slot="column-slot" name="Status" classes="fixedWidth" width="60px" flex="0" hidden$="[[!_isStatusEnabled(config.statusEnabled, config.mode)]]">
									<template>
										<pebble-icon slot="cell-slot-content" id="rowStatus" class="pebble-icon-size-16" icon="{{_getRowStatusIcon(item)}}"></pebble-icon>
									</template>
								</data-table-column>

								<data-table-column slot="column-slot" name="" classes="fixedWidth" width="60px" flex="0" hidden$="[[!_inlineValidationEnabled]]">
									<template>
										<span slot="cell-slot-content" hidden id="error-circle[[index]]" class="error-circle" name="error-circle" item="[[item]]" index="[[index]]" on-tap="_openPopover" on-mouseover="_openPopover">
										</span>
										<span slot="cell-slot-content" hidden id="warning-circle[[index]]" class="warning-circle" name="warning-circle" item="[[item]]" index="[[index]]" on-tap="_openPopover" on-mouseover="_openPopover">
										</span>
									</template>
								</data-table-column>

								<template is="dom-if" if="[[config.readOnly]]" restamp>
									<template is="dom-repeat" items="[[_fields]]" as="col" index-as="colIndex">
										<template is="dom-if" if="[[col.visible]]">

											<template is="dom-if" if="{{_isIconColumn(col)}}">
												<data-table-column slot="column-slot" classes="fixedWidth" flex="0" width="70px" name="[[col.header]]" column-index="{{colIndex}}" filter-by="[[_isFilterEnabled(col)]]" sort-by="[[_isSortable(col)]]" sort-type="[[_getColumnSortType(col)]]" data-type="[[_getColumnDataType(col)]]" icon="pebble-icon:action-edit" class="pebble-icon-size-16" column-object="[[col]]" width="[[_getColWidth(col)]]">
													<template>
														<template is="dom-if" if="[[_hasLinkTemplate(column.columnObject, item)]]">
															<template is="dom-if" if="[[_hasIcon(column.columnObject, item)]]">
																<a slot="cell-slot-content" item="[[item]]" href="#" on-tap="_rowLinkClicked">
																	<div class="cell" title$="[[_columnIconTooltip(item, column.columnIndex)]]">
																		<pebble-icon icon="[[_columnIcon(item, column.columnIndex)]]" class="download-icon"></pebble-icon>
																	</div>
																</a>
															</template>
														</template>
														<template is="dom-if" if="[[!_hasLinkTemplate(column.columnObject, item)]]">
															<template is="dom-if" if="[[_hasIcon(column.columnObject, item)]]">
																<div slot="cell-slot-content">
																	<div class="cell" title$="[[_columnIconTooltip(item, column.columnIndex)]]">
																		<pebble-icon icon="[[_columnValue(item, column.columnIndex)]]" class="pebble-icon-size-16"></pebble-icon>
																	</div>
																</div>
															</template>
														</template>
													</template>
												</data-table-column>
											</template>
											<template is="dom-if" if="{{!_isIconColumn(col)}}">
												<data-table-column slot="column-slot" name="[[col.header]]" column-index="{{colIndex}}" filter-by="[[_isFilterEnabled(col)]]" sort-by="[[_isSortable(col)]]" sort-type="[[_getColumnSortType(col)]]" data-type="[[_getColumnDataType(col)]]" icon="pebble-icon:action-edit" class="pebble-icon-size-16" column-object="[[col]]" width="[[_getColWidth(col)]]">
													<template>

														<template is="dom-if" if="[[_isNestedAttribute(column.columnObject, item)]]">
															<template is="dom-if" if="[[_getNestedAttributeValueCount(item, column.columnObject)]]">
																<a slot="cell-slot-content" href="#" on-tap="_openNestedAttr" data="[[column.columnObject]]">
																	<div class="cell" title$="click here to see values">
																		<span> [[_getNestedAttributeMessage(item, column.columnObject, column.columnIndex)]] </span>
																	</div>
																</a>
															</template>
															<template is="dom-if" if="[[!_getNestedAttributeValueCount(item, column.columnObject)]]">
																<div slot="cell-slot-content" class="cell" title$="[[_getEmptyDisplayValue(item)]]">
																	<span> [[_getEmptyDisplayValue(item)]] </span>
																</div>
															</template>
														</template>

														<template is="dom-if" if="[[!_isNestedAttribute(column.columnObject, item)]]">
															<template is="dom-if" if="[[_hasLinkTemplate(column.columnObject, item)]]">
																<a slot="cell-slot-content" item="[[item]]" href="#" on-tap="_rowLinkClicked">
																	<div class="cell" title$="[[_columnValue(item, column.columnIndex)]]">
																		<span class$="[[_getCellClassValue(item, column.columnIndex)]]">[[_columnValue(item, column.columnIndex)]]</span>
																	</div>
																</a>
																<template is="dom-if" if="[[_hasIcon(column.columnObject, item)]]">
																	<a slot="cell-slot-content" item="[[item]]" href="#" on-tap="_rowLinkClicked">
																		<div class="cell" title$="[[_columnIconTooltip(item, column.columnIndex)]]">
																			<pebble-icon icon="[[_columnIcon(item, column.columnIndex)]]" class="pebble-icon-size-16 download-icon"></pebble-icon>
																		</div>
																	</a>
																</template>
															</template>


															<template is="dom-if" if="[[!_hasLinkTemplate(column.columnObject, item)]]">
																<!--Thumbnail and src will be computed and passed and rockimage viewer takes care of the value -->
																<template is="dom-if" if="[[_hasImage(column.columnObject, item)]]">
																	<div slot="cell-slot-content" class="cell" title$="[[_columnValue(item, column.columnIndex, column.columnObject)]]">
																		<rock-image-viewer class="image-container" sizing="contain" src="[[_columnValue(item, column.columnIndex, column.columnObject)]]" thumbnail-id="[[_columnValue(item, column.columnIndex, column.columnObject)]]" asset-details="[[_getAssetDetails(item)]]">
																		</rock-image-viewer>
																	</div>
																</template>
																<template is="dom-if" if="[[!_hasImage(column.columnObject, item)]]">
																	<div slot="cell-slot-content" title$="[[_columnValue(item, column.columnIndex)]]">
																		<span class$="[[_getCellClassValue(item, column.columnIndex)]]">[[_columnValue(item, column.columnIndex)]]</span>
																	</div>
																</template>
															</template>
														</template>
													</template>
												</data-table-column>
											</template>
										</template>
									</template>
								</template>

								<template is="dom-if" if="[[!config.readOnly]]" restamp>
									<template is="dom-repeat" items="[[_fields]]" as="col" index-as="colIndex">
										<template is="dom-if" if="[[col.visible]]">
											<data-table-column width="" model-object="{{_getAttributeModelObject(col)}}" slot="column-slot" name="[[col.header]]" column-index="{{colIndex}}" filter-by="[[_isFilterEnabled(col)]]" sort-by="[[_isSortable(col)]]" sort-type="[[_getColumnSortType(col)]]" data-type="[[_getColumnDataType(col)]]" icon="pebble-icon:action-edit" class="pebble-icon-size-16" column-object="[[col]]" width="[[_getColWidth(col)]]">
												<template>

													<template is="dom-if" if="[[_hasLinkTemplate(column.columnObject, item)]]">
														<a item="[[item]]" href="#" on-tap="_rowLinkClicked" slot="cell-slot-content">
															<template is="dom-if" if="[[!column.columnObject.readOnly]]">
																<rock-attribute index="[[index]]" context-data="[[_getContextData(column.columnIndex)]]" apply-locale-coalesce="" apply-graph-coalesced-style$="" item="[[item]]" row-index$="[[index]]" column-index$="[[column.columnIndex]]" functional-mode="grid" id="row[[index]]col[[column.columnIndex]]" class="attribute" mode="[[config.mode]]" attribute-model-object="[[column.modelObject]]" attribute-object="[[_getAttributeObject(item, column.modelObject, column.columnIndex, index)]]" dependent-attribute-model-objects="[[_getDependentAttributeModels(column.modelObject)]]" dependent-attribute-objects="[[_getDependentAttributes(item, column.modelObject, index)]]" on-attribute-value-changed="_updateValue"></rock-attribute>
															</template>
															<template is="dom-if" if="[[column.columnObject.readOnly]]">
																<div title$="[[_columnValue(item, column.columnIndex)]]">
																	<span class$="[[_getCellClassValue(item, column.columnIndex)]]">[[_columnValue(item, column.columnIndex)]]</span>
																</div>
															</template>
														</a>
													</template>
													<template is="dom-if" if="[[!_hasLinkTemplate(column.columnObject, item)]]">
														<template is="dom-if" if="[[!column.columnObject.readOnly]]">
															<rock-attribute slot="cell-slot-content" index="[[index]]" context-data="[[_getContextData(column.columnIndex)]]" apply-locale-coalesce="" apply-graph-coalesced-style$="" item="[[item]]" row-index$="[[index]]" column-index$="[[column.columnIndex]]" functional-mode="grid" id="row[[index]]col[[column.columnIndex]]" class="attribute" mode="[[config.mode]]" attribute-model-object="[[column.modelObject]]" attribute-object="[[_getAttributeObject(item, column.modelObject, column.columnIndex, index)]]" dependent-attribute-model-objects="[[_getDependentAttributeModels(column.modelObject)]]" dependent-attribute-objects="[[_getDependentAttributes(item, column.modelObject, index)]]" tabindex="[[_getTabIndex()]]" on-attribute-value-changed="_updateValue"></rock-attribute>
														</template>
														<template is="dom-if" if="[[column.columnObject.readOnly]]">
															<!--Thumbnail and src will be computed and passed and rockimage viewer takes care of the value -->
															<template is="dom-if" if="[[_hasImage(column.columnObject, item)]]">
																<div slot="cell-slot-content" class="cell" title$="[[_columnValue(item, column.columnIndex, column.columnObject)]]">
																	<rock-image-viewer class="image-container" sizing="contain" src="[[_columnValue(item, column.columnIndex, column.columnObject)]]" thumbnail-id="[[_columnValue(item, column.columnIndex, column.columnObject)]]" asset-details="[[_getAssetDetails(item)]]">
																	</rock-image-viewer>
																</div>
															</template>
															<template is="dom-if" if="[[!_hasImage(column.columnObject, item)]]">
																<div slot="cell-slot-content" title$="[[_columnValue(item, column.columnIndex)]]">
																	<span class$="[[_getCellClassValue(item, column.columnIndex)]]">[[_columnValue(item, column.columnIndex)]]</span>
																</div>
															</template>
														</template>
													</template>
												</template>
											</data-table-column>
										</template>
									</template>
								</template>
							</pebble-data-table>
						</template>

						<template is="dom-if" if="[[_isReadyToShowMessagesPopover]]">
							<pebble-popover id="errorPopover" no-overlap>
								<pebble-error-list id="errorList"></pebble-error-list>
							</pebble-popover>
							<bedrock-pubsub target-id="errorList" event-name="fix-error" handler="_fixError"></bedrock-pubsub>
						</template>
					</template>
					<template is="dom-if" if="{{_isTileMode(config.viewMode)}}" restamp>
						<div hidden="[[_configPresent('tile')]]" class="msg default-message">Tile view of grid not configured.</div>
						<template is="dom-if" if="[[_configPresent('tile')]]">
							<grid-tile-view show-select-all="[[config.itemConfig.isMultiSelect]]" result-record-size="{{resultRecordSize}}" attribute-model-object="[[attributeModels]]" id="gridTileView" advance-selection-options="[[config.advanceSelectionOptions]]" advance-selection-enabled="[[config.advanceSelectionEnabled]]" items="[[data]]" grid-item-data-source="{{rDataSource}}" page-size="[[pageSize]]" multi-selection="{{config.itemConfig.isMultiSelect}}" selected-item="{{selectedItem}}" selected-items="{{selectedItems}}" tile-items="{{config.itemConfig}}" actions="{{_getArrayFromObject(config.viewConfig.tile.settings.actions)}}" selection-info="{{selectionInfo}}" title-pattern={{config.viewConfig.tile.settings.titlePattern}} sub-title-pattern={{config.viewConfig.tile.settings.subTitlePattern}}>
							</grid-tile-view>
						</template>
					</template>
					<template is="dom-if" if="{{_isListMode(config.viewMode)}}" restamp>
						<div hidden="[[_configPresent('list')]]" class="msg default-message">List view of grid not configured.</div>
						<template is="dom-if" if="[[_configPresent('list')]]">
							<grid-list-view id="gridListView" attribute-model-object="[[attributeModels]]" advance-selection-options="[[config.advanceSelectionOptions]]" advance-selection-enabled="[[config.advanceSelectionEnabled]]" items="[[data]]" grid-item-data-source="{{rDataSource}}" page-size="[[pageSize]]" multi-selection="{{config.itemConfig.isMultiSelect}}" selected-item="{{selectedItem}}" selected-items="{{selectedItems}}" schema-type="{{config.schemaType}}" list-items="{{config.itemConfig}}" actions="{{_getArrayFromObject(config.viewConfig.list.settings.actions)}}" selection-info="{{selectionInfo}}"></grid-list-view>
						</template>
					</template>
				</div>
			</div>
			<pebble-dialog id="gridMsgDialog" dialog-title="Confirmation" show-ok show-cancel show-close-icon alert-box modal>
				<p id="msgDialog"></p>
			</pebble-dialog>

			<pebble-dialog id="attributeDialog" dialog-title="Confirmation" button-cancel-text="Close" modal medium vertical-offset=1 50 horizontal-align="auto" vertical-align="auto" no-cancel-on-outside-click no-cancel-on-esc-key show-cancel show-close-icon>
				<div id="attrDialogContainer" style="height:80vh"></div>
			</pebble-dialog>

			<!-- relationship-dialog -->
			<pebble-dialog id="relationshipDialog" dialog-title="Confirmation" modal horizontal-align="auto" vertical-align="auto" no-cancel-on-outside-click no-cancel-on-esc-key show-close-icon>
				<div class="relationshipDialog-content">
					<div id="relDialogContainer" class="button-siblings">
					</div>
					<div class="buttonContainer-static">
						<pebble-button on-click="_closePopup" button-text="Close" class="close btn btn-secondary"></pebble-button>
					</div>
				</div>
			</pebble-dialog>
		</template>
		<bedrock-pubsub event-name="toggle-sidebar" handler="_flashTileview"></bedrock-pubsub>
		<bedrock-pubsub target-id="gridMsgDialog" event-name="on-buttonok-clicked" handler="_onDialogOk"></bedrock-pubsub>
		<bedrock-pubsub target-id="gridMsgDialog" event-name="on-buttoncancel-clicked" handler="_onDialogCancel"></bedrock-pubsub>
	    `;
    }
    
    static get observers() {
		return [
            '_calculatePageRange(currentRecordSize, pageSize,resultRecordSize)',
            '_computeTitle(config, data, currentRecordSize, sortOrder,resultRecordSize,rDataSource,config.viewMode, config.*)',
            '_setSelectionTitle(currentRecordSize,selectionInfo,selectedItems.*)',
            '_prepareConfig(config, attributeModels)',
            '_viewModeChanged(config.viewMode)',
            '_modeChange(config.mode)'
		]
    }

    static get properties() {
				return {
            data: {
                type: Array,
                notify: true,
                observer: '_gridDataLoad'
            },

            id: {
                type: String,
                value: 'pebbleDataTable'
            },
            /**
             *  If set as true , it indicates the component is in read only mode
             */
            readonly: {
                type: Boolean,
                value: false
            },
            /**
             * Indicates the number of items fetched at a time from the grid-data-source.
             */
            pageSize: {
                type: Number,
                notify: true,
                value: 0
            },
            /**
             * Indicates a config object which decides the rendering behavior.
             * The format for the JSON object is given in the above description.
             */
            config: {
                type: Object,
                value: function () {
                    return {}
                },
                notify: true
            },
            contextData: {
                type: Object,
                value: function () {
                    return {}
                }
            },
            /**
             * Indicates an identifier of grid-data-source component used for a particular grid.
             * It requires to reset the grid-data-source for a particular grid.
             */
            rDataSourceId: {
                type: String,
                value: ''
            },
            /**
             * Indicates a function that provides items lazily. The function receives the parameters such as `opts`, `callback`, and `err`.
             *
             * `opts.page` indicates a requested page index.
             *
             * `opts.pageSize` indicates the current page size.
             *
             * `opts.filter` indicates the current filter parameters.
             *
             * `opts.sortOrder` indicates the current sorting parameters.
             */
            rDataSource: {
                type: Function,
                notify: true
            },
            /**
             * Indicates an incremental data size for each page in the grid along with the use of "rDataSource" for virtualization.
             * The above description depicts on how to increase this `gridDataSize`.
             **/
            gridDataSize: {
                type: Number,
                notify: true,
                value: 0
            },
            /**
             * Indicates the total record size of the grid.
             * The above description depicts on how to increase this `currentRecordSize`.
             */
            currentRecordSize: {
                notify: true,
                type: Number,
                value: 0
            },
            /**
             * Indicates the total record size of the data available for the grid.
             *
             */

            resultRecordSize: {
                notify: true,
                type: Number,
                value: 0
            },
            /**
             * Indicates an attribute model to be use if the schema type is an <b>attribute</b>.
             */
            attributeModels: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            /**
             * Indicates an array that contains the selected items when `multiSelection` is set to true.
             * It indicates null if no item is selected.
             */
            selectedItems: {
                type: Array,
                value: function () {
                    return [];
                },
                notify: true
            },
            /**
             * Indicates the currently selected item when `multiSelection` is set to false.
             * It indicates null if no item is selected.
             */
            selectedItem: {
                type: Object,
                //value : {},
                notify: true
            },
            /**
             * Specifies whether or not multiple items are selected at once. When it is set to <b>true</b>,
             * you can select multiple items at once. In this case, it indicates an array of currently selected items.
             * When it is set to <b>false</b>, you can select only one item at a time.
             */
            multiSelection: {
                type: Boolean,
                value: false,
                notify: true
            },
            /**
             * Indicates the title for the grid.
             */
            title: {
                type: String,
                notify: true
            },
            /**
             * Indicates an array with a path and a sort order. The <b>`asc`</b> or <b>`desc</b>` pairs
             * are used to sort the items.
             */
            sortOrder: {
                type: Array,
                value: function () {
                    return [];
                },
                notify: true
            },
            /**
                    * Specifies whether or not a row tapping selects the item. If it is set to true, tapping a row selects the item.
    
                    */
            selectionEnabled: {
                type: Boolean,
                value: false
            },
            /**
             * Specifies whether or not grid header is shown.
             */
            noHeader: {
                type: Boolean,
                value: false
            },
            /**
             * <b><i>Content development is under progress... </b></i> 
             */
            maxConfiguredCount: {
                type: Number,
                value: 0
            },
            isDirty: {
                type: Boolean,
                value: false,
                notify: true
            },
            selectionInfo: {
                type: Object,
                value: function () {
                    return {}
                },
                observer: "_onSelectionInfoChange"
            },
            totalCount: {
                type: Number
            },
            selectionTitle: {
                type: String
            },

            minFilterLength: {
                type: Number,
                value: 1
            },
            isWorkflowCriterion: {
                type: Boolean,
                value: false
            },
            rowDragDropEnabled: {
                type: Boolean
            },

            applyLocaleCoalesceStyle: {
                type: Boolean,
                value: false
            },
            domain: {
                type: String
            },

            _pageRange: {
                value: ""
            },
            _attributeModelMap: {
                type: Object
            },
            _dataTableWidth: {
                type: Number
            },
            _fields: {
                type: Array,
                value: function () {
                    return [];
                },
                computed: '_getArrayFromObject(config.itemConfig.fields)'
            },
            _actions: {
                type: Array,
                value: function () {
                    return [];
                }
            },
            applyLocaleCoalesce: {
                type: Boolean,
                value: false
            },
            applyContextCoalesce: {
                type: Boolean,
                value: false
            },
            _inlineValidationEnabled: {
                type: Boolean,
                value: false
            },
            inlineReadValidationEnabled: {
                type: Boolean,
                value: false
            },
            inlineEditValidationEnabled: {
                type: Boolean,
                value: false
            },
            defaultSortingEnabled: {
                type: Boolean,
                value: true
            },
            enableColumnSelect: {
                type: Boolean,
                value: false
            },
            enableColumnMultiSelect: {
                type: Boolean,
                value: false
            },
            hideViewSelector: {
                type: Boolean,
                value: false
            },
            sortType: {
                type: String
            },
            hideToolbar: {
                type: Boolean,
                value: false
            },
            gridItemView: {
                type: Boolean,
                value: false
            },
            nestedAttributeMessage: {
                type: String,
                value: function () {
                    return "click here to see values ({noOfValues})";
                }
            },
            preSelectedItems: {
                type: [],
                value: function () {
                    return [];
                }
            },
            currentSelectedItem: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            dependentAttributeObjects: {
                type: Array,
                value: function () {
                    return [];
                }
            },
            dependentAttributeModelObjects: {
                type: Object,
                value: function () {
                    return {};
                }
            },
            _runningTabIndex: {
                type: Number,
                value: 1
            },
            selectedTotalCount: {
                type: Number
            },
            _sourceInfoPopover: {
                type: Element
            },
            applyGraphCoalescedStyle: {
                type: Boolean,
                value: false
            },
            controlDirty: {
                type: Boolean,
                value: false
            },
            _isReadyToShowMessagesPopover: {
                type: Boolean,
                value: false
            }
				}
    }

    /**
     * Fired when the user clicks on a item to select it.
     *
     * @event grid-selecting-item (pub-sub event)
     * @param {Object} detail
     * @param {Object} detail.item item to be selected
     */
    /**
     * Fired when the user clicks on a item to deselect it.
     *
     * @event grid-deselecting-item (pub-sub event)
     * @param {Object} detail
     * @param {Object} detail.item item to be deselected
     */
    /**
     * Fired when the user clicks on the select-all checkbox to select the items.
     *
     * @event grid-selecting-all-items (pub-sub event)
     * @param {Object} detail
     * @param {Object} detail.item containing current filters for items
     */
    /**
     * Fired when the user clicks on the select-all checkbox to deselect the items.
     *
     * @event grid-deselecting-all-items (pub-sub event)
     * @param {Object} detail
     * @param {Object} detail.item containing current filters for items
     */
    /**
     * Fired when the user clicks on a item to expand it.
     *
     * @event grid-expanding-item (pub-sub event)
     * @param {Object} detail
     * @param {Object} detail.item item to be expanded
     */
    /**
     * Fired when the user clicks on a item to collapse it.
     *
     * @event grid-collapsing-item (pub-sub event)
     * @param {Object} detail
     * @param {Object} detail.item item to be collapsed
     */

    constructor() {
        super();
    }

    /**
     * Indicates the data which is wrapped in a grid-data-source that is used as a "grid data".
     * The format for the JSON object is given in the above description.
     */
    _getTabIndex(attribute) {
				return this._runningTabIndex++;
    }
    
    _getContextData() {
				return this.contextData;
    }

    reloadListData() {
			import('./grid-list-view.js').then(() => {
                let listView = this.root.querySelector("#gridListView");
                if (listView) {
                    listView.reloadData();
                }
			})
    }
    
    reloadTileData() {
        import('./grid-tile-view.js').then(() => {
            let tileView = this.shadowRoot.querySelector("#gridTileView");
            if (tileView) {
                tileView.reloadData();
            }
        });
    }
    
    _onSelectionInfoChange() {
				let disable = false;
				if ((this.selectionInfo && this.selectionInfo.mode == "query")) {
            disable = true;
				}

				//set Enable/Disable the toolbar button
				let gridActionsEl = this._getToolbar();
				if (gridActionsEl) {
            gridActionsEl.setAttributeToToolbarButton("bulkdelete", "disabled", disable);
				}
    }
    
    _onToolbarEvent(e, detail) {
				let event = detail.name;

				switch (event.toLowerCase()) {
            case "refresh":
                this._onRefresh(e, detail);
                break;
            case "edit":
                this._modeChange('edit', detail);
                break;
            case "bulkedit":
                this._onBulkEdit(e, detail);
                break;
            case "bulkrelationshipedit":
                this._onBulkRelationshipEdit(e, detail);
                break;
            case "addrow":
                this._addNewRow(e, detail);
                break;
            case "download":
                this._onDownload(e, detail);
                break;
            case "upload":
                this._onUpload(e, detail);
                break;
            case "bulkdelete":
                this._onBulkDelete(e, detail);
                break;
            case "quickmanage": // Fire event and capture the event where needed
                this.fireBedrockEvent("quick-manage-event", detail, {
                    ignoreId: true
                });
                this._flashTileview();
                break;
            case "pagerange": // Just display, so no functionality here
                break;
            default:
                this.fireBedrockEvent("grid-custom-toolbar-event", detail);
                break;
				}
    }
    
    _addNewRow(e, detail) {
				//only to be used with tabular view static mode
				let newItem = {};
				newItem.status = 'new';
				newItem.errors = [];
				let oldsize = this.currentRecordSize;
				let data = this.getData();
				data.unshift(newItem);
				this.data = data;
				this._getIronDataTable()._sizeChanged(oldsize + 1, oldsize);
				this._getIronDataTable()._resetData(this.rDataSource);
				this.setRowMode(0, 'edit');
    }
    
    _prepareConfig(config, attributeModel) {
				if (this._fields && this._fields.length > 0 && attributeModel) {
            this._fields.forEach(function (column) {
                column.headerDescription = this._extractHeaderDescription(column);
                column.dataType = this._extractDataType(column);
            }.bind(this));
				}
    }
    
    _extractDataType(column) {
				let dataType = "";
				let attributeModel = this._getAttributeModelObject(column);
				if (attributeModel && attributeModel.properties) {
            dataType = attributeModel.properties.dataType;
				}
				return dataType;
    }
    
    _extractHeaderDescription(column) {
				let descriptionObject = {};
				let attributeModel = this._getAttributeModelObject(column);
				if (attributeModel && attributeModel.properties) {
            descriptionObject.description = attributeModel.properties.description;
				}
				return descriptionObject;
    }

    addNewRows(noOfRows) {
				let data = this.getData();
				for (let i = 0; i < noOfRows; i++) {
            let newItem = {};
            newItem.status = 'new';
            data.unshift(newItem);
				}

				this.data = data;
				let ironDataTable = this._getIronDataTable();
				if (ironDataTable) {
            let oldSize = ironDataTable.size;
            ironDataTable.size = oldSize + noOfRows.length;
				}
    }

    addNewRecords(records) {
				//                  Only to be used with tabular mode
				if (records && records.length > 0) {
            let ironDataTable = this._getIronDataTable();
            if (this.rDataSourceId) {
                if (ironDataTable) {
                    let _cachedItems = ironDataTable._cachedItems;
                    records.forEach(function (record) {
                        record._rowStatus = {
                            "status": "new",
                            "statusIcon": "pebble-icon:action-add"
                        };
                        _cachedItems.unshift(record);
                    }, this);
                    ironDataTable.items = _cachedItems;
                    this.currentRecordSize = ironDataTable.size;
                }
            } else {
                let data = this.getData();
                records.forEach(function (record) {
                    record._rowStatus = {
                        "status": "new",
                        "statusIcon": "pebble-icon:action-add"
                    };
                    data.unshift(record);
                }, this);
                this.data = data;
                if (ironDataTable) {
                    ironDataTable.size = data.length;
                }
                this.reRenderGrid();
            }

            setTimeout(() => {
                this._modeChange('edit');
            }, 0);
				}
    }

    _closePopup(e) {
				this.shadowRoot.querySelector("#relationshipDialog").close();
    }

    getIsDirty() {
				if (this.config && (this.config.mode || "").toLowerCase() == "read") {
            return false;
				}

				let data = this.getData();
				if (data && data.length > 0) {
            for (let i = 0; i < data.length; i++) {
                if (data[i]._rowStatus && data[i]._rowStatus.status) {
                    if (data[i]._rowStatus.status == "update" || data[i]._rowStatus.status == "new") {
                        return true;
                    }
                }
            }
				}

				return false;
    }
    
    _isIconColumn(col) {
				return (col.icon && col.icon != "") || col.iconColumn;
    }
    
    getControlIsDirty() {
				//To-do Need to have logic to check whether selected Item attr is updated in quick manage
				// Currently allowing selectedItems is only one.. assuming that one item is selected and page is not dirty.

				let editMode = this.get('config.mode') === "edit";

				let rockAttributeObj = dom(this.root).querySelectorAll('rock-attribute');
				let rockAttributeDirty = false;
				if (rockAttributeObj && rockAttributeObj.getControlIsDirty) {
            rockAttributeDirty = rockAttributeObj.getControlIsDirty();
				}

				return this.controlDirty || rockAttributeDirty || editMode;
    }
    
    getItemFromData(item) {
				if (item.id && item.type) {
            let data = this.getData();
            if (data && data.length) {
                for (let i = 0; i < data.length; i++) {
                    if ((data[i].id == item.id) && (data[i].type == item.type)) {
                        return data[i];
                    }
                }
            }
				}
				return;
    }
    
    _isDataLoaded(ev) {
				if (ev && ev.detail && ev.detail.item) {
            this.fireBedrockEvent("grid-data-loaded");
            if (!_.isEmpty(this.preSelectedItems)) {
                //set selected item here
                if (this.preSelectedItems.length > 0) {
                    for (let item of this.preSelectedItems) {
                        if (item.id && item.type) {
                            let preSelectItem = this.getItemFromData(item)
                            if (preSelectItem) {
                                this.selectItem(preSelectItem);
                                if (item.partialRefresh) {
                                    this.fireBedrockEvent("quick-manage-event", {
                                        enableQuickManage: true
                                    }, {
                                        ignoreId: true
                                    });
                                }
                            }
                        }
                    }
                    this.set("preSelectedItems", []);
                }

            }
            if (this.currentRecordSize == 0) {
                let gridData = this.getData();
                if (gridData && gridData.length > 0) {
                    this.currentRecordSize = gridData.length;
                }
            }
				}

    }
    
    refresh(options) {
				//Resetting preSelectItem
				this.preSelectedItems = []
				let _isRefresh = true;

				if (options && options.partialRefresh) {
            //_isRefresh = false;
            if (this.selectedItem && this.selectedItem.id && this.selectedItem.type) {
                if (options.selectedItem && options.selectedItem.id && options.selectedItem.type) {
                    if ((this.selectedItem.id == options.selectedItem.id) &&
                        (this.selectedItem.type == options.selectedItem.type)) {
                        let clonedSelectedItem = DataHelper.cloneObject(options.selectedItem);
                        clonedSelectedItem.partialRefresh = true;
                        this.push("preSelectedItems", clonedSelectedItem);
                        _isRefresh = true;
                    }
                }
            }
            //if (!_isRefresh && options.toastData) {
            //let notificationObj = RUFUtilities.mainApp.$$('bedrock-dataobject-notification-handler');
            //notificationObj.showToast(options.toastData);
            //}

				}
				if (_isRefresh) {
            this._onRefresh();
				}
    }

    connectedCallback() {
				super.connectedCallback();
				this.addEventListener('selecting-item', this._onSelectingItem);
				this.addEventListener('deselecting-item', this._onDeselectingItem);
				this.addEventListener('selecting-all-items', this._onSelectingAllItems);
				this.addEventListener('deselecting-all-items', this._onDeselectingAllItems);
				this.addEventListener('expanding-item', this._onExpandingItem);
				this.addEventListener('collapsing-item', this._onCollapsingItem);
				this.addEventListener('sort-direction-changed', this._sortDirectionChanged);
				this.addEventListener('is-data-loaded', this._isDataLoaded);
				this.addEventListener('items-filtered', this._onFilteringItems);

    }

    disconnectedCallback() {
				super.disconnectedCallback();
				this.removeEventListener('selecting-item', this._onSelectingItem);
				this.removeEventListener('deselecting-item', this._onDeselectingItem);
				this.removeEventListener('selecting-all-items', this._onSelectingAllItems);
				this.removeEventListener('deselecting-all-items', this._onDeselectingAllItems);
				this.removeEventListener('expanding-item', this._onExpandingItem);
				this.removeEventListener('collapsing-item', this._onCollapsingItem);
				this.removeEventListener('sort-direction-changed', this._sortDirectionChanged);
				this.removeEventListener('is-data-loaded', this._isDataLoaded);
				this.removeEventListener('items-filtered', this._onFilteringItems);
    }

    getData() {
				if (this.config.viewMode == "List") {
            let listView = this.shadowRoot.querySelector("#gridListView");
            if (listView) {
                return listView.items;
            }
				} else if (this.config.viewMode == "Tile") {
            let tileView = this.shadowRoot.querySelector("#gridTileView");
            if (tileView) {
                return tileView.items;
            }
				} else {
            let filteredData = [];
            let ironDataTable = this._getIronDataTable();
            if (ironDataTable) {
                if (this.data && this.data.length > 0) {
                    return ironDataTable.items;
                }
                let allData = ironDataTable.$.list.items;
                if (allData && allData.length > 0) {
                    let sumedLength = allData.length - this.pageSize;
                    let lastPageData;
                    if (sumedLength > 0) {
                        lastPageData = allData.slice(allData.length - this.pageSize, allData.length);
                    } else {
                        lastPageData = allData;
                    }
                    let lastPageFilteredData = lastPageData.filter(function (element) {
                        if (element != undefined) {
                            let keys = Object.keys(element);
                            if (!(keys.length <= 0 || (keys.length == 1 && keys[0] == "errors"))) {
                                return element;
                            }
                        }
                    });
                    if (allData.length > this.pageSize) {
                        filteredData = allData.slice(0, allData.length - this.pageSize);
                        if (lastPageFilteredData && lastPageFilteredData.length) {
                            lastPageFilteredData.forEach(function (item) {
                                filteredData.push(item);
                            }, this);
                        }
                    } else {
                        filteredData = lastPageFilteredData;
                    }
                }
            }
            return filteredData;
				}
    }
    
    getModifiedData() {
				let modifiedData = [];
				let gridData = this.getData();
				if (gridData && gridData.length > 0) {
            gridData.forEach(function (data) {
                if (data && !_.isEmpty(data["_rowStatus"])) {
                    let _status = data["_rowStatus"]["status"];
                    if (!_.isEmpty(_status)) {
                        if (_status == "update" || _status == "new" || _status == "delete") {
                            modifiedData.push(data);
                        }
                    }
                }
            }, this);
				}
				return modifiedData;
    }
    
    reRenderGrid() {
				if (!this.config) {
            return;
				}
				if (this.config.mode.toLowerCase() == "read") {
            this._inlineValidationEnabled = this.inlineReadValidationEnabled;
				}
				let dropdown = this.shadowRoot.querySelector("#viewMode");
				if (dropdown) {
            dropdown.disabled = false;
				}
				if (typeof (this.rDataSource) == 'function') {
            if (this.rDataSourceId) {
                let dataSourceElement = ComponentHelper.getParentElement(dom(this).node).shadowRoot.querySelector('#' +
                    this.rDataSourceId)
                if (dataSourceElement) {
                    dataSourceElement.resetDataSource();
                }
            }
            if (this.config.viewMode == "List") {
                this.reloadListData();
            } else if (this.config.viewMode == "Tile") {
                this.reloadTileData();
            } else {
                if (this._getIronDataTable()) {
                    this._getIronDataTable()._resetData(this.rDataSource);
                }
            }
				} else {
            let self = this;
            this.fireBedrockEvent('refresh-grid', self);
				}
				this.fireBedrockEvent('grid-data-refreshed', null, {
            ignoreId: true
				});
				this.clearSelection();
				this._resetAdvanceSelection();
    }
    
    _resetAdvanceSelection() {
				if (this.config.viewMode == "Tabular") {
                    let getPebbleDataTable = this.shadowRoot.querySelector(this.id);
                    if (getPebbleDataTable && getPebbleDataTable.resetAdvanceSelection) {
                        getPebbleDataTable.resetAdvanceSelection();
                    }
				} else if (this.config.viewMode == "List") {
                    import('./grid-list-view.js').then(() => {
                        let getgridListView = this.shadowRoot.querySelector("#gridListView");
                        if (getgridListView && getgridListView.resetAdvanceSelection) {
                            getgridListView.resetAdvanceSelection();
                        }
                    })
				} else if (this.config.viewMode == "Tile") {
                    import('./grid-tile-view.js').then(() => {
                        let getgridTileView = this.shadowRoot.querySelector("#gridTileView");
                        if (getgridTileView && getgridTileView.resetAdvanceSelection) {
                            getgridTileView.resetAdvanceSelection();
                        }
                    })
				}
    }

    clearCache() {
				let ironDataTable = this._getIronDataTable();
				ironDataTable.clearCache();
    }
    
    refreshPage(page) {
				let ironDataTable = this._getIronDataTable();
				if (ironDataTable) {
            ironDataTable.refreshPage(page);
				}
    }

    selectAll() {
				let ironDataTable = this._getIronDataTable();
				ironDataTable.selectAll();
    }
    
    clearSelection() {
				if (this.config.viewMode == "List") {
                    import('./grid-list-view.js');
                        let listView = this.shadowRoot.querySelector("#gridListView");
                        if (listView) {
                            listView.clearSelection();
                        }
                    
				} else if (this.config.viewMode == "Tile") {
                    import('./grid-tile-view.js');
                        let tileView = this.shadowRoot.querySelector("#gridTileView");
                        if (tileView) {
                            tileView.clearSelection();
                        }                    
				} else {
            let ironDataTable = this._getIronDataTable();
            if (ironDataTable) {
                ironDataTable.clearSelection();
            }
				}
    }

    selectItem(item) {
				if (this.config.viewMode == "Tile") {
            let tileView = this.shadowRoot.querySelector("#gridTileView");
            tileView.selectItem(item);
				} else if (this.config.viewMode == "List") {
            let listView = this.shadowRoot.querySelector("#gridListView");
            listView.selectItem(item);
				} else {
            let ironDataTable = this._getIronDataTable();
            ironDataTable.selectItem(item);
				}
    }

    deselectItem(item) {
				if (this.config.viewMode == "Tile") {
            let tileView = this.shadowRoot.querySelector("gridTileView");
            tileView.deselectItem(item);
				} else if (this.config.viewMode == "List") {
            let listView = this.shadowRoot.querySelector("gridListView");
            listView.deselectItem(item);
				} else {
            let ironDataTable = this._getIronDataTable();
            ironDataTable.deselectItem(item);
				}
    }
    
    expandItem(item) {
				let ironDataTable = this._getIronDataTable();
				ironDataTable.expandItem(item);
    }

    collapseItem(item) {
				let ironDataTable = this._getIronDataTable();
				ironDataTable.collapseItem(item);
    }
    
    getSelectedItem() {
				let ironDataTable = this._getIronDataTable();
				return ironDataTable.selectedItem;
    }

    getSelectedItems() {
				if (!this.selectedItems.inverted) {
            return this.selectedItems;
				} else {
            let items = this.getData();
            this.selectedItems.forEach(function (item) {
                let index = items.indexOf(item);
                if (index > -1) {
                    items.splice(index, 1);
                }
            });
            return items;
				}
    }

    getSelectionMode() {
				if (this.selectionInfo && this.selectionInfo.mode) {
            return this.selectionInfo.mode;
				}
				return 'count'; //default value
    }

    _isStatusOrInlineValidationEnabled(statusEnabled, mode) {
				return this._isStatusEnabled(statusEnabled, mode) || this._isInlineValidationEnabled();
    }

    _isStatusEnabled(statusEnabled, mode) {
				return statusEnabled && mode === 'edit';
    }

    _isInlineValidationEnabled() {
				if (this.config && this.config.mode) {
            if (this.config.mode.toLowerCase() == "edit") {
                return this.inlineEditValidationEnabled;
            } else {
                return this.inlineReadValidationEnabled;
            }
				}
    }

    _changeToEditMode(detail) {
				this.set('config.mode', "edit");
				if (this.config.viewMode != "Tabular") {
            this.set('config.viewMode', "Tabular");
				}
				let dropdown = this.shadowRoot.querySelector("#viewMode");
				if (dropdown) {
            dropdown.disabled = true;
				}
				if (detail && detail.tooltip && detail.tooltip == "Edit") {
            this.refresh();
				}
				this._dataChanged();
    }

    _modeChange(mode, detail) {
				this.defaultSortingEnabled = true;
				switch (mode) {
            case 'edit':
                this._inlineValidationEnabled = this.inlineEditValidationEnabled;
                this._changeToEditMode(detail);
                break;
            case 'read':
                this._inlineValidationEnabled = this.inlineReadValidationEnabled;
                this._changeToReadMode();
                break;
				}
				let domRepeats = this.root.querySelectorAll("#actionsDomRepeat");
				if (!_.isEmpty(domRepeats)) {
            for (let domRepeat of domRepeats) {
                let item = (domRepeat.parentElement && domRepeat.parentElement.parentElement) && domRepeat.parentElement.parentElement.item;
                domRepeat.items = this._getActions(mode, item);
                domRepeat.render();
            }
				}
				let attrs = this.root.querySelectorAll('rock-attribute');
				if (attrs && attrs.length) {
            for (let i = 0, l = attrs.length; i < l; i++) {
                attrs[i].mode = mode;
            }
				}
    }

    _changeToReadMode() {
				this.set('config.mode', "read");
				let data = this.data ? this.data : this.getData();
				if (data && data.length) {
            data.forEach(function (item) {
                if (item._rowStatus) {
                    if (item._rowStatus.status && item._rowStatus.status == "new" || item._rowStatus.status == "update") {
                        item._rowStatus.status = "read";
                        item._rowStatus.statusIcon = "";
                    }
                }
            }, this);
            if (this.data && this.data.length) {
                this.data = [];
                this.data = data;
            }
				}
				this.reRenderGrid();
    }
    
    changeToReadMode() {
				this._modeChange('read');
    }
    
    changeToEditMode() {
				this._modeChange('edit');
    }
    
    openGridMsgDialog(msg) {
				this.shadowRoot.querySelector('#msgDialog').innerText = msg;
				this.shadowRoot.querySelector('#gridMsgDialog').open();
    }
    
    _computeTitle(config, data, currentRecordSize, sortOrder) {
				let status = "";
				if (config && config.header && config.header.displayTitle) {
            if (config.title) {
                this.set('title', config.title);
            }
            this.set('title', config.header.defaultValue);
				} else if (currentRecordSize) {
            let resultRecordSize = this.resultRecordSize ? this.resultRecordSize : currentRecordSize;
            if (resultRecordSize != 0 && resultRecordSize == this.maxConfiguredCount) {
                resultRecordSize = this.maxConfiguredCount + "+";
            }
            status = "Showing 1 - " + currentRecordSize + " items of total " + resultRecordSize + " results ";
            if (data && sortOrder && sortOrder.length > 0) {
                status += ' Sorted by ';
                //TODO:: Commented code for now since system doesn't support multiple column support.
                //for (var i = 0; i < sortOrder.length; i++) {
                let sort = sortOrder[sortOrder.length - 1];
                status += sort.path + ' ' + sort.direction;
                // if (i < sortOrder.length - 1) {
                // 	status += ', ';
                // }
                //}
            }

				} else {
            status = "Showing 0 result ";
				}
				if (config) {
            if (config.titleTemplates) {
                if (config.titleTemplates.contextTemplate) {
                    let matchFound = false;
                    let message = config.titleTemplates.contextTemplate.replace(/\{\S+?\}/g,
                        function (match) {
                            let attrName = match.replace("{", "").replace("}", "");
                            if (config.dataContexts) {
                                for (let i = 0; i < config.dataContexts.length; i++) {
                                    let context = config.dataContexts[i];
                                    if (context[attrName]) {
                                        if (matchFound) {
                                            match += ", " + context[attrName];
                                        } else {
                                            match = context[attrName];
                                            matchFound = true;
                                        }

                                    }
                                }
                            }
                            if (config.valueContexts) {
                                for (let i = 0; i < config.valueContexts.length; i++) {
                                    let context = config.valueContexts[i];
                                    if (context[attrName]) {
                                        if (matchFound) {
                                            match += context[attrName];
                                        } else {
                                            match = context[attrName];
                                            matchFound = true;
                                        }
                                    }
                                }
                            }
                            return match;
                        });
                    if (matchFound) {
                        status += message;
                    }
                }

                if (config.titleTemplates.compareEntitiesTitle) {
                    let entityColumns = this._fields.filter(function (item) {
                        if (!item.isRowHeader) {
                            return item;
                        }
                    });
                    status = config.titleTemplates.compareEntitiesTitle.replace("{noOfEntities}", entityColumns.length).replace(
                        "{noOfAttributes}", data ? data.length : config.itemConfig.rows.length);
                }
            }

            if (config.workflowTitle) {
                status += ": " + config.workflowTitle;
            }


				}
				this.set('title', status);
    }
    
    _calculatePageRange(currentRecordSize, pageSize, resultRecordSize) {
				if (!(currentRecordSize === undefined || pageSize === undefined || resultRecordSize === undefined)) {
            let from = currentRecordSize && currentRecordSize > 0 ? 1 : 0;

            if (resultRecordSize) {
                this._pageRange = from + " - " + currentRecordSize + " / " + (resultRecordSize > 0 && resultRecordSize == this.maxConfiguredCount ?
                    this.maxConfiguredCount + "+" : resultRecordSize);
            } else {
                this._pageRange = from + " - " + currentRecordSize + " / " + currentRecordSize;
            }

            //Set range to pebble-toolbar
            this._setPageRange();
				}
    }
    
    _setPageRange() {
				let gridActionsEl = this._getToolbar();
				if (gridActionsEl) {
            gridActionsEl.setPageRange(this._pageRange);
				}
    }
    
    _getToolbar() {
				//Finding element under slot
				let gridActionsEl = this._getSlotNode("gridActions");
				//Find default toolbar
				if (!gridActionsEl) {
            gridActionsEl = this.root.querySelector("#gridActions"); //need to confirm this https://github.com/Polymer/polymer/issues/4228
				}
				return gridActionsEl;
    }
    
    _getSlotNode(id) {
				let slotNodes = FlattenedNodesObserver.getFlattenedNodes(this).filter(n => n.nodeType === Node.ELEMENT_NODE);
				let slotNode;
				for (let i = 0; i < slotNodes.length; i++) {
            if (slotNodes[i].getAttribute("id") == id) {
                slotNode = slotNodes[i];
                break;
            }
				}
				return slotNode;
    }
    
    _isToolbarSlotEmpty() {
				let gridActionsEl = this._getSlotNode("gridActions");
				return !gridActionsEl;
    }
    
    _columnValue(gridData, index, columnObj) {
				let cellData;
				let columnName = this._fields[index].name;
				let defaultValue = this._fields[index].defaultValue;

                if(this.config.schemaType == "attribute" && gridData && gridData.attributes && gridData.attributes[columnName]){
                    cellData = this._formatValue(gridData.attributes[columnName].value, columnName);
                }
                else{
                    cellData = this._formatValue(gridData[columnName], columnName);
                    if(_.isEmpty(cellData) && defaultValue){
                        cellData = defaultValue;
                    }
                }

				//Pick thumbnailid from entity properties
				if (!cellData && this._hasImage(columnObj)) {
            if (gridData && gridData.properties && gridData.properties[columnName]) {
                cellData = gridData.properties[columnName];
            }
				}

				if (cellData != undefined) {
            index++;
				}

				if (typeof (cellData) === "boolean") {
            return cellData.toString();
            //Had to manually convert to string because pebble-boolean is not working when you pass boolean.
                }
                if(cellData instanceof Array && cellData.length >0){
					return cellData[0].toString();
				}

				return cellData;
    }
    
    _columnIcon(gridData, index) {
				let cellData;
				let icon = this._fields[index].icon;
				if (this.config.schemaType == "attribute") {
            if (icon) {
                cellData = icon;
            }
				}

				return cellData;
    }

    _columnIconTooltip(gridData, index) {
				let cellData;
				let iconTooltip = this._fields[index].iconTooltip;
				if (this.config.schemaType == "attribute") {
            if (iconTooltip) {
                cellData = iconTooltip;
            }
				}
				return cellData;
    }

    _formatValue(value, columnName) {
				if (this.attributeModels.hasOwnProperty(columnName)) {
            let dataType = this.attributeModels[columnName].dataType.toLowerCase();
            //formatting for date & time
            if (dataType == "datetime" || dataType == "date") {
                return FormatHelper.convertFromISODateTime(value, dataType);
            }

            //formatting for object collections
            if (this.attributeModels[columnName].isCollection && this.attributeModels[columnName].dataType.toLowerCase() !==
                "nested") {
                return this._formatCollectionAttributeValueForGrid(value, columnName);
            }
				}
				return value;
    }
    
    _formatCollectionAttributeValueForGrid(value, columnName) {
				//formatting for object collections
				if (!_.isEmpty(value) && Array.isArray(value)) {
            let resultString = value[0];
            for (let i = 1; i < value.length; i++) {
                resultString = resultString + ',' + value[i];
            }
            return resultString;
				} else {
            return value;
				}
    }
    
    _isTabularMode(viewMode) {
				return viewMode == 'Tabular';
    }
    
    _isTileMode(viewMode) {
				return viewMode == 'Tile';
    }
    
    _isListMode(viewMode) {
				return viewMode == 'List';
    }
    
    _getAttributeModelObject(col) {
				if(!col) {
            return {};
				}

				let displayType = "";
				if (this.config.schemaType == undefined || this.config.schemaType == "simple") {
            if (!col.displayType) {
                col.displayType = col.editType;
            }

            return col;
				} else if (this.config.schemaType == "attribute" || this.config.schemaType == "colModel") {
            if (this.attributeModels[col.name]) {
                return this.attributeModels[col.name];
            } else {
                return {};
            }
				}
    }
    
    _getAttributeRowModelObject(attrName) {
				// var displayType = "";
				// if (this.config.schemaType == undefined || this.config.schemaType == "simple") {
				// 	if (!col.displayType) {
				// 		col.displayType = col.editType;
				// 	}

				// 	return col;
				// } else if (this.config.schemaType == "attribute" || this.config.schemaType == "colModel") {
				// 	if (this.attributeModels[col.name]) {
				// 		return this.attributeModels[col.name];
				// 	}
				// 	else {
				// 		return {};
				// 	}
				// }
				if (attrName && this.attributeModels) {
            return this.attributeModels[attrName];
				}
    }
    
    _getAttributeObject(item, currentAttributeModelObject, columnIndex, index) {
				if(!item) {
            return;
				}

				let columnName = this._fields[columnIndex].name;
				/**
				 * When item[columnName] is undefined, initial value of attributeObject passed to
				 * attribute control is 'undefined'. In later iterations when item[columnName] has value or
				 * empty string/array/object, value is changed and attribute control value change observer fired which
				 * making the attribute dirty in turn parent nested too dirty without any user interaction.
				 * Hence sending default value based on attribute model will reduce observer calls and
				 * multiple rendering of attributes grid.
				 * Note: This issue is observable only in build. Not replicable with local unbundled code.
				 * */
				let value = item[columnName];
				if (typeof value === 'undefined') {
            value = "";
            if (currentAttributeModelObject.isCollection) {
                value = [];
            }
				}
				let attributeObject = {
            "name": currentAttributeModelObject.name,
            "value": value
				};
				if (this.config.schemaType == "attribute" && item.attributes && item.attributes.hasOwnProperty(columnName)) {
            if (item.attributes[columnName].referenceDataId) {
                attributeObject["referenceDataId"] = item.attributes[columnName].referenceDataId;
            }
            if (item.attributes[columnName].properties) {
                attributeObject["properties"] = item.attributes[columnName].properties;
            }
            if (item.attributes[columnName].contextCoalescePaths) {
                attributeObject["contextCoalescePaths"] = item.attributes[columnName].contextCoalescePaths;
            }
            if (item.attributes[columnName].os === "graph" && item.attributes[columnName].osid && item.attributes[columnName].ostype) {
                attributeObject["os"] = item.attributes[columnName].os;
                attributeObject["osid"] = item.attributes[columnName].osid;
                attributeObject["ostype"] = item.attributes[columnName].ostype;
            }
				}
				if (this.config.schemaType == "colModel") {
            if (item[columnName + "_referenceDataId"]) {
                attributeObject["referenceDataId"] = item[columnName + "_referenceDataId"];
            }
            if (item[columnName + "_properties"]) {
                attributeObject["properties"] = item[columnName + "_properties"];
            }
            if (item[columnName + "_contextCoalescePaths"]) {
                attributeObject["contextCoalescePaths"] = item[columnName + "_contextCoalescePaths"];
            }
            if (item["contextCoalescePaths"]) {
                attributeObject["contextCoalescePaths"] = item["contextCoalescePaths"];
            }
            if (item[columnName + "_os"] === "graph" && item[columnName + "_osid"] && item[columnName + "_ostype"]) {
                attributeObject["os"] = item[columnName + "_os"];
                attributeObject["osid"] = item[columnName + "_osid"];
                attributeObject["ostype"] = item[columnName + "_ostype"];
            }
				}
				if (this._fields.length == columnIndex + 1) {
            this._updateError(item, index);
				}

				return attributeObject;
    }

    _isFilterEnabled(col) {
				return col.filterable ? col.name : undefined;
    }

    _isSortable(col) {
				return col.sortable ? col.name : undefined;
    }
    
    _getColumnSortType(col) {
				if (this.config && this.config.itemConfig && this.config.itemConfig.sort && this.config.itemConfig.sort.default) {
            const sortColumn = DataHelper._findItemByKeyValue(this.config.itemConfig.sort.default, "field", col.name);
            if (!_.isEmpty(sortColumn)) {
                return sortColumn.sortType;
            }
				}
    }
    
    _getColumnDataType(col) {
				if (col && !_.isEmpty(col) && col.dataType) {
            return col.dataType;
				}
    }
    
    _dataIsNotNull(config, attributeModels) {
				let result = typeof (config) == "object" && Object.keys(config).length ? true : false;
				if (result) {
                    if ((config.schemaType == "attribute" || config.schemaType == "colModel") && Object.keys(attributeModels).length ==	                    
                        0) {
                        let metaDataColumnFound = false;
                        if (config.itemConfig && !_.isEmpty(config.itemConfig.fields)) {
                            let fields = config.itemConfig.fields;
                            for (let key in fields) {
                                if (fields[key].isMetaDataColumn) {
                                    metaDataColumnFound = true;
                                    break;
                                }
                            }
                        }    	                       
                        result = metaDataColumnFound;	
                     }
                    if (DataHelper.isValidObjectPath(config, 'viewConfig.tabular.settings.actions')) {
                        this._actions = this._getArrayFromObject(this.config.viewConfig.tabular.settings.actions);

                        //TODO : This has to be moved to some helper.
                        if (this.applyContextCoalesce) {
                            this._actions.push({
                                "name": "sourceInfo",
                                "icon": "pebble-icon:hierarchy",
                                "text": "",
                                "visible": true,
                                "tooltip": "Source Info",
                                "intent": "read"
                            });
                        }
                    }
				}

				return result;
    }
    
    _onRefresh(e, detail) {
				this.reRenderGrid();
				let eventDetail = {
            "invalidateEntityCache": true
				};
				this.fireBedrockEvent("grid-refresh-items", eventDetail);
    }
    
    _onBulkEdit(e) {
				this.fireBedrockEvent("grid-bulk-edit-items");
    }
    
    _onBulkRelationshipEdit(e) {
				this.fireBedrockEvent("grid-bulk-relationship-edit-items");
    }
    
    _onBulkDelete(e) {
				this.fireBedrockEvent("grid-bulk-delete-items", e.detail);
    }
    
    _onDownload(e) {
				this.fireBedrockEvent("grid-download-item",e.detail);
    }
    
    _onUpload(e, detail) {
				//this.clearSelection();
				this.fireBedrockEvent("grid-upload-item");
    }
    
    _getIronDataTable() {
				return ElementHelper.getElement(this, "pebble-data-table");
    }
    
    _getIronList(elementId) {
				let view = this.shadowRoot.querySelector("#" + elementId)
				return ElementHelper.getElement(view, "iron-list");
    }

    resetControlDirty() {
				this.controlDirty = false;
    }
    
    _onSelectingItem(e) {
				this.controlDirty = true;
				this.fireBedrockEvent("grid-selecting-item", e.detail);
    }
    
    _onDeselectingItem(e) {
				this.controlDirty = true;
				this.fireBedrockEvent("grid-deselecting-item", e.detail);
    }
    
    _onSelectingAllItems(e) {
				this.controlDirty = true;
				this.fireBedrockEvent("grid-selecting-all-items", e.detail);
    }
    
    _onDeselectingAllItems(e) {
				this.controlDirty = true;
				this.fireBedrockEvent("grid-deselecting-all-items", e.detail);
    }
    
    _onExpandingItem(e) {
				this.fireBedrockEvent("grid-expanding-item", e.detail);
    }
    
    _onCollapsingItem(e) {
				this.fireBedrockEvent("grid-collapsing-item", e.detail);
    }
    
    _dataChanged() {
				//TO-DO will get changed
				this.dispatchEvent(new CustomEvent('editMode', {
            bubbles: true,
            composed: true
				}));
    }
    
    _onFilteringItems() {
				let ironDataTable = this._getIronDataTable();
				let filteredItems = ironDataTable.getFilteredItems();
				this.currentRecordSize = filteredItems ? filteredItems.length : 0;
    }
    
    _actionValue(action) {
				if (action) {
            let icon = action.icon;
            if (!icon) {
                if (action.name == 'delete') {
                    return 'pebble-icon:action-delete';
                } else if (action.name == 'edit') {
                    return 'pebble-icon:action-edit'
                } else {
                    return '';
                }
            }
            return icon;
				}
    }
    
    _updateValue(e) {
				let columnIndex = typeof e.target.column === 'undefined' ? e.target.__dataHost.column.columnIndex : e.target.column
            .columnIndex;
				let item = e.target.item;
				let value = e.detail.value;
				let columnName = this._fields[columnIndex].name;
				let row = this._getParentRow(e.currentTarget);
				let status = "";
				let referenceDataId = e.detail.referenceDataId ? e.detail.referenceDataId : undefined;
				let selectedLocales = e.detail.selectedLocales ? e.detail.selectedLocales : undefined;

				if (this.config.schemaType == undefined || this.config.schemaType == "simple" || this.config.schemaType ==
            "colModel") {
            let columnOriginalValue = columnName + "_originalValue";

            if (item[columnOriginalValue] || item[columnOriginalValue] == "") {
                if (item[columnOriginalValue] != value) {
                    status = "update";
                } else {
                    status = "read";
                }
            } else {
                item[columnOriginalValue] = item[columnName] ? item[columnName] : "";
                status = "update";
            }
            item[columnName] = value;
            if (referenceDataId) {
                item[columnName + "_referenceDataId"] = referenceDataId;
            }

            if (selectedLocales) {
                item[columnName + "_selectedLocales"] = selectedLocales;
            }

            this._updateRowStatus(item, status);
            this._addClassOnUpdateRow(e);

				} else if (this.config.schemaType == "attribute") {
            if (item.attributes.hasOwnProperty(columnName)) {
                if (item.attributes[columnName]._originalValue || item.attributes[columnName]._originalValue == "") {
                    if (item.attributes[columnName]._originalValue != value) {
                        status = "update";
                    } else {
                        status = "read";
                    }
                } else {
                    item.attributes[columnName]._originalValue = item.attributes[columnName] && item.attributes[columnName].value ?
                        item.attributes[columnName].value : "";
                    status = "update";
                }
                item.attributes[columnName].value = value;
                this._updateRowStatus(item, status);
            }
				}

				if (row) {
            let rowStatusIcon = row.querySelector('pebble-icon[id="rowStatus"]');
            if (rowStatusIcon) {
                if (item._rowStatus) {
                    if (item._rowStatus.status == "update") {
                        item._rowStatus.statusIcon = rowStatusIcon.icon = "pebble-icon:action-edit";
                    } else if (item._rowStatus.status == "read") {
                        item._rowStatus.statusIcon = rowStatusIcon.icon = "";
                    }
                } else {
                    rowStatusIcon.icon = "";
                    item._rowStatus = {
                        "statusIcon": ""
                    };
                }
            }
				}
				let index = e.currentTarget.index;
				this._updateError(item, index);
				this.notifyPath("isDirty", undefined);
				this.isDirty = this.getIsDirty();

				let attribute = e.currentTarget || e.sourceElement;
				let isRevertClicked = e.detail.revertClicked;
				this._updateDependentAttributes(attribute, row.index, isRevertClicked);
    }

    _updateDependentAttributes(currentAttribute, rowIndex, isRevertButtonClicked) {
				let dependentAttributeElements = this.getDependentAttributeElementsInRow(currentAttribute, rowIndex);
				DataHelper.updateDependentAttributeElements(dependentAttributeElements, currentAttribute, isRevertButtonClicked);
    }

    getDependentAttributeElementsInRow(currentAttribute, rowIndex) {
				let node = dom(this).node;
				let allAttributeElements = dom(this).node.querySelectorAll('rock-attribute[row-index="' + rowIndex + '"]');
				if (allAttributeElements == undefined || allAttributeElements.length == 0) {
            allAttributeElements = dom(this).node.root.querySelectorAll('rock-attribute[row-index="' + rowIndex +
                '"]');
				}

				return DataHelper.getDependentAttributesOfAttribute(allAttributeElements, currentAttribute);
    }
    
    getAllAttributeElements() {
				let node = dom(this).node;
				let allAttributeElements = dom(this).node.querySelectorAll('rock-attribute');
				if (allAttributeElements == undefined || allAttributeElements.length == 0) {
            allAttributeElements = dom(this).node.root.querySelectorAll('rock-attribute');
				}

				return allAttributeElements;
    }
    
    _fireActionEvent(e) {
				let action = e.model.action;
				let eventName = action.eventName;
				let detail = e.currentTarget.item;
				if (!eventName) {
            if (action.name.toLowerCase() == 'delete') {
                eventName = "grid-delete-item";
            } else if (action.name.toLowerCase() == 'edit') {
                eventName = "grid-edit-item";
            } else if (action.name.toLowerCase() == 'sourceinfo') {
                let sourceInformation = e.currentTarget.nextElementSibling;
                if (sourceInformation) {
                    this._sourceInfoPopover = sourceInformation;
                    sourceInformation.positionTarget = e.currentTarget;
                    sourceInformation.show(true);
                }
                e.stopPropagation();
                this._onSourceInformationClick(detail);
            } else {
                return;
            }
				}
				if (action.name == "edit") {
            this.setRowMode(e.currentTarget.index, 'edit');
            e.currentTarget.item.index = e.currentTarget.index;
            this._dataChanged();
				}
				if (action.name == "delete") {
            let row = this._getParentRow(e.currentTarget);
            //delete data row added newly else mark data row status as deleted
            if (this._isNewlyAddedDataRow(row)) {
                this._markRowAsDelete(row);
                this._deleteNewRowById(row.__data.item.id);
                detail.isNewlyAddedDataRowDelete = true;
            } else {
                this._markRowAsDelete(row);
                this.setRowMode(e.currentTarget.index, 'view');
            }

				}
				this.fireBedrockEvent(eventName, detail);
    }
    
    _onSourceInformationClick(item) {
				if (this._hasRelatedEntityCoalescedValue(item)) {
            let eventDetail = {
                data: {
                    "id": item.osid,
                    "type": item.ostype
                },
                callback: this._onRelatedEntityInfoGet.bind(this),
                name: "source-info-open"
            }
            ComponentHelper.fireBedrockEvent("source-info-open", eventDetail, {
                ignoreId: true
            });
				}
    }

    _onRelatedEntityInfoGet(entity) {
				let relatedEntityLink;
				let relatedEntityName;
				if (!_.isEmpty(entity)) {
            relatedEntityLink = "entity-manage?id=" + entity.id + "&type=" + entity.type;
            relatedEntityName = entity.name;
				} else {
            relatedEntityLink = "";
            relatedEntityName = "NA";
				}

				if (this._sourceInfoPopover) {
            let container = this._sourceInfoPopover.querySelector("#related-entity-info");
            if (container) {
                let anchor = "<a href=" + relatedEntityLink + ">" + relatedEntityName + "</a>"
                container.innerHTML = anchor;
            }
				}
    }
    
    _markRowAsDelete(row) {
				if (row) {
            let rowStatusIcon = row.querySelector('pebble-icon[id="rowStatus"]');
            rowStatusIcon.icon = "pebble-icon:action-delete";
            let item = row.item;
            if (item && item._rowStatus) {
                item._rowStatus.statusIcon = "pebble-icon:action-delete";
                item._rowStatus.status = "delete";
            }
				}
    }
    
    _showActions(mode) {
				if (this._actions) {
            if (mode === "edit" || this.applyContextCoalesce) {
                return true;
            }
				}
				return false;
    }
    
    _getActions(mode, item) {
				let actions = undefined;
				if (this._actions) {
            actions = this._actions;

            if (this.config && this.config.mode && this.config.mode.toLowerCase() == "edit") {
                if (this.config.hasWritePermission != undefined && !this.config.hasWritePermission) {
                    for (let action in actions) {
                        if (actions[action].name == "delete") {
                            actions.splice(action, 1);
                        }
                    }
                }
            } else if (this.config && this.config.mode && this.config.mode.toLowerCase() == "read") {
                actions = actions.filter(v => v.intent == "read");
            }

            if (actions && this.applyContextCoalesce && item) {
                if (!this._hasContextCoalescedValue(item) && !this._hasRelatedEntityCoalescedValue(item)) {
                    let sourceAction;
                    if (actions.length == 1 && actions[0].name.toLowerCase() == "sourceinfo") {
                        sourceAction = actions[0];
                    } else {
                        sourceAction = actions.filter(v => v.name.toLowerCase() == "sourceinfo")[0];
                    }
                    let sourceIndex = actions.indexOf(sourceAction);
                    if (sourceAction &&  sourceIndex > -1) {
                        delete actions[sourceIndex];
                    }
                }
            }

				}

				return actions;
    }

    updateAttributeErrors() {
				let gridData = this.getData();
				for (let i = 0; i < gridData.length; i++) {
            let item = gridData[i];
            this._updateError(item, i);
				}
    }
    
    _updateError(item, index) {
				if(!item) {
            return;
				}

				let errors = [];
				let warnings = [];
				for (let i = 0; i < this._fields.length; i++) {
            let attr = this.shadowRoot.querySelector("#row" + index + "col" + i);
            if (attr) {
                if (!_.isEmpty(item.duplicateValidationError) && item.duplicateKeysName.indexOf(attr.attributeModelObject.externalName) > -1) {
                    attr.classList.add("value-duplicated")
                } else {
                    attr.classList.remove("value-duplicated")
                }
            }

            if (attr && attr.errors.length > 0) {
                let errorObj = {};
                errorObj.name = this._fields[i].name;
                errorObj.externalName = this._fields[i].header;
                errorObj.type = "error";
                errorObj.message = attr.errors;
                errorObj.index = index;
                errors.push(errorObj);
            }
            if (attr && attr.validationWarnings && attr.validationWarnings.length > 0) {
                let warningObj = {};
                warningObj.name = this._fields[i].name;
                warningObj.externalName = this._fields[i].header;
                warningObj.type = "warning";
                warningObj.message = attr.validationWarnings;
                warningObj.index = index;
                warnings.push(warningObj);
            }
				}
				if (!_.isEmpty(item.duplicateValidationError)) {
            errors = errors.concat(item.duplicateValidationError)
				}
				item.errors = (item.governanceErrors && item.governanceErrors.length) ? errors.concat(item.governanceErrors) : errors;
				item.warnings = warnings;

				let errorLength = item.errors.length;
				let sp = this.shadowRoot.querySelector("#error-circle" + index);
				if (sp) {
            if (errorLength) {
                sp.hidden = false;
                sp.textContent = errorLength;
            } else {
                sp.hidden = true;
            }
				}
				let warningLength = item.warnings.length;
				let warningCircle = this.shadowRoot.querySelector("#warning-circle" + index);
				if (warningCircle) {
            if (warningLength) {
                warningCircle.hidden = false;
                warningCircle.textContent = warningLength;
            } else {
                warningCircle.hidden = true;
            }
				}
    }

    _openPopover(e) {
				let sp = e.currentTarget;
				let item = e.currentTarget.item;
				let index = e.currentTarget.index;
				let name = e.currentTarget.getAttribute('name');
				this._isReadyToShowMessagesPopover = true;
				flush();
				let popover = this.shadowRoot.querySelector("#errorPopover");
				if (popover) {
            let errorList = popover.querySelector("pebble-error-list");
            if (errorList) {
                let messages = item.errors;
                messages = messages.concat(item.warnings);
                errorList.messages = messages;
                errorList.errors = item.errors;
                errorList.warnings = item.warnings;
            }
            popover.positionTarget = sp;
            popover.setAttribute("for", name + index);
            popover.show();
				}
    }
    
    setRowMode(index, mode) {
				for (let i = 0; i < this._fields.length; i++) {
            let attr = this.shadowRoot.querySelector("#row" + index + "col" + i);
            if (attr) {
                attr.mode = mode;
            }
				}
    }
    
    _gridDataLoad() {
				if (this.data) {
            this.gridDataSize = this.currentRecordSize = this.data.length;
            if (this.data.length > 0 && this.defaultSortingEnabled) {
                this._sortGridData();
                this.defaultSortingEnabled = !this.defaultSortingEnabled;
            }
				}
    }
    
    _sortGridData() {
				if (this.config && this.config.itemConfig && this.config.itemConfig.sort && this.config.itemConfig.sort.default) {
            let sortConfig = this.config.itemConfig.sort.default;
            if (sortConfig && sortConfig.length) {
                let gridData = this.data;
                let direction = [];
                let field = [];
                let sortData = {};
                const sortCriteria = DataHelper.assignDefaultSequnceandSort(sortConfig);
                sortCriteria.map(function (item) {
                    if (item && item.sortType && item.field) {
                        direction.push(item.sortType);
                        field.push(item.field);
                    }
                });

                if (direction && field) {
                    sortData['directions'] = direction;
                    sortData['fields'] = field;
                };
                if (gridData && !_.isEmpty(sortData)) {
                    gridData = gridData.sort(new DataHelper.sortingFunction(sortData, this.attributeModels).sort);
                    this.set("data", gridData);
                }
            }
				}
    }
    
    _onDialogOk(e) {
				this.fireBedrockEvent("on-grid-msg-dialog-ok", e);
    }
    
    _onDialogCancel(e) {
				this.fireBedrockEvent("on-grid-msg-dialog-cancel", e);
    }
    
    _getParentRow(element) {
        if (element) {
            let dataTableRow = customElements.get('data-table-row');
            if (dataTableRow !== "undefined" && element instanceof dataTableRow) {
                return element;
            } else {
                return this._getParentRow(element.parentNode);
            }
        }
        return undefined;
    }
    
    _setOriginalValue(element) {
				if (element) {
            if (this.config.schemaType == undefined || this.config.schemaType == "simple" || this.config.schemaType ==
                "colModel") {
                Object.keys(element).forEach(function (item) {
                    if (element[item + "_originalValue"] || element[item + "_originalValue"] == "") {
                        element[item] = element[item + "_originalValue"];
                    }
                }, this);

            } else if (this.config.schemaType == "attribute") {
                for (let attrKey in element.attributes) {
                    if (element.attributes[attrKey]._originalValue || element.attributes[attrKey]._originalValue == "") {
                        element.attributes[attrKey].value = element.attributes[attrKey]._originalValue;
                    }
                }
            }
				}
    }
    
    _getRowStatusIcon(item) {
				if (item && Object.keys(item).length > 0) {
            let icon = "";
            if (item && item._rowStatus) {
                if (item._rowStatus.statusIcon) {
                    icon = item._rowStatus.statusIcon;
                } else {
                    item._rowStatus.statusIcon = "";
                }
            } else {
                item._rowStatus = {
                    "statusIcon": ""
                }
            }
            return icon;
				}
    }
    
    _addClassOnUpdateRow(event) {
				let dataTableRows;
				if (event && !_.isEmpty(event.path)) {
            for (let key = 0; key < event.path.length; key++) {
                if (event.path[key].tagName) {
                    if (event.path[key].tagName.toUpperCase() == "DATA-TABLE-ROW") {
                        dataTableRows = event.path[key];
                        break;
                    }
                }
            }
				}

				if (!_.isEmpty(dataTableRows)) {
            dataTableRows.classList.add('value-updated');
				}
    }
    
    _updateRowStatus(item, status) {
				if (item) {
            if (status == "read") {
                if (this.config.schemaType == undefined || this.config.schemaType == "simple" || this.config.schemaType ==
                    "colModel") {
                    let keys = Object.keys(item);
                    if (keys && keys.length > 0) {
                        for (let i = 0; i < keys.length; i++) {
                            let columnName = keys[i];
                            if (this.attributeModels[columnName] && item[columnName + "_originalValue"] && item[columnName] && item[
                                    columnName + "_originalValue"].toString() !== item[columnName].toString()) {
                                status = "update";
                            } else {
                                continue;
                            }
                        }
                    }
                }
            }
            if (item._rowStatus) {
                if (item._rowStatus.status) {
                    if (item._rowStatus.status != "new") {
                        item._rowStatus.status = status;
                    }
                } else {
                    item._rowStatus.status = status;
                }
            } else {
                item._rowStatus = {
                    "status": status
                }
            }
				}
    }

    _getLink(col, item) {
				let _this = this;

				if (col.linkTemplate) {
            return col.linkTemplate.replace(/\{\S+?\}/g,
                function (match) {
                    let attrName = match.replace("{", "").replace("}", "");
                    if (attrName.toLowerCase() == "id") {
                        return encodeURIComponent(item.id);
                    }
                    if (attrName.toLowerCase() == "type") {
                        return encodeURIComponent(item.type);
                    }

                    let colModels = _this._fields;
                    let index = -1;
                    for (let i = 0; i < colModels.length; i++) {
                        if (colModels[i].name == attrName) {
                            index = i;
                            break;
                        }
                    }
                    if (index > -1) {
                        return encodeURIComponent(_this._columnValue(item, index));
                    }
                    return encodeURIComponent(match);
                });
				}

				return "";
    }

    _hasLinkTemplate(col, item) {
        if (this.config.itemConfig && this.config.itemConfig.enableLinkTemplate == false) {
            return false;
        }
				if (col) {
            if (col.linkTemplate && col.linkTemplate != "") {
                let notEditable = (this.config && this.config.mode && this.config.mode.toLowerCase() != "edit") || (item &&
                    item.mode && item.mode.toLowerCase() !=
                    "edit");
                if (notEditable) {
                    return true;
                }
            }
				}

				return false;
    }
    
    _hasIcon(col, item) {
				if (col) {
            if ((col.icon && col.icon != "") || col.iconColumn) {
                return true;
            }
				}

				return false;
    }
    
    _hasImage(col) {
				if (col) {
            if (col.displayType) {
                if (col.displayType == "image") {
                    return true;
                    
                }
            } else {
                let attrModel = this.attributeModels[col.name];
                if (attrModel && attrModel.properties) {
                    if (attrModel.properties.displayType == "image") {
                        return true;
                    }
                }
            }
				}
				return false;
    }
    
    _getAssetDetails(item) {
				if (item) {
            if (item.property_objectkey && item.property_originalfilename && item.type) {
                let newItem = {
                    "property_objectkey": item.property_objectkey,
                    "property_originalfilename": item.property_originalfilename,
                    "type": item.type
                };
                return newItem;
            }
				}
    }
    
    setMultiSelection(flag) {
				if (flag != undefined) {
            let ironDataTable = this._getIronDataTable();
            if (ironDataTable) {
                ironDataTable.multiSelection = flag;
            }
				}
    }

    notifyResize(e) {
				// var ironDataTable = this._getIronDataTable();

				// if (ironDataTable) {
				// 	if (typeof (ironDataTable.notifyResize) == "function") {
				// 		ironDataTable.notifyResize();
				// 	}
				// }

				// const gridTileView = this.shadowRoot.querySelector('grid-tile-view');

				// if (gridTileView) {
				// 	gridTileView.notifyResize(e);
				// }
    }

    scrollToIndex(index) {
        if (this.config.viewMode == "Tile") {
            let ironList = this._getIronList("gridTileView");
            if(ironList) {
                ironList.scrollToIndex(index);
            }
        } else if (this.config.viewMode == "List") {
            let ironList = this._getIronList("gridListView");
            if(ironList) {
                ironList.scrollToIndex(index);
            }
        } else {
            let ironDataTable = this._getIronDataTable();
            if(ironDataTable) {
                let ironList = ironDataTable.shadowRoot.querySelector('#list');
                if(ironList) {
                    ironList.scrollToIndex(index);
                }
            }
        }
    }

    getSelectedGridRow() {
				let ironDataTable = this._getIronDataTable();
				return ironDataTable.querySelector('data-table-row[selected]');
    }

    getSelectedItemIndex() {
				if (this.getData().length > 0 && this.selectedItem) {
            return this.getData().indexOf(this.selectedItem);
				}

				return -1;
    }
    
    _fixError(e, detail) {
				let errors = detail.data;
				if (errors.length) {
            this.setRowMode(errors[0].index, 'edit');
				}
				this.shadowRoot.querySelector("#errorPopover").hide();
				this._isReadyToShowMessagesPopover = false;
    }
    
    _getDataSourceElement() {
				let dataSourceElement;
				if (this.rDataSourceId) {
            dataSourceElement = ComponentHelper.getParentElement(dom(this).node).shadowRoot.querySelector('#' + this
                .rDataSourceId);
				}
				return dataSourceElement
    }
    
    _sortDirectionChanged(e) {
				if (e.detail && !e.detail.direction) {
            this.sortOrder = [];
				}
				this._resetAdvanceSelection();
    }
    
    _setSelectionTitle(currentRecordSize, selectionInfo) {
				let startStatusMsg = '('
				let endStatusMsg = ' selected)'
				let selectionMode = this.getSelectionMode();
				let selectedItems = this.getSelectedItems();
				this.selectionTitle = '';
				if (selectedItems && selectedItems.length > 0) {
            if (selectionMode == 'query') {
                let totalCount = this.totalCount.toString();
                this.selectedTotalCount = this.totalCount;
                if (this.totalCount > 0) {
                    this.selectionTitle = startStatusMsg + totalCount + ' ' + endStatusMsg;
                }
            } else {
                this.selectedTotalCount = selectedItems.length;
                this.selectionTitle = startStatusMsg + selectedItems.length + endStatusMsg;
            }
				}
    }
    
    getSelectedItemsAsQuery(e) {
				let queryObject = {};
				let dataSourceElement = this._getDataSourceElement();
				let selectionMode = this.getSelectionMode();

				if (dataSourceElement && dataSourceElement.request && dataSourceElement.request.params) {
            let searchQueryRequest = dataSourceElement.request;
            let searchQueryParams = searchQueryRequest.params;
            if (selectionMode == 'query') {
                queryObject = DataHelper.cloneObject(searchQueryRequest);
            } else if (selectionMode == 'count') {
                let selectedItems = this.getSelectedItems();
                if (selectedItems && selectedItems.length > 0) {
                    let entityIds = [];
                    for (let i = 0; i < selectedItems.length; i++) {
                        entityIds.push(selectedItems[i].id);
                    }
                    queryObject.ids = entityIds;
                    queryObject.filters = {};
                    if (searchQueryParams && searchQueryParams.isCombinedQuerySearch) {
                        if (searchQueryRequest.entity.data && searchQueryRequest.entity.data.jsonData) {
                            let searchQueries = searchQueryRequest.entity.data.jsonData.searchQueries;
                            for (let i = 0; i < searchQueries.length; i++) {
                                if (searchQueries[i].serviceName === "entityservice") {
                                    queryObject.filters.typesCriterion = searchQueries[i].searchQuery.query.filters.typesCriterion;
                                    break;
                                }
                            }
                        }
                    } else {
                        queryObject.filters.typesCriterion = searchQueryParams.query.filters.typesCriterion;
                    }
                }
            }
				}
				return queryObject;
    }
    
    _getColWidth(col) {
				if (col.width) {
            if (!this._dataTableWidth) {
                let dataTable = this._getIronDataTable();
                this._dataTableWidth = dataTable && dataTable.clientWidth ? dataTable.clientWidth : undefined
            }
            if (this._dataTableWidth && this._dataTableWidth > 100) {
                return (this._dataTableWidth * col.width) / 100 + "px";
            }
				}
    }
    
    _getDependentAttributeModels(currentAttributeModel) {
				return DataHelper.getDependentAttributeModels(this.attributeModels, this.dependentAttributeModelObjects,
            currentAttributeModel);
    }
    
    _getDependentAttributes(item, currentAttributeModel, index) {
				let dependentAttributeModels = DataHelper.getDependentAttributeModels(this.attributeModels, this.dependentAttributeModelObjects,
            currentAttributeModel);
				let dependentAttributeValues = [];

				let gridColumns = this._fields;
				if (gridColumns && gridColumns.length && !_.isEmpty(dependentAttributeModels)) {
            for (let attributeName in dependentAttributeModels) {
                let dependentAttributeModel = dependentAttributeModels[attributeName];
                let gridColumn = gridColumns.find(col => col.name === dependentAttributeModel.name);
                if (gridColumn) {
                    let colIndex = gridColumns.indexOf(gridColumn);
                    dependentAttributeValues.push(this._getAttributeObject(item, dependentAttributeModel, colIndex, index));
                    break;
                } else if (!_.isEmpty(this.dependentAttributeObjects)) {
                    for (let j = 0; j < this.dependentAttributeObjects.length; j++) {
                        if (dependentAttributeModel.name === this.dependentAttributeObjects[j].name) {
                            dependentAttributeValues.push(this.dependentAttributeObjects[j]);
                            break;
                        }
                    }
                }
            }
				}

				return dependentAttributeValues;
    }
    
    _onRowDropEvent(e, detail) {
				if (this.config.mode != "edit") {
            this._modeChange('edit');
				}
				this.dispatchEvent(new CustomEvent("row-drop-event-raised", {
            detail: detail,
            bubbles: true,
            composed: true
				}));
    }

    _rowDblClicked(e) {
				//Disabling double click on row if configured
				if (this.config.isRowDoubleClickDisabled || (this.config.itemConfig && this.config.itemConfig.enableLinkTemplate == false)) {
            return;
				}
				this._rowLinkClicked(e);
    }

    _rowLinkClicked(e) {
				let detail = e.detail.item ? e.detail : e.currentTarget;
				if (detail && detail.item) {
            if (this.config && this.config.mode == "edit") {
                return;
            }
            let item = detail.item;
            if (this.config && this.config.itemConfig && this.config.itemConfig.linkTemplate) {
                let link = this._getLink(this.config.itemConfig, item);
                this.fireBedrockEvent("grid-link-clicked", {
                    "link": link,
                    "id": item.id
                }, {
                    ignoreId: true
                });
                window.history.pushState("", "", link);
                window.dispatchEvent(new CustomEvent('location-changed'));
            }
				}
    }
    
    _configPresent(type) {
				if (this.config && this.config.viewConfig && this.config.viewConfig[type]) {
            return true;
				}
				return false;
    }
    _dispatchViewModeChangedEvent(viewMode){
        this.dispatchEvent(new CustomEvent('view-mode-changed', {
            detail: {
                data: viewMode
            },
            bubbles: true,
            composed: true
        }));
    }
    _viewModeChanged() {
				if (this.config && this.config.viewMode) {
            if (this.config.viewMode === 'List') {
                import('./grid-list-view.js').then(() => {
                    this._dispatchViewModeChangedEvent(this.config.viewMode);
                });
            }
            else if (this.config.viewMode === 'Tile') {
                import('./grid-tile-view.js').then(() => {
                    this._dispatchViewModeChangedEvent(this.config.viewMode);
                });
            }
            else{
                this._dispatchViewModeChangedEvent(this.config.viewMode);
            }
            if (this.data) {
                this.gridDataSize = this.currentRecordSize = this.data.length;
            } else {
                this.gridDataSize = 0;
                this.currentRecordSize = 0;
            }
				}
    }

    _isNestedAttribute(col, item) {
				if (item && item.isRelationshipType == true) {
            return true;
				}
				if (this.gridItemView && !_.isEmpty(item)) {
            if (!col.isRowHeader && this.attributeModels[item.attributeName] && this.attributeModels[item.attributeName].properties
                .dataType == "nested") {
                return true;
            }
				} else if (col && col.isNested) {
            return true;
				}

				return false;
    }

    _getRowModelAndData(item, col) {
				if (item) {
            let attrName = this.gridItemView ? item.attributeName : col.name;
            let attrModel = this.attributeModels[attrName];

            let firstDataContext = ContextHelper.getFirstDataContext(this.contextData);
            let firstValueContext = ContextHelper.getFirstValueContext(this.contextData);

            if (item.localeId) {
                firstValueContext.locale = item.localeId;
            }

            //debugger;
            if (attrModel && attrModel.group && attrModel.group.length > 0) {
                let attrValue = DataTransformHelper.transformNestedAttributes({
                    "group": item[col.name]
                }, attrModel, false, firstDataContext, firstValueContext);

                let attributeObject = {
                    "value": attrValue
                };
                return {
                    "attrModel": attrModel,
                    "attr": attributeObject,
                    "colHeader": col.header
                };
            }
				}
    }

    _getRelToRelationshipTypes(relationshipModel) {
				//Making an array with the relEntityType (like 'audio', 'product') and the correcponding id (like 'hasaudio', 'hasimages') so we can use this in rock-snapshot-grid-compare
				let keysRel = [];
				for (let rel in relationshipModel) {
            DataHelper.isValidObjectPath(relationshipModel[rel][0], 'properties.relatedEntityInfo.0.relEntityType');
            keysRel.push({
                relEntityType: relationshipModel[rel][0].properties.relatedEntityInfo[0].relEntityType,
                relEntityId: relationshipModel[rel][0].id
            });
				}

				return keysRel;
    }
    
    _openNestedAttr(e) {
				let parentRow = this._getParentRow(e.currentTarget);
				let item;
				if (parentRow) {
            item = parentRow.item;
				}

				// New code for relationships
				if (item.isRelationshipType) {
            let attrDialog = this.$$('#relationshipDialog');
            let currentEntityId = e.currentTarget.data.name;
            let rockComponent = customElements.get("rock-snapshot-relationship-grid");
            let rockElement = new rockComponent();
            rockElement.entityReqData = item[currentEntityId];
            if (item.hasOwnProperty('isSnapshot') && !_.isEmpty(rockElement.entityReqData)) {
                rockElement.entityReqData.isSnapshot = item.isSnapshot;
            }

            rockElement.contextData = this.contextData;

            if (item[currentEntityId].length > 0) {
                let relToRelationshipTypes = this._getRelToRelationshipTypes(item.relationshipModel);
                rockElement.entityType = item[currentEntityId][0].relTo.type;
                rockElement.entityReqData.relToRelationshipTypes = relToRelationshipTypes;
            }

            //checking for 0 relationships case
            if (_.isEmpty(rockElement.entityReqData)) {
                this.showWarningToast("No relationships exist");
                return;
            }
            let relDialogContainer = attrDialog.querySelector('#relDialogContainer');

            if (relDialogContainer) {
                ComponentHelper.removeNode(relDialogContainer.firstElementChild);

                relDialogContainer.appendChild(rockElement);
                attrDialog.dialogTitle = 'Relationships';
            }

            attrDialog.open();
				} else {
            let col = e.currentTarget.data;
            let attrDialog = this.$$('#attributeDialog');
            if (attrDialog && col && item) {
                let data = this._getRowModelAndData(item, col);
                let attrModel = data.attrModel;
                let rockComponent = customElements.get("rock-nested-attribute-grid");
                let rockElement = new rockComponent();

                delete attrModel.group[0].id;

                rockElement.attributeModelObject = attrModel;
                rockElement.attributeObject = data.attr;
                rockElement.originalAttributeObject = data.attr;
                rockElement.contextData = this.contextData;
                rockElement.mode = "view";

                let attrDialogContainer = attrDialog.querySelector('#attrDialogContainer');

                if (attrDialogContainer) {
                    ComponentHelper.removeNode(attrDialogContainer.firstElementChild);

                    attrDialogContainer.appendChild(rockElement);
                    attrDialog.dialogTitle = data.colHeader + " : " + attrModel.properties.externalName;
                }

                attrDialog.open();
            }
				}
    }
    
    updateRowStatus(item, status) {
				this._updateRowStatus(item, status);
    }
    
    _getNestedAttributeValueCount(item, col) {
				if (!_.isEmpty(item) && col) {
            if (item["isEmptyValue"] || item["isNullValue"]) {
                return false;
            }
            if (this.gridItemView) {
                return item[col.name] ? item[col.name].length : '0';
            }
            return item[col.header] && item[col.header].value ? item[col.header].value.length : '0';
				}
    }
    
    _getEmptyDisplayValue(item) {
				if (item["isNullValue"]) {
            return "NULL";
				}
				return "No Values";
    }
    
    _getNestedAttributeMessage(item, col, index) {
				if (index !== 0) {
            let count = this._getNestedAttributeValueCount(item, col) || 0;
            return this.nestedAttributeMessage.replace("{noOfValues}", count);
				} else {
            return item[col.name] || item.attributeName;
				}
    }
    
    _isValueNull(item, col) {
				if (!_.isEmpty(item) && col && item[col.name]) {
            let currentColumn = item[col.name];
            if (Array.isArray(currentColumn)) {
                let columnValue = currentColumn[0].value;
                if (columnValue && columnValue == ConstantHelper.NULL_VALUE) {
                    return true;
                }
            }
				}
				return false;
    }
    
    _flashTileview(e) {
				// setTimeout(() => {
				// 	this.notifyResize(e);
				// }, 500);
    }
    
    updateGridData(data, detail) {
				let ironDataTable = this._getIronDataTable();
				if (ironDataTable) {
            ironDataTable.updateData(data, detail);
				}
    }
    
    _getCellClassValue(gridRowData, columnIndex) {
				let styleClass = "";
				if (this.applyLocaleCoalesceStyle) {
            let attributeName = this._fields[columnIndex].name;
            if (attributeName && this._isLocalizbale(attributeName) && this._hasLocaleCoalescePath(gridRowData,
                    attributeName)) {
                styleClass = "fallback-value";
            }
				};

				if (this._columnValue(gridRowData, columnIndex) == "NA") {
            styleClass = _.isEmpty(styleClass) ? "disabled-value" : styleClass + " disabled-value";
				};

				if (this._hasContextCoalescedValue(gridRowData) || this._hasRelatedEntityCoalescedValue(gridRowData)) {
            styleClass = _.isEmpty(styleClass) ? "coalesced-value" : styleClass + " coalesced-value";
				}

				return styleClass;
    }
    
    _isLocalizbale(columnName) {
				return this.attributeModels[columnName] && this.attributeModels[columnName].isLocalizable;
    }
    
    _hasLocaleCoalescePath(gridRowData, columnName) {
				return gridRowData &&
            gridRowData.attributes &&
            gridRowData.attributes[columnName] &&
            gridRowData.attributes[columnName].properties &&
            gridRowData.attributes[columnName].properties.localeCoalescePath;
    }
    
    _getArrayFromObject(obj) {
				return DataHelper.convertObjectToArray(obj);
    }

    _hasContextCoalescedValue(item) {
				if (item && !_.isEmpty(item.contextCoalescePaths)) {
            return true;
				}
    }

    _hasRelatedEntityCoalescedValue(item) {
				return item && item.os === "graph" && !_.isEmpty(item.osid) && !_.isEmpty(item.ostype);
    }

    _hasPopoverInfo(action) {
				if (action && action.name.toLowerCase() == "sourceinfo") {
            return true;
				}
				return false;
    }

    _deleteNewRowById(id) {
				let ironDataTable = this._getIronDataTable();
				if (id) {
            ironDataTable._cachedItems = ironDataTable._cachedItems.filter(function (dataItem) {
                return dataItem.id != id;
            });
				}
				this.set("data", "");
				this.set("data", ironDataTable._cachedItems);
				this.currentRecordSize = ironDataTable.size;
    }

    _isNewlyAddedDataRow(rowDetail) {
				if (rowDetail && rowDetail.__data && rowDetail.__data.item) {
            const rowItem = rowDetail.__data.item;
            return DataHelper.isValidObjectPath(rowItem, "_rowStatus.status") &&
                rowItem._rowStatus.status.toLowerCase() == "new";
				}
    }

    revertModifiedData(data) {
				let filteredData = [];

				if (data && data.length > 0) {
            filteredData = data.filter(item => {
                if (item._rowStatus) {
                    let status = item._rowStatus.status;
                    if (!status || (status.toLowerCase() != "new" && status.toLowerCase() != "update" && status.toLowerCase() !=
                            "delete")) {
                        return item;
                    }
                }
            });
				}

				this.set('data', {});
				this.set('data', filteredData);
				this.set('config.mode', "read");

				// Render grid
				this.reRenderGrid();
    }
}
customElements.define(RockGrid.is, RockGrid)
