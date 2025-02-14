import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';


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


const loader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const emissionMap = textureLoader.load('./assets/motherboard_emit.jpg');
let mixer;

loader.load( 'k.glb', function ( glb ) {

	scene.add( glb.scene );

  glb.scene.traverse((child) => {
    if (child.isMesh && child.name === "motherboard") { // Apply only to "motherboard"
      const material = new THREE.MeshStandardMaterial({
        color: child.material.color || 0xe79ddf, 
        emissive: child.material.emissive || 0xe79ddf,  
        emissiveIntensity: 0.05, 
        emissiveMap: emissionMap,
        
      });

      child.material = material;
    }
  });


 //Animation
  mixer = new THREE.AnimationMixer(glb.scene);
  glb.animations.forEach(clip => {
    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce);  
    action.clampWhenFinished = true; 
    action.play();
  });
  action.addEventListener("finished", () =>
  {
    action.time = 50;
    action.setLoop(THREE.LoopRepeat, Infinity);
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


// Camera position and rotation 
camera.position.set(-17.661, 14.607, -20.982);
camera.rotation.set(
  THREE.MathUtils.degToRad(-144.01),  
  THREE.MathUtils.degToRad(-34.93),   
  THREE.MathUtils.degToRad(-157.42)   
);
camera.fov = 22.50;
camera.updateProjectionMatrix();


// // Controls
const controls = new OrbitControls( camera, canvas);
controls.enablePan = false; 
controls.enableRotate = true;
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