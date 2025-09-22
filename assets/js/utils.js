 
// assets/js/utils.js - Yardımcı Fonksiyonlar

// PDF Generator Class
class PDFGenerator {
    constructor() {
        this.loadPDFLibrary();
    }

    async loadPDFLibrary() {
        if (typeof window.jsPDF === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            document.head.appendChild(script);
        }
    }

    generatePDF(formData) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        this.addHeader(pdf);
        this.addPersonalInfo(pdf, formData);
        this.addAnswers(pdf, formData);
        this.addFooter(pdf);
        
        this.downloadPDF(pdf, formData);
    }

    addHeader(pdf) {
        const pageWidth = pdf.internal.pageSize.width;
        
        // Header background
        pdf.setFillColor(94, 114, 228);
        pdf.rect(0, 0, pageWidth, 30, 'F');
        
        // Title
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.text('ÖĞRENCİ TANIŞMA VE BEKLENTİ FORMU', pageWidth/2, 15, { align: 'center' });
        pdf.setFontSize(12);
        pdf.text('Kurumsal Bilişim Uzmanlığı Bölümü', pageWidth/2, 22, { align: 'center' });
    }

    addPersonalInfo(pdf, formData) {
        const margin = 15;
        const pageWidth = pdf.internal.pageSize.width;
        let y = 40;

        // Date
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(9);
        const date = new Date().toLocaleDateString('tr-TR');
        pdf.text(`Tarih: ${date}`, margin, y);
        y += 8;

        // Personal Info Section
        pdf.setFillColor(240, 242, 245);
        pdf.rect(margin, y, pageWidth - (margin * 2), 25, 'F');
        
        pdf.setTextColor(94, 114, 228);
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'bold');
        pdf.text('KİŞİSEL BİLGİLER', margin + 2, y + 5);
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(9);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Ad Soyad: ${formData.name || '-'}`, margin + 2, y + 11);
        pdf.text(`Öğrenci No: ${formData.studentNo || '-'}`, margin + 70, y + 11);
        pdf.text(`E-posta: ${formData.email || '-'}`, margin + 2, y + 17);
        pdf.text(`Telefon: ${formData.phone || '-'}`, margin + 70, y + 17);
    }

    addAnswers(pdf, formData) {
        const margin = 15;
        const pageWidth = pdf.internal.pageSize.width;
        let y = 75;

        // Questions and answers
        const questions = this.getQuestionMappings();
        
        pdf.setTextColor(94, 114, 228);
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'bold');
        pdf.text('FORM YANITLARI', margin, y);
        y += 7;

        questions.forEach((q, index) => {
            if (y > 260) {
                pdf.addPage();
                y = margin;
            }
            
            // Alternating row colors
            if (index % 2 === 0) {
                pdf.setFillColor(248, 249, 250);
                pdf.rect(margin, y - 3, pageWidth - (margin * 2), 8, 'F');
            }
            
            pdf.setFont(undefined, 'bold');
            pdf.setTextColor(60, 60, 60);
            pdf.text(`${index + 1}. ${q.question}:`, margin + 2, y);
            
            pdf.setFont(undefined, 'normal');
            pdf.setTextColor(0, 0, 0);
            const answer = this.getAnswerText(formData, q.key, q.otherKey);
            const answerLines = pdf.splitTextToSize(answer, pageWidth - 45 - margin);
            pdf.text(answerLines[0], margin + 45, y);
            if (answerLines.length > 1) {
                y += 4;
                pdf.text(answerLines.slice(1).join(' '), margin + 45, y);
            }
            y += 8;
        });
        
        // Comments section
        const comments = formData.comments;
        if (comments && comments.trim()) {
            if (y > 250) {
                pdf.addPage();
                y = margin;
            }
            
            pdf.setFillColor(240, 242, 245);
            pdf.rect(margin, y, pageWidth - (margin * 2), 30, 'F');
            
            pdf.setFont(undefined, 'bold');
            pdf.setTextColor(94, 114, 228);
            pdf.text('Ek Görüş ve Öneriler:', margin + 2, y + 5);
            
            pdf.setFont(undefined, 'normal');
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(8);
            const commentLines = pdf.splitTextToSize(comments, pageWidth - 4 - margin);
            let commentY = y + 10;
            commentLines.forEach(line => {
                if (commentY < y + 28) {
                    pdf.text(line, margin + 2, commentY);
                    commentY += 4;
                }
            });
        }
    }

    addFooter(pdf) {
        const pageWidth = pdf.internal.pageSize.width;
        pdf.setTextColor(150, 150, 150);
        pdf.setFontSize(7);
        pdf.text('Bu form otomatik olarak oluşturulmuştur.', pageWidth/2, 285, { align: 'center' });
    }

    downloadPDF(pdf, formData) {
        const studentName = formData.name || 'ogrenci';
        const studentNo = formData.studentNo || '';
        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `${studentName.replace(/\s+/g, '_')}_${studentNo}_${dateStr}.pdf`;
        pdf.save(fileName);
    }

    getQuestionMappings() {
        return [
            { question: 'Bölüm tercih nedeni', key: 'reason', otherKey: 'reason_other' },
            { question: 'Hedef çalışma alanı', key: 'career', otherKey: 'career_other' },
            { question: 'Önceki deneyim', key: 'experience', otherKey: 'experience_other' },
            { question: 'BT dersi beklentisi', key: 'itexpectation', otherKey: 'itexpectation_other' },
            { question: 'Gelişim konuları', key: 'topics', otherKey: 'topics_other' },
            { question: 'Programlama deneyimi', key: 'programming', otherKey: 'programming_other' },
            { question: 'Zorlanılacak konu', key: 'difficulty', otherKey: 'difficulty_other' },
            { question: 'Öğrenme yöntemi', key: 'learning', otherKey: 'learning_other' },
            { question: 'Siber güvenlik düzeyi', key: 'security', otherKey: 'security_other' },
            { question: 'İlgi alanı (Siber)', key: 'cybertopic', otherKey: 'cybertopic_other' },
            { question: 'Güvenlik alışkanlıkları', key: 'habits', otherKey: 'habits_other' },
            { question: 'Gelişim alanı', key: 'development', otherKey: 'development_other' }
        ];
    }

    getAnswerText(formData, key, otherKey) {
        let answer = formData[key];
        
        if (answer === 'other' && formData[otherKey]) {
            return formData[otherKey];
        }
        
        if (Array.isArray(answer)) {
            return answer.join(', ');
        }
        
        return answer || '-';
    }
}

// Email Sharer Class
class EmailSharer {
    share(formData) {
        const text = this.formatDataForEmail(formData);
        const studentName = formData.name || 'Öğrenci';
        const subject = encodeURIComponent(`Öğrenci Formu - ${studentName}`);
        const body = encodeURIComponent(text);
        const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
        window.location.href = mailtoLink;
    }

    formatDataForEmail(formData) {
        const date = new Date().toLocaleDateString('tr-TR');
        
        let text = `ÖĞRENCİ TANIŞMA VE BEKLENTİ FORMU\n`;
        text += `Kurumsal Bilişim Uzmanlığı Bölümü\n`;
        text += `Tarih: ${date}\n\n`;
        text += `KİŞİSEL BİLGİLER:\n`;
        text += `Ad Soyad: ${formData.name || '-'}\n`;
        text += `Öğrenci No: ${formData.studentNo || '-'}\n`;
        text += `E-posta: ${formData.email || '-'}\n`;
        text += `Telefon: ${formData.phone || '-'}\n\n`;
        text += `SORULAR VE YANITLAR:\n\n`;
        
        const questions = [
            { q: 'Bölüm tercih nedeni', key: 'reason', otherKey: 'reason_other' },
            { q: 'Hedef çalışma alanı', key: 'career', otherKey: 'career_other' },
            { q: 'Önceki deneyim', key: 'experience', otherKey: 'experience_other' },
            { q: 'BT dersi beklentisi', key: 'itexpectation', otherKey: 'itexpectation_other' },
            { q: 'Gelişim konuları', key: 'topics', otherKey: 'topics_other' },
            { q: 'Programlama deneyimi', key: 'programming', otherKey: 'programming_other' },
            { q: 'Zorlanılacak konu', key: 'difficulty', otherKey: 'difficulty_other' },
            { q: 'Öğrenme yöntemi', key: 'learning', otherKey: 'learning_other' },
            { q: 'Siber güvenlik düzeyi', key: 'security', otherKey: 'security_other' },
            { q: 'İlgi alanı (Siber)', key: 'cybertopic', otherKey: 'cybertopic_other' },
            { q: 'Güvenlik alışkanlıkları', key: 'habits', otherKey: 'habits_other' },
            { q: 'Gelişim alanı', key: 'development', otherKey: 'development_other' }
        ];
        
        questions.forEach((item, index) => {
            const answer = this.getAnswerText(formData, item.key, item.otherKey);
            text += `${index + 1}. ${item.q}: ${answer}\n\n`;
        });
        
        if (formData.comments && formData.comments.trim()) {
            text += `Ek görüş ve öneriler: ${formData.comments}\n`;
        }
        
        return text;
    }

    getAnswerText(formData, key, otherKey) {
        let answer = formData[key];
        
        if (answer === 'other' && formData[otherKey]) {
            return formData[otherKey];
        }
        
        if (Array.isArray(answer)) {
            return answer.join(', ');
        }
        
        return answer || '-';
    }
}

// WhatsApp Sharer Class
class WhatsAppSharer {
    share(formData) {
        const text = this.formatDataForWhatsApp(formData);
        const whatsappText = encodeURIComponent(text);
        const whatsappUrl = `https://wa.me/?text=${whatsappText}`;
        window.open(whatsappUrl, '_blank');
    }

    formatDataForWhatsApp(formData) {
        // WhatsApp has character limits, so we create a shorter version
        let text = `🎓 *ÖĞRENCİ FORMU*\n`;
        text += `📚 Kurumsal Bilişim Uzmanlığı\n`;
        text += `📅 ${new Date().toLocaleDateString('tr-TR')}\n\n`;
        
        text += `👤 *${formData.name || 'Ad Soyad'}*\n`;
        text += `🆔 ${formData.studentNo || 'Öğrenci No'}\n`;
        text += `📧 ${formData.email || 'E-posta'}\n\n`;
        
        text += `🎯 *Tercih Nedeni:* ${formData.reason || '-'}\n`;
        text += `💼 *Hedef Alan:* ${formData.career || '-'}\n`;
        text += `💻 *Programlama:* ${formData.programming || '-'}\n`;
        text += `🔐 *Siber Güvenlik:* ${formData.security || '-'}\n\n`;
        
        if (formData.comments && formData.comments.trim()) {
            text += `💭 *Notlar:* ${formData.comments.substring(0, 100)}${formData.comments.length > 100 ? '...' : ''}\n`;
        }
        
        return text;
    }
}

// Utility Functions
class FormUtils {
    static formatDate(date) {
        return new Intl.DateTimeFormat('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    static sanitizeFileName(name) {
        return name.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]/g, '_');
    }

    static validateTurkishPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        return /^(90|0)?5\d{9}$/.test(cleaned);
    }

    static formatTurkishPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11 && cleaned.startsWith('0')) {
            return cleaned.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
        }
        return phone;
    }

    static exportToCSV(formData) {
        const headers = ['Tarih', 'Ad Soyad', 'Öğrenci No', 'E-posta', 'Telefon', 
                        'Tercih Nedeni', 'Hedef Alan', 'Deneyim', 'BT Beklentisi', 
                        'Programlama', 'Zorlanacak Konu', 'Öğrenme Yöntemi', 
                        'Siber Güvenlik', 'İlgi Alanı', 'Gelişim Alanı', 'Yorumlar'];
        
        const row = [
            new Date().toLocaleDateString('tr-TR'),
            formData.name || '',
            formData.studentNo || '',
            formData.email || '',
            formData.phone || '',
            formData.reason || '',
            formData.career || '',
            formData.experience || '',
            formData.itexpectation || '',
            formData.programming || '',
            formData.difficulty || '',
            formData.learning || '',
            formData.security || '',
            formData.cybertopic || '',
            formData.development || '',
            formData.comments || ''
        ];
        
        const csv = [headers.join(','), row.map(field => `"${field}"`).join(',')].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `form_data_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }
}

// Make classes globally available
window.PDFGenerator = PDFGenerator;
window.EmailSharer = EmailSharer;
window.WhatsAppSharer = WhatsAppSharer;
window.FormUtils = FormUtils;