var express = require('express')
var app = express()

// Request for API calls
var request = require('request');
 
app.get('/', function (req, res) {
  res.send('Hello World')
})
 

app.listen(3000)
console.log("Listening on port 3000");