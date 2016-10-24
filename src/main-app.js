(function(document) {
  
  var app = document.querySelector('#app');

  app.displayInstalledToast = function() {
    // Check to make sure caching is actually enabled—it won't be in the dev environment.
    if (!document.querySelector('platinum-sw-cache').disabled) {
      document.querySelector('#caching-complete').show();
    }
  };
  // Firebase location
  app.location = 'https://polymer-admin.firebaseio.com';

})(document);
