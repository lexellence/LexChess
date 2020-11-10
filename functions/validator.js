const Joi = require('@hapi/joi');
const httpCodes = require('http-status-codes');

module.exports = {
	// middleware that validates req.body against a schema and stores it in req.value.body
	validateBody: (schema) => {
		return (req, res, next) => {
			const result = schema.validate(req.body);
			if (result.error) {
				res.status(httpCodes.BAD_REQUEST).json(result.error.details[0].message);
				console.log(JSON.stringify(result.error.details[0].message));
				return;
			}
			if (!req.value)
				req.value = {};
			req.value.body = result.value;
			next();
		};
	},
	schemas: {
		// Sign-in, Sign-up input fields
		auth: Joi.object({
			email: Joi.string().email().required(),
			password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
		})
	}
};
