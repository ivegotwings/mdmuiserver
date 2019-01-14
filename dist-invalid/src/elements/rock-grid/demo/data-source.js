import '@polymer/polymer/polymer-legacy.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
Polymer$0({
  _template: html`

`,

  is: 'data-source',

  properties: {
      dataSource: {
          notify: true,
          value: function() {
          return this._dataSource.bind(this);
          }
      },

      size: {
          notify: true,
          value: 0
      }
  },

  _dataSource: function(opts, cb) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
          if (xhr.readyState == XMLHttpRequest.DONE) {
              if (xhr.status == 200) {
                  
                  var json = JSON.parse(xhr.responseText);

                  if (this.size / opts.pageSize >= opts.page) {
                      this.size += this.size == 0 ? opts.pageSize * 2 : opts.pageSize;
                  }

                  cb(json.slice(0, opts.pageSize));
              }
          }
      }.bind(this);

  // page parameters could be used like this:
  xhr.open("GET", 'gridData.json?per_page=' +
      opts.pageSize + '&page=' + opts.page, true);
  xhr.send();
  }
});
