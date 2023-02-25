// Database Connection
require('dotenv').config();
require('mongoose')
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    process.env.DBNAME || 'todo4',
    process.env.MYSQL_USER || 'xxxx',
    process.env.MYSQL_PASSWORD,{
        host: process.env.MYSQL_HOST || '172.17.0.1',
        port: process.env.MYSQL_PORT || '3306',
    dialect: 'mysql'
});
sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });
module.exports = sequelize;