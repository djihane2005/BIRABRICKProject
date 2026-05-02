const nodemailer = require('nodemailer'); //[cite: 6]
const ejs = require('ejs'); //[cite: 6]
const path = require('path'); //[cite: 6]

// --- MODIFICATION : Chemin vers le logger dans src/utils/ ---
// On utilise '../' pour sortir de 'services' et entrer dans 'utils'
const logger = require('../utils/logger'); 

const transporter = nodemailer.createTransport({
    service: 'gmail', //[cite: 6]
    auth: {
        user: process.env.EMAIL_USER, //[cite: 6]
        pass: process.env.EMAIL_PASS  //[cite: 6]
    },
});

/**
 * Envoie un e-mail de notification de contact
 * @param {Object} data - Données du formulaire (name, email, projectType, message)
 */
const sendContactEmail = async (data) => {
    const { name, email, projectType, message } = data; //[cite: 6]

    // --- MODIFICATION : Chemin vers le template EJS ---
    // 'path.join(__dirname, '..', ...)' permet de sortir de 'services' 
    // pour trouver le dossier 'templates' à la racine de 'src'
    const emailHtml = await ejs.renderFile(
        path.join(__dirname, '..', 'templates', 'contactEmail.ejs'),
        { name, email, projectType, message }
    );

    logger.info('Preparing to send contact email to %s', process.env.EMAIL_USER); 

    const mailOptions = {
        from: process.env.EMAIL_USER, 
        to: process.env.EMAIL_USER, 
        subject: `New Contact Form Submission from ${name}`, 
        html: emailHtml, 
    };

    return transporter.sendMail(mailOptions); 
};

module.exports = {
    sendContactEmail
}; 