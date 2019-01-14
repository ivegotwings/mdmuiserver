import '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-styles/paper-styles.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<custom-style>
    <style is="custom-style">
        html {
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
    </style>
</custom-style>`;

document.head.appendChild($_documentContainer.content);
