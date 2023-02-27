const express = require('express');
require('dotenv').config();
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3030;
const HOST = process.env.HOST || "localhost";
const activityRouter = require('../routes/activity-router')
const toDoRouter = require('../routes/to-do-router')

// buat server nya
app.listen(PORT, () => console.log(`Server Host "${HOST}" running at port: ${PORT}`));
//activity
app.use(activityRouter)
app.use(toDoRouter)
app.get('/hello', (req, res) => {
    res.json({ message: 'Hello world' });
});


// 404 endpoint middleware
app.all('*', (req, res) => {
    res.status(404).json({ message: `${req.originalUrl} not found!` });
});