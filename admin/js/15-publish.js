/* Publicar — codificación base64, generación del index.html, descarga, publicación e importación */
const b64=ab=>{const u=new Uint8Array(ab);let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s)};
const unb64=s=>{const t=atob(s),u=new Uint8Array(t.length);for(let i=0;i<t.length;i++)u[i]=t.charCodeAt(i);return u.buffer};
const j2=o=>JSON.stringify(o).replace(/</g,'\\u003c');
function build(emb){const M={},c=JSON.parse(JSON.stringify(st));c.music.tracks.forEach(t=>{t.lrc=fixLrc(t.lrc)});
c.models.forEach(m=>{if(emb||!(/\.glb$/i.test(m.file)&&files.includes(m.file))){if(bufs[m.id])M[m.id]=b64(bufs[m.id])}else m.src=m.file});
const need=new Set();c.models.forEach(m=>{if((m.anim||'').startsWith('x:'))need.add(m.anim.slice(2))});if(c.ui.anims)Object.keys(lib.a).forEach(k=>need.add(k));
const X={sk:{},a:{}};need.forEach(k=>{const a=lib.a[k];if(!a)return;X.sk[a.s]=lib.sk[a.s];X.a[k]={name:a.name,loop:a.loop,fps:a.fps,n:a.n,s:a.s,r:b64(a.r.buffer),h:b64(a.h.buffer)}});
return TPL.replace('/*CFG*/',()=>j2(c)).replace('/*MODELS*/',()=>j2(M)).replace('/*ANIMS*/',()=>j2(X))}
function dl(html){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));a.download='index.html';a.click()}
async function pub(){if(!st.models.length){msg='Añade al menos un modelo antes de publicar.';render();return}
await autoLyrics();{const bad=noLyr();if(bad.length&&!confirm('Estas canciones NO tienen letra y se publicarán sin ella:\n'+bad.map(t=>'• '+(t.artist?t.artist+' – ':'')+t.title).join('\n')+'\n\n¿Publicar igual?')){msg='Publicación cancelada: faltan letras.';render();return}}
await prepNeeded();const html=build(st.pub.embed);
if(dir){if(!confirm('Esto reemplaza index.html en la carpeta "'+dir.name+'". ¿Publicar?'))return;
try{const w=await(await dir.getFileHandle('index.html',{create:true})).createWritable();await w.write(html);await w.close();const nm=await writeMusic();msg='✅ Publicado a las '+new Date().toLocaleTimeString()+': index.html actualizado en la carpeta.'+(nm?' '+nm+' canción(es) copiadas a music/.':'')}
catch(err){msg='❌ No se pudo escribir en la carpeta: '+err.message}}
else{dl(html);msg='Sin carpeta elegida: se descargó index.html.'}render()}
async function loadHtml(t){const g=id=>{const x=t.match(new RegExp('<script id="'+id+'" type="application/json">([\\s\\S]*?)<\\/script>'));return x?JSON.parse(x[1]):null};
const c=g('cfg'),M=g('mdl')||{};if(!c){alert('Ese archivo no es un visor exportado');return}
st=mg(DEF,c);st.cam.autoRotate=false;st.ui.rotBtn=false;bufs={};sent.clear();anims={};selId=null;let lost=0;audioBlobs={};for(const k in mUrl)delete mUrl[k];
if(dir){try{const md=await dir.getDirectoryHandle('music');for(const t of st.music.tracks){try{const f=await(await md.getFileHandle(t.name)).getFile();audioBlobs[t.id]=f;mUrl[t.id]=URL.createObjectURL(f);t.fromDir=true}catch(e){}}}catch(e){}}
for(const m of st.models){if(M[m.id])bufs[m.id]=unb64(M[m.id]);else if(m.src){m.file=m.src;delete m.src;try{bufs[m.id]=await fbuf(m.file)}catch(e){}}}
st.models=st.models.filter(m=>bufs[m.id]||(lost++,false));
for(const t of st.music.tracks)if(!t.cover&&audioBlobs[t.id])TAGS.read(audioBlobs[t.id]).then(async g=>{if(g.pic){t.cover=await coverUrl(g.pic);render();push()}});msg=lost?lost+' modelo(s) no se encontraron en la carpeta y se omitieron.':'';st.music.tracks.forEach(t=>{t.lrc=fixLrc(t.lrc)});autoLyrics();
const X=g('anm');if(X&&X.a){for(const s in X.sk)lib.sk[s]=X.sk[s];for(const k in X.a){const a=X.a[k];a.r=new Int16Array(unb64(a.r));a.h=new Float32Array(unb64(a.h));lib.a[k]=a;libSent.delete(k)}libDirty=true;libVer++}
ready=false;$('F').srcdoc=TPL.replace('/*CFG*/','{}').replace('/*MODELS*/','{}').replace('/*ANIMS*/','{}')}
$('fi').onchange=async e=>{const f=e.target.files[0];if(!f)return;await loadHtml(await f.text());e.target.value='';render()};
