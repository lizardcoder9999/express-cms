const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const colors = require("colors");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const cookieSession = require("cookie-session");
const googleMiddleware = require("./middleware/google");
const helmet = require("helmet");

//Passport Google oauth config
require("./config/passport-google");

//Load env variables
dotenv.config({ path: "./config/config.env" });

//Route files
const users = require("./routes/users");
const admins = require("./routes/admin");

//connect to database
connectDB();

const app = express();

//Helmet middleware
app.use(helmet());

//Setting views
app.set("views", "views");

//Session config

app.use(
  session({
    secret: process.env.SESSION_KEY,
  })
);

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

//Cookie Session Config
app.use(
  session({
    name: process.env.SESSION_NAME,
    keys: [process.env.COOKIE_KEY_ONE, process.env.COOKIE_KEY_TWO],
  })
);

// Google oauth middleware
googleMiddleware();

//Passport config
require("./config/passport-setup")(passport);

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());

//Mount Routers
app.use(users);
app.use(admins);

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
