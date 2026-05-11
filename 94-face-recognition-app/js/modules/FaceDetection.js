class FaceDetection {
    constructor() {
        this.isLoaded = false;
        this.model = null;
    }
    
    async loadModels() {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js/models/';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
        this.isLoaded = true;
    }
    
    async detect(imageElement) {
        if (!this.isLoaded) return null;
        return await faceapi.detectAllFaces(imageElement, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();
    }
}

window.FaceDetection = FaceDetection;