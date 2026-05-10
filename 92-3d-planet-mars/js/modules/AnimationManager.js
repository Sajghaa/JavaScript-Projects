// AnimationManager.js - Manages all animations and the render loop
class AnimationManager {
    constructor(sceneManager, planetManager, cameraManager) {
        this.sceneManager = sceneManager;
        this.planetManager = planetManager;
        this.cameraManager = cameraManager;
        this.isRunning = true;
        this.time = 0;
    }

    start() {
        this.animate();
    }

    animate() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.002;
        
        // Update planet rotation
        this.planetManager.updateRotation(0.002);
        
        // Update camera parallax effect
        this.cameraManager.updateParallax(this.planetManager.getPlanet());
        
        // Update controls
        const controls = this.sceneManager.getControls();
        if (controls) controls.update();
        
        // Render scenes
        const renderer = this.sceneManager.getRenderer();
        const labelRenderer = this.sceneManager.getLabelRenderer();
        const scene = this.sceneManager.getScene();
        const camera = this.sceneManager.getCamera();
        
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
            if (labelRenderer) labelRenderer.render(scene, camera);
        }
    }

    stop() {
        this.isRunning = false;
    }

    getTime() { return this.time; }
}

window.AnimationManager = AnimationManager;