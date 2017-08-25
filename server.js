const express = require('express');
const path = require('path');

const app = express();
// Run the app by serving the static files
// in the dist directory
app.use(express.static(__dirname + '/dist'));
// Start the app by listening on the default
// Heroku port
var server = app.listen(90,'31.14.133.111',function(){
  console.log('Listening on '+server.address().address+":"+server.address().port);
});

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + '/dist/index.html'));
});

