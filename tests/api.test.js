const request = require('supertest');
const { app, server } = require('../../server');

// On définit un secret pour les tests (doit correspondre à celui utilisé par le middleware en mode test)
process.env.COOKIE_SECRET = 'test_secret_123';

afterAll((done) => {
    server.close(done);
});

describe('API Integration Tests', () => {
    let csrfToken;
    let cookies;

    test('GET /api/csrf-token should return a token and set a signed cookie', async () => {
        const response = await request(app).get('/api/csrf-token');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('csrfToken');
        expect(response.headers['set-cookie']).toBeDefined();
        
        csrfToken = response.body.csrfToken;
        // Supertest récupère le cookie signé ici[cite: 18]
        cookies = response.headers['set-cookie'];
    });

    test('POST /api/contact should fail without CSRF token', async () => {
        const response = await request(app)
            .post('/api/contact')
            .send({ name: 'Test' });
        
        expect(response.status).toBe(403); 
        expect(response.body.message).toContain('CSRF');
    });

    test('POST /api/contact should fail with invalid validation', async () => {
        const response = await request(app)
            .post('/api/contact')
            .set('Cookie', cookies) // Envoie le cookie signé récupéré précédemment[cite: 18]
            .send({ 
                csrfToken, 
                name: 'D' // Nom trop court pour la validation[cite: 18]
            });
        
        expect(response.status).toBe(400);
    });
});