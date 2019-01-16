import '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-styles/paper-styles.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="bedrock-style-common">
    <template>
        <style>
            :host>* {
                --box-style: {
                    background: var(--palette-white);
                    border: solid 1px var(--default-border-color);
                    border-radius: var(--default-border-radius);
                }
                --transition: {
                    -webkit-transition: all 0.3s;
                    transition: all 0.3s;
                }
                --border-radius: {
                    -moz-border-radius: 3px;
                    -webkit-border-radius: 3px;
                    border-radius: 3px;
                }
                --layout-flex: {
                    -ms-flex: 1 1 0.000000001px;
                    -webkit-flex: 1;
                    flex: 1;
                    -webkit-flex-basis: 0.000000001px;
                    flex-basis: 0.000000001px;
                }
                --common-popup: {
                    box-shadow: 0 0 var(--popup-box-shadow-size, 8px) 0 var(--popup-box-shadow, #8A98A3);
                    padding: 0;
                    background: var(--palette-white);
                    border-radius: var(--default-border-radius);
                }
                --popup-item: {
                    padding-left: var(--default-popup-item-l-p, 20px);
                    padding-right: var(--default-popup-item-r-p, 20px);
                }
            }
            * {
                box-sizing: border-box;
                outline: 0;
            }
            a:link {
                color: var(--link-text-color);
                font-family: var(--default-font-family);
            }
            a:visited {
                color: var(--link-text-color);
                font-family: var(--default-font-family);
            }
            a:hover {
                color: var(--link-text-color);
                font-family: var(--default-font-family);
            }
            span {
                font-family: var(--default-font-family);
            }
            .p-relative {
                position: relative;
            }
            .btn-link {
                color: var(--link-text-color, #139ee7);
                border-radius: 0;
            }
            /* Classes to style list items */

            .list-content,
            .sub-content {
                font-size: var(--font-size-sm);
                color: var(--palette-steel-grey);
            }
            .block-text {
                font-size: var(--default-font-size);
                color: var(--palette-dark);
            }
            .text-ellipsis {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .btn {
                --paper-menu: {
                    background: var(--palette-white, #ffffff);
                    padding-top: 0;
                    padding-bottom: 0;
                    padding-right: 0;
                    padding-left: 0;
                }
                --paper-item: {
                    min-height: 30px;
                }
                --paper-item-focused: {
                    background: var(--dropdown-selected, #e8f4f9);
                    font-weight: normal;
                }
            }
            .default-message {
                padding: 10px;
                margin: 10px 0;
                background: var(--palette-pale-grey-four, #eff4f8);
                font-size: var(--default-font-size, 14px);
                text-align: center;
                border-radius: 3px;
                font-weight: normal;
                line-height: 18px;
            }
            .inline-block {
                display: inline-block
            }
            [hidden] {
                display: none !important;
            }
            [show="true"] {
                display: block !important;
            }
            [show="false"] {
                display: none !important;
            }
            [show="trueInlineBlock"] {
                display: inline-block;
            }
        </style>
    </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
