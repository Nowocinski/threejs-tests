import * as THREE from 'three';

// init

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
camera.position.z = 3;

const scene = new THREE.Scene();

const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshNormalMaterial({
    wireframe: true
});

// modify into x^4 + y^4 = 1 https://en.wikipedia.org/wiki/Squircle
const p = geometry.attributes.position;
for (let i = 1; i < p.count; i++) {
    let x = p.array[3 * i],
        y = p.array[3 * i + 1],
        z = p.array[3 * i + 2],
        e;
    // sorry I can't be bothered with the math today, so fuck this shit
    do {
        e = x ** 4 + y ** 4 + z ** 4 - 1;
        if (e > 0) {
            x *= 0.9999;
            y *= 0.9999;
            z *= 0.9999;
        } else {
            x *= 1.0001;
            y *= 1.0001;
            z *= 1.0001;
        }
    } while (Math.abs(e) > .001);
    p.array[3 * i] = x;
    p.array[3 * i + 1] = y;
    p.array[3 * i + 2] = z;
}


const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animation);
document.body.appendChild(renderer.domElement);

// animation

function animation(time) {

    mesh.rotation.x = time / 2000;
    mesh.rotation.y = time / 1000;

    renderer.render(scene, camera);

}
