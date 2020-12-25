const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const nunjucks = require("nunjucks");
const colors = require("colors");

//Load env variables
dotenv.config({ path: "./config/config.env" });

//connect to database
connectDB();

const app = express();

//Setting view engine
app.set("view  engine", "html");

//Views
nunjucks.configure(["views/"], {
  autoescape: false,
  express: app,
});

const PORT = process.env.PORT;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

//Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //Close server and exit process
  server.close(() => {
    process.exit(1);
  });
});
