/* Express Setup */
const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.static(__dirname));

const bodyParser = require('body-parser');
const expressSession = require('express-session')({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App listening on port ${port} `));

/* Passport Setup */
const passport = require('passport');

app.use(passport.initialize());
app.use(passport.session());

/* MongoDB Setup */
const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");
//connect to the database using mongoose.connect and give it the path to our database.
mongoose.connect('mongodb://localhost/MyDatabase'),
{ useNewUrlParser: true, useUnifiedTopology: true};
//define data structure using Schema. a Schema named UserDetail was created with username and password fields.
const Schema = mongoose.Schema;
const UserDetail = new Schema ({
  username: String,
  password: String,
});
//add passportLocalMongoose as a plugin to our Schema.
UserDetail.plugin(passportLocalMongoose);
//create a model from UserDetail schema
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo')


/* Passport local authentication */
passport.use(UserDetails.createStrategy());

passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

/* Define the endpoints */
const connectEnsureLogin = require('connect-ensure-login');

app.get('/', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  res.sendFile('html/index.html',{root:__dirname})
});

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.redirect(`/login?info=${info}`)
    }

    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      return res.redirect('/');
    });
  })(req, res, next);
})

app.get('/login', (req, res) => {
  res.sendFile('html/login.html',{root:__dirname})
});

app.get('/private', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  res.sendFile('html/private.html', {root:__dirname})
});

app.get('/user', connectEnsureLogin.ensureLoggedIn(),(req, res) => {
  res.send ({user: req.user})
});

app.get('/logout', (req, res) => {
  req.logOut(), res.sendFile('html/logout.html',{root:__dirname})
});
