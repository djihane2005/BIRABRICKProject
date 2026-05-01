const request = require('supertest');
const { app, server } = require('../../server');

afterAll((done) => {
    server.close(done);
});

describe('API Integration Tests', () => {
    let csrfToken;
    let cookies;

    test('GET /api/csrf-token should return a token and set a cookie', async () => {
        const response = await request(app).get('/api/csrf-token');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('csrfToken');
        expect(response.headers['set-cookie']).toBeDefined();
        
        csrfToken = response.body.csrfToken;
        cookies = response.headers['set-cookie'];
    });

    test('POST /api/contact should fail without CSRF token', async () => {
        const response = await request(app)
            .post('/api/contact')
            .send({ name: 'Test' });
        
        expect(response.status).toBe(403); // Forbidden
        expect(response.body.message).toContain('CSRF');
    });

    test('POST /api/contact should fail with invalid validation', async () => {
        const response = await request(app)
            .post('/api/contact')
            .set('Cookie', cookies)
            .send({ 
                csrfToken, 
                name: 'T' // Too short
            });
        
        expect(response.status).toBe(400);
    });
});