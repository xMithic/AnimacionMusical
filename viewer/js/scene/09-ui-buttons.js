/* Escena 3D · botones de vistas/animaciones y pre-calentado de bailes (se concatena con las demás partes de scene/ en un único módulo; ver README) */
/* Botones: solo se reconstruyen cuando cambia la lista; en el resto de llamadas solo se actualiza el estado */
function applyUI(){const ui=cfg.ui,P=[];
  if(ui.views)P.push('v'+cfg.views.map(v=>v.name).join('\u0001'));
  if(ui.anims){P.push('a'+Object.keys(anims).map(id=>id+':'+anims[id].join('\u0001')).join('|'));
    P.push('x'+(LIB&&LIB.a?Object.keys(LIB.a).map(k=>k+':'+LIB.a[k].name).join('\u0001'):'')+'|'+Object.keys(items).filter(i=>items[i].sc).join(','))}
  const key=P.join('#');
  if(key!==uiKey){uiKey=key;const f=document.createDocumentFragment();
    const btn=(txt,t,id,v)=>{const b=document.createElement('button');b.textContent=txt;b.dataset.t=t;if(id!=null)b.dataset.id=id;if(v!=null)b.dataset.v=v;f.append(b)};
    if(ui.views)cfg.views.forEach((v,i)=>btn(v.name,'v',i));
    if(ui.anims){for(const id in anims)anims[id].forEach(n=>btn(n,'a',id,n));
      if(LIB&&LIB.a)for(const id in items)if(items[id].sc)for(const k in LIB.a)btn(LIB.a[k].name,'a',id,'x:'+k)}
    uiEl.replaceChildren(f)}
  for(const b of uiEl.children){if(b.dataset.t!=='a')continue;const m=cfg.models.find(x=>x.id===b.dataset.id),it=items[b.dataset.id];
    b.setAttribute('aria-pressed',!!m&&m.anim===b.dataset.v);b.classList.toggle('wt',!!(it&&it.pend===b.dataset.v))}
  const cr=ui.credits?ui.creditsHtml:'';if(cr!==crKey){crKey=cr;$('cr').innerHTML=cr}
}
uiEl.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(!b||b.dataset.t==null)return;
  if(b.dataset.t==='v'){const v=cfg.views[+b.dataset.id];if(v)goView(v)}
  else{const m=cfg.models.find(x=>x.id===b.dataset.id);if(m){m.anim=b.dataset.v;apply()}}});
/* Pre-calentado: al pasar el puntero/dedo por un baile se empieza a prepararlo (en trozos, sin bloquear), así al hacer clic ya está listo */
uiEl.addEventListener('pointerover',e=>{const b=e.target.closest&&e.target.closest('button');if(!b||b.dataset.t!=='a'||!b.dataset.v.startsWith('x:'))return;
  const it=items[b.dataset.id];if(it&&it.sc)try{wantClip(it,b.dataset.v.slice(2))}catch(_){}},{passive:true});
