const path = require("path");
const express = require("express");

const app = express();
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const sessionStore = new MySQLStore({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "gaurav",
  database: "railway",
  createDatabaseTable: true,
});

app.use(
  session({
    secret: "super-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(function (req, res, next) {
  const user = req.session.user;
  const isAuth = req.session.isAuthenticated;

  if (!user || !isAuth) {
    return next();
  }
  const userid = user.id;
  res.locals.isAuth = isAuth;
  res.locals.userid = userid;
  res.locals.userName = user.name;
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(express.static("images"));

app.use("/", require("./router/userRouter"));
app.use("/admin", require("./router/adminRouter"));

app.use((req, res, next) => {
  res.status(404).render("error", { message: "Page not found" });
});

app.use((error, req, res, next) => {
  console.error(error.stack); // Log error details
  res.status(500).render("error", { message: "Something went wrong!" });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
