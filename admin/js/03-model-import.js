/* Importar modelos — conversión .gltf/.zip → .glb, lector de ZIP y acceso a carpetas */
async function gltfToGlb(text,get){const j=JSON.parse(text);
const load=async u=>{if(u.startsWith('data:'))return Uint8Array.from(atob(u.slice(u.indexOf(',')+1)),c=>c.charCodeAt(0));const b=await get(decodeURIComponent(u));if(!b)throw new Error('Falta el archivo: '+u);return b};
const parts=[];let off=0;const add=b=>{const o=off;parts.push(b);off+=b.length;const pad=(4-off%4)%4;if(pad){parts.push(new Uint8Array(pad));off+=pad}return o};
const bo=[];for(const b of j.buffers||[])bo.push(add(await load(b.uri)));
j.bufferViews=j.bufferViews||[];j.bufferViews.forEach(v=>{v.byteOffset=(v.byteOffset||0)+bo[v.buffer];v.buffer=0});
for(const im of j.images||[])if(im.uri){const mime=im.uri.startsWith('data:')?im.uri.slice(5,im.uri.indexOf(';')):/\.jpe?g$/i.test(im.uri)?'image/jpeg':'image/png',b=await load(im.uri);
  im.bufferView=j.bufferViews.push({buffer:0,byteOffset:add(b),byteLength:b.length})-1;im.mimeType=mime;delete im.uri}
const X='KHR_materials_pbrSpecularGlossiness';
for(const m of j.materials||[]){const s=m.extensions&&m.extensions[X];if(!s)continue;
  m.pbrMetallicRoughness={baseColorFactor:s.diffuseFactor||[1,1,1,1],metallicFactor:0,roughnessFactor:1-(s.glossinessFactor==null?1:s.glossinessFactor)};
  if(s.diffuseTexture)m.pbrMetallicRoughness.baseColorTexture=s.diffuseTexture;
  delete m.extensions[X];if(!Object.keys(m.extensions).length)delete m.extensions}
for(const k of['extensionsUsed','extensionsRequired'])if(j[k]){j[k]=j[k].filter(x=>x!==X);if(!j[k].length)delete j[k]}
j.buffers=[{byteLength:off}];
const js=new TextEncoder().encode(JSON.stringify(j)),jl=Math.ceil(js.length/4)*4,total=28+jl+off,out=new Uint8Array(total),dv=new DataView(out.buffer);
dv.setUint32(0,0x46546C67,true);dv.setUint32(4,2,true);dv.setUint32(8,total,true);dv.setUint32(12,jl,true);dv.setUint32(16,0x4E4F534A,true);out.set(js,20);out.fill(32,20+js.length,20+jl);
dv.setUint32(20+jl,off,true);dv.setUint32(24+jl,0x004E4942,true);let p=28+jl;for(const x of parts){out.set(x,p);p+=x.length}return out.buffer}
async function unzip(ab){const dv=new DataView(ab),u=new Uint8Array(ab);let e=ab.byteLength-22;while(e>=0&&dv.getUint32(e,true)!==0x06054b50)e--;if(e<0)throw new Error('ZIP inválido');
const n=dv.getUint16(e+10,true);let p=dv.getUint32(e+16,true);const m={};
for(let i=0;i<n;i++){const meth=dv.getUint16(p+10,true),cs=dv.getUint32(p+20,true),nl=dv.getUint16(p+28,true),xl=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),lo=dv.getUint32(p+42,true),name=new TextDecoder().decode(u.subarray(p+46,p+46+nl));p+=46+nl+xl+cl;
  if(name.endsWith('/'))continue;
  m[name]=async()=>{const s=lo+30+dv.getUint16(lo+26,true)+dv.getUint16(lo+28,true),d=u.subarray(s,s+cs);if(meth===0)return d;
    return new Uint8Array(await new Response(new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())}}
return m}
async function zipToGlb(ab){const m=await unzip(ab),ns=Object.keys(m).filter(n=>/\.(gltf|glb)$/i.test(n)&&!n.startsWith('__MACOSX')).sort((a,b)=>a.split('/').length-b.split('/').length);
if(!ns.length)throw new Error('El ZIP no contiene .gltf ni .glb');const n=ns[0],b=await m[n]();
if(/\.glb$/i.test(n))return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);
const base=n.includes('/')?n.slice(0,n.lastIndexOf('/')+1):'';
return gltfToGlb(new TextDecoder().decode(b),async u=>{const k=norm(base+u);return m[k]?m[k]():null})}
async function dirGet(d,path){const s=norm(path).split('/');try{for(const x of s.slice(0,-1))d=await d.getDirectoryHandle(x);return new Uint8Array(await(await(await d.getFileHandle(s[s.length-1])).getFile()).arrayBuffer())}catch(e){return null}}
async function fhToGlb(fh,d){const f=await fh.getFile();if(/\.glb$/i.test(fh.name))return f.arrayBuffer();if(/\.zip$/i.test(fh.name))return zipToGlb(await f.arrayBuffer());return gltfToGlb(await f.text(),u=>dirGet(d,u))}
function meta(ab){try{const l=new DataView(ab).getUint32(12,true);return JSON.parse(new TextDecoder().decode(new Uint8Array(ab,20,l))).asset.extras||{}}catch(e){return{}}}
