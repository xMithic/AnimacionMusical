/* Servicio de letras — búsqueda en LRCLIB, parseo y utilidades .lrc */
const LY=(()=>{
function parse(txt){const out=[];for(const raw of String(txt||'').split(/\r?\n/)){const ts=[...raw.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];if(!ts.length)continue;
 const body=raw.replace(/\[[^\]]*\]/g,''),text=body.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
 ts.forEach(m=>out.push({t:+m[1]*60+ +m[2],text}))}
 return out.sort((a,b)=>a.t-b.t)}
const fmtT=t=>{const m=Math.floor(t/60),s=t-m*60;return String(m).padStart(2,'0')+':'+s.toFixed(2).padStart(5,'0')};
const spread=(txt,dur)=>{const l=txt.split(/\r?\n/).filter(x=>x.trim());return l.map((text,i)=>({t:i*dur/l.length,text}))};
const toLrc=l=>l.map(x=>'['+fmtT(x.t)+']'+x.text).join('\n');
const norm=s=>(s||'').normalize('NFD').replace(/\p{M}+/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const NOISE=/\b(?:official\s+(?:music\s+)?video|official\s+audio|lyric\s+video|lyrics?|visuali[sz]er|video\s+oficial|audio\s+oficial|hd|4k|mv)\b/gi;
function cleanTitle(t){t=t||'';const o=t;
 t=t.replace(/[(\[{][^)\]}]*[)\]}]/g,' ').replace(/\s+(?:feat\.?|ft\.?|featuring|with)\s+.*$/i,'').replace(NOISE,' ')
  .replace(/\s+-\s+[^-]*\b(?:remaster(?:ed)?|radio edit|single version|album version|mono|stereo|from)\b[^-]*$/i,'').replace(/\s*-\s*(?:topic|vevo)\s*$/i,'').replace(/\s+/g,' ').trim();
 return t||o.trim()}
function cleanArtist(a){a=(a||'').replace(/\s*-\s*topic\s*$/i,'').replace(/\s*(?:VEVO|official)$/i,'').trim();return a.split(/\s*(?:,|;|&|\s(?:feat|ft)\.?\s)\s*/i)[0].trim()}
function readings(m){const R=[],add=(title,artist)=>{title=cleanTitle(title);artist=cleanArtist(artist);if(!title)return;const k=norm(title)+'|'+norm(artist);if(!R.some(r=>r.k===k))R.push({k,title,artist})};
 add(m.title,m.artist);
 const sp=(m.title||'').split(/\s+[-–—|]\s+/);if(sp.length>1){add(sp.slice(1).join(' '),sp[0]);add(sp[0],sp.slice(1).join(' '))}
 if(m.artist&&!R.length)add(m.title,'');
 return R}
let reached=false;
async function J(u){try{const r=await fetch(u);if(r.status<500)reached=true;if(r.status===404)return null;if(r.ok)return await r.json()}catch(e){}return null}
const B='https://lrclib.net/api/',Q=o=>new URLSearchParams(o).toString();
function score(c,r,dur){if(c.instrumental)return -9;const nt=norm(c.trackName),rt=norm(r.title),na=norm(c.artistName),ra=norm(r.artist);
 let s=0;if(nt===rt)s+=3;else if(nt&&rt&&(nt.includes(rt)||rt.includes(nt)))s+=2;else{const a=new Set(rt.split(' ')),b=nt.split(' ');s+=1.5*b.filter(x=>a.has(x)).length/Math.max(a.size,b.length,1)}
 if(ra){if(na===ra)s+=2.5;else if(na.includes(ra)||ra.includes(na))s+=2;else s-=1.5}
 if(dur&&c.duration){const g=Math.abs(c.duration-dur);s+=g<=1?3:g<=3?2:g<=6?.5:g<=10?-1.5:-4}
 return s+(c.syncedLyrics?2:0)}
async function lrclib(m,dur){reached=false;const C=new Map(),add=x=>{if(x&&x.trackName&&!C.has(x.id))C.set(x.id,x)};let best=null;
 const pick=r=>{let b=null,bs=-9;for(const c of C.values()){const s=score(c,r,dur);if(s>bs){bs=s;b=c}}return{b,bs}};
 for(const r of readings(m)){
  if(dur){const o={track_name:r.title,artist_name:r.artist,duration:Math.round(dur)};if(m.album)add(await J(B+'get?'+Q({...o,album_name:m.album})));add(await J(B+'get?'+Q(o)))}
  let {b,bs}=pick(r);if(b&&b.syncedLyrics&&bs>=6){best=b;break}
  const s1=await J(B+'search?'+Q(r.artist?{track_name:r.title,artist_name:r.artist}:{track_name:r.title}));(s1||[]).forEach(add);
  ({b,bs}=pick(r));if(b&&b.syncedLyrics&&bs>=5){best=b;break}
  const s2=await J(B+'search?'+Q({q:(r.artist+' '+r.title).trim()}));(s2||[]).forEach(add);
  ({b,bs}=pick(r));if(b&&bs>=3.5&&(!best||bs>best._s)){b._s=bs;best=b;if(b.syncedLyrics&&bs>=5)break}}
 return{best,reached}}
const ck=(m,dur)=>'stl:'+norm(m.artist+' '+m.title)+':'+Math.round(dur||0);
return{parse,fmtT,toLrc,spread,async resolve(m,dur){
 if(m.lyrics&&parse(m.lyrics).length>1)return{lrc:m.lyrics,src:'letra del archivo'};
 try{const c=localStorage.getItem(ck(m,dur));if(c){const f=fixLrc(c);if(/\[\d+:\d+/.test(f))return{lrc:f,src:'LRCLIB (guardada)'}}}catch(e){}
 const {best,reached:ok}=await lrclib(m,dur);
 if(best&&best.syncedLyrics&&parse(best.syncedLyrics).length){try{localStorage.setItem(ck(m,dur),best.syncedLyrics)}catch(e){}
  return{lrc:best.syncedLyrics,src:'LRCLIB · '+best.artistName+' – '+best.trackName}}
 let pl=best&&best.plainLyrics?best.plainLyrics:'',ps='LRCLIB';
 if(!pl){const ar=m.artist||'',ti=m.title||'';if(ar&&ti){const o=await J('https://api.lyrics.ovh/v1/'+encodeURIComponent(ar)+'/'+encodeURIComponent(ti));if(o&&o.lyrics){pl=o.lyrics;ps='lyrics.ovh'}}}
 if(pl&&dur)return{lrc:toLrc(spread(pl,dur)),plain:true,src:ps+' · sincronía automática estimada'};
 return{lrc:'',why:ok?'No encontré la letra de «'+(m.artist?m.artist+' – ':'')+m.title+'». Corrige Artista/Título y pulsa «Buscar letra», o pégala abajo.':'No pude conectar con LRCLIB (revisa tu internet). Pega la letra abajo o reintenta con «Buscar letra».'}}}})();

