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
const checkAngle = (vector1, vector2) => {
    const directionVector = new THREE.Vector2(vector2.x - vector1.x, vector2.y - vector1.y);
    const angleRadians = Math.atan2(directionVector.y, directionVector.x);
    // const angleDegrees = THREE.MathUtils.radToDeg(angleRadians);
    // return angleDegrees;
    return angleRadians;
};

const calculateAngle = (vertex1, vertex2, vertex3) => {
    // Oblicz wektor między pierwszym a drugim wierzchołkiem
    const vector1 = new THREE.Vector3().subVectors(vertex1, vertex2);

    // Oblicz wektor między trzecim a drugim wierzchołkiem
    const vector2 = new THREE.Vector3().subVectors(vertex3, vertex2);

    // Oblicz kąt między tymi dwoma wektorami przy użyciu funkcji Math.atan2
    let angleRadians = Math.atan2(vector2.y, vector2.x) - Math.atan2(vector1.y, vector1.x);

    // Konwersja kąta z radianów na stopnie
    let angleDegrees = THREE.MathUtils.radToDeg(angleRadians);

    // Uzyskaj wartość dodatnią kąta, aby mieć wynik między 0 a 360 stopni
    if (angleDegrees < 0) {
        angleDegrees += 360;
    }

    console.log("Miarę kąta między trzema wierzchołkami wynosi: " + angleDegrees + " stopni");
    return [angleRadians < 0 ? angleRadians + Math.PI : angleRadians, angleDegrees];
};

const points = [[4, 2], [-2, 2], [-4, -2], [2, -2]];

for (let currentPoint = 0; currentPoint < points.length; currentPoint++) {
    const nextPoint = currentPoint !== points.length - 1 ? currentPoint + 1 : 0;
    const previousPoint = currentPoint !== 0 ? currentPoint - 1 : points.length - 1;
    // abc(points[currentPoint]);

    const x = points[currentPoint][0];
    const y = points[currentPoint][1];

    // 0, PI/2
    shape.absarc(x, y, radius, angleStep * 0, angleStep * 1);
    
    console.log(calculateAngle(
        new THREE.Vector3(points[previousPoint][0], points[previousPoint][0]),
        new THREE.Vector3(x, y),
        new THREE.Vector3(points[nextPoint][0], points[nextPoint][0])));
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