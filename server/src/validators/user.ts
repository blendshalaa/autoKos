import { body } from 'express-validator';

export const updateProfileValidation = [
    body('name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Name cannot be empty')
        .isLength({ max: 100 })
        .withMessage('Name cannot exceed 100 characters'),
    body('location')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Location cannot exceed 100 characters'),
    body('phone')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Phone cannot exceed 20 characters'),
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio cannot exceed 500 characters'),
];
