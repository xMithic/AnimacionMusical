/* Lector .gma — extrae las animaciones (.mdl/.ani) de un .gma de Garry's Mod */
function gmaFiles(ab){const u=new Uint8Array(ab),dv=new DataView(ab);if(String.fromCharCode(...u.subarray(0,4))!=='GMAD')throw new Error('No es un .gma válido');
let p=4;const ver=u[p++];p+=16;if(ver>1){while(u[p]){while(u[p])p++;p++}p++}
const cs=()=>{const s=p;while(u[p])p++;return new TextDecoder().decode(u.subarray(s,p++))};cs();cs();cs();p+=4;
const fl=[];for(;;){const n=dv.getUint32(p,true);p+=4;if(!n)break;const nm=cs(),sz=Number(dv.getBigInt64(p,true));p+=12;fl.push([nm.toLowerCase(),sz])}
const f={};for(const[n,s]of fl){if(/\.(mdl|ani|lua)$/.test(n))f[n]=u.subarray(p,p+s);p+=s}return f}
const h16=h=>{const s=h&0x8000?-1:1,e=h>>10&31,m=h&1023;return e===0?s*m*5.960464477539063e-8:e===31?(m?NaN:s*Infinity):s*Math.pow(2,e-15)*(1+m/1024)};
const angQ=(x,y,z)=>{const sy=Math.sin(z/2),cy=Math.cos(z/2),sp=Math.sin(y/2),cp=Math.cos(y/2),sr=Math.sin(x/2),cr=Math.cos(x/2);
return[sr*cp*cy-cr*sp*sy,cr*sp*cy+sr*cp*sy,cr*cp*sy-sr*sp*cy,cr*cp*cy+sr*sp*sy]}
function srcAnims(mb,ab,lua){const dv=new DataView(mb.buffer,mb.byteOffset,mb.byteLength),av=ab&&new DataView(ab.buffer,ab.byteOffset,ab.byteLength),
I=o=>dv.getInt32(o,true),F=o=>dv.getFloat32(o,true),S=o=>dv.getInt16(o,true),str=o=>{let e=o;while(mb[e])e++;return new TextDecoder().decode(mb.subarray(o,e))};
if(String.fromCharCode(...mb.subarray(0,4))!=='IDST')throw new Error('MDL inválido');
const nb=I(156),bi=I(160),bones=[];for(let i=0;i<nb;i++){const o=bi+i*216;bones.push({n:str(o+I(o)),p:I(o+4),t:[F(o+32),F(o+36),F(o+40)],q:[F(o+44),F(o+48),F(o+52),F(o+56)],r:[F(o+60),F(o+64),F(o+68)],ps:[F(o+72),F(o+76),F(o+80)],rs:[F(o+84),F(o+88),F(o+92)]})}
const na=I(180),ai=I(184),ns=I(188),si=I(192),abi=I(356),map={};
if(lua)for(const m of lua.matchAll(/Anim\s*=\s*"([^"]+)"[\s\S]*?Name\s*=\s*"([^"]*)"([^\r\n]*)/g))map[m[1]]={name:m[2],loop:/Infinity\s*=\s*true/.test(m[3])};
const q48=(v,o)=>{const x=(v.getUint16(o,true)-32768)/32768,y=(v.getUint16(o+2,true)-32768)/32768,zr=v.getUint16(o+4,true),z=((zr&32767)-16384)/16384,w=Math.sqrt(Math.max(0,1-x*x-y*y-z*z));return[x,y,z,zr&32768?-w:w]};
const q64=(v,o)=>{const lo=v.getUint32(o,true),hi=v.getUint32(o+4,true),x=lo&0x1FFFFF,y=(lo>>>21|(hi&0x3FF)<<11)&0x1FFFFF,z=hi>>>10&0x1FFFFF,k=1/1048576.5,X=(x-1048576)*k,Y=(y-1048576)*k,Z=(z-1048576)*k,w=Math.sqrt(Math.max(0,1-X*X-Y*Y-Z*Z));return[X,Y,Z,hi>>>31?-w:w]};
const out=[];
for(let s=0;s<ns;s++){const so=si+s*212,label=str(so+I(so+4)),ao=ai+S(so+I(so+60))*100,nf=I(ao+16),fps=F(ao+8),
 blk=I(ao+52),idx=I(ao+56),secI=I(ao+80),secF=I(ao+84),lp=!!(I(so+12)&1);
 const mk=()=>{const r=new Int16Array(nf*nb*4),h=new Float32Array(nf*3),last=new Array(nb).fill(null),bq0=bones.map(b=>b.q),bp0=bones.map(b=>b.t);
 const frame=f=>{let v,base,k=f,b=blk,x=idx;
  if(secI){let sec;if(nf>secF&&f===nf-1){k=0;sec=Math.floor(nf/secF)+1}else{sec=Math.floor(f/secF);k=f-sec*secF}b=I(ao+secI+sec*8);x=I(ao+secI+sec*8+4)}
  if(b===0){v=dv;base=ao+x}else{if(!av)throw new Error('Falta el archivo .ani');v=av;base=I(abi+b*8)+x}
  const bq=bq0.slice(),bp=bp0.slice();
  const rle=(vp,ax,fr)=>{const off=v.getInt16(vp+2*ax,true);if(!off)return 0;let a=vp+off;while(v.getUint8(a+1)<=fr){fr-=v.getUint8(a+1);a+=(v.getUint8(a)+1)*2}const va=v.getUint8(a);return v.getInt16(a+2+2*(va>fr?fr:va-1),true)};
  for(let p=base;;){const bn=v.getUint8(p),fl=v.getUint8(p+1),nx=v.getInt16(p+2,true),B=bones[bn];if(!B)break;let d=p+4;
   if(fl&2){bq[bn]=q48(v,d);d+=6}else if(fl&0x20){bq[bn]=q64(v,d);d+=8}else if(fl&8){bq[bn]=angQ(...[0,1,2].map(a=>B.r[a]+rle(d,a,k)*B.rs[a]));if(fl&0x10)bq[bn]=B.q;d+=6}
   if(fl&1)bp[bn]=[h16(v.getUint16(d,true)),h16(v.getUint16(d+2,true)),h16(v.getUint16(d+4,true))];else if(fl&4)bp[bn]=[0,1,2].map(a=>B.t[a]+rle(d,a,k)*B.ps[a]);
   if(!nx)break;p+=nx}
  for(let i=0;i<nb;i++){const q=bq[i],l=Math.hypot(q[0],q[1],q[2],q[3])||1;let x0=q[0]/l,y0=q[1]/l,z0=q[2]/l,w0=q[3]/l;const pv=last[i];if(pv&&pv[0]*x0+pv[1]*y0+pv[2]*z0+pv[3]*w0<0){x0=-x0;y0=-y0;z0=-z0;w0=-w0}last[i]=[x0,y0,z0,w0];const o=(f*nb+i)*4;r[o]=Math.round(x0*32767);r[o+1]=Math.round(y0*32767);r[o+2]=Math.round(z0*32767);r[o+3]=Math.round(w0*32767)}
  h.set(bp[0],f*3)};
 return{r,h,frame}};
 const nm=label.replace(/^@/,'');out.push({seq:nm,name:(map[nm]&&map[nm].name)||nm.replace(/_/g,' '),loop:lp||!!(map[nm]&&map[nm].loop),fps:fps||30,n:nf,mk})}
return{sk:{n:bones.map(b=>b.n),p:bones.map(b=>b.p),t:bones.map(b=>b.t),q:bones.map(b=>b.q)},anims:out}}
function readGma(ab,base){const f=gmaFiles(ab),mdls=Object.keys(f).filter(n=>n.endsWith('.mdl'));if(!mdls.length)throw new Error('El .gma no contiene animaciones (.mdl)');
const m=mdls.find(n=>/female/.test(n))||mdls[0],lua=Object.keys(f).filter(n=>/^lua\/actmod\/.*\.lua$/.test(n)).map(n=>new TextDecoder().decode(f[n])).join('\n');
const R=srcAnims(f[m],f[m.replace(/\.mdl$/,'.ani')],lua),a={};
for(const x of R.anims){const mir=/_mirror$/.test(x.seq),id=base+':'+x.seq;a[id]=lazyA({name:x.name+(mir?' (espejo)':''),loop:x.loop,fps:x.fps,n:x.n},x.mk,x.n)}
return{sk:R.sk,a}}

