/* Motor de letras (window.LYR): reloj, líneas, tarjeta, hitbox editable y audio. Script clásico, se carga antes del módulo 3D. */
window.LYR=(()=>{
const $=id=>document.getElementById(id),lyr=$('lyr'),hint=$('mh'),body=$('lyb'),card=$('lcd'),ph=body.querySelector('.ph .tx'),au=new Audio();au.preload='auto';
let C=null,sig='',tr=[],cur=-1,curId=null,lines=[],P=[],LD=0,urls={},edit=false,lastPost=0,lrcSig='',li=-1,el=null,drag=null,box=null,lastBox=0,raf=0;

function parse(txt){const out=[];if(/^\s*\[\s*\{/.test(String(txt||''))){try{const a=JSON.parse(txt);if(Array.isArray(a))return a.filter(x=>x&&x.text!=null).map(x=>({t:+x.t||0,text:String(x.text),words:x.words||null})).sort((p,q)=>p.t-q.t)}catch(_){}}for(const raw of String(txt||'').split(/\r?\n/)){const ts=[...raw.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];if(!ts.length)continue;
 const body=raw.replace(/\[[^\]]*\]/g,''),text=body.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
 let words=null;const pr=[...body.matchAll(/<(\d+):(\d+(?:\.\d+)?)>([^<]*)/g)];
 if(pr.length){words=pr.map(m=>({t:+m[1]*60+ +m[2],text:m[3].trim()})).filter(x=>x.text)}
 ts.forEach(m=>out.push({t:+m[1]*60+ +m[2],text,words}))}
 return out.sort((a,b)=>a.t-b.t)}

function plan(l,nx){
 if(l.words&&l.words.length){return l.words.map((x,k)=>{const n=l.words[k+1],s=x.t;return{text:x.text,s,f:Math.max(n?n.t:Math.min((nx?nx.t:x.t+2)-.05,s+1.2),s+.12)}})}
 const w=l.text.split(/\s+/),end=nx?nx.t:l.t+8,avail=Math.max(.8,end-l.t-.1);
 const nom=w.map(x=>{const n=x.replace(/[^\p{L}\p{N}]/gu,'').length||1;return .16+.06*n+(/[,;:.!?…]$/.test(x)?.14:0)+(/(.)\1{2,}/i.test(x)?.9:0)});
 const sum=nom.reduce((a,b)=>a+b,0);let k=1,held=0;
 if(sum>avail*.92)k=avail*.92/sum;
 else{const ex=avail*.92-sum,sh=w.length<=2;held=Math.min(ex*(sh?.85:.5),sh?7:4.5)}
 let c=l.t;return w.map((x,j)=>{const d=Math.max(.12,nom[j]*k+(j===w.length-1?held:0)),r={text:x,s:c,f:c+d};c+=d;return r})}

const lum=h=>{h=String(h||'#000').replace('#','');if(h.length===3)h=[...h].map(x=>x+x).join('');const n=parseInt(h,16)||0;return(.299*(n>>16&255)+.587*(n>>8&255)+.114*(n&255))/255};
function color(c){const ly=(c.music||{}).lyrics||{},bg=c.bg||{};let col;
 if(ly.color==='custom')col=ly.custom||'#111111';
 else if(bg.type==='none')col='#111111';
 else{const l=bg.type==='solid'?lum(bg.c1):(lum(bg.c1)+lum(bg.c2))/2;col=l>.55?'#111111':'#ffffff'}
 lyr.style.setProperty('--lc',col);lyr.style.setProperty('--ls',lum(col)>.5?'0 2px 16px rgba(0,0,0,.55)':'none')}

function setBox(l,t,w,h){box={left:l,top:t,width:w,height:h};
 lyr.style.setProperty('--ly-left',l+'%');lyr.style.setProperty('--ly-top',t+'vh');lyr.style.setProperty('--ly-width',w+'vw');lyr.style.setProperty('--ly-height',h+'vh')}

function fit(T){const W=body.clientWidth,H=body.clientHeight;if(!T||W<20||H<20)return;
 const sc=+((C&&C.lyrics)||{}).scale||1;let s=Math.min(H*.45,W*.3)*sc;T.style.fontSize=s+'px';
 for(let g=0;g<40&&s>9&&(T.scrollHeight>H+1||T.scrollWidth>W+1);g++){s*=.93;T.style.fontSize=s+'px'}}
function relayout(){const W=lyr.clientWidth,H=lyr.clientHeight;lyr.style.setProperty('--ch',Math.max(34,Math.min(92,W*.2,H*.3))+'px');if(el)fit(el.T);fit(ph)}

function mkLine(i){const L=document.createElement('div'),T=document.createElement('div');L.className='ly';T.className='tx';
 P[i].forEach((w,k)=>{if(k)T.append(' ');const s=document.createElement('span');s.className='w';s.textContent=w.text;T.append(s)});
 L.append(T);body.append(L);fit(T);return{L,T,ws:T.children,n:0}}
function clear(){if(el){el.L.remove();el=null}li=-1;lyr.classList.add('idle')}
function showLine(i){if(i===li)return;li=i;const o=el;el=null;
 if(o){o.L.classList.add('out');setTimeout(()=>o.L.remove(),450)}
 if(i>=0)el=mkLine(i);lyr.classList.toggle('idle',i<0)}
function reveal(k){if(!el||k===el.n)return;const w=el.ws;
 if(k>el.n){for(let j=el.n;j<k;j++)if(w[j])w[j].classList.add('on')}else{for(let j=k;j<el.n;j++)if(w[j])w[j].classList.remove('on')}
 el.n=k}
function update(t){let a=0,b=lines.length-1,i=-1;
 while(a<=b){const m=(a+b)>>1;if(lines[m].t<=t){i=m;a=m+1}else b=m-1}
 if(i<0||!lines[i].text||!P[i].length){showLine(-1);return}
 const p=P[i];if(t>p[p.length-1].f+1.2){showLine(-1);return}
 showLine(i);let k=0;while(k<p.length&&p[k].s<=t)k++;reveal(k)}

function cardFill(t){const im=card.querySelector('img'),b=card.querySelector('b'),s=card.querySelector('span');
 b.textContent=t?(t.title||String(t.name||'').replace(/\.[^.]+$/,'')):'Título de la canción';s.textContent=t?(t.artist||''):'Artista';
 const c=(t&&t.cover)||'';
 if(c){if(im.dataset.s!==c){im.src=c;im.dataset.s=c}im.style.display='block'}else{im.removeAttribute('src');delete im.dataset.s;im.style.display='none'}
 card.classList.toggle('on',!!(t||edit))}

function setTrack(i){cur=i;const t=tr[i];curId=t.id;
 const src=urls[t.id]||('music/'+encodeURIComponent(t.name));
 const changed=au.dataset.s!==src;if(changed){au.src=src;au.dataset.s=src}
 const ls=t.id+'|'+(t.lrc||'');if(ls!==lrcSig){lrcSig=ls;lines=parse(t.lrc);P=lines.map((l,j)=>plan(l,lines[j+1]));clear()}
 LD=(+t.cal||0)+(+t.adj||0);cardFill(t);return changed}
function playCurrent(){const t=tr[cur];if(!t)return;const start=Math.max(0,+t.startAt||0);
 const go=()=>{try{if(Math.abs(au.currentTime-start)>.05)au.currentTime=start}catch(_){}au.play().catch(e=>say('No se pudo reproducir: '+((e&&e.message)||e)))};
 if(au.readyState>=1)go();else au.addEventListener('loadedmetadata',go,{once:true})}
function sel(i,play){const ch=setTrack(i);if(ch)clear();if(play)playCurrent()}

function say(m){hint.textContent=m;hint.classList.add('on');clearTimeout(say.t);say.t=setTimeout(()=>hint.classList.remove('on'),7000)}
function startApp(){
 const ov=$('start-overlay');if(ov){ov.style.opacity='0';setTimeout(()=>ov.remove(),400)}
 if(!tr.length||(C&&C.on===false))return;
 if(cur<0)sel(0,true);else playCurrent()
}

function cfg(c,u,ed){
 edit=!!ed;urls=u||{};lyr.classList.toggle('ed',edit);
 if(edit||!((c.music||{}).tracks||[]).length){const ov=$('start-overlay');if(ov)ov.remove()}
 if(drag)return;
 const M=c.music||{tracks:[]},sg=JSON.stringify([M,c.bg,edit]);if(sg===sig)return;sig=sg;
 C=M;tr=M.tracks||[];
 au.volume=Math.min(1,Math.max(0,M.vol==null?.8:+M.vol));
 const ly=M.lyrics||{};
 setBox(ly.left!=null?ly.left:50,ly.top!=null?ly.top:10,ly.width!=null?ly.width:80,ly.height!=null?ly.height:48);
 lyr.classList.toggle('nc',ly.card===false);lyr.classList.toggle('nj',ly.justify===false);lyr.classList.toggle('nb',ly.cardBg===false);
 lyr.style.display=ly.show===false?'none':'';
 color(c);
 let i=tr.findIndex(t=>t.id===curId);if(i<0)i=tr.length?0:-1;
 if(i<0){cur=-1;curId=null;au.pause();au.removeAttribute('src');delete au.dataset.s;lines=[];P=[];lrcSig='';clear();cardFill(null);relayout();return}
 setTrack(i);relayout();
 if(!M.on){au.pause();return}
}

function ctl(m){if(!tr.length)return;const i=m.i==null?cur:m.i;if(!tr[i])return;
 if(m.a==='toggle'){if(i!==cur||au.dataset.s==null)setTrack(i);if(au.paused)playCurrent();else au.pause()}
 else if(m.a==='seek'){if(i!==cur)setTrack(i);au.currentTime=Math.max(0,m.t||0)}
 else if(m.a==='pause')au.pause()}

au.onended=()=>{if(!tr.length||!C)return;let n=cur+1;if(n>=tr.length){if(!C.loop)return;n=0}
 if(n===cur){playCurrent();return}sel(n,true)};

au.onerror=()=>{const s=au.dataset.s||'';if(!s)return;let n=s;try{n=decodeURIComponent(s.split('/').pop())}catch(_){}say('No se pudo cargar la canción ('+n+'). Revisa que la carpeta music/ esté junto al index.html.')};
/* Diagnóstico visible: dice por qué no hay letra */
let dgT=0;function diag(){clearTimeout(dgT);dgT=setTimeout(()=>{if(!tr.length||cur<0||(C&&C.lyrics&&C.lyrics.show===false))return;
  if(!lines.length)say('Esta canción no tiene letra sincronizada (falta [mm:ss] en la letra). Añádela o búscala en el admin y vuelve a publicar.');
  else if(!au.paused&&au.currentTime<.05)say('El audio no avanza: revisa la carpeta music/.')},2500)}
au.addEventListener('playing',diag);
let ct0=-1,pf0=0,lastOut=0;
au.addEventListener('seeked',()=>{ct0=-1;lastOut=au.currentTime});au.addEventListener('pause',()=>{ct0=-1});
/* Reloj de la letra: interpola entre lecturas de currentTime (algunos navegadores lo actualizan a saltos) y nunca retrocede por ruido */
function clk(){const c=au.currentTime;if(au.paused||au.ended){ct0=-1;lastOut=c;return c}
 const p=performance.now();if(c!==ct0){ct0=c;pf0=p}
 let v=c+Math.min((p-pf0)/1000,.12);if(v<lastOut&&lastOut-v<.25)v=lastOut;lastOut=v;return v}
const pb=$('play-btn');if(pb)pb.onclick=()=>{startApp()};

/* Hitbox editable (solo en el panel de administración) */
function postBox(f){if(!edit||parent===window||!box)return;const n=performance.now();if(!f&&n-lastBox<60)return;lastBox=n;parent.postMessage({k:'lyb',left:box.left,top:box.top,width:box.width,height:box.height},'*')}
lyr.addEventListener('pointerdown',e=>{if(!edit)return;const h=e.target.dataset&&e.target.dataset.h;
 drag={m:h||'mv',x:e.clientX,y:e.clientY,r:lyr.getBoundingClientRect()};try{lyr.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault();e.stopPropagation()});
lyr.addEventListener('pointermove',e=>{if(!drag)return;
 const W=innerWidth,H=innerHeight,dx=e.clientX-drag.x,dy=e.clientY-drag.y,m=drag.m;let x0=drag.r.left,y0=drag.r.top,x1=drag.r.right,y1=drag.r.bottom;
 if(m==='mv'){x0+=dx;x1+=dx;y0+=dy;y1+=dy}
 else{if(m.includes('w'))x0=Math.min(x0+dx,x1-90);if(m.includes('e'))x1=Math.max(x1+dx,x0+90);if(m.includes('n'))y0=Math.min(y0+dy,y1-70);if(m.includes('s'))y1=Math.max(y1+dy,y0+70)}
 const r1=v=>Math.round(v*10)/10;
 setBox(r1((x0+x1)/2/W*100),r1(y0/H*100),r1((x1-x0)/W*100),r1((y1-y0)/H*100));
 if(!raf)raf=requestAnimationFrame(()=>{raf=0;relayout()});postBox(false)});
const endDrag=()=>{if(!drag)return;drag=null;postBox(true)};
lyr.addEventListener('pointerup',endDrag);lyr.addEventListener('pointercancel',endDrag);
addEventListener('resize',()=>relayout());

['Así','se','verá','la','letra'].forEach((w,k)=>{if(k)ph.append(' ');const s=document.createElement('span');s.className='w on';s.textContent=w;ph.append(s)});

(function tick(){
 if(C&&C.on&&cur>=0&&(C.lyrics||{}).show!==false)update(clk()-LD);else if(li!==-1)showLine(-1);
 const now=performance.now();
 if(edit&&parent!==window&&now-lastPost>200){lastPost=now;parent.postMessage({k:'mt',i:cur,id:curId,t:au.currentTime,d:au.duration||0,p:!au.paused},'*')}
 requestAnimationFrame(tick)})();
return{cfg,ctl,startApp}})();
