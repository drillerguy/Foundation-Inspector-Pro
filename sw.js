const CACHE='foundation-inspector-pro-v4';
const CORE=['./','./index.html','./recovery.html','./gps-fix.js','./manifest.webmanifest','../-ORD-Caisson-Inspector/caisson-plan.png','../-ORD-Caisson-Inspector/index.html'];

self.addEventListener('install',e=>e.waitUntil(
  caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())
));

self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));

self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.origin===location.origin && (u.pathname.endsWith('/Foundation-Inspector-Pro/') || u.pathname.endsWith('/Foundation-Inspector-Pro/index.html'))){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(async resp=>{
      let html=await resp.text();
      if(!html.includes('gps-fix.js')) html=html.replace('</body>','<script src="./gps-fix.js?v=4"></script></body>');
      return new Response(html,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(fetch(e.request,{cache:'no-store'}).then(resp=>{
    const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp;
  }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});