import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const container=document.getElementById("globe");
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(42,container.clientWidth/container.clientHeight,0.1,100);
camera.position.set(0,0,3.1);

const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(container.clientWidth,container.clientHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.enablePan=false;
controls.minDistance=1.7;
controls.maxDistance=6;
controls.autoRotate=true;
controls.autoRotateSpeed=0.22;

const loader=new THREE.TextureLoader();
const day=loader.load("https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg");
const night=loader.load("https://threejs.org/examples/textures/planets/earth_lights_2048.png");
day.colorSpace=THREE.SRGBColorSpace;
night.colorSpace=THREE.SRGBColorSpace;

const uniforms={uDay:{value:day},uNight:{value:night},uSun:{value:new THREE.Vector3(0,0,1)}};
const material=new THREE.ShaderMaterial({uniforms,vertexShader:`varying vec3 vNormal; varying vec3 vWorld; varying vec2 vUv; void main(){vUv=uv;vNormal=normalize(mat3(modelMatrix)*normal);vWorld=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.0);}`,fragmentShader:`uniform sampler2D uDay; uniform sampler2D uNight; uniform vec3 uSun; varying vec3 vNormal; varying vec3 vWorld; varying vec2 vUv; void main(){float light=dot(normalize(vNormal),normalize(uSun));float dayMix=smoothstep(-0.12,0.18,light);vec3 d=texture2D(uDay,vUv).rgb;vec3 n=texture2D(uNight,vUv).rgb;float nightGlow=smoothstep(0.12,-0.35,light);vec3 c=mix(n*1.35,d,dayMix);c+=n*nightGlow*0.35;gl_FragColor=vec4(c,1.0);}`});

const earth=new THREE.Mesh(new THREE.SphereGeometry(1,128,64),material);
earth.rotation.y=THREE.MathUtils.degToRad(53);
scene.add(earth);

const cloudTex=loader.load("https://threejs.org/examples/textures/planets/earth_clouds_1024.png");
const clouds=new THREE.Mesh(new THREE.SphereGeometry(1.012,96,48),new THREE.MeshPhongMaterial({map:cloudTex,transparent:true,opacity:0.22,depthWrite:false}));
clouds.rotation.y=earth.rotation.y;
scene.add(clouds);

const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.045,96,48),new THREE.ShaderMaterial({vertexShader:`varying vec3 vN; varying vec3 vV; void main(){vec4 p=modelViewMatrix*vec4(position,1.0);vN=normalize(normalMatrix*normal);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,fragmentShader:`varying vec3 vN; varying vec3 vV; void main(){float glow=pow(1.0-max(dot(vN,vV),0.0),3.0);gl_FragColor=vec4(0.22,0.55,1.0,glow*0.55);}`,transparent:true,blending:THREE.AdditiveBlending,side:THREE.BackSide,depthWrite:false}));
scene.add(atmosphere);

const starsGeo=new THREE.BufferGeometry();
const starPos=[];
for(let i=0;i<2500;i++){const r=18;const a=Math.random()*Math.PI*2;const z=Math.random()*2-1;const s=Math.sqrt(1-z*z);starPos.push(r*s*Math.cos(a),r*z,r*s*Math.sin(a));}
starsGeo.setAttribute("position",new THREE.Float32BufferAttribute(starPos,3));
scene.add(new THREE.Points(starsGeo,new THREE.PointsMaterial({size:0.045,sizeAttenuation:true})));

function sunPosition(){const jd=Date.now()/86400000+2440587.5;const n=jd-2451545;const rad=Math.PI/180;const L=(280.46+0.9856474*n)%360;const g=(357.528+0.9856003*n)%360;const lambda=(L+1.915*Math.sin(g*rad)+0.020*Math.sin(2*g*rad))*rad;const eps=(23.439-0.0000004*n)*rad;const dec=Math.asin(Math.sin(eps)*Math.sin(lambda));const ra=Math.atan2(Math.cos(eps)*Math.sin(lambda),Math.cos(lambda));const gmst=(18.697374558+24.06570982441908*(jd-2451545))*15*rad;let lon=ra-gmst;return new THREE.Vector3(-Math.cos(dec)*Math.sin(lon),Math.sin(dec),Math.cos(dec)*Math.cos(lon)).normalize();}

function resize(){const w=container.clientWidth,h=container.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}
window.addEventListener("resize",resize);

function animate(){requestAnimationFrame(animate);uniforms.uSun.value.copy(sunPosition());clouds.rotation.y+=0.00008;controls.update();renderer.render(scene,camera);}
animate();
