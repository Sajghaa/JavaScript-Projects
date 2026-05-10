// app.js - Main application using modular architecture
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// Make Three.js available globally
window.THREE = THREE;
window.OrbitControls = OrbitControls;
window.CSS2DRenderer = CSS2DRenderer;
window.CSS2DObject = CSS2DObject;

// Import our modules (they will register themselves globally)
import './modules/SceneManager.js';
import './modules/CameraManager.js';
import './modules/LightingManager.js';
import './modules/PlanetManager.js';
import './modules/AnimationManager.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Create scene manager
    const sceneManager = new SceneManager();
    sceneManager.init();
    
    // Get scene reference
    const scene = sceneManager.getScene();
    
    // Create lighting manager
    const lightingManager = new LightingManager(scene);
    
    // Create planet manager
    const planetManager = new PlanetManager(scene, lightingManager);
    
    // Create camera manager
    const cameraManager = new CameraManager(sceneManager);
    
    // Create animation manager
    const animationManager = new AnimationManager(sceneManager, planetManager, cameraManager);
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    let isDarkTheme = true;
    
    if (themeToggle) {
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
    }
    
    // Start animation
    animationManager.start();
    
    console.log('3D Mars Planet Ready!');
});