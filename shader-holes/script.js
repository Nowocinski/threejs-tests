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

// Ambient light
const ambientLight = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add(ambientLight);

function createCube() {
    const vertexShader = `
    #define STANDARD
    varying vec3 vViewPosition;
    #ifdef USE_TRANSMISSION
        varying vec3 vWorldPosition;
    #endif
    #include <common>
    #include <uv_pars_vertex>
    #include <displacementmap_pars_vertex>
    #include <color_pars_vertex>
    #include <fog_pars_vertex>
    #include <normal_pars_vertex>
    #include <morphtarget_pars_vertex>
    #include <skinning_pars_vertex>
    #include <shadowmap_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    #include <clipping_planes_pars_vertex>
    varying vec3 vPosition;
    void main() {
        #include <uv_vertex>
        #include <color_vertex>
        #include <morphcolor_vertex>
        #include <beginnormal_vertex>
        #include <morphnormal_vertex>
        #include <skinbase_vertex>
        #include <skinnormal_vertex>
        #include <defaultnormal_vertex>
        #include <normal_vertex>
        #include <begin_vertex>
        #include <morphtarget_vertex>
        #include <skinning_vertex>
        #include <displacementmap_vertex>
        #include <project_vertex>
        #include <logdepthbuf_vertex>
        #include <clipping_planes_vertex>
        vViewPosition = - mvPosition.xyz;
        #include <worldpos_vertex>
        #include <shadowmap_vertex>
        #include <fog_vertex>
    #ifdef USE_TRANSMISSION
        vWorldPosition = worldPosition.xyz;
    #endif
        vPosition = position;
    }`;

    const fragmentShader =
        (holes) => `
    #define STANDARD
    #ifdef PHYSICAL
        #define IOR
        #define USE_SPECULAR
    #endif
    uniform vec3 diffuse;
    uniform vec3 emissive;
    uniform float roughness;
    uniform float metalness;
    uniform float opacity;
    #ifdef IOR
        uniform float ior;
    #endif
    #ifdef USE_SPECULAR
        uniform float specularIntensity;
        uniform vec3 specularColor;
        #ifdef USE_SPECULAR_COLORMAP
            uniform sampler2D specularColorMap;
        #endif
        #ifdef USE_SPECULAR_INTENSITYMAP
            uniform sampler2D specularIntensityMap;
        #endif
    #endif
    #ifdef USE_CLEARCOAT
        uniform float clearcoat;
        uniform float clearcoatRoughness;
    #endif
    #ifdef USE_IRIDESCENCE
        uniform float iridescence;
        uniform float iridescenceIOR;
        uniform float iridescenceThicknessMinimum;
        uniform float iridescenceThicknessMaximum;
    #endif
    #ifdef USE_SHEEN
        uniform vec3 sheenColor;
        uniform float sheenRoughness;
        #ifdef USE_SHEEN_COLORMAP
            uniform sampler2D sheenColorMap;
        #endif
        #ifdef USE_SHEEN_ROUGHNESSMAP
            uniform sampler2D sheenRoughnessMap;
        #endif
    #endif
    varying vec3 vViewPosition;
    #include <common>
    #include <packing>
    #include <dithering_pars_fragment>
    #include <color_pars_fragment>
    #include <uv_pars_fragment>
    #include <map_pars_fragment>
    #include <alphamap_pars_fragment>
    #include <alphatest_pars_fragment>
    #include <aomap_pars_fragment>
    #include <lightmap_pars_fragment>
    #include <emissivemap_pars_fragment>
    #include <iridescence_fragment>
    #include <cube_uv_reflection_fragment>
    #include <envmap_common_pars_fragment>
    #include <envmap_physical_pars_fragment>
    #include <fog_pars_fragment>
    #include <lights_pars_begin>
    #include <normal_pars_fragment>
    #include <lights_physical_pars_fragment>
    #include <transmission_pars_fragment>
    #include <shadowmap_pars_fragment>
    #include <bumpmap_pars_fragment>
    #include <normalmap_pars_fragment>
    #include <clearcoat_pars_fragment>
    #include <iridescence_pars_fragment>
    #include <roughnessmap_pars_fragment>
    #include <metalnessmap_pars_fragment>
    #include <logdepthbuf_pars_fragment>
    #include <clipping_planes_pars_fragment>
    varying vec3 vPosition;
    ${holes > 0
        ? `const int ARRAY_SIZE = ${holes};
        uniform vec4 uHoles[ARRAY_SIZE];`
        : ""}

    void main() {
        ${holes > 0
        ? `for(int i=0; i<ARRAY_SIZE; ++i)
            {
                if (vPosition.y > 52)
                {
                    discard;
                }
            }`
        : ""}

        #include <clipping_planes_fragment>
        vec4 diffuseColor = vec4( diffuse, opacity );
        ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
        vec3 totalEmissiveRadiance = emissive;
        #include <logdepthbuf_fragment>
        #include <map_fragment>
        #include <color_fragment>
        #include <alphamap_fragment>
        #include <alphatest_fragment>
        #include <roughnessmap_fragment>
        #include <metalnessmap_fragment>
        #include <normal_fragment_begin>
        #include <normal_fragment_maps>
        #include <clearcoat_normal_fragment_begin>
        #include <clearcoat_normal_fragment_maps>
        #include <emissivemap_fragment>
        #include <lights_physical_fragment>
        #include <lights_fragment_begin>
        #include <lights_fragment_maps>
        #include <lights_fragment_end>
        #include <aomap_fragment>
        vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
        vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
        #include <transmission_fragment>
        vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
        #ifdef USE_SHEEN
            float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
            outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecular;
        #endif
        #ifdef USE_CLEARCOAT
            float dotNVcc = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );
            vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
            outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + clearcoatSpecular * material.clearcoat;
        #endif
        #include <opaque_fragment>
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
        #include <premultiplied_alpha_fragment>
        #include <dithering_fragment
    }`;

    const updateWallShader = (
        standardMaterial, holes) => {
        console.log("updateWallShader", standardMaterial);
        standardMaterial.needsUpdate = true;
        standardMaterial.customProgramCacheKey = () => Math.floor(Math.random() * 99999).toString();
        standardMaterial.onBeforeCompile = (shader) => {
            console.log('onBeforeCompile');
            shader.uniforms["uHoles"] = { value: holes };
    
            shader.vertexShader = vertexShader;
            shader.fragmentShader = fragmentShader(1);
        };
        // standardMaterial.needsUpdate = true;
        // standardMaterial.customProgramCacheKey = () => Math.floor(Math.random() * 99999).toString();
    }
    
    const material = new THREE.MeshStandardMaterial({
        color: 0xff0000
    });
    // updateWallShader(material, [
    //     new THREE.Vector4(0, 0, 0, 0)
    // ]);
    
    // ================================================================
    
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(),
        material
    );
    scene.add(box);
    console.log(scene);
}
createCube();

function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});