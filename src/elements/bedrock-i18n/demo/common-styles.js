const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="common-styles">
  <template>
    <style include="demo-snippet">
      :host {
        @apply --shadow-none;
        @apply --paper-font-common-base;
        display: block;
        max-width: 600px;
        margin: 40px auto;
      }

      .snippet {
        @apply --shadow-elevation-2dp;
      }

      paper-toggle-button {
        display: inline-block;
      }

      .lang {
        text-align: center;
        font-size: var(--font-size-xl, 20px);
      }

      code {
        display: block;
      }

      .demo div {
        @apply --paper-font-body1;
        line-height: 1.5;
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
