import '@polymer/polymer/polymer-legacy.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="pebble-time-picker-dialog-style">
  <template>
    <style>
      .pebble-time-picker-dialog {
          margin-top: 0px;
          margin-right: 0px;
          margin-bottom: 0px;
          margin-left: 0px;
          max-height: 520px !important;
      }

      .pebble-time-picker-dialog>pebble-time-picker {
          margin-top: 0 !important;
          padding-top: 0px;
          padding-right: 0px;
          padding-bottom: 0px;
          padding-left: 0px;
        --pebble-calendar: {
          padding-bottom: 0;
        }
      }

      .pebble-time-picker-dialog>pebble-time-picker:not([narrow]) {
        --pebble-time-picker-heading: {
          margin-bottom: -56px;
        }
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
