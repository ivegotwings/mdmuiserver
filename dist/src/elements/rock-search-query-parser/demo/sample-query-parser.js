import '@polymer/polymer/polymer-legacy.js';
import '../rock-search-query-parser.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
Polymer$0({
  _template: html`
        <rock-search-query-parser id="queryParser"></rock-search-query-parser>
`,

  is: 'sample-query-parser',

  attached: function(){
      //var liquidElement1 = this.shadowRoot.querySelector("[id=entityGetData3]");
      //liquidElement1.generateRequest();
  },

  parseQuery: function(query) {
      var queryParser = this.shadowRoot.querySelector("[id=queryParser]");
      var finalQuery = queryParser.parseQueryToFilters(query);
  }
});
