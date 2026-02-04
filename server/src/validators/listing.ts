import { body } from 'express-validator';

const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG'];
const TRANSMISSIONS = ['Manual', 'Automatic'];
const BODY_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Van', 'Truck'];

const currentYear = new Date().getFullYear();

export const createListingValidation = [
    body('make')
        .trim()
        .notEmpty()
        .withMessage('Make is required')
        .isLength({ max: 50 })
        .withMessage('Make cannot exceed 50 characters'),
    body('model')
        .trim()
        .notEmpty()
        .withMessage('Model is required')
        .isLength({ max: 50 })
        .withMessage('Model cannot exceed 50 characters'),
    body('year')
        .isInt({ min: 1990, max: currentYear + 1 })
        .withMessage(`Year must be between 1990 and ${currentYear + 1}`),
    body('price')
        .isInt({ min: 1 })
        .withMessage('Price must be greater than 0'),
    body('mileage')
        .isInt({ min: 0 })
        .withMessage('Mileage cannot be negative'),
    body('fuelType')
        .isIn(FUEL_TYPES)
        .withMessage(`Fuel type must be one of: ${FUEL_TYPES.join(', ')}`),
    body('transmission')
        .isIn(TRANSMISSIONS)
        .withMessage(`Transmission must be one of: ${TRANSMISSIONS.join(', ')}`),
    body('bodyType')
        .isIn(BODY_TYPES)
        .withMessage(`Body type must be one of: ${BODY_TYPES.join(', ')}`),
    body('color')
        .trim()
        .notEmpty()
        .withMessage('Color is required')
        .isLength({ max: 30 })
        .withMessage('Color cannot exceed 30 characters'),
    body('location')
        .trim()
        .notEmpty()
        .withMessage('Location is required')
        .isLength({ max: 100 })
        .withMessage('Location cannot exceed 100 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ max: 5000 })
        .withMessage('Description cannot exceed 5000 characters'),
];

export const updateListingValidation = [
    body('make')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Make cannot be empty')
        .isLength({ max: 50 }),
    body('model')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Model cannot be empty')
        .isLength({ max: 50 }),
    body('year')
        .optional()
        .isInt({ min: 1990, max: currentYear + 1 })
        .withMessage(`Year must be between 1990 and ${currentYear + 1}`),
    body('price')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Price must be greater than 0'),
    body('mileage')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Mileage cannot be negative'),
    body('fuelType')
        .optional()
        .isIn(FUEL_TYPES)
        .withMessage(`Fuel type must be one of: ${FUEL_TYPES.join(', ')}`),
    body('transmission')
        .optional()
        .isIn(TRANSMISSIONS)
        .withMessage(`Transmission must be one of: ${TRANSMISSIONS.join(', ')}`),
    body('bodyType')
        .optional()
        .isIn(BODY_TYPES)
        .withMessage(`Body type must be one of: ${BODY_TYPES.join(', ')}`),
    body('color')
        .optional()
        .trim()
        .notEmpty()
        .isLength({ max: 30 }),
    body('location')
        .optional()
        .trim()
        .notEmpty()
        .isLength({ max: 100 }),
    body('description')
        .optional()
        .trim()
        .notEmpty()
        .isLength({ max: 5000 }),
    body('isSold')
        .optional()
        .isBoolean()
        .withMessage('isSold must be a boolean'),
];
