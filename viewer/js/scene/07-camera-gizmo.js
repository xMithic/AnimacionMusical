/* Escena 3D · cámara (vistas y planos) y gizmo de transformación (se concatena con las demás partes de scene/ en un único módulo; ver README) */
/* Cámara: transiciones suaves entre vistas y cambio automático de plano */
let tw=null,shotI=0,shotT=performance.now(),shotPause=0,lastFov=null,fsC=0;
function goView(v){const c=cfg.cam,dur=c.tween==null?.8:+c.tween;ctl.autoRotate=false;
  if(!(dur>0)){cam.position.set(...v.pos);ctl.target.set(...v.target);if(v.fov){cam.fov=v.fov;cam.updateProjectionMatrix()}tw=null;return}
  tw={t0:performance.now(),d:dur*1000,p0:cam.position.clone(),q0:ctl.target.clone(),f0:cam.fov,p1:new V3(...v.pos),q1:new V3(...v.target),f1:v.fov||c.fov}}
function stepCam(now){const c=cfg.cam;
  if(tw){const k=Math.min(1,(now-tw.t0)/tw.d),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;cam.position.lerpVectors(tw.p0,tw.p1,e);ctl.target.lerpVectors(tw.q0,tw.q1,e);
    const f=tw.f0+(tw.f1-tw.f0)*e;if(Math.abs(f-cam.fov)>1e-3){cam.fov=f;cam.updateProjectionMatrix()}if(k>=1)tw=null;return}
  if(!edit&&c.shots&&cfg.views.length>1&&now>shotPause&&now-shotT>Math.max(1,+c.shotTime||5)*1000){shotT=now;shotI=(shotI+1)%cfg.views.length;goView(cfg.views[shotI])}}
ctl.addEventListener('start',()=>{shotPause=performance.now()+10000;tw=null});
let tc,sel=null,edit=false,justDrag=false;
function initTC(){if(tc)return;tc=new TransformControls(cam,R.domElement);S.add(tc.getHelper());
  tc.addEventListener('dragging-changed',e=>{ctl.enabled=!e.value;if(e.value)justDrag=true});
  tc.addEventListener('objectChange',()=>{const w=tc.object;if(!w)return;w.scale.setScalar(w.scale.x);const d=180/Math.PI;
    parent.postMessage({k:'xf',id:sel,pos:[w.position.x,w.position.y,w.position.z].map(r2),rot:[w.rotation.x,w.rotation.y,w.rotation.z].map(x=>r2(x*d)),s:r2(w.scale.x)},'*')});
  R.domElement.addEventListener('click',e=>{if(justDrag){justDrag=false;return}
    const r=R.domElement.getBoundingClientRect(),rc=new THREE.Raycaster();rc.setFromCamera({x:(e.clientX-r.left)/r.width*2-1,y:-(e.clientY-r.top)/r.height*2+1},cam);
    const h=rc.intersectObjects(root.children.filter(w=>w.visible),true)[0];if(!h)return;let o=h.object;while(o.parent!==root)o=o.parent;
    const id=Object.keys(items).find(i=>items[i].w===o);if(id){sel=id;apply();parent.postMessage({k:'pick',id},'*')}})}
