import * as THREE from "three";
import { OrbitControls } from "./OrbitControls.js";

const box=document.getElementById("globe");
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x02040a);

const camera=new THREE.PerspectiveCamera(38,box.clientWidth/box.clientHeight,0.01,100);
camera.position.set(0,0,3.2);

const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setSize(box.clientWidth,box.clientHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
box.appendChild(renderer.domElement);

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.dampingFactor=0.055;
controls.enablePan=false;
controls.minDistance=1.12;
controls.maxDistance=8;
controls.rotateSpeed=0.55;
controls.zoomSpeed=0.8;

const loader=new THREE.TextureLoader();
const earthTexture=loader.load("./lib/globe/textures/earth-day.jpg");
earthTexture.colorSpace=THREE.SRGBColorSpace;

earthTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();

const earth=new THREE.Mesh(
new THREE.SphereGeometry(1,128,64),
new THREE.MeshPhongMaterial({map:earthTexture,shininess:12,specular:new THREE.Color(0x222222)})
);

scene.add(earth);

const atmosphere=new THREE.Mesh(
new THREE.SphereGeometry(1.035,96,48),
new THREE.MeshBasicMaterial({color:0x4da6ff,transparent:true,opacity:0.12,side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false})
);
scene.add(atmosphere);

const sun=new THREE.DirectionalLight(0xffffff,2.6);
sun.position.set(5,3,5);
scene.add(sun);

scene.add(new THREE.AmbientLight(0xffffff,0.35));

const starGeometry=new THREE.BufferGeometry();
const positions=[];
for(let i=0;i<3500;i++){
const r=25;
const a=Math.random()*Math.PI*2;
const z=Math.random()*2-1;
const q=Math.sqrt(1-z*z);
positions.push(r*q*Math.cos(a),r*z,r*q*Math.sin(a));
}
starGeometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
scene.add(new THREE.Points(starGeometry,new THREE.PointsMaterial({color:0xffffff,size:0.035,sizeAttenuation:true})));

function resize(){
const w=box.clientWidth,h=box.clientHeight;
camera.aspect=w/h;
camera.updateProjectionMatrix();
renderer.setSize(w,h);
}
window.addEventListener("resize",resize);

function animate(){
requestAnimationFrame(animate);
controls.update();
renderer.render(scene,camera);
}
animate();
