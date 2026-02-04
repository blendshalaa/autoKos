import { body } from 'express-validator';

export const reportValidation = [
    body('reason')
        .trim()
        .notEmpty()
        .withMessage('Reason is required')
        .isLength({ min: 10, max: 500 })
        .withMessage('Reason must be between 10 and 500 characters'),
];
