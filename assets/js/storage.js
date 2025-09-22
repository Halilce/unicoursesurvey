 
// assets/js/storage.js - Veri Saklama İşlemleri

class StorageManager {
    constructor() {
        this.prefix = 'survey_';
        this.autoSaveKey = this.prefix + 'autosave';
        this.completedKey = this.prefix + 'completed';
        this.settingsKey = this.prefix + 'settings';
    }

    // Auto-save functionality
    autoSave(formData) {
        try {
            const saveData = {
                data: formData,
                timestamp: Date.now(),
                version: '1.0'
            };
            
            // Use in-memory storage instead of localStorage for Claude artifacts
            if (typeof window !== 'undefined') {
                window.surveyAutoSave = saveData;
            }
            
            return true;
        } catch (error) {
            console.warn('Auto-save failed:', error);
            return false;
        }
    }

    // Load auto-saved data
    loadAutoSave() {
        try {
            // Check in-memory storage first
            if (typeof window !== 'undefined' && window.surveyAutoSave) {
                return window.surveyAutoSave.data;
            }
            
            return null;
        } catch (error) {
            console.warn('Failed to load auto-save data:', error);
            return null;
        }
    }

    // Save completed form
    saveCompleted(formData) {
        try {
            const saveData = {
                data: formData,
                completedAt: new Date().toISOString(),
                version: '1.0'
            };
            
            // Use in-memory storage
            if (typeof window !== 'undefined') {
                window.surveyCompleted = saveData;
            }
            
            return true;
        } catch (error) {
            console.error('Failed to save completed form:', error);
            return false;
        }
    }

    // Load completed form
    loadCompleted() {
        try {
            if (typeof window !== 'undefined' && window.surveyCompleted) {
                return window.surveyCompleted.data;
            }
            
            return null;
        } catch (error) {
            console.warn('Failed to load completed form:', error);
            return null;
        }
    }

    // Clear all stored data
    clearAll() {
        try {
            if (typeof window !== 'undefined') {
                delete window.surveyAutoSave;
                delete window.surveyCompleted;
                delete window.surveySettings;
            }
            return true;
        } catch (error) {
            console.error('Failed to clear storage:', error);
            return false;
        }
    }

    // Save user settings
    saveSettings(settings) {
        try {
            if (typeof window !== 'undefined') {
                window.surveySettings = {
                    ...settings,
                    updatedAt: new Date().toISOString()
                };
            }
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }

    // Load user settings
    loadSettings() {
        try {
            if (typeof window !== 'undefined' && window.surveySettings) {
                return window.surveySettings;
            }
            
            // Return default settings
            return {
                theme: 'default',
                autoSave: true,
                notifications: true,
                language: 'tr'
            };
        } catch (error) {
            console.warn('Failed to load settings:', error);
            return {};
        }
    }

    // Export data to JSON
    exportToJSON() {
        const data = {
            autoSave: this.loadAutoSave(),
            completed: this.loadCompleted(),
            settings: this.loadSettings(),
            exportedAt: new Date().toISOString()
        };
        
        return JSON.stringify(data, null, 2);
    }

    // Import data from JSON
    importFromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (data.autoSave) {
                this.autoSave(data.autoSave);
            }
            
            if (data.completed) {
                this.saveCompleted(data.completed);
            }
            
            if (data.settings) {
                this.saveSettings(data.settings);
            }
            
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }

    // Check if storage is available
    isStorageAvailable() {
        // Since we're using in-memory storage for Claude artifacts,
        // we just check if window object exists
        return typeof window !== 'undefined';
    }

    // Get storage usage info
    getStorageInfo() {
        const info = {
            available: this.isStorageAvailable(),
            hasAutoSave: !!this.loadAutoSave(),
            hasCompleted: !!this.loadCompleted(),
            hasSettings: !!window.surveySettings
        };
        
        return info;
    }

    // Backup data to download
    downloadBackup() {
        const backupData = this.exportToJSON();
        const blob = new Blob([backupData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `survey_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    // Restore data from backup file
    restoreFromBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const success = this.importFromJSON(e.target.result);
                    if (success) {
                        resolve();
                    } else {
                        reject(new Error('Failed to import backup data'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read backup file'));
            };
            
            reader.readAsText(file);
        });
    }
}

// Data validation utilities
class DataValidator {
    static validateFormData(data) {
        const errors = [];
        
        // Check required fields
        const requiredFields = ['name', 'studentNo', 'email'];
        requiredFields.forEach(field => {
            if (!data[field] || !data[field].trim()) {
                errors.push(`${field} alanı zorunludur`);
            }
        });
        
        // Validate email format
        if (data.email && !this.isValidEmail(data.email)) {
            errors.push('Geçersiz e-posta formatı');
        }
        
        // Validate student number
        if (data.studentNo && !this.isValidStudentNumber(data.studentNo)) {
            errors.push('Geçersiz öğrenci numarası');
        }
        
        // Validate phone number if provided
        if (data.phone && !this.isValidPhone(data.phone)) {
            errors.push('Geçersiz telefon numarası');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    static isValidStudentNumber(studentNo) {
        return /^\d{6,}$/.test(studentNo);
    }
    
    static isValidPhone(phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        return /^(90|0)?5\d{9}$/.test(cleanPhone);
    }
    
    static sanitizeData(data) {
        const sanitized = {};
        
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                // Basic HTML sanitization
                sanitized[key] = value
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;')
                    .trim();
            } else {
                sanitized[key] = value;
            }
        }
        
        return sanitized;
    }
}

// Make classes globally available
window.StorageManager = StorageManager;
window.DataValidator = DataValidator;