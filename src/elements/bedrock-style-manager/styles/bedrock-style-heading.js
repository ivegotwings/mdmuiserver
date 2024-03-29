import '@polymer/polymer/polymer-legacy.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="bedrock-style-heading">
    <template>
      <style>
            h2,
            h3,
            h4,
            h5{
                display: block;
                font-weight: var(--font-bold, bold);
                margin-left: 0;
                margin-right: 0;
                font-family: var(--default-font-family);
                line-height: 0.5em;
                padding-left: 5px;
            }

            h2 {
                font-size: 1.5em;
                margin-top: 0.83em;
                margin-bottom: 0.83em;
            }

            h3 {
                display: block;
                font-size: 1.17em;
                margin-top: 1em;
                margin-bottom: 1em;
            }

            h4 {
                display: block;
                margin-top: 1.33em;
                margin-bottom: 1.33em;
            }

            h5 {
                display: block;
                font-size: .83em;
                margin-top: 1.67em;
                margin-bottom: 1.67em;
            }

        </style>
     </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
