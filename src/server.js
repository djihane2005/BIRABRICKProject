require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();

console.log("Démarrage du serveur...");
console.log("Contenu du dossier actuel (src) :", fs.readdirSync(__dirname));

// Imports locaux
const logger = require('./utils/logger');
const { contactValidationRules, validate } = require('./middleware/validators');
const contactControllerFactory = require('./controllers/contactController');

// Correction du chemin Swagger : il est dans src/middleware/config/
const swaggerDocument = YAML.load(path.join(__dirname, 'middleware/config/swagger.yaml'));

const PORT = process.env.PORT || 10000;

const asyncHandler = fn => (req, res, next) => 
    Promise.resolve(fn(req, res, next)).catch(next);

const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: 'Too many requests' },
    standardHeaders: true,
    legacyHeaders: false,
});

const { contactFormSubmission } = contactControllerFactory();

// Middlewares
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cors({
    origin: 'https://birabrick.netlify.app', // Votre URL Netlify
    credentials: true,
}));
app.use(express.json());
app.use(helmet());

// Routes
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

app.post('/api/contact', contactLimiter, contactValidationRules, validate, asyncHandler(contactFormSubmission));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((err, req, res, next) => {
    logger.error('Unhandled Error: %o', err);
    res.status(err.status || 500).json({ message: err.message });
});

app.listen(PORT, () => {
    logger.info(`Backend server running on port ${PORT}`);
});