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
shape.absellipse(
    5,
    5,
    0,
    0,
    0);
shape.absellipse(
    -5,
    5,
    0,
    0,
    0);
shape.absellipse(
    -5,
    -5,
    0,
    0,
    0);
shape.absellipse(
    0, // pozycja x
    0, // pozycja y
    0.3, // rozciągnięcie w osi x
    -0.3, // rozciągnięcie w oxi y
    Math.PI); // kąt początkowy
shape.absellipse(
    5,
    -5,
    0,
    0,
    0);

const loader = new THREE.CubeTextureLoader();
loader.setPath( 'https://threejs.org/examples/textures/cube/pisa/' );

const textureCube = loader.load( [
    'px.png', 'nx.png',
    'py.png', 'ny.png',
    'pz.png', 'nz.png'
] );

let g = new THREE.ExtrudeGeometry(shape, {
    depth: 3,
    bevelEnabled: false
});
g.center();
g.rotateX(Math.PI * -0.5);

let m = new THREE.MeshStandardMaterial({color: "aqua", envMap: textureCube, metalness: 1, roughness: 0.25, side: THREE.DoubleSide});
let o = new THREE.Mesh(g, m);
scene.add(o);

renderer.setAnimationLoop( _ => {
    renderer.render(scene, camera);
})