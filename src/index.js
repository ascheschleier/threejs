import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

var camera, scene, renderer, controls
var plane
var mouse,
  raycaster,
  isShiftDown = false

var rollOverMesh, rollOverMaterial
var cubeGeo, cubeMaterial

var objects = []

init()
render()

function init() {

  var loader = new GLTFLoader();

  loader.load( 'model/insel.glb', function ( gltf ) {

    scene.add( gltf.scene );

  }, undefined, function ( error ) {

    console.error( error );

  } );

  camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    1,
    10000
  )
  camera.position.set(-7, -3, 5)
  camera.rotation.set(90, 270, 0)
  camera.lookAt(0, 0, 0)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)


  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  var geometry = new THREE.PlaneBufferGeometry(1000, 1000)
  geometry.rotateX(-Math.PI / 2)

  plane = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ visible: false })
  )
  scene.add(plane)

  objects.push(plane)

  // lights

  var ambientLight = new THREE.AmbientLight(0x606060)
  scene.add(ambientLight)

  var directionalLight = new THREE.DirectionalLight(0xffffff)
  directionalLight.position.set(1, 0.75, 0.5).normalize()
  scene.add(directionalLight)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  document.addEventListener('mousemove', onDocumentMouseMove, false)
  window.addEventListener('resize', onWindowResize, false)

  controls =  new OrbitControls(camera, renderer.domElement)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}


function onDocumentMouseMove(event) {
  event.preventDefault()

  mouse.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  )

  render()
}

function render() {
  renderer.render(scene, camera)
}
