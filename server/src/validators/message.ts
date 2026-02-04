import { body } from 'express-validator';

export const sendMessageValidation = [
    body('listingId')
        .isUUID()
        .withMessage('Invalid listing ID'),
    body('receiverId')
        .isUUID()
        .withMessage('Invalid receiver ID'),
    body('message')
        .trim()
        .notEmpty()
        .withMessage('Message cannot be empty')
        .isLength({ max: 2000 })
        .withMessage('Message cannot exceed 2000 characters'),
];
