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
