import '@polymer/polymer/polymer-legacy.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="bedrock-style-list">
    <template>
        <style>
            li {
                display: list-item;
                text-align: justify;
                list-style-type: disc;
            }

            
            li a:hover {
                color: var(--secondary-text-color);
                font-family: var(--default-font-family);
            }
           
        </style>
    </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
