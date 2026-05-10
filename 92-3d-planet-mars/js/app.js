import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// ============ SCENE SETUP ============
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050b1a);
scene.fog = new THREE.FogExp2(0x050b1a, 0.0003);

// ============ CAMERA ============
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 8);
camera.lookAt(0, 0, 0);

// ============ RENDERERS ============
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// CSS2 Renderer for text labels
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.left = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

// ============ CONTROLS ============
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.5;
controls.enableZoom = true;
controls.enablePan = false;
controls.zoomSpeed = 1.2;
controls.rotateSpeed = 1.0;
controls.target.set(0, 0, 0);

// ============ TEXTURE LOADER ============
const textureLoader = new THREE.TextureLoader();
const loadingIndicator = document.getElementById('loadingIndicator');
let texturesLoaded = 0;
const totalTextures = 3;

function textureLoaded() {
    texturesLoaded++;
    if (texturesLoaded === totalTextures) {
        loadingIndicator.classList.add('hidden');
    }
}

// High-res Mars textures from NASA
const marsMap = textureLoader.load('https://threejs.org/examples/textures/planets/mars_atmos_2048.jpg');
marsMap.onLoad = textureLoaded;
const marsBumpMap = textureLoader.load('https://threejs.org/examples/textures/planets/mars_normal_2048.jpg');
marsBumpMap.onLoad = textureLoaded;
const marsSpecularMap = textureLoader.load('https://threejs.org/examples/textures/planets/mars_specular_2048.jpg');
marsSpecularMap.onLoad = textureLoaded;

// Starfield background
const starTexture = textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
const starGeometry = new THREE.SphereGeometry(500, 64, 64);
const starMaterial = new THREE.MeshBasicMaterial({
    map: starTexture,
    side: THREE.BackSide
});
const starField = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starField);

// ============ MARS PLANET ============
const marsGeometry = new THREE.SphereGeometry(2, 128, 128);
const marsMaterial = new THREE.MeshStandardMaterial({
    map: marsMap,
    bumpMap: marsBumpMap,
    bumpScale: 0.05,
    roughness: 0.7,
    metalness: 0.1,
    emissive: new THREE.Color(0x331100),
    emissiveIntensity: 0.15
});

const mars = new THREE.Mesh(marsGeometry, marsMaterial);
mars.castShadow = true;
mars.receiveShadow = true;
scene.add(mars);

// ============ ATMOSPHERE GLOW ============
const atmosphereGeometry = new THREE.SphereGeometry(2.05, 128, 128);
const atmosphereMaterial = new THREE.MeshPhongMaterial({
    color: 0xff6633,
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide
});
const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
scene.add(atmosphere);

// ============ CLOUDS LAYER ============
const cloudTexture = textureLoader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png');
const cloudGeometry = new THREE.SphereGeometry(2.02, 128, 128);
const cloudMaterial = new THREE.MeshPhongMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending
});
const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
scene.add(clouds);

// ============ LIGHTING ============
// Ambient light
const ambientLight = new THREE.AmbientLight(0x222222);
scene.add(ambientLight);

// Main directional light (Sun)
const sunLight = new THREE.DirectionalLight(0xffeedd, 1.5);
sunLight.position.set(10, 15, 5);
sunLight.castShadow = true;
sunLight.receiveShadow = false;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
scene.add(sunLight);

// Fill light from below
const fillLight = new THREE.PointLight(0x442200, 0.3);
fillLight.position.set(0, -3, 0);
scene.add(fillLight);

// Back rim light
const rimLight = new THREE.PointLight(0xff6633, 0.5);
rimLight.position.set(-5, 2, -5);
scene.add(rimLight);

// Additional fill lights
const backLight = new THREE.PointLight(0x3366ff, 0.2);
backLight.position.set(0, 2, -8);
scene.add(backLight);

// ============ STAR PARTICLES ============
const starCount = 2000;
const starGeometryParticles = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 800;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 800;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 200 - 50;
}
starGeometryParticles.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterialParticles = new THREE.PointsMaterial({ color: 0xffffff, size: 0.25, transparent: true, opacity: 0.8 });
const stars = new THREE.Points(starGeometryParticles, starMaterialParticles);
scene.add(stars);

// ============ DISTANT STARS LAYER ============
const starFieldGeometry = new THREE.BufferGeometry();
const starFieldPositions = new Float32Array(4000 * 3);
for (let i = 0; i < 4000; i++) {
    starFieldPositions[i * 3] = (Math.random() - 0.5) * 2000;
    starFieldPositions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
    starFieldPositions[i * 3 + 2] = (Math.random() - 0.5) * 500 - 200;
}
starFieldGeometry.setAttribute('position', new THREE.BufferAttribute(starFieldPositions, 3));
const starFieldMaterial = new THREE.PointsMaterial({ color: 0x88aaff, size: 0.15, transparent: true, opacity: 0.6 });
const starsField = new THREE.Points(starFieldGeometry, starFieldMaterial);
scene.add(starsField);

// ============ CSS2D TEXT LABEL ============
const planetDiv = document.createElement('div');
planetDiv.textContent = '🔴 MARS';
planetDiv.style.color = '#ff8866';
planetDiv.style.fontSize = '20px';
planetDiv.style.fontWeight = 'bold';
planetDiv.style.textShadow = '0 0 10px rgba(0,0,0,0.5)';
planetDiv.style.fontFamily = 'Inter, sans-serif';
planetDiv.style.letterSpacing = '2px';
planetDiv.style.background = 'rgba(0,0,0,0.5)';
planetDiv.style.padding = '4px 12px';
planetDiv.style.borderRadius = '30px';
planetDiv.style.border = '1px solid rgba(255,136,102,0.5)';
planetDiv.style.backdropFilter = 'blur(5px)';

const planetLabel = new CSS2DObject(planetDiv);
planetLabel.position.set(0, 2.3, 0);
scene.add(planetLabel);

// ============ ORBIT RING ============
const orbitPoints = [];
const orbitRadius = 2.5;
const orbitSegments = 128;
for (let i = 0; i <= orbitSegments; i++) {
    const angle = (i / orbitSegments) * Math.PI * 2;
    const x = Math.cos(angle) * orbitRadius;
    const z = Math.sin(angle) * orbitRadius;
    orbitPoints.push(new THREE.Vector3(x, 0, z));
}
const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xff6633, transparent: true, opacity: 0.3 });
const orbitRing = new THREE.LineLoop(orbitGeometry, orbitMaterial);
scene.add(orbitRing);

// ============ ANIMATION VARIABLES ============
let autoRotate = true;
let time = 0;

// ============ UI CONTROLS ============
const autoRotateBtn = document.getElementById('autoRotateBtn');
const resetViewBtn = document.getElementById('resetViewBtn');
const themeToggle = document.getElementById('themeToggle');

autoRotateBtn.addEventListener('click', () => {
    autoRotate = !autoRotate;
    controls.autoRotate = autoRotate;
    autoRotateBtn.style.background = autoRotate ? 'var(--primary)' : 'rgba(0,0,0,0.6)';
});

resetViewBtn.addEventListener('click', () => {
    camera.position.set(0, 2, 8);
    controls.target.set(0, 0, 0);
    controls.update();
});

let isDarkTheme = true;
themeToggle.addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    if (isDarkTheme) {
        scene.background.setHex(0x050b1a);
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        scene.background.setHex(0x87CEEB);
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
});

// ============ ANIMATION LOOP ============
function animate() {
    requestAnimationFrame(animate);
    
    time += 0.002;
    
    // Rotate Mars slowly
    mars.rotation.y += 0.002;
    clouds.rotation.y += 0.0025;
    atmosphere.rotation.y += 0.001;
    
    // Animate stars slightly
    stars.rotation.y += 0.0002;
    starsField.rotation.x += 0.0001;
    
    // Update controls
    controls.update();
    
    // Render
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

animate();

// ============ WINDOW RESIZE HANDLER ============
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

// ============ MOUSE MOVE PARALLAX EFFECT ============
let mouseX = 0;
let mouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;

document.addEventListener('mousemove', (event) => {
    if (!controls.autoRotate) {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = (event.clientY / window.innerHeight) * 2 - 1;
        targetRotationX = mouseY * 0.1;
        targetRotationY = mouseX * 0.1;
    }
});

// Smooth parallax
function updateParallax() {
    if (!controls.autoRotate) {
        mars.rotation.x += (targetRotationX - mars.rotation.x) * 0.05;
        mars.rotation.y += (targetRotationY - mars.rotation.y) * 0.05;
        clouds.rotation.x += (targetRotationX - clouds.rotation.x) * 0.05;
        clouds.rotation.y += (targetRotationY - clouds.rotation.y) * 0.05;
    }
    requestAnimationFrame(updateParallax);
}
updateParallax();

console.log('3D Mars Planet Ready!');