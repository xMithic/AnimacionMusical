/* Acceso — contraseña del panel (hash SHA-256), helper $ y pantalla de login */
const PASS_HASH='8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';
function sha(m){const r=(x,n)=>x>>>n|x<<32-n;let h=[],k=[],p=[],c=0;for(let n=2;c<64;n++)if(!p.some(q=>n%q==0)){p.push(n);if(c<8)h[c]=Math.sqrt(n)%1*4294967296|0;k[c++]=Math.cbrt(n)%1*4294967296|0}
const b=[...new TextEncoder().encode(m)],l=b.length*8;b.push(128);while(b.length%64!=56)b.push(0);b.push(0,0,0,0,l>>>24&255,l>>>16&255,l>>>8&255,l&255);
for(let i=0;i<b.length;i+=64){const w=[];for(let j=0;j<16;j++)w[j]=b[i+4*j]<<24|b[i+4*j+1]<<16|b[i+4*j+2]<<8|b[i+4*j+3];
for(let j=16;j<64;j++){const a=w[j-15],d=w[j-2];w[j]=w[j-16]+(r(a,7)^r(a,18)^a>>>3)+w[j-7]+(r(d,17)^r(d,19)^d>>>10)|0}
let[a,B,C,d,e,f,g,H]=h;for(let j=0;j<64;j++){const t1=H+(r(e,6)^r(e,11)^r(e,25))+(e&f^~e&g)+k[j]+w[j],t2=(r(a,2)^r(a,13)^r(a,22))+(a&B^a&C^B&C);H=g;g=f;f=e;e=d+t1|0;d=C;C=B;B=a;a=t1+t2|0}
h=h.map((x,j)=>x+[a,B,C,d,e,f,g,H][j]|0)}return h.map(x=>(x>>>0).toString(16).padStart(8,'0')).join('')}
const $=id=>document.getElementById(id);
$('go').onclick=()=>{if(sha($('pw').value)===PASS_HASH)$('L').remove();else $('le').textContent='Contraseña incorrecta'};
$('pw').onkeydown=e=>{if(e.key==='Enter')$('go').click()};

