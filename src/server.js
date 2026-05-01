require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const rateLimit = require('express-rate-limit');
const helmet = require('helmet'); // Import Helmet
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const logger = require('./logger');
const { contactValidationRules, validate } = require('./validators');
const contactControllerFactory = require('./contactController');
const PORT = 3000;

// Simple wrapper to catch async errors and pass them to the error middleware
const asyncHandler = fn => (req, res, next) => 
    Promise.resolve(fn(req, res, next)).catch(next);

// Rate Limiter: Prevents spam by limiting requests per IP
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const { contactFormSubmission } = contactControllerFactory(null);
const swaggerDocument = YAML.load('./swagger.yaml');
// On passe le secret récupéré du fichier .env
app.use(cookieParser(process.env.COOKIE_SECRET));
// Middleware
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true, // Allow cookies to be sent with requests
}));
app.use(express.json()); // Parses JSON bodies
app.use(helmet()); // Use Helmet to set security headers


// CSRF Token Generation Endpoint
app.get('/api/csrf-token', (req, res) => {
    const csrfToken = require('crypto').randomBytes(32).toString('hex');
    res.cookie('_csrf_token', csrfToken, {
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
        sameSite: 'Lax', // Protect against CSRF attacks
        signed: true, // Sign the cookie with the secret
    });
    res.json({ csrfToken });
});

// Contact Route
app.post('/api/contact', contactLimiter, contactValidationRules, validate, asyncHandler(contactFormSubmission));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled Error: %o', err);
    
    const status = err.status || 500;
    const message = err.message || 'An unexpected error occurred on the server.';
    
    res.status(status).json({ message });
});

const server = app.listen(PORT, () => {
    logger.info(`Backend server running at http://localhost:${PORT}`);
});

module.exports = { app, server };
