import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import {
    AxesHelper, BoxGeometry,
    DoubleSide,
    GridHelper,
    Group,
    Mesh,
    MeshBasicMaterial, MeshNormalMaterial, OrthographicCamera,
    PerspectiveCamera,
    Scene, ShapeGeometry,
    WebGLRenderer
} from "three";

const renderer = new WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets the color of the background
renderer.setClearColor(0xFEFEFE);

const scene = new Scene();
const camera = new PerspectiveCamera/*OrthographicCamera*/(
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
const gridHelper = new GridHelper(12, 12);
scene.add(gridHelper);

// Sets the x, y, and z axes with each having a length of 4
const axesHelper = new AxesHelper(4);
scene.add(axesHelper);

function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// Przykładowy ciąg znaków SVG
const svgString = `
  <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
    <rect x="10" y="10" width="80" height="80" fill="blue" />
    <circle cx="50" cy="50" r="30" fill="red" />
  </svg>
`;

// Utwórz instancję SVGLoader
const loader = new SVGLoader();

// Parsowanie danych SVG ze stringa
const svgData = loader.parse(svgString);

// Konwertuj ścieżki SVG na kształty
const shapes = svgData.paths.map((path) => path.toShapes(true));

// Tworzenie geometrii z kształtów
const geometry = new ShapeGeometry(shapes.flat());

// Utworzenie materiału
const material = new MeshBasicMaterial({ color: 0xff0000 }); // Ustawienie koloru na czerwony (możesz zmienić)

// Utworzenie siatki z geometrii i materiału
const mesh = new Mesh(geometry, material);

// Dodanie siatki do sceny
scene.add(mesh);
