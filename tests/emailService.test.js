const { sendContactEmail } = require('../../emailService');
const nodemailer = require('nodemailer');
const ejs = require('ejs');

jest.mock('nodemailer');
jest.mock('ejs');

describe('Email Service Unit Tests', () => {
    const mockTransporter = {
        sendMail: jest.fn().mockResolvedValue({ messageId: '123' })
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);
    ejs.renderFile.mockResolvedValue('<html>HTML CONTENT</html>');

    test('Should render template and call sendMail', async () => {
        const data = { name: 'Djihane', email: 'djihane@test.com', projectType: 'Professional', message: 'Hello' };
        
        await sendContactEmail(data);

        expect(ejs.renderFile).toHaveBeenCalled();
        expect(mockTransporter.sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                subject: expect.stringContaining('Djihane'), // Vérifie que le nom est dans le sujet[cite: 19]
                html: '<html>HTML CONTENT</html>'
            })
        );
    });
});