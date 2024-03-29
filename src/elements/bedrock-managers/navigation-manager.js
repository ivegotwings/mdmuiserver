import '../bedrock-helpers/context-helper.js';

class NavigationManager {
    constructor() {
        if (!RUFUtilities.navigationManager) {
            RUFUtilities.navigationManager = this;
        }
        this._storedNavData = this._readStorage();
        return RUFUtilities.navigationManager;
    }
    static getInstance() {
        if (!RUFUtilities.navigationManager) {
            RUFUtilities.navigationManager = new NavigationManager();
        }
        return RUFUtilities.navigationManager;
    }
    
    _writeStorage(_dataObj){
        sessionStorage.setItem('navigationData', JSON.stringify(_dataObj));
    }
    _readStorage(){
        let obj = sessionStorage.getItem('navigationData');
        let navDataObj = {};
        if(obj){
            navDataObj =  JSON.parse(obj);
        }
        return navDataObj;
    }
    _getPageFromUrl(){
        let page = "";
        let queryParamSplit = location.href.split("?");
        if(queryParamSplit.length){
            let urlWithoutParam = queryParamSplit[0];
            if(urlWithoutParam){
                let slashIndex = urlWithoutParam.lastIndexOf("/")+1;
                page = urlWithoutParam.substr(slashIndex, urlWithoutParam.length);
            }
        }
        return page;
    }
    _getQueryParamsFromUrl(param){
        let mainApp = RUFUtilities.mainApp;
        if (mainApp && mainApp.pageRoute && mainApp.pageRoute.__queryParams && param in mainApp.pageRoute
            .__queryParams) {
            let paramValue = mainApp.pageRoute.__queryParams[param];
            if (paramValue) {
                return paramValue;
            }
        }
    }
    getNavData(parentId, childId, _page){
        if(this._storedNavData){
            let page = _page ? _page : this._getPageFromUrl();
            let pageLevelNav;
            if(this._storedNavData[page]){
                if(page && (page == "entity-manage")){
                    let entityId = this._getQueryParamsFromUrl("id");
                    if(this._storedNavData[page][entityId]){
                        pageLevelNav = this._storedNavData[page][entityId];
                    }
                }else{
                    pageLevelNav = this._storedNavData[page];
                }
            }
            if(pageLevelNav && !_.isEmpty(pageLevelNav) && parentId){
                let parentObj = pageLevelNav[parentId];
                if(parentObj && !_.isEmpty(parentObj)){
                    if(childId){
                        return parentObj[childId];
                    }else{
                        return parentObj;
                    }
                }
            }
            return pageLevelNav;
        }
        return {}
    }
    
    setNavData(parentId, childId, property, value, page, _entityId){
        let currentPage = page ? page : this._getPageFromUrl();
        if(!this._storedNavData[currentPage]){
            this._storedNavData[currentPage] = {};
        }
        let pageLevel = this._storedNavData[currentPage];
        if(currentPage == "entity-manage"){
            let entityId = _entityId ? _entityId : this._getQueryParamsFromUrl("id");
            if(entityId){
                if(!pageLevel[entityId]){
                    pageLevel[entityId] = {};
                }
                pageLevel = pageLevel[entityId];
            }else{
                return;
            }
        }
        if(parentId){
            if(!pageLevel[parentId]){
                pageLevel[parentId] = {};
            }
            if(childId){
                let compLevel = pageLevel[parentId];
                if(value){
                    if(!compLevel[childId]){
                        compLevel[childId] = {};
                    }
                    compLevel[childId][property] = value;
                }else{
                    compLevel[childId] = DataHelper.cloneObject(property);
                }
            }else{
                if(value){
                    pageLevel[parentId][property] = value;
                }else{
                    pageLevel[parentId] = DataHelper.cloneObject(property)
                }
            };
        };
        
        this._writeStorage(this._storedNavData);
    }

}

export default NavigationManager;