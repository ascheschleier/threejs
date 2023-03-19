import * as THREE from 'three';

import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LightProbeGenerator } from 'three/examples/jsm/lights/LightProbeGenerator.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'

let mesh, renderer, scene, camera, gltf, mixer;

let gui;

let lightProbe;
let directionalLight;

// linear color space
const API = {
    lightProbeIntensity: 1,
    directionalLightIntensity: 1,
    ambientLightIntensity: .8
};


/********************************/
/*      Loader Promise          */
/********************************/

var loaderPromise = new Promise(function(resolve, reject) {
    var gtflLoader = new GLTFLoader();
    function loadDone(x) {
      console.log("loader successfully completed loading GLB");
      resolve(x); // it went ok!
    }
  
    gtflLoader.load('model/lapp3.glb', loadDone, undefined,  function (error) {
  
      console.error(error);
  
    });
  });
  
  loaderPromise.
  then(function(promise) {
    gltf = promise
    console.log(gltf)
    init(); //initialize the render
    animate();
    //requestAnimationFrame( render );
  }, function(err) {
    console.log(err);
  });


function init() {

    // renderer
    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    // tone mapping
    renderer.toneMapping = THREE.NoToneMapping;

    renderer.outputEncoding = THREE.sRGBEncoding;

    // scene
    scene = new THREE.Scene();


    // camera
    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 500 );
    camera.position.set( 0, 0, 70 );

    //model
    //gltf.scene.scale.set(5, 5, 5);
    scene.add(gltf.scene);
    var animations = gltf.animations;
    mixer = new THREE.AnimationMixer(gltf.scene);
    mixer.clipAction(animations[0]).play();

    // controls
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );
    controls.minDistance = 10;
    controls.maxDistance = 300;
    controls.enablePan = false;

    // probe
    lightProbe = new THREE.LightProbe();
    scene.add( lightProbe );

    // light
    var ambientLight = new THREE.AmbientLight(0x606060 , API.ambientLightIntensity);
    scene.add(ambientLight)

    directionalLight = new THREE.DirectionalLight( 0xffffff, API.directionalLightIntensity );
    directionalLight.position.set( 10, 10, 10 );
    scene.add( directionalLight );

    // envmap
    const genCubeUrls = function ( prefix, postfix ) {

        return [
            prefix + 'px' + postfix, prefix + 'nx' + postfix,
            prefix + 'py' + postfix, prefix + 'ny' + postfix,
            prefix + 'pz' + postfix, prefix + 'nz' + postfix
        ];

    };

    const urls = genCubeUrls( 'textures/', '.png' );


    new THREE.CubeTextureLoader().load( urls, function ( cubeTexture ) {

        cubeTexture.encoding = THREE.sRGBEncoding;
        //scene.background = cubeTexture;
        lightProbe.copy( LightProbeGenerator.fromCubeTexture( cubeTexture ) );
        render();       
    } );

   

    // gui
    gui = new GUI( { title: 'Intensity' } );

    gui.add( API, 'lightProbeIntensity', 0, 1, 0.02 )
        .name( 'light probe' )
        .onChange( function () {

            lightProbe.intensity = API.lightProbeIntensity; render();

        } );

    gui.add( API, 'directionalLightIntensity', 0, 1, 0.02 )
        .name( 'directional light' )
        .onChange( function () {

            directionalLight.intensity = API.directionalLightIntensity; render();

        } );

    gui.add( API, 'ambientLightIntensity', 0, 1, 0.02 )
        .name( 'ambient Light' )
        .onChange( function () {

            ambientLight.intensity = API.ambientLightIntensity; render();

        } );

    // listener
    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    renderer.setSize( window.innerWidth, window.innerHeight );

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    render();

}

const clock = new THREE.Clock();

function render() {
    mixer.update(clock.getDelta());   
    renderer.render( scene, camera );

}

function animate() {
    requestAnimationFrame( animate, renderer.domElement );
    render();
}