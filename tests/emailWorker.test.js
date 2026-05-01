const { emailProcessor } = require('../../emailWorker');
const { sendContactEmail } = require('../../emailService');
const logger = require('../../logger');

// Mock dependencies
jest.mock('../../emailService');
jest.mock('../../logger');

describe('Email Worker Processor Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should process the job and call sendContactEmail successfully', async () => {
        const mockJob = {
            id: 'job-123',
            data: {
                name: 'John Doe',
                email: 'john@example.com',
                projectType: 'Residential',
                message: 'Hello BIRABRICK'
            }
        };

        // Mock service success
        sendContactEmail.mockResolvedValueOnce({ messageId: 'msg-abc' });

        await emailProcessor(mockJob);

        expect(sendContactEmail).toHaveBeenCalledWith(mockJob.data);
        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Processing email job job-123'));
        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Successfully processed email job job-123'));
    });

    test('should log an error and rethrow when sendContactEmail fails', async () => {
        const mockJob = {
            id: 'job-err',
            data: { email: 'fail@example.com' }
        };
        const mockError = new Error('SMTP Connection Failed');

        // Mock service failure
        sendContactEmail.mockRejectedValueOnce(mockError);

        await expect(emailProcessor(mockJob)).rejects.toThrow('SMTP Connection Failed');

        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining('Failed to process email job job-err'),
            mockError
        );
    });
});