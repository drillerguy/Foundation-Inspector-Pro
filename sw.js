const CACHE='foundation-inspector-pro-v6';
const CORE=['./','./index.html','./recovery.html','./manifest.webmanifest','../-ORD-Caisson-Inspector/caisson-plan.png','../-ORD-Caisson-Inspector/index.html'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>Promise.allSettled(CORE.map(url=>cache.add(url)))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  const isMain=url.origin===location.origin&&(url.pathname.endsWith('/Foundation-Inspector-Pro/')||url.pathname.endsWith('/Foundation-Inspector-Pro/index.html'));
  if(isMain){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));return response}).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response})));
});
