import '@polymer/polymer/polymer-legacy.js';
import '../liquid-entity-data-get.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';

class RuntimeVersionManager {
    static get DEFAULT_VERSION() {
        return "1.0.0-1";
    }

    static getVersion() {
        return RuntimeVersionManager._version ? RuntimeVersionManager._version : this.DEFAULT_VERSION;
    }

    static setVersion(version) {
        RuntimeVersionManager._version = version;
        RuntimeVersionManager.timestamp = (Date.now() / 1000 | 0);
    }
}

// eslint-disable-next-line no-var
var SharedUtils = SharedUtils || {};

if (!SharedUtils) {
    SharedUtils = {};
}

SharedUtils.RuntimeVersionManager = RuntimeVersionManager;

//register as module or as js 
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = RuntimeVersionManager
    }
    exports.RuntimeVersionManager = RuntimeVersionManager;
}

class ModuleVersionManager {
    static get DEFAULT_VERSION() {
        return 101;
    }

    static initialize(data) {
        ModuleVersionManager._data = data;
    }

    static getVersion(module) {
        if (!ModuleVersionManager._data[module]) {
            this.setVersion(module, this.DEFAULT_VERSION);
        }

        return ModuleVersionManager._data[module] ? ModuleVersionManager._data[module].version : this.DEFAULT_VERSION;
    }

    static getAll () {
        return ModuleVersionManager._data;
    }

    static setVersion(module, version) {
        ModuleVersionManager._data[module] = {
            version: version,
            timestamp: (Date.now() / 1000 | 0)
        }
    }
}

// eslint-disable-next-line no-var
var SharedUtils = SharedUtils || {};

if (!SharedUtils) {
    SharedUtils = {};
}

SharedUtils.ModuleVersionManager = ModuleVersionManager;

//register as module or as js 
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = ModuleVersionManager
    }
    exports.ModuleVersionManager = ModuleVersionManager;
}
let versionInfo = {
    'buildVersion': "1.1.1",
    'runtimeVersion': "1.1.1-1",
    'moduleVersions': {
        "entityData": "1.1.1"
    }
};

if (SharedUtils && SharedUtils.RuntimeVersionManager) {
    RuntimeVersionManager.setVersion(versionInfo.runtimeVersion);
    console.log('runtime version: ', RuntimeVersionManager.getVersion());
}

if (SharedUtils && SharedUtils.ModuleVersionManager) {
    ModuleVersionManager.initialize(versionInfo.moduleVersions);
    console.log('module versions: ', JSON.stringify(ModuleVersionManager.getAll()));
}

Polymer$0({
  _template: html`
        <liquid-entity-data-get id="liqInitiateSearch" auto\$="[[auto]]" operation="searchandget" request-data="{{initiateSearchRequestData}}" last-response="{{initiateSearchResponse}}" on-response="_onInitiateSearchResponse">
        </liquid-entity-data-get>

        <liquid-entity-data-get id="liqGetSearchResultDetail" operation="getsearchresultdetail" on-response="_onGetSearchResultDetailResponse">
        </liquid-entity-data-get>
`,

  is: 'liquid-entity-data-get-demo-search',

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
                              "attributesCriterion": [],
                              "typesCriterion": ["locale"]
                          }
                      },
                      "fields": {
                          "attributes": [
                              "_ALL"
                          ]
                      },
                      "options": {
                      }
                  }
              };
          }
      },
      initiateSearchResponse: {
          type: Object,
          value: function () {
              return {};
          },
          notify: true
      },
      resultedEntities: {
          type: Object,
          value: function () {
              return [];
          },
          notify: true
      },
      pageSize: {
          type: Number,
          value: 100
      }
  },

  generateRequest: function () {
      this.shadowRoot.querySelector('#liqInitiateSearch').generateRequest();
  },

  _onInitiateSearchResponse: function (e) {
      //console.log('initiate search result entities received with detail', JSON.stringify(e.detail.response, null, 4));
      console.log('initiate search result entities received with detail', e.detail.response.content.totalRecords, e.detail.response);

      var getDetailOptions = {
          'from': 0,
          'to': this.pageSize - 1
      };

      //this._makeGetSearchResultDetailCall(getDetailOptions);
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
      console.log('search result entities received with detail', e.detail, null, 4);

      this.resultedEntities.push.apply(this.resultedEntities, e.detail.response.entities);

      var requestedOptions = e.detail.request.requestData.params.options;

      if (requestedOptions) {
          requestedOptions.from = requestedOptions.to + 1;
          requestedOptions.to = requestedOptions.from + (this.pageSize - 1);

          this._makeGetSearchResultDetailCall(requestedOptions);
      }
  }
});
