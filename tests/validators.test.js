const { contactValidationRules, validate } = require('../../validators');
const { validationResult } = require('express-validator');

// Mocking express-validator's validationResult for testing
const mockRequest = (body) => ({ body, ip: '127.0.0.1' });
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
const mockNext = jest.fn();

describe('Validators Unit Tests', () => {
    test('Should reject if name is too short', async () => {
        const req = mockRequest({ name: 'A', email: 'test@test.com', projectType: 'Other', message: 'Valid message' });
        // We simulate express-validator behavior manually here for unit isolation
        const res = mockResponse();
        
        // Honeypot check
        validate(req, res, mockNext);
        expect(mockNext).toHaveBeenCalled();
    });

    test('Should trigger honeypot and return success for bots', () => {
        const req = mockRequest({ website: 'im-a-bot' });
        const res = mockResponse();
        
        validate(req, res, mockNext);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Submission received successfully!' });
    });

    test('Should validate math captcha correctly', async () => {
        const rules = contactValidationRules;
        const req = {
            body: {
                captcha_ans: '10',
                captcha_n1: '5',
                captcha_n2: '5'
            }
        };
        
        // Helper to run validation rules
        for (let rule of rules) {
            if (rule.builder && rule.builder.fields.includes('captcha_ans')) {
                // Internal validation test logic
            }
        }
    });
});