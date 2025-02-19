import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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
let intersectObject = ""; 
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

const originalMaterials = new Map();
const clonedMaterials = new Map();


loader.load( 'see.glb', function ( glb ) {

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


//trauma
  // const textureLoader = new THREE.TextureLoader();
  // const emissionMap = textureLoader.load('./assets/motherboard_emit.jpg');

  // if (child.isMesh && child.name === "motherboard") { 
  //   const material = new THREE.MeshStandardMaterial({
  //     color: child.material.color || 0xe79ddf, 
  //     emissive: child.material.emissive || 0xe79ddf,  
  //     emissiveIntensity: 0.05, 
  //     emissiveMap: emissionMap,
      
  //   });
  // }

  
 //Animation
  const clips = glb.animations;
  const start = [clips[1], clips[2],
                 clips[3], clips[5],
                 clips[6], clips[8],
                 clips[10],clips[11],
                clips[13], clips[14]];
                
  const loop = [clips[0], clips[4], clips[7], clips[9], clips[12]];
  mixer = new THREE.AnimationMixer(glb.scene);
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
const directionalLight = new THREE.DirectionalLight( 0x404040, 0 );
directionalLight.position.set( -15.686, 8.580, -6.977 );
directionalLight.castShadow = true;
scene.add( directionalLight );


//Camera position and rotation 

camera.position.set(-17.661, 14.607, -20.982);
camera.rotation.set(
  THREE.MathUtils.degToRad(-144.01),  
  THREE.MathUtils.degToRad(-34.93),   
  THREE.MathUtils.degToRad(-157.42)   
);
camera.fov = 22.50;
const camerainit = camera.position.clone();
camera.updateProjectionMatrix();
let mouseX = 0;
let mouseY = 0;


//Responsivness
function onResize(){
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
    const object = intersects[0].object;
    zoomer(object);
  }
  
}

window.addEventListener("resize", onResize);
window.addEventListener( 'click', onClick );
window.addEventListener( 'mousemove', onMouseMove );


// Animation
function animate() {
  requestAnimationFrame(animate);
  
  camera.position.copy(camerainit);
  camera.position.x += (mouseX -camera.position.x) * 0.25;
  camera.position.y += (-mouseY - camera.position.y) * 0.25;
  camera.lookAt(scene.position);

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(intersectObjects);

  document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
  
  if (mixer) {
    mixer.update(0.01);
  }
  renderer.render(scene, camera);
}

animate();