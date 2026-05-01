const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Utilise le service prédéfini pour Gmail
    auth: {
        user: process.env.EMAIL_USER, // Votre adresse Gmail
        pass: process.env.EMAIL_PASS  // Votre "Mot de passe d'application"
    },
});

/**
 * Sends a contact notification email
 * @param {Object} data - Form data (name, email, projectType, message)
 */
const sendContactEmail = async (data) => {
    const { name, email, projectType, message } = data;

    // Render the EJS template with the provided data
    const emailHtml = await ejs.renderFile(
        path.join(__dirname, 'templates', 'contactEmail.ejs'),
        { name, email, projectType, message }
    );

    logger.info('Preparing to send contact email to %s', process.env.EMAIL_USER);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Recipient address
        subject: `New Contact Form Submission from ${name}`,
        html: emailHtml, // Use the rendered HTML from the EJS template
    };

    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendContactEmail
};