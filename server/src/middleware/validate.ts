import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sendError } from '../utils/response';

export const validate = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((err) => {
            if ('path' in err) {
                return `${err.path}: ${err.msg}`;
            }
            return err.msg;
        });
        sendError(res, errorMessages.join(', '), 400);
        return;
    }

    next();
};
