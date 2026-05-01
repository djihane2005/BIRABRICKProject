const emailService = require('./emailService'); // Importez votre service d'e-mail
const logger = require('./logger'); // Importez votre logger professionnel

const contactControllerFactory = () => {
    // Note : On ne reçoit plus "emailQueue" car on n'utilise plus Redis
    const contactFormSubmission = async (req, res) => {
        try {
            const { name, email, subject, message, projectType } = req.body;

            // Log de la réception du formulaire
            logger.info(`Nouveau formulaire reçu de : ${email}`);

            // Envoi direct de l'e-mail au lieu de emailQueue.add()[cite: 2]
            await emailService.sendContactEmail({
                name,
                email,
                subject,
                message,
                projectType
            });

            logger.info('E-mail envoyé avec succès (Direct)');
            
            res.status(200).json({ 
                message: 'Votre message a été envoyé avec succès !' 
            });

        } catch (error) {
            logger.error('Erreur dans contactFormSubmission: %o', error);
            res.status(500).json({ 
                message: 'Une erreur est survenue lors de l\'envoi du message.' 
            });
        }
    };

    return { contactFormSubmission };
};

module.exports = contactControllerFactory;