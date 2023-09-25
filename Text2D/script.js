import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {FontLoader} from "three/examples/jsm/loaders/FontLoader.js";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry.js";

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

let fontLoader;
const create3DText = ({
                          str = "Hello",
                          fontUrl = "../node_modules/three/examples/fonts/helvetiker_bold.typeface.json",
                      size = 2,
                      height = 1,
                      curveSegments = 12,
                      callbackReady} = {}) => {
    if (!fontLoader) {
        fontLoader = new FontLoader();
    }
    
    fontLoader.load(
        fontUrl,
        // onLoad callback
        function (font) {
            console.log("Font załadowano");
            const textGeometry = new TextGeometry(str, {
                font: font,
                size: size, // wielkość czcionki
                height: height, // wysokość
                curveSegments: curveSegments});
            const fontMaterial = new THREE.MeshNormalMaterial();
            const text3d = new THREE.Mesh(textGeometry, fontMaterial);
            callbackReady(text3d);
        }, function (xhr) {
            // postęp ładowania
        }, function (err) {
            console.log("Błąd ładowania czcionki: ", err);
        });
}

const additionalSpace = 5;
let distance = 0;
"ABC".split('').forEach(letter => {
    create3DText({
        callbackReady: function (readyText3D) {
            const text3D = readyText3D;
            scene.add(text3D.translateX(distance));
            const letterWidth = new THREE.Box3().setFromObject(text3D).getSize(new THREE.Vector3()).x;
            distance += letterWidth + additionalSpace;
        },
        str: letter
    });
});

function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});