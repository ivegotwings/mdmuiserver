(function(document) {
    document.addEventListener("click", function(e){
        if(e.__eventApi.rootTarget.id != "trigger" && e.__eventApi.rootTarget.className != "menu-trigger iron-selected"){
            document.querySelector("main-app").$.navMenu.$.toggleItem.click();
        }
    });
  
})(document);


