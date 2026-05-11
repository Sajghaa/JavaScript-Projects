// FaceDetection.js - Core face detection logic
class FaceDetection {
    constructor() {
        this.isLoaded = false;
        this.models = ['tinyFaceDetector', 'faceLandmark68Net', 'faceExpressionNet', 'ageGenderNet'];
    }

    async loadModels() {
        try {
            const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js/models/';
            
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
                faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
            ]);
            
            this.isLoaded = true;
            return true;
        } catch (error) {
            console.error('Failed to load models:', error);
            return false;
        }
    }

    async detectFaces(imageElement) {
        if (!this.isLoaded) {
            throw new Error('Models not loaded yet');
        }
        
        return await faceapi.detectAllFaces(imageElement, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();
    }

    isReady() { return this.isLoaded; }
}

window.FaceDetection = FaceDetection;