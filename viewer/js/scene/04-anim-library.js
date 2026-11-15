/* Escena 3D · cargador GLTF y decodificación de la biblioteca de bailes (se concatena con las demás partes de scene/ en un único módulo; ver README) */
const ldr=new GLTFLoader(),clock=new THREE.Clock(),r2=x=>Math.round(x*100)/100;
const fail=id=>{$('ld').style.background='#e33';$('ld').style.width='100%';$('t').textContent='No se pudo cargar el modelo';if(id&&items[id])items[id].failed=true};
const V3=THREE.Vector3,Q=THREE.Quaternion;let LIB=null;
const b2a=s=>{const t=atob(s),u=new Uint8Array(t.length);for(let i=0;i<t.length;i++)u[i]=t.charCodeAt(i);return u.buffer};
function decLib(o){if(!o||!o.a||!o.sk)return null;for(const k in o.a){const a=o.a[k];if(typeof a.r==='string'){const rs=a.r,hs=a.h;let R2=null,H2=null;
  Object.defineProperties(a,{r:{get:()=>R2||(R2=new Int16Array(b2a(rs))),configurable:true,enumerable:true},h:{get:()=>H2||(H2=new Float32Array(b2a(hs))),configurable:true,enumerable:true}})}}return o}
LIB=decLib(J('anm'));
