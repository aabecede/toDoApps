const { res200Json, res500Json, res400Json } = require('../../utils/response-handler');
var ToDoModel = require("../../models/todo-model");
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 });
const prefix_cache = 'cache-todo-'
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const validatorCustom = require('../../middleware/validator')
const sequelize = require('../../config/database')
const { Sequelize } = require('sequelize');

const formatDataCustom = (toDoModel) => {
    return {
        "id": toDoModel?.todo_id,
        "activity_group_id": toDoModel?.activity_group_id,
        "title": toDoModel?.title,
        "is_active": Boolean(toDoModel?.is_active),
        "priority": toDoModel?.priority,
        "created_at": toDoModel?.created_at,
        "updated_at": toDoModel?.updated_at,
        "deleted_at": toDoModel?.deleted_at,
    }
}

const cacheKeyDelete = () => {
    const keys = cache.keys();
    keys.forEach(key => {
        if (key.startsWith(prefix_cache)) {
            cache.del(key);
        }
    });
}

exports.getAllData = async function (req, res, next) {
    try {
        let activity_group_id = req.query?.activity_group_id
        var where = {}
        if (activity_group_id) {
            where = {
                activity_group_id: activity_group_id
            };
        }
        const cacheKey = `${prefix_cache}all${JSON.stringify(where)}`;
        const data = cache.get(cacheKey);
        if (data) {
            return res200Json({
                response: res,
                data: {
                    'data': data
                }
            })
        }
        else {
            ToDoModel.findAll({
                attributes: [
                    ['todo_id', 'id'],
                    'activity_group_id',
                    'title',
                    'is_active',
                    'priority',
                    'created_at',
                    'updated_at',
                    'deleted_at',
                ],
                where
            })
                .then(todo => {
                    cache.set(cacheKey, todo, 600);
                    return res200Json({
                        response: res,
                        data: {
                            'data': todo
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
        console.log(e)
        return res500Json({
            response: res,
            message: e.message
        })
    }
}

exports.getById = async function (req, res, next) {
    try {

        const toDoId = req.params.toDoId;
        const cacheKey = `${prefix_cache}${toDoId}`
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
            ToDoModel.findOne({
                where: {
                    todo_id: toDoId,
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
                            message: `Activity with ID ${toDoId} Not Found`,
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
        body('activity_group_id').notEmpty().withMessage('activity_group_id cannot be null')
            .isNumeric().withMessage('activity_group_id must contain number'),
        body('title').notEmpty().withMessage('title cannot be null'),
    ], validationResult),
    async (req, res) => {
        const { activity_group_id, title } = req.body;

        try {

            const todoModel = await ToDoModel.create(
                { activity_group_id, title, is_active: 1 },
            );

            const cacheData = {
                "id": todoModel?.todo_id,
                "activity_group_id": todoModel?.activity_group_id,
                "title": todoModel?.title,
                "is_active": Boolean(todoModel?.is_active),
                "priority": todoModel?.priority,
                "created_at": todoModel?.created_at,
                "updated_at": todoModel?.updated_at,
            }
            const cacheKey = `${prefix_cache}${todoModel?.todo_id}`
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

        const toDoId = req.params.toDoId;
        var activity = await ToDoModel.findOne({
            where: {
                todo_id: toDoId,
                deleted_at: null
            }
        })
        // console.log(activity)
        if (activity) {
            await ToDoModel.update({
                deleted_at: Sequelize.literal('CURRENT_TIMESTAMP')
            },
                { where: { todo_id: toDoId } },
                {
                    transaction
                });

            const cacheKey = `${prefix_cache}${toDoId}`
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
                message: `Activity with ID ${toDoId} Not Found`,
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

exports.updateData = async function (req, res, next) {
    const transaction = await sequelize.transaction();
    const title = await req?.body?.title
    const is_active = await req?.body?.is_active
    const todoId = await req.params.toDoId;
    try {

        var todo = await ToDoModel.findOne({
            where: {
                todo_id: todoId,
            },
        });
        if (todo) {
            await ToDoModel.update({
                title, is_active
            }, {
                where: {
                    todo_id: todoId,
                    deleted_at: null
                }
            },
                {
                    transaction
                })
            //dunno why need recall
            todo = await ToDoModel.findOne({
                where: {
                    todo_id: todoId,
                    deleted_at: null
                },
            });
            data = formatDataCustom(todo)
            cacheKeyDelete()
            await transaction.commit()
            return res200Json({
                response: res,
                data: {
                    'data': data
                }
            })
                // console.log(activity)
        }
        else {
            await transaction.rollback()
            return res400Json({
                response: res,
                statusCode: 404,
                status: "Not Found",
                message: `Todo with ID ${todoId} Not Found`,
            })
        }

    } catch (error) {
        await transaction.rollback();
        return res500Json({
            response: res,
            message: error.message
        })
    }
}