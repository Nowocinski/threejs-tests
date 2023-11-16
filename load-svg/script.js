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

const loader = new SVGLoader();
loader.loadAsync("testowy2.svg")
    .then(
        (data) => {
        const paths = data.paths;
        const group = new Group();
        for ( let i = 0; i < paths.length; i ++ ) {
            const path = paths[ i ];
            const material = new MeshBasicMaterial( {
                color: path.color,
                side: DoubleSide,
                depthWrite: false
            } );
    
            const shapes = SVGLoader.createShapes( path );
    
            for ( let j = 0; j < shapes.length; j ++ ) {
    
                const shape = shapes[ j ];
                const geometry = new ShapeGeometry( shape );
                const mesh = new Mesh( geometry, material );
                group.add( mesh );
    
            }
        }
        console.log(group);
        scene.add(group);
    })
    .catch((error) => {
        console.error('Błąd ładowania pliku SVG:', error);
    });
// scene.add(new Mesh(new BoxGeometry(1, 1, 1), new MeshNormalMaterial()));