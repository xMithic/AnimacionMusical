/* Escena 3D · alta de modelos, encuadre automático y sombras (se concatena con las demás partes de scene/ en un único módulo; ver README) */
function b64buf(id){const s=B64[id];if(!s)return;const t=atob(s),u=new Uint8Array(t.length);for(let i=0;i<t.length;i++)u[i]=t.charCodeAt(i);return u.buffer}
function add(m){
  const done=g=>{const sc=g.scene,b=new THREE.Box3().setFromObject(sc),c=b.getCenter(new THREE.Vector3());
    sc.position.set(-c.x,-b.min.y,-c.z);
    sc.rotation.y = Math.PI;
    sc.traverse(o=>{if(o.isMesh)o.castShadow=true});
    const w=new THREE.Group();w.add(sc);root.add(w);
    items[m.id]={w,sc,mx:new THREE.AnimationMixer(sc),clips:g.animations,act:null};
    anims[m.id]=g.animations.map(a=>a.name);needFrame=true;$('ld').style.width='0';apply();
    if(parent!==window)parent.postMessage({k:'info',anims},'*')};
  const buf=m.src?null:(bufs[m.id]||b64buf(m.id));
  if(!m.src&&!buf)return;
  items[m.id]={};
  if(m.src)ldr.load(m.src,done,e=>{if(e.total)$('ld').style.width=e.loaded/e.total*100+'%'},fail);
  else ldr.parse(buf,'',done,fail);
}
function frame(){needFrame=false;const b=new THREE.Box3().setFromObject(root);if(b.isEmpty())return;
  const s=b.getSize(new THREE.Vector3()),ct=b.getCenter(new THREE.Vector3()),r=Math.max(s.x,s.y,s.z)/2||1,d=r/Math.sin(cam.fov*Math.PI/360)*1.15;
  cam.position.copy(ct).add(new THREE.Vector3(0,.2,1).normalize().multiplyScalar(d));ctl.target.copy(ct);ctl.minDistance=d*.2;ctl.maxDistance=d*4;
  fitShadow()}
const _b=new THREE.Box3(),_c=new V3(),_s=new V3(),LD3=new V3(.5,1,.7).normalize();let shSz=1024;
/* Ajusta la cámara de sombras a todos los modelos (aunque estén lejos del centro o se muevan bailando) */
function fitShadow(){_b.setFromObject(root);if(_b.isEmpty())return;_b.getCenter(_c);_b.getSize(_s);
  const r=Math.max(_s.length()/2,.5)*1.15+1.2;
  dl.position.copy(_c).addScaledVector(LD3,r*3);dl.target.position.copy(_c);dl.target.updateMatrixWorld();
  const sc=dl.shadow.camera;sc.left=-r;sc.right=r;sc.top=r;sc.bottom=-r;sc.near=.1;sc.far=r*6.5;sc.updateProjectionMatrix();
  const sz=r>5?2048:1024;if(sz!==shSz){shSz=sz;dl.shadow.mapSize.set(sz,sz);if(dl.shadow.map){dl.shadow.map.dispose();dl.shadow.map=null}}}
