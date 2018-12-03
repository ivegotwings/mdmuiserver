import '@polymer/polymer/polymer-legacy.js';
import '../liquid-event-get.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';

Polymer$0({
  _template: Polymer.html`
        <liquid-event-get id="liqInitiateSearch" auto\$="[[auto]]" verbose="" operation="initiatesearch" request-data="{{initiateSearchRequestData}}" last-response="{{initiateSearchResponse}}" on-response="_onInitiateSearchResponse">
        </liquid-event-get>

        <liquid-event-get id="liqGetSearchResultDetail" verbose="" operation="getsearchresultdetail" on-response="_onGetSearchResultDetailResponse">
        </liquid-event-get>
`,

  is: 'liquid-event-get-demo-search',

  properties: {
      auto: {
          type: Boolean,
          value: false
      },
      initiateSearchRequestData: {
          type: Object,
          value: function () {
              return {
                  "params": {
                      "query": {
                          "filters": {
                              "typesCriterion": [
                                  "externalevent"
                              ],
                              "attributesCriterion": [
                                  {
                                      "eventType": {
                                          "eq": "rsconnect"
                                      }
                                  }, {
                                      "eventSubType": {
                                          "eq": "workBatchCompleted"
                                      }
                                  }
                              ]
                          }
                      },
                      "fields": {
                          "attributes": ["_ALL"]
                      }
                  }
              };
          }
      },
      initiateSearchResponse: {
          type: Object,
          value: function () { return {}; },
          notify: true
      },
      resultedEntities: {
          type: Object,
          value: function () { return []; },
          notify: true
      },
      pageSize: {
          type: Number,
          value: 3
      }
  },

  generateRequest: function () {
      this.shadowRoot.querySelector('#liqInitiateSearch').generateRequest();
  },

  _onInitiateSearchResponse: function (e) {
      console.log('initiate search result entities received with detail', JSON.stringify(e.detail.response, null, 4));

      var getDetailOptions = { 'from': 0, 'to': this.pageSize - 1 };

      this._makeGetSearchResultDetailCall(getDetailOptions);
  },

  _makeGetSearchResultDetailCall: function (options) {
      var liqGetSearchResultDetail = this.shadowRoot.querySelector('#liqGetSearchResultDetail');

      var searchResultId = this.initiateSearchResponse.content.requestId;
      var totalRecords = this.initiateSearchResponse.content.totalRecords;

      if (options.from < totalRecords) {
          var reqData = this.initiateSearchRequestData;
          reqData.params.options = options;

          liqGetSearchResultDetail.requestId = searchResultId;
          liqGetSearchResultDetail.requestData = reqData;

          liqGetSearchResultDetail.generateRequest();
      }
  },

  _onGetSearchResultDetailResponse: function (e) {
      console.log('search result entities received with detail', JSON.stringify(e.detail, null, 4));

      this.resultedEntities.push.apply(this.resultedEntities, e.detail.response.entities);

      var requestedOptions = e.detail.request.requestData.params.options;

      if (requestedOptions) {
          requestedOptions.from = requestedOptions.to + 1;
          requestedOptions.to = requestedOptions.from + (this.pageSize - 1);

          this._makeGetSearchResultDetailCall(requestedOptions);
      }
  }
});
