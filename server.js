var express = require('express')
var app = express()

// Request for API calls
var request = require('request');

// Require Mongoose DB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/champions');
// Connect to Mongoose DB
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("Connected to MongoDB");
});
 
app.get('/', function (req, res) {
  res.send('Hello World')
})
 

app.listen(3000)
console.log("Listening on port 3000");