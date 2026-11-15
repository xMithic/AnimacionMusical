/* Escena 3D · renderer, escena, cámara, luces y suelo de sombras (se concatena con las demás partes de scene/ en un único módulo; ver README) */
const R=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,alpha:true,powerPreference:'high-performance'});
R.setPixelRatio(Math.min(devicePixelRatio,1.5));R.toneMapping=THREE.ACESFilmicToneMapping;R.shadowMap.enabled=true;
const S=new THREE.Scene(),cam=new THREE.PerspectiveCamera(35,1,.01,2000);
S.environment=new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(),.04).texture;
const ctl=new OrbitControls(cam,R.domElement);ctl.enableDamping=true;
const dl=new THREE.DirectionalLight(0xffffff,2);dl.position.set(3,6,4);dl.castShadow=true;dl.shadow.mapSize.set(1024,1024);S.add(dl,dl.target);
const fl=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.35}));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;S.add(fl);
const root=new THREE.Group();S.add(root);
