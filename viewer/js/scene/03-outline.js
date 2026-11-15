/* Escena 3D · contorno exterior por máscara de silueta (se concatena con las demás partes de scene/ en un único módulo; ver README) */
// Contorno exterior por máscara de silueta: no usa OutlinePass ni detecta bordes internos.
// Se renderiza una máscara a media resolución y se dibuja únicamente el borde exterior.
const maskScale=1; // resolución completa del buffer de dibujo para evitar bordes dentados
const maskRT=new THREE.WebGLRenderTarget(Math.max(1,Math.floor(innerWidth*R.getPixelRatio()*maskScale)),Math.max(1,Math.floor(innerHeight*R.getPixelRatio()*maskScale)),{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,depthBuffer:true,stencilBuffer:false,samples:R.capabilities.isWebGL2?Math.min(4,R.capabilities.maxSamples||4):0});
maskRT.texture.generateMipmaps=false;
const maskMaterial=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide,toneMapped:false});
const outlineUniforms={tMask:{value:maskRT.texture},texel:{value:new THREE.Vector2(1/maskRT.width,1/maskRT.height)},radius:{value:1.5},lineColor:{value:new THREE.Color('#000000')},opacity:{value:1}};
const outlineMat=new THREE.ShaderMaterial({uniforms:outlineUniforms,transparent:true,depthTest:false,depthWrite:false,toneMapped:false,vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',fragmentShader:'varying vec2 vUv;uniform sampler2D tMask;uniform vec2 texel;uniform float radius;uniform vec3 lineColor;uniform float opacity;void main(){vec2 d=texel*radius;float c=texture2D(tMask,vUv).a;float n=0.0;n=max(n,texture2D(tMask,vUv+vec2(d.x,0.0)).a);n=max(n,texture2D(tMask,vUv-vec2(d.x,0.0)).a);n=max(n,texture2D(tMask,vUv+vec2(0.0,d.y)).a);n=max(n,texture2D(tMask,vUv-vec2(0.0,d.y)).a);n=max(n,texture2D(tMask,vUv+vec2(d.x,d.y)).a);n=max(n,texture2D(tMask,vUv+vec2(-d.x,d.y)).a);n=max(n,texture2D(tMask,vUv+vec2(d.x,-d.y)).a);n=max(n,texture2D(tMask,vUv-d).a);float edge=(1.0-smoothstep(0.35,0.65,c))*smoothstep(0.25,0.65,n);gl_FragColor=vec4(lineColor,edge*opacity);}'});
const outlineScene=new THREE.Scene(),outlineCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1),outlineQuad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),outlineMat);outlineScene.add(outlineQuad);
let outlineGroups=[];
function syncOutlines(){
 const groups=new Map();
 for(const m of cfg.models){const it=items[m.id];if(!it||!it.w||!it.w.visible)continue;const o={enabled:false,color:'#000000',thickness:1,strength:2.5,glow:0,...(m.outline||{})};if(!o.enabled)continue;
  const style={color:o.color||'#000000',thickness:Math.max(.5,Math.min(8,+o.thickness||1)),strength:Math.max(.1,Math.min(10,+o.strength||2.5))};const key=JSON.stringify(style);if(!groups.has(key))groups.set(key,{style,roots:new Set()});groups.get(key).roots.add(it.w);
 }
 outlineGroups=[...groups.values()];
}
function renderWithOutline(){
 R.render(S,cam);if(!outlineGroups.length)return;
 const oldAuto=R.autoClear,oldAlpha=R.getClearAlpha(),oldColor=R.getClearColor(new THREE.Color()).clone(),floorVisible=fl.visible,override=S.overrideMaterial,vis=root.children.map(o=>[o,o.visible]),helper=tc&&tc.getHelper?tc.getHelper():null,helperVisible=helper&&helper.visible;
 try{
  fl.visible=false;if(helper)helper.visible=false;S.overrideMaterial=maskMaterial;R.setClearColor(0x000000,0);R.setRenderTarget(maskRT);
  for(const g of outlineGroups){
   for(const [o] of vis)o.visible=g.roots.has(o);R.clear(true,true,true);R.render(S,cam);
   outlineUniforms.lineColor.value.set(g.style.color);outlineUniforms.radius.value=Math.max(1,Math.min(12,g.style.thickness*R.getPixelRatio()));outlineUniforms.opacity.value=Math.max(.08,Math.min(1,g.style.strength/3));
   R.setRenderTarget(null);R.autoClear=false;R.render(outlineScene,outlineCamera);R.autoClear=true;R.setRenderTarget(maskRT);
  }
 }finally{for(const [o,v] of vis)o.visible=v;if(helper)helper.visible=helperVisible;S.overrideMaterial=override;fl.visible=floorVisible;R.setRenderTarget(null);R.setClearColor(oldColor,oldAlpha);R.autoClear=oldAuto;}
}
