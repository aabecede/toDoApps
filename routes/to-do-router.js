const {
    createData,
    deleteById,
    getAllData,
    getById,
    updateData
} = require('../controllers/Activity/toDoController');
// const middleware = require('../middleware/validator')
const express = require('express');
const router = express.Router();

router.route('/todo-items')
    .post(createData)
    .get(getAllData);
router.route('/todo-items/:toDoId')
    .patch(updateData)
    .delete(deleteById)
    .get(getById);

module.exports = router;