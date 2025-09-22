 
// assets/js/ui.js - Kullanıcı Arayüzü İşlemleri

class UIManager {
    constructor() {
        this.currentSection = 0;
        this.totalSections = 6; // personal + 5 sections
        this.progressBar = null;
        this.isStepByStep = false;
        
        this.init();
    }

    init() {
        this.createProgressBar();
        this.setupSectionNavigation();
        this.setupAnimations();
        this.setupNotifications();
    }

    createProgressBar() {
        const header = document.querySelector('.header');
        if (header) {
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container';
            progressContainer.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="progress-text" id="progressText">Bölüm 1 / ${this.totalSections}</div>
            `;
            
            header.appendChild(progressContainer);
            this.progressBar = document.getElementById('progressFill');
            
            // Add progress bar styles
            this.addProgressBarStyles();
        }
    }

    addProgressBarStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .progress-container {
                margin-top: 20px;
                text-align: center;
            }
            
            .progress-bar {
                width: 100%;
                height: 8px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 10px;
            }
            
            .progress-fill {
                height: 100%;
                background: rgba(255, 255, 255, 0.8);
                width: 0%;
                transition: width 0.3s ease;
                border-radius: 4px;
            }
            
            .progress-text {
                color: rgba(255, 255, 255, 0.9);
                font-size: 14px;
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);
    }

    setupSectionNavigation() {
        // Add navigation buttons to each section
        const sections = document.querySelectorAll('.section');
        sections.forEach((section, index) => {
            const navContainer = document.createElement('div');
            navContainer.className = 'section-navigation';
            navContainer.innerHTML = `
                <button type="button" class="nav-btn nav-prev" ${index === 0 ? 'disabled' : ''}>
                    ← Önceki
                </button>
                <button type="button" class="nav-btn nav-next" ${index === sections.length - 1 ? 'style="display:none"' : ''}>
                    Sonraki →
                </button>
            `;
            
            section.appendChild(navContainer);
            
            // Add event listeners
            const prevBtn = navContainer.querySelector('.nav-prev');
            const nextBtn = navContainer.querySelector('.nav-next');
            
            if (prevBtn) {
                prevBtn.addEventListener('click', () => this.goToPreviousSection(index));
            }
            
            if (nextBtn) {
                nextBtn.addEventListener('click', () => this.goToNextSection(index));
            }
        });
        
        // Add navigation styles
        this.addNavigationStyles();
    }

    addNavigationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .section-navigation {
                display: flex;
                justify-content: space-between;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e1e8ed;
            }
            
            .nav-btn {
                padding: 10px 20px;
                border: 2px solid #5e72e4;
                background: white;
                color: #5e72e4;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            .nav-btn:hover:not(:disabled) {
                background: #5e72e4;
                color: white;
                transform: translateY(-1px);
            }
            
            .nav-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .section-hidden {
                display: none;
            }
            
            .section-visible {
                display: block;
                animation: fadeInUp 0.5s ease;
            }
        `;
        document.head.appendChild(style);
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        // Observe all sections
        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });

        // Add animation styles
        this.addAnimationStyles();
    }

    addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .section {
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.6s ease;
            }
            
            .section.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .form-group {
                transition: all 0.3s ease;
            }
            
            .form-group:focus-within {
                transform: translateX(5px);
            }
            
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                z-index: 10000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification.success {
                background: #28a745;
            }
            
            .notification.error {
                background: #dc3545;
            }
            
            .notification.warning {
                background: #ffc107;
                color: #212529;
            }
            
            .notification.info {
                background: #17a2b8;
            }
        `;
        document.head.appendChild(style);
    }

    setupNotifications() {
        // Create notification container
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'notificationContainer';
        document.body.appendChild(this.notificationContainer);
    }

    goToNextSection(currentIndex) {
        if (this.validateCurrentSection(currentIndex)) {
            this.currentSection = Math.min(currentIndex + 1, this.totalSections - 1);
            this.updateProgress();
            this.scrollToSection(currentIndex + 1);
        }
    }

    goToPreviousSection(currentIndex) {
        this.currentSection = Math.max(currentIndex - 1, 0);
        this.updateProgress();
        this.scrollToSection(currentIndex - 1);
    }

    validateCurrentSection(sectionIndex) {
        const section = document.querySelectorAll('.section')[sectionIndex];
        if (!section) return true;

        // Check required fields in current section
        const requiredInputs = section.querySelectorAll('input[required], select[required]');
        let isValid = true;

        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                this.highlightError(input);
                isValid = false;
            } else {
                this.clearError(input);
            }
        });

        // Check radio groups
        const radioGroups = this.getRadioGroupsInSection(section);
        radioGroups.forEach(groupName => {
            const checked = section.querySelector(`input[name="${groupName}"]:checked`);
            if (!checked) {
                this.showNotification('Lütfen tüm soruları yanıtlayın', 'warning');
                isValid = false;
            }
        });

        return isValid;
    }

    getRadioGroupsInSection(section) {
        const radioInputs = section.querySelectorAll('input[type="radio"]');
        const groups = new Set();
        radioInputs.forEach(input => groups.add(input.name));
        return Array.from(groups);
    }

    highlightError(element) {
        element.style.borderColor = '#dc3545';
        element.classList.add('error');
        
        // Add shake animation
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    clearError(element) {
        element.style.borderColor = '';
        element.classList.remove('error');
    }

    scrollToSection(sectionIndex) {
        const sections = document.querySelectorAll('.section');
        if (sections[sectionIndex]) {
            sections[sectionIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    updateProgress() {
        if (this.progressBar) {
            const progress = ((this.currentSection + 1) / this.totalSections) * 100;
            this.progressBar.style.width = `${progress}%`;
            
            const progressText = document.getElementById('progressText');
            if (progressText) {
                progressText.textContent = `Bölüm ${this.currentSection + 1} / ${this.totalSections}`;
            }
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        this.notificationContainer.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    showLoading(show, message = 'İşlem yapılıyor...') {
        let loading = document.getElementById('loading');
        
        if (show) {
            if (!loading) {
                loading = document.createElement('div');
                loading.id = 'loading';
                loading.className = 'loading';
                loading.innerHTML = `
                    <div class="loading-content">
                        <div class="spinner"></div>
                        <div class="loading-text">${message}</div>
                    </div>
                `;
                document.body.appendChild(loading);
            }
            loading.classList.add('active');
        } else {
            if (loading) {
                loading.classList.remove('active');
            }
        }
    }

    enableStepByStepMode() {
        this.isStepByStep = true;
        const sections = document.querySelectorAll('.section');
        
        // Hide all sections except the first
        sections.forEach((section, index) => {
            if (index > 0) {
                section.style.display = 'none';
            }
        });
        
        this.updateProgress();
    }

    showConfirmDialog(message, onConfirm, onCancel) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Onay</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelBtn">İptal</button>
                    <button class="btn btn-primary" id="confirmBtn">Onayla</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Add modal styles
        this.addModalStyles();
        
        // Event listeners
        document.getElementById('confirmBtn').onclick = () => {
            document.body.removeChild(overlay);
            if (onConfirm) onConfirm();
        };
        
        document.getElementById('cancelBtn').onclick = () => {
            document.body.removeChild(overlay);
            if (onCancel) onCancel();
        };
        
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                if (onCancel) onCancel();
            }
        };
    }

    addModalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            
            .modal-content {
                background: white;
                border-radius: 12px;
                min-width: 400px;
                max-width: 90vw;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: modalSlideIn 0.3s ease;
            }
            
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #e1e8ed;
            }
            
            .modal-header h3 {
                margin: 0;
                color: #2c3e50;
            }
            
            .modal-body {
                padding: 20px;
            }
            
            .modal-footer {
                padding: 20px;
                border-top: 1px solid #e1e8ed;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
    }

    createTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        
        element.addEventListener('mouseenter', () => {
            document.body.appendChild(tooltip);
            const rect = element.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2}px`;
            tooltip.style.top = `${rect.top - 35}px`;
            tooltip.classList.add('show');
        });
        
        element.addEventListener('mouseleave', () => {
            if (tooltip.parentNode) {
                tooltip.classList.remove('show');
                setTimeout(() => {
                    if (tooltip.parentNode) {
                        document.body.removeChild(tooltip);
                    }
                }, 200);
            }
        });
    }

    addTooltipStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .tooltip {
                position: absolute;
                background: #333;
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                pointer-events: none;
                z-index: 1000;
                opacity: 0;
                transform: translateX(-50%) translateY(5px);
                transition: all 0.2s ease;
            }
            
            .tooltip.show {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            
            .tooltip::after {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                margin-left: -5px;
                border: 5px solid transparent;
                border-top-color: #333;
            }
        `;
        document.head.appendChild(style);
    }
}

// Make UIManager globally available
window.UIManager = UIManager;