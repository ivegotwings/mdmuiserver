const PRECACHE_URLS = [
  '/error-page/error-page.html',
  '/error-page/coming-soon.min.css',
  '/error-page/bootstrap.min.css',
  '/error-page/bg-mobile-fallback.jpg',
  '/error-page/riversandlogo.svg'
];
const PRECACHE = 'precache-v1';

self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open(PRECACHE)
        .then(cache => cache.addAll(PRECACHE_URLS))
        .then(self.skipWaiting())
    );  
});
  

self.handleResponse = async function(request, clientId){
  const response = await fetch(request);
  if((response.status == 401 || response.status == 404)){
    if (clientId){
        // Get the client.
        const client = await self.clients.get(clientId);
        // Exit early if we don't get the client. Eg, if it closed.
        if (client){
            client.postMessage({
              status: response.status,
              url: request.url
          });
        }
      }
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
      })
  }
  return response;
}  
self.addEventListener('fetch', (event) => {
  event.respondWith(self.handleResponse(event.request , event.clientId));
});

