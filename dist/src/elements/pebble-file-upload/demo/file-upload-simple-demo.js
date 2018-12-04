import '@polymer/polymer/polymer-legacy.js';
import '../pebble-file-upload.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';

Polymer$0({
  _template: Polymer.html`
         <pebble-file-upload id="fu1" accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint,
                text/plain, application/pdf, image/*" target="/data/file-upload"></pebble-file-upload>
        <bedrock-pubsub on-bedrock-event-pebble-file-upload-success="onUploadSuccess"></bedrock-pubsub>
`,

  is: 'file-upload-simple-demo',

  properties: {

  },

  onUploadSuccess: function(e, detail) {
      console.log(JSON.stringify(e, null, 2));
      console.log(JSON.stringify(detail, null, 2));
  }
});
