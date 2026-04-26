// ProgressBar.js - Renders and manages progress indicators
class ProgressBar {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(current, total, type = 'quiz') {
        const percentage = (current / total) * 100;
        
        return `
            <div class="progress-container ${type}">
                <div class="progress-info">
                    <span class="progress-label">
                        <i class="fas ${this.getIcon(type)}"></i>
                        ${this.getLabel(type)}
                    </span>
                    <span class="progress-stats">${current} / ${total}</span>
                </div>
                <div class="progress-bar-wrapper">
                    <div class="progress-bar-fill" style="width: ${percentage}%">
                        <span class="progress-percentage">${Math.round(percentage)}%</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderCircular(percentage, size = 100) {
        const radius = size / 2 - 5;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        
        return `
            <div class="circular-progress" style="width: ${size}px; height: ${size}px;">
                <svg viewBox="0 0 ${size} ${size}">
                    <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" 
                            class="circular-progress-bg"/>
                    <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" 
                            class="circular-progress-fill"
                            style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset}"/>
                </svg>
                <div class="circular-progress-value">
                    <span class="percentage">${Math.round(percentage)}</span>
                    <span class="symbol">%</span>
                </div>
            </div>
        `;
    }

    renderSteps(current, total, labels = []) {
        return `
            <div class="steps-progress">
                ${Array.from({ length: total }, (_, i) => `
                    <div class="step ${i < current ? 'completed' : i === current ? 'active' : ''}">
                        <div class="step-circle">
                            ${i < current ? '<i class="fas fa-check"></i>' : i + 1}
                        </div>
                        ${labels[i] ? `<div class="step-label">${labels[i]}</div>` : ''}
                        ${i < total - 1 ? '<div class="step-line"></div>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateProgress(element, current, total) {
        const percentage = (current / total) * 100;
        const fillElement = element.querySelector('.progress-bar-fill');
        const statsElement = element.querySelector('.progress-stats');
        
        if (fillElement) {
            fillElement.style.width = `${percentage}%`;
            const percentSpan = fillElement.querySelector('.progress-percentage');
            if (percentSpan) percentSpan.textContent = `${Math.round(percentage)}%`;
        }
        
        if (statsElement) {
            statsElement.textContent = `${current} / ${total}`;
        }
    }

    getIcon(type) {
        const icons = {
            quiz: 'fa-question-circle',
            loading: 'fa-spinner fa-pulse',
            upload: 'fa-upload',
            download: 'fa-download',
            success: 'fa-check-circle'
        };
        return icons[type] || 'fa-chart-line';
    }

    getLabel(type) {
        const labels = {
            quiz: 'Quiz Progress',
            loading: 'Loading...',
            upload: 'Uploading',
            download: 'Downloading'
        };
        return labels[type] || 'Progress';
    }

    renderSkeleton() {
        return `
            <div class="progress-skeleton">
                <div class="skeleton-header"></div>
                <div class="skeleton-bar"></div>
            </div>
        `;
    }
}

window.ProgressBar = ProgressBar;