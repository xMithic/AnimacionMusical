/* Escena 3D · animación por modelo y aplicación de la configuración a la escena (se concatena con las demás partes de scene/ en un único módulo; ver README) */
const uiEl=$('ui');uiEl.setAttribute('role','group');uiEl.setAttribute('aria-label','Controles del visor');
let uiKey='',crKey=null,lyCfg=null;
const rep=(k,e)=>{console.error(k,e);if(parent!==window)parent.postMessage({k:'rig',err:k+': '+((e&&e.message)||e)},'*')};
const LOOP1=THREE.LoopOnce,LOOPN=THREE.LoopRepeat;
function setAnim(it,m){const an=m.anim||'',k=an+'|'+m.speed+'|'+m.loop;if(it.k===k)return;
  /* misma animación: solo cambia velocidad/repetición, sin reiniciar */
  if(it.act&&it.an===an){it.act.timeScale=m.speed;it.act.setLoop(m.loop?LOOPN:LOOP1,m.loop?Infinity:1);it.k=k;return}
  let cl=null;
  if(an.startsWith('x:')){const id=an.slice(2);
    if(it.xe&&it.xe[id]){it.k=k;it.pend=null;it.an=an;const o=it.act;it.act=null;if(o)o.stop();return} /* ya falló: no reintentar ni dejar el botón en «cargando» */
    cl=wantClip(it,id);if(!cl){it.pend=an;return}}
  else cl=it.clips.find(a=>a.name===an)||null;
  it.k=k;it.pend=null;it.an=an;const old=it.act;it.act=null;
  if(cl){const a=it.mx.clipAction(cl);a.reset().setEffectiveWeight(1);a.timeScale=m.speed;a.setLoop(m.loop?LOOPN:LOOP1,m.loop?Infinity:1);a.clampWhenFinished=true;a.play();
    if(old&&old!==a){a.crossFadeFrom(old,.25,false);setTimeout(()=>{if(it.act!==old)old.stop()},320)}it.act=a}
  else if(old)old.stop()}
function applyScene(){
  const {bg,cam:c,light:l}=cfg;
  document.body.style.background=bg.type==='solid'?bg.c1:bg.type==='gradient'?`radial-gradient(circle at 50% 35%,${bg.c1},${bg.c2})`:'none';
  document.title=cfg.title||'Visor 3D';const t=$('t');t.textContent=cfg.showTitle?cfg.title:'';t.style.color=cfg.titleColor;
  R.toneMappingExposure=l.exposure;S.environmentIntensity=l.env;fl.visible=l.shadow;dl.castShadow=l.shadow;
  ctl.autoRotate=false;ctl.enabled=edit?!(tc&&tc.dragging):c.interact;ctl.autoRotateSpeed=c.speed;ctl.enableZoom=edit||c.zoom;ctl.enablePan=edit||c.pan;ctl.screenSpacePanning=true;
  if(c.fov!==lastFov){lastFov=c.fov;cam.fov=c.fov;cam.updateProjectionMatrix()}
  cfg.models.forEach(m=>{if(!items[m.id])add(m);const it=items[m.id];if(!it||!it.w)return;
    it.w.visible=m.visible;it.w.position.set(...m.pos);it.w.rotation.set(...m.rot.map(d=>d*Math.PI/180));it.w.scale.setScalar(m.s||.001);
    try{setAnim(it,m)}catch(e){it.k=m.anim+'|'+m.speed+'|'+m.loop;rep('animación',e)}});
  for(const id in items)if(!cfg.models.some(m=>m.id===id)){items[id].gone=true;if(items[id].w)root.remove(items[id].w);delete items[id]}
  syncOutlines();
  if(tc){const it=items[sel];if(it&&it.w){if(tc.object!==it.w)tc.attach(it.w)}else tc.detach()}
  if(c.auto){if(needFrame&&root.children.length)frame()}
  else{ctl.minDistance=0;ctl.maxDistance=Infinity;const k=JSON.stringify([c.pos,c.target]);if(k!==lastCam){lastCam=k;cam.position.set(...c.pos);ctl.target.set(...c.target)}}
  if(edit){ctl.minDistance=0;ctl.maxDistance=Infinity}else{if(+c.minDist>0)ctl.minDistance=+c.minDist;if(+c.maxDist>0)ctl.maxDistance=+c.maxDist}
  fitShadow();
}
