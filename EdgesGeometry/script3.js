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
    return angleRadians < 0 ? angleRadians + Math.PI : angleRadians;
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

const radius = 0.1; // kąt zaokrąglenia - promień zaokrąglenia mechanizmu wycinającego
const makeNewShapeWithRoundedCorners = (vertices) => {
    const arr = [];
    for (let i = 0; i < vertices.length; i++) {
        const j = i < vertices.length - 1 ? i + 1 : 0;

        // sprawdzanie kąta
        let angle;
        if (i === 0) { // pierwszy wierzchołek
            angle = calculateAngle(vertices[vertices.length-1], vertices[0], vertices[1]);
        } else if (i === vertices.length - 1) { // ostatni wierzchołek
            angle = calculateAngle(vertices[i-1], vertices[i], vertices[0]);
        } else { // pozostałe
            angle = calculateAngle(vertices[i-1], vertices[i], vertices[i+1]);
        }
        const cutPart = Math.abs(radius/Math.sin(angle));
        console.log("cutPart: ", cutPart);
        
        // A
        let vectorA = vertices[i];
        let vectorB = vertices[j];
        let displacementVector1 = vectorB.clone().sub(vectorA);
        let normalizeVector1 = displacementVector1.normalize();
        const point1 = vectorA.clone().addScaledVector(normalizeVector1, cutPart);
        console.log(point1);
        arr.push(point1);

        // B
        vectorA = vertices[j];
        vectorB = vertices[i];
        displacementVector1 = vectorB.clone().sub(vectorA);
        normalizeVector1 = displacementVector1.normalize();
        const point2 = vectorA.clone().addScaledVector(normalizeVector1, cutPart);
        console.log(point2);
        arr.push(point2);
    }
    createShapeFromPoints(arr);
    return arr;
};

const newShapePoints = makeNewShapeWithRoundedCorners(shapeVertices);
// ---------
const checkAngle = (vector1, vector2) => {
    const directionVector = new THREE.Vector2(vector2.x - vector1.x, vector2.y - vector1.y);
    const angleRadians = Math.atan2(directionVector.y, directionVector.x);
    const angleDegrees = THREE.MathUtils.radToDeg(angleRadians);
    console.log("angleDegrees: ", angleDegrees);
    return angleDegrees;
};
const angleCornerValue = checkAngle(newShapePoints[5], newShapePoints[6]);
// ---------

//#endregion

//#region Koło
function generatePointsOnCircle(radius, segments) {
    const points = [];
    for (let i = 0; i < segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = radius * Math.cos(theta);
        const y = radius * Math.sin(theta);
        points.push(new THREE.Vector2(x, y));
    }
    return points;
}

function generatePointsOnSemicircle(radius, startAngle, center, segments) {
    const points = [];

    for (let i = 0; i <= segments; i++) {
        const angle = startAngle + (i / segments) * Math.PI; // Kąt od początku do połowy okręgu
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);
        points.push(new THREE.Vector2(x, y));
    }

    return points.reverse();
}
const createCircle = () => {
    // const circlePoints = generatePointsOnCircle(1, 50);
    // ----
    const radius = 1; // Promień półokręgu
    const startAngle = (Math.PI/180)*/*-30*/angleCornerValue; // Kąt początkowy (0 to północ)
    const center = new THREE.Vector2(0, 0); // Środek okręgu
    const segments = 36; // Ilość segmentów
    const circlePoints = generatePointsOnSemicircle(radius, startAngle, center, segments);
    // ----
    const shape = new THREE.Shape();
    shape.moveTo(circlePoints[0].x, circlePoints[0].y);
    circlePoints.forEach(({x, y}) => shape.lineTo(x, y));
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh.translateY(3));
};
createCircle();
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