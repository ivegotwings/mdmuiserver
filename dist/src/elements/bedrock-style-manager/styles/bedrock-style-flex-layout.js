import '@polymer/polymer/polymer-legacy.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="bedrock-style-flex-layout">
    <template>
        <style>
            .layout.horizontal,
            .layout.vertical {
                display: -ms-flexbox;
                display: -webkit-flex;
                display: flex;
            }

            .layout.horizontal {
                -ms-flex-direction: row;
                -webkit-flex-direction: row;
                flex-direction: row;
            }

            .layout.vertical {
                -ms-flex-direction: column;
                -webkit-flex-direction: column;
                flex-direction: column;
            }

            .layout.wrap {
                -ms-flex-wrap: wrap;
                -webkit-flex-wrap: wrap;
                flex-wrap: wrap;
            }

            .flex {
                -ms-flex: 1 1 0.000000001px;
                -webkit-flex: 1;
                flex: 1;
                -webkit-flex-basis: 0.000000001px;
                flex-basis: 0.000000001px;
            }
        </style>
    </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
