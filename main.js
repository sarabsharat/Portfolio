import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const loader = new GLTFLoader();

let hoveredObject = null;
let mixer;

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
    position: new THREE.Vector3(0.5196626782417297, 0.1496729850769043, -5.489231109619141),
    rotation: new THREE.Euler(0, 0, 0),
    duration: 1.5
  },
  Cexperience:{
    position: new THREE.Vector3(-5.572940826416016, 0.1496729850769043, 0.5330694913864136),
    rotation: new THREE.Euler(0, 0, 0),
    duration: 1.5
  },
  Cskills:{
    position: new THREE.Vector3(-5.461484909057617, 0.1496729850769043, 6.5523552894592285),
    rotation: new THREE.Euler(0, 0, 0),
    duration: 1.5
  },
  Ctestimonials:{
    position: new THREE.Vector3(6.557930946350098, 0.15647836029529572, -5.484166145324707),
    rotation: new THREE.Euler(0, 0, 0),
    duration: 1.5
    },
  Cwork:{
    position: new THREE.Vector3(0.5451653003692627, 0.1496729850769043, 6.543992042541504),
    rotation: new THREE.Euler(0,0,0),
    duration: 1.5
  },
  Cabuot_me:{
    position: new THREE.Vector3(6.557510852813721, 0.1496729850769043, 0.5195545554161072),
    rotation: new THREE.Euler(0, 0, 0),
    duration: 1.5
  },
  Ccontact_me:{
    position: new THREE.Vector3(6.554821968078613, 0.1496729850769043, 6.461586952209473),
    rotation: new THREE.Euler(0, 0, 0),
    duration: 1.5
  }
};


const originalMaterials = new Map();
const clonedMaterials = new Map();

loader.load( '192.glb', function ( glb ) {

	scene.add( glb.scene );

  glb.scene.traverse((child) => {
    if (intersectObjectsNames.includes(child.name)) {
      intersectObjects.push(child);

      // Store original materials
      if (child.isMesh) {
        originalMaterials.set(child, child.material);

        // Clone material and set initial opacity to 0
        const clonedMaterial = child.material.clone();
        clonedMaterial.transparent = true;
        clonedMaterial.opacity = 0; // Start with opacity 0
        clonedMaterial.needsUpdate = true;
        child.material = clonedMaterial;

        // Store cloned material for later use
        clonedMaterials.set(child, clonedMaterial);
      }}

  });


// trauma
//   const textureLoader = new THREE.TextureLoader();
//   const emissionMap = textureLoader.load('./assets/motherboard_emit.jpg');

//   if (child.isMesh && child.name === "motherboard") { 
//     const material = new THREE.MeshStandardMaterial({
//       color: child.material.color || 0xe79ddf, 
//       emissive: child.material.emissive || 0xe79ddf,  
//       emissiveIntensity: 0.05, 
//       emissiveMap: emissionMap,
      
//     });
//   }

  


//Animation
  const objectAnimationMap = {
    Cresume:3,
    Cexperience:2,
    Cskills:4,
    Ctestimonials:5,
    Cwork:6,
    Cabuot_me:0,
    Ccontact_me:1,
  };
  const clips = glb.animations;
  const start = [clips[7],clips[8],
                 clips[10], clips[11],
                 clips[13], clips[15],
                 clips[16],clips[18],
                 clips[19]
                 ];
                
  const loop = [clips[9], clips[12], clips[14],clips[17]];
  mixer = new THREE.AnimationMixer(glb.scene);
  console.log(clips);
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
  });
  


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
const camerainit = camera.position.clone();
camera.updateProjectionMatrix();
let mouseX = 0;
let mouseY = 0;

function playAnimation(animationIndex) {
  if (!clips || animationIndex >= clips.length) {
    console.error('Invalid animation index:', animationIndex);
    return;
  }

  
  mixer.stopAllAction();

  
  const clip = clips[animationIndex];
  const action = mixer.clipAction(clip);

  action.setLoop(THREE.LoopOnce); 
  action.clampWhenFinished = true; 
  action.play();

  
  action.getMixer().addEventListener('finished', () => {
    console.log('Animation finished:', clip.name);
  });
}



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
  if(intersects.length > 0){
    const objectName = intersects[0].object.name;

    if (objectAnimationMap[objectName] !== undefined) {
      const animationIndex = objectAnimationMap[objectName];
      playAnimation(animationIndex);
    }
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
  controls.enablezoom = true;
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
function animate() {
  requestAnimationFrame(animate);
  if (isMobile && controls){
      controls.update();
    } else {
  camera.position.copy(camerainit);
  camera.position.x += (mouseX -camera.position.x) * 0.25;
  camera.position.y += (-mouseY - camera.position.y) * 0.25;
  camera.lookAt(scene.position);
    }
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(intersectObjects);

  document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
  
  if (mixer) {
    mixer.update(0.01);
  }
  renderer.render(scene, camera);
}

animate();