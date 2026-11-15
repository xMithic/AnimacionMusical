/* Eventos — entradas, clics, selección de archivos y mensajes del visor */
$('P').addEventListener('input',e=>{const t=e.target,p=t.dataset.p;if(!p)return;set(p,t.type==='checkbox'?t.checked:t.type==='number'?(parseFloat(t.value)||0):t.value);push()});
$('P').addEventListener('change',async e=>{if(e.target.dataset.lrc!==undefined){setLrc(+e.target.dataset.lrc,e.target.value);return}const i=e.target.dataset.f;if(i===undefined)return;const m=st.models[i],n=e.target.value,old=m.id;
let ab;try{ab=await fbuf(n)}catch(err){msg='❌ '+err.message;render();return}credit(ab);m.id=newId();bufs[m.id]=ab;delete bufs[old];sent.delete(old);m.file=n;m.name=nmOf(n);if(selId===old)selId=m.id;render();push();if(selId)pm({k:'sel',id:selId})});
$('P').addEventListener('click',async e=>{const a=e.target.dataset.a,i=+e.target.dataset.i;if(!a)return;
if(a==='addmus')$('fu').click();if(a==='scanmus'){await scanMusic();render()}
if(a==='addmf')addTrack(e.target.dataset.n,await ENTM[e.target.dataset.n].getFile(),true);
if(a==='mdel'){const t=st.music.tracks.splice(i,1)[0];delete audioBlobs[t.id];delete mUrl[t.id];pm({k:'mus',a:'pause'});render();push()}
if(a==='mplay')pm({k:'mus',a:'toggle',i});
if(a==='msetstart'){const t=st.music.tracks[i],sl=t&&document.getElementById('ms_'+t.id);if(t&&sl){t.startAt=Math.max(0,Math.min(+t.dur||Infinity,+sl.value||0));const z=document.getElementById('mstart_'+t.id);if(z)z.textContent='Inicio en index: '+fmtD(t.startAt);push()}}
if(a==='mresetstart'){const t=st.music.tracks[i];if(t){t.startAt=0;const z=document.getElementById('mstart_'+t.id);if(z)z.textContent='Inicio en index: 0:00';push()}}
if(a==='mfind'){const t=st.music.tracks[i];if(t)findLyrics(t,null)}
if(a==='mcal'){const t=st.music.tracks[i];if(t){t.src=(t.src||'')+' · calibrando…';render();await calibTrack(t)}}
if(a==='dir')pickDir();if(a==='addg')$('fg').click();if(a==='scan'){await scan();render()}
if(a==='addf')addModel(e.target.dataset.n);if(a==='addm')$('fm').click();
if(a==='selm'){selId=st.models[i].id;pm({k:'sel',id:selId});render()}
if(a==='mode')pm({k:'mode',m:e.target.dataset.m});
if(a==='del'){const m=st.models.splice(i,1)[0];delete bufs[m.id];sent.delete(m.id);if(selId===m.id)selId=null;render();push()}
if(a==='cap'||a==='addv'){pend=a;pm({k:'cap'})}
if(a==='frame'){st.cam.auto=true;render();push();pm({k:'frame'})}
if(a==='delv'){st.views.splice(i,1);render();push()}if(a==='seev')pm({k:'view',i});
if(a==='pub')pub();if(a==='exp'){await autoLyrics();await prepNeeded();dl(build(true));msg='';render()}if(a==='imp')$('fi').click();
if(a==='hash')$('hs').textContent=sha($('np').value)});
$('P').addEventListener('input',e=>{const s=e.target.dataset.seek;if(s===undefined)return;pm({k:'mus',a:'seek',i:+s,t:+e.target.value})});
$('fu').onchange=async e=>{const fs=[...e.target.files];e.target.value='';await addMusicFiles(fs)};
$('fm').onchange=async e=>{const fs=[...e.target.files];e.target.value='';const f=fs.find(x=>/\.(gltf|zip|glb)$/i.test(x.name));if(!f)return;
try{const ab=/\.glb$/i.test(f.name)?await f.arrayBuffer():/\.zip$/i.test(f.name)?await zipToGlb(await f.arrayBuffer()):
await gltfToGlb(await f.text(),async u=>{const o=fs.find(x=>x.name===u.split('/').pop());return o?new Uint8Array(await o.arrayBuffer()):null});await addModel(f.name,ab)}catch(err){msg='❌ '+err.message;render()}};
$('fg').onchange=async e=>{const fs=[...e.target.files];e.target.value='';libMsg='';for(const f of fs)await addGma(f);render();push()};
addEventListener('message',e=>{if(e.source!==$('F').contentWindow)return;const m=e.data||{};
if(m.k==='ready'){ready=true;sent.clear();libSent.clear();libDirty=nAn()>0;push();if(selId)pm({k:'sel',id:selId})}
if(m.k==='info'){anims=m.anims;render()}
if(m.k==='mt'){st.music.tracks.forEach(t=>{const b=document.getElementById('mb_'+t.id);if(b)b.textContent=(t.id===m.id&&m.p)?'⏸ Pausa':'▶ Probar'});
const tm=document.getElementById('mt_'+m.id),sl=document.getElementById('ms_'+m.id);if(tm)tm.textContent=fmtD(m.t)+' / '+fmtD(m.d||0);if(sl&&document.activeElement!==sl){if(m.d&&+sl.max!==Math.ceil(m.d))sl.max=m.d;sl.value=m.t}}
if(m.k==='rig'){rigMsg=m.err?'❌ Error al animar: '+m.err:'Esqueleto: '+m.n+' huesos, '+m.m+' reconocidos';render()}
if(m.k==='pick'){selId=m.id;render()}
if(m.k==='xf'){const i=st.models.findIndex(o=>o.id===m.id);if(i>=0){const x=st.models[i];x.pos=m.pos;x.rot=m.rot;x.s=m.s;
const sv=(p,v)=>{const e=document.querySelector('[data-p="'+p+'"]');if(e&&document.activeElement!==e)e.value=v};
m.pos.forEach((v,j)=>sv('models.'+i+'.pos.'+j,v));m.rot.forEach((v,j)=>sv('models.'+i+'.rot.'+j,v));sv('models.'+i+'.s',m.s)}}
if(m.k==='lyb'){const l=st.music.lyrics;l.left=m.left;l.top=m.top;l.width=m.width;l.height=m.height;
for(const k of['left','top','width','height']){const e=document.querySelector('[data-p="music.lyrics.'+k+'"]');if(e&&document.activeElement!==e)e.value=m[k]}}
if(m.k==='cam'){if(pend==='cap'){st.cam.pos=m.pos;st.cam.target=m.target;st.cam.auto=false}else st.views.push({name:'Vista '+(st.views.length+1),pos:m.pos,target:m.target,fov:m.fov});pend=null;render();push()}});
