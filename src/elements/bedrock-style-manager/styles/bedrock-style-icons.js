import '@polymer/polymer/polymer-legacy.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="bedrock-style-icons">
    <template>
        <style>
            .pebble-icon-color-blue {
                --pebble-icon-color: {
                    fill: var(--palette-cerulean-two, #026bc3);
                }
            }

            .pebble-icon-color-white {
                --pebble-icon-color: {
                    fill: var(--palette-white, #ffffff);
                }
            }

            .pebble-icon-color-grey {
                --pebble-icon-color: {
                    fill: var(--palette-steel-grey, #75808b);
                }
            }

            .pebble-icon-color-success {
                --pebble-icon-color: {
                    fill: var(--success-color, #36b44a);
                }
            }

            .pebble-icon-color-error {
                --pebble-icon-color: {
                    fill: var(--error-color, #ed204c);
                }
            }

            .pebble-icon-color-warning {
                --pebble-icon-color: {
                    fill: var(--warning-color, #f68d1e);
                }
            }

            .pebble-icon-size-8 {
                width: 8px;
                height: 8px;

                --pebble-icon-dimension: {
                    width: 8px;
                    height: 8px;
                }
            }

            .pebble-icon-size-10 {
                width: 10px;
                height: 10px;

                --pebble-icon-dimension: {
                    width: 10px;
                    height: 10px;
                }
            }

            .pebble-icon-size-12 {
                width: 12px;
                height: 12px;

                --pebble-icon-dimension: {
                    width: 12px;
                    height: 12px;
                }
            }

            .pebble-icon-size-14 {
                width: 14px;
                height: 14px;

                --pebble-icon-dimension: {
                    width: 14px;
                    height: 14px;
                }
            }

            .pebble-icon-size-16 {
                width: 16px;
                height: 16px;

                --pebble-icon-dimension: {
                    width: 16px;
                    height: 16px;
                }
            }

            .pebble-icon-size-18 {
                width: 18px;
                height: 18px;

                --pebble-icon-dimension: {
                    width: 18px;
                    height: 18px;
                }
            }

            .pebble-icon-size-20 {
                width: 20px;
                height: 20px;

                --pebble-icon-dimension: {
                    width: 20px;
                    height: 20px;
                }
            }

            .pebble-icon-size-30 {
                width: 30px;
                height: 30px;

                --pebble-icon-dimension: {
                    width: 30px;
                    height: 30px;
                }
            }

            .pebble-icon-size-8,
            .pebble-icon-size-12,
            .pebble-icon-size-14,
            .pebble-icon-size-16.pebble-icon-size-18,
            .pebble-icon-size-20,
            .pebble-icon-size-30 {
                font-size: 0;
                display: inline-block;
                vertical-align: middle;
                border: none;
            }
        </style>
    </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
