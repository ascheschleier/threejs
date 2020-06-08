import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {TrackballControls} from "three/examples/jsm/controls/TrackballControls.js";

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

//import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
//import { LuminosityShader } from 'three/examples/jsm/shaders/LuminosityShader.js';

import TWEEN from '@tweenjs/tween.js'

var camera, scene, renderer, controls, composer
var plane

var objects = []

var myMesh

//debug:
var $camX, $camY, $camZ, $cam_rotX, $cam_rotY, $cam_rotZ
$camX = $('.camX span')
$camY = $('.camY span')
$camZ = $('.camZ span')
$cam_rotX = $('.cam_rotX span')
$cam_rotY = $('.cam_rotY span')
$cam_rotZ = $('.cam_rotZ span')

// animation array:
var isAnimating = false;
var animStep = 0;
var maxSteps = 6;


var animationSteps = {
  0:{ position: {x:-7.233319575194626, y:5.722245762381603, z: -0.6444531650922332}, rotation: {x: -0.1235754167250468, y: -1.2889187567534672, z: -0.2314516520203076}, time: 2000},
  1: { position: {x:-8.42215068334131, y:5.30115278216533, z: 2.1520497384899415}, rotation: {x: -0.025593206001384806, y: -0.9316600800423, z: -0.14006812562828008}, time: 1000},
  2: { position: {x:-7.3875623750970005, y:6.078982661778451, z: 3.7431952698246196}, rotation: {x: -0.05938755831712378, y: -0.7149316781008158, z: -0.2262236204387986}, time: 3000},
  3: { position: {x:-11.945924443025081, y:5.024836683047582, z: 4.056832564404985}, rotation: {x: 0.34205179864812274, y: -0.8210728876892635, z: 0.050442485041797186}, time: 2000},
  4: { position: {x:-8.116540803810677, y:6.574187668981772, z: -0.6176315900324942}, rotation: {x: -1.594787517211319, y: -0.8381902633241617, z: -1.6030620930090589}, time: 2000},
  5: { position: {x:-308.9977499978986, y:245.12364464525552, z: -25.122473006511814}, rotation: {x: -1.6729287065864442, y: -0.8976173132203668, z: -1.701139428750363}, time: 6000}
}

/*
var animationSteps = {
  0: { position: {x:-7.746701527999115, y:6.118335513206531, z: 0.8891963353210466}, rotation: {x: -1.0569382715298072, y: -0.8671303868037963, z: -0.9335539196957623}, time: 4000},
  1: { position: {x:-5.218534045423821, y:6.131755046028607, z: -0.33115960399216937}, rotation: {x: -1.330948176135921, y: -0.9545963813936394, z: -1.2796412887375832}, time: 4000},
  2:{ position: {x:-7.818095660576597, y:7.381267271489577, z: 2.822984343714798}, rotation: {x: -1.1157076650504802, y: -0.661533455544592, z: -0.8981585651160057}, time: 4000},
  3: { position: {x:-8.96376541838562, y:8.178689497495373, z: 0.8501510067505147}, rotation: {x: -1.2055079932091397, y: -0.7800178138171386, z: -1.072723132382342}, time: 4000},
  4: { position: {x:-8.59945006752669, y:6.972798315446685, z: -1.3722715724279344}, rotation: {x: -1.781355895727783, y: -0.7674639587689779, z: -1.8694175288562234}, time: 4000},


  5: { position: {x:-92.73066973956817, y:49.04264693930035, z: 21.321595947370515}, rotation: {x: -1.204069731308676, y: -1.0040196264629095, z: -1.1435489641625387}, time: 500},
}
*/



init()


function init() {

  var loader = new GLTFLoader();

  loader.load('model/insel.glb', function (gltf) {
    myMesh = gltf
    scene.add(myMesh.scene);

  }, undefined, function (error) {

    console.error(error);

  });

  camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    1,
    10000
  )
  //camera.position.set(-9.365242993833716, 5.599999999999999, 0.48)
  //camera.rotation.set(-1, -0.9, -1)
  //camera.lookAt(0, 0, 0)
  //camera.position.set(animationSteps[0].position.x,animationSteps[0].position.y,animationSteps[0].position.z)
  //camera.rotation.set(animationSteps[0].rotation.x,animationSteps[0].rotation.y,animationSteps[0].rotation.z)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)


  //raycaster = new THREE.Raycaster()
  //mouse = new THREE.Vector2()

  var geometry = new THREE.PlaneBufferGeometry(1000, 1000)
  geometry.rotateX(-Math.PI / 2)

  plane = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({visible: false})
  )
  scene.add(plane)

  objects.push(plane)

  // lights

  var ambientLight = new THREE.AmbientLight(0x606060)
  scene.add(ambientLight)

  var directionalLight = new THREE.DirectionalLight(0xffffff)
  directionalLight.position.set(1, 0.75, 0.5).normalize()
  scene.add(directionalLight)

  renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)

  composer = new EffectComposer( renderer );


  var renderPass = new RenderPass( scene, camera );
  composer.addPass( renderPass );

  var bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.4, 0.85)
  composer.addPass( bloomPass );

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
  camera.position.set(animationSteps[0].position.x,animationSteps[0].position.y,animationSteps[0].position.z)
  camera.rotation.set(animationSteps[0].rotation.x,animationSteps[0].rotation.y,animationSteps[0].rotation.z)


  /*
  controls.minDistance = 5
  controls.maxDistance = 250
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;
  */

  //var camera.position = {x:10, y:10, z:50}
  var _target = {x: 20, y: 20, z: 50}

  $('.moveCam').on('click', function (e) {
    e.preventDefault()
    var target = new THREE.Vector3(10, -20, 20); // create on init

    if(animStep < maxSteps-1) {
      animStep++
      animateCam(animStep)
    } else {
      animStep = 0
      animateCam(animStep)
    }
  })

  $('.copy').on('click', function (e) {
    e.preventDefault()
    var copyText =
      "{ position: {x:"+ camera.position.x +", y:"+ camera.position.y +", z: "+ camera.position.z +
      "}, rotation: {x: "+ camera.rotation.x +", y: "+ camera.rotation.y +", z: "+ camera.rotation.z +
      "}, time: "+ 4000 +
      "},"
    var element = document.createElement('DIV');

    function selectElementText(element) {
      if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
      } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(element);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
      }
    }
    element.textContent = copyText;
    document.body.appendChild(element);
    selectElementText(element);
    document.execCommand('copy');
    element.remove();
  })



  document.body.appendChild(renderer.domElement)

  window.addEventListener('resize', onWindowResize, false)
  render()

  setInterval(function(){
    debug()
  },1500)

  $(window).scroll(function() {
    scrollPoints()
  })

  animateCam(0)
}

var posTween, rotTween
function animateCam(step){
  var _position = animationSteps[step].position
  var _rotation = animationSteps[step].rotation
  var _time = animationSteps[step].time
  console.log("Animating step "+ step +" to position: ", _position)

  //stop old animation if there is one
  if(posTween != undefined) posTween.stop()
  if(rotTween != undefined) rotTween.stop()

  posTween =  animateVector3(camera.position, _position, {
    duration: _time,
    easing: TWEEN.Easing.Quadratic.InOut,
    update: function (d) {
      //console.log("Updating: " + d);
    },
    callback: function () {

    }
  })
  rotTween = animateVector3(camera.rotation, _rotation, {
    duration: _time,
    easing: TWEEN.Easing.Quadratic.InOut,
    update: function (d) {
      //console.log("Updating: " + d);
    },
    callback: function () {
      console.log("Completed")
      isAnimating = false;
    }
  })
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  controls.handleResize(); // for TrackballControls

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function render() {
  // RAF
  requestAnimationFrame(render)

  //renderer.render(scene, camera)
  //controls.update()
  TWEEN.update();
  composer.render(scene, camera)
}

function debug() {

  $camX.text(camera.position.x)
  $camY.text(camera.position.y)
  $camZ.text(camera.position.z)

  $cam_rotX.text(camera.rotation.x)
  $cam_rotY.text(camera.rotation.y)
  $cam_rotZ.text(camera.rotation.z)

}


/* Animates a Vector3 to the target */
function animateVector3(vectorToAnimate, target, options) {
  options = options || {};
  // get targets from options or set to defaults
  var to = target || THREE.Vector3(),
    easing = options.easing || TWEEN.Easing.Quadratic.In,
    duration = options.duration || 2000;
  // create the tween
  var tweenVector3 = new TWEEN.Tween(vectorToAnimate)
    .to({x: to.x, y: to.y, z: to.z,}, duration)
    .easing(easing)
    .onUpdate(function (d) {
      if (options.update) {
        options.update(d);
      }
    })
    .onComplete(function () {
      if (options.callback) options.callback();
    });
  // start the tween
  tweenVector3.start();
  // return the tween in case we want to manipulate it later on
  return tweenVector3;
}


function scrollPoints(){
  var $animElement = $('.setFrame');

  $animElement.each(function(){
    var $this = $(this);
    if($this.isOnScreen()){
      var _step = $this.data('frame')
      _step--
      console.log("element with animStep scrolled into view with animStep = "+_step)
      if(animStep != _step && !isAnimating) {
        isAnimating = true
        animStep = _step
        animateCam(animStep)
      }

    }
  })

}


function isElementInViewport(el) {
  var rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document. documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document. documentElement.clientWidth)
  );
}

function isAnyPartOfElementInViewport(el) {

  const rect = el.getBoundingClientRect();
  // DOMRect { x: 8, y: 8, width: 100, height: 100, top: 8, right: 108, bottom: 108, left: 8 }
  const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
  const windowWidth = (window.innerWidth || document.documentElement.clientWidth);

  // http://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
  const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
  const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

  return (vertInView && horInView);
}

$.fn.isOnScreen = function(){

  var win = $(window);

  var viewport = {
    top : win.scrollTop(),
    left : win.scrollLeft()
  };
  viewport.right = viewport.left + win.width();
  viewport.bottom = viewport.top + win.height();

  var bounds = this.offset();
  bounds.right = bounds.left + this.outerWidth();
  bounds.bottom = bounds.top + this.outerHeight();

  return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));

};
