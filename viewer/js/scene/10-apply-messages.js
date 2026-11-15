/* Escena 3D · apply() y mensajes recibidos desde el panel de administración (se concatena con las demás partes de scene/ en un único módulo; ver README) */
function applyLyr(){if(window.LYR&&cfg!==lyCfg){lyCfg=cfg;LYR.cfg(cfg,window.MURL||{},edit)}}
/* La letra va PRIMERO y aislada: un fallo en el 3D o en los botones ya no puede dejarla sin configurar */
function apply(){try{applyLyr()}catch(e){rep('letra',e)}try{applyScene()}catch(e){rep('escena',e)}try{applyUI()}catch(e){rep('botones',e)}}
addEventListener('message',e=>{if(e.source!==parent)return;const m=e.data||{};
  if(m.k==='sel'){sel=m.id;apply()}
  else if(m.k==='mode'&&tc)tc.setMode(m.m)
  else if(m.k==='cfg'){edit=true;initTC();Object.assign(bufs,m.buffers);window.MURL=m.music||{};setCfg(m.cfg);apply()}
  else if(m.k==='mus'){if(window.LYR)LYR.ctl(m)}
  else if(m.k==='frame'){needFrame=true;apply()}
  else if(m.k==='lib'){const L2=decLib(m.lib);if(L2){if(!LIB)LIB={sk:{},a:{}};Object.assign(LIB.sk,L2.sk);
    for(const k in L2.a){LIB.a[k]=L2.a[k];for(const i in items){const it=items[i];if(it.xc)delete it.xc[k];if(it.xe)delete it.xe[k]}}
    for(const i in items)items[i].k=null;apply()}}
  else if(m.k==='view'){const v=cfg.views[m.i];if(v)goView(v)}
  else if(m.k==='cap'){const t=ctl.target,p=cam.position;parent.postMessage({k:'cam',pos:[p.x,p.y,p.z].map(r2),target:[t.x,t.y,t.z].map(r2),fov:r2(cam.fov)},'*')}});
