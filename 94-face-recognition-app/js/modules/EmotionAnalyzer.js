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
            happy: 0, sad: 0, angry: 0, surprised: 0, fearful: 0, disgusted: 0, neutral: 0
        };
        detections.forEach(d => {
            for (const [emotion, value] of Object.entries(d.expressions)) {
                aggregated[emotion] += value;
            }
        });
        for (const e in aggregated) {
            aggregated[e] = (aggregated[e] / detections.length) * 100;
        }
        return aggregated;
    }
    
    static getEmotionIcon(emotion) {
        const icons = {
            happy: '😊', sad: '😢', angry: '😠', surprised: '😲', fearful: '😨', disgusted: '🤢', neutral: '😐'
        };
        return icons[emotion] || '😐';
    }
}

window.EmotionAnalyzer = EmotionAnalyzer;