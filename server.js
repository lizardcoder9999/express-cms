const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const colors = require("colors");
const path = require("path");

//Load env variables
dotenv.config({ path: "./config/config.env" });

//Route files
const users = require("./routes/users");

//connect to database
connectDB();

const app = express();

//Setting views
app.set("views", "views");

//Setting view engine
app.set("view engine", "ejs");

//Static
app.use(express.static(path.join(__dirname, "public")));

//Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Body Parser
app.use(bodyParser.urlencoded({ extended: false }));

//Mount Routers
app.use(users);

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
