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
mesh.visible = false;
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
// ++++
// // Tworzenie dwóch wektorów
// const vectorA = new THREE.Vector3(1, 2, 3);
// const vectorB = new THREE.Vector3(4, 5, 6);
//
// // Obliczenie wektora przesunięcia od vectorA do vectorB
// const displacementVector = vectorB.clone().sub(vectorA).normalize();
//
// // Wynikowy wektor "displacementVector" będzie zawierać przesunięcie od vectorA do vectorB
// console.log(displacementVector); // Wynik: Vector3 {x: 3, y: 3, z: 3}
// ++++
const radius = 0.1;
let newVertices = [];
const loops =  shapeVertices.length;
// uwzględniany następny punkt
for (let i = 0; i < loops; i++) {
    let vectorA, vectorB;
    // before
    if (i === 0) { // Ostatni punkt
        vectorA = shapeVertices[0].clone();
        vectorB = shapeVertices[loops - 1].clone();
    } else {
        vectorA = shapeVertices[i].clone();
        vectorB = shapeVertices[i-1].clone();
    }

    const displacementVector1 = vectorB.clone().sub(vectorA);
    const normalizeVector1 = displacementVector1.normalize();
    newVertices.push(vectorA.clone().addScaledVector(normalizeVector1, radius));
    
    // after
    if (i === loops - 1) { // Ostatni punkt
        vectorA = shapeVertices[i].clone();
        vectorB = shapeVertices[0].clone();
    } else {
        vectorA = shapeVertices[i].clone();
        vectorB = shapeVertices[i+1].clone();
    }
    
    const displacementVector2 = vectorB.clone().sub(vectorA);
    const normalizeVector2 = displacementVector2.normalize();
    newVertices.push(vectorA.clone().addScaledVector(normalizeVector2, radius));
}
console.log(newVertices);
// +++++++++++++
const shape2 = new THREE.Shape();
// Dodawanie punktów do kształtu
shape2.moveTo(0, 0);
newVertices.reverse().forEach(vector3 => shape.lineTo(vector3.x, vector3.y));
scene.add(new THREE.Mesh(new THREE.ExtrudeGeometry(shape, extrudeSettings), material));
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