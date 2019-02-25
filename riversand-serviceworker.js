self.addEventListener('install', function(event) {
    self.skipWaiting(); //replace immediately with new worker;
    // for future may be used to cache pages
  });

self.handleResponse = async function(request, clientId){
  const response = await fetch(request);
  if((response.status == 401)){
    if (clientId){
        // Get the client.
        const client = await self.clients.get(clientId);
        // Exit early if we don't get the client. Eg, if it closed.
        if (client){
            client.postMessage({
              msg: "AUTHENTICATION_ERROR",
              status: response.status,
              url: request.url
          });
        }
      }
  }
  return response;
}  
self.addEventListener('fetch', (event) => {
  event.respondWith(self.handleResponse(event.request , event.clientId));
});

