/* Panel y créditos — créditos de modelos y renderizado del panel de administración */
let ENT={};
const nmOf=n=>n.includes('/')?n.split('/')[0]:n.replace(/\.(glb|gltf|zip)$/i,'');
function credit(){}
let rq=0;const render=()=>{if(!rq)rq=requestAnimationFrame(()=>{rq=0;renderNow()})};
function renderNow(){st.models.forEach(m=>{m.outline=mg({enabled:false,color:'#000000',thickness:1,strength:2.5,glow:0},m.outline||{})});const op=[...document.querySelectorAll('#P details')].map(d=>d.open);
$('P').innerHTML=`<h2>Panel de administración</h2>
<details open><summary>Carpeta de modelos</summary>${FS?`<button data-a="dir">📁 ${dir?'Cambiar carpeta':'Elegir carpeta'}</button>${dir?'<button class="g" data-a="scan">↻ Releer</button>':''}`:'<small>Tu navegador no puede leer carpetas (usa Chrome o Edge). Añade los archivos a mano.</small>'}
<small>${dir?`Carpeta: ${esc(dir.name)} · ${files.length} modelo(s)`:'Elige la carpeta donde están index.html y tus .glb.'}</small>
${files.map(f=>`<div>${esc(f)} <button class="g" data-a="addf" data-n="${esc(f)}">+ Añadir a la escena</button></div>`).join('')}
<button class="g" data-a="addm">+ Añadir archivo suelto (.glb, .zip, .gltf)</button>
<button class="g" data-a="addg">💃 Añadir animaciones (.gma)</button><small role="status">${nAn()?`💃 ${nAn()} animación(es) de baile disponibles en la lista «Animación» de cada modelo.`:'Animaciones: pon tus .gma en la carpeta «Animaciones» (dentro de la carpeta elegida) o añádelos con el botón.'} ${esc(libMsg)}</small><small id="dst"></small></details>
<details open><summary>Escena (${st.models.length})</summary><button class="g" data-a="mode" data-m="translate">Mover</button><button class="g" data-a="mode" data-m="rotate">Rotar</button><button class="g" data-a="mode" data-m="scale">Escalar</button>
<small>Haz clic en un modelo y arrástralo con el gizmo.</small>
${st.models.map((m,i)=>`<div class="m${m.id===selId?' sel':''}"><b>${esc(m.name)}</b> <button class="g" data-a="selm" data-i="${i}">Seleccionar</button>
${files.length?`<label>Archivo<select data-f="${i}">${(files.includes(m.file)?files:[m.file,...files]).map(f=>`<option${f===m.file?' selected':''}>${esc(f)}</option>`).join('')}</select></label>`:''}
${I('Nombre',`models.${i}.name`,'text')}${I('Visible',`models.${i}.visible`,'checkbox')}${V('Posición (m)',`models.${i}.pos`)}${V('Rotación (°)',`models.${i}.rot`,'5')}${I('Tamaño ×',`models.${i}.s`,'number','step=".05" min="0.001"')}
${rigMsg?`<small role="status">${esc(rigMsg)}</small>`:''}${animSel(i,m)}${I('Repetir',`models.${i}.loop`,'checkbox')}${I('Velocidad',`models.${i}.speed`,'number','step=".1"')}
<details><summary>Contorno exterior (silueta)</summary>
${I('Activar contorno',`models.${i}.outline.enabled`,'checkbox')}
${I('Color',`models.${i}.outline.color`,'color')}
${I('Grosor',`models.${i}.outline.thickness`,'number','step=".5" min=".5" max="8"')}
${I('Opacidad del trazo',`models.${i}.outline.strength`,'number','step=".1" min=".1" max="10"')}
${I('Brillo exterior',`models.${i}.outline.glow`,'number','step=".1" min="0" max="4"')}
<small>Trazo solo en el borde exterior de la silueta. No dibuja rasgos internos ni modifica materiales o colores. Cada modelo conserva sus propios ajustes de contorno.</small></details>
<button class="x" data-a="del" data-i="${i}">Quitar</button></div>`).join('')||'<small>Escena vacía. Añade un modelo.</small>'}</details>
${musHtml()}
<details><summary>Cámara</summary>${I('Encuadre automático','cam.auto','checkbox')}${I('Campo de visión','cam.fov','number','min="10" max="90"')}${I('El espectador puede mover la cámara','cam.interact','checkbox')}${I('Espectador: desplazar (pan)','cam.pan','checkbox')}${I('Espectador: zoom','cam.zoom','checkbox')}${I('Distancia mínima (0 = auto)','cam.minDist','number','min="0" step=".5"')}${I('Distancia máxima (0 = auto)','cam.maxDist','number','min="0" step=".5"')}${I('Transición entre vistas (s)','cam.tween','number','min="0" step=".1"')}${I('Cambiar de plano solo (usa tus vistas guardadas)','cam.shots','checkbox')}${I('Segundos por plano','cam.shotTime','number','min="1" step=".5"')}${V('Posición cámara','cam.pos')}${V('Punto de mira','cam.target')}
<button data-a="cap">Capturar vista actual</button><button class="g" data-a="frame">Reencuadrar</button><small>Capturar desactiva el encuadre automático y guarda la posición exacta de la cámara para el index.</small><small>Cámara libre en la vista previa: clic izquierdo = orbitar, clic derecho (o Shift+arrastrar) = desplazar la cámara, rueda = zoom. Guarda cada plano con «+ Guardar vista actual» (se guarda posición, punto de mira y campo de visión).</small></details>
<details><summary>Botones de vistas</summary>${st.views.map((v,i)=>`${I('Nombre',`views.${i}.name`,'text')}<button class="g" data-a="seev" data-i="${i}">👁 Ver</button><button class="x" data-a="delv" data-i="${i}">Quitar ${esc(v.name)}</button>`).join('')}<button data-a="addv">+ Guardar vista actual</button></details>
<details><summary>Fondo y luz</summary>${SEL('Fondo','bg.type',[['gradient','Degradado'],['solid','Color'],['none','Transparente']])}${I('Color 1','bg.c1','color')}${I('Color 2','bg.c2','color')}
${I('Exposición','light.exposure','number','step=".1"')}${I('Luz ambiente','light.env','number','step=".1" min="0"')}${I('Sombra en el suelo','light.shadow','checkbox')}</details>
<details><summary>Página</summary>${I('Título','title','text')}${I('Mostrar título','showTitle','checkbox')}${I('Color título','titleColor','color')}
${I('Botones de vistas','ui.views','checkbox')}${I('Botones de animación','ui.anims','checkbox')}${I('Mostrar créditos','ui.credits','checkbox')}
<small>Créditos (HTML).</small><textarea data-p="ui.creditsHtml">${esc(st.ui.creditsHtml)}</textarea></details>
<details open><summary>Publicar</summary>${I('Incrustar modelos','pub.embed','checkbox')}
<button data-a="pub">🚀 Publicar</button><button class="g" data-a="exp">⬇ Descargar copia</button><button class="g" data-a="imp">Abrir index.html</button>
<small>${esc(msg)}</small><small>Publicar guarda la cámara, posiciones y tamaños tal como están configurados aquí.</small></details>
<details><summary>Contraseña</summary><input id="np" type="text" placeholder="Nueva contraseña" style="width:100%;padding:6px"><button data-a="hash">Generar hash</button><small id="hs"></small></details>`;
document.querySelectorAll('#P details').forEach((d,i)=>{if(op[i]!==undefined)d.open=op[i]});
document.querySelectorAll('select[data-anim]').forEach(s=>{s.value=get(s.dataset.p)});setDst()}
