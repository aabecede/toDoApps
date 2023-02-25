const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 5000;
const activityRouter = require('../routes/activity-router')
// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
//activity
app.use(activityRouter)
app.get('/hello', (req, res) => {
    res.json({ message: 'Hello world' });
});


// 404 endpoint middleware
app.all('*', (req, res) => {
    res.status(404).json({ message: `${req.originalUrl} not found!` });
});