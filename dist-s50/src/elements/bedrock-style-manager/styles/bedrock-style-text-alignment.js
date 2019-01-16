import '@polymer/polymer/polymer-legacy.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="bedrock-style-text-alignment">
    <template>
        <style>
            .text-right {
                text-align: right;
            }           

            .text-center {
                text-align: center;
            }  
           
        </style>
    </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
