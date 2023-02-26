const {res400Json } = require('../utils/response-handler');
const sequelize = require('../config/database')
exports.validate = (validations, validationResult) => {
    return async (req, res, next) => {
        await Promise.all(validations.map((validation) => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            const t = await sequelize.transaction();
            req.transaction = t; // Set objek transaksi ke dalam request object
            return next();
        }

        // res.status(422).json({ errors: errors.array() });
        return res400Json({
            response: res,
            status : 'Bad Request',
            data: {},
            message : errors.array()[0]?.msg,
            statusCode: 422
        })
    };
};