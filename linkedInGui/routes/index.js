const express = require('express');
const request = require('request');
const router = express.Router();
const passport = require('passport');
const io = require('socket.io')();
var socket = io.listen(8082);
var client_socket = require('socket.io-client')('http://localhost:5000');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
// Socket Function 
socket.emit('con');
var calledSocket = false;
socket.emit('con');
socket.on('connect', function(data){
  console.log('Connnnnnnnnnnected to Front End');
})
client_socket.on('connect', function(data){
  console.log('Connnnnnnnnnnected to API Server');
})
function socketSends(data) {
  socket.emit('status', data);
  if (calledSocket) {
    socket.emit('status', data); // emit an event to the socket
  } else {
    socket.emit('status', data);
    socket.on('connect', function () {
      calledSocket = true;
      socket.emit('status', data); // emit an event to the socket
    });
  }
}
// Default Route
router.get('/', forwardAuthenticated, (req, res) => res.render('login'));

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
});
// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user,
    loggedIn: 'true',
    socket: true
  })
);
router.post('/sendMessage', ensureAuthenticated, (req, res) => {
const params = req.body;
linkedInAPI(params);
res.send('Starting Process...');
});

  // Change the client_socket url for API server on Line 7
  client_socket.on('connect', function(){
    console.log('connected to LinkedIn API');
  });
// Using LinkedIn Api to Send Messages 
function linkedInAPI(data){
  console.log('Query Params ', data);
  // Change the client_socket url for API server on Line 7
  client_socket.emit('send_message',JSON.stringify(data));
}
client_socket.on('update', function(data){
  console.log(data);
  // Event name can be any thing but its should be same on both sides 
  var completed = false;
  socketSends({
    "count": {
      "found_conn": data.found_conn || 0,
      "total": data.total || 0,
      "sent": data.sent || 0,
      "error": data.error || '',
      "completed": data.completed || completed,
      "send_fail": data.send_fail || [],
      "ceo": data.ceo || '',
      "tr_sales": data.tr_sales || '',
      "hr": data.hr || '',
      "broker":data.broker || '',

    }
  });
});



module.exports = router;
