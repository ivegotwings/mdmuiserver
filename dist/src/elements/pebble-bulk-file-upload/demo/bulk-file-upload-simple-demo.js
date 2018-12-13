import '@polymer/polymer/polymer-legacy.js';
import '../pebble-bulk-file-upload.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';

Polymer$0({
  _template: Polymer.html`
        <pebble-bulk-file-upload id="fu1" accept="image/*" target="/data/file-upload" max-files="2"></pebble-bulk-file-upload>
`,

  is: 'bulk-file-upload-simple-demo',

  properties: {

  }
});
