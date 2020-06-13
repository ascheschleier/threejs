import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'

import Stats from 'three/examples/jsm/libs/stats.module.js';

import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

var params = {
  envMap: 'EXR',
  roughness: 0.0,
  metalness: 0.0,
  exposure: 1.0,
  debug: false,
};

var container, stats;
var camera, scene, renderer, controls;
var torusMesh, planeMesh;
var pngCubeRenderTarget, exrCubeRenderTarget;
var pngBackground, exrBackground;

init();
animate();

function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set( 0, 0, 120 );

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer();



  var geometry = new THREE.TorusKnotBufferGeometry( 18, 8, 150, 20 );
  var material = new THREE.MeshStandardMaterial( {
    metalness: params.roughness,
    roughness: params.metalness,
    envMapIntensity: 1.0
  } );

  torusMesh = new THREE.Mesh( geometry, material );
  scene.add( torusMesh );

  var geometry = new THREE.PlaneBufferGeometry( 200, 200 );
  var material = new THREE.MeshBasicMaterial();

  planeMesh = new THREE.Mesh( geometry, material );
  planeMesh.position.y = - 50;
  planeMesh.rotation.x = - Math.PI * 0.5;
  scene.add( planeMesh );

  THREE.DefaultLoadingManager.onLoad = function ( ) {

    pmremGenerator.dispose();

  };

  new EXRLoader()
    .setDataType( THREE.UnsignedByteType )
    .load( 'textures/GCanyon_C_YumaPoint_3k.exr', function ( texture ) {

      exrCubeRenderTarget = pmremGenerator.fromEquirectangular( texture );
      exrBackground = exrCubeRenderTarget.texture;

      texture.dispose();

    } );

  new THREE.TextureLoader().load( 'textures/equirectangular.png', function ( texture ) {

    texture.encoding = THREE.sRGBEncoding;

    pngCubeRenderTarget = pmremGenerator.fromEquirectangular( texture );

    pngBackground = pngCubeRenderTarget.texture;

    texture.dispose();

  } );

  var pmremGenerator = new THREE.PMREMGenerator( renderer );
  pmremGenerator.compileEquirectangularShader();

  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  container.appendChild( renderer.domElement );

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputEncoding = THREE.sRGBEncoding;

  stats = new Stats();
  container.appendChild( stats.dom );

  controls = new OrbitControls( camera, renderer.domElement );
  controls.minDistance = 50;
  controls.maxDistance = 300;

  window.addEventListener( 'resize', onWindowResize, false );

  var gui = new GUI();

  gui.add( params, 'envMap', [ 'EXR', 'PNG' ] );
  gui.add( params, 'roughness', 0, 1, 0.01 );
  gui.add( params, 'metalness', 0, 1, 0.01 );
  gui.add( params, 'exposure', 0, 2, 0.01 );
  gui.add( params, 'debug', false );
  gui.open();

}

function onWindowResize() {

  var width = window.innerWidth;
  var height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize( width, height );

}

function animate() {

  requestAnimationFrame( animate );

  stats.begin();
  render();
  stats.end();

}

function render() {

  torusMesh.material.roughness = params.roughness;
  torusMesh.material.metalness = params.metalness;

  var newEnvMap = torusMesh.material.envMap;
  var background = scene.background;

  switch ( params.envMap ) {

    case 'EXR':
      newEnvMap = exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;
      background = exrBackground;
      break;
    case 'PNG':
      newEnvMap = pngCubeRenderTarget ? pngCubeRenderTarget.texture : null;
      background = pngBackground;
      break;

  }

  if ( newEnvMap !== torusMesh.material.envMap ) {

    torusMesh.material.envMap = newEnvMap;
    torusMesh.material.needsUpdate = true;

    planeMesh.material.map = newEnvMap;
    planeMesh.material.needsUpdate = true;

  }

  torusMesh.rotation.y += 0.005;
  planeMesh.visible = params.debug;

  scene.background = background;
  renderer.toneMappingExposure = params.exposure;

  renderer.render( scene, camera );

}

		