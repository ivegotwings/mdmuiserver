import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class DomainManager extends mixinBehaviors([RUFBehaviors.LoggerBehavior], PolymerElement) {

    static get is() {
        return "domain-manager";
    }
    constructor() {
        super();
        this.systemDomains = ['baseModel', 'governanceModel', 'sysReferenceData', 'taxonomyModel'];
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

customElements.define(DomainManager.is, DomainManager);

export default DomainManager;