// https://jsfiddle.net/prisoner849/pjb3cdm8/

console.clear();

import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
camera.position.set(0, 8, 13).setLength(10);
camera.lookAt(scene.position);
let renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x404040);
document.body.appendChild(renderer.domElement);

let controls = new OrbitControls(camera, renderer.domElement);

let light = new THREE.DirectionalLight(0xffffff, 1);
light.position.setScalar(1);
scene.add(light, new THREE.AmbientLight(0xffffff, 0.5));

let shape = new THREE.Shape();
let angleStep = Math.PI * 0.5;
let radius = 0.1;

// ---------------
[[4, 2], [-2, 2], [-4, -2], [2, -2]].forEach(([x, y]) => {
    shape.absarc(x, y, radius, angleStep * 0, angleStep * 1);
});
// ---------------

// shape.absarc(4, 2, radius, angleStep * 0, angleStep * 1);
// shape.absarc(-2, 2, radius, angleStep * 1, angleStep * 2);
// shape.absarc(-4, -2, radius, angleStep * 2, angleStep * 3);
// shape.absarc(2, -2, radius, angleStep * 3, angleStep * 4);

const loader = new THREE.CubeTextureLoader();
loader.setPath( 'https://threejs.org/examples/textures/cube/pisa/' );

const textureCube = loader.load( [
    'px.png', 'nx.png',
    'py.png', 'ny.png',
    'pz.png', 'nz.png'
] );

let g = new THREE.ExtrudeGeometry(shape, {
    depth: 3,
    bevelEnabled: false,
    // bevelThickness: 0.05,
    // bevelSize: 0.05,
    // bevelSegments: 20,
    // curveSegments: 20
});
g.center();
g.rotateX(Math.PI * -0.5);

let m = new THREE.MeshStandardMaterial({color: "aqua", envMap: textureCube, metalness: 1, roughness: 0.25});
let o = new THREE.Mesh(g, m);
scene.add(o);

renderer.setAnimationLoop( _ => {
    renderer.render(scene, camera);
})