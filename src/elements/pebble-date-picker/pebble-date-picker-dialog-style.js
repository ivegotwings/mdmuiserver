import '@polymer/polymer/polymer-legacy.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="pebble-date-picker-dialog-style">
  <template>
    <style>
      /* Application of mixins to local .paper-date-picker-dialog elements */
      .paper-date-picker-dialog {
        margin-top: 0px;
        margin-right: 0px;
        margin-bottom: 0px;
        margin-left: 0px;
        max-height: 520px !important;
        overflow: hidden;
      }

      .paper-date-picker-dialog>paper-date-picker {
        --paper-calendar: {
          padding-bottom: 0;
        }
        margin-top: 0 !important;
        margin-right: 0 !important;
        margin-bottom: 0 !important;
        margin-left: 0 !important;
        padding-top: 0px;
        padding-right: 0px;
        padding-bottom: 0px;
        padding-left: 0px;
      }

      .paper-date-picker-dialog>paper-date-picker:not([narrow]) {
        --paper-date-picker-heading: {
          margin-bottom: -62px;
        }
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
