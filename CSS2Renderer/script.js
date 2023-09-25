import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {CSS2DObject, CSS2DRenderer} from "three/examples/jsm/renderers/CSS2DRenderer.js";

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

//#region css2renderer
const labelLRenderer = new CSS2DRenderer();
labelLRenderer.setSize(window.innerWidth, window.innerHeight);
labelLRenderer.domElement.style.position = "absolute";
labelLRenderer.domElement.style.top = "0px";
labelLRenderer.domElement.style.pointerEvents = "none";
document.body.appendChild(labelLRenderer.domElement);
//#endregion

//#region css2Renderer HTML objects
// paragraf
const p = document.createElement("p");
p.textContent = "Hello";
const cPointLabel = new CSS2DObject(p);
scene.add(cPointLabel);

// przycisk
const buttonWidth = 200;
const deleteButton = document.createElement("button");
deleteButton.style.width = buttonWidth + "px";
deleteButton.style.color = "#fff";
deleteButton.style.border = "none";
deleteButton.style.padding = "0.8rem 2rem 0.8rem 2rem";
deleteButton.style.backgroundColor = "#95cc1c";
deleteButton.style.fontSize = "1.4rem";
deleteButton.style.fontWeight = "800";
deleteButton.style.cursor = "pointer";
deleteButton.style.display = "none";
deleteButton.style.alignItems = "center";
deleteButton.innerText = "DELETE";
const cPointButton = new CSS2DObject(deleteButton);
scene.add(cPointButton.translateY(3));
//#endregion

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshNormalMaterial()
);
const cube2 = cube.clone();
const cube3 = cube.clone();
scene.add(cube, cube2.translateZ(2), cube3.translateZ(4));

//#region raycaster
const raycaster = new THREE.Raycaster();
const point = new THREE.Vector2();

function onPointerMove(event) {
    point.x = (event.clientX / window.innerWidth) * 2 - 1;
    point.y = -(event.clientY / window.innerHeight * 2) + 1;
}

document.addEventListener("mousemove", onPointerMove);
document.addEventListener("click", () => {
        raycaster.setFromCamera(point, camera);
        const intersects = raycaster.intersectObjects([cube, cube2, cube3], false);
        console.log(intersects);
        if (intersects.length > 0) {
            cPointButton.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
        }
        
});
//#endregion

// Sets a 12 by 12 gird helper
const gridHelper = new THREE.GridHelper(12, 12);
scene.add(gridHelper);

// Sets the x, y, and z axes with each having a length of 4
const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

function animate() {
    labelLRenderer.render(scene, camera);
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelLRenderer.setSize(this.window.innerWidth, this.window.innerHeight);
});