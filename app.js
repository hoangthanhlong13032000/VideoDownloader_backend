/**
  dotenv module to use custom environments define in .env file
 */
const dotenv = require('dotenv')
dotenv.config();


/**
  connect to mongodb database
 */
// const database = require("./src/config/database");
// database.connect();


/**
  rest api app with expressJs
 */
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});


/**
  route app (define get, post, put, ... request, response)
 */
const routes = require('./src/routes');

routes(app);


const port = process.env.PORT || 3333;
app.listen(port, () => console.log(`✅ Server is listening on port ${port}`))