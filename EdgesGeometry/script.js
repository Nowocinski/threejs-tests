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
    // steps: 100,
    // bevelSize: 1,
    // bevelSegments: 100,
    depth: /*0.5*/0,
    bevelEnabled: false
};

const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

// Tworzenie materiału i meshu
const material = new THREE.MeshNormalMaterial({side: THREE.DoubleSide,/* wireframe: true*/});
const mesh = new THREE.Mesh(geometry, material);
// mesh.visible = false;
scene.add(mesh);
//#endregion

//#region LineSegments
// https://threejs.org/docs/#api/en/geometries/EdgesGeometry
// const edges = new THREE.EdgesGeometry(geometry);
// const line = new THREE.LineSegments(edges, material);
// scene.add(line);

// ++++++++++++++++++++++++++++
const getVertices = () => {
    const positionsArray = mesh.geometry.attributes.position.array;

    // Przekształć tablicę pozycji na tablicę obiektów THREE.Vector3
    const vertices = [];
    for (let i = 0; i < positionsArray.length; i += 3) {
        const x = positionsArray[i];
        const y = positionsArray[i + 1];
        const z = positionsArray[i + 2];
        const vertex = new THREE.Vector3(x, y, z);
        vertices.push(vertex);
    }

    // Wyświetl pozycje wierzchołków w konsoli
    // console.log(vertices);

    // Utwórz obiekt Map do przechowywania unikalnych wierzchołków
    const uniqueVerticesMap = new Map();

    // Przejdź przez tablicę vertices i dodaj unikalne wierzchołki do Map
    for (const vertex of vertices) {
        const key = `${vertex.x}_${vertex.y}_${vertex.z}`;
        if (!uniqueVerticesMap.has(key)) {
            uniqueVerticesMap.set(key, vertex);
        }
    }

    // Konwertuj Map z unikalnymi wierzchołkami z powrotem na tablicę
    const uniqueVertices = Array.from(uniqueVerticesMap.values());
    // console.log(uniqueVertices);
    return uniqueVertices;
};
const shapeVertices = getVertices();
console.log(shapeVertices);

// const shape2 = new THREE.Shape();
// // Dodawanie punktów do kształtu
// shape2.moveTo(0, 0);
// shape.lineTo(0, 1);
// shapeVertices.forEach(vector3 => shape.lineTo(vector3.x, vector3.y));
// scene.add(new THREE.Mesh(new THREE.ExtrudeGeometry(shape, extrudeSettings), material));
// ++++++++++++++++++++++++++++
//#endregion

//#region CatmullRomCurve3
const curve3d = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1, 1, -1),
    new THREE.Vector3(-2, 2, -1),
    new THREE.Vector3(-3, 3, 1),
    new THREE.Vector3(-2, 1, 4),
    new THREE.Vector3(3, 1, -1),
    new THREE.Vector3(3, -3, 3),
    new THREE.Vector3(3, 0, 2),
    new THREE.Vector3(2, 1, 2),
    new THREE.Vector3(-1, 1, -1)
]);
const curve3DPoints = curve3d.getPoints(50);
const curve3DGeometry = new THREE.BufferGeometry().setFromPoints(curve3DPoints);
// scene.add(new THREE.Line(curve3DGeometry, material));
//#endregion

//#1
// // Modyfikuj geometrię, np. przesuń punkt na indeksie 2 wzdłuż osi X
// geometry.attributes.position.array[2] += 0.5;
// // Aktualizuj geometrię, aby zastosować zmiany
// geometry.verticesNeedUpdate = true;

function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});