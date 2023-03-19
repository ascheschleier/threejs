import * as THREE from 'three';

import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';

import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

import { CinematicCamera } from 'three/examples/jsm/cameras/CinematicCamera.js';

let camera, scene, renderer, stats, controls;

const mouse = new THREE.Vector2();
const radius = 100;
let theta = 0;
var gltf, mixer;
var lights;

/********************************/
/*      Loader Promise          */
/********************************/

var loaderPromise = new Promise(function(resolve, reject) {
    var gtflLoader = new GLTFLoader();
    function loadDone(x) {
      console.log("loader successfully completed loading GLB");
      resolve(x); // it went ok!
    }
  
    gtflLoader.load('model/Martion.glb', loadDone, undefined,  function (error) {
  
      console.error(error);
  
    });
  });
  
  loaderPromise.
  then(function(promise) {
    gltf = promise
    init(); //initialize the render
    animate();
    //requestAnimationFrame( render );
  }, function(err) {
    console.log(err);
  });
  

  

function init() {
    camera = new CinematicCamera( 60, window.innerWidth / window.innerHeight, .1, 500 );
    camera.setLens( 5 );
    camera.position.set( 2, 1, 1 );

    scene = new THREE.Scene();
    //scene.background = new THREE.Color( 0xf0f0f0 );
    
    scene.add( new THREE.AmbientLight( 0xffffff, .3) );
    const light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 1, 1, 1 ).normalize();
    scene.add( light );
    var directionalLight = new THREE.DirectionalLight(0xffffff , .5)
    directionalLight.position.set(2, 2, 2).normalize()
    scene.add(directionalLight);
    
    var directionalLight2 = new THREE.DirectionalLight(0xffffff , .5)
    directionalLight2.position.set(-2, -1, 1).normalize()
    scene.add(directionalLight2);

    const dirLight = new THREE.DirectionalLight( 0xffffff , .5);
    dirLight.position.set( 3, 10, 10 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = - 2;
    dirLight.shadow.camera.left = - 2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add( dirLight );

    console.log(gltf)
    //gltf.scene.scale.set(50, 50, 50);
    scene.add(gltf.scene);
 
    var animations = gltf.animations;

    mixer = new THREE.AnimationMixer(gltf.scene);
    //var NumberOfAnimations = animations.length;

    console.log("animation: ", animations)
    mixer.clipAction(animations[0]).play();
   
    /*
    for (var i = 0; i < NumberOfAnimations; i++) {
        mixer.clipAction(animations[i]).play();
    }
    */
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    stats = new Stats();
    document.body.appendChild( stats.dom );

    /********************************/
    /*      Control                 */
    /********************************/

    controls = new OrbitControls(camera, renderer.domElement)
    //controls = new TrackballControls(camera, renderer.domElement)

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    //controls.keys = [ 65, 83, 68 ];
    controls.keys = {
        LEFT: 37, //left arrow
        UP: 38, // up arrow
        RIGHT: 39, // right arrow
        BOTTOM: 40 // down arrow
    }


    //document.addEventListener( 'mousemove', onDocumentMouseMove );

    window.addEventListener( 'resize', onWindowResize );

    const effectController = {

        focalLength: 12.35,
        // jsDepthCalculation: true,
        // shaderFocus: false,
        //
        fstop: 13,
        // maxblur: 1.0,
        //
        showFocus: false,
        focalDepth: 19.3,
        // manualdof: false,
        // vignetting: false,
        // depthblur: false,
        //
        // threshold: 0.5,
        // gain: 2.0,
        // bias: 0.5,
        // fringe: 0.7,
        //
        // focalLength: 35,
        // noise: true,
        // pentagon: false,
        //
        // dithering: 0.0001

    };

    const matChanger = function ( ) {

        for ( const e in effectController ) {

            if ( e in camera.postprocessing.bokeh_uniforms ) {

                camera.postprocessing.bokeh_uniforms[ e ].value = effectController[ e ];

            }

        }

        camera.postprocessing.bokeh_uniforms[ 'znear' ].value = camera.near;
        camera.postprocessing.bokeh_uniforms[ 'zfar' ].value = camera.far;
        camera.setLens( effectController.focalLength, camera.frameHeight, effectController.fstop, camera.coc );
        effectController[ 'focalDepth' ] = camera.postprocessing.bokeh_uniforms[ 'focalDepth' ].value;

    };

    //

    
    const gui = new GUI();

    gui.add( effectController, 'focalLength', 1, 135, 0.01 ).onChange( matChanger );
    gui.add( effectController, 'fstop', 1.8, 22, 0.01 ).onChange( matChanger );
    gui.add( effectController, 'focalDepth', 0.1, 100, 0.001 ).onChange( matChanger );
    gui.add( effectController, 'showFocus', true ).onChange( matChanger );
    
    matChanger();
    
    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function animate() {
    requestAnimationFrame( animate, renderer.domElement );
    render();
    stats.update();
}

const clock = new THREE.Clock();

function render() {
    mixer.update(clock.getDelta());    
    theta += 0.1;
    /*
    camera.position.x = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
    camera.position.y = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
    camera.position.z = radius * Math.cos( THREE.MathUtils.degToRad( theta ) );
    camera.lookAt( scene.position );
    */

    camera.updateMatrixWorld();
    if ( camera.postprocessing.enabled ) {

        camera.renderCinematic( scene, renderer );

    } else {

        scene.overrideMaterial = null;

        renderer.clear();
        renderer.render( scene, camera );

    }
}