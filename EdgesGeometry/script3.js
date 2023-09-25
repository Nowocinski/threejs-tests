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
const material = new THREE.MeshNormalMaterial({side: THREE.DoubleSide,/* wireframe: true*/});
const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);
//#endregion

//#region LineSegments
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
    return Array.from(uniqueVerticesMap.values());
};
const shapeVertices = getVertices();
console.log(shapeVertices);
//#endregion

//#region Kąt między krawędziami
// Przykładowe wierzchołki na płaszczyźnie XY
const calculateAngle = (vertex1, vertex2, vertex3) => {
    // const vertex1 = new THREE.Vector3(1, 1, 0);
    // const vertex2 = new THREE.Vector3(1, 0, 0);
    // const vertex3 = new THREE.Vector3(0, 0, 0);

    // Oblicz wektor między pierwszym a drugim wierzchołkiem
    const vector1 = new THREE.Vector3().subVectors(vertex1, vertex2);

    // Oblicz wektor między trzecim a drugim wierzchołkiem
    const vector2 = new THREE.Vector3().subVectors(vertex3, vertex2);

    // Oblicz kąt między tymi dwoma wektorami przy użyciu funkcji Math.atan2
    const angleRadians = Math.atan2(vector2.y, vector2.x) - Math.atan2(vector1.y, vector1.x);

    // Konwersja kąta z radianów na stopnie
    let angleDegrees = THREE.MathUtils.radToDeg(angleRadians);

    // Uzyskaj wartość dodatnią kąta, aby mieć wynik między 0 a 360 stopni
    if (angleDegrees < 0) {
        angleDegrees += 360;
    }

    console.log("Miarę kąta między trzema wierzchołkami wynosi: " + angleDegrees + " stopni");
    return angleDegrees;
};
//#endregion

//#region Modyfikacja wierzchołków
const createShapeFromPoints = (pointsArray) => {
    const shape2 = new THREE.Shape();
    // Dodawanie punktów do kształtu
    shape2.moveTo(pointsArray[0].x, pointsArray[0].y);
    pointsArray.forEach(({x, y}) => shape2.lineTo(x, y));
    const geometry2 = new THREE.ExtrudeGeometry(shape2, extrudeSettings);
    // Tworzenie materiału i meshu
    const mesh2 = new THREE.Mesh(geometry2, material);
    scene.add(mesh2);
};

const radius = 0.1;
const makeNewShapeWithRoundedCorners = (vertices) => {
    const arr = [];
    for (let i = 0; i < vertices.length; i++) {
        const j = i < vertices.length - 1 ? i + 1 : 0;
        // A
        let vectorA = vertices[i];
        let vectorB = vertices[j];
        let displacementVector1 = vectorB.clone().sub(vectorA);
        let normalizeVector1 = displacementVector1.normalize();
        const point1 = vectorA.clone().addScaledVector(normalizeVector1, radius);
        console.log(point1);
        arr.push(point1);

        // B
        vectorA = vertices[j];
        vectorB = vertices[i];
        displacementVector1 = vectorB.clone().sub(vectorA);
        normalizeVector1 = displacementVector1.normalize();
        const point2 = vectorA.clone().addScaledVector(normalizeVector1, radius);
        console.log(point2);
        arr.push(point2);
        
        // sprawdzanie kąta
        if (i === 0) { // pierwszy wierzchołek
            calculateAngle(vertices[vertices.length-1], vertices[0], vertices[1]);
        } else if (i === vertices.length - 1) { // ostatni wierzchołek
            calculateAngle(vertices[i-1], vertices[i], vertices[0]);
        } else { // pozostałe
            calculateAngle(vertices[i-1], vertices[i], vertices[i+1]);
        }
    }
    createShapeFromPoints(arr);
    return arr;
    // // A
    // let vectorA = shapeVertices[0];
    // let vectorB = shapeVertices[1];
    // let displacementVector1 = vectorB.clone().sub(vectorA);
    // let normalizeVector1 = displacementVector1.normalize();
    // console.log(vectorA.clone().addScaledVector(normalizeVector1, radius));
    //
    // // B
    // vectorA = shapeVertices[1];
    // vectorB = shapeVertices[0];
    // displacementVector1 = vectorB.clone().sub(vectorA);
    // normalizeVector1 = displacementVector1.normalize();
    // console.log(vectorA.clone().addScaledVector(normalizeVector1, radius));
};
makeNewShapeWithRoundedCorners(shapeVertices);
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