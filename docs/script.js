// --- CONFIGURATION DES URLS ---
// Modification : Utilisation de l'URL Render pour la production
const API_BASE_URL = 'https://birabrickproject.onrender.com';

// Toast Notification Utility
function showToast(message, type = 'error') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-eco' : 'bg-red-600';
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';

    toast.className = `${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-scale-in transform transition-all duration-500 cursor-pointer`;
    toast.innerHTML = `
        <i class="fa-solid ${icon} text-lg"></i>
        <span class="font-medium">${message}</span>
    `;

    toast.onclick = () => toast.remove();
    container.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('opacity-0', 'translate-x-full');
            setTimeout(() => toast.remove(), 500);
        }
    }, 5000);
}

// Math Captcha Utility
function generateCaptcha() {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    const questionEl = document.getElementById('captcha-question');
    if (questionEl) questionEl.textContent = `${n1} + ${n2} = ?`;
    if (document.getElementById('captcha-n1')) document.getElementById('captcha-n1').value = n1;
    if (document.getElementById('captcha-n2')) document.getElementById('captcha-n2').value = n2;
}

// Initialize AOS (Animate on Scroll)
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });
    generateCaptcha();
});

// Mobile Menu Toggle logic
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu when a link is clicked
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
}

// Fetch CSRF token on page load
let csrfToken = null;
const csrfTokenField = document.getElementById('csrf-token-field');

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Modification : Appel à l'URL de production Render
        const response = await fetch(`${API_BASE_URL}/api/csrf-token`, {
            credentials: 'include' // Obligatoire pour les cookies signés
        });
        
        const data = await response.json();
        csrfToken = data.csrfToken;
        if (csrfTokenField) {
            csrfTokenField.value = csrfToken;
        }
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        showToast('Failed to initialize form. Please refresh the page.', 'error');
    }
});

// Simple Form Handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous error styles
        const fields = contactForm.querySelectorAll('input, select, textarea');
        fields.forEach(field => field.classList.remove('border-red-500', 'ring-2', 'ring-red-500'));

        // Clear previous error messages
        const errorMessages = contactForm.querySelectorAll('.field-error-msg');
        errorMessages.forEach(msg => {
            msg.textContent = '';
            msg.classList.add('hidden');
        });

        const submitBtn = document.getElementById('submit-btn');
        const btnText = document.getElementById('btn-text');
        const btnSpinner = document.getElementById('btn-spinner');
        const successView = document.getElementById('success-view');

        // Set loading state
        submitBtn.disabled = true;
        btnText.textContent = 'SENDING...';
        btnSpinner.classList.remove('hidden');
        submitBtn.classList.add('opacity-80', 'cursor-not-allowed');
        
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        // Ensure CSRF token is included in the data
        if (!csrfToken || !csrfTokenField || csrfTokenField.value !== csrfToken) {
            return showToast('CSRF token missing or invalid. Please refresh the page.', 'error');
        }

        try {
            // Modification : Envoi vers l'URL de production Render
            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                contactForm.classList.add('hidden');
                successView.classList.remove('hidden');
                successView.classList.add('flex');
            } else if (result.errors) {
                result.errors.forEach(err => {
                    const field = contactForm.querySelector(`[name="${err.path}"]`);
                    const errorDisplay = document.getElementById(`${err.path}-error`);

                    if (field) {
                        field.classList.add('border-red-500', 'ring-2', 'ring-red-500');
                        field.addEventListener('input', () => {
                            field.classList.remove('border-red-500', 'ring-2', 'ring-red-500');
                            if (errorDisplay) errorDisplay.classList.add('hidden');
                        }, { once: true });
                    }

                    if (errorDisplay) {
                        errorDisplay.textContent = err.msg;
                        errorDisplay.classList.remove('hidden');
                    }
                });
                showToast('Please correct the highlighted fields.');
            } else {
                showToast(result.message || 'Something went wrong. Please try again later.');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Could not connect to the server. Make sure the backend is running.');
        } finally {
            // Restore button state
            submitBtn.disabled = false;
            btnText.textContent = 'SEND MESSAGE';
            btnSpinner.classList.add('hidden');
            submitBtn.classList.remove('opacity-80', 'cursor-not-allowed');
        }
    });
}

// Handle "Send another message" reset
const resetBtn = document.getElementById('reset-form-btn');
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        const successView = document.getElementById('success-view');
        successView.classList.replace('flex', 'hidden');
        contactForm.classList.remove('hidden');
        contactForm.reset();
        generateCaptcha();
    });
}

// Scroll to Top Logic
const scrollToTopBtn = document.getElementById('scroll-to-top');
if (scrollToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.replace('opacity-0', 'opacity-100');
            scrollToTopBtn.classList.replace('invisible', 'visible');
        } else {
            scrollToTopBtn.classList.replace('opacity-100', 'opacity-0');
            scrollToTopBtn.classList.replace('visible', 'invisible');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// --- GESTION DE LA FAQ BIRABRICK ---
document.addEventListener('DOMContentLoaded', () => {
    const faqToggles = document.querySelectorAll('.faq-toggle');

    faqToggles.forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const icon = button.querySelector('i');
            
            // Fermer les autres questions pour un effet "Accordéon"
            document.querySelectorAll('.faq-content').forEach(otherContent => {
                if (otherContent !== content && !otherContent.classList.contains('hidden')) {
                    otherContent.classList.add('hidden');
                    otherContent.previousElementSibling.querySelector('i').classList.remove('rotate-45');
                }
            });

            // Basculer l'état de la question actuelle
            content.classList.toggle('hidden');
            
            // Animation de l'icône +
            if (content.classList.contains('hidden')) {
                icon.classList.remove('rotate-45');
            } else {
                icon.classList.add('rotate-45');
            }
        });
    });
});