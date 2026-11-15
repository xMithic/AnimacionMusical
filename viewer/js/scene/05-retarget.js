/* Escena 3D · retargeting de animaciones a cualquier esqueleto (clasificación de huesos, clips) (se concatena con las demás partes de scene/ en un único módulo; ver README) */
const EXC=/twist|roll|helper|handle|attach|armature|pole|target|effector|offset|height|shade|(^|[^a-z])ik([^a-z]|$)|eye|jaw|hair|skirt|tail|ribbon|cloth|top|_end|end$|nub/,
SD=s=>/(^|[^a-z])left([^a-z]|$)|(^|[^a-z])l([^a-z]|$)/.test(s)?'l':/(^|[^a-z])right([^a-z]|$)|(^|[^a-z])r([^a-z]|$)/.test(s)?'r':'';
function cls(n){
  let s=String(n||'').toLowerCase().replace(/^.*[:|]/,'')
    .replace(/^valvebiped\.|^mixamorig\d*|bip01/g,'')
    .replace(/_\d{3,}$/,'');
  if(EXC.test(s))return null;
  const d=SD(s);let m;
  if(/finger|thumb|index|middle|ring|pinky|little/.test(s)){
    if(!d)return null;
    let f,l;
    if((m=s.match(/finger(\d)(\d?)/))){f=+m[1];l=m[2]?+m[2]:0}
    else{
      f=/thumb/.test(s)?0:/index/.test(s)?1:/middle/.test(s)?2:/ring/.test(s)?3:4;
      m=s.match(/(?:thumb|index|middle|ring|pinky|little)[_-]0*(\d+)(?:[_-](?:left|right|l|r))?$/);
      if(!m)return null;
      l=+m[1]-1;
    }
    return l>=0&&l<3?'f'+f+l+d:null;
  }
  if(/forearm|lowerarm|lower_arm|elbow/.test(s))return d?'fa'+d:null;
  if(/hand|wrist/.test(s))return d?'hd'+d:null;
  if(/shoulder|clavicle/.test(s))return d?'sh'+d:null;
  if(/upperarm|upper_arm|arm/.test(s))return d?'ua'+d:null;
  if(/thigh|upleg|upperleg|upper_leg/.test(s))return d?'th'+d:null;
  if(/foot|ankle/.test(s))return d?'ft'+d:null;
  if(/toe/.test(s))return d?'to'+d:null;
  if(/leg|calf|shin|knee/.test(s))return d?'ca'+d:null;
  if(/hip|pelvis/.test(s))return'hips';
  if(/spine|chest|waist|torso/.test(s))return'sp';
  if(/neck/.test(s))return'neck';
  if(/head/.test(s))return'head';
  return null;
}
function kk(names,par){const k=names.map(cls),dp=i=>{let d=0;for(;par[i]>=0;i=par[i])d++;return d},sp=k.map((x,i)=>x==='sp'?i:-1).filter(i=>i>=0).sort((a,c)=>dp(a)-dp(c));
  sp.forEach((i,j)=>k[i]='sp'+Math.min(3,Math.round((j+1)*4/sp.length)-1));return k}
function tmap(T){T.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(T.matrixWorld).invert(),L=[];T.traverse(o=>{if(o.isBone)L.push(o)});
  const rel=o=>{const m=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld),p=new V3,q=new Q,s=new V3;m.decompose(p,q,s);return{p,q,s}},
  k=kk(L.map(b=>b.name),L.map(b=>L.indexOf(b.parent)));
  return L.map((b,i)=>({b,k:k[i],...rel(b),pj:L.indexOf(b.parent),pr:b.parent&&b.parent!==T?rel(b.parent):{p:new V3,q:new Q,s:new V3(1,1,1)}}))}
function wantClip(it,id){const cc=it.xc||(it.xc={});if(cc[id])return cc[id];const pp=it.xp||(it.xp={}),ee=it.xe||(it.xe={});
  if(pp[id]||ee[id])return null;
  if(!(LIB&&LIB.a&&LIB.a[id]))return null; /* los datos de la animación aún no llegaron */
  pp[id]=1;
  buildClip(it,id).then(c=>{delete pp[id];if(c){cc[id]=c}else ee[id]=1;if(!it.gone){it.k=null;it.pend=null;apply()}})
   .catch(e=>{delete pp[id];ee[id]=1;it.pend=null;rep('animación',e);if(!it.gone)apply()});
  return null}
async function buildClip(it,id){const A=LIB&&LIB.a&&LIB.a[id],sk=A&&LIB.sk[A.s];if(!sk||!it.sc)return null;
  const tm=it.tm||(it.tm=tmap(it.sc)),hr=tm.find(r=>r.k==='hips');
  if(!hr)throw new Error('El modelo no tiene un hueso de cadera reconocible (Hips/Pelvis)');
  const nb=sk.n.length,sm=sk._k||(sk._k=kk(sk.n,sk.p)),si={};sm.forEach((k,i)=>{if(k&&!(k in si))si[k]=i});if(si.hips===undefined)throw new Error('La animación no tiene un hueso de cadera reconocible');
  const W0=[],P0=[];sk.p.forEach((p,i)=>{const q=new Q(...sk.q[i]),t=new V3(...sk.t[i]);if(p<0){W0[i]=q;P0[i]=t}else{W0[i]=W0[p].clone().multiply(q);P0[i]=t.applyQuaternion(W0[p]).add(P0[p])}});
  const IW=W0.map(q=>q.clone().invert()),fz=['ftl','ftr'].filter(k=>si[k]!==undefined).map(k=>P0[si[k]].z),fy=tm.filter(r=>/^ft/.test(r.k)).map(r=>r.p.y),
  sH=P0[si.hips].z-(fz.length?Math.min(...fz):0),tH=hr.p.y-(fy.length?Math.min(...fy):0),sc=sH>0&&tH>0?tH/sH:1;
  let LV=[1,0,0];if(si.thl!==undefined&&si.thr!==undefined){const a=P0[si.thl],b=P0[si.thr],h=Math.hypot(a.x-b.x,a.y-b.y)||1;LV=[(a.x-b.x)/h,(a.y-b.y)/h,0]}
  const FV=[LV[1],-LV[0],0],cv=v=>new V3(v.x*LV[0]+v.y*LV[1],v.z,v.x*FV[0]+v.y*FV[1]);
  const srcP=k=>si[k]!==undefined?cv(P0[si[k]]):null,tgtP=k=>{const r=tm.find(r=>r.k===k);return r?r.p:null},
  CHILD=k=>{let m=/^(sh|ua|fa|hd|th|ca|ft)([lr])$/.exec(k);if(m)return({sh:'ua',ua:'fa',fa:'hd',hd:'f20',th:'ca',ca:'ft',ft:'to'})[m[1]]+m[2];m=/^f(\d)(\d)([lr])$/.exec(k);return m&&m[2]<2?'f'+m[1]+(+m[2]+1)+m[3]:null},
  FB=k=>{let m=/^(hd|to)([lr])$/.exec(k);if(m)return(m[1]==='hd'?'fa':'ft')+m[2];m=/^f(\d)2([lr])$/.exec(k);return m?'f'+m[1]+'1'+m[2]:null},cache={},
  ACR=k=>{let m=/^f2\d([lr])$/.exec(k);if(m&&m[1]==='l')return['f10l','f30l'];m=/^(ua|fa|hd)([lr])$/.exec(k);if(m)return['f40'+m[2],'f10'+m[2]];m=/^(th|ca)([lr])$/.exec(k);return m?['ft'+m[2],'to'+m[2]]:null},
  bq=(d,a)=>{const z=new V3().crossVectors(d,a);if(z.lengthSq()<1e-6)return null;z.normalize();return new Q().setFromRotationMatrix(new THREE.Matrix4().makeBasis(d,new V3().crossVectors(z,d),z))},
  CB=k=>{if(!k)return new Q();if(k in cache)return cache[k];let q=new Q();const c=CHILD(k),a=srcP(k),b=c&&srcP(c),ta=tgtP(k),tb=c&&tgtP(c);
    if(a&&b&&ta&&tb){const d1=b.clone().sub(a).normalize(),d2=tb.clone().sub(ta).normalize();let ok=0;const ac=ACR(k);if(ac){const s0=srcP(ac[0]),s1=srcP(ac[1]),t0=tgtP(ac[0]),t1=tgtP(ac[1]);
      if(s0&&s1&&t0&&t1){const qs=bq(d1,s1.clone().sub(s0)),qt=bq(d2,t1.clone().sub(t0));if(qs&&qt){q=qt.multiply(qs.invert());ok=1}}}
    if(!ok)q.setFromUnitVectors(d1,d2)}else q=CB(FB(k)).clone();return cache[k]=q};
  const n=A.n,fr=n+(A.loop?1:0),times=new Float32Array(fr),seen={},tr=tm.map(r=>{if(!r.k||si[r.k]===undefined||seen[r.k])return null;seen[r.k]=1;return{r,s:si[r.k],ci:CB(r.k).clone().invert(),v:new Float32Array(fr*4)}}),hv=new Float32Array(fr*3),
  hp=tm[tm.indexOf(hr)].pj>=0?tm[hr.pj]:hr.pr,hip=hp.q.clone().invert(),rest=hr.b.position,h0=sk.t[si.hips];
  /* Bucle de frames sin reservas de memoria (se reutilizan los mismos quaterniones) y repartido en trozos de ~5 ms para no congelar la página */
  const Ws=Array.from({length:nb},()=>new Q()),D=Array.from({length:nb},()=>new Q()),Ln=new Q(),Wn=tm.map(()=>new Q()),RI=tm.map(r=>r.pj>=0?tm[r.pj].q.clone().invert():null),tq=new Q(),dvv=new V3(),hips0=si.hips===0,K=1/32767;
  const doFrame=f=>{const g=f%n;times[f]=f/A.fps;
    for(let i=0;i<nb;i++){const o=(g*nb+i)*4,p=sk.p[i];Ln.set(A.r[o]*K,A.r[o+1]*K,A.r[o+2]*K,A.r[o+3]*K);if(p<0)Ws[i].copy(Ln);else Ws[i].multiplyQuaternions(Ws[p],Ln);D[i].multiplyQuaternions(Ws[i],IW[i])}
    for(let j=0;j<tm.length;j++){const r=tm[j],t=tr[j],w=Wn[j];
      if(t){const d=D[t.s];w.set(d.x*LV[0]+d.y*LV[1],d.z,d.x*FV[0]+d.y*FV[1],d.w).multiply(t.ci).multiply(r.q)}
      else if(r.pj>=0)w.copy(Wn[r.pj]).multiply(RI[j]).multiply(r.q);else w.copy(r.q);
      if(t){tq.copy(r.pj>=0?Wn[r.pj]:r.pr.q).invert().multiply(w);const o=f*4;t.v[o]=tq.x;t.v[o+1]=tq.y;t.v[o+2]=tq.z;t.v[o+3]=tq.w}}
    if(hips0){const x=A.h[g*3]-h0[0],y=A.h[g*3+1]-h0[1],z=A.h[g*3+2]-h0[2];dvv.set(x*LV[0]+y*LV[1],z,x*FV[0]+y*FV[1]).multiplyScalar(sc)}else dvv.set(0,0,0);
    dvv.applyQuaternion(hip).divide(hp.s);hv[f*3]=rest.x+dvv.x;hv[f*3+1]=rest.y+dvv.y;hv[f*3+2]=rest.z+dvv.z};
  let f=0;
  while(f<fr){const t0=performance.now();do{doFrame(f++)}while(f<fr&&performance.now()-t0<5);
    if(f<fr){await new Promise(r=>setTimeout(r,0));if(it.gone)return null}}
  const tracks=tr.filter(Boolean).map(t=>new THREE.QuaternionKeyframeTrack(t.r.b.uuid+'.quaternion',times,t.v));
  tracks.push(new THREE.VectorKeyframeTrack(hr.b.uuid+'.position',times,hv));return new THREE.AnimationClip(id,-1,tracks)}

