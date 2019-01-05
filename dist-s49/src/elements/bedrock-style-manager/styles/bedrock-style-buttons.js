import '@polymer/polymer/polymer-legacy.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="bedrock-style-buttons">
  <template>
    <style>
      .buttonContainer-static {
        margin-top: 10px;
        text-align: center;
      }

      .buttonContainer-fixed {
        margin-top: 10px;
        text-align: center;
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
