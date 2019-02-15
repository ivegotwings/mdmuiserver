import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class DomainManager {

    static get is() {
        return "domain-manager";
    }
    constructor() {
        this.systemDomains = ['baseModel', 'governanceModel', 'sysReferenceData', 'taxonomyModel','referenceData'];
        if (!RUFUtilities.domainManager) {
            RUFUtilities.domainManager = this;
        }
    }
    static getInstance() {
        if (!RUFUtilities.domainManager) {
            RUFUtilities.domainManager = new DomainManager();;
        }
        return RUFUtilities.domainManager;
    }

    getSystemDomains(){
        return this.systemDomains;
    }
}

export default DomainManager
