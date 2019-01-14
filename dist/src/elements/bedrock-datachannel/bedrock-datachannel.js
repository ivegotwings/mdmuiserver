import '@polymer/polymer/polymer-legacy.js';
import '../bedrock-externalref-falcor/bedrock-externalref-falcor.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-managers/local-storage-manager.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';

window.RUFBehaviors = window.RUFBehaviors || {};

RUFBehaviors.DataChannel = {

  properties: {
    /**
      * Content is not appearing - Indicates key for the translation.If it is set to <b>true</b>, then it uses provided key when
      * the translation does not exist for that key.
    */
    _models: {
      type: Object,
      value: {}
    },
    /**
      * Content is not appearing - Content development is under progress.
    */
    callCounters: {
      type: Object,
      value: function () {
        return {};
      }
    },
    cacheChangeDebouncers: {
      type: Object,
      value: function () {
        return {};
      }
    }
  },

  getCallCounters: function () {
    return JSON.stringify(this.callCounters);
  },

  updateCallCounters: function (operation) {

    if (this.callCounters === undefined) {
      this.callCounters = {}
    };

    if (this.callCounters[operation] !== undefined) {
      this.callCounters[operation] = this.callCounters[operation] + 1
    }
    else {
      this.callCounters[operation] = 1;
    }
  },
  
  getModel: function (channelName) {
    if (!channelName) {
      throw "channelName is not provided";
    }

    if (!this._models) {
      this._models = {};
    }

    if (!this._models[channelName]) {
      this._models[channelName] = this._createModel(channelName);;
    }

    return this._models[channelName];
  },
  
  falcorCacheSerializer: function (key, value) {
    if (value && value["$type"] && value["$type"] == "error") {
      return undefined;
    }

    if (key == "searchResults") {
      return undefined;
    }
    return value;
  },
  
  getCacheScope: function (channelName) {
    let userId = DataHelper.getUserId();
    let tenantId = DataHelper.getTenantId();
    let rv = SharedUtils.RuntimeVersionManager.getVersion();
    let mv = SharedUtils.ModuleVersionManager.getVersion(channelName);

    return {
      "tenantId": tenantId,
      "userId": userId,
      "runtime-version": rv,
      "module-version": mv
    };
  },
  
  clearAllCache: function () {
    let allConfigs = RUFBehaviors.DataChannel._getAllChannelConfigs();

    if (allConfigs && allConfigs.channels) {
      for (let channelName in allConfigs.channels) {
        RUFBehaviors.DataChannel.clearChannelCache(channelName);
      }
    }
  },
  
  clearChannelCache: function (channelName) {
    let falcorModel = RUFBehaviors.DataChannel.getModel(channelName);

    if (falcorModel) {
      falcorModel.setCache({});
    }
  },
  
  onEntityDataChange: function () {
    RUFBehaviors.DataChannel.onCacheChange('entityData', 0);
  },
  
  onEntityGovernDataChange: function () {
    RUFBehaviors.DataChannel.onCacheChange('entityGovernData', 0);
  },
  
  onConfigChange: function () {
    RUFBehaviors.DataChannel.onCacheChange('config', 60000);
  },
  
  onEntityModelChange: function () {
    RUFBehaviors.DataChannel.onCacheChange('entityModel', 90000);
  },
  
  onEventDataChange: function () {
    RUFBehaviors.DataChannel.onCacheChange('eventData', 120000);
  },
  
  onCacheChange: function (channelName, debounceDuration) {
    let dataChannel = RUFBehaviors.DataChannel;

    if (!dataChannel.cacheChangeDebouncers) {
      dataChannel.cacheChangeDebouncers = {};
    }
    let _debouncer = dataChannel.cacheChangeDebouncers[channelName];

    _debouncer = Debouncer.debounce(_debouncer, timeOut.after(debounceDuration), () => {
      let falcorCacheData = dataChannel.getModel(channelName).getCache();
      if (falcorCacheData) {
        let dataAsString = JSON.stringify(falcorCacheData, dataChannel.falcorCacheSerializer);
        LocalStorageManager.set(channelName, dataChannel.getCacheScope(channelName), dataAsString);
      }
    });
  },

  _createModel: function (channelName) {
    let dataChannel = RUFBehaviors.DataChannel;

    let channelConfig = this._getChannelConfig(channelName);

    if (!channelConfig) {
      throw 'channel config not fonud the given channel name ' + channelName;
    }

    let falcorDataSource = new falcor.HttpDataSource(channelConfig.path, { 'crossDomain': true, 'withCredentials': false, 'timeout': 180000 });

    let cacheChangeEvent = undefined;

    let noDataStorage = LocalStorageManager.get("no-data-storage");

    let offlineStoreEnabled = channelConfig.offlineStore && (!(noDataStorage && noDataStorage == "true"));

    if (offlineStoreEnabled) {
      cacheChangeEvent = dataChannel[channelConfig.cacheChangeCallback];
    }

    let model = new falcor.Model({
      source: falcorDataSource,
      maxSize: channelConfig.maxSize,
      collectRatio: channelConfig.collectRatio,
      onChange: cacheChangeEvent,
      errorSelector: function(path, message) {
        message.$expires =  -1000 * 60 * 1; // expires all errors after 1 min so that system can recover
        return message;
      }
    });

    if (channelConfig.treatErrorsAsValues) {
      model.treatErrorsAsValues();
    }

    if (offlineStoreEnabled) {
      let localStorageData = LocalStorageManager.get(channelName, this.getCacheScope(channelName), true);
      if (localStorageData) {
        model.setCache(JSON.parse(localStorageData));
      }
    }

    return model;
  },
  
  _getChannelConfig: function (channelName) {
    let allConfigs = this._getAllChannelConfigs();
    if (allConfigs.channels[channelName] !== undefined) {
      return allConfigs.channels[channelName];
    }
    else {
      throw "Requested data channel " + channelName + " does not exist in channel config";
    }
  },
  
  _getAllChannelConfigs: function () {
    return {
      'channels': {
        'entityData': {
          'path': '/data/entityData.json',
          'maxSize': 100000000,
          'collectRatio': 0.75,
          'treatErrorsAsValues': false,
          'offlineStore': false,
          'cacheChangeCallback': 'onEntityDataChange',
          'offlineRefreshRateInMilliSeconds': 0
        },
        'entityGovernData': {
          'path': '/data/entityGovernData.json',
          'maxSize': 100000000,
          'collectRatio': 0.75,
          'treatErrorsAsValues': false,
          'offlineStore': false,
          'cacheChangeCallback': 'onEntityGovernDataChange',
          'offlineRefreshRateInMilliSeconds': 0
        },
        'entityModel': {
          'path': '/data/entityModelData.json',
          'maxSize': 100000000,
          'collectRatio': 0.75,
          'treatErrorsAsValues': false,
          'offlineStore': true,
          'cacheChangeCallback': 'onEntityModelChange',
          'offlineRefreshRateInMilliSeconds': 90000
        },
        'config': {
          'path': '/data/configData.json',
          'maxSize': 100000000,
          'collectRatio': 0.75,
          'treatErrorsAsValues': false,
          'offlineStore': true,
          'cacheChangeCallback': 'onConfigChange',
          'offlineRefreshRateInMilliSeconds': 60000
        },
        'eventData': {
          'path': '/data/eventData.json',
          'maxSize': 100000000,
          'collectRatio': 0.75,
          'treatErrorsAsValues': false,
          'offlineStore': true,
          'cacheChangeCallback': 'onEventDataChange',
          'offlineRefreshRateInMilliSeconds': 120000
        },
        'requestTracking': {
          'path': '/data/requestTracking.json',
          'maxSize': 1000000,
          'collectRatio': 0.75,
          'treatErrorsAsValues': false,
          'offlineStore': false,
          'cacheChangeCallback': 'onEventDataChange',
          'offlineRefreshRateInMilliSeconds': 0
        }
      }
    };
  }
};
