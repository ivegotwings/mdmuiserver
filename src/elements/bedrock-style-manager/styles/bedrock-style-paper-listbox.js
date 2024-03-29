import '@polymer/polymer/polymer-legacy.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="bedrock-style-paper-listbox">
    <template>
        <style>
            paper-listbox paper-item {
                cursor: pointer;
                font-size: var(--font-size-sm, 12px);
                color: var(--palette-steel-grey, #75808b);
                text-align: left;
                transition: all 0.3s;
                -webkit-transition: all 0.3s;
                padding-left: var(--default-popup-item-l-p, 20px);
                padding-right: var(--default-popup-item-r-p, 20px);
            }

            paper-listbox.dropdown-content paper-item:hover {
                background-color: var(--bgColor-hover, #e8f4f9);
                color: var(--focused-line, #026bc3);
            }

            paper-listbox paper-item pebble-icon {
                margin: 5px;
            }

            paper-listbox paper-item pebble-icon:hover {
                --pebble-icon-color: {
                    fill: var(--focused-line, #026bc3);
                }
            }

            paper-listbox.dropdown-content paper-item:focus {
                color: var(--primary-button-color, #036bc3);
                background-color: var(--bgColor-hover, #e8f4f9);
            }

            paper-listbox paper-item:focus:before {
                background: none;
            }
        </style>
    </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
