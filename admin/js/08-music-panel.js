/* Panel de música — HTML del bloque «Música & Letra» y de cada pista */
function trackHtml(t,i){const p='music.tracks.'+i+'.';
 return `<div class="m"><b>${esc(t.name)}</b> <button class="x" data-a="mdel" data-i="${i}">Quitar</button>
<button data-a="mplay" data-i="${i}" id="mb_${t.id}">▶ Probar</button>
<input type="range" id="ms_${t.id}" data-seek="${i}" min="0" max="${t.dur||100}" step=".1" value="0" style="width:100%">
<small id="mt_${t.id}">0:00 / ${fmtD(t.dur)}</small>
<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
 <button class="g" data-a="msetstart" data-i="${i}">📍 Usar posición actual como inicio en index</button>
 <button class="g" data-a="mresetstart" data-i="${i}">↺ Desde el principio</button>
</div>
<small id="mstart_${t.id}">Inicio en index: ${fmtD(+t.startAt||0)}</small>
${I('Artista',p+'artist','text')}${I('Título',p+'title','text')}
<button class="g" data-a="mfind" data-i="${i}">🔎 Buscar letra</button><button class="g" data-a="mcal" data-i="${i}">🎯 Recalibrar</button>
<small role="status">${esc(t.src||'Sin letra')}${t.lrc&&/LRCLIB|archivo|manual/.test(t.src||'')?' · sync auto +'+(+t.cal||0).toFixed(2)+' s':''}</small>
${I('Ajuste manual (s)',p+'adj','number','step=".05"')}<small>Si la letra sale antes que la voz, sube el valor (letra más tarde); si sale tarde, bájalo.</small>
<small>Letra (formato .lrc con tiempos, o texto simple que se reparte por la canción):</small>
<textarea data-lrc="${i}" style="height:120px" placeholder="[00:12.30]Primera línea…">${esc(t.lrc)}</textarea></div>`}
function musHtml(){const T=st.music.tracks,ly=st.music.lyrics||{};
 return `<details open><summary>🎵 Música & Letra</summary>
<button data-a="addmus">+ Añadir canción (.mp3, .flac, .m4a, .ogg, .wav)</button>${dir?'<button class="g" data-a="scanmus">↻ Releer carpeta music/</button>':''}
${musFiles.map(f=>`<div>${esc(f)} <button class="g" data-a="addmf" data-n="${esc(f)}">+ Añadir a la lista</button></div>`).join('')}
<small role="status">${esc(musMsg)}</small>
${I('Música activada','music.on','checkbox')}${I('Volumen (0–1)','music.vol','number','step=".05" min="0" max="1"')}${I('Repetir lista','music.loop','checkbox')}
<hr style="border:0;border-top:1px solid var(--bd);margin:8px 0">
<b>Posición y Hitbox de la Letra</b>
${I('Mostrar letra','music.lyrics.show','checkbox')}${SEL('Color de la letra','music.lyrics.color',[['auto','Automático (según el fondo)'],['custom','Personalizado']])}${I('Color personalizado','music.lyrics.custom','color')}
${I('Tamaño máx. de la letra ×','music.lyrics.scale','number','step=".05" min=".3"')}${I('Posición vertical top (vh)','music.lyrics.top','number','step="1"')}${I('Posición horizontal left (%)','music.lyrics.left','number','step="1"')}${I('Ancho de la hitbox (vw)','music.lyrics.width','number','step="1"')}${I('Alto de la hitbox (vh)','music.lyrics.height','number','step="1"')}${I('Mostrar la tarjeta de la canción (carátula, título, artista)','music.lyrics.card','checkbox')}${I('Fondo negro de la tarjeta','music.lyrics.cardBg','checkbox')}${I('Justificar el texto','music.lyrics.justify','checkbox')}
<small>En la vista previa verás un recuadro punteado: arrástralo para moverlo y usa las esquinas para cambiar su tamaño. La letra se ajusta sola al recuadro.</small>
${T.map(trackHtml).join('')||'<small>Sin canciones todavía.</small>'}
<small>Para elegir dónde empieza cada canción en el index: adelanta la barra de reproducción y pulsa «Usar posición actual como inicio en index». «Desde el principio» restablece 0:00. Al publicar, las canciones se copian a la carpeta <b>music/</b> junto al index.html.</small></details>`}

