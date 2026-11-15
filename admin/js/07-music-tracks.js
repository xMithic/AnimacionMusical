/* Canciones — alta/baja de pistas, búsqueda de letras, calibración y carpeta music/ */
async function coverUrl(p){try{const bm=await createImageBitmap(new Blob([p.data],{type:p.mime}));const S=256,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d'),s=Math.min(bm.width,bm.height);x.imageSmoothingQuality='high';x.drawImage(bm,(bm.width-s)/2,(bm.height-s)/2,s,s,0,0,S,S);return c.toDataURL('image/jpeg',.88)}catch(e){return''}}
async function addTrack(name,blob,fromDir){
 const id=newId(),t={id,name,fromDir:!!fromDir,artist:'',title:'',dur:0,lrc:'',src:'leyendo archivo…',cal:.3,adj:0,startAt:0};
 audioBlobs[id]=blob;mUrl[id]=URL.createObjectURL(blob);st.music.tracks.push(t);musMsg='';render();push();
 const tg=await TAGS.read(blob),m=mmeta(name);for(const k in tg)if(tg[k]&&k!=='lyrics')m[k]=tg[k];
 t.artist=m.artist||'';t.title=m.title||'';t.dur=await durOf(blob);if(tg.pic)t.cover=await coverUrl(tg.pic);render();push();await findLyrics(t,tg)}
async function findLyrics(t,tg){const my=lyTok[t.id]=(lyTok[t.id]||0)+1;t.src='buscando letra…';render();
 const r=await LY.resolve({title:t.title,artist:t.artist,album:(tg&&tg.album)||'',lyrics:tg&&tg.lyrics},t.dur);
 if(my!==lyTok[t.id])return;
 if(r.lrc){t.lrc=r.lrc;t.src=r.src;t.cal=.3;render();push();if(!r.plain)await calibTrack(t)}
 else{t.src=r.why||'';t.lrc='';render();push()}}

async function autoLyrics(){const L=st.music.tracks.filter(t=>!t.lrc&&audioBlobs[t.id]);if(!L.length)return;
 msg='⏳ Buscando letras automáticamente…';render();for(const t of L)await findLyrics(t,null);msg='';render()}
const noLyr=()=>st.music.tracks.filter(t=>!t.lrc);
addEventListener('online',()=>{autoLyrics()});
async function calibTrack(t){const b=audioBlobs[t.id];if(!b||!t.lrc)return;t.src=(t.src||'').replace(/ · (calibrando…|sin calibración[^·]*)/g,'');const ls=LY.parse(t.lrc);if(ls.length<6){render();return}
 const key='stlc:'+b.size+':'+Math.round(t.dur);let c=null;
 try{c=localStorage.getItem(key);c=c===null?null:+c;if(c===null){c=await calibrate(b,ls);if(c!==null)localStorage.setItem(key,c)}}catch(e){c=null}
 if(c!==null)t.cal=c;else t.src=(t.src||'')+' · sin calibración (se usa +0.30 s)';render();push()}
function setLrc(i,txt){const t=st.music.tracks[i];if(!t)return;t.lrc=normLrc(txt,t.dur);t.src=t.lrc?'letra manual':'';t.cal=/\[\d+:\d+/.test(txt)?t.cal:0;render();push()}
async function addMusicFiles(fs){for(const f of fs)if(/\.(mp3|flac|m4a|ogg|wav)$/i.test(f.name))await addTrack(f.name,f,false)}
async function scanMusic(){musFiles=[];ENTM={};if(!dir)return;try{const md=await dir.getDirectoryHandle('music');for await(const[n,h]of md.entries())if(h.kind==='file'&&/\.(mp3|flac|m4a|ogg|wav)$/i.test(n)){musFiles.push(n);ENTM[n]=h}}catch(e){}musFiles.sort()}
async function writeMusic(){const T=st.music.tracks.filter(t=>audioBlobs[t.id]&&!t.fromDir);if(!T.length)return 0;
 const md=await dir.getDirectoryHandle('music',{create:true});let n=0;
 for(const t of T){const w=await(await md.getFileHandle(t.name,{create:true})).createWritable();await w.write(audioBlobs[t.id]);await w.close();t.fromDir=true;n++}return n}
