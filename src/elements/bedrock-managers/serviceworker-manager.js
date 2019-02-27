class ServiceWorkerManager {
    constructor(){}
    static UnregisterServiceWorkers(){
        //service worker clean up
        if('serviceWorker' in navigator){
            //remove all registrations
            navigator.serviceWorker.getRegistrations().then(
            function(registrations) {
                for(let registration of registrations) {  
                    registration.unregister();
                }
            });
            location.reload();  
        }  
    }
}

export default ServiceWorkerManager