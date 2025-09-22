 
// assets/js/app.js - Ana Uygulama Dosyası

class SurveyApp {
    constructor() {
        this.form = document.getElementById('studentForm');
        this.loadingElement = document.getElementById('loading');
        this.successMessage = document.getElementById('successMessage');
        this.currentStep = 1;
        this.totalSteps = 5;
        
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.setupValidation();
        this.loadSavedData();
    }

    attachEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Other inputs toggle
        this.setupOtherInputs();

        // Auto-save functionality
        this.form.addEventListener('input', () => {
            this.autoSave();
        });

        // PDF download
        document.getElementById('downloadPdf')?.addEventListener('click', () => {
            this.downloadPDF();
        });

        // Email share
        document.getElementById('sendEmail')?.addEventListener('click', () => {
            this.shareViaEmail();
        });

        // WhatsApp share
        document.getElementById('sendWhatsapp')?.addEventListener('click', () => {
            this.shareViaWhatsApp();
        });
    }

    setupOtherInputs() {
        const otherRadios = document.querySelectorAll('input[type="radio"][value="other"]');
        const otherCheckboxes = document.querySelectorAll('input[type="checkbox"][value="other"]');

        [...otherRadios, ...otherCheckboxes].forEach(input => {
            input.addEventListener('change', (e) => {
                const otherInputId = e.target.id + 'Text';
                this.toggleOtherInput(otherInputId);
            });
        });
    }

    toggleOtherInput(inputId) {
        const otherInput = document.getElementById(inputId);
        if (otherInput) {
            otherInput.classList.toggle('active');
            if (otherInput.classList.contains('active')) {
                otherInput.focus();
                otherInput.required = true;
            } else {
                otherInput.required = false;
                otherInput.value = '';
            }
        }
    }

    setupValidation() {
        // Email validation
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                this.validateEmail(e.target);
            });
        }

        // Phone number validation
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.validatePhone(e.target);
            });
        }

        // Student number validation
        const studentNoInput = document.getElementById('studentNo');
        if (studentNoInput) {
            studentNoInput.addEventListener('input', (e) => {
                this.validateStudentNumber(e.target);
            });
        }
    }

    validateEmail(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(input.value);
        
        this.setValidationState(input, isValid, 'Geçerli bir e-posta adresi giriniz');
        return isValid;
    }

    validatePhone(input) {
        const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
        const cleanPhone = input.value.replace(/\s/g, '');
        const isValid = phoneRegex.test(cleanPhone);
        
        this.setValidationState(input, isValid, 'Geçerli bir telefon numarası giriniz (05XX XXX XX XX)');
        return isValid;
    }

    validateStudentNumber(input) {
        const isValid = input.value.length >= 6 && /^\d+$/.test(input.value);
        
        this.setValidationState(input, isValid, 'Öğrenci numarası en az 6 haneli olmalıdır');
        return isValid;
    }

    setValidationState(input, isValid, message) {
        const container = input.closest('.form-group');
        let errorElement = container.querySelector('.error-message');
        
        if (!isValid) {
            input.style.borderColor = '#e74c3c';
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                errorElement.style.color = '#e74c3c';
                errorElement.style.fontSize = '12px';
                errorElement.style.marginTop = '5px';
                container.appendChild(errorElement);
            }
            errorElement.textContent = message;
        } else {
            input.style.borderColor = '#27ae60';
            if (errorElement) {
                errorElement.remove();
            }
        }
    }

    handleFormSubmit() {
        if (!this.validateForm()) {
            this.showError('Lütfen tüm zorunlu alanları doğru şekilde doldurunuz.');
            return;
        }

        this.showLoading(true);
        
        // Simulate processing time
        setTimeout(() => {
            this.showSuccess();
            this.showActionButtons();
            this.saveFormData();
            this.showLoading(false);
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1000);
    }

    validateForm() {
        let isValid = true;
        
        // Required fields validation
        const requiredFields = ['name', 'studentNo', 'email'];
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (!field.value.trim()) {
                this.setValidationState(field, false, 'Bu alan zorunludur');
                isValid = false;
            }
        });

        // Radio group validation
        const radioGroups = ['reason', 'career', 'experience', 'itexpectation', 'programming', 
                           'difficulty', 'learning', 'security', 'cybertopic', 'development'];
        
        radioGroups.forEach(groupName => {
            const selected = document.querySelector(`input[name="${groupName}"]:checked`);
            if (!selected) {
                this.showGroupError(groupName, 'Lütfen bir seçenek işaretleyiniz');
                isValid = false;
            } else if (selected.value === 'other') {
                const otherInput = document.getElementById(selected.id + 'Text');
                if (otherInput && !otherInput.value.trim()) {
                    this.setValidationState(otherInput, false, 'Lütfen açıklama giriniz');
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    showGroupError(groupName, message) {
        const group = document.querySelector(`input[name="${groupName}"]`)?.closest('.form-group');
        if (group) {
            let errorElement = group.querySelector('.group-error');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'group-error';
                errorElement.style.color = '#e74c3c';
                errorElement.style.fontSize = '12px';
                errorElement.style.marginTop = '5px';
                errorElement.style.fontWeight = 'bold';
                group.appendChild(errorElement);
            }
            errorElement.textContent = message;
            
            // Remove error after selection
            const inputs = group.querySelectorAll('input[type="radio"]');
            inputs.forEach(input => {
                input.addEventListener('change', () => {
                    errorElement.remove();
                });
            });
        }
    }

    showLoading(show) {
        if (show) {
            this.loadingElement.classList.add('active');
        } else {
            this.loadingElement.classList.remove('active');
        }
    }

    showSuccess() {
        this.successMessage.classList.add('active');
    }

    showActionButtons() {
        const buttons = ['downloadPdf', 'sendEmail', 'sendWhatsapp'];
        buttons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.style.display = 'inline-block';
            }
        });
    }

    showError(message) {
        alert(message); // Replace with a better error display
    }

    autoSave() {
        const formData = this.getFormData();
        localStorage.setItem('surveyAutoSave', JSON.stringify(formData));
    }

    loadSavedData() {
        try {
            const savedData = localStorage.getItem('surveyAutoSave');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.populateForm(data);
            }
        } catch (e) {
            console.warn('Kaydedilmiş veri yüklenemedi:', e);
        }
    }

    populateForm(data) {
        Object.keys(data).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = data[key];
            }
        });
    }

    saveFormData() {
        const formData = this.getFormData();
        localStorage.setItem('surveyCompleted', JSON.stringify({
            ...formData,
            completedAt: new Date().toISOString()
        }));
    }

    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        // Handle other inputs
        const otherInputs = document.querySelectorAll('.other-input.active');
        otherInputs.forEach(input => {
            if (input.value.trim()) {
                const baseId = input.id.replace('Text', '');
                data[baseId + '_other'] = input.value;
            }
        });
        
        return data;
    }

    downloadPDF() {
        if (typeof PDFGenerator !== 'undefined') {
            const pdfGenerator = new PDFGenerator();
            pdfGenerator.generatePDF(this.getFormData());
        } else {
            console.error('PDF Generator not loaded');
        }
    }

    shareViaEmail() {
        if (typeof EmailSharer !== 'undefined') {
            const emailSharer = new EmailSharer();
            emailSharer.share(this.getFormData());
        }
    }

    shareViaWhatsApp() {
        if (typeof WhatsAppSharer !== 'undefined') {
            const whatsappSharer = new WhatsAppSharer();
            whatsappSharer.share(this.getFormData());
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.surveyApp = new SurveyApp();
});

// Global function for backward compatibility
function toggleOther(inputId) {
    if (window.surveyApp) {
        window.surveyApp.toggleOtherInput(inputId);
    }
}