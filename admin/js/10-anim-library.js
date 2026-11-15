/* Biblioteca de animaciones — decodificación diferida, envío al visor y carga desde la carpeta Animaciones */
const nAn=()=>Object.keys(lib.a).length;
let xOpt='',xVer=-1,libVer=0;const libSent=new Set();
function xOptions(){if(xVer===libVer)return xOpt;const g={};for(const k in lib.a){const a=lib.a[k];(g[a.s]||(g[a.s]=[])).push(`<option value="${esc('x:'+k)}">💃 ${esc(a.name)}</option>`)}
 xOpt=Object.entries(g).map(([s,o])=>`<optgroup label="${esc(s)}">${o.join('')}</optgroup>`).join('');xVer=libVer;return xOpt}
const animSel=(i,m)=>`<label>Animación<select data-p="models.${i}.anim" data-anim="1"><option value="">(ninguna)</option>${(anims[m.id]||[]).map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('')}${xOptions()}</select></label>`;
const yld=()=>new Promise(r=>setTimeout(r,0));
const lazyA=(o,mk,nf)=>{let d=null,pr=null;
 const sync=()=>{if(d)return d;const D=mk();for(let f=0;f<nf;f++)D.frame(f);return d=D};
 const run=async()=>{const D=mk();for(let f=0;f<nf;){const t0=performance.now();do{D.frame(f++)}while(f<nf&&performance.now()-t0<6);if(f<nf)await yld()}return d=d||D};
 o.done=()=>!!d;o.ready=()=>d?Promise.resolve(d):(pr||(pr=run()));
 Object.defineProperties(o,{r:{get:()=>sync().r,enumerable:false,configurable:true},h:{get:()=>sync().h,enumerable:false,configurable:true}});return o};
let bgQ=[],bgRun=false,dTot=0,dDone=0;
function setDst(){const e=document.getElementById('dst');if(e)e.textContent=dTot&&dDone<dTot?'⏳ Preparando bailes en segundo plano: '+dDone+'/'+dTot:''}
function bgDecode(keys){dTot+=keys.length;keys.forEach(k=>bgQ.push(k));setDst();if(bgRun)return;bgRun=true;
 (async()=>{while(bgQ.length){const k=bgQ.shift(),a=lib.a[k];try{if(a&&a.ready)await a.ready()}catch(e){}dDone++;setDst();await new Promise(r=>setTimeout(r,12))}bgRun=false;dTot=dDone=0;setDst()})()}
async function prepNeeded(){const need=new Set();st.models.forEach(m=>{if((m.anim||'').startsWith('x:'))need.add(m.anim.slice(2))});if(st.ui.anims)Object.keys(lib.a).forEach(k=>need.add(k));
 const L=[...need].map(k=>lib.a[k]).filter(a=>a&&a.ready&&!a.done());if(!L.length)return;msg='⏳ Preparando animaciones…';render();await Promise.all(L.map(a=>a.ready()))}
function libPayload(){const need=new Set();st.models.forEach(m=>{if((m.anim||'').startsWith('x:'))need.add(m.anim.slice(2))});
 const sk={},a={};let any=0;
 need.forEach(k=>{const x=lib.a[k];if(!x||libSent.has(k))return;
  if(x.done&&!x.done()){x.ready().then(()=>push()).catch(e=>{libSent.add(k);libMsg='❌ No se pudo leer el baile «'+x.name+'»: '+e.message;render()});return}
  try{sk[x.s]=lib.sk[x.s];a[k]={name:x.name,loop:x.loop,fps:x.fps,n:x.n,s:x.s,r:x.r,h:x.h};libSent.add(k);any=1}catch(e){libSent.add(k);libMsg='❌ No se pudo leer el baile «'+x.name+'»: '+e.message;render()}});
 return any?{sk,a}:null}
async function addGma(f){try{const base=f.name.replace(/\.gma$/i,'').replace(/[^\w-]+/g,'_'),r=readGma(await f.arrayBuffer(),base);lib.sk[base]=r.sk;for(const k in r.a){r.a[k].s=base;lib.a[k]=r.a[k];libSent.delete(k)}libDirty=true;libVer++;bgDecode(Object.keys(r.a));return Object.keys(r.a).length}catch(e){libMsg='❌ '+f.name+': '+e.message;return 0}}
async function scanAnim(){let ad;try{ad=await dir.getDirectoryHandle('Animaciones')}catch(e){libMsg='No hay una carpeta «Animaciones» dentro de la carpeta elegida. Créala y pon ahí tus .gma.';return}
libMsg='';let c=0;for await(const[n,h]of ad.entries())if(h.kind==='file'&&/\.gma$/i.test(n))c+=await addGma(await h.getFile());if(!c&&!libMsg)libMsg='La carpeta «Animaciones» no tiene archivos .gma.';push()}
