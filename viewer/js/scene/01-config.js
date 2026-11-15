/* Escena 3D · configuración por defecto, mezcla de config y estado base (se concatena con las demás partes de scene/ en un único módulo; ver README) */
const $=id=>document.getElementById(id),J=id=>{try{return JSON.parse($(id).textContent||'{}')}catch(e){return{}}};
const mg=(a,b)=>{if(!b||typeof b!=='object'||Array.isArray(b))return b===undefined?a:b;const o={...a};for(const k in b)o[k]=(a&&a[k]&&typeof a[k]==='object'&&!Array.isArray(a[k]))?mg(a[k],b[k]):b[k];return o};
const D={title:'',showTitle:false,titleColor:'#ffffff',bg:{type:'gradient',c1:'#2a2d44',c2:'#0e0f16'},
cam:{auto:true,fov:35,pos:[0,1.2,4],target:[0,.9,0],autoRotate:false,speed:1.5,zoom:true,pan:false,interact:false,tween:.8,shots:false,shotTime:5,minDist:0,maxDist:0},
light:{exposure:1.1,env:1,shadow:true},ui:{rotBtn:false,views:false,anims:false,credits:false,creditsHtml:''},views:[],models:[],
music:{on:true,vol:.8,loop:true,lyrics:{show:true,color:'auto',custom:'#111111',scale:1,top:10,left:50,width:80,height:48,card:true,justify:true},tracks:[]}};
const M={visible:true,pos:[0,0,0],rot:[0,0,0],s:1,anim:'',loop:true,speed:1,outline:{enabled:false,color:'#000000',thickness:1,strength:2.5,glow:0}};
let cfg,B64=J('mdl'),bufs={},items={},anims={},needFrame=true,lastCam='';
const setCfg=c=>{const pa=cfg&&cfg.cam.auto;cfg=mg(D,c);cfg.models=cfg.models.map(m=>({...M,...m}));if(cfg.cam.auto&&pa===false)needFrame=true};
setCfg(J('cfg'));
