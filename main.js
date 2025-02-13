import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';


const scene = new THREE.Scene();
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

renderer.outputEncoding = THREE.sRGBEncoding;
THREE.ColorManagement.enabled = true;

const loader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const emissionTexture = textureLoader.load('/assets/motherboard_emit.jpg');

let mixer;

loader.load( 'portfolio3.glb', function ( glb ) {

	scene.add( glb.scene );

  glb.scene.traverse((child) => {
    if (child.isMesh) {
      const material = new THREE.MeshStandardMaterial({
        color: child.material.color || 0xaaaaaa, 
        emissive: child.material.emissive || 0x000000,  
        emissiveIntensity: 1, 
      });

      child.material = material;
    }
  });


 //Animation
  mixer = new THREE.AnimationMixer(glb.scene);
  glb.animations.forEach(clip => {
    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce);  // Set loop mode to 'once'
    action.clampWhenFinished = true; // Ensure the animation stays on the last frame when finished
    action.play();
  });

}, undefined, function ( error ) {

	console.error( error );

} );


//Light
const directionalLight = new THREE.DirectionalLight( 0x404040, 0 );
directionalLight.position.set( -15.686, 8.580, -6.977 );
directionalLight.castShadow = true;
scene.add( directionalLight );


// Camera position and rotation trackball
camera.position.set(-17.461, 15.847, -20.062);
camera.rotation.set(
  THREE.MathUtils.degToRad(-144.01),  
  THREE.MathUtils.degToRad(-34.93),   
  THREE.MathUtils.degToRad(-157.42)   
);
camera.fov = 22.90;
camera.updateProjectionMatrix();


// Controls
const controls = new OrbitControls( camera, canvas);
controls.enablePan = false; 
controls.minDistance = 5;  
controls.maxDistance = 50;  
controls.minPolarAngle = THREE.MathUtils.degToRad(10);
controls.maxPolarAngle = THREE.MathUtils.degToRad(80);
controls.update();


//Responsivness
function handleResize(){
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
window.addEventListener("resize", handleResize);

// Animation loop function
function animate() {
  requestAnimationFrame(animate);

  
  if (mixer) {
    mixer.update(0.01);  
  }

  controls.update(); 
  renderer.render(scene, camera); 
}
animate();  