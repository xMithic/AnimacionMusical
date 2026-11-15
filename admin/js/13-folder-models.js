/* Carpeta y modelos — escaneo de la carpeta de trabajo y alta de modelos */
async function scan(){fcache={};files=[];ENT={};
for await(const [n,h] of dir.entries()){
 if(h.kind==='file'&&/\.(glb|gltf|zip)$/i.test(n)){files.push(n);ENT[n]=()=>fhToGlb(h,dir)}
 else if(h.kind==='directory'&&!n.startsWith('.')){try{for await(const [n2,h2] of h.entries())if(h2.kind==='file'&&/\.(gltf|glb)$/i.test(n2)){const k=n+'/'+n2;files.push(k);ENT[k]=()=>fhToGlb(h2,h);break}}catch(e){}}}
files.sort();await scanMusic();await scanAnim()}
async function fbuf(n){return fcache[n]||(fcache[n]=await ENT[n]())}
async function pickDir(){try{dir=await showDirectoryPicker({mode:'readwrite'})}catch(e){return}
await scan();const h=await dir.getFileHandle('index.html').catch(()=>null);
if(h&&confirm('¿Cargar la configuración del index.html de esta carpeta?'))await loadHtml(await(await h.getFile()).text());render()}
async function addModel(n,ab){try{const id=newId();ab=ab||await fbuf(n);bufs[id]=ab;credit(ab);
st.models.push({id,name:nmOf(n),file:n,visible:true,pos:[0,0,0],rot:[0,0,0],s:1,anim:'',loop:true,speed:1,outline:{enabled:false,color:'#000000',thickness:1,strength:2.5,glow:0}});
selId=id;msg='';render();push();pm({k:'sel',id})}catch(e){msg='❌ '+e.message;render()}}
