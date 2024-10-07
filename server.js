const express = require('express');
const PORTT = process.env.PORT || 3000;
const app = express();
const db = require('./db');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
// const {jwtAuthMiddleware} = require('./jwt');


// const passport = require('./auth');
// const db = require("./db");
// require('dotenv').config();
const userRouters = require('./routes/userRoutes');
const candidateRouters = require('./routes/candidateRoutes');
app.use('/user',userRouters);
app.use('/candidate',candidateRouters);
app.get('/', function(req, res)  {
    res.send("Welcome to voting app");
});
app.listen(PORTT, () => {
    console.log(`This server is running on port ${PORTT}`);
});
