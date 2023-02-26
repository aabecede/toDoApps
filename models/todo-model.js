const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Todo = sequelize.define('todo', {
    todo_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    activity_group_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    priority: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'priority-high'
    },
    is_active: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    deleted_at: {
        type: Sequelize.DATE,
    },
},
    {
        timestamps: false // Menonaktifkan atribut createdAt dan updatedAt
    });

module.exports = Todo;