const CACHE='visor3d-shell-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const u=new URL(event.request.url);
 if(event.request.method!=='GET'||u.origin!==location.origin)return;
 if(event.request.mode==='navigate'){
  event.respondWith(fetch(event.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return r;}).catch(()=>caches.match('./index.html')));
 }else if(SHELL.some(p=>u.pathname.endsWith(p.replace('./','')))){
  event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request)));
 }
});
