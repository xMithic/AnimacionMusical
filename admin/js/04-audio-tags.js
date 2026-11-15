/* Etiquetas de audio — estado de música y lector de ID3 / FLAC (título, artista, carátula, letra) */
let audioBlobs={},mUrl={},musFiles=[],ENTM={},musMsg='';const lyTok={};
const TAGS=(()=>{
const syn=(b,o)=>(b[o]<<21)|(b[o+1]<<14)|(b[o+2]<<7)|b[o+3];
const be=(b,o)=>((b[o]<<24)|(b[o+1]<<16)|(b[o+2]<<8)|b[o+3])>>>0;
const le=(b,o)=>(b[o]|(b[o+1]<<8)|(b[o+2]<<16)|(b[o+3]<<24))>>>0;
const wide=e=>e===1||e===2;
const dec=(b,e)=>new TextDecoder(e===0?'iso-8859-1':e===3?'utf-8':(e===2||(b[0]===0xFE&&b[1]===0xFF))?'utf-16be':'utf-16le').decode(b).replace(/\0+$/,'');
function stop(b,o,e){if(wide(e)){for(;o+1<b.length;o+=2)if(!b[o]&&!b[o+1])return o;return b.length}for(;o<b.length;o++)if(!b[o])return o;return b.length}
function id3(b){const o={},v=b[3],end=10+syn(b,6);let p=10;
 while(p+10<end){const id=String.fromCharCode(...b.subarray(p,p+4)),sz=v===4?syn(b,p+4):be(b,p+4);if(!sz||!/^[A-Z0-9]{4}$/.test(id))break;
  const f=b.subarray(p+10,p+10+sz),e=f[0];p+=10+sz;
  if(id==='TIT2')o.title=dec(f.subarray(1),e);else if(id==='TPE1')o.artist=dec(f.subarray(1),e);else if(id==='TALB')o.album=dec(f.subarray(1),e);
  else if(id==='APIC'&&!o.pic){let q=1;while(q<f.length&&f[q])q++;const mime=new TextDecoder('iso-8859-1').decode(f.subarray(1,q));q+=2;
   if(wide(e)){while(q+1<f.length&&(f[q]||f[q+1]))q+=2;q+=2}else{while(q<f.length&&f[q])q++;q++}o.pic={mime:mime||'image/jpeg',data:f.subarray(q)}}
  else if(id==='USLT'){const d=stop(f,4,e);o.lyrics=dec(f.subarray(d+(wide(e)?2:1)),e)}}
 return o}
function flac(b){const o={};let p=4,last=0;
 while(!last&&p+4<=b.length){const h=b[p],t=h&127,n=(b[p+1]<<16)|(b[p+2]<<8)|b[p+3],d=b.subarray(p+4,p+4+n);last=h&128;p+=4+n;
  if(t===4){let q=4+le(d,0),c=le(d,q);q+=4;while(c--&&q<d.length){const l=le(d,q),s=new TextDecoder().decode(d.subarray(q+4,q+4+l));q+=4+l;const i=s.indexOf('='),k=s.slice(0,i).toUpperCase(),v=s.slice(i+1);
    if(k==='TITLE')o.title=v;else if(k==='ARTIST')o.artist=o.artist||v;else if(k==='ALBUM')o.album=v;else if(k==='LYRICS'||k==='UNSYNCEDLYRICS')o.lyrics=v}}else if(t===6&&!o.pic){const dv=new DataView(d.buffer,d.byteOffset,d.byteLength);let q=4;const ml=dv.getUint32(q);q+=4;const mime=new TextDecoder().decode(d.subarray(q,q+ml));q+=ml;const dl=dv.getUint32(q);q+=4+dl+16;const n2=dv.getUint32(q);q+=4;o.pic={mime,data:d.subarray(q,q+n2)}}}
 return o}
return{async read(blob){const b=new Uint8Array(await blob.slice(0,12e6).arrayBuffer());
 try{if(b[0]===73&&b[1]===68&&b[2]===51)return id3(b);if(b[0]===102&&b[1]===76)return flac(b)}catch(e){}return{}}}})();

