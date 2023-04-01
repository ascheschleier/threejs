import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'

//let path_to_glb = $('#path_to_glb').data('glb');
let path_to_glb = document.getElementById('path_to_glb').getAttribute('glb')
console.log(path_to_glb);
let renderer, scene, camera, gltf, mixer;

let directionalLight;
let touching = false;
let theta = 0;



/********************************/
/*      Loader Promise          */
/********************************/

var loaderPromise = new Promise(function(resolve, reject) {
    var gtflLoader = new GLTFLoader();
    function loadDone(x) {
      console.log("loader successfully completed loading GLB");
      resolve(x); // it went ok!
    }
  
    gtflLoader.load(path_to_glb, loadDone, undefined,  function (error) {
  
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
    let container = document.getElementById('threedee');
    //let canvas_width = container.getBoundingClientRect().width;
    //let canvas_height = container.getBoundingClientRect().height;
    //console.log("width = "+canvas_width+" height = "+canvas_height);

    // renderer
    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    //renderer.setSize( canvas_width, canvas_height );
    container.appendChild( renderer.domElement );

    // tone mapping
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // scene
    scene = new THREE.Scene();



    // camera
    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 500 );
    camera.position.set( 0, 0, 170 );

    //model
    gltf.scene.scale.set(1.5, 1.5, 1.5);
    gltf.scene.rotation.z = .3;
    gltf.scene.rotation.y = -.2;
    scene.add(gltf.scene);
       
    // controls
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );
    controls.minDistance = 10;
    controls.maxDistance = 300;
    controls.enablePan = false;

    // light
    //var ambientLight = new THREE.AmbientLight(0x606060 , API.ambientLightIntensity);
    var ambientLight = new THREE.AmbientLight(0x606060 , .5);
    scene.add(ambientLight)

    //directionalLight = new THREE.DirectionalLight( 0xffffff, API.directionalLightIntensity );
    directionalLight = new THREE.DirectionalLight( 0xffffff, 1);
    directionalLight.position.set( 100, 50, 50 );
    scene.add( directionalLight );

    directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set( 100, 0, 200 );
    scene.add( directionalLight );

    directionalLight = new THREE.DirectionalLight( 0xffffff, .51);
    directionalLight.position.set( 110, 0, -100 );
    scene.add( directionalLight );

    directionalLight = new THREE.DirectionalLight( 0xffffff, .1);
    directionalLight.position.set( 100, -50, -100 );
    scene.add( directionalLight );

    // listener
    window.addEventListener( 'resize', onWindowResize );

    window.addEventListener('mousedown', (event) => {
        touching = true;
    });

    window.addEventListener('touchstart', (event) => {
        touching = true;
    });

    window.addEventListener('mouseup', (event) => {
        touching = false;
    });

    window.addEventListener('touchend', (event) => {
        touching = false;
    });

}

function onWindowResize() {

    renderer.setSize( window.innerWidth, window.innerHeight );

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    render();

}

const clock = new THREE.Clock();

function render() {    
    if(!touching) {
        theta += 0.1;
        scene.rotation.y += 0.005;
    }
    camera.updateMatrixWorld();
    renderer.render( scene, camera );
}

function animate() {
    requestAnimationFrame( animate, renderer.domElement );
    render();
}