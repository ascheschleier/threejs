import * as THREE from 'three';

import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LightProbeGenerator } from 'three/examples/jsm/lights/LightProbeGenerator.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'

let mesh, renderer, scene, camera, gltf, mixer;

let gui;
const radius = 100;
let theta = 0;
let lightProbe;
let directionalLight;

var mat;
var geo;

let touching = false;

//var textureLoader= new THREE.TextureLoader();
//var texture = textureLoader.load("model/textur.jpg");
//texture.flipY = false;

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
  
    gtflLoader.load('model/stein_comp3.glb', loadDone, undefined,  function (error) {
  
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
    camera.position.set( 0, 0, 170 );


    //test
    /*
    var GEO_Suelo_OP = new THREE.SphereGeometry( 5, 32, 32 );
    var MAT_Suelo_OP = new THREE.MeshStandardMaterial( { map: new THREE.TextureLoader( ).load( 'model/test_textur.png' ), transparent: true, opacity: 1, roughness: 0.4, side: THREE.DoubleSide } );
    var MSH_Suelo_OP = new THREE.Mesh( GEO_Suelo_OP, MAT_Suelo_OP );
    MSH_Suelo_OP.rotation.x = 267.545;
    MSH_Suelo_OP.position.y = 20.47;
    MSH_Suelo_OP.receiveShadow = true;
    scene.add(MSH_Suelo_OP);
    */

    //model
    gltf.scene.scale.set(2, 2, 2);
    gltf.scene.rotation.z = .3;
    gltf.scene.rotation.y = .2;
    /*
    gltf.scene.traverse( function( object ) 
    {            
        if ((object instanceof THREE.Mesh))
        { 
                
                var MAT_Suelo_OP = new THREE.MeshStandardMaterial( { map: new THREE.TextureLoader( ).load( 'model/test_textur.png' ), transparent: false, opacity: 1, roughness: 0.4, side: THREE.DoubleSide } );
                
                //mat = object.material;
                //geo = object.geometry;
                //mat.map = texture;
                //mat.map.repeat.set(1,1);

                //geo.computeVertexNormals();
                
                object.material = MAT_Suelo_OP;
                
        }
    });
    */
    scene.add(gltf.scene);
    
    var animations = gltf.animations;
    mixer = new THREE.AnimationMixer(gltf.scene);
    //mixer.clipAction(animations[0]).play();
    
    // controls
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );
    controls.minDistance = 10;
    controls.maxDistance = 300;
    controls.enablePan = false;

    // probe
    //lightProbe = new THREE.LightProbe();
    //scene.add( lightProbe );

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

   

    // gui
    /*
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

    */
    // listener
    window.addEventListener( 'resize', onWindowResize );

    window.addEventListener('mousedown', (event) => {
        touching = true;
    });

    window.addEventListener('mouseup', (event) => {
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
    mixer.update(clock.getDelta());    
    if(!touching) {
        theta += 0.1;
        scene.rotation.y += 0.005;
    }
    
    /*
    camera.position.x = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
    camera.position.y = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
    camera.position.z = radius * Math.cos( THREE.MathUtils.degToRad( theta ) );
    camera.lookAt( scene.position );
    */

    camera.updateMatrixWorld();



    //mixer.update(clock.getDelta());   
    renderer.render( scene, camera );

}

function animate() {
    requestAnimationFrame( animate, renderer.domElement );
    render();
}