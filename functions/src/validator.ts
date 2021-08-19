// import Joi from '@hapi/joi';
import httpCodes from 'http-status-codes';
import { NextFunction } from 'express';

// middleware that validates req.body against a schema and stores it in req.value.body
export function validateBody(schema: any) {
	return (req: any, res: any, next: NextFunction) => {
		const result = schema.validate(req.body);
		if (result.error) {
			res.status(httpCodes.BAD_REQUEST).json(result.error.details[0].message);
			console.log(JSON.stringify(result.error.details[0].message));
			return;
		}
		// if (!req.value)
		// req.value = {};
		// req.value.body = result.value;

		next();
	};
};
export const schemas = {
	// Sign-in, Sign-up input fields
	// auth: Joi.object({
	// 	// Email pattern
	// 	email: Joi.string().email().required(),

	// 	// 3-30 alphanumeric
	// 	password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
	// }),
	// Chess move: string with 4 digits 0-7, plus optional piece-taken char
	// move: Joi.string().pattern(new RegExp('^[0-7]{4}[qbkrp]?$')).required(),
};

