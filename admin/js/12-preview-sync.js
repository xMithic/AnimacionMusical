/* Vista previa — envío de configuración y buffers al iframe del visor */
let pq=0;
function push(){if(!ready||pq)return;pq=requestAnimationFrame(()=>{pq=0;pushNow()})}
function pushNow(){if(!ready)return;const lb=libPayload();if(lb)$('F').contentWindow.postMessage({k:'lib',lib:lb},'*');
const b={};st.models.forEach(m=>{if(!sent.has(m.id)&&bufs[m.id]){b[m.id]=bufs[m.id].slice(0);sent.add(m.id)}});
$('F').contentWindow.postMessage({k:'cfg',cfg:st,buffers:b,music:mUrl},'*')}
const pm=m=>$('F').contentWindow.postMessage(m,'*');
