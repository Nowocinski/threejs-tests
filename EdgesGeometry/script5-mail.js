import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

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
shape.moveTo(0.3, 0.3);
shape.lineTo(1, 1);
shape.lineTo(1, 0);
shape.moveTo(0.2, 0.2);
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
//#endregion
//#region #3 Modyfikacja wierzchołków
const createShapeFromPoints = (pointsArray) => {
    const shape = new THREE.Shape();
    shape.moveTo(pointsArray[0].x, pointsArray[0].y);
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
    return [angleRadians < 0 ? angleRadians + Math.PI : angleRadians, angleDegrees];
};
//#endregion
//#region #4 Tworzenie bryły na podstawie zmodyfikowanych wierzchołków
const radius = 0.1; // kąt zaokrąglenia - promień zaokrąglenia mechanizmu wycinającego
const arr2 = [];
//!!!
const makeNewShapeWithRoundedCorners = (vertices) => {
    const arr = [];
    for (let i = 0; i < vertices.length; i++) {
        const nextPoint = i < vertices.length - 1 ? i + 1 : 0;
        const previousPoint = i === 0 ? vertices.length - 1 : i - 1;

        // sprawdzanie kąta
        let angle, angleInDegrees;
        if (i === 0) { // pierwszy wierzchołek
            [angle, angleInDegrees] = calculateAngle(vertices[vertices.length-1], vertices[0], vertices[1]);
        } else if (i === vertices.length - 1) { // ostatni wierzchołek
            [angle, angleInDegrees] = calculateAngle(vertices[i-1], vertices[i], vertices[0]);
        } else { // pozostałe
            [angle, angleInDegrees] = calculateAngle(vertices[i-1], vertices[i], vertices[i+1]);
        }
        const cutPart = Math.abs(radius/Math.sin(angle));
        console.log("angleInDegrees: ", angleInDegrees);

        if (angleInDegrees > 180) { // zaokrąlony fragmęt - punkty
            console.log("!!!", angleInDegrees, vertices[i]);

                // A
                let vectorA = vertices[i];
                let vectorB = vertices[nextPoint];
                let directionVector = new THREE.Vector3();
                directionVector.subVectors(vectorB, vectorA);
                directionVector.normalize();
                directionVector.multiplyScalar(cutPart);
                let newPositionA = new THREE.Vector3();
                newPositionA.addVectors(vectorA, directionVector);
                console.log(newPositionA);
                arr2.push(newPositionA);

                // B
                vectorA = vertices[i];
                vectorB = vertices[previousPoint];
                directionVector = new THREE.Vector3();
                directionVector.subVectors(vectorB, vectorA);
                directionVector.normalize();
                directionVector.multiplyScalar(cutPart);
                newPositionA = new THREE.Vector3();
                newPositionA.addVectors(vectorA, directionVector);
                console.log(newPositionA);
                arr2.push(newPositionA);

                arr2.push(vertices[i]);
        }

        arr.push(vertices[i]);
    }
    console.log(arr);
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

const roundCorner = (v1, v2, v3 = undefined) => {
    const distanceBetweenVectors = v1.distanceTo(v2);
    const angleCornerValue = checkAngle(v1, v2);

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
    
    // ==================================================================================================================
    
    if (v3 === undefined) {
        return;
    }
    
    const triangleShape = new THREE.Shape();
    triangleShape.moveTo(v3.x, v3.y);
    triangleShape.lineTo(v1.x, v1.y);
    triangleShape.lineTo(v2.x, v2.y);
    triangleShape.lineTo(v3.x, v3.y);
    const triangleMesh = new THREE.Mesh(
        new THREE.ExtrudeGeometry(triangleShape, extrudeSettings),
        new THREE.MeshBasicMaterial({color: 0x0000ff})
    );
    scene.add(triangleMesh);
};
const roundCorners = () => {
    if (newShapePoints.length < 2) {
        return new Error("Nieprawidłowe dane");
    }
    // roundCorner(newShapePoints[newShapePoints.length - 1], newShapePoints[0]);
    // for (let i = 2; i < newShapePoints.length; i += 2) {
    //     roundCorner(newShapePoints[i - 1], newShapePoints[i]);
    // }
    console.log("arr2: ", arr2);
    for (let i = 0; i < arr2.length; i += 3) {
        roundCorner(arr2[i], arr2[i+1], arr2[i+2]);
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

//#region dat.gui
const gui = new dat.GUI();
gui.add(material, "wireframe");
//#endregion