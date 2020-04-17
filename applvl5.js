//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');                                 // Level 5 poner todo en orden
const passport = require("passport");                                       // Level 5
const passportLocalMongoose = require("passport-local-mongoose");           //Level 5

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({                                         // Level 5 (codigo sacado de documentacion)
secret: "Our little secret.",
resave: false,
saveUninitialized: false,
}));

app.use(passport.initialize());                           // Level 5 (initialize)
app.use(passport.session());                                // Level 5 (set up session)

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.set("useCreateIndex", true);                     // Level 5 (quitar el warning de deprecation)

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);                 // Level 5 (hash, salt and save)

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());                      // Level 5

passport.serializeUser(User.serializeUser());             // Level 5
passport.deserializeUser(User.deserializeUser());         // Level 5

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/secrets", function(req, res){                   // Level 5
  if(req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res){                    // Level 5
  req.logout();
  res.redirect("/");
});

//Update the code

app.post("/register", function(req, res) {

User.register({username: req.body.username}, req.body.password, function(err, user){     // Level 5
  if(err){
    console.log(err);
    res.redirect("/register");
  } else {
    passport.authenticate("local")(req, res, function(){    // crea la cookie que mantiene la sesion activa mientras dura la sesion de chrome, es decir hasta que se cierre chrome
      res.redirect("/secrets");
    });
  }
});
});

app.post("/login", function(req, res) {

const user = new User({                                       //Level 5
  username: req.body.username,
  password: req.body.password
});

req.login(user, function(err){                              // Level 5
if(err){
  console.log(err);
} else {
  passport.authenticate("local")(req, res, function(){      // crea la cookie que mantiene la sesion activa mientras dura la sesion de chrome, es decir hasta que se cierre chrome
    res.redirect("/secrets");
  });
}
});

});

app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
