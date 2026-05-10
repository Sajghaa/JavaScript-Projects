// SceneManager.js - Manages the Three.js scene setup
class SceneManager {
    constructor() {
        this.scene = null;
        this.renderer = null;
        this.labelRenderer = null;
        this.camera = null;
        this.controls = null;
        this.clock = new THREE.Clock();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050b1a);
        this.scene.fog = new THREE.FogExp2(0x050b1a, 0.0003);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 2, 8);
        this.camera.lookAt(0, 0, 0);

        // Create WebGL renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        // Create CSS2 renderer for text labels
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0px';
        this.labelRenderer.domElement.style.left = '0px';
        this.labelRenderer.domElement.style.pointerEvents = 'none';
        document.body.appendChild(this.labelRenderer.domElement);

        // Setup orbit controls
        this.setupControls();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 1.5;
        this.controls.enableZoom = true;
        this.controls.enablePan = false;
        this.controls.zoomSpeed = 1.2;
        this.controls.rotateSpeed = 1.0;
        this.controls.target.set(0, 0, 0);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    }

    getScene() { return this.scene; }
    getCamera() { return this.camera; }
    getRenderer() { return this.renderer; }
    getLabelRenderer() { return this.labelRenderer; }
    getControls() { return this.controls; }
}

window.SceneManager = SceneManager;