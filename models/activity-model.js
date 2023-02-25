const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Activity = sequelize.define('activity', {
    activity_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
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

module.exports = Activity;