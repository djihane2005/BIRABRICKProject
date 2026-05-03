const API_BASE_URL = 'https://birabrickproject.onrender.com';

// Gestion du menu mobile
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Initialisation du CAPTCHA et CSRF
document.addEventListener('DOMContentLoaded', () => {
    generateCaptcha();
    fetchCsrfToken();
});

function generateCaptcha() {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    document.getElementById('captcha-question').textContent = `${n1} + ${n2} = ?`;
    document.getElementById('captcha-n1').value = n1;
    document.getElementById('captcha-n2').value = n2;
}

async function fetchCsrfToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/csrf-token`, { 
            credentials: 'include' 
        });
        const data = await response.json();
        document.getElementById('csrf-token-field').value = data.csrfToken;
    } catch (err) {
        console.error("Erreur de récupération du token CSRF", err);
    }
}

// Envoi du formulaire
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('submit-btn');
        const spinner = document.getElementById('btn-spinner');
        const btnText = document.getElementById('btn-text');

        // Reset errors
        document.querySelectorAll('.field-error-msg').forEach(el => el.classList.add('hidden'));

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        // Validation Captcha côté client
        if (parseInt(data.captcha_ans) !== (parseInt(data.captcha_n1) + parseInt(data.captcha_n2))) {
            document.getElementById('captcha_ans-error').textContent = "Calcul incorrect";
            document.getElementById('captcha_ans-error').classList.remove('hidden');
            return;
        }

        try {
            btn.disabled = true;
            spinner.classList.remove('hidden');
            btnText.textContent = "SENDING...";

            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-csrf-token': data.csrfToken 
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });

            const result = await response.json();

            if (response.ok) {
                contactForm.classList.add('hidden');
                document.getElementById('success-view').classList.remove('hidden');
            } else {
                alert(result.message || "Une erreur est survenue");
            }
        } catch (error) {
            console.error("Erreur:", error);
            alert("Impossible de contacter le serveur.");
        } finally {
            btn.disabled = false;
            spinner.classList.add('hidden');
            btnText.textContent = "SEND MESSAGE";
        }
    });
}

// FAQ Toggle
document.querySelectorAll('.faq-toggle').forEach(button => {
    button.addEventListener('click', () => {
        const content = button.nextElementSibling;
        const icon = button.querySelector('i');
        content.classList.toggle('hidden');
        icon.classList.toggle('rotate-45');
    });
});