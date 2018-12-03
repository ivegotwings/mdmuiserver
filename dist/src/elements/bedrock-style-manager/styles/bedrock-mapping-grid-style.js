import '@polymer/polymer/polymer-legacy.js';
import './bedrock-style-common.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="bedrock-mapping-grid-style">
    <template>
        <style include="bedrock-style-common">
            :host {
                --paper-input-container: {
                    bottom: 8px;
                    position: relative;
                }
            }

            pebble-popover {
                --pebble-popover-width: 260px;
            }

            pebble-textbox {
                --pebble-textbox-paper-input-style: {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }

            #inputDiv pebble-textbox {
                --pebble-textbox-paper-input-style: {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    width: 90%;
                }
            }

            #inputDiv {
                width: 250px;
            }

            #iconDiv {
                align-self: flex-end;
                -webkit-align-self: flex-end;
                padding: 0 15px;
                margin-left: -32px;
                cursor: pointer;
                margin-bottom: 10px;
            }

            data-table-row[header] {
                font-weight: var(--font-bold, bold);
                color: var(--palette-cerulean, #036bc3);
                border-bottom: none;
                text-transform: uppercase;
                font-size: var(--table-head-font-size, 11px);
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

            data-table-row:not([header]):hover data-table-checkbox,
            data-table-row[selected] data-table-checkbox {
                background-color: var(--palette-white, #ffffff) !important;
            }

            pebble-data-table data-table-checkbox {
                flex-basis: 16px !important;
                padding: 0 !important;
            }

            data-table-row data-table-cell.check-filter {
                flex: 0 0 16px !important;
                padding: 0!important;
            }

            data-table-row[header] {
                --pebble-direction-icon-button: {
                    opacity: 0.7 !important;
                }
            }

            data-table-row data-table-cell {
                padding: 0 0 0 10px!important;
            }

            #gridManage {
                font-size: 0;
                padding: 10px;
            }

            #gridManage pebble-icon {
                display: inline-block;
                vertical-align: middle;
            }

            .gridCountMsg {
                font-weight: bold;
                margin-right: 10px;
                font-size: var(--grid-msg-font-size, 12px);
                display: inline-block;
                vertical-align: middle;
            }

            #context-header {
                box-shadow: 0 1px 7px 0 var(--palette-cloudy-blue, #c1cad4);
                padding: 5px;
                margin: 5px 10px;
                height: 40px;
            }
        </style>
    </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);

/*shared styles for rock-attribute-mapping-grid and rock-value-mapping-grid */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
;
