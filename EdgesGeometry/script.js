import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets the color of the background
renderer.setClearColor(0xffffff);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// Sets orbit control to move the camera around
const orbit = new OrbitControls(camera, renderer.domElement);

// Camera positioning
camera.position.set(6, 8, 14);
orbit.update();

// Sets a 12 by 12 gird helper
const gridHelper = new THREE.GridHelper(12, 12);
scene.add(gridHelper);

// Sets the x, y, and z axes with each having a length of 4
const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

//#region CatmullRomCurve3
const curve3d = new THREE.CatmullRomCurve3([
    new THREE.Vector3(5, 2, 0),
    new THREE.Vector3(-5, 2, 0),
    new THREE.Vector3(-5, 2, -5),
    new THREE.Vector3(5, 2, -5),
    new THREE.Vector3(5, 2, 0)
]);
const curve3DPoints = curve3d.getPoints(100);
const curve3DGeometry = new THREE.BufferGeometry().setFromPoints(curve3DPoints);
scene.add(new THREE.Line(curve3DGeometry, new THREE.MeshNormalMaterial()));
//#endregion

function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});