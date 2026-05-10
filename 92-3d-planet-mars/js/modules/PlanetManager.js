// PlanetManager.js - Manages planet creation and textures
class PlanetManager {
    constructor(scene, lightingManager) {
        this.scene = scene;
        this.lightingManager = lightingManager;
        this.planet = null;
        this.atmosphere = null;
        this.clouds = null;
        this.textureLoader = new THREE.TextureLoader();
        this.texturesLoaded = 0;
        this.totalTextures = 3;
        this.init();
    }

    init() {
        this.loadTextures();
        this.createPlanet();
        this.createAtmosphere();
        this.createClouds();
        this.createOrbitRing();
        this.createStarfield();
    }

    loadTextures() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        
        this.marsMap = this.textureLoader.load('https://threejs.org/examples/textures/planets/mars_atmos_2048.jpg');
        this.marsMap.onLoad = () => this.onTextureLoaded();
        
        this.marsBumpMap = this.textureLoader.load('https://threejs.org/examples/textures/planets/mars_normal_2048.jpg');
        this.marsBumpMap.onLoad = () => this.onTextureLoaded();
        
        this.marsSpecularMap = this.textureLoader.load('https://threejs.org/examples/textures/planets/mars_specular_2048.jpg');
        this.marsSpecularMap.onLoad = () => this.onTextureLoaded();
        
        this.cloudTexture = this.textureLoader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png');
    }

    onTextureLoaded() {
        this.texturesLoaded++;
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (this.texturesLoaded === this.totalTextures && loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
    }

    createPlanet() {
        const geometry = new THREE.SphereGeometry(2, 128, 128);
        const material = new THREE.MeshStandardMaterial({
            map: this.marsMap,
            bumpMap: this.marsBumpMap,
            bumpScale: 0.05,
            roughness: 0.7,
            metalness: 0.1,
            emissive: new THREE.Color(0x331100),
            emissiveIntensity: 0.15
        });
        
        this.planet = new THREE.Mesh(geometry, material);
        this.planet.castShadow = true;
        this.planet.receiveShadow = true;
        this.scene.add(this.planet);
        
        this.createLabel();
    }

    createAtmosphere() {
        const geometry = new THREE.SphereGeometry(2.05, 128, 128);
        const material = new THREE.MeshPhongMaterial({
            color: 0xff6633,
            transparent: true,
            opacity: 0.12,
            side: THREE.BackSide
        });
        this.atmosphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.atmosphere);
    }

    createClouds() {
        const geometry = new THREE.SphereGeometry(2.02, 128, 128);
        const material = new THREE.MeshPhongMaterial({
            map: this.cloudTexture,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending
        });
        this.clouds = new THREE.Mesh(geometry, material);
        this.scene.add(this.clouds);
    }

    createLabel() {
        const planetDiv = document.createElement('div');
        planetDiv.textContent = '🔴 MARS';
        planetDiv.style.cssText = `
            color: #ff8866;
            font-size: 20px;
            font-weight: bold;
            text-shadow: 0 0 10px rgba(0,0,0,0.5);
            font-family: 'Inter', sans-serif;
            letter-spacing: 2px;
            background: rgba(0,0,0,0.5);
            padding: 4px 12px;
            border-radius: 30px;
            border: 1px solid rgba(255,136,102,0.5);
            backdrop-filter: blur(5px);
        `;
        
        this.planetLabel = new CSS2DObject(planetDiv);
        this.planetLabel.position.set(0, 2.3, 0);
        this.scene.add(this.planetLabel);
    }

    createOrbitRing() {
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
        const orbitMaterial = new THREE.LineBasicMaterial({ 
            color: 0xff6633, 
            transparent: true, 
            opacity: 0.3 
        });
        const orbitRing = new THREE.LineLoop(orbitGeometry, orbitMaterial);
        this.scene.add(orbitRing);
    }

    createStarfield() {
        // Near stars
        const starCount1 = 2000;
        const starGeometry1 = new THREE.BufferGeometry();
        const starPositions1 = new Float32Array(starCount1 * 3);
        
        for (let i = 0; i < starCount1; i++) {
            starPositions1[i * 3] = (Math.random() - 0.5) * 800;
            starPositions1[i * 3 + 1] = (Math.random() - 0.5) * 800;
            starPositions1[i * 3 + 2] = (Math.random() - 0.5) * 200 - 50;
        }
        starGeometry1.setAttribute('position', new THREE.BufferAttribute(starPositions1, 3));
        const starMaterial1 = new THREE.PointsMaterial({ color: 0xffffff, size: 0.25, transparent: true, opacity: 0.8 });
        this.stars1 = new THREE.Points(starGeometry1, starMaterial1);
        this.scene.add(this.stars1);
        
        // Distant stars
        const starCount2 = 4000;
        const starGeometry2 = new THREE.BufferGeometry();
        const starPositions2 = new Float32Array(starCount2 * 3);
        
        for (let i = 0; i < starCount2; i++) {
            starPositions2[i * 3] = (Math.random() - 0.5) * 2000;
            starPositions2[i * 3 + 1] = (Math.random() - 0.5) * 2000;
            starPositions2[i * 3 + 2] = (Math.random() - 0.5) * 500 - 200;
        }
        starGeometry2.setAttribute('position', new THREE.BufferAttribute(starPositions2, 3));
        const starMaterial2 = new THREE.PointsMaterial({ color: 0x88aaff, size: 0.15, transparent: true, opacity: 0.6 });
        this.stars2 = new THREE.Points(starGeometry2, starMaterial2);
        this.scene.add(this.stars2);
    }

    getPlanet() { return this.planet; }
    getClouds() { return this.clouds; }
    getAtmosphere() { return this.atmosphere; }
    
    updateRotation(speed = 0.002) {
        if (this.planet) this.planet.rotation.y += speed;
        if (this.clouds) this.clouds.rotation.y += speed * 1.2;
        if (this.atmosphere) this.atmosphere.rotation.y += speed * 0.8;
        if (this.stars1) this.stars1.rotation.y += 0.0002;
        if (this.stars2) this.stars2.rotation.x += 0.0001;
    }
}

window.PlanetManager = PlanetManager;