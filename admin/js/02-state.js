/* Estado — configuración por defecto, estado global del panel y helpers de formularios */
const mg=(a,b)=>{if(!b||typeof b!=='object'||Array.isArray(b))return b===undefined?a:b;const o={...a};for(const k in b)o[k]=(a&&a[k]&&typeof a[k]==='object'&&!Array.isArray(a[k]))?mg(a[k],b[k]):b[k];return o};
const DEF={title:'Mi modelo',showTitle:false,titleColor:'#ffffff',bg:{type:'gradient',c1:'#2a2d44',c2:'#0e0f16'},
cam:{auto:true,fov:35,pos:[0,1.2,4],target:[0,.9,0],autoRotate:false,speed:1.5,zoom:true,pan:false,interact:false,tween:.8,shots:false,shotTime:5,minDist:0,maxDist:0},light:{exposure:1.1,env:1,shadow:true},
ui:{rotBtn:false,views:false,anims:false,credits:false,creditsHtml:''},views:[],models:[],pub:{embed:true},
music:{on:true,vol:.8,loop:true,lyrics:{show:true,color:'auto',custom:'#111111',scale:1,top:10,left:50,width:80,height:48,card:true,cardBg:true,justify:true},tracks:[]}};
let st=JSON.parse(JSON.stringify(DEF)),bufs={},sent=new Set(),anims={},pend=null,ready=false,dir=null,files=[],fcache={},selId=null,msg='',cnt=0;
let lib={sk:{},a:{}},libDirty=false,libMsg='',rigMsg='';
const FS='showDirectoryPicker' in window,newId=()=>'m'+Date.now()+(cnt++);
const get=p=>p.split('.').reduce((o,k)=>o[k],st),set=(p,v)=>{const a=p.split('.'),l=a.pop();a.reduce((o,k)=>o[k],st)[l]=v};
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const I=(l,p,t='number',x='')=>`<label>${l}<input data-p="${p}" type="${t}" ${x} ${t==='checkbox'?(get(p)?'checked':''):`value="${esc(get(p))}"`}></label>`;
const V=(l,p,s='.1')=>`<label>${l}<span class="v3">${[0,1,2].map(i=>`<input data-p="${p}.${i}" type="number" step="${s}" value="${get(p+'.'+i)}">`).join('')}</span></label>`;
const SEL=(l,p,o)=>`<label>${l}<select data-p="${p}">${o.map(([v,n])=>`<option value="${esc(v)}"${get(p)===v?' selected':''}>${esc(n)}</option>`).join('')}</select></label>`;
const norm=p=>{const o=[];for(const s of p.split('/')){if(s==='..')o.pop();else if(s&&s!=='.')o.push(s)}return o.join('/')};
