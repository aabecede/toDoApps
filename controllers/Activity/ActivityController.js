const { res200Json, res500Json, res400Json } = require('../../utils/response-handler');
var ActivityModel = require("../../models/activity-model");
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 });
const prefix_cache = 'cache-activities-'
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const validatorCustom = require('../../middleware/validator')
const sequelize = require('../../config/database')
const { Sequelize } = require('sequelize');

const formatDataCustom = (activity) => {
    return {
        'id': activity?.activity_id,
        'title' : activity?.title,
        'email' : activity?.email,
        'created_at' : activity?.created_at,
        'updated_at' : activity?.updated_at,
        'deleted_at' : activity?.deleted_at,

    }
}

exports.getAllData = async function (req, res, next) {
    try {

        const cacheKey = `${prefix_cache}all`;
        const data = cache.get(cacheKey);

        if (data) {
            // console.log(cacheKey)
            return res200Json({
                response: res,
                data: {
                    'data': data
                }
            })
        }
        else {

            ActivityModel.findAll({
                attributes: [
                    ['activity_id', 'id'],
                    'title',
                    'email',
                    'created_at',
                    'updated_at',
                    'deleted_at',
                ]
            })
                .then(activities => {
                    cache.set(cacheKey, activities, 600);
                    return res200Json({
                        response: res,
                        data: {
                            'data': activities
                        }
                    })
                })
                .catch(err => {
                    return res500Json({
                        response: res,
                        data: { 'error': err }
                    })
                });
        }

    } catch (e) {
        return res500Json({
            response: res,
            message: e.message
        })
    }
}

exports.getById = async function (req, res, next) {
    try {

        const activityId = req.params.activityId;
        const cacheKey = `${prefix_cache}${activityId}`
        const data = cache.get(cacheKey);

        if (data) {
            // console.log(cacheKey)
            return res200Json({
                response: res,
                data: {
                    'data': data
                }
            })
        }
        else {
            ActivityModel.findOne({
                where: {
                    activity_id: activityId,
                    deleted_at: null
                }
            })
                .then(activity => {
                    if (activity) {
                        cache.set(cacheKey, activity, 600);
                        return res200Json({
                            response: res,
                            data: {
                                'data': formatDataCustom(activity)
                            }
                        })
                    } else {
                        return res400Json({
                            response: res,
                            statusCode: 404,
                            status: "Not Found",
                            message: `Activity with ID ${activityId} Not Found`,
                            data: {
                                data: {}
                            }
                        })
                    }
                })
                .catch(err => {
                    return res500Json({
                        response: res,
                        data: { 'error': err }
                    })
                });
        }

    } catch (e) {
        return res500Json({
            response: res,
            message: e.message
        })
    }
}

exports.createData = [
    bodyParser.json(),
    validatorCustom.validate([
        body('email').isEmail().withMessage('email format false')
            .normalizeEmail()
            .notEmpty().withMessage('email cannot be null'),
        body('title').notEmpty().withMessage('message cannot be null'),
    ], validationResult),
    async (req, res) => {
        const { title, email } = req.body;

        try {

            const activity = await ActivityModel.create(
                { title, email },
            );

            const cacheData = {
                "id": activity?.activity_id,
                "title": activity?.title,
                "email": activity?.email,
                "created_at": activity?.created_at,
                "updated_at": activity?.updated_at,
            }
            const cacheKey = `${prefix_cache}${activity?.activity_id}`
            cache.set(cacheKey, cacheData, 600);
            // console.log(cacheData, cacheKey)
            await req.transaction.commit()
            return res200Json({
                response: res,
                data: {
                    'data': cacheData
                }
            })

        } catch (e) {
            await req.transaction.rollback();
            return res500Json({
                response: res,
                message: e.message
            })
        }

    },
];


exports.deleteById = async function (req, res, next) {
    const transaction = await sequelize.transaction();
    try {

        const activityId = req.params.activityId;
        var activity = await ActivityModel.findOne({
            where: {
                activity_id: activityId,
                deleted_at: null
            }
        })
        // console.log(activity)
        if (activity) {
            await ActivityModel.update({
                deleted_at: Sequelize.literal('CURRENT_TIMESTAMP')
            },
                { where: { activity_id: activityId } },
                {
                    transaction
                });

            const cacheKey = `${prefix_cache}${activityId}`
            cache.del(cacheKey);
            cache.del(`${prefix_cache}all`);
            await transaction.commit()
            return res200Json({
                response: res,
                data: {
                    data: {}
                }
            })
        }
        else {
            await transaction.rollback()
            return res400Json({
                response: res,
                statusCode: 404,
                status: "Not Found",
                message: `Activity with ID ${activityId} Not Found`,
                data: {
                    data: {}
                }
            })
        }
    } catch (e) {
        await transaction.rollback()
        return res500Json({
            response: res,
            message: e.message
        })
    }
}

exports.updateData = [
    bodyParser.json(),
    validatorCustom.validate([
        body('title').notEmpty().withMessage('title cannot be null'),
        // body('email').notEmpty().withMessage('email cannot be null'),
    ], validationResult),
    async (req, res) => {
        const { title } = req.body;
        try {
            const activityId = req.params.activityId;
            var activity = await ActivityModel.findOne({
                where: {
                    activity_id: activityId,
                    deleted_at: null
                },
            });

            if (activity) {
                await ActivityModel.update({
                    title: title
                },
                    {
                        where: {
                            activity_id: activityId,
                            deleted_at: null
                        },
                    },
                    {
                        transaction: req.transaction
                    }
                )
                //dunno why need recall
                activity = await ActivityModel.findOne({
                    where: {
                        activity_id: activityId,
                        deleted_at: null
                    },
                });
                // console.log(activity)
                const cacheData = formatDataCustom(activity)
                const cacheKey = `${prefix_cache}${activity?.activity_id}`
                cache.set(cacheKey, cacheData, 600);
                // console.log(cacheData, cacheKey)
                await req.transaction.commit()
                return res200Json({
                    response: res,
                    data: {
                        'data': cacheData
                    }
                })

            }
            else {
                await req.transaction.rollback();
                return res400Json({
                    response: res,
                    statusCode: 404,
                    status: "Not Found",
                    message: `Activity with ID ${activityId} Not Found`,
                    data: {
                        data: {}
                    }
                })

            }

        } catch (e) {
            await req.transaction.rollback();
            return res500Json({
                response: res,
                message: e.message
            })
        }

    },
];