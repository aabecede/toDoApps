const {res400Json } = require('../utils/response-handler');
exports.validate = (validations, validationResult) => {
    return async (req, res, next) => {
        await Promise.all(validations.map((validation) => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        // res.status(422).json({ errors: errors.array() });
        return res400Json({
            response: res,
            data: {
                errors: errors.array()
            },
            statusCode: 422
        })
    };
};