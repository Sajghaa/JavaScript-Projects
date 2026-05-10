// CameraManager.js - Manages camera movements and interactions
class CameraManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.camera = sceneManager.getCamera();
        this.controls = sceneManager.getControls();
        this.autoRotate = true;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.init();
    }

    init() {
        this.setupMouseMove();
        this.setupControlsUI();
    }

    setupMouseMove() {
        document.addEventListener('mousemove', (event) => {
            if (!this.controls.autoRotate) {
                this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
                this.mouseY = (event.clientY / window.innerHeight) * 2 - 1;
                this.targetRotationX = this.mouseY * 0.1;
                this.targetRotationY = this.mouseX * 0.1;
            }
        });
    }

    setupControlsUI() {
        const autoRotateBtn = document.getElementById('autoRotateBtn');
        const resetViewBtn = document.getElementById('resetViewBtn');

        if (autoRotateBtn) {
            autoRotateBtn.addEventListener('click', () => {
                this.toggleAutoRotate();
                autoRotateBtn.style.background = this.autoRotate ? 'var(--primary)' : 'rgba(0,0,0,0.6)';
            });
        }

        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => this.resetView());
        }
    }

    toggleAutoRotate() {
        this.autoRotate = !this.autoRotate;
        this.controls.autoRotate = this.autoRotate;
    }

    resetView() {
        this.camera.position.set(0, 2, 8);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    updateParallax(planet) {
        if (!this.controls.autoRotate && planet) {
            planet.rotation.x += (this.targetRotationX - planet.rotation.x) * 0.05;
            planet.rotation.y += (this.targetRotationY - planet.rotation.y) * 0.05;
        }
    }

    getAutoRotate() { return this.autoRotate; }
}

window.CameraManager = CameraManager;