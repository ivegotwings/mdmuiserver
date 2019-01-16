import '@polymer/polymer/polymer-legacy.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="bedrock-style-grid-layout">
    <template>
        <style>
            .full-height {
                height: 100%;
            }            

            .base-grid-structure {
                display: -ms-grid;
                display: grid;
                -ms-grid-rows: max-content 1fr;
                grid-template-rows: max-content 1fr;
                -ms-grid-columns: 1fr;
                grid-template-columns: 1fr;
                height: 100%;
            }

            .base-grid-structure-child-1 {
                -ms-grid-row: max-content;
                -ms-grid-column: 1;
                min-width: 0px;
            }

            .base-grid-structure-child-2 {
                -ms-grid-row: 2;
                -ms-grid-column: 1;
                min-width: 0px;
                min-height: 0px;
            }
            .button-siblings {
                height: calc(100% - 40px);
            }
        </style>
    </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
