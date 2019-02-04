import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-helpers/data-request-helper.js';
import '../bedrock-helpers/data-transform-helper.js';
import '../bedrock-helpers/context-helper.js';
import '../bedrock-helpers/attribute-helper.js';
import '../bedrock-helpers/component-helper.js';
import '../bedrock-helpers/format-helper.js';
import '../bedrock-managers/local-storage-manager.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import '../liquid-entity-govern-data-get/liquid-entity-govern-data-get.js';
import '../liquid-entity-model-get/liquid-entity-model-get.js';
import '../liquid-dataobject-utils/liquid-dataobject-utils.js';
import '../rock-component-config-behavior/rock-component-config-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import LocalStorageManager from '../bedrock-managers/local-storage-manager.js';

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

SharedUtils.ModuleVersionManager = ModuleVersionManager;

//register as module or as js 
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = ModuleVersionManager
    }
    exports.ModuleVersionManager = ModuleVersionManager;
}

/**

@group rock Elements
@element rock-component-sample
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
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


class RockComponentSample
    extends mixinBehaviors([RUFBehaviors.ComponentContextBehavior, RUFBehaviors.ComponentConfigBehavior], PolymerElement) {
  static get template() {
    return html`
        <liquid-entity-model-composite-get on-entity-model-composite-get-response="_onCompositeModelGetResponse"></liquid-entity-model-composite-get>
        <liquid-entity-data-get operation="getbyids" on-response="_onHeaderAttributesGetResponse"></liquid-entity-data-get>
        <liquid-entity-govern-data-get operation="getbyids" on-response="_onRunningInstanceReceived" on-error="_onRunningInstanceGetFailed"></liquid-entity-govern-data-get>
`;
  }

  static get is() { return 'rock-component-sample' }

  static get properties() {
      return {};
  }

  /**
  *  
  */
  connectedCallback() {
      super.connectedCallback();
      this.setNoStorageFlag();

      let appContext = {
          "app": "app-entity-manage"
      };

      let domainContext = {
          "domain": "thing"
      };

      let dataContext = {
          "country": "Germany"
      };

      let valueContext = {
          "source": "internal",
          "locale": "en-US"
      };

      let itemContext = {
          "id": "RDWSanityTestRel02",
          "type": "product"
      };

      let userContext = {
          "roles": "admin",
          "defaultRole": "admin",
          "user": "rdwadmin@riversand.com_user",
          "tenant": "rdw"
      };

      this.contextData[ContextHelper.CONTEXT_TYPE_APP] = [appContext];
      this.contextData[ContextHelper.CONTEXT_TYPE_DOMAIN] = [domainContext];
      this.contextData[ContextHelper.CONTEXT_TYPE_DATA] = [dataContext];
      this.contextData[ContextHelper.CONTEXT_TYPE_VALUE] = [valueContext];
      this.contextData[ContextHelper.CONTEXT_TYPE_ITEM] = [itemContext];
      this.contextData[ContextHelper.CONTEXT_TYPE_USER] = [userContext];
      
      this.requestConfig('rock-entity-header', this.contextData);
  }

  /**
  *
  */
  disconnectedCallback() {
      super.disconnectedCallback();
  }

  onConfigLoaded(componentConfig) {
      console.log('config received ', JSON.stringify(componentConfig, null, 2));
      //console.log('my config ', JSON.stringify(this.componentConfig, null, 2));
  }

  setNoStorageFlag() {
      let noDataStorage = "false";

      let url = window.location.href;
      if(url.indexOf('nostorage=1') !== -1) {
          noDataStorage = "true";
      }
      
      LocalStorageManager.set("no-data-storage", null, noDataStorage);
  }
}

customElements.define(RockComponentSample.is, RockComponentSample);
