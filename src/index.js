import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {TrackballControls} from "three/examples/jsm/controls/TrackballControls.js";

import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import {GUI} from 'three/examples/jsm/libs/dat.gui.module.js';

//import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
//import { LuminosityShader } from 'three/examples/jsm/shaders/LuminosityShader.js';



import { SSAOPass } from 'three/examples//jsm/postprocessing/SSAOPass.js';

import {EXRLoader} from 'three/examples/jsm/loaders/EXRLoader.js';

import TWEEN from '@tweenjs/tween.js'

/********************************/
/*      Variables          ******/
/********************************/


var camera, scene, renderer, controls, composer, glbCamera, mixer, clock
var plane

var objects = []

var cube, gltf

var gblModel

//debug:
var $camX, $camY, $camZ, $cam_rotX, $cam_rotY, $cam_rotZ
$camX = $('.camX span')
$camY = $('.camY span')
$camZ = $('.camZ span')
$cam_rotX = $('.cam_rotX span')
$cam_rotY = $('.cam_rotY span')
$cam_rotZ = $('.cam_rotZ span')

var lightOptions = {
  position: {
    x: 6.6,
    y: 10,
    z: 1.2
  },
  rotation: {
    x: 12,
    y: 11,
    z: 11
  }
}

// animation array:
var isAnimating = false;
var animStep = 0;



var animationSteps = {
  0: { position: {x:15.402419031730028, y:0.8644392379961215, z: 6.91182062569953}, rotation: {x: -0.1418727215609679, y: 1.2732181882233577, z: 0.1357153308110989}, time: 2000},
  1: { position: {x:15.295914956368039, y:0.7465254730224472, z: 7.289310603688933}, rotation: {x: -0.07198703254004861, y: 0.9553206385991876, z: 0.05881117617610776}, time: 2000},
  2:{ position: {x:14.904069166462264, y:1.3076345502176714, z: 8.226362310435158}, rotation: {x: -0.10876314205771008, y: 0.7045975732808462, z: 0.07061038025150695}, time: 2000},
  3:{ position: {x:4.725241209623325, y:0.7985089083807053, z: 8.995521316024004}, rotation: {x: -0.09223815738734413, y: 0.4873675118995367, z: 0.04329112396070809}, time: 4000},
  4: { position: {x:3.9030383054489004, y:2.573311636082828, z: 12.54121086132899}, rotation: {x: -0.20237944136598865, y: 0.2959144836273942, z: 0.05976471233272036}, time: 4000},

}

//var maxSteps = 6;
var maxSteps = Object.keys(animationSteps).length
//console.log("animatiuon length = " + maxSteps)

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


//EXR

var params = {
  envMap: 'EXR',
  roughness: 0.0,
  metalness: 0.0,
  exposure: 1.0,
  debug: false,
};
var pngCubeRenderTarget, exrCubeRenderTarget;
var pngBackground, exrBackground;
var torusMesh, planeMesh;

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
  clock = new THREE.Clock(); // create clock

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
        case 'Cloud001':
          child.receiveShadow = false; //default
          //child.material.opacity = 0.45
          break;
        case 'Cloud002':
          child.receiveShadow = false; //default
          //child.material.opacity = 0.422
          break;
        case 'Cloud003':
          child.receiveShadow = false; //default
          //child.material.opacity = 0.32
          break;
        case 'Cloud004':
          child.receiveShadow = false; //default
          //child.material.opacity = 0.554
          break;
        case 'Island':
          child.castShadow = false; //default is false
          child.receiveShadow = true; //default
          break;
        case 'Tree_Trunk':
          child.castShadow = true; //default is false
          child.receiveShadow = false; //default
          break;
        case 'Leaf001':
          child.castShadow = true; //default is false
          child.receiveShadow = false; //default
          break;
        case 'Leaf002':
          child.castShadow = true; //default is false
          child.receiveShadow = false; //default
          break;
        case 'Leaf003':
          child.castShadow = true; //default is false
          child.receiveShadow = false; //default
          break;
        case 'Leaf004':
          child.castShadow = true; //default is false
          child.receiveShadow = false; //default
          break;
        case 'Leaf005':
          child.castShadow = true; //default is false
          child.receiveShadow = false; //default
          break;
        case 'Leaf006':
          child.castShadow = true; //default is false
          child.receiveShadow = false; //default
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

  gblModel = gltf
  //gblModel.scene.scale.set(10,10,10)
  scene.add(gblModel.scene);

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

  mixer = new THREE.AnimationMixer(gblModel.scene);
  var NumberOfAnimations = animations.length;

  console.log("animation: ", animations)

  for (var i = 0; i < NumberOfAnimations; i++) {
    mixer.clipAction(animations[i]).play();
  }


  /********************************/
  /*      EXR Loader              */
  /********************************/


  THREE.DefaultLoadingManager.onLoad = function () {
    pmremGenerator.dispose();
  };

  new EXRLoader()
    .setDataType(THREE.UnsignedByteType)
    .load('textures/GCanyon_C_YumaPoint_1k.exr', function (texture) {
      exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
      exrBackground = exrCubeRenderTarget.texture;

      texture.dispose();
    });

  new THREE.TextureLoader().load('textures/equirectangular.png', function (texture) {
    texture.encoding = THREE.sRGBEncoding;
    pngCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
    pngBackground = pngCubeRenderTarget.texture;

    texture.dispose();
  });



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

  var pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  composer = new EffectComposer(renderer);

  var renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  var bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.3, 0.4, 0.85)
  composer.addPass(bloomPass);



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
    var copyText =
      "{ position: {x:" + camera.position.x + ", y:" + camera.position.y + ", z: " + camera.position.z +
      "}, rotation: {x: " + camera.rotation.x + ", y: " + camera.rotation.y + ", z: " + camera.rotation.z +
      "}, time: " + 4000 +
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
  window.addEventListener('keydown', onKeyDown, false)
  render()

  setInterval(function () {
    debug()
  }, 1500)

  $(window).scroll(function () {
    scrollPoints()
  })

  //animate to first step
  //animateCam(0)

  /********************************/
  /*      GUI                     */
  /********************************/

  var gui = new GUI();

  gui.add(lightOptions.position, 'x', -500, 500, 0.1);
  gui.add(lightOptions.position, 'y', -500, 500, 0.1);
  gui.add(lightOptions.position, 'z', -100, 100, 0.1);

  gui.add(lightOptions.rotation, 'x', -500, 500, 1.0);
  gui.add(lightOptions.rotation, 'y', -500, 500, 1.0);
  gui.add(lightOptions.rotation, 'z', -500, 500, 1.0);

  gui.add( params, 'envMap', [ 'EXR', 'PNG' ] );
  gui.add( params, 'roughness', 0, 1, 0.01 );
  gui.add( params, 'metalness', 0, 1, 0.01 );
  gui.add( params, 'exposure', 0, 2, 0.01 );

  //gui.add( lightOptions , 'debug', false );
  gui.open();

  //controls.handleResize();
}


/********************************/
/*      RENDER                  */
/********************************/

function render() {

  if (gblModel) {
    exr()
    //animationMi+xer
    var delta = clock.getDelta();
    //mixer.update(delta); // update animation mixer
  }

  // RAF
  requestAnimationFrame(render)

  //light.position.set(lightOptions.position.x, lightOptions.position.y, lightOptions.position.z)
  //light.rotation.set(lightOptions.rotation.x, lightOptions.rotation.y, lightOptions.rotation.z)
  //cube.position.set(lightOptions.position.x, lightOptions.position.y, lightOptions.position.z)
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
