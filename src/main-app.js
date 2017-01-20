(function(document) {
    document.addEventListener("click", function(e){
        var mainAppHost = document.querySelector("main-app").$;
      
        if(mainAppHost.drawerLayout.$.contentContainer.style.width != "48px"){
            if(e.__eventApi.rootTarget.id != "trigger" && e.__eventApi.rootTarget.className.indexOf("menu-trigger") == -1 && e.__eventApi.rootTarget.className.indexOf("iron-selected") == -1){
                mainAppHost.navMenu.$.toggleItem.click();
            }
        }
    });
  
})(document);


