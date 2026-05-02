require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

console.log("Démarrage du serveur...");
console.log("Contenu du dossier actuel (src) :", fs.readdirSync(__dirname));

// Vérifiez bien que ces dossiers existent sur GitHub :
const logger = require('./utils/logger');
const { contactValidationRules, validate } = require('./middleware/validators');
const contactControllerFactory = require('./controllers/contactController');
const swaggerDocument = require('yamljs').load(path.join(__dirname, 'config/swagger.yaml'));

const PORT = process.env.PORT || 3000; // Utilise le port de l'hébergeur (Render/Railway) ou 3000

// Wrapper pour erreurs async
const asyncHandler = fn => (req, res, next) => 
    Promise.resolve(fn(req, res, next)).catch(next);

// Rate Limiter
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const { contactFormSubmission } = contactControllerFactory(null);

// Configuration des Middlewares
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cors({
    // IMPORTANT: Remplacez par l'URL de votre site public (GitHub Pages ou Netlify)
    origin: process.env.FRONTEND_URL || 'http://127.0.0.1:5500', 
    credentials: true,
}));
app.use(express.json());
app.use(helmet());

// CSRF Token Generation
app.get('/api/csrf-token', (req, res) => {
    const csrfToken = require('crypto').randomBytes(32).toString('hex');
    res.cookie('_csrf_token', csrfToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        signed: true,
    });
    res.json({ csrfToken });
});

// Route Contact
app.post('/api/contact', contactLimiter, contactValidationRules, validate, asyncHandler(contactFormSubmission));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Gestion des erreurs centralisée
app.use((err, req, res, next) => {
    logger.error('Unhandled Error: %o', err);
    const status = err.status || 500;
    const message = err.message || 'An unexpected error occurred on the server.';
    res.status(status).json({ message });
});

const server = app.listen(PORT, () => {
    logger.info(`Backend server running on port ${PORT}`);
});

module.exports = { app, server };