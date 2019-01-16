import '@polymer/polymer/polymer-legacy.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="bedrock-style-floating">
    <template>
        <style>
            .pull-right {
                float: right;
            }
            .pull-left {
                float: left;
            }

            .clearfix {
                clear: both;
                display: block;
            }

            .clearfix:after {
                visibility: hidden;
                display: block;
                font-size: 0;
                content: " ";
                clear: both;
                height: 0;
            }
        </style>
    </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
