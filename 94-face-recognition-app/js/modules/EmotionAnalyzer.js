// EmotionAnalyzer.js - Emotion analysis utilities
class EmotionAnalyzer {
    static getTopEmotion(expressions) {
        let topEmotion = '';
        let topValue = 0;
        for (const [emotion, value] of Object.entries(expressions)) {
            if (value > topValue) {
                topValue = value;
                topEmotion = emotion;
            }
        }
        return { emotion: topEmotion, confidence: topValue };
    }

    static aggregateEmotions(detections) {
        const aggregated = {
            happy: 0, sad: 0, angry: 0, surprised: 0, 
            fearful: 0, disgusted: 0, neutral: 0
        };
        
        detections.forEach(detection => {
            for (const [emotion, value] of Object.entries(detection.expressions)) {
                aggregated[emotion] += value;
            }
        });
        
        const count = detections.length || 1;
        for (const emotion in aggregated) {
            aggregated[emotion] = (aggregated[emotion] / count) * 100;
        }
        
        return aggregated;
    }

    static getEmotionIcon(emotion) {
        const icons = {
            happy: '😊', sad: '😢', angry: '😠', surprised: '😲',
            fearful: '😨', disgusted: '🤢', neutral: '😐'
        };
        return icons[emotion] || '😐';
    }

    static getEmotionColor(emotion) {
        const colors = {
            happy: '#10b981', sad: '#3b82f6', angry: '#ef4444',
            surprised: '#f59e0b', fearful: '#8b5cf6', disgusted: '#6b7280', neutral: '#9ca3af'
        };
        return colors[emotion] || '#6366f1';
    }
}

window.EmotionAnalyzer = EmotionAnalyzer;