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
        const data = { name: 'John', email: 'john@test.com', projectType: 'Residential', message: 'Hello world' };
        
        await sendContactEmail(data);

        expect(ejs.renderFile).toHaveBeenCalled();
        expect(mockTransporter.sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                subject: expect.stringContaining('John'),
                html: '<html>HTML CONTENT</html>'
            })
        );
    });
});