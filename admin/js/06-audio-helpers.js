/* Utilidades de audio — calibración de sincronía, duración, formato de tiempo y normalización de .lrc */
async function calibrate(blob,lines){
 const OC=window.OfflineAudioContext||window.webkitOfflineAudioContext,SR=16000,buf=await new OC(1,SR,SR).decodeAudioData(await blob.arrayBuffer());
 const n=buf.length,x=new Float32Array(n),ch=buf.numberOfChannels;
 for(let c=0;c<ch;c++){const d=buf.getChannelData(c);for(let i=0;i<n;i++)x[i]+=d[i]/ch}
 const a1=1-Math.exp(-2*Math.PI*300/SR),a2=1-Math.exp(-2*Math.PI*3000/SR);let l1=0,l2=0;
 const H=SR/100|0,F=Math.floor(n/H),L=new Float32Array(F);
 for(let f=0;f<F;f++){let e=0;for(let i=f*H;i<(f+1)*H;i++){l1+=a1*(x[i]-l1);const hp=x[i]-l1;l2+=a2*(hp-l2);e+=l2*l2}L[f]=Math.log(Math.sqrt(e/H)+1e-5)}
 const fx=new Float32Array(F);for(let f=3;f<F;f++)fx[f]=Math.max(0,L[f]-L[f-3]);
 const srt=[...fx].sort((a,b)=>a-b),thr=Math.max(srt[Math.floor(F*.8)],.15),D=[];
 for(const ln of lines){if(!ln.text||ln.t<.5)continue;let bk=-1,bv=0;
  for(let f=Math.max(3,Math.floor((ln.t-.1)*100));f<=Math.min(F-1,Math.floor((ln.t+1)*100));f++)if(fx[f]>bv){bv=fx[f];bk=f}
  if(bk>=0&&bv>thr)D.push(bk/100-.02-ln.t)}
 if(D.length<6)return null;D.sort((a,b)=>a-b);const med=D[D.length>>1],dev=D.map(v=>Math.abs(v-med)).sort((a,b)=>a-b)[D.length>>1];
 if(dev>.25)return null;return Math.min(.8,Math.max(0,Math.round(med*100)/100))}

const mmeta=n=>{const s=n.replace(/\.[^.]+$/,'').split(/\s+-\s+/);return s.length>1?{artist:s[0],title:s.slice(1).join(' - ')}:{title:s[0],artist:''}};
const durOf=b=>new Promise(r=>{const a=new Audio(),u=URL.createObjectURL(b);const end=d=>{URL.revokeObjectURL(u);r(isFinite(d)?d:0)};a.preload='metadata';a.onloadedmetadata=()=>end(a.duration);a.onerror=()=>end(0);setTimeout(()=>end(0),8000);a.src=u});
const fmtD=s=>{s=Math.max(0,s||0);return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0')};
function fixLrc(x){if(typeof x!=='string'||!/^\s*\[\s*\{/.test(x))return x;try{const a=JSON.parse(x);if(Array.isArray(a)&&a.length)return LY.toLrc(a.filter(l=>l&&l.text!=null).map(l=>({t:+l.t||0,text:String(l.text)})))}catch(e){}return x}
const normLrc=(txt,dur)=>{txt=String(txt||'').trim();if(!txt||/\[\d+:\d+/.test(txt)||!dur)return txt;return LY.toLrc(LY.spread(txt,dur))};

