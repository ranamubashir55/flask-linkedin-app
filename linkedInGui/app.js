const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const path = require('path');
const config = require('./config/keys');
const app = express();
var server = require('http').Server(app);
var cors = require('cors');
app.use(cors());
// Passport Config
require('./config/passport')(passport);


// EJS
app.use(express.static(path.join(__dirname, 'public')));
// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secretXDjZ',
    resave: true,
    saveUninitialized: true,
    // cookie: { expires: 360000 }
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session({
  secret: 'secretXDjZ',
  cookie: { expires: 360000 }
}));

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/index.js'));
// app.use('/users', require('./routes/users.js'));

app.use(function (req, res, next) {
  res.status(400).render('error', {
    title: "404: File Not Found",
    code: 404,
    status: 'Page not found',
    msg: 'The page you are looking for might have been removed had its name changed or is temporarily unavailable.'
  });
});
app.use(function (req, res, next) {
  res.status(500).render('error', {
    title: "500: Server Error",
    code: 500,
    status: 'Internal Server Error',
    msg: 'An internal Server error occured please contact support.'
  });
});

const PORT = process.env.PORT || config.PORTPROD;
server.listen(PORT, console.log(`Server started on port ${PORT}`));
