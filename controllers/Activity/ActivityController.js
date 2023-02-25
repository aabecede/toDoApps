const { res200Json, res500Json, res400Json } = require('../../utils/response-handler');
var ActivityModel = require("../../models/activity-model");
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 });
const_prefix_cache = 'cache-activities-'

exports.getAllData = async function(req, res, next){
    try {

        const cacheKey = `${const_prefix_cache}all`;
        const data = cache.get(cacheKey);

        if(data){
            console.log(cacheKey)
            return res200Json({
                response: res,
                data: {
                    'data': data
                }
            })
        }
        else{

            ActivityModel.findAll()
                .then(activities => {
                    cache.set(cacheKey, activities, 600);
                    return res200Json({
                        response : res,
                        data : {
                            'data' : activities
                        }
                    })
                })
                .catch(err => {
                    return res500Json({
                            response : res,
                            data: {'error' : err}
                    })
                });
        }

    } catch (e) {
        return res500Json({
            response : res,
            message : e.message
        })
    }
}

exports.getById = async function(req, res, next){
    try {
        
        const activityId = req.params.activityId;
        const cacheKey = `${const_prefix_cache}${activityId}`
        const data = cache.get(cacheKey);

        if(data){
            console.log(cacheKey)
            return res200Json({
                response: res,
                data: {
                    'data': data
                }
            })
        }
        else{
            ActivityModel.findByPk(activityId)
                .then(activity => {
                    if (activity) {
                        cache.set(cacheKey, activity, 600);
                        return res200Json({
                            response: res,
                            data: {
                                'data': activity
                            }
                        })
                    } else {
                        return res400Json({
                            response: res,
                            data: { }
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
            response : res,
            message : e.message
        })
    }
}

exports.createData = async function(req, res, next){
    try {
        
        const { title, email } = req.body;
        ActivityModel.create({ title, email })
            .then(result => {
                res.status(201).json(result);
            })
            .catch(err => {
                res.status(500).json({ error: err });
            });

    } catch (e) {
        return res500Json({
            response : res,
            message : e.message
        })
    }
}