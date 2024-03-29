/**
<b><i>Content development is under progress... </b></i>

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../liquid-entity-data-get/liquid-entity-data-get.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
class RemoteData
    extends  PolymerElement {
  static get template() {
    return html`
        <template is="dom-if" if="{{_isEntitySearchGrid(operation)}}">
            <liquid-entity-data-get id="initiateSearchResult" operation="initiatesearch" request-data="{{request}}" last-response="{{_searchResponse}}" exclude-in-progress=""></liquid-entity-data-get>
            <liquid-entity-data-get id="getsearchresultdetail" operation="getsearchresultdetail" request-data="{{request}}" request-id="[[_searchResponse.content.requestId]]" last-response="{{remoteData}}" exclude-in-progress=""></liquid-entity-data-get>
        </template>
        <template is="dom-if" if="{{!_isEntitySearchGrid(operation)}}">
            <liquid-entity-data-get id="getRemoteData" operation="[[operation]]" request-data="[[request]]" last-response="{{remoteData}}" exclude-in-progress="">
            </liquid-entity-data-get>
        </template>
`;
  }

  static get is() { return 'remote-data' }
  static get properties() {
      return {
          dataSource: {
              notify: true,
              value: function () {
                  return this._dataSource.bind(this);
              }
          },

          /**
           * Indicates the "liquid request object" to render the data in the grid.
           */
          request: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          /**
           * Indicates an operation name for the provided "liquid request object".
           */
          operation: {
              type: String,
              value: ""
          },

          /**
           * Indicates a callback function where if user has given any liquid operation and request object to load the data,then
           * user has to transform the data based on their grid configuration and return an array of records.
           */
          dataFormatter: {
              notify: true
          },

          /**
           * 
           * Indicates an incremental data size for each page in the grid along with the use of "dataSource" for virtualization.
           * This is auto calculated.
           **/
          currentRecordSize: {
              type: Number,
              notify: true,
              value: 0
          },

          /**
           * 
           * Indicates the total record size of the grid.
           * This is auto calculated.
           */
          totalRecords: {
              type: Number,
              notify: true,
              value: 0
          },

          _data: {
              type: Array,
              value: function () {
                  return [];
              }
          },
          _lastPage: {
              type: Number,
              value: -1
          }
      }
  }


  /**
   * Indicates an external data source which is bound to the `rock-grid` to load the data.
   * The description given in the `rock-grid` provides the format for an external data source and how to pass it.
   **/

  _dataSource (opts, cb) {

      let onResponseData = function () {
          if (this._lastPage < opts.page) {
              let data = [];
              if (this.dataFormatter) {
                  data = this.dataFormatter(this.remoteData);
                  if(!data) {
                      data = [];
                  }
              }

              if (opts.pageSize <= data.length) {
                  if (this.currentRecordSize / opts.pageSize >= opts.page) {
                      this.currentRecordSize += this.currentRecordSize == 0 ? opts.pageSize *
                          2 : opts.pageSize;
                  }
              } else {
                  if (this.currentRecordSize == 0) {
                      this.currentRecordSize = data.length;
                  } else {
                      this.currentRecordSize -= opts.pageSize;
                  }
              }

              cb(data);
              this._lastPage = opts.page;
              this.totalRecords += data.length;
          }
      };

      let options = {
          "from": opts.page * opts.pageSize,
          "to": ((opts.page * opts.pageSize) + opts.pageSize) - 1
      };
      this.set("request.params.options", options);

      if (this.operation == "entitySearch") {
          let liquidInitSearch = dom(this).node.shadowRoot.querySelector(
              "liquid-entity-data-get[id='initiateSearchResult']");
          let liquidgetSearch = dom(this).node.shadowRoot.querySelector(
              "liquid-entity-data-get[id='getsearchresultdetail']");

          if (liquidInitSearch && liquidgetSearch) {

              let onIniteSearchResponse = function () {
                  liquidgetSearch.generateRequest();
              };

              this._oneTimeEvent(liquidgetSearch, 'response', onResponseData.bind(this));
              this._oneTimeEvent(liquidInitSearch, 'response', onIniteSearchResponse.bind(this));

              liquidInitSearch.generateRequest();
          }
      } else {
          let liquidGet = dom(this).node.shadowRoot.querySelector("liquid-entity-data-get[id='getRemoteData']");

          if (liquidGet) {
              this._oneTimeEvent(liquidGet, 'response', onResponseData.bind(this));
              liquidGet.generateRequest();
          }
      }
  }

  _isEntitySearchGrid (operation) {
      if (operation == "entitySearch") {
          return true;
      } else {
          return false;
      }
  }

  _resetDataSource () {
      this.currentRecordSize = 0;
      this._lastPage = -1;
      this.totalRecords = 0;
  }

  _oneTimeEvent (element, type, callback) {
      element.addEventListener(type, function (e) {
          e.target.removeEventListener(e.type, arguments.callee);
          return callback(e);
      });
  }
}
customElements.define(RemoteData.is, RemoteData);
