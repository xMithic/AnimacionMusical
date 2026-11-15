/* Escena 3D · redimensionado, bucle de render y aviso de listo (se concatena con las demás partes de scene/ en un único módulo; ver README) */
function rs(){R.setSize(innerWidth,innerHeight,false);maskRT.setSize(Math.max(1,Math.floor(innerWidth*R.getPixelRatio()*maskScale)),Math.max(1,Math.floor(innerHeight*R.getPixelRatio()*maskScale)));outlineUniforms.texel.value.set(1/maskRT.width,1/maskRT.height);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener('resize',rs);rs();apply();
R.setAnimationLoop(()=>{const d=Math.min(clock.getDelta(),.1);stepCam(performance.now());if(++fsC%20===0)try{fitShadow()}catch(_){}for(const i in items)if(items[i].mx)items[i].mx.update(d);ctl.update();renderWithOutline()});
if(parent!==window)parent.postMessage({k:'ready'},'*');
