// LightingManager.js - Manages all scene lighting
class LightingManager {
    constructor(scene) {
        this.scene = scene;
        this.lights = {};
        this.init();
    }

    init() {
        this.setupAmbientLight();
        this.setupSunLight();
        this.setupFillLights();
        this.setupRimLight();
    }

    setupAmbientLight() {
        this.lights.ambient = new THREE.AmbientLight(0x222222);
        this.scene.add(this.lights.ambient);
    }

    setupSunLight() {
        this.lights.sun = new THREE.DirectionalLight(0xffeedd, 1.5);
        this.lights.sun.position.set(10, 15, 5);
        this.lights.sun.castShadow = true;
        this.lights.sun.receiveShadow = false;
        this.lights.sun.shadow.mapSize.width = 1024;
        this.lights.sun.shadow.mapSize.height = 1024;
        this.scene.add(this.lights.sun);
    }

    setupFillLights() {
        // Fill light from below
        this.lights.fill = new THREE.PointLight(0x442200, 0.3);
        this.lights.fill.position.set(0, -3, 0);
        this.scene.add(this.lights.fill);

        // Back fill light
        this.lights.back = new THREE.PointLight(0x3366ff, 0.2);
        this.lights.back.position.set(0, 2, -8);
        this.scene.add(this.lights.back);
    }

    setupRimLight() {
        this.lights.rim = new THREE.PointLight(0xff6633, 0.5);
        this.lights.rim.position.set(-5, 2, -5);
        this.scene.add(this.lights.rim);
    }

    updateIntensity(multiplier = 1) {
        Object.values(this.lights).forEach(light => {
            if (light.intensity) {
                light.intensity = light.userData?.originalIntensity || light.intensity;
            }
        });
    }

    getSunLight() { return this.lights.sun; }
}

window.LightingManager = LightingManager;