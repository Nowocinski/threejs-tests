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

const getDirectionPoint = (point1, point2) => {
    // Oblicz wektor różnicy między dwoma punktami
    const directionVector = point2.clone().sub(point1);

    // Oblicz kierunek prostopadły poprzez obrót o 90 stopni
    const perpendicularDirection = new THREE.Vector2(-directionVector.y, directionVector.x);

    // Normalizuj wektor, jeśli chcesz jedynie kierunek
    perpendicularDirection.normalize();

    console.log(perpendicularDirection); // Kierunek prostopadły
    
    return perpendicularDirection;
};

const getDirectionAngle = (vector2) => {
    // Oblicz kąt w radianach
    const radians = Math.atan2(vector2.y, vector2.x);

    // Przekształć kąt z radianów na stopnie
    const degrees = (radians * 180) / Math.PI;

    console.log(`Kąt: ${degrees} stopni`);

    return radians;
};

const points = [
    new THREE.Vector2(4, 2),
    new THREE.Vector2(-2, 2),
    new THREE.Vector2(-4, -2),
    new THREE.Vector2(2, -2)];

for (let currentPointIndex = 0; currentPointIndex < points.length; currentPointIndex++) {
    const nextPoint = currentPointIndex !== points.length - 1 ? currentPointIndex + 1 : 0;
    const previousPoint = currentPointIndex !== 0 ? currentPointIndex - 1 : points.length - 1;

    const currentPoint = points[currentPointIndex];
    
    shape.absarc(
        currentPoint.x,
        currentPoint.y,
        radius,
        getDirectionAngle(getDirectionPoint( points[previousPoint], currentPoint)) + Math.PI,
        getDirectionAngle(getDirectionPoint(currentPoint, points[nextPoint])) + Math.PI);
}
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