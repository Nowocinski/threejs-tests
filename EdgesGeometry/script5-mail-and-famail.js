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

//#region Poligon
//#region #0 Helpers
const applyTransformation = (object) => {
    object.updateMatrix();
    object.geometry.applyMatrix4(object.matrix);
    object.position.set(0, 0, 0);
    object.rotation.set(0, 0, 0);
    object.scale.set(1, 1, 1);
    object.updateMatrix();
}

//#endregion
//#region #1 Pierwotny obiekt
const shape = new THREE.Shape();
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

const material = new THREE.MeshNormalMaterial({side: THREE.DoubleSide});
const mesh = new THREE.Mesh(geometry, material);
//#endregion
//#region #2 Pobranie wierzchołków
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
//#region #3 Modyfikacja wierzchołków
const createShapeFromPoints = (pointsArray) => {
    const shape = new THREE.Shape();
    // Dodawanie punktów do kształtu
    shape.moveTo(pointsArray[0].x, pointsArray[0].y);
    // shape.moveTo(Math.max(...pointsArray.map(({x}) => x)), Math.max(...pointsArray.map(({y}) => y)));
    pointsArray.forEach(({x, y}) => shape.lineTo(x, y));
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Tworzenie materiału i meshu
    const mesh2 = new THREE.Mesh(geometry, material);
    scene.add(mesh2);
};

/**
 * Mara kąta między trzema wierzchołkami
 *
 * @param   whatsit  The whatsit to use (or whatever).
 * @returns A useful value.
 */
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
//#region #4 Tworzenie bryły na podstawie zmodyfikowanych wierzchołków
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
//#endregion
//#region #5 Sprawdzenie kąta między wyciętymi rogami
/**
 * Mara kąta między dwoma wierzchołkami
 *
 * @param   whatsit  The whatsit to use (or whatever).
 * @returns A useful value.
 */
const checkAngle = (vector1, vector2) => {
    const directionVector = new THREE.Vector2(vector2.x - vector1.x, vector2.y - vector1.y);
    const angleRadians = Math.atan2(directionVector.y, directionVector.x);
    const angleDegrees = THREE.MathUtils.radToDeg(angleRadians);
    return angleDegrees;
};
//#endregion
//#region #6 Stworzenie półokręgu do uciętego fragmentu rogu
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
const roundCorner = (v1, v2) => {
    const distanceBetweenVectors = v1.distanceTo(v2);
    console.log("dystans pomiędzy punktami: ", distanceBetweenVectors);
    const angleCornerValue = checkAngle(v1, v2);
    console.log("angleCornerValue: ", angleCornerValue);

    // const radius = 1; // Promień półokręgu
    const startAngle = /*(Math.PI/180)*angleCornerValue*/0; // Kąt początkowy (0 to północ)
    // const center = new THREE.Vector2((v1.x + v2.x)/2, (v1.y + v2.y)/2);
    const center = new THREE.Vector2(0,0); // Środek okręgu
    const segments = 36; // Ilość segmentów
    const circlePoints = generatePointsOnSemicircle(distanceBetweenVectors/2, startAngle, center, segments);
    const shape = new THREE.Shape();
    shape.moveTo(circlePoints[0].x, circlePoints[0].y);
    circlePoints.forEach(({x, y}) => shape.lineTo(x, y));
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({color: 0xff0000}));
    // skalowanie wysokości
    mesh
        .scale.setY(0.3);
    // pozycjonowanie
    mesh
        .translateX((v1.x + v2.x)/2)
        .translateY((v1.y + v2.y)/2);
    mesh.
    rotateZ((Math.PI/180)*angleCornerValue);
    applyTransformation(mesh);
    scene.add(mesh);
};
const roundCorners = () => {
    if (newShapePoints.length < 2) {
        return new Error("Nieprawidłowe dane");
    }
    roundCorner(newShapePoints[newShapePoints.length - 1], newShapePoints[0]);
    for (let i = 2; i < newShapePoints.length; i += 2) {
        roundCorner(newShapePoints[i - 1], newShapePoints[i]);
    }
};
roundCorners();
//#endregion
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