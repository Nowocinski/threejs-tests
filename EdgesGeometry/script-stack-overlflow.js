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

//#region EdgesGeometry
// Tworzenie geometrii ExtrudeGeometry
const shape = new THREE.Shape();
// Dodawanie punktów do kształtu
shape.moveTo(0, 0);
shape.lineTo(0, 1);
shape.lineTo(1, 1);
shape.lineTo(1, 0);
shape.lineTo(0, 0);

const extrudeSettings = {
    depth: 0,
    bevelEnabled: false
};

const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

// Tworzenie materiału i meshu
const material = new THREE.MeshNormalMaterial({side: THREE.DoubleSide/*, wireframe: true*/});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const getVertices = () => {
    const positionsArray = mesh.geometry.attributes.position.array;

    const vertices = [];
    for (let i = 0; i < positionsArray.length; i += 3) {
        const x = positionsArray[i];
        const y = positionsArray[i + 1];
        const z = positionsArray[i + 2];
        const vertex = new THREE.Vector3(x, y, z);
        vertices.push(vertex);
    }
    const uniqueVerticesMap = new Map();

    for (const vertex of vertices) {
        const key = `${vertex.x}_${vertex.y}_${vertex.z}`;
        if (!uniqueVerticesMap.has(key)) {
            uniqueVerticesMap.set(key, vertex);
        }
    }

    return Array.from(uniqueVerticesMap.values());
};
const shapeVertices = getVertices();
console.log(shapeVertices);

// #1.1 Kalkulacja kąta między wierzchołkami

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
const angle = calculateAngle(shapeVertices[0], shapeVertices[1], shapeVertices[2]);
console.log("angle: ", angle);

// #1.2 Kąt "kierunkowy"

const checkAngle = (vector1, vector2) => {
    const directionVector = new THREE.Vector2(vector2.x - vector1.x, vector2.y - vector1.y);
    const angleRadians = Math.atan2(directionVector.y, directionVector.x);
    // const angleDegrees = THREE.MathUtils.radToDeg(angleRadians);
    // return angleDegrees;
    return angleRadians;
};

// #2 Kalkulacja "siły odśrodkowej" między punktami

const radius = 0.1;

const pointA = new THREE.Vector3(
    (shapeVertices[0].x + shapeVertices[2].x)/2,
    (shapeVertices[0].y + shapeVertices[2].y)/2
);
console.log("pointA: ", pointA);
const displacementVector = pointA.clone().sub(shapeVertices[1]);
console.log("displacementVector: ", displacementVector);
const calculatedCenter = displacementVector.normalize().setScalar(radius);
console.log("displacementVector [normalize]: ", calculatedCenter);

// #3

const generatePointsOnSemicircle = (radius, startAngle, center, segments) => {
    const points = [];

    for (let i = 0; i <= segments; i++) {
        const angle = startAngle + (i / segments) * Math.PI; // Kąt od początku do połowy okręgu
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);
        points.push(new THREE.Vector2(x, y));
    }

    return points.reverse();
};

const circlePoints = generatePointsOnSemicircle(
    radius,
    checkAngle(shapeVertices[0],shapeVertices[2]),
    calculatedCenter,
    20);
console.log("circlePoints: ", circlePoints);

// #4

const create2 = (circlePoints2) => {
    const shape = new THREE.Shape();
    shape.moveTo(circlePoints2[0].x, circlePoints2[0].y);
    circlePoints2.forEach(({x, y}) => shape.lineTo(x, y));
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshNormalMaterial());
    scene.add(mesh.translateZ(2));
};
create2(circlePoints);

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