import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

import * as ScrollMagic from "scrollmagic"; // Or use scrollmagic-with-ssr to avoid server rendering problems
import 'imports-loader?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators'
import { TweenMax, TimelineMax, TweenLite } from "gsap"; // Also works with TweenLite and TimelineLite
import { ScrollMagicPluginGsap } from "scrollmagic-plugin-gsap";

ScrollMagicPluginGsap(ScrollMagic, TweenMax, TimelineMax);


import TWEEN from '@tweenjs/tween.js'


/********************************/
/*      Variables          ******/
/********************************/


var camera, scene, renderer, controls, composer, glbCamera, mixer, clock
var plane

var objects = []

var cube, gltf

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
var animStep = 1;

var animationSteps = {
  0: { position: {x:15.402419031730028, y:0.8644392379961215, z: 6.91182062569953}, rotation: {x: -0.1418727215609679, y: 1.2732181882233577, z: 0.1357153308110989}, time: 2000},
  1: { position: {x:15.295914956368039, y:0.7465254730224472, z: 7.289310603688933}, rotation: {x: -0.07198703254004861, y: 0.9553206385991876, z: 0.05881117617610776}, time: 2000},
  2:{ position: {x:14.904069166462264, y:1.3076345502176714, z: 8.226362310435158}, rotation: {x: -0.10876314205771008, y: 0.7045975732808462, z: 0.07061038025150695}, time: 2000},
  3:{ position: {x:4.725241209623325, y:0.7985089083807053, z: 8.995521316024004}, rotation: {x: -0.09223815738734413, y: 0.4873675118995367, z: 0.04329112396070809}, time: 4000},
  4: { position: {x:3.9030383054489004, y:2.573311636082828, z: 12.54121086132899}, rotation: {x: -0.20237944136598865, y: 0.2959144836273942, z: 0.05976471233272036}, time: 3000},
  5: { position: {x:3.7618429695199187, y:0.8752596469082694, z: 10.987039797831278}, rotation: {x: -0.0720431887135113, y: 0.11017487926187171, z: 0.007934867846646643}, time: 1000},
}
  
var maxSteps = Object.keys(animationSteps).length
//console.log("animatiuon length = " + maxSteps)

var directionalLight, light

/********************************/
/*      Loader Promise          */
/********************************/

var loaderPromise = new Promise(function(resolve, reject) {
  var gtflLoader = new GLTFLoader();
  function loadDone(x) {
    console.log("loader successfully completed loading GLB");
    resolve(x); // it went ok!
  }

  gtflLoader.load('model/landscape.glb', loadDone, undefined,  function (error) {

    console.error(error);

  });
});

loaderPromise.
then(function(promise) {
  gltf = promise
  init(); //initialize the render
  //requestAnimationFrame( render );
}, function(err) {
  console.log(err);
});


/********************************/
/*      INIT function           */
/********************************/

function init() {

  scene = new THREE.Scene()
  //scene.background = new THREE.Color(0x000000)

  /********************************/
  /*      GBL Loader              */
  /********************************/

  //load scene and set some settings for different meshes
  gltf.scene.traverse(function (child) {
    if (child.isMesh) {
      //child.castShadow = true; //default is false
      //child.receiveShadow = true; //default
      switch (child.name) {

        case 'Water':
          child.castShadow = false; //default is false
          child.receiveShadow = true; //default
          child.material.opacity = 0.7
          break;
      }
      objects.push(child)
    }

    //doesnt seem to work, light are children of point3D meshes
    /*
    if (child.lights && child.lights.length) {
      console.log("Light "+ i +  " : ", child.lights)
      for (i = 0; i < child.lights.length; i++) {
        var lamp = child.lights[i];
        console.log("Light "+ i +  " : ", lamp)
        scene.add(lamp);
      }
    }
     */
  })
  console.log(gltf)

  //gblModel.scene.scale.set(10,10,10)
  scene.add(gltf.scene);

  //import cam from glb file
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 10000);
  camera.position.set(animationSteps[0].position.x,animationSteps[0].position.y,animationSteps[0].position.z)
  camera.rotation.set(animationSteps[0].rotation.x,animationSteps[0].rotation.y,animationSteps[0].rotation.z)


  /*
  glbCamera = gltf.cameras[0]
  var blenderCamera = glbCamera
  camera.position.x = blenderCamera.parent.position.x;
  camera.position.y = blenderCamera.parent.position.y;
  camera.position.z = blenderCamera.parent.position.z;

  //amera.aspect = blenderCamera.aspect;
  camera.fov = blenderCamera.fov;
  camera.far = blenderCamera.far;
  camera.near = blenderCamera.near;
  */
  var animations = gltf.animations;

  mixer = new THREE.AnimationMixer(gltf.scene);
  var NumberOfAnimations = animations.length;

  console.log("animation: ", animations)

  for (var i = 0; i < NumberOfAnimations; i++) {
    mixer.clipAction(animations[i]).play();
  }

  /********************************/
  /*      Light                   */
  /********************************/

  var ambientLight = new THREE.AmbientLight(0x606060)
  //scene.add(ambientLight)
  /*
  directionalLight = new THREE.DirectionalLight(0xffffff , 1)
  //directionalLight.position.set(110.6, -140.6, 110.0).normalize()
  directionalLight.position.set(lightOptions.position.x, lightOptions.position.y, lightOptions.position.z).normalize()
  directionalLight.rotation.set(lightOptions.rotation.x, lightOptions.rotation.y, lightOptions.rotation.z)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  //Set up shadow properties for the light

  directionalLight.shadow.mapSize.width = 512;  // default
  directionalLight.shadow.mapSize.height = 512; // default
  directionalLight.shadow.camera.near = 0.5;    // default
  directionalLight.shadow.camera.far = 500;     // default


  light = new THREE.PointLight( 0xffd0b9, 1, 0, 2 );
  light.position.set(lightOptions.position.x, lightOptions.position.y, lightOptions.position.z);
  light.castShadow = true;            // default false
  scene.add( light );

  //Set up shadow properties for the light
  light.shadow.mapSize.width = 4096;  // default
  light.shadow.mapSize.height = 4096; // default
  light.shadow.camera.near = 0.5;       // default
  light.shadow.camera.far = 500      // default

  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
  cube = new THREE.Mesh(geometry, material);
  cube.position.set(lightOptions.position.x, lightOptions.position.y, lightOptions.position.z);

   */
  //scene.add( cube );


  /********************************/
  /*      Renderer                */
  /********************************/

  //renderer = new THREE.WebGLRenderer({antialias: true})
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

  //Create a helper for the shadow camera (optional)
  //var helper = new THREE.CameraHelper( light.shadow.camera );
  //scene.add( helper )

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputEncoding = THREE.sRGBEncoding;

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

  /*
  controls.minDistance = 5
  controls.maxDistance = 250
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;
  */

  //var camera.position = {x:10, y:10, z:50}
  //var _target = {x: 20, y: 20, z: 50}




  /********************************/
  /*      Events & Listners       */
  /********************************/

  $('.moveCam').on('click', function (e) {
    e.preventDefault()

    if (animStep < maxSteps - 1) {
      animStep++
      animateCam(animStep)
    } else {
      animStep = 0
      animateCam(animStep)
    }
  })

  $('.copy').on('click', function (e) {
    e.preventDefault()
    /*
    //copy the camera pos and rot
    var copyText =
      "{ position: {x:" + camera.position.x + ", y:" + camera.position.y + ", z: " + camera.position.z +
      "}, rotation: {x: " + camera.rotation.x + ", y: " + camera.rotation.y + ", z: " + camera.rotation.z +
      "}, time: " + 4000 +
      "},"
    */
    console.log(camera.rotation.clone())
    var copyText = "new THREE.Quaternion().set("+camera.quaternion.x+","+camera.quaternion.y+","+camera.quaternion.z+","+camera.quaternion.w+")"
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
  window.addEventListener('keydown', onKeyDown, false)
  render()

  setInterval(function () {
    debug()
  }, 1500)

  $(window).scroll(function () {
    //scrollPoints()
  })

  //animate to first step
  //animateCam(0)

  //controls.handleResize();

  scrollMagic()
}


/********************************/
/*      RENDER                  */
/********************************/

function render() {
  // RAF
  requestAnimationFrame(render)

  renderer.render(scene, camera)
  //controls.update()
  TWEEN.update();

  //composer.render(scene, camera)
}

function debug() {

  $camX.text(camera.position.x)
  $camY.text(camera.position.y)
  $camZ.text(camera.position.z)

  $cam_rotX.text(camera.rotation.x)
  $cam_rotY.text(camera.rotation.y)
  $cam_rotZ.text(camera.rotation.z)

}


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  //controls.handleResize(); // for TrackballControls

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function onKeyDown (e){
  var delta = .1
  //console.log(e)

  switch(e.key){
    case "a" : //left arrow
      camera.position.x = camera.position.x - delta;
      camera.updateProjectionMatrix();
      break;
    case "w" : // up arrow
      camera.position.y = camera.position.y - delta;
      camera.updateProjectionMatrix();
      break;
    case "d" : // right arrow
      camera.position.x = camera.position.x + delta;
      camera.updateProjectionMatrix();
      break;
    case "s" : //down arrow
      camera.position.y = camera.position.y + delta;
      camera.updateProjectionMatrix();
      break;
  }
}


/********************************/
/*      Helper Funcs            */
/********************************/

function exr() {

  //objects[2].material.roughness = params.roughness;
  //objects[2].material.metalness = params.metalness;
  /*
  objects.forEach(function (object) {
    object.material.roughness = params.roughness;
    object.material.metalness = params.metalness;
  });

   */

  var newEnvMap = objects[2].material.envMap;
  var background = scene.background;

  switch (params.envMap) {

    case 'EXR':
      newEnvMap = exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;
      background = exrBackground;
      break;
    case 'PNG':
      newEnvMap = pngCubeRenderTarget ? pngCubeRenderTarget.texture : null;
      background = pngBackground;
      break;

  }


  if (newEnvMap !== objects[2].material.envMap) {

    objects[2].material.envMap = newEnvMap;
    objects[2].material.needsUpdate = true;

    //plane.material.map = newEnvMap;
    //plane.material.needsUpdate = true;


    objects.forEach(function (object) {
      //console.log(object.name)
      //object.material.roughness = params.roughness;
      //object.material.metalness = params.metalness;
      object.material.envMap = newEnvMap;
      object.material.needsUpdate = true;
    });

  }

  //torusMesh.rotation.y += 0.005;
  //planeMesh.visible = params.debug;

  //scene.background = background;
  renderer.toneMappingExposure = params.exposure;
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


var posTween, rotTween

function animateCam(step) {
  var _position = animationSteps[step].position
  var _rotation = animationSteps[step].rotation
  var _time = animationSteps[step].time
  console.log("Animating step " + step + " to position: ", _position)


  //TWEEN function with animateVector3
  /*
  //stop old animation if there is one
  if (posTween != undefined) posTween.stop()
  if (rotTween != undefined) rotTween.stop()

  posTween = animateVector3(camera.position, _position, {
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
   */


}


function scrollPoints() {
  var $animElement = $('.setFrame');

  $animElement.each(function () {
    var $this = $(this);
    if ($this.isOnScreen()) {
      var _step = $this.data('frame')
      _step--
      console.log("element with animStep scrolled into view with animStep = " + _step)
      if (animStep != _step && !isAnimating) {
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
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
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

$.fn.isOnScreen = function () {

  var win = $(window);

  var viewport = {
    top: win.scrollTop(),
    left: win.scrollLeft()
  };
  viewport.right = viewport.left + win.width();
  viewport.bottom = viewport.top + win.height();

  var bounds = this.offset();
  bounds.right = bounds.left + this.outerWidth();
  bounds.bottom = bounds.top + this.outerHeight();

  return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));

};


var cameraPos0   // initial camera position
var cameraUp0    // initial camera up
var cameraZoom   // camera zoom
var iniQ         // initial quaternion
var endQ         // target quaternion
var curQ         // temp quaternion during slerp
var vec3         // generic vector object
var tweenValue   // tweenable value

function scrollMagic() {
  //const targetOrientation = new THREE.Quaternion().set(animationSteps[animStep].position.x, animationSteps[animStep].position.y, animationSteps[animStep].position.z, 1).normalize();
  setup()
  var start = new THREE.Quaternion().set(-0.02147109194872585,0.5432302992188002,0.013898749233087374,0.839194053238545)
  var end = new THREE.Quaternion().set(-0.08215950257250292,0.3635366792805399,0.03220648046146977,0.9273907706953968)

  // reset everything
  endQ = new THREE.Quaternion()
  iniQ = new THREE.Quaternion().copy(camera.quaternion)
  curQ = new THREE.Quaternion()
  vec3 = new THREE.Vector3()
  tweenValue = 0

  //endQ.setFromEuler(euler)
  endQ.copy(end)
  var zoom = 120

  var controller = new ScrollMagic.Controller();

  var blockTween = TweenLite.to(this, 5, {
    tweenValue:1,
    cameraZoom:zoom,
    onUpdate: function() {
      onSlerpUpdate(this.progress())
    }
  })

  /*
  var blockTween = new TweenMax.fromTo({},{start},  {end,
    duration: 1.5,
    onUpdate: function() {
      camera.quaternion.slerp(targetOrientation, this.progress());
    }
  })
   */

  var containerScene = new ScrollMagic.Scene({
    triggerElement: '#startTween',
    duration: 500
  })
    .setTween(blockTween)
    .addIndicators({name: "2 (duration: 300)"})
    .addTo(controller);
}





// init camera
function setup()
{
  cameraPos0 = camera.position.clone()
  cameraUp0 = camera.up.clone()
  cameraZoom = camera.position.z
}

// set a new target for the camera
function moveCamera(euler, zoom)
{




}

// on every update of the tween
function onSlerpUpdate(progress)
{

  console.log(progress)
  // interpolate quaternions with the current tween value
  THREE.Quaternion.slerp(iniQ, endQ, curQ, progress)

  // apply new quaternion to camera position
  vec3.x = cameraPos0.x
  vec3.y = cameraPos0.y
  vec3.z = cameraZoom
  vec3.applyQuaternion(curQ)
  camera.position.copy(vec3)

  // apply new quaternion to camera up
  vec3 = cameraUp0.clone()
  vec3.applyQuaternion(curQ)
  camera.up.copy(vec3)
}