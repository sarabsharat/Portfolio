import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import TWEEN from 'https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.5.0/dist/tween.esm.js';


// scene set up for web
const canvas = document.getElementById("experience-canvas");
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const camera = new THREE.PerspectiveCamera( 
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias:true});
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const scene = new THREE.Scene();
{
  const color = 0x192348
  const near = 4;
  const far = 80;
  scene.fog = new THREE.Fog(color, near, far);
  scene.background = new THREE.Color(color);
}

//#region VARIABLES
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const loader = new GLTFLoader();
let hoveredObject = null;
let mixer;
let clips = [];
let objectMixer;
let isAnimating = false;
const cameraOffset = new THREE.Vector3(-17.941, 17.759, -18.720);
const mouseInfluence = 0.25;
let mouseX = 0;
let mouseY = 0;
const intersectObjects = [];
const intersectObjectsNames =[
  "Cresume",
  "Cexperience",
  "Cskills",
  "Ctestimonials",
  "Cwork",
  "Cabuot_me",
  "Ccontact_me"
];
const cameraTargets = {
  Cresume: {
    position: new THREE.Vector3(0.52, 0.15, -5.48), 
    rotation: new THREE.Euler(0, Math.PI/2,0)
  },
  Cexperience: {
    position: new THREE.Vector3(-5.57, 0.15, 0.53),
    rotation: new THREE.Euler(0, Math.PI/2, 0)
  },
  Cskills:{
    position: new THREE.Vector3(-5.461484909057617, 0.1496729850769043, 6.5523552894592285),
    rotation: new THREE.Euler(0, 0, 0),
      
      },
  Ctestimonials:{
    position: new THREE.Vector3(6.557930946350098, 0.15647836029529572, -5.484166145324707),
    rotation: new THREE.Euler(0, 0, 0),
        
        },
  Cwork:{
    position: new THREE.Vector3(0.5451653003692627, 0.1496729850769043, 6.543992042541504),
    rotation: new THREE.Euler(0,0,0),
        
      },
  Cabuot_me:{
    position: new THREE.Vector3(6.557510852813721, 0.1496729850769043, 0.5195545554161072),
    rotation: new THREE.Euler(0, Math.PI/2, 0),
        
      },
  Ccontact_me:{
    position: new THREE.Vector3(6.554821968078613, 0.1496729850769043, 6.461586952209473),
    rotation: new THREE.Euler(0, 0, 0),
        
      }
};
const originalMaterials = new Map();
const clonedMaterials = new Map();
const MIN_DISTANCE = 15; 
const ROTATION_SPEED = 0.4; 
const Rbutton = document.getElementById('return');
let startPosition = null; 
let startRotation = null;
let currentTarget = null;
let initialCameraState = {
  position: new THREE.Vector3(),
  rotation: new THREE.Euler()
};
initialCameraState.position.copy(camera.position);
initialCameraState.rotation.copy(camera.rotation);

//#endregion


loader.load( '252.glb', function ( glb ) {

	scene.add( glb.scene );
  objectMixer = new THREE.AnimationMixer(glb.scene);
  clips = glb.animations;
  mixer = new THREE.AnimationMixer(glb.scene);

    //hover thing
    glb.scene.traverse((child) => {
      if (intersectObjectsNames.includes(child.name)) {
        intersectObjects.push(child);
        if (child.isMesh && cameraTargets[child.name]) {
          originalMaterials.set(child, child.material);
          const clonedMaterial = child.material.clone();
          clonedMaterial.transparent = true;
          clonedMaterial.opacity = 0; 
          clonedMaterial.needsUpdate = true;
          child.material = clonedMaterial;
          clonedMaterials.set(child, clonedMaterial);
        }}});

//#region Animation
const start = [clips[7],clips[8],
clips[10], clips[11],
clips[13], clips[15],
clips[16],clips[18],
clips[19]
];
const loop = [clips[9], clips[12], clips[14],clips[17]];

let lastStartAction = null;

start.forEach((clip, index) => {
const action = mixer.clipAction(clip);
action.setLoop(THREE.LoopOnce);
action.clampWhenFinished = true;
action.play();

if (index === start.length - 1) {
lastStartAction = action; 
}
});


if (lastStartAction) {
lastStartAction.getMixer().addEventListener("finished", () => {
loop.forEach(clip => {
const action = mixer.clipAction(clip);
action.time = 50; 
action.setLoop(THREE.LoopRepeat, Infinity);
action.play();
});
  });
    } 
//#endregion
      });
      
      
      function moveCameraTo(targetName) {
        if(isAnimating) return;
        
        isAnimating = true;
        currentTarget = targetName;
      
        const targetObject = intersectObjects.find(obj => obj.name === targetName);
        const objectPosition = new THREE.Vector3();
        targetObject.getWorldPosition(objectPosition);
      
        // Store starting position/rotation BEFORE movement
        startPosition = camera.position.clone();
        startRotation = camera.rotation.clone();
      
        const cameraDirection = new THREE.Vector3()
          .subVectors(camera.position, objectPosition)
          .normalize();
      
        const targetPosition = cameraDirection
          .multiplyScalar(MIN_DISTANCE)
          .add(objectPosition);
      
        const rotatedPosition = targetPosition.clone().applyAxisAngle(
          new THREE.Vector3(0, Math.PI/2, 0),
          THREE.MathUtils.degToRad(45 * ROTATION_SPEED)
        );
      
        new TWEEN.Tween({
          posX: camera.position.x,
          posY: camera.position.y,
          posZ: camera.position.z,
          rotX: camera.rotation.x,
          rotY: camera.rotation.y
        })
        .to({
          posX: rotatedPosition.x,
          posY: rotatedPosition.y,
          posZ: rotatedPosition.z,
          rotY: camera.rotation.y + THREE.MathUtils.degToRad(70 * ROTATION_SPEED),
          rotX: camera.rotation.x + THREE.MathUtils.degToRad(70 * ROTATION_SPEED)
        }, 1500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate((obj) => {
          camera.position.set(obj.posX, obj.posY, obj.posZ);
          camera.rotation.set(obj.rotX, obj.rotY, camera.rotation.z);
          camera.lookAt(objectPosition);
        })
        .onComplete(() => {
          if(Rbutton) Rbutton.style.display = 'block';
        })
        .start();
      }

      function returnToInitial() {
        if(!isAnimating && currentTarget) {
          isAnimating = true;
          
          new TWEEN.Tween({
            posX: camera.position.x,
            posY: camera.position.y,
            posZ: camera.position.z,
            rotX: camera.rotation.x,
            rotY: camera.rotation.y
          })
          .to({
            posX: initialCameraState.position.x,
            posY: initialCameraState.position.y,
            posZ: initialCameraState.position.z,
            rotX: initialCameraState.rotation.x,
            rotY: initialCameraState.rotation.y
          }, 1500)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onUpdate((obj) => {
            camera.position.set(obj.posX, obj.posY, obj.posZ);
            camera.rotation.set(obj.rotX, obj.rotY, camera.rotation.z);
            camera.lookAt(scene.position); // Add this line
          })
          .onComplete(() => {
            isAnimating = false;
            currentTarget = null;
            if(Rbutton) Rbutton.style.display = 'none';
          })
          .start();
        }
      }
document.addEventListener('DOMContentLoaded', () => {
  if(Rbutton) {
    Rbutton.style.display = 'none';
    Rbutton.addEventListener('click', returnToInitial);
  }
});



//#region Camera && Light
    //Light
const directionalLight = new THREE.DirectionalLight( 0x404040, 50 );
directionalLight.position.set( -15.686, 8.580, -6.977 );
directionalLight.castShadow = true;
scene.add( directionalLight );

    //Camera position and rotation 
    camera.position.set(-17.941, 17.759, -18.720);
    camera.rotation.set(
      THREE.MathUtils.degToRad(-135.84),  
      THREE.MathUtils.degToRad(-35.16),   
      THREE.MathUtils.degToRad(-151.63)   
    );
    camera.fov = 25.64;
    camera.updateProjectionMatrix();
//#endregion

// const xButton = document.getElementById('XButton');
// const Resume = document.getElementById('Resume');
// if (xButton) {
//   xButton.addEventListener('click', () => {
//     xButton.onclick = function(){
//       Resume.style.display = "none";
//       console.log("tf");
//     }
//     if (isCameraAnimating) return;
//     camera.position.copy(previousCameraPosition);
//     camera.quaternion.copy(previousCameraQuaternion);
    
//     console.log("exit");
//   });
// }
 
//Responsivness

function onResize(){
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  if (controls){
    controls.handleResize();
  }
}

function onMouseMove( event ) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    const windowHalfX = window.innerWidth /2;
    const windowHalfY = window.innerHeight /2;
    mouseX = (event.clientX - windowHalfX) / 100;
    mouseY = -(event.clientY - windowHalfY) / 100;
  
    
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(intersectObjects);

  if (hoveredObject) {
    const material = clonedMaterials.get(hoveredObject);
    if (material) {
      material.opacity = 0; 
      material.needsUpdate = true;
    }
    hoveredObject = null;
  }

  if (intersects.length > 0) {
    hoveredObject = intersects[0].object;
        if (hoveredObject.isMesh) {
          const material = clonedMaterials.get(hoveredObject);
          if (material) {
            material.opacity = 0.7; 
            material.needsUpdate = true;
          }
        }
      }
}

function onClick(){
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(intersectObjects);
  if (intersects.length > 0) {
    const objectName = intersects[0].object.name;
    moveCameraTo(objectName);
    Rbutton.style.display = "inline";
    }
  }



window.addEventListener("resize", onResize);
window.addEventListener( 'click', onClick );
window.addEventListener( 'mousemove', onMouseMove );


//mobile responsive
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let controls = null

//controls for mobille
function mobileControls (){
  if (isMobile) {
  controls = new OrbitControls(camera, renderer.domElement);
  camera.position.set(-17.941, 17.759, -18.720);
  controls.target.set(0,0,0);
  controls.enableDamping = true;
  controls.enableZoom = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = true;
  controls.maxDistance = 50;
  controls.minDistance = 10;
  controls.minPolarAngle = THREE.MathUtils.degToRad(10);
  controls.maxPolarAngle = THREE.MathUtils.degToRad(80);
  controls.minAzimuthAngle = Math.PI/1.5;
  controls.maxAzimuthAngle = -Math.PI/2;
  window.removeEventListener('mousemove', onMouseMove);
} else {
  window.addEventListener('mousemove', onMouseMove);
}
}

const debugMobile = new URLSearchParams(window.location.search).has('mobile');
if (debugMobile) isMobile = true;
mobileControls();


// Animation
const clock = new THREE.Clock();
function animate() {
  TWEEN.update();
  const delta = clock.getDelta();
  requestAnimationFrame(animate);

  if (mixer) mixer.update(delta);
  if (objectMixer) objectMixer.update(delta);

  // Only follow cursor when NOT animating
  if (!isAnimating && !isMobile) {
    camera.position.copy(cameraOffset);
    camera.position.x += (mouseX - cameraOffset.x) * mouseInfluence;
    camera.position.y += (-mouseY - cameraOffset.y) * mouseInfluence;
    camera.lookAt(scene.position);
  }

  // Mobile controls check
  if (isMobile && controls) {
    controls.update();
  }

  renderer.render(scene, camera);
}

animate();