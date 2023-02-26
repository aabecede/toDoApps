const {
    createData,
    getAllData,
    getById
} = require('../controllers/Activity/ActivityController');
// const middleware = require('../middleware/validator')
const express = require('express');
const router = express.Router();

router.route('/activity-groups')
    // .post(createData, middleware.validate)
    .post(createData)
    .get(getAllData);
router.route('/activity-groups/:activityId')
    .get(getById);

module.exports = router;